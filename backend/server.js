const http = require('node:http');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { PORT, DATA_DIR, DB_FILE, RAIZ_PROJETO } = require('./src/config/env');

fs.mkdirSync(DATA_DIR, { recursive: true });
guardarBancoAntigo();
aplicarMigrations();

const app = require('./src/app');
const servidor = http.createServer(app);

servidor.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso. Feche o outro HelpMe ou mude PORT no arquivo .env.`);
  } else {
    console.error('Não foi possível iniciar o servidor:', erro.message);
  }
  process.exit(1);
});

servidor.listen(PORT, () => {
  console.log(`HelpMe em http://localhost:${PORT}`);
});

function guardarBancoAntigo() {
  if (!fs.existsSync(DB_FILE)) return;

  const db = new DatabaseSync(DB_FILE, { readOnly: true });
  const prisma = db.prepare("SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = '_prisma_migrations'").get();
  const usuarios = db.prepare("SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = 'usuarios'").get();
  db.close();
  if (prisma || !usuarios) return;

  let destino = DB_FILE.replace(/\.db$/, '.legado.db');
  if (fs.existsSync(destino)) destino = DB_FILE.replace(/\.db$/, `.legado-${Date.now()}.db`);
  try {
    for (const sufixo of ['', '-wal', '-shm']) {
      const origem = DB_FILE + sufixo;
      if (!fs.existsSync(origem)) continue;
      fs.renameSync(origem, destino + sufixo);
    }
  } catch (erro) {
    console.error('Feche o HelpMe que já está aberto e inicie de novo. O banco antigo não pôde ser guardado:', erro.message);
    process.exit(1);
  }
  console.log(`O banco anterior foi guardado em ${destino}. O formato novo é criado pelas migrations.`);
}

function aplicarMigrations() {
  const cli = path.join(RAIZ_PROJETO, 'node_modules', 'prisma', 'build', 'index.js');
  try {
    execFileSync(process.execPath, [cli, 'migrate', 'deploy'], {
      cwd: RAIZ_PROJETO,
      stdio: 'inherit',
    });
  } catch {
    console.error('Não foi possível aplicar as migrations. Rode npm install na pasta do projeto e confira DATABASE_URL no .env.');
    process.exit(1);
  }
}
