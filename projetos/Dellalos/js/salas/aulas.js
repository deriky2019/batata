/* =====================================================
   salas/aulas.js - As salas de aula. 1º andar: 1A, 2A (Millena), 2C (Nathalia). 2º andar: 3A (Lucas, Simon e Vitinho),
   3B (à noite), 3C (Thaina e Isabela) e a sala dos professores.
   Todas são montadas pela mesma função, criarAula(). Para mexer numa sala,
   mude os números no pedido de cada uma, lá embaixo.
     mesas     -> posição (em tiles) de cada carteira [x, y]. A cadeira fica 1 tile abaixo.
     quadro    -> onde o quadro negro começa e quantos tiles de largura tem
     professora-> onde fica a mesa da professora (2 tiles de largura)
     npcs      -> personagens que conversam na sala
     andar     -> "escola" (1º andar, padrão) ou "escola2" (2º andar): para onde a porta da sala volta
   ===================================================== */

function criarAula(cfg) {
  const COLS = 20, ROWS = 13;
  const m = criarMapa(COLS, ROWS);
  salaInterna(m, PISO_ESCOLA);

  // Quadro negro e janelas
  quadroNegro(m, cfg.quadro.x, cfg.quadro.w);
  for (const x of [3, 16]) janela(m, x, 1, JANELA2);

  // Carteiras (bloqueiam) e cadeiras (dá para passar)
  for (const [x, y] of cfg.mesas) {
    por(m, "obj", x, y, CARTEIRA); bloquear(m, x, y);
    por(m, "obj", x, y + 1, CADEIRA);
  }

  // Mesa da professora
  const pf = cfg.professora;
  por(m, "obj", pf.x, 3, CARTEIRA); por(m, "obj", pf.x + 1, 3, CARTEIRA);
  bloquear(m, pf.x, 3, 2, 1);

  // Plantas nos cantos
  for (const x of [1, COLS - 2]) { por(m, "obj", x, 3, PLANTA); bloquear(m, x, 3); }

  // Porta para o corredor (parede de baixo)
  portaInterna(m, PORTAS.aula.x, PORTAS.aula.y);

  CENAS[cfg.id] = {
    mapa: m,
    corFora: "#3a3050",
    npcs: cfg.npcs || [],
    interativos: [
      { nome: "quadro",    area: celula(cfg.quadro.x, 1, cfg.quadro.w, 2), texto: cfg.textoQuadro },
      { nome: "professora", area: celula(pf.x, 3, 2, 1),                   texto: "A mesa da professora." }
    ],
    saidas: [{
      area: celula(PORTAS.aula.x, PORTAS.aula.y),
      para: cfg.andar || "escola",
      // volta para o corredor do andar, logo abaixo da porta desta sala (a posição vem de escola.js / escola2.js)
      get x() { return CENAS[cfg.andar || "escola"].portasDasSalas[cfg.id] * TILE + TILE / 2; },
      y: 3 * TILE + 44,
      dir: "baixo"
    }]
  };
}

// ----- 2A: a sala da Millena -----
criarAula({
  id: "aula_2a",
  quadro: { x: 8, w: 5 },
  professora: { x: 14 },
  mesas: [[3, 5], [4, 5], [7, 5], [8, 5], [12, 5], [13, 5], [16, 5], [17, 5],
          [3, 7], [4, 7], [7, 7], [8, 7], [12, 7], [13, 7], [16, 7], [17, 7],
          [3, 9], [4, 9], [7, 9], [8, 9], [12, 9], [13, 9], [16, 9], [17, 9]],
  textoQuadro: "O quadro está cheio de contas de matemática.",
  npcs: [
    {
      nome: "Millena",
      x: 9 * TILE + TILE / 2, y: 4 * TILE + 58,    // pés (tile 9, linha 4: ao lado do corredor do meio)
      // Tenta nesta ordem: se você colocar uma Millena.png transparente em assets/, ela é usada
      imagem: ["assets/Millena.png", "assets/Millena.jpg", "assets/millena.png", "assets/millena.jpg"],
      quadro: { linha: 0, coluna: 0 },   // parada, olhando para baixo
      limitePreto: 18,                   // só vale para o JPG (preserva o cabelo preto)
      se: function () { return !ehDia10(); },   // dia 10: ela vai junto para a escola e fica no corredor (js/dia10.js)
      conversar: function () {
        if (chave1AFinal("Millena") || chave1AOferta("Millena")) return;   // DIA_1A: final e começo da missão da 1A (js/chave1a.js)
        if (diaAtual() >= 11 && !historia.millenaArena) {                   // dia 11: o torneio será na arena da Oeste 2
          abrirDialogo(DIALOGOS.millena.arena, function () { historia.millenaArena = true; });
          return;
        }
        if (torneioPronto()) {                                           // dia seguinte ao Deriky (js/dias.js)
          abrirDialogo(DIALOGOS.millena.torneio, function () { historia.torneioAnunciado = true; });
        } else if (historia.conheceuMillena && historia.torneioAnunciado) abrirDialogo(DIALOGOS.millena.depoisTorneio);
        else if (historia.conheceuMillena) abrirDialogo(historia.conheceuLucas ? DIALOGOS.millena.depoisLucas : DIALOGOS.millena.depois);
        else abrirDialogo(DIALOGOS.millena.primeira, aoConhecerMillena);
      }
    }
  ]
});

// ----- 2C: sem ninguém por enquanto -----
criarAula({
  id: "aula_2c",
  quadro: { x: 7, w: 7 },
  professora: { x: 3 },
  mesas: [[7, 5], [8, 5], [12, 5], [13, 5], [16, 5], [17, 5],
          [7, 7], [8, 7], [12, 7], [13, 7], [16, 7], [17, 7],
          [3, 8], [4, 8], [3, 10], [4, 10]],
  textoQuadro: "O quadro está cheio de anotações.",
  npcs: [
    {
      nome: "Nathalia",
      imagem: ["assets/Nathalia.png", "assets/nathalia.png", "assets/Nathalia.jpg"],
      x: 10 * TILE + TILE / 2, y: 5 * TILE + 58,
      se: function () { return historia.conheceuLucas && !ehDia10(); },   // só depois de "Novos encontros"; no dia 10 fica no corredor
      conversar: function () {
        if (chave1AFinal("Nathalia") || chave1AOferta("Nathalia")) return;  // DIA_1A: final e começo da missão da 1A (js/chave1a.js)
        if (historia.conheceuNathalia) abrirDialogo(DIALOGOS.nathalia.depois);
        else abrirDialogo(DIALOGOS.nathalia.primeira, function () { historia.conheceuNathalia = true; });
      }
    }
  ]
});

// ----- 3A (2º andar): Lucas, Simon e Vitinho. Só aparecem depois do 1º dia. -----
criarAula({
  id: "aula_3a",
  andar: "escola2",
  quadro: { x: 8, w: 5 },
  professora: { x: 14 },
  mesas: [[2, 5], [3, 5], [6, 5], [7, 5], [12, 5], [13, 5], [16, 5], [17, 5],
          [2, 8], [3, 8], [6, 8], [7, 8], [12, 8], [13, 8], [16, 8], [17, 8]],
  textoQuadro: "O quadro está limpo.",
  npcs: [
    {
      nome: "Lucas",
      imagem: ["assets/Lucas.png", "assets/lucas.png", "assets/Lucas.jpg"],
      x: 9 * TILE + TILE / 2, y: 6 * TILE + 58,
      se: function () { return historia.novoDia && !noiteAtiva() && !lucasForaDaEscola(); },   // some no DIA_THAINA e não volta (js/thaina.js)
      conversar: function () {
        if (dia4SimonFaltou("lucas")) return;      // DIA_SEITA: o Simon faltou (js/simon.js)
        if (historia.conheceuLucas) abrirDialogo(DIALOGOS.lucas.depois);
        else abrirDialogo(DIALOGOS.lucas.primeira, function () { historia.conheceuLucas = true; });
      }
    },
    {
      nome: "Simon",
      imagem: ["assets/Simon.png", "assets/simon.png", "assets/Simon.jpg"],
      x: 11 * TILE + TILE / 2, y: 6 * TILE + 58,
      se: function () { return simonNaEscola() && !noiteAtiva(); },   // some no DIA_SEITA (está no Bairro Sul) e volta no dia seguinte (js/simon.js)
      conversar: function () {
        if (amigoLucasFala("simon")) return;       // DIA_THAINA: o Lucas e o Caos (js/thaina.js)
        if (diaAtual() > DIA_SEITA && historia.revelouSeita) { abrirDialogo(DIALOGOS.simonDia4.volta); return; }
        abrirDialogo(historia.conheceuLucas ? DIALOGOS.simon.depois : DIALOGOS.simon.antes);
      }
    },
    {
      nome: "Vitinho",
      imagem: ["assets/Vitinho.png", "assets/vitinho.png", "assets/Vitinho.jpg"],
      x: 9 * TILE + TILE / 2, y: 8 * TILE + 58,
      se: function () { return historia.novoDia && !noiteAtiva(); },
      conversar: function () {
        if (dia4SimonFaltou("vitinho")) return;    // DIA_SEITA: o Simon faltou (js/simon.js)
        if (amigoLucasFala("vitinho")) return;     // DIA_THAINA: o Lucas e o Caos (js/thaina.js)
        abrirDialogo(historia.conheceuLucas ? DIALOGOS.vitinho.depois : DIALOGOS.vitinho.antes);
      }
    }
  ]
});

// ----- 3C: Thaina e Isabela (melhores amigas). Só têm gente depois do primeiro dia. -----
criarAula({
  id: "aula_3c",
  andar: "escola2",
  quadro: { x: 7, w: 6 },
  professora: { x: 14 },
  mesas: [[3, 5], [4, 5], [7, 5], [8, 5], [13, 5], [14, 5], [17, 5], [18, 5],
          [3, 8], [4, 8], [8, 8], [13, 8], [17, 8], [18, 8]],
  textoQuadro: "O quadro tem frases em outro idioma e uma data circulada.",
  npcs: [
    {
      nome: "Thaina",
      x: 10 * TILE + TILE / 2, y: 5 * TILE + 58,
      imagem: ["assets/Thaina.png", "assets/thaina.png", "assets/Thaina.jpg"],
      quadro: { linha: 3, coluna: 0 },   // olhando para a Isabela (direita)
      se: function () { return historia.novoDia && !noiteAtiva() && !ehDia10(); },   // dia 10: está na Zona Oeste (js/dia10.js)
      conversar: function () {
        if (thainaConvite()) return;      // DIA_THAINA: o recado sussurrado (js/thaina.js)
        if (dialogoSeitaBloqueia("Thaina")) { abrirDialogo(DIALOGOS.preparar.thaina); return; }   // depois do DIA_SEITA (js/simon.js)
        if (historia.conheceuThaina) abrirDialogo(historia.conheceuIsabela ? DIALOGOS.thaina.depoisIsabela : DIALOGOS.thaina.depois);
        else abrirDialogo(DIALOGOS.thaina.primeira, function () { historia.conheceuThaina = true; });
      }
    },
    {
      nome: "Isabela",
      x: 11 * TILE + TILE / 2, y: 5 * TILE + 58,
      imagem: ["assets/Isabela.png", "assets/isabela.png", "assets/Isabela.jpg"],
      quadro: { linha: 2, coluna: 0 },   // olhando para a Thaina (esquerda)
      se: function () { return historia.novoDia && !noiteAtiva() && !isabelaForaDaEscola() && !ehDia10(); },   // dia 10: está na Zona Leste (js/dia10.js)   // some depois do Deriky (js/thaina.js)
      conversar: function () {
        if (dialogoSeitaBloqueia("Isabela")) { abrirDialogo(DIALOGOS.preparar.isabela); return; }   // depois do DIA_SEITA (js/simon.js)
        if (historia.conheceuIsabela) abrirDialogo(DIALOGOS.isabela.depois);
        else abrirDialogo(DIALOGOS.isabela.primeira, function () { historia.conheceuIsabela = true; });
      }
    }
  ]
});

// ----- 3C à noite (parte 4): o Zé dá a palestra; a Millena espera na porta. A chave dele está na mesa da professora. -----
CENAS.aula_3c.npcs.push(
  {
    nome: "Zé", imagem: ["assets/Zé.png", "assets/Ze.png", "assets/zé.png", "assets/ze.png"], quadro: { linha: 0, coluna: 0 },
    x: 12 * TILE + TILE / 2, y: 4 * TILE + 58,
    se: function () { return noiteAtiva(); },
    conversar: function () {
      const plano = diario.escolhas.noite_plano;
      if (historia.pegouChaveZe) { abrirDialogo(DIALOGOS.noite.ze.depois); return; }
      if (plano === "distrair") { abrirDialogo(DIALOGOS.noite.ze.distrair, function () { historia.pegouChaveZe = true; mostrarMensagem("A Millena pegou a chave do Zé. Vá até a porta da 3B."); sinalizarMissao(); }); return; }
      abrirDialogo(historia.noiteMillenaDistrai ? DIALOGOS.noite.ze.distraido : DIALOGOS.noite.ze.ocupado);
    }
  },
  {
    nome: "Millena",
    x: (PORTAS.aula.x - 2) * TILE + TILE / 2, y: 10 * TILE + 58,
    imagem: ["assets/Millena.png", "assets/Millena.jpg", "assets/millena.png", "assets/millena.jpg"],
    quadro: { linha: 0, coluna: 0 },
    limitePreto: 18,
    se: function () { return noiteAtiva(); },
    conversar: function () {
      const plano = diario.escolhas.noite_plano;
      if (historia.pegouChaveZe) { abrirDialogo(DIALOGOS.noite.millena3c.depois); return; }
      if (plano === "distrair") { abrirDialogo(DIALOGOS.noite.millena3c.distrair); return; }
      if (historia.noiteMillenaDistrai) { abrirDialogo(DIALOGOS.noite.millena3c.rapido); return; }
      abrirDialogo(DIALOGOS.noite.millena3c.pegar, function () { historia.noiteMillenaDistrai = true; mostrarMensagem("Pegue a chave na mesa da professora, onde o Zé deixou."); });
    }
  }
);
(function () {   // a mesa da professora da 3C vira a mesa do Zé
  const mesa = CENAS.aula_3c.interativos.find((o) => o.nome === "professora");
  delete mesa.texto;
  mesa.conversar = function () { usarMesaDoZe(); };
})();

// ----- 3B (parte 4): só abre à noite, com a chave do Zé. Isabela e Durval (conteúdo PROVISÓRIO) -----
criarAula({
  id: "aula_3b",
  andar: "escola2",
  quadro: { x: 7, w: 6 },
  professora: { x: 14 },
  mesas: [[3, 5], [4, 5], [7, 5], [8, 5], [17, 5], [18, 5], [3, 8], [18, 8]],
  textoQuadro: "O quadro está limpo, só tem um círculo desenhado com giz.",
  npcs: [
    {
      nome: "Isabela",
      x: 9 * TILE + TILE / 2, y: 7 * TILE + 58,
      imagem: ["assets/Isabela.png", "assets/isabela.png", "assets/Isabela.jpg"],
      quadro: { linha: 2, coluna: 0 },
      se: function () { return noiteAtiva(); },
      conversar: function () {
        if (historia.falouIsabela3B) { abrirDialogo(DIALOGOS.noite.isabela3bDepois); return; }
        abrirDialogo(DIALOGOS.noite.isabela3b, function () { historia.falouIsabela3B = true; });
      }
    },
    {
      nome: "Durval", imagem: ["assets/Durval.png", "assets/durval.png"], quadro: { linha: 0, coluna: 0 },
      x: 12 * TILE + TILE / 2, y: 4 * TILE + 58,
      se: function () { return noiteAtiva(); },
      conversar: function () {
        if (historia.falouDurval) { abrirDialogo(DIALOGOS.noite.durval3bDepois); return; }
        abrirDialogo(DIALOGOS.noite.durval3b, function () { historia.falouDurval = true; });
      }
    }
  ]
});
// Parte 5: a Millena entra junto, e o botão A ataca (a sombra). O final da cena está em verificarEventosNoite3B (js/dias.js)
CENAS.aula_3b.combate = true;
CENAS.aula_3b.npcs.push({
  nome: "Millena",
  x: (PORTAS.aula.x - 2) * TILE + TILE / 2, y: 10 * TILE + 58,
  imagem: ["assets/Millena.png", "assets/Millena.jpg", "assets/millena.png", "assets/millena.jpg"],
  quadro: { linha: 0, coluna: 0 },
  limitePreto: 18,
  se: function () { return noiteAtiva() && !historia.noiteMillenaSaiu; },
  conversar: function () { abrirDialogo(DIALOGOS.noite.millena3b); }
});

// ----- Sala dos professores (2º andar, depois da 3C). Textos PROVISÓRIOS: ajuste com a história original. -----
criarAula({
  id: "aula_professores",
  andar: "escola2",
  quadro: { x: 8, w: 4 },
  professora: { x: 9 },
  mesas: [[3, 5], [4, 5], [3, 8], [4, 8], [15, 5], [16, 5], [15, 8], [16, 8]],
  textoQuadro: "O quadro de avisos tem horários de aula e recados antigos."
});
(function () {
  const mesa = CENAS.aula_professores.interativos.find((o) => o.nome === "professora");
  mesa.texto = "A mesa principal da sala dos professores. Está tudo muito arrumado.";
})();

// ----- 1A: a sala fechada (DIA_1A). A chave está na casa da diretora; a Mariane espera lá dentro (js/chave1a.js) -----
criarAula({
  id: "aula_1a",
  quadro: { x: 8, w: 5 },
  professora: { x: 14 },
  mesas: [[3, 6], [4, 6], [15, 6], [16, 6], [3, 8], [4, 8], [15, 8], [16, 8]],
  textoQuadro: "O quadro está coberto de símbolos que ninguém ensinou nas aulas.",
  npcs: [
    {
      nome: "Mariane", cor: "#4a3a6a",
      imagem: ["assets/Mariane.png", "assets/mariane.png", "assets/Mariana.png"],
      quadro: { linha: 0, coluna: 0 },
      andar: { raioX: 0, raioY: 0, velocidade: 0 },
      direcao: "baixo",
      x: 10 * TILE + TILE / 2, y: 4 * TILE + 58,
      se: function () { return marianaNaSala(); },
      conversar: function () { abrirDialogo(DIALOGOS.chave1a.marianaFala); }
    }
  ]
});
CENAS.aula_1a.combate = true;      // o botão A ataca aqui
// A criatura preta (re)aparece enquanto a Dellalos ainda não a derrotou (cena.inimigos é lido ao entrar)
Object.defineProperty(CENAS.aula_1a, "inimigos", {
  get: function () {
    return (historia.viuMariana && !historia.matouSombra) ? [{ tipo: "sombra", x: 10 * TILE + TILE / 2, y: 6 * TILE + 40 }] : [];
  }
});
