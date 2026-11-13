const vinculoModel = require('../models/vinculoModel');
const { exigeLogin, exigeEmpresaDoAdmin } = require('../middlewares/autenticacao');
const { HttpError } = require('../utils/erros');

async function listar({ req, params }) {
  const admin = await exigeLogin(req, 'administrador');
  const empresa = await exigeEmpresaDoAdmin(admin, params.id);
  return { usuarios: await vinculoModel.listarFuncionariosDaEmpresa(empresa.id) };
}

async function excluir({ req, params }) {
  const admin = await exigeLogin(req, 'administrador');
  const empresa = await exigeEmpresaDoAdmin(admin, params.id);

  if (!(await vinculoModel.removerFuncionario(Number(params.uid), empresa.id))) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }
  return { ok: true };
}

module.exports = { listar, excluir };
