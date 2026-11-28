let funcaoRotear = () => {};

export const definirRotear = (funcao) => { funcaoRotear = funcao; };
export const rotear = () => funcaoRotear();
