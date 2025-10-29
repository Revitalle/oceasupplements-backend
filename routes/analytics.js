/**
 * ANALYTICS ROUTES
 * Endpoints para receber e processar eventos de analytics do frontend
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { protect } = require('../middleware/auth');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * POST /api/v1/analytics/events
 * Recebe eventos de analytics do frontend
 */
router.post('/events', async (req, res) => {
  try {
    const { events, user_agent, screen_size, viewport_size } = req.body;

    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Events array is required' });
    }

    // Extrair user_id do token se disponível (opcional)
    const user_id = req.user ? req.user.id : null;

    // Inserir eventos no banco
    const insertPromises = events.map(event => {
      return pool.query(`
        INSERT INTO analytics_events (
          session_id,
          user_id,
          event_type,
          page,
          event_data,
          user_agent,
          screen_size,
          viewport_size,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        event.session_id,
        user_id,
        event.event_type,
        event.page,
        JSON.stringify(event.data),
        user_agent,
        screen_size,
        viewport_size,
        event.timestamp || new Date().toISOString()
      ]);
    });

    await Promise.all(insertPromises);

    console.log(`📊 ${events.length} eventos de analytics recebidos (sessão: ${events[0]?.session_id})`);

    res.json({
      success: true,
      events_received: events.length
    });

  } catch (error) {
    console.error('Erro ao salvar eventos de analytics:', error);
    res.status(500).json({ error: 'Failed to save analytics events' });
  }
});

/**
 * GET /api/v1/analytics/funnel
 * Retorna análise de funil de conversão
 */
router.get('/funnel', protect, async (req, res) => {
  try {
    // Contar visualizações por página
    const funnelData = await pool.query(`
      SELECT
        page,
        COUNT(DISTINCT session_id) as sessions,
        COUNT(*) as page_views,
        AVG(CAST(event_data->>'time_on_page' AS INTEGER)) as avg_time_on_page
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY page
      ORDER BY
        CASE page
          WHEN 'intro' THEN 1
          WHEN 'nutricao' THEN 2
          WHEN 'digestiva' THEN 3
          WHEN 'fisica' THEN 4
          WHEN 'sono' THEN 5
          WHEN 'mental' THEN 6
          WHEN 'hormonal' THEN 7
          WHEN 'sintomas' THEN 8
          ELSE 9
        END
    `);

    // Calcular taxa de abandono
    const abandonData = await pool.query(`
      SELECT
        page,
        COUNT(*) as abandon_count
      FROM analytics_events
      WHERE event_type = 'page_abandon'
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY page
    `);

    const abandonMap = {};
    abandonData.rows.forEach(row => {
      abandonMap[row.page] = parseInt(row.abandon_count);
    });

    // Combinar dados
    const funnel = funnelData.rows.map(row => ({
      page: row.page,
      sessions: parseInt(row.sessions),
      page_views: parseInt(row.page_views),
      avg_time_on_page: Math.round(parseFloat(row.avg_time_on_page) || 0),
      abandon_count: abandonMap[row.page] || 0
    }));

    // Calcular taxas de conversão
    let previousSessions = null;
    funnel.forEach(step => {
      if (previousSessions !== null) {
        step.conversion_rate = ((step.sessions / previousSessions) * 100).toFixed(2);
      }
      step.abandon_rate = ((step.abandon_count / step.sessions) * 100).toFixed(2);
      previousSessions = step.sessions;
    });

    res.json({
      success: true,
      funnel: funnel,
      period: 'last_30_days'
    });

  } catch (error) {
    console.error('Erro ao gerar funil:', error);
    res.status(500).json({ error: 'Failed to generate funnel report' });
  }
});

/**
 * GET /api/v1/analytics/session/:session_id
 * Retorna todos os eventos de uma sessão específica
 */
router.get('/session/:session_id', protect, async (req, res) => {
  try {
    const { session_id } = req.params;

    const events = await pool.query(`
      SELECT
        id,
        event_type,
        page,
        event_data,
        created_at
      FROM analytics_events
      WHERE session_id = $1
      ORDER BY created_at ASC
    `, [session_id]);

    res.json({
      success: true,
      session_id: session_id,
      events: events.rows
    });

  } catch (error) {
    console.error('Erro ao buscar eventos da sessão:', error);
    res.status(500).json({ error: 'Failed to fetch session events' });
  }
});

/**
 * GET /api/v1/analytics/abandonment
 * Retorna estatísticas de abandono por página
 */
router.get('/abandonment', protect, async (req, res) => {
  try {
    const stats = await pool.query(`
      WITH page_stats AS (
        SELECT
          page,
          COUNT(DISTINCT session_id) as total_sessions,
          COUNT(DISTINCT CASE WHEN event_type = 'page_abandon' THEN session_id END) as abandoned_sessions,
          AVG(CAST(event_data->>'time_on_page' AS INTEGER)) FILTER (WHERE event_type = 'page_abandon') as avg_time_before_abandon,
          AVG(CAST(event_data->>'scroll_depth' AS INTEGER)) FILTER (WHERE event_type = 'page_abandon') as avg_scroll_depth,
          AVG(CAST(event_data->>'form_completion' AS INTEGER)) FILTER (WHERE event_type = 'page_abandon') as avg_form_completion
        FROM analytics_events
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY page
      )
      SELECT
        page,
        total_sessions,
        abandoned_sessions,
        ROUND((abandoned_sessions::numeric / NULLIF(total_sessions, 0)) * 100, 2) as abandon_rate,
        ROUND(avg_time_before_abandon) as avg_time_before_abandon,
        ROUND(avg_scroll_depth) as avg_scroll_depth,
        ROUND(avg_form_completion) as avg_form_completion
      FROM page_stats
      ORDER BY abandon_rate DESC
    `);

    res.json({
      success: true,
      abandonment_stats: stats.rows,
      period: 'last_30_days'
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de abandono:', error);
    res.status(500).json({ error: 'Failed to generate abandonment report' });
  }
});

module.exports = router;
