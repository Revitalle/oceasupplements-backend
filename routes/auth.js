// =============================================
// ROUTES: AUTENTICAÇÃO
// =============================================

const express = require('express');
const router = express.Router();
const Joi = require('joi');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

// =============================================
// VALIDAÇÕES
// =============================================

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().optional().allow('', null)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// =============================================
// POST /api/v1/auth/register
// Criar nova conta
// =============================================

router.post('/register', async (req, res, next) => {
  try {
    // Validar dados
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message
        }
      });
    }

    const { name, email, password, phone } = value;

    // Verificar se email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email já cadastrado'
        }
      });
    }

    // Hash da senha
    const password_hash = await User.hashPassword(password);

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password_hash,
      phone: phone || null
    });

    // Gerar token
    const token = generateToken(user.id, user.email);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
});

// =============================================
// POST /api/v1/auth/login
// Login de usuário
// =============================================

router.post('/login', async (req, res, next) => {
  try {
    // Validar dados
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message
        }
      });
    }

    const { email, password } = value;

    // Buscar usuário
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha incorretos'
        }
      });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha incorretos'
        }
      });
    }

    // Atualizar último login
    await user.update({ last_login: new Date() });

    // Gerar token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
});

// =============================================
// GET /api/v1/auth/me
// Obter dados do usuário logado
// =============================================

router.get('/me', protect, async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        status: req.user.status,
        created_at: req.user.created_at,
        last_login: req.user.last_login
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
