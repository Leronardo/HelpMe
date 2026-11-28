const setorModel = require('../models/setorModel');
const { exigeLogin, exigeEmpresaDoAdmin } = require('../middlewares/autenticacao');
const { MAX_SETORES } = require('../config/constantes');
const { HttpError } = require('../utils/erros');
const { criado } = require('../utils/resposta');
const { texto } = require('../utils/validacao');

async function criar({ req, params, body }) {
  const admin = await exigeLogin(req, 'administrador');
  const empresa = await exigeEmpresaDoAdmin(admin, params.id);
  const nome = texto(body.nome, 40);

  if (nome.length < 2) throw new HttpError(400, 'Dê um nome ao setor (mínimo 2 letras).');
  if (await setorModel.contar(empresa.id) >= MAX_SETORES) throw new HttpError(400, `Cada empresa pode ter até ${MAX_SETORES} setores.`);
  if (await setorModel.existe(empresa.id, nome)) throw new HttpError(409, 'Já existe um setor com esse nome.');

  await setorModel.criar(empresa.id, nome);
  return criado({ setores: await setorModel.listar(empresa.id) });
}

async function excluir({ req, params }) {
  const admin = await exigeLogin(req, 'administrador');
  const empresa = await exigeEmpresaDoAdmin(admin, params.id);

  if (await setorModel.contar(empresa.id) <= 1) throw new HttpError(400, 'A empresa precisa ter pelo menos um setor.');
  if (!(await setorModel.excluir(Number(params.sid), empresa.id))) throw new HttpError(404, 'Setor não encontrado.');

  return { setores: await setorModel.listar(empresa.id) };
}

module.exports = { criar, excluir };
