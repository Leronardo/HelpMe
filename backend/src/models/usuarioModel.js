// // Consultas SQL da tabela "usuarios"
// const db = require('../config/database');

// const buscarPorId = (id) => db.prepare('SELECT * FROM usuarios WHERE id = ?').get(id);

// const buscarAdminPorEmail = (email) =>
//   db.prepare("SELECT * FROM usuarios WHERE perfil = 'administrador' AND email = ?").get(email);

// // Retorna uma lista (bancos antigos podem ter o mesmo e-mail em mais de uma conta)
// const listarFuncionariosPorEmail = (email) =>
//   db.prepare("SELECT * FROM usuarios WHERE perfil = 'funcionario' AND lower(email) = ?").all(email);

// function criar({ nome, email, senhaHash, perfil }) {
//   const r = db.prepare('INSERT INTO usuarios (nome, email, senha_hash, perfil, criado_em) VALUES (?, ?, ?, ?, ?)')
//     .run(nome, email, senhaHash, perfil, new Date().toISOString());
//   return buscarPorId(Number(r.lastInsertRowid));
// }

// // empresasPersonalizado só é usado no plano personalizado (nos outros fica null)
// const definirPlano = (id, planoId, empresasPersonalizado = null) =>
//   db.prepare('UPDATE usuarios SET plano_id = ?, plano_empresas = ? WHERE id = ?').run(planoId, empresasPersonalizado, id);

// module.exports = { buscarPorId, buscarAdminPorEmail, listarFuncionariosPorEmail, criar, definirPlano };

// Consultas SQL da tabela "usuarios"
const bd = require('../config/database');

const buscarPorId = (id) => bd.um('SELECT * FROM usuarios WHERE id = ?', [id]);

const buscarAdminPorEmail = (email) =>
  bd.um("SELECT * FROM usuarios WHERE perfil = 'administrador' AND email = ?", [email]);

// Retorna uma lista (por segurança, caso exista mais de uma conta com o mesmo e-mail)
const listarFuncionariosPorEmail = (email) =>
  bd.consultar("SELECT * FROM usuarios WHERE perfil = 'funcionario' AND lower(email) = ?", [email]);

async function criar({ nome, email, senhaHash, perfil }) {
  const novo = await bd.um(
    'INSERT INTO usuarios (nome, email, senha_hash, perfil, criado_em) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?)',
    [nome, email, senhaHash, perfil, new Date().toISOString()],
  );
  return buscarPorId(novo.id);
}

// empresasPersonalizado só é usado no plano personalizado (nos outros fica null)
const definirPlano = (id, planoId, empresasPersonalizado = null) =>
  bd.executar('UPDATE usuarios SET plano_id = ?, plano_empresas = ? WHERE id = ?', [planoId, empresasPersonalizado, id]);

module.exports = { buscarPorId, buscarAdminPorEmail, listarFuncionariosPorEmail, criar, definirPlano };