import { api } from '../api.js';
import { estado } from '../estado.js';
import { rotear } from '../navegacao.js';
import { empresaAtual } from '../sessao.js';
import { ligarLogo } from '../logoEscolha.js';
import { $, $$, esc, toast } from '../utils.js';
import { bloco, cabecalho, campoHtml, classesBotao, erroCls, htmlLogo, htmlLogosProntos, inputCls, logoImg, muted } from '../ui.js';

export function viewConfig() {
  const empresa = empresaAtual();
  estado.logoTemp = null;

  $('#main').innerHTML = `
    ${cabecalho('Configurar empresa', esc(empresa.nome))}

    <section class="${bloco}">
      <h2 class="mb-3.5 text-[22px]">Dados da empresa</h2>
      <form id="fEmp" novalidate>
        ${campoHtml('nome', 'Nome da empresa', 'text', `maxlength="80" value="${esc(empresa.nome)}"`)}
        ${htmlLogo({
          preview: `<img class="${logoImg}" id="prev" src="${esc(empresa.logo)}" alt="Logotipo atual">`,
          textoId: 'logoTxt',
          texto: 'Anexe outra imagem ou escolha uma opção abaixo',
        })}
        ${htmlLogosProntos(empresa.logo)}
        <p class="${erroCls}" id="erroEmp" role="alert"></p>
        <button class="${classesBotao()}" id="salvar">Salvar alterações</button>
      </form>
    </section>

    <section class="${bloco}">
      <h2 class="mb-3.5 text-[22px]">Setores</h2>
      <p class="-mt-1.5 mb-3.5 ${muted}">Os colaboradores escolhem um destes setores ao abrir um chamado. Se você remover um setor, os chamados antigos continuam com o nome dele.</p>
      <ul class="mb-3.5 flex list-none flex-wrap gap-2 p-0" id="setores"></ul>
      <form id="fSet" class="flex flex-col gap-2.5 min-[521px]:flex-row" novalidate>
        <input class="${inputCls}" type="text" name="nome" maxlength="40" placeholder="Novo setor (ex.: Logística)" aria-label="Nome do novo setor">
        <button class="${classesBotao()} shrink-0">Adicionar</button>
      </form>
      <p class="${erroCls} mt-2.5" id="erroSet" role="alert"></p>
    </section>`;

  desenharSetores();

  ligarLogo((src) => { estado.logoTemp = src; }, '#erroEmp');

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
    rotear();
  } catch (e) {
    erro.textContent = e.message;
    botao.disabled = false;
  }
}

function desenharSetores() {
  const { setores } = empresaAtual();
  $('#setores').innerHTML = setores.map((s) => `
    <li class="inline-flex items-center gap-1.5 rounded-full bg-[#E8EDF2] py-1 pr-1.5 pl-3.5 font-semibold">${esc(s.nome)}
      <button type="button" class="grid size-6 cursor-pointer place-items-center rounded-full border-0 bg-[#CBD4DD] p-0 text-base leading-none hover:bg-danger hover:text-white" data-id="${s.id}" aria-label="Remover setor ${esc(s.nome)}">×</button></li>`).join('');

  $$('#setores button').forEach((botao) => botao.addEventListener('click', () => removerSetor(botao.dataset.id)));
}

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
