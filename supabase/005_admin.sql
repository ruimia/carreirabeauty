-- Campo admin no profile
alter table profiles add column if not exists is_admin boolean not null default false;

-- Campos de bloqueio
alter table companies add column if not exists bloqueado boolean not null default false;
alter table professionals add column if not exists bloqueado boolean not null default false;

-- Seta o admin pelo email (troque pelo seu email)
-- update profiles set is_admin = true where email = 'seu@email.com';
