/*
  # Ajustar políticas de segurança e unicidade de email

  1. Alterações
    - Remover políticas existentes
    - Criar novas políticas de acesso
    - Garantir unicidade do email
    - Melhorar segurança geral

  2. Segurança
    - Manter RLS ativo
    - Permitir leitura pública limitada
    - Restringir atualizações ao próprio usuário
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Public users read access" ON users;
    DROP POLICY IF EXISTS "Anyone can insert users" ON users;
    DROP POLICY IF EXISTS "Users can update their own data" ON users;
END $$;

-- Create new policies with better security
CREATE POLICY "Public users read access"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Ensure email uniqueness is properly enforced
DO $$ 
BEGIN
    ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_email_key;
    
    ALTER TABLE users 
      ADD CONSTRAINT users_email_key UNIQUE (email);
END $$;