# 🚀 Quick Start Guide - Melhorias Implementadas

Guia rápido para usar as novas funcionalidades implementadas no sistema.

---

## 📋 O que foi implementado?

✅ **Monitoramento de diagnósticos vazios**
✅ **Auto-save automático em todas as páginas**
✅ **Sistema completo de analytics**
✅ **Scripts de limpeza e manutenção**
✅ **Novos endpoints de monitoramento**

---

## 🎯 Uso Diário

### 1. Monitorar Saúde do Sistema

#### Endpoint de monitoramento
```bash
curl http://localhost:3000/api/v1/monitoring/empty-diagnostics
```

Retorna estatísticas em tempo real:
```json
{
  "status": "ok",
  "statistics": {
    "total_diagnostics": 50,
    "empty_diagnostics": 0,
    "valid_diagnostics": 50,
    "empty_percentage": 0
  }
}
```

#### Monitoramento contínuo (background)
```bash
# Rodar em terminal separado
node database/monitor-empty-diagnostics.js
```

Mostra alertas em tempo real quando diagnósticos vazios são criados.

---

### 2. Ver Analytics de Abandono

#### Funil de conversão completo
```bash
curl http://localhost:3000/api/v1/analytics/funnel \
  -H "Authorization: Bearer $TOKEN"
```

Retorna:
```json
{
  "funnel": [
    {
      "page": "intro",
      "sessions": 100,
      "abandon_rate": "10.00",
      "avg_time_on_page": 45
    },
    {
      "page": "nutricao",
      "sessions": 90,
      "conversion_rate": "90.00"
    }
  ]
}
```

#### Estatísticas de abandono
```bash
curl http://localhost:3000/api/v1/analytics/abandonment \
  -H "Authorization: Bearer $TOKEN"
```

Mostra quais páginas têm mais abandono.

---

### 3. Debug de Sessão Específica

```bash
curl http://localhost:3000/api/v1/analytics/session/sess_1234567890 \
  -H "Authorization: Bearer $TOKEN"
```

Retorna todos os eventos de uma sessão (replay completo).

---

## 🛠️ Manutenção

### Limpeza Semanal de Diagnósticos Vazios

```bash
# Modo automático (sem confirmação)
node database/cleanup-empty-diagnostics-auto.js

# Modo interativo (pede confirmação)
node database/cleanup-empty-diagnostics.js
```

Recomendação: Rodar 1x por semana via cron.

---

## 🧪 Testes

### Testar Auto-Save

1. Abra qualquer página do questionário
2. Preencha alguns campos
3. Abra o console do navegador
4. Veja os logs: `[AutoSave] 💾 Dados salvos automaticamente`
5. Refresh a página
6. Veja os logs: `[AutoSave] 📂 X campos restaurados`

### Testar Analytics

1. Abra qualquer página do questionário
2. Abra o console do navegador
3. Veja os logs: `[Analytics] 📊 Analytics inicializado`
4. Interaja com a página (scroll, cliques, campos)
5. Veja eventos sendo registrados
6. Eventos são enviados a cada 5 segundos para o backend

---

## 📊 Dashboards Úteis

### Ver todas as sessões recentes
```sql
SELECT DISTINCT session_id, MIN(created_at) as started_at
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY session_id
ORDER BY started_at DESC;
```

### Top 5 páginas com mais abandono
```sql
SELECT page, COUNT(*) as abandons
FROM analytics_events
WHERE event_type = 'page_abandon'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY page
ORDER BY abandons DESC
LIMIT 5;
```

### Tempo médio por página
```sql
SELECT
  page,
  AVG(CAST(event_data->>'time_on_page' AS INTEGER)) as avg_seconds
FROM analytics_events
WHERE event_type = 'page_abandon' OR event_type = 'navigation'
GROUP BY page
ORDER BY avg_seconds DESC;
```

---

## 🔧 Configuração (opcional)

### Desabilitar logs no console

**Auto-save**:
```javascript
// Em auto-save.js linha 13
enableConsoleLog: false
```

**Analytics**:
```javascript
// Em analytics.js linha 30
enableConsoleLog: false
```

### Alterar intervalo de envio

**Analytics**:
```javascript
// Em analytics.js linha 29
sendInterval: 10000  // 10 segundos ao invés de 5
```

### Alterar debounce do auto-save

**Auto-save**:
```javascript
// Em auto-save.js linha 12
debounceDelay: 2000  // 2 segundos ao invés de 1
```

---

## 🚨 Troubleshooting

### Diagnósticos vazios ainda aparecem?

1. Verifique os logs do servidor
2. Execute o monitoramento:
   ```bash
   node database/monitor-empty-diagnostics.js
   ```
3. Se detectar novo diagnóstico vazio, veja os logs detalhados no console
4. Verifique se o middleware está funcionando (linha no server.js:96)

### Auto-save não está funcionando?

1. Abra o console do navegador
2. Verifique se há erros de JavaScript
3. Verifique se o arquivo `auto-save.js` está carregando
4. Teste manualmente:
   ```javascript
   AutoSave.getStats()  // Deve retornar objeto com estatísticas
   ```

### Analytics não está enviando eventos?

1. Verifique o console do navegador
2. Verifique a aba Network para ver requisições POST para `/api/v1/analytics/events`
3. Verifique se a tabela existe:
   ```sql
   SELECT COUNT(*) FROM analytics_events;
   ```
4. Se necessário, recrie a tabela:
   ```bash
   node database/create-analytics-table.js
   ```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do servidor
2. Verifique os logs do navegador (console)
3. Execute os scripts de debug em `database/`
4. Consulte `IMPROVEMENTS.md` para documentação completa
5. Consulte `BUGFIX-SCORES.md` para contexto do problema original

---

## ✅ Checklist de Deploy

Ao fazer deploy em produção:

- [ ] Rodar `node database/create-analytics-table.js`
- [ ] Verificar que as 8 páginas HTML incluem auto-save.js e analytics.js
- [ ] Testar um fluxo completo do questionário
- [ ] Verificar endpoint de monitoramento está acessível
- [ ] Configurar cron job para limpeza semanal
- [ ] Configurar alertas (Sentry, CloudWatch, etc.)
- [ ] Testar em diferentes navegadores
- [ ] Verificar política de retenção de dados (LGPD/GDPR)

---

**Última atualização**: 29/10/2025
**Versão do sistema**: 1.1.0
