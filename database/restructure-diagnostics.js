// =============================================
// REESTRUTURAÇÃO: Sistema de Anamnese + Histórico
// =============================================
// REGRA:
// - Apenas 1 anamnese completa por usuário (a última)
// - Histórico das últimas 4 pontuações salvas
// =============================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function restructureDiagnostics() {
  const client = await pool.connect();

  try {
    console.log('🔄 Reestruturando sistema de diagnósticos...\n');

    // =============================================
    // 1. CRIAR TABELA: diagnostics (anamnese atual)
    // Guarda apenas a ÚLTIMA anamnese completa
    // =============================================
    console.log('1. Recriando tabela diagnostics (anamnese atual)...');

    await client.query(`DROP TABLE IF EXISTS diagnostics CASCADE`);

    await client.query(`
      CREATE TABLE diagnostics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) UNIQUE NOT NULL,

        -- Scores por categoria (0-100)
        intro_score INTEGER DEFAULT 0,
        nutrition_score INTEGER DEFAULT 0,
        digestive_score INTEGER DEFAULT 0,
        physical_score INTEGER DEFAULT 0,
        sleep_score INTEGER DEFAULT 0,
        mental_score INTEGER DEFAULT 0,
        hormonal_score INTEGER DEFAULT 0,
        symptoms_score INTEGER DEFAULT 0,

        -- Score total e severidade
        total_score INTEGER DEFAULT 0,
        severity_level VARCHAR(50) DEFAULT 'moderate',

        -- Dados completos do questionário (JSONB)
        questionnaire_data JSONB,

        -- Recomendações
        recommendations TEXT[],

        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabela diagnostics criada (1 anamnese por usuário)');

    // =============================================
    // 2. CRIAR TABELA: diagnostic_history
    // Guarda histórico das últimas 4 pontuações
    // =============================================
    console.log('\n2. Criando tabela diagnostic_history...');

    await client.query(`DROP TABLE IF EXISTS diagnostic_history CASCADE`);

    await client.query(`
      CREATE TABLE diagnostic_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,

        -- Scores por categoria (0-100)
        intro_score INTEGER DEFAULT 0,
        nutrition_score INTEGER DEFAULT 0,
        digestive_score INTEGER DEFAULT 0,
        physical_score INTEGER DEFAULT 0,
        sleep_score INTEGER DEFAULT 0,
        mental_score INTEGER DEFAULT 0,
        hormonal_score INTEGER DEFAULT 0,
        symptoms_score INTEGER DEFAULT 0,

        -- Score total e severidade
        total_score INTEGER DEFAULT 0,
        severity_level VARCHAR(50) DEFAULT 'moderate',

        -- Timestamp de quando essa pontuação foi gerada
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        -- Índice para ordenação
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índice para buscar histórico de um usuário rapidamente
    await client.query(`
      CREATE INDEX idx_history_user_date ON diagnostic_history(user_id, completed_at DESC);
    `);

    console.log('✅ Tabela diagnostic_history criada');

    // =============================================
    // 3. CRIAR FUNÇÃO: Limpar histórico antigo
    // Mantém apenas as últimas 4 entradas por usuário
    // =============================================
    console.log('\n3. Criando função para limpar histórico antigo...');

    await client.query(`
      CREATE OR REPLACE FUNCTION cleanup_old_history()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Deletar entradas antigas, mantendo apenas as 4 mais recentes
        DELETE FROM diagnostic_history
        WHERE user_id = NEW.user_id
        AND id NOT IN (
          SELECT id FROM diagnostic_history
          WHERE user_id = NEW.user_id
          ORDER BY completed_at DESC
          LIMIT 4
        );

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Criar trigger que executa após inserir novo histórico
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_cleanup_history ON diagnostic_history;

      CREATE TRIGGER trigger_cleanup_history
      AFTER INSERT ON diagnostic_history
      FOR EACH ROW
      EXECUTE FUNCTION cleanup_old_history();
    `);

    console.log('✅ Função de limpeza automática criada');

    console.log('\n✅ Reestruturação concluída com sucesso!');
    console.log('\n📊 Estrutura Final:');
    console.log('   - diagnostics: 1 anamnese completa por usuário');
    console.log('   - diagnostic_history: últimas 4 pontuações por usuário');
    console.log('   - Trigger automático: limpa histórico antigo\n');

  } catch (error) {
    console.error('❌ Erro na reestruturação:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

restructureDiagnostics();
