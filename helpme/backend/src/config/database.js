// Conexão com o banco SQLite (módulo nativo do Node) e criação das tabelas
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { DATA_DIR, SCHEMA_PATH } = require('./env');
const { SETORES_PADRAO } = require('./constantes');

const db = new DatabaseSync(path.join(DATA_DIR, 'helpme.db'));
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// ----- Atualização de bancos criados em versões anteriores -----
const colunasDe = (tabela) => db.prepare(`PRAGMA table_info(${tabela})`).all().map((c) => c.name);
const colunasUsuarios = colunasDe('usuarios');

if (!colunasUsuarios.includes('plano_id')) {
  db.exec('ALTER TABLE usuarios ADD COLUMN plano_id TEXT');
}
if (!colunasUsuarios.includes('plano_empresas')) {
  db.exec('ALTER TABLE usuarios ADD COLUMN plano_empresas INTEGER');
}
// O antigo plano "5 empresas" virou parte do plano personalizado
db.exec("UPDATE usuarios SET plano_id = 'personalizado', plano_empresas = 5 WHERE plano_id = 'empresa-5'");
// Antes cada funcionário pertencia a uma empresa direto na tabela usuarios; agora usa "vinculos"
if (colunasUsuarios.includes('empresa_id')) {
  db.exec(`INSERT OR IGNORE INTO vinculos (usuario_id, empresa_id, criado_em)
           SELECT id, empresa_id, criado_em FROM usuarios WHERE perfil = 'funcionario' AND empresa_id IS NOT NULL`);
}
// Empresas antigas ganham os setores padrão
const semSetores = db.prepare('SELECT id FROM empresas WHERE NOT EXISTS (SELECT 1 FROM setores s WHERE s.empresa_id = empresas.id)').all();
const inserirSetor = db.prepare('INSERT INTO setores (empresa_id, nome) VALUES (?, ?)');
for (const { id } of semSetores) for (const nome of SETORES_PADRAO) inserirSetor.run(id, nome);

module.exports = db;
