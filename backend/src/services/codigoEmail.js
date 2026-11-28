const crypto = require('node:crypto');
const { SEGREDO } = require('../config/env');
const { HttpError } = require('../utils/erros');
const codigoModel = require('../models/codigoModel');
const { enviarCodigo } = require('./email');

const MINUTOS = 15;
const ESPERA_MS = 60 * 1000;
const MAX_TENTATIVAS = 5;

const MENSAGENS = {
  cadastro: {
    assunto: 'Seu código para criar a conta no HelpMe',
    motivo: 'confirmar a criação da sua conta',
  },
  recuperacao: {
    assunto: 'Seu código para recuperar a conta no HelpMe',
    motivo: 'criar uma nova senha',
  },
};

function gerarCodigo() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

function hashCodigo(email, tipo, codigo) {
  return crypto.createHash('sha256').update(`${SEGREDO}:${tipo}:${email}:${codigo}`).digest('hex');
}

function hashesIguais(a, b) {
  const esquerda = Buffer.from(String(a));
  const direita = Buffer.from(String(b));
  return esquerda.length === direita.length && crypto.timingSafeEqual(esquerda, direita);
}

async function emitir({ email, tipo, nome = '', senhaHash = '' }) {
  const aberto = await codigoModel.buscarAberto(email, tipo);
  if (aberto && Date.now() - aberto.criadoEm.getTime() < ESPERA_MS) {
    throw new HttpError(429, 'Espere um minuto para pedir outro código.');
  }

  const codigo = gerarCodigo();
  const expiraEm = new Date(Date.now() + MINUTOS * 60 * 1000);
  await codigoModel.invalidarAbertos(email, tipo);
  const registro = await codigoModel.criar({
    email,
    tipo,
    codigoHash: hashCodigo(email, tipo, codigo),
    nome,
    senhaHash,
    expiraEm,
    criadoEm: new Date(),
  });

  try {
    const texto = MENSAGENS[tipo];
    await enviarCodigo({
      para: email,
      nome,
      codigo,
      minutos: MINUTOS,
      assunto: texto.assunto,
      motivo: texto.motivo,
    });
  } catch (erro) {
    await codigoModel.excluir(registro.id);
    throw erro;
  }

  return { enviado: true, expira_em: expiraEm.toISOString() };
}

async function conferir({ email, tipo, codigo }) {
  const registro = await codigoModel.buscarAberto(email, tipo);
  if (!registro || registro.expiraEm.getTime() <= Date.now()) {
    throw new HttpError(400, 'Código inválido ou expirado. Peça outro.');
  }
  if (!hashesIguais(hashCodigo(email, tipo, codigo), registro.codigoHash)) {
    const tentativas = registro.tentativas + 1;
    const estourou = tentativas >= MAX_TENTATIVAS;
    await codigoModel.registrarFalha(registro.id, tentativas, estourou);
    throw new HttpError(400, estourou ? 'Muitas tentativas. Peça outro código.' : 'Código incorreto.');
  }
  return registro;
}

async function consumir(id) {
  const resultado = await codigoModel.marcarUsado(id);
  if (resultado.count !== 1) throw new HttpError(400, 'Código inválido ou expirado. Peça outro.');
}

module.exports = { emitir, conferir, consumir, MINUTOS };
