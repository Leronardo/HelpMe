const empresaModel = require('../models/empresaModel');
const vinculoModel = require('../models/vinculoModel');
const { exigeLogin } = require('../middlewares/autenticacao');
const { HttpError } = require('../utils/erros');
const { criado } = require('../utils/resposta');
const { normalizarCodigo } = require('../utils/validacao');

async function entrarEmEmpresa({ req, body }) {
  const usuario = await exigeLogin(req, 'funcionario');

  const empresa = await empresaModel.buscarPorCodigo(normalizarCodigo(body.codigo));
  if (!empresa) throw new HttpError(404, 'Código da empresa não encontrado. Confira com o seu administrador.');
  if (await vinculoModel.existe(usuario.id, empresa.id)) throw new HttpError(409, 'Você já faz parte desta empresa.');

  await vinculoModel.criar(usuario.id, empresa.id);
  const { id, nome, logo } = empresa;
  return criado({ empresa: await empresaModel.comSetores({ id, nome, logo }) });
}

module.exports = { entrarEmEmpresa };
