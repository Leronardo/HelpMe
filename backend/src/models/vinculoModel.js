const { prisma } = require('../config/prisma');

const iso = (data) => (data instanceof Date ? data.toISOString() : data);

const existe = async (usuarioId, empresaId) =>
  !!(await prisma.vinculo.findUnique({
    where: { usuarioId_empresaId: { usuarioId, empresaId } },
    select: { usuarioId: true },
  }));

const criar = (usuarioId, empresaId) =>
  prisma.vinculo.create({ data: { usuarioId, empresaId, criadoEm: new Date() } });

async function listarFuncionariosDaEmpresa(empresaId) {
  const vinculos = await prisma.vinculo.findMany({
    where: { empresaId },
    include: {
      usuario: {
        include: {
          _count: {
            select: {
              chamados: { where: { empresaId } },
              responsabilidades: { where: { empresaId } },
            },
          },
        },
      },
    },
  });

  return vinculos
    .map((v) => ({
      id: v.usuario.id,
      nome: v.usuario.nome,
      email: v.usuario.email,
      perfil: v.usuario.perfil,
      criado_em: iso(v.criadoEm),
      chamados: v.usuario.perfil === 'tecnico'
        ? v.usuario._count.responsabilidades
        : v.usuario._count.chamados,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
}

async function removerFuncionario(usuarioId, empresaId) {
  if (!(await existe(usuarioId, empresaId))) return 0;

  await prisma.$transaction(async (tx) => {
    await tx.chamado.updateMany({ where: { responsavelId: usuarioId, empresaId }, data: { responsavelId: null } });
    await tx.chamado.deleteMany({ where: { usuarioId, empresaId } });
    await tx.vinculo.delete({ where: { usuarioId_empresaId: { usuarioId, empresaId } } });
    const restantes = await tx.vinculo.count({ where: { usuarioId } });
    if (restantes === 0) {
      await tx.chamado.updateMany({ where: { responsavelId: usuarioId }, data: { responsavelId: null } });
      await tx.observacao.updateMany({ where: { autorId: usuarioId }, data: { autorId: null } });
      await tx.usuario.deleteMany({ where: { id: usuarioId, perfil: { in: ['funcionario', 'tecnico'] } } });
    }
  });
  return 1;
}

module.exports = { existe, criar, listarFuncionariosDaEmpresa, removerFuncionario };
