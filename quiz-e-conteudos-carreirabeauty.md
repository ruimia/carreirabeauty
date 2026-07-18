# CarreiraBeauty — Contexto do Projeto, Quiz e Conteúdos

Documento de referência completo: o que é o CarreiraBeauty, quem são os clientes, o que já foi construído no webapp, e o detalhe total das duas features de retenção/conversão pro plano PRO do profissional (quiz e conteúdos). Objetivo: servir de insumo pra reestruturar/reescrever o material de quiz e conteúdo com uma IA (Gemini).

---

# Parte A — Contexto geral do projeto

## A.1 O que é

CarreiraBeauty é um **marketplace de empregos, freelas e diárias pro setor de beleza, estética e bem-estar** no Brasil — conecta profissionais (cabeleireiro(a), manicure/pedicure, esteticista, maquiador(a), barbeiro, massoterapeuta, designer de sobrancelha/cílios, depilador(a), podólogo(a), recepcionista, assistente/auxiliar, fisioterapeuta, biomédico(a), entre outros) a estabelecimentos que contratam (salões, clínicas de estética, spas, studios, barbearias).

- **Repositório:** github.com/ruimia/carreirabeauty
- **Domínio oficial:** carreirabeauty.com (migrado de beta.carreirabeauty.com, que continua ativo em paralelo)
- **Stack:** Next.js 16 (App Router) + TypeScript + Supabase (Postgres + Auth + Storage + RLS) + Vercel (deploy) + Resend (email) + Mercado Pago (assinaturas) + Nominatim/OpenStreetMap (geocoding)

## A.2 Perfil de clientes

### Profissionais (lado que usa o produto pra buscar trabalho)
- **Baixa renda, lê pouco, informal.** Toda copy voltada a esse público precisa ser direta, em português falado do dia a dia — nada de palavras corporativas/formais tipo "compatível" ou "monitorado". Frases curtas, palavras concretas, sem jargão.
- **Tom sempre positivo e aspiracional**, mesmo em estados neutros (ex: "ainda não tem vaga" precisa soar acolhedor, não clínico).
- **90% acessa pelo celular** — toda decisão de UX prioriza mobile primeiro.
- Maioria concentrada em São Paulo e região metropolitana (Grande SP), mas com presença crescente em outras cidades/capitais do Brasil.
- Motivação central: conseguir trabalho perto de casa (o produto virou muito em torno de "vaga pertinho de você", raio de 30km), ter uma "vitrine"/currículo online pra divulgar (perfil público compartilhável), e crescer na carreira (conteúdo educativo, quiz).

### Empresas (lado que contrata)
- Donos/gestores de salões, clínicas de estética, spas, barbearias, studios — em geral pequenos negócios locais.
- Tolera um registro um pouco mais formal que o do profissional, mas o produto favorece fricção mínima: cadastro com CNPJ auto-preenchido, 1ª vaga sempre grátis, sem cartão de crédito.
- Motivação central: encontrar candidato qualificado rápido, sem pagar agência/anúncio caro, com contato direto (WhatsApp) assim que aprovar a candidatura.

## A.3 Modelo de negócio / Planos

**Empresa** (`PLANOS_EMPRESA` em `src/lib/planos.ts`):
| Plano | Vagas ativas | Candidatos | Preço |
|---|---|---|---|
| Grátis | 3 | 20 | R$0 |
| Premium | 5 | 50 | R$49/mês |

**Profissional** (`PLANOS_PROFISSIONAL`):
| Plano | Candidaturas/mês | Preço |
|---|---|---|
| Grátis | 10 | R$0 |
| Pro | Ilimitadas | R$14,90/mês (ancorado visualmente como "de R$29 por R$14,90") |

Benefícios do plano PRO (profissional): candidaturas ilimitadas, WhatsApp/email visíveis no perfil público, templates de perfil premium (Vitrine, Elegante — grátis fica só no Clássico), portfólio de fotos, certificado do quiz.

Pagamento via **Mercado Pago** (assinatura recorrente/preapproval), checkout usando o `init_point` de planos pré-criados (não cria PreApproval via API diretamente).

## A.4 Principais features já construídas no webapp

**Core do marketplace**
- Onboarding separado por tipo (empresa via CNPJ / profissional), com CEP/CNPJ auto-preenchendo endereço, cidade, estado e **geocoding automático (lat/long)** pra cada cadastro
- Publicação de vaga (empresa) com moderação — toda vaga nova nasce `pendente_moderacao`, aprovada/rejeitada (com motivo) pelo admin
- Vaga pode ter **múltiplas funções** (ex: "Manicure OU Esteticista") — matching é por OR, não precisa bater todas
- Candidatura do profissional, com mensagem opcional; WhatsApp da empresa é revelado ao profissional logo depois de se candidatar
- Botão flutuante "Quero me candidatar" no mobile em vagas com descrição longa
- **Matching por localização real** — raio de até 30km calculado por distância geodésica (Haversine) entre as coordenadas geocodificadas de profissional e empresa, com fallback pra comparação de estado quando falta coordenada
- **Vagas externas agregadas** (fonte: Adzuna API) misturadas às vagas nativas no dashboard do profissional, buscadas por raio em torno da cidade
- Perfil público do profissional (`/perfil/[slug]`) com 3 templates (Clássico, Vitrine, Elegante — os dois últimos exclusivos PRO), funciona como "currículo online" compartilhável
- Perfil público da empresa (`/empresa/[slug]`) com vagas abertas
- Feed de "atividade recente" ("Fulana, Manicure, de Bairro, Cidade (UF) acabou de se cadastrar") na home e nos dois dashboards — só aparece quando há atividade real, sem prova social fabricada

**Dashboard do profissional**
- Home reorganizada: saudação, anel de completude de perfil, candidaturas em destaque, vagas nativas + externas misturadas, atividade recente, seção "Crescer" (quiz + conteúdo) no fim
- Nav inferior com 3 abas (Vagas / Crescer / Perfil) — upsell "Seja PRO" vive dentro do Perfil, não na nav
- Módulo de **Quiz-certificado** e **Conteúdo** — ver Parte B

**Dashboard da empresa**
- Nav com Vagas / Nova vaga / **Candidatos** (potenciais) / Planos / Perfil
- Aba **"Candidatos potenciais"** — mostra profissionais que combinam com as vagas ativas (função + raio de 30km), com botão de convite direto por WhatsApp ou email (rótulo "Convide para conhecer suas vagas")
- Edição/encerramento de vaga, contagem de candidatos por vaga

**Admin**
- Moderação de vagas (aprovar/rejeitar com motivo), edição de dados de empresa e vaga direto no painel
- Disparo de email em massa pros candidatos compatíveis de uma vaga (com preview do HTML, contagem, filtro por função+raio de 30km, assunto/mensagem editáveis antes de enviar)
- Correção de bugs de matching por texto (acento/maiúscula, espaço em branco na cidade)
- RLS com bypass de admin pra jobs/companies/professionals (antes disso, admin não enxergava vagas pendentes de empresas não-owner)
- Página `/admin/quiz` — funil de conversão do quiz (ver Parte B)

**SEO / AEO (otimização pra buscadores e IAs)**
- `robots.txt` e `sitemap.xml` dinâmico (vagas ativas, perfis, empresas)
- **Schema.org JSON-LD**: `JobPosting` em cada vaga (padrão exigido pelo Google for Jobs, com salário parseado, tipo de vínculo, localização), `Person` no perfil do profissional, `Organization` na empresa, `Organization`+`WebSite` na home, `FAQPage` na página de perguntas frequentes
- Metadata rica (description, Open Graph, Twitter card, canonical) em todas as páginas públicas
- Páginas novas **`/freelas`** (landing + listagem filtrada por vínculo freela) e **`/perguntas-frequentes`** (FAQ pública) — parte de um esforço pra IAs tipo ChatGPT/Perplexity/Google AI Overviews encontrarem e recomendarem o site pra buscas de emprego/freela em beleza

**Infraestrutura**
- Domínio oficial migrado pra `carreirabeauty.com` (antes só `beta.carreirabeauty.com`, que continua ativo); DNS/SSL configurados na Vercel via Cloudflare (CNAME flattening)
- Redirect 301 de `blog.carreirabeauty.com` (domínio antigo com tráfego de SEO) pra home do domínio oficial
- Emails transacionais via Resend: nova candidatura, vaga aprovada/rejeitada, nova vaga compatível pro profissional, convite de candidato potencial

---

# Parte B — Quiz-Certificado e Conteúdos

## B.1 Contexto e objetivo de negócio

Ambas as features existem pra testar e gerar conversão do plano gratuito pro **PRO** (profissional, R$14,90/mês):

- O **quiz** é 100% grátis de fazer (todos os 6 módulos), mas o **certificado final é um benefício PRO** — serve como teste de "o quiz aumenta a conversão pro PRO?".
- Os **conteúdos** são parcialmente gratuitos: os 2 primeiros da lista são livres, os outros 4 são só preview (2 primeiras páginas) pra quem não é PRO, com um paywall no meio do carrossel.

Toda interação (tentativa de resgatar certificado, visualização de conteúdo mesmo truncada) é logada no banco especificamente pra medir intenção de compra — ver seção 5.

---

## B.2 Quiz — trilha "Autoestima e Postura Profissional"

- **Slug da trilha:** `autoestima-postura`
- **Nome do certificado:** "Atendimento e Postura Profissional Certificado"
- **Onde vive o conteúdo:** hardcoded em `src/lib/quizContent.ts` (não é banco de dados — pra editar uma pergunta hoje precisa mexer em código e fazer deploy)
- **Formato:** 6 módulos, 4 perguntas de múltipla escolha cada (3 opções, 1 correta), sem nenhum texto de explicação/feedback depois de cada pergunta — só um placar final ("Você acertou X de Y perguntas") ao concluir o módulo.

### Módulo 1 — "A primeira impressão"
*Pontualidade, comunicação inicial e apresentação pessoal.*

1. Você tem um horário marcado às 14h e percebe que vai chegar 10 minutos atrasada. O que fazer?
   - ✅ Avisar o cliente assim que perceber o atraso, explicando o novo horário
   - Chegar e não comentar nada, só se atrasou um pouco
   - Cancelar o atendimento sem avisar

2. Qual atitude passa mais profissionalismo logo na chegada?
   - ✅ Cumprimentar, se apresentar e confirmar o que foi combinado
   - Já começar o atendimento sem falar nada
   - Esperar o cliente puxar assunto

3. Um cliente novo chega meio desconfiado. A melhor forma de gerar confiança logo de cara é:
   - Falar mal de outros profissionais do mercado
   - ✅ Explicar com calma o que vai ser feito e tirar dúvidas antes de começar
   - Ignorar e seguir direto pro serviço

4. Sobre aparência pessoal no atendimento, o mais importante é:
   - Estar sempre com roupa de marca
   - ✅ Estar limpa, organizada e com postura condizente com o serviço prestado
   - Não importa, só o resultado do serviço conta

### Módulo 2 — "Comunicação com o cliente"
*Escuta ativa, tom de voz e condução da conversa durante o atendimento.*

1. O cliente está explicando o que quer, mas de um jeito confuso. O que fazer?
   - Fingir que entendeu pra não parecer que não sabe
   - ✅ Repetir com suas palavras o que entendeu e confirmar antes de começar
   - Fazer do seu jeito, sem confirmar

2. Escuta ativa quer dizer:
   - Ouvir só esperando sua vez de falar
   - ✅ Prestar atenção de verdade, sem interromper, e mostrar que entendeu
   - Concordar com tudo sem prestar atenção

3. Qual tom de voz costuma funcionar melhor num atendimento?
   - ✅ Calmo e claro, ajustando o ritmo conforme o cliente
   - Sempre bem baixinho, quase sussurrando
   - Sempre animado e alto, não importa a situação

4. O cliente ficou em silêncio durante o atendimento. Você:
   - Insiste em puxar assunto o tempo todo, mesmo sem resposta
   - ✅ Respeita o silêncio, mas segue disponível se ele quiser conversar
   - Pergunta se ele está bravo com alguma coisa

### Módulo 3 — "Lidando com reclamação sem se abalar"
*Separar crítica do trabalho de crítica pessoal.*

1. Uma cliente reclama do resultado do serviço. A primeira reação ideal é:
   - Discutir e explicar por que ela está errada
   - ✅ Ouvir com calma, entender o que incomodou, e ver o que pode ser ajustado
   - Ficar em silêncio e não responder nada

2. Reclamação sobre o trabalho significa que:
   - Você é uma péssima profissional
   - ✅ Algo pode ser melhorado ou ajustado — não é um ataque pessoal
   - O cliente está sempre errado e não merece resposta

3. Depois de resolver uma reclamação, o que ajuda a seguir em frente?
   - Ficar remoendo o caso o dia inteiro
   - ✅ Anotar o aprendizado e seguir o dia normalmente
   - Comentar com outros clientes o que aconteceu

4. Se você errou mesmo, a atitude mais profissional é:
   - Negar o erro até o fim
   - ✅ Assumir, se desculpar e propor uma solução
   - Culpar o produto ou o horário

### Módulo 4 — "Postura em mensagens (WhatsApp/redes)"
*Tom escrito, tempo de resposta e profissionalismo em texto.*

1. Um cliente manda mensagem de madrugada perguntando sobre horário. Você deve:
   - Responder na hora, não importa o horário
   - ✅ Responder no seu horário comercial normal, sem se cobrar por não ter respondido de madrugada
   - Nunca mais responder esse cliente

2. Escrever tudo em CAIXA ALTA numa mensagem geralmente passa a sensação de:
   - Educação e cuidado
   - ✅ Estar gritando ou nervosa
   - Nada, é neutro

3. Qual é uma boa prática ao combinar horário por mensagem?
   - ✅ Confirmar por escrito data, horário e serviço combinado
   - Combinar de boca e não registrar nada
   - Deixar em aberto pra ver depois

4. Um cliente manda uma mensagem grosseira. A resposta mais profissional é:
   - Responder no mesmo tom
   - ✅ Manter a educação, responder objetivamente e, se persistir, avaliar se quer manter esse cliente
   - Ignorar para sempre sem explicação

### Módulo 5 — "Impondo limites com respeito"
*Dizer não, cobrar atraso e recusar pedido fora do combinado sem soar rude.*

1. Um cliente pede um desconto que você não pode dar. A melhor forma de recusar é:
   - Aceitar mesmo não podendo, pra não desagradar
   - ✅ Explicar com educação que o valor já é o combinado e por quê
   - Não responder e sumir

2. Um cliente atrasa direto para os horários marcados. Uma atitude profissional é:
   - Nunca comentar nada e deixar acontecer sempre
   - ✅ Conversar com educação sobre uma política de tolerância de atraso
   - Cancelar sem avisar da próxima vez

3. Dizer "não" pra um pedido fora do combinado é:
   - Sempre falta de educação
   - ✅ Uma forma legítima de proteger seu trabalho e seu tempo
   - Algo que só profissional grande pode fazer

4. Impor limites com respeito significa:
   - Ser dura e ríspida
   - ✅ Ser clara e educada ao mesmo tempo
   - Evitar qualquer tipo de recusa

### Módulo 6 — "Autoconfiança e superando a insegurança"
*Lidar com a sensação de "não ser boa o suficiente" e reconhecer o próprio valor.*

1. Bater aquela insegurança antes de um atendimento novo é:
   - Sinal de que você não deveria estar nessa profissão
   - ✅ Normal, e não define sua competência
   - Algo que só acontece com iniciantes

2. Comparar seu trabalho com o de outras profissionais o tempo todo tende a:
   - Te motivar sempre
   - ✅ Alimentar insegurança sem necessariamente te ajudar a crescer
   - Não ter nenhum efeito

3. Uma forma saudável de lidar com um dia ruim de trabalho é:
   - Concluir que você não serve para a profissão
   - ✅ Reconhecer o que não foi bem, sem generalizar pra tudo que você é
   - Desistir de tentar melhorar

4. Reconhecer o próprio valor profissional inclui:
   - ✅ Lembrar da sua experiência e dos clientes que você já atendeu bem
   - Só confiar quando alguém mais elogiar
   - Nunca comemorar nenhuma conquista

### Copy da interface (verbatim)
- Subtítulo da trilha: "Complete os 6 módulos no seu ritmo e resgate seu certificado ao final."
- Card de módulo concluído: "Módulo concluído!" / "Você acertou {acertos} de {total} perguntas." / botão "Voltar pra trilha"
- Progresso da pergunta: "Pergunta {n} de {total}"
- Botões: "Próxima" / "Concluir módulo" / "Salvando…"

### Mecânica do certificado
- Card bloqueado (nem todos os módulos concluídos): "Complete todos os módulos para resgatar seu certificado."
- Todos concluídos, ainda não é PRO: "O certificado é um benefício do PRO — desbloqueie e mostre no seu perfil que você investiu em atendimento e postura." → botão "Desbloquear certificado" → ao clicar, registra evento `certificado_tentativa` (sinal de intenção de compra) e mostra link "Ver plano PRO".
- Todos concluídos e é PRO: "Você completou a trilha!" → botão "Resgatar certificado" → ao clicar, registra `certificado_desbloqueado` e marca `professionals.certificado_autoestima_desbloqueado_em`.
- Desbloqueado: "Certificado desbloqueado! Em breve você poderá exibi-lo no seu perfil público."

**⚠️ Importante pra reestruturação:** não existe nenhum certificado de verdade hoje (PDF, imagem, design) — é só uma flag no banco + essa mensagem prometendo exibição futura no perfil. Se o objetivo é reformular o quiz, provavelmente vale desenhar o certificado real como parte do trabalho.

### Painel admin (`/admin/quiz`) — "Jornada do Quiz"
Métricas acompanhadas:
- Iniciaram a trilha (≥1 módulo) / Completaram (6/6) / Desbloquearam certificado
- Destaque: quantas pessoas tentaram resgatar o certificado mas ainda não são PRO (sinal direto de intenção de compra)
- Funil completo: Total de profissionais → Iniciaram → Completaram → Tentaram resgatar → Desbloquearam (com % de conversão em cada etapa)
- Conclusão por módulo: % de quem iniciou que completou cada um dos 6 módulos (mostra em qual módulo as pessoas desistem)

---

## B.3 Conteúdos — "Conteúdo pra você crescer"

- **Onde vive:** tabela `conteudos` no banco (título, slug, `pdf_url`, `pro` boolean, ordem, ativo) — o texto do artigo em si **não é texto no banco/código**, é um PDF (carrossel estilo Instagram) hospedado no Supabase Storage. Não existe hoje nenhuma tela de admin pra criar/editar — é tudo manual (upload direto + insert no banco).
- **Formato:** carrosséis de 8-9 slides curtos, estilo post de Instagram, com emojis, bullets curtos e call-to-action pro CarreiraBeauty no final.
- **Gating:** os 2 primeiros são grátis; os outros 4 são PRO — não-PRO vê só as 2 primeiras páginas do PDF, depois aparece um véu escuro com "Vire PRO pra continuar lendo 🔒" e botão "Ver planos PRO". Toda visualização (mesmo truncada) é registrada em `conteudo_views`, pra medir interesse de quem é grátis.

Abaixo, o texto completo extraído de cada PDF (slide a slide):

### 1. "O que separa um atendimento bom de um inesquecível" *(grátis · ordem 1)*
`slug: primeiro-atendimento` — 9 páginas

1. **Como Impressionar no Primeiro Atendimento 💅✨** — O guia essencial para profissionais da beleza que querem lotar a agenda
2. **A primeira impressão não tem segunda chance** — O cliente decide em minutos se vai voltar — ou nunca mais aparecer. Uma boa experiência no primeiro dia vale mais do que qualquer desconto. Quem encanta desde o início constrói uma carteira fiel de clientes
3. **3 erros que afastam o cliente logo de cara** — ⏰ Atraso sem aviso: passa a mensagem de que o tempo dele não importa. 📱 Celular na mão: distrai, desconecta e mostra falta de atenção. 😶 Silêncio total: o cliente fica inseguro e não sabe se está em boas mãos
4. **Pontualidade é respeito — e respeito fideliza** — Chegue (ou esteja pronta) 10 minutos antes do horário marcado. Se atrasar, avise com antecedência e peça desculpas de verdade
5. **Escuta ativa: o segredo das profissionais que lotam a agenda** — Pergunte o que o cliente espera. Ouça sem interromper — deixe ele falar tudo antes de responder. Repita o que entendeu para confirmar — isso gera confiança na hora e evita mal-entendidos
6. **Sua apresentação pessoal fala antes de você** — Uniforme limpo, cabelo arrumado e unhas impecáveis são o seu cartão de visita antes de dizer qualquer palavra. O ambiente também conta: espaço organizado transmite profissionalismo e cuidado
7. **Comunique com clareza e carinho** — Explique o que vai fazer antes de começar, sem termos complicados — simples e direto ao ponto. Um elogio sincero e um sorriso genuíno fazem toda a diferença na experiência do cliente
8. **"Cada atendimento é uma semente. Plante bem e colha clientes para a vida toda." 🌱** — Você já tem o talento. Agora é hora de transformar cada cliente em fã.
9. **Quer crescer de verdade na área da beleza?** — 💜 CarreiraBeauty: tudo que você precisa para se profissionalizar e lotar sua agenda. 🎁 Conteúdo gratuito e dicas práticas. Uma comunidade que torce por você todos os dias. 🚀 Acesse agora! Dê o próximo passo na sua carreira — você merece! *Compartilhe esse carrossel com uma amiga profissional da beleza que precisa ver isso! 💅*

### 2. "O erro mais comum na entrevista (e como evitar)" *(grátis · ordem 2)*
`slug: destaque-na-entrevista` — 8 páginas

1. **Como se Destacar na Entrevista da Sua Vida 💄✨** — Para profissionais da beleza que querem conquistar sua vaga CLT com confiança
2. **O Que o Empregador Realmente Observa** — Postura e energia ao entrar na sala. Contato visual e sorriso genuíno. Orgulho ao falar do seu trabalho. Comprometimento e confiança transmitidos
3. **Vista-se Para a Vaga Que Você Quer 👗** — Roupa limpa e discreta: você é a estrela — não a roupa! Cabelo e unhas impecáveis: você é da beleza — isso fala por você! Chegue 10 minutos antes: pontualidade impressiona sempre
4. **Como Falar da Sua Experiência** — "Sou especialista em coloração e escova": cite os serviços que você mais domina com segurança. Quantos clientes por dia? números mostram sua capacidade e ritmo de trabalho. Um resultado que te deixou orgulhosa: histórias reais emocionam e convencem. Não precisa ter trabalhado em salão famoso — o que importa é o que você sabe fazer! 💪
5. **Mostre Seu Portfólio com Orgulho 📸** — Fotos Antes e Depois encantam qualquer recrutador na hora! Organize no Celular: Google Fotos ou WhatsApp — simples e eficiente. Cada foto é uma prova do seu talento ✨
6. **O Que Evitar na Entrevista** — ❌ Falar mal do emprego anterior. ❌ Mexer no celular durante a conversa. ❌ Dizer "não sei" sem tentar explicar. ❌ Chegar sem pesquisar o salão ou clínica
7. **Você Já É Capaz 💪** — "Cada cliente que você atendeu foi um treino para esse momento. Você tem história, tem talento e tem tudo para conquistar essa vaga. Acredite em você!"
8. **Seu Próximo Passo: CarreiraBeauty 🌟** — 01: Complete seu perfil gratuito no CarreiraBeauty. 02: Apareça para os melhores salões e clínicas da sua cidade. 03: Sua próxima oportunidade pode estar te esperando agora! *Crie seu perfil grátis hoje e dê o primeiro passo! ✨*

### 3. "O erro que faz seu portfólio parecer amador" *(PRO · ordem 3)*
`slug: portfolio-que-atrai` — 8 páginas

1. **Como Montar um Portfólio que Atrai Clientes** — O guia prático para profissionais de beleza autônomos
2. **Portfólio vale mais que diploma** — 📋 Diploma: ninguém pede para ver. 📸 Suas fotos: convencem antes de você falar uma palavra
3. **Antes e depois é ouro ✨** — Antes: mesmo ângulo, mesma luz. Depois: a transformação fala sozinha
4. **Celular bom o suficiente 📱** — 🌤 Luz natural: cliente de frente para a janela. 🚫 Sem flash: flash direto apaga o resultado. 🤍 Fundo neutro: parede branca ou bege — simples assim
5. **Erros que afastam clientes na hora ⚠️** — 📵 Foto escura ou tremida. 🚫 Fundo bagunçado. ❌ Sem dizer o que foi feito. ⚠️ Serviços misturados
6. **Organize por tipo de serviço 🗂** — Coloração, Cortes, Unhas, Maquiagem. Quem busca mechas não quer ver foto de sobrancelha. Facilite — ele decide mais rápido
7. **Seu portfólio no CarreiraBeauty PRO 🚀** — 01: Adicione a foto do serviço. 02: Escreva o serviço e produto usado. 03: Informe o tempo de duração. 04: Perfil completo aparece primeiro nas buscas
8. **Você já tem o que precisa 💜** — Não espere a foto perfeita. Comece com o que você tem. Cada trabalho novo é uma foto nova. Seu portfólio cresce com você — e os clientes chegam junto. *📲 Compartilhe esse carrossel com uma colega que precisa ver isso!*

### 4. "O jeito certo de pedir indicação (sem parecer chato)" *(PRO · ordem 4)*
`slug: indicacao-e-fidelizacao` — 8 páginas

1. **Como Pedir Indicação e Fidelizar Cliente sem Parecer Inconveniente 💅** — O guia da profissional que cresce com leveza e carinho
2. **Cliente fiel vale mais do que cliente nova** — 5x mais caro conquistar uma cliente nova do que manter quem já está com você. 100% de graça: quem te ama te indica sem você precisar pagar nada
3. **O momento certo de pedir indicação** — 1: ela acabou de ver o resultado. 2: está sorrindo no espelho ✨. 3: esse é o instante de ouro — fala agora!
4. **Frases prontas pra usar agora 🗣** — "Amei fazer em você! Se tiver alguma amiga que queira vir, me manda o contato dela 💛" · "Você ficou linda! Qualquer amiga sua que vier, fala que é sua indicação — tenho um mimo especial." · "Adoro atender clientes como você. Me indica pra quem você achar que vai gostar!"
5. **Como agradecer quem te indica 🎁** — Desconto na próxima visita. Mimo surpresa — hidratação, esmalte ou brinde. Mensagem carinhosa no WhatsApp. Destaque nos stories com a permissão dela
6. **Erro comum: pedir cedo demais ou toda hora 🚫** — ❌ Pedir na 1ª visita: ela ainda não confia, vai parecer desesperado. ❌ Repetir toda vez: cansa e afasta, a cliente some sem explicação. ✅ Construa confiança: aí o pedido sai natural — sem forçar nada
7. **O segredo da fidelização é simples 💜** — Lembra o nome, o estilo e o que ela gosta. Manda mensagem no aniversário dela 🎂. Avisa quando tiver promoção — antes de todo mundo. Faz ela se sentir especial — não só mais uma cliente
8. **Você não precisa ser inconveniente pra crescer 💛** — Entrega um serviço incrível, trata sua cliente com carinho — e a indicação vem naturalmente. Só dê um empurrãozinho na hora certa e colha os frutos. 🌸 *Salva esse carrossel e compartilha com uma colega que precisa ouvir isso! 💅*

### 5. "Quanto cobrar sem perder cliente (nem dinheiro)" *(PRO · ordem 5)*
`slug: precificar-servicos` — 8 páginas

1. **Como Precificar Seus Serviços Sem Perder Cliente** — O guia prático para profissionais da beleza que merecem ser bem pagas 💜
2. **Cobrar barato demais está te prejudicando** — 😓 Você se esgota: trabalha muito e ganha pouco. 💸 Não sobra nada: o dinheiro some antes do fim do mês. 📉 Você desvaloriza: cliente barato não reconhece seu valor
3. **Quanto você realmente precisa cobrar?** — 1: some seus gastos do mês (aluguel, produtos, transporte, contas). 2: conte quantos atendimentos você faz por semana e por mês. 3: divida e adicione seu lucro — esse é o seu preço mínimo, nunca cobre menos
4. **A conta simples que muda tudo** — 1: 💄 custo (produto + luz + aluguel). 2: ⏱ seu tempo (quanto vale 1 hora do seu trabalho?). 3: ✨ lucro (o que sobra pra você crescer). Custo + Tempo + Lucro = Seu preço justo 💜
5. **Como reajustar o preço sem perder cliente antigo** — 01: avise com antecedência — fale antes, sem surpresas. 02: seja honesta e gentil — "Meus custos aumentaram e preciso ajustar". 03: aumente aos poucos — pequenos reajustes são mais fáceis de aceitar. 04: mantenha a qualidade — quem valoriza seu trabalho fica 💜
6. **O que fazer quando o cliente reclama do preço** — 🗣 Não se justifique demais: explique com calma e confiança, você não precisa pedir desculpa. 💎 Mostre o seu valor: lembre o que você entrega — qualidade, cuidado, resultado. 🚪 Tudo bem dizer não: cliente que só quer barato não é o seu cliente ideal
7. **"Seu trabalho vale o que você cobra."** — Você estudou. Você praticou. Você cuida de cada detalhe. Cobrar bem não é ganância — é respeito pelo seu próprio trabalho. 💜
8. **Você chegou até aqui — agora vai cobrar o que merece 💛** — 📌 Salva esse carrossel: para relembrar sempre que precisar. 💌 Manda pra uma amiga: que também merece cobrar bem. ⭐ Comece hoje: reajuste um serviço agora mesmo!

### 6. "Julho tá passando e o dinheiro junto" *(PRO · ordem 6 — sazonal)*
`slug: julho-ta-passando-dinheiro-junto` — 8 páginas

1. **Julho tá passando — e o dinheiro junto! 💸** — Só quem se prepara é quem fatura.
2. **Por que julho é ouro pra você? ❄️🏖** — ❄️ Frio resseca: cabelo e pele pedem cuidado — e pagam por isso. 🏖 Férias escolares: mães com mais tempo livre e dispostas a se cuidar. 💰 Resultado: mais gente no salão, ticket maior, agenda cheia
3. **Crie o Pacote Família Julho** — Mãe + filho no mesmo dia: agenda cheia e ticket maior de uma vez só. Desconto no combo: atrai, fideliza e cria hábito nas duas pessoas
4. **Serviços de inverno que vendem sozinhos 🧴** — 💧 Hidratação Profunda: fios ressecados pelo frio pedem tratamento intensivo. ✨ Hidratação Facial: pele seca no inverno — oportunidade garantida. 🧴 Tratamento Capilar: o frio cria a necessidade — você oferece a solução
5. **Como divulgar sua promoção de julho 📲** — 01: Instagram — post antes/depois + stories com contagem regressiva. 02: WhatsApp — mensagem direta pra sua lista de clientes agora. 03: CarreiraBeauty — atualize seu perfil com os serviços da estação
6. **O erro que faz você perder clientes 😬** — 😴 Salão vazio: você esperando o cliente aparecer sozinho. 🔥 Salão cheio: concorrente que divulgou está faturando agora. Julho não espera — e nem o cliente. Quem não divulga, perde
7. **Julho é agora. Vai lá! 🚀** — "Quem planta em julho, colhe o mês inteiro. Seu próximo cliente está esperando por você."
8. **Comece hoje: seu checklist de julho ✅** — Monte seu Pacote Família. Destaque 2 serviços de inverno. Mande msg pra 5 clientes agora. Atualize no CarreiraBeauty. *💜 Salve esse post e compartilhe com uma colega que precisa faturar em julho!*

### Copy da lista (verbatim)
- Título da seção: "Conteúdo pra você crescer"
- Card de promoção cruzada pro quiz: título = nome da trilha, subtítulo "Complete a trilha e ganhe um certificado pro seu perfil"
- Estado vazio: "Nenhum conteúdo publicado ainda. Volte em breve!"

---

## B.4 Observações pra reestruturação

1. **Tom e formato já estabelecidos**: carrosséis curtos estilo Instagram, com emoji, listas numeradas/bullet, linguagem informal e direta ("você merece", "vai lá", "não é ganância"), sempre fechando com CTA pro CarreiraBeauty e um pedido de compartilhamento. Se for reescrever, vale decidir se mantém esse tom ou muda.
2. **Quiz não tem feedback pedagógico** — só acerta/erra sem explicação do porquê. Pode ser uma oportunidade de melhoria (explicar a resposta certa).
3. **Certificado não existe de verdade** — hoje é só uma promessa de UI. Se for reestruturar o quiz, vale já desenhar como o certificado de fato vai se parecer.
4. **Não existe CMS pra nenhuma das duas coisas** — quiz é código (deploy pra mudar), conteúdo é upload manual de PDF + insert direto no banco. Uma reestruturação de conteúdo também é uma boa oportunidade pra decidir se vale construir uma tela de admin pra isso.
5. **O conteúdo #6 é sazonal** ("Julho tá passando") — pensado pra um mês específico, não é evergreen como os outros 5.
