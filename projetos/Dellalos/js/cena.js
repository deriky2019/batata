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
     inimigos    -> { tipo, x, y }  (opcional: se: () => bool, solta: "id_da_peca")
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
    if (!n.semSolido) cena.solidos.push(b);   // semSolido: true = dá para passar por cima (ex.: gatinho)
    cena.interativos.push({
      nome: n.nome,
      area,
      conversar: function () {
        if (n._rota) return;
        aoConversarNpc(n); npcOlharJogador(n);
        if (temItem("retrato_herois")) { conversarComRetrato(n); return; }   // com o retrato: Conversar ou Mostrar retrato (js/itens.js)
        n.conversar();
      }   // andando para sair de cena: não conversa
    });
  }
}

// Entra na cena na hora (sem efeito)
function entrarNaCena(id, x, y, dir) {
  const cena = CENAS[id];
  prepararCena(cena);
  cenaAtual = cena;
  if (transicao) tocarSom("porta");   // só quando é uma troca de lugar de verdade
  for (const n of cena.npcs || []) if (n.se) ajustarPresencaNpc(n);   // NPC ausente não bloqueia o caminho (js/npcs.js)
  if (cena.aoEntrar) cena.aoEntrar();   // (opcional) ajustes da cena ao entrar, ex.: porta já destrancada
  jogador.x = x;
  jogador.y = y;
  if (dir) jogador.direcao = dir;
  inimigos = [];
  projeteis = [];                                                // tiros no ar não passam de uma cena para outra
  (cena.inimigos || []).forEach((e, idx) => {
    if (cena._derrotados && cena._derrotados.has(idx)) return;   // já derrotado
    if (e.se && !e.se()) return;                                 // (opcional) só existe quando  se()  for true (ex.: chefe já derrotado)
    const i = criarInimigo(e.tipo, e.x, e.y, idx);
    if (e.solta) i.solta = e.solta;                              // (opcional) peça que ele solta ao ser derrotado (js/missoes.js)
    posicionarInimigoLivre(i);                                   // não nasce preso em árvore
    inimigos.push(i);
  });
  atualizarCamera();
  aoEntrarNaCena(id);   // missões (js/missoes.js)
}

// Todos os inimigos voltam (usado ao renascer e ao começar "Do zero")
function reiniciarInimigos() {
  for (const id in CENAS) CENAS[id]._derrotados = null;
}

// Troca de cena com escurecer/clarear
function mudarCena(id, x, y, dir) {
  if (transicao) return;
  if (!CENAS[id]) { console.warn("Cena não existe: " + id); mostrarMensagem("Não foi possível abrir este lugar."); return; }
  try {
    prepararCena(CENAS[id]);
    transicao = { fase: "saindo", t: 0, dest: { id, x, y, dir }, origem: { cena: cenaAtual, x: jogador.x, y: jogador.y, dir: jogador.direcao } };
  } catch (erro) {
    console.error("Falha ao preparar a cena " + id + ":", erro);
    mostrarMensagem("Houve um problema ao carregar este lugar. Tente novamente.");
  }
}

function atualizarTransicao(dt) {
  if (!transicao) return;
  transicao.t += dt;
  if (transicao.t < CONFIG.transicao) return;
  if (transicao.fase === "saindo") {
    const troca = transicao;
    try {
      entrarNaCena(troca.dest.id, troca.dest.x, troca.dest.y, troca.dest.dir);
      transicao.fase = "entrando";
      transicao.t = 0;
    } catch (erro) {
      console.error("Falha ao entrar na cena " + troca.dest.id + ":", erro);
      // Não deixa a transição presa no preto: restaura a cena anterior e mantém o jogo utilizável.
      if (troca.origem && troca.origem.cena) {
        cenaAtual = troca.origem.cena;
        jogador.x = troca.origem.x; jogador.y = troca.origem.y;
        jogador.direcao = troca.origem.dir || "baixo";
        atualizarCamera();
      }
      transicao = null;
      mostrarMensagem("Não foi possível carregar esta área. Você voltou para o lugar anterior.");
    }
  } else {
    transicao = null;
  }
}

// Dellalos encostou numa saída automática?
function verificarSaidas() {
  if (transicao) return;
  const caixa = caixaDoJogador(jogador.x, jogador.y);
  // (opcional) bloqueios: { area, se, texto, recuo:{x,y} } -> se se() for true, mostra o texto e empurra a Dellalos de volta
  for (const b of cenaAtual.bloqueios || []) {
    if (b.se && !b.se()) continue;
    if (bate(caixa, b.area)) {
      jogador.x += b.recuo.x; jogador.y += b.recuo.y;
      mostrarMensagem(b.texto);
      return;
    }
  }
  for (const s of cenaAtual.saidas || []) {
    if (s.se && !s.se()) continue;                                // (opcional) saída que só funciona quando  se()  for true
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
    if (p.se && !p.se()) continue;                 // (opcional) placa que só aparece quando  se()  for true
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
  desenharCamada("deco");
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
