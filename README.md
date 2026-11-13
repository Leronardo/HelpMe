# HelpMe — Sistema de chamados

Sistema de chamados com duas áreas: **administrador** e **funcionário**, vendido por assinatura (planos por número de empresas).

- Frontend: HTML, CSS e JavaScript (sem frameworks)
- Backend: Node.js (com driver oficial `mssql` para SQL Server)
- Banco de dados: **SQL Server**

## Como rodar
1. Instale o Node.js **20 ou superior** (https://nodejs.org) e tenha uma instância do **SQL Server** acessível.
2. Abra o terminal **na pasta do projeto** (a que tem o `package.json`) e instale a dependência do SQL Server:
   ```
   npm install
   ```
3. Configure as variáveis de ambiente de conexão (copie `.env.example` para `.env` e ajuste se necessário):
   ```
   cp .env.example .env
   ```
   Parâmetros principais no `.env`:
   - `DB_HOST` (padrão: `localhost`)
   - `DB_PORT` (padrão: `1433`)
   - `DB_USER` (padrão: `sa`)
   - `DB_PASSWORD` (sua senha do SQL Server)
   - `DB_NAME` (padrão: `helpme`)
   - `DB_ENCRYPT` (`false` para ambiente local, `true` para Azure SQL)
   - `DB_TRUST_SERVER_CERTIFICATE` (`true` para certificados locais autoassinados)
4. Inicie o servidor:
   ```
   npm start
   ```
   ou `node backend/server.js`.
5. Acesse **http://localhost:3000** (não use o Live Server: o backend também entrega o site).

O banco de dados (`DB_NAME`) e todas as tabelas em `backend/database/schema.sql` são criados automaticamente na primeira execução.
