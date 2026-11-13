const { PAGAMENTO_MODO } = require('../config/env');
const { HttpError } = require('../utils/erros');

const emModoTeste = () => PAGAMENTO_MODO === 'teste';

function cobrarAssinatura(admin, plano) { // eslint-disable-line no-unused-vars
  if (emModoTeste()) return { aprovado: true };
  throw new HttpError(501, 'O pagamento online ainda não foi configurado. Fale com o suporte.');
}

module.exports = { emModoTeste, cobrarAssinatura };
