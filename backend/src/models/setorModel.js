const { prisma } = require('../config/prisma');
const { SETORES_PADRAO } = require('../config/constantes');

const normal = (nome) => nome.trim().toLowerCase();
const cliente = (tx) => tx || prisma;

const listar = async (empresaId) => {
  const setores = await prisma.setor.findMany({
    where: { empresaId },
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' },
  });
  return setores;
};

const nomes = async (empresaId) => (await listar(empresaId)).map((s) => s.nome);

const existe = async (empresaId, nome) =>
  !!(await prisma.setor.findUnique({
    where: { empresaId_nomeNorm: { empresaId, nomeNorm: normal(nome) } },
    select: { id: true },
  }));

const contar = (empresaId) => prisma.setor.count({ where: { empresaId } });

const criar = (empresaId, nome, tx) =>
  cliente(tx).setor.create({ data: { empresaId, nome, nomeNorm: normal(nome) } });

async function criarPadrao(empresaId, tx) {
  for (const nome of SETORES_PADRAO) await criar(empresaId, nome, tx);
}

const excluir = async (id, empresaId) => {
  const { count } = await prisma.setor.deleteMany({ where: { id, empresaId } });
  return count;
};

module.exports = { listar, nomes, existe, contar, criar, criarPadrao, excluir };
