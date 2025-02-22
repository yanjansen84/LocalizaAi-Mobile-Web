-- Adiciona a coluna bio à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;
