const usuarioModel = require('../models/usuarioModel');
const empresaModel = require('../models/empresaModel');
const vinculoModel = require('../models/vinculoModel');
const { exigeLogin } = require('../middlewares/autenticacao');
const { HttpError } = require('../utils/erros');
const { criado } = require('../utils/resposta');
const { texto, emailValido, normalizarCodigo, validarSenha } = require('../utils/validacao');
const { usuarioPublico, planoDoUsuario } = require('../utils/apresentacao');
const senhaUtil = require('../utils/senha');
const { assinar } = require('../utils/token');

const respostaLogin = (u) => ({ token: assinar(u.id), usuario: usuarioPublico(u) });

function validarCadastro({ nome, email, senha }) {
  if (nome.length < 2) throw new HttpError(400, 'Informe seu nome.');
  if (!emailValido(email)) throw new HttpError(400, 'E-mail inválido.');
  const problemaSenha = validarSenha(senha);
  if (problemaSenha) throw new HttpError(400, problemaSenha);
}

async function registrarAdmin({ body }) {
  const dados = { nome: texto(body.nome, 80), email: texto(body.email, 120).toLowerCase(), senha: String(body.senha || '') };
  validarCadastro(dados);

  if (await usuarioModel.buscarAdminPorEmail(dados.email)) {
    throw new HttpError(409, 'Já existe um administrador com este e-mail.');
  }
  const admin = await usuarioModel.criar({
    nome: dados.nome, email: dados.email, senhaHash: senhaUtil.gerarHash(dados.senha), perfil: 'administrador',
  });
  return criado(respostaLogin(admin));
}

async function loginAdmin({ body }) {
  const email = texto(body.email, 120).toLowerCase();
  const admin = await usuarioModel.buscarAdminPorEmail(email);

  if (!admin || !senhaUtil.conferir(String(body.senha || ''), admin.senha_hash)) {
    throw new HttpError(401, 'E-mail ou senha incorretos.');
  }
  return respostaLogin(admin);
}

async function registrarFuncionario({ body }) {
  const dados = { nome: texto(body.nome, 80), email: texto(body.email, 120).toLowerCase(), senha: String(body.senha || '') };
  validarCadastro(dados);

  const empresa = await empresaModel.buscarPorCodigo(normalizarCodigo(body.codigo));
  if (!empresa) throw new HttpError(404, 'Código da empresa não encontrado. Confira com o seu administrador.');

  const existentes = await usuarioModel.listarFuncionariosPorEmail(dados.email);
  if (existentes.length) {
    throw new HttpError(409, 'Já existe uma conta com este e-mail. Entre nela e use "Entrar em outra empresa" para adicionar o código.');
  }
  const funcionario = await usuarioModel.criar({
    nome: dados.nome, email: dados.email, senhaHash: senhaUtil.gerarHash(dados.senha), perfil: 'funcionario',
  });
  await vinculoModel.criar(funcionario.id, empresa.id);
  return criado(respostaLogin(funcionario));
}

async function loginFuncionario({ body }) {
  const email = texto(body.email, 120).toLowerCase();
  const senha = String(body.senha || '');

  const lista = await usuarioModel.listarFuncionariosPorEmail(email);
  const funcionario = lista.find((u) => senhaUtil.conferir(senha, u.senha_hash));
  if (!funcionario) throw new HttpError(401, 'E-mail ou senha incorretos.');
  return respostaLogin(funcionario);
}

async function me({ req }) {
  const usuario = await exigeLogin(req);

  if (usuario.perfil === 'administrador') {
    const empresas = await empresaModel.listarDoAdmin(usuario.id);
    return {
      usuario: usuarioPublico(usuario),
      plano: planoDoUsuario(usuario),
      empresas: await Promise.all(empresas.map(empresaModel.comSetores)),
    };
  }
  const empresas = await empresaModel.listarDoFuncionario(usuario.id);
  return {
    usuario: usuarioPublico(usuario),
    empresas: await Promise.all(empresas.map(empresaModel.comSetores)),
  };
}

module.exports = { registrarAdmin, loginAdmin, registrarFuncionario, loginFuncionario, me };
