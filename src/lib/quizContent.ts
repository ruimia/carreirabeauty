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
  /** frase curta explicando o ganho — usada nos cards de listagem */
  descricao: string;
  /** ícone representativo da trilha inteira (cards de listagem) */
  icone: string;
  /** nome do certificado — pensado pra soar como algo que ela quer ter e a
      empresa valoriza ver, não como "nome de curso" */
  certificadoNome: string;
  modulos: QuizModulo[];
}

export const TRILHA_AUTOESTIMA: Trilha = {
  slug: "autoestima-postura",
  titulo: "Autoestima e Postura Profissional",
  descricao: "Pontualidade, comunicação e postura que fazem o cliente confiar em você.",
  icone: "ph-fill ph-handshake",
  certificadoNome: "Atendimento Nota 10",
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

export const TRILHA_PRECO_JUSTO: Trilha = {
  slug: "preco-justo",
  titulo: "Preço Justo",
  descricao: "Aprenda a cobrar o que seu trabalho vale, sem perder cliente.",
  icone: "ph-fill ph-hand-coins",
  certificadoNome: "Preço Justo",
  modulos: [
    {
      slug: "calculo-preco",
      titulo: "Como calcular seu preço",
      descricao: "A conta por trás de um preço justo: custo, tempo e lucro.",
      icone: "ph-fill ph-calculator",
      perguntas: [
        {
          pergunta: "Pra saber quanto cobrar por um serviço, o primeiro passo é:",
          opcoes: [
            "Copiar o preço de quem você admira",
            "Somar custo do material, seu tempo e o que você quer ganhar",
            "Cobrar o que o cliente disser que pode pagar",
          ],
          correta: 1,
          feedbackSucesso: "Isso aí! Preço de verdade nasce da sua conta, não da conta dos outros.",
          feedbackErro: "Repensa: copiar preço alheio ou deixar o cliente decidir ignora seus custos e seu tempo.",
        },
        {
          pergunta: "Se você cobra menos que seu custo + tempo, no fim do mês:",
          opcoes: [
            "Você trabalha de graça ou no prejuízo, mesmo com a agenda cheia",
            "Isso nunca faz diferença",
            "Só afeta quem tem poucos clientes",
          ],
          correta: 0,
          feedbackSucesso: "Exato! Agenda cheia com preço errado só significa trabalhar mais pra ganhar pouco.",
          feedbackErro: "Cuidado: preço abaixo do custo pesa no bolso, não importa quantos clientes você tenha.",
        },
        {
          pergunta: "Seu tempo de trabalho (o quanto você demora em cada serviço) deve entrar na conta do preço?",
          opcoes: [
            "Sim — tempo também é custo, mesmo sem gastar dinheiro nele",
            "Não, só material importa",
            "Só se o cliente perguntar",
          ],
          correta: 0,
          feedbackSucesso: "Isso mesmo! Seu tempo vale dinheiro — ele também compõe o preço.",
          feedbackErro: "Repensa: ignorar seu tempo de trabalho é um dos motivos mais comuns de cobrar barato demais.",
        },
        {
          pergunta: "Antes de definir um preço novo, também vale:",
          opcoes: [
            "Ver o que profissionais da sua região com experiência parecida cobram",
            "Escolher um número aleatório",
            "Nunca mudar o preço, seja qual for a situação",
          ],
          correta: 0,
          feedbackSucesso: "Na régua! Pesquisar o mercado local ajuda a calibrar um preço justo pros dois lados.",
          feedbackErro: "Cuidado: preço no chute ou fixo pra sempre ignora tanto seus custos quanto o mercado.",
        },
      ],
    },
    {
      slug: "separar-contas",
      titulo: "Separando as contas",
      descricao: "Por que o dinheiro do trabalho não pode se misturar com o de casa.",
      icone: "ph-fill ph-wallet",
      perguntas: [
        {
          pergunta: "Misturar o dinheiro do trabalho com o dinheiro de casa costuma causar:",
          opcoes: [
            "Mais clareza sobre quanto você realmente ganha",
            "Confusão sobre se o negócio está dando lucro de verdade",
            "Nenhuma diferença no controle financeiro",
          ],
          correta: 1,
          feedbackSucesso: "Isso aí! Sem separar as contas, fica quase impossível saber se o trabalho está sendo lucrativo.",
          feedbackErro: "Repensa: misturar as contas confunde, não esclarece — dificulta saber se sobra dinheiro de verdade.",
        },
        {
          pergunta: "Uma forma simples de começar a separar as finanças é:",
          opcoes: [
            "Ter uma conta ou 'potinho' só pro dinheiro do trabalho",
            "Guardar tudo na carteira junto",
            "Anotar só de vez em quando, quando lembrar",
          ],
          correta: 0,
          feedbackSucesso: "Exato! Um espaço separado, mesmo simples, já muda o jogo do controle financeiro.",
          feedbackErro: "Cuidado: guardar tudo junto ou anotar de vez em quando dificulta enxergar pra onde o dinheiro vai.",
        },
        {
          pergunta: "Reservar uma parte do que você ganha todo mês (mesmo pouco) serve pra:",
          opcoes: [
            "Nada, é melhor gastar tudo e reservar só quando sobrar",
            "Ter um respiro em mês fraco ou imprevisto",
            "Só quem ganha muito precisa fazer isso",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Reserva, mesmo pequena, é o que te protege em mês de vaca magra.",
          feedbackErro: "Repensa: reserva não é só pra quem ganha muito — quem tem menos margem é quem mais precisa dela.",
        },
        {
          pergunta: "Anotar entradas e saídas do trabalho, mesmo num caderno simples, ajuda a:",
          opcoes: [
            "Enxergar se o negócio está de fato dando lucro",
            "Perder tempo à toa",
            "Só serve pra quem tem MEI",
          ],
          correta: 0,
          feedbackSucesso: "Na régua! Anotar é o jeito mais simples de saber, de verdade, se o mês fechou no azul.",
          feedbackErro: "Cuidado: anotar não é perda de tempo, e vale pra qualquer profissional, com ou sem MEI.",
        },
      ],
    },
    {
      slug: "cobrar-sem-culpa",
      titulo: "Cobrando sem culpa",
      descricao: "Lidar com pedido de desconto e desconforto na hora de cobrar.",
      icone: "ph-fill ph-hand-coins",
      perguntas: [
        {
          pergunta: "Um cliente pede desconto na hora do pagamento. A atitude mais saudável é:",
          opcoes: [
            "Aceitar sempre, pra não perder o cliente",
            "Avaliar com calma se faz sentido pro seu negócio, sem se sentir culpada por dizer não",
            "Nunca dar desconto, em nenhuma hipótese",
          ],
          correta: 1,
          feedbackSucesso: "Isso aí! Avaliar sem culpa é diferente de aceitar tudo ou negar tudo — o equilíbrio é o que protege seu negócio.",
          feedbackErro: "Repensa: aceitar sempre corrói seu preço, e nunca avaliar te deixa engessada demais.",
        },
        {
          pergunta: "Sentir desconforto ao cobrar o preço combinado geralmente vem de:",
          opcoes: [
            "Achar que seu trabalho vale menos do que realmente vale",
            "Sempre é sinal de que o preço está errado",
            "Não tem relação com autoestima profissional",
          ],
          correta: 0,
          feedbackSucesso: "Exato! Esse desconforto quase sempre é sobre autoestima profissional, não sobre o preço em si.",
          feedbackErro: "Cuidado: desconforto ao cobrar nem sempre significa preço errado — muitas vezes é insegurança sobre o próprio valor.",
        },
        {
          pergunta: "Se um cliente reclama do preço toda vez que fecha com você, isso é sinal de que:",
          opcoes: [
            "Você precisa baixar o preço pra sempre",
            "Vale conversar com clareza sobre o valor entregue, ou aceitar que esse cliente pode não ser o ideal",
            "Você deve parar de atender esse cliente sem explicação",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Clareza sobre o valor entregue resolve mais reclamação de preço do que desconto.",
          feedbackErro: "Repensa: baixar preço sempre ou sumir sem explicação não resolve a raiz da reclamação.",
        },
        {
          pergunta: "Cobrar o preço justo, mesmo com medo de perder cliente, é:",
          opcoes: [
            "Um sinal de profissionalismo e respeito pelo seu trabalho",
            "Sempre um erro",
            "Algo que só profissional famosa pode fazer",
          ],
          correta: 0,
          feedbackSucesso: "Na régua! Cobrar direito é profissionalismo — não é exclusividade de quem já é conhecida.",
          feedbackErro: "Cuidado: cobrar certo não é erro nem privilégio de poucas — é o que sustenta qualquer carreira a longo prazo.",
        },
      ],
    },
  ],
};

export const TRILHA_MAOS_SEGURAS: Trilha = {
  slug: "maos-seguras",
  titulo: "Mãos Seguras",
  descricao: "Princípios de higiene e segurança que passam confiança pro cliente.",
  icone: "ph-fill ph-shield-check",
  certificadoNome: "Mãos Seguras",
  modulos: [
    {
      slug: "higiene-entre-clientes",
      titulo: "Higiene entre um cliente e outro",
      descricao: "O básico que protege você e cada cliente que senta na sua cadeira.",
      icone: "ph-fill ph-drop",
      perguntas: [
        {
          pergunta: "Entre um atendimento e outro, o ideal é:",
          opcoes: [
            "Higienizar mãos e superfícies antes do próximo cliente",
            "Só lavar as mãos no início do dia",
            "Não precisa repetir se o cliente anterior 'parecia limpo'",
          ],
          correta: 0,
          feedbackSucesso: "Isso aí! Higienizar entre atendimentos protege você e cada cliente que senta na sua cadeira.",
          feedbackErro: "Cuidado: higiene não depende da 'aparência' do cliente anterior — repetir sempre é o que garante segurança.",
        },
        {
          pergunta: "Lavar as mãos com água e sabão, ou usar álcool em gel, antes de atender:",
          opcoes: [
            "É só frescura, não faz diferença real",
            "Reduz de verdade o risco de contaminação",
            "Só é necessário se o cliente pedir",
          ],
          correta: 1,
          feedbackSucesso: "Exato! É um hábito simples que faz diferença real na segurança do atendimento.",
          feedbackErro: "Repensa: não é frescura nem depende do cliente pedir — é proteção básica pra ambos os lados.",
        },
        {
          pergunta: "Reutilizar a mesma toalha ou material de pano sem lavar entre clientes diferentes é:",
          opcoes: [
            "Tranquilo, desde que pareça limpo",
            "Um risco real de contaminação cruzada",
            "Só importa em clínica, não em salão",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Reutilizar sem lavar é uma das formas mais comuns de contaminação cruzada.",
          feedbackErro: "Cuidado: 'parecer limpo' não garante nada, e esse cuidado vale pra qualquer ambiente de atendimento.",
        },
        {
          pergunta: "Manter o espaço de trabalho organizado e limpo durante o expediente:",
          opcoes: [
            "Só importa no fim do dia",
            "Ajuda a manter a higiene ao longo de todos os atendimentos",
            "Não tem relação com segurança",
          ],
          correta: 1,
          feedbackSucesso: "Na régua! Organização ao longo do dia sustenta a higiene em cada atendimento, não só no fechamento.",
          feedbackErro: "Repensa: esperar o fim do dia pra organizar deixa os atendimentos do meio do expediente vulneráveis.",
        },
      ],
    },
    {
      slug: "materiais-descarte",
      titulo: "Cuidado com materiais e descarte",
      descricao: "Descartáveis, instrumentos reutilizáveis e onde guardar cada coisa.",
      icone: "ph-fill ph-trash",
      perguntas: [
        {
          pergunta: "Materiais de uso único (descartáveis) devem ser:",
          opcoes: [
            "Usados em um cliente só e descartados depois",
            "Reaproveitados se ainda parecem em bom estado",
            "Guardados pra usar quando faltar material novo",
          ],
          correta: 0,
          feedbackSucesso: "Isso aí! Descartável é descartável — usar em um cliente só é o que garante a segurança dele.",
          feedbackErro: "Cuidado: reaproveitar material de uso único anula a proteção que ele deveria oferecer.",
        },
        {
          pergunta: "Instrumentos reutilizáveis (não descartáveis) precisam de:",
          opcoes: [
            "Limpeza e desinfecção adequadas entre um uso e outro",
            "Uma passada rápida de pano seco",
            "Nenhum cuidado especial se forem de metal",
          ],
          correta: 0,
          feedbackSucesso: "Exato! Instrumento reutilizável exige desinfecção de verdade, não só uma limpeza visual.",
          feedbackErro: "Repensa: pano seco ou 'é de metal, não suja' não substituem uma desinfecção adequada.",
        },
        {
          pergunta: "Guardar instrumentos limpos junto com os sujos, no mesmo espaço:",
          opcoes: [
            "Não tem problema, desde que fiquem em cantos diferentes",
            "Contamina os que já estavam limpos",
            "É prático e recomendado",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Misturar limpo com sujo, mesmo em cantos diferentes, compromete os dois.",
          feedbackErro: "Cuidado: separar por canto não basta — limpo e sujo precisam ficar em espaços realmente distintos.",
        },
        {
          pergunta: "Ter um local específico só pra descarte de materiais usados:",
          opcoes: [
            "É frescura de clínica grande",
            "Ajuda a manter o ambiente organizado e seguro",
            "Só é necessário se exigido por lei",
          ],
          correta: 1,
          feedbackSucesso: "Na régua! Um espaço de descarte próprio é simples de montar e já eleva o padrão do seu atendimento.",
          feedbackErro: "Repensa: não é exclusividade de clínica grande — é um cuidado que qualquer profissional pode adotar.",
        },
      ],
    },
    {
      slug: "seguranca-visivel",
      titulo: "Segurança que o cliente enxerga",
      descricao: "Como transformar cuidado com higiene em confiança percebida.",
      icone: "ph-fill ph-shield-check",
      perguntas: [
        {
          pergunta: "Um cliente que vê você higienizando as mãos e os materiais na frente dele tende a:",
          opcoes: [
            "Sentir mais confiança no seu atendimento",
            "Achar estranho e desconfiar de você",
            "Não notar nem se importar",
          ],
          correta: 0,
          feedbackSucesso: "Isso aí! Higiene à vista aumenta a confiança — muitos clientes reparam nisso, mesmo sem comentar.",
          feedbackErro: "Cuidado: a maioria dos clientes nota sim, e isso pesa positivamente na percepção do seu trabalho.",
        },
        {
          pergunta: "Comentar rapidamente com o cliente sobre os cuidados de higiene que você toma é:",
          opcoes: [
            "Desnecessário, ele já deveria saber",
            "Uma forma simples de reforçar profissionalismo",
            "Algo que só clínica precisa fazer",
          ],
          correta: 1,
          feedbackSucesso: "Exato! Um comentário rápido já reforça que você leva a segurança a sério.",
          feedbackErro: "Repensa: não é desnecessário nem exclusivo de clínica — é um diferencial que qualquer profissional pode usar.",
        },
        {
          pergunta: "Ter as unhas, mãos e uniforme/roupa de trabalho visivelmente cuidados:",
          opcoes: [
            "Não tem nada a ver com higiene percebida",
            "Reforça a sensação de cuidado e segurança no atendimento",
            "Só importa em fotos pro Instagram",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Aparência cuidada reforça, na hora, a sensação de segurança que você transmite.",
          feedbackErro: "Cuidado: isso vale no dia a dia real do atendimento, não só pra registro em foto.",
        },
        {
          pergunta: "Manter esses cuidados de higiene sempre, mesmo com a agenda cheia e corrida, é:",
          opcoes: [
            "Importante — é justamente quando a rotina aperta que o descuido mais aparece",
            "Dispensável em dias corridos",
            "Só importa se o cliente perceber",
          ],
          correta: 0,
          feedbackSucesso: "Na régua! Manter o padrão mesmo na correria é o que separa profissional de confiança de quem só improvisa.",
          feedbackErro: "Repensa: dia corrido é exatamente quando o cuidado não pode cair — e não depende do cliente perceber ou não.",
        },
      ],
    },
  ],
};

export const TRILHA_CLIENTE_FIEL: Trilha = {
  slug: "cliente-fiel",
  titulo: "Cliente Fiel",
  descricao: "Como fazer o cliente voltar e ainda te indicar pra outras pessoas.",
  icone: "ph-fill ph-heart-straight",
  certificadoNome: "Cliente Fiel",
  modulos: [
    {
      slug: "primeira-experiencia",
      titulo: "A experiência que faz o cliente voltar",
      descricao: "O que conta além da técnica na hora de fidelizar.",
      icone: "ph-fill ph-smiley",
      perguntas: [
        {
          pergunta: "Além de um bom resultado técnico, o que mais pesa pra um cliente querer voltar?",
          opcoes: [
            "Só o preço baixo importa",
            "Se sentir bem tratado durante todo o atendimento",
            "Nada além da técnica importa",
          ],
          correta: 1,
          feedbackSucesso: "Isso aí! Um bom atendimento soma com a técnica — cliente lembra de como foi tratado, não só do resultado.",
          feedbackErro: "Repensa: preço baixo não fideliza sozinho, e a experiência do atendimento pesa tanto quanto a técnica.",
        },
        {
          pergunta: "Chamar o cliente pelo nome e lembrar de detalhes da conversa anterior:",
          opcoes: [
            "Não faz diferença nenhuma",
            "Faz o cliente se sentir especial e lembrado",
            "Só importa em salão grande",
          ],
          correta: 1,
          feedbackSucesso: "Exato! Pequenos detalhes lembrados fazem o cliente sentir que é importante pra você, não só mais um.",
          feedbackErro: "Cuidado: esse cuidado vale em qualquer tamanho de negócio, e faz sim diferença na fidelização.",
        },
        {
          pergunta: "Se um atendimento não saiu como o cliente esperava, o melhor caminho é:",
          opcoes: [
            "Fingir que está tudo certo e não comentar nada",
            "Ouvir com atenção e ver o que pode ser ajustado",
            "Discutir que o cliente não entende do assunto",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Ouvir e ajustar transforma um problema em prova de que você se importa com o resultado dela.",
          feedbackErro: "Repensa: ignorar ou discutir só afasta o cliente — ouvir é o que abre espaço pra ele confiar de novo.",
        },
        {
          pergunta: "Um cliente satisfeito com o atendimento como um todo (não só a técnica) tende a:",
          opcoes: [
            "Voltar e falar bem de você pra outras pessoas",
            "Isso não influencia se ele volta ou indica",
            "Só voltar se você baixar o preço",
          ],
          correta: 0,
          feedbackSucesso: "Na régua! Experiência boa de verdade gera indicação de graça — o melhor tipo de propaganda que existe.",
          feedbackErro: "Cuidado: a experiência completa é justamente o que mais influencia se ele volta e te indica.",
        },
      ],
    },
    {
      slug: "pos-atendimento",
      titulo: "Depois que o cliente sai",
      descricao: "O contato pós-atendimento que mantém você na cabeça dele.",
      icone: "ph-fill ph-chat-teardrop-dots",
      perguntas: [
        {
          pergunta: "Mandar uma mensagem simples alguns dias depois do atendimento, perguntando como ficou o resultado:",
          opcoes: [
            "É chato e incomoda o cliente",
            "Mostra cuidado e mantém você na lembrança dele",
            "Só serve se o atendimento deu errado",
          ],
          correta: 1,
          feedbackSucesso: "Isso aí! Uma mensagem breve mostra cuidado de verdade e faz seu nome ficar na cabeça do cliente.",
          feedbackErro: "Repensa: mandada com naturalidade, essa mensagem soa como cuidado, não como incômodo.",
        },
        {
          pergunta: "Se o cliente demora pra marcar um novo horário, uma boa prática é:",
          opcoes: [
            "Nunca mais entrar em contato",
            "Mandar uma lembrança gentil, sem cobrar ou pressionar",
            "Cobrar explicações sobre por que não voltou",
          ],
          correta: 1,
          feedbackSucesso: "Exato! Uma lembrança gentil reaproxima sem parecer chato ou insistente demais.",
          feedbackErro: "Cuidado: sumir de vez ou cobrar explicações afasta — o meio-termo gentil é o que reconquista.",
        },
        {
          pergunta: "Guardar informações do cliente (preferências, datas, o que ele já fez) ajuda a:",
          opcoes: [
            "Nada, é só burocracia",
            "Personalizar o próximo atendimento e mostrar atenção",
            "Só importa se você usar um sistema caro",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Até um caderno simples com essas informações já melhora muito a experiência do cliente.",
          feedbackErro: "Repensa: não precisa de sistema caro — o que importa é usar essa informação pra atender melhor.",
        },
        {
          pergunta: "Comemorar datas importantes do cliente (aniversário, por exemplo) com uma mensagem rápida:",
          opcoes: [
            "É perda de tempo",
            "Fortalece o vínculo e mostra que você se importa",
            "Só faz sentido pra clientes que gastam muito",
          ],
          correta: 1,
          feedbackSucesso: "Na régua! Esse tipo de gesto simples fortalece o vínculo com qualquer cliente, não só os que mais gastam.",
          feedbackErro: "Cuidado: não é perda de tempo nem exclusividade de cliente grande — é um gesto simples que fideliza.",
        },
      ],
    },
    {
      slug: "pedindo-indicacao",
      titulo: "Pedindo indicação sem parecer chata",
      descricao: "Como pedir avaliação e indicação de um jeito natural.",
      icone: "ph-fill ph-megaphone",
      perguntas: [
        {
          pergunta: "O melhor momento pra pedir uma avaliação ou indicação é:",
          opcoes: [
            "Logo depois que o cliente elogiou o resultado, satisfeito",
            "No meio de um atendimento corrido",
            "Nunca — é melhor esperar o cliente lembrar sozinho",
          ],
          correta: 0,
          feedbackSucesso: "Isso aí! O momento de satisfação é o gancho natural pra pedir uma avaliação ou indicação.",
          feedbackErro: "Repensa: esperar o cliente lembrar sozinho raramente funciona — o pedido natural vem logo após o elogio.",
        },
        {
          pergunta: "Pedir pra um cliente satisfeito te marcar ou comentar nas redes sociais:",
          opcoes: [
            "É constrangedor e não deve ser feito",
            "É uma forma simples e válida de divulgação",
            "Só funciona pra quem já tem muitos seguidores",
          ],
          correta: 1,
          feedbackSucesso: "Exato! Pedir com naturalidade é uma das formas mais simples e eficazes de divulgar seu trabalho.",
          feedbackErro: "Cuidado: não precisa de muitos seguidores pra funcionar, e não tem nada de constrangedor em pedir com jeito.",
        },
        {
          pergunta: "Oferecer um pequeno benefício (tipo desconto na próxima vez) pra quem indica um novo cliente:",
          opcoes: [
            "Não faz sentido nenhum",
            "Pode incentivar indicações de forma saudável",
            "Só funciona em negócio grande",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Um pequeno incentivo bem pensado motiva o cliente a te indicar mais vezes.",
          feedbackErro: "Repensa: essa prática funciona em qualquer tamanho de negócio, inclusive o seu.",
        },
        {
          pergunta: "Se um cliente elogia mas não comenta sobre indicar você, o ideal é:",
          opcoes: [
            "Perguntar com naturalidade se ele conhece alguém que também precisaria do serviço",
            "Ficar esperando ele oferecer sozinho",
            "Insistir de forma incômoda até ele indicar",
          ],
          correta: 0,
          feedbackSucesso: "Na régua! Perguntar com naturalidade abre a porta sem parecer chata ou insistente.",
          feedbackErro: "Cuidado: ficar esperando ou insistir demais não funciona tão bem quanto um convite natural e leve.",
        },
      ],
    },
  ],
};

export const TRILHA_AGENDA_CHEIA: Trilha = {
  slug: "agenda-cheia",
  titulo: "Agenda Cheia",
  descricao: "Organize horários, evite furo e lide com atraso sem perder a cabeça.",
  icone: "ph-fill ph-calendar-check",
  certificadoNome: "Agenda Cheia",
  modulos: [
    {
      slug: "organizando-horarios",
      titulo: "Organizando os horários",
      descricao: "Como montar uma agenda que funciona pra você e pro cliente.",
      icone: "ph-fill ph-calendar",
      perguntas: [
        {
          pergunta: "Deixar um intervalo entre um atendimento e outro na agenda serve pra:",
          opcoes: [
            "Nada, é só tempo perdido",
            "Absorver atrasos e não atropelar o próximo cliente",
            "Só faz sentido em dia fraco de movimento",
          ],
          correta: 1,
          feedbackSucesso: "Isso aí! Esse intervalo é o que evita que um atraso vire uma bola de neve no resto do dia.",
          feedbackErro: "Repensa: esse intervalo não é tempo perdido — ele protege sua agenda em qualquer dia, cheio ou fraco.",
        },
        {
          pergunta: "Anotar todos os agendamentos em um só lugar (caderno ou app), em vez de decorar ou espalhar em vários lugares:",
          opcoes: [
            "Evita esquecimento e choque de horários",
            "Não faz diferença nenhuma",
            "Só é necessário pra quem tem muitos clientes",
          ],
          correta: 0,
          feedbackSucesso: "Exato! Um lugar só pra agenda evita esquecimento e choque de horário, mesmo com poucos clientes.",
          feedbackErro: "Cuidado: essa organização ajuda desde o primeiro cliente — não é algo só pra agenda cheia de verdade.",
        },
        {
          pergunta: "Confirmar o horário com o cliente um dia antes do atendimento:",
          opcoes: [
            "É desnecessário e chato",
            "Reduz esquecimento e ajuda a evitar furo",
            "Só vale pra cliente novo",
          ],
          correta: 1,
          feedbackSucesso: "Isso mesmo! Uma confirmação simples no dia anterior já reduz bastante o risco de furo.",
          feedbackErro: "Repensa: esse cuidado vale pra qualquer cliente, novo ou antigo — não é chato, é prevenção.",
        },
        {
          pergunta: "Reservar um tempo fixo do seu dia só pra organizar a agenda da semana:",
          opcoes: [
            "É perda de tempo que podia ser usado atendendo",
            "Ajuda a enxergar furos, encaixes e evitar sobrecarga",
            "Só faz sentido se você tiver um assistente",
          ],
          correta: 1,
          feedbackSucesso: "Na régua! Esse tempo de organização se paga evitando confusão e sobrecarga na semana.",
          feedbackErro: "Cuidado: não precisa de assistente pra isso — é um hábito simples que qualquer profissional pode ter.",
        },
      ],
    },
    {
      slug: "evitando-furos",
      titulo: "Evitando furo e cancelamento",
      descricao: "Práticas simples que reduzem falta e cancelamento de última hora.",
      icone: "ph-fill ph-calendar-x",
      perguntas: [
        {
          pergunta: "Pedir um sinal (valor adiantado) pra confirmar horários, principalmente com cliente novo:",
          opcoes: [
            "É abusivo e afasta cliente",
            "É uma prática comum que reduz furo",
            "Só grande empresa pode fazer isso",
          ],
          correta: 1,
          feedbackSucesso: "Isso aí! Pedir sinal é uma prática comum e reduz bastante a chance de furo, especialmente com quem ainda não te conhece.",
          feedbackErro: "Repensa: não é abusivo nem exclusividade de empresa grande — é uma prática comum e saudável.",
        },
        {
          pergunta: "Ter uma política clara sobre cancelamento (por exemplo, avisar com quantas horas de antecedência):",
          opcoes: [
            "Não é necessário combinar isso com o cliente",
            "Ajuda a evitar mal-entendido e furo de última hora",
            "Só serve pra afastar cliente",
          ],
          correta: 1,
          feedbackSucesso: "Exato! Deixar a política clara desde o início evita mal-entendido e protege sua agenda.",
          feedbackErro: "Cuidado: combinar isso não afasta cliente — na verdade, deixa a relação mais profissional e clara.",
        },
        {
          pergunta: "Quando um cliente cancela de última hora com frequência, o ideal é:",
          opcoes: [
            "Conversar com clareza sobre isso, sem embaraço",
            "Nunca comentar nada, mesmo incomodando",
            "Parar de atender sem nenhuma explicação",
          ],
          correta: 0,
          feedbackSucesso: "Isso mesmo! Uma conversa clara e sem embaraço resolve isso melhor do que ficar calada ou sumir sem explicar.",
          feedbackErro: "Repensa: ficar calada ou sumir sem explicação não resolve — uma conversa direta é o caminho mais saudável.",
        },
        {
          pergunta: "Preencher um horário vago de cancelamento com lista de espera ou aviso rápido pra outros clientes:",
          opcoes: [
            "É uma boa forma de não perder o horário parado",
            "Não vale o esforço",
            "Só funciona em salão grande",
          ],
          correta: 0,
          feedbackSucesso: "Na régua! Preencher o horário vago rapidamente evita que o cancelamento vire prejuízo total.",
          feedbackErro: "Cuidado: vale o esforço em qualquer tamanho de negócio — é uma forma simples de reduzir a perda.",
        },
      ],
    },
    {
      slug: "lidando-atrasos",
      titulo: "Lidando com atraso com profissionalismo",
      descricao: "O que fazer quando você ou o cliente atrasa, sem estragar o dia.",
      icone: "ph-fill ph-clock-countdown",
      perguntas: [
        {
          pergunta: "Se você percebe que vai se atrasar para um atendimento, o melhor é:",
          opcoes: [
            "Avisar o cliente assim que perceber, com sinceridade",
            "Não falar nada e torcer pra dar certo",
            "Só avisar se o cliente perguntar primeiro",
          ],
          correta: 0,
          feedbackSucesso: "Isso aí! Avisar cedo, com sinceridade, é o que mantém a confiança mesmo quando o imprevisto acontece.",
          feedbackErro: "Repensa: ficar calada ou esperar o cliente perguntar só piora a sensação de descaso.",
        },
        {
          pergunta: "Quando um cliente chega atrasado, uma postura profissional é:",
          opcoes: [
            "Explicar com calma como isso afeta o restante da agenda do dia",
            "Fingir que não tem problema nenhum, mesmo afetando os próximos clientes",
            "Descontar a irritação na hora",
          ],
          correta: 0,
          feedbackSucesso: "Exato! Explicar com calma o impacto na agenda é mais profissional do que ficar irritada ou fingir que está tudo bem.",
          feedbackErro: "Cuidado: descontar irritação ou fingir que não afeta nada não resolve — clareza calma é o melhor caminho.",
        },
        {
          pergunta: "Ter uma margem de tolerância combinada para atraso (por exemplo, 10 a 15 minutos) ajuda a:",
          opcoes: [
            "Deixar claro pros dois lados o que é razoável, sem crise a cada minuto",
            "Não serve pra nada na prática",
            "Só é útil se você atender em clínica",
          ],
          correta: 0,
          feedbackSucesso: "Isso mesmo! Uma margem combinada evita drama a cada minuto de atraso e deixa a relação mais tranquila.",
          feedbackErro: "Repensa: essa prática funciona em qualquer tipo de atendimento, não só em clínica.",
        },
        {
          pergunta: "Depois de um dia com atraso e imprevisto, revisar o que aconteceu pra ajustar a agenda futura:",
          opcoes: [
            "É uma forma de aprender e evitar repetir o mesmo problema",
            "Não adianta nada, imprevisto sempre vai acontecer",
            "Só faz sentido se o imprevisto foi grave",
          ],
          correta: 0,
          feedbackSucesso: "Na régua! Revisar o que aconteceu, mesmo em imprevisto pequeno, é o que te ajuda a ajustar e evitar repetição.",
          feedbackErro: "Cuidado: mesmo imprevisto pequeno vale revisar — é assim que sua agenda vai ficando cada vez mais afiada.",
        },
      ],
    },
  ],
};

/** Todas as trilhas disponíveis — a ordem aqui é a ordem de exibição na listagem */
export const TRILHAS: Trilha[] = [TRILHA_AUTOESTIMA, TRILHA_PRECO_JUSTO, TRILHA_MAOS_SEGURAS, TRILHA_CLIENTE_FIEL, TRILHA_AGENDA_CHEIA];

export function getTrilha(slug: string): Trilha | undefined {
  return TRILHAS.find((t) => t.slug === slug);
}

export interface ProgressoTrilha {
  slug: string;
  titulo: string;
  icone: string;
  feitos: number;
  total: number;
  concluida: boolean;
}

export interface ProgressoGeral {
  porTrilha: ProgressoTrilha[];
  modulosFeitosTotal: number;
  trilhasConcluidas: number;
  trilhasTotal: number;
}

/** Junta o progresso bruto do banco (quiz_progresso, sem filtro de trilha) com
    o catálogo de trilhas — fonte única usada pela listagem de trilhas, pelas
    conquistas e pelos cards de destaque na home/Crescer. */
export function calcularProgressoGeral(progresso: { trilha_slug: string; modulo_slug: string }[]): ProgressoGeral {
  const feitosPorTrilha = new Map<string, Set<string>>();
  for (const p of progresso) {
    if (!feitosPorTrilha.has(p.trilha_slug)) feitosPorTrilha.set(p.trilha_slug, new Set());
    feitosPorTrilha.get(p.trilha_slug)!.add(p.modulo_slug);
  }

  const porTrilha: ProgressoTrilha[] = TRILHAS.map((t) => {
    const feitos = feitosPorTrilha.get(t.slug)?.size ?? 0;
    const total = t.modulos.length;
    return { slug: t.slug, titulo: t.titulo, icone: t.icone, feitos, total, concluida: feitos >= total };
  });

  return {
    porTrilha,
    modulosFeitosTotal: porTrilha.reduce((acc, t) => acc + t.feitos, 0),
    trilhasConcluidas: porTrilha.filter((t) => t.concluida).length,
    trilhasTotal: TRILHAS.length,
  };
}
