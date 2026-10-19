/* =====================================================
   hud.js - Interface desenhada em cima do jogo:
   corações de vida, mensagens e o balãozinho "B"
   ===================================================== */

let mensagem = "";
let mensagemAte = 0;

function mostrarMensagem(texto) {
  mensagem = texto;
  mensagemAte = performance.now() + Math.max(2500, 1500 + texto.length * 40);   // textos longos ficam mais tempo
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
  const linhas = quebrarTexto(mensagem, VIEW_L - 120);      // quebra em linhas se for longa (js/dialogos.js)
  const largura = Math.min(Math.max(...linhas.map((l) => ctx.measureText(l).width)) + 48, VIEW_L - 40);
  const altura = 26 + linhas.length * 38;
  const topo = VIEW_A - 86 - altura;
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(VIEW_L / 2 - largura / 2, topo, largura, altura);
  ctx.fillStyle = "#f3e6c8";
  linhas.forEach((l, n) => ctx.fillText(l, VIEW_L / 2, topo + 40 + n * 38, largura - 24));
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

function desenharCoracao(cx, cy, s, cheio) {      // cheio: true, false ou 0.5 (meio coração, v84)
  const caminho = function () {
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.9);
    ctx.bezierCurveTo(cx - s * 1.3, cy + s * 0.1, cx - s * 0.9, cy - s * 0.9, cx, cy - s * 0.3);
    ctx.bezierCurveTo(cx + s * 0.9, cy - s * 0.9, cx + s * 1.3, cy + s * 0.1, cx, cy + s * 0.9);
    ctx.closePath();
  };
  caminho();
  ctx.fillStyle = cheio === true ? "#e0463c" : "rgba(0,0,0,0.45)";
  ctx.fill();
  if (cheio === 0.5) {                               // meio coração: só a metade esquerda é pintada
    ctx.save();
    ctx.beginPath(); ctx.rect(cx - s * 2, cy - s * 2, s * 2, s * 4); ctx.clip();
    caminho(); ctx.fillStyle = "#e0463c"; ctx.fill();
    ctx.restore();
  }
  caminho();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#1e1612";
  ctx.stroke();
}

// Corações no canto superior direito (o 🎒 fica no esquerdo)
function desenharVida() {
  for (let n = 0; n < jogador.vidaMax; n++) {
    const x = VIEW_L - 34 - (jogador.vidaMax - 1 - n) * 44;
    const resto = jogador.vida - n;                  // 1 ou mais: cheio; de 0,5 a 1: meio coração
    desenharCoracao(x, 46, 16, resto >= 1 ? true : (resto > 0 ? 0.5 : false));
  }
}

// Barra de fôlego (corrida), embaixo dos corações: só aparece quando não está cheia
function desenharFolego() {
  const j = jogador, max = folegoMax();   // (js/jogador.js)
  if (j.folego >= max && !j.correndo) return;
  const w = Math.min(jogador.vidaMax * 44, 220), h = 10;
  const x = VIEW_L - 18 - w, y = 74;
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = j.cansada ? "#d0453c" : "#f2c14e";
  ctx.fillRect(x, y, w * Math.max(0, j.folego / max), h);
}

// Escudo da armadura pronto (aparece ao lado do fôlego)
function desenharEscudo() {
  ctx.font = "30px sans-serif"; ctx.textAlign = "right";
  if (historia.comprouArmadura) {
    const x = VIEW_L - 18;
    if (jogador.escudo <= 0) {
      ctx.fillText("\u{1F6E1}\uFE0F", x, 118);                      // escudo pronto
    } else {
      // recarregando: ícone apagado + barrinha que enche
      ctx.globalAlpha = 0.35; ctx.fillText("\u{1F6E1}\uFE0F", x, 118); ctx.globalAlpha = 1;
      const p = 1 - jogador.escudo / recargaArmadura();           // js/loja.js
      ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(x - 49, 124, 46, 8);
      ctx.fillStyle = "#7ec8ff"; ctx.fillRect(x - 47, 126, 42 * Math.max(0, Math.min(1, p)), 4);
    }
  }
  if (historia.comprouCapacete) {
    const x = VIEW_L - 18 - (historia.comprouArmadura ? 50 : 0);
    ctx.globalAlpha = jogador.capacete > 0 ? 0.35 : 1;
    ctx.fillText("\u26D1\uFE0F", x, 118);
    ctx.globalAlpha = 1;
  }
}

// Brilho azul na tela quando a armadura bloqueia ou o capacete salva
function desenharFlashEscudo() {
  if (jogador.flashEscudo <= 0) return;
  ctx.fillStyle = "rgba(120,190,255," + Math.min(0.35, jogador.flashEscudo * 0.9) + ")";
  ctx.fillRect(0, 0, VIEW_L, VIEW_A);
}


// Painel de cultivo: progresso, umidade e colheita, visível apenas na Fazenda Sul 2.
function desenharIndicadoresFazenda() {
  if (typeof cenaAtual === "undefined" || !cenaAtual || typeof idDaCena !== "function" || idDaCena(cenaAtual) !== "bairro_sul2") return;
  if (typeof window.obterEstadoFazendaSul !== "function") return;
  const estado = window.obterEstadoFazendaSul();
  if (!estado || !Array.isArray(estado.talhoes)) return;
  const total = estado.talhoes.length;
  const plantados = estado.talhoes.filter(t => t.plantado).length;
  const maduros = estado.talhoes.filter(t => t.plantado && Number(t.crescimento) >= 75).length;
  const colhidos = estado.talhoes.filter(t => t.colhido).length;
  const x = 18, y = 112, w = 310, rowH = 25;
  const h = 76 + total * rowH;
  ctx.save();
  ctx.fillStyle = "rgba(18, 24, 19, 0.88)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "#9eb77a"; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#f2e8c9"; ctx.font = "bold 20px sans-serif";
  ctx.fillText("FAZENDA • CULTIVO", x + 12, y + 18);
  ctx.font = "15px sans-serif"; ctx.fillStyle = "#d8dfc8";
  ctx.fillText("Plantados: " + plantados + "/" + total + "   Prontos: " + maduros, x + 12, y + 42);
  ctx.fillText("Colheitas feitas: " + colhidos, x + 12, y + 61);
  estado.talhoes.forEach((t, i) => {
    const ry = y + 78 + i * rowH;
    const crescimento = Math.max(0, Math.min(1, (Number(t.crescimento) || 0) / 75));
    const umidade = Math.max(0, Math.min(1, (Number(t.umidade) || 0) / 45));
    let status = !t.preparado ? "Terra não preparada" : !t.plantado ? (t.colhido ? "Colhido • pronto p/ replantar" : "Sem sementes") : crescimento >= 1 ? "PRONTO PARA COLHER" : (umidade > 0 ? "Úmido" : "Precisa de água");
    ctx.font = "14px sans-serif";
    ctx.fillStyle = crescimento >= 1 ? "#b9f28b" : umidade > 0 ? "#8bd7f2" : "#f0d6a0";
    ctx.fillText("Canteiro " + t.id + ": " + status, x + 12, ry);
    if (t.plantado) {
      const bx = x + 202, by = ry - 6, bw = 94, bh = 7;
      ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = crescimento >= 1 ? "#7fca58" : "#9acb65"; ctx.fillRect(bx, by, bw * crescimento, bh);
      // Pequena barra azul abaixo indica umidade restante.
      ctx.fillStyle = "rgba(255,255,255,0.14)"; ctx.fillRect(bx, by + 9, bw, 4);
      ctx.fillStyle = "#58bde8"; ctx.fillRect(bx, by + 9, bw * umidade, 4);
    }
  });
  ctx.restore();
}

function desenharHud() {
  desenharIndicadoresFazenda();
  desenharFlashEscudo();
  desenharVida();
  desenharFolego();
  desenharEscudo();
  desenharMoedas();                 // contador de moedas (js/loja.js)
  if (typeof desenharEssencias === "function") desenharEssencias();   // essências dos espíritos, só quando há alguma (js/salas/capela.js)
  desenharDia();                    // "Dia N" no topo (js/dias.js)
  if (!dialogoAberto) desenharMensagem();
}
