/* =====================================================
   salas/estrada.js - A cidade: casa da Dellalos, casa do meio e escola
   Mapa de 64 x 40 tiles. Montado com as ferramentas de js/tiles.js.
   ===================================================== */

(function () {
  const COLS = 64, ROWS = 40;
  const m = criarMapa(COLS, ROWS);

  // 1) Grama em tudo
  pintar(m, "chao", 0, 0, COLS, ROWS, GRAMA);

  // 2) Calçadas e ruas
  pintar(m, "chao", 0, 18, COLS, 2, CALCADA);      // calçada de cima da avenida
  pintar(m, "chao", 0, 25, COLS, 2, CALCADA);      // calçada de baixo
  pintar(m, "chao", 32, 0, 2, ROWS, CALCADA);      // calçadas da rua vertical
  pintar(m, "chao", 39, 0, 2, ROWS, CALCADA);
  pintar(m, "chao", 0, 20, COLS, 5, ASFALTO);      // avenida (horizontal)
  pintar(m, "chao", 34, 0, 5, ROWS, ASFALTO);      // rua (vertical)
  for (let x = 0; x < COLS; x++) if (x < 34 || x > 38) por(m, "chao", x, 22, TRACO_H);
  for (let y = 0; y < ROWS; y++) if (y < 20 || y > 24) por(m, "chao", 36, y, TRACO_V);

  // 3) Casa da Dellalos (esquerda)
  predio(m, 6, 11, 8, 3, ESTILO_LARANJA);
  janela(m, 7, 14); janela(m, 11, 14);
  porta(m, PORTAS.casa.x, PORTAS.casa.y, PORTA_LARANJA, false);
  pintar(m, "chao", 9, 16, 1, 2, CALCADA);         // caminho até a calçada

  // 4) Casa do meio (trancada por enquanto)
  predio(m, 24, 11, 8, 3, ESTILO_VERMELHO);
  janela(m, 25, 14); janela(m, 29, 14);
  porta(m, PORTAS.casaMeio.x, PORTAS.casaMeio.y, PORTA_DUPLA_LARANJA, true);
  pintar(m, "chao", 27, 16, 1, 2, CALCADA);

  // 5) Escola (direita)
  predio(m, 43, 8, 20, 6, ESTILO_VERMELHO);
  for (const x of [45, 47, 49, 55, 57, 59, 61]) janela(m, x, 14);
  porta(m, PORTAS.escola.x, PORTAS.escola.y, PORTA_DUPLA_BRANCA, false);
  pintar(m, "chao", 51, 16, 3, 2, CALCADA);        // entrada larga
  // cercas vivas dos dois lados da entrada
  for (let x = 43; x <= 62; x++) {
    if (x >= 51 && x <= 53) continue;
    por(m, "obj", x, 16, x === 43 || x === 54 ? K(7, 12) : (x === 50 || x === 62 ? K(8, 12) : K(4 + (x % 3), 12)));
    bloquear(m, x, 16);
  }

  // 6) Lago no parque (sudeste)
  bloco9(m, "chao", 44, 30, 9, 5, bloco(8, 6));
  bloquear(m, 44, 30, 9, 5);

  // 7) Bancos, caixas de correio e cercas
  for (const [x, y] of [[20, 26], [48, 26], [42, 19], [16, 19]]) { por(m, "obj", x, y, K(3, 14)); bloquear(m, x, y); }
  for (const [x, y] of [[11, 17], [29, 17]]) { por(m, "obj", x, y, K(8, 11)); bloquear(m, x, y); }
  for (let x = 14; x <= 22; x++) { por(m, "obj", x, 17, K(4 + (x % 3), 14)); bloquear(m, x, 17); }   // cerca na frente do terreno vazio

  // 8) Borda de árvores em volta do mapa (sem bloquear ruas)
  for (let x = 0; x < COLS; x++) {
    const tipo = x % 4;
    if (m.chao[2 * COLS + x] === GRAMA) arvore(m, x, 2, tipo);
    if (m.chao[(ROWS - 1) * COLS + x] === GRAMA) arvore(m, x, ROWS - 1, tipo);
  }
  for (let y = 5; y < ROWS - 3; y += 3) {
    if (m.chao[y * COLS + 0] === GRAMA && m.chao[(y - 2) * COLS + 0] === GRAMA) arvore(m, 0, y, y % 4);
    if (m.chao[y * COLS + COLS - 1] === GRAMA && m.chao[(y - 2) * COLS + COLS - 1] === GRAMA) arvore(m, COLS - 1, y, (y + 1) % 4);
  }

  // 9) Árvores espalhadas (sorteio sempre igual)
  const rnd = sorteador(2024);
  for (let t = 0; t < 400; t++) {
    arvoreLivre(m, 2 + Math.floor(rnd() * (COLS - 4)), 4 + Math.floor(rnd() * (ROWS - 6)), Math.floor(rnd() * 4));
  }

  const escola = nasceDentroAcima(PORTAS.hall);
  const casa = nasceDentroAcima(PORTAS.sala);
  const px = (x, y) => ({ x: x * TILE + TILE / 2, y: y * TILE + TILE - 6 });   // posição de pés no meio de um tile

  CENAS.estrada = {
    mapa: m,
    combate: true,
    npcs: [
      {
        nome: "Morador",
        x: 24 * TILE + TILE / 2, y: 19 * TILE + 58,    // na calçada, entre as duas casas
        imagem: ["assets/Morador.png", "assets/morador.png"],
        quadro: { linha: 0, coluna: 0 },
        andar: { raioX: 224, raioY: 0, velocidade: 55 },   // passeia pela calçada
        conversar: function () {
          if (historia.conheceuMorador) abrirDialogo(DIALOGOS.morador.depois);
          else abrirDialogo(DIALOGOS.morador.primeira, function () { historia.conheceuMorador = true; });
        }
      }
    ],
    interativos: [
      { nome: "porta_casa_do_meio", area: celula(PORTAS.casaMeio.x, PORTAS.casaMeio.y), texto: "Ainda não disponível." }
    ],
    saidas: [
      { area: celula(PORTAS.casa.x, PORTAS.casa.y),     para: "sala",  x: casa.x,   y: casa.y,   dir: "cima" },
      { area: celula(PORTAS.escola.x, PORTAS.escola.y), para: "escola", x: escola.x, y: escola.y, dir: "cima" }
    ],
    placas: [
      { texto: "ESCOLA", x: PORTAS.escola.x * TILE + TILE / 2, y: 13 * TILE + 24, w: 220, h: 46, fonte: 28 }
    ],
    inimigos: [
      { tipo: "slime", ...px(18, 21) }, { tipo: "slime", ...px(46, 23) }, { tipo: "slime", ...px(22, 30) },
      { tipo: "slime", ...px(30, 33) }, { tipo: "slime", ...px(10, 29) }, { tipo: "slime", ...px(56, 28) },
      { tipo: "slime", ...px(28, 6) },  { tipo: "slime", ...px(50, 20) }
    ]
  };
})();
