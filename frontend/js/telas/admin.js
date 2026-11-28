import { estado } from '../estado.js';
import { rotear } from '../navegacao.js';
import { empresaAtual, selecionarEmpresa, sair } from '../sessao.js';
import { $, $$, esc, copiar } from '../utils.js';
import { classesBotao, linkEscuro, marca, navBtn, selectEscuro } from '../ui.js';
import { viewChamados } from './adminChamados.js';
import { viewPainel } from './adminPainel.js';
import { viewUsuarios } from './adminUsuarios.js';
import { viewConfig } from './adminConfig.js';
import { viewPlano } from './planos.js';
import { htmlTutorial } from './tutorial.js';

const ABAS = {
  chamados: 'Chamados',
  painel: 'Painel',
  usuarios: 'Equipe',
  config: 'Configurar empresa',
  plano: 'Plano e preços',
};
const ABAS_TECNICO = { chamados: 'Chamados', usuarios: 'Colaboradores' };
const VIEWS = {
  chamados: viewChamados, painel: viewPainel, usuarios: viewUsuarios,
  config: viewConfig, plano: viewPlano,
};

function abrirAba(aba) {
  estado.abaAdmin = aba;
  estado.funcVista = 'chamados';
  $$('[data-aba]').forEach((b) => { b.className = navBtn(b.dataset.aba === aba); });
  VIEWS[aba]();
  if (window.matchMedia('(max-width: 960px)').matches) $('#main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function novaEmpresa() {
  const { plano, empresas } = estado;
  if (empresas.length >= plano.empresas) {
    estado.escolhendoPlano = true;
    estado.avisoPlano = `Seu plano ${plano.nome} permite ${plano.empresas} ${plano.empresas === 1 ? 'empresa' : 'empresas'}. Escolha um plano maior para cadastrar mais uma.`;
  } else {
    estado.criandoEmpresa = true;
  }
  rotear();
}

export function telaAdmin() {
  const tecnico = estado.usuario.perfil === 'tecnico';
  const abas = tecnico ? ABAS_TECNICO : ABAS;
  if (!abas[estado.abaAdmin]) estado.abaAdmin = 'chamados';
  const empresa = empresaAtual();
  const sairCls = 'cursor-pointer rounded-lg border border-[#3A4D66] bg-transparent px-3 py-1 text-[#E8EEF5] hover:bg-[#1F3350]';
  const papel = tecnico ? 'Técnico' : 'Supervisor';

  if (!empresa) {
    $('#app').innerHTML = `
      <div class="grid min-h-screen place-items-center px-6">
        <div class="max-w-md text-center">
          <h1 class="font-display text-3xl">Você não está em nenhuma empresa</h1>
          <p class="mt-3 text-muted">Peça o código ao supervisor e entre de novo por uma conta que ainda tenha vínculo, ou peça para ser adicionado outra vez.</p>
          <button class="mt-6 ${sairCls} min-h-11 bg-ink text-white" id="sair">Sair</button>
        </div>
      </div>`;
    $('#sair').addEventListener('click', sair);
    return;
  }

  $('#app').innerHTML = `
    <div class="min-h-screen min-[961px]:grid min-[961px]:grid-cols-[280px_1fr]">
      <aside class="contents min-[961px]:sticky min-[961px]:top-0 min-[961px]:flex min-[961px]:h-screen min-[961px]:flex-col min-[961px]:gap-5 min-[961px]:overflow-y-auto min-[961px]:bg-ink min-[961px]:p-[22px_18px] min-[961px]:text-[#E8EEF5]">
        <div class="flex items-center gap-2.5 bg-ink px-[18px] pt-4 text-white min-[961px]:bg-transparent min-[961px]:p-0">
          ${marca()}<span class="font-display text-2xl font-extrabold">HelpMe</span>
          <span class="ml-auto max-w-[40%] truncate text-sm text-[#B9C6D6] min-[961px]:hidden" title="${esc(estado.usuario.email)}">${esc(estado.usuario.nome)} · ${papel}</span>
          ${tecnico ? `<button class="${sairCls} min-h-10 min-[961px]:hidden" data-ajuda>${estado.funcVista === 'tutorial' ? 'Voltar' : 'Ajuda'}</button>` : ''}
          <button class="${sairCls} min-h-10 min-[961px]:hidden" id="sairMobile">Sair</button>
        </div>
        <div class="grid gap-2.5 bg-ink px-[18px] pt-4 text-[#E8EEF5] min-[961px]:bg-transparent min-[961px]:p-0">
          <img class="size-14 rounded-xl bg-white object-contain p-1" src="${esc(empresa.logo)}" alt="Logotipo de ${esc(empresa.nome)}">
          <label class="sr-only" for="empSel">Empresa</label>
          <select class="${selectEscuro}" id="empSel">${estado.empresas.map((e) =>
            `<option value="${e.id}" ${e.id === empresa.id ? 'selected' : ''}>${esc(e.nome)}</option>`).join('')}</select>
          ${tecnico ? '' : `<button class="${classesBotao({ dark: true, small: true })} justify-self-start" id="novaEmp">+ Nova empresa</button>`}
        </div>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 bg-ink px-[18px] py-3 text-[#E8EEF5] min-[961px]:grid min-[961px]:gap-0.5 min-[961px]:rounded-[10px] min-[961px]:border min-[961px]:border-[#3A4D66] min-[961px]:bg-transparent min-[961px]:px-3.5 min-[961px]:py-3">
          <span class="text-[12.5px] text-[#9FB0C4]">Código da empresa</span>
          <strong class="font-display text-xl tracking-[.12em] text-beacon min-[961px]:text-[26px]">${esc(empresa.codigo)}</strong>
          <button class="${linkEscuro}" id="copiar">Copiar código</button>
        </div>
        <nav class="sticky top-0 z-30 flex gap-1 overflow-x-auto bg-ink px-3 py-2 min-[961px]:static min-[961px]:grid min-[961px]:overflow-visible min-[961px]:bg-transparent min-[961px]:p-0" aria-label="Seções">
          ${Object.entries(abas).map(([chave, nome]) =>
            `<button data-aba="${chave}" class="${navBtn(estado.abaAdmin === chave)}">${nome}</button>`).join('')}
        </nav>
        <div class="mt-auto hidden items-center justify-between gap-2 text-sm text-[#B9C6D6] min-[961px]:flex">
          <span class="truncate" title="${esc(estado.usuario.email)}">${esc(estado.usuario.nome)}<small class="mt-0.5 block text-[12px] text-[#9FB0C4]">${papel}</small></span>
          <span class="flex gap-2">
            ${tecnico ? `<button class="${sairCls} min-h-10" data-ajuda>${estado.funcVista === 'tutorial' ? 'Voltar' : 'Ajuda'}</button>` : ''}
            <button class="${sairCls} min-h-10" id="sair">Sair</button>
          </span>
        </div>
      </aside>
      <main class="min-w-0 scroll-mt-16 px-4 py-6 pb-12 min-[961px]:px-9 min-[961px]:pt-8 min-[961px]:pb-14" id="main"></main>
    </div>`;

  $('#empSel').addEventListener('change', (evento) => {
    selecionarEmpresa(Number(evento.target.value));
    telaAdmin();
  });
  $('#novaEmp')?.addEventListener('click', novaEmpresa);
  $$('[data-ajuda]').forEach((botao) => botao.addEventListener('click', () => {
    estado.funcVista = estado.funcVista === 'tutorial' ? 'chamados' : 'tutorial';
    telaAdmin();
  }));
  $('#copiar').addEventListener('click', () => copiar(empresa.codigo));
  $('#sair')?.addEventListener('click', sair);
  $('#sairMobile').addEventListener('click', sair);
  $$('[data-aba]').forEach((botao) => botao.addEventListener('click', () => abrirAba(botao.dataset.aba)));

  if (tecnico && estado.funcVista === 'tutorial') {
    $('#main').innerHTML = `
      <h1 class="mb-1 font-display text-[32px]">Como usar o HelpMe</h1>
      <p class="mb-[22px] text-muted">Passo a passo do técnico.</p>
      ${htmlTutorial('tecnico')}`;
    return;
  }
  VIEWS[estado.abaAdmin]();
}
