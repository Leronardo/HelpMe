import { api } from '../api.js';
import { estado } from '../estado.js';
import { $, $$, esc, fmtData, toast, confirmar, copiar, nomeDePessoaValido } from '../utils.js';
import {
  cabecalho, campoHtml, classesBotao, dialogAcoes, dialogCls, dialogTexto, dialogTitulo,
  erroCls, muted, tabela, tabelaWrap, td, tdNum, th, thNum, vazio,
} from '../ui.js';

const PAPEL = { tecnico: 'Técnico', funcionario: 'Colaborador' };

export async function viewUsuarios() {
  const tecnico = estado.usuario.perfil === 'tecnico';
  const titulo = tecnico ? 'Colaboradores' : 'Equipe';
  const main = $('#main');
  main.innerHTML = `${cabecalho(titulo)}<p class="${muted}">Carregando…</p>`;

  try {
    const { usuarios } = await api(`/empresas/${estado.empresaId}/usuarios`);
    if (estado.abaAdmin !== 'usuarios') return;

    const rotuloLista = tecnico
      ? `${usuarios.length} ${usuarios.length === 1 ? 'colaborador' : 'colaboradores'} nesta empresa`
      : `${usuarios.length} ${usuarios.length === 1 ? 'pessoa' : 'pessoas'} nesta empresa`;
    const botaoNovo = tecnico ? 'Novo colaborador' : 'Novo técnico';
    const vazioTxt = tecnico
      ? 'Ainda não há colaboradores. Crie a conta e passe o e-mail com a senha temporária.'
      : 'Ainda não há técnicos. Crie a conta e passe o e-mail com a senha temporária. Os colaboradores aparecem aqui depois que um técnico os cadastra.';
    main.innerHTML = `
      <header class="mb-[22px] flex flex-wrap items-center gap-3.5">
        <h1 class="font-display text-[32px]">${titulo}</h1>
        <p class="${muted}">${rotuloLista}</p>
        <button class="${classesBotao({ small: true })} ml-auto" id="novo">${botaoNovo}</button>
      </header>
      <div class="${tabelaWrap}">${usuarios.length ? `
        <table class="${tabela}">
          <thead><tr><th class="${th}">Nome</th><th class="${th}">Papel</th><th class="${th}">E-mail</th><th class="${thNum}">Chamados</th><th class="${th}">Cadastro</th><th class="${th}"></th></tr></thead>
          <tbody>${usuarios.map((u) => `
            <tr>
              <td class="${td}"><b>${esc(u.nome)}</b></td>
              <td class="${td}">${esc(PAPEL[u.perfil] || u.perfil)}</td>
              <td class="${td}">${esc(u.email)}</td><td class="${tdNum}">${u.chamados}</td><td class="${td}">${fmtData(u.criado_em)}</td>
              <td class="${td}"><button class="${classesBotao({ danger: true, small: true })}" data-id="${u.id}" data-nome="${esc(u.nome)}" data-perfil="${esc(u.perfil)}">Excluir</button></td>
            </tr>`).join('')}
          </tbody>
        </table>` : `<p class="${vazio}">${vazioTxt}</p>`}
      </div>
      <dialog id="dlgNovo" class="${dialogCls}">
        <form id="fNovo" novalidate>
          <h3 class="${dialogTitulo}">${botaoNovo}</h3>
          <p class="${dialogTexto}">Informe o nome e o e-mail. O HelpMe gera uma senha temporária para você passar à pessoa.</p>
          ${campoHtml('nome', 'Nome', 'text', 'maxlength="80" autocomplete="off"')}
          ${campoHtml('email', 'E-mail', 'email', 'maxlength="120" autocomplete="off"')}
          <p class="${erroCls}" id="erroNovo" role="alert"></p>
          <div class="${dialogAcoes}">
            <button type="button" class="${classesBotao({ ghost: true })}" id="cancelarNovo">Cancelar</button>
            <button class="${classesBotao()}" id="enviarNovo">Criar conta</button>
          </div>
        </form>
      </dialog>`;

    $('#novo').addEventListener('click', abrirNovo);
    $$('button[data-id]', main).forEach((botao) => botao.addEventListener('click', () => excluirUsuario(botao)));
  } catch (e) {
    main.innerHTML = `${cabecalho(tecnico ? 'Colaboradores' : 'Equipe')}<p class="${vazio}">${esc(e.message)}</p>`;
  }
}

function abrirNovo() {
  const dlg = $('#dlgNovo');
  $('#fNovo').reset();
  $('#erroNovo').textContent = '';
  let criada = false;
  dlg.addEventListener('close', () => { if (criada) viewUsuarios(); }, { once: true });
  dlg.showModal();
  $('#fNovo').nome.focus();
  $('#cancelarNovo').onclick = () => dlg.close();
  $('#fNovo').onsubmit = (evento) => criarFuncionario(evento, () => { criada = true; });
}

async function criarFuncionario(evento, aoCriar) {
  evento.preventDefault();
  const form = evento.target, erro = $('#erroNovo'), botao = $('#enviarNovo');
  erro.textContent = '';
  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const rotulo = estado.usuario.perfil === 'tecnico' ? 'colaborador' : 'técnico';
  if (nome.length < 2) { erro.textContent = `Informe o nome do ${rotulo}.`; return; }
  if (!nomeDePessoaValido(nome)) { erro.textContent = 'O nome só pode ter letras e espaços.'; return; }
  if (!email.includes('@')) { erro.textContent = 'E-mail inválido.'; return; }

  botao.disabled = true;
  try {
    const dados = await api(`/empresas/${estado.empresaId}/usuarios`, { method: 'POST', body: { nome, email } });
    aoCriar();
    mostrarAcesso(dados);
  } catch (e) {
    erro.textContent = e.message;
    botao.disabled = false;
  }
}

function mostrarAcesso({ usuario, senha, ja_tinha_conta }) {
  const dlg = $('#dlgNovo');
  const texto = ja_tinha_conta
    ? `<p class="${dialogTexto}">${esc(usuario.nome)} já tinha conta no HelpMe. A pessoa foi adicionada a esta empresa e continua entrando com a senha que já usa.</p>`
    : `<p class="${dialogTexto}">Passe estes dados a ${esc(usuario.nome)}. A senha só aparece agora. No primeiro acesso, a pessoa cria a própria senha e entra de novo. Se fechar sem anotar, exclua a conta e crie outra.</p>
      <p class="mb-1 text-[13.5px] font-semibold">E-mail</p>
      <p class="mb-3 rounded-lg bg-[#F4F6F8] px-3 py-2.5 break-all">${esc(usuario.email)}</p>
      <p class="mb-1 text-[13.5px] font-semibold">Senha temporária</p>
      <p class="mb-4 rounded-lg bg-[#F4F6F8] px-3 py-2.5 font-mono text-lg tracking-wide">${esc(senha)}</p>`;
  const copiarDados = ja_tinha_conta ? '' : `<button type="button" class="${classesBotao({ block: true })}" id="copiarAcesso">Copiar e-mail e senha</button>`;

  dlg.innerHTML = `
    <h3 class="${dialogTitulo}">${ja_tinha_conta ? 'Pessoa adicionada' : 'Conta criada'}</h3>
    ${texto}
    <div class="grid gap-2.5">
      ${copiarDados}
      <button type="button" class="${classesBotao({ ghost: true, block: true })}" id="fecharAcesso">Concluir</button>
    </div>`;

  $('#copiarAcesso')?.addEventListener('click', () => {
    copiar(`E-mail: ${usuario.email}\nSenha: ${senha}`, 'E-mail e senha copiados.');
  });
  $('#fecharAcesso').addEventListener('click', () => dlg.close());
}

async function excluirUsuario(botao) {
  const confirmou = await confirmar(
    `Excluir ${botao.dataset.nome}?`,
    botao.dataset.perfil === 'tecnico'
      ? 'A conta deste técnico sai da empresa. Os colaboradores que ele cadastrou continuam. Chamados em que ele era responsável ficam sem responsável.'
      : 'A conta e todos os chamados abertos por este colaborador serão removidos. Esta ação não pode ser desfeita.',
    'Excluir'
  );
  if (!confirmou) return;

  try {
    await api(`/empresas/${estado.empresaId}/usuarios/${botao.dataset.id}`, { method: 'DELETE' });
    toast('Usuário excluído.');
    viewUsuarios();
  } catch (e) {
    toast(e.message, true);
  }
}
