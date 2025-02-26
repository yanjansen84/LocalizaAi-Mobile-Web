-- Adicionar chave estrangeira na tabela posts para profiles
alter table public.posts
add constraint posts_user_id_fkey
foreign key (user_id)
references public.profiles(id)
on delete cascade;
