// Regras da senha de quem cria conta (o backend confere as mesmas regras)
export const REGRAS_SENHA = [
  { texto: 'Pelo menos 8 caracteres', ok: (s) => s.length >= 8 },
  { texto: 'Uma letra maiúscula', ok: (s) => /\p{Lu}/u.test(s) },
  { texto: 'Uma letra minúscula', ok: (s) => /\p{Ll}/u.test(s) },
  { texto: 'Um número', ok: (s) => /\d/.test(s) },
  { texto: 'Um caractere especial (ex.: ! @ # $ %)', ok: (s) => /[^\p{L}\p{N}\s]/u.test(s) },
];

export const senhaForte = (senha) => REGRAS_SENHA.every((regra) => regra.ok(senha));
