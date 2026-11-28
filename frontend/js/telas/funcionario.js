import { api } from '../api.js';
import { estado } from '../estado.js';
import { NIVEIS, STATUS } from '../constantes.js';
import { carregarMe, empresaAtual, selecionarEmpresa, sair } from '../sessao.js';
import { $, esc, fmtData, toast } from '../utils.js';
import { htmlTutorial, bannerTutorial } from './tutorial.js';
import {
  campoHtml, classesBotao, dialogAcoes, dialogCls, dialogTexto, dialogTitulo,
  erroCls, htmlTicket, inputCls, muted, vazio,
} from '../ui.js';

const NIVEL_COR = {
  critico: 'has-[:checked]:border-n-critico has-[:checked]:bg-n-critico-bg has-[:checked]:text-n-critico',
  alto: 'has-[:checked]:border-n-alto has-[:checked]:bg-n-alto-bg has-[:checked]:text-n-alto',
  medio: 'has-[:checked]:border-n-medio has-[:checked]:bg-n-medio-bg has-[:checked]:text-n-medio',
  leve: 'has-[:checked]:border-n-leve has-[:checked]:bg-n-leve-bg has-[:checked]:text-n-leve',
};

export function telaFuncionario() {
  const empresa = empresaAtual();
  const ajuda = estado.funcVista === 'tutorial';
  const btnTopo = 'min-h-10 cursor-pointer rounded-lg border border-[#3A4D66] bg-transparent px-3 py-1.5 text-sm text-[#E8EEF5] hover:bg-[#1F3350]';

  $('#app').innerHTML = `
    <header class="sticky top-0 z-30 bg-ink text-white"><div class="mx-auto flex max-w-[1120px] flex-wrap items-center gap-3.5 px-6 py-3.5">
      <img class="size-11 rounded-[10px] bg-white object-contain p-0.5" src="${esc(empresa.logo)}" alt="Logotipo de ${esc(empresa.nome)}">
      <div>
        <label class="sr-only" for="empSel">Empresa</label>
        <select class="min-h-11 w-auto max-w-[260px] rounded-lg border border-[#3A4D66] bg-ink-2 px-2.5 py-1 font-display text-lg font-extrabold text-white" id="empSel">${estado.empresas.map((e) =>
          `<option value="${e.id}" ${e.id === empresa.id ? 'selected' : ''}>${esc(e.nome)}</option>`).join('')}</select>
        <small class="mt-0.5 block font-sans text-[13px] font-normal text-[#9FB0C4]">HelpMe</small>
      </div>
      <div class="ml-auto flex flex-wrap items-center gap-3 text-sm text-[#B9C6D6]">
        <button class="${btnTopo}" id="outraEmp">+ Entrar em outra empresa</button>
        <button class="${btnTopo}" id="ajuda">${ajuda ? 'Voltar aos chamados' : 'Ajuda'}</button>
        <span class="max-[960px]:hidden">${esc(estado.usuario.nome)}</span>
        <button class="${btnTopo}" id="sair">Sair</button>
      </div>
    </div></header>

    ${ajuda ? corpoAjuda() : corpoChamados(empresa)}

    <dialog id="dlgEntrar" class="${dialogCls}">
      <form id="fEntrar" novalidate>
        <h3 class="${dialogTitulo}">Entrar em outra empresa</h3>
        <p class="${dialogTexto}">Digite o código que o supervisor da empresa te passou.</p>
        ${campoHtml('codigo', 'Código da empresa', 'text', 'maxlength="12" autocapitalize="characters" placeholder="Ex.: F23MCG"')}
        <p class="${erroCls}" id="erroEntrar" role="alert"></p>
        <div class="${dialogAcoes}">
          <button type="button" class="${classesBotao({ ghost: true })}" id="cancelarEntrar">Cancelar</button>
          <button class="${classesBotao()}" id="enviarEntrar">Entrar na empresa</button>
        </div>
      </form>
    </dialog>`;
  window.scrollTo(0, 0);

  $('#sair').addEventListener('click', sair);
  $('#ajuda').addEventListener('click', () => { estado.funcVista = ajuda ? 'chamados' : 'tutorial'; telaFuncionario(); });
  $('#empSel').addEventListener('change', trocarEmpresa);
  $('#outraEmp').addEventListener('click', abrirDialogoEntrar);
  $('#cancelarEntrar').addEventListener('click', () => $('#dlgEntrar').close());
  $('#fEntrar').addEventListener('submit', entrarEmOutraEmpresa);

  if (!ajuda) {
    $('#f')?.addEventListener('submit', (evento) => enviarChamado(evento, empresa));
    carregarHistorico(empresa);
  }
}

function corpoAjuda() {
  return `
    <div class="mx-auto max-w-[820px] px-6 py-8 pb-14">
      <h2 class="mb-1 font-display text-[28px]">Como usar o HelpMe</h2>
      <p class="mb-[22px] ${muted}">Passo a passo para abrir e acompanhar seus chamados.</p>
      ${htmlTutorial('funcionario')}
    </div>`;
}

function corpoChamados(empresa) {
  const setores = empresa.setores.map((s) => s.nome);
  const semSetores = !setores.length;

  return `
    ${bannerTutorial('funcionario', () => { estado.funcVista = 'tutorial'; telaFuncionario(); })}
    <div class="mx-auto grid max-w-[1120px] grid-cols-1 items-start gap-8 px-4 py-5 pb-12 min-[961px]:grid-cols-[400px_1fr] min-[961px]:px-6 min-[961px]:py-8 min-[961px]:pb-14">
      <form class="rounded-[14px] border border-line bg-white p-6 max-[960px]:static min-[961px]:sticky min-[961px]:top-5" id="f" novalidate>
        <h2 class="mb-[18px] font-display text-2xl">Abrir chamado</h2>
        ${campoHtml('titulo', 'Título', 'text', 'maxlength="120" placeholder="Resuma o problema"')}
        <label class="mb-4 block"><span class="mb-1.5 block text-[13.5px] font-semibold">Setor</span>
          <select class="${inputCls}" name="setor" ${semSetores ? 'disabled' : ''}>${setores.map((nome) => `<option>${esc(nome)}</option>`).join('')}</select></label>
        ${semSetores ? `<p class="${erroCls}">Esta empresa ainda não tem setores. Avise o supervisor.</p>` : ''}
        <fieldset class="mb-1.5 grid grid-cols-1 gap-2 border-0 p-0 min-[521px]:grid-cols-2">
          <legend class="mb-1.5 p-0 text-[13.5px] font-semibold">Nível do chamado</legend>
          ${Object.entries(NIVEIS).map(([chave, n]) => `
            <label class="relative block cursor-pointer rounded-[10px] border-2 border-line px-2.5 py-2 ${NIVEL_COR[chave]}">
              <input class="absolute inset-0 cursor-pointer opacity-0" type="radio" name="nivel" value="${chave}" ${chave === 'leve' ? 'checked' : ''}>
              <b class="block">${n.label}</b><small class="block text-[12px] leading-snug text-muted">${n.dica}</small>
            </label>`).join('')}
        </fieldset>
        <label class="mt-3.5 mb-4 block"><span class="mb-1.5 block text-[13.5px] font-semibold">Descrição</span>
          <textarea class="${inputCls} min-h-24 resize-y" name="descricao" maxlength="2000" placeholder="Conte o que aconteceu, quando começou e o que você já tentou."></textarea></label>
        <p class="${erroCls}" id="erro" role="alert"></p>
        <button class="${classesBotao({ block: true })}" id="enviar" ${semSetores ? 'disabled' : ''}>Enviar chamado</button>
      </form>

      <section>
        <div class="mb-4 flex items-baseline gap-3"><h2 class="font-display text-2xl">Meus chamados</h2><span class="${muted}" id="cont"></span></div>
        <ul class="grid list-none gap-3.5 p-0" id="hist"></ul>
      </section>
    </div>`;
}

async function trocarEmpresa(evento) {
  selecionarEmpresa(Number(evento.target.value));
  try { await carregarMe(); } catch {  }
  telaFuncionario();
}

function abrirDialogoEntrar() {
  $('#fEntrar').reset();
  $('#erroEntrar').textContent = '';
  $('#dlgEntrar').showModal();
  $('#fEntrar').codigo.focus();
}

async function entrarEmOutraEmpresa(evento) {
  evento.preventDefault();
  const codigo = evento.target.codigo.value.trim(), erro = $('#erroEntrar'), botao = $('#enviarEntrar');
  erro.textContent = '';
  if (!codigo) { erro.textContent = 'Digite o código da empresa.'; return; }

  botao.disabled = true;
  try {
    const { empresa } = await api('/vinculos', { method: 'POST', body: { codigo } });
    estado.empresas.push(empresa);
    selecionarEmpresa(empresa.id);
    estado.funcVista = 'chamados';
    toast(`Você entrou em ${empresa.nome}!`);
    telaFuncionario();
  } catch (e) {
    erro.textContent = e.message;
    botao.disabled = false;
  }
}

async function enviarChamado(evento, empresa) {
  evento.preventDefault();
  const form = evento.target, erro = $('#erro'), botao = $('#enviar');
  erro.textContent = '';

  if (form.titulo.value.trim().length < 3) { erro.textContent = 'Dê um título ao chamado.'; return; }

  botao.disabled = true;
  try {
    await api('/chamados', {
      method: 'POST',
      body: {
        empresa_id: empresa.id, titulo: form.titulo.value, descricao: form.descricao.value,
        setor: form.setor.value, nivel: form.nivel.value,
      },
    });
    form.reset();
    toast('Chamado enviado!');
    carregarHistorico(empresa);
  } catch (e) {
    erro.textContent = e.message;
  }
  botao.disabled = false;
}

function rodapeObservacoes(c) {
  const itens = (c.observacoes || []).map((o) => `
    <li class="mt-2"><b>${esc(o.autor_nome)}</b> <span class="text-muted">${fmtData(o.criado_em)}</span>
      <p class="whitespace-pre-wrap">${esc(o.texto)}</p></li>`).join('');
  return `<div class="mt-3 border-t border-line pt-3 text-sm text-[#3A4756]"><p class="font-semibold text-ink">Observações</p>${itens || '<p class="mt-1 text-muted">Nenhuma observação ainda.</p>'}</div>`;
}

async function carregarHistorico(empresa) {
  try {
    const { chamados } = await api(`/meus-chamados?empresa=${empresa.id}`);
    if (empresaAtual()?.id !== empresa.id || !$('#hist')) return;

    $('#cont').textContent = `${chamados.length} ${chamados.length === 1 ? 'chamado' : 'chamados'}`;

    $('#hist').innerHTML = chamados.length ? chamados.map((c) => `
      <li>${htmlTicket({
        nivel: c.nivel,
        numero: `#${c.id}`,
        nivelTexto: NIVEIS[c.nivel].label,
        titulo: esc(c.titulo),
        descricao: c.descricao ? esc(c.descricao) : '',
        meta: `<span>Setor: ${esc(c.setor)}</span><span>Aberto em ${fmtData(c.criado_em)}</span><span>Responsável: ${c.responsavel_nome ? esc(c.responsavel_nome) : 'sem responsável'}</span>`,
        rodape: rodapeObservacoes(c),
        statusChave: c.status,
        statusTexto: STATUS[c.status],
      })}</li>`).join('') : `<li class="${vazio}">Você ainda não abriu nenhum chamado nesta empresa.</li>`;
  } catch (e) {
    toast(e.message, true);
  }
}
