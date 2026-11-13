const rotas = [];

function adicionar(metodo, caminho, handler) {
  const nomes = [];
  const regex = new RegExp('^' + caminho.replace(/:([a-z]+)/g, (_, nome) => {
    nomes.push(nome);
    return '([^/]+)';
  }) + '$');
  rotas.push({ metodo, regex, nomes, handler });
}

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
