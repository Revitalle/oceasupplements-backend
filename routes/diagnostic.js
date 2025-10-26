// =============================================
// ROUTES: DIAGNÓSTICOS
// =============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// GET /api/v1/diagnostics
// Listar diagnósticos do usuário
router.get('/', protect, async (req, res) => {
  // TODO: Buscar do banco
  // Por enquanto retorna array vazio

  res.json({
    success: true,
    data: []
  });
});

// GET /api/v1/diagnostics/:id
// Obter diagnóstico específico
router.get('/:id', protect, async (req, res) => {
  const { id } = req.params;

  // TODO: Buscar do banco
  // Por enquanto retorna exemplo

  res.json({
    success: true,
    data: {
      id: parseInt(id),
      created_at: new Date().toISOString(),
      diagnostic_text: "Diagnóstico de exemplo...",
      recommended_product: {
        id: 2,
        name: "Plano Avançado",
        price: 797.00
      }
    }
  });
});

module.exports = router;
