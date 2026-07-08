# CarreiraBeauty — Reconstrução do Zero

> Documento de trabalho para definir modelo de negócio antes de partir para especificação técnica (Claude Code).

Status geral: 🟡 em preenchimento

---

## 1. Visão Geral

**O que é:** Marketplace de empregos para o setor de beleza e saúde estética, conectando estabelecimentos (salões, esmalterias, clínicas) a profissionais que buscam vagas/freelas.

**Motivo da reconstrução:** Site anterior saiu do ar. Relançamento do zero.

**Domínio:** carreirabeauty.com (a confirmar se mantém)

---

## 2. Os Dois Lados do Marketplace

### Lado Empregador (demanda por profissionais)
- Quem: salões, esmalterias, clínicas de estética, spas, barbearias
- Tamanho do negócio: misturado — de independente pequeno a redes/franquias, sem perfil dominante
- Dor principal: dificuldade de achar profissional bom (escassez de mão de obra qualificada)

### Lado Profissional (oferta de mão de obra)
- Quem: cabeleireiros, manicures/pedicures, esteticistas, maquiadores, massagistas, **e também recepcionistas** dos próprios estabelecimentos (vagas administrativas do setor, não só técnicas)
- Perfil de vínculo: misturado (CLT, PJ, freela) — sem predominância clara
- Nível de digitalização: médio — usa WhatsApp e Instagram, mas resiste a apps/plataformas novas → cadastro precisa ter fricção mínima

---

## 3. Diferencial Competitivo

Concorrente real: grupos de WhatsApp, Instagram, indicação boca a boca — não outros job boards.

O que faria alguém preferir a plataforma a isso?
- [x] **Filtro geográfico fino (bairro, raio de distância)** — diferencial principal, já que profissional de beleza tende a trabalhar perto de casa
- [x] Verificação/selo de profissional e sistema de avaliação — **ficam para v2**, não entram no MVP
- [x] **Portfólio de fotos condicional à função** — relevante para funções técnicas (cabelo, unha, estética); irrelevante para administrativas (recepcionista)
- [ ] Contratos simplificados (CLT, PJ, freela) integrados
- [ ] Outro: ___

---

## 4. Monetização

Opções em discussão:

| Modelo | Descrição | Prós | Contras |
|---|---|---|---|
| Vaga avulsa paga | Empresa paga por vaga publicada | Simples, receita previsível por volume | Fricção de entrada, pode afastar pequenos salões |
| Assinatura mensal | Empresa paga plano com X vagas/mês | Receita recorrente | Precisa de volume de empresas fiéis |
| Freemium + destaque pago | Publicar grátis, destaque/urgente pago | Baixa fricção, cresce oferta rápido | Receita mais lenta no início |
| Acesso a banco de currículos | Empresa paga para buscar/filtrar profissionais ativamente | Alto valor percebido | Exige massa crítica de profissionais cadastrados |
| Comissão por contratação | Cobra só quando dá match/contratação | Alinhado a resultado | Difícil de rastrear/cobrar, ciclo longo |
| Perfil premium do profissional | Profissional paga por destaque no perfil | Receita adicional | Risco de afastar candidatos (raramente pagam) |

- [x] **Modelo escolhido:** só o empregador paga (profissional sempre grátis)
- [x] **Estrutura:** trial de 7 dias grátis, 1 vaga por CNPJ → após o trial, assinatura mensal por CNPJ libera vagas ilimitadas
- [x] **Unidade de cobrança:** por CNPJ (não por vaga) — mensalidade simples, sem limite de vagas ativas enquanto assinante
- [ ] Valor da mensalidade: a validar com mercado (sem referência ainda)
- [x] **Pós-trial sem assinatura:** vaga permanece visível na busca, mas fica bloqueada para novas candidaturas até a empresa assinar
- [ ] Ticket médio esperado por empresa:
- [x] Dados do negócio anterior: não disponíveis no momento — relançamento sem histórico de referência

---

## 5. Personas (a detalhar)

### Persona Empregador
- Nome fictício:
- Tamanho do estabelecimento: variável (independente a rede)
- Principal dor: dificuldade de achar profissional bom
- Onde busca profissionais hoje: Instagram, WhatsApp, indicação
- Gatilho para publicar vaga na plataforma: combinação de urgência (repor rápido), qualidade (filtrar melhor que redes sociais) e alcance (chegar além dos seguidores)
- O que o faria pagar pela plataforma: (a detalhar — provavelmente ligado a taxa de sucesso de contratação)

### Persona Profissional
- Nome fictício:
- Tipo de vínculo desejado (CLT/PJ/freela): misto
- Principal dor:
- Onde busca vagas hoje: WhatsApp, Instagram, indicação
- Gatilho de uso: combinação — desemprego/busca ativa, troca por oportunidade melhor, e complemento de renda com freelas
- O que o faria voltar à plataforma: (a detalhar)

---

## 6. Funcionalidades Core (MVP)

### Empregador
- [x] Cadastro de empresa com **validação automática de CNPJ via API pública** (Receita Federal/terceira) — controla o trial de 7 dias por CNPJ
- [ ] Publicar vaga (com geolocalização — bairro/raio, ver seção 3)
- [ ] Ver candidatos / banco de currículos
- [ ] Chat com candidato
- [ ] Gestão de vagas (ativa/pausada/fechada, trial vs. assinante)
- [ ] Cobrança/assinatura (após trial de 7 dias)

### Profissional
- [x] Cadastro de perfil simples (currículo básico) — **sem** teste/certificação no MVP (fica pra v2)
- [ ] Portfólio de fotos (condicional à função — técnica sim, administrativa não)
- [ ] Busca/filtro de vagas (localização, tipo, remuneração)
- [x] **Candidatura em 1 clique** com perfil já preenchido (sem re-digitar dados a cada vaga)
- [ ] Notificações de novas vagas compatíveis

### Plataforma / Admin
- [ ] Moderação de vagas e perfis
- [ ] Dashboard de métricas
- [ ] Sistema de pagamento/cobrança (trial → assinatura mensal por CNPJ)
- [ ] Integração com API de validação de CNPJ

---

## 7. Escopo Fora do MVP (v2+)

- [x] Verificação/selo de profissional
- [x] Sistema de avaliação (notas/reviews)
- [x] Teste de habilidade / upload de certificados
- [ ] App mobile nativo — a decidir
- [ ] Contratos digitais integrados — a decidir
- [ ] Cursos/certificações parceiras — a decidir
- [ ] Folha de pagamento para freelas — a decidir

---

## 7.5. Onboarding e Cadastro (mobile-first)

> Prioridade atual: cadastro deve ser feito 100% pelo celular, sem fricção desnecessária. Sem validação de telefone via OTP no MVP (confia no dado informado).

### Cadastro Empresa (empregador)

Cadastro **completo** logo de início (não é só o essencial) — inclui:

| Campo | Obrigatório | Observação |
|---|---|---|
| Email | Sim | **Login/autenticação principal** — via link de confirmação ou Google OAuth |
| CNPJ | Sim | Validado automaticamente via API pública (Receita Federal/terceira) — controla o trial de 7 dias |
| Nome do estabelecimento | Sim | |
| Nome do responsável | Sim | Pessoa de contato |
| Telefone/WhatsApp | Sim | Dado de contato apenas — não usado para login. Sem validação OTP no MVP |
| Endereço completo | Sim | **Crítico** — base do filtro geográfico e do email semanal de candidatos |
| Categoria do negócio | Sim | Salão / esmalteria / clínica de estética / spa / barbearia / outro |
| Número de funcionários | Sim | Faixa (ex: 1-5, 6-20, 20+) — ajuda a segmentar depois |
| Logo/foto do estabelecimento | **Opcional** | Não bloqueia cadastro nem publicação de vaga |
| Instagram | Opcional no campo, mas **necessário antes da 1ª vaga** | Ver regra de bloqueio abaixo |

- [x] **Regra de bloqueio:** publicar a 1ª vaga (início do trial) exige cadastro 100% completo, incluindo logo e Instagram — não é possível publicar com dados parciais

### Cadastro Profissional

Cadastro **completo** logo de início, para permitir candidatura em 1 clique desde o primeiro uso:

| Campo | Obrigatório | Observação |
|---|---|---|
| Email | Sim | **Login/autenticação principal** — via link de confirmação ou Google OAuth |
| Nome | Sim | |
| Telefone/WhatsApp | Sim | Dado de contato apenas — não usado para login. Sem validação OTP no MVP |
| Função/especialidade | Sim | Cabeleireiro, manicure, esteticista, recepcionista, etc. |
| Localização | Sim | **Crítico** — base do filtro geográfico e do email semanal de vagas próximas |
| Experiência | Sim | Tempo de atuação na função |
| Disponibilidade | Sim | Dias/horários ou tipo (integral, meio período, freela) |
| Pretensão salarial | Sim | Faixa de valor esperado |
| Educação básica (curso/formação) | Sim | Aparece na página pública do perfil — ver seção 7.9 |
| Tipo de vínculo desejado | **Opcional** | CLT / PJ / freela — não bloqueia cadastro |
| Foto de perfil | **Opcional** | Pode adicionar depois, não bloqueia candidatura em 1 clique |
| Portfólio de fotos do trabalho | **Opcional** | Condicional à função (técnica sim, administrativa não) — ver seção 3 |

### Fluxo de Onboarding (rascunho)

**Empresa:** baixar app/abrir site → informar CNPJ (valida na hora) → completar dados do estabelecimento → publicar 1ª vaga (trial de 7 dias inicia) → tela de "vaga no ar, candidatos aparecem aqui"

**Profissional:** baixar app/abrir site → cadastro completo (nome, telefone, função, localização, experiência, disponibilidade, pretensão) → tela de vagas já filtradas por localização/função → candidatura em 1 clique

- [x] **Formato: multi-step** — uma pergunta/grupo de perguntas por tela (estilo Typeform), com sensação de progresso, em vez de formulário longo de rolagem

### Sequência de telas — Empresa

1. **Email** → login via Google OAuth (1 toque, se disponível) ou email + link de confirmação
2. **CNPJ** → validação automática via API pública, pré-preenche nome e endereço
3. **Confirmar/ajustar nome do estabelecimento e endereço** (dados vindos da API, editáveis)
4. **Nome do responsável**
5. **Telefone/WhatsApp** (dado de contato, sem OTP no MVP)
6. **Categoria do negócio** (salão / esmalteria / clínica / spa / barbearia / outro)
7. **Número de funcionários** (faixa: 1-5, 6-20, 20+)
8. **Logo e Instagram** (obrigatórios para liberar a publicação — ver regra de bloqueio)
9. **Publicar 1ª vaga** → inicia o trial de 7 dias

Total: 8 telas de cadastro + 1 de publicação da vaga.

### Sequência de telas — Profissional

1. **Email** → login via Google OAuth (1 toque, se disponível) ou email + link de confirmação
2. **Nome + telefone/WhatsApp** (dado de contato, sem OTP no MVP)
3. **Função/especialidade** (cabeleireiro, manicure, esteticista, recepcionista, etc.)
4. **Localização** (pode mostrar gancho: "X vagas perto de você")
5. **Experiência** (tempo de atuação na função)
6. **Disponibilidade** (dias/horários ou integral/meio período/freela)
7. **Pretensão salarial** (faixa)
8. **Educação básica** (curso/formação) — vai para a página pública do perfil (ver seção 7.9)
9. **Tipo de vínculo desejado** (CLT/PJ/freela) — opcional, pode pular
10. **Foto de perfil e portfólio** — opcional, pode pular
11. **Tela de vagas filtradas** por localização/função → candidatura em 1 clique

Total: 9-10 telas de cadastro (2 puláveis) + tela de resultado.

- [ ] Prototipar/validar essas sequências com usuários reais antes de codar

---

## 7.6. Autenticação

- [x] **Método principal: email** — usado por empresa e profissional para login
- [x] **Validação:** link de confirmação por email, ou Google OAuth (login com 1 toque para quem já tem conta Google — reduz fricção, já que muita gente já está logada no Gmail no celular)
- [x] **Telefone/WhatsApp:** permanece no cadastro como dado de contato, mas **não é usado para login/autenticação**
- [x] Sem validação OTP por SMS no MVP

---

## 7.7. Email Semanal (engajamento e retenção)

Disparo semanal automático para ambos os lados — importante para um marketplace em fase inicial (mantém as duas pontas engajadas mesmo com baixo volume ainda).

### Para a Empresa
- **Conteúdo:** novos candidatos que se candidataram às vagas publicadas por ela na semana
- **Filtro:** apenas candidatos que efetivamente aplicaram (sem filtro de raio aqui — é sobre quem já demonstrou interesse na vaga)

### Para o Profissional
- **Conteúdo:** novas vagas abertas na semana, compatíveis com a função dele
- **Filtro:** apenas vagas dentro do **raio de localização** do profissional
- **Raio:** fixo para todos no MVP (valor exato a definir, ex: 15km) — não configurável pelo usuário nesta versão

### Implicações técnicas
- [x] **Localização é um dado crítico** para ambos os lados — usada tanto no filtro de busca quanto no email semanal
- [ ] Valor exato do raio fixo (km): a definir depois, com dados reais de uso (evita chutar um valor que gere email vazio ou vagas longe demais)
- [x] **Disparo:** segunda-feira de manhã, para os dois lados
- [ ] Precisa de geocoding do endereço (empresa) e localização (profissional) para calcular distância — usar API de geocoding (Google Maps, Mapbox, ou similar)

---

## 7.8. Taxonomia — Categorias e Funções

### Categorias de Negócio (Empregador) — validado

- [x] Salão de beleza / cabeleireiro
- [x] Esmalteria / nail designer
- [x] Clínica de estética
- [x] Barbearia
- [x] Spa / massoterapia
- [x] Estúdio de sobrancelha/cílios
- [x] Outro (campo livre)

### Funções de Profissional — validado

- [x] Cabeleireiro(a)
- [x] Manicure/pedicure
- [x] Esteticista
- [x] Maquiador(a)
- [x] Barbeiro
- [x] Massoterapeuta
- [x] Designer de sobrancelha/cílios
- [x] **Depilador(a)** — adicionado
- [x] **Podólogo(a)** — adicionado
- [x] Recepcionista
- [x] Auxiliar/assistente
- [x] Outro (campo livre)

---

## 7.9. Página Pública do Profissional (estilo LinkedIn)

Conceito: o perfil do profissional vira uma página pública própria — funciona como currículo online para quem não tem um formal. Diferencial forte de retenção e aquisição orgânica.

- [x] **Escopo:** versão simples no MVP; versão completa (rica) fica para v2
- [x] **Indexação:** página pública **indexável no Google** — alguém pesquisa o nome da pessoa e encontra o perfil (gera tráfego orgânico, funciona como vitrine)
- [x] **Busca ativa por empresas:** **fora do MVP** — no MVP a empresa só vê quem se candidatou diretamente à vaga; buscar/filtrar o banco de perfis publicamente fica para depois (relaciona-se com a opção de monetização "acesso a banco de currículos" da seção 4, a revisitar)

### Campos da página — MVP (versão simples)
- Nome
- Função/especialidade
- Localização
- Experiência (tempo de atuação)
- Disponibilidade
- **Educação básica** (curso/formação) — campo novo, adicionar ao cadastro (seção 7.5)

### Campos da página — v2 (versão completa, a detalhar)
- Portfólio de fotos do trabalho
- Histórico de experiências (múltiplos empregos, com período)
- Recomendações/avaliações de empregadores
- Demais detalhes: **a definir quando chegar a hora do v2**

- [x] **URL pública:** `carreirabeauty.com/perfil/nome-sobrenome-cidade` — inclui cidade no slug (ajuda SEO local, ex: buscas do tipo "manicure em campinas")
- [x] **Colisão de slug:** quando nome+cidade já existir, adicionar código curto aleatório no final (ex: `joana-silva-campinas-x7k9`)
- [x] Campo "Educação básica" já adicionado na tabela de cadastro do profissional (seção 7.5) e na sequência de telas

---

## 9. Especificação Técnica

### Plataforma
- [x] **Só site responsivo (mobile-first) no MVP** — sem app nativo iOS/Android nesta fase
- [x] Página pública do profissional (seção 7.9) precisa ser **server-rendered/SEO-friendly** (indexável no Google)

### Stack sugerida
- [x] **Framework:** Next.js (React + TypeScript) — SSR/SSG nativo, essencial para a página pública indexável, e um único framework cobre front-end + back-end (API routes)
- [x] **Banco de dados:** PostgreSQL gerenciado (Supabase ou Neon) — suporta dados geográficos (PostGIS/extensões) para o filtro por raio (seção 7.7)
- [x] **Controle de versão: GitHub** — repositório criado já na Fase 0 (conta já existe, sem repo ainda). Todo o histórico de código (e deste próprio `.md`) versionado por commits
- [x] **Hospedagem:** Vercel (deploy do Next.js) + banco gerenciado (Supabase/Neon) — Vercel integra direto com GitHub: cada push gera deploy automático (preview em PRs, produção na branch principal)
- [x] **Ambientes (staging/produção) no plano gratuito (Hobby):** confirmado, funciona por branch, sem custo:
  - Push/merge na branch principal (`main`) → deploy automático de **produção**, domínio final
  - Push em qualquer outra branch, ou qualquer Pull Request → deploy automático de **preview** (URL própria) — funciona como staging para testar antes do merge
  - Ambientes customizados nomeados com variáveis fixas (ex: um "staging" persistente e configurável) só existem nos planos Pro/Enterprise — não é uma limitação prática no MVP, o fluxo de branch/PR já cobre a necessidade de testar antes de ir pra produção
  - Fluxo sugerido: trabalhar em branch `dev` (ou PRs de feature), validar no preview automático, só então merge em `main`
- [x] **Autenticação:** provedor de auth (ex: Supabase Auth, Clerk, ou NextAuth) com suporte a login por link mágico (email) e Google OAuth — cobre a seção 7.6 sem construir do zero
- [x] **Email transacional/semanal:** serviço de envio (ex: Resend, Postmark) + job agendado (cron) para o disparo de segunda de manhã (seção 7.7)
- [x] **Geocoding:** API de geocoding (Google Maps Geocoding API ou Mapbox) para converter endereço da empresa e localização do profissional em coordenadas, usadas no filtro por raio
- [x] **Validação de CNPJ:** API pública de CNPJ (ex: BrasilAPI, ReceitaWS) para a validação automática no cadastro da empresa (seção 7.5)
- [x] **Pagamento/assinatura:** gateway de pagamento com suporte a assinatura recorrente (ex: Stripe ou um gateway nacional como Pagar.me/Asaas — nacional facilita para PIX/boleto, relevante pro público de salões pequenos)

- [x] **Gateway de pagamento: precisa ser nacional** (confirmado) — internacional (Stripe) descartado pelo perfil do público (salões pequenos, preferência por PIX/boleto)
- [ ] **Qual gateway nacional: ainda pendente**, opções comparadas (pesquisa de jul/2026):

| Gateway | Taxa (assinatura/PIX) | Perfil | Observação |
|---|---|---|---|
| **Asaas** | 1,99% sobre assinatura; 30 transações PIX grátis/mês; API gratuita | Popular entre pequenos negócios/freelancers no Brasil — marca pode já ser familiar ao público de salões | Boa documentação, integração simples |
| **Vindi** | Taxas por cotação | Especializada em cobrança recorrente (esse é o produto principal, não um adicional) | Terceiriza toda a lógica de ciclo de vida da assinatura (trial → cobrança → renovação → cancelamento) — menos código para manter no MVP |
| **Mercado Pago** | Pix 0,99%; Crédito 4,49% | Menor barreira de entrada, marca mais reconhecida pelo usuário final | Menos estruturado para assinatura recorrente — mais focado em checkout avulso |
| **Pix Automático (nativo, via PSP)** | 0,22%–0,35% direto no Banco Central; 0,28%–0,99% via PSP como Asaas | Novo padrão do Banco Central (lançado início de 2026) para débito recorrente via Pix | Tecnologia mais nova — vale monitorar maturidade de suporte antes de depender dela no MVP |

- [x] Inclinação inicial (não decidido): **Asaas** pelo custo baixo + familiaridade da marca com o público, ou **Vindi** se preferir terceirizar a lógica de assinatura em vez de construir no banco de dados (seção 10, entidade Subscription)
- [x] **Geocoding/mapas: Google Maps Geocoding API** — mais preciso e conhecido no Brasil

### Próximos passos técnicos
1. [x] Especificar modelo de dados — alto nível (seção 10)
2. [ ] Detalhar arquitetura de pastas/módulos do Next.js
3. [ ] Briefing final para o Claude Code construir o MVP

---

## 10. Modelo de Dados (alto nível)

### Entidades principais

**User** (conta de autenticação, base para os dois lados)
- id, email, tipo (empresa | profissional), criado_em
- Login via magic link ou Google OAuth (seção 7.6)

**Company** (empresa/empregador) — 1:1 com User do tipo "empresa"
- id, user_id, cnpj, nome_estabelecimento, responsavel, telefone, endereço, latitude/longitude (geocoded), categoria_negocio, faixa_funcionarios, logo_url, instagram
- status_cadastro (incompleto | completo)
- trial_iniciado_em, trial_expira_em (7 dias, por CNPJ)
- status_assinatura (trial | ativa | expirada)

**Professional** (profissional) — 1:1 com User do tipo "profissional"
- id, user_id, nome, telefone, função, localização, latitude/longitude (geocoded), experiência, disponibilidade, pretensão_salarial, tipo_vínculo (opcional), educação_básica, foto_perfil_url (opcional)
- slug (para a URL pública — seção 7.9)

**PortfolioItem** — N:1 com Professional (opcional, condicional à função)
- id, professional_id, foto_url, descrição

**Job** (vaga) — N:1 com Company
- id, company_id, função, descrição, tipo_vínculo, faixa_salarial, status (ativa | pausada | fechada | bloqueada_pos_trial)
- criado_em

**Application** (candidatura) — relaciona Professional ↔ Job (N:N via tabela associativa)
- id, job_id, professional_id, criado_em, status (a definir se há status além de "aplicado")

**Subscription** (assinatura) — N:1 com Company
- id, company_id, status, valor, ciclo_cobrança, gateway_pagamento_id, criado_em, renovado_em

### Relacionamentos-chave
- User 1:1 Company **ou** User 1:1 Professional (um User nunca é os dois)
- Company 1:N Job
- Professional 1:N Application, Job 1:N Application (tabela N:N)
- Professional 1:N PortfolioItem
- Company 1:N Subscription (histórico de assinaturas/renovações)

### Notas de implementação
- [x] Latitude/longitude precisam ser persistidas (não só o endereço em texto) para o filtro por raio funcionar com performance — gerar via Google Maps Geocoding API no momento do cadastro
- [x] `slug` do Professional segue a regra da seção 7.9 (nome-sobrenome-cidade + código aleatório em colisão)
- [x] **`Application` é binária no MVP** (aplicou/não aplicou, sem funil de status) — empresa gerencia o contato com o candidato fora da plataforma (WhatsApp, via telefone salvo no cadastro)
- [ ] Definir estrutura exata da tabela de log/histórico para o email semanal (quais candidaturas/vagas já foram "consumidas" no envio anterior, para não duplicar)

---

## 11. Plano de Fases (build incremental com Claude Code)

Objetivo: cada fase gera algo **testável e demonstrável** sozinho, antes de avançar para a próxima. Você roda uma fase, revisa/testa localmente, só então pede a próxima.

### Fase 0 — Fundação
- Setup do projeto Next.js + TypeScript
- Banco de dados (Postgres via Supabase/Neon) + schema inicial (seção 10, sem Subscription/PortfolioItem ainda)
- Autenticação (magic link + Google OAuth)
- **Critério de pronto:** consigo criar conta com email e logar/deslogar

### Fase 1 — Lado Empresa (ponta a ponta, sem pagamento)
- Cadastro multi-step da empresa (seção 7.5), com validação de CNPJ via API pública e geocoding do endereço
- Bloqueio: cadastro precisa estar 100% completo para publicar vaga
- Publicar vaga (sem lógica de trial/pagamento ainda — assume acesso liberado)
- Painel simples: empresa vê as vagas que publicou
- **Critério de pronto:** empresa se cadastra do zero pelo celular e publica uma vaga

### Fase 2 — Lado Profissional (ponta a ponta)
- Cadastro multi-step do profissional (seção 7.5), incluindo educação básica
- Geração automática da página pública (slug, SEO básico — seção 7.9)
- Busca/filtro de vagas por localização (raio) e função
- Candidatura em 1 clique
- **Critério de pronto:** profissional se cadastra, aparece sua página pública, ele encontra e se candidata a uma vaga

### Fase 3 — Conectar os dois lados
- Empresa vê lista de candidatos que se aplicaram em cada vaga publicada
- Exibição dos dados de contato do candidato (telefone) para a empresa entrar em contato fora da plataforma
- **Critério de pronto:** fluxo completo: empresa publica vaga → profissional se candidata → empresa vê e contata

### Fase 4 — Trial e Cobrança
- Lógica de trial de 7 dias por CNPJ (1 vaga grátis)
- Bloqueio de novas candidaturas em vagas pós-trial sem assinatura
- Integração com gateway de pagamento (a confirmar — seção 9) para assinatura mensal
- **Critério de pronto:** trial expira corretamente e cobrança/assinatura funciona de ponta a ponta

### Fase 5 — Retenção (email semanal)
- Job agendado (cron) de segunda de manhã
- Email para empresa: novos candidatos da semana
- Email para profissional: novas vagas dentro do raio
- **Critério de pronto:** recebo os dois emails de teste com dados reais da base

### Fase 6 — Polimento
- Portfólio de fotos (profissional, condicional à função)
- Logo/Instagram da empresa
- Ajustes de SEO da página pública, performance, revisão de UX do multi-step

- [x] Sequência de fases validada

---

## 12. Prompt Inicial para o Claude Code

> Copie o bloco abaixo e cole na primeira mensagem para o Claude Code, no diretório do projeto (com este arquivo `carreirabeauty-projeto.md` salvo na raiz do repositório).

```
Este arquivo (carreirabeauty-projeto.md) é a especificação completa de um marketplace
de empregos para o setor de beleza (CarreiraBeauty), com modelo de negócio, personas,
onboarding, autenticação, modelo de dados e um plano de fases de construção (seção 11).

Antes de escrever qualquer código, leia o documento inteiro e me confirme que entendeu:
- o modelo de negócio (dois lados: empresa e profissional, monetização por CNPJ com trial)
- o modelo de dados (seção 10)
- o plano de fases (seção 11)

Vamos construir por fases, uma de cada vez. Eu vou revisar e testar cada fase antes de
pedir a próxima — não avance para a fase seguinte sem eu confirmar.

IMPORTANTE — este .md é a fonte viva da verdade do projeto: sempre que tomarmos uma
decisão de produto ou técnica durante o desenvolvimento (mudar um campo, decidir um
valor antes pendente, alterar uma regra), atualize a seção correspondente deste arquivo
no mesmo commit da mudança de código relacionada. Não deixe o documento desatualizado.

Comece pela Fase 0 (Fundação):
- Criar repositório no GitHub para o projeto (minha conta GitHub já existe, sem repo
  ainda — pode usar GitHub CLI `gh` se disponível, ou me orientar a criar manualmente
  e conectar o remoto local)
- Configurar o repositório com commits desde o início (incluindo este .md)
- Setup do projeto Next.js + TypeScript
- Banco de dados Postgres (Supabase ou Neon — pode sugerir qual prefere e por quê)
- Schema inicial do banco baseado na seção 10 (só as entidades User, Company, Professional,
  Job, Application — sem Subscription/PortfolioItem ainda)
- Autenticação com magic link por email + Google OAuth (seção 7.6)
- Conectar o repositório à Vercel para deploy automático (produção na branch principal,
  preview em pull requests)

Critério de pronto da Fase 0: eu consigo criar uma conta com email e fazer login/logout,
o código está no GitHub, e o deploy na Vercel está funcionando.

Ao terminar, me dê um resumo do que foi feito, como rodar localmente para testar, o link
do repositório e do deploy, e pare — aguarde minha confirmação antes de seguir para a
Fase 1.
```

- [x] `carreirabeauty-projeto.md` salvo em `~/cbeauty` (raiz do projeto)
- [x] Controle de versão via GitHub, deploy automático via Vercel (integrado ao repo) — instrução incluída no prompt da Fase 0
- [x] Instrução de manter o `.md` sempre atualizado incluída no prompt inicial
- [ ] Repetir o padrão "leia o doc, confirme entendimento, execute só a fase X, pare e aguarde" a cada nova fase

---

## 8. Próximos Passos

1. [x] Fechar seções 2 a 6 deste documento
2. [x] Detalhar onboarding e campos de cadastro (seção 7.5)
3. [x] Definir stack técnica e arquitetura (seção 9)
4. [x] Especificar modelo de dados (seção 10)
5. [x] Plano de fases e briefing para Claude Code (seções 11 e 12)
