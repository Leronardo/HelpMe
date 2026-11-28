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

function senhaAleatoria() {
  const grupos = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnopqrstuvwxyz', '23456789', '!@#$%'];
  const todos = grupos.join('');
  const escolher = (alfabeto) => alfabeto[crypto.randomInt(alfabeto.length)];
  const chars = grupos.map(escolher);
  while (chars.length < 12) chars.push(escolher(todos));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

module.exports = { gerarHash, conferir, senhaAleatoria };
