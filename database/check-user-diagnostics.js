// Script para verificar diagnósticos de um usuário específico
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkUserDiagnostics() {
  try {
    console.log('\n🔍 VERIFICANDO DIAGNÓSTICOS DO USUÁRIO\n');
    console.log('='.repeat(60));

    // Listar usuários
    const users = await pool.query('SELECT id, name, email FROM users ORDER BY id');
    console.log('\n📋 USUÁRIOS NO SISTEMA:');
    users.rows.forEach(u => {
      console.log(`  ID ${u.id}: ${u.name} (${u.email})`);
    });

    // Pedir ID do usuário (usar o primeiro por padrão)
    const userId = users.rows[0]?.id || 1;
    console.log(`\n🎯 Analisando usuário ID: ${userId}\n`);
    console.log('='.repeat(60));

    // 1. Verificar diagnóstico atual
    const currentDiag = await pool.query(`
      SELECT
        id,
        user_id,
        total_score,
        severity_level,
        intro_score,
        nutrition_score,
        digestive_score,
        physical_score,
        sleep_score,
        mental_score,
        hormonal_score,
        symptoms_score,
        created_at,
        updated_at,
        questionnaire_data IS NOT NULL as has_data,
        LENGTH(questionnaire_data::text) as data_size
      FROM diagnostics
      WHERE user_id = $1
    `, [userId]);

    console.log('\n📊 DIAGNÓSTICO ATUAL (tabela diagnostics):');
    if (currentDiag.rows.length === 0) {
      console.log('  ❌ Nenhum diagnóstico encontrado!');
    } else {
      const diag = currentDiag.rows[0];
      console.log(`  ID: ${diag.id}`);
      console.log(`  Score Total: ${diag.total_score}`);
      console.log(`  Nível: ${diag.severity_level}`);
      console.log(`  Criado: ${diag.created_at}`);
      console.log(`  Atualizado: ${diag.updated_at}`);
      console.log(`  Tem dados? ${diag.has_data ? 'Sim' : 'Não'}`);
      console.log(`  Tamanho dados: ${diag.data_size || 0} bytes`);
      console.log('\n  Scores por categoria:');
      console.log(`    Corpo (Intro): ${diag.intro_score}`);
      console.log(`    Nutrição: ${diag.nutrition_score}`);
      console.log(`    Digestão: ${diag.digestive_score}`);
      console.log(`    Exercício: ${diag.physical_score}`);
      console.log(`    Sono: ${diag.sleep_score}`);
      console.log(`    Mente: ${diag.mental_score}`);
      console.log(`    Hormonal: ${diag.hormonal_score}`);
      console.log(`    Sintomas: ${diag.symptoms_score}`);
    }

    // 2. Verificar histórico
    const history = await pool.query(`
      SELECT
        id,
        total_score,
        severity_level,
        intro_score,
        nutrition_score,
        digestive_score,
        physical_score,
        sleep_score,
        mental_score,
        hormonal_score,
        symptoms_score,
        completed_at
      FROM diagnostic_history
      WHERE user_id = $1
      ORDER BY completed_at DESC
      LIMIT 4
    `, [userId]);

    console.log('\n📈 HISTÓRICO (últimas 4 anamneses):');
    if (history.rows.length === 0) {
      console.log('  ❌ Nenhum histórico encontrado!');
    } else {
      history.rows.forEach((h, index) => {
        console.log(`\n  ${index + 1}. Diagnóstico #${h.id}`);
        console.log(`     Data: ${h.completed_at}`);
        console.log(`     Score: ${h.total_score} (${h.severity_level})`);
        console.log(`     Scores: Corpo=${h.intro_score}, Nutrição=${h.nutrition_score}, Digestão=${h.digestive_score}`);
        console.log(`             Exercício=${h.physical_score}, Sono=${h.sleep_score}, Mente=${h.mental_score}`);
        console.log(`             Hormonal=${h.hormonal_score}, Sintomas=${h.symptoms_score}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Análise concluída!\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

checkUserDiagnostics();
