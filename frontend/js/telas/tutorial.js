// Tutorial: ensina a usar o site. Aparece na recepção (antes de criar conta) e na ajuda do funcionário.
import { NIVEIS, STATUS } from '../constantes.js';
import { $ } from '../utils.js';

const PASSOS_ADMIN = [
  ['Crie sua conta de administrador',
    'Clique em Criar conta e informe nome, e-mail e uma senha forte (8 ou mais caracteres, com maiúscula, minúscula, número e caractere especial).'],
  ['Escolha o seu plano',
    'O plano define quantas empresas você pode ter: 1, 2 ou 3. Precisa de 4 ou mais? Use o plano Personalizado e escolha a quantidade. Você pode mudar de plano quando quiser.'],
  ['Cadastre sua empresa',
    'Informe o nome e envie o logotipo. Ao terminar, o HelpMe gera o código da empresa, com 6 letras e números.'],
  ['Passe o código para os funcionários',
    'O código fica sempre visível no menu lateral, com um botão para copiar. Cada funcionário usa esse código para criar a conta e já entra direto na sua empresa.'],
  ['Configure os setores',
    'Em Configurar empresa você cadastra os setores (TI, RH, Financeiro, Logística...). O funcionário escolhe um deles ao abrir um chamado. Ali também dá para trocar o nome e o logotipo da empresa.'],
  ['Receba e responda os chamados',
    'Na aba Chamados aparecem todos os pedidos. Clique no título para ler a descrição. Use os filtros de nível, status e setor, ou busque pelo título ou nome do funcionário. Troque o status no seletor: Aberto, Em análise ou Concluído.'],
  ['Acompanhe os números e as pessoas',
    'O Painel mostra o total de chamados e tabelas por semana e por mês. Na aba Usuários você vê os funcionários e pode excluir quem não faz mais parte da empresa.'],
  ['Precisa de outra empresa?',
    'Clique em "+ Nova empresa" no menu lateral. Se o seu plano já estiver cheio, o HelpMe leva você direto para trocar de plano e, assim que ativar, já abre o cadastro da nova empresa. Troque entre as empresas no seletor do menu.'],
];

const PASSOS_FUNCIONARIO = [
  ['Peça o código da empresa',
    'O administrador da sua empresa tem um código de 6 letras e números. Peça para ele.'],
  ['Crie sua conta',
    'Clique em Criar conta, escolha "Sou funcionário" e informe nome, e-mail, uma senha forte (8 ou mais caracteres, com maiúscula, minúscula, número e caractere especial) e o código. Você já entra na empresa. Nos próximos acessos, basta e-mail e senha.'],
  ['Abra um chamado',
    'Preencha o título, escolha o setor (a lista é da sua empresa), o nível de urgência e descreva o problema com o máximo de detalhes: o que aconteceu, quando começou e o que você já tentou.'],
  ['Escolha o nível certo', 'LEGENDA_NIVEIS'],
  ['Acompanhe seus chamados',
    'Seus chamados aparecem como bilhetes na lista "Meus chamados". LEGENDA_STATUS'],
  ['Trabalha em mais de uma empresa?',
    'Clique em "+ Entrar em outra empresa", digite o código e pronto. Troque de empresa no seletor ao lado do logotipo. Cada empresa tem seus próprios setores e seu próprio histórico.'],
];

function legendaNiveis() {
  return `<div class="legenda">${Object.entries(NIVEIS).map(([chave, n]) =>
    `<div><span class="badge n-${chave}">${n.label}</span><span>${n.dica}</span></div>`).join('')}</div>`;
}

function legendaStatus() {
  const significado = {
    aberto: 'o chamado foi recebido e está na fila.',
    em_analise: 'o administrador já está vendo o seu caso.',
    concluido: 'o problema foi resolvido.',
  };
  return `<div class="legenda">${Object.entries(STATUS).map(([chave, nome]) =>
    `<div><span class="badge s-${chave}">${nome}</span><span>${significado[chave]}</span></div>`).join('')}</div>`;
}

function htmlPasso(numero, [titulo, texto]) {
  let corpo = `<p>${texto}</p>`;
  if (texto === 'LEGENDA_NIVEIS') corpo = `<p>O nível mostra ao administrador o que atender primeiro. Seja honesto: se tudo for crítico, nada é.</p>${legendaNiveis()}`;
  if (texto.endsWith('LEGENDA_STATUS')) corpo = `<p>${texto.replace('LEGENDA_STATUS', 'O selo ao lado de cada um mostra em que pé está:')}</p>${legendaStatus()}`;
  return `<li class="passo"><span class="n">${numero}</span><div><h3>${titulo}</h3>${corpo}</div></li>`;
}

// perfil: 'administrador' ou 'funcionario'
export function htmlTutorial(perfil) {
  const passos = perfil === 'administrador' ? PASSOS_ADMIN : PASSOS_FUNCIONARIO;
  return `<ol class="passos">${passos.map((p, i) => htmlPasso(i + 1, p)).join('')}</ol>`;
}

/* ---------- Aviso de primeiro acesso do funcionário ---------- */
const chaveVisto = (perfil) => `helpme_tutorial_visto_${perfil}`;

export const tutorialJaVisto = (perfil) => localStorage.getItem(chaveVisto(perfil)) === '1';
export const marcarTutorialVisto = (perfil) => localStorage.setItem(chaveVisto(perfil), '1');

// Mostra um convite para ver a ajuda na primeira vez. aoVer é chamado se a pessoa clicar em "Ver tutorial".
export function bannerTutorial(perfil, aoVer) {
  if (tutorialJaVisto(perfil)) return '';
  setTimeout(() => {
    $('#verTut')?.addEventListener('click', () => { marcarTutorialVisto(perfil); aoVer(); });
    $('#fecharBanner')?.addEventListener('click', () => { marcarTutorialVisto(perfil); $('#banner').remove(); });
  });
  return `
    <div class="banner" id="banner">
      <p><strong>Primeira vez por aqui?</strong> Veja o passo a passo rápido de como usar o HelpMe.</p>
      <button class="btn sm" id="verTut">Ver tutorial</button>
      <button class="btn ghost sm" id="fecharBanner">Agora não</button>
    </div>`;
}
