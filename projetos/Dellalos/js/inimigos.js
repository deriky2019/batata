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
  },
  // Criatura preta da sala 1A (DIA_1A). Só aparece pela história (js/chave1a.js); não conta como slime.
  sombra: {
    nome: "Sombra",
    largura: 72, altura: 92,
    vida: 6,
    velocidade: 95,
    deteccao: 700,
    dano: 1,
    cor: "#17101f", corEscura: "#7a4aa8", corOlhos: "#f3e6c8",
    aoMorrer: function () { historia.matouSombra = true; }
  },

  // Demônio: escapou do selo quebrado (js/salas/mansao.js) e anda pelas estradas e pela Zona Oeste. Usa o desenho padrão (corpo + olhos).
  demonio: {
    nome: "Demônio",
    largura: 66, altura: 88,
    vida: 5,
    velocidade: 105,
    deteccao: 650,
    dano: 1,
    moedas: [3, 6],
    cor: "#7d1414", corEscura: "#ff5a2a", corOlhos: "#ffd86b"
  },

  // Sombra da 3B (noite do dia 4; js/dias.js): igual à da 1A, mas com a própria flag
  sombra_noite: {
    nome: "Sombra",
    largura: 72, altura: 92,
    vida: 6,
    velocidade: 95,
    deteccao: 700,
    dano: 1,
    cor: "#17101f", corEscura: "#7a4aa8", corOlhos: "#f3e6c8",
    aoMorrer: function () { historia.matouSombraNoite = true; }
  },

  // ---------- Zona Leste (js/salas/zonaleste.js e js/salas/fabrica.js) ----------
  // ia: "perseguir" (padrão) | "atirador" | "investida" | "chefe"
  // moedas: [mínimo, máximo] que ele solta ao ser derrotado (padrão dos slimes: 1 a 3)
  rato: {                                  // rápido e frágil, sempre em bando
    nome: "Rato de esgoto",
    largura: 44, altura: 28,
    vida: 2, velocidade: 150, deteccao: 360, dano: 1,
    ia: "perseguir", moedas: [1, 2],
    cor: "#8a8478", corEscura: "#4a463e"
  },
  vigia: {                                 // robô de segurança: mantém distância e atira
    nome: "Robô vigia",
    largura: 50, altura: 62,
    vida: 3, velocidade: 60, deteccao: 520, dano: 1,
    ia: "atirador", moedas: [2, 4],
    tiroIntervalo: 2.3, tiroVelocidade: 270, tiroDano: 1,
    cor: "#7a8a9a", corEscura: "#37424e"
  },
  sucateiro: {                             // bruto de sucata: avisa e dispara numa investida
    nome: "Sucateiro",
    largura: 74, altura: 92,
    vida: 7, velocidade: 62, deteccao: 420, dano: 2,
    ia: "investida", moedas: [4, 6],
    avisoTempo: 0.65, investidaTempo: 0.5, investidaVelocidade: 430, descanso: 1.1,
    cor: "#9a6a3a", corEscura: "#4a2e18"
  },
  espirito: {                              // Zona Norte: solta uma ESSÊNCIA ao desaparecer (o altar do Caos pede 10; js/salas/capela.js). Renasce a cada visita
    nome: "Espírito",
    largura: 46, altura: 70,
    vida: 3, velocidade: 78, deteccao: 400, dano: 1,
    ia: "espirito", renasce: true, moedas: [0, 0],
    cor: "#b9c6ff", corEscura: "#5a63a8",
    aoMorrer: function (i) { espiritoDerrotado(i); }  // (js/salas/capela.js)
  },
  lucas: {                                 // Lucas no treino da Zona Leste: ninguém o derrota; o treino acaba quando a Dellalos fica com 1 coração
    nome: "Lucas",
    largura: 52, altura: 92,
    vida: 9999, velocidade: 135, deteccao: 4000, dano: 1,
    ia: "duelo", duelo: true, moedas: [0, 0],
    alcanceAviso: 140, avisoTempo: 0.45, investidaTempo: 0.28, investidaVelocidade: 430, descanso: 0.85,
    cor: "#4a5a8a", corEscura: "#1e2a4a",
    aoMorrer: function (i) { lucasFimDoDuelo(i); }    // (js/salas/zonaleste.js)
  },
  gaby: {                                  // dia 9, Zona Leste: aluna controlada pela Isabela (js/salas/zonaleste.js). Ao cair, a Dellalos decide o destino dela
    nome: "Gaby",
    largura: 52, altura: 92,
    vida: 12, velocidade: 105, deteccao: 600, dano: 1,
    ia: "gaby", chefe: true, moedas: [0, 0],
    alcanceAviso: 150, avisoTempo: 0.5, investidaTempo: 0.3, investidaVelocidade: 440, descanso: 0.85,
    cor: "#b03a3a", corEscura: "#5a1c1c",
    aoMorrer: function (i) { gabyCaiu(i); }     // (js/salas/zonaleste.js)
  },
  capataz: {                               // chefe da fábrica
    nome: "Capataz Mecânico",
    largura: 112, altura: 128,
    vida: 26, velocidade: 58, deteccao: 460, dano: 2,
    ia: "chefe", pesado: true, moedas: [20, 20], chefe: true,
    cor: "#d49a2a", corEscura: "#5a3e10"
  }
};

let inimigos = [];   // inimigos vivos da cena atual

function criarInimigo(tipoId, x, y, idx) {
  const t = TIPOS_INIMIGOS[tipoId];
  return { tipoId, tipo: t, x, y, idx, vida: t.vida, flash: 0,
           empurraoT: 0, empurraoX: 0, empurraoY: 0, anim: Math.random() * 6,
           dir: 1, estado: "andar", espera: 1 + Math.random(), tempo: 0, tiro: 1 + Math.random() * 1.5,
           dirX: 0, dirY: 0, solta: null, fase2: false, apresentado: false };
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

// Se o inimigo nasceu dentro de árvore/parede, procura o lugar livre mais próximo (em círculos)
function posicionarInimigoLivre(i) {
  if (inimigoLivre(i, i.x, i.y)) return;
  const x0 = i.x, y0 = i.y;
  for (let r = 16; r <= 320; r += 16) {
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * Math.PI * 2;
      const x = x0 + Math.cos(ang) * r, y = y0 + Math.sin(ang) * r;
      if (inimigoLivre(i, x, y)) { i.x = x; i.y = y; return; }
    }
  }
}

function moverInimigo(i, passoX, passoY) {
  if (inimigoLivre(i, i.x + passoX, i.y)) i.x += passoX;
  if (inimigoLivre(i, i.x, i.y + passoY)) i.y += passoY;
}

function machucarInimigo(i, dano) {
  if (i.etereo) return;                              // espírito na fase etérea: o golpe atravessa
  i.vida -= dano;
  i.flash = 0.15;
  efeitoAcerto(i, dano);                             // faíscas, número, parada e som (js/efeitos.js)
  const dx = i.x - jogador.x, dy = i.y - jogador.y;
  const d = Math.hypot(dx, dy) || 1;
  if (i.tipo.pesado) return;                         // chefe: não sai do lugar quando apanha
  i.empurraoX = (dx / d) * 350;
  i.empurraoY = (dy / d) * 350;
  i.empurraoT = 0.15;
  if (i.estado === "aviso" || i.estado === "carga") { i.estado = "descanso"; i.espera = 0.5; }   // golpe corta a investida
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
    if (Math.abs(dx) > 6) i.dir = dx < 0 ? -1 : 1;
    const ia = i.tipo.ia || "perseguir";
    if (ia === "atirador") iaAtirador(i, dt, dx, dy, d);
    else if (ia === "investida") iaInvestida(i, dt, dx, dy, d);
    else if (ia === "chefe") iaChefe(i, dt, dx, dy, d);
    else if (ia === "duelo") iaDuelo(i, dt, dx, dy, d);
    else if (ia === "gaby") iaGaby(i, dt, dx, dy, d);
    else if (ia === "espirito") iaEspirito(i, dt, dx, dy, d);
    else if (d < i.tipo.deteccao && d > 4) {     // persegue a Dellalos
      moverInimigo(i, (dx / d) * i.tipo.velocidade * dt, (dy / d) * i.tipo.velocidade * dt);
    }
  }
  // remove os derrotados e lembra deles (não voltam ao reentrar na cena; js/cena.js)
  for (const i of inimigos) {
    if (i.vida <= 0 && i.idx !== undefined && !i.tipo.renasce) {   // (espíritos renascem a cada visita)
      if (!cenaAtual._derrotados) cenaAtual._derrotados = new Set();
      cenaAtual._derrotados.add(i.idx);
    }
    if (i.vida <= 0) {
      if (!i.tipo.duelo) efeitoMorteInimigo(i);   // (js/efeitos.js)
      if (i.tipo.aoMorrer) i.tipo.aoMorrer(i);     // inimigo de história (ex.: a sombra da 1A)
      else aoDerrotarInimigo(i);                   // missões e recompensas (js/missoes.js)
    }
  }
  inimigos = inimigos.filter((i) => i.vida > 0);
}

// Desenho improvisado (formas simples). Depois dá para trocar por imagem.
// O slime (e a sombra) usam este; os tipos da Zona Leste ficam mais abaixo (desenharInimigo escolhe qual usar).
function desenharSlime(i) {
  const t = i.tipo;
  const pulo = Math.sin(i.anim * 5) * 3;
  const w = t.largura + pulo, h = t.altura - pulo;

  ctx.fillStyle = "rgba(0,0,0,0.25)";                       // sombra
  ctx.beginPath(); ctx.ellipse(i.x, i.y, t.largura / 2, 8, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = i.flash > 0 ? "#ffffff" : t.cor;           // corpo
  ctx.beginPath(); ctx.ellipse(i.x, i.y - h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = t.corEscura; ctx.stroke();

  ctx.fillStyle = t.corOlhos || "#14110f";                   // olhos
  ctx.fillRect(i.x - 12, i.y - h / 2 - 6, 6, 10);
  ctx.fillRect(i.x + 6,  i.y - h / 2 - 6, 6, 10);
}


// =====================================================
// ZONA LESTE: comportamentos novos, tiros e desenhos
// =====================================================

// ---------- Projéteis (tiros dos robôs e do chefe) ----------
let projeteis = [];

// Dispara um tiro a partir do inimigo, na direção "angulo" (radianos)
function atirar(i, angulo, velocidade, dano, raio) {
  if (Math.hypot(i.x - jogador.x, i.y - jogador.y) < 700) tocarSom("tiro");
  projeteis.push({ x: i.x, y: i.y - 30, vx: Math.cos(angulo) * velocidade, vy: Math.sin(angulo) * velocidade,
                   vida: 2.6, raio: raio || 11, dano: dano || 1, t: 0 });
}
function anguloParaJogador(i) {
  return Math.atan2((jogador.y - 32) - (i.y - 30), jogador.x - i.x);
}

function atualizarProjeteis(dt) {
  const corpo = caixaCorpoJogador();
  for (const p of projeteis) {
    p.t += dt; p.vida -= dt;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.vida <= 0) continue;
    if (temSolido({ x: p.x - 4, y: p.y - 4, w: 8, h: 8 })) { p.vida = 0; continue; }       // bateu na parede
    if (bate({ x: p.x - p.raio, y: p.y - p.raio, w: p.raio * 2, h: p.raio * 2 }, corpo)) {   // acertou a Dellalos
      machucarJogador(p.dano, p.x - p.vx * 0.05, p.y - p.vy * 0.05);
      p.vida = 0;
    }
  }
  projeteis = projeteis.filter((p) => p.vida > 0);
}

function desenharProjeteis() {
  for (const p of projeteis) {
    const brilho = 0.6 + 0.4 * Math.sin(p.t * 24);
    ctx.fillStyle = "rgba(255,120,40," + (0.28 * brilho) + ")";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.raio * 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffb347";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.raio, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff4c2";
    ctx.beginPath(); ctx.arc(p.x, p.y, p.raio * 0.5, 0, Math.PI * 2); ctx.fill();
  }
}

// ---------- Robô vigia: mantém distância e atira ----------
function iaAtirador(i, dt, dx, dy, d) {
  const t = i.tipo;
  if (d > t.deteccao) { i.tiro = Math.max(i.tiro, 0.8); return; }       // longe: fica parado
  if (d > 300) moverInimigo(i, (dx / d) * t.velocidade * dt, (dy / d) * t.velocidade * dt);
  else if (d < 190) moverInimigo(i, -(dx / d) * t.velocidade * dt, -(dy / d) * t.velocidade * dt);
  i.tiro -= dt;
  if (i.tiro <= 0) {
    atirar(i, anguloParaJogador(i), t.tiroVelocidade, t.tiroDano);
    i.tiro = t.tiroIntervalo;
  }
}

// ---------- Sucateiro: anda, avisa (fica vermelho e treme) e dispara numa investida ----------
function iaInvestida(i, dt, dx, dy, d) {
  const t = i.tipo;
  const ux = dx / (d || 1), uy = dy / (d || 1);
  if (i.estado === "andar") {
    if (d < t.deteccao && d > 4) moverInimigo(i, ux * t.velocidade * dt, uy * t.velocidade * dt);
    i.espera -= dt;
    if (d < (t.alcanceAviso || 320) && i.espera <= 0) { i.estado = "aviso"; i.tempo = t.avisoTempo; i.dirX = ux; i.dirY = uy; }
  } else if (i.estado === "aviso") {
    i.tempo -= dt;
    if (i.tempo > 0.2) { i.dirX = ux; i.dirY = uy; }                     // mira até o último instante
    if (i.tempo <= 0) { i.estado = "carga"; i.tempo = t.investidaTempo; }
  } else if (i.estado === "carga") {
    i.tempo -= dt;
    const px = i.x, py = i.y;
    moverInimigo(i, i.dirX * t.investidaVelocidade * dt, i.dirY * t.investidaVelocidade * dt);
    if (Math.hypot(i.x - px, i.y - py) < t.investidaVelocidade * dt * 0.3) i.tempo = 0;   // bateu na parede
    if (i.tempo <= 0) { i.estado = "descanso"; i.espera = t.descanso; }
  } else {                                                               // descanso: fica vulnerável
    i.espera -= dt;
    if (i.espera <= 0) { i.estado = "andar"; i.espera = 1.2 + Math.random(); }
  }
}

// ---------- Capataz Mecânico (chefe) ----------
// Fase 1: alterna tiro em leque e investida. Fase 2 (metade da vida): mais rápido, tiro em anel e chama 2 ratos.
function iaChefe(i, dt, dx, dy, d) {
  const t = i.tipo;
  const ux = dx / (d || 1), uy = dy / (d || 1);
  if (!i.apresentado) {                                                  // espera a Dellalos chegar perto e se apresenta
    if (d < t.deteccao) { i.apresentado = true; abrirDialogo(DIALOGOS.capataz.encontro); }
    return;
  }
  if (!i.fase2 && i.vida <= t.vida / 2) {
    i.fase2 = true; i.flash = 0.6; i.estado = "descanso"; i.espera = 0.9;
    mostrarMensagem("O Capataz superaquece! Ele ficou mais rápido!");
    for (let k = 0; k < 2; k++) {                                        // reforços
      const r = criarInimigo("rato", i.x + (k ? 110 : -110), i.y + 40);
      posicionarInimigoLivre(r);
      inimigos.push(r);
    }
  }
  const v = i.fase2 ? 1.35 : 1;
  if (i.estado === "andar") {
    if (d > 90) moverInimigo(i, ux * t.velocidade * v * dt, uy * t.velocidade * v * dt);
    i.espera -= dt;
    if (i.espera <= 0) {
      i.ciclo = (i.ciclo || 0) + 1;
      const ataque = i.fase2 ? ["carga", "leque", "anel"][i.ciclo % 3] : ["leque", "carga"][i.ciclo % 2];
      i.estado = ataque === "carga" ? "aviso" : ataque;
      i.tempo = ataque === "carga" ? 0.75 : 0.6;
      i.dirX = ux; i.dirY = uy;
    }
  } else if (i.estado === "aviso") {                                     // prepara a investida
    i.tempo -= dt;
    if (i.tempo > 0.25) { i.dirX = ux; i.dirY = uy; }
    if (i.tempo <= 0) { i.estado = "carga"; i.tempo = 0.6; }
  } else if (i.estado === "carga") {
    i.tempo -= dt;
    const px = i.x, py = i.y, vel = 470 * v;
    moverInimigo(i, i.dirX * vel * dt, i.dirY * vel * dt);
    if (Math.hypot(i.x - px, i.y - py) < vel * dt * 0.3) i.tempo = 0;
    if (i.tempo <= 0) { i.estado = "descanso"; i.espera = 1.0; }
  } else if (i.estado === "leque") {
    i.tempo -= dt;
    if (i.tempo <= 0) {
      const n = i.fase2 ? 5 : 3, a = anguloParaJogador(i);
      for (let k = 0; k < n; k++) atirar(i, a + (k - (n - 1) / 2) * 0.28, 300 * v, 1, 13);
      i.estado = "descanso"; i.espera = 0.8;
    }
  } else if (i.estado === "anel") {
    i.tempo -= dt;
    if (i.tempo <= 0) {
      const desloc = Math.random() * 0.6;
      for (let k = 0; k < 10; k++) atirar(i, desloc + (k / 10) * Math.PI * 2, 240, 1, 12);
      i.estado = "descanso"; i.espera = 1.0;
    }
  } else {                                                               // descanso
    i.espera -= dt;
    if (i.espera <= 0) { i.estado = "andar"; i.espera = i.fase2 ? 1.1 : 1.8; }
  }
}

// Barra de vida do chefe (embaixo, no centro da tela)
function desenharBarraChefe() {
  const c = inimigos.find((i) => i.tipo.chefe && i.apresentado && i.vida > 0);
  if (!c) return;
  const w = Math.min(520, VIEW_L - 80), x = (VIEW_L - w) / 2, y = VIEW_A - 40;
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(x - 8, y - 34, w + 16, 58);
  ctx.fillStyle = "#f3e6c8"; ctx.font = "bold 22px sans-serif"; ctx.textAlign = "center";
  ctx.fillText(c.tipo.nome, VIEW_L / 2, y - 10);
  ctx.fillStyle = "#3a1c1c"; ctx.fillRect(x, y, w, 16);
  ctx.fillStyle = c.fase2 ? "#ff7a3a" : "#e0463c";
  ctx.fillRect(x, y, w * Math.max(0, c.vida / c.tipo.vida), 16);
}

// ---------- Desenhos (formas simples, como o slime; dá para trocar por imagens depois) ----------
function sombraInimigo(i, rx) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.ellipse(i.x, i.y, rx, 8, 0, 0, Math.PI * 2); ctx.fill();
}

function desenharRato(i) {
  const t = i.tipo, corre = Math.sin(i.anim * 18) * 2;
  sombraInimigo(i, 22);
  ctx.save();
  ctx.translate(i.x, i.y - 12 - Math.abs(corre));
  ctx.scale(i.dir, 1);
  ctx.lineCap = "round"; ctx.strokeStyle = "#d89a9a"; ctx.lineWidth = 4;                 // rabo
  ctx.beginPath(); ctx.moveTo(-18, 0); ctx.quadraticCurveTo(-34, -8 + corre * 2, -30, -18); ctx.stroke();
  ctx.fillStyle = i.flash > 0 ? "#fff" : t.cor;
  ctx.beginPath(); ctx.ellipse(0, 0, 20, 12, 0, 0, Math.PI * 2); ctx.fill();              // corpo
  ctx.beginPath(); ctx.ellipse(17, -2, 11, 8, 0, 0, Math.PI * 2); ctx.fill();             // cabeça
  ctx.fillStyle = "#d89a9a";
  ctx.beginPath(); ctx.arc(11, -10, 5, 0, Math.PI * 2); ctx.fill();                       // orelha
  ctx.fillRect(26, -3, 4, 4);                                                             // focinho
  ctx.fillStyle = "#e03030"; ctx.fillRect(19, -7, 3, 3);                                  // olho
  ctx.fillStyle = t.corEscura; ctx.fillRect(-10 + corre, 8, 5, 5); ctx.fillRect(8 - corre, 8, 5, 5);   // patinhas
  ctx.restore();
}

function desenharVigia(i) {
  const t = i.tipo, bob = Math.sin(i.anim * 3) * 4, carregando = i.tiro < 0.5;
  ctx.fillStyle = "rgba(0,0,0," + (0.22 - bob * 0.01) + ")";
  ctx.beginPath(); ctx.ellipse(i.x, i.y, 26 - bob, 7, 0, 0, Math.PI * 2); ctx.fill();
  const cy = i.y - 38 - bob;
  ctx.strokeStyle = t.corEscura; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(i.x, cy - 24); ctx.lineTo(i.x, cy - 38); ctx.stroke();      // antena
  ctx.fillStyle = carregando ? "#ff3b2e" : "#8a2020";
  ctx.beginPath(); ctx.arc(i.x, cy - 40, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(255,170,60," + (0.5 + 0.4 * Math.sin(i.anim * 30)) + ")";         // chama de baixo
  ctx.beginPath(); ctx.moveTo(i.x - 8, cy + 16); ctx.lineTo(i.x + 8, cy + 16); ctx.lineTo(i.x, cy + 28); ctx.fill();
  ctx.fillStyle = i.flash > 0 ? "#fff" : t.cor;                                           // corpo
  ctx.fillRect(i.x - 22, cy - 24, 44, 40);
  ctx.strokeRect(i.x - 22, cy - 24, 44, 40);
  ctx.fillStyle = t.corEscura;                                                            // braços
  ctx.fillRect(i.x - 30, cy - 8, 8, 20); ctx.fillRect(i.x + 22, cy - 8, 8, 20);
  ctx.fillStyle = "#14110f"; ctx.fillRect(i.x - 16, cy - 18, 32, 14);                     // visor
  ctx.fillStyle = carregando ? "#ff3b2e" : "#4fe0ff";
  ctx.fillRect(i.x - 12 + i.dir * 2, cy - 14, 24, 6);
}

function desenharSucateiro(i) {
  const t = i.tipo, aviso = i.estado === "aviso", treme = aviso ? Math.sin(i.anim * 50) * 3 : 0;
  const x = i.x + treme, y = i.y;
  sombraInimigo(i, 42);
  ctx.strokeStyle = t.corEscura; ctx.lineWidth = 3;
  ctx.fillStyle = "#4a4a52";                                                              // pernas
  ctx.fillRect(x - 26, y - 28, 20, 28); ctx.fillRect(x + 6, y - 28, 20, 28);
  ctx.fillStyle = i.flash > 0 ? "#fff" : (aviso ? "#c0452a" : t.cor);                     // tronco de sucata
  ctx.fillRect(x - 36, y - 76, 72, 52); ctx.strokeRect(x - 36, y - 76, 72, 52);
  ctx.fillStyle = "#6a6a72";                                                              // chapas e rebites
  ctx.fillRect(x - 28, y - 68, 26, 18); ctx.fillRect(x + 6, y - 50, 24, 18);
  ctx.fillStyle = "#d8d8d8";
  for (const [rx, ry] of [[-24, -64], [-8, -64], [10, -46], [24, -46]]) ctx.fillRect(x + rx, y + ry, 4, 4);
  ctx.fillStyle = t.corEscura;                                                            // braços
  ctx.fillRect(x - 52, y - 72, 16, 44); ctx.fillRect(x + 36, y - 72, 16, 44);
  ctx.fillStyle = "#7a7a82"; ctx.fillRect(x - 22, y - 100, 44, 26);                       // capacete (balde)
  ctx.strokeRect(x - 22, y - 100, 44, 26);
  ctx.fillStyle = aviso ? "#ff3b2e" : "#ffcc33"; ctx.fillRect(x - 14, y - 90, 28, 6);     // olhos
}

function desenharCapataz(i) {
  const t = i.tipo, e = i.estado;
  const prep = e === "aviso" || e === "leque" || e === "anel";
  const treme = prep ? Math.sin(i.anim * 50) * 3 : 0;
  const x = i.x + treme, y = i.y;
  sombraInimigo(i, 66);
  ctx.strokeStyle = t.corEscura; ctx.lineWidth = 4;
  ctx.fillStyle = "#3a3a42";                                                              // pernas
  ctx.fillRect(x - 46, y - 42, 34, 42); ctx.fillRect(x + 12, y - 42, 34, 42);
  ctx.fillStyle = i.flash > 0 ? "#fff" : (i.fase2 ? "#d4602a" : t.cor);                   // tronco
  ctx.fillRect(x - 60, y - 108, 120, 70); ctx.strokeRect(x - 60, y - 108, 120, 70);
  ctx.fillStyle = prep ? "#fff" : (i.fase2 ? "#ff5a2a" : "#ffd34a");                      // núcleo de energia
  ctx.beginPath(); ctx.arc(x, y - 72, 17, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#3a3a42";                                                              // braços e punhos
  ctx.fillRect(x - 84, y - 104, 24, 66); ctx.fillRect(x + 60, y - 104, 24, 66);
  ctx.beginPath(); ctx.arc(x - 72, y - 34, 17, 0, Math.PI * 2); ctx.arc(x + 72, y - 34, 17, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#5a5a64"; ctx.fillRect(x - 30, y - 134, 60, 30);                       // cabeça
  ctx.fillStyle = "#ffcc33";                                                              // capacete de obra
  ctx.beginPath(); ctx.arc(x, y - 132, 34, Math.PI, 0); ctx.fill(); ctx.fillRect(x - 36, y - 134, 72, 6);
  ctx.fillStyle = "#14110f"; ctx.fillRect(x - 22, y - 124, 44, 12);                       // visor
  ctx.fillStyle = prep || i.fase2 ? "#ff3b2e" : "#ffb347";
  ctx.fillRect(x - 15, y - 121, 8, 6); ctx.fillRect(x + 7, y - 121, 8, 6);
}

// Pequena barra de vida sobre inimigos novos que já levaram dano (o slime nunca mostra)
function desenharVidaInimigo(i) {
  if (!i.tipo.ia || i.tipo.chefe || i.tipo.duelo || i.vida >= i.tipo.vida) return;
  const w = 44, x = i.x - w / 2, y = i.y - i.tipo.altura - 14;
  ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(x - 2, y - 2, w + 4, 10);
  ctx.fillStyle = "#e0463c"; ctx.fillRect(x, y, w * Math.max(0, i.vida / i.tipo.vida), 6);
}

function desenharInimigo(i) {
  if (i.tipoId === "rato") desenharRato(i);
  else if (i.tipoId === "vigia") desenharVigia(i);
  else if (i.tipoId === "sucateiro") desenharSucateiro(i);
  else if (i.tipoId === "capataz") desenharCapataz(i);
  else if (i.tipoId === "lucas" || i.tipoId === "thaina_ctrl" || i.tipoId === "caos_oeste") desenharLucasDuelo(i);   // thaina_ctrl e caos_oeste: js/thaina.js
  else if (i.tipoId === "gaby") { i.npc = window.gabyNpc; desenharLucasDuelo(i); }   // usa o sprite Gaby.png do NPC (js/salas/zonaleste.js)
  else if (i.tipoId === "espirito") desenharEspirito(i);
  else if (i.tipo.spriteNpc) { i.npc = i.tipo.spriteNpc; desenharLucasDuelo(i); }   // chefes do dia 10 (js/dia10.js)
  else desenharSlime(i);
  desenharVidaInimigo(i);
}


// ---------- Treino com o Lucas (Zona Leste) ----------
// Há um duelo em andamento? (enquanto sim, a Dellalos nunca passa de 1 coração: veja machucarJogador em js/jogador.js)
function duelando() { return inimigos.some((i) => i.tipo.duelo && i.vida > 0); }

// O Lucas ataca com investidas curtas (iaInvestida); quando a Dellalos chega a 1 coração, o treino termina (vida = 0 chama aoMorrer)
function iaDuelo(i, dt, dx, dy, d) {
  if (jogador.vida <= 1) { i._caiu = true; i.vida = 0; return; }   // _caiu: foi a Dellalos que perdeu (js/torneio.js usa isto)
  iaInvestida(i, dt, dx, dy, d);
}

// Desenha o Lucas com o mesmo sprite do NPC (a folha do NPC fica em i.npc); sem sprite, vira um boneco simples
function desenharLucasDuelo(i) {
  const n = i.npc;
  if (!n || !n._folha) { desenharSlime(i); return; }
  n.x = i.x; n.y = i.y;
  n.direcao = Math.abs(jogador.x - i.x) > Math.abs(jogador.y - i.y) ? (jogador.x < i.x ? "esquerda" : "direita") : (jogador.y < i.y ? "cima" : "baixo");
  n.andando = i.estado === "andar" || i.estado === "carga";
  n._tempoAnim = i.anim;
  desenharNpc(n);
  if (i.flash > 0) { ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.fillRect(i.x - 22, i.y - 100, 44, 100); }
  if (i.estado === "aviso") {                                           // avisa antes de investir
    ctx.fillStyle = "#ff3b2e"; ctx.font = "bold 44px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("!", i.x, i.y - 112);
  }
}


// ---------- Gaby (dia 9, Zona Leste) ----------
// Espera a Dellalos chegar perto, conversa e então ataca com investidas (iaInvestida). Na metade da vida fica mais rápida.
// Quando a vida acaba, aoMorrer (gabyCaiu, js/salas/zonaleste.js) deixa a Gaby caída e abre a escolha do destino.
function iaGaby(i, dt, dx, dy, d) {
  const t = i.tipo;
  if (!i.apresentado) {
    if (d < t.deteccao) { i.apresentado = true; abrirDialogo(DIALOGOS.gaby.encontro); }
    return;
  }
  if (!i.fase2 && i.vida <= t.vida / 2) {
    i.fase2 = true; i.flash = 0.5;
    mostrarMensagem("A Gaby ficou mais rápida! A Isabela está forçando ela.");
  }
  if (i.fase2) {                                   // fase 2: anda mais rápido e descansa menos
    if (i.estado === "andar" && d < t.deteccao && d > 4) moverInimigo(i, (dx / d) * t.velocidade * 0.4 * dt, (dy / d) * t.velocidade * 0.4 * dt);
    if (i.estado === "descanso") i.espera -= dt * 0.6;
  }
  iaInvestida(i, dt, dx, dy, d);
}

// ---------- Espírito (Zona Norte) ----------
// Flutua até a Dellalos em curvas. A cada ~4 s fica ETÉREO por um instante: transparente, mais rápido,
// não machuca e não pode ser machucado. Quando está sólido, 3 golpes o desfazem (e ele solta uma essência).
function iaEspirito(i, dt, dx, dy, d) {
  const t = i.tipo;
  if (!i.iniciou) { i.iniciou = true; i.tempo = Math.random() * 4.3; }       // cada espírito começa num ponto diferente do ciclo
  i.tempo += dt;
  i.etereo = (i.tempo % 4.3) > 3.2;
  if (d < t.deteccao && d > 4) {
    const v = t.velocidade * (i.etereo ? 1.5 : 1);
    const ox = -dy / d, oy = dx / d, onda = Math.sin(i.tempo * 3 + i.anim) * 0.7;   // desvio lateral ondulante
    moverInimigo(i, ((dx / d) + ox * onda) * v * dt, ((dy / d) + oy * onda) * v * dt);
  }
}

function desenharEspirito(i) {
  const t = i.tipo, bob = Math.sin(i.anim * 2.4) * 6;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.beginPath(); ctx.ellipse(i.x, i.y, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = i.etereo ? 0.3 : 0.88;
  const cx = i.x, base = i.y - 16 - bob, topo = base - 54;
  ctx.fillStyle = i.flash > 0 ? "#fff" : t.cor;
  ctx.strokeStyle = t.corEscura; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 22, base);
  ctx.lineTo(cx - 22, topo + 22);
  ctx.arc(cx, topo + 22, 22, Math.PI, 0);                                   // cabeça redonda
  ctx.lineTo(cx + 22, base);
  for (let k = 0; k < 4; k++) {                                              // barra ondulada embaixo
    ctx.quadraticCurveTo(cx + 22 - k * 11 - 5.5, base + (k % 2 ? -8 : 8), cx + 22 - (k + 1) * 11, base);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#1c1a3a";                                                 // olhos e boca
  ctx.beginPath(); ctx.ellipse(cx - 8, topo + 22, 4, 7, 0, 0, Math.PI * 2); ctx.ellipse(cx + 8, topo + 22, 4, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, topo + 38, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
