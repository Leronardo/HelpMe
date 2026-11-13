// Ponto de entrada do backend: node backend/server.js
const http = require('node:http');
const { PORT } = require('./src/config/env');
const db = require('./src/config/database');
const app = require('./src/app');

async function iniciar() {
  try {
    await db.inicializar();
    console.log('Conectado ao SQL Server com sucesso.');

    http.createServer(app).listen(PORT, () => {
      console.log(`HelpMe rodando em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error('Falha ao conectar/inicializar o SQL Server:', erro.message);
    process.exit(1);
  }
}

iniciar();
