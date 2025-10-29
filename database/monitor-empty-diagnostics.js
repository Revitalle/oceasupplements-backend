/**
 * Script de monitoramento contínuo para diagnósticos vazios
 * Verifica periodicamente se novos diagnósticos vazios são criados
 *
 * Uso: node database/monitor-empty-diagnostics.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configuração
const CHECK_INTERVAL_MS = 60000; // 1 minuto
const ALERT_THRESHOLD = 1; // Alertar se houver 1 ou mais diagnósticos vazios

let lastCheckTime = new Date();
let alertCount = 0;

async function checkEmptyDiagnostics() {
  try {
    const now = new Date();

    // Buscar diagnósticos vazios criados desde a última verificação
    const result = await pool.query(`
      SELECT
        id,
        user_id,
        total_score,
        severity_level,
        LENGTH(questionnaire_data::text) as data_size,
        created_at
      FROM diagnostics
      WHERE (questionnaire_data IS NULL
         OR questionnaire_data::text = '{}'
         OR questionnaire_data::text = 'null')
        AND created_at >= $1
      ORDER BY created_at DESC
    `, [lastCheckTime]);

    lastCheckTime = now;

    if (result.rows.length > 0) {
      alertCount++;
      console.log(`\n🚨 ALERTA #${alertCount} - ${now.toLocaleString()}`);
      console.log(`⚠️  ${result.rows.length} novo(s) diagnóstico(s) vazio(s) detectado(s)!\n`);

      result.rows.forEach(row => {
        console.log(`  🔴 ID: ${row.id}`);
        console.log(`     User ID: ${row.user_id}`);
        console.log(`     Total Score: ${row.total_score}`);
        console.log(`     Severity: ${row.severity_level}`);
        console.log(`     Data Size: ${row.data_size || 0} bytes`);
        console.log(`     Created: ${row.created_at}`);
        console.log('');
      });

      console.log('💡 Ação recomendada:');
      console.log('   1. Investigar logs do usuário no navegador');
      console.log('   2. Verificar se houve timeout de sessão');
      console.log('   3. Executar: node database/cleanup-empty-diagnostics-auto.js');
      console.log('');

    } else {
      console.log(`✅ ${now.toLocaleTimeString()} - Nenhum diagnóstico vazio detectado`);
    }

    // Estatísticas gerais
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (
          WHERE questionnaire_data IS NULL
             OR questionnaire_data::text = '{}'
             OR questionnaire_data::text = 'null'
        ) as empty_count,
        COUNT(*) FILTER (
          WHERE questionnaire_data IS NOT NULL
            AND questionnaire_data::text != '{}'
        ) as valid_count
      FROM diagnostics
    `);

    const s = stats.rows[0];

    if (parseInt(s.empty_count) > 0) {
      console.log(`⚠️  Status atual: ${s.empty_count} vazios / ${s.total} total (${((s.empty_count/s.total)*100).toFixed(1)}%)\n`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar diagnósticos:', error.message);
  }
}

async function startMonitoring() {
  console.log('🔍 Iniciando monitoramento de diagnósticos vazios...');
  console.log(`⏰ Intervalo de verificação: ${CHECK_INTERVAL_MS / 1000}s`);
  console.log(`📊 Threshold de alerta: ${ALERT_THRESHOLD} diagnóstico(s)\n`);
  console.log('Pressione Ctrl+C para parar\n');
  console.log('='.repeat(60));

  // Verificação inicial
  await checkEmptyDiagnostics();

  // Verificação periódica
  const intervalId = setInterval(checkEmptyDiagnostics, CHECK_INTERVAL_MS);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Parando monitoramento...');
    clearInterval(intervalId);
    await pool.end();
    console.log('✅ Monitoramento encerrado.\n');
    process.exit(0);
  });
}

// Executar monitoramento
if (require.main === module) {
  startMonitoring().catch((error) => {
    console.error('Erro fatal:', error);
    pool.end();
    process.exit(1);
  });
}

module.exports = { checkEmptyDiagnostics };
