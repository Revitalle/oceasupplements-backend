// =============================================
// MIGRAÇÃO INCREMENTAL (SEM DROPAR DADOS)
// Apenas adiciona colunas novas à tabela existente
// =============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Railway precisa de SSL
});

async function migrateIncrementally() {
  const client = await pool.connect();

  try {
    console.log('🔄 Executando migração incremental...\n');

    // =============================================
    // PASSO 1: Adicionar colunas de score na tabela diagnostics
    // =============================================
    console.log('📊 Passo 1: Adicionando colunas de score...');

    const scoreColumns = [
      'intro_score',
      'nutrition_score',
      'digestive_score',
      'physical_score',
      'sleep_score',
      'mental_score',
      'hormonal_score',
      'symptoms_score'
    ];

    for (const column of scoreColumns) {
      // Verificar se coluna já existe
      const checkCol = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='diagnostics' AND column_name='${column}'
      `);

      if (checkCol.rows.length === 0) {
        await client.query(`
          ALTER TABLE diagnostics
          ADD COLUMN ${column} INTEGER DEFAULT 0
        `);
        console.log(`   ✅ Coluna ${column} adicionada`);
      } else {
        console.log(`   ⚠️  Coluna ${column} já existe`);
      }
    }

    // Adicionar coluna questionnaire_data (JSONB)
    const checkJsonb = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='diagnostics' AND column_name='questionnaire_data'
    `);

    if (checkJsonb.rows.length === 0) {
      await client.query(`
        ALTER TABLE diagnostics
        ADD COLUMN questionnaire_data JSONB
      `);
      console.log('   ✅ Coluna questionnaire_data adicionada');
    } else {
      console.log('   ⚠️  Coluna questionnaire_data já existe');
    }

    // =============================================
    // PASSO 2: Remover constraint de session_id (se existir)
    // Para permitir UPSERT por user_id
    // =============================================
    console.log('\n🔧 Passo 2: Ajustando constraints...');

    // Verificar se coluna session_id existe
    const checkSession = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='diagnostics' AND column_name='session_id'
    `);

    if (checkSession.rows.length > 0) {
      // Tornar session_id opcional (pode ser null)
      await client.query(`
        ALTER TABLE diagnostics
        ALTER COLUMN session_id DROP NOT NULL
      `);
      console.log('   ✅ session_id agora é opcional');
    }

    // Adicionar constraint UNIQUE em user_id (se não existir)
    const checkConstraint = await client.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name='diagnostics'
        AND constraint_type='UNIQUE'
        AND constraint_name='diagnostics_user_id_key'
    `);

    if (checkConstraint.rows.length === 0) {
      try {
        await client.query(`
          ALTER TABLE diagnostics
          ADD CONSTRAINT diagnostics_user_id_key UNIQUE (user_id)
        `);
        console.log('   ✅ Constraint UNIQUE em user_id adicionado');
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          console.log('   ⚠️  Já existem múltiplos registros por usuário');
          console.log('   ⚠️  Você precisa limpar duplicatas antes de adicionar UNIQUE');
          console.log('\n   Execute este SQL manualmente:');
          console.log('   -- Ver duplicatas:');
          console.log('   SELECT user_id, COUNT(*) FROM diagnostics GROUP BY user_id HAVING COUNT(*) > 1;');
          console.log('   -- Manter apenas o mais recente por usuário:');
          console.log('   DELETE FROM diagnostics WHERE id NOT IN (');
          console.log('     SELECT MAX(id) FROM diagnostics GROUP BY user_id');
          console.log('   );');
        } else {
          throw error;
        }
      }
    } else {
      console.log('   ⚠️  Constraint UNIQUE em user_id já existe');
    }

    // =============================================
    // PASSO 3: Criar tabela diagnostic_history
    // =============================================
    console.log('\n📈 Passo 3: Criando tabela de histórico...');

    const checkHistory = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name='diagnostic_history'
    `);

    if (checkHistory.rows.length === 0) {
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

          -- Timestamp
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE INDEX idx_history_user_date
        ON diagnostic_history(user_id, completed_at DESC);
      `);

      console.log('   ✅ Tabela diagnostic_history criada');
    } else {
      console.log('   ⚠️  Tabela diagnostic_history já existe');
    }

    // =============================================
    // PASSO 4: Criar função e trigger de limpeza
    // =============================================
    console.log('\n🤖 Passo 4: Criando trigger automático...');

    await client.query(`
      CREATE OR REPLACE FUNCTION cleanup_old_history()
      RETURNS TRIGGER AS $$
      BEGIN
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

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_cleanup_history ON diagnostic_history;

      CREATE TRIGGER trigger_cleanup_history
      AFTER INSERT ON diagnostic_history
      FOR EACH ROW
      EXECUTE FUNCTION cleanup_old_history();
    `);

    console.log('   ✅ Trigger de limpeza criado');

    console.log('\n✅ Migração incremental concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Teste preenchendo um questionário');
    console.log('   2. Verifique se os scores foram calculados');
    console.log('   3. Confira a tabela diagnostic_history\n');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateIncrementally();
