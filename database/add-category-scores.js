// =============================================
// MIGRAÇÃO: ADICIONAR SCORES POR CATEGORIA
// Execute: node database/add-category-scores.js
// =============================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addCategoryScores() {
  const client = await pool.connect();

  try {
    console.log('🔄 Adicionando colunas de scores por categoria...\n');

    // Adicionar colunas para cada categoria (0-100)
    const categories = [
      'nutrition_score',      // Nutrição
      'digestive_score',      // Saúde Digestiva
      'physical_score',       // Atividade Física
      'sleep_score',          // Sono e Descanso
      'mental_score',         // Saúde Mental
      'hormonal_score',       // Equilíbrio Hormonal
      'symptoms_score'        // Sintomas Gerais
    ];

    for (const column of categories) {
      console.log(`Adicionando coluna: ${column}...`);

      // Verificar se a coluna já existe
      const checkResult = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name='diagnostics' AND column_name='${column}'
      `);

      if (checkResult.rows.length === 0) {
        await client.query(`
          ALTER TABLE diagnostics
          ADD COLUMN ${column} INTEGER DEFAULT 0
        `);
        console.log(`✅ Coluna ${column} adicionada!`);
      } else {
        console.log(`⚠️  Coluna ${column} já existe, pulando...`);
      }
    }

    // Adicionar coluna para armazenar dados completos do questionário (JSON)
    console.log('\nAdicionando coluna questionnaire_data...');
    const checkJsonResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='diagnostics' AND column_name='questionnaire_data'
    `);

    if (checkJsonResult.rows.length === 0) {
      await client.query(`
        ALTER TABLE diagnostics
        ADD COLUMN questionnaire_data JSONB
      `);
      console.log('✅ Coluna questionnaire_data adicionada!');
    } else {
      console.log('⚠️  Coluna questionnaire_data já existe, pulando...');
    }

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('\n📊 Estrutura atualizada da tabela diagnostics:');
    console.log('   - total_score (score geral 0-100)');
    console.log('   - nutrition_score (0-100)');
    console.log('   - digestive_score (0-100)');
    console.log('   - physical_score (0-100)');
    console.log('   - sleep_score (0-100)');
    console.log('   - mental_score (0-100)');
    console.log('   - hormonal_score (0-100)');
    console.log('   - symptoms_score (0-100)');
    console.log('   - questionnaire_data (JSONB)');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addCategoryScores();
