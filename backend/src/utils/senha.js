const crypto = require('node:crypto');

function gerarHash(senha) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(senha, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

function conferir(senha, armazenado) {
  if (!armazenado) return false;
  const [saltHex, hashHex] = armazenado.split(':');
  const hash = crypto.scryptSync(senha, Buffer.from(saltHex, 'hex'), 64);
  const esperado = Buffer.from(hashHex, 'hex');
  return hash.length === esperado.length && crypto.timingSafeEqual(hash, esperado);
}

module.exports = { gerarHash, conferir };
