-- Recria a tabela followers com a chave única correta
DROP TABLE IF EXISTS public.followers;

CREATE TABLE public.followers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(follower_id, followed_id)
);

-- Adiciona políticas de segurança
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;

-- Política para permitir usuários verem quem segue quem
CREATE POLICY "Users can view all followers"
ON public.followers FOR SELECT
USING (true);

-- Política para permitir usuários seguirem outros
CREATE POLICY "Users can follow others"
ON public.followers FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Política para permitir usuários deixarem de seguir
CREATE POLICY "Users can unfollow"
ON public.followers FOR DELETE
USING (auth.uid() = follower_id);
