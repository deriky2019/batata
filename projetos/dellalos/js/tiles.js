/* =====================================================
   tiles.js - Tilemap: imagens dos tiles + ferramentas para montar mapas
   Imagens: assets/tiles/tilemap.png  (kit Kenney "RPG Urban Pack", CC0, tiles 16x16)
            assets/tiles/extras.png   (tiles feitos para o jogo: piso, parede, quadro, carteira...)
   Um mapa tem 3 camadas de números (um número = um tile):
     chao -> o chão e as paredes (desenhado primeiro)
     obj  -> objetos: portas, janelas, móveis (ficam atrás da Dellalos)
     topo -> o que fica POR CIMA da Dellalos (copas de árvore)
   e uma grade "bloq" (1 = a Dellalos não passa).
   -1 = vazio. Para achar o número de um tile do kit use K(coluna, linha).
   ===================================================== */

let tilesetKit = null, tilesetExtras = null;
carregarImagem(["assets/tiles/tilemap.png"], (img) => { tilesetKit = img; });
carregarImagem(["assets/tiles/extras.png"], (img) => { tilesetExtras = img; });

// Número de um tile do kit (coluna e linha na folha tilemap.png, contando do 0)
const K = (coluna, linha) => linha * 27 + coluna;
// Número de um tile extra (posição na folha extras.png)
const E = (n) => 1000 + n;

// Tiles que usamos bastante
const GRAMA = K(1, 1), CALCADA = K(9, 1), ASFALTO = K(1, 15), TRACO_H = K(1, 16), TRACO_V = K(3, 17);
const PISO_MADEIRA = E(0), PAREDE = E(1), PAREDE_RODAPE = E(2), PAREDE_TOPO = E(3);
const QUADRO_E = E(4), QUADRO_M = E(5), QUADRO_D = E(6);
const CARTEIRA = E(7), MESA_LIVRO = E(8), SOFA_E = E(9), SOFA_M = E(10), SOFA_D = E(11);
const ESTANTE = E(12), PISO_ESCOLA = E(13), CADEIRA = E(14), PLANTA = E(15);
const PORTA_LARANJA = K(13, 10), PORTA_DUPLA_LARANJA = K(14, 10), PORTA_DUPLA_BRANCA = K(15, 10);
const JANELA = K(12, 13), JANELA2 = K(13, 13);

function desenharTile(n, x, y) {
  let img, sx, sy;
  if (n >= 1000) {
    img = tilesetExtras; if (!img) return;
    sx = (n - 1000) * 16; sy = 0;
  } else {
    img = tilesetKit; if (!img) return;
    sx = (n % 27) * 17; sy = Math.floor(n / 27) * 17;
  }
  ctx.drawImage(img, sx, sy, 16, 16, x, y, TILE, TILE);
}

// ---------- Montar mapas ----------
function criarMapa(cols, rows) {
  const n = cols * rows;
  return { cols, rows,
           chao: new Int16Array(n).fill(-1),
           obj: new Int16Array(n).fill(-1),
           topo: new Int16Array(n).fill(-1),
           bloq: new Uint8Array(n) };
}

function dentro(m, x, y) { return x >= 0 && y >= 0 && x < m.cols && y < m.rows; }

// Põe um tile (camada = "chao", "obj" ou "topo")
function por(m, camada, x, y, tile) {
  if (dentro(m, x, y)) m[camada][y * m.cols + x] = tile;
}

// Preenche um retângulo (x, y, largura, altura em tiles) com um tile
function pintar(m, camada, x, y, w, h, tile) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) por(m, camada, x + i, y + j, tile);
}

// Marca um retângulo como bloqueado (valor 1) ou livre (valor 0)
function bloquear(m, x, y, w = 1, h = 1, valor = 1) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (dentro(m, x + i, y + j)) m.bloq[(y + j) * m.cols + (x + i)] = valor;
  }
}

// Bloco 3x3 esticável (cantos, bordas e meio): serve para telhados, lagos, parques...
// ids = [[canto-esq-cima, cima, canto-dir-cima], [esq, meio, dir], [canto-esq-baixo, baixo, canto-dir-baixo]]
function bloco9(m, camada, x, y, w, h, ids) {
  for (let j = 0; j < h; j++) {
    const lin = j === 0 ? 0 : (j === h - 1 ? 2 : 1);
    for (let i = 0; i < w; i++) {
      const col = i === 0 ? 0 : (i === w - 1 ? 2 : 1);
      por(m, camada, x + i, y + j, ids[lin][col]);
    }
  }
}
const bloco = (c0, l0) => [[K(c0, l0), K(c0 + 1, l0), K(c0 + 2, l0)],
                           [K(c0, l0 + 1), K(c0 + 1, l0 + 1), K(c0 + 2, l0 + 1)],
                           [K(c0, l0 + 2), K(c0 + 1, l0 + 2), K(c0 + 2, l0 + 2)]];

// ---------- Prédios e casas ----------
// Estilo = telhado (bloco 3x3) + fachada (2 linhas: cima e baixo, cada uma com [esq, meio, dir])
const ESTILO_LARANJA  = { telhado: bloco(0, 3), fachada: [[K(17, 6), K(18, 6), K(19, 6)], [K(17, 7), K(18, 7), K(19, 7)]] };
const ESTILO_VERMELHO = { telhado: bloco(8, 0), fachada: [[K(17, 2), K(18, 2), K(19, 2)], [K(17, 3), K(18, 3), K(19, 3)]] };

// Prédio: x, y = canto de cima à esquerda; w = largura; hTelhado = linhas de telhado.
// Ocupa hTelhado + 2 linhas (a última é a fachada com a porta). Tudo bloqueado.
function predio(m, x, y, w, hTelhado, estilo) {
  bloco9(m, "chao", x, y, w, hTelhado, estilo.telhado);
  for (let i = 0; i < w; i++) {
    const c = i === 0 ? 0 : (i === w - 1 ? 2 : 1);
    por(m, "chao", x + i, y + hTelhado, estilo.fachada[0][c]);
    por(m, "chao", x + i, y + hTelhado + 1, estilo.fachada[1][c]);
  }
  bloquear(m, x, y, w, hTelhado + 2);
}

// Janela na fachada (y = linha de cima da fachada)
function janela(m, x, y, tile = JANELA) { por(m, "obj", x, y, tile); }

// Porta: bloqueada = true (não abre) ou false (dá para entrar nela)
function porta(m, x, y, tile, bloqueada) {
  por(m, "obj", x, y, tile);
  bloquear(m, x, y, 1, 1, bloqueada ? 1 : 0);
}

// ---------- Árvores (3 tiles de altura: copa, meio e base) ----------
const ARVORES = [{ c: 16, r: 8 }, { c: 17, r: 8 }, { c: 16, r: 11 }, { c: 17, r: 11 }];

// x, y = a BASE da árvore (o tile do tronco). A copa fica 2 tiles acima.
function arvore(m, x, y, tipo = 0) {
  const a = ARVORES[tipo % ARVORES.length];
  por(m, "topo", x, y - 2, K(a.c, a.r));
  por(m, "topo", x, y - 1, K(a.c, a.r + 1));
  por(m, "obj", x, y, K(a.c, a.r + 2));
  bloquear(m, x, y);
}

// Só planta se a área em volta for só grama e estiver vazia
function arvoreLivre(m, x, y, tipo = 0) {
  for (let j = -3; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const cx = x + i, cy = y + j;
    if (!dentro(m, cx, cy)) return false;
    const k = cy * m.cols + cx;
    if (m.chao[k] !== GRAMA || m.obj[k] !== -1 || m.bloq[k]) return false;
  }
  arvore(m, x, y, tipo);
  return true;
}

// Sorteio sempre igual (o mapa não muda a cada vez que abre o jogo)
function sorteador(semente) {
  let s = semente;
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
}

// ---------- Salas por dentro ----------
// Chão (piso), parede de cima (3 linhas), paredes dos lados e de baixo escuras.
function salaInterna(m, piso) {
  pintar(m, "chao", 0, 0, m.cols, m.rows, PAREDE_TOPO);
  pintar(m, "chao", 1, 1, m.cols - 2, 1, PAREDE);
  pintar(m, "chao", 1, 2, m.cols - 2, 1, PAREDE_RODAPE);
  pintar(m, "chao", 1, 3, m.cols - 2, m.rows - 4, piso);
  bloquear(m, 0, 0, m.cols, m.rows);
  bloquear(m, 1, 3, m.cols - 2, m.rows - 4, 0);
}

// Quadro negro na parede (linha 1), w tiles de largura
function quadroNegro(m, x, w) {
  for (let i = 0; i < w; i++) por(m, "chao", x + i, 1, i === 0 ? QUADRO_E : (i === w - 1 ? QUADRO_D : QUADRO_M));
}

// Porta de uma sala por dentro: fica na parede (livre para passar)
function portaInterna(m, x, y, tile = PORTA_LARANJA) { porta(m, x, y, tile, false); }

// Retângulo em pixels a partir de tiles (para áreas de saída e objetos)
function celula(x, y, w = 1, h = 1) { return { x: x * TILE, y: y * TILE, w: w * TILE, h: h * TILE }; }
