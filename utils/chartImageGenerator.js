// =============================================
// CHART IMAGE GENERATOR
// Gera imagem PNG do gráfico de diagnóstico usando Puppeteer
// =============================================

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Gera imagem PNG do mapa de saúde
 * @param {Object} diagnostic - Objeto do diagnóstico com scores
 * @param {Number} userId - ID do usuário
 * @returns {String} - Caminho do arquivo gerado
 */
async function generateChartImage(diagnostic, userId) {
    let browser = null;

    try {
        console.log(`[Chart Generator] Iniciando geração de imagem para usuário ${userId}`);

        // Extrair dados do diagnóstico
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

        // Ler template HTML do gráfico
        const templatePath = path.join(__dirname, '../questionario/resultado-ocea.html');
        let htmlContent = await fs.readFile(templatePath, 'utf-8');

        // Substituir dados de exemplo pelos dados reais
        htmlContent = htmlContent.replace(
            /const diagnosticData = \{[\s\S]*?\};/,
            `const diagnosticData = ${JSON.stringify({
                total_score: totalScore,
                nutrition_score: diagnostic.nutrition_score,
                physical_score: diagnostic.physical_score,
                hormonal_score: diagnostic.hormonal_score,
                digestive_score: diagnostic.digestive_score,
                sleep_score: diagnostic.sleep_score,
                mental_score: diagnostic.mental_score,
                questionnaire_data: {
                    intro: {
                        sexo: gender
                    }
                }
            })};`
        );

        // Iniciar Puppeteer
        browser = await puppeteer.launch({
            headless: 'new',
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Definir tamanho da viewport para garantir qualidade da imagem
        await page.setViewport({
            width: 900,
            height: 750,
            deviceScaleFactor: 2 // Retina display para maior qualidade
        });

        // Carregar HTML
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });

        // Aguardar animações completarem (2 segundos)
        await page.waitForTimeout(2000);

        // Selecionar apenas o container do SVG
        const element = await page.$('#svg-container');

        if (!element) {
            throw new Error('Elemento #svg-container não encontrado no HTML');
        }

        // Definir caminho de saída (sobrescreve sempre com user-{userId}.png)
        const outputDir = path.join(__dirname, '../assets/images');
        await fs.mkdir(outputDir, { recursive: true });

        const outputPath = path.join(outputDir, `mapa-saude-user-${userId}.png`);

        // Capturar screenshot do elemento
        await element.screenshot({
            path: outputPath,
            omitBackground: false
        });

        console.log(`[Chart Generator] Imagem gerada com sucesso: ${outputPath}`);

        await browser.close();

        return `/assets/images/mapa-saude-user-${userId}.png`;

    } catch (error) {
        console.error('[Chart Generator] Erro ao gerar imagem:', error);

        if (browser) {
            await browser.close();
        }

        throw error;
    }
}

/**
 * Retorna cor baseada no score
 */
function getScoreColor(score) {
    if (score >= 70) return '#007c8c'; // Turquesa Ocea (bom)
    if (score >= 50) return '#eccc69'; // Amarelo (moderado)
    return '#a3334d'; // Vermelho (ruim)
}

module.exports = {
    generateChartImage
};
