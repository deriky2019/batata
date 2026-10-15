const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");

ctx.imageSmoothingEnabled = false;

// Carregar a sprite sheet da Dellalos
const personagem = new Image();
personagem.src = "assets/dellalos.jpg";

const COLUNAS = 4;
const LINHAS = 4;

// Dados da protagonista
const jogador = {
  x: 304,
  y: 224,
  largura: 32,
  altura: 32,
  velocidade: 150,
  direcao: 0,
  quadro: 0,
  tempoAnimacao: 0,
  andando: false
};

// Linhas da sprite sheet:
// 0 = baixo (frente)
// 1 = cima (costas)
// 2 = esquerda
// 3 = direita

const teclas = {};
const botoes = {};

let ultimoTempo = 0;

// Fundo provisório
function desenharCenario() {
  ctx.fillStyle = "#8cbd65";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#7eae59";

  for (let y = 16; y < canvas.height; y += 32) {
    for (let x = 16; x < canvas.width; x += 32) {
      ctx.fillRect(x, y, 2, 2);
    }
  }
}

// Desenhar Dellalos
function desenharPersonagem() {
  if (!personagem.complete || personagem.naturalWidth === 0) {
    return;
  }

  const larguraQuadro =
    personagem.naturalWidth / COLUNAS;

  const alturaQuadro =
    personagem.naturalHeight / LINHAS;

  const origemX =
    jogador.quadro * larguraQuadro;

  const origemY =
    jogador.direcao * alturaQuadro;

  ctx.drawImage(
    personagem,
    origemX,
    origemY,
    larguraQuadro,
    alturaQuadro,
    Math.round(jogador.x),
    Math.round(jogador.y),
    jogador.largura,
    jogador.altura
  );
}

// Atualizar movimento
function atualizar(delta) {
  let dx = 0;
  let dy = 0;

  if (teclas.arrowup || teclas.w || botoes.cima) {
    dy = -1;
  }

  if (teclas.arrowdown || teclas.s || botoes.baixo) {
    dy = 1;
  }

  if (teclas.arrowleft || teclas.a || botoes.esquerda) {
    dx = -1;
  }

  if (teclas.arrowright || teclas.d || botoes.direita) {
    dx = 1;
  }

  jogador.andando = dx !== 0 || dy !== 0;

  if (jogador.andando) {
    const tamanho = Math.hypot(dx, dy);

    dx /= tamanho;
    dy /= tamanho;

    jogador.x += dx * jogador.velocidade * delta;
    jogador.y += dy * jogador.velocidade * delta;

    // Escolher a direção correta
    if (Math.abs(dx) > Math.abs(dy)) {
      jogador.direcao = dx < 0 ? 2 : 3;
    } else {
      jogador.direcao = dy < 0 ? 1 : 0;
    }

    // Animar os quatro quadros
    jogador.tempoAnimacao += delta;

    if (jogador.tempoAnimacao >= 0.12) {
      jogador.quadro = (jogador.quadro + 1) % 4;
      jogador.tempoAnimacao = 0;
    }
  } else {
    jogador.quadro = 0;
    jogador.tempoAnimacao = 0;
  }

  // Impedir que saia da tela
  jogador.x = Math.max(
    0,
    Math.min(canvas.width - jogador.largura, jogador.x)
  );

  jogador.y = Math.max(
    0,
    Math.min(canvas.height - jogador.altura, jogador.y)
  );
}

// Loop principal
function loop(tempoAtual) {
  const delta = Math.min(
    (tempoAtual - ultimoTempo) / 1000,
    0.05
  );

  ultimoTempo = tempoAtual;

  atualizar(delta);
  desenharCenario();
  desenharPersonagem();

  requestAnimationFrame(loop);
}

// Teclado
window.addEventListener("keydown", (evento) => {
  const tecla = evento.key.toLowerCase();

  if (tecla.startsWith("arrow")) {
    evento.preventDefault();
  }

  teclas[tecla] = true;
});

window.addEventListener("keyup", (evento) => {
  teclas[evento.key.toLowerCase()] = false;
});

// Botões de toque
document.querySelectorAll("[data-direcao]").forEach((botao) => {
  const direcao = botao.dataset.direcao;

  function pressionar(evento) {
    evento.preventDefault();
    botoes[direcao] = true;

    if (botao.setPointerCapture) {
      botao.setPointerCapture(evento.pointerId);
    }
  }

  function soltar(evento) {
    evento.preventDefault();
    botoes[direcao] = false;
  }

  botao.addEventListener("pointerdown", pressionar);
  botao.addEventListener("pointerup", soltar);
  botao.addEventListener("pointercancel", soltar);
  botao.addEventListener("lostpointercapture", soltar);
});

// Mensagens de carregamento
personagem.onload = () => {
  status.textContent =
    "Dellalos carregada! Use os controles para andar.";
};

personagem.onerror = () => {
  status.textContent =
    "Erro: confira assets/dellalos.jpg";
};

// Iniciar o jogo
requestAnimationFrame(loop);