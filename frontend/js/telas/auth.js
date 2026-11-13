// Tela de login e cadastro (funcionário ou administrador)
import { api } from '../api.js';
import { estado } from '../estado.js';
import { rotear } from '../navegacao.js';
import { iniciarSessao } from '../sessao.js';
import { $, $$, marca } from '../utils.js';
import { REGRAS_SENHA, senhaForte } from '../senha.js';

const campo = (nome, rotulo, tipo = 'text', extra = '') =>
  `<label class="campo"><span>${rotulo}</span><input type="${tipo}" name="${nome}" required ${extra}></label>`;

// Quais campos aparecem em cada combinação (administrador/funcionário x entrar/criar)
function montarCampos(administrador, criar) {
  const nome = campo('nome', 'Seu nome', 'text', 'autocomplete="name"');
  const email = campo('email', 'E-mail', 'email', 'autocomplete="email"');
  const senhaCampo = campo('senha', 'Senha', 'password',
    criar ? 'autocomplete="new-password"' : 'autocomplete="current-password"');
  // ao criar conta, mostra a lista de requisitos da senha (marcados enquanto a pessoa digita)
  const regras = `<ul class="regras" id="regras">${REGRAS_SENHA.map((r) => `<li>${r.texto}</li>`).join('')}</ul>`;
  const senha = criar ? senhaCampo + regras : senhaCampo;
  const codigo = campo('codigo', 'Código da empresa', 'text',
    'autocapitalize="characters" maxlength="12" placeholder="Ex.: F23MCG"');

  if (!criar) return email + senha;                  // entrar: só e-mail e senha
  return administrador ? nome + email + senha : nome + email + senha + codigo;
}

function textoApoio(administrador, criar) {
  if (administrador) {
    return criar
      ? 'Crie sua conta de administrador e cadastre a sua empresa em seguida.'
      : 'Acesse o painel com e-mail e senha.';
  }
  return criar
    ? 'Use o código que o administrador da sua empresa passou para você.'
    : 'Entre com seu e-mail e senha.';
}

export function telaAuth() {
  const { modo, perfil } = estado.auth;
  const administrador = perfil === 'administrador';
  const criar = modo === 'criar';

  $('#app').innerHTML = `
    <div class="auth">
      <section class="auth-brand">
        ${marca('marca-lg')}
        <div><h1>HelpMe</h1><p>Abra, acompanhe e resolva chamados em um só lugar.</p></div>
      </section>
      <section class="auth-panel">
        <div class="auth-card">
          <div class="seg" role="group" aria-label="Tipo de conta">
            <button type="button" data-perfil="funcionario" class="${!administrador ? 'on' : ''}" aria-pressed="${!administrador}">Sou funcionário</button>
            <button type="button" data-perfil="administrador" class="${administrador ? 'on' : ''}" aria-pressed="${administrador}">Sou administrador</button>
          </div>
          <h2>${criar ? 'Criar conta' : 'Entrar'}</h2>
          <p class="sub">${textoApoio(administrador, criar)}</p>
          <form id="f" novalidate>
            ${montarCampos(administrador, criar)}
            <p class="erro" id="erro" role="alert"></p>
            <button class="btn block" id="enviar">${criar ? 'Criar conta' : 'Entrar'}</button>
          </form>
          <p class="troca">${criar ? 'Já tem conta?' : 'Ainda não tem conta?'}
            <button type="button" class="link" id="troca">${criar ? 'Entrar' : 'Criar conta'}</button></p>
          <p class="links-ajuda">
            <button type="button" class="link" id="voltarInicio">← Voltar para a página inicial</button>
          </p>
        </div>
      </section>
    </div>`;

  // troca entre funcionário/administrador e entre entrar/criar conta
  $$('.seg button').forEach((botao) => botao.addEventListener('click', () => {
    estado.auth.perfil = botao.dataset.perfil;
    telaAuth();
  }));
  $('#troca').addEventListener('click', () => {
    estado.auth.modo = criar ? 'entrar' : 'criar';
    telaAuth();
  });

  $('#voltarInicio').addEventListener('click', () => { estado.publico = null; rotear(); });

  // marca cada requisito da senha conforme a pessoa digita
  if (criar) {
    $('input[name=senha]').addEventListener('input', (evento) => {
      $$('#regras li').forEach((item, i) => item.classList.toggle('ok', REGRAS_SENHA[i].ok(evento.target.value)));
    });
  }

  $('#f').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.target, erro = $('#erro'), botao = $('#enviar');
    erro.textContent = '';

    const faltando = [...form.elements].some((el) => el.required && !el.value.trim());
    if (faltando) { erro.textContent = 'Preencha todos os campos.'; return; }
    if (criar && !senhaForte(form.senha.value)) { erro.textContent = 'A senha ainda não atende a todos os requisitos.'; return; }

    const rota = `/auth/${administrador ? 'admin' : 'user'}/${criar ? 'register' : 'login'}`;
    botao.disabled = true;
    try {
      const resposta = await api(rota, { method: 'POST', body: Object.fromEntries(new FormData(form)) });
      await iniciarSessao(resposta);
    } catch (e) {
      erro.textContent = e.message;
      botao.disabled = false;
    }
  });
}
