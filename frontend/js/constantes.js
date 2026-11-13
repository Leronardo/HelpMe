// Valores fixos do sistema (iguais aos do backend).
// Os setores não ficam aqui: cada empresa define os seus.
export const NIVEIS = {
  critico: { label: 'Crítico', dica: 'Parou tudo, ninguém consegue trabalhar' },
  alto:    { label: 'Alto',    dica: 'Atrapalha o trabalho de várias pessoas' },
  medio:   { label: 'Médio',   dica: 'Há um jeito de contornar, mas precisa de conserto' },
  leve:    { label: 'Leve',    dica: 'Dúvida ou ajuste, sem pressa' },
};

export const STATUS = { aberto: 'Aberto', em_analise: 'Em análise', concluido: 'Concluído' };
