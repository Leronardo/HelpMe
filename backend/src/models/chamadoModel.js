const db = require('../config/database');

const buscarPorId = (id) =>
  db.get('SELECT * FROM dbo.chamados WHERE id = @p0', [id]);

async function criar({ empresaId, usuarioId, titulo, descricao, setor, nivel }) {
  const agora = new Date().toISOString();
  return db.get(
    `INSERT INTO dbo.chamados (empresa_id, usuario_id, titulo, descricao, setor, nivel, status, criado_em, atualizado_em)
     OUTPUT INSERTED.id, INSERTED.titulo, INSERTED.descricao, INSERTED.setor, INSERTED.nivel, INSERTED.status, INSERTED.criado_em, INSERTED.atualizado_em
     VALUES (@p0, @p1, @p2, @p3, @p4, @p5, 'aberto', @p6, @p7)`,
    [empresaId, usuarioId, titulo, descricao, setor, nivel, agora, agora]
  );
}

const listarDoUsuario = (usuarioId, empresaId) =>
  db.all(
    `SELECT id, titulo, descricao, setor, nivel, status, criado_em, atualizado_em
     FROM dbo.chamados
     WHERE usuario_id = @p0 AND empresa_id = @p1
     ORDER BY criado_em DESC, id DESC`,
    [usuarioId, empresaId]
  );

function listarDaEmpresa(empresaId, filtros) {
  const condicoes = ['c.empresa_id = @p0'];
  const valores = [empresaId];

  const addParam = (valor) => {
    const idx = valores.length;
    valores.push(valor);
    return `@p${idx}`;
  };

  if (filtros.nivel) {
    condicoes.push(`c.nivel = ${addParam(filtros.nivel)}`);
  }
  if (filtros.status) {
    condicoes.push(`c.status = ${addParam(filtros.status)}`);
  }
  if (filtros.setor) {
    condicoes.push(`c.setor = ${addParam(filtros.setor)}`);
  }
  if (filtros.busca) {
    const termo = `%${filtros.busca.replace(/[\%_]/g, '\$&')}%`;
    const p1 = addParam(termo);
    const p2 = addParam(termo);
    condicoes.push(`(c.titulo LIKE ${p1} ESCAPE '\' OR u.nome LIKE ${p2} ESCAPE '\')`);
  }

  return db.all(
    `SELECT c.id, c.titulo, c.descricao, c.setor, c.nivel, c.status, c.criado_em, c.atualizado_em,
            u.nome AS usuario_nome, u.email AS usuario_email
     FROM dbo.chamados c
     JOIN dbo.usuarios u ON u.id = c.usuario_id
     WHERE ${condicoes.join(' AND ')}
     ORDER BY c.criado_em DESC, c.id DESC`,
    valores
  );
}

const atualizarStatus = (id, status) =>
  db.run(
    'UPDATE dbo.chamados SET status = @p0, atualizado_em = @p1 WHERE id = @p2',
    [status, new Date().toISOString(), id]
  );

const listarParaEstatisticas = (empresaId) =>
  db.all('SELECT nivel, status, criado_em FROM dbo.chamados WHERE empresa_id = @p0', [empresaId]);

module.exports = { buscarPorId, criar, listarDoUsuario, listarDaEmpresa, atualizarStatus, listarParaEstatisticas };
