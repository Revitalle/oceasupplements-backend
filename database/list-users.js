const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function listUsers() {
  try {
    const result = await pool.query('SELECT id, email, name, created_at FROM users ORDER BY id');

    console.log('\n👥 Usuários cadastrados:');
    if (result.rows.length === 0) {
      console.log('   Nenhum usuário encontrado\n');
    } else {
      result.rows.forEach(u => {
        console.log(`   - ID ${u.id}: ${u.email} (${u.name || 'sem nome'})`);
      });
      console.log('');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

listUsers();
