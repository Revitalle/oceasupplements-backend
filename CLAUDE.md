# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Health diagnostic backend API for a personalized nutrition supplement platform. Built with Node.js/Express and PostgreSQL, this system processes questionnaire responses, calculates health scores, and generates diagnostic reports with supplement recommendations.

## Commands

### Development
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run Jest tests with coverage
```

### Database Operations
```bash
node database/init.js              # Initialize database and create tables
node database/seed-questions.js    # Seed questionnaire questions
node database/seed-products.js     # Seed product catalog
node database/create-tables.js     # Create database schema
node database/list-users.js        # List all users (debug)
node database/list-diagnostics.js  # List all diagnostics (debug)
```

### Environment Setup
```bash
cp .env.example .env  # Copy environment template
createdb health_diagnostic_mvp  # Create PostgreSQL database (if needed)
```

## Architecture

### Database Design

Two-table diagnostic system with special behavior:

**`diagnostics` table**: Stores the **current/latest** patient anamnesis (questionnaire data). Uses `ON CONFLICT (user_id) DO UPDATE` to replace previous data when user completes a new questionnaire.

**`diagnostic_history` table**: Stores **score snapshots** over time (max 4 entries per user via database trigger). Used for tracking health progression.

Key point: When a user completes a questionnaire, the system:
1. Inserts scores into `diagnostic_history` (append-only, max 4)
2. Upserts into `diagnostics` (replaces previous anamnesis data)

### Authentication Flow

JWT-based authentication with middleware protection:
- Token generated on `/api/v1/auth/register` or `/api/v1/auth/login`
- Protected routes use `protect` middleware from `middleware/auth.js`
- Token contains: `user_id`, `email`, expires in 7 days
- User passwords hashed with bcryptjs (10 rounds)

### Questionnaire Scoring System

Complex weighted scoring in `utils/scoring.js`:
- 8 health categories: Intro (BMI), Nutrition, Digestive, Physical, Sleep, Mental, Hormonal, Symptoms
- Each category scores 0-100 (100 = best health)
- Uses weighted averages with category-specific weights
- Hormonal scoring differs by gender (male/female have different subscores)
- Severity levels: `low`, `moderate`, `high` (based on overall score)

**Important**: The frontend sends nested data like `{ intro: { pesoKg: 70 }, nutricao: { q1_1: '3-4' } }` but scoring functions expect flattened data. The `/questionnaire/complete` endpoint handles flattening in routes/questionnaire.js:234-245.

### Route Architecture

Routes in `server.js` are mounted under `/api/v1/`:
- `/auth` - Registration, login, user profile
- `/questionnaire` - Get questions, start session, submit answers, complete
- `/diagnostics` - Get current diagnostic, get history
- `/products` - Product catalog (currently unused in MVP)
- `/conversions` - Click tracking (currently unused in MVP)

Each route file creates its own `pg.Pool` instance for database queries (no shared connection pool). This is intentional for the MVP but should be refactored for production.

### Middleware Stack

Global middleware order (server.js:27-66):
1. Helmet (security headers)
2. CORS (configurable origins via ALLOWED_ORIGINS env var)
3. Body parser (JSON + URL-encoded)
4. Morgan (HTTP logging, dev/combined modes)
5. Rate limiter (100 req/min per IP, configurable)

Error handling catches CORS errors, validation errors, JWT errors, and returns standardized JSON responses.

### Scoring Logic Details

The `computeAllScores()` function in `utils/scoring.js` is the core diagnostic engine:

1. Accepts flattened questionnaire data (NOT nested objects)
2. Calculates 8 category scores using weighted subscores
3. Returns object with individual scores + `total_score` + `severity_level`
4. BMI (intro_score) is calculated separately but not included in overall average
5. Overall score = average of 7 behavioral categories (excludes BMI)

Common field name variations handled:
- `pesoKg` / `peso`
- `alturaCm` / `altura`
- `q1_1` / `refeicoes` / `refeicoes_dia`

Gender-specific logic:
- Male: `q6_2m` (libido), `q6_3m` (fatigue/muscle)
- Female: `q6_2f` (menstrual cycle), `q6_3f` (PMS)
- Detected by `sexo` or `genero` field

## Configuration

### Environment Variables (.env)

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for signing tokens
- `NODE_ENV` - `development` or `production`

Optional:
- `PORT` - Server port (default 3000)
- `ALLOWED_ORIGINS` - Comma-separated CORS origins
- `RATE_LIMIT_WINDOW_MS` - Rate limit window (default 60000)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default 100)
- `JWT_EXPIRE` - Token expiration (default 7d)

### Database Connection

Uses both Sequelize ORM (`config/database.js`) and raw `pg.Pool` connections:
- Sequelize: Used for User model and migrations
- pg.Pool: Used directly in route handlers for questionnaire/diagnostic queries

SSL is enabled in production (`rejectUnauthorized: false` for Railway compatibility).

## Key Files

- `server.js` - Express app setup, middleware, route mounting
- `routes/questionnaire.js` - Core logic for questionnaire flow and diagnostic generation
- `routes/diagnostic.js` - Fetch current diagnostic and history
- `routes/auth.js` - User authentication endpoints
- `utils/scoring.js` - Health score calculation engine (480 lines, most complex file)
- `middleware/auth.js` - JWT verification middleware
- `models/User.js` - Sequelize User model with password hashing
- `config/database.js` - Sequelize configuration and connection pooling

## Common Development Tasks

### Adding a New Question

1. Update the scoring logic in `utils/scoring.js` for the appropriate category
2. Add the question to database via `database/seed-questions.js`
3. Update frontend questionnaire forms to collect the data
4. Ensure field names match between frontend, scoring logic, and database

### Debugging Diagnostic Issues

Use the debug scripts in `database/`:
- `debug-diagnostic.js` - Inspect specific diagnostic data
- `show-diagnostic-6.js` - Show detailed diagnostic #6
- `test-complete.js` - Test the complete endpoint with sample data

Console logs are extensive in `/questionnaire/complete` endpoint for troubleshooting score calculation.

### Testing the API

Manual testing credentials (after running `database/init.js`):
- Email: `teste@oceasupplements.com`
- Password: `senha123`

Use Postman/curl to test endpoints. Protected routes need `Authorization: Bearer <token>` header.

## Database Schema Notes

Key tables created by `database/create-tables.js`:
- `users` - Basic user info
- `questions` - Question bank with category_id, order_number
- `health_categories` - Question categories (Nutrition, Sleep, etc.)
- `diagnostics` - Current anamnesis (unique constraint on user_id)
- `diagnostic_history` - Score history (max 4 per user via trigger)
- `products` - Product catalog (for recommendations)

The `questionnaire_data` column in `diagnostics` stores the full JSON of user responses for future reference/auditing.

## Known Issues / Technical Debt

1. Each route file creates its own database pool - should use a shared pool
2. Mock data in `/questionnaire/categories` endpoint (not reading from DB)
3. `/questionnaire/answer` endpoint doesn't actually save to database yet
4. Products and conversions routes are not fully implemented
5. Symptoms scoring is basic (word count, not semantic analysis)
6. No migration system - using direct SQL and sequelize.sync()
7. Tests are not implemented (Jest configured but no test files)

## Deployment

Configured for Railway.app deployment via `railway.json`. Key points:
- SSL required in production
- Database URL provided by Railway automatically
- CORS origins must include production domain
- Rate limiting should be tuned based on traffic
