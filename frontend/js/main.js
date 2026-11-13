// Ponto de entrada do frontend: decide qual tela mostrar
import { estado } from './estado.js';
import { definirRotear } from './navegacao.js';
import { carregarMe, sair } from './sessao.js';
import { telaAuth } from './telas/auth.js';
import { telaEmpresaForm, telaEmpresaCriada } from './telas/empresa.js';
import { telaAdmin } from './telas/admin.js';
import { telaFuncionario } from './telas/funcionario.js';
import { telaEscolherPlano } from './telas/planos.js';
import { telaRecepcao } from './telas/recepcao.js';

function rotear() {
  // sem login: começa pela recepção; login/cadastro aparece quando a pessoa escolhe entrar ou criar conta
  if (!estado.usuario) return estado.publico === 'auth' ? telaAuth() : telaRecepcao();

  if (estado.usuario.perfil === 'administrador') {
    if (estado.empresaNova) return telaEmpresaCriada();                    // acabou de criar: mostra o código
    if (!estado.plano || estado.escolhendoPlano) return telaEscolherPlano(); // precisa de um plano
    if (!estado.empresas.length || estado.criandoEmpresa) return telaEmpresaForm();
    return telaAdmin();
  }
  return telaFuncionario();
}

definirRotear(rotear);
window.addEventListener('sessao-expirada', sair);

// Ao abrir o site: se já existe um login salvo, tenta continuar dele
async function iniciar() {
  if (estado.token) {
    try {
      await carregarMe();
    } catch {
      estado.token = null;
      localStorage.removeItem('helpme_token');
    }
  }
  rotear();
}

iniciar();
