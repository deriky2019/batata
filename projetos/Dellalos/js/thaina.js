/* =====================================================
   thaina.js - DIA_THAINA (hoje o dia 7): "O que a Thaina escondia"
   HISTÓRIA (escrita até o passo 4; os passos 5 e 6 ainda vão ser escritos)
     1) CONVITE: no dia 7 a Thaina, na 3C, fria como sempre, sussurra um recado: Zona Norte, nos marcos de pedra, sozinha.
     2) ENCONTRO: ela espera na clareira da fonte (Zona Norte). Revela que o Caos precisava de um corpo para entrar neste
        mundo e achou o hospedeiro perfeito: o Lucas. Há pessoas sacrificadas (almas) num altar, para o Caos ficar mais forte
        no corpo do Lucas e dominá-lo. Revela também que a Isabela controla mentes e usa as pessoas para o plano dela.
     3) PEDIDO: a Thaina pede que a Dellalos descubra onde o Lucas está e diga a ele para nunca mais voltar à escola.
        Depois ela vai embora andando (não pode ser vista com a Dellalos).
     4) PROCURAR O LUCAS: o Lucas sumiu da escola. Os amigos dele (Vitinho e Simon) contam que já sabiam: o Caos já tomou o
        controle do corpo dele várias vezes. O Deriky (volta ao Bairro Sul) conta que, quando o Caos controlou o Lucas, o grupo
        inteiro lutou contra e perdeu; por sorte o Lucas voltou ao normal. Ele dá a pista de onde o Lucas se esconde (LUCAS_PISTA).
     5) ACHAR O "LUCAS": na Zona Oeste, no jardim da mansão abandonada. Não é o Lucas: é o Caos, no corpo dele (sprite Caos.png).
        Ele zomba da Dellalos. Se ela já ofereceu pelo menos 1 essência ao altar (sacrificiosFeitos() >= 1), ele agradece pelas almas e LUTA.
     6) A LUTA: a Dellalos não vence. Acaba quando ela fica com 1 coração. O Caos diz que ela viverá por mais algum tempo e some.
        A missão termina com a Dellalos anotando no diário que precisa falar com os amigos do Lucas.  -> historia.thainaFim
        (Sem nenhuma essência no altar não há luta: o Caos zomba, diz que ela ainda não vale o esforço e some. Mesmo final.)

   FLAGS (em historia, salvas): thainaConvidou, thainaPediu, lucasVitinhoFalou, lucasSimonFalou, derikyLucasFalou,
     sabeOndeLucas (= fim do passo 4), thainaFim (= fim da missão, passo 6), avisouMissaoThaina

   ONDE LIGA NOS OUTROS ARQUIVOS (só linhas pequenas)
     js/salas/aulas.js     Thaina na 3C: thainaConvite()
     js/salas/escola.js    Lucas some (lucasForaDaEscola) | Vitinho e Simon: amigoLucasFala()
     js/salas/bairrosul.js Deriky volta (derikyVoltou, derikyConversaLucas)
     js/simon.js           derikyNoSul inclui derikyVoltou
     js/missoes.js         missão secundária "O que a Thaina escondia"
     js/dias.js            DIA_THAINA, não deixa dormir antes do passo 4, cartão da rotina
     js/diario.js          INFOS novas   |   Thaina no norte: CENAS.zona_norte.npcs (no fim deste arquivo)
   ===================================================== */

// Onde o "Lucas" está (pista do Deriky). É o Caos, no jardim da mansão da Zona Oeste (passos 5 e 6, no fim deste arquivo).
const LUCAS_PISTA = "Zona Oeste, no jardim da mansão abandonada";

let thainaSaindo = false;      // só durante a caminhada de saída (não precisa salvar)

// O Lucas não aparece mais na escola: no dia 7 inteiro e, depois do pedido da Thaina, para sempre
function lucasForaDaEscola() { return diaAtual() === DIA_THAINA || !!historia.thainaPediu; }

// O Deriky volta ao Bairro Sul depois do pedido da Thaina, até contar do Lucas
function derikyVoltou() { return !!historia.thainaPediu && !historia.derikyLucasFalou; }

// ----- Diálogos (textos PROVISÓRIOS: ajuste com a história original) -----
DIALOGOS.thainaNorte = {
  // 1) Na 3C, no dia 7. A Isabela está ao lado: a Thaina fala baixo
  convite: [
    { quem: "Thaina",   texto: "...Prepare-se para o dia do torneio." },
    { quem: "Thaina",   texto: "(baixinho) Zona Norte. Nos marcos de pedra da clareira. Vá sozinha." },
    { quem: "Dellalos", texto: "(baixinho) O que está acontecendo?" },
    { quem: "Thaina",   texto: "(baixinho) Não olhe para a Isabela. Só vá." }
  ],
  conviteLembrar: [
    { quem: "Thaina", texto: "(baixinho) Zona Norte. Marcos de pedra. Sozinha." }
  ],
  // 2 e 3) Na clareira da fonte, Zona Norte
  encontro: [
    { quem: "Thaina",   texto: "Você veio. E sozinha." },
    { quem: "Dellalos", texto: "Por que aqui? E por que você estava agindo daquele jeito?" },
    { quem: "Thaina",   texto: "Porque aqui a Isabela não vê. Escute, porque eu só consigo falar isto uma vez." },
    { quem: "Thaina",   texto: "O Caos não é só uma ideia da seita. Ele precisava de um corpo para entrar neste mundo." },
    { quem: "Thaina",   texto: "E achou o hospedeiro perfeito: o Lucas.", info: "thaina_caos_lucas" },
    { quem: "Dellalos", texto: "O Lucas? Mas ele é..." },
    { quem: "Thaina",   texto: "Forte. Por isso ele serve. Existem pessoas sacrificadas, almas num altar, para o Caos ficar mais forte dentro do corpo do Lucas." },
    { quem: "Thaina",   texto: "Quando ele estiver forte o bastante, o Caos vai dominar o corpo dele de vez." },
    { quem: "Dellalos", texto: "E a seita deixa isso acontecer? Quem está por trás?" },
    { quem: "Thaina",   texto: "A Isabela consegue controlar mentes. Ela controla as pessoas para o plano dela se concretizar.", info: "thaina_isabela_mente" },
    { quem: "Dellalos", texto: "Controlar mentes... Então o torneio, o convite..." },
    { quem: "Thaina",   texto: "Pense em tudo o que ela te disse e em quem estava por perto. Depois me diga se foi escolha sua." },
    { quem: "Thaina",   texto: "Preciso que você descubra onde o Lucas está. Ele sumiu da escola." },
    { quem: "Thaina",   texto: "E quando achar... diga a ele para nunca mais voltar para a escola. Nunca mais.", info: "thaina_pedido" },
    { quem: "Dellalos", texto: "Eu vou achar. Pode deixar." },
    { quem: "Thaina",   texto: "Não conte a ninguém que falei com você. Se a Isabela souber, acabou para nós duas." }
  ],
  // 4) Os amigos do Lucas, na escola (dia 7, antes do pedido: ninguém fala do assunto)
  ausente: {
    vitinho: [
      { quem: "Dellalos", texto: "Vitinho, cadê o Lucas?" },
      { quem: "Vitinho",  texto: "Não veio hoje. Não pergunte mais, tá?" }
    ],
    simon: [
      { quem: "Dellalos", texto: "O Lucas não veio?" },
      { quem: "Simon",    texto: "Não. E hoje é melhor não falar dele." }
    ]
  },
  vitinho: [
    { quem: "Dellalos", texto: "Vitinho, preciso achar o Lucas. A Thaina me contou do Caos e do corpo dele." },
    { quem: "Vitinho",  texto: "...Então ela contou. Eu já sabia, Dellalos." },
    { quem: "Dellalos", texto: "Já sabia?! Desde quando?" },
    { quem: "Vitinho",  texto: "Faz tempo. Não é a primeira vez: várias vezes o Caos tomou o controle do corpo dele." },
    { quem: "Vitinho",  texto: "Cada vez ele demora mais para voltar. E some para ninguém ver.", info: "lucas_amigos_sabiam" },
    { quem: "Vitinho",  texto: "Fale com o Simon e com o Deriky. Eles estavam lá nas outras vezes." }
  ],
  vitinhoLembrar: [
    { quem: "Vitinho", texto: "Fale com o Simon e com o Deriky. Eles viram mais do que eu." }
  ],
  simon: [
    { quem: "Dellalos", texto: "Simon, você sabia que o Caos está no corpo do Lucas?" },
    { quem: "Simon",    texto: "Sabia. Todos nós sabíamos. Por isso eu e o Deriky estávamos escondidos no sul." },
    { quem: "Simon",    texto: "O Caos já tomou o controle dele várias vezes. Quem está perto precisa ter cuidado.", info: "lucas_amigos_sabiam" },
    { quem: "Dellalos", texto: "Onde ele fica quando isso acontece?" },
    { quem: "Simon",    texto: "Pergunte ao Deriky. Ele conhece o jeito do Lucas melhor que eu." }
  ],
  simonLembrar: [
    { quem: "Simon", texto: "Pergunte ao Deriky. Ele conhece o jeito do Lucas melhor que eu." }
  ],
  // 4) O Deriky no Bairro Sul (só depois de ouvir os dois amigos)
  derikyCedo: [
    { quem: "Deriky",   texto: "Dellalos. Se está atrás do Lucas, fale primeiro com os amigos dele." },
    { quem: "Deriky",   texto: "Eles viram mais do que eu e vão te contar. Depois volte aqui." }
  ],
  deriky: [
    { quem: "Dellalos", texto: "Deriky, o Vitinho e o Simon me contaram: o Caos já tomou o corpo do Lucas várias vezes." },
    { quem: "Deriky",   texto: "Foi isso mesmo. Da última vez ele perdeu o controle por inteiro." },
    { quem: "Deriky",   texto: "O grupo todo teve que lutar contra ele. Lutamos juntos... e perdemos." },
    { quem: "Dellalos", texto: "Perderam? Então como ele está aqui?" },
    { quem: "Deriky",   texto: "Sorte. Do nada o Lucas voltou ao normal. Não foi mérito nosso, e a sorte não dura para sempre.", info: "deriky_lucas_luta" },
    { quem: "Deriky",   texto: "Quando o Caos acorda, o Lucas foge para onde não machuque ninguém: " + LUCAS_PISTA + "." },
    { quem: "Dellalos", texto: "Então é lá que eu vou procurar." },
    { quem: "Deriky",   texto: "Vá preparada. Se o Caos estiver no comando, ele não vai te reconhecer." },
    { quem: "Deriky",   texto: "E outra coisa: a Isabela sumiu da escola. Eu a vi subindo a colina, para o lado da capela.", info: "isabela_altar" },
    { quem: "Deriky",   texto: "Se for lá, vá descansada e pronta para tudo. Dormir antes não é covardia." }
  ]
};

// ----- 1) Convite na 3C. Devolve true se abriu a conversa (a conversa normal não acontece) -----
function thainaConvite() {
  if (diaAtual() < DIA_THAINA || !historia.revelouSeita || historia.thainaPediu) return false;
  if (!historia.lucasZonaFim && !historia.thainaConvidou) return false;   // o treino do Lucas (Zona Leste) vem antes do recado da Thaina
  if (historia.thainaConvidou) { abrirDialogo(DIALOGOS.thainaNorte.conviteLembrar); return true; }
  abrirDialogo(DIALOGOS.thainaNorte.convite, function () {
    historia.thainaConvidou = true;
    avisarNovaSecundaria("thaina");     // "Nova missão: O que a Thaina escondia."
    sinalizarMissao();
  });
  return true;
}

// ----- 2 e 3) A Thaina, na clareira da fonte. Depois do pedido ela vai embora andando -----
function thainaNoNorte() { return (!!historia.thainaConvidou && !historia.thainaPediu) || thainaSaindo; }

function conversarThainaNorte() {
  const npc = npcDaCena("zona_norte", "Thaina");
  abrirDialogo(DIALOGOS.thainaNorte.encontro, function () {
    historia.thainaPediu = true;
    sinalizarMissao();
    mostrarMensagem("Agora descubra onde o Lucas está. Comece pelos amigos dele, na escola.");
    if (!npc) return;
    thainaSaindo = true;
    npcIrEmbora(npc, 28 * TILE + TILE / 2, 36 * TILE + 58, 110, function () { thainaSaindo = false; });   // sai pelo portão do bosque
  });
}

// ----- 4) Vitinho e Simon na escola. quem = "vitinho" ou "simon". Devolve true se abriu a conversa -----
function amigoLucasFala(quem) {
  if (diaAtual() < DIA_THAINA || !historia.revelouSeita || historia.sabeOndeLucas) return false;
  const D = DIALOGOS.thainaNorte;
  if (!historia.thainaPediu) {
    if (diaAtual() === DIA_THAINA) { abrirDialogo(D.ausente[quem]); return true; }
    return false;
  }
  const flag = quem === "vitinho" ? "lucasVitinhoFalou" : "lucasSimonFalou";
  if (historia[flag]) { abrirDialogo(D[quem + "Lembrar"]); return true; }
  abrirDialogo(D[quem], function () { historia[flag] = true; sinalizarMissao(); });
  return true;
}

// ----- 4) O Deriky, de volta ao Bairro Sul. Devolve true se abriu a conversa -----
function derikyConversaLucas() {
  if (!derikyVoltou()) return false;
  if (!historia.lucasVitinhoFalou || !historia.lucasSimonFalou) { abrirDialogo(DIALOGOS.thainaNorte.derikyCedo); return true; }
  abrirDialogo(DIALOGOS.thainaNorte.deriky, function () {
    historia.derikyLucasFalou = true;
    historia.sabeOndeLucas = true;               // fim do passo 4
    mostrarMensagem("Pista: o Lucas deve estar na " + LUCAS_PISTA + ".");
    sinalizarMissao();
    const deriky = npcDaCena("bairro_sul", "Deriky");   // ele vai embora andando, como depois da seita
    if (!deriky) return;
    derikySaindo = true;
    npcIrEmbora(deriky, 10 * TILE, 30 * TILE + 58, 105, function () { derikySaindo = false; });
  });
  return true;
}

// ----- A Thaina no bosque norte (CENAS.zona_norte ainda não tinha NPCs) -----
CENAS.zona_norte.npcs = (CENAS.zona_norte.npcs || []).concat([
  {
    nome: "Thaina",
    imagem: ["assets/Thaina.png", "assets/thaina.png", "assets/Thaina.jpg"],
    quadro: { linha: 0, coluna: 0 },
    andar: { raioX: 0, raioY: 0, velocidade: 0 },     // fica parada (e consegue andar embora no fim da cena)
    direcao: "baixo",
    x: 29 * TILE + TILE / 2, y: 22 * TILE + 58,       // clareira da fonte, entre a fonte e os bancos
    se: function () { return thainaNoNorte(); },
    conversar: conversarThainaNorte
  }
]);


/* =====================================================
   O ALTAR (depois do Deriky): a Isabela, a Thaina controlada e o dia perdido
   HISTÓRIA
     - Depois de falar com o Deriky, a Isabela some da escola. Ela está FORA da capela (praça da colina, Zona Norte), perto do altar.
     - Quando a Dellalos chega perto, a Isabela diz que nem nas amizades de infância dá para confiar, e que a Thaina já recebeu
       a recompensa dela. A Thaina surge TOTALMENTE CONTROLADA e luta com a Dellalos (duelo: acaba quando a Dellalos fica com
       1 coração OU quando a Thaina cai; ganhando ou perdendo, o resultado é o mesmo).
     - A Isabela ri e diz que vai se divertir muito. O dia passa como se a Dellalos tivesse dormido.
     - OPCIONAL: dá para dormir antes (o evento só acontece quando ela chega perto da capela).
     - CONSEQUÊNCIA: todo o progresso de amizade de todos volta a zero. Naquele dia, controlada pela Isabela, a Dellalos maltratou,
       humilhou e bateu em todos; no dia seguinte ninguém quer conversar com ela.
   FLAGS: altarIniciou, altarLutou, altarFim
   ===================================================== */

// A Isabela some da escola a partir do fim do passo 4
function isabelaForaDaEscola() { return !!historia.sabeOndeLucas; }
// E fica do lado de fora da capela, até o dia passar
function isabelaNoAltar() { return !!historia.sabeOndeLucas && !historia.altarFim; }

// A Thaina controlada (a mesma folha de sprite da Thaina; o NPC fica escondido e só serve de desenho para a luta)
const thainaControladaNpc = {
  nome: "Thaina",
  imagem: ["assets/Thaina.png", "assets/thaina.png", "assets/Thaina.jpg"],
  quadro: { linha: 0, coluna: 0 },
  andar: { raioX: 0, raioY: 0, velocidade: 0 },
  direcao: "baixo",
  x: 25 * TILE + TILE / 2, y: 13 * TILE + 58,
  se: function () { return false; },
  conversar: function () {}
};

TIPOS_INIMIGOS.thaina_ctrl = {           // duelo: a luta acaba quando a Dellalos fica com 1 coração OU quando a Thaina cai
  nome: "Thaina",
  largura: 52, altura: 92,
  vida: 12, velocidade: 150, deteccao: 4000, dano: 1,
  ia: "duelo", duelo: true, moedas: [0, 0],
  alcanceAviso: 140, avisoTempo: 0.4, investidaTempo: 0.28, investidaVelocidade: 450, descanso: 0.8,
  cor: "#6a3a7a", corEscura: "#2a1536",
  aoMorrer: function (i) { thainaFimDaLuta(i); }
};

DIALOGOS.thainaAltar = {
  isabela: [
    { quem: "Isabela",  texto: "Você demorou, Dellalos. Eu já estava com saudade." },
    { quem: "Dellalos", texto: "Isabela! Você sumiu da escola. O que está fazendo aqui, perto do altar?", info: "isabela_altar" },
    { quem: "Isabela",  texto: "Cuidando do que importa. E você, ouvindo muita gente, não é?" },
    { quem: "Isabela",  texto: "Mas nem nas amizades de infância dá para confiar. Pergunte à Thaina.", info: "isabela_traicao" },
    { quem: "Dellalos", texto: "O que você fez com ela?" },
    { quem: "Isabela",  texto: "A Thaina já recebeu a recompensa dela. Agora é a sua vez, Dellalos." },
    { quem: "Isabela",  texto: "Thaina, querida. Mostre à nossa amiga como é." }
  ],
  fimPerdeu: [
    { quem: "Thaina",   texto: "..." },
    { quem: "Isabela",  texto: "Ha ha ha! Que cena linda. Você caiu e ela nem piscou." },
    { quem: "Isabela",  texto: "Eu vou me divertir muito com você, Dellalos. Muito." }
  ],
  fimVenceu: [
    { quem: "Thaina",   texto: "..." },
    { quem: "Isabela",  texto: "Ha ha ha! Você venceu a Thaina. Tão corajosa... e tão inútil." },
    { quem: "Isabela",  texto: "Mas valeu a pena. Vou me divertir muito com você, Dellalos. Muito." }
  ],
  // Manhã seguinte: a Dellalos acorda sem lembrar
  depois: [
    { quem: "Dellalos", texto: "...Minha cabeça. Acordei perto da capela. Não lembro de quase nada daquele dia." },
    { quem: "Dellalos", texto: "Mas os outros lembram. A Isabela me controlou e, por um dia inteiro, eu maltratei, humilhei e bati em todos.", info: "isabela_controle_dia" },
    { quem: "Dellalos", texto: "Ninguém quer conversar comigo hoje. Vou ter que começar do zero com cada um deles." }
  ]
};

// Perto da capela: a Isabela fala (ou ao conversar com ela). Verificada a cada quadro por verificarMissoes (js/missoes.js).
function iniciarEventoAltar() {
  if (!isabelaNoAltar() || historia.altarIniciou) return;
  abrirDialogo(DIALOGOS.thainaAltar.isabela, function () {
    historia.altarIniciou = true;
    mostrarMensagem("A Thaina está controlada! Lute (botão A). A luta acaba se você ficar com 1 coração.");
    surgirThainaControlada();
  });
}

function surgirThainaControlada() {
  jogador.vida = jogador.vidaMax;           // luta justa: começa com a vida cheia
  jogador.invulneravel = 1.5;
  const i = criarInimigo("thaina_ctrl", thainaControladaNpc.x, thainaControladaNpc.y, 0);
  i.npc = thainaControladaNpc;
  i.estado = "descanso"; i.espera = 1.2;    // um instante para a Dellalos se preparar
  posicionarInimigoLivre(i);
  inimigos.push(i);
}

// Devolve true se abriu alguma conversa neste quadro
function verificarEventoAltar() {
  if (idDaCena(cenaAtual) !== "zona_norte" || !isabelaNoAltar() || historia.altarLutou) return false;
  if (!historia.altarIniciou) {
    const dx = jogador.x - (28 * TILE + TILE / 2), dy = jogador.y - (13 * TILE + 58);
    if (Math.hypot(dx, dy) > 5 * TILE) return false;          // só quando chega perto da capela
    iniciarEventoAltar();
    return true;
  }
  // Saiu da cena no meio da luta: ela recomeça quando volta
  if (!inimigos.some((i) => i.tipoId === "thaina_ctrl")) surgirThainaControlada();
  return false;
}

// Chamado por aoMorrer do tipo thaina_ctrl (ela caiu OU a Dellalos chegou a 1 coração): o resultado é o mesmo
function thainaFimDaLuta() {
  historia.altarLutou = true;
  const perdeu = jogador.vida <= 1;
  jogador.invulneravel = 3;
  abrirDialogo(perdeu ? DIALOGOS.thainaAltar.fimPerdeu : DIALOGOS.thainaAltar.fimVenceu, function () {
    iniciarTelaTempo("Mais tarde...", function () {
      historia.altarFim = true;
      perderAmizades();
      comecarProximoDia();                                    // o dia passa como se tivesse dormido (js/dias.js)
      abrirDialogo(DIALOGOS.thainaAltar.depois, function () {
        mostrarMensagem("Todas as amizades voltaram ao começo.");
      });
    }, 3);
  });
}

// Consequência: a Dellalos perde todo o progresso de amizade com todos (pontos, níveis, falas vistas e missões pessoais)
function perderAmizades() {
  const a = AM();
  a.pontos = {}; a.feito = {}; a.dia = {}; a.visto = {}; a.pessoal = {};
  a.comp = "";                      // ninguém quer andar com ela
  companheiro = null;
  sinalizarMissao();
}

// ----- A Isabela, do lado de fora da capela (na praça da colina) -----
CENAS.zona_norte.npcs.push({
  nome: "Isabela",
  imagem: ["assets/Isabela.png", "assets/isabela.png", "assets/Isabela.jpg"],
  quadro: { linha: 0, coluna: 0 },
  andar: { raioX: 0, raioY: 0, velocidade: 0 },
  direcao: "baixo",
  x: 28 * TILE + TILE / 2, y: 13 * TILE + 58,
  se: function () { return isabelaNoAltar(); },
  conversar: function () { if (historia.altarIniciou) abrirDialogo([{ quem: "Isabela", texto: "Ha ha ha! Vai ser divertido." }]); else iniciarEventoAltar(); }
});
// o NPC escondido que desenha a Thaina na luta precisa existir na cena para o sprite carregar
CENAS.zona_norte.npcs.push(thainaControladaNpc);


/* =====================================================
   O "LUCAS" NA ZONA OESTE (passos 5 e 6): o Caos
   HISTÓRIA
     - Depois do Deriky (sabeOndeLucas), um "Lucas" espera no jardim da mansão abandonada, na Zona Oeste.
       Ele usa o sprite Caos.png (um Lucas sem camisa). A Dellalos pensa que é o Lucas, mas não é mais.
     - Ele zomba dela. Se ela já ofereceu pelo menos 1 essência de espírito ao altar, ele agradece pelas almas e os dois lutam.
       A Dellalos não vence: a luta vai até ela ficar com 1 coração (igual ao treino do Lucas e ao duelo da Thaina).
     - O Caos diz que ela ficará viva por mais algum tempo e vai embora. A missão acaba com a Dellalos anotando
       no diário que precisa falar com os amigos do Lucas.
     - SEM nenhuma essência no altar (suposição): não há luta. Ele zomba, diz que ela ainda não vale o esforço e some.
   FLAGS: caosOesteRevelou (se ela sair no meio da luta, volta direto para a luta), thainaFim (fim da missão)
   PARA MUDAR: a posição está em CAOS_X / CAOS_Y; as falas em DIALOGOS.caosOeste; a força dele em TIPOS_INIMIGOS.caos_oeste.
   ===================================================== */

const CAOS_X = 17 * TILE + TILE / 2, CAOS_Y = 12 * TILE + 58;     // jardim da mansão, logo depois do portão

DIALOGOS.caosOeste = {
  // Primeira conversa, COM pelo menos 1 essência oferecida ao altar: ele agradece e luta
  revelaComEssencia: [
    { quem: "Dellalos", texto: "Lucas! Finalmente te achei. A Thaina me pediu para te avisar: nunca mais volte para a escola." },
    { quem: "Lucas",    texto: "..." },
    { quem: "Dellalos", texto: "Lucas? Você está me ouvindo?" },
    { quem: "Lucas",    texto: "Lucas. Esse nome não é mais meu." },
    { quem: "Caos",     texto: "Ha ha ha! Você achou mesmo que ia encontrar o garoto?" },
    { quem: "Dellalos", texto: "Quem é você?" },
    { quem: "Caos",     texto: "Aquele que você andou alimentando, Dellalos. Cada espírito que você levou ao altar me deixou mais forte." },
    { quem: "Caos",     texto: "Obrigado pelas almas." },
    { quem: "Dellalos", texto: "Devolva o corpo do Lucas!" },
    { quem: "Caos",     texto: "Devolver? Este corpo é a minha porta neste mundo. Vamos ver se você é tão divertida quanto as almas." }
  ],
  // Ela saiu no meio da luta e voltou a falar com ele
  denovo: [
    { quem: "Caos", texto: "Voltou? Ótimo. Ainda não terminei com você." }
  ],
  // Fim da luta (ela ficou com 1 coração)
  fim: [
    { quem: "Dellalos", texto: "(ofegante) Eu... não consigo..." },
    { quem: "Caos",     texto: "Já chega. Não vou acabar com você agora." },
    { quem: "Caos",     texto: "Você ficará viva por mais algum tempo. Aproveite." },
    { quem: "Caos",     texto: "Até logo, Dellalos." },
    { quem: "Dellalos", texto: "...Aquele não era o Lucas. Era o Caos, no corpo dele. Preciso falar com os amigos dele.", info: "caos_oeste_luta" }
  ],
  // Primeira conversa SEM nenhuma essência oferecida: não há luta
  revelaSemEssencia: [
    { quem: "Dellalos", texto: "Lucas! Finalmente te achei. A Thaina me pediu para te avisar: nunca mais volte para a escola." },
    { quem: "Lucas",    texto: "..." },
    { quem: "Dellalos", texto: "Lucas? Você está me ouvindo?" },
    { quem: "Lucas",    texto: "Lucas. Esse nome não é mais meu." },
    { quem: "Caos",     texto: "Ha ha ha! Você achou mesmo que ia encontrar o garoto?" },
    { quem: "Dellalos", texto: "Quem é você?" },
    { quem: "Caos",     texto: "Aquele que ainda está ficando forte. E você nem ajudou o altar: não vale o meu esforço. Por enquanto." },
    { quem: "Caos",     texto: "Você ficará viva por mais algum tempo. Até logo, Dellalos." },
    { quem: "Dellalos", texto: "...Aquele não era o Lucas. Era o Caos, no corpo dele. Preciso falar com os amigos dele.", info: "caos_oeste_sem" }
  ]
};

TIPOS_INIMIGOS.caos_oeste = {            // duelo: ninguém o derrota; acaba quando a Dellalos fica com 1 coração
  nome: "Caos",
  largura: 52, altura: 92,
  vida: 9999, velocidade: 150, deteccao: 4000, dano: 1,
  ia: "duelo", duelo: true, moedas: [0, 0],
  alcanceAviso: 150, avisoTempo: 0.38, investidaTempo: 0.28, investidaVelocidade: 470, descanso: 0.7,
  cor: "#3a1a4a", corEscura: "#14081c",
  aoMorrer: function (i) { caosFimDaLuta(i); }
};

// O "Lucas" do jardim (nome "Caos" de propósito: assim conversar com ele não conta como amizade com o Lucas, js/amizade.js)
const caosOesteNpc = {
  nome: "Caos",
  imagem: ["assets/Caos.png", "assets/caos.png", "assets/Caos.jpg"],
  quadro: { linha: 0, coluna: 0 },
  andar: { raioX: 0, raioY: 0, velocidade: 0 },
  // Durante a missão, o Caos pode circular pelo jardim e pela área acessível da Zona Oeste,
  // mas esta instância só existe na cena zona_oeste: ele nunca migra para outra região.
  viajarRegioes: false,
  regioesPermitidas: ["zona_oeste"],
  rotinaLivre: { raioX: 280, raioY: 190, velocidade: 38, relativo: true, quadros: [0, 1, 2, 3] },
  direcao: "baixo",
  x: CAOS_X, y: CAOS_Y,
  _duelando: false,
  // existe do fim do passo 4 até o fim da missão; some durante a luta (vira inimigo)
  se: function () { return !!historia.sabeOndeLucas && !historia.thainaFim && !caosOesteNpc._duelando; },
  conversar: function () { conversarCaosOeste(); }
};

function conversarCaosOeste() {
  const D = DIALOGOS.caosOeste;
  const comEssencia = sacrificiosFeitos() >= 1;          // pelo menos 1 essência oferecida ao altar (js/salas/capela.js)
  if (!historia.caosOesteRevelou) {
    abrirDialogo(comEssencia ? D.revelaComEssencia : D.revelaSemEssencia, function () {
      historia.caosOesteRevelou = true;
      if (comEssencia) iniciarLutaCaos(); else fimDoEncontroCaos();
    });
    return;
  }
  // já se revelou antes: só chega aqui se ela saiu no meio da luta
  if (comEssencia) abrirDialogo(D.denovo, iniciarLutaCaos); else fimDoEncontroCaos();
}

function iniciarLutaCaos() {
  jogador.vida = jogador.vidaMax;           // luta justa: começa com a vida cheia
  jogador.invulneravel = 1.5;
  caosOesteNpc._duelando = true;
  caosOesteNpc.x = CAOS_X; caosOesteNpc.y = CAOS_Y;
  const i = criarInimigo("caos_oeste", CAOS_X, CAOS_Y);
  i.npc = caosOesteNpc;
  i.estado = "descanso"; i.espera = 1.2;    // um instante para a Dellalos se preparar
  inimigos.push(i);
  mostrarMensagem("O Caos ataca! Lute (botão A). A luta acaba se você ficar com 1 coração.");
}

// Chamado por aoMorrer do tipo caos_oeste (a Dellalos chegou a 1 coração)
function caosFimDaLuta(i) {
  caosOesteNpc.x = i.x; caosOesteNpc.y = i.y;           // ele reaparece onde caiu a luta, para a conversa final
  caosOesteNpc._duelando = false;
  jogador.vida = 1;
  jogador.invulneravel = 3;
  abrirDialogo(DIALOGOS.caosOeste.fim, finalizarMissaoCaos);
}

// Sem essência: não há luta, só a conversa
function fimDoEncontroCaos() { finalizarMissaoCaos(); }

// Fim da missão da Thaina (o "info" da última fala já anotou no diário que ela precisa falar com os amigos do Lucas)
function finalizarMissaoCaos() {
  historia.thainaFim = true;                // o Caos some e a missão conclui (js/missoes.js)
  mostrarMensagem("Preciso falar com os amigos do Lucas: Vitinho, Simon e Deriky.");
  sinalizarMissao();
}

// Na Zona Oeste: o botão A ataca (para a luta) e o Caos entra como NPC
CENAS.zona_oeste.combate = true;
CENAS.zona_oeste.npcs = (CENAS.zona_oeste.npcs || []).concat([caosOesteNpc]);
(function () {
  const aoEntrarAntes = CENAS.zona_oeste.aoEntrar;
  CENAS.zona_oeste.aoEntrar = function () {
    caosOesteNpc._duelando = false;          // luta interrompida (saiu da cena ou morreu): ele não fica preso
    if (aoEntrarAntes) aoEntrarAntes();
  };
})();


/* =====================================================
   A MARIANA NO NORTE (depois do Caos no oeste)
   HISTÓRIA
     - Depois de achar o Caos (thainaFim) E de a Mariane ter fugido da sala 1A (marianaFugiu), ela espera na clareira da fonte,
       na Zona Norte (onde a Thaina esperava).
     - Ela diz que isso é consequência dos pecados das famílias Dellalos. A Dellalos pergunta quem ela é.
     - A Mariane revela que é descendente de dois: Luiz Inácio e Renan Santos (dois dos cinco amigos, JPMLR),
       e que tem o sangue sagrado dobrado. Uma voz grita "Mariane!", ela diz "ok" e vai embora andando.
   FLAG: marianaNorteFim     |   diário: mariana_norte
   PARA MUDAR: o lugar em MARIANA_NORTE_X / MARIANA_NORTE_Y; as falas em DIALOGOS.marianaNorte.
   ===================================================== */

const MARIANA_NORTE_X = 29 * TILE + TILE / 2, MARIANA_NORTE_Y = 22 * TILE + 58;   // clareira da fonte
let marianaNorteSaindo = false;      // só durante a caminhada de saída (não precisa salvar)

function marianaNoNorte() { return (!!historia.thainaFim && !!historia.marianaFugiu && !historia.marianaNorteFim) || marianaNorteSaindo; }

// As falas mudam um pouco se a Dellalos já entendeu as letras JPMLR da capela
DIALOGOS.marianaNorte = function () {
  const sabeLetras = !!historia.entendeuJPMLR;
  return [
    { quem: "Mariane",  texto: "Você viu o que aconteceu no oeste. Isso é consequência dos pecados das famílias Dellalos." },
    { quem: "Dellalos", texto: "Das famílias Dellalos? Do que você está falando? Quem é você?" },
    { quem: "Mariane",  texto: "Você já viu meu rosto na sala 1A. O que você não sabe é de quem eu venho." },
    { quem: "Mariane",  texto: "Sou descendente de dois: Luiz Inácio e Renan Santos." },
    { quem: "Dellalos", texto: sabeLetras
        ? "Luiz e Renan... o L e o R das letras da capela. Dois dos cinco amigos!"
        : "Luiz Inácio e Renan Santos... esses nomes me lembram alguma coisa." },
    { quem: "Mariane",  texto: "Por isso eu tenho o sangue sagrado dobrado.", info: "mariana_norte" },
    { quem: "Dellalos", texto: "Sangue sagrado dobrado? O que isso quer dizer?" },
    { quem: "Voz",      texto: "MARIANA!" },
    { quem: "Mariane",  texto: "...Ok." },
    { quem: "Mariane",  texto: "Preciso ir." },
    { quem: "Dellalos", texto: "Espere! Ainda tenho perguntas!" }
  ];
};

function conversarMarianaNorte() {
  const npc = npcDaCena("zona_norte", "Mariane");
  abrirDialogo(DIALOGOS.marianaNorte(), function () {
    historia.marianaNorteFim = true;
    sinalizarMissao();
    if (!npc) return;
    marianaNorteSaindo = true;
    npcIrEmbora(npc, 28 * TILE + TILE / 2, 36 * TILE + 58, 130, function () { marianaNorteSaindo = false; });   // sai pelo portão do bosque
  });
}

CENAS.zona_norte.npcs.push({
  nome: "Mariane",
  imagem: ["assets/Mariane.png", "assets/mariane.png", "assets/Mariane.png"],
  quadro: { linha: 0, coluna: 0 },
  andar: { raioX: 0, raioY: 0, velocidade: 0 },
  direcao: "baixo",
  x: MARIANA_NORTE_X, y: MARIANA_NORTE_Y,
  se: function () { return marianaNoNorte(); },
  conversar: conversarMarianaNorte
});
