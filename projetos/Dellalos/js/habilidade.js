/* =====================================================
   habilidade.js - Grito espectral (habilidade do grimório: segurar o botão A)
   Aprendida na árvore (nó "grito", js/loja.js). Tocar no A continua sendo o golpe comum; SEGURAR o A por
   HABILIDADE.carga segundos dispara uma onda espectral que machuca e empurra tudo ao redor e apaga tiros inimigos.
   Depois de usar, recarrega por HABILIDADE.recarga segundos e é preciso soltar e apertar o A de novo.
   Só funciona em lugares com combate. Para equilibrar, mude os valores em HABILIDADE.
   ===================================================== */

const HABILIDADE = {
  carga: 0.8,     // segundos segurando o A até disparar
  raio: 280,      // alcance da onda, em pixels (1 tile = 64)
  dano: 3,        // dano em cada inimigo (chefes também levam)
  recarga: 14,    // segundos até poder usar de novo
  duracaoOnda: 0.45
};
const hab = { carga: 0, recarga: 0, onda: 0, travado: false };

// Chamada a cada quadro por js/main.js (o tempo para junto com o jogo)
function atualizarHabilidade(dt) {
  hab.onda = Math.max(0, hab.onda - dt);
  if (hab.recarga > 0) {
    hab.recarga -= dt;
    if (hab.recarga <= 0) {
      hab.recarga = 0;
      if (arvoreTem("grito")) mostrarMensagem("O grito espectral está pronto! Segure o botão A.");
    }
  }
  if (!aSegurando) hab.travado = false;
  if (!arvoreTem("grito") || !cenaAtual.combate || hab.recarga > 0 || hab.travado || !aSegurando || jogador.morto) { hab.carga = 0; return; }
  hab.carga += dt;
  if (hab.carga >= HABILIDADE.carga) dispararGrito();
}

function dispararGrito() {
  hab.carga = 0;
  hab.travado = true;
  hab.recarga = HABILIDADE.recarga;
  hab.onda = HABILIDADE.duracaoOnda;
  const cx = jogador.x, cy = jogador.y - 40;
  for (const i of inimigos) {
    if (i.vida > 0 && Math.hypot(i.x - cx, (i.y - 30) - cy) <= HABILIDADE.raio) machucarInimigo(i, HABILIDADE.dano);
  }
  for (const p of projeteis) if (Math.hypot(p.x - cx, p.y - cy) <= HABILIDADE.raio) p.vida = 0;   // tiros inimigos somem
  faiscas(cx, cy, "#b48cff", 30, 440);
  faiscas(cx, cy, "#ffffff", 12, 300);
  tremer(8, 0.3);
  tocarSom("escudo");
}

// Anel de carga em volta da Dellalos e a onda que se expande (chamada por js/desenho.js)
function desenharHabilidade() {
  if (!arvoreTem("grito")) return;
  const cx = jogador.x, cy = jogador.y - 40;
  ctx.save();
  if (hab.carga > 0) {
    const k = Math.min(1, hab.carga / HABILIDADE.carga);
    ctx.lineWidth = 6; ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(180,140,255," + (0.35 + 0.65 * k) + ")";
    ctx.beginPath(); ctx.arc(cx, cy, 58, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); ctx.stroke();
  }
  if (hab.onda > 0) {
    const t = 1 - hab.onda / HABILIDADE.duracaoOnda;
    ctx.globalAlpha = 1 - t;
    ctx.lineWidth = 16 * (1 - t) + 3;
    ctx.strokeStyle = "#c9a8ff";
    ctx.beginPath(); ctx.arc(cx, cy, HABILIDADE.raio * t, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 4; ctx.strokeStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(cx, cy, HABILIDADE.raio * t * 0.92, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}
