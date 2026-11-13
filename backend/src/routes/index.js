const { adicionar } = require('./router');
const auth = require('../controllers/authController');
const empresa = require('../controllers/empresaController');
const chamado = require('../controllers/chamadoController');
const usuario = require('../controllers/usuarioController');
const plano = require('../controllers/planoController');
const setor = require('../controllers/setorController');
const vinculo = require('../controllers/vinculoController');

adicionar('POST', '/api/auth/admin/register', auth.registrarAdmin);
adicionar('POST', '/api/auth/admin/login', auth.loginAdmin);
adicionar('POST', '/api/auth/user/register', auth.registrarFuncionario);
adicionar('POST', '/api/auth/user/login', auth.loginFuncionario);
adicionar('GET', '/api/me', auth.me);

adicionar('GET', '/api/planos', plano.listar);
adicionar('POST', '/api/assinatura', plano.assinar);

adicionar('POST', '/api/empresas', empresa.criar);
adicionar('PUT', '/api/empresas/:id', empresa.atualizar);

adicionar('POST', '/api/empresas/:id/setores', setor.criar);
adicionar('DELETE', '/api/empresas/:id/setores/:sid', setor.excluir);

adicionar('GET', '/api/empresas/:id/chamados', chamado.listarDaEmpresa);
adicionar('GET', '/api/empresas/:id/stats', chamado.estatisticasDaEmpresa);
adicionar('PATCH', '/api/chamados/:id', chamado.atualizarStatus);

adicionar('GET', '/api/empresas/:id/usuarios', usuario.listar);
adicionar('DELETE', '/api/empresas/:id/usuarios/:uid', usuario.excluir);

adicionar('POST', '/api/vinculos', vinculo.entrarEmEmpresa);

adicionar('POST', '/api/chamados', chamado.criar);
adicionar('GET', '/api/meus-chamados', chamado.listarMeus);
