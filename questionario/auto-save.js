/**
 * AUTO-SAVE MODULE
 * Sistema de salvamento automático para formulários do questionário
 *
 * Funcionalidades:
 * - Salva automaticamente no localStorage a cada mudança
 * - Debounce para evitar salvamentos excessivos
 * - Restaura dados ao carregar a página
 * - Tracking de progresso
 * - Alertas de dados não salvos antes de sair
 *
 * Uso:
 * <script src="auto-save.js"></script>
 * <script>
 *   AutoSave.init('intro'); // 'intro', 'nutricao', 'digestiva', etc.
 * </script>
 */

(function(window) {
  'use strict';

  const AutoSave = {
    // Configuração
    config: {
      debounceDelay: 1000, // 1 segundo
      storagePrefix: 'questionnaire_',
      enableConsoleLog: true,
      enableBeforeUnloadWarning: true
    },

    // Estado interno
    state: {
      currentSection: null,
      saveTimer: null,
      hasUnsavedChanges: false,
      lastSaveTime: null,
      formData: {}
    },

    /**
     * Inicializa o auto-save para uma seção específica
     */
    init: function(sectionName) {
      this.state.currentSection = sectionName;
      this.log(`🔧 Inicializando auto-save para seção: ${sectionName}`);

      // Carregar dados salvos anteriormente
      this.loadSavedData();

      // Configurar listeners
      this.setupFormListeners();
      this.setupBeforeUnloadWarning();
      this.setupVisibilityChange();

      // Mostrar status de última sincronização
      this.showLastSaveStatus();

      this.log('✅ Auto-save inicializado com sucesso');
    },

    /**
     * Configura listeners para todos os inputs do formulário
     */
    setupFormListeners: function() {
      const inputs = document.querySelectorAll('input, select, textarea');

      inputs.forEach(input => {
        // Eventos de mudança
        input.addEventListener('input', () => this.handleInputChange());
        input.addEventListener('change', () => this.handleInputChange());
      });

      this.log(`📝 Monitorando ${inputs.length} campos do formulário`);
    },

    /**
     * Handler para mudanças nos inputs
     */
    handleInputChange: function() {
      this.state.hasUnsavedChanges = true;

      // Cancelar timer anterior
      if (this.state.saveTimer) {
        clearTimeout(this.state.saveTimer);
      }

      // Agendar salvamento com debounce
      this.state.saveTimer = setTimeout(() => {
        this.saveFormData();
      }, this.config.debounceDelay);
    },

    /**
     * Salva os dados do formulário no localStorage
     */
    saveFormData: function() {
      const formData = this.collectFormData();
      const storageKey = this.getStorageKey();

      try {
        // Buscar dados existentes do questionário completo
        const existingData = JSON.parse(localStorage.getItem('questionnaire_data') || '{}');

        // Atualizar apenas a seção atual
        existingData[this.state.currentSection] = formData;

        // Salvar de volta
        localStorage.setItem('questionnaire_data', JSON.stringify(existingData));

        // Salvar timestamp de backup
        localStorage.setItem(storageKey + '_timestamp', new Date().toISOString());

        this.state.hasUnsavedChanges = false;
        this.state.lastSaveTime = new Date();

        this.log(`💾 Dados salvos automaticamente: ${Object.keys(formData).length} campos`);
        this.showSaveNotification();

      } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
        this.showErrorNotification();
      }
    },

    /**
     * Coleta todos os dados do formulário atual
     */
    collectFormData: function() {
      const formData = {};
      const inputs = document.querySelectorAll('input, select, textarea');

      inputs.forEach(input => {
        const name = input.name || input.id;
        if (!name) return;

        if (input.type === 'checkbox') {
          formData[name] = input.checked;
        } else if (input.type === 'radio') {
          if (input.checked) {
            formData[name] = input.value;
          }
        } else {
          formData[name] = input.value;
        }
      });

      return formData;
    },

    /**
     * Carrega dados salvos anteriormente
     */
    loadSavedData: function() {
      try {
        const existingData = JSON.parse(localStorage.getItem('questionnaire_data') || '{}');
        const sectionData = existingData[this.state.currentSection];

        if (sectionData && Object.keys(sectionData).length > 0) {
          this.restoreFormData(sectionData);
          this.log(`📂 Dados carregados: ${Object.keys(sectionData).length} campos`);
          this.showRestoreNotification(Object.keys(sectionData).length);
        } else {
          this.log('ℹ️  Nenhum dado salvo encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados salvos:', error);
      }
    },

    /**
     * Restaura dados nos campos do formulário
     */
    restoreFormData: function(data) {
      Object.keys(data).forEach(name => {
        const input = document.querySelector(`[name="${name}"], #${name}`);
        if (!input) return;

        const value = data[name];

        if (input.type === 'checkbox') {
          input.checked = value;
        } else if (input.type === 'radio') {
          if (input.value === value) {
            input.checked = true;
          }
        } else {
          input.value = value;
        }

        // Trigger change event para atualizar UI
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
    },

    /**
     * Configura aviso antes de sair da página com dados não salvos
     */
    setupBeforeUnloadWarning: function() {
      if (!this.config.enableBeforeUnloadWarning) return;

      window.addEventListener('beforeunload', (e) => {
        // Forçar salvamento final antes de sair
        if (this.state.hasUnsavedChanges) {
          this.saveFormData();
        }
      });
    },

    /**
     * Salva quando usuário troca de aba
     */
    setupVisibilityChange: function() {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.state.hasUnsavedChanges) {
          this.saveFormData();
          this.log('💾 Auto-save acionado ao trocar de aba');
        }
      });
    },

    /**
     * Mostra status da última sincronização
     */
    showLastSaveStatus: function() {
      const storageKey = this.getStorageKey();
      const timestamp = localStorage.getItem(storageKey + '_timestamp');

      if (timestamp) {
        const lastSave = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastSave) / 60000);

        if (diffMinutes < 60) {
          this.log(`⏰ Último salvamento: há ${diffMinutes} minuto(s)`);
        }
      }
    },

    /**
     * Mostra notificação visual de salvamento
     */
    showSaveNotification: function() {
      this.showToast('💾 Dados salvos automaticamente', 'success');
    },

    /**
     * Mostra notificação de dados restaurados
     */
    showRestoreNotification: function(fieldCount) {
      this.showToast(`📂 ${fieldCount} campos restaurados`, 'info');
    },

    /**
     * Mostra notificação de erro
     */
    showErrorNotification: function() {
      this.showToast('❌ Erro ao salvar dados', 'error');
    },

    /**
     * Sistema de toast simples
     */
    showToast: function(message, type = 'info') {
      // Remover toast anterior se existir
      const existingToast = document.getElementById('autosave-toast');
      if (existingToast) {
        existingToast.remove();
      }

      // Criar toast
      const toast = document.createElement('div');
      toast.id = 'autosave-toast';
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      document.body.appendChild(toast);

      // Fade in
      setTimeout(() => toast.style.opacity = '1', 10);

      // Fade out e remover
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    },

    /**
     * Retorna a chave de armazenamento para a seção atual
     */
    getStorageKey: function() {
      return this.config.storagePrefix + this.state.currentSection;
    },

    /**
     * Logger condicional
     */
    log: function(message) {
      if (this.config.enableConsoleLog) {
        console.log(`[AutoSave] ${message}`);
      }
    },

    /**
     * Limpa dados salvos de uma seção (útil para testes)
     */
    clearSavedData: function() {
      const storageKey = this.getStorageKey();
      localStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey + '_timestamp');
      this.log('🗑️  Dados salvos removidos');
    },

    /**
     * Retorna estatísticas de uso
     */
    getStats: function() {
      const data = this.collectFormData();
      return {
        section: this.state.currentSection,
        fieldCount: Object.keys(data).length,
        hasUnsavedChanges: this.state.hasUnsavedChanges,
        lastSaveTime: this.state.lastSaveTime,
        storageUsed: new Blob([JSON.stringify(data)]).size
      };
    }
  };

  // Exportar para uso global
  window.AutoSave = AutoSave;

})(window);
