const crypto = require('node:crypto');
const { SEGREDO } = require('../config/env');

const TRINTA_DIAS = 1000 * 60 * 60 * 24 * 30;

function assinar(usuarioId) {
  const dados = Buffer.from(JSON.stringify({ uid: usuarioId, exp: Date.now() + TRINTA_DIAS })).toString('base64url');
  const assinatura = crypto.createHmac('sha256', SEGREDO).update(dados).digest('base64url');
  return `${dados}.${assinatura}`;
}

function verificar(token) {
  const [dados, assinatura] = String(token || '').split('.');
  if (!dados || !assinatura) return null;

  const esperada = crypto.createHmac('sha256', SEGREDO).update(dados).digest('base64url');
  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const conteudo = JSON.parse(Buffer.from(dados, 'base64url').toString());
    return conteudo.exp > Date.now() ? conteudo : null;
  } catch {
    return null;
  }
}

module.exports = { assinar, verificar };
