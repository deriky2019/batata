/* =====================================================
   salas/necro.js - A loja NECRO por dentro (só abre de NOITE)
   A fachada fica na Zona Leste (js/salas/zonaleste.js) e só existe de noite. Ao amanhecer, quem estiver aqui
   dentro é mandado para a rua (js/ciclo.js). O dono se chama Necro e só vende coisas sobrenaturais.
   Para vender outra coisa, edite NECRO_ITENS em js/loja.js.
   ===================================================== */

(function () {
  const m = criarMapa(12, 10);
  salaInterna(m, PISO_MADEIRA);

  // Janelas na parede
  janela(m, 3, 1, JANELA2);
  janela(m, 8, 1, JANELA2);

  // Prateleiras cheias de frascos nos cantos de cima e plantas "mortas" ao redor
  for (const x of [1, 2, 9, 10]) { por(m, "obj", x, 3, ESTANTE); bloquear(m, x, 3); }
  por(m, "obj", 3, 3, PLANTA); bloquear(m, 3, 3);
  por(m, "obj", 8, 3, PLANTA); bloquear(m, 8, 3);
  por(m, "obj", 1, 8, PLANTA); bloquear(m, 1, 8);
  por(m, "obj", 10, 8, PLANTA); bloquear(m, 10, 8);

  // Balcão (4 tiles) - o Necro fica atrás dele
  for (let x = 4; x <= 7; x++) { por(m, "obj", x, 5, MESA_LIVRO); }
  bloquear(m, 4, 5, 4, 1);

  // Porta para a rua (parede de baixo)
  portaInterna(m, PORTAS.necroDentro.x, PORTAS.necroDentro.y);
  const fora = nasceFora(PORTAS.necro);

  function falarComNecro() {
    if (!historia.conheceuNecro) {
      abrirDialogo(DIALOGOS.necro.primeira, function () {
        historia.conheceuNecro = true;
        abrirLoja(NECRO_ITENS, "necro");
      });
      return;
    }
    abrirDialogo(DIALOGOS.necro.outraVez, function () { abrirLoja(NECRO_ITENS, "necro"); });
  }

  CENAS.necro = {
    mapa: m,
    corFora: "#140b1f",
    spawn: nasceDentroAcima(PORTAS.necroDentro),
    npcs: [
      {
        nome: "Necro",
        x: 6 * TILE, y: 4 * TILE + 58,                 // atrás do balcão
        imagem: ["assets/Morador2.png", "assets/morador2.png", "assets/Morador2.jpg"],   // por enquanto usa a imagem do Morador2: troque por uma imagem própria
        quadro: { linha: 0, coluna: 0 },
        conversar: falarComNecro
      }
    ],
    interativos: [
      { nome: "balcao_necro", area: celula(4, 5, 4, 1), conversar: falarComNecro },
      { nome: "prateleiras_necro",  area: celula(1, 3, 2, 1), texto: "Frascos que se mexem quando você não está olhando." },
      { nome: "prateleiras_necro2", area: celula(9, 3, 2, 1), texto: "Ossos pequenos, velas pretas e uma caixa que sussurra." }
    ],
    saidas: [
      { area: celula(PORTAS.necroDentro.x, PORTAS.necroDentro.y), para: "zona_leste", x: fora.x, y: fora.y, dir: "baixo" }
    ]
  };
})();
