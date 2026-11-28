# HelpMe

Sistema de chamados para empresa. O supervisor cria a conta, escolhe o plano e cadastra a empresa e os técnicos. O técnico cadastra os colaboradores e cuida dos chamados. O colaborador abre o pedido e acompanha responsável, status e observações.

Um único processo Node entrega o site e a API. O banco é um arquivo SQLite. O Prisma aplica as migrations ao iniciar: se o arquivo não existe, ele é criado; se já existe, só entra o que ainda não foi aplicado.

## Registro por tópico

A implementação abaixo entrou em **27/11/2026 às 16:44** (horário de Brasília).

### Entrada, conta e planos

Já estava feito: tela inicial com a apresentação do sistema, os valores e o botão Crie sua conta aqui; login único; cadastro do supervisor com código de e-mail opcional; recuperação de senha; planos Essencial, Duplo, Trio e Personalizado; pagamento em teste ou Mercado Pago (PIX e cartão); publicação descrita para o Render.

Implementado em 27/11/2026 às 16:44: os textos da entrada passam a falar em supervisor, técnico e colaborador. O botão de quem ainda não tem conta diz "Criar conta de supervisor".

### Hierarquia

Já estava feito: dois papéis. O administrador criava a empresa e todas as contas. O funcionário só abria chamado. A senha temporária aparecia uma vez. O nome da conta e o da pessoa criada só aceitam letras e espaços.

Implementado em 27/11/2026 às 16:44: três papéis. O supervisor (conta `administrador`) cria só técnicos. O técnico cria só colaboradores (conta `funcionario`). O colaborador não cria conta. O supervisor vê a equipe inteira e pode excluir técnico ou colaborador. O técnico vê e exclui só colaboradores. Um e-mail que já é de outro papel é recusado. O mesmo papel, em outra empresa, entra com a senha que já usa.

### Chamados

Já estava feito: o colaborador abre o chamado com título, setor, nível e descrição. O supervisor filtra, busca e troca o status entre Aberto, Em análise e Concluído. O painel soma a semana e o mês.

Implementado em 27/11/2026 às 16:44: cada chamado tem um responsável, que é um técnico da empresa ou fica sem responsável. O status ganhou Aguardando recursos. Supervisor e técnico registram observações com o nome de quem escreveu e a data. O colaborador vê responsável, status e observações, e não altera nenhum dos três. O painel do supervisor conta os chamados que aguardam recursos.

### E-mail, senha e banco

Já estava feito: senha com maiúscula, minúscula, número e caractere especial; código de e-mail com validade, limite de erros e intervalo de um minuto; SQLite com Prisma; tabelas de usuários, empresas, vínculos, setores, chamados, códigos e pagamentos.

Implementado em 27/11/2026 às 16:44: a coluna `responsavel_id` em `chamados` e a tabela `observacoes`. A migration é `20261127164500_hierarquia_chamados`. Técnico e colaborador usam a mesma troca de senha do primeiro acesso.

## Como rodar

Na pasta deste arquivo (a que tem o `package.json`), com Node.js **22.13 ou superior**:

```
npm start
```

Se faltar dependência, ou o `package-lock.json` estiver mais novo do que o que está instalado, esse comando roda o `npm install` antes de subir o site.

Abra http://localhost:3000

Para colocar o mesmo sistema na web, sem domínio e sem custo, siga [Publicar na web](#publicar-na-web).

`npm start` é o mesmo que `npm run start`. Não rode o HTML por outro servidor: a API e o site saem juntos da porta configurada.

O visual usa o Tailwind guardado em `frontend/vendor/tailwind.js`. O site não busca CSS na internet. As fontes do Google ainda são baixadas se houver rede; sem rede, o navegador usa a fonte do sistema. O picote dos bilhetes, as cores da marca e as transições leves ficam num bloco pequeno no `index.html`.

## Variáveis de ambiente

Arquivo `.env` na raiz (o modelo está em `.env.example`). Sem esse arquivo, a porta é 3000, o banco é `helpme.db`, o pagamento fica em teste, o fuso é Brasília e o segredo do token é gerado e gravado num `.env` novo. O e-mail só sai com `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM` preenchidos. O `SMTP_HOST` do modelo é o Gmail; se a variável não existir, o servidor não envia. No Render não existe arquivo `.env`: os mesmos nomes são preenchidos no painel, como está em [Publicar na web](#publicar-na-web).

| Variável | Padrão | Uso |
|---|---|---|
| `PORT` | `3000` | Porta do servidor |
| `DATABASE_URL` | `file:../backend/data/helpme.db` | Arquivo SQLite. O caminho é relativo à pasta `prisma/` |
| `HELPME_SECRET` | gerado na primeira subida e gravado no `.env` | Segredo que assina o token de login |
| `PAGAMENTO_MODO` | `teste` | `teste` ativa o plano sem cobrar. `mercadopago` cobra por PIX ou cartão e só libera com pagamento aprovado |
| `MERCADOPAGO_ACCESS_TOKEN` | vazio | Access Token da aplicação. No teste e na produção ele começa com `APP_USR`. O de Teste não cobra; o de Produção cobra |
| `APP_URL` | `http://localhost:PORT` | Endereço em que o HelpMe está aberto. O cartão volta para cá depois do Mercado Pago. O PIX não usa |
| `EMAIL_CODIGO` | `true` | `true` exige o código de e-mail. `false` cria a conta e troca a senha sem código |
| `TZ_OFFSET_MIN` | `-180` | Fuso, em minutos, para agrupar chamados por semana e mês. `-180` é Brasília |
| `SMTP_HOST` | vazio; `smtp.gmail.com` no modelo | Servidor SMTP que envia o código de verificação |
| `SMTP_PORT` | `587` | Porta do SMTP. `465` liga a conexão segura |
| `SMTP_SECURE` | `false` | `true` força TLS direto. Na porta `465` isso já vale |
| `SMTP_USER` | vazio | O Gmail que envia o código |
| `SMTP_PASS` | vazio | Senha de app do Google, de 16 caracteres. Não é a senha de entrar no Gmail |
| `SMTP_FROM` | vazio | Remetente, no formato `HelpMe <seuemail@gmail.com>`, com o mesmo Gmail do `SMTP_USER` |

`backend/data/` (o banco) e `.env` não entram no git.

### Gmail, de graça

O modelo do `.env` já aponta para o Gmail. Falta criar a senha de app nesta ordem:

1. Ative a verificação em duas etapas: https://myaccount.google.com/signinoptions/two-step-verification
2. Crie a senha de app com o nome HelpMe e copie os 16 caracteres: https://myaccount.google.com/apppasswords

Cole o Gmail em `SMTP_USER`, a senha de app em `SMTP_PASS` e o remetente em `SMTP_FROM`. Salve o `.env` e rode `npm start` de novo. A senha de app fica só no `.env`.

## O que cada pessoa faz

**Entrada.** A primeira tela apresenta o sistema, os valores dos planos e o botão Crie sua conta aqui. Entrar abre o login, com e-mail e senha. O HelpMe lê a conta e abre o painel de supervisor, o de técnico ou o de colaborador. Com `EMAIL_CODIGO=false` a conta nasce na hora e a recuperação grava a senha nova sem código. Com `EMAIL_CODIGO=true`, o sistema envia um código de 6 dígitos para o e-mail e só cria a conta depois da confirmação. "Esqueci minha senha" segue a mesma regra. Técnico e colaborador não se cadastram por aqui: usam Entrar, com os dados que receberam.

**Supervisor.** É a conta criada no site (no banco, `perfil` `administrador`). Escolhe um plano, cadastra a empresa (nome e logotipo) e recebe um código de 6 caracteres. O logotipo pode ser um arquivo ou uma das 8 opções prontas: Sede, Consultoria, Comércio, Indústria, Finanças, Tecnologia, Logística e Equipe.

- Chamados: filtro por nível, status e setor, busca por título, colaborador ou responsável. Escolhe o técnico responsável, troca o status (Aberto, Em análise, Aguardando recursos, Concluído) e registra observações.
- Painel: totais, inclusive aguardando recursos, e tabelas das últimas 8 semanas e dos últimos 6 meses.
- Equipe: cria a conta do técnico (senha temporária mostrada uma vez) e vê também os colaboradores cadastrados pelos técnicos. Pode excluir os dois.
- Configurar empresa: nome, logotipo e setores. A empresa nova já nasce com TI, RH, Financeiro, Comercial, Operações, Infraestrutura e Outro. Cada empresa pode ter até 20 setores.
- Plano e preços: ver o plano atual e trocar.

Pode ter várias empresas, até o limite do plano, e alternar no menu. "+ Nova empresa" com o plano cheio leva para a troca de plano e, ao ativar um plano com vaga, abre o cadastro da empresa nova.

**Técnico.** Não cria a própria conta. O supervisor passa o e-mail e a senha temporária. No primeiro acesso, define uma senha nova e entra de novo. Na aba Colaboradores, cria a conta de cada colaborador. Na aba Chamados, define o responsável, troca o status e escreve observações. Não mexe em plano, empresa nem setores. "Ajuda" mostra o passo a passo.

**Colaborador.** Não cria a própria conta. O técnico passa o e-mail e a senha temporária. No primeiro acesso, define uma senha nova e entra de novo. Abre chamados nos setores da empresa e vê, em cada um, o responsável, o status e as observações. Não muda status nem escreve observação. Quem já tem conta pode entrar em outra empresa com "+ Entrar em outra empresa" e o código. "Ajuda" mostra o passo a passo.

O e-mail é único. Uma conta é supervisor, técnico ou colaborador, nunca mais de um papel. Se o e-mail já existe com o mesmo papel, a pessoa entra na empresa e continua com a senha que já usa.

**Nome.** Na criação da conta de supervisor, do técnico e do colaborador, o nome só aceita letras e espaços. Números e caracteres especiais são recusados. Acentos continuam válidos.

**Senha.** A do supervisor, na criação da conta, e a nova senha do técnico e do colaborador: 8 a 128 caracteres, com maiúscula, minúscula, número e caractere especial. A tela marca cada regra enquanto a pessoa digita. A senha temporária já nasce nesse formato. O login não exige o formato, então uma senha antiga continua valendo. O e-mail automático é só o código de confirmação do cadastro de supervisor e o código de recuperação de senha.

## Planos

Definidos em `backend/src/config/planos.js`.

| Plano | Empresas | Preço |
|---|---|---|
| Essencial | 1 | R$ 35/mês |
| Duplo | 2 | R$ 65/mês |
| Trio | 3 | R$ 90/mês |
| Personalizado | 4 a 50, a pessoa escolhe | R$ 28 por empresa |

O servidor recusa cadastrar mais empresas do que o plano permite e recusa um plano menor do que a quantidade de empresas que já existe. O plano não expira.

Com `PAGAMENTO_MODO=teste` o plano entra na hora e ninguém é cobrado. Com `PAGAMENTO_MODO=mercadopago` a pessoa escolhe PIX ou cartão. O plano só é gravado quando o Mercado Pago confirma a order. O aviso que volta na URL não libera nada sozinho.

### Onde fica o Access Token

A aplicação é criada uma vez. O token de teste e o de produção saem dela.

1. Abra https://www.mercadopago.com.br/developers/panel/app e entre na conta do Mercado Pago.
2. Clique em **Criar aplicação**.
3. Em **Escolha uma solução para integrar**, marque **Checkout Pro**.
4. Em **Outros dados**, no tipo de API, marque **API de Orders**. A API de Preferences aparece como descontinuada e o HelpMe não usa ela.
5. Dê um nome, por exemplo HelpMe, aceite os termos e crie.
6. Abra a aplicação. No seletor do topo, escolha o ambiente:
   - **Teste** para o trabalho, sem cobrança real.
   - **Produção** só quando for cobrar de verdade.
7. Em **Credenciais**, copie o **Access Token**. Não copie a Public Key. Nos dois ambientes o token começa com `APP_USR`.
8. Cole em `MERCADOPAGO_ACCESS_TOKEN` no `.env`. Deixe `PAGAMENTO_MODO=mercadopago`. No teste local, `APP_URL` fica `http://localhost:3000`.
9. Salve e rode `npm start` de novo. O servidor só lê o `.env` na subida.

`APP_URL` é o endereço em que o HelpMe está aberto. O pagamento no cartão sai do sistema e abre a página do Mercado Pago. Na volta, o Mercado Pago manda a pessoa para `APP_URL/?pagamento=ID`. O HelpMe lê esse número, consulta a order e só então libera o plano. O PIX não usa essa variável: o QR Code aparece na própria tela. Se a linha não existir, o servidor assume `http://localhost:` mais a porta. No Render, o valor passa a ser `https://nome-do-servico.onrender.com`, sem barra no final.

A conta de testes não tem mensalidade. A taxa do Mercado Pago só incide numa cobrança real, feita com o token de Produção.

### O que o HelpMe fala com a API

Tudo passa por `POST` e `GET` em `https://api.mercadopago.com/v1/orders`, com o header `Authorization: Bearer` e o Access Token. Cada `POST` manda um `X-Idempotency-Key` novo. O HelpMe grava o pedido na tabela `pagamentos` antes de chamar o Mercado Pago e guarda o `id` da order em `mp_id`.

O plano só entra se a consulta `GET /v1/orders/{id}` voltar com `status` `processed` e `status_detail` `accredited`, o `external_reference` for o id do pedido local e o valor pago for o do plano. `action_required` e `processing` continuam bloqueados. `failed`, `canceled` e `refunded` marcam o pedido como recusado.

**PIX.** O HelpMe envia uma order `online` com `processing_mode` `automatic` e um pagamento `pix` do tipo `bank_transfer`. A resposta traz o QR Code e o código copia e cola, mostrados na própria tela. O navegador consulta `POST /api/assinatura/pagamentos/:id` a cada 3 segundos. No ambiente de teste o pagador vai com o nome `APRO`, e o Mercado Pago aprova sozinho em alguns segundos. O passo a passo oficial do teste está em https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/integration-test/pix

**Cartão.** O HelpMe envia uma order `online` com `processing_mode` `manual` e `capture_mode` `automatic`, em uma parcela, sem PIX, boleto nem saldo da conta. A resposta traz `checkout_url`. A pessoa paga na página do Mercado Pago e volta para `APP_URL/?pagamento=ID`. O servidor consulta a order de novo. No teste, o e-mail pode ser qualquer um válido. O nome do titular `APRO` e o CPF `12345678909` aprovam. Cartões: Mastercard `5480 8328 0103 3311`, Visa `4235 6477 2802 5682` e Elo débito `5067 7667 8388 8311`, validade `11/30`, código `123`. O American Express é `3753 651535 56885`, código `1234`, mesma validade. A lista oficial está em https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/integration-test/cards

### Produção

Troque o Access Token pelo de **Produção**, mantenha `PAGAMENTO_MODO=mercadopago` e aponte `APP_URL` para o endereço público do HelpMe, com `https://`. No Render, esse endereço é o `https://nome-do-servico.onrender.com`. Salve as variáveis e rode um novo deploy. O nome `APRO` e os números de teste deixam de aprovar. O PIX gera uma cobrança real, então a conta do Mercado Pago precisa ter uma chave PIX. O cartão cobra de verdade. O plano continua saindo só depois do `processed` / `accredited`.

## Publicar na web

O site e a API sobem juntos no [Render](https://render.com), no plano gratuito. O endereço fica `https://nome-do-servico.onrender.com`. Não precisa comprar domínio. O banco continua o SQLite do próprio serviço: quando o plano gratuito desliga a instância, o arquivo some e a próxima visita cria um banco vazio. As contas precisam ser feitas de novo. O código e as variáveis do painel permanecem.

O plano gratuito não cobra. Não mude o tipo da instância para um plano pago. Há 750 horas por mês, o bastante para um serviço. Se essas horas acabarem, o site fica suspenso até o mês seguinte e só voltar a abrir o link não liga de novo.

### 1. Conferir o que não vai para o GitHub

Na pasta do `package.json`, o `.gitignore` já deixa de fora `.env`, `node_modules/` e `backend/data/`. Confira antes de enviar:

- O `.env` não entra no repositório. Ele tem o `HELPME_SECRET`, a senha de app do Gmail e o Access Token.
- O `helpme.db` não entra. No Render o arquivo nasce na subida, pelas migrations.
- A pasta enviada é a que contém o `package.json`, o `prisma/` e o `backend/`.

### 2. Enviar o código para o GitHub

Crie um repositório vazio em https://github.com/new. No computador, dentro da pasta do `package.json`:

```
git init
git add .
git status
git commit -m "Publicar o HelpMe"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

No `git status`, antes do commit, não pode aparecer `.env` nem `helpme.db`. Se o repositório já existe e a pasta do Git é a pasta pai, no Render o campo **Root Directory** deve ser `HelpMe-main`. Se o repositório é a própria pasta do `package.json`, deixe a raiz vazia.

### 3. Criar o serviço

1. Entre em https://dashboard.render.com e crie a conta com o GitHub.
2. **New** e depois **Web Service**.
3. Conecte o GitHub se o Render pedir, e escolha o repositório.
4. Preencha:
   - **Name:** um nome curto, sem espaço. O endereço será `https://esse-nome.onrender.com`. Anote esse endereço: ele entra em `APP_URL`.
   - **Region:** a mais próxima do Brasil entre as que o plano gratuito mostrar.
   - **Branch:** `main`.
   - **Root Directory:** vazio, ou `HelpMe-main` se o `package.json` não estiver na raiz do repositório.
   - **Runtime:** `Node`.
   - **Build Command:** `npm install`.
   - **Start Command:** `npm start`.
   - **Instance Type:** `Free`.
5. Ainda não clique em criar se a tela já mostrar as variáveis. O passo seguinte preenche elas antes do primeiro deploy. Se o botão de criar vier antes, crie e abra **Environment** em seguida.

### 4. Variáveis de ambiente

No serviço, abra **Environment** e adicione uma linha para cada nome. Os valores são os do seu `.env` local, com três diferenças: não crie `PORT`, `APP_URL` usa o endereço do Render, e `HELPME_SECRET` é colado no painel em vez de gravado num arquivo.

| Nome | O que colocar |
|---|---|
| `DATABASE_URL` | `file:../backend/data/helpme.db` |
| `HELPME_SECRET` | Uma sequência longa, gerada no seu computador com o comando abaixo. Use a mesma em todos os deploys |
| `PAGAMENTO_MODO` | `mercadopago` para demonstrar PIX e cartão. `teste` ativa o plano sem cobrar |
| `MERCADOPAGO_ACCESS_TOKEN` | O Access Token de **Teste**. O de Produção só quando for cobrar de verdade |
| `APP_URL` | `https://nome-do-servico.onrender.com`, sem barra no final |
| `EMAIL_CODIGO` | `false` para criar a conta sem e-mail na apresentação. `true` exige o SMTP abaixo |
| `TZ_OFFSET_MIN` | `-180` |
| `SMTP_HOST` | `smtp.gmail.com`, só se `EMAIL_CODIGO=true` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | O Gmail, só se for enviar código |
| `SMTP_PASS` | A senha de app, só se for enviar código |
| `SMTP_FROM` | `HelpMe <seuemail@gmail.com>`, só se for enviar código |

Não defina `PORT`. O Render escolhe a porta e o HelpMe escuta nela. Se `PORT=3000` for parar no painel, o site não abre.

Gere o segredo no seu computador e copie a linha inteira para `HELPME_SECRET`:

```
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Salve as variáveis. Se o serviço já existia, use **Manual Deploy** e depois **Deploy latest commit**.

### 5. Esperar o deploy e testar

1. Abra **Logs**. O build termina com o `npm install`. Em seguida o start mostra as migrations aplicadas e a linha `HelpMe em http://localhost:` seguida da porta que o Render escolheu.
2. Abra `https://nome-do-servico.onrender.com`. A primeira resposta pode levar cerca de um minuto.
3. Confira `https://nome-do-servico.onrender.com/api/saude`. A resposta traz `ok` verdadeiro. Com `EMAIL_CODIGO=false`, `sem_codigo` também vem verdadeiro.
4. Crie a conta de supervisor no próprio site, escolha o plano e, se o pagamento estiver em `mercadopago`, faça um PIX ou um cartão de teste. O cartão só volta para o HelpMe se `APP_URL` for exatamente o endereço do Render.

### 6. Quando o site dorme

Depois de cerca de 15 minutos sem visita, a instância gratuita desliga. A próxima visita liga o processo sozinho. A pessoa vê uma tela de carregamento do Render por cerca de um minuto e, em seguida, o HelpMe. O banco daquela instância não volta: as contas, empresas e chamados foram apagados com o arquivo. Crie a conta de supervisor outra vez.

Antes da apresentação, abra o link, espere carregar e deixe a conta pronta. Enquanto alguém usar o site, ele não dorme.

O Render também pode reiniciar a instância gratuita. O efeito no banco é o mesmo: o arquivo some e as migrations criam um banco vazio na subida seguinte.

### 7. Quando mudar o código

No computador, dentro da pasta do `package.json`:

```
git add .
git commit -m "Descreva a mudança"
git push
```

O Render começa outro deploy ao receber o push na branch `main`. Se isso estiver desligado, use **Manual Deploy**. Cada deploy novo também zera o SQLite.

Se o log mostrar falha nas migrations, confira se `DATABASE_URL` está exatamente `file:../backend/data/helpme.db`. Se a página não abrir e o log mostrar a porta 3000, apague a variável `PORT` e faça outro deploy.

## Estrutura

```
HelpMe-main/
├── package.json          # npm install, npm start
├── .env                  # porta, banco, segredo, pagamento, e-mail, fuso, SMTP
├── prisma/
│   ├── schema.prisma     # modelos do banco
│   └── migrations/       # histórico aplicado pelo Prisma
├── backend/
│   ├── iniciar.js        # npm install se precisar, depois sobe o servidor
│   ├── server.js         # aplica as migrations e sobe o HTTP
│   ├── data/             # helpme.db (gerado)
│   └── src/
│       ├── app.js        # JSON da API ou arquivo do site
│       ├── config/       # env, Prisma, constantes, planos
│       ├── routes/       # lista de rotas e o mini roteador
│       ├── controllers/  # regra de cada rota
│       ├── models/       # consultas de cada tabela
│       ├── services/     # estatísticas, pagamento e e-mail
│       ├── middlewares/  # login e arquivos do site
│       └── utils/        # senha, token, validação, erro HTTP
└── frontend/
    ├── index.html        # tema, transições e o picote dos bilhetes
    ├── vendor/tailwind.js # Tailwind local, sem CDN
    └── js/
        ├── main.js       # escolhe a tela
        ├── ui.js         # classes e HTML que se repetem
        ├── logos.js, logoEscolha.js  # os 8 logotipos prontos
        ├── api.js, estado.js, sessao.js, navegacao.js, utils.js, senha.js, constantes.js
        └── telas/        # inicial, login, empresa, supervisor, técnico, colaborador, planos, tutorial
```

O frontend não tem framework. Cada tela devolve HTML e escuta os cliques. `js/ui.js` guarda botão, campo, tabela, selo, bilhete e o topo da escolha de plano, para as telas não repetirem a mesma classe.

## Banco

O Prisma (`prisma/schema.prisma`) é quem descreve as tabelas. Cada mudança vira uma pasta em `prisma/migrations`. Ao iniciar, `prisma migrate deploy` olha a tabela `_prisma_migrations`: o que já está registrado fica como está, e só o que falta é aplicado. Se `helpme.db` for apagado, a próxima subida cria o arquivo e aplica todas as migrations desde o início. No Render gratuito isso acontece em todo desligamento: o disco da instância é apagado e o banco nasce vazio.

Um banco criado antes do Prisma não tem essa tabela. Na primeira subida ele é renomeado para `helpme.legado.db` e o arquivo novo nasce vazio.

Tabelas: `usuarios` (e-mail único; `perfil` `administrador` é o supervisor, `tecnico` é o técnico, `funcionario` é o colaborador), `empresas`, `vinculos` (técnico ou colaborador em uma ou mais empresas), `setores` (o nome repetido na mesma empresa é barrado sem distinguir maiúsculas), `chamados` (com `responsavel_id` opcional, um técnico da empresa), `observacoes` (texto, nome de quem escreveu e data; o chamado some e a observação some junto), `codigos_email` (código de verificação, com validade e o momento em que foi usado), `pagamentos` (pedido do plano, método, valor, id da order no Mercado Pago e situação `pendente`, `aprovado` ou `recusado`).

Nada digitado vira comando SQL. Inserções que precisam acontecer juntas (empresa e setores padrão; conta do técnico ou do colaborador e o vínculo; remover a pessoa, os chamados que ela abriu e a conta) rodam numa transação.

## API

O corpo é JSON. Rotas protegidas pedem `Authorization: Bearer <token>`. O token dura 30 dias.

| Método | Rota | Quem |
|---|---|---|
| GET | `/api/saude` | público (`ok` e `sem_codigo`, este último espelha `EMAIL_CODIGO=false`) |
| GET | `/api/planos` | público |
| POST | `/api/auth/login` | os três (o e-mail define o perfil) |
| POST | `/api/auth/admin/codigo` | supervisor (`nome`, `email`, `senha`; envia o código, ou cria a conta se `EMAIL_CODIGO=false`) |
| POST | `/api/auth/admin/register` | supervisor (`email`, `codigo`; cria a conta) |
| POST | `/api/auth/recuperar/codigo` | os três (`email`; envia o código) |
| POST | `/api/auth/recuperar` | os três (`email`, `senha` nova; com `EMAIL_CODIGO=true`, também `codigo`) |
| POST | `/api/auth/codigo/reenviar` | os três (`email`, `tipo`: `cadastro` ou `recuperacao`) |
| POST | `/api/auth/user/senha` | técnico ou colaborador no primeiro acesso (`senha` nova) |
| GET | `/api/me` | os três |
| POST | `/api/assinatura` | supervisor (`plano_id`; no personalizado, `empresas`; com Mercado Pago, também `metodo`: `pix` ou `cartao`) |
| POST | `/api/assinatura/pagamentos/:id` | supervisor. Consulta a order no Mercado Pago e só então grava o plano. Se a volta trouxer `order_id`, envie em `mp_id` |
| POST | `/api/empresas` | supervisor |
| PUT | `/api/empresas/:id` | supervisor |
| POST | `/api/empresas/:id/setores` | supervisor |
| DELETE | `/api/empresas/:id/setores/:sid` | supervisor |
| GET | `/api/empresas/:id/chamados` | supervisor e técnico. Filtros: `nivel`, `status`, `setor`, `q`. A resposta traz os chamados e a lista de técnicos |
| GET | `/api/empresas/:id/stats` | supervisor |
| PATCH | `/api/chamados/:id` | supervisor e técnico (`status` e/ou `responsavel_id`; `null` tira o responsável) |
| POST | `/api/chamados/:id/observacoes` | supervisor e técnico (`texto`) |
| GET | `/api/empresas/:id/usuarios` | supervisor (técnicos e colaboradores) e técnico (só colaboradores) |
| POST | `/api/empresas/:id/usuarios` | supervisor cria técnico; técnico cria colaborador (`nome`, `email`; a senha temporária volta uma vez) |
| DELETE | `/api/empresas/:id/usuarios/:uid` | supervisor exclui técnico ou colaborador; técnico exclui só colaborador |
| POST | `/api/vinculos` | técnico ou colaborador (código de outra empresa) |
| POST | `/api/chamados` | colaborador |
| GET | `/api/meus-chamados?empresa=ID` | colaborador (inclui responsável e observações) |

Erro vem como `{ "erro": "mensagem" }` com o status HTTP (400, 401, 403, 404, 409, 402 quando falta plano, 429 no intervalo do código, 501 sem pagamento real, 502 quando o Mercado Pago ou o SMTP recusam, 503 quando falta o Access Token ou a configuração do SMTP).

## Segurança

- Senha guardada com scrypt e salt. Nunca em texto puro. A temporária só volta na resposta de quem criou a conta.
- Depois que o técnico ou o colaborador define a senha, o token do primeiro acesso deixa de valer. A pessoa precisa entrar de novo.
- Token é `dados.assinatura` (HMAC-SHA256). A comparação da assinatura é em tempo constante.
- Texto digitado é escapado antes de ir para o HTML.
- Cada rota confere o papel: empresa do supervisor, vínculo do técnico ou do colaborador, e se o responsável escolhido é técnico daquela empresa.
- O servidor não entrega arquivo fora da pasta `frontend`.
- O código de e-mail fica só como hash. Vale 15 minutos, aceita 5 erros e não serve de novo depois de usado. Um pedido novo invalida o anterior. Outro código só pode ser pedido depois de 1 minuto.
- Trocar a senha invalida o token antigo.
- Em produção, use HTTPS. No computador, o `HELPME_SECRET`, a senha do SMTP e o `MERCADOPAGO_ACCESS_TOKEN` ficam no `.env`. No Render, ficam só no painel **Environment**, nunca no GitHub.
