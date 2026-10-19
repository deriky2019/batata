/* =====================================================
   salas/mansao.js - Por dentro da mansão abandonada da Zona Oeste ("a Casa dos Cinco")
   Chega-se aqui pela porta da mansão (js/salas/zonaoeste.js), depois de:
     1) achar a chave da mansão na fábrica e abrir a corrente (historia.mansaoAberta)
     2) comprar a lanterna na loja (historia.comprouLanterna, a partir do DIA_LANTERNA)
   Lá dentro é tudo escuro: a cena tem  escuro: true  e desenharEscuridaoMansao() (no fim deste arquivo)
   só deixa ver o que está perto da lanterna.

   OS 7 CÔMODOS (cada um é uma cena com id "mansao_..."):
     hall ........ entrada (porta de baixo -> jardim). Portas de cima: biblioteca (x 3), escada (x 10), jantar (x 16)
     biblioteca .. registro dos Cinco, diário do Perroti e o bilhete do zelador. O tapete esconde o alçapão do porão
     jantar ...... ata da última reunião e a carta do Magnus
     andar ....... corredor de cima (escada em x 11). Portas de cima: escritório (x 5) e quarto do zelador (x 17)
     escritorio .. planta do selo, lista de inscritos do torneio e cópia da ordem nº 5 da fábrica
     quarto ...... quarto do zelador: a carta dele
     porao ....... o pacto, com os símbolos da seita (olho, lua e espiral). Sobe pela escada de volta à biblioteca

   OS PAPÉIS (PAPEIS_MANSAO): cada um é um item de documento (categoria "documento") que NUNCA ocupa espaço
   no inventário: é lido na hora (lerPapel) e vai para DOCUMENTOS no diário (registrarDocumento).
   Ao ler todos, a Dellalos junta as peças (historia.mansaoCompleta). TEXTOS PROVISÓRIOS: ajuste com a história original.

   COMO MEXER NO FUTURO
     - Papel novo: acrescente em PAPEIS_MANSAO (texto, info opcional) e um interativo com  conversar: () => lerPapel("id").
     - Cômodo novo: chame  comodo({...})  e ligue com  portasCima / portaBaixo  (veja os existentes).
   ===================================================== */

// Qual porta do jardim leva para cá (mesma de zonaoeste.js)
PORTAS.mansao = { x: 15, y: 8 };

(function () {
  // ---------- Blocos do pacote Modern Interiors (iguais aos de casassul.js): [coluna, linha, largura, altura] ----------
  const MOVEIS = {
    estante: [10, 68, 2, 3], estante2: [12, 68, 2, 3], estante3: [14, 68, 2, 3],
    estanteB: [10, 71, 2, 3], estanteB2: [12, 71, 2, 3], estanteB3: [14, 71, 2, 3],
    lareira: [4, 68, 2, 3],
    sofaCinza: [4, 72, 3, 2], sofaMarrom: [7, 72, 3, 2],
    camaBranca: [5, 3, 4, 2],
    mesaGrande: [0, 10, 4, 3], mesaClara: [5, 10, 4, 3],
    plantaGrande: [10, 44, 2, 3], palmeira: [13, 44, 2, 2],
    armario: [7, 48, 2, 3], armarioVidro: [11, 48, 2, 3], guardaRoupa: [9, 49, 2, 2],
    abajurChao: [12, 56, 1, 3],
    balcao: [3, 59, 2, 2], balcao2: [5, 59, 2, 2],
    cadeira: [6, 21, 1, 2], cadeira2: [7, 21, 1, 2],
    baua: [8, 58, 2, 2], gaveteiro: [5, 59, 2, 2],
    quadro1: [0, 20, 2, 2], quadro2: [8, 20, 2, 2], quadro3: [10, 21, 2, 2], quadro4: [0, 22, 2, 2], quadro5: [8, 22, 2, 2],
    janela: [9, 24, 2, 2]
  };
  const TAPETES = { vermelho: [7, 15, 4, 3], vermelhoV: [13, 16, 3, 4], verdePeq: [10, 28, 2, 2], azulPeq: [11, 15, 2, 2] };
  const PAREDES = { creme: 7, madeiraEscura: 13, madeiraVermelha: 15, cinza: 17, bege: 19 };
  const PISOS = { creme: [11, 7], cinza: [11, 11], espinha: [11, 13], tijolo: [11, 5] };

  // Tamanho de cada cômodo (em tiles). A porta de baixo fica na última linha; as de cima na linha 2.
  const SALAS = {
    mansao_hall:       { W: 20, H: 13 },
    mansao_biblioteca: { W: 16, H: 11 },
    mansao_jantar:     { W: 18, H: 11 },
    mansao_andar:      { W: 22, H: 11 },
    mansao_escritorio: { W: 14, H: 10 },
    mansao_quarto:     { W: 12, H: 9 },
    mansao_porao:      { W: 18, H: 12 },
    mansao_tunel:      { W: 28, H: 8 },
    mansao_selo:       { W: 20, H: 12 }
  };
  // Onde a Dellalos aparece ao passar por uma porta:
  const aoSubirPorta = (x) => nasceDentroAbaixo({ x, y: 2 });                       // saiu pela porta de CIMA de outra sala: 1 tile abaixo da porta
  const aoDescerPorta = (id, x) => nasceDentroAcima({ x, y: SALAS[id].H - 1 });     // saiu pela porta de BAIXO: 1 tile acima da porta

  // comodo({ id, parede, piso, montar(m, f), portaBaixo:{ x, para, sx, sy, dir }, portasCima:[{ x, para, sx, sy, dir, se? }], interativos, aoEntrar })
  function comodo(c) {
    const W = SALAS[c.id].W, H = SALAS[c.id].H;
    const m = criarMapa(W, H);
    bloquear(m, 0, 0, W, H);
    bloquear(m, 1, 3, W - 2, H - 4, 0);
    pintar(m, "chao", 0, H - 1, W, 1, PAREDE_TOPO);                  // parede de baixo (escura), onde fica a porta de volta
    pisoRB(m, 1, 3, W - 2, H - 4, PISOS[c.piso][0], PISOS[c.piso][1]);
    paredeRB(m, 1, 1, W - 2, PAREDES[c.parede]);
    const f = {
      moveis: (x, y, nome, bloqueia = true) => { const b = MOVEIS[nome]; if (!b) throw new Error("móvel? " + nome); moveisII(m, x, y, b[0], b[1], b[2], b[3], bloqueia); },
      tapete: (x, y, nome) => {
        const b = TAPETES[nome];
        for (let j = 0; j < b[3]; j++) for (let i = 0; i < b[2]; i++) por(m, "deco", x + i, y + j, II(b[0] + i, b[1] + j));
      }
    };
    c.montar(m, f);
    const saidas = [];
    // Portas de cima (porta de madeira do pacote), por cima do que ficou na parede
    for (const p of c.portasCima || []) {
      por(m, "obj", p.x, 1, II(7, 8)); por(m, "obj", p.x, 2, II(7, 9));
      bloquear(m, p.x, 1, 1, 1, 1); bloquear(m, p.x, 2, 1, 1, 0);
      saidas.push({ area: celula(p.x, 2), para: p.para, x: p.sx, y: p.sy, dir: p.dir || "cima", se: p.se });
    }
    // Porta de baixo (volta)
    if (c.portaBaixo) {
      const p = c.portaBaixo;
      portaInterna(m, p.x, H - 1);
      saidas.push({ area: celula(p.x, H - 1), para: p.para, x: p.sx, y: p.sy, dir: p.dir || "baixo" });
    }
    CENAS[c.id] = {
      mapa: m,
      corFora: "#07060c",
      escuro: true,
      interativos: c.interativos || [],
      saidas: saidas,
      aoEntrar: c.aoEntrar
    };
    return CENAS[c.id];
  }

  const txt = (nome, x, y, w, h, texto) => ({ nome, area: celula(x, y, w, h), texto });
  const papel = (nome, x, y, w, h, id) => ({ nome, area: celula(x, y, w, h), conversar: function () { lerPapel(id); } });

  // Quem sai pelo jardim: logo abaixo da porta da mansão, olhando para baixo
  const jardim = nasceFora(PORTAS.mansao);

  // ---------- 1) HALL ----------
  comodo({
    id: "mansao_hall", parede: "madeiraEscura", piso: "tijolo",
    portaBaixo: { x: 10, para: "zona_oeste", sx: jardim.x, sy: jardim.y, dir: "baixo" },
    portasCima: [
      { x: 3,  para: "mansao_biblioteca", sx: aoDescerPorta("mansao_biblioteca", 8).x, sy: aoDescerPorta("mansao_biblioteca", 8).y },
      { x: 10, para: "mansao_andar",      sx: aoDescerPorta("mansao_andar", 11).x,      sy: aoDescerPorta("mansao_andar", 11).y },
      { x: 16, para: "mansao_jantar",     sx: aoDescerPorta("mansao_jantar", 9).x,      sy: aoDescerPorta("mansao_jantar", 9).y }
    ],
    montar: (m, f) => {
      f.moveis(6, 1, "quadro2", false);
      f.moveis(13, 2, "lareira");
      f.moveis(1, 7, "plantaGrande");
      f.moveis(17, 7, "palmeira");
      f.moveis(6, 7, "sofaCinza");
      f.moveis(12, 8, "sofaMarrom");
      f.tapete(9, 4, "vermelhoV");
      f.moveis(1, 3, "abajurChao");
    },
    interativos: [
      txt("retrato_hall", 6, 1, 2, 2, "Um retrato desbotado de cinco pessoas diante da casa. O rosto de uma delas foi riscado com força."),
      txt("lareira_hall", 13, 2, 2, 3, "A lareira está fria. Entre as cinzas, só restos de papel queimado."),
      txt("sofa_hall", 6, 7, 3, 2, "Um sofá comido pelo tempo. Ninguém se senta aqui há anos."),
      txt("sofa_hall2", 12, 8, 3, 2, "Outro sofá, coberto por um lençol cheio de poeira."),
      txt("planta_hall", 1, 7, 2, 3, "A planta secou há muito tempo."),
      txt("palmeira_hall", 17, 7, 2, 2, "Uma palmeira de vaso, seca e quebradiça.")
    ],
    aoEntrar: function () {
      if (diario.escolhas.mansaoEntrou) return;
      diario.escolhas.mansaoEntrou = true;
      abrirDialogo(DIALOGOS.mansao.entrada);
    }
  });

  // ---------- 2) BIBLIOTECA (alçapão do porão embaixo do tapete) ----------
  const ALCAPAO = { x: 7, y: 6 };
  const bib = comodo({
    id: "mansao_biblioteca", parede: "madeiraVermelha", piso: "espinha",
    portaBaixo: { x: 8, para: "mansao_hall", sx: aoSubirPorta(3).x, sy: aoSubirPorta(3).y, dir: "baixo" },
    portasCima: [],
    montar: (m, f) => {
      f.moveis(1, 2, "estante");  f.moveis(3, 2, "estante2"); f.moveis(5, 2, "estante3");
      f.moveis(9, 2, "estanteB"); f.moveis(11, 2, "estanteB2"); f.moveis(13, 2, "estanteB3");
      f.moveis(7, 1, "janela", false);
      f.tapete(6, 5, "vermelho");
      f.moveis(11, 6, "mesaClara");
      f.moveis(1, 7, "baua");
    },
    interativos: [
      papel("diario_perroti", 3, 2, 2, 3, "mansao_perroti"),
      txt("estantes_bib1", 1, 2, 2, 3, "Livros apodrecidos pela umidade. Nenhum título se lê mais."),
      txt("estantes_bib2", 5, 2, 2, 3, "Livros sobre a história da cidade. Faltam páginas, arrancadas à força."),
      txt("estantes_bib3", 9, 2, 6, 3, "Estantes cheias de pastas. Quase tudo virou pó."),
      papel("mesa_registro", 11, 6, 4, 3, "mansao_registro"),
      papel("baua_bilhete", 1, 7, 2, 2, "mansao_bilhete"),
      { nome: "tapete_alcapao", area: celula(6, 5, 4, 3), conversar: function () {
          if (historia.mansaoPoraoAberto) { mostrarMensagem("O alçapão está aberto. A escada desce para o escuro."); return; }
          if (!diario.docs.mansao_bilhete) { mostrarMensagem("Um tapete velho, pesado de poeira."); return; }
          if (!missaoDoDiaLiberada("tunel")) { mostrarMensagem("Já vi coisa demais por hoje. O porão fica para amanhã, com a cabeça descansada."); return; }   // js/calendario.js (dia 14)
          historia.mansaoPoraoAberto = true;
          atualizarAlcapao();
          descobrirInfo("mansao_alcapao");
          mostrarMensagem("Embaixo do tapete há um alçapão, como o bilhete dizia. A escada desce para o porão.");
        } }
    ],
    aoEntrar: function () { atualizarAlcapao(); }
  });
  // O alçapão fica aberto (um quadrado escuro no chão) e a saída para o porão só funciona depois de aberto
  function atualizarAlcapao() {
    por(bib.mapa, "obj", ALCAPAO.x, ALCAPAO.y, historia.mansaoPoraoAberto ? PAREDE_TOPO : -1);
  }
  bib.saidas.push({ area: celula(ALCAPAO.x, ALCAPAO.y), para: "mansao_porao", x: aoSubirPorta(8).x, y: aoSubirPorta(8).y, dir: "baixo",
                    se: function () { return !!historia.mansaoPoraoAberto; } });

  // ---------- 3) SALA DE JANTAR ----------
  comodo({
    id: "mansao_jantar", parede: "creme", piso: "creme",
    portaBaixo: { x: 9, para: "mansao_hall", sx: aoSubirPorta(16).x, sy: aoSubirPorta(16).y, dir: "baixo" },
    portasCima: [],
    montar: (m, f) => {
      f.moveis(1, 2, "balcao"); f.moveis(3, 2, "balcao2"); f.moveis(5, 2, "balcao");
      f.moveis(8, 2, "lareira");
      f.moveis(13, 2, "armarioVidro"); f.moveis(15, 2, "armario");
      f.moveis(3, 1, "janela", false); f.moveis(12, 1, "janela", false);
      f.moveis(6, 5, "mesaGrande"); f.moveis(11, 5, "mesaClara");
      f.moveis(5, 5, "cadeira"); f.moveis(10, 5, "cadeira2");
      f.moveis(15, 7, "baua");
    },
    interativos: [
      papel("mesa_ata", 6, 5, 4, 3, "mansao_ata"),
      txt("mesa_jantar2", 11, 5, 4, 3, "Pratos e taças cobertos de poeira, postos para cinco pessoas. Uma das cadeiras está caída."),
      txt("balcao_jantar", 1, 2, 6, 2, "A cozinha parou no tempo: panelas enferrujadas e um relógio parado."),
      txt("lareira_jantar", 8, 2, 2, 3, "Uma lareira grande, preta de fuligem."),
      txt("armarios_jantar", 13, 2, 4, 3, "Louças quebradas e uma garrafa de vinho que nunca foi aberta."),
      papel("baua_magnus", 15, 7, 2, 2, "mansao_carta_magnus")
    ]
  });

  // ---------- 4) ANDAR DE CIMA (corredor) ----------
  comodo({
    id: "mansao_andar", parede: "bege", piso: "creme",
    portaBaixo: { x: 11, para: "mansao_hall", sx: aoSubirPorta(10).x, sy: aoSubirPorta(10).y, dir: "baixo" },
    portasCima: [
      { x: 5,  para: "mansao_escritorio", sx: aoDescerPorta("mansao_escritorio", 7).x, sy: aoDescerPorta("mansao_escritorio", 7).y },
      { x: 17, para: "mansao_quarto",     sx: aoDescerPorta("mansao_quarto", 6).x,     sy: aoDescerPorta("mansao_quarto", 6).y }
    ],
    montar: (m, f) => {
      f.moveis(8, 1, "quadro1", false); f.moveis(11, 1, "quadro4", false); f.moveis(14, 1, "quadro3", false);
      f.tapete(9, 5, "vermelho");
      f.moveis(1, 5, "plantaGrande"); f.moveis(19, 5, "plantaGrande");
      f.moveis(1, 3, "abajurChao"); f.moveis(20, 3, "abajurChao");
    },
    interativos: [
      txt("quadros_andar", 8, 1, 8, 2, "Quadros de família. Em todos, um rosto foi raspado."),
      txt("planta_andar1", 1, 5, 2, 3, "Um vaso grande com uma planta murcha."),
      txt("planta_andar2", 19, 5, 2, 3, "Outro vaso, com a terra rachada."),
      txt("escada_andar", 10, 8, 3, 2, "A escada de volta ao hall. O corrimão ainda está firme.")
    ]
  });

  // ---------- 5) ESCRITÓRIO ----------
  comodo({
    id: "mansao_escritorio", parede: "madeiraEscura", piso: "espinha",
    portaBaixo: { x: 7, para: "mansao_andar", sx: aoSubirPorta(5).x, sy: aoSubirPorta(5).y, dir: "baixo" },
    portasCima: [],
    montar: (m, f) => {
      f.moveis(1, 2, "estante"); f.moveis(3, 2, "estante2");
      f.moveis(9, 2, "estanteB"); f.moveis(11, 2, "estanteB2");
      f.moveis(6, 1, "janela", false);
      f.moveis(5, 4, "mesaGrande");
      f.moveis(4, 7, "cadeira");
      f.moveis(11, 6, "gaveteiro");
    },
    interativos: [
      papel("mesa_planta", 5, 4, 2, 3, "mansao_planta"),
      papel("mesa_lista", 7, 4, 2, 3, "mansao_lista"),
      papel("gaveteiro_ordem", 11, 6, 2, 2, "mansao_ordem"),
      txt("estantes_esc1", 1, 2, 4, 3, "Livros de contabilidade e mapas enrolados. Quase tudo está úmido."),
      txt("estantes_esc2", 9, 2, 4, 3, "Pastas vazias. Alguém levou os papéis importantes.")
    ]
  });

  // ---------- 6) QUARTO DO ZELADOR ----------
  comodo({
    id: "mansao_quarto", parede: "cinza", piso: "cinza",
    portaBaixo: { x: 6, para: "mansao_andar", sx: aoSubirPorta(17).x, sy: aoSubirPorta(17).y, dir: "baixo" },
    portasCima: [],
    montar: (m, f) => {
      f.moveis(1, 3, "camaBranca");
      f.moveis(8, 2, "armario");
      f.moveis(5, 1, "janela", false);
      f.tapete(4, 5, "verdePeq");
      f.moveis(1, 6, "gaveteiro");
    },
    interativos: [
      papel("gaveteiro_zelador", 1, 6, 2, 2, "mansao_carta_zelador"),
      txt("cama_zelador", 1, 3, 4, 2, "Uma cama simples, bem arrumada. Parece que alguém saiu com pressa e não voltou."),
      txt("armario_zelador", 8, 2, 2, 3, "O armário está vazio, só cabides. Ele levou tudo.")
    ]
  });

  // ---------- 7) PORÃO ----------
  const porao = comodo({
    id: "mansao_porao", parede: "cinza", piso: "cinza",
    portaBaixo: null,
    portasCima: [
      { x: 8, para: "mansao_biblioteca", sx: ALCAPAO.x * TILE + TILE / 2, sy: (ALCAPAO.y + 1) * TILE + 44, dir: "baixo" }
    ],
    montar: (m, f) => {
      f.moveis(2, 1, "quadro5", false); f.moveis(5, 1, "quadro2", false); f.moveis(14, 1, "quadro3", false);
      f.moveis(7, 5, "mesaClara");
      f.moveis(1, 3, "abajurChao"); f.moveis(16, 3, "abajurChao");
      f.moveis(15, 7, "baua");
      f.moveis(3, 8, "baua");
      f.tapete(7, 8, "azulPeq");
    },
    interativos: [
      papel("altar_pacto", 7, 5, 4, 3, "mansao_pacto"),
      { nome: "porta_tunel", area: celula(11, 1, 1, 2), conversar: function () { pedirSenhaTunel(); } },
      txt("simbolo_olho", 2, 1, 2, 2, "Um olho dentro de um círculo, pintado na pedra. Embaixo, riscado: ELE VÊ QUEM O SERVE."),
      txt("simbolo_lua", 5, 1, 2, 2, "Uma lua minguante gravada na parede. Embaixo: A HORA DA ENTREGA."),
      txt("simbolo_espiral", 14, 1, 2, 2, "Uma espiral que desce até o centro. Embaixo: O QUE CAI NÃO SOBE."),
      txt("bau_porao1", 15, 7, 2, 2, "Um baú de ferro lacrado com a marca da espiral. Não abre."),
      txt("bau_porao2", 3, 8, 2, 2, "Um baú arrombado, vazio. Há marcas de dedos na ferrugem."),
      txt("escada_porao", 8, 2, 1, 1, "A escada que sobe para a biblioteca.")
    ],
    aoEntrar: function () {
      atualizarPortaTunel();
      if (diario.escolhas.mansaoPorao) return;
      diario.escolhas.mansaoPorao = true;
      abrirDialogo(DIALOGOS.mansao.porao);
    }
  });

  // Porta de aço do túnel (parede de cima do porão, x 11): fechada até acertar a senha (historia.mansaoTunelAberto)
  const PORTA_ACO_FECHADA = K(15, 12), PORTA_ACO_ABERTA = K(15, 13);
  function atualizarPortaTunel() {
    const aberta = !!historia.mansaoTunelAberto;
    por(porao.mapa, "obj", 11, 1, aberta ? PORTA_ACO_ABERTA : PORTA_ACO_FECHADA);
    por(porao.mapa, "obj", 11, 2, aberta ? PORTA_ACO_ABERTA : PORTA_ACO_FECHADA);
    bloquear(porao.mapa, 11, 1, 1, 1, 1);
    bloquear(porao.mapa, 11, 2, 1, 1, aberta ? 0 : 1);
  }
  atualizarPortaTunel();
  porao.saidas.push({ area: celula(11, 2), para: "mansao_tunel", x: aoDescerPorta("mansao_tunel", 2).x, y: aoDescerPorta("mansao_tunel", 2).y, dir: "cima",
                      se: function () { return !!historia.mansaoTunelAberto; } });
  window.atualizarPortaTunel = atualizarPortaTunel;   // usado por pedirSenhaTunel (fora desta função)

  // ---------- 8) TÚNEL (do porão até a porta do selo, perto da instalação subterrânea) ----------
  const tunel = comodo({
    id: "mansao_tunel", parede: "cinza", piso: "cinza",
    portaBaixo: { x: 2, para: "mansao_porao", sx: aoSubirPorta(11).x, sy: aoSubirPorta(11).y, dir: "baixo" },
    portasCima: [],
    montar: (m, f) => {
      f.moveis(7, 3, "abajurChao"); f.moveis(14, 3, "abajurChao");
      f.moveis(10, 5, "baua");
      f.moveis(19, 4, "mesaClara");
      // Porta do selo (fim do túnel): fechada, sem saída por enquanto
      por(m, "obj", 25, 1, K(15, 12)); por(m, "obj", 25, 2, K(15, 12));
      bloquear(m, 25, 1, 1, 2, 1);
    },
    interativos: [
      papel("mesa_vigilia", 19, 4, 4, 3, "mansao_vigilia"),
      txt("bau_tunel", 10, 5, 2, 2, "Um baú pesado cheio de correntes velhas. Alguém tentou prender algo aqui."),
      txt("abajur_tunel1", 7, 3, 1, 3, "Uma lamparina apagada. O óleo secou."),
      txt("abajur_tunel2", 14, 3, 1, 3, "Outra lamparina. Há marcas de mãos na parede ao lado, como se alguém tivesse se apoiado para não cair."),
      { nome: "porta_selo", area: celula(25, 1, 1, 2), conversar: function () { tentarAbrirSelo(); } }
    ],
    aoEntrar: function () {
      atualizarPortaSelo();      // porta do selo já aberta (save ou volta da sala do selo)
      if (diario.escolhas.mansaoTunel) return;
      diario.escolhas.mansaoTunel = true;
      abrirDialogo(DIALOGOS.mansao.tunel);
    }
  });

  // Porta do selo (fim do túnel, x 25): fechada até abrir com a Nathalia como companheira (historia.seloAberto)
  const PORTA_SELO_FECHADA = K(15, 12), PORTA_SELO_ABERTA = K(15, 13);
  function atualizarPortaSelo() {
    const aberta = !!historia.seloAberto;
    por(tunel.mapa, "obj", 25, 1, aberta ? PORTA_SELO_ABERTA : PORTA_SELO_FECHADA);
    por(tunel.mapa, "obj", 25, 2, aberta ? PORTA_SELO_ABERTA : PORTA_SELO_FECHADA);
    bloquear(tunel.mapa, 25, 1, 1, 1, 1);
    bloquear(tunel.mapa, 25, 2, 1, 1, aberta ? 0 : 1);
  }
  atualizarPortaSelo();
  tunel.saidas.push({ area: celula(25, 2), para: "mansao_selo", x: aoDescerPorta("mansao_selo", 10).x, y: aoDescerPorta("mansao_selo", 10).y, dir: "cima",
                      se: function () { return !!historia.seloAberto; } });
  window.atualizarPortaSelo = atualizarPortaSelo;

  // ---------- 9) SALA DO SELO (depois da porta do selo). Os 3 papéis daqui (selo_*) contam o passado e quebram o selo ----------
  comodo({
    id: "mansao_selo", parede: "cinza", piso: "cinza",
    portaBaixo: { x: 10, para: "mansao_tunel", sx: aoSubirPorta(25).x, sy: aoSubirPorta(25).y, dir: "baixo" },
    portasCima: [],
    montar: (m, f) => {
      f.moveis(2, 3, "abajurChao"); f.moveis(17, 3, "abajurChao");
      f.moveis(3, 4, "mesaClara"); f.moveis(13, 4, "mesaClara");
      f.tapete(8, 6, "vermelho");
    },
    interativos: [
      papel("parede_selo", 8, 1, 4, 2, "selo_inscricao"),
      papel("mesa_selo_diario", 3, 4, 4, 3, "selo_diario"),
      papel("mesa_selo_prontuario", 13, 4, 4, 3, "selo_prontuario"),
      { nome: "circulo_selo", area: celula(8, 6, 4, 3), conversar: function () {
          mostrarMensagem(historia.seloQuebrado ? "O círculo está rachado e o ar cheira a enxofre. Já não há nada aqui dentro." : "Um círculo feito de sangue seco, bem no centro. Preciso ler os papéis desta sala.");
        } }
    ],
    aoEntrar: function () {
      if (diario.escolhas.seloEntrou) return;
      diario.escolhas.seloEntrou = true;
      descobrirInfo("selo_aberto");
      abrirDialogo(DIALOGOS.mansao.seloEntrada);
    }
  });
})();

// =====================================================
// Os papéis da mansão (documentos que contam o passado e a seita). TEXTOS PROVISÓRIOS.
// Cada um tem  info  (uma linha curta para o diário, opcional) e entra em DOCUMENTOS ao ser lido.
// =====================================================
const PAPEIS_MANSAO = {
  mansao_registro: {
    nome: "Livro de registro da Casa dos Cinco",
    info: "mansao_cinco",
    texto: [
      "Casa dos Cinco. Aqui se reuniram, depois da noite em que os espíritos foram expulsos da cidade:",
      "Julio Master. Perroti Dellalos. Magnus Fracis. Luiz Inácio. Renan Santos.",
      "As iniciais dos cinco ficaram gravadas na capela da colina: J, P, M, L, R.",
      "Juramento: guardar para sempre o que foi trancado, e nunca usá-lo."
    ]
  },
  mansao_perroti: {
    nome: "Folha solta do diário de Perroti",
    info: "mansao_perroti",
    texto: [
      "Magnus não é mais o mesmo. Passa as noites no porão, olhando o selo como quem olha por uma janela.",
      "Ele diz que o poder que trancamos podia proteger a cidade. Eu respondo que um poder assim cobra um preço.",
      "Escrevo isto para quem herdar o meu sangue: o selo só obedece a nós cinco e aos nossos descendentes.",
      "Se um dia ele se abrir, não deixem o Caos escolher um corpo."
    ]
  },
  mansao_bilhete: {
    nome: "Bilhete do zelador",
    texto: [
      "Para quem encontrar a casa depois de mim.",
      "Embaixo do tapete da biblioteca há um alçapão. Ele leva ao porão, onde ficou o que os Cinco guardaram.",
      "Fechei tudo e levei a chave comigo. Não confio em quem pergunta pelo porão."
    ]
  },
  mansao_ata: {
    nome: "Ata da última reunião",
    texto: [
      "Pauta: o que fazer com a essência dos espíritos que ficou presa embaixo da casa.",
      "Magnus pediu para mantê-la desperta, para a cidade ter uma defesa. Votaram contra: Julio, Perroti, Luiz e Renan.",
      "Decidido: selar tudo sob a casa, com o sangue dos cinco. Magnus saiu antes do fim e bateu a porta."
    ]
  },
  mansao_carta_magnus: {
    nome: "Carta de Magnus, nunca enviada",
    info: "mansao_magnus",
    texto: [
      "Eles têm medo do que não entendem. Eu entendo. O Caos só precisa de um lugar para morar.",
      "Um dia terei quem me escute. Jovens, fortes, cheios de energia. Dez sacrifícios o saciam; uma noite o traz de volta.",
      "Quando eu me for, os que me seguirem escolherão um sucessor para terminar o que eu comecei."
    ]
  },
  mansao_planta: {
    nome: "Planta do subsolo",
    info: "mansao_selo",
    texto: [
      "O porão da casa liga, por um túnel, à instalação de concreto da avenida oeste.",
      "A porta de aço lacrada é a entrada de serviço do selo. Do outro lado, o Caos dorme.",
      "Anotação a lápis, em letra nova: 'Selo enfraquecendo. A noite do torneio basta.'"
    ]
  },
  mansao_lista: {
    nome: "Lista de inscritos do torneio",
    info: "mansao_lista",
    texto: [
      "Marcar com a espiral quem tiver o corpo mais forte.",
      "Simon: fraco. Vitinho: fraco. Veras: instável. Gaby: serve para outra coisa.",
      "Lucas: forte, calado, treina todo dia. ESPIRAL. O hospedeiro será ele.",
      "Observação: a Isabela fica perto dos alunos. A Thaina vai atrás da Isabela."
    ]
  },
  mansao_ordem: {
    nome: "Cópia da ordem de produção nº 5",
    info: "mansao_durval",
    texto: [
      "Cópia da ordem nº 5. Quem pagou: D. Entrega: dia 5. Item: proteção para o evento da escola.",
      "O dinheiro vem das 'taxas' dos alunos. Nada de registro.",
      "O zelador fugiu levando a chave do porão. Procurem."
    ]
  },
  mansao_carta_zelador: {
    nome: "Carta do zelador",
    info: "mansao_zelador",
    texto: [
      "Servi o senhor Magnus quando era moço. Nunca perguntei o que ele guardava no porão.",
      "Aos poucos entendi: o porão guarda um selo, e o selo guarda a cidade inteira.",
      "Nos últimos anos os seguidores dele voltaram e passaram a exigir a chave da casa.",
      "Guardei a chave na fábrica, numa gaveta, entre os papéis da produção. Eles nunca abrem gavetas.",
      "Um túnel sai do porão e vai até a porta do selo. A porta de aço do túnel só abre com a senha.",
      "Escondi a senha do jeito que me ensinaram: no começo de cada linha desta carta."
    ]
  },
  mansao_vigilia: {
    nome: "Diário de vigília do selo",
    info: "mansao_vigilia",
    foraDaContagem: true,
    texto: [
      "Noite 1.412. O selo respira. Hoje a pedra da porta ficou quente.",
      "Noite 1.413. Alguém pediu para entrar, do outro lado do aço, com a voz do Magnus.",
      "Noite 1.414. Não abri. A porta do selo só abre com sangue de um dos Cinco.",
      "Quem abrir com outro sangue solta o que dorme. Escrevo isto para quem vier depois."
    ]
  },
  // ----- Sala do selo (js/salas/mansao.js, quebrarSelo). Fora da contagem: não mexem em mansaoCompleta. TEXTOS PROVISÓRIOS. -----
  selo_inscricao: {
    nome: "Inscrição na parede do selo",
    foraDaContagem: true,
    texto: [
      "Aqui os Cinco trancaram o Caos com o próprio sangue.",
      "Que ninguém o liberte, nem pela fé, nem pela dor.",
      "Se este selo um dia se romper, não será o Caos quem venceu: será alguém que abriu a porta."
    ]
  },
  selo_diario: {
    nome: "Último diário dos Cinco",
    info: "selo_seita",
    foraDaContagem: true,
    texto: [
      "A seita diz que o Caos será o salvador do mundo. Eles acreditam nisso de verdade, e por isso não vão parar.",
      "Lutamos contra eles todos os dias, até onde as nossas forças permitiram.",
      "Já estou velho. Quando eu partir, o selo vai depender dos nossos descendentes.",
      "Se a seita descobrir como usar o sangue da nossa família, o selo cai."
    ]
  },
  selo_prontuario: {
    nome: "Prontuário da seita",
    info: "selo_lucas",
    foraDaContagem: true,
    texto: [
      "Depois que o último dos heróis morreu, a seita ficou livre para agir.",
      "Com vários experimentos em famílias da cidade, conseguimos o que o Caos exigia: um bebê compatível com ele.",
      "Nome da criança: Lucas.",
      "O corpo dele foi preparado desde o berço. Na noite do torneio, o Caos volta."
    ]
  },
  mansao_pacto: {
    nome: "O pacto",
    info: "mansao_pacto",
    texto: [
      "O olho vê quem o serve. A lua marca a hora da entrega. A espiral marca o hospedeiro.",
      "Dez sacrifícios saciam o Caos. Um corpo forte, na noite do torneio, o traz de volta.",
      "O selo é feito do sangue dos Cinco. Só o sangue deles, ou de quem descende deles, pode refazê-lo.",
      "Assinam: Magnus F. (riscado) e, embaixo, em letra nova: D."
    ]
  }
};

// Registra os papéis como documentos (iguais à ordem_fabrica em js/itens.js). Nunca vão para o inventário.
for (const id in PAPEIS_MANSAO) {
  const p = PAPEIS_MANSAO[id];
  ITENS[id] = { nome: p.nome, descricao: p.nome + " (mansão da Zona Oeste).", categoria: "documento", icone: "\u{1F4C4}",
                documento: { titulo: p.nome, texto: p.texto } };
}

DIALOGOS.mansao = {
  entrada: [
    { quem: "Dellalos", texto: "A corrente caiu e a porta cedeu. Só a lanterna me mostra o caminho." },
    { quem: "Dellalos", texto: "Esta casa foi muito bonita. Agora tem cheiro de coisa fechada há anos." },
    { quem: "Dellalos", texto: "(Cuidado. Se o zelador escondeu a chave, é porque tinha algo a esconder aqui dentro.)" }
  ],
  porao: [
    { quem: "Dellalos", texto: "O ar aqui embaixo é gelado. Tem símbolos pintados nas paredes." },
    { quem: "Dellalos", texto: "Um olho, uma lua, uma espiral... Já vi isso em algum lugar." }
  ],
  tunel: [
    { quem: "Dellalos", texto: "O ar do túnel é quente e abafado. Tem marcas de mãos nas paredes." },
    { quem: "Dellalos", texto: "No fim, uma porta de aço enorme. Alguém vigiou isso por muitas noites." }
  ],
  tunelAberto: [
    { quem: "Dellalos", texto: "Funcionou! A grade destravou com um clique." },
    { quem: "Dellalos", texto: "SANGUE. Estava escondida nas primeiras letras da carta do zelador, o tempo todo." }
  ],
  // ----- Porta do selo (fim do túnel). TEXTOS PROVISÓRIOS -----
  seloFechada: [
    { quem: "Dellalos", texto: "Duas marcas de mão na porta, uma de cada lado. Uma delas tem o tamanho da minha." },
    { quem: "Dellalos", texto: "O diário disse que só abre com sangue de um dos Cinco, ou de quem descende deles. Eu sou uma Dellalos, mas a outra marca..." },
    { quem: "Dellalos", texto: "A Nathalia é uma Master, descendente do Julio. Preciso trazer ela comigo." }
  ],
  seloSemPapeis: [
    { quem: "Dellalos", texto: "Ainda tem coisas na mansão que eu não li. Antes de mexer nessa porta, preciso entender o que ela guarda." }
  ],
  seloAbre: [
    { quem: "Dellalos", texto: "Nathalia, tem duas marcas de mão. Uma de cada lado." },
    { quem: "Nathalia", texto: "O sangue dos Cinco... o meu pai tinha razão sobre a nossa família." },
    { quem: "Dellalos", texto: "Eu sou Perroti. Você é Master. Vamos juntas?" },
    { quem: "Nathalia", texto: "Juntas." },
    { quem: "Dellalos", texto: "(As duas encostam a mão. A porta de aço estremece e se abre devagar.)" }
  ],
  seloEntrada: [
    { quem: "Nathalia", texto: "Esse lugar é frio... e tem alguma coisa nos olhando." },
    { quem: "Dellalos", texto: "Tem papéis nas mesas e uma inscrição na parede. Vamos ler tudo." }
  ],
  seloQuebra: [
    { quem: "Dellalos", texto: "Então é isso. Os Cinco prenderam o Caos aqui. E a seita não quer soltá-lo por ódio: ela acredita que o Caos vai salvar o mundo." },
    { quem: "Nathalia", texto: "Os heróis lutaram contra eles até o fim da vida. E, depois que morreram, a seita continuou sozinha..." },
    { quem: "Dellalos", texto: "Com experimentos nas famílias, até conseguir uma criança compatível com o Caos. O Lucas." },
    { quem: "Nathalia", texto: "Dellalos... o chão está rachando. O círculo do selo!" },
    { quem: "Dellalos", texto: "O nosso sangue abriu a porta, e o selo não aguentou! Ele quebrou!" },
    { quem: "Nathalia", texto: "Alguma coisa acabou de sair daqui. Corre, vamos para fora!" }
  ],
  demonios: [
    { quem: "Nathalia", texto: "Dellalos, olha as estradas... aquilo são demônios!" },
    { quem: "Dellalos", texto: "O selo se quebrou e eles saíram. A cidade inteira está em perigo." },
    { quem: "Dellalos", texto: "Preciso estar pronta antes do dia 15. Cuidado por onde andar." }
  ],
  final: [
    { quem: "Dellalos", texto: "Os Cinco guardaram o selo. O Magnus queria soltar o Caos, e a seita continua o que ele começou." },
    { quem: "Dellalos", texto: "O D. é o Durval. Ele quer o Lucas porque o corpo escolhido é o dele." },
    { quem: "Dellalos", texto: "E o selo só se refaz com o sangue dos descendentes. O meu sangue." },
    { quem: "Dellalos", texto: "(Preciso estar pronta antes do dia 15.)" }
  ]
};

function papeisMansaoLidos() {
  let n = 0;
  for (const id in PAPEIS_MANSAO) if (!PAPEIS_MANSAO[id].foraDaContagem && diario.docs[id]) n++;
  return n;
}
function papeisMansaoTotal() { return Object.keys(PAPEIS_MANSAO).filter((id) => !PAPEIS_MANSAO[id].foraDaContagem).length; }

// Lê um papel: mostra o texto, e na primeira vez guarda em DOCUMENTOS (e a info no diário)
function lerPapel(id) {
  const p = PAPEIS_MANSAO[id];
  if (!p) return;
  const falas = p.texto.map((t) => ({ quem: p.nome, texto: t }));
  abrirDialogo(falas, function () {
    const nova = !diario.docs[id];
    registrarDocumento(id);
    if (p.info) descobrirInfo(p.info);
    if (nova && !p.foraDaContagem) mostrarMensagem("Papéis lidos: " + papeisMansaoLidos() + "/" + papeisMansaoTotal() + ". (Veja em Documentos, no diário.)");
    else if (nova) mostrarMensagem("Guardado em Documentos, no diário.");
    if (!historia.mansaoCompleta && papeisMansaoLidos() >= papeisMansaoTotal()) {
      historia.mansaoCompleta = true;
      abrirDialogo(DIALOGOS.mansao.final);
    }
    verificarSelo();      // leu os 3 papéis da sala do selo? então o selo se quebra
  });
}

// ---------- Porta do selo e quebra do selo ----------
// A porta só abre com a NATHALIA como companheira (a Mariane não pode ser companheira; Isabela e Lucas já não acompanham a essa altura).
function tentarAbrirSelo() {
  if (historia.seloAberto) { mostrarMensagem("A porta do selo está aberta."); return; }
  if (!historia.mansaoCompleta) { abrirDialogo(DIALOGOS.mansao.seloSemPapeis); return; }
  if (companheiroAgora() !== "Nathalia") {
    abrirDialogo(DIALOGOS.mansao.seloFechada, function () {
      mostrarMensagem(amizadeNivel("Nathalia") < 5 ? "A Nathalia precisa ser minha companheira (melhores amigas, nível 5)." : "Chame a Nathalia como companheira (Diário > Amigos).");
    });
    return;
  }
  abrirDialogo(DIALOGOS.mansao.seloAbre, function () {
    historia.seloAberto = true;
    atualizarPortaSelo();
    tremer(8, 0.8);
    mostrarMensagem("A porta do selo se abriu.");
    sinalizarMissao();
  });
}

function verificarSelo() {
  if (historia.seloQuebrado) return;
  if (!diario.docs.selo_inscricao || !diario.docs.selo_diario || !diario.docs.selo_prontuario) return;
  historia.seloQuebrado = true;
  tremer(16, 2.2);
  abrirDialogo(DIALOGOS.mansao.seloQuebra, function () {
    descobrirInfo("selo_quebrado");
    mostrarMensagem("O selo se quebrou! Saia da mansão: há algo errado lá fora.");
    sinalizarMissao();
  });
}

// Senha da porta de aço do túnel: as primeiras letras de cada linha da carta do zelador (mansao_carta_zelador)
const SENHA_TUNEL = "SANGUE";
function normalizarSenha(t) { return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z]/g, ""); }

function pedirSenhaTunel() {
  if (historia.mansaoTunelAberto) { mostrarMensagem("A porta de aço está aberta. O túnel segue para dentro da terra."); return; }
  const resposta = window.prompt("Um painel com letras trava a porta de aço. Digite a senha:");
  if (resposta === null) return;                       // cancelou
  if (normalizarSenha(resposta) !== SENHA_TUNEL) { mostrarMensagem("O painel pisca em vermelho. Senha errada."); return; }
  historia.mansaoTunelAberto = true;
  atualizarPortaTunel();
  descobrirInfo("mansao_tunel");
  abrirDialogo(DIALOGOS.mansao.tunelAberto);
}

// A Dellalos entra na mansão (chamado pela porta em js/salas/zonaoeste.js). Precisa da lanterna.
function entrarNaMansao() {
  if (!historia.comprouLanterna) {
    mostrarMensagem("Lá dentro está um breu. Preciso de uma lanterna. Será que o Seu Tomás vende alguma?");
    return;
  }
  const d = nasceDentroAcima({ x: 10, y: SALA_HALL_H - 1 });
  mudarCena("mansao_hall", d.x, d.y, "cima");
}
const SALA_HALL_H = 13;   // altura do hall (igual a SALAS.mansao_hall.H, aqui em cima)

// Escuridão: tudo fica escuro, menos um círculo em volta da Dellalos (a lanterna). Chamada por js/desenho.js
function desenharEscuridaoMansao() {
  if (!cenaAtual || !cenaAtual.escuro) return;
  ctx.setTransform(ESCALA, 0, 0, ESCALA, 0, 0);
  const px = jogador.x - camera.x, py = jogador.y - camera.y - TILE * 0.7;
  const tremor = Math.sin(performance.now() / 260) * 5;     // a chama da lanterna balança um pouco
  const g = ctx.createRadialGradient(px, py, 100 + tremor, px, py, 330 + tremor);
  g.addColorStop(0, "rgba(6,4,12,0)");
  g.addColorStop(0.6, "rgba(6,4,12,0.55)");
  g.addColorStop(1, "rgba(6,4,12,0.94)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_L, VIEW_A);
}
