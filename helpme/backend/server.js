// Ponto de entrada do backend: node backend/server.js
const http = require('node:http');
const { PORT } = require('./src/config/env');
require('./src/config/database'); // abre o banco e cria as tabelas
const app = require('./src/app');

http.createServer(app).listen(PORT, () => {
  console.log(`HelpMe rodando em http://localhost:${PORT}`);
});
