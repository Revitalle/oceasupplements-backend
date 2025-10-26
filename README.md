# 🚀 Backend - MVP Fase 1

Sistema backend para plataforma de diagnóstico de saúde personalizado.

---

## 📋 Visão Geral

Este backend fornece:
- ✅ API REST para frontend
- ✅ Sistema de autenticação (JWT)
- ✅ Questionário dinâmico
- ✅ Motor de regras para diagnóstico
- ✅ Gestão de produtos
- ✅ Tracking de conversões

---

## 🗂️ Estrutura de Pastas

```
backend/
├── config/              # Configurações (DB, JWT, etc)
├── controllers/         # Lógica de negócio
├── models/              # Modelos de dados (ORM)
├── routes/              # Definição de rotas
├── middleware/          # Middlewares (auth, validation, etc)
├── utils/               # Funções auxiliares
├── database/
│   ├── migrations/      # Migrações do banco
│   └── seeds/           # Dados iniciais
├── DATABASE-SCHEMA.sql  # Schema completo do banco
├── API-DOCUMENTATION.md # Documentação da API
└── README.md            # Este arquivo
```

---

## 🛠️ Stack Tecnológica

### Opção A: Node.js (Recomendado)
```
- Runtime: Node.js 18+
- Framework: Express.js
- ORM: Sequelize ou Prisma
- Banco: PostgreSQL
- Auth: JWT (jsonwebtoken)
- Validação: Joi ou Zod
- Segurança: Helmet, bcrypt
```

### Opção B: Python
```
- Runtime: Python 3.10+
- Framework: Flask ou FastAPI
- ORM: SQLAlchemy
- Banco: PostgreSQL
- Auth: PyJWT
- Validação: Pydantic (FastAPI) ou Marshmallow
```

### Opção C: PHP
```
- Runtime: PHP 8+
- Framework: Laravel
- ORM: Eloquent (built-in)
- Banco: MySQL
- Auth: Laravel Sanctum
```

---

## 🗄️ Banco de Dados

### Schema

O schema completo está em `DATABASE-SCHEMA.sql`

**Principais tabelas:**
- `users` - Usuários do sistema
- `questionnaire_categories` - Categorias do questionário
- `questions` - Perguntas
- `question_options` - Opções de resposta
- `questionnaire_sessions` - Sessões de questionário
- `user_responses` - Respostas dos usuários
- `products` - Catálogo de produtos
- `diagnostic_rules` - Regras de diagnóstico
- `diagnostics` - Diagnósticos gerados
- `conversions` - Tracking de conversões

### Relacionamentos

```
users (1) -----> (N) questionnaire_sessions
questionnaire_sessions (1) -----> (N) user_responses
questions (1) -----> (N) question_options
questionnaire_sessions (1) -----> (1) diagnostics
diagnostics (N) -----> (1) products
```

---

## 🔐 Autenticação

### Fluxo JWT

1. Cliente faz `POST /api/v1/auth/register` ou `/login`
2. Backend valida credenciais
3. Se válido, gera token JWT
4. Cliente armazena token (localStorage)
5. Requisições protegidas enviam: `Authorization: Bearer {token}`

### Estrutura do Token

```json
{
  "user_id": 123,
  "email": "usuario@email.com",
  "iat": 1642492800,
  "exp": 1643097600
}
```

---

## 🧠 Motor de Diagnóstico

### Como Funciona

1. **Coleta de Respostas**
   - Usuário responde perguntas
   - Cada resposta tem um `score`
   - Sistema calcula score total

2. **Aplicação de Regras**
   - Busca regras ativas no banco (`diagnostic_rules`)
   - Avalia condições em ordem de prioridade
   - Primeira regra que satisfaz as condições é aplicada

3. **Geração do Diagnóstico**
   - Monta texto personalizado
   - Recomenda produto adequado
   - Salva na tabela `diagnostics`

### Exemplo de Regra (JSON)

```json
{
  "rule_name": "Fadiga Moderada + Sono Ruim",
  "conditions": {
    "and": [
      {
        "question_id": 1,
        "operator": "<=",
        "value": 3
      },
      {
        "question_id": 5,
        "operator": ">=",
        "value": 7
      }
    ]
  },
  "recommended_product_id": 2,
  "diagnostic_text": "Com base nas suas respostas, identificamos padrão de fadiga moderada...",
  "priority": 10
}
```

---

## 📡 API Endpoints

Veja documentação completa em `API-DOCUMENTATION.md`

**Principais rotas:**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
GET    /api/v1/auth/me

GET    /api/v1/questionnaire/categories
GET    /api/v1/questionnaire/questions
POST   /api/v1/questionnaire/start
POST   /api/v1/questionnaire/answer
POST   /api/v1/questionnaire/complete

GET    /api/v1/diagnostics
GET    /api/v1/diagnostics/:id

GET    /api/v1/products
GET    /api/v1/products/:slug

POST   /api/v1/conversions/click
```

---

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+ (ou Python 3.10+ ou PHP 8+)
- PostgreSQL 14+ (ou MySQL 8+)
- npm ou yarn

### Passo a Passo

1. **Instalar dependências**
```bash
npm install
```

2. **Configurar variáveis de ambiente**
```bash
cp .env.example .env
```

Editar `.env`:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/health_diagnostic_mvp
JWT_SECRET=sua_chave_secreta_aqui
NODE_ENV=development
```

3. **Criar banco de dados**
```bash
createdb health_diagnostic_mvp
```

4. **Executar migrations**
```bash
npm run migrate
```

5. **Popular dados iniciais (seed)**
```bash
npm run seed
```

6. **Iniciar servidor**
```bash
npm run dev
```

Servidor rodando em: `http://localhost:3000`

---

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes de integração
npm run test:integration

# Coverage
npm run test:coverage
```

---

## 📦 Deploy

### Opções de Hospedagem

**Gratuitas (Dev/MVP):**
- Railway.app (recomendado)
- Render.com
- Fly.io
- Heroku (limited free tier)

**Pagas (Produção):**
- AWS EC2 + RDS
- DigitalOcean App Platform
- Google Cloud Run
- Azure App Service

### Deploy na Railway (exemplo)

1. Criar conta em railway.app
2. Conectar repositório GitHub
3. Adicionar PostgreSQL addon
4. Configurar variáveis de ambiente
5. Deploy automático

---

## 🔧 Configuração do Banco (PostgreSQL)

### Local

```bash
# Criar usuário
createuser -P health_user

# Criar banco
createdb -O health_user health_diagnostic_mvp

# Executar schema
psql -U health_user -d health_diagnostic_mvp -f DATABASE-SCHEMA.sql
```

### Docker

```bash
docker run --name postgres-health \
  -e POSTGRES_USER=health_user \
  -e POSTGRES_PASSWORD=senha123 \
  -e POSTGRES_DB=health_diagnostic_mvp \
  -p 5432:5432 \
  -d postgres:14
```

---

## 📊 Monitoramento

### Logs

```bash
# Desenvolvimento
npm run dev (console.log)

# Produção
Winston ou Pino para logs estruturados
```

### Métricas

- Tempo de resposta das APIs
- Taxa de erro (4xx, 5xx)
- Uso de memória
- Conexões do banco

---

## 🔐 Segurança

✅ Senhas hasheadas com bcrypt (10 rounds)
✅ Tokens JWT com expiração
✅ Rate limiting (100 req/min)
✅ CORS configurado
✅ Helmet para headers de segurança
✅ SQL injection prevention (ORM)
✅ XSS protection
✅ HTTPS only em produção

---

## 🐛 Troubleshooting

### Erro de Conexão com Banco
```
Verifique:
- PostgreSQL está rodando? (pg_isready)
- Credenciais corretas no .env?
- Firewall bloqueando porta 5432?
```

### Token JWT Inválido
```
- Token expirado? (checar exp)
- Secret key correta?
- Header Authorization formatado corretamente?
```

### Migrations não executam
```
- Banco criado?
- Permissões do usuário?
- Connection string correta?
```

---

## 📚 Próximos Passos

- [ ] Implementar testes automatizados
- [ ] Adicionar rate limiting
- [ ] Configurar logs estruturados
- [ ] Implementar cache (Redis)
- [ ] Adicionar documentação Swagger
- [ ] Webhooks para eventos
- [ ] Filas para processamento assíncrono

---

## 🤝 Desenvolvimento

### Padrões de Código

- ESLint + Prettier (JavaScript)
- PEP8 (Python)
- PSR-12 (PHP)

### Git Workflow

```bash
main (produção)
└── develop (desenvolvimento)
    └── feature/nome-da-feature
```

### Commits

Usar Conventional Commits:
```
feat: adicionar endpoint de diagnóstico
fix: corrigir validação de email
docs: atualizar README
```

---

**Versão:** 1.0
**Última atualização:** Janeiro 2025
