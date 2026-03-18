-- ============================================================
-- ROTINA PERSONALIZADA — Migration
-- Rodar no Supabase SQL Editor
-- ============================================================

-- 1. Adicionar colunas na tabela profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_rotina boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS rotina_form_data jsonb,
  ADD COLUMN IF NOT EXISTS rotina_plano jsonb,
  ADD COLUMN IF NOT EXISTS rotina_gerada_em timestamptz;

-- 2. Criar tabela rotina_planos
CREATE TABLE IF NOT EXISTS rotina_planos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_data     jsonb NOT NULL,
  plano         jsonb NOT NULL,
  criado_em     timestamptz NOT NULL DEFAULT now()
);

-- 3. Habilitar RLS
ALTER TABLE rotina_planos ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS — usuário vê apenas o próprio plano
CREATE POLICY "rotina_planos: user select own"
  ON rotina_planos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "rotina_planos: user insert own"
  ON rotina_planos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Políticas RLS — admin acessa tudo
CREATE POLICY "rotina_planos: admin all"
  ON rotina_planos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
