// Consultas SQL da tabela "usuarios"
const db = require('../config/database');

const buscarPorId = (id) => db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);

const buscarAdminPorEmail = (email) =>
  db.prepare("SELECT * FROM usuarios WHERE perfil = 'administrador' AND email = ?").get(email);

// Retorna uma lista (bancos antigos podem ter o mesmo e-mail em mais de uma conta)
const listarFuncionariosPorEmail = (email) =>
  db.prepare("SELECT * FROM usuarios WHERE perfil = 'funcionario' AND lower(email) = ?").all(email);

function criar({ nome, email, senhaHash, perfil }) {
  const r = db.prepare('INSERT INTO usuarios (nome, email, senha_hash, perfil, criado_em) VALUES (?, ?, ?, ?, ?)')
    .run(nome, email, senhaHash, perfil, new Date().toISOString());
  return buscarPorId(Number(r.lastInsertRowid));
}

// empresasPersonalizado só é usado no plano personalizado (nos outros fica null)
const definirPlano = (id, planoId, empresasPersonalizado = null) =>
  db.prepare('UPDATE usuarios SET plano_id = ?, plano_empresas = ? WHERE id = ?').run(planoId, empresasPersonalizado, id);

module.exports = { buscarPorId, buscarAdminPorEmail, listarFuncionariosPorEmail, criar, definirPlano };
