-- Bucket público para logos das empresas
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "Logos são públicas para leitura"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "Usuário autenticado pode fazer upload de logo"
  on storage.objects for insert
  with check (bucket_id = 'logos' and auth.role() = 'authenticated');

create policy "Usuário pode atualizar o próprio logo"
  on storage.objects for update
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Usuário pode deletar o próprio logo"
  on storage.objects for delete
  using (bucket_id = 'logos' and auth.uid()::text = (storage.foldername(name))[1]);
