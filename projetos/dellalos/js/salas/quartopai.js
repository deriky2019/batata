/* =====================================================
   salas/quartopai.js - O quarto do pai (abre com a chave, na sala da casa)
   ===================================================== */

(function () {
  const m = criarMapa(12, 10);
  salaInterna(m, PISO_MADEIRA);

  // Janelas na parede
  janela(m, 3, 1, JANELA2);
  janela(m, 8, 1, JANELA2);

  // Estantes, escrivaninha com cadeira, sofá e planta
  por(m, "obj", 1, 3, ESTANTE); bloquear(m, 1, 3);
  por(m, "obj", 2, 3, ESTANTE); bloquear(m, 2, 3);
  por(m, "obj", 9, 3, CARTEIRA); bloquear(m, 9, 3);
  por(m, "obj", 9, 4, CADEIRA);
  por(m, "obj", 3, 6, SOFA_E); por(m, "obj", 4, 6, SOFA_M); por(m, "obj", 5, 6, SOFA_D);
  bloquear(m, 3, 6, 3, 1);
  por(m, "obj", 10, 3, PLANTA); bloquear(m, 10, 3);

  // Porta para a sala da casa (parede de baixo)
  portaInterna(m, PORTAS.quarto.x, PORTAS.quarto.y);
  const sala = nasceDentroAbaixo(PORTAS.quartoPai);   // logo abaixo da porta, dentro da sala

  CENAS.quarto_pai = {
    mapa: m,
    corFora: "#3a3050",
    interativos: [
      { nome: "estantes", area: celula(1, 3, 2, 1), texto: "Livros de trabalho do papai." },
      { nome: "sofa",     area: celula(3, 6, 3, 1), texto: "O sofá onde o papai descansava." },
      {
        nome: "escrivaninha",
        area: celula(9, 3),
        conversar: function () {
          if (historia.pegouCartaPai) { mostrarMensagem("A escrivaninha do papai."); return; }
          if (!darItem("carta_pai")) return;           // inventário cheio: tenta de novo depois
          historia.pegouCartaPai = true;
          mostrarMensagem("Você pegou: " + ITENS.carta_pai.nome + ".");
        }
      }
    ],
    saidas: [
      { area: celula(PORTAS.quarto.x, PORTAS.quarto.y), para: "sala", x: sala.x, y: sala.y, dir: "baixo" }
    ]
  };
})();
