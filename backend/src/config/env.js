const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const RAIZ_BACKEND = path.join(__dirname, '..', '..');
const RAIZ_PROJETO = path.join(RAIZ_BACKEND, '..');

function carregarDotEnv() {
  const envPath = path.join(RAIZ_PROJETO, '.env');
  if (!fs.existsSync(envPath)) return;
  const linhas = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const linha of linhas) {
    const limpa = linha.trim();
    if (!limpa || limpa.startsWith('#')) continue;
    const idx = limpa.indexOf('=');
    if (idx === -1) continue;
    const chave = limpa.slice(0, idx).trim();
    const valor = limpa.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(chave in process.env)) process.env[chave] = valor;
  }
}
carregarDotEnv();

const PORT = Number(process.env.PORT) || 3000;
// Fuso horário usado para agrupar os chamados por semana/mês (-180 = Brasília)
const TZ_OFFSET_MIN = Number(process.env.TZ_OFFSET_MIN ?? -180);

// 'teste' = ativa o plano sem cobrar. Para cobrar de verdade é preciso integrar um gateway
// de pagamento em services/pagamento.js e trocar para 'producao'.
const PAGAMENTO_MODO = process.env.PAGAMENTO_MODO || 'teste';

// Configurações de conexão com o SQL Server
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'SuaSenhaForteAqui123!',
  database: process.env.DB_NAME || 'helpme',
  encrypt: process.env.DB_ENCRYPT === 'true',
  trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
};

const DATA_DIR = path.join(RAIZ_BACKEND, 'data');
const SCHEMA_PATH = path.join(RAIZ_BACKEND, 'database', 'schema.sql');
const FRONTEND_DIR = path.join(RAIZ_PROJETO, 'frontend');

fs.mkdirSync(DATA_DIR, { recursive: true });

// O segredo assina os tokens de login. Fica salvo em arquivo para não mudar a cada reinício.
function carregarSegredo() {
  if (process.env.HELPME_SECRET) return process.env.HELPME_SECRET;
  const arquivo = path.join(DATA_DIR, 'secret.key');
  if (fs.existsSync(arquivo)) return fs.readFileSync(arquivo, 'utf8');
  const segredo = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(arquivo, segredo, { mode: 0o600 });
  return segredo;
}

module.exports = {
  PORT,
  TZ_OFFSET_MIN,
  PAGAMENTO_MODO,
  DB_CONFIG,
  DATA_DIR,
  SCHEMA_PATH,
  FRONTEND_DIR,
  SEGREDO: carregarSegredo(),
};
