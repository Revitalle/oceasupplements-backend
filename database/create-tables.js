// =============================================
// SCRIPT PARA CRIAR TODAS AS TABELAS
// Execute: node database/create-tables.js
// =============================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createTables() {
  const client = await pool.connect();

  try {
    console.log('🔄 Criando tabelas do banco...\n');

    // 1. Criar tabela de categorias
    console.log('1. Criando tabela health_categories...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS health_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela health_categories criada!');

    // 2. Criar tabela de perguntas
    console.log('2. Criando tabela questions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES health_categories(id),
        question_text TEXT NOT NULL,
        answer_type VARCHAR(50) NOT NULL,
        order_number INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela questions criada!');

    // 3. Criar tabela de sessões de questionário
    console.log('3. Criando tabela questionnaire_sessions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS questionnaire_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'in_progress',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela questionnaire_sessions criada!');

    // 4. Criar tabela de respostas
    console.log('4. Criando tabela session_answers...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS session_answers (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES questionnaire_sessions(id),
        question_id INTEGER REFERENCES questions(id),
        answer_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela session_answers criada!');

    // 5. Criar tabela de diagnósticos
    console.log('5. Criando tabela diagnostics...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS diagnostics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        session_id INTEGER REFERENCES questionnaire_sessions(id),
        total_score INTEGER,
        severity_level VARCHAR(50),
        recommendations TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela diagnostics criada!');

    // 6. Criar tabela de produtos
    console.log('6. Criando tabela products...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        checkout_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela products criada!');

    // 7. Criar tabela de conversões
    console.log('7. Criando tabela conversions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_slug VARCHAR(200),
        source VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabela conversions criada!');

    console.log('\n✅ Todas as tabelas criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createTables();
