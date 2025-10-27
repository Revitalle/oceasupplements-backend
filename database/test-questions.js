// Testar se as perguntas estão no banco
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testQuestions() {
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT * FROM questions ORDER BY order_number');

    console.log(`\n📊 Total de perguntas no banco: ${result.rows.length}\n`);

    if (result.rows.length > 0) {
      console.log('Perguntas encontradas:');
      result.rows.forEach((q, i) => {
        console.log(`${i+1}. ${q.question_text} (${q.answer_type})`);
      });
    } else {
      console.log('❌ Nenhuma pergunta encontrada!');
    }

  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testQuestions();
