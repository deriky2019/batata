/* =====================================================
   combate.js - Ataque da Dellalos e dano por contato
   ===================================================== */

// Área do golpe, na frente da Dellalos
function caixaDeAtaque() {
  const c = CONFIG.combate;
  const [dx, dy] = DIRECOES[jogador.direcao];
  const cx = jogador.x + dx * c.alcance;
  const cy = jogador.y - 40 + dy * c.alcance;
  return { x: cx - c.tamanho / 2, y: cy - c.tamanho / 2, w: c.tamanho, h: c.tamanho };
}

function iniciarAtaque() {
  if (jogador.recarga > 0) return;
  jogador.atacando = CONFIG.combate.duracao;
  jogador.recarga = CONFIG.combate.recarga;

  const area = caixaDeAtaque();
  for (const i of inimigos) {
    if (i.vida > 0 && bate(area, caixaDoInimigo(i))) machucarInimigo(i, CONFIG.combate.dano);
  }
}

// Inimigo encostou na Dellalos = dano
function atualizarCombate(dt) {
  const corpo = caixaCorpoJogador();
  for (const i of inimigos) {
    if (i.vida > 0 && bate(corpo, caixaDoInimigo(i))) {
      machucarJogador(i.tipo.dano, i.x, i.y);
    }
  }
}

// Efeito visual do golpe (um arco)
function desenharAtaque() {
  if (jogador.atacando <= 0) return;
  const c = CONFIG.combate;
  const [dx, dy] = DIRECOES[jogador.direcao];
  const ang = Math.atan2(dy, dx);
  const t = jogador.atacando / c.duracao;

  ctx.save();
  ctx.globalAlpha = t;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#fff4c2";
  ctx.lineWidth = 14;
  ctx.beginPath(); ctx.arc(jogador.x, jogador.y - 40, c.alcance, ang - 0.9, ang + 0.9); ctx.stroke();
  ctx.strokeStyle = "#e6b450";
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(jogador.x, jogador.y - 40, c.alcance, ang - 0.9, ang + 0.9); ctx.stroke();
  ctx.restore();
}
