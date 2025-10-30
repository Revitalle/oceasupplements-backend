// =============================================
// CONFIGURAÇÃO DA API - OCEA SUPPLEMENTS
// =============================================

const API_CONFIG = {
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api/v1'
    : 'https://web-production-f401a.up.railway.app/api/v1',
  timeout: 30000,
};

// =============================================
// GERENCIAMENTO DE TOKEN
// =============================================

const TokenManager = {
  get: () => localStorage.getItem('auth_token'),
  set: (token) => localStorage.setItem('auth_token', token),
  remove: () => localStorage.removeItem('auth_token'),
  isValid: () => !!TokenManager.get()
};

// =============================================
// CLIENTE HTTP
// =============================================

class APIClient {

  async request(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const token = TokenManager.get();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
      timeout: API_CONFIG.timeout
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const api = new APIClient();

// =============================================
// SERVIÇOS DA API
// =============================================

const AuthService = {

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.success && response.data.token) {
      TokenManager.set(response.data.token);
    }
    return response;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.success && response.data.token) {
      TokenManager.set(response.data.token);
    }
    return response;
  },

  async logout() {
    TokenManager.remove();
    window.location.href = '/';
  },

  async getCurrentUser() {
    return await api.get('/auth/me');
  },

  isAuthenticated() {
    return TokenManager.isValid();
  }
};

const QuestionnaireService = {

  async getCategories() {
    return await api.get('/questionnaire/categories');
  },

  async getQuestions(categoryId = null) {
    const endpoint = categoryId
      ? `/questionnaire/questions?category_id=${categoryId}`
      : '/questionnaire/questions';
    return await api.get(endpoint);
  },

  async startSession() {
    return await api.post('/questionnaire/start', {});
  },

  async saveAnswer(sessionId, questionId, answer) {
    const payload = {
      session_id: sessionId,
      questionnaire_data: questionnaireData,
      question_id: questionId,
      response_value: answer
    };
    console.log('Enviando resposta:', payload);
    return await api.post('/questionnaire/answer', payload);
  },

  async completeSession(sessionId, questionnaireData = null) {
    const payload = {
      session_id: sessionId,
      questionnaire_data: questionnaireData
    };
    console.log('📤 completeSession - Enviando para API:', payload);
    console.log('📦 questionnaire_data tipo:', typeof questionnaireData);
    console.log('📦 questionnaire_data keys:', questionnaireData ? Object.keys(questionnaireData) : 'null');
    console.log('📦 JSON.stringify length:', JSON.stringify(payload).length, 'bytes');
    return await api.post('/questionnaire/complete', payload);
  },

  async getLastQuestionnaire() {
    return await api.get('/questionnaire/last');
  }
};

const ProductService = {

  async getAll() {
    return await api.get('/products');
  },

  async getBySlug(slug) {
    return await api.get(`/products/${slug}`);
  }
};

const DiagnosticService = {

  async getCurrent() {
    return await api.get('/diagnostics');
  },

  async getAll() {
    return await api.get('/diagnostics');
  },

  async getById(id) {
    return await api.get(`/diagnostics/${id}`);
  },

  async getHistory() {
    return await api.get('/diagnostics/history');
  }
};

const ConversionService = {

  async trackClick(productSlug, source = 'pricing') {
    return await api.post('/conversions/click', {
      product_slug: productSlug,
      source
    });
  }
};

// =============================================
// HELPER: VALIDAÇÃO DE FORMULÁRIOS
// =============================================

const FormValidator = {

  email(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  phone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },

  password(password) {
    return password.length >= 6;
  },

  name(name) {
    return name.trim().length >= 3;
  }
};

// =============================================
// HELPER: MENSAGENS DE FEEDBACK
// =============================================

const UIFeedback = {

  showLoading(element) {
    if (element) {
      element.disabled = true;
      element.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Carregando...';
    }
  },

  hideLoading(element, originalText) {
    if (element) {
      element.disabled = false;
      element.innerHTML = originalText;
    }
  },

  showError(message, container = null) {
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    } else {
      alert(message);
    }
  },

  showSuccess(message, container = null) {
    if (container) {
      container.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
      `;
    }
  }
};

// =============================================
// EXPORTAR PARA USO GLOBAL
// =============================================

window.API = {
  Auth: AuthService,
  Questionnaire: QuestionnaireService,
  Products: ProductService,
  Diagnostics: DiagnosticService,
  Conversions: ConversionService,
  Validator: FormValidator,
  UI: UIFeedback
};

console.log('API Client carregado com sucesso!');
