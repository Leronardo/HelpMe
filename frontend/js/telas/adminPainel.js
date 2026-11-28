import { api } from '../api.js';
import { estado } from '../estado.js';
import { $, esc } from '../utils.js';
import { cabecalho, muted, resumo, resumoItem, resumoNum, tabela, tabelaWrap, td, tdNum, th, thNum, vazio } from '../ui.js';

function tabelaPeriodo(titulo, linhas, rotuloPeriodo) {
  const maior = Math.max(1, ...linhas.map((l) => l.total));
  return `
    <h2 class="mt-[34px] mb-3 text-xl">${titulo}</h2>
    <div class="${tabelaWrap}"><table class="${tabela}">
      <thead><tr>
        <th class="${th}">${rotuloPeriodo}</th><th class="${thNum}">Total</th><th class="${thNum}">Crítico</th><th class="${thNum}">Alto</th>
        <th class="${thNum}">Médio</th><th class="${thNum}">Leve</th><th class="${thNum}">Concluídos</th><th class="${th}"></th>
      </tr></thead>
      <tbody>${linhas.map((l) => `
        <tr class="${l.atual ? 'bg-[#FFF8E8]' : ''}">
          <td class="${td}">${esc(l.periodo)}${l.atual ? ' <small class="text-muted">(atual)</small>' : ''}</td>
          <td class="${tdNum}"><b>${l.total}</b></td><td class="${tdNum}">${l.critico}</td><td class="${tdNum}">${l.alto}</td>
          <td class="${tdNum}">${l.medio}</td><td class="${tdNum}">${l.leve}</td><td class="${tdNum}">${l.concluidos}</td>
          <td class="${td} w-[120px]"><span class="block h-2 min-w-0.5 rounded bg-ink" style="width:${(l.total / maior) * 100}%"></span></td>
        </tr>`).join('')}</tbody>
    </table></div>`;
}

export async function viewPainel() {
  const main = $('#main');
  main.innerHTML = `${cabecalho('Painel')}<p class="${muted}">Carregando…</p>`;

  try {
    const { resumo: numeros, semanal, mensal } = await api(`/empresas/${estado.empresaId}/stats`);
    if (estado.abaAdmin !== 'painel') return;

    const item = (valor, rotulo, extra = '') =>
      `<div class="${resumoItem} ${extra}"><b class="${resumoNum}">${valor}</b><span class="text-[13.5px] text-muted">${rotulo}</span></div>`;

    main.innerHTML = `
      ${cabecalho('Painel', 'Quantidade de chamados abertos por período')}
      <div class="${resumo}">
        ${item(numeros.total, 'Total de chamados')}
        ${item(numeros.abertos, 'Abertos')}
        ${item(numeros.em_analise, 'Em análise')}
        ${item(numeros.aguardando_recursos, 'Aguardando recursos')}
        ${item(numeros.concluidos, 'Concluídos')}
        ${item(numeros.criticos_pendentes, 'Críticos pendentes', '[&_b]:text-n-critico')}
      </div>
      ${tabelaPeriodo('Por semana (últimas 8)', semanal, 'Semana')}
      ${tabelaPeriodo('Por mês (últimos 6)', mensal, 'Mês')}`;
  } catch (e) {
    main.innerHTML = `${cabecalho('Painel')}<p class="${vazio}">${esc(e.message)}</p>`;
  }
}
