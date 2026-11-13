// Tabela de preços (recepção, escolha de plano e aba "Plano e preços" do administrador)
import { api } from '../api.js';
import { estado } from '../estado.js';
import { rotear } from '../navegacao.js';
import { sair } from '../sessao.js';
import { $, $$, esc, moeda, toast, confirmar } from '../utils.js';
import { layoutPublico } from './publico.js';

export async function carregarPlanos() {
  if (estado.planos.length) return;
  const dados = await api('/planos');
  estado.planos = dados.planos;
  estado.personalizado = dados.personalizado;
  estado.modoTeste = dados.modo_teste;
}

const rotuloEmpresas = (n) => `${n} ${n === 1 ? 'empresa' : 'empresas'}`;

/*
  opcoes:
    modo       'publico' (antes do login) ou 'admin'
    atual      plano atual do administrador (ou null)
    usadas     quantas empresas ele já tem
    exigeVaga  true quando ele quer criar mais uma empresa: só servem planos com vaga extra
*/
function cartao(plano, { modo, atual, usadas = 0, exigeVaga }) {
  const vagaNecessaria = usadas + (exigeVaga ? 1 : 0);
  let botao;

  if (modo === 'publico') {
    botao = `<button class="btn block" data-plano="${plano.id}">Começar com este plano</button>`;
  } else if (plano.id === atual?.id) {
    botao = '<button class="btn ghost block" disabled>Plano atual</button>';
  } else if (vagaNecessaria > plano.empresas) {
    botao = `<button class="btn ghost block" disabled>${exigeVaga ? 'Sem vaga para outra empresa' : `Você já tem ${usadas} empresas`}</button>`;
  } else {
    botao = `<button class="btn block" data-plano="${plano.id}">${atual ? 'Mudar para este plano' : 'Assinar'}</button>`;
  }

  const porEmpresa = plano.empresas > 1 ? `${moeda(plano.preco / plano.empresas)} por empresa` : 'Ideal para começar';
  return `
    <article class="plano ${plano.destaque ? 'destaque' : ''} ${plano.id === atual?.id ? 'atual' : ''}">
      ${plano.destaque ? '<span class="tag">Mais escolhido</span>' : ''}
      <h3>${esc(plano.nome)}</h3>
      <p class="empresas">${rotuloEmpresas(plano.empresas)}</p>
      <p class="preco"><b>${moeda(plano.preco)}</b><span>/mês</span></p>
      <p class="por">${porEmpresa}</p>
      ${botao}
    </article>`;
}

// Plano personalizado: a pessoa escolhe a quantidade de empresas (4 ou mais)
function cartaoPersonalizado({ modo, atual, usadas = 0, exigeVaga }) {
  const p = estado.personalizado;
  const minimo = modo === 'publico' ? p.minimo : Math.max(p.minimo, usadas + (exigeVaga ? 1 : 0));
  const atualN = atual?.personalizado ? atual.empresas : null;
  const inicial = Math.min(p.maximo, atualN && atualN >= minimo ? atualN : minimo);

  return `
    <article class="plano personalizado" data-modo="${modo}" data-tem-plano="${atual ? 1 : 0}"
             data-min="${minimo}" data-max="${p.maximo}" data-atual="${atualN ?? ''}">
      <h3>${esc(p.nome)}</h3>
      <p class="empresas">${p.minimo} ou mais empresas</p>
      <div class="qtd">
        <label for="qtd">Quantas empresas?</label>
        <div class="stepper">
          <button type="button" data-delta="-1" aria-label="Menos uma empresa">−</button>
          <input type="number" id="qtd" inputmode="numeric" min="${minimo}" max="${p.maximo}" value="${inicial}">
          <button type="button" data-delta="1" aria-label="Mais uma empresa">+</button>
        </div>
      </div>
      <p class="preco"><b id="precoPers">${moeda(inicial * p.preco_por_empresa)}</b><span>/mês</span></p>
      <p class="por">${moeda(p.preco_por_empresa)} por empresa</p>
      <button class="btn block" data-personalizado>Contratar</button>
    </article>`;
}

export function htmlPlanos(opcoes) {
  return `
    <div class="planos">
      ${estado.planos.map((p) => cartao(p, opcoes)).join('')}
      ${estado.personalizado ? cartaoPersonalizado(opcoes) : ''}
    </div>
    <div class="incluso">
      <h3>Todos os planos incluem</h3>
      <ul>
        <li>Funcionários ilimitados</li>
        <li>Chamados ilimitados</li>
        <li>Setores personalizados em cada empresa</li>
        <li>Painel com chamados por semana e por mês</li>
        <li>Níveis de urgência e acompanhamento de status</li>
        <li>Logotipo da sua empresa em todas as telas</li>
      </ul>
    </div>
    ${estado.modoTeste ? '<p class="aviso-teste">Modo de teste: o plano é ativado sem cobrança.</p>' : ''}`;
}

// Liga os botões dos cartões. aoEscolher recebe o plano escolhido (no personalizado, já com a quantidade).
export function ligarCartoes(container, aoEscolher) {
  $$('button[data-plano]', container).forEach((botao) =>
    botao.addEventListener('click', () => aoEscolher(estado.planos.find((p) => p.id === botao.dataset.plano))));

  const cartaoPers = $('.plano.personalizado', container);
  if (cartaoPers) ligarPersonalizado(cartaoPers, aoEscolher);
}

function ligarPersonalizado(cartaoPers, aoEscolher) {
  const p = estado.personalizado;
  const campo = $('#qtd', cartaoPers), botao = $('button[data-personalizado]', cartaoPers), preco = $('#precoPers', cartaoPers);
  const minimo = Number(cartaoPers.dataset.min), maximo = Number(cartaoPers.dataset.max);
  const atualN = cartaoPers.dataset.atual ? Number(cartaoPers.dataset.atual) : null;
  const publico = cartaoPers.dataset.modo === 'publico';
  const temPlano = cartaoPers.dataset.temPlano === '1';

  // quantidade válida (dentro do mínimo e do máximo), mesmo que o campo esteja vazio ou fora dos limites
  const quantidade = () => Math.min(maximo, Math.max(minimo, parseInt(campo.value, 10) || minimo));

  function atualizar() {
    const n = quantidade();
    preco.textContent = moeda(n * p.preco_por_empresa);
    botao.disabled = !publico && n === atualN;
    botao.textContent = publico ? 'Começar com este plano' : n === atualN ? 'Plano atual' : temPlano ? 'Mudar para este plano' : 'Contratar';
    botao.classList.toggle('ghost', botao.disabled);
  }

  campo.addEventListener('input', atualizar);
  campo.addEventListener('change', () => { campo.value = quantidade(); atualizar(); });
  $$('.stepper button', cartaoPers).forEach((b) => b.addEventListener('click', () => {
    campo.value = Math.min(maximo, Math.max(minimo, quantidade() + Number(b.dataset.delta)));
    atualizar();
  }));
  botao.addEventListener('click', () => {
    const n = quantidade();
    aoEscolher({ id: p.id, nome: p.nome, empresas: n, preco: n * p.preco_por_empresa, personalizado: true });
  });
  atualizar();
}

// Pede confirmação e ativa o plano. Retorna true se deu certo.
export async function assinarPlano(plano) {
  const base = `Você terá até ${rotuloEmpresas(plano.empresas)} por ${moeda(plano.preco)}/mês.`;
  const mensagem = estado.modoTeste ? `${base} Modo de teste: nenhuma cobrança será feita agora.` : `${base} A cobrança é mensal.`;
  if (!(await confirmar(`Ativar o plano ${plano.nome}?`, mensagem, 'Ativar plano', false))) return false;

  try {
    const dados = await api('/assinatura', {
      method: 'POST',
      body: { plano_id: plano.id, empresas: plano.personalizado ? plano.empresas : undefined },
    });
    estado.usuario = dados.usuario;
    estado.plano = dados.plano;
    toast(`Plano ${dados.plano.nome} ativado!`);
    return true;
  } catch (e) {
    toast(e.message, true);
    return false;
  }
}

/* ---------- Escolha de plano (administrador logado) ---------- */
export async function telaEscolherPlano() {
  try { await carregarPlanos(); } catch (e) { toast(e.message, true); }
  const jaTemEmpresas = estado.empresas.length > 0;

  $('#app').innerHTML = layoutPublico({
    acoes: jaTemEmpresas && estado.plano
      ? '<button class="btn ghost-dark sm" id="voltar">Voltar</button>'
      : '<button class="btn ghost-dark sm" id="sair">Sair</button>',
    conteudo: `
      <h1>Escolha seu plano</h1>
      <p class="lead">${esc(estado.avisoPlano) || 'Escolha quantas empresas você vai atender. Você pode mudar de plano quando quiser.'}</p>
      ${htmlPlanos({ modo: 'admin', atual: estado.plano, usadas: estado.empresas.length, exigeVaga: !!estado.avisoPlano })}`,
  });

  $('#sair')?.addEventListener('click', sair);
  $('#voltar')?.addEventListener('click', () => { estado.escolhendoPlano = false; estado.avisoPlano = ''; rotear(); });

  ligarCartoes($('#app'), async (plano) => {
    if (!(await assinarPlano(plano))) return;
    estado.escolhendoPlano = false;
    estado.avisoPlano = '';
    // se veio de "+ Nova empresa" e agora há vaga, já abre o cadastro da empresa
    estado.criandoEmpresa = estado.empresas.length > 0 && estado.empresas.length < plano.empresas;
    rotear();
  });
}

/* ---------- Aba "Plano e preços" do painel ---------- */
export async function viewPlano() {
  const main = $('#main');
  main.innerHTML = '<header class="page-h"><h1>Plano e preços</h1></header><p class="muted">Carregando…</p>';
  try { await carregarPlanos(); } catch (e) { main.innerHTML = `<p class="vazio">${esc(e.message)}</p>`; return; }
  if (estado.abaAdmin !== 'plano') return;

  const plano = estado.plano, usadas = estado.empresas.length;
  main.innerHTML = `
    <header class="page-h"><h1>Plano e preços</h1><p class="muted">Mude de plano quando precisar de mais empresas</p></header>
    <div class="resumo">
      <div><b>${esc(plano.nome)}</b><span>Seu plano</span></div>
      <div><b>${usadas} de ${plano.empresas}</b><span>Empresas em uso</span></div>
      <div><b>${moeda(plano.preco)}</b><span>Por mês</span></div>
    </div>
    <h2 class="sec-t">Planos disponíveis</h2>
    ${htmlPlanos({ modo: 'admin', atual: plano, usadas })}`;

  ligarCartoes(main, async (novo) => {
    if (await assinarPlano(novo)) rotear(); // redesenha o painel já com o novo plano
  });
}
