# 📦 Checklist de Deploy - Hostinger

## 🎯 Arquivos que PRECISAM ser atualizados na Hostinger

### Backend (Node.js/Express)

#### 1. Novos arquivos a fazer upload:

```
📁 backend/
├── 📁 middleware/
│   └── diagnosticMonitor.js          ⬆️ NOVO
├── 📁 routes/
│   └── analytics.js                  ⬆️ NOVO
├── 📁 database/ (scripts de manutenção)
│   ├── cleanup-empty-diagnostics.js
│   ├── cleanup-empty-diagnostics-auto.js
│   ├── monitor-empty-diagnostics.js
│   └── create-analytics-table.js
├── server.js                          ✏️ MODIFICADO
└── IMPROVEMENTS.md                    ⬆️ NOVO (documentação)
```

#### 2. Arquivos modificados:
- `server.js` - Adicionadas rotas de analytics e middleware

---

### Frontend (Questionário HTML/JS)

#### 1. Novos arquivos JavaScript (CRÍTICOS):

```
📁 questionario/
├── auto-save.js                      ⬆️ NOVO - Sistema de auto-save
├── analytics.js                      ⬆️ NOVO - Sistema de analytics
└── add-autosave-to-all.js           ⬆️ NOVO - Script auxiliar
└── add-analytics-to-all.js          ⬆️ NOVO - Script auxiliar
```

#### 2. Todos os arquivos HTML modificados:

```
📁 questionario/
├── intro.html                        ✏️ MODIFICADO
├── 1-nutricao.html                   ✏️ MODIFICADO
├── 2-digestiva.html                  ✏️ MODIFICADO
├── 3-fisica.html                     ✏️ MODIFICADO
├── 4-sono.html                       ✏️ MODIFICADO
├── 5-mental.html                     ✏️ MODIFICADO
├── 6-hormonal.html                   ✏️ MODIFICADO
└── 7-sintomas.html                   ✏️ MODIFICADO
```

---

## 🚀 Passo a Passo do Deploy

### Passo 1: Upload dos arquivos via FTP/SFTP

#### Opção A: Via Hostinger File Manager
1. Login no painel da Hostinger
2. Ir em **Websites** → Seu site → **File Manager**
3. Navegar até a pasta do projeto

#### Opção B: Via FileZilla (recomendado)
1. Conectar via SFTP
2. Navegar até a pasta do backend

### Passo 2: Fazer upload dos arquivos

**ORDEM RECOMENDADA:**

```bash
1. Upload dos módulos JS primeiro:
   📤 questionario/auto-save.js
   📤 questionario/analytics.js

2. Upload dos HTMLs modificados:
   📤 questionario/*.html (todos os 8 arquivos)

3. Upload do backend:
   📤 server.js
   📤 middleware/diagnosticMonitor.js
   📤 routes/analytics.js
   📤 database/*.js (scripts)
```

### Passo 3: Criar tabela de analytics no banco

**⚠️ IMPORTANTE**: Conectar ao banco de dados e executar:

```bash
# Via SSH na Hostinger
cd /home/seu-usuario/backend
node database/create-analytics-table.js
```

OU executar o SQL manualmente via phpMyAdmin/PostgreSQL Admin:

```sql
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL,
  page VARCHAR(50),
  event_data JSONB,
  user_agent TEXT,
  screen_size VARCHAR(20),
  viewport_size VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_page ON analytics_events(page);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);
```

### Passo 4: Reiniciar o servidor Node.js

```bash
# Via SSH ou painel da Hostinger
pm2 restart app
# OU
npm run dev
```

---

## 🧪 Passo 5: Testar o Sistema

### Teste 1: Verificar se arquivos estão acessíveis

Abra no navegador:
```
https://seu-site.com/questionario/auto-save.js
https://seu-site.com/questionario/analytics.js
```

Deve mostrar o código JavaScript (não erro 404).

### Teste 2: Abrir uma página do questionário

```
https://seu-site.com/questionario/intro.html
```

**Abra o Console do navegador (F12)** e veja:
```
[AutoSave] 🔧 Inicializando auto-save para seção: intro
[AutoSave] ✅ Auto-save inicializado com sucesso
[Analytics] 📊 Analytics inicializado para página: intro
[Analytics] ✅ Analytics pronto
```

### Teste 3: Verificar auto-save

1. Preencha alguns campos (peso, altura, etc.)
2. Aguarde 1-2 segundos
3. Veja no console: `[AutoSave] 💾 Dados salvos automaticamente`
4. Deve aparecer toast no canto inferior direito
5. Dê refresh (F5) na página
6. Veja no console: `[AutoSave] 📂 X campos restaurados`
7. Campos devem estar preenchidos!

### Teste 4: Verificar analytics

1. Navegue pela página (scroll, clique em botões)
2. Veja no console: `[Analytics] 📝 Evento registrado: ...`
3. Após 5 segundos: `[Analytics] 📤 Eventos enviados: X`

### Teste 5: Verificar endpoints do backend

```bash
# Health check de diagnósticos vazios
curl https://seu-site.com/api/v1/monitoring/empty-diagnostics

# Deve retornar JSON com estatísticas
```

---

## 🧪 Passo 6: Simular Questionário Completo

### Fluxo completo de teste:

1. **Limpar dados anteriores** (opcional):
   ```javascript
   // No console do navegador
   localStorage.clear()
   ```

2. **Fazer login** no sistema

3. **Preencher o questionário completamente**:
   - Intro → Nutrição → Digestiva → Física → Sono → Mental → Hormonal → Sintomas

4. **Observar o console** em cada página:
   - Auto-save funcionando?
   - Analytics enviando eventos?

5. **Finalizar o questionário**

6. **Verificar o resultado**:
   - Scores foram calculados corretamente?
   - Dados NÃO estão vazios?

7. **Verificar no banco de dados**:
   ```sql
   -- Ver último diagnóstico
   SELECT id, user_id, total_score,
          LENGTH(questionnaire_data::text) as data_size
   FROM diagnostics
   ORDER BY id DESC
   LIMIT 1;

   -- Deve ter data_size > 100 bytes
   ```

8. **Verificar analytics**:
   ```sql
   SELECT COUNT(*) FROM analytics_events;
   -- Deve ter vários eventos registrados
   ```

---

## ✅ Verificações Finais

- [ ] Arquivos JS carregam sem erro 404
- [ ] Console mostra inicialização de auto-save e analytics
- [ ] Auto-save funciona (toast aparece, dados são salvos)
- [ ] Refresh da página restaura dados
- [ ] Analytics envia eventos para o backend
- [ ] Tabela analytics_events foi criada
- [ ] Endpoint de monitoramento responde
- [ ] Questionário completo gera diagnóstico válido
- [ ] Scores estão corretos (não mais 17)
- [ ] questionnaire_data não está vazio ({})

---

## 🚨 Troubleshooting

### Erro: "auto-save.js not found"
**Solução**: Verificar se fez upload do arquivo para a pasta `questionario/`

### Erro: "Analytics is not defined"
**Solução**: Verificar ordem dos scripts no HTML. Analytics deve vir antes do AutoSave.

### Erro: "Cannot POST /api/v1/analytics/events"
**Solução**:
1. Verificar se `routes/analytics.js` foi feito upload
2. Verificar se `server.js` foi atualizado
3. Reiniciar servidor Node.js

### Dados ainda estão vazios
**Solução**:
1. Verificar console do navegador por erros JS
2. Verificar se auto-save está salvando (ver localStorage)
3. Verificar se endpoint `/questionnaire/complete` está recebendo dados

### Tabela analytics_events não existe
**Solução**: Executar `node database/create-analytics-table.js` via SSH

---

## 📱 Como Acessar SSH na Hostinger

1. Login no painel da Hostinger
2. Ir em **Avançado** → **SSH Access**
3. Copiar hostname, porta, usuário
4. Conectar via terminal:
   ```bash
   ssh usuario@hostname -p porta
   ```
5. Navegar até a pasta do projeto:
   ```bash
   cd domains/seu-site.com/public_html/backend
   ```

---

## 🎯 Resultado Esperado

Após o deploy completo:

✅ **Usuário preenche questionário**
  → Auto-save salva automaticamente a cada 1 segundo
  → Se usuário der refresh, dados são restaurados
  → Analytics rastreia tempo, scroll, cliques

✅ **Usuário finaliza questionário**
  → Dados completos enviados ao backend
  → Scores calculados corretamente
  → Diagnóstico válido criado

✅ **Monitoramento**
  → Endpoint mostra 0% de diagnósticos vazios
  → Analytics mostra funil de conversão
  → Possível identificar onde usuários abandonam

---

**Tempo estimado de deploy**: 15-30 minutos

**⚠️ BACKUP**: Antes de fazer deploy, faça backup dos arquivos atuais da Hostinger!

---

## 💡 Dica Extra

Após o deploy, você pode:

1. **Monitorar analytics em tempo real**:
   ```bash
   # Via SSH
   node database/monitor-empty-diagnostics.js
   ```

2. **Ver funil de conversão**:
   ```bash
   curl https://seu-site.com/api/v1/analytics/funnel \
     -H "Authorization: Bearer SEU_TOKEN"
   ```

3. **Limpar diagnósticos vazios antigos** (se houver):
   ```bash
   node database/cleanup-empty-diagnostics-auto.js
   ```

---

**Boa sorte com o deploy! 🚀**
