const fs = require('node:fs');
const sql = require('mssql');
const { DB_CONFIG, SCHEMA_PATH } = require('./env');
const { SETORES_PADRAO } = require('./constantes');

let pool = null;

function configBase(database) {
  return {
    server: DB_CONFIG.host,
    port: DB_CONFIG.port,
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    database,
    options: {
      encrypt: DB_CONFIG.encrypt,
      trustServerCertificate: DB_CONFIG.trustServerCertificate,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

async function garantirBancoExiste() {
  const nomeBanco = DB_CONFIG.database;
  if (!/^[a-zA-Z0-9_]+$/.test(nomeBanco)) {
    throw new Error('Nome de banco de dados inválido em DB_NAME.');
  }
  const masterPool = await new sql.ConnectionPool(configBase('master')).connect();
  try {
    await masterPool.request()
      .input('dbName', sql.NVarChar(128), nomeBanco)
      .query(`IF DB_ID(@dbName) IS NULL CREATE DATABASE [${nomeBanco}]`);
  } finally {
    await masterPool.close();
  }
}

function vincularParametros(request, params) {
  if (!params) return;
  if (Array.isArray(params)) {
    params.forEach((valor, idx) => {
      request.input(`p${idx}`, valor === undefined ? null : valor);
    });
  } else if (typeof params === 'object') {
    for (const [chave, valor] of Object.entries(params)) {
      request.input(chave, valor === undefined ? null : valor);
    }
  }
}

async function query(sqlText, params) {
  if (!pool) throw new Error('Banco de dados ainda não inicializado.');
  const request = pool.request();
  vincularParametros(request, params);
  return request.query(sqlText);
}

async function get(sqlText, params) {
  const res = await query(sqlText, params);
  return res.recordset && res.recordset.length ? res.recordset[0] : undefined;
}

async function all(sqlText, params) {
  const res = await query(sqlText, params);
  return res.recordset || [];
}

async function run(sqlText, params) {
  const res = await query(sqlText, params);
  return {
    rowsAffected: Array.isArray(res.rowsAffected) ? res.rowsAffected.reduce((a, b) => a + b, 0) : 0,
    recordset: res.recordset || [],
  };
}

async function inicializar() {
  if (pool) return pool;

  await garantirBancoExiste();
  pool = await new sql.ConnectionPool(configBase(DB_CONFIG.database)).connect();

  // Executa o schema inicial
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  await pool.request().batch(schemaSql);

  // ----- Atualização de bancos criados em versões anteriores -----
  await pool.request().batch(`
    IF COL_LENGTH('dbo.usuarios', 'plano_id') IS NULL
      ALTER TABLE dbo.usuarios ADD plano_id NVARCHAR(50) NULL;

    IF COL_LENGTH('dbo.usuarios', 'plano_empresas') IS NULL
      ALTER TABLE dbo.usuarios ADD plano_empresas INT NULL;

    UPDATE dbo.usuarios
    SET plano_id = 'personalizado', plano_empresas = 5
    WHERE plano_id = 'empresa-5';

    IF COL_LENGTH('dbo.usuarios', 'empresa_id') IS NOT NULL
    BEGIN
      INSERT INTO dbo.vinculos (usuario_id, empresa_id, criado_em)
      SELECT u.id, u.empresa_id, u.criado_em
      FROM dbo.usuarios u
      WHERE u.perfil = 'funcionario'
        AND u.empresa_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM dbo.vinculos v
          WHERE v.usuario_id = u.id AND v.empresa_id = u.empresa_id
        );
    END;
  `);

  // Empresas antigas ganham os setores padrão
  const semSetores = await all(`
    SELECT e.id
    FROM dbo.empresas e
    WHERE NOT EXISTS (SELECT 1 FROM dbo.setores s WHERE s.empresa_id = e.id)
  `);
  for (const { id } of semSetores) {
    for (const nome of SETORES_PADRAO) {
      await run('INSERT INTO dbo.setores (empresa_id, nome) VALUES (@p0, @p1)', [id, nome]);
    }
  }

  return pool;
}

module.exports = { sql, inicializar, query, get, all, run, getPool: () => pool };
