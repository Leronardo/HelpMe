// Gerenciamento dos funcionários de uma empresa (somente administrador)
const vinculoModel = require('../models/vinculoModel');
const { exigeLogin, exigeEmpresaDoAdmin } = require('../middlewares/autenticacao');
const { HttpError } = require('../utils/erros');

function listar({ req, params }) {
  const admin = exigeLogin(req, 'administrador');
  const empresa = exigeEmpresaDoAdmin(admin, params.id);
  return { usuarios: vinculoModel.listarFuncionariosDaEmpresa(empresa.id) };
}

function excluir({ req, params }) {
  const admin = exigeLogin(req, 'administrador');
  const empresa = exigeEmpresaDoAdmin(admin, params.id);

  if (!vinculoModel.removerFuncionario(Number(params.uid), empresa.id)) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }
  return { ok: true };
}

module.exports = { listar, excluir };
