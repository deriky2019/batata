/* =====================================================
   audio.js - Sons e música do jogo, TODOS sintetizados (WebAudio).
   Não usa nenhum arquivo de áudio: continua 100% offline e leve.

   COMO USAR
     tocarSom("golpe")        toca um efeito (lista em SONS, logo abaixo)
     tocarTexto("Nathalia")   "bip" de fala; o tom muda conforme quem fala
   COMO AJUSTAR
     SOM.volume               volume geral (0 a 1)
     SONS.nome = function...  crie ou troque um efeito
     MUS.humores              notas e ritmo de cada clima da música
   O botão 🔊/🔇 (canto superior esquerdo) liga e desliga tudo; a escolha fica salva.
   O áudio só começa depois do primeiro toque (regra dos navegadores de celular).
   ===================================================== */

const SOM = {
  ctx: null, mestre: null, sfx: null, mus: null, ruido: null,
  ligado: true,
  volume: 0.6
};
try { if (localStorage.getItem("dellalos_som") === "off") SOM.ligado = false; } catch (e) { }

// ---------- Ligar o áudio (precisa de um toque do jogador) ----------
function iniciarAudio() {
  if (SOM.ctx) {
    if (SOM.ctx.state === "suspended") SOM.ctx.resume();
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try { SOM.ctx = new AC(); } catch (e) { return; }
  const c = SOM.ctx;
  SOM.mestre = c.createGain();
  SOM.mestre.gain.value = SOM.ligado ? SOM.volume : 0;
  const comp = c.createDynamicsCompressor();      // evita estalos quando vários sons tocam juntos
  SOM.mestre.connect(comp); comp.connect(c.destination);
  SOM.sfx = c.createGain(); SOM.sfx.gain.value = 0.9; SOM.sfx.connect(SOM.mestre);
  SOM.mus = c.createGain(); SOM.mus.gain.value = 0.4; SOM.mus.connect(SOM.mestre);

  // 1 segundo de ruído branco, reaproveitado por vários efeitos
  const n = c.sampleRate;
  SOM.ruido = c.createBuffer(1, n, c.sampleRate);
  const d = SOM.ruido.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;

  criarDrone();
}
["pointerdown", "touchend", "keydown", "click"].forEach((ev) =>
  window.addEventListener(ev, iniciarAudio, { passive: true }));

// Celular: com o app escondido o áudio para; ao voltar, retoma
document.addEventListener("visibilitychange", () => {
  if (!SOM.ctx) return;
  if (document.hidden) SOM.ctx.suspend(); else if (SOM.ligado) SOM.ctx.resume();
});

function alternarSom() {
  SOM.ligado = !SOM.ligado;
  try { localStorage.setItem("dellalos_som", SOM.ligado ? "on" : "off"); } catch (e) { }
  if (SOM.mestre) SOM.mestre.gain.setTargetAtTime(SOM.ligado ? SOM.volume : 0, SOM.ctx.currentTime, 0.05);
  atualizarBotaoSom();
}
function atualizarBotaoSom() {
  const b = document.getElementById("btnSom");
  if (b) { b.textContent = SOM.ligado ? "\u{1F50A}" : "\u{1F507}"; b.setAttribute("aria-label", SOM.ligado ? "Desligar som" : "Ligar som"); }
}
(function () {
  const b = document.getElementById("btnSom");
  if (!b) return;
  b.addEventListener("click", (e) => { e.preventDefault(); iniciarAudio(); alternarSom(); });
  atualizarBotaoSom();
})();

// ---------- Peças básicas ----------
// Nota/tom: freq (Hz) -> fim (opcional) em "dur" segundos
function tom(freq, dur, tipo, vol, o) {
  const c = SOM.ctx; o = o || {};
  const t = c.currentTime + (o.atraso || 0);
  const osc = c.createOscillator();
  osc.type = tipo || "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (o.fim) osc.frequency.exponentialRampToValueAtTime(o.fim, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + (o.ataque || 0.006));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(o.destino || SOM.sfx);
  osc.start(t); osc.stop(t + dur + 0.03);
}

// Ruído filtrado: filtro = "lowpass" | "highpass" | "bandpass", f -> fFim varre a frequência
function ruido(dur, vol, o) {
  const c = SOM.ctx; o = o || {};
  const t = c.currentTime + (o.atraso || 0);
  const src = c.createBufferSource();
  src.buffer = SOM.ruido;
  src.loop = true;
  const f = c.createBiquadFilter();
  f.type = o.filtro || "lowpass";
  f.frequency.setValueAtTime(o.f || 1000, t);
  if (o.fFim) f.frequency.exponentialRampToValueAtTime(o.fFim, t + dur);
  f.Q.value = o.q || 0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + (o.ataque || 0.004));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(o.destino || SOM.sfx);
  src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.03);
}

// ---------- Efeitos ----------
const SONS = {
  golpe:    () => ruido(0.14, 0.22, { filtro: "bandpass", f: 800, fFim: 2800, q: 0.9 }),
  acerto:   () => { tom(190, 0.13, "square", 0.2, { fim: 60 }); ruido(0.09, 0.28, { filtro: "lowpass", f: 2600, fFim: 500 }); },
  inimigoMorre: () => { tom(440, 0.3, "square", 0.16, { fim: 80 }); ruido(0.22, 0.2, { filtro: "lowpass", f: 1800, fFim: 250 }); },
  dano:     () => { tom(230, 0.32, "sawtooth", 0.26, { fim: 65 }); ruido(0.16, 0.25, { filtro: "lowpass", f: 1300, fFim: 250 }); },
  esquiva:  () => ruido(0.2, 0.2, { filtro: "highpass", f: 1000, fFim: 4200, q: 0.5 }),
  esquivaPerfeita: () => { tom(880, 0.12, "triangle", 0.16); tom(1320, 0.2, "triangle", 0.15, { atraso: 0.07 }); },
  falha:    () => tom(150, 0.12, "square", 0.1, { fim: 100 }),
  escudo:   () => { tom(1250, 0.4, "sine", 0.18); tom(1880, 0.32, "sine", 0.1, { atraso: 0.012 }); ruido(0.06, 0.14, { filtro: "highpass", f: 3200 }); },
  moeda:    () => { tom(988, 0.08, "square", 0.1); tom(1319, 0.2, "square", 0.1, { atraso: 0.07 }); },
  compra:   () => { tom(660, 0.09, "triangle", 0.14); tom(880, 0.09, "triangle", 0.14, { atraso: 0.08 }); tom(1175, 0.22, "triangle", 0.14, { atraso: 0.16 }); },
  porta:    () => { ruido(0.22, 0.16, { filtro: "lowpass", f: 600, fFim: 180 }); tom(120, 0.2, "triangle", 0.16, { fim: 70 }); },
  clique:   () => tom(680, 0.05, "square", 0.06),
  tiro:     () => tom(760, 0.2, "sawtooth", 0.09, { fim: 230 }),
  alerta:   () => { tom(320, 0.09, "square", 0.1); tom(320, 0.09, "square", 0.1, { atraso: 0.13 }); },
  passo:    () => ruido(0.05, 0.045, { filtro: "lowpass", f: 600 + Math.random() * 350, q: 0.8 }),
  batida:   () => { tom(72, 0.2, "sine", 0.3, { fim: 42 }); tom(66, 0.2, "sine", 0.24, { fim: 40, atraso: 0.17 }); },
  morte:    () => { tom(320, 1.1, "sawtooth", 0.2, { fim: 38 }); tom(160, 1.3, "sine", 0.2, { fim: 28 }); ruido(0.7, 0.12, { filtro: "lowpass", f: 900, fFim: 120 }); },
  renascer: () => { [392, 523, 659, 784].forEach((f, k) => tom(f, 0.4, "triangle", 0.12, { atraso: k * 0.11 })); }
};

const ultimoSom = {};
function tocarSom(nome) {
  if (!SOM.ctx || !SOM.ligado || SOM.ctx.state !== "running") return;
  const agora = performance.now();
  if (agora - (ultimoSom[nome] || 0) < 45) return;      // evita metralhar o mesmo som
  ultimoSom[nome] = agora;
  try { if (SONS[nome]) SONS[nome](); } catch (e) { }
}

// "Bip" de fala nos diálogos: cada personagem tem o seu tom
function tocarTexto(quem) {
  if (!SOM.ctx || !SOM.ligado || SOM.ctx.state !== "running") return;
  let h = 0;
  for (const ch of String(quem || "")) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const base = 230 + (h % 8) * 38;
  try { tom(base * (1 + Math.random() * 0.07), 0.045, "square", 0.04); } catch (e) { }
}

// ---------- Música ambiente (gerada na hora) ----------
// Humores: "calmo" (cidade, casas), "tenso" (norte, oeste, fábrica...), "luta" (inimigo por perto), "silencio" (morta)
const MUS = {
  humor: "calmo", proximo: 0, passo: 0,
  drone: null, droneGanho: null,
  cenaRef: null, cenaId: "",
  // escala menor pentatônica (A): notas suaves do clima calmo
  notasCalmo: [220, 261.63, 293.66, 329.63, 392, 440, 523.25],
  // notas "erradas" do clima tenso (intervalos tristes/dissonantes)
  notasTenso: [110, 116.54, 164.81, 174.61, 207.65]
};

function criarDrone() {
  const c = SOM.ctx;
  const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 240;
  MUS.droneGanho = c.createGain(); MUS.droneGanho.gain.value = 0;
  [55, 55.7].forEach((fr) => {
    const o = c.createOscillator(); o.type = "sawtooth"; o.frequency.value = fr;
    o.connect(f); o.start();
  });
  f.connect(MUS.droneGanho); MUS.droneGanho.connect(SOM.mus);
}

function humorAtual() {
  if (typeof jogador !== "undefined" && jogador.morto) return "silencio";
  if (typeof menuAberto !== "undefined" && menuAberto) return "calmo";
  if (typeof cenaAtual === "undefined" || !cenaAtual) return "calmo";
  if (cenaAtual !== MUS.cenaRef) {
    MUS.cenaRef = cenaAtual;
    MUS.cenaId = (typeof idDaCena === "function" && idDaCena(cenaAtual)) || "";
  }
  if (cenaAtual.combate) {
    const perto = inimigos.some((i) => i.vida > 0 && !i.etereo && Math.hypot(i.x - jogador.x, i.y - jogador.y) < 380);
    if (perto) return "luta";
  }
  const noite = typeof cicloEhNoite === "function" && cicloEhNoite();     // de noite a música fica tensa (js/ciclo.js)
  return noite || /norte|capela|oeste|mans|fabrica|leste/.test(MUS.cenaId) ? "tenso" : "calmo";
}

function atualizarMusica() {
  if (!SOM.ctx || SOM.ctx.state !== "running" || !SOM.ligado) return;
  const c = SOM.ctx, t = c.currentTime;
  const h = humorAtual();
  if (h !== MUS.humor) { MUS.humor = h; MUS.passo = 0; }

  // drone grave: só nos climas tenso e luta
  const alvoDrone = h === "tenso" ? 0.1 : h === "luta" ? 0.12 : 0;
  MUS.droneGanho.gain.setTargetAtTime(alvoDrone, t, 0.8);
  SOM.mus.gain.setTargetAtTime(h === "silencio" ? 0 : 0.4, t, 0.4);

  if (MUS.proximo === 0 || t - MUS.proximo > 1) MUS.proximo = t + 0.1;   // voltou de uma pausa: recomeça
  if (t < MUS.proximo) return;

  if (h === "calmo") {
    if (Math.random() < 0.6) {
      const n = MUS.notasCalmo[(Math.random() * MUS.notasCalmo.length) | 0];
      tom(n, 2.4, "triangle", 0.1, { ataque: 0.05, destino: SOM.mus });
      if (Math.random() < 0.25) tom(n / 2, 3, "sine", 0.08, { ataque: 0.2, destino: SOM.mus });
    }
    MUS.proximo = t + 1.7 + Math.random() * 1.8;
  } else if (h === "tenso") {
    if (Math.random() < 0.55) {
      const n = MUS.notasTenso[(Math.random() * MUS.notasTenso.length) | 0];
      tom(n, 4.5, "sine", 0.12, { ataque: 0.6, destino: SOM.mus });
    }
    MUS.proximo = t + 3.5 + Math.random() * 3.5;
  } else if (h === "luta") {
    // pulso de 16avos (0,24 s): bumbo nos tempos 1 e 3, chiado nos outros
    const p = MUS.passo++ % 8;
    if (p === 0 || p === 4) tom(95, 0.18, "sine", 0.22, { fim: 42, destino: SOM.mus });
    else if (p % 2 === 0) ruido(0.04, 0.05, { filtro: "highpass", f: 6000, destino: SOM.mus });
    if (p === 6) tom(MUS.notasTenso[(Math.random() * 5) | 0] * 2, 0.35, "square", 0.04, { destino: SOM.mus });
    MUS.proximo = t + 0.24;
  } else {
    MUS.proximo = t + 0.5;
  }
}

// Qualquer botão de interface (menos os do jogo) faz um "clique"
document.addEventListener("pointerdown", (e) => {
  const b = e.target.closest && e.target.closest("button");
  if (!b || b.classList.contains("dir") || b.id === "botaoA" || b.id === "botaoB" || b.id === "botaoC") return;
  tocarSom("clique");
}, true);
