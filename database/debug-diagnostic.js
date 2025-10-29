const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function debugDiagnostic() {
  try {
    // Buscar último diagnóstico
    const result = await pool.query(`
      SELECT
        id, user_id,
        intro_score, nutrition_score, digestive_score, physical_score,
        sleep_score, mental_score, hormonal_score, symptoms_score,
        total_score, severity_level,
        questionnaire_data,
        created_at
      FROM diagnostics
      ORDER BY id DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('❌ Nenhum diagnóstico encontrado');
      return;
    }

    const diagnostic = result.rows[0];

    console.log('\n📊 ÚLTIMO DIAGNÓSTICO:');
    console.log('====================');
    console.log(`ID: ${diagnostic.id}`);
    console.log(`User ID: ${diagnostic.user_id}`);
    console.log(`Data: ${diagnostic.created_at}`);
    console.log('');

    console.log('📈 SCORES POR CATEGORIA:');
    console.log(`  Intro:      ${diagnostic.intro_score}`);
    console.log(`  Nutrição:   ${diagnostic.nutrition_score}`);
    console.log(`  Digestiva:  ${diagnostic.digestive_score}`);
    console.log(`  Física:     ${diagnostic.physical_score}`);
    console.log(`  Sono:       ${diagnostic.sleep_score}`);
    console.log(`  Mental:     ${diagnostic.mental_score}`);
    console.log(`  Hormonal:   ${diagnostic.hormonal_score}`);
    console.log(`  Sintomas:   ${diagnostic.symptoms_score}`);
    console.log('');
    console.log(`🎯 TOTAL: ${diagnostic.total_score}`);
    console.log(`⚠️  NÍVEL: ${diagnostic.severity_level}`);
    console.log('');

    // Mostrar algumas respostas do questionário
    if (diagnostic.questionnaire_data) {
      console.log('📋 DADOS DO QUESTIONÁRIO (primeiros 10):');
      const data = diagnostic.questionnaire_data;
      const keys = Object.keys(data).slice(0, 10);
      keys.forEach(key => {
        console.log(`  ${key}: ${JSON.stringify(data[key])}`);
      });
      console.log(`  ... (${Object.keys(data).length} respostas no total)`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

debugDiagnostic();
