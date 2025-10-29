# 🔗 Guia para Atualizar Links no Site Principal

## ✅ JÁ FEITO:

Os links **dentro do questionário** já foram atualizados automaticamente! ✅

Arquivos atualizados:
- intro.html
- 1-nutricao.html
- 2-digestiva.html
- 3-fisica.html
- 4-sono.html
- 5-mental.html
- 6-hormonal.html
- 7-sintomas.html

---

## ⚠️ FALTA FAZER:

Atualizar links nos **arquivos do site principal** que estão na Hostinger:

### Arquivos que podem ter links para o questionário:

1. **index.html** (página inicial)
2. **login.html** (página de login)
3. **dashboard.html** (dashboard do usuário)
4. **Outros arquivos HTML** na raiz do site

---

## 🔍 O QUE PROCURAR:

Procure por qualquer link que aponte para `/questionario/`:

```html
<!-- ANTES (antigo): -->
<a href="/questionario/intro.html">Fazer Questionário</a>
<button onclick="window.location.href='/questionario/intro.html'">Iniciar</button>

<!-- DEPOIS (novo): -->
<a href="/backend/questionario/intro.html">Fazer Questionário</a>
<button onclick="window.location.href='/backend/questionario/intro.html'">Iniciar</button>
```

---

## 📝 COMO FAZER:

### Via File Manager da Hostinger:

#### 1. Login na Hostinger
   - File Manager → public_html

#### 2. Editar index.html (se tiver link)
   - Clicar em `index.html` → **Editar**
   - Procurar por `/questionario/` (Ctrl+F)
   - Substituir por `/backend/questionario/`
   - **Salvar**

#### 3. Editar login.html (se tiver link)
   - Clicar em `login.html` → **Editar**
   - Procurar por `/questionario/` (Ctrl+F)
   - Substituir por `/backend/questionario/`
   - **Salvar**

#### 4. Editar dashboard.html (se tiver link)
   - Clicar em `dashboard.html` → **Editar**
   - Procurar por `/questionario/` (Ctrl+F)
   - Substituir por `/backend/questionario/`
   - **Salvar**

#### 5. Verificar outros arquivos
   - Qualquer outro HTML que possa ter links

---

## 🎯 Exemplos Comuns:

### Botão "Fazer Questionário"
```html
<!-- ANTES -->
<a href="/questionario/intro.html" class="btn">Fazer Questionário</a>

<!-- DEPOIS -->
<a href="/backend/questionario/intro.html" class="btn">Fazer Questionário</a>
```

### Redirecionamento após login
```javascript
// ANTES
if (loginSuccess) {
    window.location.href = '/questionario/intro.html';
}

// DEPOIS
if (loginSuccess) {
    window.location.href = '/backend/questionario/intro.html';
}
```

### Links no menu
```html
<!-- ANTES -->
<li><a href="/questionario/intro.html">Questionário</a></li>

<!-- DEPOIS -->
<li><a href="/backend/questionario/intro.html">Questionário</a></li>
```

---

## ✅ CHECKLIST:

- [ ] Abrir File Manager da Hostinger
- [ ] Ir em public_html/
- [ ] Editar index.html (se tiver links)
- [ ] Editar login.html (se tiver links)
- [ ] Editar dashboard.html (se tiver links)
- [ ] Verificar outros HTMLs
- [ ] Salvar todos os arquivos
- [ ] Testar clicando nos links

---

## 🧪 COMO TESTAR:

1. Abrir seu site: https://oceasupplements.com
2. Clicar no botão/link do questionário
3. Deve abrir: `https://oceasupplements.com/backend/questionario/intro.html`
4. ✅ Se abrir corretamente, está OK!
5. ❌ Se der erro 404, verificar se atualizou o link

---

## 🚨 SE DER ERRO 404:

**Erro:** "Not Found - /questionario/intro.html"

**Causa:** O link ainda está apontando para o caminho antigo

**Solução:**
1. Verificar qual arquivo tem o link errado
2. Editar e corrigir para `/backend/questionario/`
3. Salvar
4. Testar novamente

---

## 💡 DICA:

Se você não souber quais arquivos têm links, pode:

1. Abrir cada HTML no File Manager
2. Procurar (Ctrl+F) por "questionario"
3. Se encontrar, verificar se precisa atualizar
4. Se não encontrar, está OK!

---

## ⚡ ALTERNATIVA: Redirecionamento Automático

Se você não quiser atualizar todos os links manualmente, pode criar um redirecionamento:

**Criar arquivo `.htaccess` em `public_html/`:**

```apache
RewriteEngine On
RewriteRule ^questionario/(.*)$ /backend/questionario/$1 [R=301,L]
```

Isso faz com que qualquer acesso a `/questionario/` seja redirecionado automaticamente para `/backend/questionario/`!

**Vantagem:** Links antigos continuam funcionando
**Desvantagem:** URLs ficam com redirecionamento (menos elegante)

---

## 📞 RESUMO:

1. ✅ Links **dentro** do questionário → JÁ ATUALIZADOS
2. ⚠️ Links **no site** (index, login, dashboard) → VOCÊ PRECISA ATUALIZAR
3. 💡 OU criar redirecionamento .htaccess → Funciona automaticamente

---

**Escolha uma das opções e me avise se tiver dúvida!** 😊
