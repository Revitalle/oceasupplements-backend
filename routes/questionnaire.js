// =============================================
// ROUTES: QUESTIONÁRIO (Versão Simplificada MVP)
// =============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Pool } = require('pg');
const { computeAllScores } = require('../utils/scoring');

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

  console.log('POST /answer recebido:', { session_id, question_id, response_value });

  // Validação mais específica
  if (!session_id || !question_id || response_value === undefined || response_value === null) {
    console.log('Erro de validação:', { session_id, question_id, response_value });
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_FIELDS',
        message: 'session_id, question_id e response_value são obrigatórios',
        received: { session_id, question_id, response_value }
      }
    });
  }

  // TODO: Salvar no banco
  // Por enquanto apenas retorna sucesso
  console.log('Resposta aceita:', { session_id, question_id, response_value });

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
// GET /api/v1/questionnaire/last
// Obter último questionário preenchido pelo usuário
// =============================================

router.get('/last', protect, async (req, res) => {
  try {
    // Buscar o último diagnóstico do usuário que tenha dados de questionário
    // IMPORTANTE: Ignorar diagnósticos com questionnaire_data vazio ou sem dados válidos
    const result = await pool.query(`
      SELECT
        id,
        user_id,
        questionnaire_data,
        total_score,
        severity_level,
        created_at
      FROM diagnostics
      WHERE user_id = $1
        AND questionnaire_data IS NOT NULL
        AND questionnaire_data::text != '{}'
      ORDER BY created_at DESC
      LIMIT 1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null // Nenhum questionário anterior encontrado
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar último questionário:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: {
        code: 'QUESTIONNAIRE_FETCH_ERROR',
        message: 'Erro ao buscar questionário anterior',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

// =============================================
// POST /api/v1/questionnaire/complete
// Completar questionário e salvar dados
// =============================================

router.post('/complete', protect, async (req, res) => {
  const { session_id, questionnaire_data } = req.body;

  console.log('POST /complete recebido:', { session_id, user_id: req.user.id, has_data: !!questionnaire_data });

  if (!session_id) {
    console.log('Erro: session_id ausente');
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_SESSION_ID',
        message: 'session_id é obrigatório'
      }
    });
  }

  try {
    console.log('==========================================');
    console.log('🚀 PROCESSANDO DIAGNÓSTICO - v2');
    console.log('questionnaire_data recebido:',  questionnaire_data ? JSON.stringify(questionnaire_data).substring(0, 200) + '...' : 'NULL/UNDEFINED');
    console.log('Tipo:', typeof questionnaire_data);
    console.log('==========================================');

    // Achatar o objeto aninhado (flatten)
    // De: { intro: { pesoKg: 70 }, nutricao: { q1_1: '3-4' } }
    // Para: { pesoKg: 70, q1_1: '3-4' }
    let flattenedData = {};
    if (questionnaire_data && typeof questionnaire_data === 'object') {
      for (const [section, answers] of Object.entries(questionnaire_data)) {
        console.log(`Seção ${section}:`, answers);
        if (answers && typeof answers === 'object') {
          flattenedData = { ...flattenedData, ...answers };
        }
      }
    }

    console.log('Dados achatados:', Object.keys(flattenedData).length, 'campos');
    console.log('Primeiros campos:', Object.keys(flattenedData).slice(0, 10));

    // Calcular scores reais usando a lógica implementada
    const scores = computeAllScores(flattenedData);
    console.log('Scores calculados:', scores);

    // Recomendações baseadas no nível
    const recommendations = {
      low: [
        'Consulte um profissional de saúde',
        'Implemente suplementação completa e direcionada',
        'Revise seus hábitos alimentares com urgência',
        'Priorize o descanso e recuperação adequados'
      ],
      moderate: [
        'Aumente a ingestão de vegetais e frutas',
        'Considere suplementação de vitaminas e minerais',
        'Melhore a qualidade do sono com rotina regular',
        'Pratique técnicas de gerenciamento de estresse'
      ],
      high: [
        'Mantenha uma alimentação equilibrada e rica em nutrientes',
        'Continue praticando exercícios físicos regulares',
        'Durma de 7 a 9 horas por noite',
        'Considere suplementação básica para otimizar resultados'
      ]
    };

    // =============================================
    // ESTRATÉGIA:
    // 1. Salvar scores no histórico (máximo 4 últimos)
    // 2. Fazer UPSERT da anamnese atual (substituir se existe)
    // =============================================

    console.log('Salvando scores e anamnese:', {
      user_id: req.user.id,
      total_score: scores.total_score,
      severity_level: scores.severity_level
    });

    // 1. Inserir no histórico (trigger automático limita a 4)
    await pool.query(`
      INSERT INTO diagnostic_history (
        user_id,
        intro_score,
        nutrition_score,
        digestive_score,
        physical_score,
        sleep_score,
        mental_score,
        hormonal_score,
        symptoms_score,
        total_score,
        severity_level,
        completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    `, [
      req.user.id,
      scores.intro_score,
      scores.nutrition_score,
      scores.digestive_score,
      scores.physical_score,
      scores.sleep_score,
      scores.mental_score,
      scores.hormonal_score,
      scores.symptoms_score,
      scores.total_score,
      scores.severity_level
    ]);

    console.log('✅ Score salvo no histórico');

    // 2. UPSERT na tabela diagnostics (substituir anamnese anterior)
    const result = await pool.query(`
      INSERT INTO diagnostics (
        user_id,
        total_score,
        severity_level,
        intro_score,
        nutrition_score,
        digestive_score,
        physical_score,
        sleep_score,
        mental_score,
        hormonal_score,
        symptoms_score,
        recommendations,
        questionnaire_data,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        total_score = EXCLUDED.total_score,
        severity_level = EXCLUDED.severity_level,
        intro_score = EXCLUDED.intro_score,
        nutrition_score = EXCLUDED.nutrition_score,
        digestive_score = EXCLUDED.digestive_score,
        physical_score = EXCLUDED.physical_score,
        sleep_score = EXCLUDED.sleep_score,
        mental_score = EXCLUDED.mental_score,
        hormonal_score = EXCLUDED.hormonal_score,
        symptoms_score = EXCLUDED.symptoms_score,
        recommendations = EXCLUDED.recommendations,
        questionnaire_data = EXCLUDED.questionnaire_data,
        updated_at = NOW()
      RETURNING id, user_id, total_score, severity_level,
                intro_score, nutrition_score, digestive_score, physical_score,
                sleep_score, mental_score, hormonal_score, symptoms_score,
                recommendations, created_at, updated_at
    `, [
      req.user.id,
      scores.total_score,
      scores.severity_level,
      scores.intro_score,
      scores.nutrition_score,
      scores.digestive_score,
      scores.physical_score,
      scores.sleep_score,
      scores.mental_score,
      scores.hormonal_score,
      scores.symptoms_score,
      recommendations[scores.severity_level],
      JSON.stringify(questionnaire_data || {})
    ]);

    console.log('✅ Anamnese atualizada');

    const diagnostic = result.rows[0];
    console.log('Diagnóstico criado com ID:', diagnostic.id);

    // 3. Gerar imagem do mapa de saúde (em background, não bloqueia resposta)
    const chartImageGenerator = require('../utils/chartImageGenerator');

    // Preparar objeto completo do diagnóstico para geração de imagem
    const diagnosticForImage = {
      ...diagnostic,
      questionnaire_data: questionnaire_data || {}
    };

    // Executar geração de imagem em background (não aguarda)
    chartImageGenerator.generateChartImage(diagnosticForImage, req.user.id)
      .then(imagePath => {
        console.log(`✅ Imagem do mapa de saúde gerada: ${imagePath}`);
      })
      .catch(error => {
        console.error('❌ Erro ao gerar imagem do mapa de saúde:', error);
        // Não falha a requisição se a imagem não for gerada
      });

    res.json({
      success: true,
      data: {
        session_id,
        diagnostic_id: diagnostic.id,
        total_score: diagnostic.total_score,
        severity_level: diagnostic.severity_level,
        category_scores: {
          intro: diagnostic.intro_score,
          nutrition: diagnostic.nutrition_score,
          digestive: diagnostic.digestive_score,
          physical: diagnostic.physical_score,
          sleep: diagnostic.sleep_score,
          mental: diagnostic.mental_score,
          hormonal: diagnostic.hormonal_score,
          symptoms: diagnostic.symptoms_score
        },
        recommendations: diagnostic.recommendations
      }
    });

  } catch (error) {
    console.error('Erro ao completar questionário:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: {
        code: 'DIAGNOSTIC_CREATION_ERROR',
        message: 'Erro ao gerar diagnóstico',
        details: error.message
      }
    });
  }
});

module.exports = router;
