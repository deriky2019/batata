/* =====================================================
   inimigos.js - Tipos de inimigo, movimento e desenho
   Para criar um inimigo novo: adicione um tipo em TIPOS_INIMIGOS
   e coloque-o na lista "inimigos" de uma cena (js/salas/...).
   ===================================================== */

const TIPOS_INIMIGOS = {
  slime: {
    nome: "Slime",
    largura: 56, altura: 44,
    vida: 2,
    velocidade: 80,
    deteccao: 300,      // a que distância ele percebe a Dellalos
    dano: 1,
    cor: "#58b848", corEscura: "#2f7a2c"
  }
};

let inimigos = [];   // inimigos vivos da cena atual

function criarInimigo(tipoId, x, y) {
  const t = TIPOS_INIMIGOS[tipoId];
  return { tipoId, tipo: t, x, y, vida: t.vida, flash: 0,
           empurraoT: 0, empurraoX: 0, empurraoY: 0, anim: Math.random() * 6 };
}

// Caixa do corpo inteiro (x,y = pés)
function caixaDoInimigo(i) {
  return { x: i.x - i.tipo.largura / 2, y: i.y - i.tipo.altura, w: i.tipo.largura, h: i.tipo.altura };
}

// Caixa só dos pés (para colidir com paredes)
function caixaPesInimigo(i, x, y) {
  return { x: x - i.tipo.largura / 2, y: y - 24, w: i.tipo.largura, h: 24 };
}

function inimigoLivre(i, x, y) {
  return !temSolido(caixaPesInimigo(i, x, y));
}

function moverInimigo(i, passoX, passoY) {
  if (inimigoLivre(i, i.x + passoX, i.y)) i.x += passoX;
  if (inimigoLivre(i, i.x, i.y + passoY)) i.y += passoY;
}

function machucarInimigo(i, dano) {
  i.vida -= dano;
  i.flash = 0.15;
  const dx = i.x - jogador.x, dy = i.y - jogador.y;
  const d = Math.hypot(dx, dy) || 1;
  i.empurraoX = (dx / d) * 350;
  i.empurraoY = (dy / d) * 350;
  i.empurraoT = 0.15;
}

function atualizarInimigos(dt) {
  for (const i of inimigos) {
    i.anim += dt;
    i.flash = Math.max(0, i.flash - dt);

    if (i.empurraoT > 0) {                       // sendo empurrado
      i.empurraoT -= dt;
      moverInimigo(i, i.empurraoX * dt, i.empurraoY * dt);
      continue;
    }

    const dx = jogador.x - i.x, dy = jogador.y - i.y;
    const d = Math.hypot(dx, dy);
    if (d < i.tipo.deteccao && d > 4) {          // persegue a Dellalos
      moverInimigo(i, (dx / d) * i.tipo.velocidade * dt, (dy / d) * i.tipo.velocidade * dt);
    }
  }
  inimigos = inimigos.filter((i) => i.vida > 0);  // remove os derrotados
}

// Desenho improvisado (formas simples). Depois dá para trocar por imagem.
function desenharInimigo(i) {
  const t = i.tipo;
  const pulo = Math.sin(i.anim * 5) * 3;
  const w = t.largura + pulo, h = t.altura - pulo;

  ctx.fillStyle = "rgba(0,0,0,0.25)";                       // sombra
  ctx.beginPath(); ctx.ellipse(i.x, i.y, t.largura / 2, 8, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = i.flash > 0 ? "#ffffff" : t.cor;           // corpo
  ctx.beginPath(); ctx.ellipse(i.x, i.y - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = t.corEscura; ctx.stroke();

  ctx.fillStyle = "#14110f";                                 // olhos
  ctx.fillRect(i.x - 12, i.y - h / 2 - 6, 6, 10);
  ctx.fillRect(i.x + 6,  i.y - h / 2 - 6, 6, 10);
}
