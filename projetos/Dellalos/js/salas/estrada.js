// Minijogo da pescaria (js/minijogos_v81.js). aoPegar roda só se o jogador fisgou o peixe.
// Se o minijogo não existir, a pesca funciona como antes (pega direto). Se errar, o Pescador incentiva.
function pescarComMinijogo(facil, aoPegar) {
  if (typeof window.pescarV81 !== "function") { aoPegar(); return; }
  setTimeout(function () {
    window.pescarV81(facil, function (ok, info) {
      if (ok) { if (info && info.perfeito && typeof ganharMoedas === "function") ganharMoedas(3); aoPegar(); }
      else abrirDialogo([{ quem: "Pescador", texto: "Esse escapou. Peixe é assim mesmo: converse comigo de novo e tente outra vez." }]);
    });
  }, 80);
}

/* =====================================================
   salas/estrada.js - A cidade: casa da Dellalos, casa do meio e escola
   Mapa de 64 x 40 tiles. Montado com as ferramentas de js/tiles.js.
   ===================================================== */

(function () {
  const COLS = 64, ROWS = 40;
  const m = criarMapa(COLS, ROWS);

  // 1) Grama em tudo
  pintar(m, "chao", 0, 0, COLS, ROWS, GRAMA);

  // 2) Calçadas e ruas
  pintar(m, "chao", 0, 18, COLS, 2, CALCADA);      // calçada de cima da avenida
  pintar(m, "chao", 0, 25, COLS, 2, CALCADA);      // calçada de baixo
  pintar(m, "chao", 32, 0, 2, ROWS, CALCADA);      // calçadas da rua vertical
  pintar(m, "chao", 39, 0, 2, ROWS, CALCADA);
  pintar(m, "chao", 0, 20, COLS, 5, ASFALTO);      // avenida (horizontal)
  pintar(m, "chao", 34, 0, 5, ROWS, ASFALTO);      // rua (vertical)
  for (let x = 0; x < COLS; x++) if (x < 34 || x > 38) por(m, "chao", x, 22, TRACO_H);
  for (let y = 0; y < ROWS; y++) if (y < 20 || y > 24) por(m, "chao", 36, y, TRACO_V);

  // 3) Casa da Dellalos (esquerda)
  predio(m, 6, 11, 8, 3, ESTILO_LARANJA);
  janela(m, 7, 14); janela(m, 11, 14);
  porta(m, PORTAS.casa.x, PORTAS.casa.y, PORTA_LARANJA, false);
  pintar(m, "chao", 9, 16, 1, 2, CALCADA);         // caminho até a calçada

  // 4) Casa do meio (trancada por enquanto)
  predio(m, 24, 11, 8, 3, ESTILO_VERMELHO);
  janela(m, 25, 14); janela(m, 29, 14);
  porta(m, PORTAS.casaMeio.x, PORTAS.casaMeio.y, PORTA_DUPLA_LARANJA, true);
  pintar(m, "chao", 27, 16, 1, 2, CALCADA);

  // 4b) Loja (casa nova, entre a casa da Dellalos e a casa do meio)
  predio(m, 15, 11, 7, 3, ESTILO_LARANJA);
  janela(m, 16, 14); janela(m, 20, 14);
  porta(m, PORTAS.loja.x, PORTAS.loja.y, PORTA_DUPLA_BRANCA, false);
  pintar(m, "chao", PORTAS.loja.x, 16, 1, 2, CALCADA);   // caminho até a calçada

  // 5) Escola (direita)
  predio(m, 43, 8, 20, 6, ESTILO_VERMELHO);
  for (const x of [45, 47, 49, 55, 57, 59, 61]) janela(m, x, 14);
  porta(m, PORTAS.escola.x, PORTAS.escola.y, PORTA_DUPLA_BRANCA, false);
  pintar(m, "chao", 51, 16, 3, 2, CALCADA);        // entrada larga
  // cercas vivas dos dois lados da entrada
  for (let x = 43; x <= 62; x++) {
    if (x >= 51 && x <= 53) continue;
    por(m, "obj", x, 16, x === 43 || x === 54 ? K(7, 12) : (x === 50 || x === 62 ? K(8, 12) : K(4 + (x % 3), 12)));
    bloquear(m, x, 16);
  }

  // 6) Lago no parque (sudeste)
  bloco9(m, "chao", 44, 30, 9, 5, bloco(8, 6));
  bloquear(m, 44, 30, 9, 5);

  // 7) Bancos, caixas de correio e cercas
  for (const [x, y] of [[20, 26], [48, 26], [42, 19], [16, 19]]) { por(m, "obj", x, y, K(3, 14)); bloquear(m, x, y); }
  for (const [x, y] of [[11, 17], [29, 17]]) { por(m, "obj", x, y, K(8, 11)); bloquear(m, x, y); }
  for (let x = 14; x <= 22; x++) {                       // cerca na frente do terreno da loja (com abertura no caminho)
    if (x === PORTAS.loja.x) continue;
    por(m, "obj", x, 17, K(4 + (x % 3), 14)); bloquear(m, x, 17);
  }

  // 8) Borda de árvores em volta do mapa (sem bloquear ruas)
  for (let x = 0; x < COLS; x++) {
    const tipo = x % 4;
    if (m.chao[2 * COLS + x] === GRAMA) arvore(m, x, 2, tipo);
    if (m.chao[(ROWS - 1) * COLS + x] === GRAMA) arvore(m, x, ROWS - 1, tipo);
  }
  for (let y = 5; y < ROWS - 3; y += 3) {
    if (m.chao[y * COLS + 0] === GRAMA && m.chao[(y - 2) * COLS + 0] === GRAMA) arvore(m, 0, y, y % 4);
    if (m.chao[y * COLS + COLS - 1] === GRAMA && m.chao[(y - 2) * COLS + COLS - 1] === GRAMA) arvore(m, COLS - 1, y, (y + 1) % 4);
  }

  // 9) Árvores espalhadas (sorteio sempre igual)
  // Clareiras (sem árvores) onde ficam os NPCs das missões secundárias: Clarice (canto sudoeste) e pescador (beira do lago)
  const CLAREIRAS = [[2, 32, 7, 6], [41, 29, 3, 7]];
  const bloqAntes = m.bloq.slice();
  for (const [cx, cy, cw, ch] of CLAREIRAS) bloquear(m, cx, cy, cw, ch);
  const rnd = sorteador(2024);
  for (let t = 0; t < 400; t++) {
    arvoreLivre(m, 2 + Math.floor(rnd() * (COLS - 4)), 4 + Math.floor(rnd() * (ROWS - 6)), Math.floor(rnd() * 4));
  }
  for (const [cx, cy, cw, ch] of CLAREIRAS) {          // desfaz o bloqueio temporário
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      if (dentro(m, cx + i, cy + j)) m.bloq[(cy + j) * COLS + (cx + i)] = bloqAntes[(cy + j) * COLS + (cx + i)];
    }
  }

  const lojaDentro = nasceDentroAcima(PORTAS.lojaDentro);
  // Entrada norte do Bairro Sul: 3 tiles para dentro da rua, olhando para baixo (longe da saída: sem ciclo)
  const bairroSul = { x: PORTAS.bairroNorte.x * TILE + TILE / 2, y: (PORTAS.bairroNorte.y + 3) * TILE + 40 };
  // Entrada sul da Zona Norte: 3 tiles para dentro da estrada, olhando para cima (longe da saída: sem ciclo)
  const zonaNorte = { x: PORTAS.norteEntrada.x * TILE + TILE / 2, y: (PORTAS.norteEntrada.y - 3) * TILE + 40 };
  const escola = nasceDentroAcima(PORTAS.hall);
  const casa = nasceDentroAcima(PORTAS.sala);
  const px = (x, y) => ({ x: x * TILE + TILE / 2, y: y * TILE + TILE - 6 });   // posição de pés no meio de um tile

  // Desenho do gatinho laranja (formas simples, sem imagem). Vira para onde anda.
  function desenharGato(n) {
    const t = n._tempoAnim || 0, anda = n.andando;
    const dir = n.direcao === "esquerda" ? -1 : 1;
    const pulo = anda ? Math.abs(Math.sin(t * 12)) * 3 : 0;
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath(); ctx.ellipse(n.x, n.y - 2, 20, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(n.x, n.y - 4 - pulo);
    ctx.scale(dir, 1);
    ctx.lineCap = "round";
    ctx.strokeStyle = "#d9822b"; ctx.lineWidth = 6;                               // rabo
    ctx.beginPath(); ctx.moveTo(-14, -14); ctx.quadraticCurveTo(-32, -20 + Math.sin(t * 6) * 5, -26, -38); ctx.stroke();
    ctx.fillStyle = "#e8963a";
    ctx.beginPath(); ctx.ellipse(0, -14, 18, 11, 0, 0, Math.PI * 2); ctx.fill();   // corpo
    const p = anda ? Math.sin(t * 12) * 3 : 0;
    ctx.fillRect(-12 + p, -7, 5, 7); ctx.fillRect(7 - p, -7, 5, 7);                 // patinhas
    ctx.beginPath(); ctx.arc(15, -25, 10, 0, Math.PI * 2); ctx.fill();              // cabeça
    ctx.beginPath(); ctx.moveTo(8, -32); ctx.lineTo(10, -43); ctx.lineTo(16, -34); ctx.fill();   // orelhas
    ctx.beginPath(); ctx.moveTo(15, -34); ctx.lineTo(21, -43); ctx.lineTo(23, -30); ctx.fill();
    ctx.fillStyle = "#14110f";
    ctx.fillRect(15, -28, 3, 4); ctx.fillRect(21, -28, 3, 4);                       // olhos
    ctx.fillStyle = "#f0a0a0"; ctx.fillRect(19, -22, 3, 2);                         // focinho
    if (historia.comprouLacinho && historia.entregouGato) {                         // lacinho comprado na loja
      ctx.fillStyle = "#d83a3a";
      ctx.beginPath(); ctx.moveTo(10, -15); ctx.lineTo(3, -20); ctx.lineTo(3, -10); ctx.fill();
      ctx.beginPath(); ctx.moveTo(10, -15); ctx.lineTo(17, -20); ctx.lineTo(17, -10); ctx.fill();
      ctx.fillStyle = "#a82828"; ctx.fillRect(8, -17, 4, 4);
    }
    ctx.restore();
  }

  // ---------- Saída LESTE: a avenida continua até a Zona Leste (js/salas/zonaleste.js) ----------
  // Até conhecer a Millena, uma barreira de obras fecha a avenida (x 62, linhas 18-26). Depois, ela some.
  const zonaLeste = { x: 3 * TILE + TILE / 2, y: PORTAS.lesteEntrada.y * TILE + 40 };
  // Saída OESTE: o começo da avenida leva à Zona Oeste (js/salas/zonaoeste.js). Chega 3 tiles para dentro da avenida dela, olhando para o oeste.
  const zonaOeste = { x: (PORTAS.oesteEntrada.x - 3) * TILE + TILE / 2, y: PORTAS.oesteEntrada.y * TILE + 40 };
  const areaBarreiraLeste = celula(62, 17, 1, 11);
  function atualizarBarreiraLeste() {
    const aberta = !!historia.conheceuMillena;
    for (let y = 17; y <= 27; y++) {
      const asfalto = y >= 20 && y <= 24;
      por(m, "obj", 62, y, aberta ? -1 : (asfalto ? K(5 + (y % 2), 8) : K(4 + (y % 3), 13)));
      bloquear(m, 62, y, 1, 1, aberta ? 0 : 1);
    }
    areaBarreiraLeste.x = aberta ? -99999 : 62 * TILE;     // aberta: o aviso de "interditada" some
  }

  CENAS.estrada = {
    mapa: m,
    combate: true,
    // Se o amigo do papai já falou com a Dellalos, ele já foi embora (também vale ao carregar o save)
    aoEntrar: function () { if (historia.conheceuAmigoPai) historia.amigoSumiu = true; atualizarBarreiraLeste(); },
    npcs: [
      // --- Samuel, aluno da noite, na porta da escola (só aparece na noite do dia 4; ainda sem sprite: boneco provisório) ---
      {
        nome: "Samuel", cor: "#3a5a7a",
        x: 50 * TILE + TILE / 2, y: 16 * TILE + 58,
        se: function () { return noiteAtiva(); },
        conversar: function () {
          if (historia.falouSamuel) { abrirDialogo(DIALOGOS.noite.samuelDepois); return; }
          abrirDialogo(DIALOGOS.noite.samuel, function () { historia.falouSamuel = true; });
        }
      },
      // --- Isabela ao lado da casa da Dellalos: convida para o torneio (depois que a Millena contou) ---
      // O nome é "IsabelaConvite" para não se misturar com a Isabela da sala 3C no sistema de amizade.
      {
        nome: "IsabelaConvite",
        x: 11 * TILE + TILE / 2, y: 16 * TILE + 58,
        imagem: ["assets/Isabela.png", "assets/isabela.png", "assets/Isabela.jpg"],
        quadro: { linha: 2, coluna: 0 },     // olhando para a porta da casa (esquerda)
        se: function () { return historia.torneioAnunciado && !historia.isabelaConvidou; },
        conversar: function () {
          if (dialogoSeitaBloqueia("Isabela")) { abrirDialogo(DIALOGOS.preparar.isabela); return; }   // depois do DIA_SEITA (js/simon.js)
          abrirDialogo(DIALOGOS.isabelaConvite.convite, function () { historia.isabelaConvidou = true; });
        }
      },
      // --- Amigo do papai (estrada sul, na calçada da rua vertical): aparece no dia 2, depois da escola ---
      {
        nome: "Amigo do papai",
        x: 39 * TILE + TILE / 2, y: 33 * TILE + 58,
        imagem: ["assets/AmigoPai.png", "assets/amigopai.png", "assets/AmigoPai.jpg"],
        quadro: { linha: 0, coluna: 0 },
        se: function () { return historia.chegouEscolaDia2 && historia.leuCartaPai && !historia.amigoSumiu; },   // dia 2, depois da escola
        conversar: function () {
          const eu = this;
          abrirDialogo(DIALOGOS.amigopai.primeira, function () {
            historia.conheceuAmigoPai = true;
            // sai andando pela calçada, para o sul, e some
            npcIrEmbora(eu, 39 * TILE + TILE / 2, 38 * TILE + 58, 90, function () { historia.amigoSumiu = true; });
          });
        }
      },
      {
        nome: "Morador",
        x: 24 * TILE + TILE / 2, y: 19 * TILE + 58,    // na calçada, entre as duas casas
        imagem: ["assets/Morador.png", "assets/morador.png"],
        quadro: { linha: 0, coluna: 0 },
        andar: { raioX: 224, raioY: 0, velocidade: 55 },   // passeia pela calçada
        conversar: function () {
          // Depois da escola, o Morador entrega a chave do quarto do pai
          if (historia.conheceuMillena && !historia.recebeuChaveQuarto) {
            abrirDialogo(DIALOGOS.morador.chave, entregarChaveDoMorador);
            return;
          }
          // Dia 8+: a segunda carta do papai (normalmente já entregue sozinha ao pisar na estrada; js/dias.js)
          if (cartaMoradorPendente()) { abrirCartaDoMorador(); return; }
          if (ehDia10()) { abrirDialogo(DIALOGOS.dia10.morador); return; }   // dia 10: hoje é o dia da volta (js/dia10.js)
          if (historia.recebeuCarta8) { abrirDialogo(DIALOGOS.morador.depoisCarta); return; }
          if (historia.conheceuMorador) abrirDialogo(DIALOGOS.morador.depois);
          else abrirDialogo(DIALOGOS.morador.primeira, function () { historia.conheceuMorador = true; });
        }
      },

      // ================= MISSÕES SECUNDÁRIAS (só depois de conhecer a Millena) =================
      // Sprites repetidos de propósito: Morador (Morador.png), Morador2 e Npc2 servem para vários moradores. Para trocar, mude só a linha "imagem".

      // --- Pescador (beira do lago): encomenda para a casa do meio ---
      {
        nome: "Pescador",
        x: 42 * TILE + TILE / 2, y: 32 * TILE + 58,
        imagem: ["assets/Morador2.png", "assets/morador2.png", "assets/Morador2.jpg"],
        quadro: { linha: 3, coluna: 0 },                   // olhando para o lago (direita)
        se: function () { return historia.conheceuMillena; },
        conversar: function () {
          if (historia.entregouEncomenda) {
            if (!historia.pescaTutorialIniciado) {
              abrirDialogo([
                { quem: "Pescador", texto: "Já que você me ajudou com a encomenda, quer aprender a pescar? É uma boa forma de conseguir comida." },
                { quem: "Pescador", texto: "Fique à beira do lago e converse comigo para lançar a linha. Quando conseguir um peixe, abra a mochila e use Comer para recuperar um pouco de vida." },
                { quem: "Dellalos", texto: "Vou tentar pegar meu primeiro peixe!" }
              ], function () {
                historia.pescaTutorialIniciado = true;
                avisarNovaSecundaria("pesca");
              });
              return;
            }
            if (!historia.pescouPrimeiroPeixe) {
              abrirDialogo([
                { quem: "Pescador", texto: "Vamos lá: prepare a linha, espere o peixe morder e puxe na hora certa. No começo eu te dou uma ajuda." }
              ], function () {
                pescarComMinijogo(true, function () {   // minijogo da pescaria (js/minijogos_v81.js); o 1º peixe tem ajuda
                  if (darItem("peixe")) {
                    historia.pescouPrimeiroPeixe = true;
                    mostrarMensagem("Você pescou um peixe! Abra a mochila para ver o item.");
                  }
                });
              });
              return;
            }
            if (temItem("peixe")) {
              abrirDialogo([{ quem: "Pescador", texto: "Você já está carregando um peixe. Coma-o pelo inventário quando precisar recuperar vida." }]);
              return;
            }
            let vaiPescar = false;
            abrirDialogo([{
              quem: "Pescador", texto: "A linha está pronta. Quer tentar a sorte?",
              opcoes: [{ id: "pescar", texto: "Pescar", fn: function () { vaiPescar = true; } }, { id: "nao", texto: "Agora não" }]
            }], function () {
              if (!vaiPescar) return;
              pescarComMinijogo(false, function () {
                if (darItem("peixe")) mostrarMensagem("Você pescou outro peixe!");
                else mostrarMensagem("Sua mochila está cheia.");
              });
            });
            return;
          }
          if (historia.aceitouEncomenda) { abrirDialogo(DIALOGOS.pescador.lembrar); return; }
          if (!missaoDoDiaLiberada("pescador")) { semMissaoHoje("Pescador", "A pesca está boa hoje e não preciso de nada. Volte outro dia, quem sabe?"); return; }   // js/calendario.js
          const falas = historia.conheceuPescador ? DIALOGOS.pescador.outraVez : DIALOGOS.pescador.oferta;
          abrirDialogo(falas, function () {
            historia.conheceuPescador = true;
            avisarNovaSecundaria("pescador");
          });
        }
      },

      // --- Clarice (canto sudoeste): perdeu o gatinho Bolinha ---
      {
        nome: "Clarice",
        x: 4 * TILE + TILE / 2, y: 35 * TILE + 58,
        imagem: ["assets/Npc2.png", "assets/npc2.png", "assets/Npc2.jpg"],
        quadro: { linha: 0, coluna: 0 },
        se: function () { return historia.conheceuMillena; },
        conversar: function () {
          if (historia.entregouGato) { abrirDialogo(DIALOGOS.clarice.depois); return; }
          if (historia.pegouGato && temItem("gatinho")) {
            abrirDialogo(DIALOGOS.clarice.entregar, function () {
              tirarItem("gatinho");
              historia.entregouGato = true;
            });
            return;
          }
          if (historia.aceitouGato) { abrirDialogo(DIALOGOS.clarice.lembrar); return; }
          if (!missaoDoDiaLiberada("gato")) { semMissaoHoje("Clarice", "Oi, Dellalos! Hoje está tudo calmo por aqui."); return; }   // js/calendario.js
          abrirDialogo(DIALOGOS.clarice.primeira, function () {
            historia.conheceuClarice = true;
            historia.aceitouGato = true;
            avisarNovaSecundaria("gato");
          });
        }
      },

      // --- Bolinha perdido: vaga pela estrada INTEIRA até ser pego (entra no inventário) ---
      {
        nome: "Bolinha",
        x: 30 * TILE + TILE / 2, y: 23 * TILE + 58,
        caixa: { w: 36, h: 22 },
        semSolido: true,                                   // dá para passar por cima
        andar: { raioX: 420, raioY: 420, velocidade: 85, relativo: true },   // sem limite: vaga pelo mapa todo
        desenharCustom: desenharGato,
        se: function () { return historia.conheceuMillena && !historia.pegouGato; },
        conversar: function () {
          if (!historia.aceitouGato) { abrirDialogo(DIALOGOS.gatinho.perdido); return; }
          if (!darItem("gatinho")) return;                 // mochila cheia: o jogo avisa e o gatinho fica
          historia.pegouGato = true;
          mostrarMensagem("Você pegou o Bolinha! Leve-o até a Clarice.");
        }
      },

      // --- Bolinha em casa: aparece ao lado da Clarice depois de devolvido ---
      {
        nome: "Bolinha",
        x: 5 * TILE + TILE / 2, y: 36 * TILE + 40,
        caixa: { w: 36, h: 22 },
        semSolido: true,
        desenharCustom: desenharGato,
        se: function () { return historia.entregouGato; },
        conversar: function () { abrirDialogo(DIALOGOS.gatinho.carinho); }
      },

      // --- Dona Rosa (calçada): derrotar 5 slimes ---
      {
        nome: "Dona Rosa",
        x: 46 * TILE + TILE / 2, y: 19 * TILE + 58,
        imagem: ["assets/Npc2.png", "assets/npc2.png", "assets/Npc2.jpg"],
        quadro: { linha: 0, coluna: 0 },
        se: function () { return historia.conheceuMillena; },
        conversar: function () {
          if (historia.entregouCaca) { abrirDialogo(DIALOGOS.rosa.depois); return; }
          if (historia.aceitouCaca) {
            if (slimesDerrotados() >= SLIMES_CACA) {
              abrirDialogo(DIALOGOS.rosa.concluir, function () { historia.entregouCaca = true; });
            } else {
              abrirDialogo([{ quem: "Dona Rosa", texto: "Você derrotou " + slimesDerrotados() + " de " + SLIMES_CACA + " slimes. Continue, querida!" }]);
            }
            return;
          }
          if (!missaoDoDiaLiberada("caca")) { semMissaoHoje("Dona Rosa", "Bom dia, querida! Por enquanto a calçada está tranquila."); return; }   // js/calendario.js
          abrirDialogo(DIALOGOS.rosa.oferta, function () {
            historia.conheceuRosa = true;
            avisarNovaSecundaria("caca");
          });
        }
      }
    ],
    interativos: [
      // Entrega da encomenda do pescador (js/missoes.js); sem encomenda continua "Ainda não disponível."
      { nome: "porta_casa_do_meio", area: celula(PORTAS.casaMeio.x, PORTAS.casaMeio.y), conversar: function () { usarPortaCasaDoMeio(); } },
      // Fim da avenida (lado leste): fechado por obras até conhecer a Millena
      { nome: "barreira_leste", area: areaBarreiraLeste, texto: "Avenida interditada por obras. Dizem que depois dela fica uma área perigosa. Melhor não ir agora." }
    ],
    // À noite (js/dias.js): sul, norte, leste e a loja ficam fechados. Só a escola e a casa funcionam.
    bloqueios: [
      { area: celula(PORTAS.bairroSul.x - 4, PORTAS.bairroSul.y, 9, 1), recuo: { x: 0, y: -2 * TILE }, texto: "Não é bom ir lá agora.", se: function () { return noiteAtiva(); } },
      { area: celula(PORTAS.norteSaida.x - 4, PORTAS.norteSaida.y, 9, 1), recuo: { x: 0, y: 2 * TILE }, texto: "Não é bom ir lá agora.", se: function () { return noiteAtiva(); } },
      { area: celula(PORTAS.lesteSaida.x, 18, 1, 9), recuo: { x: -2 * TILE, y: 0 }, texto: "Não é bom ir lá agora.", se: function () { return noiteAtiva(); } },
      { area: celula(PORTAS.oesteSaida.x, 18, 1, 9), recuo: { x: 2 * TILE, y: 0 }, texto: "Não é bom ir lá agora.", se: function () { return noiteAtiva(); } },
      { area: celula(PORTAS.loja.x, PORTAS.loja.y), recuo: { x: 0, y: 2 * TILE }, texto: "A loja já fechou. Volto amanhã.", se: function () { return noiteAtiva() || cicloEhNoite(); } },   // à noite (história ou ciclo, js/ciclo.js)
      // A escola só abre depois de falar com o Samuel (parte 2)
      { area: celula(PORTAS.escola.x, PORTAS.escola.y), recuo: { x: 0, y: 2 * TILE }, texto: "Tem um aluno na porta. Vou falar com ele primeiro.", se: function () { return noiteAtiva() && !historia.falouSamuel; } }
    ],
    saidas: [
      { area: celula(PORTAS.casa.x, PORTAS.casa.y),     para: "sala",  x: casa.x,   y: casa.y,   dir: "cima" },
      { area: celula(PORTAS.escola.x, PORTAS.escola.y), para: "escola", x: escola.x, y: escola.y, dir: "cima" },
      { area: celula(PORTAS.loja.x, PORTAS.loja.y),     para: "loja",   x: lojaDentro.x, y: lojaDentro.y, dir: "cima" },
      // Saída SUL: o fim da rua vertical (calçadas + asfalto, 9 tiles) leva ao Bairro Sul
      { area: celula(PORTAS.bairroSul.x - 4, PORTAS.bairroSul.y, 9, 1), para: "bairro_sul", x: bairroSul.x, y: bairroSul.y, dir: "baixo" },
      // Saída NORTE: o fim da rua vertical (calçadas + asfalto, 9 tiles) leva à Zona Norte (js/salas/zonanorte.js)
      { area: celula(PORTAS.norteSaida.x - 4, PORTAS.norteSaida.y, 9, 1), para: "zona_norte", x: zonaNorte.x, y: zonaNorte.y, dir: "cima" },
      // Saída LESTE: o fim da avenida (calçadas + asfalto, 9 tiles) leva à Zona Leste
      { area: celula(PORTAS.lesteSaida.x, 18, 1, 9), para: "zona_leste", x: zonaLeste.x, y: zonaLeste.y, dir: "direita",
        se: function () { return !!historia.conheceuMillena; } },   // fechada por obras até conhecer a Millena
      // Saída OESTE: o começo da avenida (calçadas + asfalto, 9 tiles) leva à Zona Oeste
      { area: celula(PORTAS.oesteSaida.x, 18, 1, 9), para: "zona_oeste", x: zonaOeste.x, y: zonaOeste.y, dir: "esquerda" }
    ],
    placas: [
      { texto: "ESCOLA", x: PORTAS.escola.x * TILE + TILE / 2, y: 13 * TILE + 24, w: 220, h: 46, fonte: 28 },
      { texto: "LOJA",   x: PORTAS.loja.x * TILE + TILE / 2,   y: 13 * TILE + 24, w: 130, h: 46, fonte: 28 },
      { texto: "BAIRRO SUL \u2193", x: (PORTAS.bairroSul.x + 5) * TILE, y: (PORTAS.bairroSul.y - 6) * TILE + 24, w: 250, h: 46, fonte: 26 },
      { texto: "ZONA LESTE \u2192", x: 58 * TILE + TILE / 2, y: 17 * TILE + 32, w: 270, h: 46, fonte: 26 },
      { texto: "ZONA NORTE \u2191", x: (PORTAS.norteSaida.x + 5) * TILE, y: (PORTAS.norteSaida.y + 6) * TILE + 24, w: 270, h: 46, fonte: 26 },
      { texto: "\u2190 ZONA OESTE", x: 4 * TILE, y: 17 * TILE + 32, w: 270, h: 46, fonte: 26 }
    ],
    inimigos: [
      { tipo: "slime", ...px(18, 21) }, { tipo: "slime", ...px(46, 23) }, { tipo: "slime", ...px(22, 30) },
      { tipo: "slime", ...px(30, 33) }, { tipo: "slime", ...px(10, 29) }, { tipo: "slime", ...px(56, 28) },
      { tipo: "slime", ...px(28, 6) },  { tipo: "slime", ...px(50, 20) }
    ]
  };

  // Depois que o selo se quebra (historia.seloQuebrado; js/salas/mansao.js) há demônios pelas estradas. Os slimes continuam nas mesmas posições.
  const slimesEstrada = CENAS.estrada.inimigos;
  const demoniosEstrada = [px(24, 25), px(40, 28), px(34, 14), px(12, 22), px(52, 24)].map((p) => ({ tipo: "demonio", x: p.x, y: p.y }));
  Object.defineProperty(CENAS.estrada, "inimigos", {
    get: function () { return historia.seloQuebrado ? slimesEstrada.concat(demoniosEstrada) : slimesEstrada; }
  });
})();
