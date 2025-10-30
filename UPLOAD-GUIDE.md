# 📤 Guia Visual de Upload - Hostinger

## 📍 Onde estão os arquivos NO SEU COMPUTADOR

```
C:\Users\User\teste-claude\backend\
│
├── 📄 server.js                    ← Pegar este arquivo
│
├── 📁 middleware\
│   └── 📄 diagnosticMonitor.js     ← Pegar este arquivo
│
├── 📁 routes\
│   └── 📄 analytics.js             ← Pegar este arquivo
│
├── 📁 database\
│   └── 📄 create-analytics-table.js ← Pegar este arquivo
│
└── 📁 questionario\
    ├── 📄 auto-save.js             ← Pegar este arquivo
    ├── 📄 analytics.js             ← Pegar este arquivo
    ├── 📄 intro.html               ← Pegar este arquivo
    ├── 📄 1-nutricao.html          ← Pegar este arquivo
    ├── 📄 2-digestiva.html         ← Pegar este arquivo
    ├── 📄 3-fisica.html            ← Pegar este arquivo
    ├── 📄 4-sono.html              ← Pegar este arquivo
    ├── 📄 5-mental.html            ← Pegar este arquivo
    ├── 📄 6-hormonal.html          ← Pegar este arquivo
    └── 📄 7-sintomas.html          ← Pegar este arquivo
```

---

## 📍 Para onde devem ir NA HOSTINGER

### Estrutura na Hostinger (exemplo):

```
/home/u123456789/domains/oceasupplements.com/public_html/
│
├── 📁 backend/                     ← Pasta do backend
│   │
│   ├── 📄 server.js                ← SUBSTITUIR este arquivo
│   │
│   ├── 📁 middleware/
│   │   └── 📄 diagnosticMonitor.js ← CRIAR/ADICIONAR este arquivo
│   │
│   ├── 📁 routes/
│   │   └── 📄 analytics.js         ← CRIAR/ADICIONAR este arquivo
│   │
│   └── 📁 database/
│       └── 📄 create-analytics-table.js ← CRIAR/ADICIONAR este arquivo
│
└── 📁 questionario/                ← Pasta do questionário
    ├── 📄 auto-save.js             ← CRIAR/ADICIONAR este arquivo
    ├── 📄 analytics.js             ← CRIAR/ADICIONAR este arquivo
    ├── 📄 intro.html               ← SUBSTITUIR este arquivo
    ├── 📄 1-nutricao.html          ← SUBSTITUIR este arquivo
    ├── 📄 2-digestiva.html         ← SUBSTITUIR este arquivo
    ├── 📄 3-fisica.html            ← SUBSTITUIR este arquivo
    ├── 📄 4-sono.html              ← SUBSTITUIR este arquivo
    ├── 📄 5-mental.html            ← SUBSTITUIR este arquivo
    ├── 📄 6-hormonal.html          ← SUBSTITUIR este arquivo
    └── 📄 7-sintomas.html          ← SUBSTITUIR este arquivo
```

---

## 🎯 Passo a Passo DETALHADO

### OPÇÃO 1: Via File Manager da Hostinger (Mais Fácil)

#### 1️⃣ Fazer Login na Hostinger
1. Acesse https://www.hostinger.com.br/
2. Faça login na sua conta
3. Vá em **"Websites"**
4. Clique no seu site (oceasupplements.com)

#### 2️⃣ Abrir File Manager
1. No painel do site, clique em **"Gerenciador de Arquivos"** (File Manager)
2. Você verá a estrutura de pastas do seu site

#### 3️⃣ Upload do Backend

**Arquivo 1: server.js**
```
✅ No seu PC: C:\Users\User\teste-claude\backend\server.js
📁 Ir na Hostinger: /domains/oceasupplements.com/public_html/backend/
❌ DELETAR: server.js (fazer backup antes!)
📤 FAZER UPLOAD: server.js (novo)
```

**Arquivo 2: diagnosticMonitor.js**
```
✅ No seu PC: C:\Users\User\teste-claude\backend\middleware\diagnosticMonitor.js
📁 Ir na Hostinger: /domains/oceasupplements.com/public_html/backend/middleware/
   (Se a pasta middleware não existir, CRIE ela primeiro!)
📤 FAZER UPLOAD: diagnosticMonitor.js
```

**Arquivo 3: analytics.js (routes)**
```
✅ No seu PC: C:\Users\User\teste-claude\backend\routes\analytics.js
📁 Ir na Hostinger: /domains/oceasupplements.com/public_html/backend/routes/
📤 FAZER UPLOAD: analytics.js
```

**Arquivo 4: create-analytics-table.js**
```
✅ No seu PC: C:\Users\User\teste-claude\backend\database\create-analytics-table.js
📁 Ir na Hostinger: /domains/oceasupplements.com/public_html/backend/database/
📤 FAZER UPLOAD: create-analytics-table.js
```

#### 4️⃣ Upload do Frontend (Questionário)

**Arquivos 5 e 6: auto-save.js e analytics.js**
```
✅ No seu PC: C:\Users\User\teste-claude\backend\questionario\auto-save.js
✅ No seu PC: C:\Users\User\teste-claude\backend\questionario\analytics.js
📁 Ir na Hostinger: /domains/oceasupplements.com/public_html/questionario/
📤 FAZER UPLOAD: auto-save.js
📤 FAZER UPLOAD: analytics.js
```

**Arquivos 7-14: HTMLs do questionário**
```
✅ No seu PC: C:\Users\User\teste-claude\backend\questionario\*.html
📁 Ir na Hostinger: /domains/oceasupplements.com/public_html/questionario/
❌ FAZER BACKUP dos HTMLs antigos primeiro!
📤 FAZER UPLOAD: Todos os 8 arquivos HTML (substituir)
```

---

### OPÇÃO 2: Via FileZilla (SFTP) - Mais Rápido

#### 1️⃣ Configurar FileZilla

**Obter credenciais SSH/FTP na Hostinger:**
1. Painel da Hostinger → **Avançado** → **SSH Access**
2. Anotar:
   - **Host**: exemplo `ssh.hostinger.com`
   - **Port**: exemplo `65002`
   - **Username**: exemplo `u123456789`
   - **Password**: sua senha

**Conectar no FileZilla:**
1. Abrir FileZilla
2. Protocolo: **SFTP**
3. Host: `ssh.hostinger.com`
4. Porta: `65002`
5. Usuário: `u123456789`
6. Senha: sua senha
7. Clicar em **Conectar**

#### 2️⃣ Navegar até a pasta do projeto

**No FileZilla (painel direito):**
```
/ → domains → oceasupplements.com → public_html
```

#### 3️⃣ Upload em Massa

**Painel esquerdo (seu PC):**
```
Navegar até: C:\Users\User\teste-claude\backend
```

**Arrastar e soltar:**
- `server.js` → para `/public_html/backend/`
- `middleware/diagnosticMonitor.js` → para `/public_html/backend/middleware/`
- `routes/analytics.js` → para `/public_html/backend/routes/`
- `database/create-analytics-table.js` → para `/public_html/backend/database/`
- `questionario/auto-save.js` → para `/public_html/questionario/`
- `questionario/analytics.js` → para `/public_html/questionario/`
- `questionario/*.html` (8 arquivos) → para `/public_html/questionario/`

---

## 🖼️ Exemplo Visual - File Manager

```
File Manager da Hostinger
═══════════════════════════════════════════════════════════

📁 domains
  └── 📁 oceasupplements.com
      └── 📁 public_html
          │
          ├── 📁 backend  ← VOCÊ ESTÁ AQUI
          │   │
          │   ├── server.js  ← SUBSTITUIR
          │   │
          │   ├── 📁 middleware  ← Criar se não existe
          │   │   └── diagnosticMonitor.js  ← ADICIONAR
          │   │
          │   ├── 📁 routes
          │   │   └── analytics.js  ← ADICIONAR
          │   │
          │   └── 📁 database
          │       └── create-analytics-table.js  ← ADICIONAR
          │
          └── 📁 questionario
              ├── auto-save.js  ← ADICIONAR (NOVO)
              ├── analytics.js  ← ADICIONAR (NOVO)
              ├── intro.html    ← SUBSTITUIR
              ├── 1-nutricao.html    ← SUBSTITUIR
              ├── 2-digestiva.html   ← SUBSTITUIR
              ├── 3-fisica.html      ← SUBSTITUIR
              ├── 4-sono.html        ← SUBSTITUIR
              ├── 5-mental.html      ← SUBSTITUIR
              ├── 6-hormonal.html    ← SUBSTITUIR
              └── 7-sintomas.html    ← SUBSTITUIR
```

---

## 📝 Checklist de Upload

Marque conforme for fazendo:

### Backend
- [ ] Fazer backup de `server.js` atual
- [ ] Upload de `server.js` (substitui o antigo)
- [ ] Criar pasta `middleware/` se não existir
- [ ] Upload de `middleware/diagnosticMonitor.js`
- [ ] Upload de `routes/analytics.js`
- [ ] Upload de `database/create-analytics-table.js`

### Frontend
- [ ] Upload de `questionario/auto-save.js` (novo)
- [ ] Upload de `questionario/analytics.js` (novo)
- [ ] Fazer backup dos 8 HTMLs atuais
- [ ] Upload de `questionario/intro.html`
- [ ] Upload de `questionario/1-nutricao.html`
- [ ] Upload de `questionario/2-digestiva.html`
- [ ] Upload de `questionario/3-fisica.html`
- [ ] Upload de `questionario/4-sono.html`
- [ ] Upload de `questionario/5-mental.html`
- [ ] Upload de `questionario/6-hormonal.html`
- [ ] Upload de `questionario/7-sintomas.html`

---

## 🚨 IMPORTANTE: Estrutura de Pastas

**Se a pasta `middleware` NÃO existir na Hostinger:**

1. No File Manager, vá até `/backend/`
2. Clique em **"Nova Pasta"** (New Folder)
3. Nome: `middleware`
4. Depois faça upload do arquivo `diagnosticMonitor.js` dentro dela

**Estrutura final esperada:**
```
backend/
├── server.js
├── middleware/
│   └── diagnosticMonitor.js
├── routes/
│   ├── (outros arquivos que já existem)
│   └── analytics.js  ← NOVO
└── database/
    ├── (outros arquivos que já existem)
    └── create-analytics-table.js  ← NOVO
```

---

## ✅ Como Verificar se Deu Certo

Após fazer upload, teste no navegador:

1. **Testar se auto-save.js existe:**
   ```
   https://oceasupplements.com/questionario/auto-save.js
   ```
   Deve mostrar o código JavaScript (não erro 404)

2. **Testar se analytics.js existe:**
   ```
   https://oceasupplements.com/questionario/analytics.js
   ```
   Deve mostrar o código JavaScript (não erro 404)

3. **Testar uma página do questionário:**
   ```
   https://oceasupplements.com/questionario/intro.html
   ```
   Abrir console (F12) e verificar logs de inicialização

---

## 💡 Dica Pro

**Para não errar:**

1. Abra **DOIS** exploradores de arquivos no Windows:
   - Um em: `C:\Users\User\teste-claude\backend`
   - Outro em: Navegador com File Manager da Hostinger

2. Vá arquivo por arquivo, copiando do PC para Hostinger

3. Marque cada item na checklist acima

---

## 🆘 Ajuda Visual

**No seu PC (Windows Explorer):**
```
Este PC → C: → Users → User → teste-claude → backend
```

**Na Hostinger (File Manager):**
```
Clique em: domains → oceasupplements.com → public_html
```

---

**Ainda com dúvida? Me pergunte qual arquivo específico você quer saber onde colocar!** 😊
