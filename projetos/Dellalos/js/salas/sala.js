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

  // Armário de roupas (canto esquerdo): troca o sprite da Dellalos a partir do dia 2 (js/roupas.js)
  moveisII(m, 1, 3, 9, 49, 2, 2);

  // Mesa com o livro e uma planta
  por(m, "obj", 13, 6, MESA_LIVRO); bloquear(m, 13, 6);
  por(m, "obj", 15, 3, PLANTA); bloquear(m, 15, 3);

  // Porta do quarto do pai (parede de cima): trancada até Dellalos ter a chave
  const pq = PORTAS.quartoPai;
  porta(m, pq.x, pq.y, PORTA_LARANJA, true);

  // Porta para a rua (na parede de baixo)
  portaInterna(m, PORTAS.sala.x, PORTAS.sala.y);

  const fora = nasceFora(PORTAS.casa);

  CENAS.sala = {
    mapa: m,
    corFora: "#3a3050",
    spawn: nasceDentroAcima(PORTAS.sala),
    interativos: [
      { nome: "sofa",   area: celula(3, 3, 3, 1),  conversar: function () { usarSofaDaSala(); } },
      { nome: "armario_roupas", area: celula(1, 3, 2, 2), conversar: function () { usarArmario(0); } },
      { nome: "estante", area: celula(8, 3),       texto: "Uma estante cheia de livros." },
      { nome: "livro",  area: celula(13, 6),       conversar: function () { usarLivroDoPapai(); } },
      { nome: "porta_quarto_pai", area: celula(pq.x, pq.y), conversar: tentarAbrirQuartoPai }
    ],
    // Se a porta já foi destrancada (save), ela volta aberta
    aoEntrar: function () { avisarArmarioSeNecessario(); if (historia.quartoPaiAberto) abrirPortaQuartoPai(); else fecharPortaQuartoPai(); },
    saidas: [
      { area: celula(PORTAS.sala.x, PORTAS.sala.y), para: "estrada", x: fora.x, y: fora.y, dir: "baixo" }
    ]
  };
})();

// ----- Porta do quarto do pai -----
// Sem a chave: fica trancada. Com a chave: a porta abre para sempre (a chave continua no inventário).
function tentarAbrirQuartoPai() {
  if (historia.quartoPaiAberto) return;
  if (!temItem("chave_quarto_pai")) {
    mostrarMensagem("Está trancada. É o quarto do papai.");
    return;
  }
  // A chave NÃO sai do inventário: é uma lembrança do papai (a descrição dela muda depois de usada)
  historia.quartoPaiAberto = true;
  abrirPortaQuartoPai();
  mostrarMensagem("Você destrancou a porta do quarto do papai. A chave continua com você.");
}

// Deixa a porta livre para passar e cria a saída para o quarto (pode ser chamada várias vezes)
function abrirPortaQuartoPai() {
  const c = CENAS.sala;
  if (c._quartoAberto) return;
  c._quartoAberto = true;
  const p = PORTAS.quartoPai;
  porta(c.mapa, p.x, p.y, PORTA_LARANJA, false);
  c.interativos = c.interativos.filter((o) => o.nome !== "porta_quarto_pai");
  const dentro = nasceDentroAcima(PORTAS.quarto);
  c.saidas.push({ area: celula(p.x, p.y), para: "quarto_pai", x: dentro.x, y: dentro.y, dir: "cima" });
}

// Fecha a porta de novo (usado quando começa "Do zero" sem recarregar a página)
function fecharPortaQuartoPai() {
  const c = CENAS.sala;
  if (!c._quartoAberto) return;
  c._quartoAberto = false;
  const p = PORTAS.quartoPai;
  porta(c.mapa, p.x, p.y, PORTA_LARANJA, true);
  c.saidas = c.saidas.filter((s) => s.para !== "quarto_pai");
  if (!c.interativos.some((o) => o.nome === "porta_quarto_pai")) {
    c.interativos.push({ nome: "porta_quarto_pai", area: celula(p.x, p.y), conversar: tentarAbrirQuartoPai });
  }
}

// ----- Sofá: depois de explorar o quarto do papai, dá para descansar até o dia seguinte -----
function usarSofaDaSala() {
  const motivo = motivoNaoDormir();       // regras de cada dia (js/dias.js)
  const noite = cicloEhNoite();           // ciclo de dia e noite (js/ciclo.js)
  if (motivo && !noite) { mostrarMensagem(motivo); return; }
  if (motivo && noite) {                  // já é noite, mas o dia ainda não pode acabar: dorme e o mesmo dia recomeça
    abrirDialogo([
      { quem: "Dellalos", texto: motivo },
      { quem: "Dellalos", texto: "Mas já é noite e eu não aguento mais. Vou dormir um pouco e continuar amanhã cedo.",
        escolha: "dormir_noite",
        opcoes: [
          { id: "sim", texto: "Dormir até amanhecer", fn: function () { dormirSemAvancarDia(); } },
          { id: "nao", texto: "Ainda não" }
        ] }
    ]);
    return;
  }
  abrirDialogo(DIALOGOS.dellalos.dormir);
}

// Tela preta "No dia seguinte...": novo dia, vida cheia e os slimes voltam
function dormirAteAmanha() {
  if (diaAtual() === DIA_NOITE && !historia.noiteIniciada) { iniciarNoiteDia4(); return; }   // noite do dia 4 (js/dias.js)
  iniciarTelaTempo("No dia seguinte...", comecarProximoDia, 2.5);   // js/dias.js
}

// ----- Livro do papai / grimório de aprimoramento -----
// Sem o grimório: só o livro velho. Com o grimório no inventário: ela o coloca no lugar do livro do papai.
// Depois de instalado: tocar na mesa abre a árvore de habilidades (js/loja.js), paga com essências.
function usarLivroDoPapai() {
  if (historia.grimorioInstalado) { abrirArvore(); return; }
  if (temItem("grimorio_aprimoramento")) {
    abrirDialogo([
      { quem: "Dellalos", texto: "Vou deixar o grimório no lugar do livro do papai. Desculpa, pai. Eu guardo ele em outro lugar depois." },
      { quem: "Dellalos", texto: "As páginas estão se escrevendo sozinhas. Cada símbolo pede uma essência dos espíritos." }
    ], function () {
      tirarItem("grimorio_aprimoramento");
      historia.grimorioInstalado = true;
      abrirArvore();
    });
    return;
  }
  mostrarMensagem("Um livro velho do papai.");
}
