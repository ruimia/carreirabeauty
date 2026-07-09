# CarreiraBeauty — Roadmap

## ✅ Feito

### Infraestrutura
- [x] Next.js 15 + TypeScript + Tailwind + Supabase
- [x] Deploy automático via GitHub → Vercel
- [x] Domínio custom `beta.carreirabeauty.com`
- [x] Favicon + logo oficial (horizontal e quadrada)
- [x] Páginas de Política de Privacidade e Termos de Serviço

### Autenticação
- [x] Magic link (e-mail)
- [x] Login com Google (OAuth)
- [x] Callback de auth configurado

### Onboarding
- [x] Onboarding empresa (7 etapas: CNPJ, dados, responsável, WhatsApp, categoria, funcionários, foto/Instagram)
- [x] Onboarding profissional (especialidade, cidade, experiência, disponibilidade, pretensão, formação, vínculo, foto)
- [x] StepShell com barra de progresso segmentada

### Dashboard
- [x] Dashboard empresa (stats de vagas + candidatos, listagem de vagas)
- [x] Dashboard profissional (listagem de vagas disponíveis, candidatura)
- [x] Edição de perfil empresa
- [x] Edição de perfil profissional

### Vagas
- [x] Criação e publicação de vagas (empresa)
- [x] Listagem de candidatos por vaga
- [x] Candidatura por profissional
- [x] Contato via WhatsApp com candidato

### Perfil público
- [x] Página `/perfil/[slug]` do profissional
- [x] Slug automático com histórico de slugs anteriores

### Admin
- [x] Painel admin com visão geral
- [x] CRUD de empresas, profissionais, vagas, candidaturas
- [x] Bloquear/desbloquear empresa e profissional
- [x] Admin config: gerenciar profissões e tipos de negócio (tabelas `profissoes` + `categorias_negocio`)

### Design System
- [x] Tokens CSS (magenta `#DC00DC` + cyan `#00AAC8` + blush `#E23D81`)
- [x] Tipografia: Baloo 2 (display) + Inter (body)
- [x] Aplicado em todas as telas: login, dashboards, onboarding, perfil público, candidatos, edição de perfil

### Home / Marketing
- [x] Home page pública com hero, categorias, como funciona, depoimentos, CTA final e footer

---

## 🔜 Próximo

### Profissional — múltiplas funções
- [ ] Coluna `funcoes text[]` no banco
- [ ] Onboarding: multi-select de especialidades
- [ ] Edição de perfil: pills clicáveis no lugar do select
- [ ] Perfil público: exibir múltiplas especialidades

### Onboarding e perfil — dados dinâmicos
- [ ] Onboarding profissional buscar profissões da tabela `profissoes`
- [ ] Onboarding empresa buscar tipos de negócio da tabela `categorias_negocio`
- [ ] Edição de perfil (ambos) idem

### Fase 4 — Trial e Pagamentos
- [ ] Mercado Pago Preapproval API (assinaturas recorrentes)
- [ ] Trial de 7 dias por CNPJ (sem cartão)
- [ ] Bloquear publicação de vagas após trial expirado
- [ ] Página de assinatura / upgrade

### Fase 5 — Engajamento
- [ ] E-mail semanal com vagas novas para profissionais (Resend)
- [ ] Notificação para empresa quando receber nova candidatura

### Fase 6 — Qualidade e Crescimento
- [ ] Fotos de portfólio do profissional
- [ ] SEO: sitemap, meta tags por página, structured data
- [ ] MCP do Supabase configurado (para migrations direto pelo Claude)
- [ ] Backup automático via GitHub Action (quando Pro ou tráfego real)

---

## 💡 Backlog / Ideias
- Busca de profissionais por cidade e especialidade
- Filtros de vagas (função, regime, cidade)
- Sistema de avaliações empresa ↔ profissional
- App mobile (PWA ou React Native)
- Painel de métricas no admin (conversão, retenção)
