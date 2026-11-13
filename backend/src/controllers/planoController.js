const { PLANOS, PLANO_PERSONALIZADO, buscarPlano, montarPersonalizado } = require('../config/planos');
const empresaModel = require('../models/empresaModel');
const usuarioModel = require('../models/usuarioModel');
const { exigeLogin } = require('../middlewares/autenticacao');
const pagamento = require('../services/pagamento');
const { HttpError } = require('../utils/erros');
const { usuarioPublico, planoDoUsuario } = require('../utils/apresentacao');

function listar() {
  const { id, nome, minimo, maximo, precoPorEmpresa } = PLANO_PERSONALIZADO;
  return {
    planos: PLANOS,
    personalizado: { id, nome, minimo, maximo, preco_por_empresa: precoPorEmpresa },
    modo_teste: pagamento.emModoTeste(),
  };
}

function resolverPlano(body) {
  if (body.plano_id === PLANO_PERSONALIZADO.id) {
    const empresas = Number(body.empresas);
    const { minimo, maximo } = PLANO_PERSONALIZADO;
    if (!Number.isInteger(empresas) || empresas < minimo || empresas > maximo) {
      throw new HttpError(400, `No plano personalizado, escolha entre ${minimo} e ${maximo} empresas.`);
    }
    return montarPersonalizado(empresas);
  }
  const plano = buscarPlano(String(body.plano_id || ''));
  if (!plano) throw new HttpError(400, 'Plano inválido.');
  return plano;
}

async function assinar({ req, body }) {
  const admin = await exigeLogin(req, 'administrador');
  const plano = resolverPlano(body);

 const empresas = await empresaModel.contarDoAdmin(admin.id);
  if (empresas > plano.empresas) {
    throw new HttpError(400, `Você tem ${empresas} empresas e o plano ${plano.nome} permite só ${plano.empresas}. Escolha um plano maior.`);
  }

  pagamento.cobrarAssinatura(admin, plano); 
  await usuarioModel.definirPlano(admin.id, plano.id, plano.personalizado ? plano.empresas : null);

  const atualizado = await usuarioModel.buscarPorId(admin.id);
  return { usuario: usuarioPublico(atualizado), plano: planoDoUsuario(atualizado) };
}

module.exports = { listar, assinar };
