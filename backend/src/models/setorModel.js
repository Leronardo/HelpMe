const db = require('../config/database');
const { SETORES_PADRAO } = require('../config/constantes');

const listar = (empresaId) =>
  db.all('SELECT id, nome FROM dbo.setores WHERE empresa_id = @p0 ORDER BY nome', [empresaId]);

async function nomes(empresaId) {
  const lista = await listar(empresaId);
  return lista.map((s) => s.nome);
}

async function existe(empresaId, nome) {
  const row = await db.get(
    'SELECT 1 AS ok FROM dbo.setores WHERE empresa_id = @p0 AND LOWER(nome) = LOWER(@p1)',
    [empresaId, nome]
  );
  return !!row;
}

async function contar(empresaId) {
  const row = await db.get('SELECT COUNT(*) AS n FROM dbo.setores WHERE empresa_id = @p0', [empresaId]);
  return row ? Number(row.n) : 0;
}

const criar = (empresaId, nome) =>
  db.run('INSERT INTO dbo.setores (empresa_id, nome) VALUES (@p0, @p1)', [empresaId, nome]);

async function criarPadrao(empresaId) {
  for (const nome of SETORES_PADRAO) {
    await criar(empresaId, nome);
  }
}

async function excluir(id, empresaId) {
  const res = await db.run('DELETE FROM dbo.setores WHERE id = @p0 AND empresa_id = @p1', [id, empresaId]);
  return res.rowsAffected;
}

module.exports = { listar, nomes, existe, contar, criar, criarPadrao, excluir };
