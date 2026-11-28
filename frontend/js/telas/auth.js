import { api } from '../api.js';
import { estado } from '../estado.js';
import { rotear } from '../navegacao.js';
import { iniciarSessao, sair } from '../sessao.js';
import { $, $$, esc, nomeDePessoaValido } from '../utils.js';
import { REGRAS_SENHA, senhaForte } from '../senha.js';
import { campoHtml, classesBotao, erroCls, inputCls, link, marca, muted } from '../ui.js';

function valoresAtuais() {
  const form = $('#f');
  if (!form) return {};
  const dados = {};
  for (const el of form.elements) if (el.name) dados[el.name] = el.value;
  return dados;
}

const valor = (dados, nome) => dados[nome] ? `value="${esc(dados[nome])}"` : '';

const regrasHtml = `<ul class="-mt-1.5 mb-4 grid gap-0.5 text-[13px]" id="regras">${REGRAS_SENHA.map((r) =>
  `<li class="${muted}"><span class="inline-block w-[18px]">○</span>${r.texto}</li>`).join('')}</ul>`;

function campoSenha(rotulo, nome, id, extra = '') {
  return `<label class="mb-4 block"><span class="mb-1.5 block text-[13.5px] font-semibold">${rotulo}</span>
      <span class="relative block">
        <input class="${inputCls} pr-20" type="password" name="${nome}" id="${id}" required ${extra}>
        <button type="button" class="absolute top-1/2 right-2 min-h-9 -translate-y-1/2 cursor-pointer rounded-md px-2 text-[13px] font-semibold text-muted hover:text-ink" data-ver="${id}" aria-pressed="false">Mostrar</button>
      </span>
    </label>`;
}

function ligarMostrarSenha() {
  $$('[data-ver]').forEach((botao) => botao.addEventListener('click', () => {
    const campo = document.getElementById(botao.dataset.ver);
    const mostrar = campo.type === 'password';
    campo.type = mostrar ? 'text' : 'password';
    botao.textContent = mostrar ? 'Ocultar' : 'Mostrar';
    botao.setAttribute('aria-pressed', String(mostrar));
    campo.focus();
  }));
}

function ligarRegras() {
  const atualizarRegras = () => {
    const senha = $('#senha').value;
    $$('#regras li').forEach((item, i) => {
      const ok = REGRAS_SENHA[i].ok(senha);
      item.className = ok ? 'font-semibold text-n-leve' : muted;
      item.firstElementChild.textContent = ok ? '✓' : '○';
    });
  };
  $('#senha').addEventListener('input', atualizarRegras);
  if ($('#senha').value) atualizarRegras();
}

function moldura(miolo) {
  return `
    <div class="grid min-h-screen grid-cols-1 min-[961px]:grid-cols-[minmax(320px,5fr)_6fr]">
      <section class="flex items-center gap-3 bg-ink px-5 py-4 text-white min-[961px]:flex-col min-[961px]:items-stretch min-[961px]:justify-between min-[961px]:px-14 min-[961px]:py-14">
        ${marca('size-9 min-[961px]:size-[72px]')}
        <div>
          <h1 class="font-display text-2xl font-extrabold tracking-[-0.04em] min-[961px]:mt-auto min-[961px]:text-[clamp(56px,8vw,104px)]">HelpMe</h1>
          <p class="mt-1.5 hidden max-w-[28ch] text-[#B9C6D6] min-[961px]:block min-[961px]:text-[19px]">Abra, acompanhe e resolva chamados em um só lugar.</p>
        </div>
      </section>
      <section class="grid place-items-center px-5 py-8">
        <div class="w-full max-w-[420px]">${miolo}</div>
      </section>
    </div>`;
}

function avisoHtml() {
  const aviso = estado.avisoAuth;
  estado.avisoAuth = '';
  return aviso ? `<p class="mb-4 rounded-lg bg-[#E5F6EC] px-3 py-2.5 text-sm font-semibold text-n-leve" role="status">${esc(aviso)}</p>` : '';
}

function irPara(modo, extra = {}) {
  estado.auth = { modo, fluxo: '', email: '', ...extra };
  telaAuth();
}

function preparar(preservar) {
  const dados = preservar ? valoresAtuais() : {};
  if (!preservar && estado.emailLembrado) {
    dados.email = estado.emailLembrado;
    estado.emailLembrado = '';
  }
  if (!dados.email && estado.auth.email) dados.email = estado.auth.email;
  return dados;
}

function montar(miolo) {
  $('#app').innerHTML = moldura(miolo);
  window.scrollTo(0, 0);
  if (window.matchMedia('(min-width: 961px)').matches) $('form input')?.focus();
}

export function telaAuth(preservar = false) {
  const modo = estado.auth.modo || 'entrar';
  if (modo === 'codigo') return telaCodigo();
  if (modo === 'recuperar') return telaRecuperar(preservar);
  return telaEntrarOuCriar(preservar);
}

function telaEntrarOuCriar(preservar) {
  const dados = preparar(preservar);
  const criar = estado.auth.modo === 'criar';
  const campos = (criar ? campoHtml('nome', 'Seu nome', 'text', `autocomplete="name" ${valor(dados, 'nome')}`) : '')
    + campoHtml('email', 'E-mail', 'email', `autocomplete="email" ${valor(dados, 'email')}`)
    + campoSenha('Senha', 'senha', 'senha', `${valor(dados, 'senha')} autocomplete="${criar ? 'new-password' : 'current-password'}`)
    + (criar ? regrasHtml : '');

  montar(`
    <h2 class="mb-1.5 font-display text-3xl">${criar ? 'Criar conta' : 'Entrar'}</h2>
    <p class="mb-6 ${muted}">${criar
      ? (estado.semCodigo
        ? 'Crie sua conta de supervisor. Neste ambiente a conta entra na hora, sem código de e-mail.'
        : 'Crie sua conta de supervisor. Enviaremos um código para o seu e-mail. A conta só nasce depois da confirmação.')
      : 'Use o e-mail e a senha da sua conta. O HelpMe reconhece se você é supervisor, técnico ou colaborador.'}</p>
    ${avisoHtml()}
    <form id="f" novalidate>
      ${campos}
      <p class="${erroCls}" id="erro" role="alert"></p>
      <button class="${classesBotao({ block: true })}" id="enviar">${criar ? (estado.semCodigo ? 'Criar conta' : 'Enviar código') : 'Entrar'}</button>
    </form>
    ${criar ? '' : `<p class="mt-4"><button type="button" class="${link}" id="esqueci">Esqueci minha senha</button></p>`}
    <p class="mt-[22px] ${muted}">${criar ? 'Já tem conta?' : 'Vai supervisionar uma empresa e ainda não tem conta?'}
      <button type="button" class="${link}" id="troca">${criar ? 'Entrar' : 'Criar conta de supervisor'}</button></p>
    <p class="mt-3"><button type="button" class="${link}" id="inicio">Página inicial</button></p>`);

  $('#troca').addEventListener('click', () => irPara(criar ? 'entrar' : 'criar', { email: $('#f').email.value.trim() }));
  $('#inicio').addEventListener('click', () => { estado.auth = { modo: 'inicio' }; rotear(); });
  $('#esqueci')?.addEventListener('click', () => irPara('recuperar', { email: $('#f').email.value.trim() }));
  ligarMostrarSenha();
  if (criar) ligarRegras();

  $('#f').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.target, erro = $('#erro'), botao = $('#enviar');
    erro.textContent = '';
    const faltando = [...form.elements].some((el) => el.required && !el.value.trim());
    if (faltando) { erro.textContent = 'Preencha todos os campos.'; return; }
    if (criar && !nomeDePessoaValido(form.nome.value.trim())) { erro.textContent = 'O nome só pode ter letras e espaços.'; return; }
    if (criar && !senhaForte(form.senha.value)) { erro.textContent = 'A senha ainda não atende a todos os requisitos.'; return; }

    botao.disabled = true;
    try {
      if (!criar) {
        const resposta = await api('/auth/login', { method: 'POST', body: Object.fromEntries(new FormData(form)) });
        await iniciarSessao(resposta);
        return;
      }
      const email = form.email.value.trim();
      const resposta = await api('/auth/admin/codigo', {
        method: 'POST',
        body: { nome: form.nome.value.trim(), email, senha: form.senha.value },
      });
      if (resposta.token) {
        await iniciarSessao(resposta);
        return;
      }
      irPara('codigo', { fluxo: 'cadastro', email });
    } catch (e) {
      erro.textContent = e.message;
      botao.disabled = false;
    }
  });
}

function telaRecuperar(preservar) {
  const dados = preparar(preservar);
  const direto = estado.semCodigo;
  montar(`
    <h2 class="mb-1.5 font-display text-3xl">Recuperar conta</h2>
    <p class="mb-6 ${muted}">${direto
      ? 'Informe o e-mail e a nova senha. Neste ambiente não pedimos código.'
      : 'Informe o e-mail da conta. Enviaremos um código que vale por 15 minutos.'}</p>
    ${avisoHtml()}
    <form id="f" novalidate>
      ${campoHtml('email', 'E-mail', 'email', `autocomplete="email" ${valor(dados, 'email')}`)}
      ${direto ? `${campoSenha('Nova senha', 'senha', 'senha', 'autocomplete="new-password"')}${regrasHtml}${campoSenha('Confirme a nova senha', 'confirmar', 'confirmar', 'autocomplete="new-password"')}` : ''}
      <p class="${erroCls}" id="erro" role="alert"></p>
      <button class="${classesBotao({ block: true })}" id="enviar">${direto ? 'Salvar senha' : 'Enviar código'}</button>
    </form>
    <p class="mt-[22px]"><button type="button" class="${link}" id="voltar">Voltar para o login</button></p>`);

  if (direto) {
    ligarMostrarSenha();
    ligarRegras();
  }
  $('#voltar').addEventListener('click', () => irPara('entrar', { email: $('#f').email.value.trim() }));
  $('#f').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.target, erro = $('#erro'), botao = $('#enviar');
    erro.textContent = '';
    const email = form.email.value.trim();
    if (!email) { erro.textContent = 'Informe o e-mail.'; return; }
    if (direto) {
      if (!senhaForte(form.senha.value)) { erro.textContent = 'A senha ainda não atende a todos os requisitos.'; return; }
      if (form.senha.value !== form.confirmar.value) { erro.textContent = 'As senhas não coincidem.'; return; }
    }
    botao.disabled = true;
    try {
      if (direto) {
        const resposta = await api('/auth/recuperar', { method: 'POST', body: { email, senha: form.senha.value } });
        await iniciarSessao(resposta);
        return;
      }
      await api('/auth/recuperar/codigo', { method: 'POST', body: { email } });
      irPara('codigo', { fluxo: 'recuperacao', email });
    } catch (e) {
      erro.textContent = e.message;
      botao.disabled = false;
    }
  });
}

function telaCodigo() {
  const fluxo = estado.auth.fluxo;
  const email = estado.auth.email || '';
  const recuperacao = fluxo === 'recuperacao';
  montar(`
    <h2 class="mb-1.5 font-display text-3xl">${recuperacao ? 'Nova senha' : 'Confirme o e-mail'}</h2>
    <p class="mb-6 ${muted}">Enviamos um código de 6 dígitos para ${esc(email)}. Ele expira em 15 minutos.</p>
    ${avisoHtml()}
    <form id="f" novalidate>
      <label class="mb-4 block"><span class="mb-1.5 block text-[13.5px] font-semibold">Código</span>
        <input class="${inputCls} text-center font-display text-2xl tracking-[0.4em]" name="codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required>
      </label>
      ${recuperacao ? `${campoSenha('Nova senha', 'senha', 'senha', 'autocomplete="new-password"')}${regrasHtml}${campoSenha('Confirme a nova senha', 'confirmar', 'confirmar', 'autocomplete="new-password"')}` : ''}
      <p class="${erroCls}" id="erro" role="alert"></p>
      <button class="${classesBotao({ block: true })}" id="enviar">${recuperacao ? 'Salvar senha' : 'Confirmar conta'}</button>
    </form>
    <p class="mt-4"><button type="button" class="${link}" id="reenviar">Enviar outro código</button></p>
    <p class="mt-3"><button type="button" class="${link}" id="voltar">${recuperacao ? 'Voltar' : 'Corrigir os dados'}</button></p>`);

  if (recuperacao) {
    ligarMostrarSenha();
    ligarRegras();
  }
  $('#voltar').addEventListener('click', () => irPara(recuperacao ? 'recuperar' : 'criar', { email }));
  $('#reenviar').addEventListener('click', async () => {
    const erro = $('#erro'), botao = $('#reenviar');
    erro.textContent = '';
    botao.disabled = true;
    try {
      await api('/auth/codigo/reenviar', { method: 'POST', body: { email, tipo: fluxo } });
      estado.avisoAuth = 'Enviamos outro código.';
      telaCodigo();
    } catch (e) {
      erro.textContent = e.message;
      botao.disabled = false;
    }
  });

  $('#f').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.target, erro = $('#erro'), botao = $('#enviar');
    erro.textContent = '';
    const codigo = form.codigo.value.trim();
    if (!/^\d{6}$/.test(codigo)) { erro.textContent = 'Informe o código de 6 dígitos.'; return; }
    if (recuperacao) {
      if (!senhaForte(form.senha.value)) { erro.textContent = 'A senha ainda não atende a todos os requisitos.'; return; }
      if (form.senha.value !== form.confirmar.value) { erro.textContent = 'As senhas não coincidem.'; return; }
    }
    botao.disabled = true;
    try {
      const resposta = recuperacao
        ? await api('/auth/recuperar', { method: 'POST', body: { email, codigo, senha: form.senha.value } })
        : await api('/auth/admin/register', { method: 'POST', body: { email, codigo } });
      await iniciarSessao(resposta);
    } catch (e) {
      erro.textContent = e.message;
      botao.disabled = false;
    }
  });
}

export function telaTrocarSenha() {
  $('#app').innerHTML = moldura(`
    <h2 class="mb-1.5 font-display text-3xl">Crie sua senha</h2>
    <p class="mb-6 ${muted}">Este é o seu primeiro acesso, ${esc(estado.usuario.nome)}. A senha temporária vale só desta vez. Crie uma senha só sua. Depois, entre de novo com ela.</p>
    <form id="f" novalidate>
      ${campoSenha('Nova senha', 'senha', 'senha', 'autocomplete="new-password"')}
      ${regrasHtml}
      ${campoSenha('Confirme a nova senha', 'confirmar', 'confirmar', 'autocomplete="new-password"')}
      <p class="${erroCls}" id="erro" role="alert"></p>
      <button class="${classesBotao({ block: true })}" id="enviar">Definir senha</button>
    </form>
    <p class="mt-[22px]">
      <button type="button" class="${link} font-semibold text-muted" id="sair">Sair</button>
    </p>`);
  window.scrollTo(0, 0);
  if (window.matchMedia('(min-width: 961px)').matches) $('#senha')?.focus();
  ligarMostrarSenha();
  ligarRegras();
  $('#sair').addEventListener('click', () => sair());

  $('#f').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const form = evento.target, erro = $('#erro'), botao = $('#enviar');
    erro.textContent = '';
    if (!senhaForte(form.senha.value)) { erro.textContent = 'A senha ainda não atende a todos os requisitos.'; return; }
    if (form.senha.value !== form.confirmar.value) { erro.textContent = 'As senhas não coincidem.'; return; }

    botao.disabled = true;
    try {
      await api('/auth/user/senha', { method: 'POST', body: { senha: form.senha.value } });
      sair('Senha definida. Entre com o e-mail e a nova senha.', estado.usuario.email);
    } catch (e) {
      erro.textContent = e.message;
      botao.disabled = false;
    }
  });
}
