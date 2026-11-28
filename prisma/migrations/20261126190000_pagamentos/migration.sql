CREATE TABLE "pagamentos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "plano_id" TEXT NOT NULL,
    "empresas" INTEGER,
    "valor" INTEGER NOT NULL,
    "metodo" TEXT NOT NULL,
    "mp_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "criado_em" DATETIME NOT NULL,
    CONSTRAINT "pagamentos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "pagamentos_usuario_id_idx" ON "pagamentos"("usuario_id");
