/* =====================================================
   Sul 2 — comunidade de sobreviventes e fazenda.
   Área nova, isolada em seu próprio arquivo para preservar o conteúdo do jogo-base.
   Missão introdutória: preparar a terra, plantar, regar e colher.
   ===================================================== */
(function () {
  const W = 48, H = 40, CX = 24;
  const m = criarMapa(W, H);
  pintar(m, "chao", 0, 0, W, H, GRAMA);

  // Estrada que continua naturalmente a partir do Bairro Sul.
  pintar(m, "chao", CX - 4, 0, 2, H, CALCADA);
  pintar(m, "chao", CX + 3, 0, 2, H, CALCADA);
  pintar(m, "chao", CX - 2, 0, 5, H, ASFALTO);
  for (let y = 0; y < H; y++) por(m, "chao", CX, y, TRACO_V);

  // Caminhos de terra ao redor da fazenda e das moradias dos sobreviventes.
  pintar(m, "chao", 3, 13, 42, 3, CALCADA);
  pintar(m, "chao", 5, 27, 38, 2, CALCADA);
  pintar(m, "chao", 7, 16, 3, 11, CALCADA);
  pintar(m, "chao", 38, 16, 3, 11, CALCADA);

  // Casa comunitária (à esquerda) e casa da responsável pela fazenda (à direita).
  predio(m, 4, 5, 8, 3, ESTILO_LARANJA);
  janela(m, 5, 8); janela(m, 10, 8);
  porta(m, 8, 9, PORTA_LARANJA, false);
  pintar(m, "chao", 8, 10, 1, 3, CALCADA);

  predio(m, 34, 5, 9, 3, ESTILO_VERMELHO);
  janela(m, 35, 8); janela(m, 40, 8);
  porta(m, 38, 9, PORTA_DUPLA_BRANCA, false);
  pintar(m, "chao", 38, 10, 1, 3, CALCADA);

  // Área agrícola central: canteiros largos, cercados e com corredores de acesso.
  // Reutiliza os tiles locais do jogo para manter o pacote totalmente offline.
  for (let x = 13; x <= 34; x++) {
    if (x !== 23 && x !== 24 && x !== 25) {
      por(m, "obj", x, 18, K(4 + (x % 3), 14)); bloquear(m, x, 18);
      por(m, "obj", x, 26, K(4 + (x % 3), 14)); bloquear(m, x, 26);
    }
  }
  // Aberturas nas cercas ligam os caminhos aos canteiros sem prender o jogador.
  const talhoes = [
    { x: 14, y: 20, id: 1 }, { x: 21, y: 20, id: 2 }, { x: 28, y: 20, id: 3 },
    { x: 14, y: 23, id: 4 }, { x: 21, y: 23, id: 5 }, { x: 28, y: 23, id: 6 }
  ];
  talhoes.forEach((t, i) => {
    pintar(m, "chao", t.x, t.y, 4, 2, K(5, 9));
    // Marcas repetidas sobre a terra sugerem fileiras de mudas no tileset disponível.
    por(m, "obj", t.x + 1, t.y, K(4, 11));
    por(m, "obj", t.x + 2, t.y + 1, K(4, 11));
    if (i % 2 === 0) por(m, "obj", t.x + 3, t.y, K(5, 11));
  });
  // Canteiro de demonstração e depósito de ferramentas junto à fazenda.
  pintar(m, "chao", 15, 19, 19, 7, K(1, 1));
  talhoes.forEach((t, i) => {
    pintar(m, "chao", t.x, t.y, 4, 2, K(5, 9));
    por(m, "obj", t.x + 1, t.y, K(4, 11));
    por(m, "obj", t.x + 2, t.y + 1, K(4, 11));
    if (i % 2 === 0) por(m, "obj", t.x + 3, t.y, K(5, 11));
  });
  // Poço para regar a plantação.
  por(m, "obj", 31, 29, K(11, 6)); por(m, "obj", 32, 29, K(12, 6));
  por(m, "obj", 31, 30, K(11, 7)); por(m, "obj", 32, 30, K(12, 7));
  bloquear(m, 31, 29, 2, 2);

  // Árvores e pequenos obstáculos na borda, sem fechar a passagem central.
  for (let x = 0; x < W; x++) {
    if (x < CX - 4 || x > CX + 4) {
      if (m.chao[2 * W + x] === GRAMA) arvore(m, x, 2, x % 4);
      if (m.chao[(H - 1) * W + x] === GRAMA) arvore(m, x, H - 1, x % 4);
    }
  }
  for (let y = 5; y < H - 3; y += 3) {
    if (m.chao[y * W] === GRAMA) arvore(m, 0, y, y % 4);
    if (m.chao[y * W + W - 1] === GRAMA) arvore(m, W - 1, y, y % 4);
  }

  const spawnBairroSul = { x: 24 * TILE + TILE / 2, y: 35 * TILE + 40 };
  const spawnInterior = { x: 7 * TILE + TILE / 2, y: 4 * TILE + 40 };
  const falas = (quem, texto) => [{ quem, texto }];

  // Simulação persistente da fazenda: cada talhão tem preparo, sementes,
  // umidade e progresso real de crescimento (avança enquanto o jogo roda).
  const dadosTalhoes = [
    { x: 14, y: 20, id: 1 }, { x: 21, y: 20, id: 2 }, { x: 28, y: 20, id: 3 },
    { x: 14, y: 23, id: 4 }, { x: 21, y: 23, id: 5 }, { x: 28, y: 23, id: 6 }
  ];
  const fazendaSul = { aguaNoBalde: false, talhoes: dadosTalhoes.map(t => ({ id: t.id, preparado: false, plantado: false, crescimento: 0, umidade: 0, colhido: false })) };
  const TEMPO_CRESCIMENTO = 75; // segundos de solo úmido acumulados
  const TEMPO_UMIDADE = 45;      // umidade dura 45 segundos sem chuva/rega

  function talhaoMaisProximo() {
    const px = jogador.x / TILE, py = (jogador.y - 40) / TILE;
    let melhor = 0, menor = Infinity;
    dadosTalhoes.forEach((t, i) => {
      const d = Math.hypot((t.x + 2) - px, (t.y + 1) - py);
      if (d < menor) { menor = d; melhor = i; }
    });
    return melhor;
  }
  function desenharEstadoTalhao(i) {
    const t = dadosTalhoes[i], p = fazendaSul.talhoes[i];
    const etapa = !p.plantado ? 0 : (p.crescimento >= TEMPO_CRESCIMENTO ? 3 : p.crescimento >= TEMPO_CRESCIMENTO * 0.62 ? 2 : p.crescimento >= TEMPO_CRESCIMENTO * 0.25 ? 1 : 0);
    const muda = etapa === 0 ? K(4, 11) : etapa === 1 ? K(5, 11) : etapa === 2 ? K(6, 11) : K(7, 11);
    por(m, "obj", t.x + 1, t.y, p.plantado ? muda : -1);
    por(m, "obj", t.x + 2, t.y + 1, p.plantado ? muda : -1);
    por(m, "obj", t.x + 3, t.y, p.plantado && etapa >= 2 ? muda : -1);
  }
  function atualizarVisualFazenda() { dadosTalhoes.forEach((_, i) => desenharEstadoTalhao(i)); }
  function atualizarFazendaSul(dt) {
    if (!dt || !cenaAtual || !jogoRodando()) return;
    const nestaFazenda = idDaCena(cenaAtual) === "bairro_sul2";
    const chovendo = nestaFazenda && typeof climaChuva !== "undefined" && climaChuva.ativa;
    fazendaSul.talhoes.forEach((p, i) => {
      if (!p.plantado || p.crescimento >= TEMPO_CRESCIMENTO) return;
      if (chovendo) p.umidade = TEMPO_UMIDADE;
      if (p.umidade > 0) {
        p.crescimento = Math.min(TEMPO_CRESCIMENTO, p.crescimento + dt);
        p.umidade = Math.max(0, p.umidade - dt);
        desenharEstadoTalhao(i);
      }
    });
  }
  window.obterEstadoFazendaSul = () => JSON.parse(JSON.stringify(fazendaSul));
  window.aplicarEstadoFazendaSul = (estado) => {
    if (!estado || !Array.isArray(estado.talhoes)) return;
    fazendaSul.aguaNoBalde = !!estado.aguaNoBalde;
    fazendaSul.talhoes.forEach((p, i) => {
      const salvo = estado.talhoes.find(t => t && t.id === p.id);
      if (!salvo) return;
      p.preparado = !!salvo.preparado; p.plantado = !!salvo.plantado;
      p.crescimento = Math.max(0, Math.min(TEMPO_CRESCIMENTO, Number(salvo.crescimento) || 0));
      p.umidade = Math.max(0, Math.min(TEMPO_UMIDADE, Number(salvo.umidade) || 0));
      p.colhido = !!salvo.colhido;
    });
    atualizarVisualFazenda();
  };

  function conversarDonaRosa() {
    if (historia.fazendaSulMissaoConcluida) {
      abrirDialogo(falas("Dona Rosa", "A colheita já ajudou todo mundo por aqui. Obrigada por não esquecer dos sobreviventes."));
      return;
    }
    if (!historia.fazendaSulMissaoIniciada) {
      abrirDialogo([
        { quem: "Dona Rosa", texto: "Somos sobreviventes tentando reconstruir a vida. A plantação pode alimentar todo mundo, mas precisamos de ajuda." },
        { quem: "Dona Rosa", texto: "Prepare um canteiro, plante as sementes, regue usando o poço e colha quando estiver pronto. Você me ajuda?", escolha: "aceitar_fazenda_sul", opcoes: [
          { id: "sim", texto: "Vou ajudar", fn: function () { historia.fazendaSulMissaoIniciada = true; mostrarMensagem("Nova missão: A Fazenda Precisa de Você"); } },
          { id: "depois", texto: "Agora não" }
        ] }
      ]);
      return;
    }
    if (!historia.fazendaSulCanteiroPreparado) abrirDialogo(falas("Dona Rosa", "Comece preparando um dos canteiros marcados. Interaja com a terra para trabalhar nela."));
    else if (!historia.fazendaSulSementesPlantadas) abrirDialogo(falas("Dona Rosa", "A terra está pronta. Agora plante as sementes no canteiro preparado."));
    else if (!historia.fazendaSulPlantacaoRegada) abrirDialogo(falas("Dona Rosa", "As sementes precisam de água. Vá até o poço e depois regue o canteiro."));
    else if (!historia.fazendaSulColheitaFeita) abrirDialogo(falas("Dona Rosa", "Regue o canteiro e espere as plantas crescerem com o solo úmido. A chuva também ajuda; depois interaja para colher."));
    else abrirDialogo(falas("Dona Rosa", "Você conseguiu! Esta colheita vai alimentar a comunidade. Obrigada, Dellalos."), function () {
      historia.fazendaSulMissaoConcluida = true;
      if (typeof diario !== "undefined" && diario.registrar) diario.registrar("Você ajudou os sobreviventes do Sul 2 a iniciar a fazenda.");
      mostrarMensagem("Missão concluída: A Fazenda Precisa de Você");
    });
  }

  function interagirCanteiro() {
    if (!historia.fazendaSulMissaoIniciada) { mostrarMensagem("A terra está esperando por alguém que possa cuidar dela. Converse com Dona Rosa."); return; }
    const i = talhaoMaisProximo(), p = fazendaSul.talhoes[i];
    if (!p.preparado) {
      p.preparado = true;
      historia.fazendaSulCanteiroPreparado = true;
      mostrarMensagem("Canteiro " + p.id + " preparado. Agora plante as sementes.");
    } else if (!p.plantado) {
      p.plantado = true; p.crescimento = 0; p.umidade = 0; p.colhido = false;
      historia.fazendaSulSementesPlantadas = true;
      desenharEstadoTalhao(i);
      mostrarMensagem("Sementes plantadas no canteiro " + p.id + ". Regue para iniciar o crescimento.");
    } else if (p.crescimento >= TEMPO_CRESCIMENTO) {
      p.plantado = false; p.preparado = true; p.crescimento = 0; p.umidade = 0; p.colhido = true;
      historia.fazendaSulColheitaFeita = true;
      if (typeof darItem === "function") darItem("vegetais_frescos");
      desenharEstadoTalhao(i);
      mostrarMensagem("Colheita pronta! Você recolheu vegetais frescos do canteiro " + p.id + ".");
    } else if (p.umidade > 0) {
      const pct = Math.floor(p.crescimento / TEMPO_CRESCIMENTO * 100);
      mostrarMensagem("A plantação está crescendo: " + pct + "%. Solo úmido por mais " + Math.ceil(p.umidade) + " s.");
    } else if (!fazendaSul.aguaNoBalde) {
      mostrarMensagem("A plantação precisa de água. Pegue água no poço e volte para este canteiro.");
    } else {
      fazendaSul.aguaNoBalde = false; p.umidade = TEMPO_UMIDADE;
      historia.fazendaSulPlantacaoRegada = true;
      mostrarMensagem("Canteiro " + p.id + " regado! O crescimento começa agora e para quando a terra secar. A chuva também irriga a plantação.");
    }
  }

  CENAS.bairro_sul2 = {
    mapa: m,
    spawn: { x: 24 * TILE + TILE / 2, y: 4 * TILE + 40 },
    npcs: [
      { nome: "Dona Rosa", cor: "#b86f4b", imagem: ["assets/npcs/amelia.png", "assets/Morador.png"], x: 37 * TILE + TILE / 2, y: 13 * TILE + 58, direcao: "baixo", conversar: conversarDonaRosa },
      { nome: "Mateus", cor: "#63845a", imagem: ["assets/npcs/alex.png", "assets/Morador2.png"], x: 10 * TILE + TILE / 2, y: 15 * TILE + 58, direcao: "direita", conversar: function () { abrirDialogo(falas("Mateus", "A fazenda é nossa chance de sobreviver. Se o poço secar, vamos precisar economizar cada gota.")); } },
      { nome: "Lia", cor: "#d19b55", imagem: ["assets/npcs/amelia.png", "assets/Morador.png"], x: 31 * TILE + TILE / 2, y: 28 * TILE + 58, direcao: "cima", conversar: function () { abrirDialogo(falas("Lia", "Quando a plantação crescer, poderemos dividir a comida com quem chegar por aqui.")); } }
    ],
    interativos: [
      { nome: "canteiro_plantacao", area: celula(15, 20, 15, 5), conversar: interagirCanteiro },
      { nome: "poco_fazenda", area: celula(31, 29, 2, 2), conversar: function () {
        if (!historia.fazendaSulMissaoIniciada) { mostrarMensagem("Um poço antigo. Converse com Dona Rosa para saber como ajudar."); return; }
        fazendaSul.aguaNoBalde = true;
        historia.fazendaSulPegouAgua = true;
        mostrarMensagem("Balde cheio! Escolha um canteiro plantado e interaja para regá-lo. Cada balde rega um canteiro.");
      } },
      { nome: "casa_comunitaria", area: celula(8, 9), destino: { cena: "casa_comunitaria_sul2", x: spawnInterior.x, y: spawnInterior.y } },
      { nome: "casa_dona_rosa", area: celula(38, 9), destino: { cena: "casa_fazenda_sul2", x: spawnInterior.x, y: spawnInterior.y } },
      { nome: "placa_fazenda", area: celula(24, 13), texto: "FAZENDA COMUNITÁRIA — cada mão ajuda a alimentar os sobreviventes." }
    ],
    saidas: [
      { area: celula(CX - 2, 0, 5, 1), para: "bairro_sul", x: 24 * TILE + TILE / 2, y: 34 * TILE + 40, dir: "cima" },
      { area: celula(8, 9), para: "casa_comunitaria_sul2", x: spawnInterior.x, y: spawnInterior.y, dir: "baixo" },
      { area: celula(38, 9), para: "casa_fazenda_sul2", x: spawnInterior.x, y: spawnInterior.y, dir: "baixo" }
    ],
    placas: [
      { texto: "SUL 2", x: 17 * TILE, y: 3 * TILE + 24, w: 160, h: 42, fonte: 26 },
      { texto: "FAZENDA COMUNITÁRIA", x: 24 * TILE, y: 17 * TILE + 16, w: 300, h: 38, fonte: 20 }
    ],
    aoEntrar: function () {
      if (historia.visitouBairroSul2) return;
      historia.visitouBairroSul2 = true;
      if (typeof descobrirInfo === "function") descobrirInfo("bairro_sul2");
      mostrarMensagem("Sul 2 — Fazenda dos Sobreviventes");
    }
  };

  atualizarVisualFazenda();

  // Interiores simples e funcionais; a saída retorna ao caminho da casa correspondente.
  function criarInterior(id, titulo, retornoX, retornoY, mensagem) {
    const im = criarMapa(14, 10);
    pintar(im, "chao", 0, 0, 14, 10, K(11, 11));
    bloquear(im, 0, 0, 14, 10);
    bloquear(im, 1, 3, 12, 6, 0);
    paredeRB(im, 1, 1, 12, 7);
    moveisII(im, 2, 4, 5, 10, 4, 3, true);
    moveisII(im, 9, 4, 10, 44, 2, 3, true);
    por(im, "obj", 7, 1, II(7, 8)); por(im, "obj", 7, 2, II(7, 9));
    bloquear(im, 7, 1, 1, 1, 1); bloquear(im, 7, 2, 1, 1, 0);
    CENAS[id] = {
      mapa: im, corFora: "#14111c",
      interativos: [{ nome: "interior", area: celula(3, 4, 8, 3), texto: mensagem }],
      saidas: [{ area: celula(7, 2), para: "bairro_sul2", x: retornoX * TILE + TILE / 2, y: (retornoY + 1) * TILE + 40, dir: "baixo" }],
      placas: [{ texto: titulo, x: 7 * TILE + TILE / 2, y: 3 * TILE + 10, w: 220, h: 36, fonte: 18 }]
    };
  }
  criarInterior("casa_comunitaria_sul2", "ABRIGO COMUNITÁRIO", 8, 9, "Colchões, mantimentos e cobertores foram organizados para os sobreviventes.");
  criarInterior("casa_fazenda_sul2", "CASA DA FAZENDA", 38, 9, "Ferramentas e sementes ficam guardadas aqui. Dona Rosa mantém tudo organizado.");
})();
