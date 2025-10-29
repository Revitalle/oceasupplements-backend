# 🚂 Próximos Passos - Railway + Hostinger

## ✅ JÁ FEITO:

1. ✅ Git push para GitHub
2. ✅ Railway fez deploy automático (ou está fazendo agora)
3. ✅ Links do questionário atualizados localmente
4. ✅ Arquivos preparados para upload na Hostinger

---

## 🎯 O QUE FALTA FAZER:

### **1️⃣ Criar Tabela de Analytics no Railway**

#### Como fazer:

1. **Entrar no Railway Dashboard**
   - https://railway.app
   - Login com sua conta

2. **Abrir seu projeto**
   - Procurar pelo projeto do backend

3. **Abrir Terminal**
   - Clicar no serviço/container do backend
   - Procurar aba **"Terminal"** ou **"Shell"**
   - OU clicar em **"Deploy Logs"** → **"Open Terminal"**

4. **Executar comando**
   ```bash
   node database/create-analytics-table.js
   ```

5. **Verificar output**
   ```
   ✅ Tabela analytics_events criada
   ✅ Índices criados
   ```

---

### **2️⃣ Upload dos Arquivos na Hostinger**

Os arquivos já estão com os links corretos! Agora fazer upload:

#### Via File Manager:

1. **Entrar na Hostinger** → File Manager
2. **Ir para:** `public_html/backend/questionario/`
3. **Fazer upload** dos arquivos atualizados:

```
✅ auto-save.js (NOVO)
✅ analytics.js (NOVO)
✅ intro.html (ATUALIZADO - links corretos)
✅ 1-nutricao.html (ATUALIZADO)
✅ 2-digestiva.html (ATUALIZADO)
✅ 3-fisica.html (ATUALIZADO)
✅ 4-sono.html (ATUALIZADO)
✅ 5-mental.html (ATUALIZADO)
✅ 6-hormonal.html (ATUALIZADO)
✅ 7-sintomas.html (ATUALIZADO)
✅ processando.html (se tiver)
✅ resultados.html (se tiver)
```

**Origem:** `C:\Users\User\teste-claude\backend\questionario\`

---

### **3️⃣ Atualizar Links no Site Principal**

Arquivos na **raiz** da Hostinger que podem ter links:

#### **Opção A: Manual (Recomendada)**

**Editar no File Manager da Hostinger:**

**public_html/index.html:**
- Procurar: `/questionario/`
- Substituir: `/backend/questionario/`

**public_html/login.html:**
- Procurar: `/questionario/`
- Substituir: `/backend/questionario/`

**public_html/dashboard.html:**
- Procurar: `/questionario/`
- Substituir: `/backend/questionario/`

---

#### **Opção B: Redirecionamento Automático (Mais Fácil)**

**Criar arquivo `.htaccess` em `public_html/`:**

```apache
RewriteEngine On
RewriteRule ^questionario/(.*)$ /backend/questionario/$1 [R=301,L]
```

Isso redireciona automaticamente qualquer acesso antigo!

**Como criar:**
1. File Manager → `public_html/`
2. Novo Arquivo → `.htaccess`
3. Colar o código acima
4. Salvar

---

### **4️⃣ Testar Tudo**

#### Teste 1: Verificar arquivos carregam
```
✅ https://oceasupplements.com/backend/questionario/auto-save.js
✅ https://oceasupplements.com/backend/questionario/analytics.js
✅ https://oceasupplements.com/backend/questionario/intro.html
```

Deve mostrar os arquivos (não erro 404)

#### Teste 2: Abrir questionário
```
https://oceasupplements.com/backend/questionario/intro.html
```

1. Abrir console (F12)
2. Verificar logs:
   ```
   [AutoSave] Inicializando...
   [Analytics] Inicializado...
   ```

#### Teste 3: Testar auto-save
1. Preencher campos
2. Aguardar 2 segundos
3. Ver toast "Dados salvos"
4. Dar F5 → campos devem estar preenchidos

#### Teste 4: Navegar entre páginas
1. Clicar em "Próximo"
2. Deve ir para página seguinte
3. URL deve ser `/backend/questionario/2-digestiva.html`

#### Teste 5: Questionário completo
1. Fazer login
2. Preencher todas as páginas
3. Finalizar
4. Verificar scores corretos

---

## 📋 CHECKLIST FINAL:

- [ ] Criar tabela analytics no Railway
- [ ] Upload dos arquivos na Hostinger
- [ ] Atualizar links do site (Opção A ou B)
- [ ] Teste 1: Arquivos carregam
- [ ] Teste 2: Console mostra logs
- [ ] Teste 3: Auto-save funciona
- [ ] Teste 4: Navegação funciona
- [ ] Teste 5: Questionário completo funciona

---

## 🚨 SE DER ERRO:

### Erro 404 ao acessar `/backend/questionario/intro.html`
**Causa:** Upload não foi feito ou foi para pasta errada
**Solução:** Verificar se arquivos estão em `public_html/backend/questionario/`

### Console não mostra logs do AutoSave
**Causa:** Arquivos JS não carregaram
**Solução:** Verificar se `auto-save.js` e `analytics.js` foram upados

### Links não funcionam
**Causa:** Site principal não foi atualizado
**Solução:** Atualizar links ou criar .htaccess

### Dados não salvam
**Causa:** localStorage desabilitado ou erro JS
**Solução:** Ver erros no console (F12)

---

## 🎯 RESUMO VISUAL:

```
┌──────────────────────────────────────────────────┐
│ 1️⃣ Railway                                       │
│    └─ Criar tabela: node database/create-...    │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│ 2️⃣ Hostinger - Upload Arquivos                  │
│    └─ public_html/backend/questionario/*.html   │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│ 3️⃣ Hostinger - Atualizar Links Site             │
│    └─ index.html, login.html, dashboard.html    │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│ 4️⃣ Testar Tudo                                   │
│    └─ Abrir questionário e testar               │
└──────────────────────────────────────────────────┘
```

---

**Boa sorte! Me avise quando terminar cada passo!** 🚀
