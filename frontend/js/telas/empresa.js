import { api } from '../api.js';
import { estado } from '../estado.js';
import { rotear } from '../navegacao.js';
import { selecionarEmpresa, sair } from '../sessao.js';
import { $, esc, copiar } from '../utils.js';
import { ligarLogo } from '../logoEscolha.js';
import { campoHtml, classesBotao, erroCls, htmlLogo, htmlLogosProntos, logoCaixa, muted } from '../ui.js';

const centro = 'grid min-h-screen place-items-center p-6';
const painel = 'w-full max-w-[480px] rounded-[14px] border border-line bg-white p-8';

export function telaEmpresaForm() {
  estado.logoTemp = null;
  const podeCancelar = estado.empresas.length > 0;

  $('#app').innerHTML = `
    <div class="${centro}">
      <form class="${painel}" id="f" novalidate>
        <h2 class="mb-1.5 font-display text-[28px]">${podeCancelar ? 'Nova empresa' : 'Cadastre sua empresa'}</h2>
        <p class="mb-[22px] ${muted}">Informe o nome e o logotipo. Anexe uma imagem ou escolha uma das opções prontas. Na aba Equipe você cria a conta de cada técnico.</p>
        ${campoHtml('nome', 'Nome da empresa', 'text', 'maxlength="80"')}
        ${htmlLogo({
          preview: `<span class="${logoCaixa}" id="prev">+</span>`,
          textoId: 'logoTxt',
          texto: 'Anexe PNG, JPG, WEBP, GIF ou SVG',
          rotulo: 'Logotipo da empresa',
        })}
        ${htmlLogosProntos()}
        <p class="${erroCls}" id="erro" role="alert"></p>
        <div class="flex gap-2.5">
          <button type="button" class="${classesBotao({ ghost: true, block: true })}" id="voltar">${podeCancelar ? 'Cancelar' : 'Sair'}</button>
          <button class="${classesBotao({ block: true })}" id="enviar">Criar empresa</button>
        </div>
      </form>
    </div>`;
  window.scrollTo(0, 0);
  if (window.matchMedia('(min-width: 961px)').matches) $('input[name=nome]')?.focus();

  ligarLogo((src) => { estado.logoTemp = src; }, '#erro');

  $('#voltar').addEventListener('click', () => {
    if (podeCancelar) { estado.criandoEmpresa = false; rotear(); }
    else sair();
  });

  $('#f').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const nome = evento.target.nome.value.trim(), erro = $('#erro'), botao = $('#enviar');

    if (nome.length < 2) { erro.textContent = 'Informe o nome da empresa.'; return; }
    if (!estado.logoTemp) { erro.textContent = 'Escolha o logotipo da empresa.'; return; }

    botao.disabled = true;
    try {
      const { empresa } = await api('/empresas', { method: 'POST', body: { nome, logo: estado.logoTemp } });
      estado.empresas.push(empresa);
      selecionarEmpresa(empresa.id);
      estado.criandoEmpresa = false;
      estado.empresaNova = empresa;
      rotear();
    } catch (e) {
      erro.textContent = e.message;
      botao.disabled = false;
    }
  });
}

export function telaEmpresaCriada() {
  const empresa = estado.empresaNova;

  $('#app').innerHTML = `
    <div class="${centro}">
      <div class="${painel} text-center">
        <img class="mx-auto size-[84px] rounded-[14px] bg-[#F3F5F7] object-contain p-1.5" src="${esc(empresa.logo)}" alt="">
        <h2 class="mt-3.5 mb-1.5 font-display text-[28px]">${esc(empresa.nome)} está pronta</h2>
        <p class="mb-[22px] ${muted}">Agora crie a conta dos técnicos na aba Equipe. O técnico cadastra os colaboradores. O código abaixo serve para quem já tem conta no HelpMe entrar nesta empresa também.</p>
        <div class="my-5 rounded-xl bg-ink px-2.5 py-[18px] text-center font-display text-[52px] font-extrabold tracking-[.12em] text-beacon" aria-label="Código da empresa">${esc(empresa.codigo)}</div>
        <div class="flex gap-2.5">
          <button class="${classesBotao({ ghost: true, block: true })}" id="copiar">Copiar código</button>
          <button class="${classesBotao({ block: true })}" id="ir">Ir para o painel</button>
        </div>
      </div>
    </div>`;
  window.scrollTo(0, 0);

  $('#copiar').addEventListener('click', () => copiar(empresa.codigo));
  $('#ir').addEventListener('click', () => {
    estado.empresaNova = null;
    estado.abaAdmin = 'chamados';
    rotear();
  });
}
