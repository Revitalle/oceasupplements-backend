// =============================================
// TEST COMPLETE DEBUG - Simular envio de questionário
// =============================================

require('dotenv').config();
const https = require('https');
const http = require('http');

// URL da API
const API_URL = process.env.API_URL || 'http://localhost:3000';

// Dados de teste do usuário
const TEST_USER = {
  email: 'teste@oceasupplements.com',
  password: 'senha123'
};

// Dados de questionário COMPLETO simulado
const MOCK_QUESTIONNAIRE_DATA = {
  intro: {
    sexo: 'masculino',
    idade: 35,
    pesoKg: 75,
    alturaCm: 175
  },
  nutricao: {
    q1_1: '3-4',
    q1_2: '2-3',
    q1_3: 'sim',
    q1_4: '3-4',
    q1_5: 'nao'
  },
  digestiva: {
    q2_1: '5',
    q2_2: 'nao',
    q2_3: '2',
    q2_4: 'raramente'
  },
  fisica: {
    q3_1: '3-5',
    q3_2: '30-60',
    q3_3: 'moderada',
    q3_4: 'sim'
  },
  sono: {
    q4_1: '7-8',
    q4_2: 'boa',
    q4_3: 'nao',
    q4_4: 'raramente'
  },
  mental: {
    q5_1: '5',
    q5_2: '3',
    q5_3: 'as_vezes',
    q5_4: 'sim'
  },
  hormonal: {
    q6_1: 'estavel',
    q6_2m: '7',
    q6_3m: 'nao'
  },
  sintomas: {
    sintomas_texto: 'Teste de sintomas gerais, com algumas palavras para validar o score.'
  }
};

// Helper para fazer requisições HTTP/HTTPS
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function testCompleteEndpoint() {
  console.log('==========================================');
  console.log('🧪 TESTE DO ENDPOINT /complete');
  console.log('==========================================\n');

  try {
    // 1. Login
    console.log('1️⃣  Fazendo login...');
    const loginResponse = await httpRequest(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    const loginData = loginResponse.data;

    if (!loginData.success) {
      throw new Error('Falha no login: ' + loginData.error?.message);
    }

    const token = loginData.data.token;
    console.log('✅ Login realizado com sucesso!');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // 2. Enviar questionário completo
    console.log('2️⃣  Enviando questionário completo...');
    console.log('Dados sendo enviados:');
    console.log('- Seções:', Object.keys(MOCK_QUESTIONNAIRE_DATA).join(', '));
    console.log('- Total de campos:', Object.values(MOCK_QUESTIONNAIRE_DATA).reduce((sum, section) => sum + Object.keys(section).length, 0));
    console.log('- JSON size:', JSON.stringify(MOCK_QUESTIONNAIRE_DATA).length, 'bytes\n');

    const completeResponse = await httpRequest(`${API_URL}/api/v1/questionnaire/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        session_id: Date.now(),
        questionnaire_data: MOCK_QUESTIONNAIRE_DATA
      })
    });

    const completeData = completeResponse.data;

    console.log('3️⃣  Resposta do servidor:');
    console.log(JSON.stringify(completeData, null, 2));

    if (completeData.success) {
      console.log('\n✅ SUCESSO! Diagnóstico criado!');
      console.log('Diagnostic ID:', completeData.data.diagnostic_id);
      console.log('Total Score:', completeData.data.total_score);
      console.log('Severity:', completeData.data.severity_level);
      console.log('\nScores por categoria:');
      console.log(JSON.stringify(completeData.data.category_scores, null, 2));
    } else {
      console.log('\n❌ FALHA:', completeData.error);
    }

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    console.error(error);
  }

  console.log('\n==========================================');
  console.log('Teste finalizado!');
  console.log('==========================================');
}

// Executar teste
testCompleteEndpoint();
