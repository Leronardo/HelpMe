// Login, logout e carregamento dos dados de quem está logado
import { api } from './api.js';
import { estado } from './estado.js';
import { rotear } from './navegacao.js';

export const empresaAtual = () =>
  estado.empresas.find((e) => e.id === estado.empresaId) || estado.empresas[0] || null;

export function selecionarEmpresa(id) {
  estado.empresaId = id;
  localStorage.setItem('helpme_empresa', id);
}

export async function carregarMe() {
  const dados = await api('/me');
  estado.usuario = dados.usuario;
  estado.plano = dados.plano ?? null;
  estado.empresas = dados.empresas;

  // se a empresa salva não existe mais (ou é de outra conta), usa a primeira
  if (!estado.empresas.some((e) => e.id === estado.empresaId)) {
    estado.empresaId = estado.empresas[0]?.id ?? null;
  }
}

export async function iniciarSessao(dados) {
  estado.token = dados.token;
  localStorage.setItem('helpme_token', dados.token);
  await carregarMe();
  rotear();
}

export function sair() {
  localStorage.removeItem('helpme_token');
  Object.assign(estado, {
    token: null, usuario: null, plano: null, empresas: [], empresaNova: null, criandoEmpresa: false,
    escolhendoPlano: false, avisoPlano: '', abaAdmin: 'chamados', funcVista: 'chamados', publico: null,
  });
  rotear();
}
