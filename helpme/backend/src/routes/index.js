// Lista de todas as rotas da API
const { adicionar } = require('./router');
const auth = require('../controllers/authController');
const empresa = require('../controllers/empresaController');
const chamado = require('../controllers/chamadoController');
const usuario = require('../controllers/usuarioController');
const plano = require('../controllers/planoController');
const setor = require('../controllers/setorController');
const vinculo = require('../controllers/vinculoController');

// Autenticação
adicionar('POST', '/api/auth/admin/register', auth.registrarAdmin);
adicionar('POST', '/api/auth/admin/login', auth.loginAdmin);
adicionar('POST', '/api/auth/user/register', auth.registrarFuncionario);
adicionar('POST', '/api/auth/user/login', auth.loginFuncionario);
adicionar('GET', '/api/me', auth.me);

// Planos e assinatura
adicionar('GET', '/api/planos', plano.listar);
adicionar('POST', '/api/assinatura', plano.assinar);

// Empresas (administrador)
adicionar('POST', '/api/empresas', empresa.criar);
adicionar('PUT', '/api/empresas/:id', empresa.atualizar);

// Setores da empresa (administrador)
adicionar('POST', '/api/empresas/:id/setores', setor.criar);
adicionar('DELETE', '/api/empresas/:id/setores/:sid', setor.excluir);

// Chamados do administrador
adicionar('GET', '/api/empresas/:id/chamados', chamado.listarDaEmpresa);
adicionar('GET', '/api/empresas/:id/stats', chamado.estatisticasDaEmpresa);
adicionar('PATCH', '/api/chamados/:id', chamado.atualizarStatus);

// Funcionários da empresa (administrador)
adicionar('GET', '/api/empresas/:id/usuarios', usuario.listar);
adicionar('DELETE', '/api/empresas/:id/usuarios/:uid', usuario.excluir);

// Funcionário entra em mais uma empresa
adicionar('POST', '/api/vinculos', vinculo.entrarEmEmpresa);

// Chamados do funcionário
adicionar('POST', '/api/chamados', chamado.criar);
adicionar('GET', '/api/meus-chamados', chamado.listarMeus);
