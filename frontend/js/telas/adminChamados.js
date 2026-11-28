import { api } from '../api.js';
import { estado } from '../estado.js';
import { NIVEIS, STATUS } from '../constantes.js';
import { empresaAtual } from '../sessao.js';
import { $, $$, esc, fmtData, opcoes, toast } from '../utils.js';
import { badgeNivel, cabecalho, inputCls, muted, selectStatus, tabela, tabelaWrap, td, th, vazio } from '../ui.js';

const opcoesStatus = (atual) =>
  Object.entries(STATUS).map(([chave, nome]) => `<option value="${chave}" ${chave === atual ? 'selected' : ''}>${nome}</option>`).join('');

const summary = "cursor-pointer list-none font-semibold before:mr-2 before:inline-block before:text-muted before:content-['▸'] group-open:before:rotate-90 [&::-webkit-details-marker]:hidden";

export function viewChamados() {
  $('#main').innerHTML = `
    ${cabecalho('Chamados', '<span id="cont"></span>')}
    <div class="mb-4 grid grid-cols-1 gap-2.5 min-[521px]:grid-cols-2 min-[961px]:grid-cols-[minmax(220px,2fr)_repeat(3,minmax(130px,1fr))]">
      <label class="sr-only" for="q">Buscar</label>
      <input class="${inputCls} min-[521px]:col-span-2 min-[961px]:col-span-1" type="search" id="q" placeholder="Buscar por título, colaborador ou responsável">
      <label class="sr-only" for="fNivel">Nível</label>
      <select class="${inputCls}" id="fNivel"><option value="">Todos os níveis</option>${opcoes(NIVEIS)}</select>
      <label class="sr-only" for="fStatus">Status</label>
      <select class="${inputCls}" id="fStatus"><option value="">Todos os status</option>${opcoes(STATUS)}</select>
      <label class="sr-only" for="fSetor">Setor</label>
      <select class="${inputCls}" id="fSetor"><option value="">Todos os setores</option>${empresaAtual().setores.map((s) => `<option>${esc(s.nome)}</option>`).join('')}</select>
    </div>
    <div id="lista"></div>`;

  let espera;
  $('#q').addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(carregarChamados, 250); });
  ['#fNivel', '#fStatus', '#fSetor'].forEach((id) => $(id).addEventListener('change', carregarChamados));

  carregarChamados();
}

async function carregarChamados() {
  const params = new URLSearchParams();
  const filtros = { q: $('#q').value.trim(), nivel: $('#fNivel').value, status: $('#fStatus').value, setor: $('#fSetor').value };
  for (const [chave, valor] of Object.entries(filtros)) if (valor) params.set(chave, valor);

  const lista = $('#lista');
  try {
    const { chamados, tecnicos } = await api(`/empresas/${estado.empresaId}/chamados?${params}`);
    if (!$('#lista')) return;

    $('#cont').textContent = `${chamados.length} ${chamados.length === 1 ? 'chamado' : 'chamados'}`;
    $('#cont').className = muted;
    if (!chamados.length) {
      lista.innerHTML = `<p class="${vazio}">Nenhum chamado encontrado com esses filtros.</p>`;
      return;
    }

    lista.innerHTML = `
      <div class="${tabelaWrap}"><table class="${tabela} min-w-[980px]">
        <thead><tr><th class="${th}">Chamado</th><th class="${th}">Colaborador</th><th class="${th}">Setor</th><th class="${th}">Nível</th><th class="${th}">Aberto em</th><th class="${th}">Responsável</th><th class="${th}">Status</th></tr></thead>
        <tbody>${chamados.map((c) => linhaChamado(c, tecnicos)).join('')}</tbody>
      </table></div>`;

    $$('select[data-id]', lista).forEach((select) => select.addEventListener('change', () => mudarStatus(select)));
    $$('select[data-resp]', lista).forEach((select) => select.addEventListener('change', () => mudarResponsavel(select)));
    $$('form[data-obs]', lista).forEach((form) => form.addEventListener('submit', (evento) => enviarObservacao(evento, form)));
  } catch (e) {
    lista.innerHTML = `<p class="${vazio}">${esc(e.message)}</p>`;
  }
}

function opcoesTecnico(tecnicos, atual) {
  const lista = tecnicos.map((t) => `<option value="${t.id}" ${t.id === atual ? 'selected' : ''}>${esc(t.nome)}</option>`).join('');
  return `<option value="" ${atual ? '' : 'selected'}>Sem responsável</option>${lista}`;
}

function blocoObservacoes(c) {
  const itens = (c.observacoes || []).map((o) => `
    <li class="rounded-lg bg-[#F7F9FA] px-3 py-2">
      <p class="text-[13px] font-semibold">${esc(o.autor_nome)} <span class="font-normal text-muted">${fmtData(o.criado_em)}</span></p>
      <p class="mt-1 whitespace-pre-wrap text-[#3A4756]">${esc(o.texto)}</p>
    </li>`).join('');
  return `
    <div class="mt-3 ml-5 max-w-[60ch]">
      <p class="mb-2 text-[13.5px] font-semibold">Observações</p>
      ${itens ? `<ul class="mb-3 grid list-none gap-2 p-0">${itens}</ul>` : `<p class="mb-3 text-sm text-muted">Nenhuma observação ainda.</p>`}
      <form class="grid gap-2" data-obs="${c.id}">
        <label class="sr-only" for="obs${c.id}">Observação do chamado ${c.id}</label>
        <textarea class="${inputCls} min-h-20" id="obs${c.id}" name="texto" maxlength="1000" placeholder="Registre o que foi feito ou o que falta." required></textarea>
        <button class="justify-self-start rounded-lg border border-transparent bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-ink-2">Registrar observação</button>
      </form>
    </div>`;
}

function linhaChamado(c, tecnicos) {
  return `
    <tr>
      <td class="${td}"><details class="group"><summary class="${summary}">${esc(c.titulo)}<small class="ml-2 font-normal text-muted">#${c.id}</small></summary>
        <p class="mt-2 ml-5 max-w-[60ch] whitespace-pre-wrap text-[#3A4756]">${c.descricao ? esc(c.descricao) : 'Sem descrição.'}</p>
        ${blocoObservacoes(c)}</details></td>
      <td class="${td}">${esc(c.usuario_nome)}<br><small class="text-muted">${esc(c.usuario_email)}</small></td>
      <td class="${td}">${esc(c.setor)}</td>
      <td class="${td}">${badgeNivel(c.nivel, NIVEIS[c.nivel].label)}</td>
      <td class="${td}">${fmtData(c.criado_em)}</td>
      <td class="${td}"><select class="max-w-[180px] rounded-lg border border-line bg-white px-2 py-1.5 text-sm" data-resp="${c.id}" data-r="${c.responsavel_id || ''}" aria-label="Responsável do chamado ${c.id}">${opcoesTecnico(tecnicos, c.responsavel_id)}</select></td>
      <td class="${td}"><select class="${selectStatus(c.status)}" data-id="${c.id}" data-s="${c.status}" aria-label="Status do chamado ${c.id}">${opcoesStatus(c.status)}</select></td>
    </tr>`;
}

async function mudarStatus(select) {
  const statusAnterior = select.dataset.s;
  select.disabled = true;
  try {
    await api(`/chamados/${select.dataset.id}`, { method: 'PATCH', body: { status: select.value } });
    select.dataset.s = select.value;
    select.className = selectStatus(select.value);
    toast(`Chamado #${select.dataset.id}: ${STATUS[select.value]}`);
    const filtroStatus = $('#fStatus').value;
    if (filtroStatus && filtroStatus !== select.value) carregarChamados();
  } catch (e) {
    select.value = statusAnterior;
    toast(e.message, true);
  }
  select.disabled = false;
}

async function mudarResponsavel(select) {
  const anterior = select.dataset.r;
  select.disabled = true;
  try {
    await api(`/chamados/${select.dataset.resp}`, {
      method: 'PATCH',
      body: { responsavel_id: select.value ? Number(select.value) : null },
    });
    select.dataset.r = select.value;
    toast(`Chamado #${select.dataset.resp}: responsável atualizado`);
  } catch (e) {
    select.value = anterior;
    toast(e.message, true);
  }
  select.disabled = false;
}

async function enviarObservacao(evento, form) {
  evento.preventDefault();
  const texto = form.texto.value.trim();
  const botao = form.querySelector('button');
  if (texto.length < 2) { toast('Escreva a observação.', true); return; }
  botao.disabled = true;
  try {
    await api(`/chamados/${form.dataset.obs}/observacoes`, { method: 'POST', body: { texto } });
    toast('Observação registrada.');
    carregarChamados();
  } catch (e) {
    toast(e.message, true);
    botao.disabled = false;
  }
}
