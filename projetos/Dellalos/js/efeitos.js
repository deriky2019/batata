/* =====================================================
   efeitos.js - "Sensação" do combate + esquiva (botão C)
   - Parada rápida ao acertar (hit-stop), tremor de tela, faíscas e números de dano
   - Flash vermelho ao levar dano e vinheta pulsando com 1 coração
   - Esquiva (botão C no celular, tecla K no teclado): arrancada curta, invulnerável por um instante,
     gasta fôlego; se um golpe passar enquanto ela esquiva, ganha "Esquiva!" e recupera um pouco de fôlego
   - Avisos de ataque: "!" vermelho e linha da investida
   - Passos, batimento cardíaco com pouca vida, alerta sonoro dos inimigos e a música (js/audio.js)
   Valores da esquiva: CONFIG.esquiva (js/config.js).
   Quem sente enjoo com movimento: se o aparelho estiver em "reduzir movimento", tremor e parada ficam desligados.
   ===================================================== */

const REDUZIR_MOVIMENTO = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

const efeitos = {
  parada: 0,                       // segundos de "congelamento" restantes (lido por js/main.js)
  tremorT: 0, tremorDur: 0, tremorForca: 0, tremX: 0, tremY: 0,
  particulas: [], numeros: [], rastros: [],
  flashDano: 0,
  esqPerfT: 0, rastroT: 0,
  passoAcum: 0, ultX: 0, ultY: 0, ultCena: null,
  batidaT: 0,
  semCombate: null
};

function pararTempo(seg) { if (!REDUZIR_MOVIMENTO) efeitos.parada = Math.max(efeitos.parada, seg); }
function tremer(forca, dur) {
  if (REDUZIR_MOVIMENTO) return;
  if (forca >= efeitos.tremorForca * (efeitos.tremorT / (efeitos.tremorDur || 1))) {
    efeitos.tremorForca = forca; efeitos.tremorT = dur; efeitos.tremorDur = dur;
  }
}

function faiscas(x, y, cor, n, vel) {
  for (let k = 0; k < n; k++) {
    const a = Math.random() * Math.PI * 2, v = vel * (0.35 + Math.random() * 0.8);
    efeitos.particulas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 50, t: 0,
                              vida: 0.28 + Math.random() * 0.25, r: 3 + Math.random() * 4, cor });
  }
}
function numeroFlutuante(x, y, texto, cor, tam) {
  efeitos.numeros.push({ x: x + (Math.random() * 16 - 8), y, texto, cor: cor || "#fff", tam: tam || 30, t: 0, vida: 0.8 });
}

// ---------- Eventos de combate (chamados por inimigos.js, jogador.js e loja.js) ----------
function efeitoAcerto(i, dano) {
  const x = i.x, y = i.y - (i.tipo.altura || 50) * 0.6;
  faiscas(x, y, "#fff4c2", 6, 280);
  faiscas(x, y, i.tipo.cor || "#ffffff", 5, 210);
  numeroFlutuante(x, y - 24, String(dano), dano >= 3 ? "#ffb347" : "#ffffff", dano >= 3 ? 36 : 30);
  pararTempo(0.05);
  tremer(2.5, 0.1);
  tocarSom("acerto");
}

function efeitoMorteInimigo(i) {
  const x = i.x, y = i.y - (i.tipo.altura || 50) * 0.5;
  const grande = !!(i.tipo.pesado || i.tipo.chefe);
  faiscas(x, y, i.tipo.cor || "#ffffff", grande ? 26 : 14, 340);
  faiscas(x, y, "#fff4c2", grande ? 12 : 6, 240);
  pararTempo(grande ? 0.16 : 0.09);
  tremer(grande ? 9 : 5, grande ? 0.35 : 0.18);
  tocarSom("inimigoMorre");
}

function efeitoDanoJogador(dano) {
  efeitos.flashDano = 0.35;
  faiscas(jogador.x, jogador.y - 50, "#e0463c", 9, 260);
  numeroFlutuante(jogador.x, jogador.y - 130, "-" + dano, "#ff5a4d", 34);
  pararTempo(0.08);
  tremer(7, 0.22);
  tocarSom("dano");
}

function efeitoEsquivaPerfeita() {
  const agora = performance.now();
  if (agora - efeitos.esqPerfT < 700) return;
  efeitos.esqPerfT = agora;
  numeroFlutuante(jogador.x, jogador.y - 140, "Esquiva!", "#8fe3ff", 28);
  faiscas(jogador.x, jogador.y - 50, "#8fe3ff", 8, 220);
  jogador.folego = Math.min(folegoMax(), jogador.folego + CONFIG.esquiva.bonusPerfeita);
  tocarSom("esquivaPerfeita");
}

// ---------- Esquiva ----------
function tentarEsquiva() {
  const E = CONFIG.esquiva, j = jogador;
  if (!cenaAtual.combate || j.morto) return;
  if (j.esquiva > 0 || j.esquivaRecarga > 0 || j.empurraoT > 0) return;
  if (j.folego < E.custo) { tocarSom("falha"); return; }

  let dx = 0, dy = 0;
  if (teclado.left || toque.left) dx -= 1;
  if (teclado.right || toque.right) dx += 1;
  if (teclado.up || toque.up) dy -= 1;
  if (teclado.down || toque.down) dy += 1;
  if (!dx && !dy) { const f = DIRECOES[j.direcao]; dx = -f[0]; dy = -f[1]; }   // parada: pula para trás
  const n = Math.hypot(dx, dy) || 1;
  j.esqX = dx / n; j.esqY = dy / n;

  j.esquiva = E.duracao;
  j.invEsquiva = E.invulnerab;
  j.esquivaRecarga = E.recarga;
  j.folego -= E.custo;
  j.esperaFolego = Math.max(j.esperaFolego, 0.6);
  j.correndo = false;
  efeitos.rastroT = 0;
  faiscas(j.x, j.y - 4, "#c8b89a", 5, 120);   // poeirinha nos pés
  tocarSom("esquiva");
}

// Chamado por atualizarJogador enquanto a esquiva dura
function moverEsquiva(dt) {
  const E = CONFIG.esquiva, j = jogador;
  const passo = Math.min(dt, j.esquiva);
  j.esquiva -= dt;
  const v = E.distancia / E.duracao;
  const px = j.esqX * v * passo, py = j.esqY * v * passo;
  if (livre(j.x + px, j.y)) j.x += px;
  if (livre(j.x, j.y + py)) j.y += py;
  j.quadro = 1; j.tempoAnim = 0;
  efeitos.rastroT -= dt;
  if (efeitos.rastroT <= 0) {
    efeitos.rastroT = 0.035;
    efeitos.rastros.push({ x: j.x, y: j.y, dir: j.direcao, quadro: j.quadro, t: 0, vida: 0.28 });
  }
}

// ---------- Atualização (a cada quadro, mesmo com o jogo pausado) ----------
function jogoRodando() {
  return !menuAberto && !jogador.morto && !dialogoAberto && !inventarioAberto && !lojaAberta && !telaTempo && !transicao;
}

function atualizarEfeitos(dt) {
  const E = efeitos;
  E.flashDano = Math.max(0, E.flashDano - dt);

  // tremor
  if (E.tremorT > 0) {
    E.tremorT -= dt;
    const f = E.tremorForca * Math.max(0, E.tremorT / (E.tremorDur || 1));
    E.tremX = Math.round((Math.random() * 2 - 1) * f);
    E.tremY = Math.round((Math.random() * 2 - 1) * f);
  } else { E.tremX = 0; E.tremY = 0; E.tremorForca = 0; }

  // partículas, números e rastros
  for (const p of E.particulas) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 520 * dt; }
  E.particulas = E.particulas.filter((p) => p.t < p.vida);
  for (const n of E.numeros) { n.t += dt; n.y -= 58 * dt; }
  E.numeros = E.numeros.filter((n) => n.t < n.vida);
  for (const r of E.rastros) r.t += dt;
  E.rastros = E.rastros.filter((r) => r.t < r.vida);

  const ativo = jogoRodando();

  // avisos sonoros: o inimigo mudou para um estado de preparação de ataque
  for (const i of inimigos) {
    if (i.estado !== i._estAnt) {
      i._estAnt = i.estado;
      if (ativo && (i.estado === "aviso" || i.estado === "leque" || i.estado === "anel") && Math.hypot(i.x - jogador.x, i.y - jogador.y) < 520) tocarSom("alerta");
    }
  }

  // passos
  if (!ativo || cenaAtual !== E.ultCena) {
    E.ultCena = cenaAtual; E.ultX = jogador.x; E.ultY = jogador.y;
  } else {
    const d = Math.hypot(jogador.x - E.ultX, jogador.y - E.ultY);
    E.ultX = jogador.x; E.ultY = jogador.y;
    if (d < 80) {
      E.passoAcum += d;
      if (E.passoAcum > 62) { E.passoAcum = 0; if (jogador.esquiva <= 0) tocarSom("passo"); }
    }
  }

  // batimento cardíaco com 1 coração (menos no treino com o Lucas, que sempre termina assim)
  if (ativo && jogador.vida <= 1 && jogador.vidaMax > 1 && !(typeof duelando === "function" && duelando())) {
    E.batidaT -= dt;
    if (E.batidaT <= 0) { tocarSom("batida"); E.batidaT = 1.1; }
  } else { E.batidaT = 0.3; }

  // botão C só aparece onde há combate
  const sem = !(cenaAtual && cenaAtual.combate);
  if (sem !== E.semCombate) { E.semCombate = sem; document.body.classList.toggle("sem-combate", sem); }

  atualizarMusica();   // js/audio.js
}

// ---------- Desenho ----------
// Rastro da esquiva (por baixo dos personagens)
function desenharRastros() {
  if (!efeitos.rastros.length || !dellalosOk) return;
  const sp = CONFIG.sprite;
  const qw = folha.width / sp.colunas, qh = folha.height / sp.linhas;
  const h = jogador.altura, w = h * (qw / qh);
  ctx.save();
  for (const r of efeitos.rastros) {
    const anim = sp.animacoes[r.dir];
    const col = anim.quadros[r.quadro % anim.quadros.length];
    ctx.globalAlpha = 0.4 * (1 - r.t / r.vida);
    ctx.drawImage(folha, col * qw, anim.linha * qh, qw, qh, Math.round(r.x - w / 2), Math.round(r.y - h * sp.pes), w, h);
  }
  ctx.restore();
}

// Avisos de ataque: linha da investida + "!" sobre o inimigo
function desenharTelegrafos() {
  const t = performance.now() / 1000;
  for (const i of inimigos) {
    if (i.vida <= 0) continue;
    const e = i.estado;
    if (e !== "aviso" && e !== "leque" && e !== "anel") continue;
    if (e === "aviso" && i.dirX !== undefined) {
      const tp = i.tipo;
      const comp = tp.investidaVelocidade && tp.investidaTempo ? tp.investidaVelocidade * tp.investidaTempo : 280;
      ctx.save();
      ctx.globalAlpha = 0.2 + 0.16 * Math.abs(Math.sin(t * 14));
      ctx.strokeStyle = "#ff3b2e"; ctx.lineWidth = 44; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(i.x, i.y - 8); ctx.lineTo(i.x + i.dirX * comp, i.y - 8 + i.dirY * comp); ctx.stroke();
      ctx.restore();
    }
    const y = i.y - (i.tipo.altura || 60) - 28 - Math.abs(Math.sin(t * 12)) * 4;
    ctx.fillStyle = "#d8281c"; ctx.beginPath(); ctx.arc(i.x, y, 16, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = "#fff"; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "bold 24px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("!", i.x, y + 8);
  }
}

// Faíscas e números (por cima de todos, no mundo)
function desenharEfeitos() {
  desenharTelegrafos();
  for (const p of efeitos.particulas) {
    ctx.globalAlpha = Math.max(0, 1 - p.t / p.vida);
    ctx.fillStyle = p.cor;
    const s = p.r * (1 - 0.5 * p.t / p.vida);
    ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s);
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = "center";
  for (const n of efeitos.numeros) {
    const pop = 1 + 0.45 * Math.max(0, 1 - n.t * 9);
    ctx.globalAlpha = Math.min(1, (n.vida - n.t) * 3.5);
    ctx.font = "bold " + Math.round(n.tam * pop) + "px sans-serif";
    ctx.lineWidth = 6; ctx.strokeStyle = "rgba(0,0,0,0.85)"; ctx.lineJoin = "round";
    ctx.strokeText(n.texto, n.x, n.y);
    ctx.fillStyle = n.cor;
    ctx.fillText(n.texto, n.x, n.y);
  }
  ctx.globalAlpha = 1;
}

// Flash vermelho ao levar dano + vinheta pulsando com pouca vida (na tela, depois do HUD)
function desenharFlashDano() {
  let a = 0;
  if (efeitos.flashDano > 0) a = Math.min(0.5, efeitos.flashDano * 1.4);
  const pouca = jogoRodando() && jogador.vida <= 1 && jogador.vidaMax > 1 && !(typeof duelando === "function" && duelando());
  if (pouca) a = Math.max(a, 0.12 + 0.07 * Math.sin(performance.now() / 260));
  if (a <= 0) return;
  const g = ctx.createRadialGradient(VIEW_L / 2, VIEW_A / 2, Math.min(VIEW_L, VIEW_A) * 0.3, VIEW_L / 2, VIEW_A / 2, Math.max(VIEW_L, VIEW_A) * 0.65);
  g.addColorStop(0, "rgba(200,20,20,0)");
  g.addColorStop(1, "rgba(200,20,20," + a + ")");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_L, VIEW_A);
}
