// =============================================
// ROUTES: DIAGNÓSTICOS
// =============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// GET /api/v1/diagnostics
// Obter anamnese atual do usuário
router.get('/', protect, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
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
        questionnaire_data,
        recommendations,
        created_at,
        updated_at
      FROM diagnostics
      WHERE user_id = $1
    `, [req.user.id]);

    res.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error) {
    console.error('Erro ao buscar diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DIAGNOSTIC_FETCH_ERROR',
        message: 'Erro ao buscar diagnóstico'
      }
    });
  }
});

// GET /api/v1/diagnostics/history
// Obter histórico das últimas 4 pontuações
router.get('/history', protect, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
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
      FROM diagnostic_history
      WHERE user_id = $1
      ORDER BY completed_at DESC
      LIMIT 4
    `, [req.user.id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HISTORY_FETCH_ERROR',
        message: 'Erro ao buscar histórico de diagnósticos'
      }
    });
  }
});

// GET /api/v1/diagnostics/:id
// Obter diagnóstico específico
router.get('/:id', protect, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT
        id,
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
        questionnaire_data,
        recommendations,
        created_at
      FROM diagnostics
      WHERE id = $1 AND user_id = $2
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DIAGNOSTIC_NOT_FOUND',
          message: 'Diagnóstico não encontrado'
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao buscar diagnóstico:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DIAGNOSTIC_FETCH_ERROR',
        message: 'Erro ao buscar diagnóstico'
      }
    });
  }
});

module.exports = router;
