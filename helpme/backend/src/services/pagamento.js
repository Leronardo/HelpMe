// Cobrança da assinatura.
// ATENÇÃO: aqui é o ponto onde entra o gateway de pagamento (Mercado Pago, Asaas, Stripe...).
// No modo 'teste' o plano é ativado SEM cobrar nada. Para cobrar de verdade, implemente a
// cobrança recorrente no modo 'producao' e só retorne { aprovado: true } quando o pagamento for confirmado.
const { PAGAMENTO_MODO } = require('../config/env');
const { HttpError } = require('../utils/erros');

const emModoTeste = () => PAGAMENTO_MODO === 'teste';

function cobrarAssinatura(admin, plano) { // eslint-disable-line no-unused-vars
  if (emModoTeste()) return { aprovado: true };
  throw new HttpError(501, 'O pagamento online ainda não foi configurado. Fale com o suporte.');
}

module.exports = { emModoTeste, cobrarAssinatura };
