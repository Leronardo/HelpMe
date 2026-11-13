// Cadastro e login de administradores e funcionários
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

function registrarAdmin({ body }) {
  const dados = { nome: texto(body.nome, 80), email: texto(body.email, 120).toLowerCase(), senha: String(body.senha || '') };
  validarCadastro(dados);

  if (usuarioModel.buscarAdminPorEmail(dados.email)) {
    throw new HttpError(409, 'Já existe um administrador com este e-mail.');
  }
  const admin = usuarioModel.criar({
    nome: dados.nome, email: dados.email, senhaHash: senhaUtil.gerarHash(dados.senha), perfil: 'administrador',
  });
  return criado(respostaLogin(admin));
}

function loginAdmin({ body }) {
  const email = texto(body.email, 120).toLowerCase();
  const admin = usuarioModel.buscarAdminPorEmail(email);

  if (!admin || !senhaUtil.conferir(String(body.senha || ''), admin.senha_hash)) {
    throw new HttpError(401, 'E-mail ou senha incorretos.');
  }
  return respostaLogin(admin);
}

function registrarFuncionario({ body }) {
  const dados = { nome: texto(body.nome, 80), email: texto(body.email, 120).toLowerCase(), senha: String(body.senha || '') };
  validarCadastro(dados);

  const empresa = empresaModel.buscarPorCodigo(normalizarCodigo(body.codigo));
  if (!empresa) throw new HttpError(404, 'Código da empresa não encontrado. Confira com o seu administrador.');

  if (usuarioModel.listarFuncionariosPorEmail(dados.email).length) {
    throw new HttpError(409, 'Já existe uma conta com este e-mail. Entre nela e use "Entrar em outra empresa" para adicionar o código.');
  }
  const funcionario = usuarioModel.criar({
    nome: dados.nome, email: dados.email, senhaHash: senhaUtil.gerarHash(dados.senha), perfil: 'funcionario',
  });
  vinculoModel.criar(funcionario.id, empresa.id);
  return criado(respostaLogin(funcionario));
}

function loginFuncionario({ body }) {
  const email = texto(body.email, 120).toLowerCase();
  const senha = String(body.senha || '');

  const funcionario = usuarioModel.listarFuncionariosPorEmail(email).find((u) => senhaUtil.conferir(senha, u.senha_hash));
  if (!funcionario) throw new HttpError(401, 'E-mail ou senha incorretos.');
  return respostaLogin(funcionario);
}

// Quem sou eu? (usado pelo frontend ao abrir o site com um token salvo)
function me({ req }) {
  const usuario = exigeLogin(req);

  if (usuario.perfil === 'administrador') {
    return {
      usuario: usuarioPublico(usuario),
      plano: planoDoUsuario(usuario),
      empresas: empresaModel.listarDoAdmin(usuario.id).map(empresaModel.comSetores),
    };
  }
  return {
    usuario: usuarioPublico(usuario),
    empresas: empresaModel.listarDoFuncionario(usuario.id).map(empresaModel.comSetores),
  };
}

module.exports = { registrarAdmin, loginAdmin, registrarFuncionario, loginFuncionario, me };
