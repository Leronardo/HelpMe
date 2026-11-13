-- HelpMe - esquema do banco de dados (SQLite)
PRAGMA foreign_keys = ON;

-- Administradores e funcionários. Só o administrador tem plano.
CREATE TABLE IF NOT EXISTS usuarios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nome        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  senha_hash  TEXT,
  perfil      TEXT    NOT NULL CHECK (perfil IN ('administrador','funcionario')),
  plano_id    TEXT,                            -- id do plano contratado (ver config/planos.js)
  plano_empresas INTEGER,                      -- quantidade de empresas (só no plano personalizado)
  criado_em   TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS empresas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nome       TEXT    NOT NULL,
  logo       TEXT    NOT NULL,                 -- imagem em data URL (base64)
  codigo     TEXT    NOT NULL UNIQUE,          -- código que o funcionário usa para entrar
  admin_id   INTEGER NOT NULL,
  criado_em  TEXT    NOT NULL
);

-- Em quais empresas cada funcionário trabalha (um funcionário pode ter várias)
CREATE TABLE IF NOT EXISTS vinculos (
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  empresa_id  INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  criado_em   TEXT    NOT NULL,
  PRIMARY KEY (usuario_id, empresa_id)
);

-- Setores de cada empresa (o administrador define, o funcionário escolhe ao abrir o chamado)
CREATE TABLE IF NOT EXISTS setores (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id  INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome        TEXT    NOT NULL,
  UNIQUE (empresa_id, nome COLLATE NOCASE)
);

CREATE TABLE IF NOT EXISTS chamados (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id    INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id    INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  titulo        TEXT    NOT NULL,
  descricao     TEXT    NOT NULL DEFAULT '',
  setor         TEXT    NOT NULL,              -- nome do setor no momento da abertura
  nivel         TEXT    NOT NULL CHECK (nivel  IN ('critico','alto','medio','leve')),
  status        TEXT    NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto','em_analise','concluido')),
  criado_em     TEXT    NOT NULL,
  atualizado_em TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chamados_empresa ON chamados(empresa_id, criado_em);
CREATE INDEX IF NOT EXISTS idx_chamados_usuario ON chamados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_vinculos_empresa ON vinculos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email   ON usuarios(email);
