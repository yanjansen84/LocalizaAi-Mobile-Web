-- Adicionar novas colunas à tabela profiles
alter table public.profiles
add column if not exists phone text,
add column if not exists birth_date date,
add column if not exists country text default 'Brasil';
