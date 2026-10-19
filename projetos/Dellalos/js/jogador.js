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
  empurraoT: 0, empurraoX: 0, empurraoY: 0,  // empurrão ao levar dano
  folego: CONFIG.correr.folego,   // segundos de corrida que ainda restam (barra embaixo dos corações)
  correndo: false,                // está correndo agora? (velocidadeDoJogador usa isto)
  cansada: false,                 // fôlego acabou: só volta a correr depois de recuperar um pouco
  esperaFolego: 0,                // espera curta antes de o fôlego recarregar
  escudo: 0,                      // segundos até a armadura (loja) poder bloquear outro golpe
  capacete: 0,                    // segundos até o capacete (loja) poder salvar de um golpe fatal
  flashEscudo: 0,                 // brilho azul na tela quando a armadura ou o capacete protege
  esquiva: 0, invEsquiva: 0, esquivaRecarga: 0, esqX: 0, esqY: 0,   // esquiva (js/efeitos.js)
  bufferA: 0,                     // golpe apertado um pouco antes de a recarga acabar: sai assim que puder
  morto: false      // true = tela preta de morte (js/telas.js); o jogo fica pausado
};

// Vetor de cada direção (usado no ataque)
const DIRECOES = { baixo: [0, 1], cima: [0, -1], esquerda: [-1, 0], direita: [1, 0] };

// Caixa do corpo inteiro (usada para levar dano)
function caixaCorpoJogador() {
  return { x: jogador.x - 18, y: jogador.y - 56, w: 36, h: 56 };
}

// Dellalos leva dano. (origemX/origemY = de onde veio o golpe, para empurrar)
function machucarJogador(dano, origemX, origemY, tipoId) {
  if (jogador.invEsquiva > 0) { efeitoEsquivaPerfeita(); return; }   // esquivou: nada acontece (js/efeitos.js)
  if (jogador.invulneravel > 0) return;
  dano = danoRecebido(dano);                      // colete e armadura (js/loja.js)
  if (dano <= 0) { jogador.invulneravel = 1; return; }   // a armadura bloqueou: sem dano e sem empurrão
  jogador.vida -= dano;
  if (jogador.vida < 1 && typeof duelando === "function" && duelando()) jogador.vida = 1;   // treino do Lucas: para em 1 coração
  jogador.invulneravel = invulnerabilidadeDoJogador(tipoId);
  efeitoDanoJogador(dano);                        // tremor, flash e som (js/efeitos.js)

  let dx = jogador.x - origemX, dy = jogador.y - origemY;
  const d = Math.hypot(dx, dy) || 1;
  jogador.empurraoX = (dx / d) * empurraoDoJogador(tipoId);
  jogador.empurraoY = (dy / d) * empurraoDoJogador(tipoId);
  jogador.empurraoT = CONFIG.jogador.empurraoTempo;

  if (jogador.vida <= 0) morrer();
}

// Sem vida: tela preta com o botão "Renascer" (morrer() e renascer() ficam em js/telas.js)

// Correr: gasta o fôlego enquanto está andando e segurando correr; recarrega quando para de correr.
// Fôlego máximo e tempo de recarga: o Tênis de corrida (loja) melhora os dois
function folegoMax() { return CONFIG.correr.folego + (historia.comprouTenis ? CONFIG.correr.tenisFolego : 0); }
function folegoRecarga() { return historia.comprouTenis ? CONFIG.correr.tenisRecarga : CONFIG.correr.recarga; }

function atualizarCorrida(dt) {
  const c = CONFIG.correr, j = jogador;
  const movendo = teclado.left || teclado.right || teclado.up || teclado.down || toque.left || toque.right || toque.up || toque.down;
  const quer = (correrPedido.teclado || correrPedido.toque) && movendo;
  j.correndo = quer && !j.cansada && j.folego > 0 && j.empurraoT <= 0;
  if (j.correndo) {
    j.folego = Math.max(0, j.folego - dt);
    j.esperaFolego = c.espera;
    if (j.folego <= 0) j.cansada = true;
    return;
  }
  j.esperaFolego = Math.max(0, j.esperaFolego - dt);
  if (j.esperaFolego > 0) return;
  j.folego = Math.min(folegoMax(), j.folego + dt * folegoMax() / folegoRecarga());
  if (j.cansada && j.folego >= folegoMax() * c.retomar) j.cansada = false;
}

function atualizarJogador(dt) {
  atualizarCorrida(dt);
  jogador.escudo = Math.max(0, jogador.escudo - dt);
  jogador.capacete = Math.max(0, jogador.capacete - dt);
  jogador.flashEscudo = Math.max(0, jogador.flashEscudo - dt);
  jogador.invulneravel = Math.max(0, jogador.invulneravel - dt);
  jogador.atacando = Math.max(0, jogador.atacando - dt);
  jogador.recarga = Math.max(0, jogador.recarga - dt);
  jogador.esquivaRecarga = Math.max(0, jogador.esquivaRecarga - dt);
  jogador.invEsquiva = Math.max(0, jogador.invEsquiva - dt);
  if (jogador.esquiva > 0) { moverEsquiva(dt); return; }   // arrancada da esquiva (js/efeitos.js)
  jogador.bufferA = Math.max(0, jogador.bufferA - dt);
  if (jogador.bufferA > 0 && jogador.recarga <= 0 && cenaAtual.combate) iniciarAtaque();

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
  jogador.tempoAnim += dt * (jogador.correndo ? 1.5 : 1);   // pernas mais rápidas ao correr
  jogador.quadro = Math.floor(jogador.tempoAnim / CONFIG.sprite.tempoPorQuadro) % anim.quadros.length;

  const passoX = dx * velocidadeDoJogador() * dt;
  const passoY = dy * velocidadeDoJogador() * dt;

  // Move um eixo por vez: assim ela "desliza" na parede em vez de travar
  if (livre(jogador.x + passoX, jogador.y)) jogador.x += passoX;
  if (livre(jogador.x, jogador.y + passoY)) jogador.y += passoY;
}

function desenharJogador() {
  const j = jogador;
  // Piscando enquanto está invulnerável
  if (j.invulneravel > 0 && Math.floor(j.invulneravel * 10) % 2 === 0) return;

  desenharAuraEquipamento();   // brilho no chão: colete (bronze) e armadura pronta (azul)

  if (dellalosOk) {
    const sp = CONFIG.sprite;
    const qw = folha.width / sp.colunas;
    const qh = folha.height / sp.linhas;
    const anim = sp.animacoes[j.direcao];
    const coluna = anim.quadros[j.quadro % anim.quadros.length];
    const h = j.altura;
    const w = h * (qw / qh);
    if (j.esquiva > 0) ctx.globalAlpha = 0.5;   // meio transparente durante a esquiva
    ctx.drawImage(folha, coluna * qw, anim.linha * qh, qw, qh,
                  Math.round(j.x - w / 2), Math.round(j.y - h * sp.pes), w, h);
    ctx.globalAlpha = 1;
  } else {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(j.x - 30, j.y - 60, 60, 60);
    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("sem img", j.x, j.y - 26);
  }
}

// Aura aos pés da Dellalos mostrando o equipamento: colete = bronze; armadura pronta = azul pulsando; capacete pronto = ponto dourado
function desenharAuraEquipamento() {
  if (!historia.comprouColete && !historia.comprouArmadura && !historia.comprouCapacete) return;
  const j = jogador, t = performance.now() / 1000;
  ctx.save();
  ctx.lineWidth = 4;
  if (historia.comprouColete) {
    ctx.strokeStyle = "rgba(205,140,70,0.75)";
    ctx.beginPath(); ctx.ellipse(j.x, j.y - 4, 30, 11, 0, 0, Math.PI * 2); ctx.stroke();
  }
  if (historia.comprouArmadura && j.escudo <= 0) {
    ctx.globalAlpha = 0.55 + 0.25 * Math.sin(t * 4);
    ctx.strokeStyle = "#7ec8ff";
    ctx.beginPath(); ctx.ellipse(j.x, j.y - 4, 38, 14, 0, 0, Math.PI * 2); ctx.stroke();
  }
  if (historia.comprouCapacete && j.capacete <= 0) {
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "#ffd75e";
    ctx.beginPath(); ctx.arc(j.x, j.y - j.altura * CONFIG.sprite.pes - 4, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
