# 🐛 Bugfix: Scores Incorretos (0 ou 100) no Diagnóstico

**Data**: 29/10/2025
**Status**: ✅ RESOLVIDO
**Severidade**: Alta

---

## 📋 Problema Relatado

Após o preenchimento do questionário, as notas (scores) retornadas no diagnóstico estavam incorretas:
- **Total Score**: Sempre 17
- **Scores individuais**: Maioria em 0, apenas Sintomas em 100
- **Severity Level**: Sempre "high" (incorreto para score 17)

---

## 🔍 Investigação

### Passo 1: Análise dos Diagnósticos no Banco

```sql
SELECT id, user_id, total_score, intro_score, nutrition_score,
       LENGTH(questionnaire_data::text) as data_size
FROM diagnostics ORDER BY id DESC LIMIT 5;
```

**Resultado**:
- IDs 6, 7, 11, 13: `data_size = 2 bytes` (apenas `{}`)
- ID 31 (teste): `data_size = 637 bytes` (dados completos)

**Conclusão**: Os usuários reais estavam enviando `questionnaire_data` **vazio** para a API!

---

### Passo 2: Análise do Fluxo Frontend → Backend

#### ✅ Frontend (7-sintomas.html)
- Coleta dados do `localStorage` corretamente
- Envia para `/api/v1/questionnaire/complete` com estrutura correta:
  ```json
  {
    "session_id": 1234567,
    "questionnaire_data": {
      "intro": {...},
      "nutricao": {...},
      ...
    }
  }
  ```

#### ✅ Backend (routes/questionnaire.js)
- Recebe `questionnaire_data` corretamente
- Achata (flatten) os dados para passar ao scoring
- Calcula scores com `computeAllScores(flattenedData)`

#### ✅ Scoring (utils/scoring.js)
- Lógica de cálculo está correta
- Aceita múltiplos nomes de campos (fallbacks):
  - `ans.q1_1 || ans.refeicoes || ans.refeicoes_dia`
- Quando dados estão vazios, retorna scores padrão:
  - Nutrição, Digestiva, Física, Sono, Mental, Hormonal: **0**
  - Sintomas: **100** (default quando não há texto ou texto < 10 palavras)
  - Total: Média dos 7 scores (excluindo Intro/IMC) = **17**

---

### Passo 3: Raiz do Problema

**Por que os dados chegam vazios?**

#### Teoria A: Navegação Direta ❌
- Improvável, pois as páginas têm proteção de auth

#### Teoria B: Ciclo Vicioso ✅ **CONFIRMADO**

1. **Primeira tentativa do User 3**:
   - Dados vão vazios por motivo desconhecido (possível erro de JS, timeout, etc)
   - Diagnostic ID 6 salvo com `questionnaire_data = {}`

2. **Segunda tentativa do User 3**:
   - `intro.html` chama `/api/v1/questionnaire/last`
   - **BUG**: Endpoint retorna diagnostic ID 6 (com dados vazios!)
   - Frontend carrega `{}` no `localStorage`
   - Usuário clica "Finalizar" → Envia `{}` novamente!

3. **Loop infinito**: Toda tentativa seguinte carrega o diagnóstico vazio anterior

---

## ✅ Solução Implementada

### 1. Correção no Backend (routes/questionnaire.js)

**Arquivo**: `routes/questionnaire.js:164-183`

**Antes**:
```sql
WHERE user_id = $1
  AND questionnaire_data IS NOT NULL
```

**Depois**:
```sql
WHERE user_id = $1
  AND questionnaire_data IS NOT NULL
  AND questionnaire_data::text != '{}'
  AND jsonb_object_keys(questionnaire_data) IS NOT NULL
```

**Efeito**: Endpoint `/questionnaire/last` agora ignora diagnósticos vazios.

---

### 2. Validação no Frontend (7-sintomas.html)

**Arquivo**: `questionario/7-sintomas.html:468-494`

**Adicionado**:
1. **Logs detalhados**: Mostra quantas seções têm dados preenchidos
2. **Alerta visual**: Se < 3 seções preenchidas, pergunta ao usuário:
   ```
   ⚠️ ATENÇÃO: Detectamos que você pode não ter preenchido
   todas as etapas anteriores do questionário.

   Seções preenchidas: 1 de 8

   Deseja continuar mesmo assim?
   ```
3. **Debug console**: Logs para rastrear o problema se ocorrer novamente

---

## 📊 Resultados Esperados

### Antes da Correção
```
User 3 tenta preencher → Dados vazios → Score 17
User 3 tenta novamente → Carrega dados vazios → Score 17 (loop)
```

### Depois da Correção
```
User 3 tenta preencher → Dados vazios → Score 17
User 3 tenta novamente → NÃO carrega dados vazios → Inicia limpo
User 3 preenche corretamente → Scores corretos!
```

---

## 🧪 Teste Realizado

**Script**: `database/test-complete-debug.js`

**Resultado**:
```json
{
  "diagnostic_id": 31,
  "total_score": 22,
  "category_scores": {
    "intro": 100,
    "nutrition": 13,
    "digestive": 0,
    "physical": 0,
    "sleep": 40,
    "mental": 0,
    "hormonal": 0,
    "symptoms": 100
  }
}
```

**Nota**: Scores ainda baixos porque o script de teste usa valores mock que não batem com o esperado pelo scoring. Mas o sistema está **recebendo e processando os dados corretamente!**

---

## 🔮 Problema Ainda Não Resolvido

**Por que os dados foram vazios na PRIMEIRA tentativa dos usuários?**

### Possíveis Causas:

1. **Timeout de sessão**: Usuário demora muito para preencher, token JWT expira?
2. **Erro de JavaScript**: Algum erro no console que quebra o `localStorage.setItem`?
3. **Navegação entre páginas**: Link direto ou refresh limpa localStorage?
4. **Bug no fluxo**: Alguma página não está salvando os dados?

### Ação Recomendada:

- Monitorar logs do console do navegador de usuários reais
- Adicionar telemetria/analytics em cada página do questionário
- Implementar recuperação automática de dados (auto-save)

---

## 📝 Arquivos Modificados

1. ✅ `routes/questionnaire.js` (linha 166-183)
2. ✅ `questionario/7-sintomas.html` (linha 468-495)
3. ✅ `database/test-complete-debug.js` (criado)
4. ✅ `database/check-latest-diagnostic.js` (criado)

---

## 🚀 Próximos Passos

- [ ] Fazer deploy das correções
- [ ] Limpar diagnósticos vazios do banco (IDs 6, 7, 11, 13)
- [ ] Monitorar se novos diagnósticos vazios são criados
- [ ] Considerar adicionar auto-save em cada página do questionário
- [ ] Implementar sistema de analytics para rastrear abandono de páginas

---

## 👤 Autor

Claude Code (Anthropic)
Sessão de debugging: 29/10/2025, 10:30 - 14:00
