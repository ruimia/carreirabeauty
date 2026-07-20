export interface QuizPergunta {
  pergunta: string;
  opcoes: string[];
  correta: number;
  /** mostrado na hora, assim que ela acerta (estilo Duolingo) */
  feedbackSucesso: string;
  /** mostrado na hora, assim que ela erra — explica o porquê, não só corrige */
  feedbackErro: string;
}

export interface QuizModulo {
  slug: string;
  titulo: string;
  descricao: string;
  icone: string;
  perguntas: QuizPergunta[];
}

export interface Trilha {
  slug: string;
  titulo: string;
  certificadoNome: string;
  modulos: QuizModulo[];
}

export const TRILHA_AUTOESTIMA: Trilha = {
  slug: "autoestima-postura",
  titulo: "Autoestima e Postura Profissional",
  certificadoNome: "Atendimento e Postura Profissional Certificado",
  modulos: [
    {
      slug: "primeira-impressao",
      titulo: "A primeira impressão",
      descricao: "Pontualidade, comunicação inicial e apresentação pessoal.",
      icone: "ph-fill ph-handshake",
      perguntas: [
        {
          pergunta: "Você tem um horário marcado às 14h e percebe que vai chegar 10 minutos atrasada. O que fazer?",
          opcoes: [
            "Avisar o cliente assim que perceber o atraso, explicando o novo horário",
            "Chegar e não comentar nada, só se atrasou um pouco",
            "Cancelar o atendimento sem avisar",
          ],
          correta: 0,
          feedbackSucesso: "Isso aí! Avisar mostra respeito pelo tempo do cliente e evita estresse na chegada.",
          feedbackErro: "Quase lá! O ideal é avisar assim que perceber o atraso — silêncio ou cancelar sem explicação passa desleixo.",
        },
        {
          pergunta: "Qual atitude passa mais profissionalismo logo na chegada?",
          opcoes: [
            "Cumprimentar, se apresentar e confirmar o que foi combinado",
            "Já começar o atendimento sem falar nada",
            "Esperar o cliente puxar assunto",
          ],
          correta: 0,
          feedbackSucesso: "Exato! Esse gesto simples já mostra profissionalismo antes mesmo de começar o serviço.",
          feedbackErro: "Repensa aí: começar sem falar nada ou esperar o cliente puxar assunto deixa o clima estranho logo de cara.",
        },
        {
          pergunta: "Um cliente novo chega meio desconfiado. A melhor forma de gerar confiança logo de cara é:",
          opcoes: [
            "Falar mal de outros profissionais do mercado",
            "Explicar com calma o que vai ser feito e tirar dúvidas antes de começar",
            "Ignorar e seguir direto pro serviço",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Explicar o que vai rolar tira a desconfiança e já cria conexão.",
          feedbackErro: "Não é bem assim — ignorar ou falar mal da concorrência só afasta quem ainda não te conhece.",
        },
        {
          pergunta: "Sobre aparência pessoal no atendimento, o mais importante é:",
          opcoes: [
            "Estar sempre com roupa de marca",
            "Estar limpa, organizada e com postura condizente com o serviço prestado",
            "Não importa, só o resultado do serviço conta",
          ],
          correta: 1,
          feedbackSucesso: "Na régua! Aparência cuidada passa profissionalismo, sem precisar de marca.",
          feedbackErro: "Repara: roupa de marca não é o que conta, e a aparência também faz parte do serviço.",
        },
      ],
    },
    {
      slug: "comunicacao-cliente",
      titulo: "Comunicação com o cliente",
      descricao: "Escuta ativa, tom de voz e condução da conversa durante o atendimento.",
      icone: "ph-fill ph-chats-circle",
      perguntas: [
        {
          pergunta: "O cliente está explicando o que quer, mas de um jeito confuso. O que fazer?",
          opcoes: [
            "Fingir que entendeu pra não parecer que não sabe",
            "Repetir com suas palavras o que entendeu e confirmar antes de começar",
            "Fazer do seu jeito, sem confirmar",
          ],
          correta: 1,
          feedbackSucesso: "Isso! Confirmar o que entendeu evita retrabalho e mostra que você prestou atenção.",
          feedbackErro: "Cuidado: fingir que entendeu ou fazer no seu jeito sem confirmar é receita pra cliente insatisfeito.",
        },
        {
          pergunta: "Escuta ativa quer dizer:",
          opcoes: [
            "Ouvir só esperando sua vez de falar",
            "Prestar atenção de verdade, sem interromper, e mostrar que entendeu",
            "Concordar com tudo sem prestar atenção",
          ],
          correta: 1,
          feedbackSucesso: "Exato! Escuta ativa é sobre entender de verdade, não só esperar sua vez de falar.",
          feedbackErro: "Repensa: ouvir só esperando a vez ou concordar sem prestar atenção não é escuta de verdade.",
        },
        {
          pergunta: "Qual tom de voz costuma funcionar melhor num atendimento?",
          opcoes: [
            "Calmo e claro, ajustando o ritmo conforme o cliente",
            "Sempre bem baixinho, quase sussurrando",
            "Sempre animado e alto, não importa a situação",
          ],
          correta: 0,
          feedbackSucesso: "Isso mesmo! Ajustar o tom ao cliente cria mais conexão que um jeito fixo de falar.",
          feedbackErro: "Não é bem isso — tom sempre baixo ou sempre alto não combina com toda situação.",
        },
        {
          pergunta: "O cliente ficou em silêncio durante o atendimento. Você:",
          opcoes: [
            "Insiste em puxar assunto o tempo todo, mesmo sem resposta",
            "Respeita o silêncio, mas segue disponível se ele quiser conversar",
            "Pergunta se ele está bravo com alguma coisa",
          ],
          correta: 1,
          feedbackSucesso: "Na régua! Respeitar o silêncio sem sumir é o equilíbrio certo.",
          feedbackErro: "Cuidado: insistir em puxar assunto ou presumir que ele está bravo pode deixar o cliente incomodado.",
        },
      ],
    },
    {
      slug: "lidando-reclamacao",
      titulo: "Lidando com reclamação sem se abalar",
      descricao: "Separar crítica do trabalho de crítica pessoal.",
      icone: "ph-fill ph-chat-centered-dots",
      perguntas: [
        {
          pergunta: "Uma cliente reclama do resultado do serviço. A primeira reação ideal é:",
          opcoes: [
            "Discutir e explicar por que ela está errada",
            "Ouvir com calma, entender o que incomodou, e ver o que pode ser ajustado",
            "Ficar em silêncio e não responder nada",
          ],
          correta: 1,
          feedbackSucesso: "Isso aí! Ouvir com calma antes de reagir já resolve metade da reclamação.",
          feedbackErro: "Repensa: discutir ou ficar em silêncio só piora a situação com o cliente.",
        },
        {
          pergunta: "Reclamação sobre o trabalho significa que:",
          opcoes: [
            "Você é uma péssima profissional",
            "Algo pode ser melhorado ou ajustado — não é um ataque pessoal",
            "O cliente está sempre errado e não merece resposta",
          ],
          correta: 1,
          feedbackSucesso: "Exato! Separar a crítica do trabalho de crítica pessoal é o que te protege emocionalmente.",
          feedbackErro: "Não é bem assim — reclamação não te define como profissional, mas também não pode ser ignorada.",
        },
        {
          pergunta: "Depois de resolver uma reclamação, o que ajuda a seguir em frente?",
          opcoes: [
            "Ficar remoendo o caso o dia inteiro",
            "Anotar o aprendizado e seguir o dia normalmente",
            "Comentar com outros clientes o que aconteceu",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Aprender e seguir em frente é mais saudável que remoer o dia inteiro.",
          feedbackErro: "Cuidado: ficar remoendo ou comentar com outros clientes só espalha o desconforto.",
        },
        {
          pergunta: "Se você errou mesmo, a atitude mais profissional é:",
          opcoes: [
            "Negar o erro até o fim",
            "Assumir, se desculpar e propor uma solução",
            "Culpar o produto ou o horário",
          ],
          correta: 1,
          feedbackSucesso: "Na régua! Assumir o erro com solução na mão é o que constrói confiança de verdade.",
          feedbackErro: "Repensa: negar ou culpar o produto/horário mina a confiança que você construiu até aqui.",
        },
      ],
    },
    {
      slug: "postura-mensagens",
      titulo: "Postura em mensagens (WhatsApp/redes)",
      descricao: "Tom escrito, tempo de resposta e profissionalismo em texto.",
      icone: "ph-fill ph-whatsapp-logo",
      perguntas: [
        {
          pergunta: "Um cliente manda mensagem de madrugada perguntando sobre horário. Você deve:",
          opcoes: [
            "Responder na hora, não importa o horário",
            "Responder no seu horário comercial normal, sem se cobrar por não ter respondido de madrugada",
            "Nunca mais responder esse cliente",
          ],
          correta: 1,
          feedbackSucesso: "Isso aí! Responder no seu horário normal é saudável e não significa desrespeito.",
          feedbackErro: "Cuidado: responder de madrugada ou sumir pro cliente são dois extremos que não ajudam.",
        },
        {
          pergunta: "Escrever tudo em CAIXA ALTA numa mensagem geralmente passa a sensação de:",
          opcoes: [
            "Educação e cuidado",
            "Estar gritando ou nervosa",
            "Nada, é neutro",
          ],
          correta: 1,
          feedbackSucesso: "Exato! CAIXA ALTA costuma soar como grito, mesmo sem essa intenção.",
          feedbackErro: "Repensa: caixa alta não passa educação nem é neutro — geralmente soa como estar nervosa.",
        },
        {
          pergunta: "Qual é uma boa prática ao combinar horário por mensagem?",
          opcoes: [
            "Confirmar por escrito data, horário e serviço combinado",
            "Combinar de boca e não registrar nada",
            "Deixar em aberto pra ver depois",
          ],
          correta: 0,
          feedbackSucesso: "Isso mesmo! Registrar por escrito evita mal-entendido de data e horário.",
          feedbackErro: "Cuidado: combinar de boca ou deixar em aberto é convite pro esquecimento e confusão.",
        },
        {
          pergunta: "Um cliente manda uma mensagem grosseira. A resposta mais profissional é:",
          opcoes: [
            "Responder no mesmo tom",
            "Manter a educação, responder objetivamente e, se persistir, avaliar se quer manter esse cliente",
            "Ignorar para sempre sem explicação",
          ],
          correta: 1,
          feedbackSucesso: "Na régua! Manter a educação e avaliar depois protege sua reputação.",
          feedbackErro: "Repensa: responder no mesmo tom ou ignorar sem explicação pode piorar a situação.",
        },
      ],
    },
    {
      slug: "impondo-limites",
      titulo: "Impondo limites com respeito",
      descricao: "Dizer não, cobrar atraso e recusar pedido fora do combinado sem soar rude.",
      icone: "ph-fill ph-hand-palm",
      perguntas: [
        {
          pergunta: "Um cliente pede um desconto que você não pode dar. A melhor forma de recusar é:",
          opcoes: [
            "Aceitar mesmo não podendo, pra não desagradar",
            "Explicar com educação que o valor já é o combinado e por quê",
            "Não responder e sumir",
          ],
          correta: 1,
          feedbackSucesso: "Isso aí! Explicar o motivo com educação é o jeito certo de manter seu valor.",
          feedbackErro: "Cuidado: aceitar mesmo não podendo ou sumir sem resposta enfraquece seu trabalho.",
        },
        {
          pergunta: "Um cliente atrasa direto para os horários marcados. Uma atitude profissional é:",
          opcoes: [
            "Nunca comentar nada e deixar acontecer sempre",
            "Conversar com educação sobre uma política de tolerância de atraso",
            "Cancelar sem avisar da próxima vez",
          ],
          correta: 1,
          feedbackSucesso: "Exato! Conversar com educação evita que o atraso vire hábito sem parecer chata.",
          feedbackErro: "Repensa: nunca comentar ou cancelar sem avisar são extremos que prejudicam a relação.",
        },
        {
          pergunta: "Dizer 'não' pra um pedido fora do combinado é:",
          opcoes: [
            "Sempre falta de educação",
            "Uma forma legítima de proteger seu trabalho e seu tempo",
            "Algo que só profissional grande pode fazer",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Dizer não com educação é profissionalismo, não falta de educação.",
          feedbackErro: "Não é bem assim — dizer não é legítimo em qualquer fase da carreira, não só pra quem já é grande.",
        },
        {
          pergunta: "Impor limites com respeito significa:",
          opcoes: [
            "Ser dura e ríspida",
            "Ser clara e educada ao mesmo tempo",
            "Evitar qualquer tipo de recusa",
          ],
          correta: 1,
          feedbackSucesso: "Na régua! Clareza com educação é o equilíbrio ideal pra impor limite.",
          feedbackErro: "Cuidado: ser dura ou evitar toda recusa não é o caminho — o equilíbrio é a chave.",
        },
      ],
    },
    {
      slug: "autoconfianca",
      titulo: "Autoconfiança e superando a insegurança",
      descricao: "Lidar com a sensação de 'não ser boa o suficiente' e reconhecer o próprio valor.",
      icone: "ph-fill ph-sparkle",
      perguntas: [
        {
          pergunta: "Bater aquela insegurança antes de um atendimento novo é:",
          opcoes: [
            "Sinal de que você não deveria estar nessa profissão",
            "Normal, e não define sua competência",
            "Algo que só acontece com iniciantes",
          ],
          correta: 1,
          feedbackSucesso: "Isso aí! Insegurança antes de um atendimento novo é normal e não diz nada sobre sua competência.",
          feedbackErro: "Repensa: isso não é exclusivo de iniciante nem significa que você não deveria estar na profissão.",
        },
        {
          pergunta: "Comparar seu trabalho com o de outras profissionais o tempo todo tende a:",
          opcoes: [
            "Te motivar sempre",
            "Alimentar insegurança sem necessariamente te ajudar a crescer",
            "Não ter nenhum efeito",
          ],
          correta: 1,
          feedbackSucesso: "Exato! Comparação excessiva geralmente trava mais do que motiva.",
          feedbackErro: "Cuidado: achar que comparação sempre motiva ou não tem efeito ignora o quanto isso pode pesar.",
        },
        {
          pergunta: "Uma forma saudável de lidar com um dia ruim de trabalho é:",
          opcoes: [
            "Concluir que você não serve para a profissão",
            "Reconhecer o que não foi bem, sem generalizar pra tudo que você é",
            "Desistir de tentar melhorar",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Um dia ruim não apaga tudo que você já construiu.",
          feedbackErro: "Repensa: concluir que não serve pra profissão ou desistir generaliza um momento só.",
        },
        {
          pergunta: "Reconhecer o próprio valor profissional inclui:",
          opcoes: [
            "Lembrar da sua experiência e dos clientes que você já atendeu bem",
            "Só confiar quando alguém mais elogiar",
            "Nunca comemorar nenhuma conquista",
          ],
          correta: 0,
          feedbackSucesso: "Na régua! Sua experiência e seus resultados já são prova do seu valor.",
          feedbackErro: "Cuidado: só confiar quando alguém elogia ou nunca comemorar suas conquistas mina sua autoconfiança.",
        },
      ],
    },
  ],
};
