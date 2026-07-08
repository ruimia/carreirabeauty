-- Bucket para fotos de perfil dos profissionais
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatars são públicos para leitura"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Usuário autenticado pode fazer upload de avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Usuário pode atualizar o próprio avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
