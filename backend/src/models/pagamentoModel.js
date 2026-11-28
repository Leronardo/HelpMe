const { prisma } = require('../config/prisma');

function linha(p) {
  if (!p) return null;
  return {
    id: p.id,
    usuario_id: p.usuarioId,
    plano_id: p.planoId,
    empresas: p.empresas,
    valor: p.valor,
    metodo: p.metodo,
    mp_id: p.mpId,
    status: p.status,
  };
}

async function criar({ usuarioId, planoId, empresas, valor, metodo }) {
  const criado = await prisma.pagamento.create({
    data: { usuarioId, planoId, empresas, valor, metodo, criadoEm: new Date() },
  });
  return linha(criado);
}

const buscarDoUsuario = async (id, usuarioId) => linha(await prisma.pagamento.findFirst({
  where: { id: Number(id), usuarioId },
}));

const gravarMp = (id, mpId) => prisma.pagamento.update({
  where: { id },
  data: { mpId: String(mpId) },
});

async function marcar(id, status) {
  const resultado = await prisma.pagamento.updateMany({
    where: { id, status: 'pendente' },
    data: { status },
  });
  return resultado.count === 1;
}

module.exports = { criar, buscarDoUsuario, gravarMp, marcar };
