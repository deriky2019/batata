/* =====================================================
   JOGO DELLALOS - script.js
   Organização (de cima para baixo):
   1. CONFIG      -> valores que você pode mudar
   2. Imagens     -> Dellalos (spritesheet) e Sala
   3. Mundo       -> paredes, móveis e interações
   4. Jogador
   5. Controles   (teclado + toque)
   6. Ação (botão A) e Atualizar (lógica)
   7. Desenhar (visual) e Loop do jogo
   O mundo usa as MESMAS medidas da Sala.jpg (1200 x 896),
   então qualquer posição que você ver na imagem vale no código.
   ===================================================== */

/* ---------- 1. CONFIG ---------- */
const CONFIG = {
  velocidade: 260,          // pixels por segundo (mude para andar mais rápido/devagar)
  alturaPersonagem: 170,    // altura de UM quadro de Dellalos (os quadros são quadrados)
  margemAcao: 40,           // distância máxima para o botão A "alcançar" um objeto

  // CENÁRIO: imagem da sala. Se não achar a imagem, usa o cenário provisório.
  sala: {
    ativar: true,
    // O jogo tenta cada caminho, em ordem, até achar a imagem
    arquivos: ["assets/Sala.jpg"],
    x: 0,
    y: 0,
    largura: 1200,
    altura: 896
  },

  // SPRITESHEET: dellalos.jpg tem 4 colunas x 4 linhas de quadros.
  sprite: {
    colunas: 4,
    linhas: 4,
    tempoPorQuadro: 0.14,   // segundos em cada quadro da caminhada
    pes: 0.93,              // onde ficam os pés dentro do quadro (0 = topo, 1 = base)
    animacoes: {
      baixo:    { linha: 0, quadros: [0, 1, 2, 3] },
      cima:     { linha: 1, quadros: [2, 3] },
      esquerda: { linha: 2, quadros: [0, 1, 2, 3] },
      direita:  { linha: 3, quadros: [0, 1, 2, 3] }
    }
  }
};

const MUNDO_L = 1200;       // largura do mundo (igual ao width do canvas e da Sala.jpg)
const MUNDO_A = 896;        // altura do mundo

const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;   // mantém os pixels nítidos

/* ---------- 2. IMAGENS ---------- */
// Tenta carregar uma imagem testando vários caminhos (Android diferencia maiúsculas de minúsculas)
function carregarImagem(caminhos, aoCarregar) {
  const img = new Image();
  let n = 0;
  img.onload = () => aoCarregar(img);
  img.onerror = () => {
    console.warn("Não achei " + caminhos[n]);
    n++;
    if (n < caminhos.length) img.src = caminhos[n];
  };
  img.src = caminhos[0];
  return img;
}

// --- Dellalos ---
let dellalosOk = false;
let folha = null;   // spritesheet já com o fundo preto transparente

carregarImagem(["assets/dellalos.jpg", "assets/dellalos.jpg", "dellalos.jpg"], (img) => {
  folha = prepararFolha(img);
  dellalosOk = true;
});

// A imagem é JPG, então o preto do fundo não é transparente.
// Copiamos para um canvas escondido e apagamos o preto ligado às bordas.
function prepararFolha(img) {
  try {
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const cx = c.getContext("2d");
    cx.drawImage(img, 0, 0);
    const dados = cx.getImageData(0, 0, w, h);
    const px = dados.data;
    const LIMITE = 38;
    const visitado = new Uint8Array(w * h);
    const pilha = [0, w - 1, (h - 1) * w, h * w - 1];
    const escuro = (i) => px[i*4] < LIMITE && px[i*4+1] < LIMITE && px[i*4+2] < LIMITE;
    while (pilha.length) {
      const i = pilha.pop();
      if (visitado[i] || !escuro(i)) continue;
      visitado[i] = 1;
      px[i*4+3] = 0;
      const x = i % w, y = (i / w) | 0;
      if (x > 0) pilha.push(i - 1);
      if (x < w - 1) pilha.push(i + 1);
      if (y > 0) pilha.push(i - w);
      if (y < h - 1) pilha.push(i + w);
    }
    cx.putImageData(dados, 0, 0);
    return c;
  } catch (erro) {
    console.warn("Não consegui remover o fundo preto (abra pelo servidor do Acode).", erro);
    return img;
  }
}

// --- Sala ---
let imgSala = null;
let salaOk = false;
if (CONFIG.sala.ativar) {
  imgSala = carregarImagem(CONFIG.sala.arquivos, () => { salaOk = true; });
}

/* ---------- 3. MUNDO ---------- */
// Cada retângulo: { x, y, w, h } (canto superior esquerdo + tamanho), em pixels da Sala.jpg.
// Dica: para ajustar uma colisão, mude os números aqui.

// Paredes (a parte bege em volta do piso de madeira)
const paredes = [
  { x: 0,    y: 0,   w: 1200, h: 160 },   // parede de cima
  { x: 0,    y: 785, w: 1200, h: 111 },   // parede de baixo
  { x: 0,    y: 0,   w: 118,  h: 896 },   // parede da esquerda
  { x: 1082, y: 0,   w: 118,  h: 896 }    // parede da direita (a porta fica nela)
];

// Móveis sólidos
const sofa  = { x: 245, y: 105, w: 235, h: 160 };   // sofá verde (encostado na parede de cima)
const mesa  = { x: 822, y: 388, w: 78,  h: 184 };   // mesa com o livro
const porta = { x: 1075, y: 340, w: 90, h: 190 };   // porta na parede da direita

const solidos = paredes.concat([sofa, mesa]);

// Objetos com os quais o botão A interage: { nome, area, texto }
const interativos = [
  { nome: "sofa",  area: sofa,  texto: "Não posso dormir, tenho que ir para a escola." },
  { nome: "livro", area: mesa,  texto: "Um livro velho do papai." },
  { nome: "porta", area: porta, texto: "Ainda não disponível." }
];

/* ---------- 4. JOGADOR ---------- */
const jogador = {
  x: 600,           // posição dos PÉS (centro horizontal)
  y: 700,           // posição dos pés (parte de baixo)
  altura: CONFIG.alturaPersonagem,
  direcao: "baixo", // baixo, cima, esquerda ou direita
  quadro: 0,        // qual quadro da animação está sendo mostrado
  tempoAnim: 0      // cronômetro da animação
};

// Caixa de colisão: só a região dos pés (estilo Zelda), menor que o desenho
const CAIXA_L = 64, CAIXA_A = 30;
function caixaDoJogador(x, y) {
  return { x: x - CAIXA_L / 2, y: y - CAIXA_A, w: CAIXA_L, h: CAIXA_A };
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
    botao.setPointerCapture(e.pointerId);
    toque[dir] = true;
    botao.classList.add("ativo");
  };
  const soltar = () => {
    toque[dir] = false;
    botao.classList.remove("ativo");
  };

  botao.addEventListener("pointerdown", apertar);
  botao.addEventListener("pointerup", soltar);
  botao.addEventListener("pointercancel", soltar);
  botao.addEventListener("lostpointercapture", soltar);
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

/* ---------- 6. AÇÃO (botão A) E ATUALIZAR ---------- */
let mensagem = "";
let mensagemAte = 0;

function mostrarMensagem(texto) {
  mensagem = texto;
  mensagemAte = performance.now() + 2500;
}

// Procura o objeto interativo mais próximo que Dellalos consegue alcançar
function objetoAlcancavel() {
  const c = caixaDoJogador(jogador.x, jogador.y);
  const m = CONFIG.margemAcao;
  const alcance = { x: c.x - m, y: c.y - m, w: c.w + m * 2, h: c.h + m * 2 };
  const cx = c.x + c.w / 2, cy = c.y + c.h / 2;

  let melhor = null, melhorDist = Infinity;
  for (const obj of interativos) {
    if (!bate(alcance, obj.area)) continue;
    const ax = obj.area.x + obj.area.w / 2, ay = obj.area.y + obj.area.h / 2;
    const d = Math.hypot(ax - cx, ay - cy);
    if (d < melhorDist) { melhorDist = d; melhor = obj; }
  }
  return melhor;
}

function acao() {
  const obj = objetoAlcancavel();
  mostrarMensagem(obj ? obj.texto : "Nada por aqui.");
}

function atualizar(dt) {
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

/* ---------- 7. DESENHAR (visual) ---------- */
function desenharCenario() {
  if (CONFIG.sala.ativar && salaOk) {
    const s = CONFIG.sala;
    ctx.drawImage(imgSala, s.x, s.y, s.largura, s.altura);
    return;
  }

  // Cenário provisório (aparece se a Sala.jpg não for encontrada)
  ctx.fillStyle = "#b88a5a";
  ctx.fillRect(0, 0, MUNDO_L, MUNDO_A);
  ctx.fillStyle = "#4b3a52";
  for (const p of paredes) ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = "#3f7d3a"; ctx.fillRect(sofa.x, sofa.y, sofa.w, sofa.h);
  ctx.fillStyle = "#7a4e2a"; ctx.fillRect(mesa.x, mesa.y, mesa.w, mesa.h);
  ctx.fillStyle = "#6b4423"; ctx.fillRect(porta.x, porta.y, porta.w, porta.h);
}

function desenharJogador() {
  const j = jogador;
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

// Balãozinho "A" sobre a cabeça quando há algo para interagir
function desenharDica() {
  if (!objetoAlcancavel()) return;
  const x = jogador.x;
  const y = jogador.y - jogador.altura * CONFIG.sprite.pes - 16;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#f3e6c8";
  ctx.font = "bold 24px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("A", x, y + 9);
}

function desenharMensagem() {
  if (performance.now() > mensagemAte) return;
  ctx.font = "30px sans-serif";
  ctx.textAlign = "center";
  const largura = Math.min(ctx.measureText(mensagem).width + 48, MUNDO_L - 40);
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(MUNDO_L / 2 - largura / 2, MUNDO_A - 150, largura, 64);
  ctx.fillStyle = "#f3e6c8";
  ctx.fillText(mensagem, MUNDO_L / 2, MUNDO_A - 108, largura - 24);
}

function desenhar() {
  ctx.clearRect(0, 0, MUNDO_L, MUNDO_A);
  desenharCenario();
  desenharJogador();
  desenharDica();
  desenharMensagem();
}

/* ---------- LOOP DO JOGO ---------- */
let ultimo = performance.now();

function loop(agora) {
  const dt = Math.min((agora - ultimo) / 1000, 0.05);
  ultimo = agora;

  atualizar(dt);   // lógica
  desenhar();      // visual

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
