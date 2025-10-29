# 📤 Guia de Upload REAL - Estrutura Correta da Hostinger

## ✅ Estrutura REAL descoberta

A sua Hostinger tem esta estrutura:

```
public_html/
├── assets/
├── css/
├── js/
├── questionario/  ← Arquivos do questionário ficam AQUI
└── (arquivos HTML na raiz)
```

**NÃO existe pasta `backend/` na Hostinger File Manager!**

O backend Node.js roda **separadamente** (via SSH, Railway, Render, etc.)

---

## 🎯 O QUE FAZER - Passo a Passo

### PARTE 1: Frontend (Hostinger File Manager) ✅

#### Upload para a pasta `questionario/`

**Arquivos do seu PC:**
```
C:\Users\User\teste-claude\backend\questionario\
```

**Destino na Hostinger:**
```
public_html/questionario/
```

#### Lista de arquivos para fazer upload:

1. **auto-save.js** (NOVO)
   - Pegar: `C:\Users\User\teste-claude\backend\questionario\auto-save.js`
   - Colocar: `public_html/questionario/auto-save.js`

2. **analytics.js** (NOVO)
   - Pegar: `C:\Users\User\teste-claude\backend\questionario\analytics.js`
   - Colocar: `public_html/questionario/analytics.js`

3. **intro.html** (SUBSTITUIR)
   - Pegar: `C:\Users\User\teste-claude\backend\questionario\intro.html`
   - Colocar: `public_html/questionario/intro.html`

4. **1-nutricao.html** (SUBSTITUIR)
   - Pegar: `C:\Users\User\teste-claude\backend\questionario\1-nutricao.html`
   - Colocar: `public_html/questionario/1-nutricao.html`

5. **2-digestiva.html** (SUBSTITUIR)
   - Pegar: `C:\Users\User\teste-claude\backend\questionario\2-digestiva.html`
   - Colocar: `public_html/questionario/2-digestiva.html`

6. **3-fisica.html** (SUBSTITUIR)
   - Pegar: `C:\Users\User\teste-claude\backend\questionario\3-fisica.html`
   - Colocar: `public_html/questionario/3-fisica.html`

7. **4-sono.html** (SUBSTITUIR)
   - Pegar: `C:\Users\User\teste-claude\backend\questionario\4-sono.html`
   - Colocar: `public_html/questionario/4-sono.html`

8. **5-mental.html** (SUBSTITUIR)
   - Pegar: `C:\Users\User\teste-claude\backend\questionario\5-mental.html`
   - Colocar: `public_html/questionario/5-mental.html`

9. **6-hormonal.html** (SUBSTITUIR)
   - Pegar: `C:\Users\User\teste-claude\backend\questionario\6-hormonal.html`
   - Colocar: `public_html/questionario/6-hormonal.html`

10. **7-sintomas.html** (SUBSTITUIR)
    - Pegar: `C:\Users\User\teste-claude\backend\questionario\7-sintomas.html`
    - Colocar: `public_html/questionario/7-sintomas.html`

---

### PARTE 2: Backend (Onde está rodando?) 🤔

**Pergunta importante:** Onde está rodando o seu backend Node.js?

- [ ] Railway (https://railway.app)
- [ ] Render (https://render.com)
- [ ] Heroku
- [ ] Servidor próprio via SSH
- [ ] Localmente no seu PC
- [ ] Outro serviço?

**Se o backend roda em serviço externo (Railway, Render, etc.):**

O deploy é feito via Git:

```bash
cd C:\Users\User\teste-claude\backend
git push origin main
```

O serviço vai fazer deploy automático dos arquivos:
- `server.js`
- `routes/analytics.js`
- `middleware/diagnosticMonitor.js`
- `database/create-analytics-table.js`

**Depois do deploy, executar via terminal do serviço:**
```bash
node database/create-analytics-table.js
```

---

## 📋 Checklist de Upload SIMPLIFICADO

### Frontend (Hostinger) ✅

- [ ] Entrar no File Manager da Hostinger
- [ ] Navegar até `public_html/questionario/`
- [ ] Fazer backup dos HTMLs atuais (opcional)
- [ ] Upload de `auto-save.js`
- [ ] Upload de `analytics.js`
- [ ] Upload de todos os 8 arquivos HTML (substituir)

### Backend (Serviço externo) ✅

- [ ] Verificar onde o backend está rodando
- [ ] Fazer `git push` para o serviço
- [ ] Aguardar deploy automático
- [ ] Executar `node database/create-analytics-table.js`
- [ ] Reiniciar servidor (se necessário)

---

## 🧪 Como Testar Depois do Upload

### Teste 1: Verificar se arquivos foram para o lugar certo

No navegador, abra:

```
https://oceasupplements.com/questionario/auto-save.js
https://oceasupplements.com/questionario/analytics.js
```

✅ **Deve mostrar**: Código JavaScript
❌ **NÃO deve mostrar**: Erro 404

### Teste 2: Abrir página do questionário

```
https://oceasupplements.com/questionario/intro.html
```

1. Abrir **Console do navegador** (F12)
2. Verificar se aparece:
   ```
   [AutoSave] 🔧 Inicializando auto-save para seção: intro
   [AutoSave] ✅ Auto-save inicializado com sucesso
   [Analytics] 📊 Analytics inicializado para página: intro
   [Analytics] ✅ Analytics pronto
   ```

### Teste 3: Testar auto-save

1. Preencher campos (peso, altura, etc.)
2. Aguardar 2 segundos
3. Verificar no console: `[AutoSave] 💾 Dados salvos automaticamente`
4. Deve aparecer **toast verde** no canto da tela
5. Dar **F5 (refresh)**
6. Campos devem estar **preenchidos**!

### Teste 4: Testar analytics

1. Rolar a página, clicar em botões
2. Verificar no console: `[Analytics] 📝 Evento registrado`
3. Após 5 segundos: `[Analytics] 📤 Eventos enviados`

---

## 🖱️ Como fazer upload via File Manager

### Passo a passo detalhado:

1. **Abrir File Manager**
   - Login Hostinger → Seu site → File Manager

2. **Navegar até a pasta questionario**
   - Clique em `public_html`
   - Clique em `questionario`

3. **Upload dos novos arquivos JS**
   - Clique em **"Upload"** (botão no topo)
   - Selecione: `auto-save.js` e `analytics.js`
   - Aguarde upload completar

4. **Substituir os HTMLs**
   - Para cada HTML (intro.html, 1-nutricao.html, etc.):
     - Clique em **"Upload"**
     - Selecione o arquivo
     - Se perguntar "substituir?", clique **"Sim"**

---

## 🎯 Resultado Final Esperado

Após o upload, a pasta `questionario/` deve ter:

```
questionario/
├── auto-save.js          ← NOVO ✅
├── analytics.js          ← NOVO ✅
├── estilos-questionario.css
├── intro.html            ← ATUALIZADO ✅
├── 1-nutricao.html       ← ATUALIZADO ✅
├── 2-digestiva.html      ← ATUALIZADO ✅
├── 3-fisica.html         ← ATUALIZADO ✅
├── 4-sono.html           ← ATUALIZADO ✅
├── 5-mental.html         ← ATUALIZADO ✅
├── 6-hormonal.html       ← ATUALIZADO ✅
└── 7-sintomas.html       ← ATUALIZADO ✅
```

---

## ⚠️ IMPORTANTE

**Você NÃO precisa fazer upload de:**
- `server.js`
- `routes/analytics.js`
- `middleware/diagnosticMonitor.js`
- `database/create-analytics-table.js`

Esses arquivos fazem parte do **backend** e estão em outro servidor!

---

## 🆘 Troubleshooting

### "Erro 404 ao acessar auto-save.js"
**Solução**: Verificar se fez upload para a pasta `questionario/` (não na raiz)

### "Console não mostra logs de AutoSave"
**Solução**: Limpar cache do navegador (Ctrl+Shift+Delete)

### "Dados não são salvos"
**Solução**:
1. Verificar se `auto-save.js` carrega sem erro
2. Ver erros no console (F12)
3. Verificar se localStorage está habilitado

---

**Está mais claro agora?** 😊

O frontend vai para Hostinger, o backend fica onde ele já está rodando!
