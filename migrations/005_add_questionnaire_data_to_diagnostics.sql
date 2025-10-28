-- =============================================
-- MIGRATION: Adicionar coluna questionnaire_data à tabela diagnostics
-- Data: 2025-10-28
-- =============================================

-- Adicionar coluna JSONB para armazenar dados completos do questionário
ALTER TABLE diagnostics
ADD COLUMN IF NOT EXISTS questionnaire_data JSONB;

-- Criar índice GIN para buscas rápidas em JSONB
CREATE INDEX IF NOT EXISTS idx_diagnostics_questionnaire_data
ON diagnostics USING GIN (questionnaire_data);

-- Comentário da coluna
COMMENT ON COLUMN diagnostics.questionnaire_data IS 'Dados completos do questionário em formato JSONB (intro, nutricao, digestiva, fisica, sono, mental, hormonal, sintomas)';
