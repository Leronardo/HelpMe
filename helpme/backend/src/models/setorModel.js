// Consultas SQL da tabela "setores"
const db = require('../config/database');
const { SETORES_PADRAO } = require('../config/constantes');

const listar = (empresaId) =>
  db.prepare('SELECT id, nome FROM setores WHERE empresa_id = ? ORDER BY nome COLLATE NOCASE').all(empresaId);

const nomes = (empresaId) => listar(empresaId).map((s) => s.nome);

const existe = (empresaId, nome) =>
  !!db.prepare('SELECT 1 FROM setores WHERE empresa_id = ? AND nome = ? COLLATE NOCASE').get(empresaId, nome);

const contar = (empresaId) => db.prepare('SELECT COUNT(*) AS n FROM setores WHERE empresa_id = ?').get(empresaId).n;

const criar = (empresaId, nome) => db.prepare('INSERT INTO setores (empresa_id, nome) VALUES (?, ?)').run(empresaId, nome);

const criarPadrao = (empresaId) => SETORES_PADRAO.forEach((nome) => criar(empresaId, nome));

const excluir = (id, empresaId) =>
  db.prepare('DELETE FROM setores WHERE id = ? AND empresa_id = ?').run(id, empresaId).changes;

module.exports = { listar, nomes, existe, contar, criar, criarPadrao, excluir };
