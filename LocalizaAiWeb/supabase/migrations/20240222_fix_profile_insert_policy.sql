-- Primeiro remove a política antiga
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Cria a nova política que permite inserção para usuários autenticados
CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);
