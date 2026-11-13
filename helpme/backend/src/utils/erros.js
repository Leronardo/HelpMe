// Erro com código HTTP (400, 401, 404...) para responder ao frontend
class HttpError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

module.exports = { HttpError };
