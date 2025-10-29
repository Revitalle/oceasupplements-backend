/**
 * Script para atualizar TODOS os links do questionário
 * De: /questionario/ → Para: /backend/questionario/
 *
 * Uso: node atualizar-links.js
 */

const fs = require('fs');
const path = require('path');

const arquivos = [
  'questionario/intro.html',
  'questionario/1-nutricao.html',
  'questionario/2-digestiva.html',
  'questionario/3-fisica.html',
  'questionario/4-sono.html',
  'questionario/5-mental.html',
  'questionario/6-hormonal.html',
  'questionario/7-sintomas.html',
  'questionario/processando.html',
  'questionario/resultados.html'
];

console.log('🔗 Atualizando links do questionário...\n');

let totalArquivos = 0;
let totalSubstituicoes = 0;

arquivos.forEach(arquivo => {
  const caminhoCompleto = path.join(__dirname, arquivo);

  if (!fs.existsSync(caminhoCompleto)) {
    console.log(`⚠️  ${arquivo} - não encontrado, pulando...`);
    return;
  }

  try {
    let conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
    const conteudoOriginal = conteudo;

    // Substituir todos os links /questionario/ por /backend/questionario/
    // Mas NÃO substituir caminhos de imagens (/assets/images/questionario/)

    // 1. Links de navegação (window.location.href)
    conteudo = conteudo.replace(
      /window\.location\.href = '\/questionario\//g,
      "window.location.href = '/backend/questionario/"
    );

    // 2. Links de formulários e ações
    conteudo = conteudo.replace(
      /action="\/questionario\//g,
      'action="/backend/questionario/'
    );

    // 3. Links href em âncoras
    conteudo = conteudo.replace(
      /href="\/questionario\//g,
      'href="/backend/questionario/'
    );

    // 4. Fetch e axios URLs
    conteudo = conteudo.replace(
      /fetch\(['"]\/questionario\//g,
      "fetch('/backend/questionario/"
    );

    // Contar substituições
    const substituicoes = conteudoOriginal !== conteudo ? 1 : 0;

    if (substituicoes > 0) {
      // Fazer backup
      fs.writeFileSync(caminhoCompleto + '.backup-links', conteudoOriginal);

      // Salvar com links atualizados
      fs.writeFileSync(caminhoCompleto, conteudo, 'utf8');

      console.log(`✅ ${arquivo} - atualizado`);
      totalArquivos++;

      // Contar quantas vezes foi substituído
      const matches = (conteudoOriginal.match(/\/questionario\//g) || []).length;
      const matchesDepois = (conteudo.match(/\/questionario\//g) || []).length;
      const substituidas = matches - matchesDepois;

      if (substituidas > 0) {
        console.log(`   📝 ${substituidas} links atualizados`);
        totalSubstituicoes += substituidas;
      }
    } else {
      console.log(`⏭️  ${arquivo} - nenhuma alteração necessária`);
    }

  } catch (error) {
    console.error(`❌ ${arquivo} - erro:`, error.message);
  }
});

console.log('\n📊 Resumo:');
console.log(`   ✅ Arquivos atualizados: ${totalArquivos}`);
console.log(`   🔗 Total de links atualizados: ${totalSubstituicoes}`);
console.log('\n✨ Concluído!\n');
console.log('⚠️  IMPORTANTE: Backups criados com extensão .backup-links');
console.log('   Se algo der errado, você pode restaurar os arquivos originais.\n');
