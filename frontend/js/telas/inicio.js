import { api } from '../api.js';
import { estado } from '../estado.js';
import { $, $$, esc, moeda } from '../utils.js';
import { telaAuth } from './auth.js';
import { classesBotao, htmlTicket, marca, muted } from '../ui.js';

const cartaoBase = 'cartao relative flex flex-col gap-1 rounded-[14px] bg-white px-5 pt-6 pb-5';
const itemIncluso = (texto) => `<li><span class="mr-2 font-extrabold text-n-leve">✓</span>${texto}</li>`;

const FALLBACK = {
  planos: [
    { id: 'empresa-1', nome: 'Essencial', empresas: 1, preco: 35 },
    { id: 'empresa-2', nome: 'Duplo', empresas: 2, preco: 65, destaque: true },
    { id: 'empresa-3', nome: 'Trio', empresas: 3, preco: 90 },
  ],
  personalizado: { nome: 'Personalizado', minimo: 4, maximo: 50, preco_por_empresa: 28 },
  modo_teste: false,
};

function abrir(modo) {
  estado.auth = { modo, fluxo: '', email: '' };
  telaAuth();
}

function cartaoPreco(plano) {
  const porEmpresa = plano.empresas > 1 ? `${moeda(plano.preco / plano.empresas)} por empresa` : 'Ideal para começar';
  const borda = plano.destaque
    ? 'border-2 border-beacon shadow-[0_8px_24px_rgba(255,180,31,.18)]'
    : 'border border-line';
  return `
    <article class="${cartaoBase} ${borda}">
      ${plano.destaque ? '<span class="absolute -top-3 left-5 rounded-full bg-beacon px-3 py-0.5 text-[12.5px] font-extrabold text-ink">Mais escolhido</span>' : ''}
      <h3 class="text-[22px]">${esc(plano.nome)}</h3>
      <p class="font-bold text-muted">${plano.empresas} ${plano.empresas === 1 ? 'empresa' : 'empresas'}</p>
      <p class="mt-3.5 flex items-baseline gap-1"><b class="font-display text-[44px] leading-none tracking-tight">${moeda(plano.preco)}</b><span class="font-semibold text-muted">/mês</span></p>
      <p class="mt-0.5 text-sm text-muted">${porEmpresa}</p>
    </article>`;
}

function cartaoPersonalizado(p) {
  const exemplo = p.minimo * p.preco_por_empresa;
  return `
    <article class="${cartaoBase} border-2 border-dashed border-line">
      <h3 class="text-[22px]">${esc(p.nome)}</h3>
      <p class="font-bold text-muted">${p.minimo} ou mais empresas</p>
      <p class="mt-3.5 flex items-baseline gap-1"><b class="font-display text-[44px] leading-none tracking-tight">${moeda(exemplo)}</b><span class="font-semibold text-muted">/mês</span></p>
      <p class="mt-0.5 text-sm text-muted">${moeda(p.preco_por_empresa)} por empresa, até ${p.maximo}</p>
    </article>`;
}

function htmlValores(dados) {
  const aviso = dados.modo_teste
    ? '<p class="mt-4 inline-block rounded-lg border border-[#F0D58A] bg-[#FFF4D6] px-3.5 py-2 text-sm font-semibold text-[#7A5A00]">Modo de teste: o plano é ativado sem cobrança.</p>'
    : '<p class="mt-4 text-sm text-muted">O plano é escolhido depois de criar a conta. O acesso libera quando o pagamento for aprovado.</p>';
  return `
    <div class="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] items-stretch gap-4">
      ${dados.planos.map(cartaoPreco).join('')}
      ${dados.personalizado ? cartaoPersonalizado(dados.personalizado) : ''}
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
    ${aviso}
    <div class="mt-8">
      <button type="button" class="${classesBotao({ beacon: true })}" data-ir="criar">Crie sua conta aqui</button>
    </div>`;
}

function passo(numero, titulo, texto) {
  return `
    <article class="rounded-[14px] border border-line bg-white px-5 py-5">
      <p class="font-display text-[32px] leading-none text-beacon">${numero}</p>
      <h3 class="mt-3 text-xl">${titulo}</h3>
      <p class="mt-2 ${muted}">${texto}</p>
    </article>`;
}

export async function telaInicio() {
  $('#app').innerHTML = `
    <div class="min-h-screen">
      <header class="sticky top-0 z-10 bg-ink text-white">
        <div class="mx-auto flex max-w-[1120px] flex-wrap items-center gap-3 px-6 py-3.5">
          <span class="flex items-center gap-2.5 font-display text-2xl font-extrabold">${marca()}HelpMe</span>
          <div class="ml-auto flex flex-wrap gap-2.5">
            <button type="button" class="${classesBotao({ dark: true, small: true })}" data-ir="entrar">Entrar</button>
            <button type="button" class="${classesBotao({ beacon: true, small: true })}" data-ir="criar">Crie sua conta aqui</button>
          </div>
        </div>
      </header>

      <section class="bg-ink text-white">
        <div class="mx-auto grid max-w-[1120px] items-center gap-10 px-6 py-14 min-[961px]:grid-cols-[1.1fr_.9fr] min-[961px]:py-20">
          <div>
            <p class="mb-3 text-sm font-bold tracking-wide text-beacon">Sistema de chamados</p>
            <h1 class="max-w-[14ch] font-display text-[clamp(40px,6vw,68px)] font-extrabold tracking-[-0.04em]">Abra, acompanhe e resolva chamados em um só lugar.</h1>
            <p class="mt-5 max-w-[46ch] text-lg text-[#B9C6D6]">O supervisor cria a conta, escolhe o plano e cadastra os técnicos. O técnico cadastra os colaboradores. O colaborador abre o chamado, e o técnico acompanha status, responsável e observações.</p>
            <div class="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" class="${classesBotao({ beacon: true })}" data-ir="criar">Crie sua conta aqui</button>
              <button type="button" class="${classesBotao({ dark: true })}" data-ir="entrar">Já tenho conta</button>
              <button type="button" class="cursor-pointer border-0 bg-transparent p-0 font-bold text-[#E8EEF5] underline underline-offset-[3px]" id="verValores">Ver os valores</button>
            </div>
          </div>
          ${htmlTicket({
            nivel: 'medio',
            numero: '01',
            nivelTexto: 'Médio',
            titulo: 'Impressora da recepção sem conexão',
            descricao: 'A equipe não consegue imprimir os documentos do dia.',
            meta: '<span>Setor Infraestrutura</span>',
            statusChave: 'em_analise',
            statusTexto: 'Em análise',
            hero: true,
          })}
        </div>
      </section>

      <section class="mx-auto max-w-[1120px] px-6 py-16">
        <h2 class="font-display text-[32px]">Como funciona</h2>
        <p class="mt-2 mb-6 max-w-[52ch] ${muted}">A conta de supervisor é criada nesta página. Técnico e colaborador não se cadastram sozinhos: cada um entra com o e-mail e a senha que recebeu.</p>
        <div class="grid gap-4 min-[761px]:grid-cols-3">
          ${passo('1', 'Crie sua conta', 'Informe nome, e-mail e senha. O nome aceita letras e espaços.')}
          ${passo('2', 'Escolha o plano', 'O plano define quantas empresas você pode ter. Técnicos, colaboradores e chamados não têm limite.')}
          ${passo('3', 'Acompanhe os chamados', 'Cadastre a empresa, crie os técnicos e acompanhe cada pedido por responsável, urgência e status.')}
        </div>
      </section>

      <section id="valores" class="scroll-mt-20 border-t border-line bg-[#F7F9FA]">
        <div class="mx-auto max-w-[1120px] px-6 py-16">
          <h2 class="font-display text-[32px]">Valores</h2>
          <p class="mt-2 mb-8 max-w-[52ch] ${muted}">Preço por mês, conforme a quantidade de empresas. A troca de plano fica disponível depois do cadastro.</p>
          <div id="listaPlanos"><p class="${muted}">Carregando os valores…</p></div>
        </div>
      </section>
    </div>`;

  window.scrollTo(0, 0);
  $$('[data-ir]').forEach((botao) => botao.addEventListener('click', () => abrir(botao.dataset.ir)));
  $('#verValores').addEventListener('click', () => $('#valores').scrollIntoView({ behavior: 'smooth', block: 'start' }));

  let dados = FALLBACK;
  try {
    dados = await api('/planos');
  } catch {
    dados = FALLBACK;
  }
  if (estado.usuario || estado.auth.modo !== 'inicio') return;
  const lista = $('#listaPlanos');
  if (!lista) return;
  lista.innerHTML = htmlValores(dados);
  $$('[data-ir]', lista).forEach((botao) => botao.addEventListener('click', () => abrir(botao.dataset.ir)));
}
