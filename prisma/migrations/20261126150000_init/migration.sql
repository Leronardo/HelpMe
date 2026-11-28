CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" TEXT NOT NULL,
    "plano_id" TEXT,
    "plano_empresas" INTEGER,
    "trocar_senha" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" DATETIME NOT NULL
);

CREATE TABLE "empresas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "criado_em" DATETIME NOT NULL,
    CONSTRAINT "empresas_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "vinculos" (
    "usuario_id" INTEGER NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "criado_em" DATETIME NOT NULL,

    PRIMARY KEY ("usuario_id", "empresa_id"),
    CONSTRAINT "vinculos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vinculos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "setores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empresa_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "nome_norm" TEXT NOT NULL,
    CONSTRAINT "setores_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "chamados" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empresa_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "setor" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aberto',
    "criado_em" DATETIME NOT NULL,
    "atualizado_em" DATETIME NOT NULL,
    CONSTRAINT "chamados_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chamados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

CREATE UNIQUE INDEX "empresas_codigo_key" ON "empresas"("codigo");

CREATE INDEX "empresas_admin_id_idx" ON "empresas"("admin_id");

CREATE INDEX "vinculos_empresa_id_idx" ON "vinculos"("empresa_id");

CREATE UNIQUE INDEX "setores_empresa_id_nome_norm_key" ON "setores"("empresa_id", "nome_norm");

CREATE INDEX "chamados_empresa_id_criado_em_idx" ON "chamados"("empresa_id", "criado_em");

CREATE INDEX "chamados_usuario_id_idx" ON "chamados"("usuario_id");
