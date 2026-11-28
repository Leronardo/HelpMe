const marca = (cor, miolo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${cor}"/>${miolo}</svg>`;

const dados = (svg) => `data:image/svg+xml;base64,${btoa(svg)}`;

export const LOGOS = [
  {
    id: 'sede',
    nome: 'Sede',
    src: dados(marca('#0F1C2E', `
      <rect x="20" y="14" width="24" height="36" rx="2" fill="#fff"/>
      <rect x="25" y="20" width="5" height="5" fill="#0F1C2E"/>
      <rect x="34" y="20" width="5" height="5" fill="#0F1C2E"/>
      <rect x="25" y="29" width="5" height="5" fill="#0F1C2E"/>
      <rect x="34" y="29" width="5" height="5" fill="#0F1C2E"/>
      <rect x="29" y="40" width="6" height="10" fill="#FFB41F"/>`)),
  },
  {
    id: 'consultoria',
    nome: 'Consultoria',
    src: dados(marca('#1A2B42', `
      <path d="M26 26v-5a6 6 0 0 1 12 0v5" fill="none" stroke="#fff" stroke-width="3"/>
      <rect x="12" y="26" width="40" height="24" rx="4" fill="#fff"/>
      <rect x="12" y="35" width="40" height="5" fill="#FFB41F"/>
      <rect x="30" y="34" width="4" height="7" rx="1" fill="#1A2B42"/>`)),
  },
  {
    id: 'comercio',
    nome: 'Comércio',
    src: dados(marca('#1F6B4A', `
      <path d="M10 26 16 14h32l6 12" fill="#FFB41F"/>
      <rect x="14" y="26" width="36" height="22" fill="#fff"/>
      <rect x="18" y="32" width="6" height="6" fill="#1F6B4A"/>
      <rect x="40" y="32" width="6" height="6" fill="#1F6B4A"/>
      <rect x="28" y="34" width="8" height="14" fill="#1F6B4A"/>`)),
  },
  {
    id: 'industria',
    nome: 'Indústria',
    src: dados(marca('#3D4C5C', `
      <path d="M8 48V30l14 8V26l14 8V18h16v30z" fill="#fff"/>
      <rect x="42" y="10" width="4" height="8" rx="1" fill="#FFB41F"/>
      <rect x="36" y="38" width="5" height="10" fill="#3D4C5C"/>
      <rect x="44" y="38" width="5" height="10" fill="#3D4C5C"/>`)),
  },
  {
    id: 'financas',
    nome: 'Finanças',
    src: dados(marca('#2F6FA8', `
      <rect x="12" y="38" width="10" height="12" rx="2" fill="#fff"/>
      <rect x="27" y="28" width="10" height="22" rx="2" fill="#fff"/>
      <rect x="42" y="16" width="10" height="34" rx="2" fill="#FFB41F"/>`)),
  },
  {
    id: 'tecnologia',
    nome: 'Tecnologia',
    src: dados(marca('#3C3489', `
      <rect x="29" y="8" width="6" height="8" rx="1" fill="#fff"/>
      <rect x="29" y="48" width="6" height="8" rx="1" fill="#fff"/>
      <rect x="8" y="29" width="8" height="6" rx="1" fill="#fff"/>
      <rect x="48" y="29" width="8" height="6" rx="1" fill="#fff"/>
      <rect x="18" y="18" width="28" height="28" rx="6" fill="none" stroke="#fff" stroke-width="3"/>
      <rect x="27" y="27" width="10" height="10" rx="2" fill="#FFB41F"/>`)),
  },
  {
    id: 'logistica',
    nome: 'Logística',
    src: dados(marca('#C45C12', `
      <path d="M32 8 54 20 32 32 10 20Z" fill="#fff"/>
      <path d="M32 32 54 20v22L32 56V32Z" fill="#FFE0C2"/>
      <path d="M32 32 10 20v22l22 14V32Z" fill="#fff"/>`)),
  },
  {
    id: 'equipe',
    nome: 'Equipe',
    src: dados(marca('#0E6E6A', `
      <circle cx="22" cy="22" r="7" fill="#fff"/>
      <circle cx="43" cy="24" r="6" fill="#FFB41F"/>
      <path d="M8 50c1.2-9 7-14 14-14s12.8 5 14 14" fill="#fff"/>
      <path d="M34 50c1-8 6-12 11-12 6 0 10 4 11 12" fill="#FFB41F"/>`)),
  },
];

export const logoPorId = (id) => LOGOS.find((logo) => logo.id === id);
