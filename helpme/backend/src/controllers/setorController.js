// Setores de cada empresa (o administrador cadastra, o funcionário escolhe ao abrir o chamado)
const setorModel = require('../models/setorModel');
const { exigeLogin, exigeEmpresaDoAdmin } = require('../middlewares/autenticacao');
const { MAX_SETORES } = require('../config/constantes');
const { HttpError } = require('../utils/erros');
const { criado } = require('../utils/resposta');
const { texto } = require('../utils/validacao');

function criar({ req, params, body }) {
  const admin = exigeLogin(req, 'administrador');
  const empresa = exigeEmpresaDoAdmin(admin, params.id);
  const nome = texto(body.nome, 40);

  if (nome.length < 2) throw new HttpError(400, 'Dê um nome ao setor (mínimo 2 letras).');
  if (setorModel.contar(empresa.id) >= MAX_SETORES) throw new HttpError(400, `Cada empresa pode ter até ${MAX_SETORES} setores.`);
  if (setorModel.existe(empresa.id, nome)) throw new HttpError(409, 'Já existe um setor com esse nome.');

  setorModel.criar(empresa.id, nome);
  return criado({ setores: setorModel.listar(empresa.id) });
}

function excluir({ req, params }) {
  const admin = exigeLogin(req, 'administrador');
  const empresa = exigeEmpresaDoAdmin(admin, params.id);

  if (setorModel.contar(empresa.id) <= 1) throw new HttpError(400, 'A empresa precisa ter pelo menos um setor.');
  if (!setorModel.excluir(Number(params.sid), empresa.id)) throw new HttpError(404, 'Setor não encontrado.');

  // chamados antigos continuam com o nome do setor que tinham
  return { setores: setorModel.listar(empresa.id) };
}

module.exports = { criar, excluir };
