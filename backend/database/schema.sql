-- HelpMe - esquema do banco de dados (SQL Server / T-SQL)

-- Administradores e funcionários. Só o administrador tem plano.
IF OBJECT_ID(N'dbo.usuarios', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.usuarios (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    nome           NVARCHAR(80)  NOT NULL,
    email          NVARCHAR(120) NOT NULL,
    senha_hash     NVARCHAR(255) NULL,
    perfil         NVARCHAR(20)  NOT NULL CHECK (perfil IN ('administrador', 'funcionario')),
    plano_id       NVARCHAR(50)  NULL, -- id do plano contratado (ver config/planos.js)
    plano_empresas INT           NULL, -- quantidade de empresas (só no plano personalizado)
    criado_em      NVARCHAR(30)  NOT NULL
  );
END;

IF OBJECT_ID(N'dbo.empresas', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.empresas (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    nome       NVARCHAR(80)  NOT NULL,
    logo       NVARCHAR(MAX) NOT NULL, -- imagem em data URL (base64)
    codigo     NVARCHAR(20)  NOT NULL UNIQUE, -- código que o funcionário usa para entrar
    admin_id   INT           NOT NULL,
    criado_em  NVARCHAR(30)  NOT NULL
  );
END;

-- Em quais empresas cada funcionário trabalha (um funcionário pode ter várias)
IF OBJECT_ID(N'dbo.vinculos', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.vinculos (
    usuario_id  INT          NOT NULL REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
    empresa_id  INT          NOT NULL REFERENCES dbo.empresas(id) ON DELETE CASCADE,
    criado_em   NVARCHAR(30) NOT NULL,
    PRIMARY KEY (usuario_id, empresa_id)
  );
END;

-- Setores de cada empresa (o administrador define, o funcionário escolhe ao abrir o chamado)
IF OBJECT_ID(N'dbo.setores', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.setores (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    empresa_id  INT          NOT NULL REFERENCES dbo.empresas(id) ON DELETE CASCADE,
    nome        NVARCHAR(40) NOT NULL,
    CONSTRAINT UQ_setores_empresa_nome UNIQUE (empresa_id, nome)
  );
END;

IF OBJECT_ID(N'dbo.chamados', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.chamados (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    empresa_id    INT            NOT NULL REFERENCES dbo.empresas(id) ON DELETE CASCADE,
    usuario_id    INT            NOT NULL REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
    titulo        NVARCHAR(120)  NOT NULL,
    descricao     NVARCHAR(2000) NOT NULL DEFAULT '',
    setor         NVARCHAR(40)   NOT NULL, -- nome do setor no momento da abertura
    nivel         NVARCHAR(20)   NOT NULL CHECK (nivel  IN ('critico', 'alto', 'medio', 'leve')),
    status        NVARCHAR(20)   NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_analise', 'concluido')),
    criado_em     NVARCHAR(30)   NOT NULL,
    atualizado_em NVARCHAR(30)   NOT NULL
  );
END;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_chamados_empresa' AND object_id = OBJECT_ID(N'dbo.chamados'))
  CREATE INDEX idx_chamados_empresa ON dbo.chamados(empresa_id, criado_em);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_chamados_usuario' AND object_id = OBJECT_ID(N'dbo.chamados'))
  CREATE INDEX idx_chamados_usuario ON dbo.chamados(usuario_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_vinculos_empresa' AND object_id = OBJECT_ID(N'dbo.vinculos'))
  CREATE INDEX idx_vinculos_empresa ON dbo.vinculos(empresa_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_usuarios_email' AND object_id = OBJECT_ID(N'dbo.usuarios'))
  CREATE INDEX idx_usuarios_email ON dbo.usuarios(email);
