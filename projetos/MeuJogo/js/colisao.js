/* =====================================================
   colisao.js - Funções de colisão (valem para todos)
   Os sólidos vêm da cena atual: cenaAtual.solidos
   ===================================================== */

// Cada retângulo: { x, y, w, h } (canto superior esquerdo + tamanho)
function bate(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// A caixa de colisão da Dellalos: só a região dos pés (estilo Zelda)
const CAIXA_L = 64, CAIXA_A = 30;
function caixaDoJogador(x, y) {
  return { x: x - CAIXA_L / 2, y: y - CAIXA_A, w: CAIXA_L, h: CAIXA_A };
}

// A caixa bate em alguma parede/móvel da cena atual?
function temSolido(caixa) {
  for (const s of cenaAtual.solidos) {
    if (bate(caixa, s)) return true;
  }
  return false;
}

// Dellalos pode ficar nessa posição?
function livre(x, y) {
  return !temSolido(caixaDoJogador(x, y));
}
