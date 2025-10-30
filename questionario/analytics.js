/**
 * ANALYTICS MODULE
 * Sistema de rastreamento de eventos e abandono de páginas do questionário
 *
 * Funcionalidades:
 * - Tracking de visualizações de página
 * - Tracking de tempo gasto em cada seção
 * - Detecção de abandono (exit sem completar)
 * - Tracking de navegação (próximo/voltar)
 * - Envio de eventos para backend
 * - Relatórios de funil de conversão
 *
 * Uso:
 * <script src="analytics.js"></script>
 * <script>
 *   Analytics.init('intro'); // Nome da página atual
 * </script>
 */

(function(window) {
  'use strict';

  const Analytics = {
    // Configuração
    config: {
      apiEndpoint: 'https://web-production-f401a.up.railway.app/api/v1/analytics/events',
      enableConsoleLog: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutos
      sendInterval: 5000, // Enviar eventos a cada 5 segundos
      enableBeaconAPI: true // Usar navigator.sendBeacon quando disponível
    },

    // Estado
    state: {
      currentPage: null,
      sessionId: null,
      pageStartTime: null,
      events: [],
      sendTimer: null,
      isPageVisible: true
    },

    /**
     * Inicializa o analytics para uma página
     */
    init: function(pageName) {
      this.state.currentPage = pageName;
      this.state.sessionId = this.getOrCreateSessionId();
      this.state.pageStartTime = Date.now();

      this.log(`📊 Analytics inicializado para página: ${pageName}`);

      // Registrar visualização de página
      this.trackPageView(pageName);

      // Configurar listeners de eventos
      this.setupEventListeners();

      // Iniciar envio periódico
      this.startPeriodicSend();

      this.log('✅ Analytics pronto');
    },

    /**
     * Obtém ou cria um session ID único
     */
    getOrCreateSessionId: function() {
      let sessionId = sessionStorage.getItem('analytics_session_id');

      if (!sessionId) {
        sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('analytics_session_id', sessionId);
        sessionStorage.setItem('analytics_session_start', Date.now());
      }

      return sessionId;
    },

    /**
     * Registra visualização de página
     */
    trackPageView: function(pageName) {
      this.trackEvent('page_view', {
        page: pageName,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      });
    },

    /**
     * Registra um evento genérico
     */
    trackEvent: function(eventType, data = {}) {
      const event = {
        session_id: this.state.sessionId,
        event_type: eventType,
        page: this.state.currentPage,
        timestamp: new Date().toISOString(),
        data: data
      };

      this.state.events.push(event);
      this.log(`📝 Evento registrado: ${eventType}`, data);

      // Salvar no localStorage também (backup)
      this.saveToLocalStorage(event);
    },

    /**
     * Registra clique em botão
     */
    trackButtonClick: function(buttonName) {
      this.trackEvent('button_click', {
        button: buttonName,
        time_on_page: this.getTimeOnPage()
      });
    },

    /**
     * Registra navegação para próxima página
     */
    trackNavigation: function(direction, targetPage) {
      this.trackEvent('navigation', {
        direction: direction, // 'next' ou 'back'
        target_page: targetPage,
        time_on_page: this.getTimeOnPage()
      });
    },

    /**
     * Registra abandono de página
     */
    trackPageAbandon: function() {
      this.trackEvent('page_abandon', {
        time_on_page: this.getTimeOnPage(),
        scroll_depth: this.getScrollDepth(),
        form_completion: this.getFormCompletionRate()
      });

      // Enviar imediatamente
      this.sendEvents(true);
    },

    /**
     * Registra interação com formulário
     */
    trackFormInteraction: function(fieldName) {
      this.trackEvent('form_interaction', {
        field: fieldName,
        time_on_page: this.getTimeOnPage()
      });
    },

    /**
     * Registra erro
     */
    trackError: function(errorMessage, errorDetails = {}) {
      this.trackEvent('error', {
        message: errorMessage,
        ...errorDetails
      });

      // Enviar imediatamente para capturar erro
      this.sendEvents(true);
    },

    /**
     * Configura listeners de eventos da página
     */
    setupEventListeners: function() {
      // Abandono de página (beforeunload)
      window.addEventListener('beforeunload', () => {
        this.trackPageAbandon();
      });

      // Visibilidade da página
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.state.isPageVisible = false;
          this.trackEvent('page_hidden', {
            time_on_page: this.getTimeOnPage()
          });
        } else {
          this.state.isPageVisible = true;
          this.trackEvent('page_visible', {
            time_on_page: this.getTimeOnPage()
          });
        }
      });

      // Scroll depth
      let maxScroll = 0;
      window.addEventListener('scroll', () => {
        const scrollDepth = this.getScrollDepth();
        if (scrollDepth > maxScroll) {
          maxScroll = scrollDepth;

          // Registrar marcos de scroll (25%, 50%, 75%, 100%)
          if (scrollDepth >= 25 && maxScroll < 25) {
            this.trackEvent('scroll_depth', { depth: 25 });
          } else if (scrollDepth >= 50 && maxScroll < 50) {
            this.trackEvent('scroll_depth', { depth: 50 });
          } else if (scrollDepth >= 75 && maxScroll < 75) {
            this.trackEvent('scroll_depth', { depth: 75 });
          } else if (scrollDepth >= 100 && maxScroll < 100) {
            this.trackEvent('scroll_depth', { depth: 100 });
          }
        }
      });

      // Cliques em botões
      document.addEventListener('click', (e) => {
        const button = e.target.closest('button, .btn, a');
        if (button) {
          const buttonText = button.textContent.trim() || button.getAttribute('aria-label') || 'unknown';
          this.trackButtonClick(buttonText);
        }
      });

      // Interações com formulário
      document.querySelectorAll('input, select, textarea').forEach(field => {
        let interacted = false;
        field.addEventListener('focus', () => {
          if (!interacted) {
            interacted = true;
            const fieldName = field.name || field.id || 'unknown';
            this.trackFormInteraction(fieldName);
          }
        });
      });

      this.log('🔧 Event listeners configurados');
    },

    /**
     * Inicia envio periódico de eventos
     */
    startPeriodicSend: function() {
      this.state.sendTimer = setInterval(() => {
        if (this.state.events.length > 0) {
          this.sendEvents();
        }
      }, this.config.sendInterval);
    },

    /**
     * Envia eventos para o backend
     */
    sendEvents: async function(immediate = false) {
      if (this.state.events.length === 0) return;

      const eventsToSend = [...this.state.events];
      this.state.events = []; // Limpar fila

      const payload = {
        events: eventsToSend,
        user_agent: navigator.userAgent,
        screen_size: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`
      };

      try {
        // Usar sendBeacon para maior confiabilidade em beforeunload
        if (immediate && this.config.enableBeaconAPI && navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
          navigator.sendBeacon(this.config.apiEndpoint, blob);
          this.log(`📤 Eventos enviados via Beacon: ${eventsToSend.length}`);
        } else {
          // Usar fetch normal
          const response = await fetch(this.config.apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '')
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            this.log(`📤 Eventos enviados: ${eventsToSend.length}`);
          } else {
            console.error('❌ Erro ao enviar eventos:', response.status);
            // Recolocar na fila
            this.state.events.push(...eventsToSend);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao enviar eventos:', error);
        // Recolocar na fila
        this.state.events.push(...eventsToSend);
      }
    },

    /**
     * Salva evento no localStorage como backup
     */
    saveToLocalStorage: function(event) {
      try {
        const key = 'analytics_events';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(event);

        // Manter apenas últimos 100 eventos
        if (existing.length > 100) {
          existing.shift();
        }

        localStorage.setItem(key, JSON.stringify(existing));
      } catch (error) {
        // Ignorar erros de quota excedida
      }
    },

    /**
     * Retorna tempo gasto na página em segundos
     */
    getTimeOnPage: function() {
      return Math.floor((Date.now() - this.state.pageStartTime) / 1000);
    },

    /**
     * Retorna profundidade de scroll em porcentagem
     */
    getScrollDepth: function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight <= 0) return 100;

      return Math.min(100, Math.floor((scrollTop / scrollHeight) * 100));
    },

    /**
     * Calcula taxa de preenchimento do formulário
     */
    getFormCompletionRate: function() {
      const fields = document.querySelectorAll('input, select, textarea');
      if (fields.length === 0) return 100;

      let filledCount = 0;
      fields.forEach(field => {
        if (field.type === 'checkbox' || field.type === 'radio') {
          if (field.checked) filledCount++;
        } else if (field.value && field.value.trim() !== '') {
          filledCount++;
        }
      });

      return Math.floor((filledCount / fields.length) * 100);
    },

    /**
     * Obtém relatório de sessão
     */
    getSessionReport: function() {
      return {
        session_id: this.state.sessionId,
        current_page: this.state.currentPage,
        time_on_page: this.getTimeOnPage(),
        scroll_depth: this.getScrollDepth(),
        form_completion: this.getFormCompletionRate(),
        events_queued: this.state.events.length,
        is_visible: this.state.isPageVisible
      };
    },

    /**
     * Logger condicional
     */
    log: function(message, data) {
      if (this.config.enableConsoleLog) {
        if (data) {
          console.log(`[Analytics] ${message}`, data);
        } else {
          console.log(`[Analytics] ${message}`);
        }
      }
    },

    /**
     * Limpa dados de analytics
     */
    clear: function() {
      this.state.events = [];
      localStorage.removeItem('analytics_events');
      this.log('🗑️  Analytics limpo');
    }
  };

  // Exportar para uso global
  window.Analytics = Analytics;

})(window);
