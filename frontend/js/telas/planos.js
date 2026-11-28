import { api } from '../api.js';
import { estado } from '../estado.js';
import { rotear } from '../navegacao.js';
import { sair } from '../sessao.js';
import { $, $$, copiar, esc, moeda, toast, confirmar } from '../utils.js';
import { cabecalho, classesBotao, dialogCls, dialogTexto, dialogTitulo, inputCls, layoutComTopo, muted, resumo, resumoItem, resumoNum, vazio } from '../ui.js';

export async function carregarPlanos() {
  if (estado.planos.length) return;
  const dados = await api('/planos');
  estado.planos = dados.planos;
  estado.personalizado = dados.personalizado;
  estado.modoTeste = dados.modo_teste;
}

const rotuloEmpresas = (n) => `${n} ${n === 1 ? 'empresa' : 'empresas'}`;
const cartaoBase = 'cartao relative flex flex-col gap-1 rounded-[14px] bg-white px-5 pt-6 pb-5';

function cartao(plano, { atual, usadas = 0, exigeVaga }) {
  const vagaNecessaria = usadas + (exigeVaga ? 1 : 0);
  let botao;

  if (plano.id === atual?.id) {
    botao = `<button class="${classesBotao({ ghost: true, block: true })}" disabled>Plano atual</button>`;
  } else if (vagaNecessaria > plano.empresas) {
    botao = `<button class="${classesBotao({ ghost: true, block: true })}" disabled>${exigeVaga ? 'Sem vaga para outra empresa' : `Você já tem ${usadas} empresas`}</button>`;
  } else {
    botao = `<button class="${classesBotao({ block: true })}" data-plano="${plano.id}">${atual ? 'Mudar para este plano' : 'Assinar'}</button>`;
  }

  const borda = plano.id === atual?.id ? 'border-2 border-ink'
    : plano.destaque ? 'border-2 border-beacon shadow-[0_8px_24px_rgba(255,180,31,.18)]'
    : 'border border-line';
  const porEmpresa = plano.empresas > 1 ? `${moeda(plano.preco / plano.empresas)} por empresa` : 'Ideal para começar';
  return `
    <article class="${cartaoBase} ${borda}">
      ${plano.destaque ? '<span class="absolute -top-3 left-5 rounded-full bg-beacon px-3 py-0.5 text-[12.5px] font-extrabold text-ink">Mais escolhido</span>' : ''}
      <h3 class="text-[22px]">${esc(plano.nome)}</h3>
      <p class="font-bold text-muted">${rotuloEmpresas(plano.empresas)}</p>
      <p class="mt-3.5 flex items-baseline gap-1"><b class="font-display text-[44px] leading-none tracking-tight">${moeda(plano.preco)}</b><span class="font-semibold text-muted">/mês</span></p>
      <p class="mt-0.5 mb-[18px] text-sm text-muted">${porEmpresa}</p>
      <div class="mt-auto">${botao}</div>
    </article>`;
}

function cartaoPersonalizado({ atual, usadas = 0, exigeVaga }) {
  const p = estado.personalizado;
  const minimo = Math.max(p.minimo, usadas + (exigeVaga ? 1 : 0));
  const atualN = atual?.personalizado ? atual.empresas : null;
  const inicial = Math.min(p.maximo, atualN && atualN >= minimo ? atualN : minimo);
  const campoNum = `${inputCls} min-w-0 px-1 text-center text-lg font-extrabold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

  return `
    <article class="${cartaoBase} border-2 border-dashed border-line" data-card="personalizado"
             data-tem-plano="${atual ? 1 : 0}"
             data-min="${minimo}" data-max="${p.maximo}" data-atual="${atualN ?? ''}">
      <h3 class="text-[22px]">${esc(p.nome)}</h3>
      <p class="font-bold text-muted">${p.minimo} ou mais empresas</p>
      <div class="mt-3">
        <label class="mb-1.5 block text-[13px] font-semibold" for="qtd">Quantas empresas?</label>
        <div class="flex gap-1.5">
          <button type="button" class="grid size-[42px] shrink-0 cursor-pointer place-items-center rounded-lg border border-line bg-white text-xl font-bold hover:bg-[#E3E8ED]" data-delta="-1" aria-label="Menos uma empresa">−</button>
          <input class="${campoNum}" type="number" id="qtd" inputmode="numeric" min="${minimo}" max="${p.maximo}" value="${inicial}">
          <button type="button" class="grid size-[42px] shrink-0 cursor-pointer place-items-center rounded-lg border border-line bg-white text-xl font-bold hover:bg-[#E3E8ED]" data-delta="1" aria-label="Mais uma empresa">+</button>
        </div>
      </div>
      <p class="mt-3.5 flex items-baseline gap-1"><b class="font-display text-[44px] leading-none tracking-tight" id="precoPers">${moeda(inicial * p.preco_por_empresa)}</b><span class="font-semibold text-muted">/mês</span></p>
      <p class="mt-0.5 mb-[18px] text-sm text-muted">${moeda(p.preco_por_empresa)} por empresa</p>
      <button class="${classesBotao({ block: true })} mt-auto" data-personalizado>Contratar</button>
    </article>`;
}

const itemIncluso = (texto) => `<li><span class="mr-2 font-extrabold text-n-leve">✓</span>${texto}</li>`;

export function htmlPlanos(opcoes) {
  return `
    <div class="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] items-stretch gap-4">
      ${estado.planos.map((p) => cartao(p, opcoes)).join('')}
      ${estado.personalizado ? cartaoPersonalizado(opcoes) : ''}
    </div>
    <div class="mt-6 rounded-[14px] border border-line bg-white px-6 py-[22px]">
      <h3 class="mb-3 text-[19px]">Todos os planos incluem</h3>
      <ul class="grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-x-6 gap-y-2 p-0">
        ${itemIncluso('Técnicos e colaboradores ilimitados')}
        ${itemIncluso('Chamados ilimitados')}
        ${itemIncluso('Setores personalizados em cada empresa')}
        ${itemIncluso('Painel com chamados por semana e por mês')}
        ${itemIncluso('Níveis de urgência e acompanhamento de status')}
        ${itemIncluso('Logotipo da sua empresa em todas as telas')}
      </ul>
    </div>
    ${estado.modoTeste
      ? '<p class="mt-4 inline-block rounded-lg border border-[#F0D58A] bg-[#FFF4D6] px-3.5 py-2 text-sm font-semibold text-[#7A5A00]">Modo de teste: o plano é ativado sem cobrança.</p>'
      : '<p class="mt-4 inline-block rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-semibold">O PIX mostra o QR Code e o cartão abre o Mercado Pago. O plano só libera depois que o pagamento for aprovado.</p>'}`;
}

export function ligarCartoes(container, aoEscolher) {
  $$('button[data-plano]', container).forEach((botao) =>
    botao.addEventListener('click', () => aoEscolher(estado.planos.find((p) => p.id === botao.dataset.plano))));

  const cartaoPers = $('[data-card="personalizado"]', container);
  if (cartaoPers) ligarPersonalizado(cartaoPers, aoEscolher);
}

function ligarPersonalizado(cartaoPers, aoEscolher) {
  const p = estado.personalizado;
  const campo = $('#qtd', cartaoPers), botao = $('button[data-personalizado]', cartaoPers), preco = $('#precoPers', cartaoPers);
  const minimo = Number(cartaoPers.dataset.min), maximo = Number(cartaoPers.dataset.max);
  const atualN = cartaoPers.dataset.atual ? Number(cartaoPers.dataset.atual) : null;
  const temPlano = cartaoPers.dataset.temPlano === '1';

  const quantidade = () => Math.min(maximo, Math.max(minimo, parseInt(campo.value, 10) || minimo));

  function atualizar() {
    const n = quantidade();
    preco.textContent = moeda(n * p.preco_por_empresa);
    botao.disabled = n === atualN;
    botao.textContent = n === atualN ? 'Plano atual' : temPlano ? 'Mudar para este plano' : 'Contratar';
    botao.className = `${classesBotao({ ghost: botao.disabled, block: true })} mt-auto`;
  }

  campo.addEventListener('input', atualizar);
  campo.addEventListener('change', () => { campo.value = quantidade(); atualizar(); });
  $$('[data-delta]', cartaoPers).forEach((b) => b.addEventListener('click', () => {
    campo.value = Math.min(maximo, Math.max(minimo, quantidade() + Number(b.dataset.delta)));
    atualizar();
  }));
  botao.addEventListener('click', () => {
    const n = quantidade();
    aoEscolher({ id: p.id, nome: p.nome, empresas: n, preco: n * p.preco_por_empresa, personalizado: true });
  });
  atualizar();
}

function aplicarPlano(dados) {
  estado.usuario = dados.usuario;
  estado.plano = dados.plano;
  toast(`Plano ${dados.plano.nome} ativado!`);
}

export async function assinarPlano(plano) {
  if (!estado.modoTeste) return pagarDeVerdade(plano);

  const mensagem = `Você terá até ${rotuloEmpresas(plano.empresas)} por ${moeda(plano.preco)}/mês. Modo de teste: nenhuma cobrança será feita agora.`;
  if (!(await confirmar(`Ativar o plano ${plano.nome}?`, mensagem, 'Ativar plano', false))) return false;

  try {
    const dados = await api('/assinatura', {
      method: 'POST',
      body: { plano_id: plano.id, empresas: plano.personalizado ? plano.empresas : undefined },
    });
    aplicarPlano(dados);
    return true;
  } catch (e) {
    toast(e.message, true);
    return false;
  }
}

function pagarDeVerdade(plano) {
  return new Promise((resolve) => {
    const dlg = document.createElement('dialog');
    dlg.className = dialogCls;
    let liberou = false;
    let timer = 0;
    const corpo = { plano_id: plano.id, empresas: plano.personalizado ? plano.empresas : undefined };

    dlg.addEventListener('close', () => {
      clearInterval(timer);
      dlg.remove();
      if (!liberou) resolve(false);
    });

    const escolha = () => {
      dlg.innerHTML = `
        <h3 class="${dialogTitulo}">Pagar o plano ${esc(plano.nome)}</h3>
        <p class="${dialogTexto}">${moeda(plano.preco)} por mês, até ${rotuloEmpresas(plano.empresas)}. O HelpMe só libera o plano depois que o Mercado Pago confirmar.</p>
        <p class="${dialogTexto}">No cartão de teste, use Visa 4235 6477 2802 5682, validade 11/30, código 123, nome do titular APRO e CPF 12345678909.</p>
        <div class="grid gap-2.5">
          <button type="button" class="${classesBotao({ block: true })}" id="pagPix">Pagar com PIX</button>
          <button type="button" class="${classesBotao({ block: true, ghost: true })}" id="pagCartao">Pagar com cartão</button>
          <button type="button" class="${classesBotao({ block: true, ghost: true })}" id="pagCancelar">Cancelar</button>
        </div>`;
      $('#pagPix', dlg).addEventListener('click', () => pedir('pix'));
      $('#pagCartao', dlg).addEventListener('click', () => pedir('cartao'));
      $('#pagCancelar', dlg).addEventListener('click', () => dlg.close());
    };

    async function pedir(metodo) {
      $$('button', dlg).forEach((botao) => { botao.disabled = true; });
      try {
        const dados = await api('/assinatura', { method: 'POST', body: { ...corpo, metodo } });
        if (metodo === 'pix') {
          mostrarPix(dados);
          return;
        }
        if (!dados.checkout_url) throw new Error('O Mercado Pago não abriu o pagamento.');
        location.href = dados.checkout_url;
      } catch (e) {
        toast(e.message, true);
        escolha();
      }
    }

    function mostrarPix(dados) {
      dlg.innerHTML = `
        <h3 class="${dialogTitulo}">Pague com PIX</h3>
        <p class="${dialogTexto}">No teste, o Mercado Pago aprova sozinho. O plano continua bloqueado até essa confirmação.</p>
        ${dados.qr_base64 ? `<img class="mx-auto mb-4 size-52 rounded-lg bg-white" alt="QR Code do PIX" src="data:image/png;base64,${dados.qr_base64}">` : ''}
        <p class="mb-4 max-h-24 overflow-auto break-all rounded-lg bg-[#F3F5F7] p-3 text-xs" id="pixCodigo">${esc(dados.qr_code || '')}</p>
        <p class="mb-4 text-sm font-semibold text-muted" id="pixEspera">Aguardando a confirmação do pagamento…</p>
        <p class="mb-4 text-sm font-semibold text-danger" id="pixErro" role="alert"></p>
        <div class="grid gap-2.5">
          <button type="button" class="${classesBotao({ block: true, ghost: true })}" id="pagCopiar">Copiar código PIX</button>
          <button type="button" class="${classesBotao({ block: true, ghost: true })}" id="pagCancelar">Fechar</button>
        </div>`;
      $('#pagCopiar', dlg).addEventListener('click', () => copiar(dados.qr_code, 'Código PIX copiado.'));
      $('#pagCancelar', dlg).addEventListener('click', () => dlg.close());
      timer = setInterval(() => consultar(dados.pagamento_id), 3000);
    }

    async function consultar(id) {
      try {
        const dados = await api(`/assinatura/pagamentos/${id}`, { method: 'POST', body: {} });
        if (dados.situacao === 'aprovado') {
          liberou = true;
          aplicarPlano(dados);
          dlg.close();
          resolve(true);
        } else if (dados.situacao === 'recusado') {
          clearInterval(timer);
          $('#pixEspera', dlg).textContent = '';
          $('#pixErro', dlg).textContent = 'O Mercado Pago não aprovou o pagamento. O plano continua bloqueado.';
        }
      } catch (e) {
        clearInterval(timer);
        const erro = $('#pixErro', dlg);
        if (erro) erro.textContent = e.message;
      }
    }

    document.body.appendChild(dlg);
    escolha();
    dlg.showModal();
  });
}

async function consultarPagamento(id, orderId) {
  const corpo = orderId && orderId.startsWith('ORD') ? { mp_id: orderId } : {};
  return api(`/assinatura/pagamentos/${id}`, { method: 'POST', body: corpo });
}

export async function receberRetornoPagamento() {
  const params = new URLSearchParams(location.search);
  const id = params.get('pagamento');
  if (!id || !estado.token) return;
  const orderId = params.get('order_id') || '';
  history.replaceState({}, '', location.pathname);
  try {
    const dados = await consultarPagamento(id, orderId);
    if (dados.situacao === 'aprovado') {
      aplicarPlano(dados);
      estado.escolhendoPlano = false;
      return;
    }
    if (dados.situacao === 'recusado') {
      toast('O Mercado Pago não aprovou o pagamento. O plano continua bloqueado.', true);
      return;
    }
    toast('Pagamento ainda não confirmado. O plano só libera quando o Mercado Pago aprovar.');
    let tentativas = 0;
    const timer = setInterval(async () => {
      tentativas += 1;
      if (tentativas > 200) {
        clearInterval(timer);
        return;
      }
      try {
        const atual = await consultarPagamento(id);
        if (atual.situacao === 'aprovado') {
          clearInterval(timer);
          aplicarPlano(atual);
          estado.escolhendoPlano = false;
          rotear();
        } else if (atual.situacao === 'recusado') {
          clearInterval(timer);
          toast('O Mercado Pago não aprovou o pagamento. O plano continua bloqueado.', true);
        }
      } catch (e) {
        clearInterval(timer);
        toast(e.message, true);
      }
    }, 3000);
  } catch (e) {
    toast(e.message, true);
  }
}

export async function telaEscolherPlano() {
  try { await carregarPlanos(); } catch (e) { toast(e.message, true); }
  const jaTemEmpresas = estado.empresas.length > 0;

  $('#app').innerHTML = layoutComTopo({
    acoes: jaTemEmpresas && estado.plano
      ? `<button class="${classesBotao({ dark: true, small: true })}" id="voltar">Voltar</button>`
      : `<button class="${classesBotao({ dark: true, small: true })}" id="sair">Sair</button>`,
    conteudo: `
      <h1 class="mb-2.5 font-display text-[clamp(32px,5vw,48px)]">Escolha seu plano</h1>
      <p class="mb-8 max-w-[62ch] text-lg ${muted}">${esc(estado.avisoPlano) || 'Escolha quantas empresas você vai atender. Você pode mudar de plano quando quiser.'}</p>
      ${htmlPlanos({ atual: estado.plano, usadas: estado.empresas.length, exigeVaga: !!estado.avisoPlano })}`,
  });
  window.scrollTo(0, 0);

  $('#sair')?.addEventListener('click', sair);
  $('#voltar')?.addEventListener('click', () => { estado.escolhendoPlano = false; estado.avisoPlano = ''; rotear(); });

  ligarCartoes($('#app'), async (plano) => {
    if (!(await assinarPlano(plano))) return;
    estado.escolhendoPlano = false;
    estado.avisoPlano = '';
    estado.criandoEmpresa = estado.empresas.length > 0 && estado.empresas.length < plano.empresas;
    rotear();
  });
}

export async function viewPlano() {
  const main = $('#main');
  main.innerHTML = `${cabecalho('Plano e preços')}<p class="${muted}">Carregando…</p>`;
  try { await carregarPlanos(); } catch (e) { main.innerHTML = `<p class="${vazio}">${esc(e.message)}</p>`; return; }
  if (estado.abaAdmin !== 'plano') return;

  const plano = estado.plano, usadas = estado.empresas.length;
  main.innerHTML = `
    ${cabecalho('Plano e preços', 'Mude de plano quando precisar de mais empresas')}
    <div class="${resumo}">
      <div class="${resumoItem}"><b class="${resumoNum}">${esc(plano.nome)}</b><span class="${muted}">Seu plano</span></div>
      <div class="${resumoItem}"><b class="${resumoNum}">${usadas} de ${plano.empresas}</b><span class="${muted}">Empresas em uso</span></div>
      <div class="${resumoItem}"><b class="${resumoNum}">${moeda(plano.preco)}</b><span class="${muted}">Por mês</span></div>
    </div>
    <h2 class="mt-[34px] mb-3 text-xl">Planos disponíveis</h2>
    ${htmlPlanos({ atual: plano, usadas })}`;

  ligarCartoes(main, async (novo) => {
    if (await assinarPlano(novo)) rotear();
  });
}
