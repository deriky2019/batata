/* =====================================================
   salas/escola2.js - O 2º ANDAR da escola (corredor de cima)
   Portas na parede de cima: 3A (x 3), 3B (x 8), 3C (x 13) e SALA DOS PROFESSORES (x 18).
   A escada fica à direita (x 26-27) e desce para o 1º andar (js/salas/escola.js).
   3A, 3C e a sala dos professores abrem (js/salas/aulas.js). A 3B só abre à noite, com a chave do Zé (js/dias.js).
   ===================================================== */

(function () {
  const COLS = 30, ROWS = 14;
  const m = criarMapa(COLS, ROWS);
  salaInterna(m, PISO_ESCOLA);

  const SALAS = [
    { nome: "3A",    x: 3,  cena: "aula_3a" },
    { nome: "3B",    x: 8,  disponivel: false },
    { nome: "3C",    x: 13, cena: "aula_3c" },
    { nome: "Prof.", x: 18, cena: "aula_professores", professores: true }
  ];

  const saidas = [], interativos = [], placas = [];
  const dentroDaAula = nasceDentroAcima(PORTAS.aula);

  for (const s of SALAS) {
    placas.push({ texto: s.nome, x: s.x * TILE + TILE / 2, y: 1 * TILE + 26, w: s.professores ? 72 : 48, h: 28, fonte: s.professores ? 16 : 20 });
    if (s.cena) {
      portaInterna(m, s.x, 2);   // porta aberta na parede
      saidas.push({ area: celula(s.x, 2), para: s.cena, x: dentroDaAula.x, y: dentroDaAula.y, dir: "cima" });
    } else {
      porta(m, s.x, 2, PORTA_LARANJA, true);   // porta trancada (3B)
      interativos.push({ nome: "porta_" + s.nome, area: celula(s.x, 2), conversar: function () { usarPorta3B(dentroDaAula); } });   // chave do Zé à noite (js/dias.js); com o Caio dá para espiar (js/exploracao.js)
    }
  }

  // Janelas entre as portas
  for (const x of [5, 10, 15, 20, 23]) janela(m, x, 1, JANELA2);

  // Enfeites do corredor: bancos e plantas
  for (const [x, y] of [[5, 7], [10, 7], [20, 7], [24, 7], [5, 10], [24, 10]]) {
    por(m, "obj", x, y, K(3, 14)); bloquear(m, x, y);
  }
  for (const [x, y] of [[1, 3], [28, 3], [12, 12], [17, 12]]) {
    por(m, "obj", x, y, PLANTA); bloquear(m, x, y);
  }

  // ESCADA que desce para o 1º andar (mesmo lugar da escada do térreo). Entra-se pela base dela (linha 5).
  for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) por(m, "obj", 26 + i, 3 + j, K(0 + i, 12 + j));
  bloquear(m, 26, 3, 2, 2);
  placas.push({ texto: "1º ANDAR", x: 27 * TILE, y: 1 * TILE + 26, w: 120, h: 28, fonte: 16 });
  interativos.push({ nome: "escada_descer", area: celula(26, 3, 2, 2), texto: "A escada para o 1º andar, onde fica a entrada da escola." });
  saidas.push({ area: celula(26, 5, 2, 1), para: "escola", x: 27 * TILE, y: 6 * TILE + 44, dir: "baixo" });

  CENAS.escola2 = {
    mapa: m,
    corFora: "#3a3050",
    saidas, interativos, placas,
    // À noite (js/dias.js): a 3A e a sala dos professores ficam trancadas; a 3C só abre depois de falar com a Millena
    bloqueios: SALAS.filter((s) => s.cena).map((s) => ({
      area: celula(s.x, 2), recuo: { x: 0, y: 2 * TILE },
      texto: s.cena === "aula_3c" ? "Primeiro preciso falar com a Millena." : "A sala está trancada à noite.",
      se: function () { return noiteAtiva() && (s.cena !== "aula_3c" || !historia.noitePlano); }
    })),
    npcs: []
  };

  // Guarda onde cada sala fica no corredor (as salas de aula usam isto para voltar)
  CENAS.escola2.portasDasSalas = {};
  for (const s of SALAS) if (s.cena) CENAS.escola2.portasDasSalas[s.cena] = s.x;
  CENAS.escola2.portasDasSalas.aula_3b = 8;     // a 3B abre à noite com a chave do Zé (js/dias.js)
})();
