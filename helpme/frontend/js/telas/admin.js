// Estrutura do painel do administrador: menu lateral + área da aba escolhida
import { estado } from '../estado.js';
import { rotear } from '../navegacao.js';
import { empresaAtual, selecionarEmpresa, sair } from '../sessao.js';
import { $, $$, esc, marca, copiar } from '../utils.js';
import { viewChamados } from './adminChamados.js';
import { viewPainel } from './adminPainel.js';
import { viewUsuarios } from './adminUsuarios.js';
import { viewConfig } from './adminConfig.js';
import { viewPlano } from './planos.js';

const ABAS = {
  chamados: 'Chamados',
  painel: 'Painel',
  usuarios: 'Usuários',
  config: 'Configurar empresa',
  plano: 'Plano e preços',
};
const VIEWS = {
  chamados: viewChamados, painel: viewPainel, usuarios: viewUsuarios,
  config: viewConfig, plano: viewPlano,
};

function abrirAba(aba) {
  estado.abaAdmin = aba;
  $$('.nav button').forEach((b) => b.classList.toggle('on', b.dataset.aba === aba));
  VIEWS[aba]();
}

// "+ Nova empresa": só deixa criar se o plano ainda tiver vaga
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
  const empresa = empresaAtual();

  $('#app').innerHTML = `
    <div class="shell">
      <aside class="side">
        <div class="side-brand">${marca()}<span>HelpMe</span></div>
        <div class="emp">
          <img class="emp-logo" src="${esc(empresa.logo)}" alt="Logotipo de ${esc(empresa.nome)}">
          <label class="sr" for="empSel">Empresa</label>
          <select id="empSel">${estado.empresas.map((e) =>
            `<option value="${e.id}" ${e.id === empresa.id ? 'selected' : ''}>${esc(e.nome)}</option>`).join('')}</select>
          <button class="btn ghost-dark sm" id="novaEmp">+ Nova empresa</button>
        </div>
        <div class="code">
          <span>Código da empresa</span><strong>${esc(empresa.codigo)}</strong>
          <button class="link-dark" id="copiar">Copiar código</button>
        </div>
        <nav class="nav" aria-label="Seções">
          ${Object.entries(ABAS).map(([chave, nome]) =>
            `<button data-aba="${chave}" class="${estado.abaAdmin === chave ? 'on' : ''}">${nome}</button>`).join('')}
        </nav>
        <div class="side-foot"><span title="${esc(estado.usuario.email)}">${esc(estado.usuario.nome)}</span><button id="sair">Sair</button></div>
      </aside>
      <div class="conteudo">
        <main class="main" id="main"></main>
      </div>
    </div>`;

  $('#empSel').addEventListener('change', (evento) => {
    selecionarEmpresa(Number(evento.target.value));
    telaAdmin();
  });
  $('#novaEmp').addEventListener('click', novaEmpresa);
  $('#copiar').addEventListener('click', () => copiar(empresa.codigo));
  $('#sair').addEventListener('click', sair);
  $$('.nav button').forEach((botao) => botao.addEventListener('click', () => abrirAba(botao.dataset.aba)));

  VIEWS[estado.abaAdmin]();
}
