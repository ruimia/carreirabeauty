# Changelog — CarreiraBeauty

Registro da evolução do projeto. Mantido manualmente a cada sessão relevante de trabalho.

## 2026-07-10 — Bugs críticos de produção + design system + admin

### 🔴 Bugs críticos corrigidos

- **Onboarding pulava a escolha empresa/profissional.** Cadastros via Google ou magic link (que não enviam metadata) recebiam `tipo = 'profissional'` por padrão no trigger `handle_new_user`, então toda empresa que se cadastrasse por esses meios caía direto no onboarding de profissional, sem nunca ver a tela de escolha. Corrigido permitindo `tipo = NULL` até o usuário escolher ativamente (migration 025).
- **Erro genérico ao atingir limite de plano.** Next.js 16 camufla mensagens de erro lançadas via `throw` em Server Actions nos builds de produção (só preserva a mensagem em dev). Qualquer usuário que batesse no limite do plano via `criarVaga`/`candidatar` via um erro técnico em inglês em vez da mensagem de upgrade. Corrigido migrando as actions para retornar `{ ok, error }` em vez de `throw`.
- **Planos pagos (Pro/Plus/Premium) limitados por engano.** Bug no operador `??` em `planos.ts` tratava `null` (que sinaliza "ilimitado") igual a "plano desconhecido", então assinantes pagantes continuavam com os limites do plano grátis.
- **Recursão infinita numa RLS policy de admin.** Policy em `profiles` que consultava a própria tabela `profiles` causava `infinite recursion detected` — corrigido com função `SECURITY DEFINER is_admin()`.
- **Nova vaga / editar vaga quebrados em produção.** Causa raiz: várias colunas de migrations antigas (`foto_url`, `titulo`, `slug`, `modelo_remuneracao`, etc.) nunca tinham sido aplicadas em produção, e `jobs.status` continuava como enum em vez de `text`. Corrigido com migrations 021/022 + reload do schema cache do PostgREST.

### ✨ Novidades

- **Ambiente de teste local**: script `scripts/seed-test-users.mjs` cria usuários de teste (empresa + profissional) com dados completos, e página `/test-login` permite logar neles instantaneamente em dev.
- **Design system CarreiraBeauty** implementado em todos os dashboards (Phosphor Icons, cards, chips, tags, tokens de cor/tipografia).
- **Admin**: seção "Últimos cadastros" na visão geral, cruzando `profiles` com `companies`/`professionals` para mostrar o funil completo — incluindo cadastros incompletos que antes eram invisíveis. Página de detalhe do profissional agora mostra experiência, formação, habilidades e experiência profissional reais (antes lia colunas inexistentes). Detalhes completos da vaga (descrição, remuneração, endereço) visíveis antes de aprovar/rejeitar.
- **Perfil público do profissional** (`/perfil/[slug]`) agora mostra habilidades, formação, experiência profissional e portfólio — dados que já existiam mas nunca apareciam para empresas.
- **Home page**: destaque para "cadastro grátis" tanto para profissionais quanto empresas (1 vaga grátis sem prazo).
- **Login**: botão do Google como CTA principal, e-mail/magic link como opção secundária, com aviso claro de que será enviado um link de acesso.
- **Painel do profissional**: card de "força do perfil" (% completo + o que falta) logo no topo, incentivando a completar o cadastro.
- **Mobile**: acesso a Suporte e Sair agora disponível na página de Perfil (antes só existia na sidebar desktop).
- Limite do plano grátis de profissional aumentado de 3 para 10 candidaturas/mês (estratégia de aquisição inicial).

### 🗄️ Migrations aplicadas (021 → 025)

| # | O que faz |
|---|---|
| 021 | Converte `jobs.status`/`tipo_vinculo` para text, cria `categorias_negocio`, RLS em `profissoes` |
| 022 | Aplica colunas de migrations antigas que nunca tinham rodado em produção |
| 023 | (Substituída pela 024 — causava recursão) |
| 024 | Corrige recursão infinita com função `SECURITY DEFINER is_admin()` |
| 025 | Permite `profiles.tipo = NULL`, remove default perigoso do trigger `handle_new_user` |

### 📌 Decisões e próximos passos

- **Ambientes separados (dev/prod)**: decidido criar um segundo projeto Supabase só para dev, mantendo prod isolado — **adiado para próxima fase**. Até lá, dev local aponta para o mesmo Supabase de produção (cuidado ao rodar scripts de teste).
- Fluxo de teste padrão agora é: reproduzir localmente (ou em build de produção local quando o bug só aparece em prod) → corrigir → validar visualmente com Playwright/preview → commit + push (deploy automático via Vercel).
