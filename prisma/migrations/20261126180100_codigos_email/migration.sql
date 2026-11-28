ALTER TABLE "usuarios" ADD COLUMN "senha_versao" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "codigos_email" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "codigo_hash" TEXT NOT NULL,
    "nome" TEXT NOT NULL DEFAULT '',
    "senha_hash" TEXT NOT NULL DEFAULT '',
    "expira_em" DATETIME NOT NULL,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "usado_em" DATETIME,
    "criado_em" DATETIME NOT NULL
);

CREATE INDEX "codigos_email_email_tipo_criado_em_idx" ON "codigos_email"("email", "tipo", "criado_em");
