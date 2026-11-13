// Aba "Chamados" do administrador: lista, filtros e troca de status
import { api } from '../api.js';
import { estado } from '../estado.js';
import { NIVEIS, STATUS } from '../constantes.js';
import { empresaAtual } from '../sessao.js';
import { $, $$, esc, fmtData, opcoes, toast } from '../utils.js';

const opcoesStatus = (atual) =>
  Object.entries(STATUS).map(([chave, nome]) => `<option value="${chave}" ${chave === atual ? 'selected' : ''}>${nome}</option>`).join('');

export function viewChamados() {
  $('#main').innerHTML = `
    <header class="page-h"><h1>Chamados</h1><p class="muted" id="cont"></p></header>
    <div class="filtros">
      <label class="sr" for="q">Buscar</label>
      <input type="search" id="q" placeholder="Buscar por título ou nome do funcionário">
      <label class="sr" for="fNivel">Nível</label>
      <select id="fNivel"><option value="">Todos os níveis</option>${opcoes(NIVEIS)}</select>
      <label class="sr" for="fStatus">Status</label>
      <select id="fStatus"><option value="">Todos os status</option>${opcoes(STATUS)}</select>
      <label class="sr" for="fSetor">Setor</label>
      <select id="fSetor"><option value="">Todos os setores</option>${empresaAtual().setores.map((s) => `<option>${esc(s.nome)}</option>`).join('')}</select>
    </div>
    <div class="tabela-wrap" id="lista"></div>`;

  // a busca espera o usuário parar de digitar (250 ms) antes de consultar
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
    const { chamados } = await api(`/empresas/${estado.empresaId}/chamados?${params}`);
    if (!$('#lista')) return; // o usuário já trocou de aba

    $('#cont').textContent = `${chamados.length} ${chamados.length === 1 ? 'chamado' : 'chamados'}`;
    if (!chamados.length) {
      lista.innerHTML = '<p class="vazio">Nenhum chamado encontrado com esses filtros.</p>';
      return;
    }

    lista.innerHTML = `
      <table class="tab">
        <thead><tr><th>Chamado</th><th>Funcionário</th><th>Setor</th><th>Nível</th><th>Aberto em</th><th>Status</th></tr></thead>
        <tbody>${chamados.map(linhaChamado).join('')}</tbody>
      </table>`;

    $$('select.st', lista).forEach((select) => select.addEventListener('change', () => mudarStatus(select)));
  } catch (e) {
    lista.innerHTML = `<p class="vazio">${esc(e.message)}</p>`;
  }
}

function linhaChamado(c) {
  return `
    <tr>
      <td><details><summary>${esc(c.titulo)}<small>#${c.id}</small></summary>
        <p class="desc">${c.descricao ? esc(c.descricao) : 'Sem descrição.'}</p></details></td>
      <td>${esc(c.usuario_nome)}<br><small>${esc(c.usuario_email)}</small></td>
      <td>${esc(c.setor)}</td>
      <td><span class="badge n-${c.nivel}">${NIVEIS[c.nivel].label}</span></td>
      <td>${fmtData(c.criado_em)}</td>
      <td><select class="st" data-id="${c.id}" data-s="${c.status}" aria-label="Status do chamado ${c.id}">${opcoesStatus(c.status)}</select></td>
    </tr>`;
}

async function mudarStatus(select) {
  const statusAnterior = select.dataset.s;
  select.disabled = true;
  try {
    await api(`/chamados/${select.dataset.id}`, { method: 'PATCH', body: { status: select.value } });
    select.dataset.s = select.value;
    toast(`Chamado #${select.dataset.id}: ${STATUS[select.value]}`);
    // se está filtrando por outro status, o chamado sai da lista
    const filtroStatus = $('#fStatus').value;
    if (filtroStatus && filtroStatus !== select.value) carregarChamados();
  } catch (e) {
    select.value = statusAnterior;
    toast(e.message, true);
  }
  select.disabled = false;
}
