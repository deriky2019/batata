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
      nota(historia.conheceuLucas,     "Conheci o Lucas, com o Simon e o Vitinho, no corredor. O Lucas fala pouco.");
      nota(historia.conheceuVeras,     "A Veras não gosta de recém-chegados.");
      nota(historia.conheceuNathalia,  "A Nathalia diz que eu lembro alguém. Quem será?");
      if (f.length === 1) f.push({ quem: "Dellalos", texto: "Ainda não tenho muito o que anotar." });
      return f;
    }
  }
};

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
  return (item.flagDepois && historia[item.flagDepois] && item.descricaoDepois) ? item.descricaoDepois : item.descricao;
}
