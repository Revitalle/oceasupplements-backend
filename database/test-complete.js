const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const https = require('https');

// Simular dados de questionário completo
const questionnaireData = {
  intro: {
    pesoKg: 70,
    alturaCm: 175,
    sexo: 'masculino'
  },
  nutricao: {
    q1_1: '3-4',
    q1_2: 'Às vezes',
    q1_3: 7,
    q1_4: 'Sim, diariamente',
    q1_5: 'Mais de 2 litros',
    q1_6: 'Sim',
    q1_7: []
  },
  digestiva: {
    q2_1: 'Às vezes',
    q2_2: 'Às vezes',
    q2_3: 'Nunca',
    q2_4: 5,
    q2_5: []
  },
  fisica: {
    q3_1: '3-5 vezes por semana',
    q3_2: 'Exercícios moderados',
    q3_3: 6,
    q3_4: 'Sim'
  },
  sono: {
    q4_1: '6-7 horas',
    q4_2: 'Às vezes',
    q4_3: 7,
    q4_4: 'Não'
  },
  mental: {
    q5_1: 5,
    q5_2: 4,
    q5_3: 6,
    q5_4: 'Às vezes'
  },
  hormonal: {
    q6_1: 'Às vezes',
    q6_2: 'Normal',
    q6_3: []
  },
  sintomas: {
    q7_1: []
  }
};

// Token de teste - VOCÊ PRECISA SUBSTITUIR POR UM TOKEN REAL
const AUTH_TOKEN = 'SEU_TOKEN_AQUI';

const data = JSON.stringify({
  session_id: Date.now(),
  questionnaire_data: questionnaireData
});

const options = {
  hostname: 'web-production-f401a.up.railway.app',
  port: 443,
  path: '/api/v1/questionnaire/complete',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
};

console.log('🧪 Testando endpoint /questionnaire/complete...\n');
console.log('📤 Enviando dados:', JSON.stringify(questionnaireData, null, 2));

const req = https.request(options, (res) => {
  console.log(`\n✅ Status: ${res.statusCode}`);

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('\n📥 Resposta:');
    try {
      const json = JSON.parse(body);
      console.log(JSON.stringify(json, null, 2));

      if (json.success) {
        console.log('\n✅ SUCESSO! Diagnostic ID:', json.data.diagnostic_id);
      }
    } catch (e) {
      console.log(body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro:', error);
});

req.write(data);
req.end();
