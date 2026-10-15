/* =====================================================
   cena.js - Os lugares do jogo (sala, estrada, escola...)
   Cada lugar é um bloco de DADOS em js/salas/NOME.js.
   Este arquivo só sabe entrar, trocar e desenhar cenas.

   Uma cena tem:
     fundo       -> (opcional) imagem: { arquivos:[...], x, y, largura, altura }
     desenhar    -> (opcional) mapa improvisado: função desenhar(ctx)
     solidos     -> paredes e móveis que bloqueiam
     interativos -> objetos do botão A: { nome, area, texto } ou { nome, area, destino:{cena,x,y} }
     saidas      -> lugares que levam a outra cena ao encostar: { area, para, x, y }
     inimigos    -> { tipo, x, y }
     combate     -> true = o botão A ataca quando não há nada para interagir
   Se "fundo" existir e a imagem carregar, ela vale; senão usa o "desenhar".
   ===================================================== */

const CENAS = {};         // preenchido pelos arquivos em js/salas/
let cenaAtual = null;
let transicao = null;     // { fase: "saindo" | "entrando", t, dest: {id, x, y} }

// Carrega a imagem da cena e guarda o mapa improvisado pronto (desenhado uma vez só)
function prepararCena(cena) {
  if (cena._pronta) return;
  cena._pronta = true;

  if (cena.fundo && cena.fundo.arquivos) {
    cena._img = carregarImagem(cena.fundo.arquivos, () => { cena._imgOk = true; });
  }
  if (cena.desenhar) {
    const c = document.createElement("canvas");
    c.width = MUNDO_L; c.height = MUNDO_A;
    const cx = c.getContext("2d");
    cx.imageSmoothingEnabled = false;
    cena.desenhar(cx);
    cena._cache = c;
  }
}

// Entra na cena na hora (sem efeito)
function entrarNaCena(id, x, y) {
  const cena = CENAS[id];
  prepararCena(cena);
  cenaAtual = cena;
  jogador.x = x;
  jogador.y = y;
  inimigos = (cena.inimigos || []).map((e) => criarInimigo(e.tipo, e.x, e.y));
}

// Troca de cena com escurecer/clarear
function mudarCena(id, x, y) {
  if (transicao) return;
  if (!CENAS[id]) { console.warn("Cena não existe: " + id); return; }
  prepararCena(CENAS[id]);
  transicao = { fase: "saindo", t: 0, dest: { id, x, y } };
}

function atualizarTransicao(dt) {
  if (!transicao) return;
  transicao.t += dt;
  if (transicao.t < CONFIG.transicao) return;
  if (transicao.fase === "saindo") {
    entrarNaCena(transicao.dest.id, transicao.dest.x, transicao.dest.y);
    transicao.fase = "entrando";
    transicao.t = 0;
  } else {
    transicao = null;
  }
}

// Dellalos encostou numa saída automática?
function verificarSaidas() {
  if (transicao) return;
  const caixa = caixaDoJogador(jogador.x, jogador.y);
  for (const s of cenaAtual.saidas || []) {
    if (bate(caixa, s.area)) { mudarCena(s.para, s.x, s.y); return; }
  }
}

function desenharCenario() {
  const c = cenaAtual;
  if (c.fundo && c._imgOk) {
    const f = c.fundo;
    ctx.drawImage(c._img, f.x || 0, f.y || 0, f.largura || MUNDO_L, f.altura || MUNDO_A);
  } else if (c._cache) {
    ctx.drawImage(c._cache, 0, 0);
  }
}

function desenharFade() {
  if (!transicao) return;
  const p = Math.min(transicao.t / CONFIG.transicao, 1);
  ctx.fillStyle = "rgba(0,0,0," + (transicao.fase === "saindo" ? p : 1 - p) + ")";
  ctx.fillRect(0, 0, MUNDO_L, MUNDO_A);
}
