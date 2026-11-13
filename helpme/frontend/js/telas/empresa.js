// Telas de criação de empresa e do código gerado (administrador)
import { api } from '../api.js';
import { estado } from '../estado.js';
import { rotear } from '../navegacao.js';
import { selecionarEmpresa, sair } from '../sessao.js';
import { $, esc, copiar, lerLogo } from '../utils.js';

export function telaEmpresaForm() {
  estado.logoTemp = null;
  const podeCancelar = estado.empresas.length > 0; // quem já tem empresa pode voltar

  $('#app').innerHTML = `
    <div class="card-centro">
      <form class="painel-form" id="f" novalidate>
        <h2>${podeCancelar ? 'Nova empresa' : 'Cadastre sua empresa'}</h2>
        <p class="sub">Informe o nome e o logotipo. Ao concluir, geramos o código para seus funcionários entrarem.</p>
        <label class="campo"><span>Nome da empresa</span><input type="text" name="nome" maxlength="80" required></label>
        <label class="logo-up">
          <span class="ph" id="prev">+</span>
          <span><strong>Logotipo da empresa</strong><span class="muted" id="logoTxt">Clique para escolher uma imagem</span></span>
          <input type="file" id="logo" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml">
        </label>
        <p class="erro" id="erro" role="alert"></p>
        <div class="acoes">
          <button type="button" class="btn ghost" id="voltar">${podeCancelar ? 'Cancelar' : 'Sair'}</button>
          <button class="btn" id="enviar">Criar empresa</button>
        </div>
      </form>
    </div>`;

  $('#logo').addEventListener('change', async (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;
    try {
      estado.logoTemp = await lerLogo(arquivo);
      $('#prev').outerHTML = `<img id="prev" src="${estado.logoTemp}" alt="Prévia do logotipo">`;
      $('#logoTxt').textContent = arquivo.name;
      $('#erro').textContent = '';
    } catch (e) {
      $('#erro').textContent = e.message;
    }
  });

  $('#voltar').addEventListener('click', () => {
    if (podeCancelar) { estado.criandoEmpresa = false; rotear(); }
    else sair();
  });

  $('#f').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const nome = evento.target.nome.value.trim(), erro = $('#erro'), botao = $('#enviar');

    if (nome.length < 2) { erro.textContent = 'Informe o nome da empresa.'; return; }
    if (!estado.logoTemp) { erro.textContent = 'Escolha o logotipo da empresa.'; return; }

    botao.disabled = true;
    try {
      const { empresa } = await api('/empresas', { method: 'POST', body: { nome, logo: estado.logoTemp } });
      estado.empresas.push(empresa);
      selecionarEmpresa(empresa.id);
      estado.criandoEmpresa = false;
      estado.empresaNova = empresa; // faz a tela do código aparecer
      rotear();
    } catch (e) {
      erro.textContent = e.message;
      botao.disabled = false;
    }
  });
}

export function telaEmpresaCriada() {
  const empresa = estado.empresaNova;

  $('#app').innerHTML = `
    <div class="card-centro">
      <div class="painel-form centro">
        <img class="emp-big" src="${esc(empresa.logo)}" alt="">
        <h2 style="margin-top:14px">${esc(empresa.nome)} está pronta</h2>
        <p class="sub">Passe este código aos seus funcionários. Com ele, cada um cria a conta e já entra direto na empresa.</p>
        <div class="codigo-grande" aria-label="Código da empresa">${esc(empresa.codigo)}</div>
        <div class="acoes">
          <button class="btn ghost" id="copiar">Copiar código</button>
          <button class="btn" id="ir">Ir para o painel</button>
        </div>
      </div>
    </div>`;

  $('#copiar').addEventListener('click', () => copiar(empresa.codigo));
  $('#ir').addEventListener('click', () => {
    estado.empresaNova = null;
    estado.abaAdmin = 'chamados';
    rotear();
  });
}
