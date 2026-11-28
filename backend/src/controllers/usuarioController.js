const { prisma, duplicado } = require('../config/prisma');
const usuarioModel = require('../models/usuarioModel');
const vinculoModel = require('../models/vinculoModel');
const senhaUtil = require('../utils/senha');
const { exigeGestor } = require('../middlewares/autenticacao');
const usuarioPapel = { administrador: 'supervisor', tecnico: 'técnico', funcionario: 'colaborador' };
const { HttpError } = require('../utils/erros');
const { criado } = require('../utils/resposta');
const { texto, emailValido, nomeDePessoaValido } = require('../utils/validacao');

function papelDe(quem) {
  if (quem.perfil === 'administrador') return { perfil: 'tecnico', rotulo: 'técnico' };
  return { perfil: 'funcionario', rotulo: 'colaborador' };
}

async function listar({ req, params }) {
  const quem = await exigeGestor(req, params.id);
  const usuarios = await vinculoModel.listarFuncionariosDaEmpresa(Number(params.id));
  if (quem.perfil === 'tecnico') return { usuarios: usuarios.filter((u) => u.perfil === 'funcionario') };
  return { usuarios };
}

async function criar({ req, params, body }) {
  const quem = await exigeGestor(req, params.id);
  const empresaId = Number(params.id);
  const { perfil, rotulo } = papelDe(quem);
  const nome = texto(body.nome, 80);
  const email = texto(body.email, 120).toLowerCase();
  if (nome.length < 2) throw new HttpError(400, `Informe o nome do ${rotulo}.`);
  if (!nomeDePessoaValido(nome)) throw new HttpError(400, 'O nome só pode ter letras e espaços.');
  if (!emailValido(email)) throw new HttpError(400, 'E-mail inválido.');

  const existente = await usuarioModel.buscarPorEmail(email);
  if (existente && existente.perfil !== perfil) {
    throw new HttpError(409, `Este e-mail já pertence a um ${usuarioPapel[existente.perfil] || 'usuário'}.`);
  }
  if (existente) {
    if (await vinculoModel.existe(existente.id, empresaId)) {
      throw new HttpError(409, `Este ${rotulo} já faz parte da empresa.`);
    }
    await vinculoModel.criar(existente.id, empresaId);
    return criado({
      usuario: { id: existente.id, nome: existente.nome, email: existente.email, perfil: existente.perfil },
      ja_tinha_conta: true,
    });
  }

  const senha = senhaUtil.senhaAleatoria();
  const usuario = await prisma.$transaction(async (tx) => {
    try {
      const conta = await tx.usuario.create({
        data: {
          nome, email, senhaHash: senhaUtil.gerarHash(senha), perfil,
          trocarSenha: true, criadoEm: new Date(),
        },
      });
      await tx.vinculo.create({
        data: { usuarioId: conta.id, empresaId, criadoEm: new Date() },
      });
      return { id: conta.id, nome: conta.nome, email: conta.email, perfil: conta.perfil };
    } catch (erro) {
      throw duplicado(erro) ? new HttpError(409, 'Já existe uma conta com este e-mail.') : erro;
    }
  });
  return criado({ usuario, senha });
}

async function excluir({ req, params }) {
  const quem = await exigeGestor(req, params.id);
  const alvo = await usuarioModel.buscarPorId(Number(params.uid));
  if (!alvo || !(await vinculoModel.existe(alvo.id, Number(params.id)))) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }
  if (quem.perfil === 'tecnico' && alvo.perfil !== 'funcionario') {
    throw new HttpError(403, 'Você só pode excluir colaboradores.');
  }
  if (alvo.perfil === 'administrador') throw new HttpError(403, 'Você não tem permissão para isso.');

  if (!(await vinculoModel.removerFuncionario(alvo.id, Number(params.id)))) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }
  return { ok: true };
}

module.exports = { listar, criar, excluir };
