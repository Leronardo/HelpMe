const { verificar } = require('../utils/token');
const { HttpError } = require('../utils/erros');
const usuarioModel = require('../models/usuarioModel');
const empresaModel = require('../models/empresaModel');

async function exigeLogin(req, perfil) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const dados = verificar(token);
  const usuario = dados ? await usuarioModel.buscarPorId(dados.uid) : null;

  if (!usuario) throw new HttpError(401, 'Sessão expirada. Entre novamente.');
  if (perfil && usuario.perfil !== perfil) throw new HttpError(403, 'Você não tem permissão para isso.');
  return usuario;
}

async function exigeEmpresaDoAdmin(admin, empresaId) {
  const empresa = await empresaModel.buscarDoAdmin(Number(empresaId), admin.id);
  if (!empresa) throw new HttpError(404, 'Empresa não encontrada.');
  return empresa;
}

module.exports = { exigeLogin, exigeEmpresaDoAdmin };
