/**
 * Script para limpar diagnósticos vazios do banco de dados (MODO AUTOMATIZADO)
 * Remove diagnósticos onde questionnaire_data está vazio ou é apenas {}
 *
 * CUIDADO: Este script faz DELETE permanente sem confirmação!
 *
 * Uso: node database/cleanup-empty-diagnostics-auto.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function cleanupEmptyDiagnostics() {
  console.log('🧹 Iniciando limpeza de diagnósticos vazios (modo automático)...\n');

  try {
    // 1. Listar diagnósticos vazios
    console.log('📋 Identificando diagnósticos vazios...');
    const emptyDiagnostics = await pool.query(`
      SELECT
        id,
        user_id,
        total_score,
        severity_level,
        LENGTH(questionnaire_data::text) as data_size,
        created_at
      FROM diagnostics
      WHERE questionnaire_data IS NULL
         OR questionnaire_data::text = '{}'
         OR questionnaire_data::text = 'null'
      ORDER BY id
    `);

    if (emptyDiagnostics.rows.length === 0) {
      console.log('✅ Nenhum diagnóstico vazio encontrado!\n');
      return;
    }

    console.log(`\n⚠️  Encontrados ${emptyDiagnostics.rows.length} diagnósticos vazios:\n`);

    emptyDiagnostics.rows.forEach(row => {
      console.log(`  ID: ${row.id} | User: ${row.user_id} | Score: ${row.total_score} | Data: ${row.data_size} bytes`);
    });

    // 2. Deletar diagnósticos vazios (SEM confirmação)
    console.log('\n🗑️  Deletando diagnósticos vazios...');

    const deleteResult = await pool.query(`
      DELETE FROM diagnostics
      WHERE questionnaire_data IS NULL
         OR questionnaire_data::text = '{}'
         OR questionnaire_data::text = 'null'
      RETURNING id, user_id
    `);

    console.log(`\n✅ ${deleteResult.rows.length} diagnósticos deletados com sucesso!\n`);

    if (deleteResult.rows.length > 0) {
      console.log('IDs deletados:');
      deleteResult.rows.forEach(row => {
        console.log(`  - ID ${row.id} (User ${row.user_id})`);
      });
    }

    // 3. Estatísticas finais
    console.log('\n📈 Estatísticas atualizadas:');

    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_diagnostics,
        COUNT(*) FILTER (WHERE questionnaire_data IS NOT NULL AND questionnaire_data::text != '{}') as valid_diagnostics,
        COUNT(DISTINCT user_id) as unique_users
      FROM diagnostics
    `);

    const s = stats.rows[0];
    console.log(`  Total de diagnósticos: ${s.total_diagnostics}`);
    console.log(`  Diagnósticos válidos: ${s.valid_diagnostics}`);
    console.log(`  Usuários únicos: ${s.unique_users}`);
    console.log('\n✨ Limpeza concluída!\n');

  } catch (error) {
    console.error('❌ Erro ao limpar diagnósticos:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Executar script
if (require.main === module) {
  cleanupEmptyDiagnostics()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { cleanupEmptyDiagnostics };
