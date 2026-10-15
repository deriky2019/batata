/* =====================================================
   colisao.js - Funções de colisão (valem para todos)
   Bloqueios vêm de duas fontes da cena atual:
     1) a GRADE do mapa (cenaAtual.mapa.bloq): um 1 por tile bloqueado
     2) cenaAtual.solidos: retângulos soltos (ex.: NPCs)
   ===================================================== */

// Cada retângulo: { x, y, w, h } (canto superior esquerdo + tamanho)
function bate(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// A caixa de colisão da Dellalos: só a região dos pés (estilo Zelda)
const CAIXA_L = 44, CAIXA_A = 26;
function caixaDoJogador(x, y) {
  return { x: x - CAIXA_L / 2, y: y - CAIXA_A, w: CAIXA_L, h: CAIXA_A };
}

// A caixa bate em alguma parede/móvel da cena atual?
function temSolido(caixa) {
  const m = cenaAtual.mapa;
  if (m) {
    const x0 = Math.floor(caixa.x / TILE), x1 = Math.floor((caixa.x + caixa.w - 0.01) / TILE);
    const y0 = Math.floor(caixa.y / TILE), y1 = Math.floor((caixa.y + caixa.h - 0.01) / TILE);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (x < 0 || y < 0 || x >= m.cols || y >= m.rows) return true;   // fora do mapa
        if (m.bloq[y * m.cols + x]) return true;
      }
    }
  }
  for (const s of cenaAtual.solidos) {
    if (bate(caixa, s)) return true;
  }
  return false;
}

// Dellalos pode ficar nessa posição?
function livre(x, y) {
  return !temSolido(caixaDoJogador(x, y));
}
