/* =====================================================
   telatempo.js - Tela preta que aparece e some (passagem de tempo)
   iniciarTelaTempo("Mais tarde...", aoFim, 2)
     texto  -> frase que aparece no meio da tela escura
     aoFim  -> (opcional) função chamada quando a tela termina
     duracao-> segundos no total (padrão 2): escurece, fica preta um instante, clareia
   Enquanto ela está na tela, o jogo fica pausado e os botões somem.
   ===================================================== */

let telaTempo = null;   // { texto, t, duracao, aoFim }

function iniciarTelaTempo(texto, aoFim, duracao) {
  telaTempo = { texto: texto || "", t: 0, duracao: duracao || 2, aoFim: aoFim || null };
  soltarTudo();
  document.body.classList.add("tela-tempo");
}

function atualizarTelaTempo(dt) {
  if (!telaTempo) return;
  telaTempo.t += dt;
  if (telaTempo.t < telaTempo.duracao) return;
  const fim = telaTempo.aoFim;
  telaTempo = null;
  document.body.classList.remove("tela-tempo");
  if (fim) fim();
}

function desenharTelaTempo() {
  if (!telaTempo) return;
  const p = telaTempo.t / telaTempo.duracao;
  // 35% escurecendo, 30% toda preta, 35% clareando
  const a = p < 0.35 ? p / 0.35 : (p > 0.65 ? (1 - p) / 0.35 : 1);
  ctx.setTransform(ESCALA, 0, 0, ESCALA, 0, 0);
  ctx.fillStyle = "rgba(0,0,0," + Math.max(0, Math.min(1, a)) + ")";
  ctx.fillRect(0, 0, VIEW_L, VIEW_A);
  ctx.fillStyle = "rgba(243,230,200," + Math.max(0, Math.min(1, a)) + ")";
  ctx.font = "bold 44px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(telaTempo.texto, VIEW_L / 2, VIEW_A / 2 + 14, VIEW_L - 60);
}
