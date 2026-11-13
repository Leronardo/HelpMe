const { TZ_OFFSET_MIN } = require('../config/env');
const { MESES } = require('../config/constantes');

const UM_DIA = 24 * 60 * 60 * 1000;

const contadorVazio = () => ({ total: 0, critico: 0, alto: 0, medio: 0, leve: 0, concluidos: 0 });
const doisDigitos = (n) => String(n).padStart(2, '0');

const paraFusoLocal = (iso) => new Date(new Date(iso).getTime() + TZ_OFFSET_MIN * 60000);

function inicioDaSemana(data) {
  const diasDesdeSegunda = (data.getUTCDay() + 6) % 7;
  return Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate() - diasDesdeSegunda);
}

function somar(contador, chamado) {
  if (!contador) return; 
  contador.total++;
  contador[chamado.nivel]++;
  if (chamado.status === 'concluido') contador.concluidos++;
}

function montar(chamados) {
  const hoje = paraFusoLocal(new Date().toISOString());

  const semanas = new Map();
  for (let i = 0; i < 8; i++) {
    const inicio = inicioDaSemana(hoje) - i * 7 * UM_DIA;
    const d1 = new Date(inicio), d2 = new Date(inicio + 6 * UM_DIA);
    const formatar = (d) => `${doisDigitos(d.getUTCDate())}/${doisDigitos(d.getUTCMonth() + 1)}`;
    semanas.set(inicio, { periodo: `${formatar(d1)} a ${formatar(d2)}`, atual: i === 0, ...contadorVazio() });
  }

  const meses = new Map();
  for (let i = 0; i < 6; i++) {
    const d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - i, 1));
    const chave = d.getUTCFullYear() * 12 + d.getUTCMonth();
    meses.set(chave, { periodo: `${MESES[d.getUTCMonth()]}/${d.getUTCFullYear()}`, atual: i === 0, ...contadorVazio() });
  }

  for (const chamado of chamados) {
    const data = paraFusoLocal(chamado.criado_em);
    somar(semanas.get(inicioDaSemana(data)), chamado);
    somar(meses.get(data.getUTCFullYear() * 12 + data.getUTCMonth()), chamado);
  }

  const resumo = {
    total: chamados.length,
    abertos: chamados.filter((c) => c.status === 'aberto').length,
    em_analise: chamados.filter((c) => c.status === 'em_analise').length,
    concluidos: chamados.filter((c) => c.status === 'concluido').length,
    criticos_pendentes: chamados.filter((c) => c.nivel === 'critico' && c.status !== 'concluido').length,
  };

  return { resumo, semanal: [...semanas.values()], mensal: [...meses.values()] };
}

module.exports = { montar };
