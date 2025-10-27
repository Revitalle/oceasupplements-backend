// =============================================
// ROUTES: DIAGNÓSTICOS
// =============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const pool = require('../config/database');

// GET /api/v1/diagnostics
// Listar diagnósticos do usuário
router.get('/', protect, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        user_id,
        session_id,
        total_score,
        severity_level,
        categories,
        recommendations,
        created_at
      FROM diagnostics
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar diagnósticos:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DIAGNOSTIC_FETCH_ERROR',
        message: 'Erro ao buscar diagnósticos'
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
        session_id,
        total_score,
        severity_level,
        categories,
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
