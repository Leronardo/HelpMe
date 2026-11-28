const { verificar } = require('../utils/token');
const { HttpError } = require('../utils/erros');
const usuarioModel = require('../models/usuarioModel');
const empresaModel = require('../models/empresaModel');
const vinculoModel = require('../models/vinculoModel');

async function exigeLogin(req, perfil) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const dados = verificar(token);
  const usuario = dados && await usuarioModel.buscarPorId(dados.uid);

  if (!usuario) throw new HttpError(401, 'Sessão expirada. Entre novamente.');
  if (dados.ts !== undefined && Boolean(dados.ts) !== Boolean(usuario.trocar_senha)) {
    throw new HttpError(401, 'Sessão expirada. Entre novamente.');
  }
  if ((dados.sv ?? 0) !== (usuario.senha_versao || 0)) {
    throw new HttpError(401, 'Sessão expirada. Entre novamente.');
  }
  if (perfil) {
    const permitidos = Array.isArray(perfil) ? perfil : [perfil];
    if (!permitidos.includes(usuario.perfil)) throw new HttpError(403, 'Você não tem permissão para isso.');
  }
  return usuario;
}

function exigeSenhaDefinida(usuario) {
  if (usuario.trocar_senha) throw new HttpError(403, 'Defina sua senha antes de continuar.');
}

async function exigeEmpresaDoAdmin(admin, empresaId) {
  const empresa = await empresaModel.buscarDoAdmin(Number(empresaId), admin.id);
  if (!empresa) throw new HttpError(404, 'Empresa não encontrada.');
  return empresa;
}

async function exigeGestor(req, empresaId) {
  const usuario = await exigeLogin(req, ['administrador', 'tecnico']);
  exigeSenhaDefinida(usuario);
  const id = Number(empresaId);
  if (usuario.perfil === 'administrador') {
    await exigeEmpresaDoAdmin(usuario, id);
    return usuario;
  }
  if (!(await vinculoModel.existe(usuario.id, id))) throw new HttpError(403, 'Você não faz parte desta empresa.');
  return usuario;
}

module.exports = { exigeLogin, exigeEmpresaDoAdmin, exigeSenhaDefinida, exigeGestor };
