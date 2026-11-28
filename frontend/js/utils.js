import { classesBotao, toastCls, toastErroCls } from './ui.js';

export const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
export const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

export const nomeDePessoaValido = (nome) => /^[\p{L} ]+$/u.test(nome);

export const esc = (valor) =>
  String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const fmtData = (iso) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const opcoes = (objeto) =>
  Object.entries(objeto).map(([chave, v]) => `<option value="${chave}">${esc(v.label ?? v)}</option>`).join('');

export const moeda = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number.isInteger(valor) ? 0 : 2 });

export function toast(mensagem, erro = false) {
  const el = document.createElement('div');
  el.className = erro ? toastErroCls : toastCls;
  el.textContent = mensagem;
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 3500);
}

export function confirmar(titulo, mensagem, rotulo = 'Confirmar', perigo = true) {
  const dlg = $('#dlg');
  $('#dlg-titulo').textContent = titulo;
  $('#dlg-msg').textContent = mensagem;
  $('#dlg-ok').textContent = rotulo;
  $('#dlg-ok').className = classesBotao({ danger: perigo });

  return new Promise((resolve) => {
    dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok'), { once: true });
    dlg.returnValue = 'cancelar';
    dlg.showModal();
  });
}

export async function copiar(texto, mensagem = 'Código copiado!') {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const campo = document.createElement('textarea');
    campo.value = texto;
    document.body.append(campo);
    campo.select();
    document.execCommand('copy');
    campo.remove();
  }
  toast(mensagem);
}

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
