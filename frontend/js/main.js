import { api } from './api.js';
import { estado } from './estado.js';
import { definirRotear } from './navegacao.js';
import { carregarMe, sair } from './sessao.js';
import { telaAuth, telaTrocarSenha } from './telas/auth.js';
import { telaInicio } from './telas/inicio.js';
import { telaEmpresaForm, telaEmpresaCriada } from './telas/empresa.js';
import { telaAdmin } from './telas/admin.js';
import { telaFuncionario } from './telas/funcionario.js';
import { receberRetornoPagamento, telaEscolherPlano } from './telas/planos.js';

function rotear() {
  if (!estado.usuario) {
    if ((estado.auth.modo || 'inicio') === 'inicio') return telaInicio();
    return telaAuth();
  }

  if (estado.usuario.perfil !== 'administrador' && estado.usuario.trocar_senha) return telaTrocarSenha();

  if (estado.usuario.perfil === 'administrador') {
    if (estado.empresaNova) return telaEmpresaCriada();
    if (!estado.plano || estado.escolhendoPlano) return telaEscolherPlano();
    if (!estado.empresas.length || estado.criandoEmpresa) return telaEmpresaForm();
    return telaAdmin();
  }
  // Técnico não contrata plano nem cria empresa: usa o que o supervisor já configurou.
  if (estado.usuario.perfil === 'tecnico') return telaAdmin();
  return telaFuncionario();
}

definirRotear(rotear);
window.addEventListener('sessao-expirada', sair);

async function iniciar() {
  try {
    const saude = await api('/saude');
    estado.semCodigo = !!saude.sem_codigo;
  } catch {
    estado.semCodigo = false;
  }
  if (estado.token) {
    try {
      await carregarMe();
    } catch {
      estado.token = null;
      localStorage.removeItem('helpme_token');
    }
  }
  if (estado.token) await receberRetornoPagamento();
  rotear();
}

iniciar();