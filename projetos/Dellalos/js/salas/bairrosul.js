/* =====================================================
   salas/bairrosul.js - Bairro Sul (região residencial ao sul da cidade)
   Mapa de 48 x 40 tiles, montado com as ferramentas de js/tiles.js (igual à estrada).
   Sem inimigos nesta versão: o foco é explorar, conversar e (no futuro) missões secundárias.

   COMO CHEGAR: a rua vertical da estrada continua para o sul. Ao chegar no fim dela
   (saída sul, em js/salas/estrada.js) a Dellalos aparece AQUI, na entrada norte, e a saída
   norte deste mapa leva de volta para a estrada, perto da saída sul. Os dois pontos ficam
   em PORTAS (js/salas/_portas.js).

   ONDE ESTÁ O QUÊ (em tiles, x = coluna, y = linha):
     rua principal (vertical) .... x 20-28, de cima até a barreira (linha 36)
     Rua das Flores .............. linhas 12-18 (calçada, asfalto, calçada)
     Rua do Jardim ............... linhas 26-32
     casas da fileira de cima .... 4 casas, portas na linha 9, de frente para a Rua das Flores
     casas da fileira de baixo ... 2 casas, portas na linha 23, de frente para a Rua do Jardim
     praça com fonte ............. x 31-45, y 20-24 (fonte no meio, x 38-39)
     jardim da Helena ............ x 2-17, y 33-36
     terreno do Pedro ............ x 30-46, y 33-36

   COMO ADICIONAR COISAS NO FUTURO
     - Morador novo: acrescente um  morador({...})  na lista npcs (no fim do arquivo) e as falas
       em DIALOGOS (js/dialogos.js). A chave do personagem em PERSONAGENS (js/personagens.js)
       é o mesmo nome usado em  quem  nas falas.
     - Missão secundária: faça como o Pescador / a Clarice em js/salas/estrada.js: troque o
       conversar do NPC para escolher entre as listas de falas (oferta, lembrar, concluir) e
       acrescente a missão em MISSOES (js/missoes.js).
     - Objeto examinável / segredo: acrescente em  interativos  { nome, area: celula(x,y), texto }
       (ou  conversar: function () {...}  para dar um item com darItem()).
     - Casas por dentro: troque o  texto  do interativo da porta por um  destino  para uma cena
       nova (veja o quarto do pai em js/salas/quartopai.js) e destranque a porta no mapa.
   ===================================================== */

(function () {
  const COLS = 48, ROWS = 40;
  const DX_INTERNO = 5;                         // coluna da porta dentro de TODAS as casas (casassul.js usa o mesmo número)
  const m = criarMapa(COLS, ROWS);
  const CX = PORTAS.bairroNorte.x;             // coluna do meio da rua principal (24)

  // 1) Grama em tudo
  pintar(m, "chao", 0, 0, COLS, ROWS, GRAMA);

  // 2) Ruas: duas ruas de lado a lado e a rua principal, de cima até quase embaixo
  const RUA_FIM = 37;                          // a rua principal chega à passagem para o Sul 2
  for (const y of [12, 17, 26, 31]) pintar(m, "chao", 0, y, COLS, 2, CALCADA);   // calçadas das ruas de lado a lado
  pintar(m, "chao", CX - 4, 0, 2, RUA_FIM, CALCADA);                              // calçadas da rua principal
  pintar(m, "chao", CX + 3, 0, 2, RUA_FIM, CALCADA);
  pintar(m, "chao", 0, 14, COLS, 3, ASFALTO);                                     // Rua das Flores
  pintar(m, "chao", 0, 28, COLS, 3, ASFALTO);                                     // Rua do Jardim
  pintar(m, "chao", CX - 2, 0, 5, RUA_FIM, ASFALTO);                              // rua principal
  for (let x = 0; x < COLS; x++) if (x < CX - 4 || x > CX + 4) { por(m, "chao", x, 15, TRACO_H); por(m, "chao", x, 29, TRACO_H); }
  for (let y = 0; y < RUA_FIM; y++) if ((y < 14 || y > 16) && (y < 28 || y > 30)) por(m, "chao", CX, y, TRACO_V);

  // Fim da rua principal: barreira de obras (reserva para uma região futura mais ao sul)
  for (let x = CX - 4; x <= CX + 4; x++) {
    if (x >= CX - 2 && x <= CX + 2) continue; // corredor aberto para a nova região Sul 2
    por(m, "obj", x, RUA_FIM - 1, K(4 + (x % 3), 13));
    bloquear(m, x, RUA_FIM - 1);
  }

  // ---------- Peças que se repetem ----------
  const poste = (x, y) => { por(m, "topo", x, y - 1, K(7, 6)); por(m, "obj", x, y, K(7, 7)); bloquear(m, x, y); };
  const banco = (x, y) => { por(m, "obj", x, y, K(3, 14)); bloquear(m, x, y); };
  const caixaCorreio = (x, y) => { por(m, "obj", x, y, K(8, 11)); bloquear(m, x, y); };
  const canteiro = (x, y, n) => { por(m, "obj", x, y, K(4 + (n % 2), 11)); bloquear(m, x, y); };
  const cercaMadeira = (x0, x1, y, vaoX) => {
    for (let x = x0; x <= x1; x++) {
      if (x === vaoX) continue;                // o vão é o caminho até a porta
      por(m, "obj", x, y, K(4 + (x % 3), 14)); bloquear(m, x, y);
    }
  };
  const cercaViva = (x0, x1, y, vaoX0, vaoX1) => {
    for (let x = x0; x <= x1; x++) {
      if (vaoX0 !== undefined && x >= vaoX0 && x <= vaoX1) continue;
      por(m, "obj", x, y, K(4 + (x % 3), 12)); bloquear(m, x, y);
    }
  };

  // 3) Casas (só por fora nesta versão). Cada uma tem telhado + fachada + janelas + porta diferentes.
  const TEL = { bege: bloco(0, 3), cinza: bloco(8, 0), marrom: bloco(8, 3) };
  const FACH = {
    laranja:  [[K(17, 6), K(18, 6), K(19, 6)], [K(17, 7), K(18, 7), K(19, 7)]],
    vermelha: [[K(17, 2), K(18, 2), K(19, 2)], [K(17, 3), K(18, 3), K(19, 3)]],
    laranja2: [[K(20, 6), K(21, 6), K(22, 6)], [K(20, 7), K(21, 7), K(22, 7)]],
    vermelha2:[[K(20, 2), K(21, 2), K(22, 2)], [K(20, 3), K(21, 3), K(22, 3)]]
  };

  // casa({ x, y, w, hT, telhado, fachada, porta, portaX, janelas, tileJanela, nome })
  // y = linha de cima do telhado; a porta fica na última linha da casa (y + hT + 1)
  const casas = [];
  function casa(c) {
    predio(m, c.x, c.y, c.w, c.hT, { telhado: c.telhado, fachada: c.fachada });
    const yJanela = c.y + c.hT, yPorta = c.y + c.hT + 1;
    for (const jx of c.janelas) janela(m, jx, yJanela, c.tileJanela);
    porta(m, c.portaX, yPorta, c.porta, false);                        // aberta: leva ao interior (js/salas/casassul.js)
    pintar(m, "chao", c.portaX, yPorta + 1, 1, 2, CALCADA);            // caminho até a calçada
    casas.push({ id: c.id, nome: c.nome, portaX: c.portaX, portaY: yPorta });
  }

  // Fileira de cima (de frente para a Rua das Flores)
  casa({ id: "casa_sul_lucia", nome: "Dona Lúcia",  x: 3,  y: 5, w: 8, hT: 3, telhado: TEL.bege,   fachada: FACH.vermelha,  porta: PORTA_LARANJA,        portaX: 6,  janelas: [4, 8],   tileJanela: JANELA });
  casa({ id: "casa_sul_vazia", nome: "",            x: 12, y: 5, w: 7, hT: 3, telhado: TEL.marrom, fachada: FACH.laranja,    porta: PORTA_DUPLA_LARANJA,  portaX: 15, janelas: [13, 17], tileJanela: JANELA2 });
  casa({ id: "casa_sul_augusto", nome: "Seu Augusto", x: 31, y: 5, w: 8, hT: 3, telhado: TEL.cinza,  fachada: FACH.laranja2,   porta: PORTA_DUPLA_BRANCA,   portaX: 34, janelas: [32, 36], tileJanela: K(12, 14) });
  casa({ id: "casa_sul_caio", nome: "Caio",        x: 40, y: 5, w: 7, hT: 3, telhado: TEL.marrom, fachada: FACH.vermelha2,  porta: PORTA_LARANJA,        portaX: 43, janelas: [41, 45], tileJanela: K(13, 14) });
  // Fileira de baixo (de frente para a Rua do Jardim), telhado mais baixo
  casa({ id: "casa_sul_helena", nome: "Helena",      x: 2,  y: 20, w: 7, hT: 2, telhado: TEL.cinza,  fachada: FACH.laranja,  porta: PORTA_DUPLA_BRANCA,   portaX: 5,  janelas: [3, 7],   tileJanela: JANELA2 });
  casa({ id: "casa_sul_pedro", nome: "Pedro",       x: 11, y: 20, w: 8, hT: 2, telhado: TEL.bege,   fachada: FACH.laranja2, porta: PORTA_DUPLA_LARANJA,  portaX: 14, janelas: [12, 16], tileJanela: JANELA });

  // Jardins da frente: cerca de madeira com vão no caminho, caixa de correio e canteiros
  for (const [x0, x1, vao, y] of [[3, 10, 6, 11], [12, 18, 15, 11], [31, 38, 34, 11], [40, 46, 43, 11], [2, 8, 5, 25], [11, 18, 14, 25]]) {
    cercaMadeira(x0, x1, y, vao);
    caixaCorreio(vao + 2, y);                                          // substitui o pedaço de cerca ao lado do caminho
  }
  for (const [x, y, n] of [[4, 10, 0], [5, 10, 1], [13, 10, 1], [37, 10, 0], [41, 10, 1], [3, 24, 0], [16, 24, 1]]) canteiro(x, y, n);
  for (const x of [4, 8, 13, 17, 32, 36, 41, 45]) canteiro(x, 9, x);   // canteiros embaixo das janelas de cima (sobre a fachada)

  // 4) Praça com fonte, bancos, postes e árvores (x 31-45, y 20-24)
  pintar(m, "chao", 31, 20, 15, 5, CALCADA);
  pintar(m, "chao", 29, 22, 2, 2, CALCADA);                            // entrada pela rua principal
  por(m, "chao", 38, 21, K(11, 6)); por(m, "chao", 39, 21, K(12, 6));   // fonte 2x2 (água com estátua no meio)
  por(m, "chao", 38, 22, K(11, 7)); por(m, "chao", 39, 22, K(12, 7));
  bloquear(m, 38, 21, 2, 2);
  cercaViva(31, 45, 19, 37, 39);                                       // cerca viva ao norte, com entrada
  cercaViva(31, 45, 25, 37, 39);                                       // e ao sul
  banco(34, 22); banco(42, 22); banco(38, 20);
  poste(31, 20); poste(45, 20); poste(31, 24); poste(45, 24);

  // 5) Postes e bancos pelas ruas
  for (const [x, y] of [[20, 4], [28, 4], [20, 10], [28, 10], [20, 22], [28, 22], [20, 34], [28, 34]]) poste(x, y);   // rua principal
  for (const [x, y] of [[9, 13], [17, 13], [36, 13], [45, 13], [9, 27], [17, 27], [36, 27], [45, 27]]) poste(x, y);    // ruas de lado a lado
  banco(11, 18); banco(33, 18); banco(11, 32); banco(40, 32);

  // 6) Jardim da Helena (canteiros em duas fileiras, com o corredor no meio)
  cercaViva(2, 17, 33, 8, 10);                                         // cerca viva com entrada
  for (const x of [3, 5, 12, 14, 16]) { canteiro(x, 34, x); canteiro(x, 36, x + 1); }
  canteiro(7, 36, 0);  canteiro(11, 36, 1);

  // 7) Terreno do Pedro (caixotes velhos, onde ele procura coisas)
  for (const [x, y, t] of [[35, 34, K(3, 10)], [36, 34, K(3, 10)], [36, 35, K(3, 11)], [41, 35, K(3, 10)]]) {
    por(m, "obj", x, y, t); bloquear(m, x, y);
  }

  // 8) Borda de árvores em volta do mapa (sem bloquear ruas)
  for (let x = 0; x < COLS; x++) {
    const tipo = x % 4;
    if (m.chao[2 * COLS + x] === GRAMA) arvore(m, x, 2, tipo);
    if (m.chao[(ROWS - 1) * COLS + x] === GRAMA) arvore(m, x, ROWS - 1, tipo);
  }
  for (let y = 5; y < ROWS - 3; y += 3) {
    if (m.chao[y * COLS + 0] === GRAMA && m.chao[(y - 2) * COLS + 0] === GRAMA && !m.bloq[y * COLS]) arvore(m, 0, y, y % 4);
    if (m.chao[y * COLS + COLS - 1] === GRAMA && m.chao[(y - 2) * COLS + COLS - 1] === GRAMA && !m.bloq[y * COLS + COLS - 1]) arvore(m, COLS - 1, y, (y + 1) % 4);
  }

  // 9) Árvores colocadas à mão (entre as casas, na praça e nos cantos): nada atrapalha caminhos nem NPCs
  const arvores = [
    [11, 9, 0], [19, 9, 1], [29, 9, 2], [39, 9, 3], [1, 9, 1],                 // entre as casas de cima
    [9, 23, 2], [19, 23, 0], [1, 23, 3],                                       // entre as casas de baixo
    [35, 24, 1], [41, 24, 3],                                                  // na praça
    [1, 36, 0], [18, 36, 2],                                                   // cantos do jardim da Helena
    [31, 36, 1], [39, 36, 0], [45, 34, 2]                                      // terreno do Pedro
  ];
  for (const [x, y, t] of arvores) {
    if (dentro(m, x, y) && !m.bloq[y * COLS + x] && m.obj[y * COLS + x] === -1) arvore(m, x, y, t);
  }

  // ---------- Moradores (posições fixas; usam sprites genéricos que podem se repetir) ----------
  // morador({ nome, dialogo, flag, x, y (tile), cor, direcao })
  //   dialogo -> chave em DIALOGOS (js/dialogos.js) com as listas  primeira  e  depois
  //   imagem  -> lista de caminhos (veja SPR abaixo)
  //   flag    -> chave em historia que marca "já conversou" (as próximas conversas usam  depois)
  function morador(c) {
    return {
      nome: c.nome,
      cor: c.cor,
      imagem: c.imagem,                                                // sprite (assets/npcs/*, feitos com o pacote Modern Interiors)
      quadro: { linha: 0, coluna: 0 },
      // Moradores comuns passeiam pelo bairro e podem visitar outras regiões públicas.
      // NPCs roteirizados importantes continuam usando suas próprias definições, fora deste helper.
      andar: c.andar || { raioX: 220, raioY: 150, velocidade: 30, relativo: true, quadros: [0, 1, 2, 3] },
      viajarRegioes: c.viajarRegioes !== false,
      regioesPermitidas: c.regioesPermitidas,
      direcao: c.direcao || "baixo",
      x: c.x * TILE + TILE / 2,
      y: c.y * TILE + 58,                                              // pés perto da base do tile
      conversar: function () {
        const falas = DIALOGOS[c.dialogo];
        if (historia[c.flag]) {
          const especial = c.especial ? c.especial() : null;      // conversa de história (ex.: Dona Lúcia, dia 5+)
          if (especial) abrirDialogo(especial.falas, especial.fim);
          else abrirDialogo(falas.depois);
        }
        else abrirDialogo(falas.primeira, function () { historia[c.flag] = true; });
        // FUTURO: aqui entram missões secundárias (veja o Pescador em js/salas/estrada.js)
      }
    };
  }

  // Sprites do pacote Modern Interiors (LimeZu, versão grátis), convertidos para a folha 4x4 do jogo.
  // A Dona Lúcia é a Amelia com cabelo grisalho. Para trocar um morador, mude só a linha "imagem" dele.
  const SPR = {
    lucia:   ["assets/npcs/lucia.png"],
    augusto: ["assets/npcs/bob.png"],
    caio:    ["assets/npcs/adam.png"],
    helena:  ["assets/npcs/amelia.png"],
    pedro:   ["assets/npcs/alex.png"]
  };

  // Voltando para a estrada: 2 tiles ANTES da saída sul (a saída fica na última linha da estrada)
  const estrada = { x: PORTAS.bairroSul.x * TILE + TILE / 2, y: (PORTAS.bairroSul.y - 2) * TILE + 40 };

  CENAS.bairro_sul = {
    mapa: m,
    spawn: { x: CX * TILE + TILE / 2, y: (PORTAS.bairroNorte.y + 3) * TILE + 40 },
    // Sem  combate  e sem  inimigos: bairro tranquilo
    npcs: [
      morador({ nome: "Dona Lúcia",  dialogo: "lucia",   flag: "conheceuLucia",
            especial: function () {                      // dia 5+: a história do avô e dos amigos; depois, uma fala nova
              if (historia.luciaContouEspiritos) {
                if (!historia.pegouRetrato) return { falas: DIALOGOS.lucia.retrato, fim: receberRetratoDaLucia };   // js/itens.js
                return { falas: DIALOGOS.lucia.depoisEspiritos };
              }
              if (diaAtual() >= 5) return { falas: DIALOGOS.lucia.espiritos, fim: function () { historia.luciaContouEspiritos = true; if (historia.viuJPMLR) historia.entendeuJPMLR = true; receberRetratoDaLucia(); } };
              return null;
            },   x: 8,  y: 10, cor: "#8a5a7a", direcao: "esquerda", imagem: SPR.lucia }),
      morador({ nome: "Seu Augusto", dialogo: "augusto", flag: "conheceuAugusto",
            especial: function () {                      // pistas em etapas: caixas (depois da seita) -> zelador (depois da ordem da fábrica) -> chave na fábrica
              const D = DIALOGOS.augusto;
              const sp = passageirosSulAugusto();        // "A casa vazia" (js/missoes.js)
              if (sp) return sp;
              // Rumor do dia (só história): um por dia, só quando ele não tem pista nova para dar. Sem rumor hoje = fala de sempre.
              const dia = diaAtual();
              const rumor = (D.rumores[dia] && historia.augustoRumorDia !== dia)
                ? { falas: D.rumores[dia], fim: function () { historia.augustoRumorDia = dia; } } : null;
              if (!historia.augustoPista1) {
                if (historia.revelouSeita && diaAtual() >= DIA_SEITA) return { falas: D.pista1, fim: function () { historia.augustoPista1 = true; } };
                return rumor;
              }
              if (!historia.augustoPista2) {
                if (historia.pegouOrdemFabrica) return { falas: D.pista2, fim: function () { historia.augustoPista2 = true; } };
                return rumor || { falas: D.depoisPistas };
              }
              if (!historia.augustoPista3) return { falas: D.pista3, fim: function () { historia.augustoPista3 = true; } };
              return rumor || { falas: D.depoisPistas };
            },   x: 36, y: 10, cor: "#5a6a8a", direcao: "esquerda", imagem: SPR.augusto }),
      morador({ nome: "Caio",        dialogo: "caio",    flag: "conheceuCaio",    x: 38, y: 24, cor: "#4a8a6a", direcao: "cima", imagem: SPR.caio }),
      morador({ nome: "Helena",      dialogo: "helena",  flag: "conheceuHelena",  x: 9,  y: 34, cor: "#c07a8a", direcao: "baixo", imagem: SPR.helena }),
      morador({ nome: "Pedro",       dialogo: "pedro",   flag: "conheceuPedro",   x: 32, y: 34, cor: "#8a7a3a", direcao: "direita", imagem: SPR.pedro }),

      // --- Deriky (parte sul do bairro): avisa que a cidade é perigosa. A conversa libera o torneio no dia seguinte (js/dias.js) ---
      {
        nome: "Deriky",
        imagem: ["assets/Deriky.png", "assets/deriky.png", "assets/Deriky.jpg"],
        quadro: { linha: 0, coluna: 0 },
        x: 24 * TILE + TILE / 2, y: 30 * TILE + 58,
        se: function () { return derikyNoSul(); },     // some depois da conversa do DIA_SEITA (js/simon.js)
        conversar: function () {
          if (derikyConversaLucas()) return;      // DIA_THAINA: ele volta para falar do Lucas (js/thaina.js)
          if (historia.simonAcompanha) { abrirDialogo(DIALOGOS.simonDia4.revelacao, aoTerminarRevelacaoSeita); return; }   // Simon junto: conversa dos três
          if (historia.conheceuDeriky) abrirDialogo(DIALOGOS.deriky.depois);
          else abrirDialogo(DIALOGOS.deriky.primeira, function () {
            historia.conheceuDeriky = true;
            diario.escolhas.derikyDia = diaAtual();      // a Millena só conta do torneio em um dia depois deste
          });
        }
      },

      // --- Simon (DIA_SEITA): faltou à escola e procura o Deriky. Ao conversar, passa a andar junto até o Deriky (js/simon.js) ---
      {
        nome: "Simon",
        imagem: ["assets/Simon.png", "assets/simon.png", "assets/Simon.jpg"],
        quadro: { linha: 0, coluna: 0 },
        andar: { raioX: 0, raioY: 0, velocidade: 0 },   // fica parado (e consegue andar embora no fim da cena)
        direcao: "baixo",
        x: 26 * TILE + TILE / 2, y: 8 * TILE + 58,
        se: function () { return simonNoSul(); },
        conversar: function () {
          abrirDialogo(DIALOGOS.simonDia4.sul, iniciarSimonAcompanha);
        }
      }
    ],
    interativos: [
      { nome: "fonte",   area: celula(38, 21, 2, 2), texto: "A água da fonte é limpinha. Há moedas antigas no fundo." },
      { nome: "canteiros_helena", area: celula(3, 36, 14, 1), texto: "Canteiros bem cuidados, cada um com uma flor diferente." },
      { nome: "caixotes", area: celula(35, 34, 2, 2), texto: "Caixotes velhos. Parece que alguém já mexeu aqui várias vezes." },
      { nome: "barreira", area: celula(CX - 4, RUA_FIM - 1, 2, 1), texto: "As obras ainda bloqueiam esta parte da rua." },
      { nome: "banco_praca", area: celula(34, 22), texto: "Um banco gostoso de sentar à sombra." }
    ],
    saidas: [
      // Entrada/saída NORTE: leva à estrada, perto da saída sul dela
      { area: celula(CX - 4, PORTAS.bairroNorte.y, 9, 1), para: "estrada", x: estrada.x, y: estrada.y, dir: "cima" },
      // Passagem sul aberta: leva ao novo bairro agrícola.
      { area: celula(CX - 2, RUA_FIM - 1, 5, 1), para: "bairro_sul2", x: 24 * TILE + TILE / 2, y: 3 * TILE + 40, dir: "baixo" },
      // Portas das casas: levam ao interior (js/salas/casassul.js); a volta cai no caminho, 1 tile abaixo da porta
      ...casas.map((c) => ({ area: celula(c.portaX, c.portaY), para: c.id, x: DX_INTERNO * TILE + TILE / 2, y: 3 * TILE + 44, dir: "cima" }))
    ],
    placas: [
      { texto: "BAIRRO SUL", x: 16 * TILE + TILE / 2, y: 3 * TILE + 32, w: 230, h: 46, fonte: 26 },
      { texto: "PRAÇA",      x: 30 * TILE + TILE / 2, y: 21 * TILE + 32, w: 120, h: 40, fonte: 22 }
    ],
    // (as casas ficam em CASAS_SUL, no fim deste arquivo)
    // Primeira visita: mostra o nome do lugar e anota no diário (as visitas seguintes não repetem)
    aoEntrar: function () {
      if (historia.visitouBairroSul) return;
      historia.visitouBairroSul = true;
      descobrirInfo("bairro_sul");
      mostrarMensagem("Bairro Sul");
    }
  };

  window.CASAS_SUL = casas;                     // { id, nome, portaX, portaY } de cada casa: casassul.js usa para a volta
  window.CASAS_SUL_DX = DX_INTERNO;
})();
