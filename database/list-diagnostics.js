const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function listDiagnostics() {
  try {
    const result = await pool.query(`
      SELECT
        id, user_id,
        intro_score, nutrition_score, total_score,
        created_at, updated_at
      FROM diagnostics
      ORDER BY id DESC
      LIMIT 20
    `);

    console.log('\n📊 ÚLTIMOS 20 DIAGNÓSTICOS:');
    console.log('========================================');
    result.rows.forEach(d => {
      console.log(`ID: ${d.id} | User: ${d.user_id} | Total: ${d.total_score} | Criado: ${new Date(d.created_at).toLocaleString('pt-BR')} | Atualizado: ${new Date(d.updated_at).toLocaleString('pt-BR')}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

listDiagnostics();
