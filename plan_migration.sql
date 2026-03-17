-- Migration: Adiciona campos de plano e expiração em profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS plan text CHECK (plan IN ('low_15', 'lifetime')),
  ADD COLUMN IF NOT EXISTS expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS has_kids_pdf boolean DEFAULT false;
