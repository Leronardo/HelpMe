const usuarioModel = require('../models/usuarioModel');
const empresaModel = require('../models/empresaModel');
const codigoModel = require('../models/codigoModel');
const { duplicado } = require('../config/prisma');
const { exigeLogin } = require('../middlewares/autenticacao');
const codigoEmail = require('../services/codigoEmail');
const { HttpError } = require('../utils/erros');
const { criado } = require('../utils/resposta');
const { texto, emailValido, nomeDePessoaValido, validarSenha } = require('../utils/validacao');
const { usuarioPublico, planoDoUsuario } = require('../utils/apresentacao');
const senhaUtil = require('../utils/senha');
const { assinar } = require('../utils/token');
const { SEM_CODIGO_EMAIL } = require('../config/env');

const respostaLogin = (u) => ({ token: assinar(u), usuario: usuarioPublico(u) });

function validarCadastro({ nome, email, senha }) {
  if (nome.length < 2) throw new HttpError(400, 'Informe seu nome.');
  if (!nomeDePessoaValido(nome)) throw new HttpError(400, 'O nome só pode ter letras e espaços.');
  if (!emailValido(email)) throw new HttpError(400, 'E-mail inválido.');
  const problemaSenha = validarSenha(senha);
  if (problemaSenha) throw new HttpError(400, problemaSenha);
}

function codigoInformado(valor) {
  const codigo = String(valor || '').trim();
  if (!/^\d{6}$/.test(codigo)) throw new HttpError(400, 'Informe o código de 6 dígitos.');
  return codigo;
}

async function criarAdminDireto(dados) {
  const jaExiste = () => new HttpError(409, 'Já existe uma conta com este e-mail.');
  try {
    const admin = await usuarioModel.criar({
      nome: dados.nome,
      email: dados.email,
      senhaHash: senhaUtil.gerarHash(dados.senha),
      perfil: 'administrador',
    });
    return respostaLogin(admin);
  } catch (erro) {
    throw duplicado(erro) ? jaExiste() : erro;
  }
}

async function solicitarCadastro({ body }) {
  const dados = { nome: texto(body.nome, 80), email: texto(body.email, 120).toLowerCase(), senha: String(body.senha || '') };
  validarCadastro(dados);
  if (await usuarioModel.buscarPorEmail(dados.email)) throw new HttpError(409, 'Já existe uma conta com este e-mail.');
  if (SEM_CODIGO_EMAIL) return criarAdminDireto(dados);
  return codigoEmail.emitir({
    email: dados.email,
    tipo: 'cadastro',
    nome: dados.nome,
    senhaHash: senhaUtil.gerarHash(dados.senha),
  });
}

async function registrarAdmin({ body }) {
  const email = texto(body.email, 120).toLowerCase();
  const codigo = codigoInformado(body.codigo);
  if (!emailValido(email)) throw new HttpError(400, 'E-mail inválido.');

  const jaExiste = () => new HttpError(409, 'Já existe uma conta com este e-mail.');
  if (await usuarioModel.buscarPorEmail(email)) throw jaExiste();
  const registro = await codigoEmail.conferir({ email, tipo: 'cadastro', codigo });
  let admin;
  try {
    admin = await usuarioModel.criar({
      nome: registro.nome, email, senhaHash: registro.senhaHash, perfil: 'administrador',
    });
  } catch (erro) {
    throw duplicado(erro) ? jaExiste() : erro;
  }
  await codigoEmail.consumir(registro.id);
  return criado(respostaLogin(admin));
}

async function solicitarRecuperacao({ body }) {
  const email = texto(body.email, 120).toLowerCase();
  if (!emailValido(email)) throw new HttpError(400, 'E-mail inválido.');
  const usuario = await usuarioModel.buscarPorEmail(email);
  if (!usuario) throw new HttpError(404, 'Não encontramos uma conta com este e-mail.');
  return codigoEmail.emitir({ email, tipo: 'recuperacao', nome: usuario.nome });
}

async function confirmarRecuperacao({ body }) {
  const email = texto(body.email, 120).toLowerCase();
  const senha = String(body.senha || '');
  if (!emailValido(email)) throw new HttpError(400, 'E-mail inválido.');
  const problema = validarSenha(senha);
  if (problema) throw new HttpError(400, problema);

  const usuario = await usuarioModel.buscarPorEmail(email);
  if (!usuario) throw new HttpError(404, 'Não encontramos uma conta com este e-mail.');
  if (senhaUtil.conferir(senha, usuario.senha_hash)) {
    throw new HttpError(400, 'Escolha uma senha diferente da atual.');
  }

  if (!SEM_CODIGO_EMAIL) {
    const codigo = codigoInformado(body.codigo);
    const registro = await codigoEmail.conferir({ email, tipo: 'recuperacao', codigo });
    await usuarioModel.definirSenha(usuario.id, senhaUtil.gerarHash(senha));
    await codigoEmail.consumir(registro.id);
  } else {
    await usuarioModel.definirSenha(usuario.id, senhaUtil.gerarHash(senha));
  }
  return respostaLogin(await usuarioModel.buscarPorId(usuario.id));
}

async function reenviarCodigo({ body }) {
  if (SEM_CODIGO_EMAIL) throw new HttpError(400, 'A confirmação por e-mail está desligada.');
  const email = texto(body.email, 120).toLowerCase();
  if (body.tipo !== 'cadastro' && body.tipo !== 'recuperacao') throw new HttpError(400, 'Pedido inválido.');
  const tipo = body.tipo;
  if (tipo === 'recuperacao') return solicitarRecuperacao({ body: { email } });

  if (await usuarioModel.buscarPorEmail(email)) throw new HttpError(409, 'Já existe uma conta com este e-mail.');
  const ultimo = await codigoModel.buscarUltimo(email, 'cadastro');
  if (!ultimo?.senhaHash) throw new HttpError(400, 'Comece o cadastro de novo.');
  return codigoEmail.emitir({ email, tipo: 'cadastro', nome: ultimo.nome, senhaHash: ultimo.senhaHash });
}

async function login({ body }) {
  const email = texto(body.email, 120).toLowerCase();
  const senha = String(body.senha || '');
  const usuario = await usuarioModel.buscarPorEmail(email);

  if (!usuario || !senhaUtil.conferir(senha, usuario.senha_hash)) {
    throw new HttpError(401, 'E-mail ou senha incorretos.');
  }
  return respostaLogin(usuario);
}

async function definirSenha({ req, body }) {
  const usuario = await exigeLogin(req, ['funcionario', 'tecnico']);
  if (!usuario.trocar_senha) throw new HttpError(400, 'Sua senha já foi definida. Entre com ela.');

  const senha = String(body.senha || '');
  const problema = validarSenha(senha);
  if (problema) throw new HttpError(400, problema);
  if (senhaUtil.conferir(senha, usuario.senha_hash)) {
    throw new HttpError(400, 'Escolha uma senha diferente da temporária.');
  }

  await usuarioModel.definirSenha(usuario.id, senhaUtil.gerarHash(senha));
  return { ok: true };
}

async function me({ req }) {
  const usuario = await exigeLogin(req);

  if (usuario.perfil === 'administrador') {
    const empresas = await empresaModel.listarDoAdmin(usuario.id);
    return {
      usuario: usuarioPublico(usuario),
      plano: planoDoUsuario(usuario),
      empresas: await Promise.all(empresas.map((e) => empresaModel.comSetores(e))),
    };
  }
  const empresas = await empresaModel.listarDoFuncionario(usuario.id);
  return {
    usuario: usuarioPublico(usuario),
    empresas: await Promise.all(empresas.map((e) => empresaModel.comSetores(e))),
  };
}

module.exports = {
  solicitarCadastro, registrarAdmin, solicitarRecuperacao, confirmarRecuperacao, reenviarCodigo, login, definirSenha, me,
};
