/**
 * Middleware de monitoramento de diagnósticos vazios
 * Detecta quando diagnósticos vazios são criados e loga alertas
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Verifica se um diagnóstico tem dados vazios
 */
function isEmptyDiagnostic(questionnaireData) {
  if (!questionnaireData) return true;
  if (typeof questionnaireData === 'string') {
    return questionnaireData === '{}' || questionnaireData === 'null';
  }
  if (typeof questionnaireData === 'object') {
    return Object.keys(questionnaireData).length === 0;
  }
  return false;
}

/**
 * Middleware que monitora requisições POST para /questionnaire/complete
 * Loga alertas se dados vazios forem detectados
 */
function monitorDiagnosticCreation(req, res, next) {
  // Só monitora o endpoint de complete
  if (req.path !== '/complete' || req.method !== 'POST') {
    return next();
  }

  // Hook no res.json para interceptar a resposta
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    // Se diagnóstico foi criado com sucesso, verificar os dados
    if (data && data.diagnostic_id) {
      const questionnaireData = req.body.questionnaire_data;

      if (isEmptyDiagnostic(questionnaireData)) {
        console.error('\n🚨 ALERTA: DIAGNÓSTICO VAZIO CRIADO!');
        console.error('='.repeat(60));
        console.error('Diagnostic ID:', data.diagnostic_id);
        console.error('User ID:', req.user ? req.user.id : 'unknown');
        console.error('IP:', req.ip || req.connection.remoteAddress);
        console.error('User-Agent:', req.get('user-agent'));
        console.error('Timestamp:', new Date().toISOString());
        console.error('Body:', JSON.stringify(req.body));
        console.error('='.repeat(60));
        console.error('');

        // Opcional: enviar alerta para sistema de logging externo
        // (Sentry, CloudWatch, etc.)
        if (process.env.NODE_ENV === 'production') {
          // TODO: Integrar com sistema de alertas
          // Exemplo: Sentry.captureMessage('Empty diagnostic created', {...});
        }
      }
    }

    return originalJson(data);
  };

  next();
}

/**
 * Função auxiliar para verificar diagnósticos vazios no banco
 */
async function getEmptyDiagnosticsCount() {
  try {
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM diagnostics
      WHERE questionnaire_data IS NULL
         OR questionnaire_data::text = '{}'
         OR questionnaire_data::text = 'null'
    `);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error('Erro ao contar diagnósticos vazios:', error);
    return null;
  }
}

/**
 * Endpoint de health check para monitoramento
 * GET /api/v1/monitoring/empty-diagnostics
 */
async function getEmptyDiagnosticsReport(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_diagnostics,
        COUNT(*) FILTER (
          WHERE questionnaire_data IS NULL
             OR questionnaire_data::text = '{}'
             OR questionnaire_data::text = 'null'
        ) as empty_diagnostics,
        COUNT(*) FILTER (
          WHERE questionnaire_data IS NOT NULL
            AND questionnaire_data::text != '{}'
        ) as valid_diagnostics,
        COUNT(DISTINCT user_id) as unique_users
      FROM diagnostics
    `);

    const stats = result.rows[0];

    const emptyPercentage = stats.total_diagnostics > 0
      ? ((stats.empty_diagnostics / stats.total_diagnostics) * 100).toFixed(2)
      : 0;

    // Lista dos diagnósticos vazios recentes
    const recentEmpty = await pool.query(`
      SELECT
        id,
        user_id,
        total_score,
        created_at
      FROM diagnostics
      WHERE questionnaire_data IS NULL
         OR questionnaire_data::text = '{}'
         OR questionnaire_data::text = 'null'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      status: stats.empty_diagnostics > 0 ? 'warning' : 'ok',
      timestamp: new Date().toISOString(),
      statistics: {
        total_diagnostics: parseInt(stats.total_diagnostics),
        empty_diagnostics: parseInt(stats.empty_diagnostics),
        valid_diagnostics: parseInt(stats.valid_diagnostics),
        unique_users: parseInt(stats.unique_users),
        empty_percentage: parseFloat(emptyPercentage)
      },
      recent_empty_diagnostics: recentEmpty.rows
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}

module.exports = {
  monitorDiagnosticCreation,
  getEmptyDiagnosticsCount,
  getEmptyDiagnosticsReport,
  isEmptyDiagnostic
};
