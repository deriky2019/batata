/* =====================================================
   interacoes.js - O que o botão A faz
   1) Perto de um objeto interativo: fala ou leva a outra cena
   2) Senão, em lugar com combate: ataca
   3) Senão: "Nada por aqui."
   ===================================================== */

// Procura o objeto interativo mais próximo que Dellalos consegue alcançar
function objetoAlcancavel() {
  const c = caixaDoJogador(jogador.x, jogador.y);
  const m = CONFIG.margemAcao;
  const alcance = { x: c.x - m, y: c.y - m, w: c.w + m * 2, h: c.h + m * 2 };
  const cx = c.x + c.w / 2, cy = c.y + c.h / 2;

  let melhor = null, melhorDist = Infinity;
  for (const obj of cenaAtual.interativos || []) {
    if (!bate(alcance, obj.area)) continue;
    const ax = obj.area.x + obj.area.w / 2, ay = obj.area.y + obj.area.h / 2;
    const d = Math.hypot(ax - cx, ay - cy);
    if (d < melhorDist) { melhorDist = d; melhor = obj; }
  }
  return melhor;
}

function acao() {
  if (inventarioAberto || transicao) return;   // com o inventário aberto ou trocando de lugar, o A não faz nada

  const obj = objetoAlcancavel();
  if (obj) {
    if (obj.destino) mudarCena(obj.destino.cena, obj.destino.x, obj.destino.y);
    else mostrarMensagem(obj.texto);
    return;
  }
  if (cenaAtual.combate) iniciarAtaque();
  else mostrarMensagem("Nada por aqui.");
}
