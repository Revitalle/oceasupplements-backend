// =============================================
// ROUTES: CONVERSÕES (Tracking)
// =============================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// POST /api/v1/conversions/click
// Registrar clique no checkout
router.post('/click', protect, async (req, res) => {
  const { product_id, diagnostic_id } = req.body;

  if (!product_id) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_PRODUCT_ID',
        message: 'product_id é obrigatório'
      }
    });
  }

  // TODO: Salvar no banco para tracking
  console.log('Conversão registrada:', {
    user_id: req.user.id,
    product_id,
    diagnostic_id
  });

  // Buscar URL do produto
  const productUrls = {
    1: `${process.env.CHECKOUT_BASE_URL || 'https://checkout.exemplo.com'}/essencial`,
    2: `${process.env.CHECKOUT_BASE_URL || 'https://checkout.exemplo.com'}/avancado`,
    3: `${process.env.CHECKOUT_BASE_URL || 'https://checkout.exemplo.com'}/premium`
  };

  res.status(201).json({
    success: true,
    data: {
      conversion_id: Math.floor(Math.random() * 1000000),
      redirect_url: productUrls[product_id] || productUrls[2]
    }
  });
});

module.exports = router;
