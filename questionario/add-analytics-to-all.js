/**
 * Script Node.js para adicionar analytics a todas as páginas HTML do questionário
 * Adiciona os scripts de analytics antes do auto-save
 *
 * Uso: node add-analytics-to-all.js
 */

const fs = require('fs');
const path = require('path');

// Mapeamento de arquivos para nomes de seções
const files = [
  { file: 'intro.html', section: 'intro' },
  { file: '1-nutricao.html', section: 'nutricao' },
  { file: '2-digestiva.html', section: 'digestiva' },
  { file: '3-fisica.html', section: 'fisica' },
  { file: '4-sono.html', section: 'sono' },
  { file: '5-mental.html', section: 'mental' },
  { file: '6-hormonal.html', section: 'hormonal' },
  { file: '7-sintomas.html', section: 'sintomas' }
];

const analyticsSnippet = (section) => `
    <!-- Analytics Module -->
    <script src="analytics.js"></script>
    <script>
        // Inicializar analytics para esta página
        Analytics.init('${section}');
    </script>

    <!-- Auto-Save Module -->`;

function addAnalyticsToFile(fileName, sectionName) {
  const filePath = path.join(__dirname, fileName);

  try {
    // Ler conteúdo do arquivo
    let content = fs.readFileSync(filePath, 'utf8');

    // Verificar se já tem analytics
    if (content.includes('analytics.js')) {
      console.log(`⏭️  ${fileName} - já possui analytics, pulando...`);
      return false;
    }

    // Verificar se tem auto-save
    if (!content.includes('auto-save.js')) {
      console.log(`⚠️  ${fileName} - não possui auto-save, adicionando analytics antes de </body>`);

      const snippetBeforeBody = `
    <!-- Analytics Module -->
    <script src="analytics.js"></script>
    <script>
        // Inicializar analytics para esta página
        Analytics.init('${sectionName}');
    </script>

</body>`;
      content = content.replace('</body>', snippetBeforeBody);
    } else {
      // Adicionar antes do auto-save
      content = content.replace('<!-- Auto-Save Module -->', analyticsSnippet(sectionName));
    }

    // Salvar arquivo
    fs.writeFileSync(filePath, content, 'utf8');

    console.log(`✅ ${fileName} - analytics adicionado com sucesso`);
    return true;

  } catch (error) {
    console.error(`❌ ${fileName} - erro:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Adicionando analytics a todas as páginas do questionário...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  files.forEach(({ file, section }) => {
    const result = addAnalyticsToFile(file, section);
    if (result === true) successCount++;
    else if (result === false) skipCount++;
    else errorCount++;
  });

  console.log('\n📊 Resumo:');
  console.log(`   ✅ Adicionados: ${successCount}`);
  console.log(`   ⏭️  Pulados: ${skipCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log('\n✨ Concluído!\n');
}

// Executar
main();
