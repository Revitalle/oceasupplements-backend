// =============================================
// SCRIPT DE INICIALIZAÇÃO DO BANCO
// Execute: node database/init.js
// =============================================

require('dotenv').config();
const { sequelize, testConnection } = require('../config/database');
const User = require('../models/User');

async function initDatabase() {
  try {
    console.log('🔄 Iniciando configuração do banco...\n');

    // Testar conexão
    console.log('1. Testando conexão...');
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Falha na conexão');
    }

    // Sincronizar modelos (criar tabelas)
    console.log('\n2. Criando tabelas...');
    await sequelize.sync({ force: false }); // force: true apaga e recria
    console.log('✅ Tabelas criadas!');

    // Criar usuário admin de teste
    console.log('\n3. Criando usuário de teste...');
    const existingUser = await User.findOne({ where: { email: 'teste@oceasupplements.com' } });

    if (!existingUser) {
      const password_hash = await User.hashPassword('senha123');
      await User.create({
        name: 'Usuário Teste',
        email: 'teste@oceasupplements.com',
        password_hash,
        phone: '11999999999'
      });
      console.log('✅ Usuário de teste criado!');
      console.log('   Email: teste@oceasupplements.com');
      console.log('   Senha: senha123');
    } else {
      console.log('⚠️  Usuário de teste já existe');
    }

    console.log('\n✅ Banco de dados configurado com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro ao configurar banco:', error.message);
    process.exit(1);
  }
}

initDatabase();
