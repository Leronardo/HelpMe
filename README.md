# HelpMe — Sistema de chamados

Sistema de chamados com duas áreas: **administrador** e **funcionário**, vendido por assinatura (planos por número de empresas).

- Frontend: HTML, CSS e JavaScript (sem frameworks)
- Backend: Node.js (sem bibliotecas externas)
- Banco de dados: SQL (SQLite)

## Como rodar
1. Instale o Node.js **22.13 ou superior** (https://nodejs.org).
2. Abra o terminal **na pasta do projeto** (a que tem o `package.json`) e rode:
   ```
   node backend/server.js
   ```
   ou `npm start`.
3. Acesse **http://localhost:3000** (não use o Live Server: o backend também entrega o site).

O banco é criado automaticamente em `backend/data/helpme.db`. Bancos criados por versões anteriores são atualizados sozinhos na primeira execução.

## Estrutura de pastas
```
helpme/
├── backend/
│   ├── server.js              # inicia o servidor
│   ├── database/schema.sql    # tabelas: usuarios, empresas, vinculos, setores, chamados
│   ├── data/                  # banco SQLite (criado automaticamente)
│   └── src/
│       ├── app.js             # recebe as requisições (site ou API)
│       ├── config/            # env, conexão com o banco, constantes e PLANOS
│       ├── routes/            # lista de rotas da API
│       ├── controllers/       # regras de cada rota (auth, empresa, setor, plano, chamado, usuário, vínculo)
│       ├── models/            # consultas SQL de cada tabela
│       ├── services/          # estatísticas e pagamento
│       ├── middlewares/       # autenticação e entrega dos arquivos do site
│       └── utils/             # senha, token, validações, erros
└── frontend/
    ├── index.html
    ├── css/                   # base, auth, admin, funcionario, publico, planos, tutorial, recepcao, responsivo
    └── js/
        ├── main.js            # decide qual tela mostrar
        ├── api.js, estado.js, sessao.js, navegacao.js, utils.js, constantes.js, senha.js
        └── telas/             # recepcao, auth, empresa, admin (+ chamados, painel, usuários, config), planos, tutorial, funcionario
```

## Como o sistema funciona
- **Recepção:** a primeira tela do site apresenta o HelpMe, mostra o tutorial (passo a passo para funcionário e para administrador), os planos e os botões de criar conta e entrar. Tudo isso antes de a pessoa criar uma conta.
- **Senha:** ao criar conta (administrador ou funcionário) a senha precisa ter 8 ou mais caracteres, com letra maiúscula, minúscula, número e caractere especial. A tela marca cada requisito enquanto a pessoa digita, e o backend confere as mesmas regras. No login nada muda, então contas antigas continuam entrando.
- **Administrador:** cria conta → escolhe um **plano** → cadastra a empresa (nome e logotipo) → recebe o **código da empresa**.
  - *Chamados:* filtros por nível, status e setor, busca por título ou nome, e troca de status (Aberto / Em análise / Concluído).
  - *Painel:* chamados por semana e por mês.
  - *Usuários:* lista dos funcionários e exclusão.
  - *Configurar empresa:* trocar nome e logotipo e cadastrar os **setores** da empresa.
  - *Plano e preços:* ver o plano atual e mudar de plano.
  - Pode ter várias empresas (conforme o plano) e alternar entre elas no menu lateral. Ao clicar em "+ Nova empresa" com o plano cheio, o sistema leva direto para a troca de plano (só aparecem planos com vaga) e, ao ativar, já abre o cadastro da nova empresa.
- **Funcionário:** cria conta com nome, e-mail, senha e o código da empresa e já entra. Depois, entra só com e-mail e senha.
  Abre chamados escolhendo entre os setores que o administrador cadastrou e vê o histórico. Pode trabalhar em **várias empresas**:
  usa "+ Entrar em outra empresa" com o código e troca pelo seletor no topo. O botão "Ajuda" mostra o passo a passo.

## Planos e cobrança
Os planos ficam em `backend/src/config/planos.js`. É só editar o arquivo:
- **Planos fixos:** Essencial (1 empresa, R$ 35), Duplo (2 empresas, R$ 65) e Trio (3 empresas, R$ 90).
- **Plano personalizado:** para 4 ou mais empresas (até 50). O administrador escolhe a quantidade e o preço é quantidade x R$ 28 por empresa (`precoPorEmpresa`).

O servidor **impede** cadastrar mais empresas do que o plano permite e impede trocar para um plano menor que a quantidade de empresas que já existe.

**Importante: a cobrança ainda não é real.** Em `backend/src/services/pagamento.js` o plano é ativado sem cobrar nada
(`PAGAMENTO_MODO=teste`, o padrão), e a tela avisa "modo de teste". Para ganhar dinheiro de verdade é preciso integrar um gateway
de pagamento com cobrança recorrente (por exemplo Mercado Pago, Asaas ou Stripe), implementar `cobrarAssinatura` e rodar com
`PAGAMENTO_MODO=producao`. Também será preciso tratar renovação mensal, falha de pagamento e cancelamento (hoje o plano não expira).

## Rotas da API
| Método | Rota | Quem usa |
|---|---|---|
| GET | `/api/planos` (planos fixos + regras do personalizado) | público |
| POST | `/api/auth/admin/register` e `/login` | administrador |
| POST | `/api/auth/user/register` e `/login` | funcionário |
| GET | `/api/me` | ambos |
| POST | `/api/assinatura` (`plano_id` e, no personalizado, `empresas`) | administrador |
| POST / PUT | `/api/empresas` e `/api/empresas/:id` | administrador |
| POST / DELETE | `/api/empresas/:id/setores` e `/:sid` | administrador |
| GET | `/api/empresas/:id/chamados` (filtros: `nivel`, `status`, `setor`, `q`) | administrador |
| GET | `/api/empresas/:id/stats` | administrador |
| GET / DELETE | `/api/empresas/:id/usuarios` e `/:uid` | administrador |
| PATCH | `/api/chamados/:id` (muda o status) | administrador |
| POST | `/api/vinculos` (entrar em outra empresa) | funcionário |
| POST | `/api/chamados` | funcionário |
| GET | `/api/meus-chamados?empresa=ID` | funcionário |

## Configurações opcionais (variáveis de ambiente)
- `PORT`: porta (padrão 3000)
- `PAGAMENTO_MODO`: `teste` (padrão) ou `producao`
- `TZ_OFFSET_MIN`: fuso para agrupar semanas e meses (padrão -180, Brasília)
- `HELPME_SECRET`: segredo dos tokens (se omitido, é gerado em `backend/data/secret.key`)

## Segurança
- Senhas guardadas com hash (scrypt), nunca em texto puro.
- Todo texto digitado é escapado antes de aparecer na tela.
- Cada rota confere se a empresa pertence ao administrador (ou se o funcionário faz parte dela).
- Em produção, use HTTPS.
