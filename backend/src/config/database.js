// // Conexão com o banco SQLite (módulo nativo do Node) e criação das tabelas
// const fs = require('node:fs');
// const path = require('node:path');
// const { DatabaseSync } = require('node:sqlite');
// const { DATA_DIR, SCHEMA_PATH } = require('./env');
// const { SETORES_PADRAO } = require('./constantes');

// const db = new DatabaseSync(path.join(DATA_DIR, 'helpme.db'));
// db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
// db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// // ----- Atualização de bancos criados em versões anteriores -----
// const colunasDe = (tabela) => db.prepare(`PRAGMA table_info(${tabela})`).all().map((c) => c.name);
// const colunasUsuarios = colunasDe('usuarios');

// if (!colunasUsuarios.includes('plano_id')) {
//   db.exec('ALTER TABLE usuarios ADD COLUMN plano_id TEXT');
// }
// if (!colunasUsuarios.includes('plano_empresas')) {
//   db.exec('ALTER TABLE usuarios ADD COLUMN plano_empresas INTEGER');
// }
// // O antigo plano "5 empresas" virou parte do plano personalizado
// db.exec("UPDATE usuarios SET plano_id = 'personalizado', plano_empresas = 5 WHERE plano_id = 'empresa-5'");
// // Antes cada funcionário pertencia a uma empresa direto na tabela usuarios; agora usa "vinculos"
// if (colunasUsuarios.includes('empresa_id')) {
//   db.exec(`INSERT OR IGNORE INTO vinculos (usuario_id, empresa_id, criado_em)
//            SELECT id, empresa_id, criado_em FROM usuarios WHERE perfil = 'funcionario' AND empresa_id IS NOT NULL`);
// }
// // Empresas antigas ganham os setores padrão
// const semSetores = db.prepare('SELECT id FROM empresas WHERE NOT EXISTS (SELECT 1 FROM setores s WHERE s.empresa_id = empresas.id)').all();
// const inserirSetor = db.prepare('INSERT INTO setores (empresa_id, nome) VALUES (?, ?)');
// for (const { id } of semSetores) for (const nome of SETORES_PADRAO) inserirSetor.run(id, nome);

// module.exports = db;

// Conexão com o SQL Server (Azure SQL Database) usando o pacote "mssql".
//   consultar(sql, [valores]) -> lista de linhas      um(sql, [valores]) -> primeira linha (ou undefined)
//   executar(sql, [valores])  -> linhas afetadas      transacao(async (tx) => { ... }) -> tx tem as mesmas 3 funções
// No texto do SQL, cada "?" é trocado por um parâmetro (@p0, @p1...), então nada digitado vira código SQL.
const fs = require('node:fs');
const sql = require('mssql');
const { DB, SCHEMA_PATH } = require('./env');

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const configuracao = () => ({
  server: DB.servidor,
  port: DB.porta,
  database: DB.nome,
  user: DB.usuario,
  password: DB.senha,
  options: { encrypt: DB.criptografar, trustServerCertificate: DB.confiarCertificado },
  connectionTimeout: 30000,
  requestTimeout: 30000,
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
});

function conferirConfiguracao() {
  const faltando = [['DB_SERVER', DB.servidor], ['DB_NAME', DB.nome], ['DB_USER', DB.usuario], ['DB_PASSWORD', DB.senha]]
    .filter(([, valor]) => !valor).map(([nome]) => nome);
  if (faltando.length) throw new Error(`Faltam variáveis de ambiente do banco: ${faltando.join(', ')}`);
}

// ----- Conexão (com nova tentativa: o Azure SQL serverless demora a "acordar" depois de ocioso) -----
let pool = null;
let conectando = null;

async function conectarComTentativas() {
  conferirConfiguracao();
  let ultimoErro;
  for (let tentativa = 1; tentativa <= DB.tentativas; tentativa++) {
    const novo = new sql.ConnectionPool(configuracao());
    novo.on('error', (erro) => console.error('Erro na conexão com o banco:', erro.message)); // sem isso o Node derruba o servidor
    try {
      await novo.connect();
      return novo;
    } catch (erro) {
      ultimoErro = erro;
      try { await novo.close(); } catch { /* já estava fechado */ }
      console.warn(`Banco indisponível (tentativa ${tentativa}/${DB.tentativas}): ${erro.message}`);
      if (/login failed/i.test(erro.message)) break; // usuário ou senha errados: insistir não adianta
      if (tentativa < DB.tentativas) await esperar(DB.esperaMs);
    }
  }
  throw ultimoErro;
}

function obterPool() {
  if (pool && pool.connected) return Promise.resolve(pool);
  if (!conectando) {
    conectando = conectarComTentativas()
      .then((novo) => { pool = novo; return novo; })
      .finally(() => { conectando = null; });
  }
  return conectando;
}

async function descartarPool() {
  const antigo = pool;
  pool = null;
  try { if (antigo) await antigo.close(); } catch { /* ignora */ }
}

// Erros de conexão que valem uma nova tentativa (banco acordando, conexão derrubada por ociosidade)
const NUMEROS_TRANSITORIOS = new Set([40613, 40197, 40501, 49918, 49919, 49920, 4060, 10928, 10929]);
function transitorio(erro) {
  const numero = erro.number ?? erro.originalError?.number ?? erro.originalError?.info?.number;
  return NUMEROS_TRANSITORIOS.has(numero) || ['ECONNCLOSED', 'ESOCKET', 'ELOGIN'].includes(erro.code);
}

// ----- Execução -----
// Valor grande (ex.: logotipo em base64) precisa ser enviado como NVARCHAR(MAX)
const textoMax = (valor) => ({ tipo: sql.NVarChar(sql.MAX), valor });

const numerarParametros = (texto) => { let i = 0; return texto.replace(/\?/g, () => `@p${i++}`); };

async function rodar(origem, texto, valores) {
  const requisicao = origem.request(); // origem = pool ou transação
  valores.forEach((v, i) => {
    if (v && v.tipo) requisicao.input(`p${i}`, v.tipo, v.valor);
    else requisicao.input(`p${i}`, v);
  });
  return requisicao.query(numerarParametros(texto));
}

const somar = (resultado) => resultado.rowsAffected.reduce((a, b) => a + b, 0);

async function comNovaTentativa(funcao) {
  for (let tentativa = 0; ; tentativa++) {
    const atual = await obterPool();
    try {
      return await funcao(atual);
    } catch (erro) {
      if (tentativa >= 2 || !transitorio(erro)) throw erro;
      console.warn('Conexão com o banco falhou, tentando de novo:', erro.message);
      await descartarPool();
      await esperar(1500);
    }
  }
}

const consultar = (texto, valores = []) => comNovaTentativa(async (p) => (await rodar(p, texto, valores)).recordset);
const um = async (texto, valores = []) => (await consultar(texto, valores))[0];
const executar = (texto, valores = []) => comNovaTentativa(async (p) => somar(await rodar(p, texto, valores)));

// Várias operações que precisam dar certo juntas (ou nenhuma). Dentro de "funcao" use SÓ o "tx".
async function transacao(funcao) {
  const atual = await obterPool();
  const tx = new sql.Transaction(atual);
  await tx.begin();

  const ctx = {
    consultar: async (texto, valores = []) => (await rodar(tx, texto, valores)).recordset,
    um: async (texto, valores = []) => (await ctx.consultar(texto, valores))[0],
    executar: async (texto, valores = []) => somar(await rodar(tx, texto, valores)),
  };
  try {
    const resultado = await funcao(ctx);
    await tx.commit();
    return resultado;
  } catch (erro) {
    try { await tx.rollback(); } catch { /* a transação já tinha sido cancelada */ }
    throw erro;
  }
}

// ----- Inicialização: conecta e cria as tabelas que ainda não existem -----
async function iniciar() {
  const atual = await obterPool();
  const blocos = fs.readFileSync(SCHEMA_PATH, 'utf8').split(/^\s*GO\s*$/gim).map((b) => b.trim()).filter(Boolean);
  for (const bloco of blocos) await atual.request().batch(bloco);
}

// Erro de "valor duplicado" (índice/constraint UNIQUE)
const duplicado = (erro) => [2601, 2627].includes(erro.number ?? erro.originalError?.number ?? erro.originalError?.info?.number);

module.exports = { iniciar, consultar, um, executar, transacao, textoMax, duplicado };