-- Set correct search path
SET search_path = public;

-- Adicionar coluna user_id à tabela events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualizar as políticas RLS para incluir user_id
DROP POLICY IF EXISTS "Users can view all events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;

-- Recriar as políticas
CREATE POLICY "Users can view all events" 
    ON events FOR SELECT 
    USING (true);

CREATE POLICY "Users can create events" 
    ON events FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own events" 
    ON events FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own events" 
    ON events FOR DELETE 
    USING (auth.uid() = user_id);
