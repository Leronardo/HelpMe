// Funções pequenas para limpar e validar o que o usuário digita
const texto = (valor, max) => String(valor ?? '').trim().slice(0, max);

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

// Deixa o código em maiúsculas e sem espaços/traços
const normalizarCodigo = (codigo) => String(codigo || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// Logotipo enviado como imagem em base64 (até ~1 MB)
const LOGO_VALIDA = /^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
const logoValida = (logo) => LOGO_VALIDA.test(logo) && logo.length <= 1_500_000;

// Regras da senha de quem cria conta: 8+ caracteres, maiúscula, minúscula, número e caractere especial.
// Retorna a mensagem do primeiro problema encontrado, ou null se a senha está boa.
function validarSenha(senha) {
  if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (senha.length > 128) return 'A senha pode ter no máximo 128 caracteres.';
  if (!/\p{Lu}/u.test(senha)) return 'A senha precisa de pelo menos uma letra maiúscula.';
  if (!/\p{Ll}/u.test(senha)) return 'A senha precisa de pelo menos uma letra minúscula.';
  if (!/\d/.test(senha)) return 'A senha precisa de pelo menos um número.';
  if (!/[^\p{L}\p{N}\s]/u.test(senha)) return 'A senha precisa de pelo menos um caractere especial (ex.: ! @ # $ %).';
  return null;
}

module.exports = { texto, emailValido, normalizarCodigo, logoValida, validarSenha };
