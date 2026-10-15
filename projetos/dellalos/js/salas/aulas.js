/* =====================================================
   salas/aulas.js - As salas de aula: 2A (Millena), 2C e 3A (vazia)
   Todas são montadas pela mesma função, criarAula(). Para mexer numa sala,
   mude os números no pedido de cada uma, lá embaixo.
     mesas     -> posição (em tiles) de cada carteira [x, y]. A cadeira fica 1 tile abaixo.
     quadro    -> onde o quadro negro começa e quantos tiles de largura tem
     professora-> onde fica a mesa da professora (2 tiles de largura)
     npcs      -> personagens que conversam na sala
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
      para: "escola",
      // volta para o corredor, logo abaixo da porta desta sala (a posição vem de escola.js)
      get x() { return CENAS.escola.portasDasSalas[cfg.id] * TILE + TILE / 2; },
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
      conversar: function () {
        if (historia.conheceuMillena) abrirDialogo(DIALOGOS.millena.depois);
        else abrirDialogo(DIALOGOS.millena.primeira, function () { historia.conheceuMillena = true; });
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
  textoQuadro: "O quadro está cheio de anotações."
});

// ----- 3A: vazia, sem NPC -----
criarAula({
  id: "aula_3a",
  quadro: { x: 8, w: 5 },
  professora: { x: 14 },
  mesas: [[2, 5], [3, 5], [6, 5], [7, 5], [12, 5], [13, 5], [16, 5], [17, 5],
          [2, 8], [3, 8], [6, 8], [7, 8], [12, 8], [13, 8], [16, 8], [17, 8]],
  textoQuadro: "O quadro está limpo."
});
