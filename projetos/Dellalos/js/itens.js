/* =====================================================
   itens.js - Lista de itens do jogo
   Cada item: { nome, descricao, icone }  (icone = emoji; ou "imagem" com o caminho de um PNG)
   Os itens ocupam os 5 espaços do inventário (inventario.js).
   Para dar um item:      darItem("chave_quarto_pai")   -> false se o inventário estiver cheio
   Para ver se tem:       temItem("chave_quarto_pai")
   Para tirar (usou):     tirarItem("id")   (a chave do quarto do pai NÃO é tirada: é lembrança do papai)
   Para criar um item novo: coloque-o aqui com um id novo.

   Campos opcionais de um item:
     categoria      -> "chave", "documento", "caderno"...
     essencial      -> true = item importante da história: o jogo não tem nenhuma ação que o jogue fora
     exame          -> falas (lista) OU função que devolve falas: aparece o botão "Examinar" no inventário
     aoExaminar     -> flag de historia marcada quando a conversa do exame termina
     documento      -> { titulo, texto: [...] }  vai para a seção Documentos do diário depois de examinado
     descricaoDepois + flagDepois -> outra descrição quando historia[flagDepois] for true
   Regra dos 5 espaços: um item só ocupa espaço se tiver função na história (chave, documento
   para examinar ou caderno que registra o progresso). Itens essenciais ficam até o fim.
   ===================================================== */

const ITENS = {
  vegetais_frescos: {
    nome: "Vegetais frescos",
    descricao: "Uma pequena colheita da fazenda comunitária. Os sobreviventes podem usar alimentos como estes para se manterem fortes.",
    categoria: "comida",
    icone: "🥕"
  },
  adaga: {
    nome: "Adaga",
    descricao: "Uma adaga afiada. Toque em Equipar: equipada, o golpe causa +1 de dano.",
    descricaoDepois: "Uma adaga afiada. Está equipada: o golpe causa +1 de dano.",
    flagDepois: "adagaEquipada",
    categoria: "arma",
    equipavel: "adagaEquipada",      // flag de historia: true = equipada
    exclusivo: "daliaEquipada",      // equipar a adaga desequipa a Dália (os bônus não somam)
    icone: "\u{1F5E1}\uFE0F"
  },
  // Dália (dia 5, entregue pelo amigo do papai): lâmina do pai. Nível 1 a 5 (diario.escolhas.daliaNivel), +1 de dano por nível.
  // Sobe de nível na loja Necro, à noite (js/loja.js, NECRO_ITENS). Equipada, ocupa o lugar da adaga.
  dalia: {
    nome: "Dália",
    descricao: "A lâmina do papai.",
    descricaoDinamica: function () {
      const n = (typeof daliaNivel === "function") ? daliaNivel() : 1;
      return "A lâmina do papai. Nível " + n + " de " + DALIA_NIVEL_MAX + ": equipada, o golpe causa +" + n + " de dano (no lugar da adaga)."
        + (n < DALIA_NIVEL_MAX ? " A Necro, à noite, sabe aprimorá-la." : " Ela está no nível máximo.");
    },
    categoria: "arma",
    essencial: true,
    equipavel: "daliaEquipada",
    exclusivo: "adagaEquipada",      // equipar a Dália desequipa a adaga
    icone: "\u{1F33A}"
  },
  chave_quarto_pai: {
    nome: "Chave do quarto do pai",
    descricao: "Uma chave antiga. Abre a porta do quarto do papai, aqui em casa.",
    descricaoDepois: "Uma chave antiga. Já abriu a porta do quarto do papai. Vale a pena guardá-la.",
    flagDepois: "quartoPaiAberto",
    categoria: "chave",
    essencial: true,
    icone: "\u{1F5DD}\uFE0F"
  },
  carta_pai: {
    nome: "Carta do papai",
    descricao: "Uma carta dobrada, com a letra do papai. Toque em Examinar para ler.",
    descricaoDepois: "A carta do papai. Já li, mas posso reler.",
    flagDepois: "leuCartaPai",
    categoria: "documento",
    essencial: true,
    icone: "\u2709\uFE0F",
    aoExaminar: "leuCartaPai",
    // Conteúdo PROVISÓRIO da carta (troque pelo texto da história original)
    exame: [
      { quem: "Carta do papai", texto: "Dellalos, se você está lendo isto, é porque a chave chegou até você." },
      { quem: "Carta do papai", texto: "Sei que tudo é novo: a cidade, a escola, as pessoas. Vá com calma e observe bem." },
      { quem: "Carta do papai", texto: "Deixei algumas coisas no meu quarto para você. Cuide da casa. - Papai" }
    ],
    documento: {
      titulo: "Carta do papai",
      texto: [
        "Dellalos, se você está lendo isto, é porque a chave chegou até você.",
        "Sei que tudo é novo: a cidade, a escola, as pessoas. Vá com calma e observe bem.",
        "Deixei algumas coisas no meu quarto para você. Cuide da casa. - Papai"
      ]
    }
  },
  // Segunda carta do papai (dia 8, entregue pelo Morador): lida na hora e guardada no diário; nunca ocupa espaço no inventário
  carta_pai2: {
    nome: "Segunda carta do papai",
    descricao: "A carta que o Morador entregou no dia 8.",
    categoria: "documento",
    icone: "\u2709\uFE0F",
    documento: {
      titulo: "Segunda carta do papai",
      texto: [
        "Dellalos, eu chego logo, bem mais cedo do que você imagina.",
        "Eu sabia que isso chegaria. Por isso deixei tudo preparado para você.",
        "Fique longe do hospedeiro, custe o que custar.",
        "Quando eu chegar, explico tudo. Até lá, tome cuidado. - Papai"
      ]
    }
  },
  // Retrato dos heróis (dia 5+, dado pela Dona Lúcia). Com ele no inventário, toda conversa com um NPC ganha a opção "Mostrar retrato" (conversarComRetrato, abaixo)
  retrato_herois: {
    nome: "Retrato dos heróis",
    descricao: "Um pequeno retrato antigo do dia em que os espíritos foram expulsos da cidade. Ao falar com alguém, escolha Mostrar retrato.",
    descricaoDepois: "O retrato dos heróis. A Nathalia disse que o pai dela tem uma foto igual, e o sobrenome dela, Master, é o do Julio Master.",
    flagDepois: "mostrouRetratoNathalia",
    categoria: "retrato",
    essencial: true,
    icone: "\u{1F5BC}\uFE0F",
    exame: [
      { quem: "Dellalos", texto: "O retrato do dia em que os espíritos foram expulsos. Estão todos os heróis aqui." },
      { quem: "Dellalos", texto: "E lá está o Perroti Dellalos, entre os outros." }
    ]
  },
  // Amuleto estranho (loja do Seu Tomás, a partir do DIA_AMULETO_ESTRANHO): ninguém sabe para que serve. No dia 9 ele liberta a Gaby (js/salas/zonaleste.js)
  amuleto_estranho: {
    nome: "Amuleto estranho",
    descricao: "Um amuleto antigo da loja do Seu Tomás. Ele mesmo não sabe para que serve. Toque em Examinar.",
    categoria: "missao",
    essencial: true,
    icone: "\u{1F9FF}",
    exame: [
      { quem: "Dellalos", texto: "O Seu Tomás disse que não sabe para que serve. Parece de proteção, mas nunca vi um igual." },
      { quem: "Dellalos", texto: "De vez em quando ele esquenta de leve na minha mão. Melhor guardar com cuidado." }
    ]
  },
  // Grimório de aprimoramento (loja Necro): leve para casa e coloque no lugar do livro do papai (js/salas/sala.js). Depois abre a árvore de habilidades (js/loja.js)
  grimorio_aprimoramento: {
    nome: "Grimório de aprimoramento",
    descricao: "Um grimório de capa preta, vendido pelo Necro. Leve para casa e coloque no lugar do livro do papai.",
    categoria: "livro",
    essencial: true,
    icone: "\u{1F4D6}",
    exame: [
      { quem: "Dellalos", texto: "As páginas estão em branco, mas sinto elas pedindo alguma coisa." },
      { quem: "Dellalos", texto: "O Necro disse para dar a ele um lugar de honra em casa. Talvez no lugar do livro do papai." }
    ]
  },
  // Livro de magia (presente da Gaby, no dia 9, se ela foi salva com o amuleto). Por enquanto só história: conteúdo PROVISÓRIO
  livro_magia: {
    nome: "Livro de magia",
    descricao: "Um livro de magia que a Gaby deu à Dellalos. Só quem tem sangue sagrado consegue entendê-lo. Toque em Examinar.",
    descricaoDepois: "O livro de magia da Gaby. Eu entendo porque tenho o sangue sagrado. Ele traduz símbolos e ensina a quebrar o controle da Isabela.",
    flagDepois: "leuLivroMagia",
    categoria: "livro",
    essencial: true,
    icone: "\u{1F4D5}",
    aoExaminar: "leuLivroMagia",
    // Lê o livro: traduz os símbolos que a Dellalos já viu e mostra a página de quebrar o controle (conteúdo PROVISÓRIO)
    exame: function () {
      const D = "Dellalos";
      if (!entendeLivro(D)) return [{ quem: D, texto: "Só rabiscos. Não entendo nada." }];
      const f = [
        { quem: D, texto: "O livro de magia da Gaby. Os símbolos parecem se mexer, mas eu consigo ler. É o sangue sagrado do Perroti Dellalos.", info: "livro_sangue" },
        { quem: D, texto: "Primeira página, \"Quebrar o Elo\": quem controla uma mente deixa um fio preso nela. Quem tem sangue sagrado pode cortar esse fio sem ferir a vítima.", info: "livro_controle" }
      ];
      const traduz = (cond, texto, info) => { if (cond) f.push({ quem: D, texto, info }); };
      traduz(diario.infos.pista_simbolo || diario.escolhas.marco_olho, "O olho no círculo, o símbolo da seita, quer dizer: \"Ele vê quem o serve\".", "livro_olho");
      traduz(diario.escolhas.marco_lua,     "A lua riscada dos marcos de pedra quer dizer: \"a hora da entrega\". Os sacrifícios são feitos à noite.", "livro_lua");
      traduz(diario.escolhas.marco_espiral, "A espiral dos marcos quer dizer: \"o que cai não sobe\". É a marca do hospedeiro, quem o Caos toma.", "livro_espiral");
      traduz(historia.leuAltar,             "A inscrição do altar, traduzida: saciar o Caos não o enfraquece, só o aproxima.", "livro_altar");
      if (f.length === 2) f.push({ quem: D, texto: "(Ainda há símbolos que eu não vi por aí. Quando achar mais, o livro vai traduzir.)" });
      return f;
    }
  },
  peixe: {
    nome: "Peixe fresco",
    descricao: "Um peixe recém-pescado. No inventário, toque em Comer para recuperar 1 ponto de vida.",
    categoria: "comida",
    comestivel: true,
    icone: "🐟"
  },
  encomenda_pescador: {
    nome: "Encomenda do pescador",
    descricao: "Um pacote embrulhado. O pescador pediu para deixar na porta da casa do meio.",
    categoria: "missao",
    essencial: true,
    icone: "\u{1F4E6}"
  },
  gatinho: {
    nome: "Bolinha",
    descricao: "O gatinho laranja da Clarice, quietinho no colo. Leve-o para ela.",
    categoria: "missao",
    essencial: true,
    icone: "\u{1F431}"
  },
  chave_mansao: {
    nome: "Chave da mansão",
    descricao: "Uma chave antiga com a etiqueta \"Mansão\". Estava numa gaveta da fábrica. Abre a corrente da porta da mansão, na Zona Oeste.",
    categoria: "chave",
    essencial: true,
    icone: "\u{1F5DD}\uFE0F"
  },
  chave_1a: {
    nome: "Chave da sala 1A",
    descricao: "Uma chave com a etiqueta 1A. Estava na casa da diretora. Abre a sala fechada da escola.",
    categoria: "chave",
    essencial: true,
    icone: "\u{1F5DD}\uFE0F"
  },
  // Documento da fábrica (js/salas/fabrica.js): é lido direto na mesa da sala de controle e vai para o diário;
  // nunca ocupa espaço no inventário (por isso não há darItem para ele).
  ordem_fabrica: {
    nome: "Ordem de produção",
    descricao: "Uma ordem de serviço amassada, da sala de controle da fábrica.",
    categoria: "documento",
    icone: "\u{1F4C4}",
    documento: {
      titulo: "Ordem de produção (fábrica)",
      texto: [
        "ORDEM Nº 5 - URGENTE.",
        "Item: equipamentos de proteção e peças para o evento da escola.",
        "Quantidade: conforme a lista de inscritos. Prazo final: dia 5.",
        "Obs.: não registrar o cliente. Pagamento adiantado."
      ]
    }
  },
  caderno_pessoal: {
    nome: "Caderno pessoal",
    descricao: "O caderno da Dellalos. Toque em Examinar para reler o que ela anotou até agora.",
    categoria: "caderno",
    essencial: true,
    icone: "\u{1F4D3}",
    // As anotações vêm do que já aconteceu (historia): não há nada para atualizar à mão
    exame: function () {
      const f = [{ quem: "Dellalos", texto: "Meu caderno. Vou anotar o que importa." }];
      const nota = (cond, texto) => { if (cond) f.push({ quem: "Dellalos", texto }); };
      nota(historia.conheceuMillena,   "A Millena foi a primeira a me receber na escola, na sala 2A.");
      nota(historia.conheceuEstudante, "Uma estudante no corredor me disse onde achar a Millena.");
      nota(historia.conheceuMorador,   "O Morador da calçada me avisou sobre os slimes na avenida.");
      nota(historia.recebeuChaveQuarto, "Ganhei a chave do quarto do papai.");
      nota(historia.leuCartaPai,       "Li a carta do papai: ele quer que eu observe com calma.");
      nota(historia.conheceuLucas,     "Conheci o Lucas, com o Simon e o Vitinho, na sala 3A. O Lucas fala pouco.");
      nota(historia.conheceuVeras,     "A Veras não gosta de recém-chegados.");
      nota(historia.conheceuNathalia,  "A Nathalia diz que eu lembro alguém. Quem será?");
      nota(historia.conheceuDeriky,    "O Deriky avisou: a cidade é perigosa, e coisas terríveis vão acontecer na escola.");
      nota(historia.torneioAnunciado,  "Vai ter um torneio de lutas na escola. Ainda não sei o dia.");
      nota(historia.revelouSeita,      "Deriky e Simon disseram que o torneio é plano de uma seita: roubam a energia vital dos jovens para alimentar o Caos. Cuidado com todo mundo, e muito mais com a Isabela.");
      nota(historia.fimChave1A,        "Eu, a Millena e a Nathalia fizemos um acordo: o que uma descobrir, conta para as outras. A Nathalia disse que os meninos, principalmente o Lucas, estão envolvidos.");
      nota(historia.viuMariana,        "Na sala 1A havia uma menina chamada Mariane. Uma criatura preta surgiu, e ela fugiu depois que eu a derrotei.");
      nota(historia.conheceuAmigoPai,  "O amigo do papai disse que ele só confere tudo no dia 15. Até lá, nada de errado.");
      nota(historia.conheceuThaina,    "A Thaina, da 3C, é fechada. Pelo jeito, a Isabela é a melhor amiga dela.");
      nota(historia.conheceuIsabela,   "A Isabela parece me conhecer, mas disse que ainda não. Que mistério.");
      nota(historia.entregouEncomenda, "Deixei a encomenda do pescador na porta da casa do meio.");
      nota(historia.entregouGato,      "Achei o Bolinha e levei de volta para a Clarice.");
      nota(historia.entregouCaca,      "Derrotei 5 slimes para a Dona Rosa.");
      nota(historia.conheceuOrlando,   "O Orlando vigia a fábrica da Zona Leste e ouve máquinas funcionando à noite.");
      nota(historia.portaoFabricaAberto, "Juntei as 3 engrenagens e abri o portão da fábrica.");
      nota(historia.entregouLimpeza,   "Limpei o ferro-velho para o Nando e ele me deu uma engrenagem.");
      nota(historia.caosSaciado,       "Ofereci dez essências de espíritos ao altar do Caos. Algo respondeu.");
      nota(historia.lucasDuelo,        "Treinei com o Lucas na Zona Leste. Ele não pega leve, mas me deu 50 moedas.");
      nota(historia.lucasContado,      "O Lucas já sabia da seita e do torneio. Ele avisou: cuidado com qualquer pessoa, até com a Isabela.");
      nota(historia.augustoPista1,     "O Seu Augusto viu gente empurrando caixas de madrugada na direção da Zona Leste.");
      nota(historia.augustoPista2,     "O Seu Augusto lembrou do antigo zelador da mansão, sempre com um molho de chaves. Ele sumiu um dia.");
      nota(historia.augustoPista3,     "O Seu Augusto acha que a chave da mansão está na fábrica, perto dos papéis da produção.");
      nota(historia.pegouChaveMansao,  "Achei a chave da mansão numa gaveta da sala de controle da fábrica.");
      nota(historia.mansaoAberta,      "Usei a chave e abri a porta da mansão, na Zona Oeste.");
      nota(historia.comprouLanterna,   "Comprei uma lanterna do Seu Tomás para explorar a mansão.");
      nota(historia.mansaoTunelAberto, "A senha do túnel era SANGUE, escondida nas primeiras letras da carta do zelador. O túnel leva até a porta do selo.");
      nota(historia.mansaoCompleta,    "Li todos os papéis da mansão: a Casa dos Cinco, o selo no porão, o pacto da seita e a lista com o Lucas marcado como hospedeiro.");
      nota(historia.derrotouCapataz,   "Derrotei o Capataz Mecânico. O pedido dele tinha entrega final no dia 5.");
      nota(historia.luciaContouEspiritos, "A Dona Lúcia contou que o avô dela e cinco amigos expulsaram os espíritos da cidade: Magnus Fracis, Julio Master, Luiz Inácio, Renan Santos e Perroti Dellalos. Cada um seguiu seu caminho e nunca mais se viram. O sobrenome do último é igual ao meu.");
      nota(historia.pegouRetrato,      "A Dona Lúcia me deu um retrato do dia em que os espíritos foram expulsos. Todos os heróis estão nele, até o Perroti Dellalos.");
      nota(historia.mostrouRetratoNathalia, "Mostrei o retrato à Nathalia: o pai dela tem uma foto igual, e o sobrenome dela é Master, o mesmo do Julio Master.");
      nota(historia.recebeuCarta8,     "O Morador me deu outra carta do papai: ele chega logo, já sabia que isso chegaria, e mandou eu ficar longe do hospedeiro. Quando chegar, vai explicar tudo.");
      nota(historia.viuJPMLR && !historia.entendeuJPMLR, "Na parede da capela estão gravadas as letras JPMLR. Não faço ideia do que significam.");
      nota(historia.entendeuJPMLR,     "JPMLR, na capela: as iniciais de Julio, Perroti, Magnus, Luiz e Renan, os amigos do avô da Dona Lúcia. Eles passaram por lá.");
      nota(historia.tomasFalouColete,  "O Seu Tomás disse que o colete veio de um fornecedor da Zona Leste, em caixas com o mesmo carimbo. Ninguém quis dar o nome de quem pagou.");
      nota(historia.tomasFalouArmadura, "A armadura da loja é do mesmo lote do colete. Disseram ao Seu Tomás que era equipamento para um evento na escola.");
      nota(historia.comprouCapacete,   "Comprei um capacete: de vez em quando ele me salva de um golpe fatal.");
      nota(historia.comprouAmuleto,    "Comprei um amuleto contra o Caos. Espero que funcione de verdade.");
      nota(historia.pegouOrdemFabrica, "Na fábrica, uma ordem de produção fala de equipamentos para o evento da escola. Prazo: dia 5.");
      nota(historia.gabySalva,         "A Isabela controlava a Gaby, uma aluna, e ela me atacou na Zona Leste. Coloquei o amuleto estranho do Seu Tomás nela e ela voltou ao normal. Disse que a Isabela quer a entidade de volta e foi avisar os pais.");
      nota(historia.ganhouLivroMagia,  "A Gaby me deu um livro de magia em agradecimento. Preciso descobrir o que ele guarda.");
      nota(historia.gabyMorta,         "A Isabela controlava a Gaby e ela me atacou na Zona Leste. Eu a matei. Isso não tem volta.");
      if (f.length === 1) f.push({ quem: "Dellalos", texto: "Ainda não tenho muito o que anotar." });
      return f;
    }
  }
};

// Sangue sagrado: só os descendentes dos cinco guerreiros (Magnus Fracis, Julio Master, Luiz Inácio, Renan Santos e Perroti Dellalos)
// entendem o livro de magia. Dellalos (Perroti), Nathalia (Master) e Mariane (Luiz Inácio e Renan Santos).
const DESCENDENTES_DOS_CINCO = ["Dellalos", "Nathalia", "Mariane"];
function entendeLivro(nome) { return DESCENDENTES_DOS_CINCO.indexOf(nome) !== -1; }

// A Dellalos pode quebrar o controle mental da Isabela (página 1 do livro)? Use nas lutas contra alguém controlado, no lugar de matar.
function podeQuebrarControle() { return temItem("livro_magia") && entendeLivro("Dellalos"); }

// Botão "Examinar" do inventário: fecha a mochila e abre a conversa/leitura do item
function examinarItem(item) {
  const base = ITENS[item.id] || item;
  const falas = typeof base.exame === "function" ? base.exame() : base.exame;
  if (!falas || !falas.length) return;
  fecharInventario();
  abrirDialogo(falas, function () {
    if (base.aoExaminar) historia[base.aoExaminar] = true;
    if (base.documento) registrarDocumento(item.id);
  });
}

// Descrição atual do item (muda depois de um acontecimento, se o item tiver descricaoDepois)
function descricaoDoItem(item) {
  if (typeof item.descricaoDinamica === "function") return item.descricaoDinamica();   // ex.: a Dália mostra o nível atual
  return (item.flagDepois && historia[item.flagDepois] && item.descricaoDepois) ? item.descricaoDepois : item.descricao;
}

// ---------- Retrato dos heróis ----------
// A Dona Lúcia entrega o retrato no fim da história dos espíritos (js/salas/bairrosul.js). Inventário cheio: ela oferece de novo depois.
function receberRetratoDaLucia() {
  if (historia.pegouRetrato) return true;
  if (!darItem("retrato_herois")) {
    mostrarMensagem("Meu inventário está cheio. Libere um espaço (ou compre a mochila maior) e volte a falar com a Dona Lúcia.");
    return false;
  }
  historia.pegouRetrato = true;
  mostrarMensagem("Você ganhou o Retrato dos heróis. Ao falar com alguém, escolha Mostrar retrato.");
  return true;
}

// Com o retrato no inventário, falar com qualquer NPC abre antes uma escolha: Conversar ou Mostrar retrato (chamado por js/cena.js)
function conversarComRetrato(n) {
  let acao = null;
  abrirDialogo([
    { quem: "Dellalos", texto: "(O que eu faço?)", opcoes: [
      { id: "conversar", texto: "Conversar",        fn: function () { acao = "conversar"; } },
      { id: "retrato",   texto: "Mostrar retrato",  fn: function () { acao = "retrato"; } }
    ] }
  ], function () {
    if (acao === "conversar") n.conversar();
    else if (acao === "retrato") mostrarRetratoPara(n);
  });
}

function mostrarRetratoPara(n) {
  const nome = n.nome === "IsabelaConvite" ? "Isabela" : n.nome;
  const R = DIALOGOS.retrato;
  if (nome === "Nathalia") {
    if (historia.mostrouRetratoNathalia) { abrirDialogo(R.Nathalia_depois); return; }
    abrirDialogo(R.Nathalia, function () { historia.mostrouRetratoNathalia = true; });
    return;
  }
  abrirDialogo(R[nome] || R.generico(nome));
}
