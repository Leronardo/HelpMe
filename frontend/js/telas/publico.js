// Estrutura das páginas abertas sem login (planos e tutorial) e das telas cheias do administrador
import { marca } from '../utils.js';

// acoes = HTML dos botões do canto direito do topo
export function layoutPublico({ acoes = '', conteudo }) {
  return `
    <div class="pub">
      <header class="pub-topo"><div class="pub-topo-in">
        <span class="marca-txt">${marca()}HelpMe</span>
        <div class="acoes-topo">${acoes}</div>
      </div></header>
      <main class="pub-main">${conteudo}</main>
    </div>`;
}
