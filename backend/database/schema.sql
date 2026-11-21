-- HelpMe - esquema do banco de dados (SQL Server / Azure SQL Database)
-- Roda sozinho quando o servidor inicia e é seguro repetir (só cria o que ainda não existe).
-- As linhas "GO" separam os blocos: o servidor executa cada bloco em separado.

-- Administradores e funcionários. Só o administrador tem plano.
IF OBJECT_ID(N'dbo.usuarios', N'U') IS NULL
CREATE TABLE dbo.usuarios (
  id             INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_usuarios PRIMARY KEY,
  nome           NVARCHAR(80)  NOT NULL,
  email          NVARCHAR(120) NOT NULL,
  senha_hash     NVARCHAR(255) NULL,
  perfil         NVARCHAR(20)  NOT NULL CONSTRAINT ck_usuarios_perfil CHECK (perfil IN ('administrador','funcionario')),
  plano_id       NVARCHAR(40)  NULL,
  plano_empresas INT           NULL,
  criado_em      NVARCHAR(30)  NOT NULL
);
GO

IF OBJECT_ID(N'dbo.empresas', N'U') IS NULL
CREATE TABLE dbo.empresas (
  id         INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_empresas PRIMARY KEY,
  nome       NVARCHAR(80)  NOT NULL,
  logo       NVARCHAR(MAX) NOT NULL,
  codigo     NVARCHAR(12)  NOT NULL CONSTRAINT uq_empresas_codigo UNIQUE,
  admin_id   INT NOT NULL CONSTRAINT fk_empresas_admin REFERENCES dbo.usuarios(id),
  criado_em  NVARCHAR(30) NOT NULL
);
GO

IF OBJECT_ID(N'dbo.vinculos', N'U') IS NULL
CREATE TABLE dbo.vinculos (
  usuario_id  INT NOT NULL CONSTRAINT fk_vinculos_usuario REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
  empresa_id  INT NOT NULL CONSTRAINT fk_vinculos_empresa REFERENCES dbo.empresas(id) ON DELETE CASCADE,
  criado_em   NVARCHAR(30) NOT NULL,
  CONSTRAINT pk_vinculos PRIMARY KEY (usuario_id, empresa_id)
);
GO

IF OBJECT_ID(N'dbo.setores', N'U') IS NULL
CREATE TABLE dbo.setores (
  id          INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_setores PRIMARY KEY,
  empresa_id  INT NOT NULL CONSTRAINT fk_setores_empresa REFERENCES dbo.empresas(id) ON DELETE CASCADE,
  nome        NVARCHAR(40) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
  CONSTRAINT uq_setores_empresa_nome UNIQUE (empresa_id, nome)
);
GO

IF OBJECT_ID(N'dbo.chamados', N'U') IS NULL
CREATE TABLE dbo.chamados (
  id            INT IDENTITY(1,1) NOT NULL CONSTRAINT pk_chamados PRIMARY KEY,
  empresa_id    INT NOT NULL CONSTRAINT fk_chamados_empresa REFERENCES dbo.empresas(id) ON DELETE CASCADE,
  usuario_id    INT NOT NULL CONSTRAINT fk_chamados_usuario REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
  titulo        NVARCHAR(120)  NOT NULL,
  descricao     NVARCHAR(2000) NOT NULL CONSTRAINT df_chamados_descricao DEFAULT '',
  setor         NVARCHAR(40)   NOT NULL,
  nivel         NVARCHAR(10)   NOT NULL CONSTRAINT ck_chamados_nivel  CHECK (nivel IN ('critico','alto','medio','leve')),
  status        NVARCHAR(15)   NOT NULL CONSTRAINT df_chamados_status DEFAULT 'aberto'
                               CONSTRAINT ck_chamados_status CHECK (status IN ('aberto','em_analise','concluido')),
  criado_em     NVARCHAR(30)   NOT NULL,
  atualizado_em NVARCHAR(30)   NOT NULL
);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_chamados_empresa' AND object_id = OBJECT_ID(N'dbo.chamados'))
  CREATE INDEX idx_chamados_empresa ON dbo.chamados(empresa_id, criado_em);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_chamados_usuario' AND object_id = OBJECT_ID(N'dbo.chamados'))
  CREATE INDEX idx_chamados_usuario ON dbo.chamados(usuario_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_vinculos_empresa' AND object_id = OBJECT_ID(N'dbo.vinculos'))
  CREATE INDEX idx_vinculos_empresa ON dbo.vinculos(empresa_id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'uq_usuarios_perfil_email' AND object_id = OBJECT_ID(N'dbo.usuarios'))
  CREATE UNIQUE INDEX uq_usuarios_perfil_email ON dbo.usuarios(perfil, email);
GO