/* =====================================================
   salas/escola.js - O 1º ANDAR da escola (térreo): entrada, 1A, 2A, 2B e 2C
   A escada (à direita) sobe para o 2º andar (js/salas/escola2.js): 3A, 3B, 3C e sala dos professores.
   Só 2A e 2C abrem por enquanto (veja js/salas/aulas.js). A 1A abre com a chave e a 2B mostra "Ainda não disponível."
   Para liberar uma sala: troque  disponivel: false  por  cena: "id_da_cena".
   ===================================================== */

(function () {
  const COLS = 30, ROWS = 14;
  const m = criarMapa(COLS, ROWS);
  salaInterna(m, PISO_ESCOLA);

  const SALAS = [
    { nome: "1A", x: 3,  disponivel: false },
    { nome: "2A", x: 7,  cena: "aula_2a" },
    { nome: "2B", x: 11, disponivel: false },
    { nome: "2C", x: 15, cena: "aula_2c" }
  ];

  const saidas = [], interativos = [], placas = [];
  const dentroDaAula = nasceDentroAcima(PORTAS.aula);

  for (const s of SALAS) {
    placas.push({ texto: s.nome, x: s.x * TILE + TILE / 2, y: 1 * TILE + 26, w: 48, h: 28, fonte: 20 });
    if (s.cena) {
      portaInterna(m, s.x, 2);   // porta aberta na parede
      saidas.push({ area: celula(s.x, 2), para: s.cena, x: dentroDaAula.x, y: dentroDaAula.y, dir: "cima" });
    } else {
      porta(m, s.x, 2, PORTA_LARANJA, true);   // porta trancada
      if (s.nome === "1A") interativos.push({ nome: "porta_1A", area: celula(s.x, 2), conversar: function () { usarPorta1A(dentroDaAula); } });   // DIA_1A (js/chave1a.js)
      else interativos.push({ nome: "porta_" + s.nome, area: celula(s.x, 2), conversar: function () { espiarSala(s.nome); } });   // com o Caio dá para espiar a 2B (js/exploracao.js); a 3B fica no 2º andar (js/salas/escola2.js)
    }
  }

  // Janelas entre as portas
  for (const x of [5, 9, 13, 17, 21, 25, 28]) janela(m, x, 1, JANELA2);

  // Enfeites do corredor: bancos e plantas
  for (const [x, y] of [[5, 7], [9, 7], [20, 7], [24, 7], [5, 10], [24, 10]]) {
    por(m, "obj", x, y, K(3, 14)); bloquear(m, x, y);
  }
  for (const [x, y] of [[1, 3], [28, 3], [12, 12], [17, 12]]) {
    por(m, "obj", x, y, PLANTA); bloquear(m, x, y);
  }

  // Porta de entrada (parede de baixo) -> volta para a rua
  porta(m, PORTAS.hall.x, PORTAS.hall.y, PORTA_DUPLA_BRANCA, false);
  const rua = nasceFora(PORTAS.escola);
  saidas.push({ area: celula(PORTAS.hall.x, PORTAS.hall.y), para: "estrada", x: rua.x, y: rua.y, dir: "baixo" });

  // ESCADA para o 2º andar (à direita do corredor). Entra-se pela base dela (linha 5); a de cima é decoração que bloqueia.
  for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) por(m, "obj", 26 + i, 3 + j, K(0 + i, 12 + j));
  bloquear(m, 26, 3, 2, 2);
  placas.push({ texto: "2º ANDAR", x: 27 * TILE, y: 1 * TILE + 26, w: 120, h: 28, fonte: 16 });
  interativos.push({ nome: "escada_subir", area: celula(26, 3, 2, 2), texto: "A escada para o 2º andar: salas 3A, 3B, 3C e a sala dos professores." });
  saidas.push({ area: celula(26, 5, 2, 1), para: "escola2", x: 27 * TILE, y: 6 * TILE + 44, dir: "baixo" });

  CENAS.escola = {
    mapa: m,
    corFora: "#3a3050",
    saidas, interativos, placas,
    // À noite (js/dias.js): as outras salas ficam trancadas e a 3C só abre depois de falar com a Millena
    bloqueios: SALAS.filter((s) => s.cena).map((s) => ({
      area: celula(s.x, 2), recuo: { x: 0, y: 2 * TILE },
      texto: s.cena === "aula_3c" ? "Primeiro preciso falar com a Millena." : "A sala está trancada à noite.",
      se: function () { return noiteAtiva() && (s.cena !== "aula_3c" || !historia.noitePlano); }
    })),
    npcs: [
      // --- Millena, à noite, no corredor (parte 3) ---
      {
        nome: "Millena",
        x: 13 * TILE + TILE / 2, y: 9 * TILE + 58,
        imagem: ["assets/Millena.png", "assets/Millena.jpg", "assets/millena.png", "assets/millena.jpg"],
        quadro: { linha: 0, coluna: 0 },
        limitePreto: 18,
        se: function () { return noiteAtiva() && !historia.noiteEntrou3C; },     // depois some do corredor: espera na 3C
        conversar: function () {
          if (historia.noitePlano) { abrirDialogo(DIALOGOS.noite.millenaDepois); return; }
          abrirDialogo(DIALOGOS.noite.millena, function () { mostrarMensagem("Suba a escada, no fim do corredor, e vá até a sala 3C."); });
        }
      },
      // --- Dia 10: Millena e Nathalia vieram com a Dellalos (js/dia10.js) ---
      {
        nome: "Millena",
        x: 13 * TILE + TILE / 2, y: 10 * TILE + 58,
        imagem: ["assets/Millena.png", "assets/Millena.jpg", "assets/millena.png", "assets/millena.jpg"],
        quadro: { linha: 0, coluna: 0 },
        limitePreto: 18,
        se: function () { return ehDia10() && !noiteAtiva(); },
        conversar: function () { abrirDialogo(DIALOGOS.dia10.millena); }
      },
      {
        nome: "Nathalia",
        x: 11 * TILE + TILE / 2, y: 10 * TILE + 58,
        imagem: ["assets/Nathalia.png", "assets/nathalia.png", "assets/Nathalia.jpg"],
        quadro: { linha: 0, coluna: 0 },
        se: function () { return ehDia10() && !noiteAtiva(); },
        conversar: function () { abrirDialogo(DIALOGOS.dia10.nathalia); }
      },
      {
        nome: "Estudante",
        x: 16 * TILE + TILE / 2, y: 8 * TILE + 58,     // no meio do corredor
        se: function () { return !noiteAtiva(); },     // à noite só tem a Millena no corredor
        imagem: ["assets/Estudante.png", "assets/estudante.png"],
        quadro: { linha: 0, coluna: 0 },
        conversar: function () {
          if (historia.conheceuEstudante) abrirDialogo(DIALOGOS.estudante.depois);
          else abrirDialogo(DIALOGOS.estudante.primeira, function () { historia.conheceuEstudante = true; });
        }
      },

      // ----- Novos. A Veras fica na entrada (a imagem dela ainda é provisória). Lucas, Simon e Vitinho agora ficam na sala 3A (js/salas/aulas.js). Só aparecem depois do 1º dia. -----
      {
        nome: "Veras", imagem: ["assets/Veras.png", "assets/veras.png"], quadro: { linha: 0, coluna: 0 },
        x: 3 * TILE + TILE / 2, y: 9 * TILE + 58,
        se: function () { return historia.conheceuLucas && !noiteAtiva(); },
        conversar: function () {
          if (historia.conheceuVeras) abrirDialogo(DIALOGOS.veras.depois);
          else abrirDialogo(DIALOGOS.veras.primeira, function () { historia.conheceuVeras = true; });
        }
      }
    ]
  };

  // Guarda onde cada sala fica no corredor (as salas de aula usam isto para voltar)
  CENAS.escola.portasDasSalas = {};
  for (const s of SALAS) if (s.cena) CENAS.escola.portasDasSalas[s.cena] = s.x;
  CENAS.escola.portasDasSalas.aula_1a = 3;     // a 1A abre com a chave (js/chave1a.js)
})();
