# CarreiraBeauty — Reconstrução do Zero

> Documento de trabalho para definir modelo de negócio antes de partir para especificação técnica (Claude Code).

Status geral: 🟢 em produção — MVP lançado em beta.carreirabeauty.com. Ver [CHANGELOG.md](CHANGELOG.md) para o histórico de mudanças recentes e bugs corrigidos. As seções abaixo foram atualizadas para refletir decisões tomadas durante a construção (algumas divergem do planejamento original).

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

> **⚠️ Modelo real implementado diverge do planejado abaixo** — evoluiu de "trial de 7 dias" para **freemium permanente** (mais alinhado ao objetivo de crescer a oferta rápido, seção "Freemium + destaque pago" da tabela acima), e o profissional também tem um plano pago opcional (não é mais "sempre grátis").

- [x] **Modelo implementado: freemium nos dois lados** (não é mais "só empregador paga")
- [x] **Empresa** — planos por CNPJ, sem prazo de trial:

  | Plano | Vagas ativas simultâneas | Candidatos visíveis | Preço/mês |
  |---|---|---|---|
  | Grátis | 1 | 10 | R$ 0 |
  | Basic | 3 | 100 | R$ 49 |
  | Plus | 5 | ilimitado | R$ 99 |
  | Premium | 10 | ilimitado | R$ 179 |

- [x] **Profissional** — planos por conta:

  | Plano | Candidaturas/mês | Preço/mês |
  |---|---|---|
  | Grátis | 10 | R$ 0 |
  | Pro | ilimitado | R$ 29 |

- [x] **Gateway de pagamento implementado: Mercado Pago** (assinatura recorrente) — decisão da seção 9 (Asaas/Vindi eram cogitados, mas o time optou por Mercado Pago)
- [x] **Sem trial expirando:** toda empresa/profissional tem acesso permanente ao plano grátis (1 vaga / 10 candidaturas por mês) — não há bloqueio por tempo, só por limite de uso simultâneo
- [ ] Ticket médio esperado por empresa/profissional: a validar com dados reais de conversão
- [x] Dados do negócio anterior: não disponíveis no momento — relançamento sem histórico de referência

### 4.1. Brainstorm — Evolução do modelo de monetização (não decidido, guardado para depois)

Aprendizado de campo (jul/2026): empresa resiste a pagar por exposição/anúncio, mas paga por **resultado** (ver candidatos reais). Profissional não paga pelo básico, mas historicamente paga por **elevação de status** (padrão visto em outras plataformas: LinkedIn Premium, Upwork, apps de namoro, etc.). O modelo freemium já implementado (acima) é a base — as ideias abaixo são possíveis evoluções/refinamentos dele, ainda não implementadas.

**Lado Empresa — modelos de "pagar por resultado" avaliados:**

1. **Faixas de volume mensal (planos fixos)** — próximo do que já está implementado hoje (tabela acima já é isso, na prática: grátis até 10 candidatos, Basic/Plus/Premium por faixa). Validar se os limites/preços atuais capturam bem a disposição a pagar.
2. **Créditos avulsos (pay-as-you-go)** — empresa compra pacotes de desbloqueio de currículo sem assinatura fixa, mais flexível pra quem contrata raramente (hoje não existe essa opção, só planos fixos)
3. **Híbrido** — assinatura base barata + créditos extras avulsos se estourar o limite do plano

**Lado Profissional — monetizar "status", conectando com itens já listados como v2 na seção 7:**

- **Selo verificado** (identidade/certificado confirmado) — hoje listado como feature de v2 gratuita; considerar torná-la paga
- ~~**Destaque no perfil/busca**~~ — ✅ **implementado (jul/2026)**, virou benefício central do PRO: candidato PRO vai pro topo da lista de candidatos da vaga, com selo "✦ PRO" e borda destacada no card que a empresa vê. Ver nota de correção abaixo
- **Analytics de perfil** ("quem viu seu currículo") — gatilho de status clássico, implementação relativamente simples
- **Distribuição ampliada** — engine que sugere o perfil pago pra mais empresas/vagas automaticamente, mesmo sem candidatura ativa (reconecta com "acesso a banco de currículos" — hoje fora do MVP, seção 7.9)
- **Selo "Top Rated"** pós-avaliações — pode ser ganho de graça por performance, com opção paga de destaque adicional (conecta com "sistema de avaliação", hoje v2)

- [ ] **Decisão adiada** — usuário optou por guardar essas ideias para revisitar depois, sem comprometer implementação agora
- [ ] Quando retomar: decidir prioridade entre as 3 opções de empresa e entre as 4-5 opções de status do profissional
- [x] Avaliar se o plano PRO do profissional deveria incorporar features de status → **sim, incorporou** (jul/2026): destaque na lista de candidatos + visuais de perfil PRO + conteúdos entraram no mesmo PRO (R$14,90), sem criar tier adicional — mantém a lógica de "um sim só" de compra (seção 7.9.5)

> **⚠️ Correção importante (jul/2026) — o destaque era vaporware e foi corrigido.** A tela de planos vendia "Destaque nas buscas" / "Apareça primeiro nas buscas de empresas da sua região" desde antes, mas isso **não existia**: não há busca/listagem de profissionais no app (empresa só vê quem se candidatou à vaga dela), e essa lista era ordenada só por data de candidatura, ignorando o plano. Ou seja, o PRO cobrava por um benefício que o produto não entregava. Foi detectado ao escrever copy persuasiva em cima da promessa, e corrigido antes de qualquer assinatura existir (base tinha 0 PROs).
>
> **Lição pro futuro:** o benefício foi renomeado de "Destaque nas buscas" pra **"Topo da lista do salão"** — descreve o que de fato acontece. "Busca" sugeria um produto que não existe (banco de currículos navegável, fora do MVP na seção 7.9).

### 4.2. Brainstorm — Receita recorrente do profissional independente de vaga (não decidido)

**Contexto/motivação (jul/2026):** CAC atual de cadastro profissional ≈ R$2/lead — muito barato. Se essa receita recorrente do profissional não depender do volume de vagas disponíveis, o marketplace escala de forma muito mais independente (não fica refém de crescer o lado empresa em paralelo).

**Problema identificado com o plano Pro atual (R$29/mês, candidaturas ilimitadas):** busca de emprego é um evento **esporádico**, não um hábito diário — hipótese é que o profissional cancela a assinatura assim que consegue emprego, porque o valor vendido (mais candidaturas) desaparece quando o problema dele é resolvido. Isso limita o LTV do plano tal como existe hoje. **Ainda não instrumentado/validado** — não há dado real de churn pós-contratação ainda.

> **Atualização (jul/2026):** o problema acima foi endereçado na prática — o PRO deixou de ser só "candidaturas ilimitadas" e passou a R$14,90 incluindo conteúdos recorrentes e visuais de perfil (vitrine pra clientela própria), justamente as camadas que continuam valendo depois de contratada. Segue **não validado**: com 0 assinantes, ainda não há dado de churn pós-contratação.

**Insight estratégico central:** boa parte do público profissional (freela, autônomo, cadeira alugada) não é só candidato a emprego — também está buscando **clientes próprios**. Monetizar essa camada (ferramenta de marca pessoal / captação de cliente particular) desacopla a receita de "está desempregado ou não", porque o valor continua existindo mesmo depois de contratada ou com clientela própria.

**Direções avaliadas:**

1. **Perfil público (seção 7.9) como ferramenta de captação de cliente próprio** — link personalizado pra compartilhar com cliente particular, analytics de visitas ("quantos clientes em potencial viram seu perfil essa semana"), foco em geração de renda própria, não só emprego CLT
2. **Agenda/portfólio leve integrado** — ferramenta de uso diário (cliente marca horário, mostra fotos de trabalho) — gera hábito de uso constante, não só durante busca de emprego
3. **Produtos financeiros via parceria (receita recorrente indireta)** — antecipação de recebíveis, seguro/acidente para autônomo, conta digital — modelo validado em plataformas de trabalhador informal no Brasil (iFood, 99); receita via comissão, não cobrança direta ao profissional
4. **Assinatura de comunidade/conteúdo** — grupo exclusivo, dicas de precificação/gestão do próprio negócio de beleza — conecta com "cursos/certificações parceiras" já listado em v2 (seção 7)

- [ ] **Pré-requisito antes de escolher direção:** instrumentar e medir churn real do plano Pro (R$29) — validar se cancelamento está de fato correlacionado com "conseguiu emprego", ou se é outro fator (preço, desconhecimento da feature)
- [ ] **Decisão adiada** — usuário optou por guardar as 4 direções para revisitar depois, sem comprometer implementação agora

### 4.3. Síntese estratégica de monetização e meta de faturamento (jul/2026)

**Recomendação de modelo (pesquisa comparativa Catho vs. InfoJobs):**
- [x] **Pilar principal: empresa paga** (freemium por CNPJ, já implementado) — alinhado ao modelo InfoJobs (dominante no Brasil: candidato sempre grátis, empresa paga por vaga/visibilidade), não ao modelo Catho (candidato paga pra "furar fila" — historicamente arriscado: Catho teve EBITDA negativo em 2021 e foi vendida pelo grupo controlador Seek à Redarbor em 2024; hoje Catho e InfoJobs pertencem ao **mesmo grupo controlador**, Redarbor)
- [x] **Pilar de diferenciação: Perfil PRO unificado do profissional** (seção 7.9.5) — nem Catho nem InfoJobs oferecem ferramenta de marca pessoal/captação de cliente para o profissional autônomo; é o "oceano azul" dentro do nicho, além de gerar receita desacoplada do ciclo de vaga (seção 4.2)
- [x] Evitar replicar modelo de "pagar para furar fila de candidatura" (Catho) — mal ajustado ao público de baixa renda (seção 5)

**Modelagem de cenários de receita (Brasil, nicho beleza, regime maduro — não é projeção de curto prazo):**

Premissas: TAM nacional ~1,26M estabelecimentos e ~1,25M profissionais formalizados (seção de pesquisa de mercado, jul/2026). Ticket médio empresa pagante ~R$75/mês (mix Basic/Plus/Premium). Ticket médio profissional pagante ~R$15/mês (mix Perfil PRO R$9,90 + legado Pro R$29). **Atualização jul/2026:** a premissa de ~R$15/mês seguiu válida por outro caminho — em vez do mix de dois SKUs, virou um PRO unificado a R$14,90 (seção 7.9.5).

| Cenário | Penetração empresa | Penetração profissional | Receita empresa/ano | Receita profissional/ano | ARR total |
|---|---|---|---|---|---|
| Conservador | 0,5% (~6.300) | 1% (~12.600) | R$ 5,7M | R$ 2,3M | ~R$ 8M/ano (~R$667k/mês) |
| Base | 2% (~25.000) | 3% (~37.700) | R$ 22,6M | R$ 6,8M | ~R$ 29M/ano |
| Otimista | 5% (~63.000) | 8% (~100.600) | R$ 56,6M | R$ 18,1M | ~R$ 75M/ano |

**Meta de referência: R$500 mil/mês (~R$6M/ano) — avaliada como factível.**
- Exige aproximadamente **~4.700 empresas pagantes** (~0,37% do TAM nacional) + **~9.700 profissionais PRO pagantes** (~0,77% do TAM nacional), mantendo a proporção 71% empresa / 29% profissional do cenário conservador
- **Achado-chave:** essa meta é atingível **só com penetração forte em São Paulo capital**, sem precisar de expansão geográfica — SP capital sozinha já tem ~79.226 estabelecimentos formalizados (seção de pesquisa de mercado); 4.700 empresas pagantes representa ~6% de conversão desse universo local, e ~9.700 profissionais PRO representa ~10-11% da base formal de profissionais da capital
- **Ressalvas:** (a) é faturamento bruto, não lucro líquido — taxas de gateway (Mercado Pago), CAC e infraestrutura reduzem a margem; (b) 6-11% de penetração de mercado endereçável é taxa saudável mas não trivial, exige anos de execução consistente e boa retenção (ainda não medida — ver pré-requisito de churn acima); (c) não é uma previsão de prazo, só uma validação de que a meta é estruturalmente plausível dado o tamanho do mercado

**Primeiro milestone de curto prazo: R$50 mil/mês (~R$600k/ano) — 1/10 da meta de R$500k/mês.**
- Exige proporcionalmente **~470 empresas pagantes** + **~970 profissionais PRO pagantes**
- Em relação a São Paulo capital: ~0,6% de conversão dos estabelecimentos formalizados (~79.226) + ~1,1% da base formal de profissionais — fração pequena da cidade, não exige dominância nem expansão geográfica
- Em relação ao Brasil: ~0,04% dos estabelecimentos nacionais e ~0,08% dos profissionais formalizados — marginal
- Avaliado como meta de tração inicial bem dimensionada, anterior à meta de R$500 mil/mês acima

### 4.4. Hipótese — Créditos/micro-transações substituindo a assinatura recorrente (jul/2026, a testar)

**Contexto/motivação:** com mais de 200 profissionais cadastrados, **zero conversões** na assinatura PRO (R$14,90/mês) até o momento — mesmo com o certificado avulso (R$29,90, seção 7.9.7) precificado *acima* da assinatura de propósito para ancorar o PRO como "escolha óbvia". O fato de nem isso ter convertido é sinal de que o problema pode não ser preço, e sim o **mecanismo de recorrência em si** não conectar com esse público.

**Checagem recomendada antes de agir sobre a hipótese:** olhar os dados já instrumentados — `template_eventos.paywall_hit` e tentativas de resgate de certificado — para separar "problema de mecanismo" de "problema de volume/exposição" (pouca gente sequer chegou ao paywall ainda).

**Hipótese:** trocar a assinatura recorrente por um sistema de **créditos/moeda interna**, ganho por comportamento (completar perfil, indicar amigo) e gasto em desbloqueios pontuais (conteúdo, certificado), com opção de recarga via Pix/cartão para quem não quiser "ganhar" o crédito fazendo ações. Racional: Pix avulso e moeda de jogo/app (Free Fire, apps de aposta) são modelos mentais muito mais familiares a esse público de baixa renda do que assinatura recorrente estilo SaaS — mais alinhado ao comportamento financeiro real observado (renda variável, desconfiança de cobrança recorrente, sem cancelamento funcional no app hoje).

**⚠️ Cuidado ético deliberado (jul/2026):** a inspiração vem de jogos/apps de aposta ("bets"), mas **sem importar mecânica de sorte/aleatoriedade** (roleta, caixa-surpresa, recompensa variável) — cada ação vale um número fixo e previsível de crédito. Replicar gatilho de recompensa variável (o que torna apps de aposta psicologicamente pesados) num público de baixa renda, numa plataforma de emprego, é um risco ético que não será adotado, além de atrair comparação regulatória indesejada com bets num momento de escrutínio forte desse setor no Brasil.

**Desenho do MVP de teste (enxuto, reaproveitando o que já existe):**
- [ ] **Moeda:** nome simples, não-financeiro (ex: "Estrelas" ou "Pontos Beauty") — evita soar como cripto/ficha de cassino
- [ ] **Ganhar (2 ações no teste inicial):**
  - Completar perfil — pontuação por etapa preenchida (não tudo-ou-nada), ataca de quebra os ~40% de cadastros incompletos já identificados (seção 13)
  - Indicar profissional que se cadastra **e completa o onboarding** — crédito só libera quando o indicado tem `slug` preenchido (reaproveita o mesmo sinal do feed de atividade, seção 7.10, evita farm de conta fake)
- [ ] **Gastar (2 superfícies já existentes, sem construir nada novo):**
  - Desbloquear certificado (seção 7.9.7)
  - Desbloquear conteúdo PRO / template PRO (seções 7.9.4/7.9.6)
- [ ] **Modelo híbrido:** mesmo saldo pode vir de comportamento (grátis) ou recarga via Pix (pago) — quem não quer "ganhar" créditos, compra direto
- [ ] **Sem mecânica de sorte/aleatoriedade** — decisão fechada, ver cuidado ético acima

**Pendência explícita:** esse modelo substitui a base de receita recorrente (MRR) que sustenta os milestones de R$50k/R$500k por mês (seção 4.3) — remodelagem da projeção de receita fica para depois de validar a hipótese com dado real, não é pré-requisito para testar.

- [ ] **Pronto para implementação pelo Claude Code (MVP enxuto):** sistema de créditos com as 2 ações de ganho e 2 superfícies de gasto acima, modelo híbrido com recarga Pix, sem elementos de aleatoriedade
- [ ] Antes de implementar: checar `template_eventos.paywall_hit` e tentativas de resgate de certificado para confirmar que o problema é de mecanismo e não de volume

#### Estrutura do paywall — como créditos e pacote convivem (jul/2026)

Não são 3 opções com peso igual — é uma **opção primária dinâmica** + assinatura como alternativa secundária, mantendo a lógica de "um sim só" já usada no resto do produto:

- [ ] **Botão principal muda conforme o saldo de créditos da pessoa:**
  - Saldo suficiente → "Resgatar com X créditos" (1 toque, sem fricção)
  - Saldo parcial → "Use seus X créditos + complete R$Y no Pix" (calcula desconto automaticamente — mesmo padrão de vale-presente + cartão já familiar no varejo brasileiro)
  - Sem saldo → "Pague R$Z no Pix" como principal, com link menor abaixo ("ou ganhe créditos completando seu perfil")
- [ ] **Abaixo do botão principal, sempre visível mas com menos peso visual:** link/card secundário pro pacote PRO por tempo (ver abaixo) — não é um botão do mesmo tamanho, é a opção de quem já percebeu que vai usar mais de uma vez
- [ ] **Upsell contextual, não repetitivo:** a partir da 2ª compra avulsa no mesmo período, disparar modal específico usando o gasto real da pessoa como argumento (ex: "Você já gastou R$59,80 esse mês em desbloqueios — o pacote de 30 dias sai por R$14,90 e libera tudo") — evita repetir a mesma oferta genérica em todo paywall, e não usa número fabricado (mantém a linha de "sem prova social inventada", seção 7.9.5)

### 4.5. Decisão — Pacote PRO pré-pago substitui assinatura recorrente (jul/2026)

**Contexto:** no fluxo de busca de emprego, o profissional não tem previsibilidade de renda — assinatura recorrente (cobrança automática todo mês) é um modelo de risco pra quem não sabe se vai ter dinheiro no mês seguinte. Paralelo direto e já validado culturalmente no Brasil: a preferência histórica por **celular pré-pago em vez de pós-pago** em público de renda instável, pelo mesmo motivo — controle total, sem risco de cobrança surpresa.

**Decisão: substituir a assinatura recorrente (cobrança automática via Mercado Pago) por pacotes PRO pré-pagos, sem renovação automática.**

| Pacote | Duração | Preço sugerido | Lógica |
|---|---|---|---|
| 30 dias | 1 mês | R$14,90 (mantém o preço atual) | Entrada, testa o valor |
| 3 meses | 90 dias | ~R$39,90 (~R$13,30/mês) | Desconto por comprometer mais tempo |
| 12 meses | 365 dias | ~R$139,90 (~R$11,65/mês) | Maior desconto, cobre um ciclo real de busca de emprego |

**Por que isso é melhor que a assinatura atual, não só "mais uma opção":**
- **Resolve o botão de cancelamento quebrado (seção 7.9.5) por construção** — não existe nada pra cancelar, o acesso simplesmente expira na data. Elimina o medo de "esqueci de cancelar e fui cobrado de novo", provável causa parcial do zero de conversão até hoje
- **Mais simples de construir que assinatura recorrente de verdade** — não precisa da lógica de renovação/webhook de cobrança repetida do Mercado Pago, é pagamento único com data de validade (`plano_validade`, já existe no modelo de dados, seção 10)
- **Reaproveita o fallback já construído:** quando o pacote expira, a conta volta pro grátis sozinha — mesmo mecanismo já implementado pros templates PRO (seção 7.9.6, "se profissional deixa de ser PRO, a página volta pro Clássico sozinha"), só que disparado por data de expiração em vez de cancelamento
- **Conecta com a régua de retenção (seção 7.7):** aviso perto do vencimento (ex: 3 dias antes) — "seu PRO expira em breve, renove aqui" — novo gatilho de email, reaproveitando a infraestrutura de régua semanal já desenhada

**Arquitetura final de monetização do profissional (substitui o desenho anterior de assinatura + avulso):**
1. **Créditos/avulso** (seção 4.4) — pra quem quer **uma coisa específica** (um certificado, um template), ganho por comportamento ou comprado via Pix
2. **Pacote PRO por tempo** (30/90/365 dias) — pra quem quer **acesso completo por um período**, sem risco de cobrança recorrente

- [x] Decisão: assinatura recorrente (cobrança automática) descontinuada, substituída por pacote pré-pago sem renovação automática
- [ ] **Pronto para implementação pelo Claude Code:** migrar `MP_PLAN_PROFISSIONAL_PRO` (cobrança recorrente) para checkout único por pacote (30/90/365 dias), usando `plano_validade` como data de expiração; reaproveitar o fallback de downgrade automático já existente (seção 7.9.6)
- [ ] Adicionar gatilho de email "PRO expira em breve" na régua de retenção (seção 7.7)
- [ ] Definir se assinantes futuros veem os 3 prazos lado a lado ou se o app sugere um prazo padrão (30 dias) com os outros como alternativa — evitar reintroduzir decisão de 3 opções com peso igual

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
- **Perfil socioeconômico e de leitura:** majoritariamente baixa renda, lê pouco — copy precisa ser informal, direta e simples (evitar termos formais/técnicos tipo "compatível", "monitorado"), e positiva/aspiracional em toda a jornada, inclusive em estados neutros (ex: "nenhuma vaga ainda" deve soar animador, não clínico ou negativo). Vale reforçar com elementos visuais (ícones, ilustrações), não só texto, dado o baixo hábito de leitura.

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

### ⚠️ Pendência de decisão — posição do login no fluxo

Achado real (após 2 dias de campanha, ver seção 13): a implementação atual pede login **antes** da escolha de perfil e do preenchimento dos dados, o que diverge do desenho acima e é apontado como possível causa de abandono (tráfego de anúncio perde o gancho ao ser barrado por criação de conta antes de ver qualquer valor).

**Recomendação em avaliação (não decidida ainda):** mover a criação de conta/login para o **fim** do onboarding, não para o início — deixar a pessoa preencher os dados de perfil primeiro (sem exigir conta) e só pedir email/login na tela final, como etapa que salva/ativa o cadastro (padrão "progressive profiling" — aumenta conclusão ao usar o investimento já feito como incentivo). CNPJ pode continuar sendo coletado cedo no fluxo da empresa (é dado, não é autenticação), mesmo que o login em si vá para o fim.

- [ ] Decidir se essa mudança será aplicada e, se sim, atualizar a sequência de telas acima
- [ ] Se aplicada, considerar captura de evento "iniciou cadastro" via Pixel para permitir remarketing de quem abandona antes do login (já que não há mais email cedo no fluxo para isso)

---

## 7.6. Autenticação

- [x] **Método principal: email** — usado por empresa e profissional para login
- [x] **Validação:** link de confirmação por email, ou Google OAuth (login com 1 toque para quem já tem conta Google — reduz fricção, já que muita gente já está logada no Gmail no celular)
- [x] **Telefone/WhatsApp:** permanece no cadastro como dado de contato, mas **não é usado para login/autenticação**
- [x] Sem validação OTP por SMS no MVP

**Estado real de implementação (atualizado):** login hoje é via botão Google OAuth ou email com código enviado (via Supabase) — o magic link original não performou bem e foi substituído por código.

### ✅ Decisão fechada — login via WhatsApp (avaliado e descartado por ora)

Contexto: público real do CarreiraBeauty é B2C Brasil, profissionais de beleza em geral de baixa renda/menor nível educacional. Pesquisa (jul/2026) mostra que WhatsApp tem penetração de ~98-99% entre usuários de internet móvel no Brasil, independente de faixa de renda, com abertura quase imediata — contra taxa média de abertura de email de ~18%. Custo também não seria impeditivo (categoria Autenticação: R$ 0,034/mensagem).

**Decisão: manter autenticação como está hoje (Google OAuth + código por email via Supabase), sem adicionar WhatsApp como método de login.**

Motivo: o objetivo estratégico do email não é só autenticar — é alimentar a régua de retenção (seção 7.7, email semanal), que depende de ter um email de qualidade coletado. Os métodos atuais **forçam** captura de email de verdade, porque a autenticação não funciona sem ele. Se WhatsApp virasse porta de entrada alternativa, o campo de email perderia essa obrigatoriedade funcional — as pessoas tenderiam a preencher qualquer coisa nele (já que não seria mais necessário pra acessar a conta), enfraquecendo a base de email que a régua de retenção precisa no longo prazo. Prioriza-se o relacionamento futuro (régua barata via email) sobre o ganho de conversão de curto prazo no login.

- [x] WhatsApp como método de **login** — descartado, mantendo email/Google como estão
- [x] WhatsApp como canal da **régua de retenção semanal** — também descartado (seção 7.7), por custo (categoria Marketing bem mais cara que email em escala)
- [x] Uso de WhatsApp fica restrito a dado de contato (empresa liga/manda mensagem pro candidato), não a canal de autenticação ou marketing da plataforma

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
- [x] Depilador(a)
- [x] Podólogo(a)
- [x] Recepcionista
- [x] Auxiliar/assistente
- [x] **Fisioterapeuta** — adicionado
- [x] **Biomédico(a)** — adicionado
- [x] **Micropigmentista** — adicionado
- [x] Outro (campo livre)

> **⚠️ Mudança de modelo:** o profissional pode selecionar **múltiplas funções** (não apenas uma) — campo `funcoes` (array), não mais `funcao` (singular). Reflete que muitos profissionais atuam em mais de uma especialidade (ex: manicure + esteticista). Tabela `profissoes` é administrável pelo admin (`/admin/config`), permitindo adicionar novas funções sem deploy.

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

### 7.9.1. Evolução v2 concreta — "Mini site builder" (âncora de monetização recorrente, conecta com 4.2 direção 1)

**Reposicionamento do produto:** a página pública deixa de ser "só um currículo pra empresa ver" e passa a ser uma **ferramenta de marca pessoal e captação de cliente particular**, no estilo Linktree/Contra verticalizado para beleza. Justificativa: boa parte do público é freela/autônomo que busca cliente próprio, não só vaga CLT — esse uso é contínuo, independente de estar empregado (ver seção 4.2, insight de receita recorrente desacoplada de volume de vaga).

> **⚠️ Unificado com Conteúdo PRO (jul/2026) — ver seção 7.9.5.** A tabela abaixo descreve os recursos do "perfil PRO" isoladamente, mas a decisão final é vender isso **junto** com micro-conteúdos recorrentes (seção 7.9.4) num único plano PRO, não como produtos separados. Motivo: reduz fricção de decisão de compra (público de baixa sofisticação/baixa leitura se beneficia de uma única escolha), aumenta valor percebido pelo mesmo preço, e transforma conteúdo (que seria venda avulsa de baixo LTV) em parte de uma assinatura recorrente — reforça o objetivo de receita recorrente desacoplada de vaga (seção 4.2).

**Tabela Grátis vs. PRO (recursos de perfil/site — ver 7.9.5 para a oferta PRO completa e unificada):**

| Recurso | Grátis (hoje) | PRO (proposto) |
|---|---|---|
| Nome, funções (múltiplas), localização, experiência | ✅ | ✅ |
| Educação básica | ✅ | ✅ |
| Fotos de portfólio | Limitado (poucas, upload manual) | Ilimitado, com álbuns |
| Importar fotos do Instagram | ❌ | ✅ (ver viabilidade técnica abaixo) |
| Captura de avaliação de cliente | ❌ | ✅ (link enviado ao cliente após atendimento, aparece na página) |
| Slug/link personalizado | genérico (nome-cidade-código) | escolha de slug melhor, domínio próprio no futuro |
| Analytics de visitas | ❌ | ✅ ("X pessoas viram seu perfil essa semana") |
| Selo verificado | ❌ | ✅ (reconecta com seção 3 — diferencial de confiança) |

**Viabilidade técnica — importar fotos do Instagram (pesquisa jul/2026):**
- Instagram Basic Display API (a antiga forma simples de importar fotos de qualquer perfil) foi **desativada permanentemente em dez/2024** — não existe mais
- Caminho atual: a própria profissional autoriza via OAuth (**Instagram API with Instagram Login**, para contas pessoais/consumidor, ou **Instagram Graph API** se ela tiver conta Business/Creator) — ela conecta a conta, o app lê as fotos dela com consentimento explícito
- **Não é scraping de terceiro** — é a profissional autorizando acesso às próprias fotos, fluxo legítimo e dentro dos termos da Meta
- Implica em fluxo de "Conectar Instagram" na área PRO, com tela de permissão OAuth padrão

- [x] Direção validada e priorizada pelo usuário como próxima evolução concreta do produto (jul/2026)
- [ ] Detalhar backend: novo campo/relação para fotos importadas do Instagram (extensão do `PortfolioItem`, seção 10)
- [ ] Detalhar fluxo de captura de avaliação (como o link chega ao cliente — WhatsApp? SMS? — e onde fica armazenado, nova entidade tipo `Review`/`Avaliacao`)

### 7.9.2. Pricing — "Perfil PRO" (pesquisa jul/2026)

**Benchmarks avaliados:** Linktree Pro R$22-29/mês, Canva Pro R$35-45/mês (público de renda mais alta que o nosso, referência alta demais). Trinks (gestão de salão, não indivíduo autônomo) R$89-249/mês — não aplicável, público diferente (dono de negócio com funcionários).

**Raciocínio de precificação:** público-alvo é baixa renda e iniciante na profissão — ainda sem clientela formada, então a ferramenta é uma aposta de investimento, não gasto de quem já fatura bem. Preço precisa ficar abaixo da barreira psicológica de R$20/mês, que é a âncora usada por apps de assinatura de massa mirando esse perfil de renda no Brasil (streaming, apps populares costumam ancorar em R$9,90/R$14,90/R$19,90).

- [x] **Decisão: R$ 9,90/mês como preço de lançamento/teste** — mais agressivo, usado para validar conversão antes de eventualmente subir para a faixa R$14,90 recomendada
- [x] **Perfil PRO fica separado do plano Pro de candidaturas (R$29/mês)** — não faz bundle automático; são públicos com necessidade diferente (busca ativa de emprego vs. vitrine para clientela própria), forçar pacote único aumentaria a barreira de entrada de quem só quer uma das duas coisas
- [ ] Considerar desconto anual (~R$99-119/ano, equivalente a R$8-10/mês) após validar conversão do mensal, para aumentar LTV/retenção
- [ ] Revisitar preço após dados reais de conversão no lançamento a R$9,90 — pode subir para R$14,90 se a demanda validar disposição a pagar mais

### 7.9.3. Domínio próprio conectado ao perfil (tier acima do Perfil PRO)

**Conceito:** profissional conecta um domínio próprio (ex: `joanasilva.com.br`, comprado por ela num registrador como Registro.br) que aponta pro mesmo conteúdo já publicado em `carreirabeauty.com/perfil/slug` — mesmo padrão técnico usado por Linktree, Carrd, Webflow para domínio customizado por usuário.

**Viabilidade técnica (pesquisa jul/2026) — confirmada via Vercel (já é a hospedagem escolhida, seção 9):**
- Fluxo: profissional compra o domínio própria (custo dela, à parte — ~R$40/ano para `.com.br`), insere na área PRO, sistema gera registro DNS (CNAME) para ela configurar no registrador, Vercel verifica automaticamente e emite SSL grátis após propagação (24-48h)
- **Limite técnico real:** plano Hobby (gratuito) do Vercel permite até **50 domínios customizados por projeto** — suficiente para validar a feature com um grupo inicial, mas exige migração para o plano Pro do Vercel (pago, US$20/mês por membro, domínios ilimitados) se a adoção passar de 50 profissionais com domínio próprio conectado
- SSL automático e gratuito em todos os planos, sem custo adicional por certificado

**Posicionamento de monetização:** não incluído no Perfil PRO (R$9,90/mês) — vira um **tier/add-on superior**, já que exige investimento adicional da própria profissional (compra do domínio) e gera custo de infraestrutura crescente para a plataforma (upgrade de plano Vercel além de 50 domínios). Faz mais sentido para profissional já mais madura/estabelecida, não para quem está só começando (perfil do Perfil PRO básico).

- [x] Feature validada como tecnicamente viável e registrada como próximo tier/add-on
- [ ] Definir preço do add-on de domínio próprio (acima dos R$9,90 do Perfil PRO)
- [ ] Monitorar contagem de domínios customizados conectados — gatilho de decisão para upgrade do plano Vercel (Hobby → Pro) ao se aproximar de 50
- [ ] Detalhar UX do fluxo de conexão de domínio (tela de instruções DNS, estado de verificação pendente/ativo)

> **⚠️ Prioridade rebaixada (jul/2026):** questionamento levantou dúvida se domínio próprio é algo que o público de baixa renda/iniciante valoriza de verdade — percepção é que esse público enxerga mais valor em **cursos** (crença de que investir em conteúdo/capacitação aumenta renda diretamente). Ver seção 7.9.4 abaixo, que assume prioridade mais alta que esta feature. Domínio próprio permanece registrado como ideia validada tecnicamente, mas não é o próximo passo.

---

## 7.9.4. Cursos/conteúdo próprio (nova prioridade — conecta com seção 7 v2 e seção 4.2 direção 4)

**Contexto/motivação (jul/2026):** mercado de infoprodutos no Brasil é grande e crescente — mais de R$ 30 bilhões em vendas acumuladas só na Hotmart, estética/beleza citado como um dos nichos mais promissores, carreira/desenvolvimento pessoal entre os pilares de maior volume, 77% das compras de produtos digitais já via mobile (alinhado ao público mobile-first do CarreiraBeauty). Diferente do domínio próprio (conceito abstrato, baixa urgência percebida), "curso que ensina a ganhar mais" conecta direto com a crença que esse público já tem — gatilho de compra mais forte e validado no nicho.

**Decisão: conteúdo próprio (CarreiraBeauty cria os cursos), não afiliação/comissão de terceiros.** Mais controle de qualidade, marca e margem — ainda que exija maior esforço de produção inicial do que um modelo de afiliado puro.

- [x] Direção escolhida: produção de conteúdo próprio, prioridade acima do domínio próprio (seção 7.9.3)
- [x] Conecta com item já listado como v2 na seção 7 ("Cursos/certificações parceiras" — a redefinir como "cursos próprios", não parceria externa)
- [x] Conecta com a direção 4 da seção 4.2 ("assinatura de comunidade/conteúdo")

### MVP de validação (jul/2026) — 5 micro-conteúdos via Gamma: 2 grátis + 3 paywall PRO (revisado)

**Pivô final:** em vez de um lote 100% grátis, o teste combina demanda e monetização no mesmo lote — 2 conteúdos abertos a todos (isca de confiança, baixo compromisso) e 3 atrás de paywall, liberados só para assinantes PRO (seção 7.9.5). Isso acelera o aprendizado: consumo dos grátis sinaliza demanda por conteúdo; tentativa de abrir os pagos sinaliza intenção de compra — os dois sinais no mesmo teste.

## 7.9.6. Templates visuais de perfil (nova hipótese de teste, jul/2026 — 1ª prioridade)

**Hipótese:** oferecer templates/temas visuais prontos para a página pública do profissional (cores, layout, disposição dos blocos) deixa o perfil com aparência mais profissional e aumenta o valor percebido do Perfil PRO — sem exigir que a profissional saiba nada de design.

**Estratégia de monetização (jul/2026 — decisão de sequenciamento):** provar valor antes de trancar. Diferente da tabela grátis/PRO original da seção 7.9.1 (que já nascia trancada), os templates entram **abertos pra visualização de todo mundo** — a exclusividade PRO acontece só no momento de salvar/aplicar, não na navegação. Objetivo: medir se a existência dos templates de fato gera desejo de compra antes de decidir preço/gate definitivo.

**Fluxo de preview e paywall:**
- [ ] Preview renderizado **com os dados reais da própria profissional** (nome, função, cidade, foto de perfil se houver) — não um profissional fictício genérico, pra reduzir a distância psicológica ("é o MEU perfil, só que bonito")
- [ ] Campos que ela ainda não preencheu (ex: fotos de portfólio, educação) aparecem como **placeholder óbvio de exemplo** dentro do próprio template (ex: silhueta + "adicione fotos do seu trabalho aqui") — serve de empurrão extra pra completar o cadastro, não só de preview
- [ ] Navegação entre os 2-3 templates é livre, sem bloqueio nenhum — ela pode alternar e comparar à vontade
- [ ] **Paywall só no clique de "salvar"/"aplicar"**, e só para templates diferentes do padrão grátis — modal "Esse visual é exclusivo do PRO" com CTA de assinatura
- [ ] Template padrão (grátis) continua salvável sem fricção, a qualquer momento

**Escopo do MVP (build mínimo funcional): ✅ IMPLEMENTADO (jul/2026)**
- [x] 3 templates fixos pré-definidos (não customização livre de cor/fonte — reduz complexidade de build e de decisão pra um público de baixa sofisticação, mesma lógica já usada na decisão do PRO unificado, seção 7.9.5)
- [x] Seletor com preview ao vivo usando dado real + placeholder — campos ainda vazios (portfólio, apresentação, experiência, formação) aparecem como placeholder de exemplo em vez de sumir, servindo de empurrão pra completar o cadastro
- [x] Aplica-se sobre os mesmos campos/dados já existentes da página pública (seção 7.9) — troca só a apresentação visual, não estrutura de dados
- [x] Navegação livre entre os 3 + paywall só no clique de "aplicar" (modal "Esse visual é exclusivo do PRO")
- [x] **Fallback de plano:** se o profissional deixa de ser PRO, a página pública volta pro Clássico sozinha, mesmo com um tema PRO ainda salvo em `template_id` — evita visual pago travado pra quem não paga mais
- [ ] Métrica de validação: (a) quantas profissionais chegam até o preview de um template PRO, (b) taxa de conversão do modal de paywall (tentativa de salvar → assinatura), (c) se isso supera a conversão free→PRO da baseline atual (sem preview aberto) — **instrumentado, aguardando dado real**

- [x] Backend: campo `template_id` em `professionals` (migração `033_templates_perfil.sql`), default `'classico'`
- [x] Tracking em `template_eventos` (`professional_id`, `template_id`, `tipo`) com os 3 sinais do teste: `preview` (chegou a ver um tema PRO), `paywall_hit` (tentou aplicar sem ser PRO), `aplicado`
- [x] **Templates definidos:** `classico` (grátis, visual de sempre), `vitrine` (PRO — header curvo com foto sobreposta, nome como logomarca, portfólio em mosaico estilo feed), `elegante` (PRO — monograma dourado, foto emoldurada, tipografia serifada, portfólio em galeria)
- [x] **Contatos (WhatsApp/Instagram/Email) só nos templates PRO** — vira benefício exclusivo, transforma a página em "cartão de visitas que fecha cliente" (conecta com a tese da seção 4.2: valor que não depende de estar desempregada)
- [x] **Decisão de UX (jul/2026):** o seletor não virou tela separada — "Meu Perfil" em modo visualização **é** o seletor (abas + preview ao vivo + aplicar). Duas telas ("Meu Perfil" com resumo estático + "Visual do Perfil") eram redundantes, e um botão discreto de "trocar visual" escondia a decisão que a gente quer provocar
- [x] Disponibilidade e tipo de vínculo saíram dos templates PRO — baixa relevância numa vitrine; a tag do hero passou a ser "X anos de experiência", que é o dado que vende

**Lógica de divisão:** grátis = temas universais, de baixo compromisso, úteis pra qualquer pessoa (funcionam como isca de confiança). PRO = temas de "crescimento de negócio próprio", que conectam com quem já tem motivo de virar assinante (vitrine, portfólio, clientela).

**Temas e prompts de geração (Gamma Generate API v1.0):**

**1. Como impressionar no primeiro atendimento — GRÁTIS**
> Crie uma apresentação visual e motivacional em português do Brasil, em formato de cartões (não texto corrido), para profissionais de beleza autônomos e iniciantes (cabeleireiras, manicures, esteticistas, barbeiros) com baixo hábito de leitura. Tema: "Como impressionar no primeiro atendimento com um cliente". Linguagem simples, direta, informal, aspiracional — sem termos técnicos. Cada slide com no máximo 1-2 frases curtas ou 3 bullets curtos, com espaço para ícone/imagem grande. Estrutura: (1) capa com título chamativo, (2) por que a primeira impressão importa, (3) 3 erros comuns que afastam cliente, (4-6) dicas práticas (pontualidade, escuta ativa, comunicação, apresentação pessoal), (7) frase motivacional de fechamento, (8) convite para conhecer o CarreiraBeauty. Tom: acolhedor, como uma mentora experiente. Gere 8-10 cards.

**2. Como se destacar numa entrevista/seleção de vaga — GRÁTIS**
> Crie uma apresentação visual e motivacional em português do Brasil, em formato de cartões, para profissionais de beleza buscando emprego formal (CLT), com baixo hábito de leitura. Tema: "Como se destacar numa entrevista ou seleção de vaga na área da beleza". Linguagem simples, direta, encorajadora. Cada slide curto, com apoio visual forte. Estrutura: (1) capa, (2) o que o empregador realmente observa, (3) como se vestir e se portar, (4-6) o que falar (experiência, disponibilidade, portfólio) e o que evitar, (7) frase de confiança/motivação, (8) convite para completar o perfil no CarreiraBeauty. Tom: acolhedor, prático. Gere 8-10 cards.

**3. Como montar um portfólio que atrai cliente — PRO (paywall)**
> Crie uma apresentação visual em português do Brasil, em cartões, para profissionais de beleza autônomos, com baixo hábito de leitura. Tema: "Como montar um portfólio que atrai cliente". Linguagem simples e prática. Estrutura: (1) capa, (2) por que portfólio importa mais que diploma pra conquistar cliente novo, (3) o que fotografar (antes/depois, ângulos, iluminação básica com celular), (4) erros comuns que afastam cliente (fotos escuras, sem contexto), (5) como organizar por tipo de serviço, (6) como usar o portfólio no perfil CarreiraBeauty PRO, (7) frase de fechamento motivacional. Tom: mentora prática, sem jargão técnico de fotografia. Gere 8-10 cards.

**4. Como pedir indicação e fidelizar cliente — PRO (paywall)**
> Crie uma apresentação visual em português do Brasil, em cartões, para profissionais de beleza autônomos, com baixo hábito de leitura. Tema: "Como pedir indicação e fidelizar cliente sem parecer inconveniente". Linguagem simples, tom de conversa entre amigas. Estrutura: (1) capa, (2) por que cliente fiel vale mais que cliente novo, (3) o momento certo de pedir indicação, (4) frases prontas pra usar (scripts simples), (5) como agradecer e recompensar quem indica, (6) erro comum: pedir demais, cedo demais, (7) frase de fechamento. Tom: acolhedor, direto. Gere 8-10 cards.

**5. Como precificar seus serviços sem perder cliente — PRO (paywall)**
> Crie uma apresentação visual em português do Brasil, em cartões, para profissionais de beleza autônomos iniciantes, com baixo hábito de leitura. Tema: "Como precificar seus serviços sem perder cliente". Linguagem simples, sem termos financeiros complicados. Estrutura: (1) capa, (2) por que cobrar barato demais prejudica você, (3) como calcular o mínimo que precisa cobrar (custo + tempo + lucro, de forma simplificada), (4) como reajustar preço sem perder cliente antigo, (5) o que fazer quando cliente reclama do preço, (6) frase de confiança ("seu trabalho vale o que você cobra"), (7) fechamento motivacional. Tom: encorajador, prático, sem soar como aula de matemática. Gere 8-10 cards.

- [x] Divisão final: 2 grátis (universais, isca de confiança) + 3 PRO/paywall (crescimento de negócio próprio, reforça valor do PRO unificado)
- [x] Prompts de geração definidos para os 5 conteúdos (acima), prontos para uso na Gamma Generate API
- [x] Geração via Gamma Generate API (v1.0, GA desde nov/2025) — usuário tem plano pago com acesso à API

### 6º conteúdo — sazonal de julho (PRO)

**Gancho sazonal:** julho no Brasil combina dois gatilhos — frio (mudança de rotina de cuidado com cabelo/pele) e férias escolares (mães com mais tempo livre, pico de corte infantil). Conteúdo sazonal tende a ter taxa de abertura mais alta por parecer urgente/atual, e serve de gancho de reengajamento (conecta com a régua de email semanal, seção 7.7).

**6. Como aproveitar as férias de julho pra vender mais — PRO (paywall)**
> Crie uma apresentação visual e motivacional em português do Brasil, em formato de cartões, para profissionais de beleza autônomos no Brasil, com baixo hábito de leitura. Tema: "Como aproveitar as férias de julho para vender mais" — combine os gatilhos de frio (mudança na rotina de cuidados) e férias escolares (mães com mais tempo livre, pico de corte infantil). Linguagem simples, direta, com senso de urgência/oportunidade sazonal. Cada slide curto, com apoio visual forte. Estrutura: (1) capa com gancho de "aproveite julho antes que passe", (2) por que julho é oportunidade (frio + férias = mais demanda de determinados serviços), (3) ideia de pacote família (mãe + filho), (4) serviços de inverno pra oferecer como upsell (hidratação, tratamento pra pele ressecada), (5) como divulgar uma promoção sazonal simples (Instagram, WhatsApp, perfil CarreiraBeauty), (6) erro comum: não aproveitar a época e perder demanda pro concorrente, (7) frase de fechamento motivacional com senso de urgência. Tom: mentora prática, animada, focada em ação imediata. Gere 8-10 cards.

- [x] Tema escolhido: "Como aproveitar as férias de julho pra vender mais"
- [x] Status: PRO (paywall) — reforça valor da assinatura, junto dos demais 3 conteúdos PRO
- [x] Prompt de geração definido, pronto para uso na Gamma Generate API
- [ ] Considerar calendário de conteúdo sazonal recorrente (próximas datas: agosto/Dia dos Pais, dezembro/festas, etc.) como estratégia contínua, não conteúdo pontual único

### Medição de consumo (jul/2026)

**Decisão: tracking interno como fonte principal, GA4 como complemento — não depender só de ferramenta externa.**

- [x] **Tracking interno (prioritário):** nova entidade `ContentView` no banco (user_id, content_id, viewed_at, opcionalmente % de scroll/tempo na página) — grava toda vez que o profissional autenticado abre um conteúdo dentro do app. Permite cruzar diretamente "quem consumiu o quê" com "quem virou assinante PRO depois" via query direta no próprio banco (Postgres/Supabase, seção 9) — não depende de exportação de ferramenta terceira
- [x] **GA4 como complemento (não fonte principal):** gratuito, suporta User-ID para rastrear usuário logado entre sessões/dispositivos (confirmado disponível no tier grátis, jul/2026) — bom para visão agregada de comportamento (tempo na página, origem de tráfego, funil de abandono). **Restrição importante:** Termos de Serviço do Google proíbem enviar dado pessoalmente identificável (email, nome) — só é permitido enviar um ID interno anônimo (ex: UUID do usuário no banco), nunca o email direto
- [x] Conteúdo deve ficar hospedado **dentro do próprio app CarreiraBeauty** (não em link externo gamma.app) — necessário para o tracking interno funcionar por usuário autenticado

- [ ] Verificação de status de assinatura PRO já precisa existir para liberar os 3 conteúdos com paywall (reutiliza checagem de `Subscription` já implementada para o plano Pro de candidaturas, seção 4/10)
- [ ] Medir: (a) taxa de consumo dos 2 conteúdos grátis, (b) taxa de tentativa de acesso aos 3 conteúdos PRO por não-assinantes (sinal de intenção de compra/paywall hit), (c) taxa de conversão paywall → assinatura PRO unificada (seção 7.9.5)
- [ ] Implementar tabela `ContentView` e instrumentação GA4 (User-ID) como pré-requisito técnico antes de publicar os 5 conteúdos piloto

---

## 7.9.7. Quiz-certificado e prova social (novas hipóteses, jul/2026 — conectam com hipótese de status)

**Contexto:** conecta diretamente com a hipótese de status levantada acima (seção 7.9.6/discussão jul/2026) — a ideia de que esse público paga por **sinais visíveis de investimento/competência**, não necessariamente pela utilidade em si. Três hipóteses novas, todas no mesmo racional:

### a) Quiz-certificado (estilo Duolingo, aplicado à carreira)

> **✅ Implementado e evoluído (jul/2026):** o piloto rodou e a arquitetura foi generalizada de "uma trilha só" pra um **catálogo de 5 certificados** (`src/lib/quizContent.ts`, `TRILHAS[]`): Atendimento Nota 10 (a trilha piloto, renomeada — ver nota abaixo), Preço Justo, Mãos Seguras, Cliente Fiel e Agenda Cheia. Feedback por pergunta foi implementado de verdade estilo Duolingo (certo/errado + explicação imediata, não só no final). O paywall do certificado ficou como planejado (só no resgate), mas o preço avulso saiu diferente do sugerido: **R$29,90**, não R$9,90 — de propósito **acima** da assinatura PRO (R$14,90/mês), pra ancorar o PRO como a escolha óbvia (o doc original sugeria avulso como opção de "baixo compromisso"; na prática decidimos o oposto). Admin ganhou página de funil (`/admin/quiz`) com seletor de trilha. Streak/limite diário continua não implementado (registrado como evolução futura, como já previsto).

**Hipótese:** quiz curto e gamificado sobre temas da profissão (atendimento, técnica, precificação, etc.), com certificado/badge ao final — o valor percebido está no certificado (objeto de status, compartilhável), não necessariamente no conteúdo do quiz em si.

**Modelo proposto (versão evoluída, com limite diário):**
- [ ] Quiz em si: sempre grátis, com limite de 1 quiz/dia no plano grátis (mecânica de rate-limit estilo Duolingo — cria hábito de abertura diária e urgência de "quero fazer mais um agora")
- [ ] PRO: quizzes ilimitados, sem limite diário
- [ ] Certificado/badge: paywall separado do acesso ao quiz — ela pode responder de graça, mas "destravar" o certificado pra postar/adicionar ao perfil é o que é pago. Separa "aprender" (grátis, gera engajamento e hábito) de "provar que aprendeu" (pago, é o objeto de status)

> **⚠️ Simplificado para o teste inicial (jul/2026):** no primeiro teste, **sem limite diário** — todos os módulos da trilha ficam liberados de uma vez pra qualquer pessoa fazer quando quiser. O único ponto de paywall nessa fase é o **resgate do certificado ao final da trilha**. Objetivo do teste é isolar e validar duas coisas específicas: (a) taxa de conclusão da trilha inteira quando não há fricção nenhuma de acesso, e (b) taxa de conversão pra PRO no momento de resgatar o certificado. O rate-limit de 1/dia (mecânica de streak/hábito) fica registrado como evolução futura, a reintroduzir depois de validar esse sinal mais simples primeiro — não é necessário pro teste inicial e adicionaria uma variável a mais dificultando a leitura do resultado.
- [ ] Certificado desbloqueado fica **liberado dentro do PRO unificado** (seção 7.9.5, R$14,90) — não cria SKU extra, mantém a lógica de "um sim só" de compra
- [ ] **Testar variante de baixo compromisso:** certificado avulso (compra única, ex: R$9,90) como alternativa/complemento ao ebook do funil de topo já existente (seção 7.9.5) — o badge tangível pode converter melhor que conteúdo lido e esquecido
- [ ] **Posicionamento cuidadoso:** chamar de "Certificado CarreiraBeauty" (selo de engajamento/conhecimento na plataforma), não "certificação profissional formal" — evita expectativa de rigor técnico que um quiz interno não sustenta
- [ ] A definir: banco de perguntas por tema/função (produção de conteúdo, possivelmente via IA/Gamma como os demais conteúdos da seção 7.9.4)
- [ ] Métrica de validação: (a) taxa de conclusão diária/streak no plano grátis, (b) taxa de tentativa de desbloqueio de certificado (sinal de intenção de compra), (c) conversão certificado avulso vs. PRO unificado

#### Trilha piloto escolhida (jul/2026): "Autoestima e Postura Profissional"

**Motivo da priorização:** em vez de começar pela trilha técnica ("Domínio da Profissão"), o piloto começa por postura/atendimento porque esse é um ponto de dor explícito do lado **empregador** (dificuldade de avaliar postura profissional numa candidatura rápida), mesmo quando o profissional não reconhece essa lacuna em si mesmo. Isso dá ao certificado um valor duplo: reforça a autoestima do profissional (objetivo original) **e** vira um sinal de confiança pro empregador — reconecta com a ideia de busca/filtro no banco de currículos (seção 7.9, hoje fora do MVP), abrindo caminho futuro pra empresa filtrar candidato por certificado obtido, não só por palavra-chave de função.

**6 módulos da trilha (1 quiz = 1 módulo, conclusão dos 6 desbloqueia o certificado da trilha):**
1. **A primeira impressão** — pontualidade, comunicação inicial, apresentação pessoal
2. **Comunicação com o cliente** — escuta ativa, tom de voz, condução da conversa durante o atendimento
3. **Lidando com reclamação sem se abalar** — separar crítica do trabalho de crítica pessoal
4. **Postura em mensagens (WhatsApp/redes)** — tom escrito, tempo de resposta, profissionalismo em texto
5. **Impondo limites com respeito** — dizer não, cobrar atraso, recusar pedido fora do combinado sem soar rude
6. **Autoconfiança e superando a insegurança** — lidar com a sensação de "não ser boa o suficiente", reconhecer o próprio valor

**Nome do certificado:** ~~"Atendimento e Postura Profissional Certificado"~~ → **renomeado pra "Atendimento Nota 10"** (jul/2026), com tagline própria — nome mais curto e aspiracional que soa como algo que a profissional quer ter, testado junto com os nomes dos 2 certificados novos (Preço Justo, Mãos Seguras).

- [x] Trilha piloto definida e priorizada: Autoestima e Postura Profissional (substitui "Domínio da Profissão" como primeira a construir)
- [x] **Modelo do teste inicial:** os 6 módulos ficam **todos liberados sem limite** para qualquer pessoa fazer — sem rate-limit diário nessa fase. O paywall acontece **só no resgate do certificado** ao concluir a trilha inteira (PRO ou avulso, a definir no teste)
- [x] Implementado: módulo de quiz com paywall no resgate (PRO unificado ou avulso R$29,90)
- [x] Banco de perguntas dos 6 módulos escrito, com feedback de acerto/erro por pergunta (estilo Duolingo)
- [x] Estrutura de dados implementada: `quiz_progresso`, `certificados` (multi-trilha, migration 041), `pagamentos_avulsos` (migration 040)
- [x] **Extensão além do escopo original (jul/2026):** catálogo cresceu de 1 pra 5 certificados — ver nota "✅ Implementado e evoluído" acima

### b) Depoimentos/recomendações estilo LinkedIn

**Hipótese:** recomendação escrita, nomeada, de cliente/parceiro/ex-empregador é prova social mais forte que uma nota numérica — reforça tanto a credibilidade real do perfil quanto o sinal de status.

> **✅ Implementado (jul/2026), em formato mais simples que a hipótese original:** construído como avaliação de cliente (estrelas + texto + nome), não como recomendação nomeada por relação (cliente/colega/ex-empregador) — mais próximo da "captura de avaliação de cliente" da seção 7.9.1 do que do formato LinkedIn descrito aqui. Fluxo: profissional compartilha link público `/perfil/{slug}/depoimento` (sem exigir conta do cliente) → cliente avalia com estrelas + texto + WhatsApp (privado, só o profissional vê) → fica **pendente até o profissional aprovar** em `/dashboard/profissional/depoimentos` → só aprovados aparecem no perfil público. **Sem gate de PRO** (diferente do que este item sugeria) — decisão foi deixar grátis pra todo mundo, sem limite de quantidade exibida, pra maximizar adoção da prova social desde já. Unicidade por telefone+profissional evita o mesmo cliente avaliar duas vezes. Painel de stats no admin (`/admin/depoimentos`): adoção, taxa de aprovação, nota média.
>
> Formato "recomendação nomeada estilo LinkedIn" (relação cliente/colega/ex-empregador) **continua não implementado** — registrado como possível evolução futura caso o formato atual (nota + texto) não seja suficiente.

### c) Fotos: portfólio + certificados de curso externo + prints de depoimento

- [ ] Extensão natural do portfólio de fotos já previsto (seção 7.9 v2/7.9.1) — adicionar como tipos de mídia aceitos: certificado de curso feito fora da plataforma (foto/scan) e print de depoimento recebido por WhatsApp/Instagram
- [ ] Reaproveita o campo de fotos ilimitadas já no PRO (tabela da seção 7.9.1) — não é feature nova de infraestrutura, é ampliar o que pode ser enviado pro álbum existente

- [ ] **Registrado como hipóteses a testar, não ainda priorizadas em relação a templates (7.9.6) e vagas curadas (Fase 6.5)** — ordem de teste a definir

---

## 7.9.8. PWA (Progressive Web App) — instalável no celular (ideia registrada, jul/2026)

**Ideia:** transformar o web app em PWA instalável — mesmo código/URL, sem virar "dois produtos" (web vs app). A diferença é só o navegador oferecer instalação:
- **Desktop:** ícone de instalar na barra de endereço, baixa prioridade (raro alguém instalar app de vagas no computador).
- **Mobile:** o que importa de verdade pra esse público. Não forçar instalação na primeira visita — melhor deixar usar normal primeiro e, depois de algum uso (ex: 2º login), mostrar convite discreto tipo "Instalar app".

**Benefícios esperados:**
- Ícone na tela inicial — reabre direto, sem caçar aba/favorito (público usa pouco além de WhatsApp/Instagram)
- Sensação de "app de verdade" — abre em tela cheia, sem barra de navegador
- Reengajamento maior — padrão documentado em apps de vaga/marketplace em público de baixa renda
- **Notificação push** (fora do escopo básico de "instalável", exige service worker + permissão) — avisar "nova vaga compatível" ou "candidatura visualizada" direto no celular. Provavelmente o maior gerador de retorno do produto, mas é um passo técnico a mais

**Custo estimado:**
- Fase 1 (instalável, ~1h): `manifest.json` + ícones dimensionados (192/512px) + meta tags — sem service worker
- Fase 2 (offline/service worker): maior custo e teste, **baixa prioridade** pra esse produto — vagas/candidaturas/planos precisam estar sempre atualizados, cache offline arrisca mostrar dado velho (ex: vaga já fechada)

**Status:** ideia registrada, aguardando resultado do teste do quiz-certificado (seção 7.9.7) antes de priorizar implementação.

---

## 7.9.5. Oferta PRO unificada (decisão final — substitui venda separada)

**Decisão (jul/2026):** unificar Perfil PRO (site/vitrine, seção 7.9.1) e Conteúdo PRO (micro-conteúdos recorrentes, evolução da seção 7.9.4) em **um único plano PRO**, em vez de vender cada um separadamente.

**Estrutura do funil completo:**

1. **Topo de funil — ebook avulso (R$9,90, compra única):** isca de baixo compromisso pra quem ainda não confia o suficiente pra assinar algo recorrente (mantido da seção 7.9.4, MVP de validação via Gamma)
2. **Oferta principal — PRO unificado (assinatura mensal, preço a definir, ancorado em R$9,90-14,90):** inclui tudo da tabela da seção 7.9.1 (fotos ilimitadas, Instagram, avaliação de cliente, analytics, selo verificado) **+** micro-conteúdos recorrentes (seção 7.9.4) — um único "sim" de compra, não dois produtos concorrendo pela atenção/orçamento da mesma pessoa

**Por que unificar (não vender separado):**
- Reduz fricção de decisão — público de baixa sofisticação/baixo hábito de leitura se beneficia de uma escolha só, não de avaliar múltiplos produtos
- Aumenta valor percebido pelo mesmo preço ("R$9,90 e ganho vitrine + conteúdo toda semana" soa como mais negócio que qualquer um dos dois isolado)
- Transforma conteúdo de venda avulsa (baixo LTV, precisa vender de novo a cada peça) em parte de assinatura recorrente — reforça objetivo de receita recorrente desacoplada de volume de vaga (seção 4.2)
- Micro-conteúdo recorrente dá motivo de abrir o app com frequência, mesmo pra quem já tem o perfil pronto — reduz risco de churn "single-feature" (cancelar por já ter usado a única coisa que queria)

- [x] Decisão: PRO unificado (perfil + conteúdo), não produtos separados
- [x] Ebook avulso mantido como isca de topo de funil, fora da assinatura
- [x] **Preço final decidido e implementado (jul/2026): R$14,90/mês promocional** — o PRO deixou de ser só "candidaturas ilimitadas" (R$29) e passou a incluir conteúdos + visuais de perfil, então o valor agregado justificou a faixa de cima da âncora, e não os R$9,90. Plano do Mercado Pago atualizado no mesmo ID (`MP_PLAN_PROFISSIONAL_PRO`), sem assinante ativo afetado — não houve troca de variável de ambiente. Tela mostra "de R$ 29" riscado como ancoragem
- [x] **Um único plano PRO no app, não dois SKUs** — na prática o "plano Pro de candidaturas" (R$29) e o "Perfil PRO" (R$9,90) da seção 7.9.2 nunca existiram separados no código: sempre houve um só `professionals.plano = 'pro'`. A decisão de unificar apenas alinhou preço e discurso ao que o código já fazia (supersede a separação prevista na seção 7.9.2)
- [ ] Definir cadência de entrega dos micro-conteúdos dentro do PRO (semanal? conecta com a régua de email já definida na seção 7.7)
- [ ] Medir taxa de conversão ebook avulso → PRO unificado, e churn do PRO unificado vs. churn que se esperava do Perfil PRO isolado (validar se a hipótese de retenção melhor se confirma)

**Tela de planos do profissional — decisões de copy/UX (jul/2026):**

- [x] **Copy virou orientada a resultado, não a feature** — H1 "Mais chances de conseguir a vaga certa" (era "Destaque seu perfil"); CTA "Quero ser PRO" (era "Assinar"). Bloco "Por que o PRO ajuda a conseguir vaga?" explica o **mecanismo** (topo da lista → mais visto; candidaturas ilimitadas → mais tentativas; perfil/conteúdos → se destaca melhor), em vez de só listar features
- [x] **Sem prova social inventada** — decisão explícita de não usar "X profissionais já assinaram" ou "PRO é chamado 3x mais": com 0 assinantes, qualquer número seria fabricado. A persuasão se apoia no mecanismo, que é verificável
- [x] **Ancoragem de preço:** "de R$ 29" riscado + selo "🔥 PROMO" no lugar de "Recomendado"
- [x] **Objeção de fidelidade quebrada no ponto certo** — selo verde "Sem fidelidade. Cancele quando quiser, sem multa." logo abaixo do preço. A ressalva já existia, mas em 11px cinza no rodapé, invisível justamente pra quem tem a dúvida
- [x] **Mobile sem scroll** — os 2 planos, o CTA e o selo de fidelidade cabem acima da dobra em 375x812 (validado). Cards ficaram lado a lado mesmo no celular, com as mesmas 5 linhas de benefício nos dois, virando comparação direta em vez de duas listas soltas
- [x] **Experimento (jul/2026) — tag "PRO" tirada da fase de exploração:** temas visuais (aba Visual) e conteúdos PRO deixaram de mostrar aviso antecipado de bloqueio (badge "PRO" no seletor, cadeado na lista de conteúdo) — a pessoa navega/abre tudo livremente, e o paywall real só aparece no momento de aplicar o tema ou tentar ler além do trecho liberado. Hipótese: quem já "viu como fica" sente mais perda ao não poder manter do que quem nunca provou.
- [ ] **⚠️ Pendência (vira problema no 1º assinante):** não existe cancelamento dentro do app. O cancelamento real acontece na conta do Mercado Pago (o webhook detecta e marca `plano_status: 'cancelado'`) — por isso o rodapé diz isso explicitamente, em vez de prometer "cancele pelo app". Pior: pra quem já é PRO, o card grátis mostra **"Fazer downgrade", que é um `<div>` decorativo sem `onClick`** — é exatamente onde o assinante clicaria pra cancelar, e não faz nada. Hoje é inofensivo (0 assinantes), mas vira ticket de suporte e quebra de confiança no momento mais sensível. Saídas: (a) o botão levar pro MP com instruções, ou (b) implementar cancelamento de verdade via API do MP

---

## 7.10. Feed de atividade — prova social real (hipótese, jul/2026)

**Hipótese:** a percepção de "pouco movimento" no app pode ser atenuada mostrando atividade real acontecendo (cadastros, candidaturas), gerando senso de comunidade viva e "inquietude" (FOMO) em quem ainda não agiu. Diferente da prova social fabricada que foi **explicitamente rejeitada** na tela de planos (seção 7.9.5, "sem prova social inventada, com 0 assinantes qualquer número seria fabricado") — aqui o dado é **real**, então não tem esse problema de credibilidade.

**Riscos identificados antes de construir:**
- **LGPD:** nome completo publicamente exposto sem consentimento específico é problema — precisa ser parcialmente anonimizado
- **Volume baixo pode expor fraqueza em vez de escondê-la:** com pouca vaga/candidatura ainda (diagnóstico da seção 13: 1 empresa só, a maioria são cadastros de profissional), um feed evento-a-evento de candidatura ficaria visivelmente vazio — o oposto do efeito desejado. Recomendação original era começar só com contador agregado de cadastros e evoluir pro feed nome-a-nome depois, quando candidatura/vaga tiver volume suficiente

**Decisão do usuário (jul/2026) — formato definido para implementação direta:**
- [x] **Formato de exibição:** "Nome e iniciais — bairro — cidade (estado)" (ex: "Ana S. — Vila Mariana — São Paulo (SP)") — resolve a preocupação de LGPD sem precisar de anonimização mais pesada, mantendo o efeito humano/real
- [x] **Gatilho do evento:** exibido **após a pessoa finalizar o onboarding** (cadastro completo, não cadastro parcial/incompleto) — evita mostrar os ~40% de cadastros incompletos identificados no diagnóstico da seção 13
- [x] **Onde aparece:** tanto na **landing page pública** (pré-cadastro, reforça pra quem está decidindo se cadastrar que "tem gente de verdade aqui") quanto na **área logada** (reforça pra quem já é usuário que a comunidade está ativa)
- [x] **Janela de tempo:** mostra atividade das **últimas 24 horas**

- [x] **Implementado (jul/2026):** sem nova tabela — `getAtividadeRecente()` (`src/lib/atividadeRecente.ts`) é uma view derivada em código, consultando `professionals` (slug preenchido = onboarding completo) e `companies` (`status_cadastro = 'completo'`) direto, filtrando `criado_em` nas últimas 24h. Mais simples que criar `ActivityFeedEvent` e suficiente pro volume atual
- [x] Copy implementado: profissional → "{Nome} {Inicial}. de {bairro}, {cidade} (UF) acabou de se cadastrar"; empresa → "{Nome do estabelecimento} se cadastrou em {bairro}, {cidade} (UF)" (nome de empresa é dado público, não precisa iniciais)
- [x] **Decisão tomada:** bloco inteiro some quando não há eventos nas últimas 24h (componente `AtividadeRecente` retorna `null`) — evita expor dia de pouco movimento
- [x] Bairro confirmado sendo salvo (seção 7.8.1/bairro) — usado no texto do evento, com fallback gracioso pra só cidade/UF quando bairro estiver vazio
- [ ] Opt-out no cadastro — não implementado nesta rodada, avaliar se é necessário dado que o nome já aparece parcialmente anonimizado (primeiro nome + inicial)
- [x] **Implementado pelo Claude Code:** componente `AtividadeRecente` (`src/components/AtividadeRecente.tsx`) plugado na landing pública (`src/app/page.tsx`), na home do profissional e na home da empresa

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
- [x] **Decidido e implementado: Mercado Pago** — assinaturas recorrentes via `MP_ACCESS_TOKEN`/planos configurados por webhook (`/api/webhooks/mercadopago`), ver `scripts/criar-planos-mp.mjs`. Comparativo abaixo mantido como histórico da decisão:

| Gateway | Taxa (assinatura/PIX) | Perfil | Observação |
|---|---|---|---|
| **Asaas** | 1,99% sobre assinatura; 30 transações PIX grátis/mês; API gratuita | Popular entre pequenos negócios/freelancers no Brasil — marca pode já ser familiar ao público de salões | Boa documentação, integração simples |
| **Vindi** | Taxas por cotação | Especializada em cobrança recorrente (esse é o produto principal, não um adicional) | Terceiriza toda a lógica de ciclo de vida da assinatura (trial → cobrança → renovação → cancelamento) — menos código para manter no MVP |
| **Mercado Pago** | Pix 0,99%; Crédito 4,49% | Menor barreira de entrada, marca mais reconhecida pelo usuário final | Menos estruturado para assinatura recorrente — mais focado em checkout avulso |
| **Pix Automático (nativo, via PSP)** | 0,22%–0,35% direto no Banco Central; 0,28%–0,99% via PSP como Asaas | Novo padrão do Banco Central (lançado início de 2026) para débito recorrente via Pix | Tecnologia mais nova — vale monitorar maturidade de suporte antes de depender dela no MVP |

- [x] **Geocoding/CEP: BrasilAPI** (`brasilapi.com.br/api/cep/v2`) — usado para autopreencher endereço a partir do CEP no onboarding (mais simples que geocoding completo lat/long por enquanto; filtro por raio geográfico ainda não implementado — busca hoje é por cidade/estado, não por distância)

> **⚠️ Achado importante (jul/2026): a BrasilAPI NÃO resolve o raio.** Ao tentar implementar o matching por raio de 30km, confirmou-se que o endpoint de CEP v2 retorna `location.coordinates` **vazio** (testado com 4 CEPs reais de SP/RJ) — ele dá cidade/estado/rua, não lat/long. E `companies.latitude/longitude` e `professionals.latitude/longitude` estão **100% nulos** hoje (0 de 3 empresas, 0 de 93 profissionais).
>
> Ou seja: **todo filtro por raio depende de escolher e integrar um geocoder de verdade + backfill dos registros existentes.** Opções levantadas: Nominatim/OpenStreetMap (grátis, sem chave, limite de 1 req/s — suficiente pro volume atual de ~96 endereços) ou Google Maps Geocoding API (mais preciso, exige chave e tem custo acima da cota grátis). **Decisão adiada** — o raio das vagas agregadas foi resolvido sem geocoding próprio (a Adzuna geocodifica), e o disparo de email por vaga seguiu por cidade exata por ora.

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
- id, user_id, nome, telefone, **funcoes (array — múltiplas funções, não mais uma só)**, funcao_outro, localização, latitude/longitude (geocoded), experiência, disponibilidade, pretensão_salarial, tipo_vínculo (opcional), educação_básica (apresentação), foto_perfil_url (opcional)
- **habilidades (array)** — tags de especialidade dentro de cada função (ex: "Balayage", "Unhas em gel")
- **educacao (jsonb array)** — formação/cursos: `{ curso, instituicao, ano }`
- **experiencia_prof (jsonb array)** — histórico profissional: `{ cargo, empresa, periodo }`
- **portfolio_urls (array)** — fotos de portfólio
- **plano (gratis | pro), plano_status, plano_validade** — assinatura via Mercado Pago
- slug (para a URL pública — seção 7.9)

**PortfolioItem** — substituído por `professionals.portfolio_urls` (array simples, sem tabela própria)

**Job** (vaga) — N:1 com Company
- id, company_id, funcao (texto livre, não mais enum), funcao_outro, titulo, descrição, tipo_vínculo, modelo_remuneracao, faixa_salarial, comissão, foto_url, endereço/cidade/estado/cep (copiado da empresa, editável)
- **status (ativa | pendente_moderacao | rejeitada | pausada | fechada)** — toda vaga nova passa por moderação do admin antes de ficar visível
- **motivo_rejeicao** — preenchido pelo admin ao rejeitar
- slug (para a URL pública da vaga)
- criado_em

**Application** (candidatura) — relaciona Professional ↔ Job (N:N via tabela associativa)
- id, job_id, professional_id, criado_em, **mensagem** (texto livre do candidato)
- Binária (aplicou/não aplicou), como planejado originalmente

**Company** (campos adicionais implementados)
- **plano (gratis | basic | plus | premium), plano_status, plano_validade** — assinatura via Mercado Pago
- **slug** — página pública da empresa (`/empresa/[slug]`), não estava no plano original
- **is_admin** (em Profile) — flag de administrador, dá acesso ao painel `/admin`

**Admin** (novo, não estava no modelo original)
- Painel `/admin` — visão geral (métricas + últimos cadastros, incluindo cadastros incompletos), moderação de vagas (aprovar/rejeitar com motivo), gestão de empresas/profissionais (bloquear/desbloquear), configuração de categorias/funções/habilidades sem deploy

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
- [x] **Fuso horário: servidor roda em UTC (Vercel), mas o produto é 100% Brasil.** Qualquer lógica que faça corte/agrupamento por dia ou mês usando `Date` puro no servidor (`setHours(0,0,0,0)`, `toISOString().slice(0,10)`, etc.) fica ~3h adiantada da fronteira real em São Paulo — já corrigido no gráfico de cadastros diários do admin e no limite mensal de candidaturas do plano grátis, usando o helper compartilhado `src/lib/timezone.ts` (`toSaoPauloDay`, `saoPauloStartOfMonthISO`, `saoPauloStartOfTodayISO`). Qualquer nova feature com corte por dia/mês deve reusar esse helper em vez de `Date` cru.

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

> **Status (jul/2026): o digest semanal por cron continua NÃO implementado.** O que existe hoje é diferente e transacional: ao aprovar uma vaga no admin, um botão dispara o email de nova vaga pros candidatos compatíveis. Antes esse disparo era automático na aprovação; virou **manual e separado** (jul/2026) pra que o admin decida caso a caso — mostra a contagem de candidatos antes, pede confirmação, e só então envia. Matching por **função + cidade exata** da empresa (antes era função + estado, o que mandava vaga de outra cidade do mesmo estado).
>
> - [ ] **Pendência:** matching do disparo por raio de 30km em vez de cidade exata — depende de geocoding (ver pendência abaixo). Decisão de jul/2026 foi seguir por cidade agora e fazer o raio depois

### Fase 6 — Polimento
- Portfólio de fotos (profissional, condicional à função)
- Logo/Instagram da empresa
- Ajustes de SEO da página pública, performance, revisão de UX do multi-step

### Fase 6.5 — Vagas Agregadas (MVP+, complementar)

> **🧪 Antecipado para teste de hipótese no web app (jul/2026):** priorizado como 2ª hipótese a testar, logo após os Templates de Perfil (seção 7.9.6) — deixa de ser só "fase futura" e passa a ter build mínimo funcional real no app, não só validação barata. Hipótese: mostrar vagas curadas de outras fontes, próximas da região do profissional, aumenta engajamento/retenção mesmo com a base nativa de vagas ainda pequena.
>
> **✅ Status (jul/2026): as duas hipóteses estão no ar, aguardando dado.** Hipótese 1 (vagas agregadas, esta seção) e hipótese 2 (templates de perfil, seção 7.9.6) foram implementadas e instrumentadas. Nenhuma tem resultado ainda — falta tráfego real. As métricas de decisão estão em `vagas_externas_clicks` e `template_eventos`, com stats no admin.

Objetivo: mostrar volume de vagas reais na região do profissional mesmo enquanto a base própria de empresas cadastradas ainda é pequena — resolve parte do problema de cold start do lado profissional.

- **Fonte:** API de agregação de vagas legítima — **não scraping não autorizado** de sites de terceiros, por risco jurídico (violação de Termos de Uso) e de propriedade de conteúdo (a vaga pertence à empresa que a publicou originalmente)
- **Separação clara de UX:** seção distinta ("Vagas de outros sites" / "Vagas parceiras") separada das vagas nativas da plataforma ("Vagas CarreiraBeauty") — evita quebrar a expectativa do profissional (candidatura externa redireciona pra outro site, não é candidatura em 1 clique) e evita contaminar as métricas de conversão usadas na campanha de Meta Ads (seção 13 — os eventos otimizados são sobre vagas nativas)
- **Filtro:** mesma lógica de raio/localização já usada nas vagas nativas (seção 7.7)
- **Não substitui a prioridade da Fase 1/4:** essa fase é complementar — o foco continua sendo ativar a campanha de Empresa nativa e crescer a base de vagas própria, que é o que gera receita (seção 4)

- [x] **Adzuna API — confirmado (pesquisa jul/2026):** cobertura no Brasil (código de país `BR`), **gratuita** para uso, com as seguintes condições:
  - Limites do plano free: 25 chamadas/min, 250/dia, 1.000/semana, 2.500/mês — suficiente para popular vagas por cidade/atualização periódica, não para chamada em tempo real por usuário. Limite maior pode ser negociado com a Adzuna caso o uso cresça
  - **Obrigação contratual de atribuição:** ao publicar vagas do Adzuna, é obrigatório exibir o selo "Jobs by Adzuna" (mín. 116x23px, linkado) — reforça a necessidade da separação visual já definida acima entre vagas agregadas e vagas nativas
  - Uso permitido é "publicar listagens de anúncios Adzuna" — dentro dos termos de serviço, não é scraping
- [x] **Google for Jobs (pesquisa jul/2026): NÃO é fonte de agregação** — a API que permitia "puxar" vagas de lá foi descontinuada. O modelo atual é o inverso: adicionar marcador estruturado (JobPosting/JSON-LD) nas **próprias** páginas de vaga nativas (empresas cadastradas na plataforma) faz o Google exibi-las organicamente na busca, de graça, sem aprovação especial. Recurso confirmado ativo no Brasil. **Ação separada e complementar:** implementar schema JobPosting nas páginas de vaga nativa (relaciona-se com a página pública indexável da seção 7.9) — gera tráfego orgânico direto pras vagas que geram receita, ao contrário da agregação de terceiros
- [x] **Outras fontes avaliadas e descartadas:** Catho, InfoJobs e Vagas.com são concorrentes diretos no nicho, sem API pública de parceria para redistribuição de vagas. "API BR — Vagas Aggregator" existe mas é focada em vagas de tecnologia via GitHub, não aplicável ao nicho de beleza/estética
- [ ] Definir se vaga agregada aparece misturada na busca com filtro de raio, ou em aba/seção totalmente separada
- [ ] Adicionar ação de implementar JobPosting structured data (schema.org) nas vagas nativas — SEO gratuito, complementar à agregação via Adzuna

**MVP de teste (build mínimo funcional, jul/2026): ✅ IMPLEMENTADO**
- [x] Seção "Vagas de outros sites" no dashboard do profissional, abaixo das vagas nativas, com selo "Jobs by Adzuna" conforme obrigação contratual — **hoje é um badge de texto, não a imagem oficial (mín. 116x23px) que a Adzuna exige; pendência de conformidade**
- [x] Busca por **raio de 30km** em torno da cidade do profissional, não match exato de cidade — usa o parâmetro `distance` nativo da Adzuna (que já geocodifica), resolvendo o caso de quem mora na periferia/região metropolitana sem precisar de geocoding próprio
- [x] Cache em `vagas_externas` (migrações `030`/`031`), populado por script — não é chamada em tempo real por usuário. Coluna `cidade_busca` separa a cidade-âncora da busca (usada no filtro) da cidade real da vaga (usada na exibição), permitindo que a mesma vaga sirva a âncoras com raios sobrepostos
- [x] Filtro restrito a beleza **no título** da vaga (mantém escopo 100% vertical). Termos genéricos (recepcionista/auxiliar/assistente) só entram combinados com termo de beleza no mesmo título — checar a descrição deixava passar ruído (ex: nome de agência de recrutamento com "cabeleireiro" vazando pra vaga de recepcionista de restaurante). Esses genéricos são ~9% do volume, quase todos "auxiliar/assistente de cabeleireiro"
- [x] Candidatura externa redireciona pro site de origem (abre em nova aba, com ícone de link externo)
- [x] Matching por função do profissional além da localização — antes qualquer profissional da cidade via as mesmas vagas
- [x] Card mostra salário, "há X dias" e trecho da descrição. **Salário convertido de anual pra mensal** — a Adzuna sempre retorna anualizado (padrão deles pra comparação entre países), o que exibiria "R$ 24.000" pra uma vaga de R$ 2.000/mês
- [x] Métrica de validação instrumentada: `vagas_externas_clicks` (clique em vaga agregada), com stats no admin — **aguardando dado real**
- [x] **Cobertura atual (atualizado jul/2026):** ~3.140 vagas cacheadas em 36 cidades (as que têm profissional cadastrado) — cresceu de ~970/29 depois de rodar a busca de novo com o catálogo de profissões ampliado. Ainda assim, ~17% dos profissionais ficam com 0 vaga relevante pra função deles (rate limit do plano free da Adzuna limita quanto uma rodada cobre; rodar de novo tende a fechar mais lacunas, é upsert/idempotente)
- [x] **Profissões faltantes adicionadas (jul/2026):** Fisioterapeuta e Biomédico(a) existiam na base de profissionais mas nunca entravam nem na busca nem no filtro de "núcleo de beleza" — corrigido em `TERMOS_BELEZA`/`NUCLEO_BELEZA` (`src/lib/adzuna.ts` e `scripts/fetch-vagas-adzuna.mjs`)
- [x] **Fallback por bairro/CEP (jul/2026):** quando a cidade inteira não rende 5+ vagas relevantes pra função do profissional, refaz a busca ancorada no bairro dele (já resolvido a partir do CEP no cadastro) com raio de 60km — salva sob a mesma `cidade_busca`, aparece transparente na mesma lista
- [x] **Dedup de reposts (jul/2026):** a Adzuna agrega o mesmo anúncio repostado várias vezes com `external_id` diferente a cada vez (achado real: uma vaga com 11 cópias ocupando quase toda a lista de 5 exibidas). Corrigido com dedup por título+empresa antes de exibir, no lado do app (não no cache)
- [x] **Decisão (jul/2026): sem cron, atualização manual pelo admin** — botão "Atualizar cache da Adzuna agora" em `/admin/vagas-externas` mostra o resultado na hora (cidades processadas, chamadas feitas, vagas encontradas, vagas de reforço por bairro, erros) e registra em `vagas_externas_atualizacoes`. Usuário optou por rodar manualmente quando quiser, em vez de agendar
- [ ] **Pendência conhecida:** a Adzuna não reconhece "Embu das Artes" (nome oficial desde 2006) e retorna 0 pra qualquer busca lá — a base de localização deles ainda usa "Embu". Aceito por ora; se aparecerem mais casos, vale um mapa de nomes alternativos
- [ ] **Pendência:** trocar o selo de texto pela imagem oficial "Jobs by Adzuna" (obrigação contratual de atribuição)

### ⚠️ Decisão estratégica — NÃO expandir escopo para negócios locais fora de beleza (jul/2026)

**Questionamento levantado:** dado que a oferta de vaga nativa em beleza ainda é baixa (problema real de liquidez, não hipotético), cogitou-se ampliar o CarreiraBeauty para aceitar qualquer negócio local (padaria, loja, mercado, farmácia) publicando vagas de auxiliar, vendedor, caixa, recepcionista — não só negócios de beleza.

**Decisão: NÃO expandir.** Nem o cadastro nativo (pago, CNPJ, trial), nem a agregação de vagas de terceiros (Fase 6.5, Adzuna) — **tudo permanece 100% dentro do nicho de beleza/estética/bem-estar**, inclusive as vagas agregadas de fontes externas (busca no Adzuna continua filtrada só para funções/categorias de beleza, não geral).

**Motivos:**
- O diferencial competitivo (seção 3) é justamente ser vertical em beleza — permite competir com Catho/InfoJobs/Indeed (horizontais, muito maiores) sem entrar no jogo deles, onde a plataforma perderia
- Toda a engenharia de aquisição já construída (segmentação Meta Ads por categoria de negócio de beleza, dado "44% dos salões não repõem equipe", conteúdo educativo de carreira em beleza, taxonomia de funções — seção 7.8) foi desenhada pro nicho e não é reaproveitável para negócios genéricos
- Expandir escopo antes de validar product-market fit no nicho atual (campanha de empresa recém-ativada, monetização ainda em calibração) é risco de scaling prematuro

**Alternativa considerada e também descartada:** ampliar o filtro de busca da Fase 6.5 (agregação via Adzuna) para incluir vagas locais gerais (vendedor, caixa, atendente) além de beleza, mantendo isso separado do cadastro nativo pago — resolveria o problema de liquidez percebida sem abrir cadastro pago pra qualquer negócio. **Também descartada** — usuário optou por manter 100% dentro do nicho de beleza em todas as camadas, inclusive na agregação.

- [x] Escopo mantido 100% vertical em beleza/estética/bem-estar — cadastro nativo e agregação de terceiros
- [x] Cargos de apoio (recepcionista, auxiliar/assistente) **dentro** de negócios de beleza continuam no escopo — já validado na taxonomia (seção 7.8), isso não é a mesma coisa que expandir para negócios fora do nicho

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

## 13. Aquisição — Meta Ads

### Estrutura de campanha

- [x] **Duas campanhas totalmente separadas** (não conjuntos dentro da mesma campanha) — uma para Empresa, outra para Profissional, cada uma com orçamento próprio no nível do conjunto de anúncios (ABO). Evita que o algoritmo desvie verba pro público mais barato de converter (historicamente, profissional)
- [x] **Eventos de conversão distintos:** `CompleteRegistration_Company` (cadastro completo da empresa — seção 7.5) e `CompleteRegistration_Professional` (cadastro completo do profissional) — precisam ser eventos separados no Pixel/Conversions API, não um evento genérico compartilhado
- [x] **Objetivo de campanha:** Conversão, otimizando para o evento de cadastro completo específico de cada lado (não tráfego, não engajamento)
- [ ] Configurar os dois eventos distintos no Pixel/Conversions API já nas Fases 1 e 2 do plano de fases (seção 11) — pré-requisito para a campanha de empresa funcionar bem

### Segmentação — campanha Empresa (dono de negócio)

Problema comum: segmentação por interesse ("salão de beleza") tende a capturar consumidor, não dono do negócio. Combinar:

- **Comportamento:** administradores de Página do Facebook / pequenos empresários (Behaviors > Business and Industry, conforme disponibilidade na conta)
- **Interesses combinados:** empreendedorismo + gestão de salão + marketing para salão (interesse em gerir negócio, não só em beleza)
- **Exclusão:** público personalizado de quem converteu no evento de cadastro profissional — excluir desse conjunto para evitar canibalização
- **Lookalike:** assim que houver ~50-100 cadastros de empresa validados, criar público semelhante (1%) baseado neles
- **Advantage+ Audience:** segmentação mais aberta, com o sinal de "quem é dono" reforçado pelo criativo (ver abaixo), não só por interesse manual
- **Placements:** priorizar Feed e Stories do Instagram/Facebook; evitar Audience Network e Reels de descoberta pura

### Criativos — Meta Ads

**Campanha Profissional** (cadastro sempre grátis)

| Variante | Título (headline) | Descrição |
|---|---|---|
| 1 | Vagas de beleza perto de você | Cabeleireiro, manicure, esteticista e mais. Sem custo pra se candidatar. |
| 2 | Seu próximo emprego de beleza está aqui | Cadastro 100% grátis. Candidate-se em 1 clique. |
| 3 | Trabalhe perto de casa. Cadastre-se grátis | Veja vagas por perto e monte seu perfil profissional online. |

Texto principal (sugestão): "Cansou de esperar indicação? Veja vagas de beleza perto de você e se candidate em 1 clique. Cadastro 100% grátis, sempre."

**Campanha Empresa** (dono de salão, esmalteria, clínica) — foco em gestão, não em consumo de beleza

| Variante | Título (headline) | Descrição |
|---|---|---|
| 1 | Ache o profissional certo pro seu salão | Publique sua vaga grátis por 7 dias. Sem cartão de crédito. |
| 2 | Cansado(a) de procurar no Instagram? | Candidatos qualificados perto do seu negócio, direto na plataforma. |
| 3 | Menos rotatividade, mais candidatos qualificados | Feito para donos(as) de salão, esmalteria e clínica de estética. |

Texto principal (sugestão): "Cansado de procurar profissional bom no Instagram e no boca a boca? Publique sua vaga e receba candidatos qualificados perto do seu salão. Comece grátis."

- [x] Criativo da campanha Empresa deve mostrar **gestão do negócio** (dona no celular vendo candidatos, equipe, recepção), não a execução de serviços (cortar cabelo, fazer unha) — isso ajuda o algoritmo a aprender o sinal certo de "dono", não de "profissional"

### Prompts de imagem (geração por IA) — Campanha Empresa

1. **Dor:** "Dona de salão de beleza brasileira, 35-45 anos, expressão de leve frustração olhando o celular atrás do balcão vazio do salão, cadeiras de cabeleireiro sem clientes ao fundo, luz natural de fim de tarde, fotografia realista, estilo editorial, cores quentes"
2. **Solução:** "Empreendedora dona de clínica de estética sorrindo enquanto olha o celular com uma lista de candidatos numa tela de app, ambiente de recepção moderno e organizado, luz natural, fotografia realista lifestyle, foco no celular na mão"
3. **Prova social:** "Equipe pequena e diversa trabalhando em harmonia num salão de beleza moderno, dona do negócio ao centro conversando com uma nova funcionária, ambiente vibrante, fotografia editorial, luz natural, cores da marca (rosa/dourado)"
4. **CTA direto:** "Mockup de celular mostrando uma tela de app de vagas com o texto 'Publique sua vaga grátis' sobreposto, mão de mulher empreendedora segurando o celular, fundo desfocado de salão de beleza, fotografia de produto lifestyle"

- [ ] Testar A/B as 3 variantes de título por campanha e manter só a de melhor CTR/CPL após volume suficiente
- [ ] Revisar criativos após ter dados reais de qual "dor" (variante 1) x "solução" (variante 2) converte melhor pra dono de negócio

### Diagnóstico — 2 dias de campanha (achados reais)

Resultado observado: 50 cadastros totais — 29 profissionais, 1 empresa (cadastro manual do fundador, não veio de anúncio), 20 incompletos.

**Causa raiz identificada:**
1. **Campanha de Empresa nunca foi ativada com verba** — explica diretamente o zero de empresas via anúncio
2. **Divergência entre o desenho original (seção 7.5) e o que foi implementado:** o plano original assume que o anúncio já leva direto para o fluxo específico (empresa ou profissional pré-selecionado). Na implementação atual, todo tráfego cai numa landing/cadastro genérico, faz login, e **só depois** escolhe o perfil (empresa vs. profissional) — uma etapa extra de decisão que não existia no desenho original e é ponto clássico de abandono, especialmente para quem veio de um anúncio já segmentado (perde o gancho da mensagem do anúncio)

**Ação corretiva:**
- [ ] **Ativar a campanha de Empresa com verba real**, separada da campanha de Profissional (ver estrutura acima)
- [ ] **Anúncios devem linkar direto para a URL do fluxo já pré-selecionado** (ex: `/cadastro/profissional` ou `/cadastro/empresa`), pulando a tela de escolha de perfil para tráfego pago — a tela de escolha genérica continua existindo só para quem chega organicamente
- [ ] Adicionar instrumentação de funil (em qual tela cada cadastro abandona) para visibilidade contínua — hoje não há essa visibilidade, dificultando diagnosticar drop-off por etapa

**Confirmado ao vivo (beta.carreirabeauty.com/login):** a tela de login/signup unificado (Google + código por email, sem senha) está correta e alinhada com a seção 7.6 — não é o problema em si. O problema é a posição: é a primeira tela pra qualquer tráfego, incluindo anúncios, sem diferenciação de público. **Todos os anúncios hoje linkam para a mesma URL genérica `/login`**, sem parâmetro ou rota específica por campanha — confirma a causa raiz nº 2 acima. Próximo passo prático: criar rotas ou parâmetros dedicados (ex: `/login?perfil=empresa`, `/login?perfil=profissional`) e atualizar os links de cada campanha no Meta Ads Manager para apontar para a versão certa.

### Canais de aquisição além de Meta Ads (jul/2026)

**Contexto:** aquisição hoje depende 100% de Meta Ads, tanto empresa quanto profissional — risco de concentração num canal só. Avaliadas alternativas, incluindo automação em grupos de Facebook (onde a comunidade de beleza já troca vaga organicamente).

**❌ Rejeitado: bot/agente automatizado pra identificar quem posta vaga em grupo de Facebook e convidar via mensagem.**
- **Inviável tecnicamente:** Facebook descontinuou completamente o Groups API em abril/2024 — não existe forma oficial de ler posts de grupo ou mandar mensagem automatizada pra membro via API
- **Viola os Termos de Serviço da Meta:** scraping/automação simulando navegador é proibido pelas "Automated Data Collection Terms" — enforcement vai de restrição de distribuição até banimento permanente da conta, incluindo a conta de anúncio vinculada (risco direto pro canal principal de aquisição, Meta Ads)
- **Risco de marca:** mensagem fria não solicitada pra quem só postou num grupo (sem opt-in, sem relação prévia) tende a ser percebida como spam — risco de denúncia/bloqueio na própria comunidade que se quer conquistar

**✅ Alternativas priorizadas para diversificar aquisição:**
- [ ] **SEO de vagas via Google (JobPosting structured data)** — já mapeado como ação pendente na Fase 6.5 (seção 7); canal orgânico gratuito e sustentável, prioridade alta por já estar especificado tecnicamente
- [ ] **Parceria direta com admins de grupos de Facebook do nicho** — abordagem manual e autorizada (não automatizada): propor fixar link/post semanal de "central de vagas" em troca de valor pro grupo (ex: divulgação cruzada), em vez de contornar a regra
- [ ] **Presença orgânica manual em grupos** — alguém da equipe participa como membro normal e responde manualmente a quem posta vaga, sem automação — mais trabalhoso, mas dentro das regras e com conversão potencialmente melhor por ser contato humano real
- [ ] Segmentação de Meta Ads por interesse/comportamento de quem interage com grupos de emprego/beleza, como forma indireta de alcançar esse público sem tocar no grupo diretamente

---

## 8. Próximos Passos

1. [x] Fechar seções 2 a 6 deste documento
2. [x] Detalhar onboarding e campos de cadastro (seção 7.5)
3. [x] Definir stack técnica e arquitetura (seção 9)
4. [x] Especificar modelo de dados (seção 10)
5. [x] Plano de fases e briefing para Claude Code (seções 11 e 12)
