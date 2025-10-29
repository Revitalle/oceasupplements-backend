/**
 * Script para criar tabela de analytics no banco de dados
 * Armazena eventos de tracking do questionário
 *
 * Uso: node database/create-analytics-table.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAnalyticsTable() {
  console.log('📊 Criando tabela de analytics...\n');

  try {
    // Criar tabela
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(100) NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(50) NOT NULL,
        page VARCHAR(50),
        event_data JSONB,
        user_agent TEXT,
        screen_size VARCHAR(20),
        viewport_size VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabela analytics_events criada');

    // Criar índices para performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
    `);
    console.log('✅ Índice em session_id criado');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
    `);
    console.log('✅ Índice em user_id criado');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
    `);
    console.log('✅ Índice em event_type criado');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_page ON analytics_events(page);
    `);
    console.log('✅ Índice em page criado');

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
    `);
    console.log('✅ Índice em created_at criado');

    // Verificar estrutura
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'analytics_events'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Estrutura da tabela:');
    console.table(tableInfo.rows);

    // Estatísticas
    const stats = await pool.query(`
      SELECT COUNT(*) as total_events
      FROM analytics_events;
    `);

    console.log(`\n📊 Total de eventos: ${stats.rows[0].total_events}`);
    console.log('\n✨ Tabela de analytics configurada com sucesso!\n');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tabela já existe, verificando estrutura...\n');

      const tableInfo = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'analytics_events'
        ORDER BY ordinal_position;
      `);

      console.table(tableInfo.rows);
    } else {
      console.error('❌ Erro ao criar tabela:', error);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

// Executar
if (require.main === module) {
  createAnalyticsTable()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { createAnalyticsTable };
