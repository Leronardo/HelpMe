// // Consultas SQL da tabela "setores"
// const db = require('../config/database');
// const { SETORES_PADRAO } = require('../config/constantes');

// const listar = (empresaId) =>
//   db.prepare('SELECT id, nome FROM setores WHERE empresa_id = ? ORDER BY nome COLLATE NOCASE').all(empresaId);

// const nomes = (empresaId) => listar(empresaId).map((s) => s.nome);

// const existe = (empresaId, nome) =>
//   !!db.prepare('SELECT 1 FROM setores WHERE empresa_id = ? AND nome = ? COLLATE NOCASE').get(empresaId, nome);

// const contar = (empresaId) => db.prepare('SELECT COUNT(*) AS n FROM setores WHERE empresa_id = ?').get(empresaId).n;

// const criar = (empresaId, nome) => db.prepare('INSERT INTO setores (empresa_id, nome) VALUES (?, ?)').run(empresaId, nome);

// const criarPadrao = (empresaId) => SETORES_PADRAO.forEach((nome) => criar(empresaId, nome));

// const excluir = (id, empresaId) =>
//   db.prepare('DELETE FROM setores WHERE id = ? AND empresa_id = ?').run(id, empresaId).changes;

// module.exports = { listar, nomes, existe, contar, criar, criarPadrao, excluir };

// Consultas SQL da tabela "setores"
const bd = require('../config/database');
const { SETORES_PADRAO } = require('../config/constantes');

// A coluna "nome" já ignora maiúsculas/minúsculas (collation CI_AS), então "ti" = "TI"
const listar = (empresaId) => bd.consultar('SELECT id, nome FROM setores WHERE empresa_id = ? ORDER BY nome', [empresaId]);

const nomes = async (empresaId) => (await listar(empresaId)).map((s) => s.nome);

const existe = async (empresaId, nome) =>
  !!(await bd.um('SELECT 1 AS ok FROM setores WHERE empresa_id = ? AND nome = ?', [empresaId, nome]));

const contar = async (empresaId) => (await bd.um('SELECT COUNT(*) AS n FROM setores WHERE empresa_id = ?', [empresaId])).n;

// "executor" é o banco (padrão) ou o "tx" de uma transação
const criar = (empresaId, nome, executor = bd) =>
  executor.executar('INSERT INTO setores (empresa_id, nome) VALUES (?, ?)', [empresaId, nome]);

async function criarPadrao(empresaId, executor = bd) {
  for (const nome of SETORES_PADRAO) await criar(empresaId, nome, executor);
}

const excluir = (id, empresaId) => bd.executar('DELETE FROM setores WHERE id = ? AND empresa_id = ?', [id, empresaId]);

module.exports = { listar, nomes, existe, contar, criar, criarPadrao, excluir };
