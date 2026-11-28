PRAGMA foreign_keys=OFF;

CREATE TABLE "new_chamados" (
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
    "responsavel_id" INTEGER,
    CONSTRAINT "chamados_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chamados_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "chamados_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_chamados" ("id", "empresa_id", "usuario_id", "titulo", "descricao", "setor", "nivel", "status", "criado_em", "atualizado_em")
SELECT "id", "empresa_id", "usuario_id", "titulo", "descricao", "setor", "nivel", "status", "criado_em", "atualizado_em" FROM "chamados";

DROP TABLE "chamados";
ALTER TABLE "new_chamados" RENAME TO "chamados";

CREATE INDEX "chamados_empresa_id_criado_em_idx" ON "chamados"("empresa_id", "criado_em");
CREATE INDEX "chamados_usuario_id_idx" ON "chamados"("usuario_id");
CREATE INDEX "chamados_responsavel_id_idx" ON "chamados"("responsavel_id");

CREATE TABLE "observacoes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "chamado_id" INTEGER NOT NULL,
    "autor_id" INTEGER,
    "autor_nome" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criado_em" DATETIME NOT NULL,
    CONSTRAINT "observacoes_chamado_id_fkey" FOREIGN KEY ("chamado_id") REFERENCES "chamados" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "observacoes_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "observacoes_chamado_id_idx" ON "observacoes"("chamado_id");

PRAGMA foreign_keys=ON;
