import { LOGOS } from './logos.js';

const baseBotao = 'inline-flex cursor-pointer items-center justify-center rounded-lg border font-semibold transition duration-200 ease-out active:translate-y-px disabled:cursor-wait disabled:opacity-55';

export function classesBotao({ ghost = false, danger = false, beacon = false, dark = false, small = false, block = false } = {}) {
  const cor = danger ? 'border-transparent bg-danger text-white hover:-translate-y-px hover:bg-[#9C2830]'
    : beacon ? 'border-transparent bg-beacon text-ink hover:-translate-y-px hover:bg-[#FFC24D]'
    : dark ? 'border-[#3A4D66] bg-transparent text-[#E8EEF5] hover:bg-[#1F3350]'
    : ghost ? 'border-line bg-transparent text-inherit hover:bg-[#E3E8ED]'
    : 'border-transparent bg-ink text-white hover:-translate-y-px hover:bg-ink-2';
  const tamanho = small ? 'min-h-10 px-3 py-1.5 text-[13px]' : 'min-h-11 px-[18px] py-2.5';
  return [baseBotao, cor, tamanho, block && 'w-full'].filter(Boolean).join(' ');
}

export const inputCls = 'min-h-11 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-inherit outline-none transition duration-200 focus:border-ink focus:outline-[3px] focus:outline-offset-0 focus:outline-beacon';
export const selectEscuro = 'w-full rounded-lg border border-[#3A4D66] bg-ink-2 px-3 py-2.5 text-white';
export const muted = 'text-muted';
export const erroCls = 'mb-2.5 min-h-[1.4em] text-sm font-semibold text-danger';
export const vazio = 'px-5 py-10 text-center text-muted';
export const link = 'cursor-pointer border-0 bg-transparent p-0 font-bold text-ink underline underline-offset-[3px]';
export const linkEscuro = 'cursor-pointer justify-self-start border-0 bg-transparent p-0 text-[13px] text-[#E8EEF5] underline underline-offset-[3px]';

export const dialogCls = 'm-auto w-[calc(100%-2rem)] max-w-[420px] rounded-[14px] border-0 p-6 shadow-[0_20px_60px_rgba(15,28,46,.35)] backdrop:bg-ink/55';
export const dialogTitulo = 'mb-2 font-display text-[22px]';
export const dialogTexto = 'mb-5 text-[#3A4756]';
export const dialogAcoes = 'flex justify-end gap-2.5';

export const toastCls = 'animate-[entra_.2s_ease-out] rounded-[10px] bg-ink px-4 py-2.5 font-semibold text-white shadow-[0_6px_20px_rgba(15,28,46,.25)] motion-reduce:animate-none';
export const toastErroCls = 'animate-[entra_.2s_ease-out] rounded-[10px] bg-danger px-4 py-2.5 font-semibold text-white shadow-[0_6px_20px_rgba(15,28,46,.25)] motion-reduce:animate-none';

export const tabelaWrap = 'overflow-x-auto rounded-[10px] border border-line bg-white';
export const tabela = 'w-full min-w-[720px] border-collapse [&_tr:last-child_td]:border-b-0';
export const th = 'border-b border-line bg-[#F7F9FA] px-3.5 py-3 text-left text-[13px] font-semibold whitespace-nowrap text-muted';
export const thNum = `${th} text-right`;
export const td = 'border-b border-[#E8ECF0] px-3.5 py-3 align-top';
export const tdNum = `${td} text-right tabular-nums`;

export const resumo = 'grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] overflow-hidden rounded-[10px] border border-line bg-white';
export const resumoItem = 'border-r border-line px-[18px] py-4 last:border-r-0';
export const resumoNum = 'block font-display text-[34px] leading-none';

export const bloco = 'mb-5 max-w-[640px] rounded-[14px] border border-line bg-white p-6';
export const logoUp = 'relative mb-4 flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-line p-3.5 transition duration-200 hover:border-ink focus-within:outline-[3px] focus-within:outline-beacon';
export const logoImg = 'size-16 rounded-lg bg-[#F3F5F7] object-contain';
export const logoCaixa = 'grid size-16 place-items-center rounded-lg bg-[#F3F5F7] text-[28px] text-muted';

export function navBtn(ativo) {
  return `min-h-11 shrink-0 cursor-pointer rounded-lg border-0 px-3 py-2.5 text-left font-semibold whitespace-nowrap transition duration-200 min-[961px]:w-full ${ativo ? 'bg-beacon text-ink' : 'bg-transparent text-[#C9D5E3] hover:bg-ink-2'}`;
}

export function cabecalho(titulo, sub = '') {
  const extra = sub ? `<p class="${muted}">${sub}</p>` : '';
  return `<header class="mb-[22px] flex flex-wrap items-baseline gap-3.5"><h1 class="font-display text-[32px]">${titulo}</h1>${extra}</header>`;
}

export function campoHtml(nome, rotulo, tipo = 'text', extra = '') {
  return `<label class="mb-4 block"><span class="mb-1.5 block text-[13.5px] font-semibold">${rotulo}</span><input class="${inputCls}" type="${tipo}" name="${nome}" required ${extra}></label>`;
}

export function htmlLogo({ preview, textoId, texto, rotulo = 'Logotipo' }) {
  return `<label class="${logoUp}">
    ${preview}
    <span><strong class="block">${rotulo}</strong><span class="${muted}" id="${textoId}">${texto}</span></span>
    <input class="sr-only" type="file" id="logo" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml">
  </label>`;
}

export function htmlLogosProntos(atual = '') {
  const botoes = LOGOS.map((logo) => `
    <button type="button" class="grid size-14 cursor-pointer place-items-center rounded-xl border border-line bg-[#F3F5F7] p-1.5 transition hover:border-ink" data-logo="${logo.id}" aria-pressed="${atual === logo.src}" aria-label="${logo.nome}">
      <img class="size-10 object-contain" src="${logo.src}" alt="">
    </button>`).join('');
  return `<div class="mb-4">
    <p class="mb-2 text-[13.5px] font-semibold" id="logos-rotulo">Ou escolha um logotipo pronto</p>
    <div class="grid grid-cols-4 gap-2" role="group" aria-labelledby="logos-rotulo">${botoes}</div>
  </div>`;
}

const COR_NIVEL = { critico: 'bg-n-critico', alto: 'bg-n-alto', medio: 'bg-n-medio', leve: 'bg-n-leve' };
const SEL_NIVEL = { critico: 'bg-n-critico-bg text-n-critico', alto: 'bg-n-alto-bg text-n-alto', medio: 'bg-n-medio-bg text-n-medio', leve: 'bg-n-leve-bg text-n-leve' };
const SEL_STATUS = {
  aberto: 'bg-s-aberto-bg text-s-aberto',
  em_analise: 'bg-s-analise-bg text-s-analise',
  aguardando_recursos: 'bg-s-recurso-bg text-s-recurso',
  concluido: 'bg-s-ok-bg text-s-ok',
};
const selo = 'inline-block rounded-full px-2.5 py-0.5 text-[12.5px] font-bold whitespace-nowrap';

export const badgeNivel = (chave, texto) => `<span class="${selo} ${SEL_NIVEL[chave] || ''}">${texto}</span>`;
export const badgeStatus = (chave, texto) => `<span class="${selo} ${SEL_STATUS[chave] || ''}">${texto}</span>`;

export function selectStatus(status) {
  return `w-auto rounded-full border-0 px-2.5 py-1.5 font-bold ${SEL_STATUS[status] || ''}`;
}

const statusNoTicket = 'self-start mt-3.5 mr-3.5 max-[520px]:col-start-2 max-[520px]:mt-0 max-[520px]:mr-0 max-[520px]:mb-3.5 max-[520px]:ml-4';

export function htmlTicket({ nivel, numero, nivelTexto, titulo, descricao = '', meta = '', statusChave = '', statusTexto = '', hero = false, extra = '', rodape = '' }) {
  const seloStatus = statusChave
    ? `<span class="${selo} ${statusNoTicket} ${SEL_STATUS[statusChave] || ''}">${statusTexto}</span>`
    : '';
  return `<article class="ticket relative grid grid-cols-[96px_1fr_auto] rounded-xl border border-line bg-white text-[#17222F] max-[520px]:grid-cols-[72px_1fr] ${hero ? 'ticket-hero' : ''} ${extra}">
    <div class="${COR_NIVEL[nivel] || 'bg-n-leve'} flex flex-col items-center justify-center gap-0.5 rounded-l-[11px] border-r-2 border-dashed border-white/65 px-2.5 py-3.5 text-center text-white">
      <span class="font-display text-[22px] font-extrabold">${numero}</span>
      <span class="text-[12.5px] font-bold">${nivelTexto}</span>
    </div>
    <div class="min-w-0 px-4 py-3.5">
      <h3 class="mb-1 text-lg wrap-anywhere">${titulo}</h3>
      ${descricao ? `<p class="mb-2 wrap-anywhere whitespace-pre-wrap text-[#3A4756]">${descricao}</p>` : ''}
      ${meta ? `<div class="flex flex-wrap gap-3.5 text-[13px] text-muted">${meta}</div>` : ''}
      ${rodape}
    </div>
    ${seloStatus}
  </article>`;
}

export const marca = (classe = 'size-7') =>
  `<svg class="${classe} shrink-0" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" fill="none" stroke="#FFB41F" stroke-width="6" stroke-dasharray="13 8.5" transform="rotate(-20 16 16)"/></svg>`;

export function layoutComTopo({ acoes = '', conteudo }) {
  return `
    <div class="min-h-screen">
      <header class="bg-ink text-white"><div class="mx-auto flex max-w-[1120px] items-center gap-3 px-6 py-3.5">
        <span class="flex items-center gap-2.5 font-display text-2xl font-extrabold">${marca()}HelpMe</span>
        <div class="ml-auto flex flex-wrap gap-2.5">${acoes}</div>
      </div></header>
      <main class="mx-auto max-w-[1120px] px-6 pt-8 pb-16 min-[521px]:pt-12 min-[521px]:pb-[72px]">${conteudo}</main>
    </div>`;
}
