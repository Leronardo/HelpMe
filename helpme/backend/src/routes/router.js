// Mini roteador: guarda as rotas e descobre qual atende a requisição
const rotas = [];

// Exemplo de caminho: '/api/empresas/:id/chamados'  (":id" vira params.id)
function adicionar(metodo, caminho, handler) {
  const nomes = [];
  const regex = new RegExp('^' + caminho.replace(/:([a-z]+)/g, (_, nome) => {
    nomes.push(nome);
    return '([^/]+)';
  }) + '$');
  rotas.push({ metodo, regex, nomes, handler });
}

// Retorna { handler, params } ou null se nenhuma rota combinar
function encontrar(metodo, caminho) {
  for (const rota of rotas) {
    if (rota.metodo !== metodo) continue;
    const resultado = rota.regex.exec(caminho);
    if (!resultado) continue;

    const params = {};
    rota.nomes.forEach((nome, i) => { params[nome] = decodeURIComponent(resultado[i + 1]); });
    return { handler: rota.handler, params };
  }
  return null;
}

module.exports = { adicionar, encontrar };
