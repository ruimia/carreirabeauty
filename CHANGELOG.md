# Changelog — CarreiraBeauty

Registro da evolução do projeto. Mantido manualmente a cada sessão relevante de trabalho.

## 2026-07-21 — Trilhas/certificados multi-tema, Depoimentos (feature nova), Adzuna e limpeza de UX

### 🔴 Bugs corrigidos

- **Webhook do Mercado Pago nunca liberava PRO de verdade.** Usava o client de sessão (cookie), mas notificação de webhook não tem `auth.uid()` — RLS bloqueava silenciosamente o update em `professionals`/`companies`. Corrigido migrando pra client de service role. Também adicionada validação de assinatura HMAC do webhook (`x-signature`/`x-request-id`).
- **Contagem de candidatos sempre voltava 1.** Mesma causa-raiz (RLS + client de sessão) em `contarCandidatos()` — cada profissional só enxergava a própria candidatura. Corrigido com client admin nesse ponto específico.
- **Vagas externas (Adzuna) apareciam duplicadas.** A Adzuna agrega o mesmo anúncio repostado várias vezes com `external_id` diferente (achado real: uma vaga com 11 cópias). A trava do banco não pega isso porque o ID é diferente a cada repost — corrigido com dedup por título+empresa antes de exibir as 5 vagas.
- **Sem jeito de voltar na página de vaga.** `/vaga/[slug]` é rota pública (link do Google/redes), por isso fica fora do layout do dashboard (sem o menu inferior) — mas o profissional logado ficava sem seta de voltar ao clicar numa vaga do próprio feed. Corrigido: seta aparece só quando tem profissional logado, com fallback pro dashboard.

### ✨ Novidades

- **Quiz estilo Duolingo**: feedback imediato (certo/errado + explicação) a cada pergunta, em vez de só no final.
- **"Destaque-se entre os candidatos"**: toda candidatura agora mostra 3 caminhos (virar PRO, ganhar certificados, completar perfil), com contagem real de concorrentes (só exibida acima de 10 candidatos).
- **Certificado avulso (R$29,90)** via Mercado Pago Checkout Pro, precificado de propósito acima da assinatura PRO (R$14,90/mês) pra ancorar o PRO como a escolha óbvia.
- **Arquitetura multi-trilha**: generalizado de uma trilha única hardcoded pra um catálogo (`TRILHAS[]`). Catálogo atual (5 certificados): Atendimento Nota 10, Preço Justo, Mãos Seguras, Cliente Fiel, Agenda Cheia — os 2 últimos criados nesta sessão, com tema não específico de profissão (fidelização e organização de agenda).
- **Admin**: página de jornada do quiz agora tem seletor de trilha, com funil e conclusão por módulo específicos de cada uma.
- **Feature nova — Depoimentos de clientes**: link público (`/perfil/{slug}/depoimento`, sem login) onde o cliente avalia com estrelas + texto + WhatsApp; fica pendente até o profissional aprovar em `/dashboard/profissional/depoimentos`; só aprovados aparecem no perfil público (tema Clássico por enquanto). Inclui mensagens prontas pra copiar e pedir, card de compartilhar link, unicidade por telefone (evita duplicidade do mesmo cliente) e painel de stats no admin (adoção, taxa de aprovação, nota média).
- **Home do profissional reorganizada**: só "Complete seu perfil" abre a página agora; Certificados e Depoimentos viraram "Continue evoluindo" no final, depois de vagas e conquistas.
- **Vitrine de certificados no "Meu perfil"**: trilhas conquistadas/pendentes aparecem como "figurinha" (só o dono vê), reposicionada pro fim da página, depois do portfólio.
- **Certificado — visual da prévia mais aspiracional**: usa a mesma moldura dourada do estado conquistado (antes era cinza/listrado), com dica de "você vai poder compartilhar isso".
- **Experimento — tags "PRO" removidas da exploração**: seletor de temas visuais e lista de conteúdo não mostram mais aviso antecipado de bloqueio; o aviso real (paywall) só aparece no momento de aplicar o tema ou tentar ler além do trecho liberado.
- **Adzuna — profissões e cobertura geográfica**: adicionadas Fisioterapeuta e Biomédico(a) (existiam na base mas nunca entravam na busca); novo fallback por bairro (resolvido a partir do CEP no cadastro) quando a cidade inteira não rende 5+ vagas relevantes pra função do profissional.
- **Conquistas**: "Em movimento" (5 candidaturas) trocada por "Colheu o 1º depoimento" — a oferta de vagas ainda é baixa pra justificar aquela meta.

### 🗄️ Migrations aplicadas (040 → 042)

| # | O que faz |
|---|---|
| 040 | Certificado avulso: coluna `certificado_autoestima_origem` + tabela `pagamentos_avulsos` |
| 041 | Generaliza certificados pra multi-trilha: tabela `certificados` (professional_id, trilha_slug, origem) |
| 042 | Depoimentos de clientes: tabela `depoimentos` (estrelas, texto, status pendente/aprovado/rejeitado, unique por telefone+profissional) |

### 📌 Decisões

- Certificado avulso **sempre mais caro** que a assinatura PRO mensal — ancoragem de preço proposital.
- Depoimentos **v1 sem validação do cliente** (não exige conta) — moderação manual do profissional é o único filtro contra spam/abuso.
- WhatsApp do cliente no depoimento é **privado**, visível só pro profissional dono do perfil — nunca público.
- Tags "PRO" tiradas só da fase de exploração, nunca do momento em que a pessoa tentaria de fato ficar com o tema/conteúdo — evita parecer pegadinha.

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
