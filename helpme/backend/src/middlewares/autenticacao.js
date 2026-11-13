// Verifica quem está logado (token no cabeçalho Authorization) e o que ele pode acessar
const { verificar } = require('../utils/token');
const { HttpError } = require('../utils/erros');
const usuarioModel = require('../models/usuarioModel');
const empresaModel = require('../models/empresaModel');

// perfil é opcional: 'administrador' ou 'funcionario'
function exigeLogin(req, perfil) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const dados = verificar(token);
  const usuario = dados && usuarioModel.buscarPorId(dados.uid);

  if (!usuario) throw new HttpError(401, 'Sessão expirada. Entre novamente.');
  if (perfil && usuario.perfil !== perfil) throw new HttpError(403, 'Você não tem permissão para isso.');
  return usuario;
}

// Garante que a empresa pertence ao administrador logado
function exigeEmpresaDoAdmin(admin, empresaId) {
  const empresa = empresaModel.buscarDoAdmin(Number(empresaId), admin.id);
  if (!empresa) throw new HttpError(404, 'Empresa não encontrada.');
  return empresa;
}

module.exports = { exigeLogin, exigeEmpresaDoAdmin };
