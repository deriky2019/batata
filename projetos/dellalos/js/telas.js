/* =====================================================
   telas.js - Tela inicial (Shadow of War) e tela de morte
   Tela inicial: Continuar (volta de onde parou; fica apagado se não há save) e Do zero (apaga tudo).
   Morte: tela preta com o botão Renascer, que leva a Dellalos para casa com a vida cheia.
   ===================================================== */

let menuAberto = true;     // enquanto for true, o jogo fica pausado e nada é salvo

const menuInicial = document.getElementById("menuInicial");
const btnContinuar = document.getElementById("btnContinuar");
const btnDoZero = document.getElementById("btnDoZero");
const telaMorte = document.getElementById("telaMorte");
const btnRenascer = document.getElementById("btnRenascer");

// ---------- Tela inicial ----------
function mostrarMenuInicial() {
  menuAberto = true;
  menuInicial.hidden = false;
  btnContinuar.disabled = !lerSave();      // sem save: não há onde continuar
  btnDoZero.textContent = "Do zero";
}

function fecharMenuInicial() {
  menuAberto = false;
  menuInicial.hidden = true;
  soltarTudo();
}

function continuarJogo() {
  const dados = lerSave();
  if (!dados) return;
  aguardarCarregamento(function () {       // "Carregando..." até tudo estar pronto (js/carregamento.js)
    fecharMenuInicial();
    aplicarSave(dados);
    anunciarMissaoInicial();
  });
}

// Do zero: apaga o save e recomeça. Se já existe um save, pede para tocar de novo (evita apagar sem querer).
let confirmarZero = null;
function novoJogo() {
  if (lerSave() && !confirmarZero) {
    btnDoZero.textContent = "Apagar tudo? Toque de novo";
    confirmarZero = setTimeout(() => { confirmarZero = null; btnDoZero.textContent = "Do zero"; }, 3000);
    return;
  }
  clearTimeout(confirmarZero);
  confirmarZero = null;
  apagarSave();

  // estado inicial (a tela inicial ainda não mexeu em nada, mas garantimos)
  for (const k in historia) historia[k] = false;
  inventario.slots = [null, null, null, null, null];
  jogador.vida = jogador.vidaMax;
  jogador.invulneravel = 0;

  aguardarCarregamento(function () {
    fecharMenuInicial();
    const sp = CENAS.sala.spawn;
    entrarNaCena("sala", sp.x, sp.y, "baixo");
    anunciarMissaoInicial();
  });
}

btnContinuar.addEventListener("click", continuarJogo);
btnDoZero.addEventListener("click", novoJogo);

// ---------- Morte ----------
let renascerPronto = false;

function morrer() {
  if (jogador.morto) return;
  salvarJogo(true);                 // se fechar o jogo agora, o save já está "em casa, com vida cheia"
  jogador.morto = true;
  soltarTudo();
  renascerPronto = false;
  telaMorte.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => telaMorte.classList.add("visivel")));
  setTimeout(() => { renascerPronto = true; }, 1000);   // espera o botão aparecer
}

function renascer() {
  if (!jogador.morto || !renascerPronto) return;
  const sp = CENAS.sala.spawn;
  jogador.vida = jogador.vidaMax;
  jogador.invulneravel = 2;
  jogador.empurraoT = 0;
  entrarNaCena("sala", sp.x, sp.y, "cima");   // troca na hora, com a tela ainda preta
  jogador.morto = false;
  mostrarMensagem("Você renasceu em casa.");
  telaMorte.classList.remove("visivel");      // a tela preta some devagar
  setTimeout(() => { if (!jogador.morto) telaMorte.hidden = true; }, 900);
}

btnRenascer.addEventListener("click", renascer);

// Teclado: Enter escolhe o botão principal de cada tela
window.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || e.repeat) return;
  if (menuAberto) { if (!btnContinuar.disabled) continuarJogo(); else novoJogo(); }
  else if (jogador.morto) renascer();
});
