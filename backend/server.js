// // Ponto de entrada do backend: node backend/server.js
// const http = require('node:http');
// const { PORT } = require('./src/config/env');
// require('./src/config/database'); // abre o banco e cria as tabelas
// const app = require('./src/app');

// http.createServer(app).listen(PORT, () => {
//   console.log(`HelpMe rodando em http://localhost:${PORT}`);
// });

// Ponto de entrada do backend: node backend/server.js
const http = require('node:http');
const { PORT } = require('./src/config/env');
const bd = require('./src/config/database');
const app = require('./src/app');

bd.iniciar() // conecta no SQL Server e cria as tabelas
  .then(() => {
    http.createServer(app).listen(PORT, () => console.log(`HelpMe rodando na porta ${PORT}`));
  })
  .catch((erro) => {
    console.error('Não foi possível iniciar o banco de dados:', erro.message);
    process.exit(1);
  });
