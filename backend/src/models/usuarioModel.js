const db = require('../config/database');

const buscarPorId = (id) =>
  db.get('SELECT * FROM dbo.usuarios WHERE id = @p0', [id]);

const buscarAdminPorEmail = (email) =>
  db.get("SELECT * FROM dbo.usuarios WHERE perfil = 'administrador' AND LOWER(email) = @p0", [email]);

const listarFuncionariosPorEmail = (email) =>
  db.all("SELECT * FROM dbo.usuarios WHERE perfil = 'funcionario' AND LOWER(email) = @p0", [email]);

async function criar({ nome, email, senhaHash, perfil }) {
  const criado = await db.get(
    `INSERT INTO dbo.usuarios (nome, email, senha_hash, perfil, criado_em)
     OUTPUT INSERTED.*
     VALUES (@p0, @p1, @p2, @p3, @p4)`,
    [nome, email, senhaHash, perfil, new Date().toISOString()]
  );
  return criado;
}

const definirPlano = (id, planoId, empresasPersonalizado = null) =>
  db.run(
    'UPDATE dbo.usuarios SET plano_id = @p0, plano_empresas = @p1 WHERE id = @p2',
    [planoId, empresasPersonalizado, id]
  );

module.exports = { buscarPorId, buscarAdminPorEmail, listarFuncionariosPorEmail, criar, definirPlano };
