-- Criar bucket público para posts
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do nothing;

-- Política para permitir que todos vejam as imagens
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'posts' );

-- Política para permitir que usuários autenticados façam upload
create policy "Authenticated users can upload images"
on storage.objects for insert
with check ( 
  bucket_id = 'posts' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir que usuários deletem suas próprias imagens
create policy "Users can delete their own images"
on storage.objects for delete
using ( 
  bucket_id = 'posts' 
  and auth.role() = 'authenticated'
  and (storage.foldername(name))[1] = auth.uid()::text
);
