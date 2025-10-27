// =============================================
// ROUTES: CONVERSÕES (Tracking)
// =============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// POST /api/v1/conversions/click
// Registrar clique no checkout
router.post('/click', protect, async (req, res) => {
  const { product_slug, source } = req.body;

  if (!product_slug) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PRODUCT_SLUG',
        message: 'product_slug é obrigatório'
      }
    });
  }

  // TODO: Salvar no banco para tracking
  console.log('Conversão registrada:', {
    user_id: req.user.id,
    product_slug,
    source
  });

  res.status(201).json({
    success: true,
    data: {
      conversion_id: Math.floor(Math.random() * 1000000)
    }
  });
});

module.exports = router;
