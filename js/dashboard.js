// =============================================
// DASHBOARD.JS - OCEA SUPPLEMENTS
// Lógica do Dashboard e Mapa de Saúde SVG Dinâmico
// =============================================

// =============================================
// INICIALIZAÇÃO
// =============================================

async function init() {
    // Verificar autenticação
    if (!API.Auth.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    // Carregar dados do usuário
    await loadUserData();

    // Carregar último diagnóstico
    await loadLastDiagnostic();

    // Carregar histórico
    await loadHistory();
}

// =============================================
// CARREGAR DADOS DO USUÁRIO
// =============================================

async function loadUserData() {
    try {
        const response = await API.Auth.getCurrentUser();

        if (response.success && response.data) {
            const user = response.data;
            const firstName = user.name.split(' ')[0];

            // Atualizar sidebar
            document.getElementById('user-name-sidebar').textContent = `Olá, ${firstName}!`;
            document.getElementById('user-email-sidebar').textContent = user.email;
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        document.getElementById('user-name-sidebar').textContent = 'Olá!';
    }
}

// =============================================
// CARREGAR ÚLTIMO DIAGNÓSTICO
// =============================================

async function loadLastDiagnostic() {
    const diagnosticContent = document.getElementById('diagnostic-content');

    try {
        const response = await API.Diagnostics.getCurrent();

        if (response.success && response.data) {
            // Pegar o diagnóstico atual
            const lastDiagnostic = response.data;

            // Atualizar seção "Sua OCEA" com dados do diagnóstico
            updateOceaSection(lastDiagnostic);

            // Renderizar diagnóstico
            diagnosticContent.innerHTML = `
                <div class="diagnostic-score-container">
                    <div class="score-circle">
                        <span class="score-number">${lastDiagnostic.total_score}</span>
                        <span class="score-label">Score</span>
                    </div>
                    <div class="score-info">
                        <h3>Diagnóstico de ${new Date(lastDiagnostic.created_at).toLocaleDateString('pt-BR')}</h3>
                        <p><i class="bi bi-calendar me-2"></i>Realizado há ${getDaysAgo(lastDiagnostic.created_at)} dias</p>
                        <p><i class="bi bi-clipboard-data me-2"></i>ID do Diagnóstico: #${lastDiagnostic.id}</p>
                        <span class="severity-badge severity-${lastDiagnostic.severity_level}">
                            ${getSeverityLabel(lastDiagnostic.severity_level)}
                        </span>
                    </div>
                </div>

                <div class="mt-4 text-center">
                    <button class="btn-primary-action" onclick="window.location.href='/backend/questionario/resultado.html?diagnostic_id=${lastDiagnostic.id}'">
                        Ver Diagnóstico Completo <i class="bi bi-arrow-right ms-2"></i>
                    </button>
                </div>
            `;

            // Gerar mapa de saúde com os scores do diagnóstico
            generateHealthMap(lastDiagnostic);
            document.getElementById('health-map-section').style.display = 'block';

        } else {
            // Nenhum diagnóstico encontrado
            diagnosticContent.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-clipboard-x"></i>
                    <h3>Nenhum diagnóstico encontrado</h3>
                    <p>Faça seu primeiro questionário para receber um diagnóstico personalizado!</p>
                    <button class="btn-primary-action" onclick="window.location.href='/backend/questionario/intro.html'">
                        Fazer Primeiro Diagnóstico
                    </button>
                </div>
            `;
        }

    } catch (error) {
        console.error('Erro ao carregar diagnóstico:', error);
        diagnosticContent.innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Não foi possível carregar seu diagnóstico. Tente novamente mais tarde.
            </div>
        `;
    }
}

// =============================================
// GERAR MAPA DE SAÚDE SVG DINÂMICO
// =============================================

function generateHealthMap(diagnostic) {
    // Extrair scores do diagnóstico
    const categoryScores = extractCategoryScores(diagnostic);

    // Gerar SVG circular (donut chart)
    const svgContainer = document.getElementById('health-map-svg-container');
    const svg = createHealthMapSVG(categoryScores);
    svgContainer.innerHTML = svg;

    // Gerar lista de categorias
    const categoriesList = document.getElementById('health-categories-list');
    categoriesList.innerHTML = categoryScores.map(cat => `
        <div class="category-item category-${cat.level}">
            <div>
                <div class="category-name">${cat.icon} ${cat.name}</div>
            </div>
            <div class="category-score">${cat.score}%</div>
        </div>
    `).join('');
}

// =============================================
// EXTRAIR SCORES DO DIAGNÓSTICO
// =============================================

function extractCategoryScores(diagnostic) {
    // Detectar gênero para label hormonal
    const gender = diagnostic.questionnaire_data?.intro?.sexo ||
                  diagnostic.questionnaire_data?.intro?.genero ||
                  'Masculino';

    const categories = [
        { name: 'Nutrição', key: 'nutrition', icon: '🥗' },
        { name: 'Atividade Física', key: 'physical', icon: '💪' },
        { name: gender.toLowerCase() === 'feminino' ? 'Saúde Feminina' : 'Saúde Masculina', key: 'hormonal', icon: '⚖️' },
        { name: 'Digestão', key: 'digestive', icon: '🍽️' },
        { name: 'Sono', key: 'sleep', icon: '😴' },
        { name: 'Saúde Mental', key: 'mental', icon: '🧠' }
    ];

    return categories.map(cat => {
        const score = Math.round(diagnostic[`${cat.key}_score`] || 0);

        // Determinar nível (invertido: high = saudável, low = problema)
        let level = 'low'; // Vermelho
        if (score >= 70) {
            level = 'high'; // Verde
        } else if (score >= 50) {
            level = 'moderate'; // Amarelo
        }

        return {
            name: cat.name,
            icon: cat.icon,
            score: score,
            level: level
        };
    });
}

// =============================================
// CRIAR SVG DO MAPA DE SAÚDE (DONUT CHART)
// =============================================

function createHealthMapSVG(categories) {
    const size = 400;
    const center = size / 2;
    const radius = 150;
    const innerRadius = 100;

    // Cores por categoria
    const colors = [
        '#007C8C', // Nutrição - Turquesa
        '#97BC62', // Digestão - Verde
        '#FFB81C', // Física - Amarelo
        '#5CB85C', // Sono - Verde claro
        '#8B7355', // Mental - Marrom
        '#F0AD4E'  // Hormonal - Laranja
    ];

    let currentAngle = -90; // Começar no topo
    const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);

    const paths = categories.map((cat, index) => {
        const percentage = cat.score / totalScore;
        const angleSize = percentage * 360;

        const startAngle = currentAngle;
        const endAngle = currentAngle + angleSize;

        // Calcular path do arco
        const path = describeArc(center, center, radius, innerRadius, startAngle, endAngle);

        currentAngle = endAngle;

        return `
            <path
                d="${path}"
                fill="${colors[index]}"
                stroke="white"
                stroke-width="2"
                class="health-segment"
                data-category="${cat.name}"
                data-score="${cat.score}%">
                <title>${cat.name}: ${cat.score}%</title>
            </path>
        `;
    }).join('');

    // Adicionar texto central
    const centerText = `
        <text x="${center}" y="${center - 10}" text-anchor="middle" font-size="48" font-weight="bold" fill="#007C8C">
            ${Math.round(categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length)}
        </text>
        <text x="${center}" y="${center + 20}" text-anchor="middle" font-size="16" fill="#666">
            Score Médio
        </text>
    `;

    return `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <style>
                .health-segment {
                    transition: opacity 0.3s;
                    cursor: pointer;
                }
                .health-segment:hover {
                    opacity: 0.8;
                }
            </style>
            ${paths}
            ${centerText}
        </svg>
    `;
}

// =============================================
// HELPER: DESCREVER ARCO SVG
// =============================================

function describeArc(x, y, radius, innerRadius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
    const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "L", innerEnd.x, innerEnd.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
        "Z"
    ].join(" ");
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

// =============================================
// CARREGAR HISTÓRICO
// =============================================

async function loadHistory() {
    const historyList = document.getElementById('history-list');

    try {
        const response = await API.Diagnostics.getHistory();

        if (response.success && response.data && response.data.length > 0) {
            historyList.innerHTML = response.data.map((diagnostic, index) => `
                <div class="history-item">
                    <div class="history-item-info">
                        <h4>
                            <i class="bi bi-clipboard2-data me-2"></i>
                            Mapa de Saúde #${response.data.length - index}
                        </h4>
                        <p>
                            <i class="bi bi-calendar me-2"></i>
                            ${new Date(diagnostic.completed_at || diagnostic.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                        <p>
                            <strong>Score:</strong> ${diagnostic.total_score} |
                            <strong>Nível:</strong> ${getSeverityBadge(diagnostic.severity_level)}
                        </p>
                    </div>
                    <div class="history-item-action">
                        ${index === 0 ? `
                            <button class="btn-view" onclick="window.location.href='/backend/questionario/resultado.html'">
                                Ver Mapa Completo <i class="bi bi-arrow-right ms-2"></i>
                            </button>
                        ` : `
                            <span class="text-muted small">Histórico (somente scores)</span>
                        `}
                    </div>
                </div>
            `).join('');
        } else {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h3>Nenhum histórico ainda</h3>
                    <p>Seus diagnósticos aparecerão aqui após você completar o questionário.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        historyList.innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Não foi possível carregar o histórico. Tente novamente mais tarde.
            </div>
        `;
    }
}

// =============================================
// HELPERS
// =============================================

function getSeverityLabel(level) {
    const labels = {
        low: 'Baixo Risco',
        moderate: 'Risco Moderado',
        high: 'Alto Risco'
    };
    return labels[level] || 'N/A';
}

function getSeverityBadge(level) {
    const badges = {
        low: '<span class="badge bg-success">Baixo Risco</span>',
        moderate: '<span class="badge bg-warning text-dark">Risco Moderado</span>',
        high: '<span class="badge bg-danger">Alto Risco</span>'
    };
    return badges[level] || '<span class="badge bg-secondary">N/A</span>';
}

function getDaysAgo(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

function scrollToHistory() {
    document.getElementById('history-section').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        API.Auth.logout();
    }
}

// =============================================
// ATUALIZAR SEÇÃO "SUA OCEA"
// =============================================

function updateOceaSection(diagnostic) {
    // Extrair dados do questionário
    const intro = diagnostic.questionnaire_data?.intro || {};

    // Calcular idade se tiver data de nascimento
    let age = intro.idade || '--';
    if (intro.dataNascimento) {
        const birthDate = new Date(intro.dataNascimento);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
    }

    // Altura em metros
    let height = '--';
    if (intro.alturaCm || intro.altura) {
        const alturaCm = intro.alturaCm || intro.altura;
        height = (alturaCm / 100).toFixed(2);
    }

    // Peso em kg
    const weight = intro.pesoKg || intro.peso || '--';

    // Atualizar campos
    document.getElementById('user-age').textContent = age;
    document.getElementById('user-height').textContent = height;
    document.getElementById('user-weight').textContent = weight;

    // Data da última anamnese
    const anamneseDate = new Date(diagnostic.updated_at || diagnostic.created_at);
    document.getElementById('last-anamnese-date').textContent = anamneseDate.toLocaleDateString('pt-BR');

    // Gerar gauge do score
    generateScoreGauge(diagnostic.total_score);

    // Renderizar gráfico SVG do mapa de saúde
    try {
        generateOceaChart(diagnostic, 'ocea-chart-container');
    } catch (error) {
        console.error('Erro ao renderizar gráfico:', error);
        document.getElementById('ocea-chart-container').innerHTML = `
            <div class="alert alert-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Não foi possível carregar o gráfico do mapa de saúde.
            </div>
        `;
    }
}

// =============================================
// GERAR GAUGE DO SCORE
// =============================================

function generateScoreGauge(score) {
    const container = document.getElementById('score-gauge-container');

    // Determinar cor baseado no score
    let color = '#a3334d'; // Vermelho
    let label = 'Crítico';

    if (score >= 70) {
        color = '#007c8c'; // Turquesa
        label = 'Bom';
    } else if (score >= 50) {
        color = '#eccc69'; // Amarelo
        label = 'Regular';
    }

    // Calcular progresso do arco (semicírculo)
    const radius = 55;
    const circumference = Math.PI * radius; // Semicírculo
    const progress = (score / 100) * circumference;
    const dashOffset = circumference - progress;

    container.innerHTML = `
        <svg class="w-100" viewBox="0 0 140 80" style="overflow: visible;">
            <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${color}"></stop>
                    <stop offset="100%" stop-color="${color}"></stop>
                </linearGradient>
            </defs>
            <!-- Fundo do arco -->
            <path d="M 25 75 A 55 55 0 1 1 115 75" fill="none" stroke="#E0E0E0" stroke-width="14" stroke-linecap="round"></path>
            <!-- Progresso do arco -->
            <path d="M 25 75 A 55 55 0 1 1 115 75" fill="none" stroke="${color}" stroke-width="14"
                  stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" stroke-linecap="round"
                  style="transition: stroke-dashoffset 1s ease-in-out;"></path>
            <!-- Score -->
            <text x="70" y="52" text-anchor="middle" font-size="32" font-weight="bold" fill="#2D2D2D" font-family="Arial, sans-serif">${score}</text>
            <!-- Label -->
            <text x="70" y="70" text-anchor="middle" font-size="12" fill="#666" font-family="Arial, sans-serif">${label}</text>
        </svg>
    `;
}

// =============================================
// INICIAR AO CARREGAR PÁGINA
// =============================================

window.addEventListener('DOMContentLoaded', init);
