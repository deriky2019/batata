/* =====================================================
   salas/loja.js - A loja da estrada (por dentro)
   O Seu Tomás atrás do balcão: conversar com ele (ou tocar no balcão) abre a loja (js/loja.js).
   Para vender outra coisa, edite LOJA_ITENS em js/loja.js.
   ===================================================== */

(function () {
  const m = criarMapa(12, 10);
  salaInterna(m, PISO_MADEIRA);

  // Janelas na parede
  janela(m, 3, 1, JANELA2);
  janela(m, 8, 1, JANELA2);

  // Prateleiras nos cantos de cima e plantas
  for (const x of [1, 2, 9, 10]) { por(m, "obj", x, 3, ESTANTE); bloquear(m, x, 3); }
  por(m, "obj", 3, 3, PLANTA); bloquear(m, 3, 3);
  por(m, "obj", 8, 3, PLANTA); bloquear(m, 8, 3);
  por(m, "obj", 1, 8, PLANTA); bloquear(m, 1, 8);
  por(m, "obj", 10, 8, PLANTA); bloquear(m, 10, 8);

  // Balcão (4 tiles) — o Seu Tomás fica atrás dele
  for (let x = 4; x <= 7; x++) { por(m, "obj", x, 5, MESA_LIVRO); }
  bloquear(m, 4, 5, 4, 1);

  // Porta para a rua (parede de baixo)
  portaInterna(m, PORTAS.lojaDentro.x, PORTAS.lojaDentro.y);
  const fora = nasceFora(PORTAS.loja);

  // Conversa nova do Seu Tomás depois de comprar colete/armadura (uma vez cada)
  function conversaNovaDoTomas() {
    if (diaAtual() >= DIA_AMULETO_ESTRANHO && !historia.tomasFalouAmuleto) {   // chegou o amuleto estranho (ele não sabe para que serve)
      return { falas: DIALOGOS.tomas.amuleto, fim: function () { historia.tomasFalouAmuleto = true; } };
    }
    if (historia.comprouColete && !historia.tomasFalouColete) {
      return { falas: DIALOGOS.tomas.colete, fim: function () { historia.tomasFalouColete = true; } };
    }
    if (historia.comprouArmadura && !historia.tomasFalouArmadura) {
      const falas = DIALOGOS.tomas.armadura.slice();
      if (historia.pegouOrdemFabrica) {
        falas.push({ quem: "Dellalos", texto: "A ordem de produção da fábrica falava disso mesmo: equipamento para o evento, prazo dia 5." });
      }
      return { falas: falas, fim: function () { historia.tomasFalouArmadura = true; } };
    }
    return null;
  }

  function falarComLojista() {
    if (!historia.conheceuTomas) {
      abrirDialogo(DIALOGOS.tomas.primeira, function () {
        historia.conheceuTomas = true;
        abrirLoja();
      });
      return;
    }
    const nova = conversaNovaDoTomas();
    if (nova) {
      abrirDialogo(nova.falas, function () { nova.fim(); abrirLoja(); });
      return;
    }
    abrirLoja();
  }

  CENAS.loja = {
    mapa: m,
    corFora: "#3a3050",
    spawn: nasceDentroAcima(PORTAS.lojaDentro),
    npcs: [
      {
        nome: "Seu Tomás",
        x: 6 * TILE, y: 4 * TILE + 58,                 // atrás do balcão
        imagem: ["assets/Morador.png", "assets/morador.png"],   // por enquanto usa a imagem do Morador
        quadro: { linha: 0, coluna: 0 },
        conversar: falarComLojista
      }
    ],
    interativos: [
      { nome: "balcao",     area: celula(4, 5, 4, 1), conversar: falarComLojista },
      { nome: "prateleiras", area: celula(1, 3, 2, 1), texto: "Prateleiras com poções e mantimentos." },
      { nome: "prateleiras2", area: celula(9, 3, 2, 1), texto: "Caixas e ferramentas empilhadas." }
    ],
    saidas: [
      { area: celula(PORTAS.lojaDentro.x, PORTAS.lojaDentro.y), para: "estrada", x: fora.x, y: fora.y, dir: "baixo" }
    ]
  };
})();
