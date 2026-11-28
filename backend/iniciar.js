const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const modulos = path.join(raiz, 'node_modules');
const cliente = path.join(modulos, '.prisma', 'client', 'default.js');
const cli = path.join(modulos, 'prisma', 'build', 'index.js');
const trava = path.join(modulos, '.package-lock.json');
const pacote = path.join(raiz, 'package-lock.json');

function precisaInstalar() {
  if (!fs.existsSync(cliente) || !fs.existsSync(cli) || !fs.existsSync(trava)) return true;
  if (!fs.existsSync(pacote)) return true;
  return fs.statSync(pacote).mtimeMs > fs.statSync(trava).mtimeMs;
}

if (precisaInstalar()) {
  console.log('Dependências ausentes ou desatualizadas. Rodando npm install...');
  execFileSync('npm', ['install'], {
    cwd: raiz,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
}

try {
  execFileSync(process.execPath, [
    '--disable-warning=ExperimentalWarning',
    '--env-file-if-exists=.env',
    path.join('backend', 'server.js'),
  ], { cwd: raiz, stdio: 'inherit' });
} catch (erro) {
  process.exit(erro.status ?? 1);
}
