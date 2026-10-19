/* =====================================================
   Casas v57 - seis residências próprias, com interiores únicos.
   Adicionado sobre a expansão v57; não substitui cenas ou missões existentes.
   ===================================================== */
(function () {
  const casas = [
    { id: "casa_simon_v57", nome: "Casa do Simon", mapa: "estrada", x: 76, y: 8, portaX: 80, estilo: ESTILO_LARANJA, cor: "#a66d48", piso: PISO_MADEIRA, tema: "biblioteca", parede: 2, tapete: 4,
      itens: [[2,4,10,68,2,3],[10,4,1,72,3,2],[5,7,0,10,4,3],[12,4,10,44,2,3]],
      textos: ["Estantes cheias de livros e anotações do Simon.","O sofá está bem gasto, mas parece confortável.","A mesa tem papéis organizados e uma caneca.","Uma planta perto da janela recebe bastante luz."] },
    { id: "casa_millena_v57", nome: "Casa da Millena", mapa: "bairro_sul", x: 53, y: 8, portaX: 57, estilo: ESTILO_VERMELHO, cor: "#b86d86", piso: PISO_MADEIRA, tema: "floral", parede: 8, tapete: 1,
      itens: [[2,4,5,1,4,2],[10,4,7,72,3,2],[5,7,8,20,2,2],[12,4,0,49,1,2]],
      textos: ["A cama está arrumada com cuidado.","Um sofá com almofadas coloridas deixa a sala aconchegante.","Um quadro decorativo chama a atenção.","Uma pequena planta fica perto da janela."] },
    { id: "casa_nathalia_v57", nome: "Casa da Nathalia", mapa: "bairro_sul", x: 68, y: 8, portaX: 72, estilo: ESTILO_LARANJA, cor: "#8b79b8", piso: PISO_MADEIRA, tema: "lilas", parede: 12, tapete: 10,
      itens: [[2,4,3,8,1,2],[10,4,4,72,3,2],[5,7,8,22,2,2],[12,4,12,56,1,3]],
      textos: ["O computador e os materiais de estudo estão organizados.","Um sofá lilás deixa o ambiente com a cara da Nathalia.","Há fotografias e pequenos quadros na parede.","Um abajur ilumina o canto de leitura."] },
    { id: "casa_lucas_v57", nome: "Casa do Lucas", mapa: "zona_leste", x: 74, y: 8, portaX: 78, estilo: ESTILO_VERMELHO, cor: "#7a9fbd", piso: PISO_MADEIRA, tema: "azul-tecnologia", parede: 13, tapete: 7,
      itens: [[2,4,3,8,1,2],[10,4,4,72,3,2],[5,7,6,21,1,2],[12,4,13,48,2,3]],
      textos: ["O computador do Lucas está ligado em modo de espera.","O sofá tem uma manta dobrada no braço.","Uma cadeira está puxada para perto da mesa.","O armário está fechado e bem conservado."] },
    { id: "casa_veras_v57", nome: "Casa da Veras", mapa: "bairro_sul2", x: 51, y: 8, portaX: 55, estilo: ESTILO_LARANJA, cor: "#c58c9c", piso: PISO_MADEIRA, tema: "jardim-rosa", parede: 11, tapete: 8,
      itens: [[2,4,7,72,3,2],[10,4,10,44,2,3],[5,7,11,17,2,2],[12,4,0,20,2,2]],
      textos: ["Um sofá com almofadas macias ocupa a sala.","As plantas são cuidadas com atenção.","Um tapete colorido dá vida ao cômodo.","Fotografias decoram a parede."] },
    { id: "casa_vitinho_v57", nome: "Casa do Vitinho", mapa: "bairro_sul2", x: 66, y: 8, portaX: 70, estilo: ESTILO_VERMELHO, cor: "#d3a75e", piso: PISO_MADEIRA, tema: "dourado-criativo", parede: 6, tapete: 12,
      itens: [[2,4,1,72,3,2],[10,4,8,58,2,2],[5,7,6,13,1,1],[12,4,12,45,1,2]],
      textos: ["Um sofá simples, ideal para descansar depois de um dia longo.","Um baú guarda objetos pessoais.","Um banquinho fica ao lado da mesa.","Uma planta pequena cresce junto à janela."] }
  ];

  function pedirHospedagemNoturna(c) {
    const dono = c.nome.replace(/^Casa da /, "").replace(/^Casa do /, "");
    if (typeof cicloEhNoite !== "function" || !cicloEhNoite()) {
      mostrarMensagem(dono + " não está recebendo visitas para dormir agora. Volte à noite.");
      return;
    }
    if (typeof noiteAtiva === "function" && noiteAtiva()) {
      mostrarMensagem("A história está acontecendo nesta noite. Melhor não interromper esse momento.");
      return;
    }
    const dia = typeof diaAtual === "function" ? diaAtual() : 0;
    const dados = diario.escolhas.hospedagensNoturnas || (diario.escolhas.hospedagensNoturnas = {});
    const chave = String(dia) + "_" + c.id;
    if (dados[chave]) {
      mostrarMensagem(dono + " já respondeu ao seu pedido nesta noite.");
      return;
    }
    if (!window.confirm("Dellalos bate à porta da casa de " + dono + ".\n\n“Desculpa incomodar tão tarde… eu poderia dormir aqui esta noite?”\n\nOK = pedir para ficar  |  Cancelar = ir embora")) return;
    dados[chave] = true;
    const nivel = typeof amizadeNivel === "function" ? amizadeNivel(dono) : 1;
    // O acolhimento depende do vínculo: evita que qualquer NPC aceite uma visita íntima logo no primeiro encontro.
    if (nivel >= 2) {
      dados["aceita_" + chave] = true;
      if (typeof amizadeGanhar === "function") amizadeGanhar(dono, 3, "dormir_casa_npc_" + chave, true);
      mostrarMensagem(dono + " abre a porta, sorri e dá espaço para você entrar.\n\n“Pode ficar, Dellalos. Já está tarde; você pode descansar aqui esta noite.” (+3 amizade)");
      if (typeof diario.registrar === "function") diario.registrar("" + dono + " acolheu Dellalos em sua casa durante a noite.");
      // A transição acontece após a mensagem; o interior já existe no sistema de casas.
      setTimeout(function () {
        if (typeof mudarCena === "function") mudarCena(c.id, 8 * TILE + TILE / 2, 11 * TILE - 28, "cima");
      }, 250);
    } else {
      dados["recusa_" + chave] = true;
      mostrarMensagem(dono + " parece surpreso e pede desculpas.\n\n“Desculpa, Dellalos… ainda não temos tanta intimidade para isso. Espero que você encontre um lugar seguro.”");
      if (typeof diario.registrar === "function") diario.registrar("Dellalos pediu para dormir na casa de " + dono + ", mas ele ainda não tinha intimidade suficiente para aceitar.");
    }
  }

  function adicionarFachada(c) {
    const cena = CENAS[c.mapa];
    if (!cena || !cena.mapa || cena._casasV57 && cena._casasV57[c.id]) return;
    const m = cena.mapa;
    // As casas ficam na área ampliada do mapa, sem cobrir edifícios da região original.
    predio(m, c.x, c.y, 8, 3, c.estilo);
    janela(m, c.x + 1, c.y + 3, JANELA2);
    janela(m, c.x + 6, c.y + 3, JANELA);
    const py = c.y + 4;
    porta(m, c.portaX, py, PORTA_LARANJA, false);
    pintar(m, "chao", c.portaX, py + 1, 1, 7, CALCADA);
    pintar(m, "chao", Math.min(c.portaX, c.x - 1), 19, 11, 2, CALCADA);
    cena.saidas = cena.saidas || [];
    cena.saidas.push({ area: celula(c.portaX, py), para: c.id, x: 8 * TILE + TILE / 2, y: 11 * TILE - 28, dir: "cima" });
    // Visita noturna: Dellalos pode bater à porta e pedir para passar a noite.
    // A interação fica na porta, sem bloquear a entrada normal na residência.
    cena.interativos = cena.interativos || [];
    cena.interativos.push({
      nome: "bater_porta_" + c.id,
      area: celula(c.portaX, py, 1, 1),
      conversar: function () { pedirHospedagemNoturna(c); }
    });
    cena._casasV57 = cena._casasV57 || {};
    cena._casasV57[c.id] = true;
  }

  function criarInterior(c) {
    if (CENAS[c.id]) return;
    const W = 18, H = 12, m = criarMapa(W, H);
    salaInterna(m, c.piso);
    // Janela, tapete e móveis: cada residência recebe uma combinação própria.
    janela(m, 3, 1, JANELA2); janela(m, 13, 1, JANELA);
    // Identidade visual própria: tapetes, painéis e detalhes variam por morador.
    pintar(m, "deco", 6, 5, 5, 2, II(c.tapete, 15));
    pintar(m, "deco", 2, 2, 2, 1, II(c.parede, 14));
    pintar(m, "deco", 14, 2, 2, 1, II(c.parede, 14));
    if (c.tema === "biblioteca") { moveisII(m, 2, 7, 10, 68, 2, 3, true); moveisII(m, 13, 7, 10, 68, 2, 3, true); }
    if (c.tema === "floral") { pintar(m, "deco", 5, 2, 1, 2, II(8, 20)); pintar(m, "deco", 12, 2, 1, 2, II(8, 20)); }
    if (c.tema === "lilas") { pintar(m, "deco", 7, 2, 4, 1, II(12, 56)); pintar(m, "deco", 7, 8, 4, 1, II(12, 57)); }
    if (c.tema === "azul-tecnologia") { moveisII(m, 12, 7, 3, 8, 2, 2, true); pintar(m, "deco", 6, 2, 5, 1, II(13, 48)); }
    if (c.tema === "jardim-rosa") { moveisII(m, 2, 7, 10, 44, 2, 3, true); moveisII(m, 14, 7, 10, 44, 2, 3, true); }
    if (c.tema === "dourado-criativo") { pintar(m, "deco", 5, 2, 2, 2, II(6, 13)); pintar(m, "deco", 11, 2, 2, 2, II(6, 13)); }
    for (const it of c.itens) moveisII(m, it[0], it[1], it[2], it[3], it[4], it[5], true);
    const dx = 8, dy = 11;
    portaInterna(m, dx, dy, PORTA_LARANJA);
    // Escada no canto direito: pisar nela leva ao quarto do segundo andar.
    // O piso contrastante funciona como sinal visual sem depender de sprites externos.
    pintar(m, "deco", 14, 7, 2, 3, II(11, 13));
    CENAS[c.id] = {
      mapa: m,
      corFora: c.cor,
      spawn: { x: dx * TILE + TILE / 2, y: dy * TILE - 28 },
      interativos: c.textos.map((texto, i) => ({
        nome: c.id + "_objeto_" + i,
        area: celula(c.itens[i][0], c.itens[i][1], Math.max(1, c.itens[i][4]), Math.max(1, c.itens[i][5])),
        texto
      })).concat([{ nome: c.id + "_escada", area: celula(14, 7, 2, 3), texto: "A escada leva ao quarto no andar de cima." }]),
      placas: [{ texto: c.nome.toUpperCase() + " — TÉRREO", x: 9 * TILE, y: 3 * TILE + 8, w: 260, h: 36, fonte: 18 }],
      saidas: [
        { area: celula(dx, dy), para: c.mapa,
          x: c.portaX * TILE + TILE / 2, y: (c.y + 6) * TILE + 44, dir: "baixo" },
        { area: celula(14, 7, 2, 3), para: c.id + "_andar2", x: 8 * TILE + TILE / 2, y: 9 * TILE, dir: "cima" }
      ]
    };
    criarSegundoAndar(c);
  }


  function criarSegundoAndar(c) {
    const id = c.id + "_andar2";
    if (CENAS[id]) return;
    const W = 18, H = 12, m = criarMapa(W, H);
    salaInterna(m, c.piso);
    // O andar superior é um quarto próprio, com decoração derivada da identidade de cada casa.
    janela(m, 3, 1, JANELA2); janela(m, 13, 1, JANELA);
    // Mobiliário-base e detalhes temáticos exclusivos do quarto.
    moveisII(m, 3, 4, 5, 1, 4, 2, true);       // cama
    moveisII(m, 11, 4, 7, 48, 2, 3, true);     // guarda-roupa
    moveisII(m, 3, 8, 5, 10, 4, 3, true);      // escrivaninha/mesa
    moveisII(m, 12, 8, 12, 56, 1, 3, true);    // abajur
    moveisII(m, 8, 5, 0, 20, 2, 2, false);    // quadro
    pintar(m, "deco", 7, 7, 4, 1, II(c.tapete, 15));
    pintar(m, "deco", 2, 2, 3, 1, II(c.parede, 14));
    pintar(m, "deco", 12, 2, 3, 1, II(c.parede, 14));
    if (c.tema === "biblioteca") { moveisII(m, 13, 7, 10, 68, 2, 3, true); }
    if (c.tema === "floral") { moveisII(m, 13, 7, 10, 44, 2, 3, true); pintar(m, "deco", 6, 2, 1, 2, II(8, 20)); }
    if (c.tema === "lilas") { pintar(m, "deco", 7, 2, 4, 1, II(12, 56)); }
    if (c.tema === "azul-tecnologia") { moveisII(m, 13, 7, 3, 8, 2, 2, true); pintar(m, "deco", 7, 2, 3, 1, II(13, 48)); }
    if (c.tema === "jardim-rosa") { moveisII(m, 13, 7, 10, 44, 2, 3, true); pintar(m, "deco", 6, 2, 1, 2, II(11, 17)); }
    if (c.tema === "dourado-criativo") { pintar(m, "deco", 7, 2, 3, 1, II(6, 13)); moveisII(m, 13, 7, 6, 13, 1, 2, true); }
    const dx = 8, dy = 11;
    portaInterna(m, dx, dy, PORTA_LARANJA);
    CENAS[id] = {
      mapa: m,
      corFora: c.cor,
      spawn: { x: 8 * TILE + TILE / 2, y: 9 * TILE },
      interativos: [
        { nome: id + "_cama", area: celula(3, 4, 4, 2), texto: "A cama de " + c.nome.replace("Casa da ", "").replace("Casa do ", "") + " fica no andar de cima." },
        { nome: id + "_armario", area: celula(11, 4, 2, 3), texto: "O guarda-roupa guarda roupas e objetos pessoais." },
        { nome: id + "_mesa", area: celula(3, 8, 4, 3), texto: "Há objetos pessoais organizados sobre a mesa." }
      ],
      placas: [{ texto: c.nome.toUpperCase() + " — QUARTO", x: 9 * TILE, y: 3 * TILE + 8, w: 260, h: 36, fonte: 18 }],
      saidas: [{ area: celula(dx, dy), para: c.id, x: 14 * TILE + TILE, y: 8 * TILE, dir: "baixo" }]
    };
  }

  for (const c of casas) { adicionarFachada(c); criarInterior(c); }
  console.info("Shadow of War v57: seis casas de dois andares com paletas, tapetes e decoração exclusiva carregadas.");
})();
