const crypto = require('node:crypto');
const db = require('../config/database');
const setorModel = require('./setorModel');

const buscarPorId = (id) =>
  db.get('SELECT * FROM dbo.empresas WHERE id = @p0', [id]);

const buscarPorCodigo = (codigo) =>
  db.get('SELECT * FROM dbo.empresas WHERE codigo = @p0', [codigo]);

const buscarDoAdmin = (id, adminId) =>
  db.get('SELECT * FROM dbo.empresas WHERE id = @p0 AND admin_id = @p1', [id, adminId]);

const listarDoAdmin = (adminId) =>
  db.all('SELECT id, nome, logo, codigo, criado_em FROM dbo.empresas WHERE admin_id = @p0 ORDER BY id', [adminId]);

async function contarDoAdmin(adminId) {
  const row = await db.get('SELECT COUNT(*) AS n FROM dbo.empresas WHERE admin_id = @p0', [adminId]);
  return row ? Number(row.n) : 0;
}

const listarDoFuncionario = (usuarioId) =>
  db.all(
    `SELECT e.id, e.nome, e.logo
     FROM dbo.empresas e
     JOIN dbo.vinculos v ON v.empresa_id = e.id
     WHERE v.usuario_id = @p0
     ORDER BY v.criado_em, e.id`,
    [usuarioId]
  );

async function comSetores(empresa) {
  return { ...empresa, setores: await setorModel.listar(empresa.id) };
}

async function gerarCodigoUnico() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (;;) {
    let codigo = '';
    for (const byte of crypto.randomBytes(6)) codigo += alfabeto[byte % alfabeto.length];
    if (!(await buscarPorCodigo(codigo))) return codigo;
  }
}

const buscarPublica = (id) =>
  db.get('SELECT id, nome, logo, codigo, criado_em FROM dbo.empresas WHERE id = @p0', [id]);

async function criar({ nome, logo, adminId }) {
  const codigo = await gerarCodigoUnico();
  const inserida = await db.get(
    `INSERT INTO dbo.empresas (nome, logo, codigo, admin_id, criado_em)
     OUTPUT INSERTED.id, INSERTED.nome, INSERTED.logo, INSERTED.codigo, INSERTED.criado_em
     VALUES (@p0, @p1, @p2, @p3, @p4)`,
    [nome, logo, codigo, adminId, new Date().toISOString()]
  );
  await setorModel.criarPadrao(inserida.id);
  return inserida;
}

async function atualizar(id, { nome, logo }) {
  await db.run('UPDATE dbo.empresas SET nome = @p0, logo = @p1 WHERE id = @p2', [nome, logo, id]);
  return buscarPublica(id);
}

module.exports = {
  buscarPorId,
  buscarPorCodigo,
  buscarDoAdmin,
  listarDoAdmin,
  contarDoAdmin,
  listarDoFuncionario,
  comSetores,
  criar,
  atualizar,
};
