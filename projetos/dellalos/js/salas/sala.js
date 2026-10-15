/* =====================================================
   salas/sala.js - A sala da casa da Dellalos (por dentro)
   ===================================================== */

(function () {
  const m = criarMapa(18, 12);
  salaInterna(m, PISO_MADEIRA);

  // Janelas na parede
  janela(m, 4, 1, JANELA2);
  janela(m, 13, 1, JANELA2);

  // Sofá (3 tiles) e estante
  por(m, "obj", 3, 3, SOFA_E); por(m, "obj", 4, 3, SOFA_M); por(m, "obj", 5, 3, SOFA_D);
  bloquear(m, 3, 3, 3, 1);
  por(m, "obj", 8, 3, ESTANTE); bloquear(m, 8, 3);

  // Mesa com o livro e uma planta
  por(m, "obj", 13, 6, MESA_LIVRO); bloquear(m, 13, 6);
  por(m, "obj", 15, 3, PLANTA); bloquear(m, 15, 3);

  // Porta para a rua (na parede de baixo)
  portaInterna(m, PORTAS.sala.x, PORTAS.sala.y);

  const fora = nasceFora(PORTAS.casa);

  CENAS.sala = {
    mapa: m,
    corFora: "#3a3050",
    spawn: nasceDentroAcima(PORTAS.sala),
    interativos: [
      { nome: "sofa",   area: celula(3, 3, 3, 1),  texto: "Não posso dormir agora, tenho que ir para a escola." },
      { nome: "estante", area: celula(8, 3),       texto: "Uma estante cheia de livros." },
      { nome: "livro",  area: celula(13, 6),       texto: "Um livro velho do papai." }
    ],
    saidas: [
      { area: celula(PORTAS.sala.x, PORTAS.sala.y), para: "estrada", x: fora.x, y: fora.y, dir: "baixo" }
    ]
  };
})();
