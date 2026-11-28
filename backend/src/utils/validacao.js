const texto = (valor, max) => String(valor ?? '').trim().slice(0, max);

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const nomeDePessoaValido = (nome) => /^[\p{L} ]+$/u.test(nome);

const normalizarCodigo = (codigo) => String(codigo || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const LOGO_VALIDA = /^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
const logoValida = (logo) => LOGO_VALIDA.test(logo) && logo.length <= 1_500_000;

function validarSenha(senha) {
  if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (senha.length > 128) return 'A senha pode ter no máximo 128 caracteres.';
  if (!/\p{Lu}/u.test(senha)) return 'A senha precisa de pelo menos uma letra maiúscula.';
  if (!/\p{Ll}/u.test(senha)) return 'A senha precisa de pelo menos uma letra minúscula.';
  if (!/\d/.test(senha)) return 'A senha precisa de pelo menos um número.';
  if (!/[^\p{L}\p{N}\s]/u.test(senha)) return 'A senha precisa de pelo menos um caractere especial (ex.: ! @ # $ %).';
  return null;
}

module.exports = { texto, emailValido, nomeDePessoaValido, normalizarCodigo, logoValida, validarSenha };
