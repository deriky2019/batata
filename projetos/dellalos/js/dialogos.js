/* =====================================================
   dialogos.js - Caixa de conversa
   abrirDialogo(falas, aoTerminar): mostra uma fala por vez e pausa o jogo.
   O botão B completa a fala (se ainda estiver aparecendo) e depois passa para a próxima.
   Cada fala é { quem: "Nome", texto: "..." }.
   ===================================================== */

// O que já aconteceu na história (no futuro o salvamento.js pode guardar isto)
const historia = {
  conheceuMillena: false,
  conheceuMorador: false,
  conheceuEstudante: false,
  avisouMissaoEscola: false,   // já avisou "Nova missão"?
  chegouNaEscola: false        // missão 1 concluída
};

const DIALOGOS = {
  millena: {
    primeira: [
      { quem: "Millena",  texto: "Oi! Você é nova aqui?" },
      { quem: "Dellalos", texto: "Sim! Eu me chamo Dellalos." },
      { quem: "Millena",  texto: "Você é a Dellalos! Eu sou a Millena. Vamos ser melhores amigas!" }
    ],
    depois: [
      { quem: "Millena",  texto: "Somos melhores amigas agora, Dellalos!" }
    ]
  },
  morador: {
    primeira: [
      { quem: "Morador",  texto: "Bom dia! Você deve ser a nova moradora da casa laranja." },
      { quem: "Dellalos", texto: "Sou sim! Me chamo Dellalos e estou indo para a escola." },
      { quem: "Morador",  texto: "A escola fica no fim da avenida. Cuidado com os slimes pelo caminho!" },
      { quem: "Dellalos", texto: "Slimes?" },
      { quem: "Morador",  texto: "Umas gosmas verdes. Use o botão A para bater neles." }
    ],
    depois: [
      { quem: "Morador",  texto: "Cuidado com os slimes, Dellalos! A escola fica à direita." }
    ]
  },
  estudante: {
    primeira: [
      { quem: "Estudante", texto: "Oi! Você é a aluna nova?" },
      { quem: "Dellalos",  texto: "Sou! Meu nome é Dellalos." },
      { quem: "Estudante", texto: "A Millena está na sala 2A. Ela adora conhecer gente nova!" }
    ],
    depois: [
      { quem: "Estudante", texto: "A sala 2A é a segunda porta, ali em cima. Boa aula!" }
    ]
  }
};

const DIALOGO_LETRAS_POR_SEGUNDO = 45;

let dialogoAberto = false;     // enquanto for true, o jogo fica pausado
let dialogoFalas = [];
let dialogoIndice = 0;
let dialogoTempo = 0;
let dialogoAoTerminar = null;

function abrirDialogo(falas, aoTerminar) {
  if (!falas || !falas.length) return;
  dialogoFalas = falas;
  dialogoIndice = 0;
  dialogoTempo = 0;
  dialogoAoTerminar = aoTerminar || null;
  dialogoAberto = true;
}

function atualizarDialogo(dt) {
  dialogoTempo += dt;
}

function letrasVisiveis() {
  return Math.floor(dialogoTempo * DIALOGO_LETRAS_POR_SEGUNDO);
}

// Botão B durante a conversa
function avancarDialogo() {
  const fala = dialogoFalas[dialogoIndice];
  if (letrasVisiveis() < fala.texto.length) {   // ainda digitando: mostra tudo de uma vez
    dialogoTempo = 9999;
    return;
  }
  dialogoIndice++;
  dialogoTempo = 0;
  if (dialogoIndice >= dialogoFalas.length) {
    dialogoAberto = false;
    const fim = dialogoAoTerminar;
    dialogoAoTerminar = null;
    if (fim) fim();
  }
}

// Quebra o texto em linhas que cabem na largura (a fonte já deve estar definida no ctx)
function quebrarTexto(texto, larguraMax) {
  const linhas = [];
  let atual = "";
  for (const palavra of texto.split(" ")) {
    const teste = atual ? atual + " " + palavra : palavra;
    if (atual && ctx.measureText(teste).width > larguraMax) { linhas.push(atual); atual = palavra; }
    else atual = teste;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

// Desenhado em coordenadas da TELA (depois da câmera, em desenho.js)
function desenharDialogo() {
  if (!dialogoAberto) return;
  const fala = dialogoFalas[dialogoIndice];
  const bw = Math.min(VIEW_L - 80, 940), bh = 180, bx = (VIEW_L - bw) / 2, by = VIEW_A - bh - 36;

  // Caixa (mesmo estilo do inventário)
  ctx.fillStyle = "#1e1612";
  ctx.fillRect(bx - 6, by - 6, bw + 12, bh + 12);
  ctx.fillStyle = "#e0b45a";
  ctx.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
  ctx.fillStyle = "#3a2a1c";
  ctx.fillRect(bx, by, bw, bh);

  // Nome de quem fala
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "left";
  const nomeL = ctx.measureText(fala.quem).width + 40;
  ctx.fillStyle = "#e0b45a";
  ctx.fillRect(bx + 24, by - 26, nomeL, 46);
  ctx.fillStyle = "#2a1d0c";
  ctx.fillText(fala.quem, bx + 44, by + 8);

  // Texto aparecendo letra por letra
  ctx.font = "34px sans-serif";
  const linhas = quebrarTexto(fala.texto, bw - 80);
  let restante = letrasVisiveis();
  ctx.fillStyle = "#f3e6c8";
  linhas.forEach((linha, n) => {
    if (restante <= 0) return;
    ctx.fillText(linha.slice(0, restante), bx + 40, by + 78 + n * 46);
    restante -= linha.length + 1;
  });

  // Quando a fala terminou de aparecer: balãozinho "B" piscando
  if (letrasVisiveis() >= fala.texto.length && Math.floor(performance.now() / 400) % 2 === 0) {
    const x = bx + bw - 36, y = by + bh - 34;
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f3e6c8";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("B", x, y + 9);
  }
}
