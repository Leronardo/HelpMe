const { prisma } = require('../config/prisma');

const buscarUltimo = (email, tipo) => prisma.codigoEmail.findFirst({
  where: { email, tipo },
  orderBy: { criadoEm: 'desc' },
});

const buscarAberto = (email, tipo) => prisma.codigoEmail.findFirst({
  where: { email, tipo, usadoEm: null },
  orderBy: { criadoEm: 'desc' },
});

const invalidarAbertos = (email, tipo) => prisma.codigoEmail.updateMany({
  where: { email, tipo, usadoEm: null },
  data: { usadoEm: new Date() },
});

const criar = (data) => prisma.codigoEmail.create({ data });

const excluir = (id) => prisma.codigoEmail.delete({ where: { id } });

const registrarFalha = (id, tentativas, queimar) => prisma.codigoEmail.update({
  where: { id },
  data: queimar ? { tentativas, usadoEm: new Date() } : { tentativas },
});

const marcarUsado = (id) => prisma.codigoEmail.updateMany({
  where: { id, usadoEm: null },
  data: { usadoEm: new Date() },
});

module.exports = { buscarUltimo, buscarAberto, invalidarAbertos, criar, excluir, registrarFalha, marcarUsado };
