// // Criação e configuração de empresas (somente administrador)
// const empresaModel = require('../models/empresaModel');
// const { exigeLogin, exigeEmpresaDoAdmin } = require('../middlewares/autenticacao');
// const { planoDoUsuario } = require('../utils/apresentacao');
// const { HttpError } = require('../utils/erros');
// const { criado } = require('../utils/resposta');
// const { texto, logoValida } = require('../utils/validacao');

// function criar({ req, body }) {
//   const admin = exigeLogin(req, 'administrador');
//   const nome = texto(body.nome, 80);
//   const logo = String(body.logo || '');

//   if (nome.length < 2) throw new HttpError(400, 'Informe o nome da empresa.');
//   if (!logoValida(logo)) throw new HttpError(400, 'Envie um logotipo válido (imagem de até ~1 MB).');

//   // o plano define quantas empresas o administrador pode ter (402 = pagamento necessário)
//   const plano = planoDoUsuario(admin);
//   if (!plano) throw new HttpError(402, 'Escolha um plano para cadastrar sua empresa.');
//   if (empresaModel.contarDoAdmin(admin.id) >= plano.empresas) {
//     throw new HttpError(402, `Seu plano ${plano.nome} permite ${plano.empresas} ${plano.empresas === 1 ? 'empresa' : 'empresas'}. Faça upgrade para cadastrar mais.`);
//   }

//   const empresa = empresaModel.criar({ nome, logo, adminId: admin.id });
//   return criado({ empresa: empresaModel.comSetores(empresa) });
// }

// // Troca o nome e/ou o logotipo. O logotipo é opcional: se não vier, mantém o atual.
// function atualizar({ req, params, body }) {
//   const admin = exigeLogin(req, 'administrador');
//   const empresa = exigeEmpresaDoAdmin(admin, params.id);

//   const nome = texto(body.nome, 80);
//   if (nome.length < 2) throw new HttpError(400, 'Informe o nome da empresa.');

//   let logo = empresa.logo;
//   if (body.logo) {
//     if (!logoValida(String(body.logo))) throw new HttpError(400, 'Envie um logotipo válido (imagem de até ~1 MB).');
//     logo = String(body.logo);
//   }
//   const atualizada = empresaModel.atualizar(empresa.id, { nome, logo });
//   return { empresa: empresaModel.comSetores(atualizada) };
// }

// module.exports = { criar, atualizar };

// Criação e configuração de empresas (somente administrador)
const empresaModel = require('../models/empresaModel');
const { exigeLogin, exigeEmpresaDoAdmin } = require('../middlewares/autenticacao');
const { planoDoUsuario } = require('../utils/apresentacao');
const { HttpError } = require('../utils/erros');
const { criado } = require('../utils/resposta');
const { texto, logoValida } = require('../utils/validacao');

async function criar({ req, body }) {
  const admin = await exigeLogin(req, 'administrador');
  const nome = texto(body.nome, 80);
  const logo = String(body.logo || '');

  if (nome.length < 2) throw new HttpError(400, 'Informe o nome da empresa.');
  if (!logoValida(logo)) throw new HttpError(400, 'Envie um logotipo válido (imagem de até ~1 MB).');

  // o plano define quantas empresas o administrador pode ter (402 = pagamento necessário)
  const plano = planoDoUsuario(admin);
  if (!plano) throw new HttpError(402, 'Escolha um plano para cadastrar sua empresa.');
  if ((await empresaModel.contarDoAdmin(admin.id)) >= plano.empresas) {
    throw new HttpError(402, `Seu plano ${plano.nome} permite ${plano.empresas} ${plano.empresas === 1 ? 'empresa' : 'empresas'}. Faça upgrade para cadastrar mais.`);
  }

  const empresa = await empresaModel.criar({ nome, logo, adminId: admin.id });
  return criado({ empresa: await empresaModel.comSetores(empresa) });
}

// Troca o nome e/ou o logotipo. O logotipo é opcional: se não vier, mantém o atual.
async function atualizar({ req, params, body }) {
  const admin = await exigeLogin(req, 'administrador');
  const empresa = await exigeEmpresaDoAdmin(admin, params.id);

  const nome = texto(body.nome, 80);
  if (nome.length < 2) throw new HttpError(400, 'Informe o nome da empresa.');

  let logo = empresa.logo;
  if (body.logo) {
    if (!logoValida(String(body.logo))) throw new HttpError(400, 'Envie um logotipo válido (imagem de até ~1 MB).');
    logo = String(body.logo);
  }
  const atualizada = await empresaModel.atualizar(empresa.id, { nome, logo });
  return { empresa: await empresaModel.comSetores(atualizada) };
}

module.exports = { criar, atualizar };