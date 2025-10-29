/**
 * Script para limpar diagnósticos vazios do banco de dados
 * Remove diagnósticos onde questionnaire_data está vazio ou é apenas {}
 *
 * CUIDADO: Este script faz DELETE permanente no banco de dados!
 *
 * Uso: node database/cleanup-empty-diagnostics.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function cleanupEmptyDiagnostics() {
  console.log('🧹 Iniciando limpeza de diagnósticos vazios...\n');

  try {
    // 1. Listar diagnósticos vazios
    console.log('📋 Identificando diagnósticos vazios...');
    const emptyDiagnostics = await pool.query(`
      SELECT
        id,
        user_id,
        total_score,
        severity_level,
        questionnaire_data,
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
      console.log(`  ID: ${row.id}`);
      console.log(`  User ID: ${row.user_id}`);
      console.log(`  Total Score: ${row.total_score}`);
      console.log(`  Severity: ${row.severity_level}`);
      console.log(`  Data Size: ${row.data_size} bytes`);
      console.log(`  Created: ${row.created_at}`);
      console.log(`  ---`);
    });

    // 2. Confirmar se deve deletar
    console.log('\n⚠️  ATENÇÃO: Você está prestes a DELETAR estes diagnósticos permanentemente!');
    console.log('   Esta operação NÃO pode ser desfeita.\n');

    // Para uso em script automatizado, você pode pular a confirmação
    // descomentando a linha abaixo:
    // const shouldDelete = true;

    // Para confirmação interativa (manual), use readline:
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('   Confirmar deleção? (digite "SIM" para confirmar): ', resolve);
    });
    rl.close();

    if (answer.trim().toUpperCase() !== 'SIM') {
      console.log('\n❌ Operação cancelada pelo usuário.\n');
      return;
    }

    // 3. Deletar diagnósticos vazios
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

    // 4. Verificar histórico de diagnósticos também
    console.log('\n📊 Verificando diagnostic_history...');

    const emptyHistory = await pool.query(`
      SELECT COUNT(*) as count
      FROM diagnostic_history
      WHERE questionnaire_data IS NULL
         OR questionnaire_data::text = '{}'
         OR questionnaire_data::text = 'null'
    `);

    const emptyHistoryCount = parseInt(emptyHistory.rows[0].count);

    if (emptyHistoryCount > 0) {
      console.log(`\n⚠️  Encontrados ${emptyHistoryCount} registros vazios no histórico.`);
      console.log('   Nota: diagnostic_history mantém snapshots, considere se deve limpar.\n');

      // Opcional: limpar histórico também
      // Descomente para habilitar:
      /*
      const deleteHistory = await pool.query(`
        DELETE FROM diagnostic_history
        WHERE questionnaire_data IS NULL
           OR questionnaire_data::text = '{}'
           OR questionnaire_data::text = 'null'
      `);
      console.log(`✅ ${deleteHistory.rowCount} registros do histórico deletados.\n`);
      */
    } else {
      console.log('✅ Histórico limpo!\n');
    }

    // 5. Estatísticas finais
    console.log('📈 Estatísticas atualizadas:');

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
