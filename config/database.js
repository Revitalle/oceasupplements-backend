// =============================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// =============================================

const { Sequelize } = require('sequelize');

// Obter URL do banco de dados do ambiente
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada!');
  process.exit(1);
}

// Configurar Sequelize
const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? {
          require: true,
          rejectUnauthorized: false // Railway usa SSL
        }
      : false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Testar conexão
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar no banco:', error.message);
    return false;
  }
};

// Sincronizar modelos (cria tabelas se não existirem)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force }); // force: true apaga e recria tabelas
    console.log('✅ Banco de dados sincronizado!');
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};
