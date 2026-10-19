/* =====================================================
   salas/zonanorte.js - Zona Norte (bosque antigo, cabana, cemitério, ruínas e capela na colina)
   Mapa de 56 x 48 tiles, montado com as ferramentas de js/tiles.js (igual à estrada, ao Bairro Sul e à Zona Leste).
   NESTA VERSÃO: cenário + espíritos (inimigos que soltam ESSÊNCIAS) + a capela com o altar do Caos
   (js/salas/capela.js). Ainda sem moradores e sem missões: o altar é opcional e não aparece na lista de missões.
   Dá para andar por tudo e examinar os objetos (texto na tela). O clima é de mistério: algo "errado" no ar.

   COMO CHEGAR: a rua vertical da estrada continua para o norte. Ao chegar no fim dela (saída norte,
   em js/salas/estrada.js) a Dellalos aparece AQUI, na entrada sul, e a saída sul daqui leva de volta
   para a estrada, perto da saída norte. Os dois pontos ficam em PORTAS (js/salas/_portas.js).

   ONDE ESTÁ O QUÊ (em tiles, x = coluna, y = linha):
     estrada de entrada .......... x 24-32, y 38-47 (asfalto + calçadas), portão do bosque na linha 37
     lagoa ....................... x 4-10, y 39-43
     trilha de terra ............. x ~26-31, da linha 36 até a praça da capela (linha 16)
     cabana do guarda-florestal .. x 8-14, y 26-29 (porta em 11,29: trancada)
     clareira da fonte ........... x 22-34, y 18-24 (fonte antiga + 3 marcos de pedra com símbolos)
     cemitério ................... x 36-50, y 24-36 (cerca de arame, portão em 36,29-30)
     ruínas / círculo de pedras .. x 40-52, y 8-18 (laje no centro)
     cripta ...................... x 9-14, y 6-9 (porta de pedra selada em 12,9)
     capela da colina ............ x 22-34, y 5-10 (porta em 28,10: trancada), praça da capela y 11-15

   COMO ADICIONAR COISAS NO FUTURO (nada disso existe ainda)
     - Inimigos: acrescente  inimigos: [{ tipo, x, y }]  na cena (tipos em js/inimigos.js; veja zonaleste.js)
       e ligue o combate com  combate: true.
     - Moradores: acrescente  npcs  e as falas em DIALOGOS (js/dialogos.js), como no Bairro Sul.
     - Missões: acrescente em MISSOES (js/missoes.js). Os objetos examináveis de baixo (marcos de pedra,
       portas da capela e da cripta, laje das ruínas) já têm nomes próprios para servirem de gatilho.
     - Segredos para os companheiros (pistas, moedas, caixotes): SEGREDOS em js/exploracao.js.
     - Por dentro da cabana, da capela e da cripta: troque o  texto  da porta por uma saída para uma cena
       nova (veja js/salas/casassul.js) e destranque a porta no mapa.
   ===================================================== */

(function () {
  const COLS = 56, ROWS = 48;
  const m = criarMapa(COLS, ROWS);
  const CX = PORTAS.norteEntrada.x;            // coluna do meio da estrada de entrada (28)
  const TRILHA = K(1, 4);                      // chão de terra batida (bege)

  // 1) Grama (floresta) em tudo
  pintar(m, "chao", 0, 0, COLS, ROWS, GRAMA);

  // 2) A estrada de entrada: calçadas + asfalto, do fim do mapa (linha 47) até o portão (linha 38)
  pintar(m, "chao", CX - 4, 38, 2, ROWS - 38, CALCADA);
  pintar(m, "chao", CX + 3, 38, 2, ROWS - 38, CALCADA);
  pintar(m, "chao", CX - 2, 38, 5, ROWS - 38, ASFALTO);
  for (let y = 38; y < ROWS; y++) por(m, "chao", CX, y, TRACO_V);

  // 3) A trilha de terra: sobe do portão até a praça da capela, com leves curvas (5 tiles de largura)
  const cx = (y) => (y >= 31 ? 28 : (y >= 24 ? 29 : 28));
  for (let y = 16; y <= 37; y++) pintar(m, "chao", cx(y) - 2, y, 5, 1, TRILHA);
  // ramais de terra (2 tiles de largura): cabana (oeste), cemitério (leste), cripta (oeste, no alto), ruínas (leste, no alto)
  pintar(m, "chao", 11, 30, 1, 3, TRILHA);       // da porta da cabana até a trilha de baixo
  pintar(m, "chao", 11, 31, 16, 2, TRILHA);      // cabana -> trilha
  pintar(m, "chao", 31, 29, 6, 2, TRILHA);       // trilha -> portão do cemitério
  pintar(m, "chao", 12, 10, 1, 4, TRILHA);       // da porta da cripta para baixo
  pintar(m, "chao", 12, 12, 10, 2, TRILHA);      // cripta -> praça da capela
  pintar(m, "chao", 35, 12, 7, 2, TRILHA);       // praça da capela -> ruínas

  // ---------- Peças que se repetem ----------
  const poste = (x, y) => { por(m, "topo", x, y - 1, K(7, 6)); por(m, "obj", x, y, K(7, 7)); bloquear(m, x, y); };
  const banco = (x, y) => { por(m, "obj", x, y, K(3, 14)); bloquear(m, x, y); };
  const lapide = (x, y) => { por(m, "obj", x, y, K(2, 10)); bloquear(m, x, y); };         // pedra em pé (lápide / marco)
  const laje = (x, y, n) => { por(m, "obj", x, y, [K(0, 10), K(1, 10), K(0, 11)][n % 3]); bloquear(m, x, y); };   // laje baixa
  const caixote = (x, y, n) => { por(m, "obj", x, y, [K(3, 10), K(4, 10), K(5, 10), K(3, 11)][n % 4]); bloquear(m, x, y); };
  const barril = (x, y, n) => { por(m, "obj", x, y, [K(8, 9), K(9, 9), K(10, 9)][n % 3]); bloquear(m, x, y); };
  const cercaMadeira = (x0, x1, y, vaoX0, vaoX1) => {
    for (let x = x0; x <= x1; x++) {
      if (vaoX0 !== undefined && x >= vaoX0 && x <= vaoX1) continue;
      por(m, "obj", x, y, K(4 + (x % 3), 14)); bloquear(m, x, y);
    }
  };
  const cercaArame = (x0, x1, y, vaoX0, vaoX1) => {
    for (let x = x0; x <= x1; x++) {
      if (vaoX0 !== undefined && x >= vaoX0 && x <= vaoX1) continue;
      por(m, "obj", x, y, K(4 + (x % 3), 13)); bloquear(m, x, y);
    }
  };
  const cercaArameV = (x, y0, y1, vaoY0, vaoY1) => {
    for (let y = y0; y <= y1; y++) {
      if (vaoY0 !== undefined && y >= vaoY0 && y <= vaoY1) continue;
      por(m, "obj", x, y, K(4 + (y % 3), 13)); bloquear(m, x, y);
    }
  };

  // 4) O portão do bosque (linha 37): cerca dos dois lados, a trilha passa no meio, postes marcam a entrada
  cercaMadeira(18, 25, 37);
  cercaMadeira(31, 38, 37);
  poste(25, 37); poste(31, 37);
  poste(CX - 3, 41); poste(CX + 3, 41);

  // 5) Lagoa escura perto da entrada (sudoeste)
  bloco9(m, "chao", 4, 39, 7, 5, bloco(8, 6));
  bloquear(m, 4, 39, 7, 5);
  banco(12, 44); poste(12, 42);

  // 6) Cabana do guarda-florestal (oeste): casa pequena de "madeira", quintal com lenha e barris
  const TEL = { cinza: bloco(8, 0), marrom: bloco(8, 3), bege: bloco(0, 3) };
  const FACH = {
    laranja:  [[K(17, 6), K(18, 6), K(19, 6)], [K(17, 7), K(18, 7), K(19, 7)]],
    vermelha: [[K(17, 2), K(18, 2), K(19, 2)], [K(17, 3), K(18, 3), K(19, 3)]],
    vermelha2:[[K(20, 2), K(21, 2), K(22, 2)], [K(20, 3), K(21, 3), K(22, 3)]]
  };
  predio(m, 8, 26, 7, 2, { telhado: TEL.marrom, fachada: FACH.laranja });
  janela(m, 9, 28, JANELA); janela(m, 13, 28, JANELA2);
  porta(m, 11, 29, PORTA_LARANJA, true);               // trancada por enquanto
  cercaMadeira(6, 16, 30, 11, 11);                      // cerca da frente com o vão no caminho
  caixote(15, 28, 0); caixote(15, 29, 1); caixote(16, 29, 3); caixote(16, 28, 2);   // lenha empilhada
  barril(6, 27, 0); barril(6, 28, 1);
  banco(8, 33);                                          // banco no quintal
  poste(13, 30);

  // 7) Clareira da fonte (centro): praça de pedra com a fonte antiga, 3 marcos de pedra e bancos
  pintar(m, "chao", 22, 18, 13, 7, CALCADA);
  por(m, "chao", 27, 20, K(11, 6)); por(m, "chao", 28, 20, K(12, 6));     // fonte 2x2
  por(m, "chao", 27, 21, K(11, 7)); por(m, "chao", 28, 21, K(12, 7));
  bloquear(m, 27, 20, 2, 2);
  lapide(24, 19); lapide(31, 19); lapide(28, 23);       // 3 marcos de pedra com símbolos (futuro: enigma)
  banco(24, 22); banco(32, 22);
  poste(22, 18); poste(34, 18); poste(22, 24); poste(34, 24);

  // 8) Cemitério (leste): cerca de arame, portão a oeste (linhas 29-30), corredores de terra e lápides
  cercaArame(36, 50, 24); cercaArame(36, 50, 36);
  cercaArameV(36, 24, 36, 29, 30);                      // lado oeste, com o portão
  cercaArameV(50, 24, 36);
  pintar(m, "chao", 37, 29, 13, 2, TRILHA);             // corredor horizontal
  pintar(m, "chao", 43, 25, 2, 11, TRILHA);             // corredor vertical
  const lapides = [];
  for (const y of [26, 27, 32, 33, 34]) for (const x of [38, 40, 46, 48]) lapides.push([x, y]);
  for (const [x, y] of lapides) lapide(x, y);
  laje(39, 35, 2); laje(47, 25, 0); laje(41, 25, 1);
  poste(35, 28); poste(35, 31);

  // 9) Ruínas e círculo de pedras (nordeste): laje no centro, pedras em volta
  pintar(m, "chao", 42, 9, 11, 9, TRILHA);              // chão de terra batida do círculo
  for (const [x, y] of [[43, 13], [51, 13], [47, 9], [47, 17], [44, 10], [50, 10], [44, 16], [50, 16]]) lapide(x, y);
  laje(46, 13, 2); laje(47, 13, 0); laje(48, 13, 1);    // laje / altar com marcas de velas
  laje(52, 8, 1);                                       // laje caída, fora do círculo
  poste(42, 12); poste(52, 14);

  // 10) Capela da colina (norte): prédio grande de pedra, porta dupla no meio e praça de pedra na frente
  predio(m, 22, 5, 13, 4, { telhado: TEL.cinza, fachada: FACH.vermelha2 });
  for (const [x, t] of [[24, JANELA], [26, JANELA2], [30, JANELA2], [32, JANELA]]) janela(m, x, 9, t);
  porta(m, 28, 10, PORTA_DUPLA_BRANCA, false);                                // aberta: leva para dentro da capela (js/salas/capela.js)
  pintar(m, "chao", 21, 11, 15, 5, CALCADA);
  banco(23, 13); banco(33, 13);
  poste(26, 11); poste(30, 11);
  poste(21, 15); poste(35, 15);

  // 11) Cripta (noroeste): construção baixa de pedra com porta selada
  predio(m, 9, 6, 6, 2, { telhado: TEL.cinza, fachada: FACH.vermelha });
  janela(m, 10, 8, JANELA); janela(m, 14, 8, JANELA);
  porta(m, 12, 9, PORTA_DUPLA_BRANCA, true);
  lapide(10, 11); lapide(14, 11);

  // 12) Borda de árvores em volta do mapa (sem bloquear estradas)
  for (let x = 0; x < COLS; x++) {
    const tipo = x % 4;
    if ((x < 25 || x > 31) && m.chao[2 * COLS + x] === GRAMA && !m.bloq[2 * COLS + x]) arvore(m, x, 2, tipo);
    if (m.chao[(ROWS - 1) * COLS + x] === GRAMA && !m.bloq[(ROWS - 1) * COLS + x]) arvore(m, x, ROWS - 1, tipo);
  }
  for (let y = 5; y < ROWS - 3; y += 3) {
    if (m.chao[y * COLS + 0] === GRAMA && m.chao[(y - 2) * COLS + 0] === GRAMA && !m.bloq[y * COLS]) arvore(m, 0, y, y % 4);
    if (m.chao[y * COLS + COLS - 1] === GRAMA && m.chao[(y - 2) * COLS + COLS - 1] === GRAMA && !m.bloq[y * COLS + COLS - 1]) arvore(m, COLS - 1, y, (y + 1) % 4);
  }

  // 13) Bosque: árvores espalhadas (sorteio sempre igual), com clareiras onde ficam estradas, trilhas e construções
  const CLAREIRAS = [
    [21, 34, 15, 14],      // estrada de entrada e entorno do portão
    [3, 37, 10, 9],        // lagoa e banco
    [24, 14, 9, 24],       // trilha (corredor de 9 tiles de largura)
    [5, 24, 14, 11],       // cabana e quintal + ramal
    [19, 17, 17, 9],       // clareira da fonte
    [33, 23, 19, 15],      // cemitério e ramal
    [38, 7, 16, 13],       // ruínas
    [18, 3, 20, 14],       // capela e praça
    [7, 5, 14, 11],        // cripta e ramal
    [30, 11, 12, 4]        // ramal capela -> ruínas
  ];
  const bloqAntes = m.bloq.slice();
  for (const [cx0, cy0, cw, ch] of CLAREIRAS) bloquear(m, cx0, cy0, cw, ch);
  const rnd = sorteador(1313);
  for (let t = 0; t < 2600; t++) {
    arvoreLivre(m, 2 + Math.floor(rnd() * (COLS - 4)), 4 + Math.floor(rnd() * (ROWS - 6)), Math.floor(rnd() * 4));
  }
  for (const [cx0, cy0, cw, ch] of CLAREIRAS) {        // desfaz o bloqueio temporário
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      if (dentro(m, cx0 + i, cy0 + j)) m.bloq[(cy0 + j) * COLS + (cx0 + i)] = bloqAntes[(cy0 + j) * COLS + (cx0 + i)];
    }
  }
  // algumas árvores à mão, para dar sombra à cabana, ao cemitério e à capela
  for (const [x, y, t] of [[17, 26, 2], [3, 30, 3], [37, 37, 2], [49, 37, 3], [38, 20, 2], [20, 8, 3], [36, 8, 2]]) {
    if (dentro(m, x, y) && !m.bloq[y * COLS + x] && m.obj[y * COLS + x] === -1 && m.chao[y * COLS + x] === GRAMA) arvore(m, x, y, t);
  }

  // Voltando para a estrada: 3 tiles para dentro, olhando para baixo (longe da saída norte: sem ciclo)
  const estrada = { x: PORTAS.norteSaida.x * TILE + TILE / 2, y: (PORTAS.norteSaida.y + 3) * TILE + 40 };
  const capelaDentro = nasceDentroAcima(PORTAS.capelaDentro);
  const px = (x, y) => ({ x: x * TILE + TILE / 2, y: y * TILE + TILE - 6 });   // posição de pés no meio de um tile

  CENAS.zona_norte = {
    mapa: m,
    combate: true,                                        // botão A bate nos espíritos
    spawn: { x: CX * TILE + TILE / 2, y: (PORTAS.norteEntrada.y - 3) * TILE + 40 },
    // Espíritos: soltam uma essência ao desaparecer e renascem a cada visita (veja o tipo "espirito" em js/inimigos.js).
    // Sem  npcs  e sem missões nesta versão (veja o comentário lá em cima para acrescentar)
    interativos: [
      { nome: "lagoa", area: celula(4, 39, 7, 5), texto: "A água da lagoa é escura e parada. Não dá para ver o fundo." },
      { nome: "porta_cabana", area: celula(11, 29), texto: "A cabana do guarda-florestal. Ninguém atende, mas a lenha está empilhada com cuidado." },
      { nome: "lenha", area: celula(15, 28, 2, 2), texto: "Lenha cortada há pouco tempo. Alguém ainda cuida deste bosque." },
      { nome: "fonte", area: celula(27, 20, 2, 2), texto: "Uma fonte antiga, ainda com água. Há símbolos riscados na borda de pedra." },
      { nome: "marco_olho", area: celula(24, 19), conversar: function () { diario.escolhas.marco_olho = true; mostrarMensagem("Um marco de pedra com um olho riscado. Parece que alguém limpou o musgo só deste lado."); } },
      { nome: "marco_lua", area: celula(31, 19), conversar: function () { diario.escolhas.marco_lua = true; mostrarMensagem("Um marco de pedra com uma lua riscada. O símbolo parece mais novo que a pedra."); } },
      { nome: "marco_espiral", area: celula(28, 23), conversar: function () { diario.escolhas.marco_espiral = true; mostrarMensagem("Um marco de pedra com uma espiral riscada. Dá uma sensação estranha olhar para ela."); } },
      { nome: "porta_cripta", area: celula(12, 9), texto: "Uma porta de pedra, selada. Um frio sai pelas frestas." },
      { nome: "portao_cemiterio", area: celula(36, 29, 1, 2), texto: "O portão do cemitério está aberto. O silêncio aqui é pesado." },
      { nome: "lapides_oeste", area: celula(38, 26, 3, 2), texto: "Lápides antigas, quase sem nome. As datas são de muitos anos atrás." },
      { nome: "lapides_sul", area: celula(38, 32, 3, 3), texto: "Algumas lápides têm flores secas. Uma delas é bem recente." },
      { nome: "lapides_leste", area: celula(46, 26, 3, 2), texto: "Lápides com o mesmo símbolo riscado, repetido em cada uma." },
      { nome: "lapides_leste_sul", area: celula(46, 32, 3, 3), texto: "O mato aqui foi pisado. Parece que alguém passa por este canto com frequência." },
      { nome: "laje_cemiterio", area: celula(39, 35), texto: "Uma laje de pedra. Dá para sentir o frio através dela." },
      { nome: "pedras_norte", area: celula(47, 9), texto: "Pedras em círculo, bem mais antigas que o resto do bosque." },
      { nome: "pedras_oeste", area: celula(43, 13), texto: "Cada pedra do círculo tem um símbolo riscado, quase apagado pela chuva." },
      { nome: "pedras_leste", area: celula(51, 13), texto: "O chão em volta das pedras está limpo, sem mato. Alguém cuida deste lugar." },
      { nome: "pedras_sul", area: celula(47, 17), texto: "Há cera de vela derretida aos pés desta pedra." },
      { nome: "laje_ruinas", area: celula(46, 13, 3, 1), texto: "Uma laje no centro do círculo, com marcas de velas queimadas. Alguém esteve aqui faz pouco tempo." },
      { nome: "banco_capela", area: celula(23, 13), texto: "Um banco de pedra, frio. Dá para ver a cidade lá embaixo." },
      { nome: "tumulos_cripta", area: celula(10, 11, 5, 1), texto: "Pedras em pé guardam a porta da cripta. Há cera derretida no chão." }
    ],
    saidas: [
      // Entrada/saída SUL: leva à estrada, perto da saída norte dela
      { area: celula(CX - 4, PORTAS.norteEntrada.y, 9, 1), para: "estrada", x: estrada.x, y: estrada.y, dir: "baixo" },
      // Continuação para a Zona Norte 2, pelo caminho aberto no limite norte
      { area: celula(25, 0, 7, 1), para: "zona_norte2", x: 36*TILE + TILE/2, y: 53*TILE + TILE/2, dir: "cima" },
      // Porta da capela da colina (norte): leva para dentro, onde fica o altar do Caos
      { area: celula(PORTAS.capela.x, PORTAS.capela.y), para: "capela", x: capelaDentro.x, y: capelaDentro.y, dir: "cima" }
    ],
    // Espíritos: cemitério, ruínas, clareira da fonte e arredores (mais longe da entrada que da capela)
    inimigos: [
      // cemitério
      { tipo: "espirito", ...px(40, 29) }, { tipo: "espirito", ...px(46, 30) }, { tipo: "espirito", ...px(43, 26) },
      { tipo: "espirito", ...px(44, 34) }, { tipo: "espirito", ...px(48, 29) },
      // ruínas
      { tipo: "espirito", ...px(45, 11) }, { tipo: "espirito", ...px(49, 11) }, { tipo: "espirito", ...px(45, 15) }, { tipo: "espirito", ...px(49, 15) },
      // clareira da fonte e trilha
      { tipo: "espirito", ...px(25, 21) }, { tipo: "espirito", ...px(32, 21) }, { tipo: "espirito", ...px(29, 27) },
      // caminho da cripta e praça da capela
      { tipo: "espirito", ...px(15, 12) }, { tipo: "espirito", ...px(19, 13) }, { tipo: "espirito", ...px(24, 14) }
    ],
    placas: [
      { texto: "BOSQUE NORTE", x: 20 * TILE + TILE / 2, y: 36 * TILE + 24, w: 300, h: 46, fonte: 26 },
      { texto: "CEMITÉRIO",    x: 33 * TILE + TILE / 2, y: 28 * TILE + 20, w: 190, h: 40, fonte: 22 }
    ],
    // Primeira visita: mostra o nome do lugar e anota no diário (as visitas seguintes não repetem)
    aoEntrar: function () {
      if (historia.visitouZonaNorte) return;
      historia.visitouZonaNorte = true;
      descobrirInfo("zona_norte");
      mostrarMensagem("Zona Norte");
    }
  };
})();
