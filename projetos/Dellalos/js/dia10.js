/* =====================================================
   dia10.js - DIA 15 (DIA_FINAL; o arquivo manteve o nome antigo): "O dia da volta do papai"   (NÃO é o final do jogo)
   HISTÓRIA
     - A contagem some (o cartão da rotina não diz mais "Faltam X dias").
     - A Dellalos acorda e diz que precisa ir logo para a escola, antes que o pai chegue.
     - Se ela falar com o Morador, ele diz que hoje é o dia da volta.
     - Ela vai para a escola com a Nathalia e a Millena (cena ao entrar no corredor). Ela diz que está ansiosa
       para o pai voltar. Os outros alunos têm as falas padrão de sempre.
     - Isabela, Thaina e Lucas NÃO estão na escola. Cada um espera num lugar, com uma missão e uma batalha:
         Isabela -> Zona Leste     Thaina -> Zona Oeste     Lucas (o Caos) -> Zona Norte
     - A ordem das três é livre. As falas abaixo são PROVISÓRIAS: ajuste com a história original.
   FLAGS (em historia, salvas): dia10Acordou, dia10Escola, isabelaD10Fim, thainaD10Fim, lucasD10Fim, dia10TresFim
   ONDE LIGA: js/dias.js (acordar, cartão, dormir) | js/missoes.js (cena da escola) | js/salas/estrada.js (Morador)
              js/salas/aulas.js e escola.js (quem está onde) | js/inimigos.js (desenho dos chefes)
   ===================================================== */

function ehDia10() { return historia.novoDia && diaAtual() >= DIA_FINAL; }
function dia10Missoes() { return ehDia10() && escolaHoje(); }

// ---------- Diálogos (PROVISÓRIOS) ----------
DIALOGOS.dia10 = {
  acordar: [
    { quem: "Dellalos", texto: "Hoje é o dia... o papai volta hoje." },
    { quem: "Dellalos", texto: "Preciso ir logo para a escola, antes que ele chegue." },
    { quem: "Dellalos", texto: "(Um apito de trem ecoa pela cidade... faz muito tempo que nenhum trem apitava por aqui.)" }
  ],
  morador: [
    { quem: "Morador",  texto: "Bom dia, Dellalos. Hoje é o dia da volta." },
    { quem: "Morador",  texto: "Seu pai disse que chegaria quando tudo estivesse pronto. Parece que a hora é essa." },
    { quem: "Dellalos", texto: "Eu sei. Estou indo para a escola." }
  ],
  escola: [
    { quem: "Nathalia", texto: "Chegamos! Dellalos, você está quieta hoje." },
    { quem: "Dellalos", texto: "Estou ansiosa. Hoje o papai volta, e eu não vejo a hora." },
    { quem: "Millena",  texto: "Ele vai chegar bem, você vai ver. Eu e a Nathalia estamos com você." },
    { quem: "Nathalia", texto: "Mas... cadê todo mundo? Não vejo a Isabela, nem a Thaina, nem o Lucas." },
    { quem: "Millena",  texto: "É estranho mesmo. Os três faltaram no mesmo dia." },
    { quem: "Dellalos", texto: "(Algo está errado. Preciso descobrir onde eles estão.)" }
  ],
  millena: [ { quem: "Millena", texto: "Seu pai vai chegar hoje, não é? Fica tranquila, Dellalos. A gente está aqui." } ],
  nathalia: [ { quem: "Nathalia", texto: "Estranho a Isabela, a Thaina e o Lucas não terem vindo. Será que está tudo bem?" } ],
  isabela: {
    antes: [
      { quem: "Isabela",  texto: "Você veio. Eu sabia que viria." },
      { quem: "Dellalos", texto: "Isabela, o que você fez com a Gaby? O que você quer?" },
      { quem: "Isabela",  texto: "Quero a entidade de volta. E você vai me ajudar, querendo ou não." },
      { quem: "Dellalos", texto: "Então vou ter que te parar." }
    ],
    depois: [
      { quem: "Isabela",  texto: "Não... isso não era para acontecer..." },
      { quem: "Dellalos", texto: "(A Isabela caiu. Ainda faltam a Thaina e o Lucas.)" }
    ]
  },
  thaina: {
    antes: [
      { quem: "Thaina",   texto: "Você não devia ter vindo até aqui, Dellalos." },
      { quem: "Dellalos", texto: "Thaina, volte ao normal. Eu sei que você não quer isso." },
      { quem: "Thaina",   texto: "Não tenho escolha. Se eu perder, tudo acaba. Me desculpe." }
    ],
    depois: [
      { quem: "Thaina",   texto: "Eu... consegui parar. Obrigada, Dellalos." },
      { quem: "Dellalos", texto: "(A Thaina está livre. Falta o Lucas.)" }
    ]
  },
  lucas: {
    antes: [
      { quem: "Lucas",    texto: "Dellalos. Eu sabia que você viria me procurar." },
      { quem: "Dellalos", texto: "Lucas? Ou devo dizer... Caos?" },
      { quem: "Lucas",    texto: "Os dois. O corpo é dele, mas a vontade agora é minha. Vamos ver o quanto você aguenta." }
    ],
    depois: [
      { quem: "Lucas",    texto: "Interessante... você é mais forte do que o seu pai disse." },
      { quem: "Dellalos", texto: "(Ele sabia do meu pai? ...Preciso voltar para casa.)" }
    ]
  },
  tresFim: [
    { quem: "Dellalos", texto: "Os três enfrentados. A cidade está em silêncio demais..." },
    { quem: "Dellalos", texto: "(O papai deve estar chegando. Preciso estar pronta.)" }
  ]
};

// ---------- Acordar (chamado por comecarProximoDia, js/dias.js) ----------
function aoAcordarDia10() {
  if (historia.dia10Acordou) return;
  historia.dia10Acordou = true;
  abrirDialogo(DIALOGOS.dia10.acordar);
}

// ---------- Chegada à escola com a Nathalia e a Millena (chamado por verificarMissoes) ----------
function verificarDia10Escola() {
  if (!ehDia10() || historia.dia10Escola || idDaCena(cenaAtual) !== "escola") return false;
  historia.dia10Escola = true;
  abrirDialogo(DIALOGOS.dia10.escola, function () { sinalizarMissao(); });
  return true;
}

// ---------- Os três: Isabela (Leste), Thaina (Oeste), Lucas/Caos (Norte) ----------
function dia10TresConcluidos() { return !!(historia.isabelaD10Fim && historia.thainaD10Fim && historia.lucasD10Fim); }

function dia10Fim(flag) {
  historia[flag] = true;
  sinalizarMissao();
  if (dia10TresConcluidos() && !historia.dia10TresFim) {
    historia.dia10TresFim = true;
    abrirDialogo(DIALOGOS.dia10.tresFim);
  }
}

(function () {
  const pe = (tx, ty) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + 58 });
  const luta = (tipo) => inimigos.some((i) => i.tipoId === tipo);

  // Cada chefe: o NPC dá o sprite, a luta é a investida do tipo "gaby"; ao cair, o diálogo final e a flag.
  const CHEFES = [
    { id: "isabela_d10", nome: "Isabela", cena: "zona_leste",  pos: pe(30, 22), flag: "isabelaD10Fim", fala: "isabela",
      img: ["assets/Isabela.png", "assets/isabela.png", "assets/Isabela.jpg"], vida: 14, vel: 110, cor: "#7a3a9a", escura: "#331a44",
      aviso: "A Isabela ataca! Lute (botão A)." },
    { id: "thaina_d10",  nome: "Thaina",  cena: "zona_oeste",  pos: pe(17, 12), flag: "thainaD10Fim",  fala: "thaina",
      img: ["assets/Thaina.png", "assets/thaina.png", "assets/Thaina.jpg"], vida: 14, vel: 105, cor: "#3a6a9a", escura: "#1a2c44",
      aviso: "A Thaina ataca! Lute (botão A)." },
    { id: "caos_d10",    nome: "Lucas",   cena: "zona_norte",  pos: pe(29, 22), flag: "lucasD10Fim",   fala: "lucas",
      img: ["assets/Lucas.png", "assets/lucas.png", "assets/Lucas.jpg"], vida: 20, vel: 118, cor: "#17101f", escura: "#7a4aa8",
      aviso: "O Caos ataca pelo corpo do Lucas! Lute (botão A)." }
  ];

  for (const c of CHEFES) {
    const cena = CENAS[c.cena];
    if (!cena) continue;
    cena.combate = true;

    const npc = {
      nome: c.nome,
      imagem: c.img,
      quadro: { linha: 0, coluna: 0 },
      andar: { raioX: 0, raioY: 0, velocidade: 0 },
      direcao: "baixo",
      x: c.pos.x, y: c.pos.y,
      se: function () { return dia10Missoes() && !historia[c.flag] && !luta(c.id); },
      conversar: function () {
        abrirDialogo(DIALOGOS.dia10[c.fala].antes, function () {
          jogador.vida = jogador.vidaMax;          // luta justa: começa com a vida cheia
          jogador.invulneravel = 1.5;
          const i = criarInimigo(c.id, c.pos.x, c.pos.y, 0);
          i.idx = undefined;                       // não fica "derrotado" para sempre se a Dellalos perder
          i.npc = npc;
          i.estado = "descanso"; i.espera = 1.2;
          inimigos.push(i);
          mostrarMensagem(c.aviso);
        });
      }
    };
    cena.npcs = (cena.npcs || []).concat([npc]);

    TIPOS_INIMIGOS[c.id] = {
      nome: c.nome,
      largura: 52, altura: 92,
      vida: c.vida, velocidade: c.vel, deteccao: 700, dano: 1,
      ia: "investida", chefe: true, moedas: [10, 10],
      alcanceAviso: 150, avisoTempo: 0.5, investidaTempo: 0.3, investidaVelocidade: 440, descanso: 0.85,
      cor: c.cor, corEscura: c.escura,
      spriteNpc: npc,
      aoMorrer: function () {
        abrirDialogo(DIALOGOS.dia10[c.fala].depois, function () { dia10Fim(c.flag); });
      }
    };
  }
})();


/* =====================================================
   DIA 10, PARTE 2: Bairro Sul - Mariane e Durval (depois das três batalhas)
   HISTÓRIA (textos PROVISÓRIOS)
     - Depois dos três, Mariane e Durval esperam no Bairro Sul e revelam: a Isabela era só uma auxiliar e matar o Lucas
       não adiantaria de nada. A Mariane diz que a Dellalos atrapalhou demais e avança. Se a Dellalos perder, volta para casa
       (renascer) e a cena repete ao voltar ao Sul.
     - Se vencer, o Durval diz que, se os servos não fazem, ele faz, e avança. A Dellalos não vence: com 1 coração o pai
       aparece e a ajuda a derrotar o Durval. O pai diz que ela precisa sair dali urgentemente: têm que ir para casa
       rápido, já há algo importante escondido lá.
   FLAGS: sulIntroD10, marianeD10Fim, durvalD10Fim, casaD10Fim
   ===================================================== */
Object.assign(DIALOGOS.dia10, {
  sulPrimeira: [
    { quem: "Mariane",  texto: "Então você chegou até aqui, Dellalos." },
    { quem: "Durval",   texto: "A Isabela era só uma auxiliar. Uma peça, nada mais." },
    { quem: "Mariane",  texto: "Matar o Lucas também não adiantaria de nada. O Caos não depende dele." },
    { quem: "Dellalos", texto: "Então vocês estavam usando todos eles..." },
    { quem: "Mariane",  texto: "Você atrapalhou demais. Chega." }
  ],
  sulDeNovo: [
    { quem: "Mariane",  texto: "Voltou? Então termino o que comecei." }
  ],
  marianeCaiu: [
    { quem: "Mariane",  texto: "Isso... não era para acontecer." },
    { quem: "Durval",   texto: "Se os servos não fazem o serviço, eu faço." },
    { quem: "Dellalos", texto: "(Ele é muito mais forte. Não vou aguentar...)" }
  ],
  paiAjuda: [
    { quem: "Dellalos", texto: "(Só mais um golpe e eu caio...)" },
    { quem: "Pai",      texto: "Dellalos! Agora é comigo. Vamos acabar com isso juntos!" },
    { quem: "Durval",   texto: "Você... voltou." },
    { quem: "Pai",      texto: "Fique ao meu lado, filha. Agora!" }
  ],
  durvalCaiu: [
    { quem: "Durval",   texto: "Não... ainda não acabou..." },
    { quem: "Pai",      texto: "Dellalos, você precisa sair daqui urgentemente." },
    { quem: "Pai",      texto: "Vamos para casa, rápido. Já tem algo importante escondido lá." },
    { quem: "Dellalos", texto: "Algo importante? Está bem, papai. Vamos!" }
  ],
  casaChegou: [
    { quem: "Dellalos", texto: "Chegamos em casa. O papai disse que tem algo importante escondido aqui..." }
  ]
});

(function () {
  const cena = CENAS.bairro_sul;
  const sp = cena.spawn;
  const mk = (nome, img, dx, dy, se) => ({
    nome, imagem: img, quadro: { linha: 0, coluna: 0 },
    andar: { raioX: 0, raioY: 0, velocidade: 0 }, direcao: "baixo",
    x: sp.x + dx, y: sp.y + dy, se,
    conversar: function () { abrirDialogo([{ quem: nome, texto: "..." }]); }
  });
  const emLuta = () => inimigos.some((i) => i.tipoId === "mariane_d10" || i.tipoId === "durval_d10");
  const sulAtivo = () => ehDia10() && !!historia.dia10TresFim && !historia.durvalD10Fim;

  const marianeNpc = mk("Mariane", ["assets/Mariane.png", "assets/mariane.png"], -TILE, 3 * TILE,
    function () { return sulAtivo() && !emLuta() && !historia.marianeD10Fim; });
  const durvalNpc = mk("Durval", ["assets/Durval.png", "assets/durval.png"], TILE, 3 * TILE,
    function () { return sulAtivo() && !emLuta(); });
  const paiNpc = mk("Pai", ["assets/Pai.png", "assets/pai.png"], 0, 5 * TILE,
    function () { return ehDia10() && !!historia.durvalD10Fim && !historia.casaD10Fim; });
  cena.combate = true;
  cena.npcs = (cena.npcs || []).concat([marianeNpc, durvalNpc, paiNpc]);

  const luta = (tipo, x, y) => {
    jogador.vida = jogador.vidaMax; jogador.invulneravel = 1.5;
    const i = criarInimigo(tipo, x, y, 0);
    i.idx = undefined; i.estado = "descanso"; i.espera = 1.2;
    inimigos.push(i);
    return i;
  };

  TIPOS_INIMIGOS.mariane_d10 = {
    nome: "Mariane", largura: 52, altura: 92, vida: 18, velocidade: 115, deteccao: 900, dano: 1,
    ia: "investida", chefe: true, moedas: [20, 20],
    alcanceAviso: 150, avisoTempo: 0.45, investidaTempo: 0.3, investidaVelocidade: 450, descanso: 0.8,
    cor: "#4a3a6a", corEscura: "#1c1428", spriteNpc: marianeNpc,
    aoMorrer: function () {
      historia.marianeD10Fim = true;
      abrirDialogo(DIALOGOS.dia10.marianeCaiu, function () {
        const i = luta("durval_d10", durvalNpc.x, durvalNpc.y);
        i.npc = durvalNpc;
        mostrarMensagem("O Durval ataca! Ele é forte demais...");
      });
    }
  };
  // O Durval é um duelo: ninguém o derrota; quando a Dellalos chega a 1 coração, o pai aparece
  TIPOS_INIMIGOS.durval_d10 = {
    nome: "Durval", largura: 52, altura: 92, vida: 9999, velocidade: 150, deteccao: 4000, dano: 1,
    ia: "duelo", duelo: true, moedas: [0, 0],
    alcanceAviso: 150, avisoTempo: 0.38, investidaTempo: 0.28, investidaVelocidade: 470, descanso: 0.7,
    cor: "#5a3a3a", corEscura: "#1c0e0e", spriteNpc: durvalNpc,
    aoMorrer: function () {
      abrirDialogo(DIALOGOS.dia10.paiAjuda, function () {
        jogador.vida = jogador.vidaMax; jogador.invulneravel = 2;
        abrirDialogo(DIALOGOS.dia10.durvalCaiu, function () {
          historia.durvalD10Fim = true;
          mostrarMensagem("Vá para casa o mais rápido possível!");
          sinalizarMissao();
        });
      });
    }
  };

  // Chamada por verificarMissoes (js/missoes.js)
  window.verificarDia10Sul = function () {
    if (idDaCena(cenaAtual) === "sala" && historia.durvalD10Fim && !historia.casaD10Fim) {
      historia.casaD10Fim = true;
      abrirDialogo(DIALOGOS.dia10.casaChegou, function () { sinalizarMissao(); });
      return true;
    }
    if (idDaCena(cenaAtual) !== "bairro_sul" || !sulAtivo() || historia.marianeD10Fim || emLuta()) return false;
    const falas = historia.sulIntroD10 ? DIALOGOS.dia10.sulDeNovo : DIALOGOS.dia10.sulPrimeira;
    historia.sulIntroD10 = true;
    abrirDialogo(falas, function () {
      const i = luta("mariane_d10", marianeNpc.x, marianeNpc.y);
      i.npc = marianeNpc;
      mostrarMensagem("A Mariane ataca! Lute (botão A).");
    });
    return true;
  };
})();
