/* =====================================================
   controles.js - Teclado e toque (D-pad, botão A e botão B)
   ===================================================== */

let aSegurando = false;   // o botão A (ou Espaço) está sendo segurado? (js/habilidade.js usa isto)
const teclado = { up: false, down: false, left: false, right: false };
const toque   = { up: false, down: false, left: false, right: false };

// Correr: TOQUE DUPLO no D-pad (toque, solte e toque de novo; segure a segunda vez para correr) ou a tecla Shift (teclado). Quem decide o resto é atualizarCorrida (js/jogador.js)
const correrPedido = { teclado: false, toque: false };
const ultimoToqueDir = {};            // quando cada direção do D-pad foi tocada pela última vez
const TEMPO_TOQUE_DUPLO = 300;        // milissegundos entre os dois toques

const MAPA_TECLAS = {
  ArrowUp: "up", w: "up", W: "up",
  ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "left", a: "left", A: "left",
  ArrowRight: "right", d: "right", D: "right"
};

window.addEventListener("keydown", (e) => {
  if (e.key === "Shift") correrPedido.teclado = true;
  const dir = MAPA_TECLAS[e.key];
  if (dir) { teclado[dir] = true; e.preventDefault(); }
  // Teclado: Espaço = A (ataca) | Enter ou E = B (interage)
  if (e.key === " ") { aSegurando = true; if (!e.repeat) acaoA(); e.preventDefault(); }
  // Teclado: K = C (esquiva)
  if ((e.key === "k" || e.key === "K") && !e.repeat && !/^(TEXTAREA|INPUT|SELECT)$/.test((e.target && e.target.tagName) || "")) { acaoC(); e.preventDefault(); }
  if ((e.key === "Enter" || e.key === "e" || e.key === "E") && !e.repeat) { acaoB(); e.preventDefault(); }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "Shift") correrPedido.teclado = false;
  if (e.key === " ") aSegurando = false;
  const dir = MAPA_TECLAS[e.key];
  if (dir) { teclado[dir] = false; e.preventDefault(); }
});

// Se a janela perder o foco, solta tudo (evita ficar andando sozinho)
function soltarTudo() {
  for (const k in teclado) teclado[k] = false;
  for (const k in toque) toque[k] = false;
  correrPedido.teclado = false; correrPedido.toque = false;
  aSegurando = false;
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
    // Toque duplo: segundo toque a menos de 300 ms do anterior, na mesma direção, vira corrida enquanto segurar
    const agora = performance.now();
    if (agora - (ultimoToqueDir[dir] ?? -9999) < TEMPO_TOQUE_DUPLO) correrPedido.toque = true;
    ultimoToqueDir[dir] = agora;
  };
  const soltar = () => {
    toque[dir] = false;
    botao.classList.remove("ativo");
    correrPedido.toque = false;
  };

  botao.addEventListener("pointerdown", apertar);
  botao.addEventListener("pointerup", soltar);
  botao.addEventListener("pointercancel", soltar);
  botao.addEventListener("lostpointercapture", soltar);
  botao.addEventListener("contextmenu", (e) => e.preventDefault());
});

// Botões A e B (mesma lógica, cada um chama a sua função)
function ligarBotaoDeAcao(botao, funcao) {
  botao.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    botao.setPointerCapture(e.pointerId);
    botao.classList.add("ativo");
    funcao();
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((nome) => {
    botao.addEventListener(nome, () => botao.classList.remove("ativo"));
  });
  botao.addEventListener("contextmenu", (e) => e.preventDefault());
}
ligarBotaoDeAcao(document.getElementById("botaoA"), () => acaoA());   // A = ataca
// Botão A segurado: a habilidade do grimório carrega enquanto estiver apertado (js/habilidade.js)
(function () {
  const a = document.getElementById("botaoA");
  a.addEventListener("pointerdown", () => { aSegurando = true; });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((n) => a.addEventListener(n, () => { aSegurando = false; }));
})();
ligarBotaoDeAcao(document.getElementById("botaoB"), () => acaoB());   // B = interage
ligarBotaoDeAcao(document.getElementById("botaoC"), () => acaoC());   // C = esquiva

// Bloqueia rolagem/gestos no resto da tela
// (exceto dentro do painel do inventário, que precisa rolar quando tem muitos itens/notificações)
document.addEventListener("touchmove", (e) => {
  if (e.target.closest && e.target.closest("#inventario .inv-painel, #loja .loja-painel")) return;
  e.preventDefault();
}, { passive: false });
