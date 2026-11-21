// // Consultas SQL da tabela "vinculos" (funcionário <-> empresa)
// const db = require('../config/database');

// const existe = (usuarioId, empresaId) =>
//   !!db.prepare('SELECT 1 FROM vinculos WHERE usuario_id = ? AND empresa_id = ?').get(usuarioId, empresaId);

// const criar = (usuarioId, empresaId) =>
//   db.prepare('INSERT INTO vinculos (usuario_id, empresa_id, criado_em) VALUES (?, ?, ?)')
//     .run(usuarioId, empresaId, new Date().toISOString());

// const listarFuncionariosDaEmpresa = (empresaId) =>
//   db.prepare(`
//     SELECT u.id, u.nome, u.email, v.criado_em,
//            (SELECT COUNT(*) FROM chamados c WHERE c.usuario_id = u.id AND c.empresa_id = v.empresa_id) AS chamados
//     FROM vinculos v
//     JOIN usuarios u ON u.id = v.usuario_id
//     WHERE v.empresa_id = ?
//     ORDER BY u.nome COLLATE NOCASE`).all(empresaId);

// // Tira o funcionário da empresa e apaga os chamados dele nela.
// // Se ele não trabalhar em mais nenhuma empresa, a conta também é apagada.
// // Retorna 1 se removeu, 0 se ele não fazia parte da empresa.
// function removerFuncionario(usuarioId, empresaId) {
//   if (!existe(usuarioId, empresaId)) return 0;

//   db.exec('BEGIN');
//   try {
//     db.prepare('DELETE FROM chamados WHERE usuario_id = ? AND empresa_id = ?').run(usuarioId, empresaId);
//     db.prepare('DELETE FROM vinculos WHERE usuario_id = ? AND empresa_id = ?').run(usuarioId, empresaId);
//     const restantes = db.prepare('SELECT COUNT(*) AS n FROM vinculos WHERE usuario_id = ?').get(usuarioId).n;
//     if (restantes === 0) db.prepare("DELETE FROM usuarios WHERE id = ? AND perfil = 'funcionario'").run(usuarioId);
//     db.exec('COMMIT');
//   } catch (erro) {
//     db.exec('ROLLBACK');
//     throw erro;
//   }
//   return 1;
// }

// module.exports = { existe, criar, listarFuncionariosDaEmpresa, removerFuncionario };

// Consultas SQL da tabela "vinculos" (funcionário <-> empresa)
const bd = require('../config/database');

const existe = async (usuarioId, empresaId) =>
  !!(await bd.um('SELECT 1 AS ok FROM vinculos WHERE usuario_id = ? AND empresa_id = ?', [usuarioId, empresaId]));

const criar = (usuarioId, empresaId) =>
  bd.executar('INSERT INTO vinculos (usuario_id, empresa_id, criado_em) VALUES (?, ?, ?)',
    [usuarioId, empresaId, new Date().toISOString()]);

const listarFuncionariosDaEmpresa = (empresaId) =>
  bd.consultar(`
    SELECT u.id, u.nome, u.email, v.criado_em,
           (SELECT COUNT(*) FROM chamados c WHERE c.usuario_id = u.id AND c.empresa_id = v.empresa_id) AS chamados
    FROM vinculos v
    JOIN usuarios u ON u.id = v.usuario_id
    WHERE v.empresa_id = ?
    ORDER BY u.nome`, [empresaId]);

// Tira o funcionário da empresa e apaga os chamados dele nela.
// Se ele não trabalhar em mais nenhuma empresa, a conta também é apagada.
// Retorna 1 se removeu, 0 se ele não fazia parte da empresa.
async function removerFuncionario(usuarioId, empresaId) {
  if (!(await existe(usuarioId, empresaId))) return 0;

  await bd.transacao(async (tx) => {
    await tx.executar('DELETE FROM chamados WHERE usuario_id = ? AND empresa_id = ?', [usuarioId, empresaId]);
    await tx.executar('DELETE FROM vinculos WHERE usuario_id = ? AND empresa_id = ?', [usuarioId, empresaId]);
    const { n } = await tx.um('SELECT COUNT(*) AS n FROM vinculos WHERE usuario_id = ?', [usuarioId]);
    if (n === 0) await tx.executar("DELETE FROM usuarios WHERE id = ? AND perfil = 'funcionario'", [usuarioId]);
  });
  return 1;
}

module.exports = { existe, criar, listarFuncionariosDaEmpresa, removerFuncionario };