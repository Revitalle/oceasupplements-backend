// =============================================
// SERVER.JS - Servidor Principal
// =============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar rotas
const authRoutes = require('./routes/auth');
const questionnaireRoutes = require('./routes/questionnaire');
const diagnosticRoutes = require('./routes/diagnostic');
const productRoutes = require('./routes/products');
const conversionRoutes = require('./routes/conversions');
const analyticsRoutes = require('./routes/analytics');

// Importar middleware de monitoramento
const { monitorDiagnosticCreation, getEmptyDiagnosticsReport } = require('./middleware/diagnosticMonitor');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// =============================================
// MIDDLEWARES GLOBAIS
// =============================================

// Segurança com CSP configurado
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3000", "https://web-production-f401a.up.railway.app"]
    }
  }
}));

// CORS - Permitir requisições do frontend
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://oceasupplements.com', 'https://www.oceasupplements.com'];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS policy não permite acesso deste origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minuto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Muitas requisições deste IP, tente novamente em 1 minuto.'
});
app.use('/api/', limiter);

// =============================================
// ARQUIVOS ESTÁTICOS
// =============================================

// Servir arquivos do questionário
app.use('/questionario', express.static(path.join(__dirname, 'questionario')));

// Servir assets (imagens, etc)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Servir arquivos da raiz do projeto (dashboard, js, css)
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use(express.static(path.join(__dirname, '..')));

// =============================================
// ROTAS
// =============================================

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Diagnóstico de Saúde - Funcionando!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    database: 'connected', // TODO: verificar conexão real
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/questionnaire', monitorDiagnosticCreation, questionnaireRoutes);
app.use('/api/v1/diagnostics', diagnosticRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/conversions', conversionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Monitoring endpoint
app.get('/api/v1/monitoring/empty-diagnostics', getEmptyDiagnosticsReport);

// =============================================
// ERROR HANDLING
// =============================================

// 404 - Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Rota não encontrada',
      path: req.path
    }
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Erro:', err);

  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CORS_ERROR',
        message: err.message
      }
    });
  }

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        details: err.details || {}
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Token expirado'
      }
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// =============================================
// INICIAR SERVIDOR
// =============================================

const server = app.listen(PORT, () => {
  console.log('');
  console.log('=============================================');
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('=============================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});

module.exports = app;
