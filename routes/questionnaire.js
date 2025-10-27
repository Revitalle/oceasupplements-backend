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

  try {
    // TODO: Buscar respostas e calcular score real
    // Por enquanto gera um score aleatório para MVP
    const totalScore = Math.floor(Math.random() * 50) + 10; // 10-60

    // Determinar severity_level baseado no score
    let severityLevel = 'low';
    if (totalScore >= 40) {
      severityLevel = 'high';
    } else if (totalScore >= 25) {
      severityLevel = 'moderate';
    }

    // Categorias avaliadas (mockado por enquanto)
    const categories = ['Sono', 'Energia', 'Digestão', 'Estresse', 'Imunidade'];

    // Recomendações baseadas no nível
    const recommendations = {
      low: [
        'Mantenha uma alimentação equilibrada e rica em nutrientes',
        'Continue praticando exercícios físicos regulares',
        'Durma de 7 a 9 horas por noite',
        'Considere suplementação básica para otimizar resultados'
      ],
      moderate: [
        'Aumente a ingestão de vegetais e frutas',
        'Considere suplementação de vitaminas e minerais',
        'Melhore a qualidade do sono com rotina regular',
        'Pratique técnicas de gerenciamento de estresse'
      ],
      high: [
        'Consulte um profissional de saúde',
        'Implemente suplementação completa e direcionada',
        'Revise seus hábitos alimentares com urgência',
        'Priorize o descanso e recuperação adequados'
      ]
    };

    // Inserir diagnóstico no banco
    const result = await pool.query(`
      INSERT INTO diagnostics (
        user_id,
        session_id,
        total_score,
        severity_level,
        recommendations
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, session_id, total_score, severity_level, recommendations, created_at
    `, [
      req.user.id,
      session_id,
      totalScore,
      severityLevel,
      recommendations[severityLevel]
    ]);

    const diagnostic = result.rows[0];

    res.json({
      success: true,
      data: {
        session_id,
        diagnostic_id: diagnostic.id,
        total_score: diagnostic.total_score,
        severity_level: diagnostic.severity_level
      }
    });

  } catch (error) {
    console.error('Erro ao completar questionário:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DIAGNOSTIC_CREATION_ERROR',
        message: 'Erro ao gerar diagnóstico'
      }
    });
  }
});

module.exports = router;
