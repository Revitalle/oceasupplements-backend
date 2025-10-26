// =============================================
// ROUTES: QUESTIONÁRIO (Versão Simplificada MVP)
// =============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

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
  // Questionário simplificado para MVP
  res.json({
    success: true,
    data: {
      total_questions: 10,
      categories: [
        {
          id: 1,
          name: "Sono e Energia",
          questions: [
            {
              id: 1,
              question_text: "Como você avalia a qualidade do seu sono?",
              question_type: "multiple_choice",
              is_required: true,
              options: [
                { id: 1, option_text: "Excelente", option_value: "5", score: 5 },
                { id: 2, option_text: "Bom", option_value: "4", score: 4 },
                { id: 3, option_text: "Regular", option_value: "3", score: 3 },
                { id: 4, option_text: "Ruim", option_value: "2", score: 2 },
                { id: 5, option_text: "Muito ruim", option_value: "1", score: 1 }
              ]
            },
            {
              id: 2,
              question_text: "Quantas horas você dorme por noite em média?",
              question_type: "multiple_choice",
              is_required: true,
              options: [
                { id: 6, option_text: "Mais de 8 horas", option_value: "8+", score: 5 },
                { id: 7, option_text: "7-8 horas", option_value: "7-8", score: 5 },
                { id: 8, option_text: "6-7 horas", option_value: "6-7", score: 3 },
                { id: 9, option_text: "5-6 horas", option_value: "5-6", score: 2 },
                { id: 10, option_text: "Menos de 5 horas", option_value: "<5", score: 1 }
              ]
            }
          ]
        },
        {
          id: 2,
          name: "Digestão",
          questions: [
            {
              id: 3,
              question_text: "Com que frequência você tem problemas digestivos?",
              question_type: "multiple_choice",
              is_required: true,
              options: [
                { id: 11, option_text: "Nunca", option_value: "nunca", score: 5 },
                { id: 12, option_text: "Raramente", option_value: "raramente", score: 4 },
                { id: 13, option_text: "Às vezes", option_value: "as_vezes", score: 3 },
                { id: 14, option_text: "Frequentemente", option_value: "frequentemente", score: 2 },
                { id: 15, option_text: "Sempre", option_value: "sempre", score: 1 }
              ]
            }
          ]
        }
      ]
    }
  });
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
