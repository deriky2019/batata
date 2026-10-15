/* =====================================================
   hud.js - Interface desenhada em cima do jogo:
   corações de vida, mensagens e o balãozinho "B"
   ===================================================== */

let mensagem = "";
let mensagemAte = 0;

function mostrarMensagem(texto) {
  mensagem = texto;
  mensagemAte = performance.now() + 2500;
}

// O botão B usa estas duas para avançar/fechar a mensagem na tela
function mensagemVisivel() {
  return performance.now() <= mensagemAte;
}
function fecharMensagem() {
  mensagemAte = 0;
}

function desenharMensagem() {
  if (performance.now() > mensagemAte) return;
  ctx.font = "30px sans-serif";
  ctx.textAlign = "center";
  const largura = Math.min(ctx.measureText(mensagem).width + 48, VIEW_L - 40);
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(VIEW_L / 2 - largura / 2, VIEW_A - 150, largura, 64);
  ctx.fillStyle = "#f3e6c8";
  ctx.fillText(mensagem, VIEW_L / 2, VIEW_A - 108, largura - 24);
}

// Balãozinho "B" sobre a cabeça quando há algo para interagir
function desenharDica() {
  if (!objetoAlcancavel()) return;
  const x = jogador.x;
  const y = jogador.y - jogador.altura * CONFIG.sprite.pes - 16;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f3e6c8";
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("B", x, y + 9);
}

function desenharCoracao(cx, cy, s, cheio) {
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.9);
  ctx.bezierCurveTo(cx - s * 1.3, cy + s * 0.1, cx - s * 0.9, cy - s * 0.9, cx, cy - s * 0.3);
  ctx.bezierCurveTo(cx + s * 0.9, cy - s * 0.9, cx + s * 1.3, cy + s * 0.1, cx, cy + s * 0.9);
  ctx.closePath();
  ctx.fillStyle = cheio ? "#e0463c" : "rgba(0,0,0,0.45)";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#1e1612";
  ctx.stroke();
}

// Corações no canto superior direito (o 🎒 fica no esquerdo)
function desenharVida() {
  for (let n = 0; n < jogador.vidaMax; n++) {
    const x = VIEW_L - 34 - (jogador.vidaMax - 1 - n) * 44;
    desenharCoracao(x, 46, 16, n < jogador.vida);
  }
}

function desenharHud() {
  desenharVida();
  if (!dialogoAberto) desenharMensagem();
}
