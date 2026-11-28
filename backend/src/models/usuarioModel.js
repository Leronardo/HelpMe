const { prisma } = require('../config/prisma');

const iso = (data) => (data instanceof Date ? data.toISOString() : data);

function linha(u) {
  if (!u) return null;
  return {
    id: u.id,
    nome: u.nome,
    email: u.email,
    senha_hash: u.senhaHash,
    perfil: u.perfil,
    plano_id: u.planoId,
    plano_empresas: u.planoEmpresas,
    trocar_senha: u.trocarSenha ? 1 : 0,
    senha_versao: u.senhaVersao || 0,
    criado_em: iso(u.criadoEm),
  };
}

const buscarPorId = async (id) => linha(await prisma.usuario.findUnique({ where: { id } }));

const buscarPorEmail = async (email) => linha(await prisma.usuario.findUnique({ where: { email } }));

async function criar({ nome, email, senhaHash, perfil, trocarSenha = false }) {
  const criado = await prisma.usuario.create({
    data: { nome, email, senhaHash, perfil, trocarSenha, criadoEm: new Date() },
  });
  return linha(criado);
}

const definirSenha = (id, senhaHash) =>
  prisma.usuario.update({
    where: { id },
    data: { senhaHash, trocarSenha: false, senhaVersao: { increment: 1 } },
  });

const definirPlano = (id, planoId, empresasPersonalizado = null) =>
  prisma.usuario.update({
    where: { id },
    data: { planoId, planoEmpresas: empresasPersonalizado },
  });

module.exports = { buscarPorId, buscarPorEmail, criar, definirSenha, definirPlano };
