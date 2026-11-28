import { logoPorId } from './logos.js';
import { logoImg } from './ui.js';
import { $, $$, lerLogo } from './utils.js';

export function ligarLogo(aoDefinir, seletorErro) {
  $('#logo').addEventListener('change', async (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;
    try {
      const src = await lerLogo(arquivo);
      mostrar(src);
      marcar(null);
      $('#logoTxt').textContent = arquivo.name;
      limparErro(seletorErro);
      aoDefinir(src);
    } catch (e) {
      $(seletorErro).textContent = e.message;
    }
  });

  $$('[data-logo]').forEach((botao) => {
    botao.addEventListener('click', () => {
      const logo = logoPorId(botao.dataset.logo);
      mostrar(logo.src);
      marcar(logo.id);
      $('#logoTxt').textContent = logo.nome;
      $('#logo').value = '';
      limparErro(seletorErro);
      aoDefinir(logo.src);
    });
  });
}

function mostrar(src) {
  const prev = $('#prev');
  if (prev.tagName === 'IMG') {
    prev.src = src;
    return;
  }
  const img = document.createElement('img');
  img.className = logoImg;
  img.id = 'prev';
  img.alt = 'Prévia do logotipo';
  img.src = src;
  prev.replaceWith(img);
}

function marcar(id) {
  $$('[data-logo]').forEach((botao) => {
    botao.setAttribute('aria-pressed', String(botao.dataset.logo === id));
  });
}

function limparErro(seletor) {
  const erro = $(seletor);
  if (erro) erro.textContent = '';
}
