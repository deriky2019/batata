/* =====================================================
   salas/zonaleste.js - Zona Leste (região PERIGOSA a leste da cidade)
   Mapa de 64 x 44 tiles, montado com as ferramentas de js/tiles.js (igual à estrada e ao Bairro Sul).
   Diferente do Bairro Sul, aqui há combate (botão A) e inimigos fortes: ratos, robôs vigias e sucateiros.

   COMO CHEGAR: a avenida da estrada continua para o leste. Até conhecer a Millena ela fica fechada por
   uma barreira de obras (js/salas/estrada.js). Depois, ao chegar no fim dela a Dellalos aparece AQUI,
   na entrada oeste, e a saída oeste daqui leva de volta para a estrada. Os pontos ficam em PORTAS
   (js/salas/_portas.js).

   ONDE ESTÁ O QUÊ (em tiles, x = coluna, y = linha):
     avenida (horizontal) ........ linhas 20-24, de x 0 até x 46
     rua da fábrica (vertical) ... x 42-46, de y 11 até o fim
     guarita do Orlando .......... x 8-12, y 13-15 (porta em 10,15: descansar recupera a vida toda)
     fábrica ..................... x 31-57, y 4-10 (porta em 44,10: abre com as 3 engrenagens)
     pátio da fábrica ............ y 11-15, com cerca de arame na linha 16
     ferro-velho ................. x 4-27, y 29-41 (entrada pela cerca de cima, x 14-16)
     pátio de contêineres ........ x 49-62, y 14-42 (labirinto de contêineres)

   MISSÕES (js/missoes.js): "Engrenagens do portão" (Orlando), "Terreno limpo" (Nando),
   "O coração da fábrica" (dentro da fábrica, js/salas/fabrica.js) e "Treino no leste" (Lucas, a partir do
   DIA_SEITA, só com amizade "Amigos"; ele fica no meio do terreno a oeste da fábrica, x 24, y 14).

   DIA_GABY (js/dias.js): a Gaby, aluna controlada pela Isabela, espera na avenida (x 30, y 22) e ataca (inimigo "gaby", js/inimigos.js).
     Dellalos morre = volta para casa e a Gaby reaparece. Dellalos vence = a Gaby cai e ela escolhe: matar (sem livro, Gaby nunca mais volta),
     colocar o "amuleto_estranho" (loja do Seu Tomás; a Gaby volta ao normal, dá o "livro_magia" e vai avisar os pais) ou "Ainda não".

   LOJA NECRO (js/salas/necro.js): prédio de 5 x 3 tiles em x 17-21, y 13-15 (porta em PORTAS.necro = 19,15).
     A fachada SÓ EXISTE DE NOITE (ciclo.js chama atualizarNecroLeste a cada quadro); de dia o terreno volta a ser concreto vazio.

   COMO MEXER NO FUTURO
     - Inimigo novo: acrescente { tipo, x, y } em  inimigos  (no fim do arquivo). Tipos em js/inimigos.js.
     - NPC novo: acrescente em  npcs  e as falas em DIALOGOS (js/dialogos.js).
     - Contêiner novo: acrescente uma linha em CONTEINERES.
   ===================================================== */

(function () {
  const COLS = 64, ROWS = 44;
  const m = criarMapa(COLS, ROWS);

  // 1) Concreto em tudo (terreno industrial)
  pintar(m, "chao", 0, 0, COLS, ROWS, CALCADA);

  // 2) Ruas: avenida (y 20-24) e a rua vertical que sobe até a fábrica e desce até o pátio (x 42-46)
  pintar(m, "chao", 0, 20, 47, 5, ASFALTO);
  pintar(m, "chao", 42, 11, 5, ROWS - 12, ASFALTO);
  for (let x = 0; x < 42; x++) por(m, "chao", x, 22, TRACO_H);
  for (let y = 11; y < ROWS - 1; y++) if (y < 20 || y > 24) por(m, "chao", 44, y, TRACO_V);

  // Manchas de mato crescendo no concreto (só enfeite)
  for (const [x, y, w, h] of [[2, 2, 6, 5], [14, 3, 8, 4], [22, 10, 5, 3], [34, 27, 5, 4], [2, 15, 3, 2], [37, 36, 4, 4]]) {
    pintar(m, "chao", x, y, w, h, GRAMA);
  }

  // ---------- Peças que se repetem ----------
  const poste = (x, y) => { por(m, "topo", x, y - 1, K(7, 6)); por(m, "obj", x, y, K(7, 7)); bloquear(m, x, y); };
  // Cerca de arame (tiles K(4..6, 13)); vaoX0..vaoX1 = abertura (opcional)
  const cercaArame = (x0, x1, y, vaoX0, vaoX1) => {
    for (let x = x0; x <= x1; x++) {
      if (vaoX0 !== undefined && x >= vaoX0 && x <= vaoX1) continue;
      por(m, "obj", x, y, K(4 + (x % 3), 13)); bloquear(m, x, y);
    }
  };
  const cercaVertical = (x, y0, y1) => {
    for (let y = y0; y <= y1; y++) { por(m, "obj", x, y, K(4 + (y % 3), 13)); bloquear(m, x, y); }
  };
  const caixote = (x, y, n) => { por(m, "obj", x, y, [K(3, 10), K(4, 10), K(5, 10), K(3, 11)][n % 4]); bloquear(m, x, y); };
  const barril = (x, y, n) => { por(m, "obj", x, y, [K(8, 9), K(9, 9), K(10, 9)][n % 3]); bloquear(m, x, y); };
  const cone = (x, y) => { por(m, "obj", x, y, K(5 + (x % 2), 9)); bloquear(m, x, y); };

  // 3) Borda do mapa: cerca de arame em volta (a avenida fica aberta no lado oeste)
  cercaArame(0, COLS - 1, 0);
  cercaArame(0, COLS - 1, ROWS - 1);
  // A avenida continua para a nova região Leste 2 (abertura na cerca leste).
  for (let y = 0; y < ROWS; y++) {
    if (y < 18 || y > 26) { por(m, "obj", COLS - 1, y, K(4 + (y % 3), 13)); bloquear(m, COLS - 1, y); }
  }
  for (let y = 0; y < ROWS; y++) if (y < 18 || y > 26) { por(m, "obj", 0, y, K(4 + (y % 3), 13)); bloquear(m, 0, y); }

  // 4) A fábrica: prédio grande de tijolo com telhado cinza, duas chaminés e porta de aço no meio
  predio(m, 31, 4, 27, 5, ESTILO_VERMELHO);
  for (const x of [33, 35, 37, 39, 49, 51, 53, 55]) janela(m, x, 9, JANELA2);
  for (const x0 of [36, 51]) {                                    // chaminés (blocos cinza em cima do telhado)
    bloco9(m, "chao", x0, 0, 2, 4, bloco(8, 0));
    bloquear(m, x0, 0, 2, 4);
  }
  const PORTA_FAB_FECHADA = K(15, 12), PORTA_FAB_ABERTA = K(15, 13);
  porta(m, PORTAS.fabrica.x, PORTAS.fabrica.y, PORTA_FAB_FECHADA, true);

  // Pátio da fábrica: cerca de arame (com abertura na rua) e cones em volta do portão
  cercaArame(31, 57, 16, 42, 46);
  cercaVertical(30, 11, 16);
  cercaVertical(58, 11, 16);
  cone(41, 12); cone(47, 12); cone(41, 14); cone(47, 14);
  barril(33, 13, 0); barril(34, 13, 1); barril(55, 13, 2); barril(56, 14, 0);

  // 5) Guarita do Orlando (cabine pequena perto da entrada)
  predio(m, 8, 13, 5, 1, ESTILO_LARANJA);
  janela(m, 9, 14); janela(m, 11, 14);
  porta(m, 10, 15, PORTA_LARANJA, true);                          // trancada: o interativo "guarita" deixa descansar
  poste(7, 16); poste(14, 18);

  // 5b) Loja NECRO: só existe de NOITE. Guardamos o que havia no lugar para devolver quando amanhecer.
  const NECRO_X = PORTAS.necro.x - 2, NECRO_Y = PORTAS.necro.y - 2, NECRO_W = 5, NECRO_H = 3;
  const NECRO_CAMADAS = ["chao", "deco", "obj", "topo", "bloq"];
  const necroOriginal = {};
  for (const c of NECRO_CAMADAS) {
    necroOriginal[c] = [];
    for (let j = 0; j < NECRO_H; j++) for (let i = 0; i < NECRO_W; i++) necroOriginal[c].push(m[c][(NECRO_Y + j) * COLS + NECRO_X + i]);
  }
  let necroVisivel = false;
  function necroAplicar(visivel) {
    necroVisivel = visivel;
    if (visivel) {
      predio(m, NECRO_X, NECRO_Y, NECRO_W, 1, ESTILO_VERMELHO);
      janela(m, NECRO_X + 1, NECRO_Y + 1, JANELA2); janela(m, NECRO_X + 3, NECRO_Y + 1, JANELA2);
      porta(m, PORTAS.necro.x, PORTAS.necro.y, K(15, 12), false);      // porta de aço escura, sempre destrancada à noite
      // se a Dellalos estava parada onde o prédio nasceu, empurra para a rua para não travar
      const caixa = caixaDoJogador(jogador.x, jogador.y);
      if (cenaAtual === CENAS.zona_leste && bate(caixa, celula(NECRO_X, NECRO_Y, NECRO_W, NECRO_H))) { jogador.y = (NECRO_Y + NECRO_H + 1) * TILE + 40; }
    } else {
      for (const c of NECRO_CAMADAS) {
        let k = 0;
        for (let j = 0; j < NECRO_H; j++) for (let i = 0; i < NECRO_W; i++) m[c][(NECRO_Y + j) * COLS + NECRO_X + i] = necroOriginal[c][k++];
      }
    }
  }
  // Chamado por js/ciclo.js a cada quadro (e ao entrar na zona): só mexe no mapa quando a noite começa ou termina
  window.atualizarNecroLeste = function () {
    // De noite (dias 2 a 14, quando o ciclo está ligado) E o dia 15 inteiro (o ciclo é desligado no DIA_FINAL): a Necro fica aberta até o dia 15
    const quer = cicloEhNoite() || (!!historia.novoDia && diaAtual() >= DIA_FINAL);
    if (quer !== necroVisivel) necroAplicar(quer);
  };

  // 6) Postes ao longo da avenida
  for (const [x, y] of [[6, 19], [18, 19], [30, 19], [6, 25], [18, 25], [30, 25], [38, 19], [38, 25]]) poste(x, y);

  // 7) Ferro-velho: terreno cercado ao sul da avenida, com entrada pela cerca de cima
  cercaArame(4, 27, 29, 14, 16);
  cercaArame(4, 27, 41);
  cercaVertical(4, 29, 41);
  cercaVertical(27, 29, 41);
  [[6, 31], [7, 31], [6, 32], [9, 33], [10, 33], [10, 34], [20, 31], [21, 31], [24, 32], [24, 33],
   [7, 39], [8, 39], [8, 40], [17, 40], [18, 40], [25, 38], [25, 39], [12, 36], [13, 36]].forEach(([x, y], n) => caixote(x, y, n));
  [[5, 35], [5, 36], [11, 31], [23, 36], [26, 34], [16, 33], [19, 36]].forEach(([x, y], n) => barril(x, y, n));
  // Pilha de sucata onde fica a 1ª engrenagem (interativo "pilha_sucata")
  caixote(8, 36, 3); caixote(9, 36, 1);
  // Van abandonada (2 x 3 tiles do kit, bloqueada)
  for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) por(m, "obj", 21 + i, 34 + j, K(21 + i, 15 + j));
  bloquear(m, 21, 34, 2, 3);

  // 8) Pátio de contêineres: labirinto de contêineres coloridos (blocos esticáveis do kit)
  const CONT = { laranja: bloco(20, 4), vermelho: bloco(20, 0) };
  const CONTEINERES = [
    // x,  y,  w, h, cor   (todos deitados: o desenho dos contêineres só fica bom na horizontal)
    [49, 18, 6, 2, "vermelho"], [57, 18, 5, 2, "laranja"],
    [49, 22, 4, 2, "laranja"],  [55, 22, 6, 2, "vermelho"],
    [49, 26, 5, 2, "vermelho"], [57, 26, 5, 2, "laranja"],
    [49, 30, 4, 2, "laranja"],  [55, 30, 6, 2, "vermelho"],
    [49, 34, 5, 2, "vermelho"], [57, 34, 4, 2, "laranja"],
    [51, 38, 8, 2, "vermelho"]
  ];
  for (const [x, y, w, h, cor] of CONTEINERES) {
    bloco9(m, "chao", x, y, w, h, CONT[cor]);
    bloquear(m, x, y, w, h);
  }

  // 9) Árvores secas (copas laranja) espalhadas, longe dos caminhos
  for (const [x, y, t] of [[3, 17, 2], [3, 28, 3], [33, 12, 2], [60, 14, 3], [48, 14, 2], [38, 32, 3], [36, 40, 2], [61, 40, 3]]) {
    if (dentro(m, x, y) && !m.bloq[y * COLS + x] && m.obj[y * COLS + x] === -1) arvore(m, x, y, t);
  }

  // ---------- Portão da fábrica: abre/fecha o mapa conforme a história ----------
  // O interativo "porta_fabrica" some quando a porta abre (a área sai da tela); aí a saída entra em ação.
  const areaPortaFabrica = celula(PORTAS.fabrica.x, PORTAS.fabrica.y);
  window.atualizarPortaoFabrica = function () {
    const aberto = !!historia.portaoFabricaAberto;
    bloquear(m, PORTAS.fabrica.x, PORTAS.fabrica.y, 1, 1, aberto ? 0 : 1);
    por(m, "obj", PORTAS.fabrica.x, PORTAS.fabrica.y, aberto ? PORTA_FAB_ABERTA : PORTA_FAB_FECHADA);
    areaPortaFabrica.x = aberto ? -99999 : PORTAS.fabrica.x * TILE;
  };

  // ---------- NPCs ----------
  const parado = { raioX: 0, raioY: 0, velocidade: 0 };           // fica parado, mas olhando para a direção certa
  const pes = (x, y) => ({ x: x * TILE + TILE / 2, y: y * TILE + 58 });

  // --- Lucas, treinando sozinho (a partir do DIA_SEITA, com amizade "Amigos"): só olhar ou participar de um treino ---
  // Participar = luta curta até a Dellalos ficar com 1 coração (inimigo "lucas", js/inimigos.js). Depois: 50 moedas
  // e a chance de contar da seita; ele revela que já sabia, avisa para tomar cuidado com todos (até a Isabela) e vai embora.
  const LUCAS_X = 24 * TILE + TILE / 2, LUCAS_Y = 14 * TILE + 58;
  const lucasNpc = {
    nome: "Lucas",
    imagem: ["assets/Lucas.png", "assets/lucas.png", "assets/Lucas.jpg"],
    quadro: { linha: 0, coluna: 0 },
    andar: parado, direcao: "baixo",
    x: LUCAS_X, y: LUCAS_Y,
    _duelando: false,
    // sumiu: durante a luta (vira inimigo), depois de ir embora, ou se ele já anda junto como companheiro
    se: function () { return !lucasNpc._duelando && lucasZonaDisponivel() && !historia.lucasZonaFim && AM().comp !== "Lucas"; },
    conversar: function () {
      if (historia.lucasDuelo) {                                   // já treinou: pergunta se ela quer contar
        diario.escolhas.lucas_seita = "";
        abrirDialogo(DIALOGOS.lucasZona.depoisDuelo, lucasAposConversa);
        return;
      }
      diario.escolhas.lucas_treino = "";
      abrirDialogo(historia.lucasZonaVisto ? DIALOGOS.lucasZona.outraVez : DIALOGOS.lucasZona.primeira, function () {
        historia.lucasZonaVisto = true;
        if (diario.escolhas.lucas_treino !== "participar") return;
        if (jogador.vida < 3) { abrirDialogo(DIALOGOS.lucasZona.fraca); return; }   // machucada demais: descansar primeiro
        lucasIniciarDuelo();
      });
    }
  };

  function lucasIniciarDuelo() {
    lucasNpc._duelando = true;
    lucasNpc.x = LUCAS_X; lucasNpc.y = LUCAS_Y;
    const i = criarInimigo("lucas", LUCAS_X, LUCAS_Y);
    i.npc = lucasNpc;
    i.estado = "descanso"; i.espera = 1.2;                         // dá um instante para ela se preparar
    inimigos.push(i);
    mostrarMensagem("Treino! Use o botão A para bater. O Lucas não vai pegar leve.");
  }

  // Chamado por inimigos.js quando a Dellalos chega a 1 coração (aoMorrer do tipo "lucas")
  window.lucasFimDoDuelo = function () {
    historia.lucasDuelo = true;
    lucasNpc._duelando = false;
    lucasNpc.x = LUCAS_X; lucasNpc.y = LUCAS_Y;                    // volta para o lugar do treino
    // se a Dellalos ficou em cima dele, empurra um pouco para ela não travar
    for (const [dx, dy] of [[0, 70], [80, 0], [-80, 0], [0, -70], [0, 0]]) {
      const x = lucasNpc.x + dx, y = lucasNpc.y + dy;
      if (livre(x, y) && !bate(caixaDoJogador(x, y), caixaDoNpc(lucasNpc))) { jogador.x = x; jogador.y = y; break; }
    }
    jogador.vida = 1;
    jogador.invulneravel = 2;
    amizadeGanhar("Lucas", 10, "lucas_zona_duelo");
    diario.escolhas.lucas_seita = "";
    abrirDialogo(DIALOGOS.lucasZona.fimDuelo, function () {
      if (!historia.lucasMoedas) {
        historia.lucasMoedas = true;
        ganharMoedas(50);
        mostrarMensagem("O Lucas deu 50 moedas! Compre um coração extra na loja ou descanse na guarita.");
      }
      lucasAposConversa();
    });
  };

  // Depois das falas: se ela contou tudo, ele vai embora (anda para a avenida e some); senão, continua treinando
  function lucasAposConversa() {
    if (diario.escolhas.lucas_seita !== "contar" || historia.lucasContado) return;
    historia.lucasContado = true;
    amizadeGanhar("Lucas", 15, "lucas_zona_seita");
    npcIrEmbora(lucasNpc, LUCAS_X, 19 * TILE + 58, 90, function () { historia.lucasZonaFim = true; });
  }

  // --- Gaby (a partir do DIA_GABY): aluna controlada pela Isabela. Enquanto luta, ela é o inimigo "gaby" (o sprite vem deste NPC);
  // depois de vencida fica aqui, caída, esperando a decisão da Dellalos (gabyDecidir). ---
  const GABY_X = 30 * TILE + TILE / 2, GABY_Y = 22 * TILE + 58;
  const gabyNpc = {
    nome: "Gaby",
    imagem: ["assets/Gaby.png", "assets/gaby.png", "assets/Gaby.jpg"],
    quadro: { linha: 0, coluna: 0 },
    andar: parado, direcao: "baixo",
    x: GABY_X, y: GABY_Y,
    se: function () { return !!historia.gabyDerrotada && !historia.gabyFim; },
    conversar: function () { if (!historia.gabyFim) gabyDecidir(false); }
  };
  window.gabyNpc = gabyNpc;

  // Chamado por inimigos.js quando a vida da Gaby acaba (aoMorrer do tipo "gaby")
  window.gabyCaiu = function (i) {
    historia.gabyDerrotada = true;
    gabyNpc.x = i.x; gabyNpc.y = i.y; gabyNpc._rota = null; gabyNpc._alfa = undefined;
    // se a Dellalos ficou em cima dela, empurra um pouco para não travar
    for (const [dx, dy] of [[0, 70], [80, 0], [-80, 0], [0, -70], [0, 0]]) {
      const x = gabyNpc.x + dx, y = gabyNpc.y + dy;
      if (livre(x, y) && !bate(caixaDoJogador(x, y), caixaDoNpc(gabyNpc))) { jogador.x = x; jogador.y = y; break; }
    }
    jogador.invulneravel = 2;
    gabyDecidir(true);
  };

  // A Dellalos decide: amuleto (se tiver), matar ou deixar para depois. O resultado roda quando a conversa termina.
  function gabyDecidir(primeira) {
    diario.escolhas.gaby_destino = "";
    abrirDialogo(primeira ? DIALOGOS.gaby.caiu : DIALOGOS.gaby.outraVez, function () {
      const e = diario.escolhas.gaby_destino;
      if (e === "amuleto") gabyLibertada();
      else if (e === "matar") gabyMatar();
    });
  }

  function gabyLibertada() {
    historia.gabySalva = true;
    tirarItem("amuleto_estranho");                       // libera o espaço do inventário antes de entregar o livro
    if (darItem("livro_magia")) {
      historia.ganhouLivroMagia = true;
      mostrarMensagem("Você ganhou o Livro de magia! Ele está no inventário.");
    }
    descobrirInfo("gaby_livre");
    sinalizarMissao();
    // Ela vai embora pela avenida, para o oeste (avisar os pais); se a Dellalos sair da cena antes, aoEntrar encerra isso
    npcIrEmbora(gabyNpc, 3 * TILE + TILE / 2, GABY_Y, 110, function () { historia.gabyFim = true; });
  }

  function gabyMatar() {
    historia.gabyMorta = true;
    historia.gabyFim = true;                             // some para sempre neste save: sem livro e sem volta
    descobrirInfo("gaby_morta");
    mostrarMensagem("A Gaby não vai voltar.");
  }

  const npcs = [
    // --- Orlando, vigia (ao lado da guarita): pede as 3 engrenagens do portão ---
    {
      nome: "Orlando",
      imagem: ["assets/npcs/orlando.png"],
      quadro: { linha: 0, coluna: 0 },
      andar: parado, direcao: "baixo",
      ...pes(13, 16),
      conversar: function () {
        if (historia.derrotouCapataz)    { abrirDialogo(DIALOGOS.orlando.fim); return; }
        if (historia.portaoFabricaAberto) { abrirDialogo(DIALOGOS.orlando.depois); return; }
        if (historia.aceitouEngrenagens) { abrirDialogo(DIALOGOS.orlando.lembrar()); return; }
        if (!missaoDoDiaLiberada("engrenagens")) { semMissaoHoje("Orlando", "A guarita está sossegada hoje. Volte outro dia, se precisar de algo."); return; }   // js/calendario.js
        const falas = historia.conheceuOrlando ? DIALOGOS.orlando.outraVez : DIALOGOS.orlando.oferta;
        abrirDialogo(falas, function () {
          historia.conheceuOrlando = true;
          avisarNovaSecundaria("engrenagens");
        });
      }
    },
    // --- Nando, catador de sucata (ferro-velho): derrotar 8 inimigos e ganhar a 3ª engrenagem ---
    {
      nome: "Nando",
      imagem: ["assets/npcs/nando.png"],
      quadro: { linha: 0, coluna: 0 },
      andar: parado, direcao: "baixo",
      ...pes(18, 32),
      conversar: function () {
        if (historia.entregouLimpeza) { abrirDialogo(DIALOGOS.nando.depois); return; }
        if (historia.aceitouLimpeza) {
          if (limpezaFeita() >= LIMPEZA_ALVO) {
            abrirDialogo(DIALOGOS.nando.concluir, function () {
              historia.entregouLimpeza = true;
              historia.achouEngrenagem3 = true;
              mostrarMensagem("Você ganhou uma engrenagem! (" + engrenagensAchadas() + "/" + ENGRENAGENS_TOTAL + ")");
            });
          } else {
            abrirDialogo([{ quem: "Nando", texto: "Você derrotou " + limpezaFeita() + " de " + LIMPEZA_ALVO + ". Continue, o terreno ainda está cheio de bichos!" }]);
          }
          return;
        }
        if (!missaoDoDiaLiberada("limpeza")) { semMissaoHoje("Nando", "Hoje o ferro-velho está sossegado. Volte outro dia, garota."); return; }   // js/calendario.js
        const falas = historia.conheceuNando ? DIALOGOS.nando.outraVez : DIALOGOS.nando.oferta;
        abrirDialogo(falas, function () {
          historia.conheceuNando = true;
          avisarNovaSecundaria("limpeza");
        });
      }
    },
    // --- Amigo do papai (SÓ no dia 5, uma vez): a Dellalos conta tudo que descobriu e ele entrega a Dália (js/dias.js) ---
    {
      nome: "Amigo do papai",
      imagem: ["assets/AmigoPai.png", "assets/amigopai.png", "assets/AmigoPai.jpg"],
      quadro: { linha: 0, coluna: 0 },
      andar: parado, direcao: "baixo",
      ...pes(7, 21),
      se: function () { return amigoLesteDisponivel(); },
      conversar: function () { conversarAmigoLeste(); }
    },
    lucasNpc,
    gabyNpc
  ];

  // Onde a Dellalos aparece: ao entrar pela avenida (oeste) ou ao sair da fábrica (embaixo da porta)
  const entradaOeste = { x: 3 * TILE + TILE / 2, y: PORTAS.lesteEntrada.y * TILE + 40 };
  const estradaVolta = { x: (PORTAS.lesteSaida.x - 3) * TILE + TILE / 2, y: PORTAS.lesteSaida.y * TILE + 40 };
  const fabricaDentro = nasceDentroAcima(PORTAS.fabricaDentro);
  const CENA_NECRO_SPAWN = nasceDentroAcima(PORTAS.necroDentro);   // dentro da Necro (js/salas/necro.js)
  const px = (x, y) => ({ x: x * TILE + TILE / 2, y: y * TILE + TILE - 6 });   // posição de pés no meio de um tile

  CENAS.zona_leste = {
    mapa: m,
    combate: true,
    spawn: entradaOeste,
    npcs,
    interativos: [
      // Porta da fábrica: abre quando as 3 engrenagens estão encaixadas (js/missoes.js)
      { nome: "porta_fabrica", area: areaPortaFabrica, conversar: function () { usarPortaFabrica(); } },
      // Guarita: descansar recupera toda a vida (só depois de conhecer o Orlando)
      { nome: "guarita", area: celula(9, 15, 3, 1), conversar: function () {
          if (!historia.conheceuOrlando) { mostrarMensagem("A guarita está trancada. Procure o vigia."); return; }
          if (jogador.vida >= jogador.vidaMax) { mostrarMensagem("A guarita do Orlando. Você já está bem, nada de descansar agora."); return; }
          jogador.vida = jogador.vidaMax;
          mostrarMensagem("Você descansou na guarita do Orlando. Vida recuperada!");
        } },
      // 1ª engrenagem
      { nome: "pilha_sucata", area: celula(8, 36, 2, 1), conversar: function () {
          if (historia.achouEngrenagem1) { mostrarMensagem("Só sucata enferrujada. Aqui você já achou o que precisava."); return; }
          historia.achouEngrenagem1 = true;
          mostrarMensagem("Entre a sucata, uma engrenagem! (" + engrenagensAchadas() + "/" + ENGRENAGENS_TOTAL + ")");
        } },
      { nome: "van", area: celula(21, 34, 2, 3), texto: "Uma van abandonada, sem rodas. O banco está cheio de ninhos de rato." },
      { nome: "conteineres_1", area: celula(49, 18, 6, 2), texto: "Contêineres enferrujados. Algo se mexe lá dentro... só um rato, espero." },
      { nome: "conteineres_2", area: celula(55, 22, 6, 2), texto: "Um contêiner com marcas de garras na porta." },
      { nome: "barris", area: celula(33, 13, 2, 1), texto: "Barris com um líquido escuro. Melhor não encostar." }
    ],
    saidas: [
      // Avenida oeste: volta para a estrada (perto do fim da avenida)
      { area: celula(PORTAS.lesteEntrada.x, 18, 1, 9), para: "estrada", x: estradaVolta.x, y: estradaVolta.y, dir: "esquerda" },
      // Loja Necro: só dá para entrar de noite (a fachada some de dia)
      { area: celula(PORTAS.necro.x, PORTAS.necro.y), para: "necro", x: CENA_NECRO_SPAWN.x, y: CENA_NECRO_SPAWN.y, dir: "cima",
        se: function () { return necroVisivel; } },
      // Avenida a leste: continua para a nova região Leste 2
      { area: celula(COLS - 1, 18, 1, 9), para: "zona_leste2", x: 2 * TILE + TILE / 2, y: 22 * TILE + 40, dir: "direita" },
      // Porta da fábrica: só funciona depois de aberta
      { area: celula(PORTAS.fabrica.x, PORTAS.fabrica.y), para: "fabrica", x: fabricaDentro.x, y: fabricaDentro.y, dir: "cima",
        se: function () { return historia.portaoFabricaAberto; } }
    ],
    placas: [
      { texto: "ZONA LESTE",       x: 4 * TILE + TILE / 2,  y: 17 * TILE + 32, w: 230, h: 46, fonte: 26 },
      { texto: "FÁBRICA",          x: 44 * TILE + TILE / 2, y: 8 * TILE + 24,  w: 220, h: 46, fonte: 28 },
      { texto: "ÁREA PERIGOSA",    x: 38 * TILE + TILE / 2, y: 14 * TILE + 32, w: 250, h: 42, fonte: 22 },
      { texto: "FERRO-VELHO",      x: 15 * TILE + TILE / 2, y: 27 * TILE + 32, w: 230, h: 42, fonte: 22 },
      // Só de noite: acima do telhado da loja Necro
      { texto: "NECRO",            x: PORTAS.necro.x * TILE + TILE / 2, y: 12 * TILE + 24, w: 170, h: 42, fonte: 26, se: function () { return necroVisivel; } }
    ],
    // Inimigos: nenhum perto da guarita (zona segura). "solta" = o que o inimigo deixa cair ao ser derrotado.
    inimigos: [
      // avenida
      { tipo: "rato", ...px(18, 21) }, { tipo: "rato", ...px(26, 23) }, { tipo: "rato", ...px(34, 21) },
      // pátio da fábrica
      { tipo: "vigia", ...px(38, 13) }, { tipo: "vigia", ...px(50, 13) }, { tipo: "rato", ...px(36, 15) },
      // ferro-velho (o sucateiro guarda a 2ª engrenagem)
      { tipo: "rato", ...px(12, 33) }, { tipo: "rato", ...px(23, 33) }, { tipo: "rato", ...px(12, 38) }, { tipo: "rato", ...px(20, 38) },
      { tipo: "sucateiro", ...px(22, 39), solta: "engrenagem2", se: function () { return !historia.achouEngrenagem2; } },
      // pátio de contêineres
      { tipo: "vigia", ...px(55, 21) }, { tipo: "vigia", ...px(56, 33) },
      { tipo: "rato", ...px(51, 28) }, { tipo: "rato", ...px(58, 24) },
      { tipo: "sucateiro", ...px(55, 36) },
      // Gaby (DIA_GABY em diante, até a luta terminar): espera na avenida e ataca quando a Dellalos chega perto
      { tipo: "gaby", x: GABY_X, y: GABY_Y, se: function () { return gabyDisponivel(); } }
    ],
    // Primeira visita: mostra o nome do lugar e anota no diário. Sempre: ajusta a porta da fábrica ao progresso
    aoEntrar: function () {
      atualizarPortaoFabrica();
      atualizarNecroLeste();                            // fachada da Necro conforme dia/noite
      // Treino do Lucas: um duelo interrompido (saiu da cena ou morreu) não prende o Lucas; se ele já foi embora, não volta
      lucasNpc._duelando = false;
      if (historia.lucasContado) { historia.lucasZonaFim = true; lucasNpc._rota = null; }
      // Gaby: se ela já estava indo embora, não volta; se está caída esperando, fica no lugar da luta
      if (historia.gabySalva) { historia.gabyFim = true; gabyNpc._rota = null; }
      if (!gabyNpc._rota) { gabyNpc.x = GABY_X; gabyNpc.y = GABY_Y; gabyNpc._alfa = undefined; }
      if (historia.visitouZonaLeste) return;
      historia.visitouZonaLeste = true;
      descobrirInfo("zona_leste");
      mostrarMensagem("Zona Leste");
    }
  };
})();
