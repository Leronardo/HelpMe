// Recepção: a primeira tela do site. Explica o que é o HelpMe, como usar e quanto custa,
// antes de a pessoa criar uma conta.
import { estado } from '../estado.js';
import { rotear } from '../navegacao.js';
import { $, $$, marca, toast } from '../utils.js';
import { carregarPlanos, htmlPlanos, ligarCartoes } from './planos.js';
import { htmlTutorial } from './tutorial.js';

// Vai para a tela de login/cadastro já na aba certa
function irParaAuth(modo, perfil) {
  estado.auth = { modo, perfil };
  estado.publico = 'auth';
  rotear();
}

function abasTutorial(perfil) {
  const aba = (chave, texto) =>
    `<button type="button" data-perfil="${chave}" class="${perfil === chave ? 'on' : ''}" aria-pressed="${perfil === chave}">${texto}</button>`;
  return aba('funcionario', 'Sou funcionário') + aba('administrador', 'Sou administrador');
}

export async function telaRecepcao() {
  try { await carregarPlanos(); } catch (e) { toast(e.message, true); }

  $('#app').innerHTML = `
    <div class="rec">
      <header class="pub-topo"><div class="pub-topo-in">
        <span class="marca-txt">${marca()}HelpMe</span>
        <nav class="nav-rec" aria-label="Seções da página">
          <button type="button" class="link-nav" data-alvo="como">Como funciona</button>
          <button type="button" class="link-nav" data-alvo="planos">Planos</button>
        </nav>
        <div class="acoes-topo">
          <button class="btn ghost-dark sm" id="entrar">Entrar</button>
          <button class="btn beacon sm" id="criar">Criar conta</button>
        </div>
      </div></header>

      <section class="hero"><div class="hero-in">
        <div>
          <h1>Chamados organizados, do pedido à <em>solução</em>.</h1>
          <p class="lead">O HelpMe reúne em um só lugar os pedidos de ajuda dos funcionários da sua empresa. Cada empresa tem seus setores e níveis de urgência, e o administrador acompanha tudo em um painel.</p>
          <div class="hero-cta">
            <button class="btn beacon" id="criarAdmin">Criar conta de administrador</button>
            <button class="btn ghost-dark" id="entrar2">Já tenho conta</button>
          </div>
          <p class="hero-func">É funcionário? <button type="button" class="link-claro" id="souFunc">Crie sua conta com o código da empresa</button></p>
        </div>
        <div class="hero-tickets" aria-hidden="true">
          <div class="ticket n-critico"><div class="stub"><span class="num">#128</span><span class="lvl">Crítico</span></div>
            <div class="tbody"><h3>Servidor fora do ar</h3><div class="meta"><span>Setor: TI</span></div></div><span class="badge s-em_analise">Em análise</span></div>
          <div class="ticket n-medio"><div class="stub"><span class="num">#129</span><span class="lvl">Médio</span></div>
            <div class="tbody"><h3>Nota fiscal com erro</h3><div class="meta"><span>Setor: Financeiro</span></div></div><span class="badge s-aberto">Aberto</span></div>
          <div class="ticket n-leve"><div class="stub"><span class="num">#130</span><span class="lvl">Leve</span></div>
            <div class="tbody"><h3>Dúvida sobre férias</h3><div class="meta"><span>Setor: RH</span></div></div><span class="badge s-concluido">Concluído</span></div>
        </div>
      </div></section>

      <section class="faixa"><div class="rec-sec tres">
        <div><span class="n">1</span><h3>A empresa se cadastra</h3><p>O administrador cria a conta, escolhe o plano e cadastra a empresa com nome e logotipo.</p></div>
        <div><span class="n">2</span><h3>Os funcionários entram</h3><p>Cada funcionário usa o código da empresa para criar a conta e já começa a usar.</p></div>
        <div><span class="n">3</span><h3>Os chamados são resolvidos</h3><p>Funcionários abrem chamados, o administrador filtra, responde e acompanha os números.</p></div>
      </div></section>

      <section class="faixa" id="como"><div class="rec-sec">
        <h2>Como funciona</h2>
        <p class="lead">Veja o passo a passo antes de criar sua conta. Escolha o seu perfil:</p>
        <div class="seg seg-tut" id="abasTut" role="group" aria-label="Escolha seu perfil">${abasTutorial(estado.tutorialPerfil)}</div>
        <div id="tutConteudo">${htmlTutorial(estado.tutorialPerfil)}</div>
      </div></section>

      <section class="faixa alt" id="planos"><div class="rec-sec">
        <h2>Planos e preços</h2>
        <p class="lead">Você paga conforme o número de empresas que quer atender. Sem taxa de adesão e sem limite de funcionários ou chamados.</p>
        ${htmlPlanos({ modo: 'publico' })}
      </div></section>

      <section class="final"><div class="rec-sec centro">
        <h2>Pronto para organizar os chamados?</h2>
        <p class="lead">Crie sua conta de administrador e cadastre sua empresa em poucos minutos.</p>
        <button class="btn beacon" id="criarFinal">Criar conta de administrador</button>
      </div></section>

      <footer class="rodape">HelpMe — sistema de chamados</footer>
    </div>`;

  // botões de entrar / criar conta
  $('#entrar').addEventListener('click', () => irParaAuth('entrar', 'administrador'));
  $('#entrar2').addEventListener('click', () => irParaAuth('entrar', 'administrador'));
  $('#criar').addEventListener('click', () => irParaAuth('criar', 'administrador'));
  $('#criarAdmin').addEventListener('click', () => irParaAuth('criar', 'administrador'));
  $('#criarFinal').addEventListener('click', () => irParaAuth('criar', 'administrador'));
  $('#souFunc').addEventListener('click', () => irParaAuth('criar', 'funcionario'));

  // rolagem suave até as seções
  $$('.link-nav').forEach((botao) => botao.addEventListener('click', () =>
    document.getElementById(botao.dataset.alvo).scrollIntoView({ behavior: 'smooth' })));

  // abas do tutorial: um único ouvinte no container (os botões são redesenhados a cada troca)
  $('#abasTut').addEventListener('click', (evento) => {
    const botao = evento.target.closest('button[data-perfil]');
    if (!botao) return;
    estado.tutorialPerfil = botao.dataset.perfil;
    $('#abasTut').innerHTML = abasTutorial(estado.tutorialPerfil);
    $('#tutConteudo').innerHTML = htmlTutorial(estado.tutorialPerfil);
  });

  // plano escolhido na recepção: leva para criar a conta de administrador
  ligarCartoes($('#planos'), () => irParaAuth('criar', 'administrador'));
}
