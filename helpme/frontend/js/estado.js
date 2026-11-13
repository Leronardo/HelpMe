// Estado global da aplicação (quem está logado, empresa selecionada, etc.)
export const estado = {
  token: localStorage.getItem('helpme_token'),
  usuario: null,
  plano: null,                                                    // plano do administrador
  empresas: [],                                                   // empresas do administrador ou do funcionário
  empresaId: Number(localStorage.getItem('helpme_empresa')) || null, // empresa selecionada
  planos: [],                                                     // planos fixos (vem do backend)
  personalizado: null,                                            // regras do plano personalizado (vem do backend)
  modoTeste: false,                                               // true = pagamento ainda não é cobrado
  auth: { modo: 'entrar', perfil: 'funcionario' },                // aba da tela de login
  publico: null,                                                  // sem login: null = recepção, 'auth' = login/cadastro
  tutorialPerfil: 'funcionario',                                  // aba do tutorial na recepção
  abaAdmin: 'chamados',                                           // chamados | painel | usuarios | config | plano
  funcVista: 'chamados',                                          // chamados | tutorial (funcionário)
  criandoEmpresa: false,
  escolhendoPlano: false,                                         // força a tela de escolha de plano
  avisoPlano: '',                                                 // mensagem exibida na escolha de plano
  empresaNova: null,                                              // empresa recém-criada (mostra o código)
  logoTemp: null,                                                 // logotipo escolhido no formulário
};
