// =============================================
// OCEA CHART GENERATOR
// Gerador do gráfico de mapa de saúde (SVG)
// =============================================

function generateOceaChart(diagnostic, containerId) {
    const svgNS = "http://www.w3.org/2000/svg";

    // Extrair dados
    const gender = diagnostic.questionnaire_data?.intro?.sexo || 'Masculino';
    const totalScore = diagnostic.total_score || 50;

    const scores = [
        { label: 'NUTRIÇÃO', score: diagnostic.nutrition_score, color: getScoreColor(diagnostic.nutrition_score) },
        { label: 'EXERCÍCIO', score: diagnostic.physical_score, color: getScoreColor(diagnostic.physical_score) },
        { label: gender.toLowerCase() === 'feminino' ? 'FEMININA' : 'MASCULINO', score: diagnostic.hormonal_score, color: getScoreColor(diagnostic.hormonal_score) },
        { label: 'DIGESTÃO', score: diagnostic.digestive_score, color: getScoreColor(diagnostic.digestive_score) },
        { label: 'SONO', score: diagnostic.sleep_score, color: getScoreColor(diagnostic.sleep_score) },
        { label: 'MENTAL', score: diagnostic.mental_score, color: getScoreColor(diagnostic.mental_score) }
    ];

    // Criar SVG
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 800 700');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Adicionar elementos
    svg.innerHTML = createDefs() + createSlices(scores) + createGotas(scores) +
                    createCenterCircles() + createLabels(scores) + createCenterContent(totalScore) + createLegend();

    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Limpar container
    container.appendChild(svg);
}

function getScoreColor(score) {
    if (score >= 70) return '#007c8c'; // Turquesa Ocea (bom)
    if (score >= 50) return '#eccc69'; // Amarelo (moderado)
    return '#a3334d'; // Vermelho (ruim)
}

function createDefs() {
    return `
        <defs>
            <radialGradient id="chart-bg" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stop-color="#000" stop-opacity="0.8"></stop>
                <stop offset="70%" stop-color="#000" stop-opacity="0"></stop>
            </radialGradient>

            <filter id="slice-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000" flood-opacity="0.25"></feDropShadow>
            </filter>

            <filter id="rect-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#000" flood-opacity="0.3"></feDropShadow>
            </filter>

            <filter id="gota-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="8" flood-color="#000" flood-opacity="0.3"></feDropShadow>
            </filter>

            <mask id="donut-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" fill-opacity="0.95"></rect>
                <circle cx="400" cy="400" r="200" fill="black"></circle>
            </mask>

            <filter id="inner-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feFlood flood-color="black" flood-opacity="0.6" result="flood"></feFlood>
                <feComposite in="flood" in2="SourceAlpha" operator="in" result="shadow"></feComposite>
                <feOffset dx="0" dy="2" result="offset"></feOffset>
                <feGaussianBlur in="offset" stdDeviation="2" result="blur"></feGaussianBlur>
                <feComposite in="blur" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="inner"></feComposite>
                <feComposite in="inner" in2="SourceGraphic" operator="over"></feComposite>
            </filter>

            <pattern id="logo-pattern" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
                <image href="/assets/images/logo-ocea-circular-verde.png" x="220" y="220" width="360" height="360"></image>
            </pattern>

            ${createArcLabelPaths()}
        </defs>
    `;
}

function createArcLabelPaths() {
    const paths = [
        'M 213.80453818634567 507.5 A 215 215 0 0 1 188.26633310237528 362.6656418016099',
        'M 188.26633310237528 362.6656418016099 A 215 215 0 0 1 261.800663917394 235.30044472941975',
        'M 261.800663917394 235.30044472941975 A 215 215 0 0 1 399.99999999999994 185',
        'M 399.99999999999994 185 A 215 215 0 0 1 538.1993360826059 235.3004447294197',
        'M 538.1993360826059 235.3004447294197 A 215 215 0 0 1 611.7336668976247 362.66564180161',
        'M 611.7336668976247 362.66564180161 A 215 215 0 0 1 586.1954618136543 507.5'
    ];

    return paths.map((d, i) => `<path id="arc-label-${i}" d="${d}" fill="none"></path>`).join('');
}

function createSlices(scores) {
    const slices = [
        'M 400 400 L 88.23085463760208 580 A 360 360 0 0 1 45.46920891560512 337.48665603990503 Z',
        'M 400 400 L 45.46920891560512 337.48665603990503 A 360 360 0 0 1 168.5964605128458 124.22400047716798 Z',
        'M 400 400 L 168.5964605128458 124.22400047716798 A 360 360 0 0 1 399.99999999999994 40 Z',
        'M 400 400 L 399.99999999999994 40 A 360 360 0 0 1 631.4035394871541 124.22400047716786 Z',
        'M 400 400 L 631.4035394871541 124.22400047716786 A 360 360 0 0 1 754.5307910843949 337.4866560399051 Z',
        'M 400 400 L 754.5307910843949 337.4866560399051 A 360 360 0 0 1 711.7691453623979 580 Z',
        'M 400 400 L 711.769145362398 579.9999999999998 A 360 360 0 0 1 523.127251597241 738.2893434829269 Z',
        'M 400 400 L 523.1272515972407 738.289343482927 A 360 360 0 0 1 276.8727484027595 738.289343482927 Z',
        'M 400 400 L 276.8727484027595 738.289343482927 A 360 360 0 0 1 88.23085463760236 580.0000000000005 Z'
    ];

    return slices.map((d, i) => {
        const color = i < 6 ? scores[i].color : '#06a4be';
        const className = i < 6 ? 'slice-animate slice-' + i : '';
        return `<path d="${d}" filter="url(#slice-shadow)" fill="${color}" class="${className}"></path>`;
    }).join('');
}

function createGotas(scores) {
    const positions = [
        { cx: 75.01344150597134, cy: 457.303898630087 },
        { cx: 114.21161675113524, cy: 234.99999999999997 },
        { cx: 287.13335270252935, cy: 89.90143514065022 },
        { cx: 512.8666472974705, cy: 89.90143514065016 },
        { cx: 685.7883832488649, cy: 235.0000000000001 },
        { cx: 724.9865584940287, cy: 457.30389863008685 }
    ];

    return positions.map((pos, i) => {
        const dx = 400 - pos.cx;
        const dy = 400 - pos.cy;
        const rotationAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

        const gotaPath = `
            M ${pos.cx} ${pos.cy - 70}
            C ${pos.cx - 15} ${pos.cy - 55}, ${pos.cx - 50} ${pos.cy - 20}, ${pos.cx - 50} ${pos.cy + 20}
            C ${pos.cx - 50} ${pos.cy + 55}, ${pos.cx - 30} ${pos.cy + 70}, ${pos.cx} ${pos.cy + 70}
            C ${pos.cx + 30} ${pos.cy + 70}, ${pos.cx + 50} ${pos.cy + 55}, ${pos.cx + 50} ${pos.cy + 20}
            C ${pos.cx + 50} ${pos.cy - 20}, ${pos.cx + 15} ${pos.cy - 55}, ${pos.cx} ${pos.cy - 70}
            Z
        `;

        return `
            <g class="gota-${i} slice-animate">
                <g transform="rotate(${rotationAngle} ${pos.cx} ${pos.cy})">
                    <path d="${gotaPath}" fill="${scores[i].color}" fill-opacity="0.64" filter="url(#gota-shadow)"></path>
                </g>
                <text x="${pos.cx}" y="${pos.cy + 10}" text-anchor="middle" font-size="46" fill="white" font-weight="bold" font-family="Open Sans" letter-spacing="-1">
                    ${scores[i].score}<tspan font-size="22">%</tspan>
                </text>
            </g>
        `;
    }).join('');
}

function createCenterCircles() {
    return `
        <circle cx="400" cy="400" r="0" fill="url(#chart-bg)" pointer-events="none">
            <animate attributeName="r" from="0" to="360" dur="0.6s" fill="freeze" begin="1s"></animate>
        </circle>
        <circle cx="400" cy="400" r="0" fill="white" fill-opacity="0.95">
            <animate attributeName="r" from="0" to="180" dur="0.6s" fill="freeze" begin="1s"></animate>
        </circle>
        <circle cx="400" cy="400" r="0" fill="white" fill-opacity="0.95" mask="url(#donut-mask)">
            <animate attributeName="r" from="0" to="250" dur="0.6s" fill="freeze" begin="1s"></animate>
        </circle>
        <circle cx="400" cy="400" r="0" fill="url(#logo-pattern)">
            <animate attributeName="r" from="0" to="180" dur="0.6s" fill="freeze" begin="1s"></animate>
        </circle>
    `;
}

function createLabels(scores) {
    return scores.map((score, i) => `
        <text font-size="22" font-weight="900" font-family="Open Sans" fill="${score.color}" filter="url(#inner-shadow)" class="logo logo-animate">
            <textPath href="#arc-label-${i}" startOffset="50%" text-anchor="middle">${score.label}</textPath>
        </text>
    `).join('');
}

function createCenterContent(totalScore) {
    return `
        <text x="400" y="300" text-anchor="middle" font-size="60" font-weight="900" font-family="brandon-grotesque" fill="#2c2c2c" class="logo logo-animate">MAPA</text>
        <text x="400" y="335" text-anchor="middle" font-size="34" font-weight="300" font-family="brandon-grotesque" fill="#2c2c2c" class="logo logo-animate">DA SUA SAÚDE</text>
        <text x="400" y="430" text-anchor="middle" font-size="110" font-weight="900" font-family="brandon-grotesque" fill="#2c2c2c" class="logo logo-animate">${totalScore}</text>
    `;
}

function createLegend() {
    return `
        <rect x="40" y="610" width="720" height="60" rx="30" ry="30" fill="#FFF" fill-opacity="0.95" filter="url(#rect-shadow)" class="glass"></rect>
        <rect x="60" y="630" width="22" height="22" rx="90" ry="90" fill="#007c8c"></rect>
        <text x="165" y="647" text-anchor="middle" font-size="19" fill="#4c4748" font-weight="900" font-family="Open Sans">ÁREA SAUDÁVEL</text>
        <rect x="270" y="630" width="22" height="22" rx="90" ry="90" fill="#eccc69"></rect>
        <text x="400" y="647" text-anchor="middle" font-size="19" fill="#4c4748" font-weight="900" font-family="Open Sans">PRECISA MELHORAR</text>
        <rect x="525" y="630" width="22" height="22" rx="90" ry="90" fill="#a3334d"></rect>
        <text x="650" y="647" text-anchor="middle" font-size="19" fill="#4c4748" font-weight="900" font-family="Open Sans">ATENÇÃO IMEDIATA</text>
    `;
}
