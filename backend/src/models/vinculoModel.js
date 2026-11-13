const db = require('../config/database');

async function existe(usuarioId, empresaId) {
  const row = await db.get(
    'SELECT 1 AS ok FROM dbo.vinculos WHERE usuario_id = @p0 AND empresa_id = @p1',
    [usuarioId, empresaId]
  );
  return !!row;
}

const criar = (usuarioId, empresaId) =>
  db.run(
    'INSERT INTO dbo.vinculos (usuario_id, empresa_id, criado_em) VALUES (@p0, @p1, @p2)',
    [usuarioId, empresaId, new Date().toISOString()]
  );

const listarFuncionariosDaEmpresa = (empresaId) =>
  db.all(
    `SELECT u.id, u.nome, u.email, v.criado_em,
            (SELECT COUNT(*) FROM dbo.chamados c WHERE c.usuario_id = u.id AND c.empresa_id = v.empresa_id) AS chamados
     FROM dbo.vinculos v
     JOIN dbo.usuarios u ON u.id = v.usuario_id
     WHERE v.empresa_id = @p0
     ORDER BY u.nome`,
    [empresaId]
  );

async function removerFuncionario(usuarioId, empresaId) {
  if (!(await existe(usuarioId, empresaId))) return 0;

  const pool = db.getPool();
  const transaction = new db.sql.Transaction(pool);
  await transaction.begin();

  try {
    const req1 = new db.sql.Request(transaction);
    req1.input('usuarioId', usuarioId);
    req1.input('empresaId', empresaId);
    await req1.query('DELETE FROM dbo.chamados WHERE usuario_id = @usuarioId AND empresa_id = @empresaId');

    const req2 = new db.sql.Request(transaction);
    req2.input('usuarioId', usuarioId);
    req2.input('empresaId', empresaId);
    await req2.query('DELETE FROM dbo.vinculos WHERE usuario_id = @usuarioId AND empresa_id = @empresaId');

    const req3 = new db.sql.Request(transaction);
    req3.input('usuarioId', usuarioId);
    const resRestantes = await req3.query('SELECT COUNT(*) AS n FROM dbo.vinculos WHERE usuario_id = @usuarioId');
    const restantes = resRestantes.recordset[0] ? Number(resRestantes.recordset[0].n) : 0;

    if (restantes === 0) {
      const req4 = new db.sql.Request(transaction);
      req4.input('usuarioId', usuarioId);
      await req4.query("DELETE FROM dbo.usuarios WHERE id = @usuarioId AND perfil = 'funcionario'");
    }

    await transaction.commit();
  } catch (erro) {
    await transaction.rollback();
    throw erro;
  }
  return 1;
}

module.exports = { existe, criar, listarFuncionariosDaEmpresa, removerFuncionario };
