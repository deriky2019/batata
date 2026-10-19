/* =====================================================
   diario.js - Registro do que a Dellalos já sabe (aba "Diário" do 🎒)
   O diário NÃO é preenchido à mão em vários arquivos:
     - personagens conhecidos, informações e escolhas entram sozinhos pelas FALAS
       (campos  conhece / info / escolha  em js/dialogos.js)
     - documentos entram quando o jogador examina o item (js/itens.js)
     - missões vêm da lista MISSOES (js/missoes.js)
   É salvo junto com o progresso (js/salvamento.js). Se o save for antigo e não tiver
   "diario", tudo começa vazio (nada do resto do save é apagado).
   ===================================================== */

const diario = { conhecidos: {}, infos: {}, docs: {}, escolhas: {}, fim: {} };

// Informações que podem ser descobertas (o id é usado no campo  info  das falas)
const INFOS = {
  primeiro_dia:        "No primeiro dia, a Millena me apresentou a escola.",
  chave_papai:         "O Morador me entregou a chave do quarto do papai. Ele disse que eu saberia a hora de usá-la.",
  lucas_treinos:       "O Lucas fala pouco e leva os treinos a sério. Anda com o Simon e o Vitinho.",
  veras_hostil:        "A Veras não gosta de recém-chegados.",
  nathalia_semelhanca: "A Nathalia acha que eu lembro alguém que ela conhece. Ela ainda não sabe dizer quem.",
  thaina_isabela:      "A Thaina é fechada e quase não fala. A Isabela é a melhor amiga dela. As duas ficam na sala 3C.",
  isabela_conhece:     "A Isabela age como se já me conhecesse, mas diz que ainda não nos conhecemos. Ela é misteriosa.",
  amigo_prazo:         "O amigo do papai disse que o papai só vai conferir tudo no dia 15. Até lá, não devo tentar nada de errado.",
  deriky_aviso:        "O Deriky, no Bairro Sul, avisou que a cidade é muito perigosa e que coisas terríveis ainda vão acontecer na escola.",
  torneio_anuncio:     "A Millena contou que vai ter um torneio na escola, com lutas entre os alunos. A escola ainda vai anunciar o dia.",
  pescador_encomenda:  "O pescador do lago tem uma encomenda para o morador da casa do meio.",
  gato_bolinha:        "A Clarice perdeu o gatinho Bolinha. Ele é laranja e anda pela estrada inteira.",
  rosa_slimes:         "A Dona Rosa quer que eu derrote 5 slimes para deixar a calçada tranquila.",
  bairro_sul:          "Ao sul da cidade fica o Bairro Sul: casas, jardins e uma pracinha com fonte.",
  bairro_sul2:         "Além do Bairro Sul existe uma comunidade de sobreviventes que mantém uma fazenda para produzir alimentos.",
  lucia_historias:     "A Dona Lúcia conhece histórias antigas da cidade e prometeu contar algumas um dia.",
  lucia_espiritos:     "A Dona Lúcia contou uma história do avô dela: a cidade tinha espíritos, e ele e os amigos expulsaram todos.",
  lucia_amigos:        "Os amigos do avô da Dona Lúcia: Magnus Fracis, Julio Master, Luiz Inácio, Renan Santos e Perroti Dellalos, o mesmo sobrenome que o meu. Cada um seguiu seu caminho e nunca mais se viram.",
  capela_jpmlr:        "Na parede da capela da colina estão gravadas as letras JPMLR. Ainda não sei o que significam.",
  capela_jpmlr_sig:    "JPMLR, na capela, são as iniciais de Julio, Perroti, Magnus, Luiz e Renan: os cinco amigos do avô da Dona Lúcia. Eles passaram pela capela.",
  hospedeiro_aviso:    "Uma segunda carta do papai, entregue pelo Morador: ele chega logo, já sabia que isso chegaria, e mandou eu ficar longe do hospedeiro. Quando chegar, explica tudo.",
  retrato_herois:      "A Dona Lúcia me deu um pequeno retrato do dia em que os espíritos foram expulsos: estão todos os heróis, e o Perroti Dellalos entre eles.",
  nathalia_master:     "A Nathalia me disse que o pai dela tem uma foto igual à do retrato. O sobrenome dela é Master, o mesmo do Julio Master, um dos heróis.",
  augusto_rumor:       "O Seu Augusto ouviu rumores de que pequenas coisas estão sumindo pelas calçadas do bairro.",
  mansao_cinco:        "Na mansão da Zona Oeste havia a Casa dos Cinco: o lugar onde os cinco heróis se reuniram depois de expulsar os espíritos e juraram guardar o que foi trancado.",
  mansao_perroti:      "Numa folha do diário de Perroti Dellalos: o Magnus passou a vigiar o selo no porão. O selo só obedece aos cinco e aos descendentes, e o Perroti avisa para não deixar o Caos escolher um corpo.",
  mansao_alcapao:      "Embaixo do tapete da biblioteca da mansão há um alçapão que leva ao porão.",
  mansao_magnus:       "Numa carta do Magnus Fracis, um dos Cinco: ele queria dar ao Caos um lugar para morar, e os seguidores dele escolheriam um sucessor.",
  mansao_selo:         "Uma planta mostra que o porão da mansão se liga por um túnel à instalação de concreto da Zona Oeste. É lá que o selo do Caos está.",
  mansao_lista:        "Numa lista de inscritos do torneio, o Lucas está marcado com a espiral: ele é o hospedeiro escolhido pela seita.",
  mansao_durval:       "Uma cópia da ordem de produção da fábrica tem a assinatura D.: quem pagou foi alguém da seita, com dinheiro das taxas dos alunos.",
  mansao_zelador:      "O zelador deixou uma carta: escondeu a chave da mansão numa gaveta da fábrica, falou de um túnel do porão até a porta do selo e escondeu a senha do túnel no começo de cada linha da própria carta.",
  selo_aberto:         "A porta do selo só abriu com o sangue de duas descendentes dos Cinco: a minha (Perroti Dellalos) e a da Nathalia (Julio Master), que estava comigo como companheira.",
  selo_seita:          "Os Cinco selaram o Caos. A seita existe porque acredita que o Caos vai ser o salvador do mundo, e os heróis lutaram contra ela até os últimos dias da vida deles.",
  selo_lucas:          "Depois da morte dos heróis, a seita fez experimentos com famílias até criar um bebê compatível com o Caos. Esse bebê era o Lucas.",
  selo_quebrado:       "Ao entrarmos, o selo se quebrou e o demônio voltou à Terra. Agora há demônios pelas estradas.",
  mansao_tunel:        "Abri a porta de aço do porão digitando a senha SANGUE, escondida nas primeiras letras das linhas da carta do zelador. Atrás dela há um túnel até a porta do selo.",
  mansao_vigilia:      "No fim do túnel, um diário de vigília diz que a porta do selo só abre com sangue de um dos Cinco; com outro sangue, solta o que dorme.",
  mansao_pacto:        "No porão da mansão, o pacto: o olho vê quem serve o Caos, a lua marca a hora da entrega e a espiral marca o hospedeiro. O selo só se refaz com o sangue dos descendentes dos Cinco.",
  pedro_procura:       "O Pedro vive procurando algo que perdeu, mas nem ele sabe direito o quê.",
  augusto_caixas:      "O Seu Augusto viu, de madrugada, pessoas empurrando caixas pela avenida em direção à Zona Leste, sem conversar e sem lanterna.",
  augusto_zelador:     "O Seu Augusto lembrou que a mansão da Zona Oeste tinha um zelador quieto, com um molho de chaves, que sumiu um dia. Ele desconfia de quem paga sem se registrar.",
  augusto_chave_fabrica: "O Seu Augusto acha que o zelador guardou a chave da mansão na fábrica, perto dos papéis da produção.",
  augusto_r6: "O Seu Augusto contou que vizinhos ouviram cantoria vinda do segundo andar da escola, mesmo com o prédio trancado.",
  augusto_r7: "O Seu Augusto soube que o Lucas foi visto parado na estrada do norte, olhando para o nada.",
  augusto_r8: "O Seu Augusto ouviu dizer que o amuleto estranho do Seu Tomás esquenta perto de certas pessoas.",
  augusto_r9: "O Seu Augusto viu uma aluna andando de olhos parados pela avenida da Zona Leste, como se alguém a guiasse.",
  augusto_r10: "O Seu Augusto soube de luzes fracas à noite no bairro destruído do norte, como um desenho brilhando no chão.",
  augusto_r11: "O Seu Augusto ouviu um apito de trem de madrugada perto da estação do leste, parada há anos.",
  augusto_r12: "O Seu Augusto contou que gente de fora está chegando na cidade e ficando em casas fechadas.",
  augusto_r13: "O Seu Augusto soube que viram luz de vela no andar de cima da mansão da Zona Oeste.",
  augusto_r14: "O Seu Augusto disse que o bairro está trancando as portas: dizem que amanhã é a grande noite.",
  torneio_arena: "A Millena descobriu que o torneio vai acontecer na arena da Oeste 2, na planície onde o Simon e o pessoal treinam. Haverá 32 participantes e confrontos eliminatórios.",
  torneio_inscricao: "O torneio do dia 15 tem 32 participantes e chaveamento eliminatório. Cada luta acontece no ringue; força, velocidade, defesa, técnica e sorte influenciam os resultados. Os vencedores avançam até a final.",
  torneio_virada: "Depois da final do torneio, o Zé revelou a verdade: o torneio nunca foi apenas sobre lutas. A energia de quem assistia estava sendo sugada da arquibancada. Ele chamou as Sentinelas e a multidão fugiu.",
  torneio_fim: "Derrotei as Sentinelas e a multidão escapou sem ferimentos graves. O Zé sumiu na fumaça, mas a energia que ele recolheu foi para algum lugar. Isso ainda não acabou.",
  chave_mansao:        "Achei a chave da mansão numa gaveta da mesa da sala de controle da fábrica. A porta da mansão, na Zona Oeste, está trancada com uma corrente.",
  zona_norte:          "Ao norte da cidade fica um bosque antigo, com uma cabana, um cemitério, ruínas e uma capela na colina. É um lugar silencioso, mas algo parece errado.",
  zona_norte2:         "Depois do bosque fica a Zona Norte 2, um bairro devastado, com casas destruídas e ruas cobertas de escombros. Não há moradores por perto.",
  norte2_familias:     "Na Zona Norte 2 achei brinquedos, uma foto riscada, um diário de criança, um símbolo pintado na porta e uma lista de famílias riscada. Esse bairro não foi destruído por acidente: alguém o esvaziou de propósito.",
  norte2_marca1:       "A Nathalia viu, à noite, um símbolo brilhando na rua da Zona Norte 2: um círculo cortado por três linhas, o mesmo da porta de uma das casas.",
  norte2_marca2:       "Outra marca na avenida da Zona Norte 2, também só visível à noite. As linhas apontam para o sudeste.",
  norte2_marca3:       "A terceira marca confirma: as três apontam para as ruínas do sudeste da Zona Norte 2. Parece haver algo lá embaixo, que só se mostra de noite.",
  norte2_altar:        "Nas ruínas do sudeste da Zona Norte 2 havia um altar pequeno, guardado por uma criatura. A seita fazia seus rituais no meio do bairro. Deixei uma essência de lá comigo.",
  norte2_otavio:       "Seu Otávio, o último morador da Zona Norte 2, trabalhou na escola com o Durval. Ele viu o Durval medir os alunos e anotar as famílias compatíveis antes de elas sumirem. O Durval ainda mexe na escola à noite, sozinho.",
  leste2_trem:         "No Leste 2, a bilheteria, o painel e o cofre da estação contam a mesma história: o último trem chegou como 'carga especial' e o horário seguinte é um trem especial no dia 15, com lugar para quarenta convidados de fora. Alguém prepara o torneio há muito tempo.",
  leste2_passageiros:  "O Zeca, que se esconde no galpão laranja do Leste 2, via jovens descerem do trem à noite e nunca mais serem vistos. Achei os crachás de Rafa, Duda e Gaby. Eram levados em fila para o Bairro Sul.",
  sul_passageiros:     "Debaixo da casa vazia do Bairro Sul havia um porão da seita: camas com algemas, um livro de presença com dezenas de nomes (Rafa, Duda e Gaby entre eles) e um mapa que liga o porão à escola. Os jovens eram guardados ali antes de serem levados.",
  altar_caos:          "No altar da capela da colina está escrito: o Caos tem fome e dez sacrifícios o saciam, com a essência dos espíritos do bosque. Oferecer ou não é escolha minha.",
  altar_caos_saciado:  "Ofereci os dez sacrifícios ao altar do Caos. Uma voz respondeu: \"Você voltará. Todos voltam.\"",
  lucas_sabe:          "O Lucas já sabia da seita, do torneio e do Caos. Por isso treina tanto. Ele me pediu cuidado com qualquer pessoa, até com a Isabela.",
  zona_leste:          "A avenida continua para o leste, na Zona Leste: ferro-velho, pátio de contêineres e uma fábrica abandonada. É uma área perigosa.",
  zona_leste2:         "Mais a leste fica o Leste 2, com uma estação ferroviária desativada, depósitos e abrigos improvisados de sobreviventes.",
  gaby_controlada:     "Na Zona Leste, a Gaby, uma aluna da escola, me atacou. Os olhos dela estavam vazios: a Isabela mandou ela me encontrar e está controlando a mente dela.",
  gaby_livre:          "Coloquei o amuleto estranho do Seu Tomás na Gaby e ela voltou ao normal. Disse que a Isabela quer que a entidade volte, foi avisar os pais e me deu um livro de magia.",
  gaby_morta:          "A Isabela controlava a Gaby, e eu a matei na Zona Leste. Ela não vai voltar.",
  livro_sangue:        "O livro de magia da Gaby só pode ser entendido por quem tem sangue sagrado, descendente dos cinco guerreiros. Eu consigo ler porque sou descendente do Perroti Dellalos.",
  livro_controle:      "Primeira página do livro, \"Quebrar o Elo\": quem controla uma mente deixa um fio preso nela. Com sangue sagrado dá para cortar o fio sem ferir a vítima.",
  livro_olho:          "O livro traduziu o olho no círculo, símbolo da seita: \"Ele vê quem o serve\".",
  livro_lua:           "O livro traduziu a lua dos marcos de pedra da Zona Norte: \"a hora da entrega\". Os sacrifícios são feitos à noite.",
  livro_espiral:       "O livro traduziu a espiral dos marcos de pedra: \"o que cai não sobe\". É a marca do hospedeiro, quem o Caos toma.",
  livro_altar:         "O livro traduziu o altar do Caos: saciar o Caos não o enfraquece, só o aproxima.",
  zona_oeste:          "A avenida também segue para o oeste, na Zona Oeste: uma praça, um bairro residencial, lojas, um terminal de ônibus, uma mansão abandonada e uma instalação cercada, com uma escada que desce para baixo da terra.",
  zona_oeste2:         "Uma planície enorme e plana, sem construções, moradores ou inimigos. Um espaço silencioso para explorar.",
  orlando_fabrica:     "O Orlando, vigia da fábrica, ouve máquinas funcionando à noite lá dentro, mesmo com ela fechada há anos.",
  orlando_engrenagens: "O portão da fábrica só abre com 3 engrenagens. O Orlando perdeu todas e me pediu para procurá-las.",
  nando_limpeza:       "O Nando, catador de sucata, quer o terreno livre de ratos e robôs. Em troca, tem uma engrenagem.",
  fabrica_dia5:        "O Capataz Mecânico disse que a fábrica tem um pedido com entrega final no dia 5. Por que esse dia de novo?",
  ordem_fabrica:       "Na sala de controle da fábrica achei uma ordem de produção: equipamentos para o evento da escola, prazo final no dia 5, cliente sem registro.",
  simon_procura:       "O Simon faltou à escola. Ele está no Bairro Sul procurando um amigo chamado Deriky.",
  seita_caos:          "O Deriky e o Simon contaram que o torneio é um plano de uma seita: eles querem roubar a energia vital dos jovens para alimentar o Caos, a entidade que a seita adora.",
  chave_diretora:      "Os alunos têm teorias de que há coisas estranhas na sala 1A. A chave só fica com a diretora, que mora no Bairro Sul.",
  mariana_1a:          "Na sala 1A havia uma menina chamada Mariane. Ela disse que não podíamos estar lá e que íamos morrer ali mesmo.",
  meninos_seita:       "A Nathalia contou que o grupo dos meninos também está envolvido na seita, principalmente o Lucas.",
  acordo_tres:         "Eu, a Millena e a Nathalia fizemos um acordo: tudo que uma descobrir, conta para as outras duas.",
  pista_simbolo:       "Um símbolo riscado na calçada do Bairro Sul: um círculo com um olho no meio. A Nathalia acha que já viu igual na escola.",
  pista_riscos_1a:     "Riscos finos no chão, perto da porta da 1A, como se alguém tivesse tentado abrir a sala ou arrastado algo pesado.",
  pista_pegadas:       "Pegadas recentes no pó da casa vazia do Bairro Sul. Alguém esteve ali há pouco tempo.",
  pista_cartaz:        "Um pedaço de cartaz rasgado do torneio, preso entre as pedras da estrada.",
  espiou_2b:           "Pela fresta da 2B: cadeiras empilhadas e um quadro coberto por um pano.",
  espiou_3b:           "Pela fresta da 3B: uma luz fraca acesa lá dentro, mesmo com a porta trancada.",
  thaina_caos_lucas:   "A Thaina me contou que o Caos precisava de um corpo para entrar neste mundo e achou o hospedeiro perfeito: o Lucas. Almas sacrificadas num altar fortalecem o Caos dentro dele, para dominar o corpo do Lucas de vez.",
  thaina_isabela_mente:"A Thaina disse que a Isabela consegue controlar mentes e usa as pessoas para o plano dela se concretizar.",
  thaina_pedido:       "A Thaina pediu que eu descubra onde o Lucas está e diga a ele para nunca mais voltar para a escola. Ela não quer que ninguém saiba que falou comigo.",
  isabela_altar:       "A Isabela sumiu da escola. Ela está do lado de fora da capela, na colina da Zona Norte, perto do altar.",
  isabela_traicao:     "A Isabela disse que nem nas amizades de infância dá para confiar, e que a Thaina já recebeu a recompensa dela.",
  isabela_controle_dia:"A Isabela me controlou por um dia inteiro. Eu maltratei, humilhei e bati em todos. Hoje ninguém quer conversar comigo, e toda a amizade que eu tinha voltou ao começo.",
  caos_oeste_luta:     "O 'Lucas' que achei na Zona Oeste não era o Lucas: era o Caos, no corpo dele. Ele agradeceu pelas almas, lutou comigo até eu ficar com 1 coração e disse que eu viveria por mais algum tempo. Preciso falar com os amigos do Lucas.",
  caos_oeste_sem:      "O 'Lucas' que achei na Zona Oeste não era o Lucas: era o Caos, no corpo dele. Ele zombou de mim e foi embora. Preciso falar com os amigos do Lucas.",
  mariana_norte:       "Encontrei a Mariane na Zona Norte. Ela disse que o que está acontecendo é consequência dos pecados das famílias Dellalos e que é descendente de Luiz Inácio e Renan Santos, com o sangue sagrado dobrado. Uma voz a chamou e ela foi embora.",
  lucas_amigos_sabiam: "O Vitinho e o Simon já sabiam do Caos no Lucas: várias vezes o Caos tomou o controle do corpo dele.",
  deriky_lucas_luta:   "O Deriky contou que, quando o Caos controlou o Lucas, o grupo inteiro lutou contra ele e perdeu. Por sorte o Lucas voltou ao normal. Quando o Caos acorda, ele se afasta de todos.",
  aviso_isabela:       "Os dois mandaram eu tomar cuidado com todo mundo, e muito mais com a Isabela. Disseram que é melhor eu não saber o motivo."
};

function resetarDiario() {
  diario.conhecidos = {}; diario.infos = {}; diario.docs = {}; diario.escolhas = {}; diario.fim = {};
}

// Aplica o que veio do save; campo ausente = valor padrão (vazio)
function aplicarDiario(d) {
  resetarDiario();
  if (!d || typeof d !== "object") return;
  for (const campo of ["conhecidos", "infos", "docs", "escolhas", "fim"]) {
    const origem = d[campo];
    if (origem && typeof origem === "object") {
      for (const k in origem) diario[campo][k] = origem[k];
    }
  }
}

// Save de quando o nome ainda era "Derick": passa tudo para "Deriky"
function migrarNomeDeriky() {
  const c = diario.conhecidos, i = diario.infos, e = diario.escolhas;
  if (c.Derick) { c.Deriky = true; delete c.Derick; }
  if (i.derick_aviso) { i.deriky_aviso = true; delete i.derick_aviso; }
  if (e.derickDia !== undefined) { e.derikyDia = e.derickDia; delete e.derickDia; }
  if (e.derick_resposta !== undefined) { e.deriky_resposta = e.derick_resposta; delete e.derick_resposta; }
}

// Save de antes do diário existir: reconstrói o registro a partir da história que já foi salva
function migrarDiarioAntigo() {
  if (historia.conheceuMillena)   diario.conhecidos.Millena = true;
  if (historia.conheceuMorador)   diario.conhecidos.Morador = true;
  if (historia.conheceuEstudante) diario.conhecidos.Estudante = true;
  if (historia.chegouEmCasa)      diario.infos.primeiro_dia = true;
  if (historia.recebeuChaveQuarto) diario.infos.chave_papai = true;
}

function conhecePersonagem(nome) { return !!diario.conhecidos[nome]; }

function registrarConhecido(nome) {
  if (!nome || diario.conhecidos[nome]) return;
  diario.conhecidos[nome] = true;
  if (AMIGOS[nome]) amizadeGanhar(nome, ptsConhecer(nome), "conhecer_" + nome);   // amizade (js/amizade.js)
  sinalizarMissao();                       // bolinha "!" no 🎒
}

function descobrirInfo(id) {
  if (!id || !INFOS[id] || diario.infos[id]) return;
  diario.infos[id] = true;
  sinalizarMissao();
}

function registrarDocumento(id) {
  if (!id || diario.docs[id]) return;
  diario.docs[id] = true;
  sinalizarMissao();
}

// ---------- Abas do painel (Mochila | Diário | Relacionamentos) ----------
function mostrarAba(nome) {
  const mochila = document.getElementById("abaMochila");
  const dia = document.getElementById("abaDiario");
  const rel = document.getElementById("abaRelacionamento");
  const bm = document.getElementById("abaBtnMochila");
  const bd = document.getElementById("abaBtnDiario");
  const br = document.getElementById("abaBtnRelacionamento");
  if (!mochila || !dia || !rel) return;
  const noDiario = nome === "diario";
  const nosRelacionamentos = nome === "relacionamento";
  mochila.hidden = noDiario || nosRelacionamentos;
  dia.hidden = !noDiario;
  rel.hidden = !nosRelacionamentos;
  bm.classList.toggle("ativa", !noDiario && !nosRelacionamentos);
  bd.classList.toggle("ativa", noDiario);
  br.classList.toggle("ativa", nosRelacionamentos);
  document.getElementById("inventarioTitulo").textContent = nosRelacionamentos ? "RELACIONAMENTOS" : noDiario ? "DIÁRIO" : "INVENTÁRIO";
  if (noDiario) renderizarDiario();
  if (nosRelacionamentos) renderizarRelacionamentos();
}

function _secao(pai, titulo) {
  const h = document.createElement("h3");
  h.className = "dia-titulo";
  h.textContent = titulo;
  pai.appendChild(h);
}
function _linha(pai, texto, classe) {
  const p = document.createElement("p");
  p.className = "dia-linha" + (classe ? " " + classe : "");
  p.textContent = texto;
  pai.appendChild(p);
  return p;
}

function _blocoMissao(pai, m, feita) {
  const div = document.createElement("div");
  div.className = "missao" + (feita ? " feita" : "");
  const t = document.createElement("p");
  t.className = "missao-titulo";
  t.textContent = (feita ? "✔ " : "") + m.titulo;
  div.appendChild(t);
  if (!feita) {
    const d = document.createElement("p");
    d.className = "missao-desc";
    d.textContent = m.descricao;
    div.appendChild(d);
    for (const o of m.objetivos || []) {
      const ok = !!o.ok();
      _linha(div, (ok ? "☑ " : "☐ ") + o.texto, ok ? "feito" : "");
    }
  }
  pai.appendChild(div);
}

function renderizarDiario() {
  const caixa = document.getElementById("abaDiario");
  if (!caixa) return;
  caixa.replaceChildren();

  const ativas = MISSOES.filter((m) => missaoLiberada(m) && !missaoConcluida(m));
  const feitas = MISSOES.filter((m) => missaoConcluida(m));

  _secao(caixa, "MISSÕES ATIVAS");
  if (ativas.length) ativas.forEach((m) => _blocoMissao(caixa, m, false));
  else _linha(caixa, "Nenhuma no momento.", "vazio");

  _secao(caixa, "MISSÕES CONCLUÍDAS");
  if (feitas.length) feitas.forEach((m) => _blocoMissao(caixa, m, true));
  else _linha(caixa, "Nenhuma ainda.", "vazio");

  renderizarAmizades(caixa);              // pontos de amizade e companheiro (js/amizade.js)

  _secao(caixa, "PERSONAGENS CONHECIDOS");
  const nomes = ["Dellalos"].concat(Object.keys(diario.conhecidos).filter((n) => n !== "Dellalos"));
  nomes.forEach((n) => {
    const p = PERSONAGENS[n];
    _linha(caixa, n + (p ? " - " + p.descricao : ""));
  });

  _secao(caixa, "INFORMAÇÕES DESCOBERTAS");
  const infos = Object.keys(diario.infos).filter((id) => INFOS[id]);
  if (infos.length) infos.forEach((id) => _linha(caixa, "• " + INFOS[id]));
  else _linha(caixa, "Nada ainda.", "vazio");

  _secao(caixa, "DOCUMENTOS");
  const docs = Object.keys(diario.docs).filter((id) => ITENS[id] && ITENS[id].documento);
  if (docs.length) {
    docs.forEach((id) => {
      const d = ITENS[id].documento;
      _linha(caixa, d.titulo, "dia-doc-titulo");
      d.texto.forEach((t) => _linha(caixa, t, "dia-doc"));
    });
  } else _linha(caixa, "Nenhum ainda.", "vazio");
}

document.getElementById("abaBtnMochila").addEventListener("click", () => mostrarAba("mochila"));
document.getElementById("abaBtnDiario").addEventListener("click", () => mostrarAba("diario"));
document.getElementById("abaBtnRelacionamento").addEventListener("click", () => mostrarAba("relacionamento"));


// Lista social separada do Diário. Só inclui personagens já conhecidos pela Dellalos.
function renderizarRelacionamentos() {
  const caixa = document.getElementById("abaRelacionamento");
  if (!caixa) return;
  caixa.replaceChildren();

  // Painel romântico v61: mostra os pares autorizados e os acontecimentos já registrados.
  if (typeof romanceListar === "function") {
    const tituloRomance = document.createElement("h3"); tituloRomance.className = "dia-titulo"; tituloRomance.textContent = "❤️ ROMANCES E SENTIMENTOS"; caixa.appendChild(tituloRomance);
    const legenda = document.createElement("p"); legenda.className = "relacao-detalhes"; legenda.textContent = "Amizade, confiança, interesse romântico, ciúmes e mágoa são indicadores diferentes. Possibilidade não significa romance garantido."; caixa.appendChild(legenda);
    const estados = {conhecendo:"Se conhecendo",aproximacao:"Aproximação",sentimentos_escondidos:"Sentimentos escondidos",sentimentos_emergentes:"Sentimentos surgindo",confissao_pendente:"Confissão possível",triangulo_em_potencial:"Triângulo em potencial",namoro:"Namorando",crise:"Crise amorosa",terminado:"Relacionamento encerrado"};
    const pares = romanceListar();
    pares.forEach(p => {
      const card = document.createElement("section"); card.className = "relacao-card romance-card";
      const h = document.createElement("h4"); h.textContent = p.a + " ♥ " + p.b; card.appendChild(h);
      const st = document.createElement("p"); st.className = "relacao-status"; st.textContent = estados[p.estado] || "Sentimentos indefinidos"; card.appendChild(st);
      const linhas = [[p.a, Number(p.interesseA)||0],[p.b,Number(p.interesseB)||0]];
      linhas.forEach(([nome,valor]) => {
        const lab = document.createElement("p"); lab.className = "relacao-detalhes"; lab.textContent = "Interesse de " + nome + ": " + Math.round(valor) + "/100"; card.appendChild(lab);
        const barra = document.createElement("div"); barra.className = "relacao-barra romance-barra"; const fill = document.createElement("div"); fill.style.width = Math.max(0,Math.min(100,valor))+"%"; barra.appendChild(fill); card.appendChild(barra);
      });
      const info = document.createElement("p"); info.className = "relacao-detalhes"; info.textContent = "Encontros registrados: " + (Number(p.encontros)||0) + " · Confiança média: " + Math.round((Number(p.confiancaA||0)+Number(p.confiancaB||0))/2) + "/100"; card.appendChild(info);
      const ciumes = document.createElement("p"); ciumes.className = "relacao-detalhes"; ciumes.textContent = "Ciúmes — " + p.a + ": " + Math.round(Number(p.ciumesA)||0) + "/100 · " + p.b + ": " + Math.round(Number(p.ciumesB)||0) + "/100"; card.appendChild(ciumes);
      if (p.segredo) { const segredo = document.createElement("p"); segredo.className = "relacao-evento"; segredo.textContent = p.casoDescoberto ? "Um envolvimento secreto foi descoberto e abalou a confiança." : "Existe um envolvimento ou segredo ainda não esclarecido."; card.appendChild(segredo); }
      if (p.ultimoEvento) { const ev = document.createElement("p"); ev.className = "relacao-evento"; ev.textContent = "Último acontecimento: " + p.ultimoEvento; card.appendChild(ev); }
      caixa.appendChild(card);
    });
    const historico = typeof romanceHistorico === "function" ? romanceHistorico().slice(-5).reverse() : [];
    if (historico.length) { const ht=document.createElement("h3");ht.className="dia-titulo";ht.textContent="ÚLTIMOS ACONTECIMENTOS ROMÂNTICOS";caixa.appendChild(ht);historico.forEach(e=>_linha(caixa,"Dia "+e.dia+": "+e.descricao,"relacao-evento")); }
  }

  const titulo = document.createElement("h3"); titulo.className = "dia-titulo"; titulo.textContent = "PESSOAS QUE VOCÊ CONHECEU"; caixa.appendChild(titulo);
  const nomes = Object.keys(diario.conhecidos).filter(n => n && n !== "Dellalos").sort((a,b)=>a.localeCompare(b,"pt-BR"));
  if (!nomes.length) { _linha(caixa, "Você ainda não conheceu ninguém. Converse com os NPCs para adicioná-los aqui.", "vazio"); return; }
  nomes.forEach(nome => {
    const dados = typeof relacaoPainelCompleto === "function" ? relacaoPainelCompleto(nome) : (typeof relacaoPerfilPessoa === "function" ? relacaoPerfilPessoa(nome) : { amizade: typeof amizadePontos === "function" ? amizadePontos(nome) : 0, confianca:50, ciumes:0, ressentimento:0, status:"Ainda estão se conhecendo" });
    const bloco=document.createElement("section"); bloco.className="relacao-card";
    const h=document.createElement("h4"); h.textContent=nome; bloco.appendChild(h);
    const status=document.createElement("p"); status.className="relacao-status"; status.textContent=dados.status; bloco.appendChild(status);
    const amizade=Number(dados.amizade)||0;
    const label=document.createElement("p"); label.textContent="Afinidade com Dellalos: "+amizade+"/100"; bloco.appendChild(label);
    const barra=document.createElement("div"); barra.className="relacao-barra"; const fill=document.createElement("div"); fill.style.width=Math.max(0,Math.min(100,amizade))+"%"; barra.appendChild(fill); bloco.appendChild(barra);
    const detalhe=document.createElement("p"); detalhe.className="relacao-detalhes"; detalhe.textContent="Confiança: "+dados.confianca+"/100 · Ciúmes: "+dados.ciumes+"/100 · Mágoa: "+(dados.magoa===undefined?dados.ressentimento:dados.magoa)+"/100"; bloco.appendChild(detalhe);
    if (dados.interesseRomantico !== undefined && dados.interesseRomantico > 0) {
      const romance=document.createElement("p"); romance.className="relacao-detalhes"; romance.textContent="Interesse romântico registrado: "+Math.round(dados.interesseRomantico)+"/100 · "+(dados.romanceEstado||"Em evolução"); bloco.appendChild(romance);
      const rb=document.createElement("div"); rb.className="relacao-barra romance-barra"; const rf=document.createElement("div"); rf.style.width=Math.max(0,Math.min(100,dados.interesseRomantico))+"%"; rb.appendChild(rf); bloco.appendChild(rb);
    }
    if (dados.ultimoEvento) { const evento=document.createElement("p"); evento.className="relacao-evento"; evento.textContent="Último acontecimento: "+dados.ultimoEvento; bloco.appendChild(evento); }
    caixa.appendChild(bloco);
  });
}
