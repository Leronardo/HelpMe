// Configurações gerais do projeto (porta, pastas, segredo do token)
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const RAIZ_BACKEND = path.join(__dirname, '..', '..');

const PORT = Number(process.env.PORT) || 3000;
// Fuso horário usado para agrupar os chamados por semana/mês (-180 = Brasília)
const TZ_OFFSET_MIN = Number(process.env.TZ_OFFSET_MIN ?? -180);

// 'teste' = ativa o plano sem cobrar. Para cobrar de verdade é preciso integrar um gateway
// de pagamento em services/pagamento.js e trocar para 'producao'.
const PAGAMENTO_MODO = process.env.PAGAMENTO_MODO || 'teste';

const DATA_DIR = path.join(RAIZ_BACKEND, 'data');
const SCHEMA_PATH = path.join(RAIZ_BACKEND, 'database', 'schema.sql');
const FRONTEND_DIR = path.join(RAIZ_BACKEND, '..', 'frontend');

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

module.exports = { PORT, TZ_OFFSET_MIN, PAGAMENTO_MODO, DATA_DIR, SCHEMA_PATH, FRONTEND_DIR, SEGREDO: carregarSegredo() };
