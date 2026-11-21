// // Configurações gerais do projeto (porta, pastas, segredo do token)
// const path = require('node:path');
// const fs = require('node:fs');
// const crypto = require('node:crypto');

// const RAIZ_BACKEND = path.join(__dirname, '..', '..');

// const PORT = Number(process.env.PORT) || 3000;
// // Fuso horário usado para agrupar os chamados por semana/mês (-180 = Brasília)
// const TZ_OFFSET_MIN = Number(process.env.TZ_OFFSET_MIN ?? -180);

// // 'teste' = ativa o plano sem cobrar. Para cobrar de verdade é preciso integrar um gateway
// // de pagamento em services/pagamento.js e trocar para 'producao'.
// const PAGAMENTO_MODO = process.env.PAGAMENTO_MODO || 'teste';

// const DATA_DIR = path.join(RAIZ_BACKEND, 'data');
// const SCHEMA_PATH = path.join(RAIZ_BACKEND, 'database', 'schema.sql');
// const FRONTEND_DIR = path.join(RAIZ_BACKEND, '..', 'frontend');

// fs.mkdirSync(DATA_DIR, { recursive: true });

// // O segredo assina os tokens de login. Fica salvo em arquivo para não mudar a cada reinício.
// function carregarSegredo() {
//   if (process.env.HELPME_SECRET) return process.env.HELPME_SECRET;
//   const arquivo = path.join(DATA_DIR, 'secret.key');
//   if (fs.existsSync(arquivo)) return fs.readFileSync(arquivo, 'utf8');
//   const segredo = crypto.randomBytes(48).toString('hex');
//   fs.writeFileSync(arquivo, segredo, { mode: 0o600 });
//   return segredo;
// }

// module.exports = { PORT, TZ_OFFSET_MIN, PAGAMENTO_MODO, DATA_DIR, SCHEMA_PATH, FRONTEND_DIR, SEGREDO: carregarSegredo() };

// Configurações gerais do projeto (porta, banco de dados, segredo do token)
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

const SCHEMA_PATH = path.join(RAIZ_BACKEND, 'database', 'schema.sql');
const FRONTEND_DIR = path.join(RAIZ_BACKEND, '..', 'frontend');
const DATA_DIR = path.join(RAIZ_BACKEND, 'data'); // só usada no computador local (segredo de desenvolvimento)

// O Azure App Service define WEBSITE_SITE_NAME; fora do seu computador sempre tratamos como produção
const EM_PRODUCAO = process.env.NODE_ENV === 'production' || Boolean(process.env.WEBSITE_SITE_NAME);

// ----- Banco de dados (SQL Server / Azure SQL Database) -----
const ligado = (valor, padrao) => (valor === undefined ? padrao : ['1', 'true', 'sim'].includes(String(valor).toLowerCase()));

const DB = {
  servidor: process.env.DB_SERVER,
  nome: process.env.DB_NAME,
  usuario: process.env.DB_USER,
  senha: process.env.DB_PASSWORD,
  porta: Number(process.env.DB_PORT) || 1433,
  criptografar: ligado(process.env.DB_ENCRYPT, true),
  confiarCertificado: ligado(process.env.DB_TRUST_CERT, false),
  tentativas: Number(process.env.DB_TENTATIVAS) || 10,
  esperaMs: Number(process.env.DB_ESPERA_MS) || 6000,
};

// O segredo assina os tokens de login. Em produção ele PRECISA vir da variável HELPME_SECRET.
// No computador local é salvo em arquivo.
function carregarSegredo() {
  if (process.env.HELPME_SECRET) return process.env.HELPME_SECRET;
  if (EM_PRODUCAO) throw new Error('Defina a variável de ambiente HELPME_SECRET (um texto longo e aleatório).');

  const arquivo = path.join(DATA_DIR, 'secret.key');
  if (fs.existsSync(arquivo)) return fs.readFileSync(arquivo, 'utf8');
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const segredo = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(arquivo, segredo, { mode: 0o600 });
  return segredo;
}

module.exports = { PORT, TZ_OFFSET_MIN, PAGAMENTO_MODO, SCHEMA_PATH, FRONTEND_DIR, EM_PRODUCAO, DB, SEGREDO: carregarSegredo() };