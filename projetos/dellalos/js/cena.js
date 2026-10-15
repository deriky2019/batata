/* =====================================================
   cena.js - Os lugares do jogo (sala, estrada, escola...) + a câmera
   Cada lugar é um bloco de DADOS em js/salas/NOME.js.
   Este arquivo só sabe entrar, trocar, desenhar cenas e mover a câmera.

   Uma cena tem:
     mapa        -> o tilemap, criado com criarMapa() (veja js/tiles.js)
     corFora     -> (opcional) cor da tela fora do mapa (salas pequenas). Padrão: preto
     spawn       -> (opcional) { x, y } onde a Dellalos aparece
     interativos -> objetos do botão B: { nome, area, texto } ou { nome, area, destino:{cena,x,y} }
     saidas      -> lugares que levam a outra cena ao encostar: { area, para, x, y, dir }
     inimigos    -> { tipo, x, y }
     combate     -> true = o botão A ataca neste lugar
     npcs        -> personagens que conversam: { nome, x, y (pés), imagem:[caminhos], conversar }
                    (viram sólidos e interativos sozinhos; veja js/npcs.js)
     placas      -> plaquinhas com texto: { texto, x, y (centro), w, h }
     solidos     -> (opcional) retângulos extras que bloqueiam
     aoEntrar    -> (opcional) função chamada toda vez que Dellalos entra na cena
   Todas as posições (x, y, area) são em pixels do jogo; 1 tile = 64.
   Use celula(x, y, w, h) para escrever áreas em tiles.
   ===================================================== */

const CENAS = {};         // preenchido pelos arquivos em js/salas/
let cenaAtual = null;
let transicao = null;     // { fase: "saindo" | "entrando", t, dest: {id, x, y, dir} }
const camera = { x: 0, y: 0 };

// NPCs viram sólidos e interativos (feito uma vez por cena)
function prepararCena(cena) {
  if (cena._pronta) return;
  cena._pronta = true;
  cena.solidos = (cena.solidos || []).slice();
  cena.interativos = (cena.interativos || []).slice();
  for (const n of cena.npcs || []) {
    prepararNpc(n);
    const b = caixaDoNpc(n);
    const area = { x: b.x - 16, y: b.y - 16, w: b.w + 32, h: b.h + 32 };
    n._solido = b;      // guardados para acompanhar o NPC quando ele anda (js/npcs.js)
    n._area = area;
    cena.solidos.push(b);
    cena.interativos.push({
      nome: n.nome,
      area,
      conversar: function () { npcOlharJogador(n); n.conversar(); }
    });
  }
}

// Entra na cena na hora (sem efeito)
function entrarNaCena(id, x, y, dir) {
  const cena = CENAS[id];
  prepararCena(cena);
  cenaAtual = cena;
  if (cena.aoEntrar) cena.aoEntrar();   // (opcional) ajustes da cena ao entrar, ex.: porta já destrancada
  jogador.x = x;
  jogador.y = y;
  if (dir) jogador.direcao = dir;
  inimigos = (cena.inimigos || []).map((e) => criarInimigo(e.tipo, e.x, e.y));
  atualizarCamera();
  aoEntrarNaCena(id);   // missões (js/missoes.js)
}

// Troca de cena com escurecer/clarear
function mudarCena(id, x, y, dir) {
  if (transicao) return;
  if (!CENAS[id]) { console.warn("Cena não existe: " + id); return; }
  prepararCena(CENAS[id]);
  transicao = { fase: "saindo", t: 0, dest: { id, x, y, dir } };
}

function atualizarTransicao(dt) {
  if (!transicao) return;
  transicao.t += dt;
  if (transicao.t < CONFIG.transicao) return;
  if (transicao.fase === "saindo") {
    entrarNaCena(transicao.dest.id, transicao.dest.x, transicao.dest.y, transicao.dest.dir);
    transicao.fase = "entrando";
    transicao.t = 0;
  } else {
    transicao = null;
  }
}

// Dellalos encostou numa saída automática?
function verificarSaidas() {
  if (transicao) return;
  const caixa = caixaDoJogador(jogador.x, jogador.y);
  for (const s of cenaAtual.saidas || []) {
    if (bate(caixa, s.area)) { mudarCena(s.para, s.x, s.y, s.dir); return; }
  }
}

// ---------- Câmera ----------
// Segue a Dellalos e não mostra nada além das bordas do mapa.
// Se o mapa for menor que a tela, ele fica centralizado.
function atualizarCamera() {
  const m = cenaAtual.mapa;
  const mw = m.cols * TILE, mh = m.rows * TILE;
  let cx = jogador.x - VIEW_L / 2;
  let cy = jogador.y - TILE - VIEW_A / 2;
  cx = mw <= VIEW_L ? -(VIEW_L - mw) / 2 : Math.max(0, Math.min(cx, mw - VIEW_L));
  cy = mh <= VIEW_A ? -(VIEW_A - mh) / 2 : Math.max(0, Math.min(cy, mh - VIEW_A));
  // alinha em pixels reais da tela (evita fendas entre os tiles)
  camera.x = Math.round(cx * ESCALA) / ESCALA;
  camera.y = Math.round(cy * ESCALA) / ESCALA;
}

// ---------- Desenho ----------
// Desenha só os tiles que aparecem na tela
function desenharCamada(nome) {
  const m = cenaAtual.mapa;
  const x0 = Math.max(0, Math.floor(camera.x / TILE));
  const x1 = Math.min(m.cols - 1, Math.floor((camera.x + VIEW_L) / TILE));
  const y0 = Math.max(0, Math.floor(camera.y / TILE));
  const y1 = Math.min(m.rows - 1, Math.floor((camera.y + VIEW_A) / TILE));
  const camada = m[nome];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const n = camada[y * m.cols + x];
      if (n >= 0) desenharTile(n, x * TILE, y * TILE);
    }
  }
}

function desenharPlacas() {
  for (const p of cenaAtual.placas || []) {
    const w = p.w || 56, h = p.h || 30;
    ctx.fillStyle = "#3a2a1c";
    ctx.fillRect(p.x - w / 2 - 3, p.y - h / 2 - 3, w + 6, h + 6);
    ctx.fillStyle = "#f3e6c8";
    ctx.fillRect(p.x - w / 2, p.y - h / 2, w, h);
    ctx.fillStyle = "#3a2a1c";
    ctx.font = "bold " + (p.fonte || 20) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(p.texto, p.x, p.y + 1);
    ctx.textBaseline = "alphabetic";
  }
}

function desenharCenario() {
  desenharCamada("chao");
  desenharCamada("obj");
  desenharPlacas();
}

function desenharTopo() {
  desenharCamada("topo");
}

function desenharFade() {
  if (!transicao) return;
  const p = Math.min(transicao.t / CONFIG.transicao, 1);
  ctx.fillStyle = "rgba(0,0,0," + (transicao.fase === "saindo" ? p : 1 - p) + ")";
  ctx.fillRect(0, 0, VIEW_L, VIEW_A);
}
