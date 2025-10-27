// =============================================
// ROUTES: QUESTIONÁRIO (Versão Simplificada MVP)
// =============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// =============================================
// GET /api/v1/questionnaire/categories
// Listar categorias
// =============================================

router.get('/categories', async (req, res) => {
  // Dados mocados para MVP - depois vem do banco
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: "Sono e Energia",
        description: "Avalie a qualidade do seu sono e níveis de energia",
        icon: "💤",
        order_position: 1
      },
      {
        id: 2,
        name: "Digestão",
        description: "Entenda o funcionamento do seu sistema digestivo",
        icon: "🍽️",
        order_position: 2
      },
      {
        id: 3,
        name: "Estresse e Ansiedade",
        description: "Identifique seus níveis de estresse",
        icon: "🧘",
        order_position: 3
      },
      {
        id: 4,
        name: "Imunidade",
        description: "Avalie a força do seu sistema imunológico",
        icon: "🛡️",
        order_position: 4
      },
      {
        id: 5,
        name: "Pele, Cabelo e Unhas",
        description: "Analise a saúde da sua pele e cabelos",
        icon: "✨",
        order_position: 5
      }
    ]
  });
});

// =============================================
// GET /api/v1/questionnaire/questions
// Obter todas as perguntas
// =============================================

router.get('/questions', async (req, res) => {
  try {
    // Buscar perguntas do banco de dados
    const result = await pool.query(`
      SELECT
        q.id,
        q.question_text,
        q.answer_type,
        q.order_number,
        c.name as category_name
      FROM questions q
      LEFT JOIN health_categories c ON q.category_id = c.id
      WHERE q.is_active = true
      ORDER BY q.order_number
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Erro ao buscar perguntas'
      }
    });
  }
});

// =============================================
// POST /api/v1/questionnaire/start
// Iniciar sessão de questionário
// =============================================

router.post('/start', protect, async (req, res) => {
  // Simular criação de sessão
  const sessionId = Math.floor(Math.random() * 1000000);

  res.status(201).json({
    success: true,
    data: {
      session_id: sessionId,
      started_at: new Date().toISOString(),
      status: "in_progress",
      progress_percentage: 0
    }
  });
});

// =============================================
// POST /api/v1/questionnaire/answer
// Salvar resposta
// =============================================

router.post('/answer', protect, async (req, res) => {
  const { session_id, question_id, response_value } = req.body;

  if (!session_id || !question_id || !response_value) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'session_id, question_id e response_value são obrigatórios'
      }
    });
  }

  // TODO: Salvar no banco
  // Por enquanto apenas retorna sucesso

  res.json({
    success: true,
    data: {
      response_id: Math.floor(Math.random() * 1000000),
      progress_percentage: 30, // Calcular baseado em respostas
      next_question_id: question_id + 1
    }
  });
});

// =============================================
// POST /api/v1/questionnaire/complete
// Completar questionário
// =============================================

router.post('/complete', protect, async (req, res) => {
  const { session_id } = req.body;

  if (!session_id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_SESSION_ID',
        message: 'session_id é obrigatório'
      }
    });
  }

  // TODO: Buscar respostas, calcular score, aplicar regras
  // Por enquanto retorna diagnóstico mocado

  res.json({
    success: true,
    data: {
      session_id,
      diagnostic_id: Math.floor(Math.random() * 1000000),
      diagnostic_text: "Com base nas suas respostas, identificamos que você apresenta um padrão de sono irregular e possíveis sinais de fadiga. Recomendamos o Plano Avançado com dosagens otimizadas de magnésio, melatonina e vitaminas do complexo B para melhorar a qualidade do seu sono e níveis de energia.",
      recommended_product: {
        id: 2,
        name: "Plano Avançado",
        slug: "plano-avancado",
        description: "Doses otimizadas e ativos exclusivos",
        price: 797.00,
        checkout_url: `${process.env.CHECKOUT_BASE_URL || 'https://checkout.exemplo.com'}/avancado`
      }
    }
  });
});

module.exports = router;
