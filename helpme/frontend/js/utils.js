// Funções de apoio usadas em várias telas
export const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
export const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

// Escapa HTML para nunca exibir texto digitado pelo usuário como código
export const esc = (valor) =>
  String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const fmtData = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// <option> para cada item de um objeto { chave: { label } }
export const opcoes = (objeto) =>
  Object.entries(objeto).map(([chave, v]) => `<option value="${chave}">${esc(v.label ?? v)}</option>`).join('');

// 35 -> "R$ 35"   32.5 -> "R$ 32,50"
export const moeda = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number.isInteger(valor) ? 0 : 2 });

export const marca = (classe = '') =>
  `<svg class="${classe}" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" fill="none" stroke="#FFB41F" stroke-width="6" stroke-dasharray="13 8.5" transform="rotate(-20 16 16)"/></svg>`;

// Mensagem rápida no canto da tela
export function toast(mensagem, erro = false) {
  const el = document.createElement('div');
  el.className = 'toast' + (erro ? ' erro' : '');
  el.textContent = mensagem;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 3500);
}

// Janela de confirmação. Retorna uma Promise com true (confirmou) ou false.
// perigo = true deixa o botão vermelho (usado em exclusões)
export function confirmar(titulo, mensagem, rotulo = 'Confirmar', perigo = true) {
  const dlg = $('#dlg');
  $('#dlg-titulo').textContent = titulo;
  $('#dlg-msg').textContent = mensagem;
  $('#dlg-ok').textContent = rotulo;
  $('#dlg-ok').className = perigo ? 'btn danger' : 'btn';

  return new Promise((resolve) => {
    dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok'), { once: true });
    dlg.returnValue = 'cancelar';
    dlg.showModal();
  });
}

export async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    // plano B para navegadores sem permissão de área de transferência
    const campo = document.createElement('textarea');
    campo.value = texto;
    document.body.append(campo);
    campo.select();
    document.execCommand('copy');
    campo.remove();
  }
  toast('Código copiado!');
}

// Lê a imagem escolhida e reduz para no máximo 256px (fica leve no banco)
export function lerLogo(arquivo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      const largura = img.naturalWidth || 256, altura = img.naturalHeight || 256;
      const escala = Math.min(1, 256 / Math.max(largura, altura));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(largura * escala));
      canvas.height = Math.max(1, Math.round(altura * escala));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Não foi possível ler essa imagem.'));
    img.src = url;
  });
}
