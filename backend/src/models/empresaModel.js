// // Consultas SQL da tabela "empresas"
// const crypto = require('node:crypto');
// const db = require('../config/database');
// const setorModel = require('./setorModel');

// const buscarPorId = (id) => db.prepare('SELECT * FROM empresas WHERE id = ?').get(id);

// const buscarPorCodigo = (codigo) => db.prepare('SELECT * FROM empresas WHERE codigo = ?').get(codigo);

// const buscarDoAdmin = (id, adminId) =>
//   db.prepare('SELECT * FROM empresas WHERE id = ? AND admin_id = ?').get(id, adminId);

// const listarDoAdmin = (adminId) =>
//   db.prepare('SELECT id, nome, logo, codigo, criado_em FROM empresas WHERE admin_id = ? ORDER BY id').all(adminId);

// const contarDoAdmin = (adminId) => db.prepare('SELECT COUNT(*) AS n FROM empresas WHERE admin_id = ?').get(adminId).n;

// // Empresas em que o funcionário trabalha (sem mostrar o código para ele)
// const listarDoFuncionario = (usuarioId) =>
//   db.prepare(`SELECT e.id, e.nome, e.logo FROM empresas e
//               JOIN vinculos v ON v.empresa_id = e.id
//               WHERE v.usuario_id = ? ORDER BY v.criado_em, e.id`).all(usuarioId);

// // Acrescenta a lista de setores ao objeto da empresa
// const comSetores = (empresa) => ({ ...empresa, setores: setorModel.listar(empresa.id) });

// // Código de 6 caracteres, sem letras/números que se confundem (0/O, 1/I)
// function gerarCodigoUnico() {
//   const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
//   for (;;) {
//     let codigo = '';
//     for (const byte of crypto.randomBytes(6)) codigo += alfabeto[byte % alfabeto.length];
//     if (!buscarPorCodigo(codigo)) return codigo;
//   }
// }

// function criar({ nome, logo, adminId }) {
//   const codigo = gerarCodigoUnico();
//   const r = db.prepare('INSERT INTO empresas (nome, logo, codigo, admin_id, criado_em) VALUES (?, ?, ?, ?, ?)')
//     .run(nome, logo, codigo, adminId, new Date().toISOString());
//   const id = Number(r.lastInsertRowid);
//   setorModel.criarPadrao(id);
//   return buscarPublica(id);
// }

// const buscarPublica = (id) => db.prepare('SELECT id, nome, logo, codigo, criado_em FROM empresas WHERE id = ?').get(id);

// function atualizar(id, { nome, logo }) {
//   db.prepare('UPDATE empresas SET nome = ?, logo = ? WHERE id = ?').run(nome, logo, id);
//   return buscarPublica(id);
// }

// module.exports = {
//   buscarPorId, buscarPorCodigo, buscarDoAdmin, listarDoAdmin, contarDoAdmin, listarDoFuncionario,
//   comSetores, criar, atualizar,
// };

// Consultas SQL da tabela "empresas"
const crypto = require('node:crypto');
const bd = require('../config/database');
const setorModel = require('./setorModel');

const buscarPorId = (id) => bd.um('SELECT * FROM empresas WHERE id = ?', [id]);

const buscarPorCodigo = (codigo) => bd.um('SELECT * FROM empresas WHERE codigo = ?', [codigo]);

const buscarDoAdmin = (id, adminId) => bd.um('SELECT * FROM empresas WHERE id = ? AND admin_id = ?', [id, adminId]);

const listarDoAdmin = (adminId) =>
  bd.consultar('SELECT id, nome, logo, codigo, criado_em FROM empresas WHERE admin_id = ? ORDER BY id', [adminId]);

const contarDoAdmin = async (adminId) => (await bd.um('SELECT COUNT(*) AS n FROM empresas WHERE admin_id = ?', [adminId])).n;

// Empresas em que o funcionário trabalha (sem mostrar o código para ele)
const listarDoFuncionario = (usuarioId) =>
  bd.consultar(`SELECT e.id, e.nome, e.logo FROM empresas e
                JOIN vinculos v ON v.empresa_id = e.id
                WHERE v.usuario_id = ? ORDER BY v.criado_em, e.id`, [usuarioId]);

// Acrescenta a lista de setores ao objeto da empresa
const comSetores = async (empresa) => ({ ...empresa, setores: await setorModel.listar(empresa.id) });

// Código de 6 caracteres, sem letras/números que se confundem (0/O, 1/I)
async function gerarCodigoUnico() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (;;) {
    let codigo = '';
    for (const byte of crypto.randomBytes(6)) codigo += alfabeto[byte % alfabeto.length];
    if (!(await buscarPorCodigo(codigo))) return codigo;
  }
}

const buscarPublica = (id) => bd.um('SELECT id, nome, logo, codigo, criado_em FROM empresas WHERE id = ?', [id]);

async function criar({ nome, logo, adminId }) {
  const codigo = await gerarCodigoUnico();
  // a empresa e os setores padrão são salvos juntos (ou nenhum dos dois)
  const id = await bd.transacao(async (tx) => {
    const nova = await tx.um(
      'INSERT INTO empresas (nome, logo, codigo, admin_id, criado_em) OUTPUT INSERTED.id VALUES (?, ?, ?, ?, ?)',
      [nome, bd.textoMax(logo), codigo, adminId, new Date().toISOString()],
    );
    await setorModel.criarPadrao(nova.id, tx);
    return nova.id;
  });
  return buscarPublica(id);
}

async function atualizar(id, { nome, logo }) {
  await bd.executar('UPDATE empresas SET nome = ?, logo = ? WHERE id = ?', [nome, bd.textoMax(logo), id]);
  return buscarPublica(id);
}

module.exports = {
  buscarPorId, buscarPorCodigo, buscarDoAdmin, listarDoAdmin, contarDoAdmin, listarDoFuncionario,
  comSetores, criar, atualizar,
};