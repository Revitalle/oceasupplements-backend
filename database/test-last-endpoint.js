// =============================================
// TESTAR ENDPOINT /api/v1/questionnaire/last
// =============================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testQuery() {
  try {
    console.log('🧪 Testando query do endpoint /last...\n');

    // Simular usuário com ID 3 (do erro do log)
    const userId = 3;
    console.log(`User ID: ${userId}\n`);

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
    `, [userId]);

    console.log(`📊 Resultados: ${result.rows.length} linha(s)\n`);

    if (result.rows.length > 0) {
      console.log('✅ Diagnóstico encontrado:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('ℹ️  Nenhum diagnóstico encontrado para este usuário');
    }

  } catch (error) {
    console.error('❌ Erro na query:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testQuery();
