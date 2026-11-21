// // Consultas SQL da tabela "chamados"
// const db = require('../config/database');

// const buscarPorId = (id) => db.prepare('SELECT * FROM chamados WHERE id = ?').get(id);

// function criar({ empresaId, usuarioId, titulo, descricao, setor, nivel }) {
//   const agora = new Date().toISOString();
//   const r = db.prepare(`
//     INSERT INTO chamados (empresa_id, usuario_id, titulo, descricao, setor, nivel, status, criado_em, atualizado_em)
//     VALUES (?, ?, ?, ?, ?, ?, 'aberto', ?, ?)`).run(empresaId, usuarioId, titulo, descricao, setor, nivel, agora, agora);
//   return db.prepare('SELECT id, titulo, descricao, setor, nivel, status, criado_em, atualizado_em FROM chamados WHERE id = ?')
//     .get(Number(r.lastInsertRowid));
// }

// // Chamados que o funcionário abriu em uma empresa específica
// const listarDoUsuario = (usuarioId, empresaId) =>
//   db.prepare(`SELECT id, titulo, descricao, setor, nivel, status, criado_em, atualizado_em
//               FROM chamados WHERE usuario_id = ? AND empresa_id = ? ORDER BY criado_em DESC, id DESC`).all(usuarioId, empresaId);

// // filtros: { nivel, status, setor, busca } (todos opcionais)
// function listarDaEmpresa(empresaId, filtros) {
//   const condicoes = ['c.empresa_id = ?'];
//   const valores = [empresaId];

//   if (filtros.nivel) { condicoes.push('c.nivel = ?'); valores.push(filtros.nivel); }
//   if (filtros.status) { condicoes.push('c.status = ?'); valores.push(filtros.status); }
//   if (filtros.setor) { condicoes.push('c.setor = ?'); valores.push(filtros.setor); }
//   if (filtros.busca) {
//     // escapa os caracteres especiais do LIKE (% _ \)
//     const termo = `%${filtros.busca.replace(/[\\%_]/g, '\\$&')}%`;
//     condicoes.push("(c.titulo LIKE ? ESCAPE '\\' OR u.nome LIKE ? ESCAPE '\\')");
//     valores.push(termo, termo);
//   }

//   return db.prepare(`
//     SELECT c.id, c.titulo, c.descricao, c.setor, c.nivel, c.status, c.criado_em, c.atualizado_em,
//            u.nome AS usuario_nome, u.email AS usuario_email
//     FROM chamados c
//     JOIN usuarios u ON u.id = c.usuario_id
//     WHERE ${condicoes.join(' AND ')}
//     ORDER BY c.criado_em DESC, c.id DESC`).all(...valores);
// }

// const atualizarStatus = (id, status) =>
//   db.prepare('UPDATE chamados SET status = ?, atualizado_em = ? WHERE id = ?').run(status, new Date().toISOString(), id);

// const listarParaEstatisticas = (empresaId) =>
//   db.prepare('SELECT nivel, status, criado_em FROM chamados WHERE empresa_id = ?').all(empresaId);

// module.exports = { buscarPorId, criar, listarDoUsuario, listarDaEmpresa, atualizarStatus, listarParaEstatisticas };

// Consultas SQL da tabela "chamados"
const bd = require('../config/database');

const COLUNAS = 'id, titulo, descricao, setor, nivel, status, criado_em, atualizado_em';

const buscarPorId = (id) => bd.um('SELECT * FROM chamados WHERE id = ?', [id]);

async function criar({ empresaId, usuarioId, titulo, descricao, setor, nivel }) {
  const agora = new Date().toISOString();
  const novo = await bd.um(
    `INSERT INTO chamados (empresa_id, usuario_id, titulo, descricao, setor, nivel, status, criado_em, atualizado_em)
     OUTPUT INSERTED.id
     VALUES (?, ?, ?, ?, ?, ?, 'aberto', ?, ?)`,
    [empresaId, usuarioId, titulo, descricao, setor, nivel, agora, agora],
  );
  return bd.um(`SELECT ${COLUNAS} FROM chamados WHERE id = ?`, [novo.id]);
}

// Chamados que o funcionário abriu em uma empresa específica
const listarDoUsuario = (usuarioId, empresaId) =>
  bd.consultar(`SELECT ${COLUNAS} FROM chamados WHERE usuario_id = ? AND empresa_id = ? ORDER BY criado_em DESC, id DESC`,
    [usuarioId, empresaId]);

// filtros: { nivel, status, setor, busca } (todos opcionais)
function listarDaEmpresa(empresaId, filtros) {
  const condicoes = ['c.empresa_id = ?'];
  const valores = [empresaId];

  if (filtros.nivel) { condicoes.push('c.nivel = ?'); valores.push(filtros.nivel); }
  if (filtros.status) { condicoes.push('c.status = ?'); valores.push(filtros.status); }
  if (filtros.setor) { condicoes.push('c.setor = ?'); valores.push(filtros.setor); }
  if (filtros.busca) {
    // escapa os caracteres especiais do LIKE no SQL Server: % _ [ e a própria barra \
    const termo = `%${filtros.busca.replace(/[\\%_[]/g, '\\$&')}%`;
    condicoes.push("(c.titulo LIKE ? ESCAPE '\\' OR u.nome LIKE ? ESCAPE '\\')");
    valores.push(termo, termo);
  }

  return bd.consultar(`
    SELECT c.id, c.titulo, c.descricao, c.setor, c.nivel, c.status, c.criado_em, c.atualizado_em,
           u.nome AS usuario_nome, u.email AS usuario_email
    FROM chamados c
    JOIN usuarios u ON u.id = c.usuario_id
    WHERE ${condicoes.join(' AND ')}
    ORDER BY c.criado_em DESC, c.id DESC`, valores);
}

const atualizarStatus = (id, status) =>
  bd.executar('UPDATE chamados SET status = ?, atualizado_em = ? WHERE id = ?', [status, new Date().toISOString(), id]);

const listarParaEstatisticas = (empresaId) =>
  bd.consultar('SELECT nivel, status, criado_em FROM chamados WHERE empresa_id = ?', [empresaId]);

module.exports = { buscarPorId, criar, listarDoUsuario, listarDaEmpresa, atualizarStatus, listarParaEstatisticas };