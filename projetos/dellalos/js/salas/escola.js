/* =====================================================
   salas/escola.js - O corredor da escola (por dentro)
   Tem 6 portas de salas na parede de cima. Só 3 abrem por enquanto:
   2A, 2C e 3A (veja js/salas/aulas.js). As outras mostram "Ainda não disponível."
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
    { nome: "2C", x: 15, cena: "aula_2c" },
    { nome: "3A", x: 19, cena: "aula_3a" },
    { nome: "3B", x: 23, disponivel: false }
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
      interativos.push({ nome: "porta_" + s.nome, area: celula(s.x, 2), texto: "Ainda não disponível." });
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

  CENAS.escola = {
    mapa: m,
    corFora: "#3a3050",
    saidas, interativos, placas,
    npcs: [
      {
        nome: "Estudante",
        x: 16 * TILE + TILE / 2, y: 8 * TILE + 58,     // no meio do corredor
        imagem: ["assets/Estudante.png", "assets/estudante.png"],
        quadro: { linha: 0, coluna: 0 },
        conversar: function () {
          if (historia.conheceuEstudante) abrirDialogo(DIALOGOS.estudante.depois);
          else abrirDialogo(DIALOGOS.estudante.primeira, function () { historia.conheceuEstudante = true; });
        }
      },

      // ----- Novos (sem sprite ainda: boneco provisório). Só aparecem no dia seguinte. -----
      {
        nome: "Lucas", cor: "#3a4a6a",
        x: 22 * TILE + TILE / 2, y: 5 * TILE + 58,
        se: function () { return historia.novoDia; },
        conversar: function () {
          if (historia.conheceuLucas) abrirDialogo(DIALOGOS.lucas.depois);
          else abrirDialogo(DIALOGOS.lucas.primeira, function () { historia.conheceuLucas = true; });
        }
      },
      {
        nome: "Simon", cor: "#5a7a5a",
        x: 20 * TILE + TILE / 2, y: 5 * TILE + 58,
        se: function () { return historia.novoDia; },
        conversar: function () {
          abrirDialogo(historia.conheceuLucas ? DIALOGOS.simon.depois : DIALOGOS.simon.antes);
        }
      },
      {
        nome: "Vitinho", cor: "#7a6a3a",
        x: 24 * TILE + TILE / 2, y: 5 * TILE + 58,
        se: function () { return historia.novoDia; },
        conversar: function () {
          abrirDialogo(historia.conheceuLucas ? DIALOGOS.vitinho.depois : DIALOGOS.vitinho.antes);
        }
      },
      {
        nome: "Veras", cor: "#7a3a4a",
        x: 3 * TILE + TILE / 2, y: 9 * TILE + 58,
        se: function () { return historia.conheceuLucas; },
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
})();
