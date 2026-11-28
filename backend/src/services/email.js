const nodemailer = require('nodemailer');
const { SMTP } = require('../config/env');
const { HttpError } = require('../utils/erros');

function transporte() {
  if (!SMTP.host || !SMTP.from) {
    throw new HttpError(503, 'O envio de e-mail não está configurado. Preencha SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS e SMTP_FROM no arquivo .env.');
  }
  return nodemailer.createTransport({
    host: SMTP.host,
    port: SMTP.port,
    secure: SMTP.secure,
    auth: SMTP.user ? { user: SMTP.user, pass: SMTP.pass } : undefined,
  });
}

async function enviarCodigo({ para, nome, codigo, minutos, assunto, motivo }) {
  const saudacao = nome ? `Olá, ${nome}.` : 'Olá.';
  const texto = `${saudacao}

Use este código para ${motivo} no HelpMe:

${codigo}

Ele vale por ${minutos} minutos e só pode ser usado uma vez. Se você não pediu isso, ignore este e-mail.`;

  const envio = transporte();
  try {
    await envio.sendMail({
      from: SMTP.from,
      to: para,
      subject: assunto,
      text: texto,
    });
  } catch (erro) {
    console.error('Falha ao enviar e-mail:', erro.message);
    throw new HttpError(502, 'Não foi possível enviar o e-mail. Confira os dados de SMTP no arquivo .env.');
  }
}

module.exports = { enviarCodigo };
