const { planoContratado } = require('../config/planos');

const usuarioPublico = (u) => ({ id: u.id, nome: u.nome, email: u.email, perfil: u.perfil, plano_id: u.plano_id });

const planoDoUsuario = (u) => planoContratado(u.plano_id, u.plano_empresas);

module.exports = { usuarioPublico, planoDoUsuario };
