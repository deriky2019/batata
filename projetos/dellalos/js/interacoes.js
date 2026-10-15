/* =====================================================
   interacoes.js - O que os botões A e B fazem
   A = ataca (em lugares com combate)
   B = interage (portas, objetos, conversas, avançar texto)
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

// Botão A = ATACA (só em lugares com combate)
function acaoA() {
  if (inventarioAberto || transicao || dialogoAberto) return;   // inventário aberto ou trocando de lugar: não faz nada
  if (cenaAtual.combate) iniciarAtaque();
}

// Botão B = INTERAGE com o ambiente
//   1) Durante uma conversa: avança a fala
//   2) Se há uma mensagem na tela: fecha ela
//   3) Perto de um NPC: começa a conversa
//   4) Perto de um objeto: fala ou leva a outra cena (porta)
//   5) Senão: "Nada por aqui."
function acaoB() {
  if (inventarioAberto || transicao) return;

  if (dialogoAberto) { avancarDialogo(); return; }
  if (mensagemVisivel()) { fecharMensagem(); return; }

  const obj = objetoAlcancavel();
  if (obj) {
    if (obj.conversar) obj.conversar();
    else if (obj.destino) mudarCena(obj.destino.cena, obj.destino.x, obj.destino.y);
    else mostrarMensagem(obj.texto);
    return;
  }
  mostrarMensagem("Nada por aqui.");
}
