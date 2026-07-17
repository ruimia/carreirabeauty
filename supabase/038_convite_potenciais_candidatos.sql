-- Empresa precisa ver o email de um profissional pra convidá-lo pra uma vaga
-- (aba "Candidatos" no dashboard da empresa), mas profiles só é legível pelo
-- próprio dono (RLS). Função SECURITY DEFINER expõe só o email, e só pra
-- quem tem uma conta de empresa de verdade — evita virar uma forma de
-- qualquer usuário autenticado descobrir email de terceiros.
create or replace function public.email_para_convite(profissional_user_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select email from profiles
  where id = profissional_user_id
    and exists (select 1 from companies where user_id = auth.uid())
$$;
