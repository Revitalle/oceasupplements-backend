// Script para executar migração no Railway PostgreSQL
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// String de conexão do Railway
const connectionString = 'postgresql://postgres:KOOEfmyHzKhvJAvsVdSoUqUZMWJviLDn@hopper.proxy.rlwy.net:46280/railway';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Conectando ao banco de dados...');

    // Ler arquivo SQL
    const sqlFile = path.join(__dirname, 'migrations', '005_add_questionnaire_data_to_diagnostics.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Executando migração...');
    console.log(sql);

    // Executar SQL
    await pool.query(sql);

    console.log('✅ Migração executada com sucesso!');

    // Verificar se a coluna foi criada
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'diagnostics'
      AND column_name = 'questionnaire_data'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Coluna questionnaire_data criada:', result.rows[0]);
    } else {
      console.log('⚠️ Coluna não encontrada');
    }

  } catch (error) {
    console.error('❌ Erro ao executar migração:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
