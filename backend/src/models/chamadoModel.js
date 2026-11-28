const { prisma } = require('../config/prisma');

const iso = (data) => (data instanceof Date ? data.toISOString() : data);

function observacoesDe(lista) {
  return (lista || []).map((o) => ({
    id: o.id,
    texto: o.texto,
    autor_nome: o.autorNome,
    criado_em: iso(o.criadoEm),
  }));
}

function linha(c, completo = false) {
  const base = {
    id: c.id,
    titulo: c.titulo,
    descricao: c.descricao,
    setor: c.setor,
    nivel: c.nivel,
    status: c.status,
    responsavel_id: c.responsavelId ?? null,
    responsavel_nome: c.responsavel?.nome || '',
    observacoes: observacoesDe(c.observacoes),
    criado_em: iso(c.criadoEm),
    atualizado_em: iso(c.atualizadoEm),
  };
  if (!completo) return base;
  return { ...base, empresa_id: c.empresaId, usuario_id: c.usuarioId };
}

const incluirPessoas = {
  responsavel: { select: { nome: true } },
  observacoes: { orderBy: [{ criadoEm: 'asc' }, { id: 'asc' }] },
};

const buscarPorId = async (id) => {
  const chamado = await prisma.chamado.findUnique({ where: { id }, include: incluirPessoas });
  return chamado ? linha(chamado, true) : null;
};

async function criar({ empresaId, usuarioId, titulo, descricao, setor, nivel }) {
  const agora = new Date();
  const chamado = await prisma.chamado.create({
    data: {
      empresaId, usuarioId, titulo, descricao, setor, nivel,
      status: 'aberto', criadoEm: agora, atualizadoEm: agora,
    },
  });
  return linha(chamado);
}

const listarDoUsuario = async (usuarioId, empresaId) => {
  const chamados = await prisma.chamado.findMany({
    where: { usuarioId, empresaId },
    orderBy: [{ criadoEm: 'desc' }, { id: 'desc' }],
    include: incluirPessoas,
  });
  return chamados.map((c) => linha(c));
};

async function listarDaEmpresa(empresaId, filtros) {
  const where = { empresaId };
  if (filtros.nivel) where.nivel = filtros.nivel;
  if (filtros.status) where.status = filtros.status;
  if (filtros.setor) where.setor = filtros.setor;
  if (filtros.busca) {
    where.OR = [
      { titulo: { contains: filtros.busca } },
      { usuario: { nome: { contains: filtros.busca } } },
      { responsavel: { nome: { contains: filtros.busca } } },
    ];
  }

  const chamados = await prisma.chamado.findMany({
    where,
    orderBy: [{ criadoEm: 'desc' }, { id: 'desc' }],
    include: { usuario: { select: { nome: true, email: true } }, ...incluirPessoas },
  });

  return chamados.map((c) => ({
    ...linha(c),
    usuario_nome: c.usuario.nome,
    usuario_email: c.usuario.email,
  }));
}

const atualizarStatus = (id, status) =>
  prisma.chamado.update({ where: { id }, data: { status, atualizadoEm: new Date() } });

const definirResponsavel = (id, responsavelId) =>
  prisma.chamado.update({ where: { id }, data: { responsavelId, atualizadoEm: new Date() } });

async function comentar({ chamadoId, autorId, autorNome, texto }) {
  const observacao = await prisma.observacao.create({
    data: { chamadoId, autorId, autorNome, texto, criadoEm: new Date() },
  });
  return { id: observacao.id, texto: observacao.texto, autor_nome: observacao.autorNome, criado_em: iso(observacao.criadoEm) };
}

const listarParaEstatisticas = async (empresaId) => {
  const chamados = await prisma.chamado.findMany({
    where: { empresaId },
    select: { nivel: true, status: true, criadoEm: true },
  });
  return chamados.map((c) => ({ nivel: c.nivel, status: c.status, criado_em: iso(c.criadoEm) }));
};

module.exports = {
  buscarPorId, criar, listarDoUsuario, listarDaEmpresa, atualizarStatus, definirResponsavel, comentar, listarParaEstatisticas,
};
