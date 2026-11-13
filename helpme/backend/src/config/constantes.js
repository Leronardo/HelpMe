// Valores fixos usados no sistema (os níveis e status precisam ser iguais aos do frontend)
const NIVEIS = ['critico', 'alto', 'medio', 'leve'];
const STATUS = ['aberto', 'em_analise', 'concluido'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Setores que toda empresa nova recebe (o administrador pode editar depois)
const SETORES_PADRAO = ['TI', 'RH', 'Financeiro', 'Comercial', 'Operações', 'Infraestrutura', 'Outro'];
const MAX_SETORES = 20;

module.exports = { NIVEIS, STATUS, MESES, SETORES_PADRAO, MAX_SETORES };
