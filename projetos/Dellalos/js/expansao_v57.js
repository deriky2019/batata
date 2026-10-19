/* =====================================================
   Expansao de mapas v57
   Amplia cada mapa existente para o dobro das colunas e linhas.
   Preserva a área original exatamente; adiciona novas áreas caminháveis
   à direita e abaixo, com piso escolhido pela superfície predominante.
   Cria passagens laterais discretas para alcançar a expansão.
   ===================================================== */
(function () {
  const FATOR = 2;
  const nomes = Object.keys(CENAS);
  for (const nome of nomes) {
    const cena = CENAS[nome];
    const antigo = cena && cena.mapa;
    if (!antigo || antigo._expandidoV57) continue;
    const cols0 = antigo.cols, rows0 = antigo.rows;
    if (!cols0 || !rows0) continue;
    const cols = cols0 * FATOR, rows = rows0 * FATOR;
    const novo = criarMapa(cols, rows);
    // Copia a região original sem alterar tiles, objetos ou colisões.
    for (const camada of ["chao", "deco", "obj", "topo"]) {
      for (let y = 0; y < rows0; y++) {
        for (let x = 0; x < cols0; x++) {
          novo[camada][y * cols + x] = antigo[camada][y * cols0 + x];
        }
      }
    }
    for (let y = 0; y < rows0; y++) {
      for (let x = 0; x < cols0; x++) novo.bloq[y * cols + x] = antigo.bloq[y * cols0 + x];
    }
    // Escolhe o piso mais comum em células originalmente caminháveis.
    const freq = new Map();
    for (let y = 0; y < rows0; y++) for (let x = 0; x < cols0; x++) {
      const i = y * cols0 + x, tile = antigo.chao[i];
      if (tile >= 0 && !antigo.bloq[i]) freq.set(tile, (freq.get(tile) || 0) + 1);
    }
    let piso = nome.includes("escola") || nome.includes("aula") ? PISO_ESCOLA : GRAMA;
    let maior = 0;
    for (const [tile, n] of freq) if (n > maior) { maior = n; piso = tile; }
    // A área nova fica livre, com o piso predominante do cenário.
    pintar(novo, "chao", cols0, 0, cols - cols0, rows, piso);
    pintar(novo, "chao", 0, rows0, cols0, rows - rows0, piso);
    bloquear(novo, cols0, 0, cols - cols0, rows, 0);
    bloquear(novo, 0, rows0, cols0, rows - rows0, 0);
    // Conecta o mapa original à área expandida sem mover portas já existentes.
    const yPorta = Math.max(2, Math.min(rows0 - 3, Math.floor(rows0 / 2)));
    const xPorta = Math.max(2, Math.min(cols0 - 3, Math.floor(cols0 / 2)));
    for (const [x, y] of [[cols0 - 1, yPorta], [cols0, yPorta], [xPorta, rows0 - 1], [xPorta, rows0]]) {
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
      const i = y * cols + x;
      novo.chao[i] = piso; novo.deco[i] = -1; novo.obj[i] = -1; novo.topo[i] = -1; novo.bloq[i] = 0;
    }
    novo._expandidoV57 = true;
    cena.mapa = novo;
    cena.mapaExpandidoOriginal = { cols: cols0, rows: rows0 };
  }
  console.info("Shadow of War v57: mapas expandidos", nomes.length, "cenas; escala de dimensões", FATOR + "x");
})();
