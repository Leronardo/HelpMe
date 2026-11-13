// Tela do funcionário: abrir chamado, ver o histórico, trocar de empresa e ver a ajuda
import { api } from '../api.js';
import { estado } from '../estado.js';
import { NIVEIS, STATUS } from '../constantes.js';
import { carregarMe, empresaAtual, selecionarEmpresa, sair } from '../sessao.js';
import { $, esc, fmtData, toast } from '../utils.js';
import { htmlTutorial, bannerTutorial } from './tutorial.js';

export function telaFuncionario() {
  const empresa = empresaAtual();
  const ajuda = estado.funcVista === 'tutorial';

  $('#app').innerHTML = `
    <header class="topo"><div class="topo-in">
      <img src="${esc(empresa.logo)}" alt="Logotipo de ${esc(empresa.nome)}">
      <div class="tit">
        <label class="sr" for="empSel">Empresa</label>
        <select id="empSel">${estado.empresas.map((e) =>
          `<option value="${e.id}" ${e.id === empresa.id ? 'selected' : ''}>${esc(e.nome)}</option>`).join('')}</select>
        <small>HelpMe</small>
      </div>
      <div class="dir">
        <button id="outraEmp">+ Entrar em outra empresa</button>
        <button id="ajuda">${ajuda ? 'Voltar aos chamados' : 'Ajuda'}</button>
        <span>${esc(estado.usuario.nome)}</span>
        <button id="sair">Sair</button>
      </div>
    </div></header>

    ${ajuda ? corpoAjuda() : corpoChamados(empresa)}

    <dialog id="dlgEntrar">
      <form id="fEntrar" novalidate>
        <h3>Entrar em outra empresa</h3>
        <p>Digite o código que o administrador da empresa te passou.</p>
        <label class="campo"><span>Código da empresa</span>
          <input type="text" name="codigo" maxlength="12" autocapitalize="characters" placeholder="Ex.: F23MCG" required></label>
        <p class="erro" id="erroEntrar" role="alert"></p>
        <div class="dlg-acoes">
          <button type="button" class="btn ghost" id="cancelarEntrar">Cancelar</button>
          <button class="btn" id="enviarEntrar">Entrar na empresa</button>
        </div>
      </form>
    </dialog>`;

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
    <div class="func-tut">
      <h2>Como usar o HelpMe</h2>
      <p class="muted">Passo a passo para abrir e acompanhar seus chamados.</p>
      ${htmlTutorial('funcionario')}
    </div>`;
}

function corpoChamados(empresa) {
  const setores = empresa.setores.map((s) => s.nome);
  const semSetores = !setores.length;

  return `
    ${bannerTutorial('funcionario', () => { estado.funcVista = 'tutorial'; telaFuncionario(); })}
    <div class="func">
      <form class="novo" id="f" novalidate>
        <h2>Abrir chamado</h2>
        <label class="campo"><span>Título</span><input type="text" name="titulo" maxlength="120" placeholder="Resuma o problema" required></label>
        <label class="campo"><span>Setor</span>
          <select name="setor" ${semSetores ? 'disabled' : ''}>${setores.map((nome) => `<option>${esc(nome)}</option>`).join('')}</select></label>
        ${semSetores ? '<p class="erro">Esta empresa ainda não tem setores. Avise o administrador.</p>' : ''}
        <fieldset class="niveis">
          <legend>Nível do chamado</legend>
          ${Object.entries(NIVEIS).map(([chave, n]) => `
            <label class="l-${chave}">
              <input type="radio" name="nivel" value="${chave}" ${chave === 'leve' ? 'checked' : ''}>
              <span class="op"><b>${n.label}</b><small>${n.dica}</small></span>
            </label>`).join('')}
        </fieldset>
        <label class="campo" style="margin-top:14px"><span>Descrição</span>
          <textarea name="descricao" maxlength="2000" placeholder="Conte o que aconteceu, quando começou e o que você já tentou."></textarea></label>
        <p class="erro" id="erro" role="alert"></p>
        <button class="btn block" id="enviar" ${semSetores ? 'disabled' : ''}>Enviar chamado</button>
      </form>

      <section>
        <div class="hist-h"><h2>Meus chamados</h2><span class="muted" id="cont"></span></div>
        <ul class="tickets" id="hist"></ul>
      </section>
    </div>`;
}

/* ---------- Trocar / entrar em empresas ---------- */
async function trocarEmpresa(evento) {
  selecionarEmpresa(Number(evento.target.value));
  try { await carregarMe(); } catch { /* usa os dados que já estão na memória */ } // atualiza os setores
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

/* ---------- Chamados ---------- */
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

async function carregarHistorico(empresa) {
  try {
    const { chamados } = await api(`/meus-chamados?empresa=${empresa.id}`);
    if (empresaAtual()?.id !== empresa.id || !$('#hist')) return; // trocou de empresa/tela enquanto carregava

    $('#cont').textContent = `${chamados.length} ${chamados.length === 1 ? 'chamado' : 'chamados'}`;

    // cada chamado é desenhado como um "bilhete"
    $('#hist').innerHTML = chamados.length ? chamados.map((c) => `
      <li class="ticket n-${c.nivel}">
        <div class="stub"><span class="num">#${c.id}</span><span class="lvl">${NIVEIS[c.nivel].label}</span></div>
        <div class="tbody">
          <h3>${esc(c.titulo)}</h3>
          ${c.descricao ? `<p>${esc(c.descricao)}</p>` : ''}
          <div class="meta"><span>Setor: ${esc(c.setor)}</span><span>Aberto em ${fmtData(c.criado_em)}</span></div>
        </div>
        <span class="badge s-${c.status}">${STATUS[c.status]}</span>
      </li>`).join('') : '<li class="vazio">Você ainda não abriu nenhum chamado nesta empresa.</li>';
  } catch (e) {
    toast(e.message, true);
  }
}
