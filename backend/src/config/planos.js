
const PLANOS = [
  { id: 'empresa-1', nome: 'Essencial', empresas: 1, preco: 50 },
  { id: 'empresa-2', nome: 'Duplo',     empresas: 2, preco: 90, destaque: true },
  { id: 'empresa-3', nome: 'Trio',      empresas: 3, preco: 135 },
];

const PLANO_PERSONALIZADO = { id: 'personalizado', nome: 'Personalizado', minimo: 4, maximo: 50, precoPorEmpresa: 40 };

const buscarPlano = (id) => PLANOS.find((p) => p.id === id) || null;

const montarPersonalizado = (empresas) => ({
  id: PLANO_PERSONALIZADO.id,
  nome: PLANO_PERSONALIZADO.nome,
  empresas,
  preco: empresas * PLANO_PERSONALIZADO.precoPorEmpresa,
  personalizado: true,
});

function planoContratado(planoId, empresasPersonalizado) {
  if (planoId === PLANO_PERSONALIZADO.id) {
    const valido = Number.isInteger(empresasPersonalizado) && empresasPersonalizado >= PLANO_PERSONALIZADO.minimo;
    return valido ? montarPersonalizado(empresasPersonalizado) : null;
  }
  return buscarPlano(planoId);
}

module.exports = { PLANOS, PLANO_PERSONALIZADO, buscarPlano, montarPersonalizado, planoContratado };
