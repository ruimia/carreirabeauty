-- Corrige bug crítico: o trigger handle_new_user definia tipo='profissional'
-- como padrão para QUALQUER cadastro sem metadata (Google OAuth e magic link
-- nunca passam metadata), fazendo com que toda empresa que se cadastrasse
-- por esses meios fosse jogada direto no onboarding de profissional, sem
-- nunca ver a tela de escolha "Sou empresa / Sou profissional".
--
-- Corrige permitindo tipo = NULL (estado "ainda não escolheu"). O código em
-- src/app/dashboard/page.tsx já trata tipo nulo corretamente, redirecionando
-- para /onboarding/tipo (o "else" final do redirect chain).

ALTER TABLE profiles ALTER COLUMN tipo DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, tipo)
  VALUES (
    NEW.id,
    NEW.email,
    (NEW.raw_user_meta_data->>'tipo')::user_type  -- NULL se não vier no metadata (Google/magic link)
  );
  RETURN NEW;
END;
$$;
