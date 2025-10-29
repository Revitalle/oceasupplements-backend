// =============================================
// CHECK LATEST DIAGNOSTIC - Ver diagnostic mais recente
// =============================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkLatestDiagnostic() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        user_id,
        total_score,
        intro_score,
        nutrition_score,
        digestive_score,
        physical_score,
        sleep_score,
        mental_score,
        hormonal_score,
        symptoms_score,
        LENGTH(questionnaire_data::text) as data_size,
        created_at,
        updated_at
      FROM diagnostics
      ORDER BY id DESC
      LIMIT 5
    `);

    console.log('\n📊 ÚLTIMOS 5 DIAGNÓSTICOS:\n');
    console.log('='.repeat(80));

    for (const diag of result.rows) {
      console.log(`\nID: ${diag.id} | User: ${diag.user_id} | Total: ${diag.total_score}`);
      console.log(`Data size: ${diag.data_size} bytes`);
      console.log(`Scores: intro=${diag.intro_score}, nut=${diag.nutrition_score}, dig=${diag.digestive_score}, fis=${diag.physical_score}`);
      console.log(`        sono=${diag.sleep_score}, mental=${diag.mental_score}, horm=${diag.hormonal_score}, sint=${diag.symptoms_score}`);
      console.log(`Criado: ${diag.created_at}`);
    }

    // Pegar o mais recente com dados completos
    const latest = await pool.query(`
      SELECT
        id,
        user_id,
        total_score,
        questionnaire_data
      FROM diagnostics
      ORDER BY id DESC
      LIMIT 1
    `);

    if (latest.rows.length > 0) {
      const diag = latest.rows[0];
      console.log('\n\n📋 QUESTIONNAIRE_DATA DO MAIS RECENTE (ID ' + diag.id + '):\n');
      console.log('='.repeat(80));

      if (diag.questionnaire_data && Object.keys(diag.questionnaire_data).length > 0) {
        console.log(JSON.stringify(diag.questionnaire_data, null, 2));
      } else {
        console.log('❌ VAZIO! Não há dados no questionário.');
      }
    }

    console.log('\n' + '='.repeat(80) + '\n');

    await pool.end();
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

checkLatestDiagnostic();
