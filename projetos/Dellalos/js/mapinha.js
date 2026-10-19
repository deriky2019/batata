/* =====================================================
   mapinha.js - Minimapa no lado esquerdo; o som fica dentro do inventário
   - Mostra o lugar atual com as cores reais dos tiles. Paredes e obstáculos ficam mais escuros.
   - Pontos:  branco = Dellalos (com a direção) | amarelo = pessoas | vermelho = inimigos | azul = saídas e portas
   - Em lugares grandes mostra só o redor da Dellalos; em lugares pequenos mostra tudo.
   - TOQUE no mapinha = amplia o lugar inteiro, com o nome (fecha sozinho em 6 s ou com outro toque).
   - Não aparece na mansão escura (o mapa tiraria a graça de explorar), no menu e na tela de morte.
   - Se o navegador não deixar ler as cores dos tiles (alguns celulares abrindo arquivo local),
     o mapa continua funcionando só com claro (chão) e escuro (obstáculo).
   ===================================================== */

const MAPINHA = { el: null, g: null, ampliado: false, ate: 0, semCores: false, cacheCor: new Map(), tmp: null, cenaRef: null, cenaId: "" };
const MAPINHA_PX = 6;      // base com mais resolução para amostragem e ampliação mais nítidas
const MAPINHA_ZOOM = 28;   // quantos tiles aparecem de lado a lado no mapinha pequeno

const MAPINHA_NOMES = {
  sala: "Casa", quarto_pai: "Quarto do papai", estrada: "Estrada", escola: "Escola - 1º andar", escola2: "Escola - 2º andar", loja: "Loja",
  bairro_sul: "Bairro Sul", zona_leste: "Zona Leste", zona_leste2: "Leste 2", zona_norte: "Zona Norte", zona_norte2: "Zona Norte 2", zona_oeste: "Zona Oeste", zona_oeste2: "Oeste 2",
  fabrica: "Fábrica", capela: "Capela"
};
function mapinhaNome(id) {
  if (MAPINHA_NOMES[id]) return MAPINHA_NOMES[id];
  if (id === "aula_professores") return "Sala dos professores";
  if (id.indexOf("aula") === 0) return "Sala de aula";
  if (id.indexOf("casa_sul_") === 0) return "Casa";
  if (id.indexOf("mansao") === 0) return "Mansão";
  return "";
}

(function () {
  const el = document.getElementById("mapinha");
  if (!el) return;
  MAPINHA.el = el;
  MAPINHA.g = el.getContext("2d");
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    MAPINHA.ampliado = !MAPINHA.ampliado;
    MAPINHA.ate = performance.now() + 6000;
    ajustarMapinha();
    if (typeof tocarSom === "function") tocarSom("clique");
  });
  window.addEventListener("resize", ajustarMapinha);
  window.addEventListener("orientationchange", ajustarMapinha);
  ajustarMapinha();
})();

function ajustarMapinha() {
  const el = MAPINHA.el;
  if (!el) return;
  el.classList.toggle("grande", MAPINHA.ampliado);
  const lado = Math.round(el.getBoundingClientRect().width * (window.devicePixelRatio || 1));
  if (lado > 0 && el.width !== lado) { el.width = lado; el.height = lado; }
}

// ---------- Cor de cada tile (média da imagem) ----------
function mapinhaFonteTile(n) {      // mesma regra de desenharTile (js/tiles.js)
  if (n >= 6000) return [tilesetConstrutor, ((n - 6000) % 17) * 16, Math.floor((n - 6000) / 17) * 16];
  if (n >= 2000) return [tilesetInteriores, ((n - 2000) % 16) * 16, Math.floor((n - 2000) / 16) * 16];
  if (n >= 1000) return [tilesetExtras, (n - 1000) * 16, 0];
  return [tilesetKit, (n % 27) * 17, Math.floor(n / 27) * 17];
}
// Devolve {r,g,b,a} ou null (imagem ainda não carregou ou não deu para ler)
function mapinhaCorTile(n) {
  if (MAPINHA.semCores) return null;
  if (MAPINHA.cacheCor.has(n)) return MAPINHA.cacheCor.get(n);
  const f = mapinhaFonteTile(n);
  if (!f[0]) return null;                              // imagem ainda carregando: tenta depois
  let cor = null;
  try {
    if (!MAPINHA.tmp) { MAPINHA.tmp = document.createElement("canvas"); MAPINHA.tmp.width = 16; MAPINHA.tmp.height = 16; }
    const t = MAPINHA.tmp.getContext("2d", { willReadFrequently: true });
    t.clearRect(0, 0, 16, 16);
    t.drawImage(f[0], f[1], f[2], 16, 16, 0, 0, 16, 16);
    const d = t.getImageData(0, 0, 16, 16).data;
    let r = 0, g = 0, b = 0, a = 0;
    for (let i = 0; i < d.length; i += 4) { const w = d[i + 3]; r += d[i] * w; g += d[i + 1] * w; b += d[i + 2] * w; a += w; }
    if (a > 0) cor = { r: r / a, g: g / a, b: b / a, a: a / 255 / 256 };
    else cor = { r: 0, g: 0, b: 0, a: 0 };
  } catch (e) {
    MAPINHA.semCores = true;                           // canvas "contaminado" (arquivo local): usa só claro/escuro
    return null;
  }
  MAPINHA.cacheCor.set(n, cor);
  return cor;
}

// Imagem-base do lugar (1 tile = MAPINHA_PX pixels), montada uma vez
function mapinhaBase(cena) {
  if (cena._mapinha) return cena._mapinha;
  const m = cena.mapa;
  if (!m) return null;
  const cv = document.createElement("canvas");
  cv.width = m.cols * MAPINHA_PX; cv.height = m.rows * MAPINHA_PX;
  const g = cv.getContext("2d");
  let faltou = false;
  for (let y = 0; y < m.rows; y++) {
    for (let x = 0; x < m.cols; x++) {
      const i = y * m.cols + x;
      let r = 18, g2 = 16, b = 26;                      // vazio
      if (MAPINHA.semCores) {
        const camadaCheia = m.chao[i] >= 0 || m.obj[i] >= 0 || m.deco[i] >= 0 || m.topo[i] >= 0;
        if (camadaCheia) { r = 200; g2 = 184; b = 144; }
      } else {
        for (const camada of [m.topo, m.obj, m.deco, m.chao]) {
          const n = camada[i];
          if (n < 0) continue;
          const c = mapinhaCorTile(n);
          if (c === null) { faltou = true; if (MAPINHA.semCores) break; continue; }
          if (c.a >= 0.5) { r = c.r; g2 = c.g; b = c.b; break; }
        }
      }
      if (m.bloq[i]) { r *= 0.62; g2 *= 0.62; b *= 0.62; }   // obstáculo: mais escuro
      g.fillStyle = "rgb(" + Math.round(r) + "," + Math.round(g2) + "," + Math.round(b) + ")";
      g.fillRect(x * MAPINHA_PX, y * MAPINHA_PX, MAPINHA_PX, MAPINHA_PX);
    }
  }
  if (faltou && !MAPINHA.semCores) return cv;            // alguma imagem ainda não carregou: usa agora, mas refaz depois
  cena._mapinha = cv;
  return cv;
}

// ---------- Desenho (a cada quadro, chamado por js/main.js) ----------
function atualizarMapinha() {
  const el = MAPINHA.el;
  if (!el) return;
  if (cenaAtual !== MAPINHA.cenaRef) { MAPINHA.cenaRef = cenaAtual; MAPINHA.cenaId = (cenaAtual && idDaCena(cenaAtual)) || ""; }
  const esconder = menuAberto || jogador.morto || !!telaTempo || !cenaAtual || !cenaAtual.mapa || MAPINHA.cenaId.indexOf("mansao") === 0;
  if (el.hidden !== esconder) el.hidden = esconder;
  if (esconder) return;
  if (MAPINHA.ampliado && performance.now() > MAPINHA.ate) { MAPINHA.ampliado = false; ajustarMapinha(); }
  if (!el.width) { ajustarMapinha(); if (!el.width) return; }

  const g = MAPINHA.g, W = el.width, m = cenaAtual.mapa, grande = MAPINHA.ampliado;
  const maior = Math.max(m.cols, m.rows);
  const alvo = grande ? maior : Math.min(maior, MAPINHA_ZOOM);     // tiles visíveis no lado do mapinha
  const s = W / alvo;                                              // pixels do mapinha por tile
  const px = jogador.x / TILE, py = (jogador.y - 20) / TILE;
  const ox = m.cols <= alvo ? -(alvo - m.cols) / 2 : Math.max(0, Math.min(px - alvo / 2, m.cols - alvo));
  const oy = m.rows <= alvo ? -(alvo - m.rows) / 2 : Math.max(0, Math.min(py - alvo / 2, m.rows - alvo));
  const X = (wx) => (wx / TILE - ox) * s, Y = (wy) => (wy / TILE - oy) * s;

  g.imageSmoothingEnabled = false;
  g.fillStyle = "#0c0a10";
  g.fillRect(0, 0, W, W);
  const base = mapinhaBase(cenaAtual);
  if (base) {
    const sx0 = Math.max(0, ox), sy0 = Math.max(0, oy), sx1 = Math.min(m.cols, ox + alvo), sy1 = Math.min(m.rows, oy + alvo);
    g.drawImage(base, sx0 * MAPINHA_PX, sy0 * MAPINHA_PX, (sx1 - sx0) * MAPINHA_PX, (sy1 - sy0) * MAPINHA_PX,
                (sx0 - ox) * s, (sy0 - oy) * s, (sx1 - sx0) * s, (sy1 - sy0) * s);
  }

  // à noite o mapa escurece junto
  if (typeof cicloEhNoite === "function" && cicloEhNoite() && typeof cicloCenaAoArLivre === "function" && cicloCenaAoArLivre()) {
    g.fillStyle = "rgba(10,20,70,0.38)"; g.fillRect(0, 0, W, W);
  }

  const dpr = window.devicePixelRatio || 1;
  const ponto = (x, y, r, cor) => {
    g.beginPath(); g.arc(X(x), Y(y), r, 0, Math.PI * 2);
    g.fillStyle = cor; g.fill();
    g.lineWidth = Math.max(1, dpr); g.strokeStyle = "rgba(0,0,0,0.8)"; g.stroke();
  };
  const r0 = Math.max(2.2 * dpr, s * 0.42);

  // saídas e portas
  g.fillStyle = "#6fe3ff"; g.strokeStyle = "rgba(0,0,0,0.8)"; g.lineWidth = Math.max(1, dpr);
  for (const sd of cenaAtual.saidas || []) {
    if (sd.se && !sd.se()) continue;
    const w = Math.max(3 * dpr, sd.area.w / TILE * s), h = Math.max(3 * dpr, sd.area.h / TILE * s);
    g.fillRect(X(sd.area.x), Y(sd.area.y), w, h);
    g.strokeRect(X(sd.area.x), Y(sd.area.y), w, h);
  }
  // pessoas
  for (const n of cenaAtual.npcs || []) if (npcAtivo(n)) ponto(n.x, n.y - 30, r0, "#ffd75e");
  // inimigos
  for (const i of inimigos) if (i.vida > 0) ponto(i.x, i.y - 20, r0, "#e0463c");

  // Dellalos: círculo branco + ponta na direção em que ela olha
  const dir = DIRECOES[jogador.direcao] || [0, 1];
  const jx = X(jogador.x), jy = Y(jogador.y - 20), rj = Math.max(4.2 * dpr, s * 0.9);
  g.fillStyle = "#fff"; g.strokeStyle = "#000"; g.lineWidth = Math.max(1.5, 1.5 * dpr);
  g.beginPath(); g.arc(jx, jy, rj, 0, Math.PI * 2); g.fill(); g.stroke();
  const ang = Math.atan2(dir[1], dir[0]);
  g.beginPath();
  g.moveTo(jx + Math.cos(ang) * rj * 2.2, jy + Math.sin(ang) * rj * 2.2);
  g.lineTo(jx + Math.cos(ang + 2.4) * rj * 1.1, jy + Math.sin(ang + 2.4) * rj * 1.1);
  g.lineTo(jx + Math.cos(ang - 2.4) * rj * 1.1, jy + Math.sin(ang - 2.4) * rj * 1.1);
  g.closePath(); g.fillStyle = "#ffd75e"; g.fill(); g.stroke();

  // nome do lugar (só no mapa ampliado)
  if (grande) {
    const nome = mapinhaNome(MAPINHA.cenaId);
    if (nome) {
      g.font = "bold " + Math.round(16 * dpr) + "px sans-serif";
      const larg = g.measureText(nome).width + 16 * dpr;
      g.fillStyle = "rgba(0,0,0,0.7)"; g.fillRect(8 * dpr, W - 34 * dpr, larg, 26 * dpr);
      g.fillStyle = "#f3e6c8"; g.textAlign = "left"; g.fillText(nome, 16 * dpr, W - 15 * dpr);
    }
  }
}
