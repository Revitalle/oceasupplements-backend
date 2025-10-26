// =============================================
// ROUTES: PRODUTOS
// =============================================

const express = require('express');
const router = express.Router();

// Produtos mocados (depois vem do banco)
const PRODUCTS = [
  {
    id: 1,
    name: "Plano Essencial",
    slug: "plano-essencial",
    short_description: "Seu ponto de partida impecável e acessível",
    description: "O básico que não pode faltar. Cerca de 40 ativos e nutrientes personalizados para suas necessidades fundamentais de saúde.",
    price: 497.00,
    monthly_price: 497.00,
    category: "essencial",
    image_url: "https://via.placeholder.com/400x400/f5f5f5/2c2c2c?text=Kit+Essencial",
    checkout_url: `${process.env.CHECKOUT_BASE_URL || 'https://checkout.exemplo.com'}/essencial`,
    features: [
      "Proteína isolada e colágeno",
      "Vitaminas em formas bioativas",
      "Minerais quelados",
      "Ômega-3 microencapsulado",
      "Personalização completa"
    ]
  },
  {
    id: 2,
    name: "Plano Avançado",
    slug: "plano-avancado",
    short_description: "Absorção superior e sinergias direcionadas",
    description: "Doses otimizadas e ativos exclusivos. Cerca de 50 ativos e nutrientes para resultados acelerados.",
    price: 797.00,
    monthly_price: 797.00,
    category: "avancado",
    image_url: "https://via.placeholder.com/400x400/fff9f0/8B7355?text=Kit+Avançado",
    checkout_url: `${process.env.CHECKOUT_BASE_URL || 'https://checkout.exemplo.com'}/avancado`,
    features: [
      "Tudo do Essencial +",
      "Upgrade de doses",
      "Absorção superior",
      "Ativos funcionais específicos",
      "Resultados acelerados"
    ]
  },
  {
    id: 3,
    name: "Plano Premium",
    slug: "plano-premium",
    short_description: "Protocolos de elite com ativos patenteados de ponta",
    description: "O estado da arte da suplementação. Cerca de 60 ativos e nutrientes de última geração.",
    price: 1997.00,
    monthly_price: 1997.00,
    category: "premium",
    image_url: "https://via.placeholder.com/400x400/2c2c2c/ffd700?text=Kit+Premium",
    checkout_url: `${process.env.CHECKOUT_BASE_URL || 'https://checkout.exemplo.com'}/premium`,
    features: [
      "Tudo do Avançado +",
      "Ingredientes de última geração",
      "Formas moleculares otimizadas",
      "Máxima performance",
      "Longevidade e regeneração"
    ]
  }
];

// GET /api/v1/products
router.get('/', (req, res) => {
  const { category } = req.query;

  let products = PRODUCTS;

  if (category) {
    products = products.filter(p => p.category === category);
  }

  res.json({
    success: true,
    data: products
  });
});

// GET /api/v1/products/:slug
router.get('/:slug', (req, res) => {
  const { slug } = req.params;

  const product = PRODUCTS.find(p => p.slug === slug);

  if (!product) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Produto não encontrado'
      }
    });
  }

  res.json({
    success: true,
    data: product
  });
});

module.exports = router;
