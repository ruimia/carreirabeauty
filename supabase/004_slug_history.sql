create table professional_slug_history (
  slug            text primary key,
  professional_id uuid not null references professionals(id) on delete cascade,
  criado_em       timestamptz not null default now()
);

alter table professional_slug_history enable row level security;

create policy "Histórico de slugs é legível por todos"
  on professional_slug_history for select using (true);

create policy "Profissional gerencia seu histórico de slugs"
  on professional_slug_history for insert
  with check (
    auth.uid() = (select user_id from professionals where id = professional_id)
  );
