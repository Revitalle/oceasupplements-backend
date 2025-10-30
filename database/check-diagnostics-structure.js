// =============================================
// VERIFICAR ESTRUTURA DA TABELA DIAGNOSTICS
// =============================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela diagnostics...\n');

    const result = await pool.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'diagnostics'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Colunas da tabela diagnostics:');
    console.log('─'.repeat(80));

    result.rows.forEach(col => {
      console.log(`${col.column_name.padEnd(25)} | ${col.data_type.padEnd(20)} | Nullable: ${col.is_nullable}`);
    });

    console.log('─'.repeat(80));
    console.log(`\nTotal de colunas: ${result.rows.length}\n`);

    // Verificar campos esperados pela API
    const expectedFields = [
      'questionnaire_data',
      'intro_score',
      'nutrition_score',
      'digestive_score',
      'physical_score',
      'sleep_score',
      'mental_score',
      'hormonal_score',
      'symptoms_score'
    ];

    console.log('✅ Campos esperados pela API:');
    expectedFields.forEach(field => {
      const exists = result.rows.some(col => col.column_name === field);
      console.log(`  ${exists ? '✓' : '✗'} ${field}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkStructure();
