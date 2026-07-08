-- CarreiraBeauty — schema inicial (Fase 0)
-- Entidades: User (via Supabase Auth), Company, Professional, Job, Application
-- Subscription e PortfolioItem ficam para fases seguintes

-- Habilitar extensão UUID (já ativa no Supabase por padrão)
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------
-- Tipos enum
-- -------------------------------------------------------

create type user_type as enum ('empresa', 'profissional');

create type company_registration_status as enum ('incompleto', 'completo');

create type company_subscription_status as enum ('trial', 'ativa', 'expirada');

create type job_status as enum ('ativa', 'pausada', 'fechada', 'bloqueada_pos_trial');

create type employment_type as enum ('clt', 'pj', 'freela');

create type business_category as enum (
  'salao_beleza',
  'esmalteria',
  'clinica_estetica',
  'barbearia',
  'spa_massoterapia',
  'estudio_sobrancelha_cilios',
  'outro'
);

create type professional_role as enum (
  'cabeleireiro',
  'manicure_pedicure',
  'esteticista',
  'maquiador',
  'barbeiro',
  'massoterapeuta',
  'designer_sobrancelha_cilios',
  'depilador',
  'podologo',
  'recepcionista',
  'auxiliar_assistente',
  'outro'
);

create type employee_range as enum ('1_5', '6_20', '20_mais');

-- -------------------------------------------------------
-- Tabela: profiles
-- Estende auth.users do Supabase — 1:1 com cada usuário autenticado
-- -------------------------------------------------------

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  tipo        user_type not null,
  criado_em   timestamptz not null default now()
);

-- RLS
alter table profiles enable row level security;

create policy "Usuário vê e edita apenas o próprio perfil"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -------------------------------------------------------
-- Tabela: companies
-- 1:1 com profiles onde tipo = 'empresa'
-- -------------------------------------------------------

create table companies (
  id                     uuid primary key default uuid_generate_v4(),
  user_id                uuid not null unique references profiles(id) on delete cascade,
  cnpj                   text not null unique,
  nome_estabelecimento   text not null,
  responsavel            text not null default '',
  telefone               text not null default '',
  endereco               text not null default '',
  cidade                 text not null default '',
  estado                 text not null default '',
  cep                    text not null default '',
  latitude               numeric(9,6),
  longitude              numeric(9,6),
  categoria_negocio      business_category,
  faixa_funcionarios     employee_range,
  logo_url               text,
  instagram              text,
  status_cadastro        company_registration_status not null default 'incompleto',
  trial_iniciado_em      timestamptz,
  trial_expira_em        timestamptz,
  status_assinatura      company_subscription_status not null default 'trial',
  criado_em              timestamptz not null default now()
);

alter table companies enable row level security;

create policy "Empresa vê e edita apenas os próprios dados"
  on companies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -------------------------------------------------------
-- Tabela: professionals
-- 1:1 com profiles onde tipo = 'profissional'
-- -------------------------------------------------------

create table professionals (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references profiles(id) on delete cascade,
  nome                text not null default '',
  telefone            text not null default '',
  funcao              professional_role,
  funcao_outro        text,                       -- preenchido quando funcao = 'outro'
  localizacao         text not null default '',   -- texto livre (bairro, cidade)
  cidade              text not null default '',
  estado              text not null default '',
  latitude            numeric(9,6),
  longitude           numeric(9,6),
  experiencia         text not null default '',   -- ex: "3 anos", "menos de 1 ano"
  disponibilidade     text not null default '',   -- ex: "integral", "meio período", "freela"
  pretensao_salarial  text not null default '',   -- faixa em texto no MVP
  tipo_vinculo        employment_type,            -- opcional
  educacao_basica     text not null default '',
  foto_perfil_url     text,
  slug                text unique,                -- URL pública: /perfil/[slug]
  criado_em           timestamptz not null default now()
);

alter table professionals enable row level security;

create policy "Profissional vê e edita apenas os próprios dados"
  on professionals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Página pública do profissional é lida por qualquer um (autenticado ou não)
create policy "Página pública do profissional é legível por todos"
  on professionals for select
  using (true);

-- -------------------------------------------------------
-- Tabela: jobs
-- N:1 com companies
-- -------------------------------------------------------

create table jobs (
  id             uuid primary key default uuid_generate_v4(),
  company_id     uuid not null references companies(id) on delete cascade,
  funcao         professional_role not null,
  funcao_outro   text,
  descricao      text not null default '',
  tipo_vinculo   employment_type,
  faixa_salarial text not null default '',
  status         job_status not null default 'ativa',
  criado_em      timestamptz not null default now()
);

alter table jobs enable row level security;

-- Empresa gerencia suas próprias vagas
create policy "Empresa gerencia suas próprias vagas"
  on jobs for all
  using (
    auth.uid() = (select user_id from companies where id = company_id)
  )
  with check (
    auth.uid() = (select user_id from companies where id = company_id)
  );

-- Vagas ativas são visíveis para todos (busca pública)
create policy "Vagas ativas são visíveis publicamente"
  on jobs for select
  using (status = 'ativa');

-- -------------------------------------------------------
-- Tabela: applications
-- N:N entre professionals e jobs
-- -------------------------------------------------------

create table applications (
  id              uuid primary key default uuid_generate_v4(),
  job_id          uuid not null references jobs(id) on delete cascade,
  professional_id uuid not null references professionals(id) on delete cascade,
  criado_em       timestamptz not null default now(),
  unique (job_id, professional_id)   -- evita candidatura duplicada
);

alter table applications enable row level security;

-- Profissional vê e cria suas próprias candidaturas
create policy "Profissional gerencia suas candidaturas"
  on applications for all
  using (
    auth.uid() = (select user_id from professionals where id = professional_id)
  )
  with check (
    auth.uid() = (select user_id from professionals where id = professional_id)
  );

-- Empresa vê candidaturas das suas vagas
create policy "Empresa vê candidaturas de suas vagas"
  on applications for select
  using (
    auth.uid() = (
      select c.user_id from companies c
      join jobs j on j.company_id = c.id
      where j.id = job_id
    )
  );

-- -------------------------------------------------------
-- Função: cria profile automaticamente após signup
-- -------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, tipo)
  values (
    new.id,
    new.email,
    -- tipo vem do metadata passado no signUp
    coalesce((new.raw_user_meta_data->>'tipo')::user_type, 'profissional')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
