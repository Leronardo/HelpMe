// Entrega os arquivos do frontend (HTML, CSS, JS, imagens)
const fs = require('node:fs');
const path = require('node:path');
const { FRONTEND_DIR } = require('../config/env');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

function servir(res, caminhoUrl) {
  let relativo = decodeURIComponent(caminhoUrl);
  if (relativo === '/') relativo = '/index.html';

  const arquivo = path.normalize(path.join(FRONTEND_DIR, relativo));
  // impede acessar arquivos fora da pasta do frontend (ex.: /../backend)
  if (!arquivo.startsWith(FRONTEND_DIR)) {
    res.writeHead(403);
    return res.end();
  }

  fs.readFile(arquivo, (erro, conteudo) => {
    if (erro) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Não encontrado');
    }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] || 'application/octet-stream' });
    res.end(conteudo);
  });
}

module.exports = { servir };
