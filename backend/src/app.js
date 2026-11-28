const { encontrar } = require('./routes/router');
require('./routes');
const { servir } = require('./middlewares/arquivosEstaticos');
const { HttpError } = require('./utils/erros');

const LIMITE_CORPO = 3_000_000;

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    const partes = [];
    let tamanho = 0;
    req.on('data', (parte) => {
      tamanho += parte.length;
      if (tamanho > LIMITE_CORPO) {
        reject(new HttpError(413, 'Requisição muito grande.'));
        req.destroy();
        return;
      }
      partes.push(parte);
    });
    req.on('end', () => {
      if (!partes.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(partes).toString('utf8')));
      } catch {
        reject(new HttpError(400, 'JSON inválido.'));
      }
    });
    req.on('error', reject);
  });
}

function responderJson(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(dados));
}

async function app(req, res) {
  const url = new URL(req.url, 'http://localhost');

  try {
    if (!url.pathname.startsWith('/api/')) return servir(res, url.pathname);

    const rota = encontrar(req.method, url.pathname);
    if (!rota) throw new HttpError(404, 'Rota não encontrada.');

    const corpoPermitido = ['POST', 'PATCH', 'PUT'].includes(req.method);
    const body = corpoPermitido ? await lerCorpo(req) : {};
    const query = Object.fromEntries(url.searchParams);

    const resultado = await rota.handler({ req, params: rota.params, body, query });
    if (resultado && resultado.status) return responderJson(res, resultado.status, resultado.data);
    responderJson(res, 200, resultado);
  } catch (erro) {
    if (erro instanceof HttpError) return responderJson(res, erro.status, { erro: erro.message });
    console.error(erro);
    responderJson(res, 500, { erro: 'Erro interno do servidor.' });
  }
}

module.exports = app;
