/* =====================================================
   jogador.js - Dellalos: estado, vida, movimento e desenho
   ===================================================== */

const jogador = {
  x: 600,           // posição dos PÉS (centro horizontal)
  y: 700,           // posição dos pés (parte de baixo)
  altura: CONFIG.alturaPersonagem,
  direcao: "baixo", // baixo, cima, esquerda ou direita
  quadro: 0,        // qual quadro da animação está sendo mostrado
  tempoAnim: 0,     // cronômetro da animação

  vida: CONFIG.jogador.vidaMax,
  vidaMax: CONFIG.jogador.vidaMax,
  invulneravel: 0,  // segundos restantes sem levar dano
  atacando: 0,      // segundos restantes do golpe (para desenhar)
  recarga: 0,       // segundos até poder golpear de novo
  empurraoT: 0, empurraoX: 0, empurraoY: 0   // empurrão ao levar dano
};

// Vetor de cada direção (usado no ataque)
const DIRECOES = { baixo: [0, 1], cima: [0, -1], esquerda: [-1, 0], direita: [1, 0] };

// Caixa do corpo inteiro (usada para levar dano)
function caixaCorpoJogador() {
  return { x: jogador.x - 18, y: jogador.y - 56, w: 36, h: 56 };
}

// Dellalos leva dano. (origemX/origemY = de onde veio o golpe, para empurrar)
function machucarJogador(dano, origemX, origemY) {
  if (jogador.invulneravel > 0) return;
  jogador.vida -= dano;
  jogador.invulneravel = CONFIG.jogador.invulnerabilidade;

  let dx = jogador.x - origemX, dy = jogador.y - origemY;
  const d = Math.hypot(dx, dy) || 1;
  jogador.empurraoX = (dx / d) * CONFIG.jogador.empurraoVelocidade;
  jogador.empurraoY = (dy / d) * CONFIG.jogador.empurraoVelocidade;
  jogador.empurraoT = CONFIG.jogador.empurraoTempo;

  if (jogador.vida <= 0) desmaiar();
}

// Sem vida: acorda em casa com a vida cheia
function desmaiar() {
  jogador.vida = jogador.vidaMax;
  jogador.invulneravel = 2;
  mostrarMensagem("Você desmaiou e acordou em casa.");
  const s = CENAS.sala.spawn;
  mudarCena("sala", s.x, s.y, "cima");
}

function atualizarJogador(dt) {
  jogador.invulneravel = Math.max(0, jogador.invulneravel - dt);
  jogador.atacando = Math.max(0, jogador.atacando - dt);
  jogador.recarga = Math.max(0, jogador.recarga - dt);

  // Empurrão (ignora os controles por um instante)
  if (jogador.empurraoT > 0) {
    jogador.empurraoT -= dt;
    const px = jogador.empurraoX * dt, py = jogador.empurraoY * dt;
    if (livre(jogador.x + px, jogador.y)) jogador.x += px;
    if (livre(jogador.x, jogador.y + py)) jogador.y += py;
    return;
  }

  let dx = 0, dy = 0;
  if (teclado.left  || toque.left)  dx -= 1;
  if (teclado.right || toque.right) dx += 1;
  if (teclado.up    || toque.up)    dy -= 1;
  if (teclado.down  || toque.down)  dy += 1;

  if (dx === 0 && dy === 0) {
    jogador.quadro = 0;       // parada: primeiro quadro da direção atual
    jogador.tempoAnim = 0;
    return;
  }

  // Diagonal: divide por 1.414 para não ser mais rápida
  if (dx !== 0 && dy !== 0) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }

  if (Math.abs(dx) > Math.abs(dy)) jogador.direcao = dx < 0 ? "esquerda" : "direita";
  else jogador.direcao = dy < 0 ? "cima" : "baixo";

  // Avança a animação de caminhada
  const anim = CONFIG.sprite.animacoes[jogador.direcao];
  jogador.tempoAnim += dt;
  jogador.quadro = Math.floor(jogador.tempoAnim / CONFIG.sprite.tempoPorQuadro) % anim.quadros.length;

  const passoX = dx * CONFIG.velocidade * dt;
  const passoY = dy * CONFIG.velocidade * dt;

  // Move um eixo por vez: assim ela "desliza" na parede em vez de travar
  if (livre(jogador.x + passoX, jogador.y)) jogador.x += passoX;
  if (livre(jogador.x, jogador.y + passoY)) jogador.y += passoY;
}

function desenharJogador() {
  const j = jogador;
  // Piscando enquanto está invulnerável
  if (j.invulneravel > 0 && Math.floor(j.invulneravel * 10) % 2 === 0) return;

  if (dellalosOk) {
    const sp = CONFIG.sprite;
    const qw = folha.width / sp.colunas;
    const qh = folha.height / sp.linhas;
    const anim = sp.animacoes[j.direcao];
    const coluna = anim.quadros[j.quadro % anim.quadros.length];
    const h = j.altura;
    const w = h * (qw / qh);
    ctx.drawImage(folha, coluna * qw, anim.linha * qh, qw, qh,
                  Math.round(j.x - w / 2), Math.round(j.y - h * sp.pes), w, h);
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(j.x - 30, j.y - 60, 60, 60);
    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("sem img", j.x, j.y - 26);
  }
}
