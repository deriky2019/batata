/* =====================================================
   JOGO DELLALOS - script.js
   Organização (de cima para baixo):
   1. CONFIG  -> valores que você pode mudar
   2. Imagens
   3. Mundo   -> paredes e obstáculos
   4. Jogador
   5. Controles (teclado + toque)
   6. Atualizar (lógica) e Desenhar (visual)
   7. Loop do jogo
   ===================================================== */

/* ---------- 1. CONFIG ---------- */
const CONFIG = {
  velocidade: 120,          // pixels por segundo (mude aqui para andar mais rápido/devagar)
  alturaPersonagem: 56,     // altura de Dellalos no mundo (a largura segue a proporção da imagem)

  // CENÁRIO: quando você colocar Assets/sala.jpg, mude "ativar" para true.
  // x, y, largura e altura definem onde e com que tamanho a imagem é desenhada.
  sala: {
    ativar: false,
    arquivo: "Assets/sala.jpg",
    x: 0,
    y: 0,
    largura: 640,
    altura: 360
  }
};

const MUNDO_L = 640;        // largura do mundo (igual ao width do canvas)
const MUNDO_A = 360;        // altura do mundo

const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;   // mantém os pixels nítidos

/* ---------- 2. IMAGENS ---------- */
const imgDellalos = new Image();
let dellalosOk = false;
// Tenta o caminho principal e, se falhar, algumas variações (Android diferencia maiúsculas de minúsculas)
const CAMINHOS_DELLALOS = ["Assets/dellalos.jpg", "assets/dellalos.jpg", "dellalos.jpg"];
let tentativa = 0;
imgDellalos.onload = () => { dellalosOk = true; };
imgDellalos.onerror = () => {
  console.warn("Não achei " + CAMINHOS_DELLALOS[tentativa]);
  tentativa++;
  if (tentativa < CAMINHOS_DELLALOS.length) imgDellalos.src = CAMINHOS_DELLALOS[tentativa];
};
imgDellalos.src = CAMINHOS_DELLALOS[0];

// A imagem da sala só é carregada se CONFIG.sala.ativar for true.
const imgSala = new Image();
let salaOk = false;
if (CONFIG.sala.ativar) {
  imgSala.onload = () => { salaOk = true; };
  imgSala.onerror = () => { console.warn("sala.jpg não encontrada, usando cenário provisório"); };
  imgSala.src = CONFIG.sala.arquivo;
}

/* ---------- 3. MUNDO ---------- */
// Cada retângulo: { x, y, w, h } (canto superior esquerdo + tamanho)
const PAREDE_TOPO = 72;
const PAREDE_LADO = 32;
const PAREDE_BAIXO = 32;

const PORTA = { x: 288, y: 24, w: 64, h: PAREDE_TOPO - 24 };   // porta na parede de cima

// Paredes: bloqueiam o jogador. A parede de cima tem uma abertura onde fica a porta (alcançável).
const paredes = [
  { x: 0, y: 0, w: MUNDO_L, h: PAREDE_TOPO - 24 },                 // topo (faixa externa)
  { x: 0, y: 0, w: 288, h: PAREDE_TOPO },                          // topo esquerdo
  { x: 352, y: 0, w: MUNDO_L - 352, h: PAREDE_TOPO },              // topo direito
  { x: 0, y: 0, w: PAREDE_LADO, h: MUNDO_A },                      // esquerda
  { x: MUNDO_L - PAREDE_LADO, y: 0, w: PAREDE_LADO, h: MUNDO_A },  // direita
  { x: 0, y: MUNDO_A - PAREDE_BAIXO, w: MUNDO_L, h: PAREDE_BAIXO } // baixo
];

// Objetos sólidos (obstáculos) dentro da sala
const obstaculos = [
  { x: 440, y: 120, w: 112, h: 56, tipo: "mesa" },
  { x: 60,  y: 100, w: 40,  h: 40, tipo: "vaso" },
  { x: 540, y: 250, w: 48,  h: 40, tipo: "bau" }
];

// Tapete: só decoração (não bloqueia)
const tapete = { x: 200, y: 170, w: 240, h: 130 };

const solidos = paredes.concat(obstaculos);

/* ---------- 4. JOGADOR ---------- */
const jogador = {
  x: MUNDO_L / 2,   // posição dos PÉS (centro horizontal)
  y: 300,           // posição dos pés (parte de baixo)
  largura: 40,
  altura: CONFIG.alturaPersonagem,
  direcao: "baixo"  // preparado para animações futuras
};

// Caixa de colisão: só a parte de baixo do corpo (estilo Zelda), menor que a imagem
function caixaDoJogador(x, y) {
  const w = jogador.largura * 0.6;
  const h = 16;
  return { x: x - w / 2, y: y - h, w: w, h: h };
}

function bate(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function livre(x, y) {
  const c = caixaDoJogador(x, y);
  for (const s of solidos) {
    if (bate(c, s)) return false;
  }
  return true;
}

/* ---------- 5. CONTROLES ---------- */
// Dois "conjuntos": teclado e toque. O jogador anda se QUALQUER um estiver ativo.
const teclado = { up: false, down: false, left: false, right: false };
const toque   = { up: false, down: false, left: false, right: false };

const MAPA_TECLAS = {
  ArrowUp: "up", w: "up", W: "up",
  ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "left", a: "left", A: "left",
  ArrowRight: "right", d: "right", D: "right"
};

window.addEventListener("keydown", (e) => {
  const dir = MAPA_TECLAS[e.key];
  if (dir) { teclado[dir] = true; e.preventDefault(); }
  if ((e.key === " " || e.key === "Enter") && !e.repeat) { acao(); e.preventDefault(); }
});

window.addEventListener("keyup", (e) => {
  const dir = MAPA_TECLAS[e.key];
  if (dir) { teclado[dir] = false; e.preventDefault(); }
});

// Se a janela perder o foco, solta tudo (evita ficar andando sozinho)
function soltarTudo() {
  for (const k in teclado) teclado[k] = false;
  for (const k in toque) toque[k] = false;
  document.querySelectorAll(".ativo").forEach(el => el.classList.remove("ativo"));
}
window.addEventListener("blur", soltarTudo);
document.addEventListener("visibilitychange", () => { if (document.hidden) soltarTudo(); });

// Botões do D-pad (Pointer Events funcionam para toque e mouse)
document.querySelectorAll(".dir").forEach((botao) => {
  const dir = botao.dataset.dir;

  const apertar = (e) => {
    e.preventDefault();
    botao.setPointerCapture(e.pointerId);   // continua recebendo eventos mesmo se o dedo sair do botão
    toque[dir] = true;
    botao.classList.add("ativo");
  };
  const soltar = () => {
    toque[dir] = false;
    botao.classList.remove("ativo");
  };

  botao.addEventListener("pointerdown", apertar);
  botao.addEventListener("pointerup", soltar);
  botao.addEventListener("pointercancel", soltar);          // o sistema interrompeu o toque
  botao.addEventListener("lostpointercapture", soltar);     // perdeu o controle do ponteiro
  botao.addEventListener("contextmenu", (e) => e.preventDefault());
});

// Botão A
const botaoA = document.getElementById("botaoA");
botaoA.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  botaoA.setPointerCapture(e.pointerId);
  botaoA.classList.add("ativo");
  acao();
});
["pointerup", "pointercancel", "lostpointercapture"].forEach((nome) => {
  botaoA.addEventListener(nome, () => botaoA.classList.remove("ativo"));
});
botaoA.addEventListener("contextmenu", (e) => e.preventDefault());

// Bloqueia rolagem/gestos no resto da tela
document.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

/* ---------- AÇÃO (botão A) ---------- */
let mensagem = "";
let mensagemAte = 0;

function mostrarMensagem(texto) {
  mensagem = texto;
  mensagemAte = performance.now() + 1800;
}

// Por enquanto: só avisa se está perto da porta. Aqui entrarão objetos e NPCs no futuro.
function acao() {
  const pertoDaPorta = Math.abs(jogador.x - (PORTA.x + PORTA.w / 2)) < 60 &&
                       jogador.y < PAREDE_TOPO + 50;
  mostrarMensagem(pertoDaPorta ? "A porta ainda não leva a lugar nenhum." : "Nada por aqui.");
}

/* ---------- 6. ATUALIZAR (lógica) ---------- */
function atualizar(dt) {
  let dx = 0, dy = 0;
  if (teclado.left  || toque.left)  dx -= 1;
  if (teclado.right || toque.right) dx += 1;
  if (teclado.up    || toque.up)    dy -= 1;
  if (teclado.down  || toque.down)  dy += 1;

  if (dx === 0 && dy === 0) return;

  // Diagonal: divide por 1.414 para não ser mais rápida
  if (dx !== 0 && dy !== 0) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }

  // Direção (para animações futuras)
  if (Math.abs(dx) > Math.abs(dy)) jogador.direcao = dx < 0 ? "esquerda" : "direita";
  else jogador.direcao = dy < 0 ? "cima" : "baixo";

  const passoX = dx * CONFIG.velocidade * dt;
  const passoY = dy * CONFIG.velocidade * dt;

  // Move um eixo por vez: assim ela "desliza" na parede em vez de travar
  if (livre(jogador.x + passoX, jogador.y)) jogador.x += passoX;
  if (livre(jogador.x, jogador.y + passoY)) jogador.y += passoY;
}

/* ---------- 7. DESENHAR (visual) ---------- */
function desenharCenario() {
  // Se existir sala.jpg configurada e carregada, usa a imagem
  if (CONFIG.sala.ativar && salaOk) {
    const s = CONFIG.sala;
    ctx.drawImage(imgSala, s.x, s.y, s.largura, s.altura);
    return;
  }

  // Cenário provisório
  // Chão em xadrez suave
  for (let y = 0; y < MUNDO_A; y += 32) {
    for (let x = 0; x < MUNDO_L; x += 32) {
      ctx.fillStyle = ((x + y) / 32) % 2 === 0 ? "#b88a5a" : "#ae8052";
      ctx.fillRect(x, y, 32, 32);
    }
  }

  // Tapete
  ctx.fillStyle = "#8a2f3a";
  ctx.fillRect(tapete.x, tapete.y, tapete.w, tapete.h);
  ctx.strokeStyle = "#e0b45a";
  ctx.lineWidth = 4;
  ctx.strokeRect(tapete.x + 8, tapete.y + 8, tapete.w - 16, tapete.h - 16);

  // Paredes
  ctx.fillStyle = "#4b3a52";
  for (const p of paredes) ctx.fillRect(p.x, p.y, p.w, p.h);
  // Faixa clara na base da parede de cima (dá ideia de profundidade)
  ctx.fillStyle = "#6a5473";
  ctx.fillRect(PAREDE_LADO, PAREDE_TOPO - 10, 288 - PAREDE_LADO, 10);
  ctx.fillRect(352, PAREDE_TOPO - 10, MUNDO_L - 352 - PAREDE_LADO, 10);

  // Porta (abertura na parede de cima)
  ctx.fillStyle = "#6b4423";
  ctx.fillRect(PORTA.x, PORTA.y, PORTA.w, PORTA.h);
  ctx.fillStyle = "#3d2412";
  ctx.fillRect(PORTA.x + 6, PORTA.y + 6, PORTA.w - 12, PORTA.h - 6);
  ctx.fillStyle = "#e0b45a";
  ctx.fillRect(PORTA.x + PORTA.w - 18, PORTA.y + 28, 6, 6);

  // Obstáculos
  for (const o of obstaculos) {
    if (o.tipo === "mesa") {
      ctx.fillStyle = "#7a4e2a"; ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = "#955f33"; ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, o.h - 14);
    } else if (o.tipo === "vaso") {
      ctx.fillStyle = "#3f7d3a"; ctx.fillRect(o.x + 6, o.y, o.w - 12, 20);
      ctx.fillStyle = "#a5563a"; ctx.fillRect(o.x + 4, o.y + 20, o.w - 8, o.h - 20);
    } else {
      ctx.fillStyle = "#5c3b1e"; ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.fillStyle = "#e0b45a"; ctx.fillRect(o.x, o.y + 12, o.w, 4);
      ctx.fillRect(o.x + o.w / 2 - 3, o.y + 10, 6, 10);
    }
  }
}

function desenharJogador() {
  const j = jogador;
  if (dellalosOk) {
    // Mantém a proporção original da imagem (sem deformar)
    const proporcao = imgDellalos.naturalWidth / imgDellalos.naturalHeight;
    const h = j.altura;
    const w = h * proporcao;
    j.largura = w;
    ctx.drawImage(imgDellalos, Math.round(j.x - w / 2), Math.round(j.y - h), w, h);
  } else {
    // Aviso simples caso a imagem não carregue
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(j.x - 20, j.y - 40, 40, 40);
    ctx.fillStyle = "#fff";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("sem img", j.x, j.y - 18);
  }
}

function desenharMensagem() {
  if (performance.now() > mensagemAte) return;
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  const largura = ctx.measureText(mensagem).width + 24;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(MUNDO_L / 2 - largura / 2, MUNDO_A - 80, largura, 28);
  ctx.fillStyle = "#f3e6c8";
  ctx.fillText(mensagem, MUNDO_L / 2, MUNDO_A - 61);
}

function desenhar() {
  ctx.clearRect(0, 0, MUNDO_L, MUNDO_A);
  desenharCenario();
  desenharJogador();
  desenharMensagem();
}

/* ---------- LOOP DO JOGO ---------- */
let ultimo = performance.now();

function loop(agora) {
  // dt = segundos desde o último quadro (limitado para evitar "pulos" ao voltar de outra aba)
  const dt = Math.min((agora - ultimo) / 1000, 0.05);
  ultimo = agora;

  atualizar(dt);   // lógica
  desenhar();      // visual

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
