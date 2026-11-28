const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const duplicado = (erro) => erro?.code === 'P2002';

module.exports = { prisma, duplicado };
