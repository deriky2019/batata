/* =====================================================
   salas/zonaoeste.js - Zona Oeste (região urbana a oeste da cidade)
   Mapa de 64 x 52 tiles, montado com as ferramentas de js/tiles.js (igual à estrada, ao Bairro Sul,
   à Zona Leste e à Zona Norte). NESTA VERSÃO: só o cenário e as colisões. Sem missões, sem inimigos,
   sem NPCs, sem recompensas e sem eventos. Dá para andar por tudo e examinar objetos (texto na tela).

   COMO CHEGAR: o começo da avenida da estrada (lado oeste, linhas 18-26) leva para cá. A Dellalos aparece
   AQUI, na entrada leste (fim da avenida), e a saída leste daqui leva de volta para a estrada.
   Os dois pontos ficam em PORTAS (js/salas/_portas.js: oesteSaida e oesteEntrada).

   ONDE ESTÁ O QUÊ (em tiles, x = coluna, y = linha):
     avenida (horizontal) ........ linhas 20-24, de x 15 até x 63 (calçadas nas linhas 18-19 e 25-26)
     rua vertical ................ x 32-36 (calçadas x 30-31 e 37-38), fechada por obras nas pontas (y 1 e y 50)
     mansão abandonada ........... x 3-28, y 1-16 (muro em volta, portão aberto em x 16-17, jardim, fachada x 8-23)
     instalação subterrânea ...... x 1-14, y 17-27 (cercada: SÓ a estrutura externa; o portão fica fechado)
     Praça do Oeste .............. x 40-62, y 2-16 (lago no meio, bancos, postes, árvores e caminhos)
     área comercial .............. x 40-62, y 28-32 (4 lojas, portas trancadas; calçada na frente, y 33-37)
     terminal .................... x 39-62, y 36-50 (prédio do terminal, 2 plataformas com abrigos, faixa de ônibus y 42-46)
     bairro residencial .......... x 2-28, y 28-50 (8 casas em 2 fileiras, Rua das Acácias y 35-37 e Rua dos Ipês y 46-48)

   COMO MEXER NO FUTURO
     - NPC novo: acrescente em  npcs  (a cena ainda não tem a lista) e as falas em DIALOGOS (js/dialogos.js).
     - Inimigo novo: acrescente  inimigos: [{ tipo, x, y }]  e  combate: true  na cena (veja js/salas/zonaleste.js).
     - Casa / loja por dentro: troque o  texto  do interativo da porta por uma saída para uma cena nova
       (veja js/salas/casassul.js). As portas das casas e lojas já estão no mapa, trancadas.
     - Instalação subterrânea: a porta de aço (8, 23) e o portão (14, 20-24) já têm interativos; é só trocar o  texto
       por uma saída e abrir o portão no mapa.
   ===================================================== */

(function () {
  const COLS = 64, ROWS = 52;
  const m = criarMapa(COLS, ROWS);
  const CX = 34;                                // coluna do meio da rua vertical

  // ---------- Peças que se repetem ----------
  const poste = (x, y) => { por(m, "topo", x, y - 1, K(7, 6)); por(m, "obj", x, y, K(7, 7)); bloquear(m, x, y); };
  const banco = (x, y) => { por(m, "obj", x, y, K(3, 14)); bloquear(m, x, y); };
  const lixeira = (x, y) => { por(m, "obj", x, y, K(9, 10)); bloquear(m, x, y); };
  const caixaCorreio = (x, y) => { por(m, "obj", x, y, K(8, 11)); bloquear(m, x, y); };
  const canteiro = (x, y, n) => { por(m, "obj", x, y, K(4 + (n % 2), 11)); bloquear(m, x, y); };
  const caixote = (x, y, n) => { por(m, "obj", x, y, [K(3, 10), K(4, 10), K(5, 10), K(3, 11)][n % 4]); bloquear(m, x, y); };
  const barril = (x, y, n) => { por(m, "obj", x, y, [K(8, 9), K(9, 9), K(10, 9)][n % 3]); bloquear(m, x, y); };
  const cone = (x, y) => { por(m, "obj", x, y, K(5 + (x % 2), 9)); bloquear(m, x, y); };
  const cercaViva = (x0, x1, y, vaoX0, vaoX1) => {
    for (let x = x0; x <= x1; x++) {
      if (vaoX0 !== undefined && x >= vaoX0 && x <= vaoX1) continue;
      por(m, "obj", x, y, K(4 + (x % 3), 12)); bloquear(m, x, y);
    }
  };
  const cercaArame = (x0, x1, y) => {
    for (let x = x0; x <= x1; x++) { por(m, "obj", x, y, K(4 + (x % 3), 13)); bloquear(m, x, y); }
  };
  const cercaArameV = (x, y0, y1) => {
    for (let y = y0; y <= y1; y++) { por(m, "obj", x, y, K(4 + (y % 3), 13)); bloquear(m, x, y); }
  };
  const barreiraObra = (x, y) => { por(m, "obj", x, y, K(5 + (y % 2), 8)); bloquear(m, x, y); };
  // Placa de ponto de ônibus: topo em cima da Dellalos, base bloqueada (2 tiles de altura)
  const placaPonto = (x, y) => { por(m, "topo", x, y - 1, K(5, 6)); por(m, "obj", x, y, K(5, 7)); bloquear(m, x, y); };
  // Abrigo de ônibus: parede de vidro (3 x 2 tiles) + banco em frente
  const abrigo = (x, y, bancoY) => {
    for (let i = 0; i < 3; i++) { por(m, "obj", x + i, y, K(8 + i, 13)); por(m, "obj", x + i, y + 1, K(8 + i, 14)); }
    bloquear(m, x, y, 3, 2);
    banco(x + 1, bancoY);
  };
  // Carro/táxi (2 x 2 tiles do kit; o desenho começa na parte de baixo da linha de cima)
  const carro = (x, y, c0, r0) => {
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) por(m, "obj", x + i, y + j, K(c0 + i, r0 + j));
    bloquear(m, x, y, 2, 2);
  };

  // 1) Grama em tudo
  pintar(m, "chao", 0, 0, COLS, ROWS, GRAMA);

  // 2) Ruas: calçadas, asfalto da rua vertical e da avenida (a avenida acaba no portão da instalação, x 15)
  pintar(m, "chao", 15, 18, COLS - 15, 2, CALCADA);               // calçada de cima da avenida
  pintar(m, "chao", 15, 25, COLS - 15, 2, CALCADA);               // calçada de baixo
  pintar(m, "chao", CX - 4, 0, 2, ROWS, CALCADA);                 // calçadas da rua vertical
  pintar(m, "chao", CX + 3, 0, 2, ROWS, CALCADA);
  pintar(m, "chao", CX - 2, 0, 5, ROWS, ASFALTO);                 // rua vertical
  pintar(m, "chao", 15, 20, COLS - 15, 5, ASFALTO);               // avenida
  for (let x = 15; x < COLS; x++) if (x < CX - 2 || x > CX + 2) por(m, "chao", x, 22, TRACO_H);
  for (let y = 0; y < ROWS; y++) if (y < 20 || y > 24) por(m, "chao", CX, y, TRACO_V);
  // Pontas da rua vertical: barreira de obras (como no fim da rua do Bairro Sul)
  for (const y of [1, ROWS - 2]) {
    for (let x = CX - 4; x <= CX + 4; x++) {
      const asfalto = x >= CX - 2 && x <= CX + 2;
      por(m, "obj", x, y, asfalto ? K(5 + (x % 2), 8) : K(4 + (x % 3), 13));
      bloquear(m, x, y);
    }
  }
  pintar(m, "chao", 15, 17, 15, 1, CALCADA);                      // calçada larga na frente da mansão

  // ============ 3) INSTALAÇÃO SUBTERRÂNEA (x 1-14, y 17-27): só a estrutura externa, cercada e inacessível ============
  pintar(m, "chao", 1, 17, 14, 11, CALCADA);
  bloco9(m, "chao", 2, 19, 12, 7, bloco(8, 3));                   // laje de concreto com borda
  bloco9(m, "chao", 4, 20, 9, 4, bloco(8, 0));                    // bloco de concreto (a instalação)
  bloquear(m, 4, 20, 9, 4);
  por(m, "obj", 6, 22, K(9, 12)); por(m, "obj", 11, 22, K(10, 12));   // saídas de ar na parede
  por(m, "obj", 8, 23, K(15, 12));                                // porta de aço reforçada (bloqueada pelo bloco)
  for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) por(m, "obj", 8 + i, 24 + j, K(0 + i, 12 + j));   // escada que desce
  bloquear(m, 8, 24, 2, 3);
  cercaArame(1, 14, 17); cercaArame(1, 14, 27);
  cercaArameV(1, 18, 26);
  for (let y = 18; y <= 26; y++) {
    if (y >= 20 && y <= 24) barreiraObra(14, y);                  // portão da avenida: fechado com barreiras de obra
    else { por(m, "obj", 14, y, K(4 + (y % 3), 13)); bloquear(m, 14, y); }
  }
  cone(15, 21); cone(15, 23);                                     // do lado de fora do portão
  barril(3, 22, 0); barril(3, 23, 1); caixote(3, 25, 1); caixote(4, 25, 3); caixote(12, 19, 2); barril(12, 25, 2);
  cone(6, 26); cone(11, 26);
  poste(3, 19); poste(13, 19);

  // ============ 4) MANSÃO ABANDONADA (x 3-28, y 1-16): muro, portão, jardim e fachada ============
  // Jardim (mato e terra batida) e caminho do portão até a porta
  const TRILHA = K(1, 4);
  pintar(m, "chao", 15, 9, 3, 7, TRILHA);
  for (const [x, y, w, h] of [[4, 8, 4, 3], [24, 9, 4, 3], [5, 3, 3, 2], [25, 3, 3, 2]]) pintar(m, "chao", x, y, w, h, TRILHA);
  // Fachada: casarão de tijolo com telhado cinza, duas chaminés e porta dupla trancada
  predio(m, 8, 3, 16, 4, ESTILO_VERMELHO);
  for (const x of [11, 20]) { bloco9(m, "chao", x, 2, 2, 4, bloco(8, 0)); bloquear(m, x, 2, 2, 4); }   // chaminés
  const TJ = [JANELA2, K(12, 14), K(13, 14)];
  [9, 11, 13, 16, 18, 20, 22].forEach((x, n) => janela(m, x, 7, TJ[n % 3]));
  porta(m, 15, 8, PORTA_DUPLA_LARANJA, true);
  for (const x of [9, 11, 13, 18, 20, 22]) canteiro(x, 9, x);                                  // mato nas janelas
  // Muro em volta (tijolo), com o portão aberto no meio da frente (x 16-17)
  for (let x = 3; x <= 28; x++) { por(m, "obj", x, 1, K(18, 2)); bloquear(m, x, 1); }
  for (let y = 2; y <= 16; y++) for (const x of [3, 28]) { por(m, "obj", x, y, y === 16 ? K(18, 3) : K(18, 2)); bloquear(m, x, y); }
  for (let x = 3; x <= 28; x++) {
    if (x >= 15 && x <= 18) continue;                             // abertura do portão
    por(m, "obj", x, 15, K(18, 2)); por(m, "obj", x, 16, K(18, 3)); bloquear(m, x, 15, 1, 2);
  }
  // Pilares e folhas do portão (enferrujado, entreaberto): o caminho fica livre em x 16-17
  for (const x of [15, 18]) { por(m, "obj", x, 15, K(2, 10)); por(m, "obj", x, 16, K(2, 11)); bloquear(m, x, 15, 1, 2); }
  // Jardim: chafariz seco, bancos quebrados, canteiros, postes e árvores secas
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) por(m, "chao", 11 + i, 11 + j, K(11 + i, j));   // chafariz seco (pedra cinza com pedestal)
  bloquear(m, 11, 11, 2, 2);
  banco(21, 12); banco(23, 12); canteiro(20, 11, 0); canteiro(24, 11, 1);
  poste(14, 12); poste(19, 12);
  for (const [x, y, t] of [[5, 6, 2], [5, 12, 3], [7, 14, 2], [26, 6, 3], [26, 12, 2], [24, 14, 3]]) {
    if (!m.bloq[y * COLS + x] && m.obj[y * COLS + x] === -1) arvore(m, x, y, t);
  }

  // ============ 5) PRAÇA DO OESTE (x 40-62, y 2-16) ============
  pintar(m, "chao", 38, 17, COLS - 38, 1, CALCADA);               // calçada na frente da praça
  pintar(m, "chao", 40, 9, 23, 2, CALCADA);                       // caminho leste-oeste
  pintar(m, "chao", 50, 3, 2, 14, CALCADA);                       // caminho norte-sul (da entrada da avenida até o fundo)
  pintar(m, "chao", 47, 6, 8, 8, CALCADA);                        // praça central
  bloco9(m, "chao", 49, 8, 4, 3, bloco(8, 6)); bloquear(m, 49, 8, 4, 3);   // lago no meio
  cercaViva(40, 62, 16, 49, 52);                                  // cerca viva na frente, com entrada
  pintar(m, "chao", 39, 9, 1, 2, CALCADA);                        // o caminho leste-oeste chega até a calçada da rua
  for (let y = 3; y <= 15; y++) if (y !== 9 && y !== 10) { por(m, "obj", 40, y, K(4 + (y % 3), 12)); bloquear(m, 40, y); }
  for (const [x, y] of [[47, 8], [47, 11], [54, 8], [54, 11], [49, 6], [52, 13], [45, 10], [57, 10]]) banco(x, y);
  for (const [x, y] of [[47, 6], [54, 6], [47, 13], [54, 13], [44, 8], [58, 8], [44, 12], [58, 12]]) poste(x, y);
  for (const [x, y] of [[46, 13], [55, 13], [46, 6], [55, 6]]) lixeira(x, y);
  for (const x of [43, 44, 46, 55, 57, 58]) canteiro(x, 4, x);
  for (const [x, y] of [[43, 15], [58, 15]]) caixaCorreio(x, y);
  for (const [x, y, t] of [[42, 6, 0], [45, 15, 1], [42, 13, 1], [48, 4, 0], [53, 4, 1], [60, 6, 0], [60, 14, 2], [56, 15, 1], [61, 11, 1], [43, 11, 0]]) {
    if (!m.bloq[y * COLS + x] && m.obj[y * COLS + x] === -1 && m.chao[y * COLS + x] === GRAMA) arvore(m, x, y, t);
  }

  // ============ 6) ÁREA COMERCIAL (x 40-62, y 28-32): lojas pequenas de frente para a calçada ============
  const TEL = { bege: bloco(0, 3), cinza: bloco(8, 0), marrom: bloco(8, 3) };
  const FACH = {
    laranja:   [[K(17, 6), K(18, 6), K(19, 6)], [K(17, 7), K(18, 7), K(19, 7)]],
    vermelha:  [[K(17, 2), K(18, 2), K(19, 2)], [K(17, 3), K(18, 3), K(19, 3)]],
    laranja2:  [[K(20, 6), K(21, 6), K(22, 6)], [K(20, 7), K(21, 7), K(22, 7)]],
    vermelha2: [[K(20, 2), K(21, 2), K(22, 2)], [K(20, 3), K(21, 3), K(22, 3)]]
  };
  pintar(m, "chao", 39, 33, 24, 9, CALCADA);                      // calçada comercial + área de circulação do terminal
  cercaViva(40, 62, 27);                                          // cerca viva atrás das lojas
  const lojas = [
    { id: "padaria",  nome: "PADARIA",  x: 40, w: 6, porta: 41, vitrine: 43, tel: TEL.bege,   fach: FACH.laranja,   tp: PORTA_DUPLA_BRANCA },
    { id: "farmacia", nome: "FARMÁCIA", x: 47, w: 5, porta: 50, vitrine: 47, tel: TEL.cinza,  fach: FACH.vermelha2, tp: PORTA_DUPLA_BRANCA },
    { id: "mercado",  nome: "MERCADO",  x: 53, w: 5, porta: 54, vitrine: 55, tel: TEL.marrom, fach: FACH.laranja2,  tp: PORTA_DUPLA_LARANJA },
    { id: "cafe",     nome: "CAFÉ",     x: 59, w: 4, porta: 60, vitrine: -1, tel: TEL.bege,   fach: FACH.vermelha,  tp: PORTA_LARANJA }
  ];
  for (const l of lojas) {
    predio(m, l.x, 28, l.w, 3, { telhado: l.tel, fachada: l.fach });
    if (l.vitrine >= 0) for (let i = 0; i < 3; i++) { por(m, "obj", l.vitrine + i, 31, K(8 + i, 13)); por(m, "obj", l.vitrine + i, 32, K(8 + i, 14)); }
    else { janela(m, 61, 31, JANELA2); janela(m, 62, 31, JANELA2); janela(m, 59, 31, JANELA2); }
    porta(m, l.porta, 32, l.tp, true);                            // trancada: as lojas ainda não abrem
    caixaCorreio(l.porta + (l.porta - l.x < l.w / 2 ? -1 : 1), 34);   // (só enfeite na calçada)
  }
  // Mesas na calçada do café e bancos na frente das lojas
  banco(45, 34); banco(56, 34);
  for (const x of [41, 52, 58]) canteiro(x, 35, x);
  poste(46, 36); poste(52, 36); poste(40, 36);

  // ============ 7) TERMINAL (x 39-62, y 36-50): prédio, plataformas com abrigos e faixa de ônibus ============
  // Prédio do terminal (bilheteria, fechada)
  predio(m, 55, 36, 8, 2, { telhado: TEL.cinza, fachada: FACH.vermelha });
  for (const x of [56, 58, 60, 62]) janela(m, x, 38, JANELA2);
  porta(m, 59, 39, PORTA_DUPLA_BRANCA, true);
  // Faixa de ônibus (asfalto de x 37 a 62, y 42-46), ligada à rua vertical
  pintar(m, "chao", 37, 42, 26, 5, ASFALTO);
  for (let x = 39; x <= 61; x++) por(m, "chao", x, 44, TRACO_H);
  for (let y = 42; y <= 46; y++) barreiraObra(62, y);              // fim da faixa: barreira de obras
  // Plataforma sul (calçada)
  pintar(m, "chao", 39, 47, 24, 5, CALCADA);
  // Abrigos e pontos de ônibus: plataforma norte (y 38-41) e plataforma sul (y 47-50)
  abrigo(42, 38, 40); placaPonto(41, 40); lixeira(45, 40);
  abrigo(48, 38, 40); placaPonto(47, 40); lixeira(51, 40);
  abrigo(42, 50, 49); placaPonto(41, 49); lixeira(45, 49);
  abrigo(48, 50, 49); placaPonto(47, 49); lixeira(51, 49);
  abrigo(54, 50, 49); placaPonto(53, 49); lixeira(57, 49);
  poste(40, 41); poste(54, 41); poste(40, 48); poste(60, 48);
  // Veículos parados nas vagas da faixa de ônibus (táxi e carros do kit)
  carro(58, 42, 15, 14);                                           // táxi
  carro(44, 45, 15, 16);                                           // carro vermelho
  carro(52, 45, 21, 16);                                           // van verde

  // ============ 8) BAIRRO RESIDENCIAL (x 2-28, y 28-50): 2 fileiras de casas, 2 ruas ============
  cercaViva(15, 29, 27);                                           // cerca viva embaixo da calçada da avenida (a instalação tem cerca própria)
  pintar(m, "chao", 2, 33, 28, 2, CALCADA);                       // calçadas da Rua das Acácias
  pintar(m, "chao", 2, 38, 28, 1, CALCADA);
  pintar(m, "chao", 2, 35, 28, 3, ASFALTO);                       // Rua das Acácias
  for (let x = 2; x < 30; x++) por(m, "chao", x, 36, TRACO_H);
  pintar(m, "chao", 2, 44, 28, 2, CALCADA);                       // calçadas da Rua dos Ipês
  pintar(m, "chao", 2, 49, 28, 3, CALCADA);
  pintar(m, "chao", 2, 46, 28, 3, ASFALTO);                       // Rua dos Ipês
  for (let x = 2; x < 30; x++) por(m, "chao", x, 47, TRACO_H);
  cercaViva(2, 29, 39);                                            // cerca viva atrás da fileira de baixo
  const casas = [];
  function casa(c) {
    predio(m, c.x, c.y, c.w, c.hT, { telhado: c.tel, fachada: c.fach });
    const yJ = c.y + c.hT, yP = c.y + c.hT + 1;
    for (const jx of c.janelas) janela(m, jx, yJ, c.tj);
    porta(m, c.px, yP, c.tp, true);                                // trancada: as casas ainda não abrem
    for (const jx of c.janelas) canteiro(jx, yP, jx);              // canteiros embaixo das janelas
    caixaCorreio(c.px + 2, yP + 1);
    casas.push({ id: c.id, px: c.px, py: yP, x: c.x, y: c.y, w: c.w, hT: c.hT });
  }
  // Fileira de cima (de frente para a Rua das Acácias), portas na linha 32
  casa({ id: "casa_oeste_1", x: 2,  y: 28, w: 7, hT: 3, tel: TEL.bege,   fach: FACH.vermelha,  tp: PORTA_LARANJA,       px: 5,  janelas: [3, 7],   tj: JANELA });
  casa({ id: "casa_oeste_2", x: 10, y: 28, w: 6, hT: 3, tel: TEL.marrom, fach: FACH.laranja,   tp: PORTA_DUPLA_LARANJA, px: 13, janelas: [11, 14], tj: JANELA2 });
  casa({ id: "casa_oeste_3", x: 17, y: 28, w: 6, hT: 3, tel: TEL.cinza,  fach: FACH.laranja2,  tp: PORTA_DUPLA_BRANCA,  px: 20, janelas: [18, 21], tj: K(12, 14) });
  casa({ id: "casa_oeste_4", x: 24, y: 28, w: 5, hT: 3, tel: TEL.marrom, fach: FACH.vermelha2, tp: PORTA_LARANJA,       px: 26, janelas: [25, 27], tj: K(13, 14) });
  // Fileira de baixo (de frente para a Rua dos Ipês), portas na linha 43
  casa({ id: "casa_oeste_5", x: 2,  y: 40, w: 7, hT: 2, tel: TEL.cinza,  fach: FACH.laranja,   tp: PORTA_DUPLA_BRANCA,  px: 5,  janelas: [3, 7],   tj: JANELA2 });
  casa({ id: "casa_oeste_6", x: 10, y: 40, w: 6, hT: 2, tel: TEL.bege,   fach: FACH.laranja2,  tp: PORTA_DUPLA_LARANJA, px: 13, janelas: [11, 14], tj: JANELA });
  casa({ id: "casa_oeste_7", x: 17, y: 40, w: 6, hT: 2, tel: TEL.marrom, fach: FACH.vermelha,  tp: PORTA_LARANJA,       px: 20, janelas: [18, 21], tj: K(13, 14) });
  casa({ id: "casa_oeste_8", x: 24, y: 40, w: 5, hT: 2, tel: TEL.bege,   fach: FACH.vermelha2, tp: PORTA_DUPLA_BRANCA,  px: 26, janelas: [25, 27], tj: K(12, 14) });
  // Postes, bancos e carros pelas ruas
  for (const [x, y] of [[4, 34], [11, 34], [18, 34], [25, 34], [4, 45], [11, 45], [18, 45], [25, 45]]) poste(x, y);
  banco(8, 38); banco(22, 38); banco(8, 49); banco(22, 49);
  carro(9, 36, 15, 16);                                            // carro vermelho na Rua das Acácias
  carro(24, 47, 21, 16);                                           // van verde na Rua dos Ipês
  // Árvores entre as casas e nos quintais
  for (const [x, y, t] of [[9, 31, 0], [16, 31, 1], [23, 31, 0], [29, 31, 1], [9, 43, 1], [16, 43, 0], [23, 43, 1], [29, 43, 0]]) {
    if (dentro(m, x, y) && !m.bloq[y * COLS + x] && m.obj[y * COLS + x] === -1 && m.chao[y * COLS + x] === GRAMA) arvore(m, x, y, t);
  }

  // 9) Borda de árvores em volta do mapa (sem bloquear ruas nem calçadas)
  for (let x = 0; x < COLS; x++) {
    const tipo = x % 4;
    if (m.chao[2 * COLS + x] === GRAMA && !m.bloq[2 * COLS + x] && m.obj[2 * COLS + x] === -1) arvore(m, x, 2, tipo);
    if (m.chao[(ROWS - 1) * COLS + x] === GRAMA && !m.bloq[(ROWS - 1) * COLS + x] && m.obj[(ROWS - 1) * COLS + x] === -1) arvore(m, x, ROWS - 1, tipo);
  }
  for (let y = 5; y < ROWS - 3; y += 3) {
    for (const x of [0, COLS - 1]) {
      const k = y * COLS + x, k2 = (y - 2) * COLS + x;
      if (m.chao[k] === GRAMA && m.chao[k2] === GRAMA && !m.bloq[k] && m.obj[k] === -1 && m.obj[k2] === -1) arvore(m, x, y, (y + (x ? 1 : 0)) % 4);
    }
  }

  // ---------- Pontos de entrada e saída ----------
  // Chegando pela avenida (leste): 3 tiles para dentro, olhando para o oeste
  const entradaLeste = { x: (PORTAS.oesteEntrada.x - 3) * TILE + TILE / 2, y: PORTAS.oesteEntrada.y * TILE + 40 };
  // Voltando para a estrada: 3 tiles para dentro da avenida dela, olhando para o leste (longe da saída: sem ciclo)
  const estradaVolta = { x: (PORTAS.oesteSaida.x + 3) * TILE + TILE / 2, y: PORTAS.oesteSaida.y * TILE + 40 };

  const txt = (nome, x, y, w, h, texto) => ({ nome, area: celula(x, y, w, h), texto });

  CENAS.zona_oeste = {
    mapa: m,
    spawn: entradaLeste,
    // Sem  npcs,  sem  inimigos  e sem  combate  nesta versão (veja o comentário lá em cima para acrescentar)
    interativos: [
      // --- Instalação subterrânea (só a parte de fora) ---
      txt("portao_instalacao", 14, 20, 1, 5, "Um portão de obras fechado com barreiras. Há um aviso: ACESSO RESTRITO. Não dá para passar."),
      txt("cerca_instalacao", 1, 17, 14, 1, "Uma cerca alta de arame. Do outro lado há uma estrutura de concreto."),
      txt("porta_instalacao", 8, 23, 1, 1, "Uma porta de aço reforçada, lacrada. Ninguém abre isso por fora."),
      txt("escada_instalacao", 8, 24, 2, 3, "Uma escada de concreto que desce para baixo da terra. Dá para sentir um ar frio subindo."),
      txt("ventilacao_instalacao", 4, 20, 9, 3, "Uma construção de concreto sem janelas. Ouve-se um zumbido baixo lá dentro."),
      // --- Mansão abandonada ---
      txt("portao_mansao", 15, 15, 4, 2, "O portão da mansão está enferrujado e entreaberto. Dá para entrar no jardim."),
      { nome: "porta_mansao", area: celula(15, 8, 1, 1), conversar: function () {
          if (historia.mansaoAberta) { entrarNaMansao(); return; }       // js/salas/mansao.js (precisa da lanterna)
          if (temItem("chave_mansao")) {
            tirarItem("chave_mansao");                 // a chave foi usada: libera o espaço do inventário
            historia.mansaoAberta = true;
            mostrarMensagem("A chave girou no cadeado e a corrente caiu. A porta cedeu.");
            if (historia.comprouLanterna) entrarNaMansao();
            else mostrarMensagem("Lá dentro está um breu. Preciso de uma lanterna. Será que o Seu Tomás vende alguma?");
            return;
          }
          if (historia.augustoPista2) { mostrarMensagem("A porta está presa por uma corrente com um cadeado antigo. A chave deve estar na fábrica."); return; }
          mostrarMensagem("A porta da mansão está trancada com uma corrente velha. Ninguém entra aí há muito tempo.");
        } },
      txt("fachada_mansao", 8, 7, 16, 2, "As janelas da mansão estão sujas e algumas tábuas estão soltas. A casa parece abandonada há anos."),
      txt("chafariz_mansao", 11, 11, 2, 2, "Um chafariz seco, cheio de folhas. Já foi bonito um dia."),
      txt("bancos_mansao", 21, 12, 3, 1, "Bancos de jardim quebrados, cobertos de musgo."),
      txt("muro_mansao", 3, 1, 26, 1, "Um muro alto de tijolos, coberto de hera seca. Não dá para escalar."),
      // --- Praça do Oeste ---
      txt("lago_praca", 49, 8, 4, 3, "O lago da praça tem água parada. Folhas boiam na superfície."),
      txt("bancos_praca_1", 47, 8, 1, 1, "Um banco da praça. Dá para ouvir o movimento da avenida daqui."),
      txt("bancos_praca_2", 54, 8, 1, 1, "Um banco bem cuidado, com vista para o lago."),
      txt("canteiros_praca", 43, 4, 16, 1, "Canteiros com flores de várias cores."),
      // --- Área comercial ---
      ...lojas.map((l) => txt("porta_" + l.id, l.porta, 32, 1, 1,
        l.id === "padaria" ? "A padaria ainda está fechada. Sente-se um cheiro de pão no ar."
        : l.id === "farmacia" ? "A farmácia está fechada por enquanto."
        : l.id === "mercado" ? "O mercadinho ainda não abriu. Há caixas empilhadas atrás do vidro."
        : "O café está fechado. Cadeiras viradas sobre as mesas, lá dentro.")),
      // --- Terminal ---
      txt("porta_terminal", 59, 39, 1, 1, "A bilheteria do terminal está fechada por enquanto."),
      txt("pontos_norte", 41, 40, 11, 1, "Um ponto de ônibus. A placa mostra linhas que a Dellalos ainda não conhece."),
      txt("pontos_sul", 41, 49, 14, 1, "Outro ponto de ônibus. O banco está um pouco desgastado."),
      txt("taxi", 58, 42, 2, 2, "Um táxi parado, com o motorista ausente."),
      txt("barreira_terminal", 62, 42, 1, 5, "A faixa dos ônibus está bloqueada por obras."),
      // --- Bairro residencial ---
      ...casas.map((c) => txt("porta_" + c.id, c.px, c.py, 1, 1, "A porta está trancada. Parece que não há ninguém em casa.")),
      // --- Ruas ---
      txt("obra_norte", 30, 1, 9, 1, "Rua em obras. Por enquanto não dá para seguir por aqui."),
      txt("obra_sul", 30, ROWS - 2, 9, 1, "Rua em obras. Por enquanto não dá para seguir por aqui.")
    ],
    saidas: [
      // Saída oeste para a planície vazia Oeste 2.
      { area: celula(0, 36, 1, 10), para: "zona_oeste2", x: 97 * TILE + TILE / 2, y: 41 * TILE + TILE / 2, dir: "esquerda" },
      // Entrada/saída LESTE: o fim da avenida (calçadas + asfalto, 9 tiles) leva de volta à estrada
      { area: celula(PORTAS.oesteEntrada.x, 18, 1, 9), para: "estrada", x: estradaVolta.x, y: estradaVolta.y, dir: "direita" }
    ],
    placas: [
      { texto: "ZONA OESTE",     x: 58 * TILE + TILE / 2, y: 17 * TILE + 32, w: 230, h: 46, fonte: 26 },
      { texto: "PRAÇA DO OESTE", x: 46 * TILE + TILE / 2, y: 16 * TILE + 32, w: 250, h: 40, fonte: 22 },
      { texto: "ACESSO RESTRITO", x: 8 * TILE + TILE / 2,  y: 19 * TILE + 32, w: 250, h: 40, fonte: 22 },
      { texto: "PROPRIEDADE PARTICULAR", x: 24 * TILE, y: 17 * TILE + 32, w: 340, h: 40, fonte: 20 },
      { texto: "PADARIA",        x: 43 * TILE, y: 30 * TILE + 24, w: 150, h: 40, fonte: 22 },
      { texto: "FARMÁCIA",       x: 49 * TILE + TILE / 2, y: 30 * TILE + 24, w: 170, h: 40, fonte: 22 },
      { texto: "MERCADO",        x: 55 * TILE + TILE / 2, y: 30 * TILE + 24, w: 160, h: 40, fonte: 22 },
      { texto: "CAFÉ",           x: 61 * TILE, y: 30 * TILE + 24, w: 110, h: 40, fonte: 22 },
      { texto: "TERMINAL",       x: 59 * TILE, y: 37 * TILE + 24, w: 200, h: 40, fonte: 24 },
      { texto: "BAIRRO RESIDENCIAL", x: 15 * TILE, y: 26 * TILE + 32, w: 300, h: 40, fonte: 22 }
    ],
    // Primeira visita: mostra o nome do lugar e anota no diário (as visitas seguintes não repetem)
    aoEntrar: function () {
      if (historia.seloQuebrado && !historia.avisouDemonios) {      // primeira vez fora da mansão depois que o selo quebrou
        historia.avisouDemonios = true;
        abrirDialogo(DIALOGOS.mansao.demonios);
      }
      if (diario.infos.zona_oeste) return;
      descobrirInfo("zona_oeste");
      mostrarMensagem("Zona Oeste");
    }
  };

  // Depois que o selo se quebra (historia.seloQuebrado; js/salas/mansao.js) a Zona Oeste ganha demônios
  const demoniosOeste = [[10, 13], [22, 13], [15, 18], [30, 15]].map((t) => ({ tipo: "demonio", x: t[0] * TILE + TILE / 2, y: t[1] * TILE + TILE - 6 }));
  // (o combate da Zona Oeste já é ligado em js/thaina.js e js/dia10.js: não redefina "combate" aqui, só "inimigos")
  Object.defineProperty(CENAS.zona_oeste, "inimigos", { get: function () { return historia.seloQuebrado ? demoniosOeste : []; } });

  window.CASAS_OESTE = casas;                     // { id, px, py, x, y, w, hT } de cada casa (para futuros interiores)
})();
