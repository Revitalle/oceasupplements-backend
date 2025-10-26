# 📡 API Documentation - MVP Fase 1

## Base URL
```
http://localhost:3000/api/v1
```

---

## 🔐 Autenticação

Todas as rotas protegidas requerem token JWT no header:
```
Authorization: Bearer {token}
```

---

## 📍 Endpoints

### **1. AUTENTICAÇÃO**

#### `POST /auth/register`
Criar nova conta de usuário

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "phone": "11999999999"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### `POST /auth/login`
Login de usuário

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### `GET /auth/me` 🔒
Obter dados do usuário logado

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "11999999999",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

---

### **2. QUESTIONÁRIO**

#### `GET /questionnaire/categories`
Listar todas as categorias do questionário

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sono e Energia",
      "description": "Avalie a qualidade do seu sono e níveis de energia",
      "icon": "💤",
      "order_position": 1
    },
    {
      "id": 2,
      "name": "Digestão",
      "description": "Entenda o funcionamento do seu sistema digestivo",
      "icon": "🍽️",
      "order_position": 2
    }
  ]
}
```

---

#### `GET /questionnaire/questions`
Obter todas as perguntas (agrupadas por categoria)

**Query Params:**
- `category_id` (opcional): Filtrar por categoria

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_questions": 15,
    "categories": [
      {
        "id": 1,
        "name": "Sono e Energia",
        "questions": [
          {
            "id": 1,
            "question_text": "Como você avalia a qualidade do seu sono?",
            "question_type": "scale",
            "is_required": true,
            "help_text": "Considere os últimos 7 dias",
            "options": [
              {
                "id": 1,
                "option_text": "Muito ruim",
                "option_value": "1",
                "score": 1
              },
              {
                "id": 2,
                "option_text": "Ruim",
                "option_value": "2",
                "score": 2
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

#### `POST /questionnaire/start` 🔒
Iniciar nova sessão de questionário

**Headers:**
```
Authorization: Bearer {token}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "session_id": 123,
    "started_at": "2024-01-15T14:30:00Z",
    "status": "in_progress",
    "progress_percentage": 0
  }
}
```

---

#### `POST /questionnaire/answer` 🔒
Salvar resposta de uma pergunta

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "session_id": 123,
  "question_id": 1,
  "response_value": "3"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "response_id": 456,
    "progress_percentage": 6.67,
    "next_question_id": 2
  }
}
```

---

#### `POST /questionnaire/complete` 🔒
Finalizar questionário e gerar diagnóstico

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "session_id": 123
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session_id": 123,
    "diagnostic_id": 789,
    "diagnostic_text": "Com base nas suas respostas, identificamos que você apresenta sinais de...",
    "recommended_product": {
      "id": 2,
      "name": "Plano Avançado",
      "description": "Doses otimizadas...",
      "price": 797.00,
      "checkout_url": "https://checkout.exemplo.com/avancado"
    }
  }
}
```

---

### **3. DIAGNÓSTICOS**

#### `GET /diagnostics` 🔒
Listar todos os diagnósticos do usuário

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "created_at": "2024-01-15T15:00:00Z",
      "diagnostic_text": "Com base nas suas respostas...",
      "recommended_product": {
        "id": 2,
        "name": "Plano Avançado",
        "price": 797.00
      },
      "total_score": 45
    }
  ]
}
```

---

#### `GET /diagnostics/:id` 🔒
Obter detalhes de um diagnóstico específico

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 789,
    "created_at": "2024-01-15T15:00:00Z",
    "diagnostic_text": "Com base nas suas respostas, identificamos que você apresenta sinais moderados de fadiga e baixa energia. Seu padrão de sono está comprometido...",
    "recommended_product": {
      "id": 2,
      "name": "Plano Avançado",
      "slug": "plano-avancado",
      "description": "Doses otimizadas e ativos exclusivos",
      "price": 797.00,
      "monthly_price": 797.00,
      "checkout_url": "https://checkout.exemplo.com/avancado",
      "features": [
        "Tudo do Essencial +",
        "Upgrade de doses",
        "Absorção superior"
      ]
    },
    "session": {
      "id": 123,
      "started_at": "2024-01-15T14:30:00Z",
      "completed_at": "2024-01-15T15:00:00Z"
    },
    "responses": [
      {
        "question": "Como você avalia a qualidade do seu sono?",
        "answer": "Ruim",
        "score": 2
      }
    ]
  }
}
```

---

### **4. PRODUTOS**

#### `GET /products`
Listar todos os produtos

**Query Params:**
- `category` (opcional): essencial, avancado, premium

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Plano Essencial",
      "slug": "plano-essencial",
      "short_description": "Seu ponto de partida impecável e acessível",
      "price": 497.00,
      "monthly_price": 497.00,
      "category": "essencial",
      "image_url": "https://via.placeholder.com/400x400",
      "features": [
        "Proteína isolada e colágeno",
        "Vitaminas em formas bioativas"
      ]
    }
  ]
}
```

---

#### `GET /products/:slug`
Obter detalhes de um produto

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Plano Essencial",
    "slug": "plano-essencial",
    "description": "O básico que não pode faltar. Cerca de 40 ativos...",
    "short_description": "Seu ponto de partida impecável e acessível",
    "price": 497.00,
    "monthly_price": 497.00,
    "category": "essencial",
    "checkout_url": "https://checkout.exemplo.com/essencial",
    "features": [
      "Proteína isolada e colágeno",
      "Vitaminas em formas bioativas",
      "Minerais quelados"
    ]
  }
}
```

---

### **5. CONVERSÕES (Tracking)**

#### `POST /conversions/click` 🔒
Registrar clique no botão de checkout

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "product_id": 2,
  "diagnostic_id": 789
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "conversion_id": 999,
    "redirect_url": "https://checkout.exemplo.com/avancado"
  }
}
```

---

## 🔧 Códigos de Status HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Sucesso |
| 201 | Created - Recurso criado |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido/ausente |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro no servidor |

---

## 📝 Formato de Erro

Todos os erros seguem este formato:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email já cadastrado",
    "details": {
      "field": "email"
    }
  }
}
```

---

## 🔒 Segurança

- Todas as senhas são hasheadas com bcrypt (10 rounds)
- Tokens JWT expiram em 7 dias
- Rate limiting: 100 requisições por minuto por IP
- CORS configurado para domínios permitidos
- Headers de segurança (Helmet.js)

---

## 📊 Paginação (futuro)

Para endpoints que retornam listas, será implementada paginação:

```
GET /api/v1/diagnostics?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 50,
    "items_per_page": 10
  }
}
```

---

## 🧪 Ambiente de Testes

```
Base URL: http://localhost:3000/api/v1
Usuário de teste: teste@example.com
Senha de teste: senha123
```

---

**Versão:** 1.0
**Última atualização:** Janeiro 2025
