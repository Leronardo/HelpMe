const crypto = require('node:crypto');
const { prisma } = require('../config/prisma');
const setorModel = require('./setorModel');

const iso = (data) => (data instanceof Date ? data.toISOString() : data);

function publica(e) {
  if (!e) return null;
  return { id: e.id, nome: e.nome, logo: e.logo, codigo: e.codigo, criado_em: iso(e.criadoEm) };
}

function completa(e) {
  if (!e) return null;
  return { ...publica(e), admin_id: e.adminId };
}

const buscarPorCodigo = async (codigo) => completa(await prisma.empresa.findUnique({ where: { codigo } }));

const buscarDoAdmin = async (id, adminId) =>
  completa(await prisma.empresa.findFirst({ where: { id, adminId } }));

const listarDoAdmin = async (adminId) => {
  const empresas = await prisma.empresa.findMany({ where: { adminId }, orderBy: { id: 'asc' } });
  return empresas.map(publica);
};

const contarDoAdmin = (adminId) => prisma.empresa.count({ where: { adminId } });

const listarDoFuncionario = async (usuarioId) => {
  const vinculos = await prisma.vinculo.findMany({
    where: { usuarioId },
    orderBy: [{ criadoEm: 'asc' }, { empresaId: 'asc' }],
    include: { empresa: { select: { id: true, nome: true, logo: true } } },
  });
  return vinculos.map((v) => v.empresa);
};

const comSetores = async (empresa) => ({ ...empresa, setores: await setorModel.listar(empresa.id) });

async function gerarCodigoUnico() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (;;) {
    let codigo = '';
    for (const byte of crypto.randomBytes(6)) codigo += alfabeto[byte % alfabeto.length];
    const existe = await prisma.empresa.findUnique({ where: { codigo }, select: { id: true } });
    if (!existe) return codigo;
  }
}

async function criar({ nome, logo, adminId }) {
  const codigo = await gerarCodigoUnico();
  const id = await prisma.$transaction(async (tx) => {
    const empresa = await tx.empresa.create({
      data: { nome, logo, codigo, adminId, criadoEm: new Date() },
    });
    await setorModel.criarPadrao(empresa.id, tx);
    return empresa.id;
  });
  return publica(await prisma.empresa.findUnique({ where: { id } }));
}

async function atualizar(id, { nome, logo }) {
  return publica(await prisma.empresa.update({ where: { id }, data: { nome, logo } }));
}

module.exports = {
  buscarPorCodigo, buscarDoAdmin, listarDoAdmin, contarDoAdmin, listarDoFuncionario,
  comSetores, criar, atualizar,
};
