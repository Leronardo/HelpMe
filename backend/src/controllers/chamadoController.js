const chamadoModel = require('../models/chamadoModel');
const setorModel = require('../models/setorModel');
const vinculoModel = require('../models/vinculoModel');
const { exigeLogin, exigeEmpresaDoAdmin } = require('../middlewares/autenticacao');
const { NIVEIS, STATUS } = require('../config/constantes');
const { HttpError } = require('../utils/erros');
const { criado } = require('../utils/resposta');
const { texto } = require('../utils/validacao');
const estatisticas = require('../services/estatisticas');

async function exigeVinculo(usuario, empresaId) {
  if (!(await vinculoModel.existe(usuario.id, empresaId))) {
    throw new HttpError(403, 'Você não faz parte desta empresa.');
  }
}

async function criar({ req, body }) {
  const usuario = await exigeLogin(req, 'funcionario');
  const empresaId = Number(body.empresa_id);
  await exigeVinculo(usuario, empresaId);

  const titulo = texto(body.titulo, 120);
  const descricao = texto(body.descricao, 2000);
  const setor = texto(body.setor, 40);
  const nivel = String(body.nivel || '');

  if (titulo.length < 3) throw new HttpError(400, 'Dê um título ao chamado (mínimo 3 caracteres).');
  if (!NIVEIS.includes(nivel)) throw new HttpError(400, 'Escolha o nível do chamado.');

  const setoresDaEmpresa = await setorModel.nomes(empresaId);
  if (!setoresDaEmpresa.length) throw new HttpError(400, 'Esta empresa ainda não tem setores cadastrados. Avise o administrador.');
  const setorOficial = setoresDaEmpresa.find((nome) => nome.toLowerCase() === setor.toLowerCase());
  if (!setorOficial) throw new HttpError(400, 'Escolha um setor válido.');

  const chamado = await chamadoModel.criar({ empresaId, usuarioId: usuario.id, titulo, descricao, setor: setorOficial, nivel });
  return criado({ chamado });
}

async function listarMeus({ req, query }) {
  const usuario = await exigeLogin(req, 'funcionario');
  const empresaId = Number(query.empresa);
  await exigeVinculo(usuario, empresaId);
  return { chamados: await chamadoModel.listarDoUsuario(usuario.id, empresaId) };
}

async function listarDaEmpresa({ req, params, query }) {
  const admin = await exigeLogin(req, 'administrador');
  const empresa = await exigeEmpresaDoAdmin(admin, params.id);

  const filtros = {
    nivel: NIVEIS.includes(query.nivel) ? query.nivel : '',
    status: STATUS.includes(query.status) ? query.status : '',
    setor: texto(query.setor, 40),
    busca: texto(query.q, 80),
  };
  return { chamados: await chamadoModel.listarDaEmpresa(empresa.id, filtros) };
}

async function atualizarStatus({ req, params, body }) {
  const admin = await exigeLogin(req, 'administrador');
  const chamado = await chamadoModel.buscarPorId(Number(params.id));
  if (!chamado) throw new HttpError(404, 'Chamado não encontrado.');

  await exigeEmpresaDoAdmin(admin, chamado.empresa_id); 
  if (!STATUS.includes(body.status)) throw new HttpError(400, 'Status inválido.');

  await chamadoModel.atualizarStatus(chamado.id, body.status);
  return { ok: true, novo_status: body.status };
}

async function estatisticasDaEmpresa({ req, params }) {
  const admin = await exigeLogin(req, 'administrador');
  const empresa = await exigeEmpresaDoAdmin(admin, params.id);
  const lista = await chamadoModel.listarParaEstatisticas(empresa.id);
  return estatisticas.montar(lista);
}

module.exports = { criar, listarMeus, listarDaEmpresa, atualizarStatus, estatisticasDaEmpresa };
