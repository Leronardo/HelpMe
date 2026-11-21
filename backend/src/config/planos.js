// Planos de assinatura do administrador. O que muda de um plano para o outro
// é a quantidade de empresas. Para mudar preços, é só editar este arquivo.

// Planos fixos
const PLANOS = [
  { id: 'empresa-1', nome: 'Essencial', empresas: 1, preco: 35 },
  { id: 'empresa-2', nome: 'Duplo',     empresas: 2, preco: 65, destaque: true },
  { id: 'empresa-3', nome: 'Trio',      empresas: 3, preco: 90 },
];

// Plano personalizado: para quem precisa de 4 ou mais empresas.
// O administrador escolhe a quantidade e o preço é quantidade x precoPorEmpresa.
const PLANO_PERSONALIZADO = { id: 'personalizado', nome: 'Personalizado', minimo: 4, maximo: 50, precoPorEmpresa: 28 };

const buscarPlano = (id) => PLANOS.find((p) => p.id === id) || null;

const montarPersonalizado = (empresas) => ({
  id: PLANO_PERSONALIZADO.id,
  nome: PLANO_PERSONALIZADO.nome,
  empresas,
  preco: empresas * PLANO_PERSONALIZADO.precoPorEmpresa,
  personalizado: true,
});

// Plano que o usuário contratou (o personalizado guarda a quantidade de empresas em separado)
function planoContratado(planoId, empresasPersonalizado) {
  if (planoId === PLANO_PERSONALIZADO.id) {
    const valido = Number.isInteger(empresasPersonalizado) && empresasPersonalizado >= PLANO_PERSONALIZADO.minimo;
    return valido ? montarPersonalizado(empresasPersonalizado) : null;
  }
  return buscarPlano(planoId);
}

module.exports = { PLANOS, PLANO_PERSONALIZADO, buscarPlano, montarPersonalizado, planoContratado };
