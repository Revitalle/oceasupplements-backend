#!/bin/bash

# Script de Deploy para Hostinger
# Uso: bash deploy-to-hostinger.sh

echo "🚀 Deploy para Hostinger - Sistema de Diagnóstico"
echo "=================================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está na pasta correta
if [ ! -f "server.js" ]; then
    echo -e "${RED}❌ Erro: Execute este script na pasta backend/${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Arquivos que serão enviados:${NC}"
echo ""
echo "Backend:"
echo "  ✓ server.js (modificado)"
echo "  ✓ middleware/diagnosticMonitor.js (novo)"
echo "  ✓ routes/analytics.js (novo)"
echo "  ✓ database/*.js (scripts de manutenção)"
echo ""
echo "Frontend:"
echo "  ✓ questionario/auto-save.js (novo)"
echo "  ✓ questionario/analytics.js (novo)"
echo "  ✓ questionario/*.html (8 arquivos modificados)"
echo ""

read -p "Continuar com o deploy? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Deploy cancelado."
    exit 1
fi

echo ""
echo -e "${GREEN}📦 Criando pacote de deploy...${NC}"

# Criar pasta temporária para o deploy
DEPLOY_DIR="deploy_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copiar arquivos do backend
echo "  Copiando backend..."
cp server.js "$DEPLOY_DIR/"
mkdir -p "$DEPLOY_DIR/middleware"
cp middleware/diagnosticMonitor.js "$DEPLOY_DIR/middleware/" 2>/dev/null || true
mkdir -p "$DEPLOY_DIR/routes"
cp routes/analytics.js "$DEPLOY_DIR/routes/"
mkdir -p "$DEPLOY_DIR/database"
cp database/cleanup-empty-diagnostics.js "$DEPLOY_DIR/database/"
cp database/cleanup-empty-diagnostics-auto.js "$DEPLOY_DIR/database/"
cp database/monitor-empty-diagnostics.js "$DEPLOY_DIR/database/"
cp database/create-analytics-table.js "$DEPLOY_DIR/database/"

# Copiar arquivos do frontend
echo "  Copiando frontend..."
mkdir -p "$DEPLOY_DIR/questionario"
cp questionario/auto-save.js "$DEPLOY_DIR/questionario/"
cp questionario/analytics.js "$DEPLOY_DIR/questionario/"
cp questionario/intro.html "$DEPLOY_DIR/questionario/"
cp questionario/1-nutricao.html "$DEPLOY_DIR/questionario/"
cp questionario/2-digestiva.html "$DEPLOY_DIR/questionario/"
cp questionario/3-fisica.html "$DEPLOY_DIR/questionario/"
cp questionario/4-sono.html "$DEPLOY_DIR/questionario/"
cp questionario/5-mental.html "$DEPLOY_DIR/questionario/"
cp questionario/6-hormonal.html "$DEPLOY_DIR/questionario/"
cp questionario/7-sintomas.html "$DEPLOY_DIR/questionario/"

# Copiar documentação
echo "  Copiando documentação..."
cp IMPROVEMENTS.md "$DEPLOY_DIR/" 2>/dev/null || true
cp QUICK-START.md "$DEPLOY_DIR/" 2>/dev/null || true
cp DEPLOY-CHECKLIST.md "$DEPLOY_DIR/" 2>/dev/null || true

echo -e "${GREEN}✅ Pacote criado: $DEPLOY_DIR/${NC}"
echo ""

# Criar arquivo ZIP
echo -e "${GREEN}📦 Criando arquivo ZIP...${NC}"
if command -v zip &> /dev/null; then
    zip -r "$DEPLOY_DIR.zip" "$DEPLOY_DIR" > /dev/null
    echo -e "${GREEN}✅ Arquivo criado: $DEPLOY_DIR.zip${NC}"
    echo ""
    echo -e "${YELLOW}📤 Próximos passos:${NC}"
    echo ""
    echo "1. Faça upload do arquivo $DEPLOY_DIR.zip para a Hostinger"
    echo "2. Extraia o arquivo na pasta do projeto"
    echo "3. Execute via SSH:"
    echo "   ${GREEN}cd /home/seu-usuario/backend${NC}"
    echo "   ${GREEN}node database/create-analytics-table.js${NC}"
    echo "4. Reinicie o servidor:"
    echo "   ${GREEN}pm2 restart app${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  Comando 'zip' não encontrado.${NC}"
    echo "   Você pode compactar manualmente a pasta: $DEPLOY_DIR"
fi

echo -e "${YELLOW}📋 Checklist pós-deploy:${NC}"
echo ""
echo "  [ ] Verificar se arquivos JS carregam (sem erro 404)"
echo "  [ ] Abrir console do navegador e verificar logs"
echo "  [ ] Testar auto-save preenchendo campos"
echo "  [ ] Dar refresh e verificar se dados são restaurados"
echo "  [ ] Preencher questionário completo"
echo "  [ ] Verificar se scores estão corretos"
echo "  [ ] Testar endpoint de monitoramento"
echo ""
echo -e "${GREEN}✨ Deploy preparado com sucesso!${NC}"
echo ""
echo "📚 Documentação completa: DEPLOY-CHECKLIST.md"
