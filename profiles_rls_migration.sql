-- ============================================
-- Migração: Habilitar RLS na tabela profiles
-- Execute este script no Supabase SQL Editor
-- ============================================

-- 1. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas (se existirem) para evitar conflitos
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 3. SELECT: Usuários autenticados podem ler seu próprio perfil
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 4. INSERT: Usuários podem criar seu próprio perfil (trigger handle_new_user)
CREATE POLICY "Users can insert their own profile."
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. UPDATE: Usuários podem atualizar seu próprio perfil (ex: alterar nome)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
