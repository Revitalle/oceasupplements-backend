/**
 * Script Node.js para adicionar auto-save a todas as páginas HTML do questionário
 * Adiciona os scripts de auto-save antes do </body> de cada arquivo
 *
 * Uso: node add-autosave-to-all.js
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

const autoSaveSnippet = (section) => `
    <!-- Auto-Save Module -->
    <script src="auto-save.js"></script>
    <script>
        // Inicializar auto-save para esta página
        AutoSave.init('${section}');
    </script>

</body>`;

function addAutoSaveToFile(fileName, sectionName) {
  const filePath = path.join(__dirname, fileName);

  try {
    // Ler conteúdo do arquivo
    let content = fs.readFileSync(filePath, 'utf8');

    // Verificar se já tem auto-save
    if (content.includes('auto-save.js')) {
      console.log(`⏭️  ${fileName} - já possui auto-save, pulando...`);
      return false;
    }

    // Substituir </body> pelo snippet + </body>
    const updatedContent = content.replace('</body>', autoSaveSnippet(sectionName));

    // Salvar arquivo
    fs.writeFileSync(filePath, updatedContent, 'utf8');

    console.log(`✅ ${fileName} - auto-save adicionado com sucesso`);
    return true;

  } catch (error) {
    console.error(`❌ ${fileName} - erro:`, error.message);
    return false;
  }
}

function main() {
  console.log('🚀 Adicionando auto-save a todas as páginas do questionário...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  files.forEach(({ file, section }) => {
    const result = addAutoSaveToFile(file, section);
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
