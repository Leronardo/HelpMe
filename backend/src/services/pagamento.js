const crypto = require('node:crypto');
const { PAGAMENTO_MODO, APP_URL, MERCADOPAGO_ACCESS_TOKEN } = require('../config/env');
const { HttpError } = require('../utils/erros');
const pagamentoModel = require('../models/pagamentoModel');
const usuarioModel = require('../models/usuarioModel');

const emModoTeste = () => PAGAMENTO_MODO === 'teste';

function cobrarAssinatura() {
  if (emModoTeste()) return { aprovado: true };
  if (PAGAMENTO_MODO !== 'mercadopago') {
    throw new HttpError(501, 'O pagamento online ainda não foi configurado.');
  }
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    throw new HttpError(503, 'Preencha MERCADOPAGO_ACCESS_TOKEN no arquivo .env. No Mercado Pago, use o Access Token de teste.');
  }
  return null;
}

function valorMp(preco) {
  return Number(preco).toFixed(2);
}

function orderIdValido(id) {
  return typeof id === 'string' && id.startsWith('ORD');
}

function pagamentoConfere(pagamento, order) {
  if (!order || !order.status) return 'pendente';
  if (String(order.external_reference) !== String(pagamento.id)) {
    throw new HttpError(400, 'Este pagamento não pertence a este pedido.');
  }
  if (Math.abs(Number(order.total_amount) - pagamento.valor) > 0.01) {
    throw new HttpError(400, 'O valor pago não confere com o plano.');
  }
  if (order.status === 'processed' && order.status_detail === 'accredited') {
    if (Math.abs(Number(order.total_paid_amount) - pagamento.valor) > 0.01) {
      throw new HttpError(400, 'O valor pago não confere com o plano.');
    }
    return 'aprovado';
  }
  if (['failed', 'canceled', 'cancelled', 'refunded', 'charged_back'].includes(order.status)) {
    return 'recusado';
  }
  return 'pendente';
}

async function mp(caminho, { method = 'GET', body } = {}) {
  cobrarAssinatura();
  const headers = {
    Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  };
  if (method === 'POST') headers['X-Idempotency-Key'] = crypto.randomUUID();
  let resposta;
  try {
    resposta = await fetch(`https://api.mercadopago.com${caminho}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (erro) {
    console.error('Mercado Pago:', erro.message);
    throw new HttpError(502, 'Não foi possível falar com o Mercado Pago.');
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const detalhes = [];
    if (Array.isArray(dados.errors)) {
      for (const item of dados.errors) {
        if (typeof item?.message === 'string') detalhes.push(item.message);
        if (Array.isArray(item?.details)) detalhes.push(...item.details.filter((parte) => typeof parte === 'string'));
      }
    }
    const detalhe = [dados.message, dados.error, dados.cause?.[0]?.description, ...detalhes]
      .filter((item) => typeof item === 'string' && item.trim())
      .join(' ')
      .replace(/\s+/g, ' ')
      .slice(0, 220);
    console.error('Mercado Pago:', detalhe || resposta.status);
    throw new HttpError(
      502,
      detalhe
        ? `O Mercado Pago recusou o pedido: ${detalhe}`
        : 'O Mercado Pago recusou o pedido. Confira o Access Token de teste no .env.',
    );
  }
  return dados;
}

function meios() {
  return {
    not_allowed_types: ['bank_transfer', 'ticket', 'atm', 'account_money', 'digital_currency'],
    max_installments: 1,
  };
}

async function criarOrder(corpo, metodo) {
  try {
    return await mp('/v1/orders', { method: 'POST', body: corpo });
  } catch (erro) {
    if (metodo === 'pix' && /cannot exclude all payments methods/i.test(erro.message)) {
      throw new HttpError(502, 'Esta conta do Mercado Pago não oferece PIX. Ative uma chave PIX na conta ou pague com cartão.');
    }
    if (!corpo.config?.online?.auto_return || !/auto_return|url/i.test(erro.message)) throw erro;
    const online = { ...corpo.config.online };
    delete online.auto_return;
    return mp('/v1/orders', {
      method: 'POST',
      body: { ...corpo, config: { ...corpo.config, online } },
    });
  }
}

async function iniciar(admin, plano, metodo) {
  cobrarAssinatura();
  const registro = await pagamentoModel.criar({
    usuarioId: admin.id,
    planoId: plano.id,
    empresas: plano.personalizado ? plano.empresas : null,
    valor: plano.preco,
    metodo,
  });

  const preco = valorMp(plano.preco);
  if (metodo === 'pix') {
    const order = await mp('/v1/orders', {
      method: 'POST',
      body: {
        type: 'online',
        processing_mode: 'automatic',
        external_reference: String(registro.id),
        total_amount: preco,
        description: `HelpMe ${plano.nome}`,
        payer: { email: admin.email, first_name: 'APRO' },
        transactions: {
          payments: [{
            amount: preco,
            payment_method: { id: 'pix', type: 'bank_transfer' },
          }],
        },
      },
    });
    const pix = order.transactions?.payments?.[0]?.payment_method || {};
    if (!order.id || !pix.qr_code) throw new HttpError(502, 'O Mercado Pago não gerou o PIX.');
    await pagamentoModel.gravarMp(registro.id, order.id);
    return {
      situacao: 'pendente',
      pagamento_id: registro.id,
      qr_code: pix.qr_code,
      qr_base64: pix.qr_code_base64 || '',
    };
  }

  const volta = `${APP_URL}/?pagamento=${registro.id}`;
  const order = await criarOrder({
    type: 'online',
    processing_mode: 'manual',
    capture_mode: 'automatic',
    total_amount: preco,
    external_reference: String(registro.id),
    description: `HelpMe ${plano.nome}`,
    payer: { email: admin.email },
    items: [{ title: `HelpMe ${plano.nome}`, unit_price: preco, quantity: 1 }],
    config: {
      online: {
        success_url: volta,
        pending_url: volta,
        failure_url: volta,
        auto_return: 'all',
      },
      payment_method: meios(),
    },
  }, metodo);
  if (!order.id || !order.checkout_url) {
    throw new HttpError(502, 'O Mercado Pago não abriu o checkout.');
  }
  await pagamentoModel.gravarMp(registro.id, order.id);
  return { situacao: 'pendente', pagamento_id: registro.id, checkout_url: order.checkout_url };
}

async function sincronizar(admin, pagamentoId, mpIdInformado) {
  const pagamento = await pagamentoModel.buscarDoUsuario(pagamentoId, admin.id);
  if (!pagamento) throw new HttpError(404, 'Pagamento não encontrado.');
  if (pagamento.status === 'aprovado') return { situacao: 'aprovado', pagamento };

  const informado = orderIdValido(mpIdInformado) ? mpIdInformado : '';
  const mpId = pagamento.mp_id || informado;
  if (!mpId) return { situacao: 'pendente', pagamento };

  if (!pagamento.mp_id) await pagamentoModel.gravarMp(pagamento.id, mpId);
  const remoto = await mp(`/v1/orders/${mpId}`);
  const situacao = pagamentoConfere(pagamento, remoto);

  if (situacao === 'aprovado') {
    const liberou = await pagamentoModel.marcar(pagamento.id, 'aprovado');
    if (liberou) {
      await usuarioModel.definirPlano(
        admin.id,
        pagamento.plano_id,
        pagamento.empresas,
      );
    }
    return { situacao: 'aprovado', pagamento };
  }

  if (situacao === 'recusado') {
    await pagamentoModel.marcar(pagamento.id, 'recusado');
    return { situacao: 'recusado', pagamento };
  }
  return { situacao: 'pendente', pagamento };
}

module.exports = { emModoTeste, cobrarAssinatura, iniciar, sincronizar, pagamentoConfere };
