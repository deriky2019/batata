/* =====================================================
   missoes.js - Missões e objetivos
   A missão ativa aparece no inventário (botão 🎒).
   Para criar outra missão: adicione um item em MISSOES (a ordem é a da história),
   crie a chave (true/false) em "historia" (js/dialogos.js) e marque-a como true
   no lugar certo (ex.: em aoEntrarNaCena ou numa conversa).
   O progresso é salvo junto com "historia" (js/salvamento.js).
   ===================================================== */

/* Campos de cada missão (os opcionais só existem nas missões novas):
     id, titulo, descricao
     chave      -> flag de historia (texto) OU função que devolve true quando concluída
     aviso      -> flag de historia: já avisou "Nova missão"?
     requer     -> (opcional) ids de missões que precisam estar concluídas antes
     objetivos  -> (opcional) [{ texto, ok: () => true/false }], aparecem no diário
     auto       -> (opcional) true = o jogo detecta a conclusão sozinho (verificarMissoes)
     npcs, itens, recompensa -> (opcional) anotações sobre quem/o que participa
   O progresso vem só de "historia" e "diario", que já são salvos: carregar o jogo no meio
   de uma missão continua do mesmo ponto. */
const MISSOES = [
  {
    id: "escola",
    titulo: "Ir para a escola",
    descricao: "Siga pela avenida até a escola, no lado direito da cidade, e entre pela porta.",
    chave: "chegouNaEscola",         // quando historia.chegouNaEscola vira true, a missão está concluída
    aviso: "avisouMissaoEscola"      // já avisou "Nova missão"?
  },
  {
    id: "millena",
    titulo: "Falar com a Millena",
    descricao: "A Millena está na sala 2A, a segunda porta do corredor da escola. Chegue perto dela e aperte B.",
    chave: "conheceuMillena",
    aviso: "avisouMissaoMillena"
  },
  {
    id: "casa",
    titulo: "Ir para casa",
    descricao: "A aula acabou. Saia da escola e volte para a casa laranja, na esquerda da cidade.",
    chave: "chegouEmCasa",
    aviso: "avisouMissaoCasa"
  },
  {
    id: "morador",
    titulo: "Falar com o Morador",
    descricao: "O Morador, que passeia pela calçada entre as casas, tem algo para você. Chegue perto e aperte B.",
    chave: "recebeuChaveQuarto",
    aviso: "avisouMissaoMorador"
  },
  {
    id: "quarto",
    titulo: "Entrar no quarto do pai",
    descricao: "Use a chave na porta do quarto do papai, dentro da sua casa, e entre.",
    chave: "entrouQuartoPai",
    aviso: "avisouMissaoQuarto"
  },

  // ---------- Missões novas (conteúdo PROVISÓRIO: ajuste com a história original) ----------
  {
    id: "ficou",
    titulo: "O que ficou para trás",
    descricao: "O quarto do papai guarda o que ele deixou. Pegue a carta, leia e procure entre os livros.",
    requer: ["quarto"],
    auto: true,
    npcs: [],
    itens: ["carta_pai", "caderno_pessoal"],
    recompensa: "Caderno pessoal e a carta no diário.",
    objetivos: [
      { texto: "Pegar a carta na escrivaninha",                ok: () => historia.pegouCartaPai },
      { texto: "Ler a carta (🎒, toque nela e em Examinar)",   ok: () => historia.leuCartaPai },
      { texto: "Procurar algo na estante do quarto",           ok: () => historia.achouCaderno }
    ],
    chave: () => historia.pegouCartaPai && historia.leuCartaPai && historia.achouCaderno,
    aviso: "avisouMissaoFicou"
  },
  {
    id: "novodia",
    titulo: "Um novo dia",
    descricao: "Já foi um dia cheio. Descanse no sofá da sala e volte para a escola no dia seguinte.",
    requer: ["ficou"],
    auto: true,
    npcs: [],
    itens: [],
    objetivos: [
      { texto: "Descansar no sofá da sala",   ok: () => historia.novoDia },
      { texto: "Ir para a escola",            ok: () => historia.chegouEscolaDia2 }
    ],
    chave: () => historia.novoDia && historia.chegouEscolaDia2,
    aviso: "avisouMissaoDia"
  },
  {
    id: "lucas",
    titulo: "Novos encontros",
    descricao: "Tem gente que você ainda não conhece na escola: a Veras, na entrada, e o Lucas, o Simon e o Vitinho, na sala 3A (suba a escada). Aproxime-se e converse.",
    requer: ["novodia"],
    auto: true,
    npcs: ["Lucas", "Simon", "Vitinho"],
    itens: [],
    recompensa: "Novas informações no diário.",
    objetivos: [
      { texto: "Conversar com o Lucas, na sala 3A (2º andar)", ok: () => historia.conheceuLucas }
    ],
    chave: () => historia.conheceuLucas,
    aviso: "avisouMissaoLucas"
  },
  {
    id: "nathalia",
    titulo: "Uma cara curiosa",
    descricao: "Uma colega da sala 2C parece querer falar com você.",
    requer: ["lucas"],
    auto: true,
    npcs: ["Nathalia"],
    itens: [],
    recompensa: "Nova informação no diário.",
    objetivos: [
      { texto: "Conversar com a Nathalia, na sala 2C", ok: () => historia.conheceuNathalia }
    ],
    chave: () => historia.conheceuNathalia,
    aviso: "avisouMissaoNathalia"
  },

  // ---------- DIA_SEITA: história do Simon e do Deriky (js/simon.js) ----------
  {
    id: "simon",
    secundaria: true,
    titulo: "O amigo que faltou",
    descricao: "O Simon não veio à escola. Descubra onde ele está e ajude-o a encontrar o amigo que procura.",
    requer: ["lucas"],
    inicia: () => diaAtual() >= DIA_SEITA && escolaHoje(),     // começa quando ela chega na escola no DIA_SEITA (js/dias.js)
    auto: true,
    npcs: ["Simon", "Lucas", "Vitinho", "Deriky"],
    itens: [],
    recompensa: "Novas informações no diário.",
    objetivos: [
      { texto: "Perguntar pelo Simon ao Lucas ou ao Vitinho", ok: () => historia.soubeSimonFaltou },
      { texto: "Achar o Simon no Bairro Sul",               ok: () => historia.achouSimon },
      { texto: "Levar o Simon até o Deriky",                ok: () => historia.revelouSeita }
    ],
    chave: () => historia.revelouSeita,
    moedas: 30,
    aviso: "avisouMissaoSimon"
  },

  // ---------- DIA_1A: a sala 1A (js/chave1a.js). Termina com o acordo entre Dellalos, Millena e Nathalia ----------
  {
    id: "chave1a",
    secundaria: true,
    titulo: "A sala 1A",
    descricao: "Os alunos dizem que há coisas estranhas na sala 1A. A chave só fica com a diretora, que mora no Bairro Sul.",
    inicia: () => historia.contouSeita,               // começa quando a Dellalos conta da seita à Millena ou à Nathalia
    auto: true,
    npcs: ["Millena", "Nathalia", "Mariane"],
    itens: ["chave_1a"],
    objetivos: [
      { texto: "Contar da seita e do torneio",                     ok: () => historia.contouSeita },
      { texto: "Achar a casa da diretora e pegar a chave (Bairro Sul)", ok: () => historia.pegouChave1A },
      { texto: "Abrir a sala 1A",                                   ok: () => historia.abriu1A },
      { texto: "Enfrentar o que surgiu na 1A",                      ok: () => historia.matouSombra },
      { texto: "Contar tudo à outra amiga, na sala de aula dela",  ok: () => historia.fimChave1A }
    ],
    chave: () => historia.fimChave1A,
    recompensa: "Um acordo entre as três.",
    moedas: 50,
    aviso: "avisouMissaoChave1A"
  },

  // ---------- DIA_THAINA: a Thaina no norte (js/thaina.js). passos 1 a 6 prontos ----------
  {
    id: "thaina",
    secundaria: true,
    titulo: "O que a Thaina escondia",
    descricao: "A Thaina sussurrou um recado na 3C: ela quer falar com você, sozinha, na Zona Norte. Ouça-a, descubra onde o Lucas está e vá atrás dele.",
    requer: ["lucas"],
    inicia: () => historia.thainaConvidou,           // começa quando ela sussurra o convite (js/thaina.js)
    auto: true,
    npcs: ["Thaina", "Vitinho", "Simon", "Deriky", "Lucas"],
    itens: [],
    recompensa: "Novas informações no diário.",
    objetivos: [
      { texto: "Ir à clareira da fonte, na Zona Norte, e ouvir a Thaina",   ok: () => historia.thainaPediu },
      { texto: "Perguntar pelo Lucas ao Vitinho e ao Simon, na escola",      ok: () => historia.lucasVitinhoFalou && historia.lucasSimonFalou },
      { texto: "Falar com o Deriky, no Bairro Sul",                          ok: () => historia.derikyLucasFalou },
      { texto: "Chegar perto da capela, na Zona Norte (opcional: a Isabela sumiu da escola)", ok: () => historia.altarFim },
      { texto: "Achar o Lucas, na Zona Oeste (jardim da mansão abandonada)",  ok: () => historia.thainaFim }
    ],
    chave: () => historia.thainaFim,                 // conclui quando a Dellalos encontra o Caos no oeste (js/thaina.js)
    moedas: 40,
    aviso: "avisouMissaoThaina"
  },

  // ---------- Missões SECUNDÁRIAS da estrada (só começam depois da Millena) ----------
  // secundaria: true -> aparece junto da missão principal, sem atrapalhar a ordem da história
  // inicia: () => bool -> só vira missão ativa quando o jogador aceita (flag marcada na conversa)
  {
    id: "pescador",
    secundaria: true,
    titulo: "Encomenda do pescador",
    descricao: "O pescador, no lago do parque (sudeste da estrada), pediu para você levar um pacote até a porta da casa do meio.",
    requer: ["millena"],
    inicia: () => historia.aceitouEncomenda,
    auto: true,
    npcs: ["Pescador"],
    itens: ["encomenda_pescador"],
    objetivos: [
      { texto: "Pegar a encomenda com o pescador",       ok: () => historia.aceitouEncomenda },
      { texto: "Deixar na porta da casa do meio",        ok: () => historia.entregouEncomenda }
    ],
    chave: () => historia.entregouEncomenda,
    moedas: 15,
    aviso: "avisouMissaoPescador"
  },
  {
    id: "pesca",
    secundaria: true,
    titulo: "O primeiro peixe",
    descricao: "Depois de concluir a entrega, volte ao Pescador no lago. Aprenda a pescar, pegue um peixe e coma-o pelo inventário quando estiver ferida.",
    requer: ["pescador"],
    inicia: () => historia.pescaTutorialIniciado,
    auto: true,
    npcs: ["Pescador"],
    itens: ["peixe"],
    objetivos: [
      { texto: "Aprender com o Pescador", ok: () => historia.pescaTutorialIniciado },
      { texto: "Pegar o primeiro peixe", ok: () => historia.pescouPrimeiroPeixe },
      { texto: "Comer o peixe pelo inventário", ok: () => historia.comeuPrimeiroPeixe }
    ],
    chave: () => historia.pescouPrimeiroPeixe && historia.comeuPrimeiroPeixe,
    aviso: "avisouMissaoPesca"
  },
  {
    id: "gato",
    secundaria: true,
    titulo: "O gatinho perdido",
    descricao: "A Clarice, no canto sudoeste da estrada, perdeu o gatinho Bolinha. Ele anda pela estrada inteira: ache-o, pegue no colo (B) e leve para ela.",
    requer: ["millena"],
    inicia: () => historia.aceitouGato,
    auto: true,
    npcs: ["Clarice", "Bolinha"],
    itens: ["gatinho"],
    objetivos: [
      { texto: "Achar e pegar o Bolinha",   ok: () => historia.pegouGato },
      { texto: "Levar para a Clarice",      ok: () => historia.entregouGato }
    ],
    chave: () => historia.entregouGato,
    moedas: 20,
    aviso: "avisouMissaoGato"
  },
  {
    id: "caca",
    secundaria: true,
    titulo: "Calçada sem slimes",
    descricao: "A Dona Rosa, na calçada da avenida, quer que você derrote 5 slimes (botão A) e depois volte a falar com ela.",
    requer: ["millena"],
    inicia: () => historia.aceitouCaca,
    auto: true,
    npcs: ["Dona Rosa"],
    itens: [],
    objetivos: [
      { get texto() { return "Derrotar 5 slimes (" + Math.min(slimesDerrotados(), SLIMES_CACA) + "/" + SLIMES_CACA + ")"; },
        ok: () => slimesDerrotados() >= SLIMES_CACA },
      { texto: "Voltar a falar com a Dona Rosa",  ok: () => historia.entregouCaca }
    ],
    chave: () => historia.entregouCaca,
    moedas: 25,
    aviso: "avisouMissaoCaca"
  },

  // ---------- Missões SECUNDÁRIAS da Zona Leste (a avenida só abre depois de conhecer a Millena) ----------
  // Zona perigosa a leste da cidade: ferro-velho, pátio de contêineres e a fábrica abandonada (js/salas/zonaleste.js e fabrica.js)
  {
    id: "engrenagens",
    secundaria: true,
    titulo: "Engrenagens do portão",
    descricao: "O Orlando, vigia da fábrica (Zona Leste), perdeu 3 engrenagens do portão. Ache todas e abra a porta da fábrica (botão B).",
    requer: ["millena"],
    inicia: () => historia.aceitouEngrenagens,
    auto: true,
    npcs: ["Orlando", "Nando"],
    itens: [],
    objetivos: [
      { get texto() { return "Achar as engrenagens (" + engrenagensAchadas() + "/" + ENGRENAGENS_TOTAL + ")"; },
        ok: () => engrenagensAchadas() >= ENGRENAGENS_TOTAL },
      { texto: "Abrir o portão da fábrica",   ok: () => historia.portaoFabricaAberto }
    ],
    chave: () => historia.portaoFabricaAberto,
    moedas: 20,
    aviso: "avisouMissaoEngrenagens"
  },
  {
    id: "limpeza",
    secundaria: true,
    titulo: "Terreno limpo",
    descricao: "O Nando cata sucata no ferro-velho, mas ratos e robôs não deixam. Derrote 8 inimigos na Zona Leste (botão A) e volte a falar com ele.",
    requer: ["millena"],
    inicia: () => historia.aceitouLimpeza,
    auto: true,
    npcs: ["Nando"],
    itens: [],
    objetivos: [
      { get texto() { return "Derrotar inimigos da Zona Leste (" + Math.min(limpezaFeita(), LIMPEZA_ALVO) + "/" + LIMPEZA_ALVO + ")"; },
        ok: () => limpezaFeita() >= LIMPEZA_ALVO },
      { texto: "Voltar a falar com o Nando",  ok: () => historia.entregouLimpeza }
    ],
    chave: () => historia.entregouLimpeza,
    moedas: 25,
    aviso: "avisouMissaoLimpeza"
  },
  {
    id: "fabrica",
    secundaria: true,
    titulo: "O coração da fábrica",
    descricao: "O portão abriu. Lá dentro: ache o cartão de acesso no depósito, abra a sala do fundo e derrote quem faz as máquinas funcionarem de noite.",
    requer: ["engrenagens"],
    inicia: () => historia.portaoFabricaAberto,
    auto: true,
    npcs: ["Orlando", "Capataz Mecânico"],
    itens: ["cartao_fabrica", "ordem_fabrica"],
    recompensa: "Uma ordem de serviço misteriosa pode estar na sala de controle.",
    objetivos: [
      { texto: "Entrar na fábrica",                         ok: () => historia.entrouFabrica },
      { texto: "Achar o cartão de acesso (depósito)",       ok: () => historia.pegouCartao },
      { texto: "Abrir a sala do fundo",                     ok: () => historia.abriuSalaChefe },
      { texto: "Derrotar o Capataz Mecânico",               ok: () => historia.derrotouCapataz }
    ],
    chave: () => historia.derrotouCapataz,
    moedas: 60,
    aviso: "avisouMissaoFabrica"
  },
  // DIA 13. Começa quando ela lê a ordem de produção na fábrica (historia.pegouOrdemFabrica) e junta a corrente de pistas:
  // ordem -> gaveta com a chave -> lanterna -> mansão (js/salas/mansao.js) -> bilhete do zelador, que fala do alçapão.
  // O Seu Augusto (Bairro Sul) dá pistas extras, mas não é obrigatório. O porão fica para a missão seguinte (dia 14).
  {
    id: "mansao",
    secundaria: true,
    titulo: "A Casa dos Cinco",
    descricao: "A ordem da fábrica não tem cliente registrado e há uma gaveta na mesa. A mansão abandonada da Zona Oeste deve guardar a resposta. O Seu Augusto, no Bairro Sul, pode ter alguma pista.",
    inicia: () => historia.pegouOrdemFabrica,
    auto: true,
    npcs: ["Seu Augusto"],
    itens: ["ordem_fabrica", "chave_mansao"],
    recompensa: "O bilhete do zelador fala de um alçapão no porão. Melhor descer com a cabeça descansada.",
    objetivos: [
      { texto: "Ler a ordem de produção, na sala de controle da fábrica", ok: () => historia.pegouOrdemFabrica },
      { texto: "Achar a chave da mansão na gaveta da mesa",               ok: () => historia.pegouChaveMansao || historia.mansaoAberta },
      { get texto() { return diaAtual() < DIA_LANTERNA ? "Comprar a lanterna na loja (a partir do dia " + DIA_LANTERNA + ")" : "Comprar a lanterna na loja"; },
        ok: () => historia.comprouLanterna },
      { texto: "Abrir a porta da mansão, na Zona Oeste",                   ok: () => historia.mansaoAberta },
      { texto: "Ler o bilhete do zelador, na biblioteca",                  ok: () => !!diario.docs.mansao_bilhete }
    ],
    chave: () => !!diario.docs.mansao_bilhete,
    moedas: 40,
    aviso: "avisouMissaoMansao"
  },
  // DIA 14 (DIA_DA_MISSAO.tunel, js/calendario.js): o alçapão só abre neste dia. Continua a Casa dos Cinco.
  // A porta do selo, no fim do túnel, ainda não abre (próxima etapa).
  {
    id: "tunel",
    secundaria: true,
    titulo: "O túnel do selo",
    descricao: "O alçapão da biblioteca leva ao porão da mansão, e de lá sai um túnel até a porta do selo. A senha da porta de aço deve estar escondida em alguma carta do zelador. A porta do selo só abre com a Nathalia como companheira.",
    requer: ["mansao"],
    inicia: () => diaAtual() >= DIA_DA_MISSAO.tunel,
    auto: true,
    npcs: [],
    itens: [],
    recompensa: "A porta do selo se abriu, a verdade sobre a seita e o Lucas veio à tona... e o selo se quebrou. Agora há demônios pelas estradas.",
    objetivos: [
      { texto: "Abrir o alçapão embaixo do tapete, na biblioteca",         ok: () => historia.mansaoPoraoAberto },
      { texto: "Descobrir a senha da porta de aço do túnel, no porão",    ok: () => historia.mansaoTunelAberto },
      { texto: "Ler todos os papéis da mansão",                            ok: () => historia.mansaoCompleta },
      { texto: "Abrir a porta do selo com a Nathalia como companheira",   ok: () => historia.seloAberto },
      { texto: "Ler os papéis da sala do selo",                            ok: () => historia.seloQuebrado }
    ],
    chave: () => historia.mansaoTunelAberto && historia.mansaoCompleta && historia.seloAberto && historia.seloQuebrado,
    moedas: 60,
    aviso: "avisouMissaoTunel"
  },
  // Do DIA_SEITA em diante (depois de saber da seita) e só com amizade "Amigos" (nível 3) com o Lucas:
  // ele treina sozinho na Zona Leste. Ver js/salas/zonaleste.js
  {
    id: "lucas_zona",
    secundaria: true,
    titulo: "Treino no leste",
    descricao: "O Lucas está treinando sozinho na Zona Leste. Vá até lá e converse com ele.",
    requer: ["millena"],
    inicia: () => lucasZonaDisponivel(),
    auto: true,
    npcs: ["Lucas"],
    itens: [],
    recompensa: "O Lucas deu 50 moedas e um aviso importante.",
    objetivos: [
      { texto: "Falar com o Lucas, na Zona Leste",   ok: () => historia.lucasZonaVisto },
      { texto: "Participar do treino",               ok: () => historia.lucasDuelo },
      { texto: "Contar a ele o que está acontecendo", ok: () => historia.lucasContado }
    ],
    chave: () => historia.lucasZonaFim,
    aviso: "avisouMissaoLucasZona"
  },
  {
    id: "fazenda_sul2",
    titulo: "A Fazenda Precisa de Você",
    descricao: "Ajude Dona Rosa a preparar um canteiro, plantar sementes, buscar água no poço, regar e colher vegetais.",
    secundaria: true,
    inicia: () => historia.fazendaSulMissaoIniciada,
    chave: "fazendaSulMissaoConcluida",
    npcs: ["Dona Rosa"],
    itens: ["vegetais_frescos"],
    recompensa: "Vegetais frescos para a comunidade.",
    objetivos: [
      { texto: "Preparar o canteiro", ok: () => historia.fazendaSulCanteiroPreparado },
      { texto: "Plantar as sementes", ok: () => historia.fazendaSulSementesPlantadas },
      { texto: "Buscar água no poço", ok: () => historia.fazendaSulPegouAgua },
      { texto: "Regar a plantação", ok: () => historia.fazendaSulPlantacaoRegada },
      { texto: "Colher e falar com Dona Rosa", ok: () => historia.fazendaSulMissaoConcluida }
    ]
  },
  {
    id: "norte2",
    secundaria: true,
    titulo: "Quem morava aqui?",
    descricao: "A Zona Norte 2 está vazia e em ruínas. Examine as casas destruídas e descubra o que aconteceu com quem morava lá.",
    inicia: () => historia.norte2Iniciada,
    auto: true,
    npcs: [],
    itens: [],
    recompensa: "A Dellalos entendeu que o bairro foi esvaziado de propósito.",
    moedas: 25,
    objetivos: [
      { texto: "Examinar as 5 pistas nas casas em ruína", ok: () => [1,2,3,4,5].every((n) => historia["norte2Pista" + n]) },
      { texto: "Entender o que aconteceu com o bairro",   ok: () => historia.norte2Concluida }
    ],
    chave: () => historia.norte2Concluida,
    aviso: "avisouMissaoNorte2"
  },
  {
    id: "norte2_morador",
    secundaria: true,
    titulo: "O último morador",
    descricao: "Alguém ainda se esconde numa casa da Zona Norte 2. Ele não confia em estranhos: talvez fale com alguém que converse bem.",
    requer: ["norte2"],
    inicia: () => historia.norte2MoradorVisto,
    auto: true,
    npcs: ["Seu Otávio", "Millena"],
    itens: [],
    recompensa: "O Seu Otávio contou o que sabe sobre o Durval.",
    moedas: 30,
    objetivos: [
      { texto: "Achar o morador escondido na Zona Norte 2", ok: () => historia.norte2MoradorVisto },
      { texto: "Voltar com a Millena como companheira e ouvi-lo", ok: () => historia.norte2MoradorFim }
    ],
    chave: () => historia.norte2MoradorFim
  },
  {
    id: "norte2_marcas",
    secundaria: true,
    titulo: "Marcas no chão",
    descricao: "À noite, a Nathalia enxerga símbolos que a Dellalos não vê. Siga as marcas pela Zona Norte 2 até descobrir o que elas escondem.",
    requer: ["norte2"],
    inicia: () => historia.norte2MarcasIniciada,
    auto: true,
    npcs: ["Nathalia"],
    itens: [],
    recompensa: "O altar da seita foi destruído e a Dellalos ganhou uma essência.",
    moedas: 40,
    objetivos: [
      { texto: "Achar as 3 marcas na rua da Zona Norte 2, de noite, com a Nathalia", ok: () => ["n_norte2_1","n_norte2_2","n_norte2_3"].every((id) => segredoAchado(id)) },
      { texto: "Achar o altar nas ruínas do sudeste, de noite",                      ok: () => historia.norte2AltarVisto },
      { texto: "Derrotar o guardião do altar",                                       ok: () => historia.norte2AltarFim }
    ],
    chave: () => historia.norte2AltarFim
  },
  {
    id: "leste2_trem",
    secundaria: true,
    titulo: "O trem que não chegou",
    descricao: "O Beto desconfia da estação abandonada do Leste 2. Procure pistas na bilheteria, no painel de horários e no cofre da plataforma.",
    inicia: () => historia.leste2TremIniciada,
    auto: true,
    npcs: ["Beto"],
    itens: [],
    recompensa: "A Dellalos descobriu que o trem do dia 15 traz convidados de fora.",
    moedas: 25,
    objetivos: [
      { texto: "Examinar a bilheteria, o painel de horários e o cofre da estação", ok: () => [1,2,3].every((n) => historia["leste2Pista" + n]) },
      { texto: "Entender o que o trem esconde",                                    ok: () => historia.leste2TremFim }
    ],
    chave: () => historia.leste2TremFim
  },
  {
    id: "leste2_passageiros",
    secundaria: true,
    titulo: "Passageiros",
    descricao: "O Zeca, escondido no galpão laranja do Leste 2, quer saber o que aconteceu com os passageiros que desciam do trem. Ache 3 crachás e leve a ele.",
    requer: ["leste2_trem"],
    inicia: () => historia.leste2PassageirosIniciada,
    auto: true,
    npcs: ["Zeca"],
    itens: [],
    recompensa: "O Zeca contou para onde levavam os passageiros.",
    moedas: 35,
    objetivos: [
      { texto: "Falar com o Zeca, no galpão laranja do Leste 2", ok: () => historia.leste2PassageirosIniciada },
      { texto: "Achar os 3 crachás (depósito, avenida e plataforma)", ok: () => [1,2,3].every((n) => historia["leste2Cracha" + n]) },
      { texto: "Entregar os crachás ao Zeca",                      ok: () => historia.leste2PassageirosFim }
    ],
    chave: () => historia.leste2PassageirosFim
  },
  {
    id: "sul_passageiros",
    secundaria: true,
    titulo: "A casa vazia",
    descricao: "O Zeca disse que os jovens eram levados em fila para o Bairro Sul. O Seu Augusto anota os horários do bairro: talvez ele tenha visto algo.",
    requer: ["leste2_passageiros"],
    inicia: () => historia.sulPassIniciada,
    auto: true,
    npcs: ["Seu Augusto"],
    itens: [],
    recompensa: "A Dellalos descobriu onde os passageiros eram mantidos.",
    moedas: 40,
    objetivos: [
      { texto: "Falar com o Seu Augusto, no Bairro Sul",                    ok: () => historia.sulPassIniciada },
      { texto: "Achar o alçapão na casa vazia (só aparece de noite)",       ok: () => historia.sulPassAlcapao },
      { texto: "Examinar o livro, as camas e o baú do porão",               ok: () => [1,2,3].every((n) => historia["sulPorao" + n]) },
      { texto: "Entender para onde os passageiros eram levados",            ok: () => historia.sulPassFim }
    ],
    chave: () => historia.sulPassFim
  }
];

// O Lucas treina na Zona Leste: depois da revelação da seita (DIA_SEITA). Precisa terminar antes de a Thaina chamar a Dellalos (DIA_THAINA)
function lucasZonaDisponivel() {
  return diaAtual() >= DIA_SEITA && !!historia.revelouSeita && !historia.thainaPediu;   // obrigatório antes da missão da Thaina (js/thaina.js); não exige mais amizade
}

// ----- Apoio das missões secundárias -----
const SLIMES_CACA = 5;
// Quantos slimes foram derrotados DEPOIS de aceitar a missão da Dona Rosa (salvo em diario.escolhas)
function slimesDerrotados() { return Number(diario.escolhas.slimesCaca) || 0; }

// Zona Leste: engrenagens do portão da fábrica (cada uma tem a sua flag) e a limpeza do Nando (contador salvo)
const ENGRENAGENS_TOTAL = 3;
const LIMPEZA_ALVO = 8;
function engrenagensAchadas() {
  return (historia.achouEngrenagem1 ? 1 : 0) + (historia.achouEngrenagem2 ? 1 : 0) + (historia.achouEngrenagem3 ? 1 : 0);
}
function limpezaFeita() { return Number(diario.escolhas.limpezaLeste) || 0; }

// Chamado por inimigos.js toda vez que um inimigo é derrotado (i = o inimigo; pode faltar em chamadas antigas)
function aoDerrotarInimigo(i) {
  const tipo = i ? i.tipoId : "slime";
  amizadeAoDerrotarInimigo();                        // missões pessoais dos amigos (js/amizade.js)
  const faixa = (i && i.tipo.moedas) || [1, 3];      // cada tipo solta uma faixa de moedas (slime: 1 a 3)
  ganharMoedas(moedasDoInimigo(faixa[0] + Math.floor(Math.random() * (faixa[1] - faixa[0] + 1))));   // anel da sorte: js/loja.js   // (js/loja.js)
  marcarPasseioHoje();                               // lutar na rua depois da escola conta como passeio (js/dias.js)
  if (typeof sangueCuraAoDerrotar === "function") sangueCuraAoDerrotar();   // árvore: Sangue que cura (js/loja.js)
  if (tipo === "slime" && historia.aceitouCaca && !historia.entregouCaca && slimesDerrotados() < SLIMES_CACA) {
    diario.escolhas.slimesCaca = slimesDerrotados() + 1;
    if (slimesDerrotados() >= SLIMES_CACA) mostrarMensagem("Cinco slimes derrotados! Volte a falar com a Dona Rosa.");
  }

  // ----- Zona Leste -----
  const lugar = idDaCena(cenaAtual);
  const naZonaLeste = lugar === "zona_leste" || lugar === "fabrica";
  if (naZonaLeste && historia.aceitouLimpeza && !historia.entregouLimpeza && limpezaFeita() < LIMPEZA_ALVO) {
    diario.escolhas.limpezaLeste = limpezaFeita() + 1;
    if (limpezaFeita() >= LIMPEZA_ALVO) mostrarMensagem("Terreno limpo! Volte a falar com o Nando.");
  }
  if (i && i.solta === "engrenagem2" && !historia.achouEngrenagem2) {      // o Sucateiro guardava uma engrenagem
    historia.achouEngrenagem2 = true;
    mostrarMensagem("O Sucateiro deixou cair uma engrenagem! (" + engrenagensAchadas() + "/" + ENGRENAGENS_TOTAL + ")");
  }
  if (tipo === "capataz" && !historia.derrotouCapataz) {                   // fim da luta com o chefe
    historia.derrotouCapataz = true;
    abrirDialogo(DIALOGOS.capataz.derrota);
  }
}
// Mostra "Nova missão" de uma secundária assim que a conversa que a aceitou termina
function avisarNovaSecundaria(id) {
  const m = MISSOES.find((x) => x.id === id);
  if (!m || !m.inicia || !m.inicia() || historia[m.aviso]) return;
  historia[m.aviso] = true;
  mostrarMensagem("Nova missão: " + m.titulo + ".");
  sinalizarMissao();
}
// Porta da casa do meio: entrega a encomenda do pescador (senão continua "ainda não disponível")
function usarPortaCasaDoMeio() {
  if (historia.aceitouEncomenda && !historia.entregouEncomenda && temItem("encomenda_pescador")) {
    tirarItem("encomenda_pescador");
    historia.entregouEncomenda = true;
    mostrarMensagem("Você deixou a encomenda na porta da casa do meio.");
    return;
  }
  mostrarMensagem("Ainda não disponível.");
}

// Porta da fábrica (Zona Leste): só abre depois de o Orlando pedir as engrenagens e de as 3 estarem encaixadas
function usarPortaFabrica() {
  if (historia.portaoFabricaAberto) return;
  if (!historia.aceitouEngrenagens) { mostrarMensagem("Portão trancado: o mecanismo está sem engrenagens. Talvez o vigia saiba de algo."); return; }
  const n = engrenagensAchadas();
  if (n < ENGRENAGENS_TOTAL) { mostrarMensagem("O mecanismo precisa de " + ENGRENAGENS_TOTAL + " engrenagens. Você achou " + n + "."); return; }
  historia.portaoFabricaAberto = true;
  if (typeof atualizarPortaoFabrica === "function") atualizarPortaoFabrica();   // destranca no mapa (js/salas/zonaleste.js)
  historia[(MISSOES.find((x) => x.id === "fabrica") || {}).aviso || "avisouMissaoFabrica"] = true;
  mostrarMensagem("As 3 engrenagens encaixaram e o portão se abriu! Nova missão: O coração da fábrica.");
  sinalizarMissao();
}

// Concluída: a "chave" é uma flag de historia (missões antigas) ou uma função (missões novas)
const missaoConcluida = (m) => typeof m.chave === "function" ? !!m.chave() : historia[m.chave] === true;

// Liberada: todas as missões em "requer" já foram concluídas (sem "requer" = sempre liberada)
function missaoLiberada(m) {
  if (m.inicia && !m.inicia()) return false;      // secundária ainda não aceita
  return (m.requer || []).every((id) => {
    const outra = MISSOES.find((x) => x.id === id);
    return !outra || missaoConcluida(outra);
  });
}

// A primeira missão liberada que ainda não foi concluída (ou null)
function missaoAtiva() {
  return MISSOES.find((m) => !m.secundaria && missaoLiberada(m) && !missaoConcluida(m)) || null;
}

// Chamado a cada quadro (js/main.js): detecta sozinho a conclusão das missões "auto"
// e dispara pequenos eventos de história. Espera mensagens e conversas terminarem.
function verificarMissoes() {
  if (transicao || dialogoAberto || telaTempo || mensagemVisivel()) return;

  if (verificarEventosChave1A()) return;   // DIA_1A: a cena da Mariane na sala 1A (js/chave1a.js)
  if (verificarEventoAltar()) return;      // DIA_THAINA: a Isabela perto da capela (js/thaina.js)
  if (verificarEventosNoite3B()) return;   // noite do dia 4: o final na 3B (js/dias.js)
  if (verificarCartaDia8()) return;        // dia 8: o Morador entrega a segunda carta do papai (js/dias.js)
  if (verificarDia10Escola()) return;
  if (verificarDia10Sul()) return;         // dia 10: Mariane e Durval no Bairro Sul (js/dia10.js)      // dia 10: chega à escola com a Nathalia e a Millena (js/dia10.js)

  // Retorno para casa: pensamentos da Dellalos (uma vez só; saves antigos já adiantados pulam)
  if (!historia.monologoCasa && historia.chegouEmCasa) {
    if (historia.recebeuChaveQuarto) historia.monologoCasa = true;
    else if (cenaAtual === CENAS.sala) {
      historia.monologoCasa = true;
      abrirDialogo(DIALOGOS.dellalos.casa);
      return;
    }
  }

  for (const m of MISSOES) {
    if (!m.auto || diario.fim[m.id] || !missaoLiberada(m)) continue;
    if (missaoConcluida(m)) {
      diario.fim[m.id] = true;
      let rec = m.recompensa || "";
      if (m.moedas) {                                  // recompensa em moedas (js/loja.js)
        ganharMoedas(m.moedas);
        rec += (rec ? " " : "") + "+" + m.moedas + " moedas.";
      }
      if (m.secundaria) rec += (rec ? " " : "") + reputacaoAoConcluir();   // reputação (js/reputacao.js)
      proximaMissao(m.titulo, "", rec);
      return;
    }
  }
}

// Liga a bolinha "!" no 🎒
function sinalizarMissao() {
  btnInventario.classList.add("novo");
}

// Mostra "Missão concluída: X." e, se a missão ativa ainda não foi avisada, "Nova: Y."
// "antes" é um texto opcional que vem na frente (ex.: "Você pegou a chave!")
function proximaMissao(concluida, antes, recompensa) {
  let txt = antes ? antes + " " : "";
  if (concluida) txt += "Missão concluída: " + concluida + ".";
  if (recompensa) txt += " " + recompensa;
  const m = missaoAtiva();
  if (m && !historia[m.aviso]) {
    historia[m.aviso] = true;
    txt += (txt ? " " : "") + "Nova: " + m.titulo + ".";
  }
  if (txt) mostrarMensagem(txt);
  sinalizarMissao();
}

// Chamado por entrarNaCena() (js/cena.js) toda vez que Dellalos chega num lugar
function aoEntrarNaCena(id) {
  amizadeAoEntrarNaCena(id);   // missões pessoais dos amigos (js/amizade.js)
  aoEntrarNaCenaDia(id);   // rotina dos dias: escola e passeio (js/dias.js)
  avisarNovaSecundaria("tunel");    // O túnel do selo (dia 14; js/calendario.js)
  avisarNovaSecundaria("mansao");   // A Casa dos Cinco: avisa depois de ler a ordem de produção, também em saves antigos
  if (id !== "zona_leste") avisarNovaSecundaria("lucas_zona");   // treino do Lucas na Zona Leste (js/salas/zonaleste.js)
  if (id === "escola" || id === "escola2" || id.indexOf("aula") === 0) avisarNovaSecundaria("simon");   // DIA_SEITA: "O amigo que faltou" (js/simon.js)
  // Dia seguinte: chegar na escola (missão "Um novo dia")
  if (historia.novoDia && !historia.chegouEscolaDia2 && (id === "escola" || id === "escola2" || id.indexOf("aula") === 0)) {
    historia.chegouEscolaDia2 = true;
  }
  // Missão 1: chegar na escola
  if (!historia.chegouNaEscola && (id === "escola" || id === "escola2" || id.indexOf("aula") === 0)) {
    historia.chegouNaEscola = true;
    proximaMissao("Ir para a escola");
    return;
  }
  // Missão 3: depois de conhecer a Millena, chegar em casa
  if (historia.conheceuMillena && !historia.chegouEmCasa && id === "sala") {
    historia.chegouEmCasa = true;
    proximaMissao("Ir para casa");
    return;
  }
  // Missão 5: entrar no quarto do pai
  if (!historia.entrouQuartoPai && id === "quarto_pai") {
    historia.entrouQuartoPai = true;
    proximaMissao("Entrar no quarto do pai");
  }
}

// Fim da conversa com a Millena ("Senta do meu lado!"): missão 2 concluída,
// passa o tempo (tela preta de 2 segundos) e começa a próxima missão
function aoConhecerMillena() {
  historia.conheceuMillena = true;
  iniciarTelaTempo("Algumas horas depois...", function () {
    proximaMissao("Falar com a Millena");
  }, 2);
}

// Fim da conversa em que o Morador entrega a chave (missão 4)
function entregarChaveDoMorador() {
  if (!darItem("chave_quarto_pai")) return;     // inventário cheio: ele repete a conversa depois
  historia.recebeuChaveQuarto = true;
  proximaMissao("Falar com o Morador", "Você pegou: " + ITENS.chave_quarto_pai.nome + ".");
}

// Chamado uma vez quando o jogo abre: avisa da missão ativa se ainda não avisou
function anunciarMissaoInicial() {
  const m = missaoAtiva();
  if (!m || historia[m.aviso]) return;
  historia[m.aviso] = true;
  mostrarMensagem("Nova missão! Abra o inventário.");
  sinalizarMissao();
}

// Desenha a caixa da missão dentro do inventário
function renderizarMissoes() {
  const caixa = document.getElementById("inventarioMissoes");
  caixa.replaceChildren();
  desenharRotinaNaCaixa(caixa);       // missão fixa do dia, no topo (js/dias.js)
  desenharReputacaoNaCaixa(caixa);    // reputação (js/reputacao.js)
  if (cicloEhNoite()) return;         // de noite a única missão é dormir (js/ciclo.js)

  const ativa = missaoAtiva();
  const principais = MISSOES.filter((x) => !x.secundaria);
  const m = ativa || principais[principais.length - 1];    // sem ativa: mostra a última concluída
  if (!m) return;

  desenharMissaoNaCaixa(caixa, m, "MISSÃO", "MISSÃO CONCLUÍDA ✔");

  // Missões secundárias que já foram aceitas e ainda não terminaram
  MISSOES.filter((x) => x.secundaria && missaoLiberada(x) && !missaoConcluida(x))
         .forEach((x) => desenharMissaoNaCaixa(caixa, x, "MISSÃO SECUNDÁRIA", ""));
}

function desenharMissaoNaCaixa(caixa, m, rotulo, rotuloFeita) {
  const feita = missaoConcluida(m);
  const div = document.createElement("div");
  div.className = "missao" + (feita ? " feita" : "");

  const h = document.createElement("h3");
  h.textContent = feita ? rotuloFeita : rotulo;
  const t = document.createElement("p");
  t.className = "missao-titulo";
  t.textContent = m.titulo;
  const d = document.createElement("p");
  d.className = "missao-desc";
  d.textContent = feita ? "Novas missões em breve." : m.descricao;

  div.append(h, t, d);
  if (!feita) {
    for (const o of m.objetivos || []) {
      const ok = !!o.ok();
      const li = document.createElement("p");
      li.className = "missao-desc";
      li.textContent = (ok ? "☑ " : "☐ ") + o.texto;
      div.appendChild(li);
    }
  }
  caixa.appendChild(div);
}


// Seu Augusto (Bairro Sul): começa "A casa vazia" depois de "Passageiros" (o conversar dele chama isto primeiro; js/salas/bairrosul.js)
function passageirosSulAugusto() {
  if (!historia.leste2PassageirosFim || !missaoDoDiaLiberada("sul_passageiros") || historia.sulPassFim) return null;
  const A = (t) => ({ quem: "Seu Augusto", texto: t }), D = (t) => ({ quem: "Dellalos", texto: t });
  if (historia.sulPassIniciada) return { falas: [A("Procure a casa vazia depois de escurecer. Debaixo do tapete da sala, o chão soa oco.")] };
  return {
    falas: [
      D("Seu Augusto, o senhor viu jovens sendo levados para cá em fila, de noite?"),
      A("Anoto os horários de todo mundo. Toda noite, perto da meia-noite, uma fila de jovens entra na casa vazia, a de porta dupla laranja."),
      A("A casa está desocupada há anos e continua apagada. Eu nunca vi ninguém sair de lá."),
      D("Preciso entrar lá."),
      A("Vá de noite. Dizem que o tapete da sala mexe sozinho.")
    ],
    fim: function () { historia.sulPassIniciada = true; avisarNovaSecundaria("sul_passageiros"); }
  };
}
