// Aba "Painel": resumo e tabelas de chamados por semana e por mês
import { api } from '../api.js';
import { estado } from '../estado.js';
import { $, esc } from '../utils.js';

function tabela(titulo, linhas, rotuloPeriodo) {
  const maior = Math.max(1, ...linhas.map((l) => l.total)); // para o tamanho das barras
  return `
    <h2 class="sec-t">${titulo}</h2>
    <div class="tabela-wrap"><table class="tab">
      <thead><tr>
        <th>${rotuloPeriodo}</th><th class="num">Total</th><th class="num">Crítico</th><th class="num">Alto</th>
        <th class="num">Médio</th><th class="num">Leve</th><th class="num">Concluídos</th><th></th>
      </tr></thead>
      <tbody>${linhas.map((l) => `
        <tr class="${l.atual ? 'atual' : ''}">
          <td>${esc(l.periodo)}${l.atual ? ' <small>(atual)</small>' : ''}</td>
          <td class="num"><b>${l.total}</b></td><td class="num">${l.critico}</td><td class="num">${l.alto}</td>
          <td class="num">${l.medio}</td><td class="num">${l.leve}</td><td class="num">${l.concluidos}</td>
          <td class="barra-wrap"><span class="barra" style="width:${(l.total / maior) * 100}%"></span></td>
        </tr>`).join('')}</tbody>
    </table></div>`;
}

export async function viewPainel() {
  const main = $('#main');
  main.innerHTML = '<header class="page-h"><h1>Painel</h1></header><p class="muted">Carregando…</p>';

  try {
    const { resumo, semanal, mensal } = await api(`/empresas/${estado.empresaId}/stats`);
    if (estado.abaAdmin !== 'painel') return; // o usuário já trocou de aba

    main.innerHTML = `
      <header class="page-h"><h1>Painel</h1><p class="muted">Quantidade de chamados abertos por período</p></header>
      <div class="resumo">
        <div><b>${resumo.total}</b><span>Total de chamados</span></div>
        <div><b>${resumo.abertos}</b><span>Abertos</span></div>
        <div><b>${resumo.em_analise}</b><span>Em análise</span></div>
        <div><b>${resumo.concluidos}</b><span>Concluídos</span></div>
        <div class="crit"><b>${resumo.criticos_pendentes}</b><span>Críticos pendentes</span></div>
      </div>
      ${tabela('Por semana (últimas 8)', semanal, 'Semana')}
      ${tabela('Por mês (últimos 6)', mensal, 'Mês')}`;
  } catch (e) {
    main.innerHTML = `<header class="page-h"><h1>Painel</h1></header><p class="vazio">${esc(e.message)}</p>`;
  }
}
