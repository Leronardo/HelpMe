// Aba "Configurar empresa": nome, logotipo e setores
import { api } from '../api.js';
import { estado } from '../estado.js';
import { rotear } from '../navegacao.js';
import { empresaAtual } from '../sessao.js';
import { $, $$, esc, toast, lerLogo } from '../utils.js';

export function viewConfig() {
  const empresa = empresaAtual();
  estado.logoTemp = null; // só envia o logotipo se a pessoa escolher outro

  $('#main').innerHTML = `
    <header class="page-h"><h1>Configurar empresa</h1><p class="muted">${esc(empresa.nome)}</p></header>

    <section class="bloco">
      <h2>Dados da empresa</h2>
      <form id="fEmp" novalidate>
        <label class="campo"><span>Nome da empresa</span>
          <input type="text" name="nome" maxlength="80" value="${esc(empresa.nome)}" required></label>
        <label class="logo-up">
          <img id="prev" src="${esc(empresa.logo)}" alt="Logotipo atual">
          <span><strong>Logotipo</strong><span class="muted" id="logoTxt">Clique para trocar a imagem</span></span>
          <input type="file" id="logo" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml">
        </label>
        <p class="erro" id="erroEmp" role="alert"></p>
        <button class="btn" id="salvar">Salvar alterações</button>
      </form>
    </section>

    <section class="bloco">
      <h2>Setores</h2>
      <p class="muted">Os funcionários escolhem um destes setores ao abrir um chamado. Se você remover um setor, os chamados antigos continuam com o nome dele.</p>
      <ul class="chips" id="setores"></ul>
      <form id="fSet" class="linha-add" novalidate>
        <input type="text" name="nome" maxlength="40" placeholder="Novo setor (ex.: Logística)" aria-label="Nome do novo setor">
        <button class="btn">Adicionar</button>
      </form>
      <p class="erro" id="erroSet" role="alert"></p>
    </section>`;

  desenharSetores();

  $('#logo').addEventListener('change', async (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;
    try {
      estado.logoTemp = await lerLogo(arquivo);
      $('#prev').src = estado.logoTemp;
      $('#logoTxt').textContent = arquivo.name;
      $('#erroEmp').textContent = '';
    } catch (e) {
      $('#erroEmp').textContent = e.message;
    }
  });

  $('#fEmp').addEventListener('submit', salvarEmpresa);
  $('#fSet').addEventListener('submit', adicionarSetor);
}

async function salvarEmpresa(evento) {
  evento.preventDefault();
  const empresa = empresaAtual();
  const nome = evento.target.nome.value.trim(), erro = $('#erroEmp'), botao = $('#salvar');
  erro.textContent = '';

  if (nome.length < 2) { erro.textContent = 'Informe o nome da empresa.'; return; }

  botao.disabled = true;
  try {
    const dados = await api(`/empresas/${empresa.id}`, { method: 'PUT', body: { nome, logo: estado.logoTemp || undefined } });
    estado.empresas = estado.empresas.map((e) => (e.id === empresa.id ? dados.empresa : e));
    toast('Empresa atualizada!');
    rotear(); // redesenha o menu lateral com o novo nome e logotipo
  } catch (e) {
    erro.textContent = e.message;
    botao.disabled = false;
  }
}

function desenharSetores() {
  const { setores } = empresaAtual();
  $('#setores').innerHTML = setores.map((s) => `
    <li class="chip">${esc(s.nome)}
      <button type="button" data-id="${s.id}" aria-label="Remover setor ${esc(s.nome)}">×</button></li>`).join('');

  $$('#setores button').forEach((botao) => botao.addEventListener('click', () => removerSetor(botao.dataset.id)));
}

// Atualiza a lista de setores da empresa na memória e na tela
function aplicarSetores(setores) {
  empresaAtual().setores = setores;
  desenharSetores();
}

async function adicionarSetor(evento) {
  evento.preventDefault();
  const campo = evento.target.nome, erro = $('#erroSet');
  erro.textContent = '';
  if (campo.value.trim().length < 2) { erro.textContent = 'Dê um nome ao setor (mínimo 2 letras).'; return; }

  try {
    const dados = await api(`/empresas/${empresaAtual().id}/setores`, { method: 'POST', body: { nome: campo.value } });
    aplicarSetores(dados.setores);
    campo.value = '';
    campo.focus();
  } catch (e) {
    erro.textContent = e.message;
  }
}

async function removerSetor(id) {
  $('#erroSet').textContent = '';
  try {
    const dados = await api(`/empresas/${empresaAtual().id}/setores/${id}`, { method: 'DELETE' });
    aplicarSetores(dados.setores);
  } catch (e) {
    $('#erroSet').textContent = e.message;
  }
}
