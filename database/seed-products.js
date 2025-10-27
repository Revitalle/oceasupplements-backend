// =============================================
// SCRIPT PARA ADICIONAR PRODUTOS AO BANCO
// Execute: node database/seed-products.js
// =============================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedProducts() {
  const client = await pool.connect();

  try {
    console.log('🔄 Adicionando produtos...\n');

    // Inserir produtos
    const products = [
      {
        name: 'Plano Essencial',
        slug: 'essencial',
        description: 'Fórmula básica personalizada com vitaminas e minerais essenciais',
        price: 497.00,
        checkout_url: 'https://pay.hotmart.com/seu-link-essencial' // ← SUBSTITUA pelo link real
      },
      {
        name: 'Plano Avançado',
        slug: 'avancado',
        description: 'Doses otimizadas e ativos exclusivos para resultados acelerados',
        price: 797.00,
        checkout_url: 'https://pay.hotmart.com/seu-link-avancado' // ← SUBSTITUA pelo link real
      },
      {
        name: 'Plano Premium',
        slug: 'premium',
        description: 'Protocolo completo com acompanhamento e ajustes mensais',
        price: 1997.00,
        checkout_url: 'https://pay.hotmart.com/seu-link-premium' // ← SUBSTITUA pelo link real
      }
    ];

    for (const product of products) {
      await client.query(`
        INSERT INTO products (name, slug, description, price, checkout_url, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        ON CONFLICT (slug)
        DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          checkout_url = EXCLUDED.checkout_url
      `, [product.name, product.slug, product.description, product.price, product.checkout_url]);

      console.log(`✅ Produto "${product.name}" adicionado/atualizado!`);
    }

    console.log('\n✅ Todos os produtos foram configurados!');
    console.log('\n⚠️  IMPORTANTE: Substitua os links de checkout pelos links reais do Hotmart/Stripe');

  } catch (error) {
    console.error('❌ Erro ao adicionar produtos:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedProducts();
