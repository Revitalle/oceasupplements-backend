# 🚀 Guia de Migração Completa - Opção 1

## 🎯 Objetivo Final

Deixar a Hostinger com esta estrutura (100% organizada):

```
public_html/
├── backend/  ← TUDO aqui dentro
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── routes/
│   ├── middleware/
│   ├── database/
│   ├── models/
│   ├── utils/
│   ├── config/
│   └── questionario/  ← Frontend movido para dentro
│       ├── auto-save.js
│       ├── analytics.js
│       ├── estilos-questionario.css
│       ├── intro.html
│       └── (todos os HTMLs)
├── assets/  ← Mantém (site institucional)
├── css/     ← Mantém
├── js/      ← Mantém
└── index.html  ← Mantém
```

**URLs vão mudar:**
- ❌ Antes: `https://oceasupplements.com/questionario/intro.html`
- ✅ Depois: `https://oceasupplements.com/backend/questionario/intro.html`

---

## ⏱️ Tempo Total Estimado: 2 horas

- 15 min: Backup
- 30 min: Upload de arquivos
- 15 min: Configuração
- 30 min: Testes
- 30 min: Ajustes finais

---

## 🛡️ FASE 1: BACKUP COMPLETO (CRÍTICO!)

### Passo 1.1: Backup via File Manager

1. **Entrar no File Manager da Hostinger**
2. **Navegar até `public_html/`**
3. **Selecionar TUDO** (Ctrl+A ou selecionar manualmente)
4. **Clicar em "Compactar"** (ícone de ZIP no topo)
5. **Nome do arquivo**: `backup-ANTES-MIGRACAO-20251029.zip`
6. **Aguardar compactação** (pode demorar alguns minutos)
7. **Download do ZIP** para seu PC
8. **Salvar em**: `C:\Users\User\Downloads\backup-hostinger\`

### Passo 1.2: Backup do Banco de Dados

**Via phpMyAdmin ou PostgreSQL Admin:**

1. Entrar no painel do banco
2. Selecionar database: `health_diagnostic_mvp` (ou nome que você usa)
3. Exportar → SQL
4. Download: `backup-banco-20251029.sql`
5. Salvar no mesmo local do backup

### Passo 1.3: Verificar Backups

**Checklist:**
- [ ] Arquivo `backup-ANTES-MIGRACAO-20251029.zip` baixado ✅
- [ ] Tamanho do arquivo > 0 bytes ✅
- [ ] Consegue abrir o ZIP no PC ✅
- [ ] Backup do banco `.sql` baixado ✅
- [ ] Data/hora do backup estão corretos ✅

⚠️ **PARE AQUI se algum backup falhou!**

---

## 📦 FASE 2: PREPARAR ARQUIVOS NO PC

### Passo 2.1: Criar Pasta Temporária

No seu PC:

```
C:\Users\User\Desktop\DEPLOY-HOSTINGER\
├── backend\
│   ├── (copiar tudo de C:\Users\User\teste-claude\backend\)
│   └── ...
└── README.txt (anotar o que está fazendo)
```

### Passo 2.2: Verificar Arquivos

**Lista completa do que vai subir:**

```
backend/
├── server.js
├── package.json
├── .env (criar se não existir)
├── routes/
│   ├── auth.js
│   ├── questionnaire.js
│   ├── diagnostic.js
│   ├── products.js
│   ├── conversions.js
│   └── analytics.js  ← NOVO
├── middleware/
│   ├── auth.js
│   └── diagnosticMonitor.js  ← NOVO
├── database/
│   ├── init.js
│   ├── create-tables.js
│   ├── create-analytics-table.js  ← NOVO
│   ├── cleanup-empty-diagnostics.js  ← NOVO
│   └── (outros scripts)
├── models/
│   └── User.js
├── utils/
│   └── scoring.js
├── config/
│   └── database.js
└── questionario/
    ├── auto-save.js  ← NOVO
    ├── analytics.js  ← NOVO
    ├── estilos-questionario.css
    ├── intro.html  ← ATUALIZADO
    ├── 1-nutricao.html  ← ATUALIZADO
    ├── 2-digestiva.html  ← ATUALIZADO
    ├── 3-fisica.html  ← ATUALIZADO
    ├── 4-sono.html  ← ATUALIZADO
    ├── 5-mental.html  ← ATUALIZADO
    ├── 6-hormonal.html  ← ATUALIZADO
    └── 7-sintomas.html  ← ATUALIZADO
```

---

## 🌐 FASE 3: CRIAR ESTRUTURA NA HOSTINGER

### Passo 3.1: Criar Pasta Backend

**Via File Manager:**

1. Navegar até `public_html/`
2. Clicar em **"Nova Pasta"**
3. Nome: `backend`
4. Enter

Agora você tem: `public_html/backend/`

### Passo 3.2: Criar Subpastas Dentro de Backend

Criar estas pastas dentro de `public_html/backend/`:

```
backend/
├── routes/        ← Nova pasta
├── middleware/    ← Nova pasta
├── database/      ← Nova pasta
├── models/        ← Nova pasta
├── utils/         ← Nova pasta
├── config/        ← Nova pasta
└── questionario/  ← Nova pasta
```

**Como criar:**
1. Entrar em `backend/`
2. Nova Pasta → `routes`
3. Nova Pasta → `middleware`
4. (repetir para todas)

---

## 📤 FASE 4: UPLOAD DOS ARQUIVOS

### Passo 4.1: Upload do Backend (Raiz)

**Destino:** `public_html/backend/`

Fazer upload de:
- `server.js`
- `package.json`
- `.env` (se tiver - cuidado com senhas!)

### Passo 4.2: Upload das Pastas

**Para cada pasta:**

#### routes/
Destino: `public_html/backend/routes/`
Upload:
- auth.js
- questionnaire.js
- diagnostic.js
- products.js
- conversions.js
- analytics.js ← NOVO

#### middleware/
Destino: `public_html/backend/middleware/`
Upload:
- auth.js
- diagnosticMonitor.js ← NOVO

#### database/
Destino: `public_html/backend/database/`
Upload:
- init.js
- create-tables.js
- create-analytics-table.js ← NOVO
- cleanup-empty-diagnostics.js ← NOVO
- cleanup-empty-diagnostics-auto.js ← NOVO
- monitor-empty-diagnostics.js ← NOVO
- (outros scripts que você tiver)

#### models/
Destino: `public_html/backend/models/`
Upload:
- User.js

#### utils/
Destino: `public_html/backend/utils/`
Upload:
- scoring.js

#### config/
Destino: `public_html/backend/config/`
Upload:
- database.js

#### questionario/
Destino: `public_html/backend/questionario/`
Upload TODOS os arquivos:
- auto-save.js ← NOVO
- analytics.js ← NOVO
- estilos-questionario.css
- intro.html ← ATUALIZADO
- 1-nutricao.html ← ATUALIZADO
- 2-digestiva.html ← ATUALIZADO
- 3-fisica.html ← ATUALIZADO
- 4-sono.html ← ATUALIZADO
- 5-mental.html ← ATUALIZADO
- 6-hormonal.html ← ATUALIZADO
- 7-sintomas.html ← ATUALIZADO

---

## ⚙️ FASE 5: CONFIGURAÇÃO

### Passo 5.1: Criar/Verificar .env

**Criar arquivo `.env` em `public_html/backend/.env`:**

```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://usuario:senha@host:porta/database

# JWT
JWT_SECRET=seu_secret_aqui
JWT_EXPIRE=7d

# CORS
ALLOWED_ORIGINS=https://oceasupplements.com,https://www.oceasupplements.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

⚠️ **Importante:** Substituir com suas credenciais reais!

### Passo 5.2: Instalar Dependências (via SSH)

**Conectar via SSH:**

```bash
ssh usuario@ssh.hostinger.com -p 65002
```

**Navegar até backend:**

```bash
cd domains/oceasupplements.com/public_html/backend
```

**Instalar pacotes:**

```bash
npm install
```

### Passo 5.3: Criar Tabela de Analytics

```bash
node database/create-analytics-table.js
```

Deve mostrar:
```
✅ Tabela analytics_events criada
✅ Índices criados
```

### Passo 5.4: Iniciar/Reiniciar Servidor

```bash
# Se usa PM2
pm2 restart app

# OU se usa npm
npm start

# OU se usa nodemon
npm run dev
```

---

## 🔗 FASE 6: ATUALIZAR REFERÊNCIAS

### Passo 6.1: Atualizar Links no Site Principal

**Arquivos que podem ter links para o questionário:**

Verificar e atualizar em `public_html/`:
- `index.html`
- `login.html`
- `dashboard.html`
- Qualquer arquivo que tenha links para `/questionario/`

**Mudar de:**
```html
<a href="/questionario/intro.html">Fazer Questionário</a>
```

**Para:**
```html
<a href="/backend/questionario/intro.html">Fazer Questionário</a>
```

### Passo 6.2: Verificar Configuração do Backend

**No arquivo `server.js`, verificar se está configurado para servir arquivos estáticos:**

```javascript
// Servir arquivos estáticos da pasta questionario
app.use('/backend/questionario', express.static('questionario'));
```

Se não tiver, adicionar essa linha.

### Passo 6.3: Configurar .htaccess (Opcional - para redirecionamento)

**Criar `public_html/backend/.htaccess`:**

```apache
# Permitir acesso aos arquivos
Options +FollowSymLinks
RewriteEngine On

# Servir arquivos estáticos do questionário
<FilesMatch "\.(html|css|js|png|jpg|gif|svg)$">
    Allow from all
</FilesMatch>

# Configurar Node.js (se aplicável)
PassengerEnabled on
PassengerAppRoot /home/u123456789/domains/oceasupplements.com/public_html/backend
PassengerAppType node
PassengerStartupFile server.js
```

### Passo 6.4: Criar Redirecionamento da URL Antiga (Opcional)

**Criar `public_html/.htaccess` ou adicionar:**

```apache
RewriteEngine On

# Redirecionar /questionario/ antigo para /backend/questionario/
RewriteRule ^questionario/(.*)$ /backend/questionario/$1 [R=301,L]
```

Isso faz com que:
- `/questionario/intro.html` → redirecione para → `/backend/questionario/intro.html`

---

## 🧪 FASE 7: TESTES COMPLETOS

### Teste 7.1: Verificar Arquivos Acessíveis

**No navegador, testar:**

```
✅ https://oceasupplements.com/backend/questionario/auto-save.js
   Deve mostrar: código JavaScript

✅ https://oceasupplements.com/backend/questionario/analytics.js
   Deve mostrar: código JavaScript

✅ https://oceasupplements.com/backend/questionario/intro.html
   Deve mostrar: página do questionário

✅ https://oceasupplements.com/backend/questionario/estilos-questionario.css
   Deve mostrar: código CSS
```

❌ **Se algum retornar 404:** Verificar se fez upload corretamente

### Teste 7.2: Testar Console

1. Abrir: `https://oceasupplements.com/backend/questionario/intro.html`
2. Pressionar **F12** (console do navegador)
3. Verificar se aparece:

```
[AutoSave] 🔧 Inicializando auto-save para seção: intro
[AutoSave] ✅ Auto-save inicializado com sucesso
[Analytics] 📊 Analytics inicializado para página: intro
[Analytics] ✅ Analytics pronto
```

✅ **Se aparecer:** Tudo certo!
❌ **Se der erro:** Ver erros no console e corrigir

### Teste 7.3: Testar Auto-Save

1. Preencher campos (peso, altura)
2. Aguardar 2 segundos
3. Deve aparecer toast: "💾 Dados salvos automaticamente"
4. Console deve mostrar: `[AutoSave] 💾 Dados salvos...`
5. Dar **F5** (refresh)
6. Campos devem estar preenchidos!

### Teste 7.4: Testar Questionário Completo

**IMPORTANTE:** Fazer um fluxo completo:

1. Fazer login
2. Preencher **TODAS** as páginas:
   - intro.html
   - 1-nutricao.html
   - 2-digestiva.html
   - 3-fisica.html
   - 4-sono.html
   - 5-mental.html
   - 6-hormonal.html
   - 7-sintomas.html
3. Finalizar
4. Ver diagnóstico gerado

**Verificar:**
- [ ] Scores calculados corretamente (não mais 17)
- [ ] Dados não estão vazios no banco
- [ ] Navegação entre páginas funciona
- [ ] Auto-save funciona em todas as páginas
- [ ] Analytics registra eventos

### Teste 7.5: Testar Backend API

```bash
# Endpoint de monitoramento
curl https://oceasupplements.com/api/v1/monitoring/empty-diagnostics

# Deve retornar JSON com estatísticas
```

```bash
# Endpoint de analytics (com token)
curl https://oceasupplements.com/api/v1/analytics/funnel \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🗑️ FASE 8: DELETAR PASTA ANTIGA (Após 1 semana de testes)

⚠️ **ATENÇÃO:** Só fazer isso depois de **1 semana** de testes sem problemas!

### Passo 8.1: Verificar Que Tudo Está Funcionando

**Checklist final:**
- [ ] Questionário completo funciona
- [ ] Usuários conseguem preencher e finalizar
- [ ] Auto-save funciona
- [ ] Analytics funciona
- [ ] Backend APIs respondem
- [ ] Nenhum erro no console
- [ ] Nenhum usuário reclamou
- [ ] Todos os links foram atualizados

### Passo 8.2: Fazer Backup Novamente

Antes de deletar, fazer novo backup:

```
backup-ANTES-DELETE-ANTIGO-20251105.zip
```

### Passo 8.3: Deletar Pasta Antiga

**Via File Manager:**

1. Navegar até `public_html/`
2. Selecionar pasta `questionario/` (a antiga, na raiz)
3. Clicar em **"Deletar"**
4. Confirmar

Agora só existe: `public_html/backend/questionario/`

---

## 🚨 PLANO DE ROLLBACK (Se algo der errado)

### Cenário 1: Algo quebrou durante a migração

**Restaurar backup:**

1. File Manager → `public_html/`
2. Deletar pasta `backend/` (incompleta)
3. Upload do `backup-ANTES-MIGRACAO-20251029.zip`
4. Extrair
5. Sistema volta ao normal

### Cenário 2: Migração completa mas algo não funciona

**Opção A - Manter ambos temporariamente:**

```
public_html/
├── backend/questionario/  ← Novo (com problemas)
└── questionario/  ← Antigo (funciona)
```

Atualizar links para voltar para `/questionario/` temporariamente.

**Opção B - Rollback completo:**

Igual ao Cenário 1.

### Comandos de Emergência (via SSH)

```bash
# Voltar backup
cd /home/u123456789/domains/oceasupplements.com
rm -rf public_html/backend/
unzip backup-ANTES-MIGRACAO-20251029.zip -d public_html/

# Reiniciar servidor
pm2 restart app
```

---

## 📋 CHECKLIST FINAL DE EXECUÇÃO

Imprima ou marque conforme for fazendo:

### BACKUP
- [ ] Backup do File Manager criado
- [ ] Backup baixado para o PC
- [ ] Backup do banco de dados criado
- [ ] Backups verificados e funcionando

### PREPARAÇÃO
- [ ] Pasta temporária criada no PC
- [ ] Arquivos copiados e verificados
- [ ] Lista de upload preparada

### CRIAÇÃO DE ESTRUTURA
- [ ] Pasta `backend/` criada na Hostinger
- [ ] Subpastas criadas (routes, middleware, etc.)
- [ ] Pasta `questionario/` criada dentro de backend

### UPLOAD
- [ ] server.js, package.json uploadados
- [ ] routes/ uploadado (6 arquivos)
- [ ] middleware/ uploadado (2 arquivos)
- [ ] database/ uploadado (scripts)
- [ ] models/ uploadado
- [ ] utils/ uploadado
- [ ] config/ uploadado
- [ ] questionario/ uploadado (todos arquivos)

### CONFIGURAÇÃO
- [ ] .env criado/atualizado
- [ ] npm install executado via SSH
- [ ] Tabela analytics criada
- [ ] Servidor reiniciado
- [ ] .htaccess configurado

### ATUALIZAÇÃO
- [ ] Links atualizados em index.html
- [ ] Links atualizados em login.html
- [ ] Links atualizados em dashboard.html
- [ ] Redirecionamento configurado

### TESTES
- [ ] Arquivos JS carregam sem 404
- [ ] Console mostra logs de AutoSave/Analytics
- [ ] Auto-save funciona
- [ ] Refresh restaura dados
- [ ] Questionário completo testado
- [ ] Scores corretos gerados
- [ ] Backend APIs respondem
- [ ] Analytics funciona

### PÓS-MIGRAÇÃO
- [ ] Monitorar por 1 semana
- [ ] Usuários testaram
- [ ] Nenhum erro reportado
- [ ] Backup novo antes de deletar antigo
- [ ] Pasta antiga deletada

---

## ⏱️ Timeline Sugerido

### Dia 1 (Hoje):
- ✅ Fazer backup
- ✅ Upload de arquivos
- ✅ Configuração inicial
- ✅ Primeiros testes

### Dias 2-7:
- ⏳ Monitorar uso
- ⏳ Coletar feedback
- ⏳ Ajustar se necessário

### Dia 8+:
- 🗑️ Deletar pasta antiga
- ✅ Concluir migração

---

## 📞 Suporte

Se algo der errado:
1. Não entre em pânico
2. Restaure o backup
3. Me pergunte o que fazer

---

**PRONTO! Agora você tem um guia COMPLETO e SEGURO!** 🚀

Quer que eu crie mais alguma coisa para facilitar? (Script de validação automática, por exemplo?)
