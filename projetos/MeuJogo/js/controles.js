/* =====================================================
   controles.js - Teclado e toque (D-pad e botão A)
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
