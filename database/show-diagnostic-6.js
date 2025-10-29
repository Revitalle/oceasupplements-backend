const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function showDiagnostic() {
  try {
    const result = await pool.query(`
      SELECT * FROM diagnostics WHERE id = 6
    `);

    if (result.rows.length === 0) {
      console.log('❌ Diagnóstico ID 6 não encontrado');
      return;
    }

    const d = result.rows[0];
    console.log('\n📊 DIAGNÓSTICO ID 6 (User 3):');
    console.log('================================');
    console.log('Criado:', new Date(d.created_at).toLocaleString('pt-BR'));
    console.log('Atualizado:', new Date(d.updated_at).toLocaleString('pt-BR'));
    console.log('');
    console.log('📈 SCORES:');
    console.log('  Intro:', d.intro_score);
    console.log('  Nutrição:', d.nutrition_score);
    console.log('  Digestiva:', d.digestive_score);
    console.log('  Física:', d.physical_score);
    console.log('  Sono:', d.sleep_score);
    console.log('  Mental:', d.mental_score);
    console.log('  Hormonal:', d.hormonal_score);
    console.log('  Sintomas:', d.symptoms_score);
    console.log('  TOTAL:', d.total_score);
    console.log('');
    console.log('📋 QUESTIONNAIRE_DATA:');
    if (d.questionnaire_data && typeof d.questionnaire_data === 'object') {
      console.log('  Seções:', Object.keys(d.questionnaire_data));
      for (const [key, value] of Object.entries(d.questionnaire_data)) {
        if (value && typeof value === 'object') {
          console.log(`  ${key}:`, Object.keys(value).length, 'campos');
        }
      }
    } else {
      console.log('  VAZIO ou inválido');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

showDiagnostic();
