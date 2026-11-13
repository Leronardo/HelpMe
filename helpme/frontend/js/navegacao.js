// Permite que qualquer tela peça para "redesenhar" a página sem importar o main.js
let funcaoRotear = () => {};

export const definirRotear = (funcao) => { funcaoRotear = funcao; };
export const rotear = () => funcaoRotear();
