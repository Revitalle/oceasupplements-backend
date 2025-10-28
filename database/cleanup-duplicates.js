// =============================================
// LIMPEZA DE DUPLICATAS
// Remove diagnósticos duplicados, mantendo apenas o mais recente por usuário
// =============================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function cleanupDuplicates() {
  const client = await pool.connect();

  try {
    console.log('🔄 Limpando diagnósticos duplicados...\n');

    // 1. Verificar quantas duplicatas existem
    console.log('📊 Verificando duplicatas...');
    const duplicates = await client.query(`
      SELECT user_id, COUNT(*) as count
      FROM diagnostics
      GROUP BY user_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);

    if (duplicates.rows.length === 0) {
      console.log('✅ Nenhuma duplicata encontrada!\n');
      return;
    }

    console.log(`⚠️  Encontradas ${duplicates.rows.length} usuários com diagnósticos duplicados:`);
    duplicates.rows.forEach(row => {
      console.log(`   - user_id ${row.user_id}: ${row.count} diagnósticos`);
    });

    // 2. Mostrar quais registros serão deletados
    console.log('\n📋 Registros que serão DELETADOS (mantendo apenas o mais recente):');
    const toDelete = await client.query(`
      SELECT id, user_id, created_at
      FROM diagnostics
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM diagnostics
        GROUP BY user_id
      )
      ORDER BY user_id, created_at
    `);

    if (toDelete.rows.length > 0) {
      console.log(`   Total de registros a deletar: ${toDelete.rows.length}\n`);
      toDelete.rows.forEach(row => {
        console.log(`   - ID ${row.id} | user_id ${row.user_id} | ${new Date(row.created_at).toLocaleString()}`);
      });
    }

    // 3. Deletar duplicatas (mantém apenas o ID maior = mais recente)
    console.log('\n🗑️  Deletando duplicatas...');
    const deleteResult = await client.query(`
      DELETE FROM diagnostics
      WHERE id NOT IN (
        SELECT MAX(id)
        FROM diagnostics
        GROUP BY user_id
      )
      RETURNING id, user_id
    `);

    console.log(`✅ ${deleteResult.rowCount} registros deletados com sucesso!\n`);

    // 4. Verificar resultado final
    console.log('📊 Verificando resultado final...');
    const finalCheck = await client.query(`
      SELECT user_id, COUNT(*) as count
      FROM diagnostics
      GROUP BY user_id
      HAVING COUNT(*) > 1
    `);

    if (finalCheck.rows.length === 0) {
      console.log('✅ Todas as duplicatas foram removidas!');
      console.log('✅ Agora cada usuário tem apenas 1 diagnóstico\n');
    } else {
      console.log('⚠️  Ainda existem duplicatas (não deveria acontecer)');
    }

    // 5. Mostrar resumo
    const total = await client.query('SELECT COUNT(*) FROM diagnostics');
    const totalUsers = await client.query('SELECT COUNT(DISTINCT user_id) FROM diagnostics');

    console.log('📈 Resumo Final:');
    console.log(`   - Total de diagnósticos: ${total.rows[0].count}`);
    console.log(`   - Total de usuários: ${totalUsers.rows[0].count}`);
    console.log(`   - Média por usuário: ${(total.rows[0].count / totalUsers.rows[0].count).toFixed(1)}\n`);

  } catch (error) {
    console.error('❌ Erro ao limpar duplicatas:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupDuplicates();
