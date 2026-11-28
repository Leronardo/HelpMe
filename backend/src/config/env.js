const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const RAIZ_BACKEND = path.join(__dirname, '..', '..');
const RAIZ_PROJETO = path.join(RAIZ_BACKEND, '..');

if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'file:../backend/data/helpme.db';

const PORT = Number(process.env.PORT) || 3000;
const TZ_OFFSET_MIN = Number(process.env.TZ_OFFSET_MIN ?? -180);
const PAGAMENTO_MODO = process.env.PAGAMENTO_MODO || 'teste';
const SEM_CODIGO_EMAIL = (process.env.EMAIL_CODIGO ?? 'true').trim().toLowerCase() === 'false';
const APP_URL = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const MERCADOPAGO_ACCESS_TOKEN = (process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim();
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP = {
  host: (process.env.SMTP_HOST || '').trim(),
  port: SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465,
  user: (process.env.SMTP_USER || '').trim(),
  pass: process.env.SMTP_PASS || '',
  from: (process.env.SMTP_FROM || '').trim(),
};

const DATA_DIR = path.join(RAIZ_BACKEND, 'data');
const FRONTEND_DIR = path.join(RAIZ_PROJETO, 'frontend');

function arquivoBanco() {
  const arquivo = process.env.DATABASE_URL.replace(/^file:/, '');
  return path.isAbsolute(arquivo) ? arquivo : path.resolve(RAIZ_PROJETO, 'prisma', arquivo);
}

function carregarSegredo() {
  const daEnv = (process.env.HELPME_SECRET || '').trim();
  if (daEnv) return daEnv;

  const segredo = crypto.randomBytes(48).toString('hex');
  const envPath = path.join(RAIZ_PROJETO, '.env');
  const linha = `HELPME_SECRET=${segredo}`;
  if (fs.existsSync(envPath)) {
    const texto = fs.readFileSync(envPath, 'utf8');
    const novo = /^HELPME_SECRET=.*$/m.test(texto)
      ? texto.replace(/^HELPME_SECRET=.*$/m, linha)
      : `${texto.replace(/\s*$/, '')}\n${linha}\n`;
    fs.writeFileSync(envPath, novo);
  } else {
    fs.writeFileSync(envPath, `${linha}\n`);
  }
  return segredo;
}

module.exports = {
  PORT,
  TZ_OFFSET_MIN,
  PAGAMENTO_MODO,
  SEM_CODIGO_EMAIL,
  APP_URL,
  MERCADOPAGO_ACCESS_TOKEN,
  SMTP,
  DATA_DIR,
  DB_FILE: arquivoBanco(),
  RAIZ_PROJETO,
  FRONTEND_DIR,
  SEGREDO: carregarSegredo(),
};
