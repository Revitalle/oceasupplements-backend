// =============================================
// SCRIPT PARA ADICIONAR PERGUNTAS AO BANCO
// Execute: node database/seed-questions.js
// =============================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seedQuestions() {
  const client = await pool.connect();

  try {
    console.log('🔄 Iniciando população de perguntas...\n');

    // 1. Inserir categorias
    console.log('1. Criando categorias de saúde...');
    await client.query(`
      INSERT INTO health_categories (name, description) VALUES
      ('Nutrição', 'Avaliação de hábitos alimentares'),
      ('Energia', 'Níveis de energia e vitalidade'),
      ('Sono', 'Qualidade e padrões de sono'),
      ('Estresse', 'Gerenciamento de estresse'),
      ('Exercício', 'Atividade física e movimento')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Categorias criadas!\n');

    // 2. Obter IDs das categorias
    const categoriesResult = await client.query('SELECT id, name FROM health_categories');
    const categories = {};
    categoriesResult.rows.forEach(row => {
      categories[row.name] = row.id;
    });

    // 3. Inserir perguntas
    console.log('2. Criando perguntas...');

    const questions = [
      // Nutrição
      { cat: 'Nutrição', text: 'Você consome frutas e vegetais diariamente?', type: 'yes_no', order: 1 },
      { cat: 'Nutrição', text: 'Com que frequência você consome alimentos processados?', type: 'scale_1_5', order: 2 },

      // Energia
      { cat: 'Energia', text: 'Você se sente com energia durante o dia?', type: 'scale_1_5', order: 3 },
      { cat: 'Energia', text: 'Precisa de cafeína para se manter acordado?', type: 'yes_no', order: 4 },

      // Sono
      { cat: 'Sono', text: 'Você dorme pelo menos 7 horas por noite?', type: 'yes_no', order: 5 },
      { cat: 'Sono', text: 'Com que frequência você tem dificuldade para dormir?', type: 'scale_1_5', order: 6 },

      // Estresse
      { cat: 'Estresse', text: 'Você se sente estressado frequentemente?', type: 'scale_1_5', order: 7 },
      { cat: 'Estresse', text: 'Pratica técnicas de relaxamento?', type: 'yes_no', order: 8 },

      // Exercício
      { cat: 'Exercício', text: 'Você pratica exercícios físicos regularmente?', type: 'yes_no', order: 9 },
      { cat: 'Exercício', text: 'Quantas vezes por semana você se exercita?', type: 'scale_1_5', order: 10 }
    ];

    for (const q of questions) {
      await client.query(`
        INSERT INTO questions (category_id, question_text, answer_type, order_number)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [categories[q.cat], q.text, q.type, q.order]);
    }

    console.log('✅ 10 perguntas criadas!\n');

    // 4. Verificar
    const countResult = await client.query('SELECT COUNT(*) FROM questions');
    console.log(`📊 Total de perguntas no banco: ${countResult.rows[0].count}\n`);

    console.log('✅ População concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao popular perguntas:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seedQuestions();
