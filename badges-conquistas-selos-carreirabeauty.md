# CarreiraBeauty — Taxonomia de Badges: Conquistas & Selos

Documento de design da mecânica de badges do profissional. Objetivo: mapear os
dois tipos (internos/privados e externos/públicos) antes de construir, pra que a
implementação siga uma regra clara e não vire uma sopa de troféus.

Público-alvo do produto (lembrete pra copy): profissional de beleza, baixa renda,
lê pouco, informal. Copy sempre direta, concreta e aspiracional — nada corporativo.

---

## 0. Princípios (as regras que governam o sistema)

1. **Só vai pro site o que aumenta o valor dela pra quem contrata.** Engajamento
   (usou o app) motiva a profissional, mas não impressiona a dona de salão — e
   na vitrine pública pode até jogar contra ("acabou de começar").
2. **Dois tipos, duas lógicas:**
   - **Conquistas** = privadas, motivam, gamificam. Pode ser *generoso*.
   - **Selos & Certificados** = públicos, credenciais. Tem que ser *rigoroso*.
3. **Todo selo público é verdadeiro e verificável.** Selo inflado perde
   credibilidade com quem contrata — e aí queima todos os outros junto.
4. **Selo externo é imagem compartilhável = anúncio.** Cada certificado postado
   no story com a marca é aquisição grátis. Esse é o real valor do lado externo.
5. **Não super-badgear.** No público, 1-2 selos fortes valem mais que 10 fracos.
6. **Todo badge tem um "próximo passo".** Não é só troféu — é gatilho pra próxima
   ação (completar, pedir depoimento, virar PRO).

---

## 1. Anatomia de um badge (campos que todo badge tem)

| Campo | Descrição |
|---|---|
| `slug` | identificador único (ex: `perfil-completo`, `cert-autoestima`) |
| `nome` | nome amigável, na linguagem do público |
| `tipo` | `conquista` (privado) \| `selo` (público) |
| `icone` | ícone Phosphor |
| `criterio` | condição objetiva de desbloqueio (mensurável no banco) |
| `estado` | `bloqueado` \| `em_progresso` \| `desbloqueado` |
| `visibilidade` | `painel` \| `site_publico` \| `compartilhavel` |
| `gate` | `gratis` \| `pro` |
| `copy_desbloqueio` | mensagem de celebração ao ganhar |
| `proximo_passo` | CTA/gancho depois de ganhar |

---

## 2. CONQUISTAS (internas · privadas · motivacionais)

Vivem no **painel** (home + perto do anel de completude). Ao desbloquear:
toast de celebração. Todas **grátis**. Servem ativação e retenção.

### 2.1 Ativação (primeiros passos)
| Conquista | Critério | Copy de desbloqueio | Próximo passo |
|---|---|---|---|
| Perfil no ar | onboarding concluído (tem slug) | "Seu site tá no ar! 🎉" | Completar o perfil |
| Primeira foto | `foto_perfil_url` preenchido | "Ficou com a sua cara! 📸" | Adicionar apresentação |
| Perfil completo | 6/6 itens de força-do-perfil | "Perfil completo! Você é chamada primeiro 💪" | Mudar o visual (PRO) |
| Portfólio caprichado | 3+ fotos no portfólio | "Seu trabalho tá na vitrine! ✨" | Pedir um depoimento |

### 2.2 Uso / candidaturas
| Conquista | Critério | Copy | Próximo passo |
|---|---|---|---|
| Primeira candidatura | 1ª `application` enviada | "Primeira vaga aplicada! Bora conseguir mais 🚀" | Ver mais vagas |
| Em movimento | 5 candidaturas enviadas | "5 candidaturas! Constância traz resultado" | — |

### 2.3 Aprendizado
| Conquista | Critério | Copy | Próximo passo |
|---|---|---|---|
| Começou a estudar | 1º módulo de trilha concluído | "Começou a trilha! Continua 👏" | Próximo módulo |
| Trilha concluída ⭐ | trilha 100% (bridge → certificado) | "Trilha concluída! Seu certificado tá pronto 🏅" | Ver/compartilhar certificado |

### 2.4 Crescimento / prova (bridges)
| Conquista | Critério | Copy | Próximo passo |
|---|---|---|---|
| Pediu recomendação | 1º pedido de depoimento enviado | "Pedido enviado! Boas recomendações valem ouro" | Pedir pra mais clientes |
| Primeira recomendação | 1º depoimento recebido (bridge → selo) | "Você foi recomendada! Isso aparece no seu site ⭐" | Pedir mais |

> **Constância (retenção) — fase 2, sem streak diário (decidido).** Streak não
> combina com o contexto (busca trabalho quando precisa; quebraria justo quando
> consegue vaga). Quando entrar, reformular pra presença com significado
> ("1 mês com a gente", "perfil sempre atualizado"). Ver decisão #4.

---

## 3. SELOS & CERTIFICADOS (externos · públicos · compartilháveis)

Aparecem no **site público** (dentro dos templates de perfil) e na prateleira
"Suas provas" do hub Crescer. Os principais viram **imagem compartilhável**.
Curadoria rigorosa — poucos e fortes.

### 3.1 Certificados (competência — vêm das trilhas)
| Selo | Critério | Onde aparece | Gate | Compartilhável |
|---|---|---|---|---|
| Certificado [nome da trilha] (ex: Autoestima e Postura) | trilha 100% | site + painel | ganhar grátis; **exibir no site + compartilhar = PRO** | Sim (imagem branded, PRO) |
| _(futuras trilhas: Atendimento, Precificação, Higiene/Biossegurança…)_ | idem | idem | idem | idem |

### 3.2 Selos de prova social (vêm dos depoimentos)
| Selo | Critério | Gate | Nota |
|---|---|---|---|
| Recomendada por N clientes | N depoimentos aprovados | grátis | Número puro (sem tiers) — mostra a contagem real de depoimentos |

### 3.3 Selos de confiança
| Selo | Critério | Gate | Nota |
|---|---|---|---|
| Verificada | telefone/identidade confirmados | **PRO** | Confiança vira sinal premium — só PRO exibe o selo |

### 3.4 Selos de confiabilidade / atividade credível
| Selo | Critério | Gate | Nota |
|---|---|---|---|
| Responde rápido | tempo médio de resposta baixo (se der pra medir) | grátis | Confiabilidade — só ligar se houver dado real |
| Atende há X anos | campo experiência | grátis | Já existe como tag; virar selo visual |
| Disponível agora | ativa/atualizou recentemente | grátis | Ajuda o contratante a saber que tá ativa |

> **Regra de ouro dos selos:** engajamento **nunca** vira selo público.
> "Perfil completo" e "1ª vaga" ficam só nas Conquistas.

---

## 4. Bridges (conquista privada que vira selo público)

O elo entre os dois mundos — a ação motivada internamente gera a credencial externa:

- **Concluir trilha** (conquista) → **Certificado** (selo)
- **Coletar depoimentos** (conquista de ação) → **Recomendada por N clientes** (selo)

Isso mantém o loop do hub Crescer: **Aprende → Prova → Mostra**.

---

## 5. Onde cada coisa vive (superfícies)

| Superfície | O que mostra |
|---|---|
| Home / painel (perto do anel de completude) | Conquistas (grade + toast ao desbloquear) |
| Hub Crescer → "Suas provas" | Selos & Certificados (estado + CTA) |
| Site público (`/perfil/[slug]`, dentro dos templates) | Selos & Certificados conquistados |
| Gerador de imagem compartilhável | Certificados + selos principais (story/post branded) |
| Notificação (toast / e-mail) | Desbloqueio de conquista ou selo |

---

## 6. Monetização (grátis vs PRO)

- **Conquistas:** 100% grátis. São motor de ativação/retenção — cobrar aqui
  seria tiro no pé.
- **Recomendada por N:** grátis — prova social eleva a qualidade do marketplace
  inteiro, e o número atrai quem contrata.
- **Certificados:** *ganhar* é grátis (fazer a trilha); **exibir no site +
  compartilhar imagem branded = PRO.**
- **Verificada:** **PRO** — o selo de confiança vira sinal premium.
- Diretriz: **conquistas vendem engajamento (grátis); selos de credencial
  (certificado, Verificada) vendem valor (PRO); prova social (Recomendada) fica
  grátis pra alimentar o marketplace.**

---

## 7. Roadmap sugerido de implementação

1. **Conquistas de ativação** — baratas, reaproveitam a força-do-perfil que já
   existe. Mexem em retenção imediatamente.
2. **Certificado compartilhável** — transformar o certificado atual em imagem
   branded pra story (loop de aquisição).
3. **Depoimentos → selo "Recomendada por N"** — depende de construir a ferramenta
   de depoimentos.
4. **Selos Verificada / Responde rápido** — dependem de verificação e de dado de
   tempo de resposta.

---

## 8. Decisões

### Decididas
1. **Certificado: exibir no site + compartilhar = PRO.**
2. **Selo "Verificada" = PRO.**
3. **Selo de depoimentos = número puro** ("Recomendada por N clientes"), sem tiers.
4. **Conquistas de constância = fase 2, e sem streak diário.** Streak não combina
   com o contexto (a profissional busca trabalho quando precisa, não é usuária
   diária — e o streak quebraria justo quando ela consegue uma vaga). O sinal de
   "tá ativa" rende mais como o selo público "Disponível agora". Quando entrar,
   reformular pra presença com significado ("1 mês com a gente", "perfil sempre
   atualizado"), não dias seguidos.

### Em aberto
5. **Quais trilhas** além de "Autoestima e Postura" viram certificado?
6. **"Responde rápido"** — temos como medir tempo de resposta hoje? Se não, sai da lista inicial.
