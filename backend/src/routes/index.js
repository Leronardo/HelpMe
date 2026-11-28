const { SEM_CODIGO_EMAIL } = require('../config/env');
const { adicionar } = require('./router');
const auth = require('../controllers/authController');
const empresa = require('../controllers/empresaController');
const chamado = require('../controllers/chamadoController');
const usuario = require('../controllers/usuarioController');
const plano = require('../controllers/planoController');
const setor = require('../controllers/setorController');
const vinculo = require('../controllers/vinculoController');

adicionar('GET', '/api/saude', () => ({ ok: true, sem_codigo: SEM_CODIGO_EMAIL }));
adicionar('POST', '/api/auth/admin/codigo', auth.solicitarCadastro);
adicionar('POST', '/api/auth/admin/register', auth.registrarAdmin);
adicionar('POST', '/api/auth/recuperar/codigo', auth.solicitarRecuperacao);
adicionar('POST', '/api/auth/recuperar', auth.confirmarRecuperacao);
adicionar('POST', '/api/auth/codigo/reenviar', auth.reenviarCodigo);
adicionar('POST', '/api/auth/login', auth.login);
adicionar('POST', '/api/auth/user/senha', auth.definirSenha);
adicionar('GET', '/api/me', auth.me);

adicionar('GET', '/api/planos', plano.listar);
adicionar('POST', '/api/assinatura', plano.assinar);
adicionar('POST', '/api/assinatura/pagamentos/:id', plano.sincronizar);

adicionar('POST', '/api/empresas', empresa.criar);
adicionar('PUT', '/api/empresas/:id', empresa.atualizar);

adicionar('POST', '/api/empresas/:id/setores', setor.criar);
adicionar('DELETE', '/api/empresas/:id/setores/:sid', setor.excluir);

adicionar('GET', '/api/empresas/:id/chamados', chamado.listarDaEmpresa);
adicionar('GET', '/api/empresas/:id/stats', chamado.estatisticasDaEmpresa);
adicionar('PATCH', '/api/chamados/:id', chamado.atualizarStatus);
adicionar('POST', '/api/chamados/:id/observacoes', chamado.comentar);

adicionar('GET', '/api/empresas/:id/usuarios', usuario.listar);
adicionar('POST', '/api/empresas/:id/usuarios', usuario.criar);
adicionar('DELETE', '/api/empresas/:id/usuarios/:uid', usuario.excluir);

adicionar('POST', '/api/vinculos', vinculo.entrarEmEmpresa);

adicionar('POST', '/api/chamados', chamado.criar);
adicionar('GET', '/api/meus-chamados', chamado.listarMeus);
