import { NIVEIS, STATUS } from '../constantes.js';
import { $ } from '../utils.js';
import { badgeNivel, badgeStatus, classesBotao } from '../ui.js';

const PASSOS_ADMIN = [
  ['Crie sua conta de supervisor',
    'A tela inicial apresenta o HelpMe e os valores. Clique em Crie sua conta aqui e informe nome, e-mail e uma senha forte (8 ou mais caracteres, com maiúscula, minúscula, número e caractere especial). O nome só aceita letras e espaços. O HelpMe envia um código para o e-mail. A conta só é criada depois que você confirma esse código.'],
  ['Escolha o seu plano',
    'O plano define quantas empresas você pode ter: 1, 2 ou 3. Precisa de 4 ou mais? Use o plano Personalizado e escolha a quantidade. Você pode mudar de plano quando quiser.'],
  ['Cadastre sua empresa',
    'Informe o nome e o logotipo: anexe uma imagem ou escolha uma das opções prontas. O HelpMe gera um código de 6 letras e números. Ele fica no menu e serve para quem já tem conta entrar nesta empresa também.'],
  ['Crie a conta de cada técnico',
    'Na aba Equipe, informe o nome e o e-mail. O nome só aceita letras e espaços. O HelpMe gera uma senha temporária. Copie o e-mail e a senha e passe para a pessoa. O técnico cadastra os colaboradores. Você não cria o colaborador direto.'],
  ['Configure os setores',
    'Em Configurar empresa você cadastra os setores (TI, RH, Financeiro, Logística...). O colaborador escolhe um deles ao abrir um chamado. Ali também dá para trocar o nome e o logotipo da empresa.'],
  ['Acompanhe os chamados',
    'Na aba Chamados aparecem todos os pedidos. Clique no título para ler a descrição e as observações. Escolha o técnico responsável. Troque o status: Aberto, Em análise, Aguardando recursos ou Concluído. Você e o técnico podem registrar observações.'],
  ['Acompanhe os números e a equipe',
    'O Painel mostra o total de chamados e tabelas por semana e por mês, inclusive os que aguardam recursos. Na aba Equipe você vê técnicos e colaboradores e pode excluir quem não faz mais parte da empresa.'],
  ['Precisa de outra empresa?',
    'Clique em "+ Nova empresa" no menu lateral. Se o seu plano já estiver cheio, o HelpMe leva você direto para trocar de plano e, assim que ativar, já abre o cadastro da nova empresa. Troque entre as empresas no seletor do menu.'],
];

const PASSOS_TECNICO = [
  ['Receba seus dados de acesso',
    'O supervisor cria a sua conta e te passa o e-mail e uma senha temporária. Você não cria a conta sozinho.'],
  ['Entre e crie sua senha',
    'Na tela de entrada, use o e-mail e a senha temporária. O HelpMe pede uma senha nova na hora. Depois, entre outra vez com ela.'],
  ['Cadastre os colaboradores',
    'Na aba Colaboradores, informe nome e e-mail. O nome só aceita letras e espaços. Copie a senha temporária e passe para a pessoa. O colaborador abre os chamados. Você não abre chamado por ele.'],
  ['Assuma o chamado',
    'Na aba Chamados, escolha o responsável. Pode ser você ou outro técnico da empresa. Sem responsável, o chamado continua na fila.'],
  ['Atualize o status e escreva observações',
    'Troque o status para Aberto, Em análise, Aguardando recursos ou Concluído. Abra o título e registre o que foi feito ou o que falta. O colaborador vê o responsável, o status e as observações.'],
];

const PASSOS_FUNCIONARIO = [
  ['Receba seus dados de acesso',
    'O técnico cria a sua conta e te passa o e-mail e uma senha temporária. Você não cria a conta sozinho.'],
  ['Entre e crie sua senha',
    'Na tela de entrada, use o e-mail e a senha temporária. O HelpMe reconhece a sua conta e pede uma senha nova na hora: 8 ou mais caracteres, com maiúscula, minúscula, número e caractere especial. Depois, entre outra vez com o e-mail e a senha que você acabou de criar. Se esquecer a senha, use Esqueci minha senha: chega um código no e-mail.'],
  ['Abra um chamado',
    'Preencha o título, escolha o setor (a lista é da sua empresa), o nível de urgência e descreva o problema com o máximo de detalhes: o que aconteceu, quando começou e o que você já tentou.'],
  ['Escolha o nível certo', 'LEGENDA_NIVEIS'],
  ['Acompanhe seus chamados',
    'Seus chamados aparecem como bilhetes na lista "Meus chamados". LEGENDA_STATUS'],
  ['Trabalha em mais de uma empresa?',
    'Clique em "+ Entrar em outra empresa", digite o código e pronto. Troque de empresa no seletor ao lado do logotipo. Cada empresa tem seus próprios setores e seu próprio histórico.'],
];

function legenda(itens) {
  return `<div class="mt-3 grid gap-2">${itens}</div>`;
}

function legendaNiveis() {
  return legenda(Object.entries(NIVEIS).map(([chave, n]) =>
    `<div class="flex flex-wrap items-baseline gap-3">${badgeNivel(chave, n.label)}<span>${n.dica}</span></div>`));
}

function legendaStatus() {
  const significado = {
    aberto: 'o chamado foi recebido e está na fila.',
    em_analise: 'um técnico já está vendo o caso.',
    aguardando_recursos: 'o atendimento espera peça, acesso ou outra pessoa.',
    concluido: 'o problema foi resolvido.',
  };
  return legenda(Object.entries(STATUS).map(([chave, nome]) =>
    `<div class="flex flex-wrap items-baseline gap-3">${badgeStatus(chave, nome)}<span>${significado[chave]}</span></div>`));
}

function htmlPasso(numero, [titulo, texto]) {
  let corpo = `<p class="text-[#3A4756]">${texto}</p>`;
  if (texto === 'LEGENDA_NIVEIS') corpo = `<p class="text-[#3A4756]">O nível mostra ao técnico o que atender primeiro. Seja honesto: se tudo for crítico, nada é.</p>${legendaNiveis()}`;
  if (texto.endsWith('LEGENDA_STATUS')) corpo = `<p class="text-[#3A4756]">${texto.replace('LEGENDA_STATUS', 'O selo ao lado de cada um mostra em que pé está:')}</p>${legendaStatus()}`;
  return `<li class="grid grid-cols-1 gap-2.5 rounded-xl border border-line bg-white px-5 py-[18px] min-[521px]:grid-cols-[44px_1fr] min-[521px]:gap-4">
    <span class="grid size-10 place-items-center rounded-full bg-beacon font-display text-xl font-extrabold text-ink">${numero}</span>
    <div><h3 class="mb-1 text-[19px]">${titulo}</h3>${corpo}</div></li>`;
}

export function htmlTutorial(perfil) {
  const passos = perfil === 'administrador' ? PASSOS_ADMIN : perfil === 'tecnico' ? PASSOS_TECNICO : PASSOS_FUNCIONARIO;
  return `<ol class="grid max-w-[820px] list-none gap-3.5 p-0">${passos.map((p, i) => htmlPasso(i + 1, p)).join('')}</ol>`;
}

const chaveVisto = (perfil) => `helpme_tutorial_visto_${perfil}`;

export const tutorialJaVisto = (perfil) => localStorage.getItem(chaveVisto(perfil)) === '1';
export const marcarTutorialVisto = (perfil) => localStorage.setItem(chaveVisto(perfil), '1');

export function bannerTutorial(perfil, aoVer) {
  if (tutorialJaVisto(perfil)) return '';
  setTimeout(() => {
    $('#verTut')?.addEventListener('click', () => { marcarTutorialVisto(perfil); aoVer(); });
    $('#fecharBanner')?.addEventListener('click', () => { marcarTutorialVisto(perfil); $('#banner').remove(); });
  });
  return `
    <div class="flex flex-wrap items-center gap-2.5 border-b border-[#F0D58A] bg-[#FFF4D6] px-4 py-3 min-[961px]:px-9" id="banner">
      <p class="mr-auto"><strong>Primeira vez por aqui?</strong> Veja o passo a passo rápido de como usar o HelpMe.</p>
      <button class="${classesBotao({ small: true })}" id="verTut">Ver tutorial</button>
      <button class="${classesBotao({ ghost: true, small: true })}" id="fecharBanner">Agora não</button>
    </div>`;
}
