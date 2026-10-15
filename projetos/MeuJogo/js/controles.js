/* =====================================================
   controles.js - Teclado e toque (D-pad, botão A e botão B)
   ===================================================== */

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
  // Teclado: Espaço = A (ataca) | Enter ou E = B (interage)
  if (e.key === " " && !e.repeat) { acaoA(); e.preventDefault(); }
  if ((e.key === "Enter" || e.key === "e" || e.key === "E") && !e.repeat) { acaoB(); e.preventDefault(); }
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
ligarBotaoDeAcao(document.getElementById("botaoB"), () => acaoB());   // B = interage

// Bloqueia rolagem/gestos no resto da tela
document.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
