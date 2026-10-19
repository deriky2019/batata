/* =====================================================
   salas/fabrica.js - Fábrica abandonada (dungeon da Zona Leste, com chefe)
   Mapa de 44 x 36 tiles. Tudo é parede escura; as salas são "escavadas" com  sala(...).
   Entra-se pela porta da fábrica (js/salas/zonaleste.js), que só abre com as 3 engrenagens.

   COMO É POR DENTRO (em tiles, x = coluna, y = linha):
     hall de entrada ............. x 16-27, y 27-31 (porta de volta em 21,32; caixa de primeiros socorros)
     galpão das esteiras ......... x 3-40, y 13-23 (sala grande com máquinas, o centro de tudo)
     depósito (oeste) ............ x 2-12, y 3-9   (armário com o CARTÃO DE ACESSO em 5,3)
     sala de controle (leste) .... x 31-41, y 3-9  (mesa com a ORDEM DE PRODUÇÃO em 36,4)
     arena do chefe (norte) ...... x 14-29, y 2-9  (porta de aço em 21-22,10: abre com o cartão)

   MISSÃO "O coração da fábrica" (js/missoes.js): entrar -> pegar o cartão -> abrir a sala do fundo -> derrotar o Capataz.
   Progresso salvo em historia: entrouFabrica, pegouCartao, abriuSalaChefe, derrotouCapataz.

   COMO MEXER NO FUTURO
     - Sala nova: chame  sala(x, y, w, h, piso)  e ligue com  corredor(x, y, w, h).
     - Inimigo novo: acrescente em  inimigos  (no fim do arquivo). O chefe só existe até ser derrotado (campo  se).
     - A caixa de primeiros socorros cura uma vez por visita à fábrica.
   ===================================================== */

(function () {
  const COLS = 44, ROWS = 36;
  const m = criarMapa(COLS, ROWS);

  // Tudo começa como parede escura e bloqueada
  pintar(m, "chao", 0, 0, COLS, ROWS, PAREDE_TOPO);
  bloquear(m, 0, 0, COLS, ROWS);

  // Pisos (Room Builder): cada um é um bloco 3 x 2 que se repete
  const PISO = {
    escuro:  [14, 11],     // concreto escuro (hall, galpão)
    claro:   [11, 11],     // concreto claro (arena do chefe)
    cinza:   [14, 7],      // depósito
    verde:   [11, 9]       // sala de controle
  };

  // Escava uma sala: duas linhas de parede com rodapé em cima e piso livre
  function sala(x, y, w, h, piso) {
    paredeRB(m, x, y - 2, w, 17);                      // fachada da parede de cima (2 linhas)
    pisoRB(m, x, y, w, h, piso[0], piso[1]);
    bloquear(m, x, y, w, h, 0);
  }
  // Escava um corredor/porta entre duas salas (por cima das paredes que estiverem no caminho)
  function corredor(x, y, w, h, piso) {
    pisoRB(m, x, y, w, h, piso[0], piso[1]);
    bloquear(m, x, y, w, h, 0);
  }

  // ---------- Salas ----------
  sala(3, 13, 38, 11, PISO.escuro);                    // galpão das esteiras
  sala(16, 27, 12, 5, PISO.escuro);                    // hall de entrada
  sala(2, 3, 11, 7, PISO.cinza);                       // depósito
  sala(31, 3, 11, 7, PISO.verde);                      // sala de controle
  sala(14, 2, 16, 8, PISO.claro);                      // arena do chefe

  // ---------- Ligações ----------
  corredor(21, 24, 2, 3, PISO.escuro);                 // hall -> galpão
  corredor(6, 10, 2, 3, PISO.escuro);                  // galpão -> depósito
  corredor(36, 10, 2, 3, PISO.verde);                  // galpão -> sala de controle
  corredor(21, 11, 2, 2, PISO.claro);                  // galpão -> porta da arena
  // Porta de aço da arena (fecha 21-22, linha 10): trancada até usar o cartão de acesso
  const PORTA_ACO_FECHADA = K(15, 12), PORTA_ACO_ABERTA = K(15, 13);
  corredor(21, 10, 2, 1, PISO.claro);
  const areaPortaChefe = celula(21, 10, 2, 1);

  // Porta de saída (parede de baixo do hall): volta para a Zona Leste
  portaInterna(m, PORTAS.fabricaDentro.x, PORTAS.fabricaDentro.y, PORTA_FAB_SAIDA());
  function PORTA_FAB_SAIDA() { return K(15, 12); }

  // ---------- Decoração e obstáculos ----------
  const bloqObj = (x, y, tile) => { por(m, "obj", x, y, tile); bloquear(m, x, y); };
  const caixote = (x, y, n) => bloqObj(x, y, [K(3, 10), K(4, 10), K(5, 10), K(3, 11)][n % 4]);
  const barril  = (x, y, n) => bloqObj(x, y, [K(8, 9), K(9, 9), K(10, 9)][n % 3]);
  // Máquinas: blocos esticáveis com borda e miolo cinza
  const maquina = (x, y, w, h) => { bloco9(m, "chao", x, y, w, h, bloco(8, 3)); bloquear(m, x, y, w, h); };

  // Galpão das esteiras: duas fileiras de máquinas, com corredores de 2 tiles
  for (const [x, y, w, h] of [[6, 15, 4, 3], [13, 15, 4, 3], [24, 15, 4, 3], [31, 15, 4, 3],
                              [8, 20, 5, 2], [18, 20, 6, 2], [29, 20, 5, 2]]) maquina(x, y, w, h);
  barril(4, 14, 0); barril(39, 14, 1); barril(4, 22, 2); barril(39, 22, 0);

  // Depósito: caixotes empilhados e o armário do cartão de acesso (estante na parede de cima)
  [[3, 5], [4, 5], [10, 5], [10, 6], [7, 7], [8, 7], [3, 8]].forEach(([x, y], n) => caixote(x, y, n));
  bloqObj(5, 3, ESTANTE); bloqObj(6, 3, ESTANTE); bloqObj(9, 3, ESTANTE);

  // Sala de controle: mesas com a ordem de produção e uma fileira de monitores
  bloqObj(35, 4, MESA_LIVRO); bloqObj(36, 4, MESA_LIVRO);
  por(m, "obj", 36, 5, CADEIRA);
  for (const x of [33, 34, 38, 39]) bloqObj(x, 3, CARTEIRA);
  bloqObj(40, 8, PLANTA);

  // Hall: caixa de primeiros socorros, caixotes e barris
  bloqObj(25, 28, K(10, 11));
  caixote(17, 28, 0); caixote(18, 28, 1); barril(26, 30, 1);

  // Arena do chefe: pilares nos cantos (só enfeite, longe do meio da luta)
  for (const [x, y] of [[15, 3], [28, 3], [15, 8], [28, 8]]) bloqObj(x, y, K(8, 9));

  // ---------- Estado da porta de aço (conforme o progresso salvo) ----------
  function atualizarPortaChefe() {
    const aberta = !!historia.abriuSalaChefe;
    for (let x = 21; x <= 22; x++) {
      por(m, "obj", x, 10, aberta ? PORTA_ACO_ABERTA : PORTA_ACO_FECHADA);
      bloquear(m, x, 10, 1, 1, aberta ? 0 : 1);
    }
    areaPortaChefe.x = aberta ? -99999 : 21 * TILE;
  }

  // Onde a Dellalos aparece ao sair (embaixo da porta da fábrica, na Zona Leste)
  const fora = nasceFora(PORTAS.fabrica);
  const px = (x, y) => ({ x: x * TILE + TILE / 2, y: y * TILE + TILE - 6 });
  let kitUsado = false;                                  // a caixa de primeiros socorros cura 1 vez por visita

  CENAS.fabrica = {
    mapa: m,
    corFora: "#14110f",
    combate: true,
    interativos: [
      // Porta de aço: abre com o cartão de acesso
      { nome: "porta_chefe", area: areaPortaChefe, conversar: function () {
          if (historia.abriuSalaChefe) return;
          if (!historia.pegouCartao) { mostrarMensagem("Porta de aço com leitor de cartão. Trancada."); return; }
          historia.abriuSalaChefe = true;
          atualizarPortaChefe();
          mostrarMensagem("O cartão liberou a porta de aço. Prepare-se!");
        } },
      // Armário do depósito: cartão de acesso (não ocupa espaço no inventário)
      { nome: "armario", area: celula(5, 3, 2, 1), conversar: function () {
          if (historia.pegouCartao) { mostrarMensagem("O armário está vazio."); return; }
          historia.pegouCartao = true;
          mostrarMensagem("Dentro do armário: um cartão de acesso da fábrica! (Abre a porta de aço do galpão.)");
        } },
      { nome: "estante_deposito", area: celula(9, 3), texto: "Prateleira cheia de peças enferrujadas." },
      // Mesa da sala de controle: ordem de produção (lida na hora; vai para o diário)
      { nome: "mesa_controle", area: celula(35, 4, 2, 1), conversar: function () {
          if (historia.pegouOrdemFabrica) {
            // Depois de ler a ordem, a gaveta da mesa aparece: a chave da mansão (Zona Oeste) está lá dentro
            if (historia.pegouChaveMansao || historia.mansaoAberta) { abrirDialogo(DIALOGOS.fabrica.gavetaVazia); return; }
            if (!temItem("chave_mansao") && inventario.slots.indexOf(null) === -1) { mostrarMensagem("Inventário cheio! Libere um espaço para pegar o que está na gaveta."); return; }
            abrirDialogo(DIALOGOS.fabrica.gaveta, function () {
              if (!darItem("chave_mansao")) return;
              historia.pegouChaveMansao = true;
              mostrarMensagem("Você pegou: " + ITENS.chave_mansao.nome + ".");
            });
            return;
          }
          abrirDialogo(DIALOGOS.fabrica.ordem, function () {
            historia.pegouOrdemFabrica = true;
            registrarDocumento("ordem_fabrica");
            descobrirInfo("ordem_fabrica");
            mostrarMensagem("Embaixo da mesa há uma gaveta. Vale a pena olhar.");
          });
        } },
      { nome: "monitores", area: celula(33, 3, 2, 1), texto: "Monitores cheios de linhas verdes. Uma delas pisca: PRODUÇÃO ATIVA." },
      // Caixa de primeiros socorros (hall): cura uma vez por visita
      { nome: "primeiros_socorros", area: celula(25, 28), conversar: function () {
          if (kitUsado) { mostrarMensagem("A caixa de primeiros socorros está vazia."); return; }
          if (jogador.vida >= jogador.vidaMax) { mostrarMensagem("Caixa de primeiros socorros. Você está bem; guarde-a para depois."); return; }
          kitUsado = true;
          jogador.vida = jogador.vidaMax;
          mostrarMensagem("Você usou a caixa de primeiros socorros. Vida recuperada!");
        } }
    ],
    saidas: [
      { area: celula(PORTAS.fabricaDentro.x, PORTAS.fabricaDentro.y), para: "zona_leste", x: fora.x, y: fora.y, dir: "baixo" }
    ],
    placas: [
      { texto: "LINHA DE PRODUÇÃO", x: 14 * TILE, y: 12 * TILE + 8, w: 320, h: 42, fonte: 22 }
    ],
    inimigos: [
      // galpão das esteiras
      { tipo: "rato", ...px(10, 14) }, { tipo: "rato", ...px(20, 18) }, { tipo: "rato", ...px(30, 18) }, { tipo: "rato", ...px(14, 22) },
      { tipo: "vigia", ...px(19, 14) }, { tipo: "vigia", ...px(26, 22) },
      // depósito
      { tipo: "rato", ...px(5, 8) }, { tipo: "rato", ...px(11, 8) }, { tipo: "rato", ...px(8, 5) }, { tipo: "vigia", ...px(8, 9) },
      // sala de controle
      { tipo: "vigia", ...px(33, 8) }, { tipo: "vigia", ...px(39, 6) }, { tipo: "sucateiro", ...px(36, 8) },
      // arena: o Capataz Mecânico só existe até ser derrotado
      { tipo: "capataz", ...px(21, 4), se: function () { return !historia.derrotouCapataz; } }
    ],
    // Sempre: ajusta a porta de aço ao progresso salvo; kit volta a funcionar; 1ª vez anota o progresso da missão
    aoEntrar: function () {
      atualizarPortaChefe();
      kitUsado = false;
      if (historia.entrouFabrica) return;
      historia.entrouFabrica = true;
      mostrarMensagem("Fábrica abandonada");
    }
  };
})();
