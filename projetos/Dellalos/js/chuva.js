/* =====================================================
   chuva.js — clima aleatório, offline e leve.
   A chuva só acontece ao ar livre; pausas e interiores não avançam o clima.
   ===================================================== */
const CLIMA_EXTERIORES = new Set([
  "estrada", "bairro_sul", "bairro_sul2", "zona_leste", "zona_leste2", "zona_norte", "zona_norte2", "zona_oeste", "zona_oeste2"
]);
const climaChuva = {
  ativa: false,
  espera: 32 + Math.random() * 48,
  restante: 0,
  particulas: [],
  acumulador: 0
};

function chuvaAoArLivre() {
  if (typeof cenaAtual === "undefined" || !cenaAtual) return false;
  const id = typeof idDaCena === "function" ? idDaCena(cenaAtual) : "";
  return CLIMA_EXTERIORES.has(id);
}

function atualizarChuva(dt) {
  const C = climaChuva;
  const ativo = typeof jogoRodando === "function" && jogoRodando();
  if (!ativo) return;

  if (!chuvaAoArLivre()) {
    C.ativa = false;
    C.restante = 0;
    C.particulas.length = 0;
    return;
  }

  if (C.ativa) {
    C.restante -= dt;
    if (C.restante <= 0) {
      C.ativa = false;
      C.espera = 55 + Math.random() * 105;
      C.particulas.length = 0;
    }
  } else {
    C.espera -= dt;
    if (C.espera <= 0) {
      // Nem toda janela de clima gera chuva, para o mundo continuar variado.
      if (Math.random() < 0.68) {
        C.ativa = true;
        C.restante = 14 + Math.random() * 25;
      } else {
        C.espera = 35 + Math.random() * 65;
      }
    }
  }

  if (!C.ativa) return;
  const w = typeof VIEW_L === "number" ? VIEW_L : 1200;
  const h = typeof VIEW_A === "number" ? VIEW_A : 896;
  C.acumulador += dt;
  const n = Math.min(18, Math.floor(C.acumulador * 22));
  if (n > 0) {
    C.acumulador = 0;
    for (let i = 0; i < n; i++) {
      C.particulas.push({ x: Math.random() * w, y: -Math.random() * h * 0.25,
        vx: -100 - Math.random() * 90, vy: 480 + Math.random() * 260,
        vida: 0.65 + Math.random() * 0.5, t: 0, len: 9 + Math.random() * 12 });
    }
  }
  for (const p of C.particulas) {
    p.t += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  C.particulas = C.particulas.filter(p => p.t < p.vida && p.y < h + 30 && p.x > -40);
}

function desenharChuva() {
  const C = climaChuva;
  if (!C.ativa || !chuvaAoArLivre()) return;
  ctx.save();
  ctx.setTransform(ESCALA, 0, 0, ESCALA, 0, 0);
  ctx.strokeStyle = "rgba(175, 205, 235, 0.48)";
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  for (const p of C.particulas) {
    const k = Math.min(1, p.t / 0.08);
    if (k <= 0) continue;
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + p.vx * 0.025, p.y + p.len);
  }
  ctx.stroke();
  // Leve véu atmosférico, sem esconder a arte ou a interface.
  ctx.fillStyle = "rgba(90, 125, 160, 0.055)";
  ctx.fillRect(0, 0, VIEW_L, VIEW_A);
  ctx.restore();
}
