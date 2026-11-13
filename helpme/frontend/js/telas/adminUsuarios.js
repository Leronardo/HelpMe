// Aba "Usuários": tabela dos funcionários da empresa, com exclusão
import { api } from '../api.js';
import { estado } from '../estado.js';
import { $, $$, esc, fmtData, toast, confirmar } from '../utils.js';

export async function viewUsuarios() {
  const main = $('#main');
  main.innerHTML = '<header class="page-h"><h1>Usuários</h1></header><p class="muted">Carregando…</p>';

  try {
    const { usuarios } = await api(`/empresas/${estado.empresaId}/usuarios`);
    if (estado.abaAdmin !== 'usuarios') return; // o usuário já trocou de aba

    const total = `${usuarios.length} ${usuarios.length === 1 ? 'funcionário' : 'funcionários'} nesta empresa`;
    main.innerHTML = `
      <header class="page-h"><h1>Usuários</h1><p class="muted">${total}</p></header>
      <div class="tabela-wrap">${usuarios.length ? `
        <table class="tab">
          <thead><tr><th>Nome</th><th>E-mail</th><th class="num">Chamados</th><th>Cadastro</th><th></th></tr></thead>
          <tbody>${usuarios.map((u) => `
            <tr>
              <td><b>${esc(u.nome)}</b></td><td>${esc(u.email)}</td><td class="num">${u.chamados}</td><td>${fmtData(u.criado_em)}</td>
              <td><button class="btn danger sm" data-id="${u.id}" data-nome="${esc(u.nome)}">Excluir</button></td>
            </tr>`).join('')}
          </tbody>
        </table>` : '<p class="vazio">Ainda não há funcionários. Compartilhe o código da empresa para eles criarem a conta.</p>'}
      </div>`;

    $$('button[data-id]', main).forEach((botao) => botao.addEventListener('click', () => excluirUsuario(botao)));
  } catch (e) {
    main.innerHTML = `<header class="page-h"><h1>Usuários</h1></header><p class="vazio">${esc(e.message)}</p>`;
  }
}

async function excluirUsuario(botao) {
  const confirmou = await confirmar(
    `Excluir ${botao.dataset.nome}?`,
    'A conta e todos os chamados abertos por este funcionário serão removidos. Esta ação não pode ser desfeita.',
    'Excluir'
  );
  if (!confirmou) return;

  try {
    await api(`/empresas/${estado.empresaId}/usuarios/${botao.dataset.id}`, { method: 'DELETE' });
    toast('Usuário excluído.');
    viewUsuarios();
  } catch (e) {
    toast(e.message, true);
  }
}
