-- =============================================
-- SCHEMA DO BANCO DE DADOS - MVP FASE 1
-- =============================================
-- Database: health_diagnostic_mvp
-- Version: 1.0
-- =============================================

-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    email_verified BOOLEAN DEFAULT FALSE
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- =============================================

-- Tabela de Categorias do Questionário
CREATE TABLE questionnaire_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_position INTEGER NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================

-- Tabela de Perguntas
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES questionnaire_categories(id),
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL, -- multiple_choice, scale, checkbox, text
    order_position INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    help_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para buscar perguntas por categoria
CREATE INDEX idx_questions_category ON questions(category_id);
CREATE INDEX idx_questions_active ON questions(is_active);

-- =============================================

-- Tabela de Opções de Resposta (para perguntas de múltipla escolha)
CREATE TABLE question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    option_value VARCHAR(50) NOT NULL,
    order_position INTEGER NOT NULL,
    score INTEGER DEFAULT 0, -- Para cálculo de diagnóstico
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_options_question ON question_options(question_id);

-- =============================================

-- Tabela de Sessões de Questionário (cada vez que usuário inicia)
CREATE TABLE questionnaire_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed, abandoned
    current_question_id INTEGER,
    progress_percentage DECIMAL(5,2) DEFAULT 0.00
);

CREATE INDEX idx_sessions_user ON questionnaire_sessions(user_id);
CREATE INDEX idx_sessions_status ON questionnaire_sessions(status);

-- =============================================

-- Tabela de Respostas do Usuário
CREATE TABLE user_responses (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    response_value TEXT NOT NULL, -- Armazena a resposta (ID da opção, texto, número, etc)
    score INTEGER DEFAULT 0,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para buscar respostas
CREATE INDEX idx_responses_session ON user_responses(session_id);
CREATE INDEX idx_responses_user ON user_responses(user_id);
CREATE INDEX idx_responses_question ON user_responses(question_id);

-- =============================================

-- Tabela de Produtos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    monthly_price DECIMAL(10,2),
    image_url VARCHAR(500),
    category VARCHAR(100), -- essencial, avancado, premium
    is_active BOOLEAN DEFAULT TRUE,
    checkout_url VARCHAR(500), -- URL do checkout externo
    features JSON, -- Lista de features em formato JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_category ON products(category);

-- =============================================

-- Tabela de Regras de Diagnóstico
CREATE TABLE diagnostic_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSON NOT NULL, -- Condições em formato JSON
    recommended_product_id INTEGER REFERENCES products(id),
    diagnostic_text TEXT NOT NULL, -- Texto do diagnóstico gerado
    priority INTEGER DEFAULT 0, -- Prioridade da regra (maior = mais importante)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rules_active ON diagnostic_rules(is_active);
CREATE INDEX idx_rules_priority ON diagnostic_rules(priority DESC);

-- =============================================

-- Tabela de Diagnósticos Gerados
CREATE TABLE diagnostics (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES questionnaire_sessions(id),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    diagnostic_text TEXT NOT NULL,
    recommended_product_id INTEGER REFERENCES products(id),
    rule_applied_id INTEGER REFERENCES diagnostic_rules(id),
    total_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diagnostics_user ON diagnostics(user_id);
CREATE INDEX idx_diagnostics_session ON diagnostics(session_id);

-- =============================================

-- Tabela de Compras/Conversões (tracking básico)
CREATE TABLE conversions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    diagnostic_id INTEGER REFERENCES diagnostics(id),
    product_id INTEGER REFERENCES products(id),
    checkout_clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    conversion_completed BOOLEAN DEFAULT FALSE,
    conversion_completed_at TIMESTAMP,
    external_order_id VARCHAR(255), -- ID do pedido no sistema externo
    amount DECIMAL(10,2),
    notes TEXT
);

CREATE INDEX idx_conversions_user ON conversions(user_id);
CREATE INDEX idx_conversions_completed ON conversions(conversion_completed);

-- =============================================
-- DADOS INICIAIS (SEEDS)
-- =============================================

-- Categorias do Questionário
INSERT INTO questionnaire_categories (name, description, order_position, icon) VALUES
('Sono e Energia', 'Avalie a qualidade do seu sono e níveis de energia', 1, '💤'),
('Digestão', 'Entenda o funcionamento do seu sistema digestivo', 2, '🍽️'),
('Estresse e Ansiedade', 'Identifique seus níveis de estresse', 3, '🧘'),
('Imunidade', 'Avalie a força do seu sistema imunológico', 4, '🛡️'),
('Pele, Cabelo e Unhas', 'Analise a saúde da sua pele e cabelos', 5, '✨');

-- Produtos Base
INSERT INTO products (name, slug, description, short_description, price, monthly_price, category, checkout_url, features) VALUES
(
    'Plano Essencial',
    'plano-essencial',
    'O básico que não pode faltar. Cerca de 40 ativos e nutrientes personalizados.',
    'Seu ponto de partida impecável e acessível',
    497.00,
    497.00,
    'essencial',
    'https://checkout.exemplo.com/essencial',
    '["Proteína isolada e colágeno", "Vitaminas em formas bioativas", "Minerais quelados", "Ômega-3 microencapsulado", "Personalização completa"]'
),
(
    'Plano Avançado',
    'plano-avancado',
    'Doses otimizadas e ativos exclusivos. Cerca de 50 ativos e nutrientes.',
    'Absorção superior e sinergias direcionadas',
    797.00,
    797.00,
    'avancado',
    'https://checkout.exemplo.com/avancado',
    '["Tudo do Essencial +", "Upgrade de doses", "Absorção superior", "Ativos funcionais específicos", "Resultados acelerados"]'
),
(
    'Plano Premium',
    'plano-premium',
    'O estado da arte da suplementação. Cerca de 60 ativos e nutrientes.',
    'Protocolos de elite com ativos patenteados de ponta',
    1997.00,
    1997.00,
    'premium',
    'https://checkout.exemplo.com/premium',
    '["Tudo do Avançado +", "Ingredientes de última geração", "Formas moleculares otimizadas", "Máxima performance", "Longevidade e regeneração"]'
);

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View: Usuários com última sessão
CREATE VIEW v_users_last_session AS
SELECT
    u.id,
    u.name,
    u.email,
    u.created_at,
    u.last_login,
    qs.id as last_session_id,
    qs.status as last_session_status,
    qs.completed_at,
    qs.progress_percentage
FROM users u
LEFT JOIN LATERAL (
    SELECT * FROM questionnaire_sessions
    WHERE user_id = u.id
    ORDER BY started_at DESC
    LIMIT 1
) qs ON true;

-- View: Estatísticas de conversão
CREATE VIEW v_conversion_stats AS
SELECT
    p.name as product_name,
    COUNT(DISTINCT c.user_id) as total_clicks,
    COUNT(DISTINCT CASE WHEN c.conversion_completed THEN c.user_id END) as conversions,
    ROUND(
        COUNT(DISTINCT CASE WHEN c.conversion_completed THEN c.user_id END)::DECIMAL /
        NULLIF(COUNT(DISTINCT c.user_id), 0) * 100,
        2
    ) as conversion_rate,
    SUM(CASE WHEN c.conversion_completed THEN c.amount ELSE 0 END) as total_revenue
FROM products p
LEFT JOIN conversions c ON p.id = c.product_id
GROUP BY p.id, p.name;

-- =============================================
-- FUNÇÕES ÚTEIS
-- =============================================

-- Função para calcular progresso do questionário
CREATE OR REPLACE FUNCTION calculate_questionnaire_progress(session_id_param INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total_questions INTEGER;
    answered_questions INTEGER;
    progress DECIMAL;
BEGIN
    -- Conta total de perguntas ativas
    SELECT COUNT(*) INTO total_questions
    FROM questions
    WHERE is_active = TRUE;

    -- Conta perguntas respondidas nesta sessão
    SELECT COUNT(DISTINCT question_id) INTO answered_questions
    FROM user_responses
    WHERE session_id = session_id_param;

    -- Calcula porcentagem
    IF total_questions > 0 THEN
        progress := (answered_questions::DECIMAL / total_questions) * 100;
    ELSE
        progress := 0;
    END IF;

    RETURN ROUND(progress, 2);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diagnostic_rules_updated_at BEFORE UPDATE ON diagnostic_rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMENTÁRIOS DAS TABELAS
-- =============================================

COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE questionnaire_categories IS 'Categorias do questionário (Sono, Digestão, etc)';
COMMENT ON TABLE questions IS 'Perguntas do questionário';
COMMENT ON TABLE question_options IS 'Opções de resposta para perguntas de múltipla escolha';
COMMENT ON TABLE questionnaire_sessions IS 'Sessões de questionário (cada tentativa do usuário)';
COMMENT ON TABLE user_responses IS 'Respostas dos usuários às perguntas';
COMMENT ON TABLE products IS 'Catálogo de produtos disponíveis';
COMMENT ON TABLE diagnostic_rules IS 'Regras para gerar diagnósticos automáticos';
COMMENT ON TABLE diagnostics IS 'Diagnósticos gerados para os usuários';
COMMENT ON TABLE conversions IS 'Tracking de cliques e conversões';

-- =============================================
-- FIM DO SCHEMA
-- =============================================
