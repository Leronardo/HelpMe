import { estado } from './estado.js';

export async function api(caminho, { method = 'GET', body } = {}) {
  const cabecalhos = { 'Content-Type': 'application/json' };
  if (estado.token) cabecalhos.Authorization = 'Bearer ' + estado.token;

  const resposta = await fetch('/api' + caminho, {
    method,
    headers: cabecalhos,
    body: body ? JSON.stringify(body) : undefined,
  });

  let dados = null;
  try { dados = await resposta.json(); } catch {  }

  if (!resposta.ok) {
    if (resposta.status === 401 && estado.token) window.dispatchEvent(new Event('sessao-expirada'));
    throw new Error(dados?.erro || 'Algo deu errado. Tente novamente.');
  }
  return dados;
}
