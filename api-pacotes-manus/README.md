# API Pacotes Manus

API para gerenciamento de pacotes de viagem, migrada de PostgreSQL para Azure SQL Database.

## 🚀 Tecnologias

- **Backend:** Node.js + Express
- **Banco de Dados:** Azure SQL Database (SQL Server)
- **Autenticação:** JWT + bcrypt
- **Driver:** mssql

## 📋 Pré-requisitos

- Node.js 16+ 
- NPM ou Yarn
- Acesso ao Azure SQL Database

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configuração do Banco de Dados Azure SQL Server
DB_SERVER=srvusetravel.database.windows.net
DB_PORT=1433
DB_DATABASE=dbUsetravel
DB_USER=use_admin
DB_PASSWORD=JesusSavior!
DB_ENCRYPT=true

# Configuração JWT
JWT_SECRET=seusegredoseguro

# Configuração do Servidor
PORT=5000
```

### 3. Configurar Firewall do Azure

⚠️ **IMPORTANTE:** Configure o firewall do Azure SQL Database para permitir conexões.

Consulte o arquivo `GUIA_FIREWALL_AZURE.md` para instruções detalhadas.

## 🏃‍♂️ Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

A API estará disponível em: `http://localhost:5000`

## 📚 Endpoints

### Autenticação
- `POST /api/cadastrar` - Cadastrar usuário
- `POST /api/login` - Login de usuário

### Pesquisas
- `GET /api/cidades` - Listar cidades
- `GET /api/aeroportos/:cidade_id` - Aeroportos por cidade
- `GET /api/hoteis` - Buscar hotéis com filtros
- `GET /api/voos/:id_execucao` - Voos por execução

### Azul (Pesquisas)
- `POST /api/azul/pesquisas` - Salvar pesquisa
- `GET /api/azul/pesquisas` - Listar pesquisas
- `GET /api/azul/pesquisas/:id` - Detalhes da pesquisa
- `PUT /api/azul/pesquisas/:id` - Atualizar pesquisa
- `DELETE /api/azul/pesquisas/:id` - Excluir pesquisa
- `POST /api/azul/pesquisas/:id/agendamento` - Configurar agendamento
- `POST /api/azul/pesquisas/:id/rodar` - Executar pesquisa

## 🔄 Migração PostgreSQL → SQL Server

Esta API foi migrada de PostgreSQL para Azure SQL Database. Principais alterações:

### Driver
- **Antes:** `pg` (PostgreSQL)
- **Depois:** `mssql` (SQL Server)

### Sintaxe SQL Adaptada
- **Placeholders:** `$1, $2` → `@param1, @param2`
- **RETURNING:** `INSERT ... RETURNING id` → `INSERT ... OUTPUT INSERTED.id`
- **ON CONFLICT:** `ON CONFLICT ... DO UPDATE` → `MERGE` statement
- **Funções:** `NOW()` → `GETDATE()`
- **Arrays:** `TEXT[]` → `NVARCHAR(MAX)` (JSON)

### Tipos de Dados
- **SERIAL** → **IDENTITY(1,1)**
- **TEXT** → **NVARCHAR(MAX)**
- **TIMESTAMP** → **DATETIME2**

## 🧪 Testes

### Testar Conexão
```bash
node teste_conexao.js
```

### Resultado Esperado
```
✅ Conexão estabelecida com sucesso!
Resultado do teste: [ { teste: 1 } ]
```

## 📁 Estrutura do Projeto

```
src/
├── controllers/
│   ├── authController.js      # Autenticação
│   ├── azulController.js      # Pesquisas Azul
│   └── pesquisasController.js # Consultas gerais
├── middlewares/
│   └── authMiddleware.js      # Middleware JWT
├── routes/
│   ├── authRoutes.js         # Rotas de auth
│   ├── azulRoutes.js         # Rotas Azul
│   └── pesquisaRoutes.js     # Rotas de pesquisa
├── utils/
│   └── gerarPeriodos.js      # Utilitários
├── db.js                     # Conexão com banco
└── server.js                 # Servidor principal
```

## 🔧 Troubleshooting

### Erro de Conexão
1. Verifique se o firewall do Azure está configurado
2. Confirme as credenciais no `.env`
3. Teste a conexão com `node teste_conexao.js`

### Erro de Sintaxe SQL
- As queries foram adaptadas para SQL Server
- Verifique se as tabelas existem no banco
- Consulte `analise_migracao.md` para detalhes

## 📄 Documentação Adicional

- `GUIA_FIREWALL_AZURE.md` - Como configurar firewall
- `FIREWALL_ISSUE.md` - Problemas de firewall
- `analise_migracao.md` - Análise da migração
- `RESUMO_MIGRACAO.md` - Resumo completo das alterações

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

