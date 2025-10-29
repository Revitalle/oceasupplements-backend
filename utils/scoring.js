// =============================================
// SISTEMA DE PONTUAÇÃO DO QUESTIONÁRIO
// Baseado na lógica definida pelo ChatGPT
// Escala: 0 (pior) a 100 (melhor)
// =============================================

// ============== UTILITÁRIOS GERAIS ==============

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
const clamp01 = (x) => clamp(x, 0, 1);
const pct = (x01) => Math.round(clamp01(x01) * 100);
const sliderToPct = (x0to10) => pct(x0to10 / 10);
const sliderInvToPct = (x0to10) => pct((10 - x0to10) / 10);

/**
 * Calcula média ponderada
 * @param {Array} pairs - Array de objetos { w: peso, s: score }
 * @returns {number} Score de 0-100
 */
function weightedScore(pairs) {
  const total = pairs.reduce((acc, it) => acc + it.w * (it.s / 100), 0);
  return pct(total);
}

// ============== 0. INTRO (IMC) ======================

/**
 * Calcula subscore do IMC
 * @param {number} bmi - Índice de Massa Corporal
 * @returns {number} Score de 0-100
 */
function bmiSubscore(bmi) {
  if (bmi < 16.0) return 5;
  if (bmi < 18.5) return 25;       // 16.0–18.4
  if (bmi <= 24.9) return 100;     // normal
  if (bmi <= 27.9) return 75;      // sobrepeso leve
  if (bmi <= 29.9) return 60;      // sobrepeso alto
  if (bmi <= 34.9) return 40;      // obesidade I
  if (bmi <= 39.0) return 20;      // obesidade II
  return 5;                        // > 39.0
}

/**
 * Calcula score da Intro (baseado no IMC)
 * @param {Object} data - { pesoKg, alturaCm }
 * @returns {number|null} Score de 0-100 ou null se dados inválidos
 */
function introScore(data) {
  const pesoKg = data.pesoKg || data.peso;
  const alturaCm = data.alturaCm || data.altura;
  const alturaM = alturaCm / 100;
  if (!pesoKg || !alturaCm || alturaM <= 0) return null;
  const bmi = pesoKg / (alturaM * alturaM);
  return clamp(bmiSubscore(bmi), 0, 100);
}

// ============== 1. NUTRIÇÃO =========================

const NUTRICAO_PESOS = {
  q1_1: 0.125, // refeições/dia
  q1_2: 0.125, // fome
  q1_3: 0.250, // qualidade slider
  q1_4: 0.125, // frutas/vegetais
  q1_5: 0.188, // água
  q1_6: 0.125, // suplementos
  q1_7: 0.063  // restrições
};

function nutricaoSubscores(ans) {
  const subs = {};

  // 1.1 Quantas refeições por dia
  const ref = ans.q1_1 || ans.refeicoes || ans.refeicoes_dia;
  if (ref === '1-2' || ref === '1 a 2 refeições') subs.q1_1 = 40;
  else if (ref === '3-4' || ref === '3 a 4 refeições') subs.q1_1 = 100;
  else if (ref === '5-6' || ref === '5 a 6 refeições') subs.q1_1 = 70;
  else subs.q1_1 = null;

  // 1.2 Fome entre refeições
  const fome = ans.q1_2 || ans.fome || ans.fome_entre_refeicoes;
  if (fome === 'Nunca') subs.q1_2 = 100;
  else if (fome === 'Às vezes') subs.q1_2 = 60;
  else if (fome === 'Frequentemente') subs.q1_2 = 20;
  else subs.q1_2 = null;

  // 1.3 Qualidade da alimentação (slider 0-10)
  const qual = ans.q1_3 || ans.qualidade || ans.qualidade_alimentacao;
  subs.q1_3 = typeof qual === 'number' ? sliderToPct(qual) : null;

  // 1.4 Frutas e vegetais
  const frutas = ans.q1_4 || ans.frutas_vegetais;
  if (frutas === 'Sim') subs.q1_4 = 100;
  else if (frutas === 'Não') subs.q1_4 = 20;
  else subs.q1_4 = null;

  // 1.5 Água por dia
  const agua = ans.q1_5 || ans.agua || ans.agua_dia;
  if (agua === '<1L' || agua === 'Menos de 1 litro' || agua === '<1') subs.q1_5 = 20;
  else if (agua === '1-2L' || agua === '1 a 2 litros' || agua === '1-2') subs.q1_5 = 80;
  else if (agua === '2-3L' || agua === '2 a 3 litros' || agua === '2-3') subs.q1_5 = 100;
  else if (agua === '>3L' || agua === 'Mais de 3 litros' || agua === '>3') subs.q1_5 = 80;
  else subs.q1_5 = null;

  // 1.6 Suplementos
  const supl = ans.q1_6 || ans.suplementos;
  if (supl === 'Não' || supl === 'Não uso suplementos') subs.q1_6 = 60;
  else if (supl === 'Básico' || supl?.includes('Básico')) subs.q1_6 = 85;
  else if (supl === 'Avançado' || supl?.includes('Avançado')) subs.q1_6 = 95;
  else subs.q1_6 = null;

  // 1.7 Restrições alimentares (array)
  const restr = ans.q1_7 || ans.restricoes;
  if (Array.isArray(restr)) {
    if (restr.includes('Nenhuma')) {
      subs.q1_7 = 100;
    } else {
      let base = 85;
      if (restr.includes('Lactose')) base -= 10;
      if (restr.includes('Glúten')) base -= 10;
      if (restr.includes('Peixes e Crustáceos')) base -= 5;
      subs.q1_7 = clamp(base, 0, 95);
    }
  } else {
    subs.q1_7 = null;
  }

  return subs;
}

function nutritionScore(ans) {
  const s = nutricaoSubscores(ans);
  const pairs = Object.entries(NUTRICAO_PESOS).map(([k, w]) => ({ w, s: s[k] ?? 0 }));
  return weightedScore(pairs);
}

// ============== 2. SAÚDE DIGESTIVA ==================

const DIG_PESOS = { q2_1: 0.35, q2_2: 0.25, q2_3: 0.25, q2_4: 0.15 };

function digestivaSubscores(ans) {
  const subs = {};

  // 2.1 Trânsito intestinal
  const trans = ans.q2_1 || ans.transito || ans.transito_intestinal;
  if (trans === 'Normal' || trans?.includes('Normal')) subs.q2_1 = 100;
  else if (trans === 'Constipado' || trans?.includes('Constipado')) subs.q2_1 = 20;
  else if (trans === 'Irregular' || trans?.includes('Irregular')) subs.q2_1 = 50;
  else if (trans === 'Diarreia' || trans?.includes('Diarreia')) subs.q2_1 = 15;
  else subs.q2_1 = null;

  // 2.2 Inchaço/gases
  const gases = ans.q2_2 || ans.gases || ans.inchaco_gases;
  if (gases === 'Nunca') subs.q2_2 = 100;
  else if (gases === 'Raramente') subs.q2_2 = 85;
  else if (gases === 'Às vezes') subs.q2_2 = 60;
  else if (gases === 'Frequentemente') subs.q2_2 = 30;
  else if (gases === 'Sempre') subs.q2_2 = 10;
  else subs.q2_2 = null;

  // 2.3 Condições digestivas (multi)
  const cond = ans.q2_3 || ans.condicoes || ans.condicao_digestiva;
  if (Array.isArray(cond)) {
    if (cond.includes('Não') || cond.includes('Nenhuma') || cond.length === 0) {
      subs.q2_3 = 100;
    } else {
      let base = 100;
      if (cond.some(c => c.includes('Refluxo') || c.includes('DRGE'))) base -= 15;
      if (cond.some(c => c.includes('SII') || c.includes('Intestino Irritável'))) base -= 25;
      if (cond.some(c => c.includes('Gastrite'))) base -= 15;
      if (cond.some(c => c.includes('Outra'))) base -= 10;
      subs.q2_3 = clamp(base, 0, 100);
    }
  } else {
    subs.q2_3 = null;
  }

  // 2.4 Probióticos/Prebióticos
  const prob = ans.q2_4 || ans.probioticos;
  if (prob === 'Não') subs.q2_4 = 60;
  else if (prob?.includes('Probióticos') && !prob?.includes('Ambos')) subs.q2_4 = 80;
  else if (prob?.includes('Prebióticos') && !prob?.includes('Ambos')) subs.q2_4 = 80;
  else if (prob?.includes('Ambos') || prob?.includes('simbióticos')) subs.q2_4 = 90;
  else subs.q2_4 = null;

  return subs;
}

function digestiveScore(ans) {
  const s = digestivaSubscores(ans);
  const pairs = Object.entries(DIG_PESOS).map(([k, w]) => ({ w, s: s[k] ?? 0 }));
  return weightedScore(pairs);
}

// ============== 3. ATIVIDADE FÍSICA =================

const FIS_PESOS = { q3_1: 0.40, q3_2: 0.25, q3_3: 0.25, q3_4: 0.10 };

function fisicaSubscores(ans) {
  const subs = {};

  // 3.1 Frequência de exercícios
  const freq = ans.q3_1 || ans.frequencia || ans.frequencia_exercicio;
  if (freq === 'Sedentário' || freq?.includes('Sedentário')) subs.q3_1 = 10;
  else if (freq === '1-2x/semana' || freq?.includes('1 a 2')) subs.q3_1 = 60;
  else if (freq === '3-4x/semana' || freq?.includes('3 a 4') || freq?.includes('3-4')) subs.q3_1 = 85;
  else if (freq === '5+x/semana' || freq?.includes('5 ou mais')) subs.q3_1 = 100;
  else subs.q3_1 = null;

  // 3.2 Nível de energia
  const energ = ans.q3_2 || ans.energia || ans.nivel_energia;
  if (energ?.includes('Muito baixo')) subs.q3_2 = 10;
  else if (energ?.includes('Baixo')) subs.q3_2 = 40;
  else if (energ?.includes('Moderado')) subs.q3_2 = 75;
  else if (energ?.includes('Alto')) subs.q3_2 = 100;
  else subs.q3_2 = null;

  // 3.3 Dores musculares (menos é melhor)
  const dores = ans.q3_3 || ans.dores || ans.dores_musculares;
  if (dores === 'Nunca') subs.q3_3 = 100;
  else if (dores === 'Raramente') subs.q3_3 = 85;
  else if (dores === 'Às vezes') subs.q3_3 = 60;
  else if (dores === 'Frequentemente') subs.q3_3 = 30;
  else if (dores === 'Sempre' || dores?.includes('crônicas')) subs.q3_3 = 10;
  else subs.q3_3 = null;

  // 3.4 Objetivo
  const obj = ans.q3_4 || ans.objetivo || ans.objetivo_exercicio;
  if (obj?.includes('Saúde') || obj?.includes('bem-estar') || obj?.includes('geral')) subs.q3_4 = 100;
  else if (obj?.includes('massa muscular')) subs.q3_4 = 90;
  else if (obj?.includes('Perda de peso')) subs.q3_4 = 85;
  else if (obj?.includes('performance')) subs.q3_4 = 95;
  else if (obj?.includes('Não tenho')) subs.q3_4 = 70;
  else subs.q3_4 = null;

  return subs;
}

function physicalScore(ans) {
  const s = fisicaSubscores(ans);
  const pairs = Object.entries(FIS_PESOS).map(([k, w]) => ({ w, s: s[k] ?? 0 }));
  return weightedScore(pairs);
}

// ============== 4. SONO =============================

const SONO_PESOS = { q4_1: 0.40, q4_2: 0.40, q4_3: 0.20 };

function sonoSubscores(ans) {
  const subs = {};

  // 4.1 Horas de sono
  const horas = ans.q4_1 || ans.horas_sono;
  if (horas === '<5h' || horas?.includes('Menos de 5') || horas === '<5') subs.q4_1 = 10;
  else if (horas === '5-6h' || horas?.includes('5 a 6') || horas === '5-6') subs.q4_1 = 60;
  else if (horas === '7-8h' || horas?.includes('7 a 8') || horas === '7-8') subs.q4_1 = 100;
  else if (horas === '>8h' || horas?.includes('Mais de 8') || horas === '>8') subs.q4_1 = 80;
  else subs.q4_1 = null;

  // 4.2 Qualidade do sono (slider 0-10)
  const qual = ans.q4_2 || ans.qualidade_sono;
  subs.q4_2 = typeof qual === 'number' ? sliderToPct(qual) : null;

  // 4.3 Dificuldade para dormir/Insônia
  const ins = ans.q4_3 || ans.insonia || ans.dificuldade_dormir;
  if (ins === 'Nunca' || ins?.includes('durmo facilmente') || ins === 'Não') subs.q4_3 = 100;
  else if (ins === 'Raramente') subs.q4_3 = 85;
  else if (ins === 'Às vezes') subs.q4_3 = 60;
  else if (ins === 'Frequentemente') subs.q4_3 = 30;
  else if (ins === 'Sempre' || ins?.includes('crônica') || ins === 'Sim') subs.q4_3 = 10;
  else subs.q4_3 = null;

  return subs;
}

function sleepScore(ans) {
  const s = sonoSubscores(ans);
  const pairs = Object.entries(SONO_PESOS).map(([k, w]) => ({ w, s: s[k] ?? 0 }));
  return weightedScore(pairs);
}

// ============== 5. SAÚDE MENTAL =====================

const MENTAL_PESOS = { q5_1: 0.35, q5_2: 0.25, q5_3: 0.20, q5_4: 0.20 };

function mentalSubscores(ans) {
  const subs = {};

  // 5.1 Estresse (slider 0-10, INVERTIDO: mais estresse = pior)
  const stress = ans.q5_1 || ans.estresse || ans.nivel_estresse;
  subs.q5_1 = typeof stress === 'number' ? sliderInvToPct(stress) : null;

  // 5.2 Ansiedade
  const ans_val = ans.q5_2 || ans.ansiedade;
  if (ans_val === 'Nunca') subs.q5_2 = 100;
  else if (ans_val === 'Raramente') subs.q5_2 = 85;
  else if (ans_val === 'Às vezes') subs.q5_2 = 60;
  else if (ans_val === 'Frequentemente') subs.q5_2 = 30;
  else if (ans_val === 'Sempre' || ans_val?.includes('crônica')) subs.q5_2 = 10;
  else subs.q5_2 = null;

  // 5.3 Concentração/Foco
  const foco = ans.q5_3 || ans.concentracao;
  if (foco?.includes('está bom') || foco === 'Sim') subs.q5_3 = 100;
  else if (foco?.includes('leve')) subs.q5_3 = 75;
  else if (foco?.includes('moderada') || foco === 'Não') subs.q5_3 = 45;
  else if (foco?.includes('severa')) subs.q5_3 = 15;
  else subs.q5_3 = null;

  // 5.4 Humor geral
  const humor = ans.q5_4 || ans.humor || ans.humor_geral;
  if (humor?.includes('Muito negativo') || humor?.includes('deprimido')) subs.q5_4 = 10;
  else if (humor === 'Negativo' || humor?.includes('triste')) subs.q5_4 = 35;
  else if (humor === 'Neutro') subs.q5_4 = 60;
  else if (humor === 'Positivo' || humor?.includes('feliz')) subs.q5_4 = 85;
  else if (humor?.includes('Muito positivo') || humor?.includes('excelente')) subs.q5_4 = 100;
  else subs.q5_4 = null;

  return subs;
}

function mentalScore(ans) {
  const s = mentalSubscores(ans);
  const pairs = Object.entries(MENTAL_PESOS).map(([k, w]) => ({ w, s: s[k] ?? 0 }));
  return weightedScore(pairs);
}

// ============== 6. HORMONAL =========================

const HORM_MALE_PESOS = { q6_2m: 0.55, q6_3m: 0.45 };
const HORM_FEMALE_PESOS = { q6_2f: 0.55, q6_3f: 0.45 };

function hormonalSubscores(ans) {
  const subs = {};
  const sexo = ans.sexo || ans.genero;

  if (sexo === 'Homem' || sexo === 'M' || sexo === 'masculino' || sexo === 'Masculino') {
    // 6.2 (homem) Redução de libido
    const libido = ans.q6_2m || ans.libido_homem || ans.libido;
    if (libido === 'Não' || libido === 'Alta' || libido === 'Normal') subs.q6_2m = 100;
    else if (libido === 'Moderada' || libido?.includes('Leve') || libido?.includes('levemente')) subs.q6_2m = 60;
    else if (libido === 'Baixa' || libido?.includes('Significativa') || libido?.includes('significativamente')) subs.q6_2m = 20;
    else subs.q6_2m = null;

    // 6.3 (homem) Fadiga/motivação ou Massa muscular
    const fadiga = ans.q6_3m || ans.fadiga_homem || ans.massa_muscular;
    if (fadiga === 'Não' || fadiga === 'Alta' || fadiga === 'Normal') subs.q6_3m = 100;
    else if (fadiga === 'Às vezes' || fadiga === 'Moderada') subs.q6_3m = 60;
    else if (fadiga === 'Frequentemente' || fadiga === 'Baixa') subs.q6_3m = 20;
    else subs.q6_3m = null;
  }

  else if (sexo === 'Mulher' || sexo === 'F' || sexo === 'feminino') {
    // 6.2 (mulher) Ciclo menstrual
    const ciclo = ans.q6_2f || ans.ciclo_mulher;
    if (ciclo?.includes('Muito regular')) subs.q6_2f = 100;
    else if (ciclo?.includes('Mais ou menos')) subs.q6_2f = 70;
    else if (ciclo?.includes('Irregular')) subs.q6_2f = 30;
    else subs.q6_2f = null;

    // 6.3 (mulher) TPM
    const tpm = ans.q6_3f || ans.tpm_mulher;
    if (tpm?.includes('Não') || tpm?.includes('leve')) subs.q6_3f = 100;
    else if (tpm?.includes('Moderado')) subs.q6_3f = 60;
    else if (tpm?.includes('Severo')) subs.q6_3f = 20;
    else subs.q6_3f = null;
  }

  return subs;
}

function hormonalScore(ans) {
  const s = hormonalSubscores(ans);
  const sexo = ans.sexo || ans.genero;

  if (sexo === 'Homem' || sexo === 'M' || sexo === 'masculino') {
    const pairs = Object.entries(HORM_MALE_PESOS).map(([k, w]) => ({ w, s: s[k] ?? 0 }));
    return weightedScore(pairs);
  }

  if (sexo === 'Mulher' || sexo === 'F' || sexo === 'feminino') {
    const pairs = Object.entries(HORM_FEMALE_PESOS).map(([k, w]) => ({ w, s: s[k] ?? 0 }));
    return weightedScore(pairs);
  }

  return null; // sexo não informado
}

// ============== 7. SINTOMAS (textarea) ==============

/**
 * Análise de sintomas gerais (texto livre)
 * Por enquanto retorna score neutro
 * TODO: Implementar análise de texto com palavras-chave
 */
function symptomsScore(ans) {
  const sintomas = ans.q7_1 || ans.sintomas_gerais || '';

  // Por enquanto retorna score baseado no comprimento do texto
  // Quanto mais sintomas descritos, pior o score
  if (!sintomas || sintomas.trim().length === 0) {
    return 100; // Sem sintomas = ótimo
  }

  const palavras = sintomas.trim().split(/\s+/).length;

  if (palavras < 10) return 90;        // Poucos sintomas
  else if (palavras < 30) return 70;   // Sintomas moderados
  else if (palavras < 100) return 50;  // Muitos sintomas
  else return 30;                      // Sintomas extensivos

  // TODO: Análise semântica com palavras-chave de gravidade
}

// ============== FUNÇÃO PRINCIPAL =================

/**
 * Calcula todos os scores do questionário
 * @param {Object} answers - Todas as respostas do questionário
 * @returns {Object} Scores de todas as categorias + detalhes
 */
function computeAllScores(answers) {
  // Calcular scores individuais
  const intro = introScore({
    pesoKg: answers.pesoKg || answers.peso,
    alturaCm: answers.alturaCm || answers.altura
  });

  const nutrition = nutritionScore(answers);
  const digestive = digestiveScore(answers);
  const physical = physicalScore(answers);
  const sleep = sleepScore(answers);
  const mental = mentalScore(answers);
  const hormonal = hormonalScore(answers);
  const symptoms = symptomsScore(answers);

  // Score geral de saúde (média das 7 categorias comportamentais)
  // INTRO (IMC) fica separado por ser antropométrico
  const healthScores = [nutrition, digestive, physical, sleep, mental, hormonal, symptoms]
    .filter(v => typeof v === 'number' && !isNaN(v));

  const overall = healthScores.length > 0
    ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
    : null;

  // Determinar severity_level baseado no score geral
  let severityLevel = 'low';
  if (overall !== null) {
    // Invertido: 0-100 onde 100 é o melhor
    // Para severity: quanto MAIOR o score, MENOR o risco
    if (overall <= 40) severityLevel = 'high';      // Score baixo = alto risco
    else if (overall <= 70) severityLevel = 'moderate';
    else severityLevel = 'low';                     // Score alto = baixo risco
  }

  return {
    // Scores individuais (0-100, onde 100 = melhor)
    intro_score: intro,
    nutrition_score: nutrition,
    digestive_score: digestive,
    physical_score: physical,
    sleep_score: sleep,
    mental_score: mental,
    hormonal_score: hormonal,
    symptoms_score: symptoms,

    // Score geral e severidade
    total_score: overall,              // Usado como "overall_health_score"
    severity_level: severityLevel,     // low, moderate, high

    // Detalhes granulares (subscores)
    details: {
      nutricao: nutricaoSubscores(answers),
      digestiva: digestivaSubscores(answers),
      fisica: fisicaSubscores(answers),
      sono: sonoSubscores(answers),
      mental: mentalSubscores(answers),
      hormonal: hormonalSubscores(answers)
    }
  };
}

// Exportar funções
module.exports = {
  computeAllScores,
  // Funções individuais (caso precise usar separadamente)
  introScore,
  nutritionScore,
  digestiveScore,
  physicalScore,
  sleepScore,
  mentalScore,
  hormonalScore,
  symptomsScore
};
