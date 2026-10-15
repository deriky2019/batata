/* =====================================================
   main.js - O loop do jogo (o último arquivo a carregar)
   Cada quadro: atualizar (lógica) -> desenhar (visual)
   ===================================================== */

function atualizarJogo(dt) {
  // Inventário aberto: o jogo inteiro fica pausado
  if (inventarioAberto) {
    jogador.quadro = 0;
    jogador.tempoAnim = 0;
    return;
  }

  atualizarTransicao(dt);

  // Trocando de lugar: Dellalos e inimigos ficam parados
  if (transicao) {
    jogador.quadro = 0;
    jogador.tempoAnim = 0;
    return;
  }

  atualizarJogador(dt);
  verificarSaidas();
  atualizarInimigos(dt);
  atualizarCombate(dt);
}

let ultimo = performance.now();

function loop(agora) {
  const dt = Math.min((agora - ultimo) / 1000, 0.05);
  ultimo = agora;

  atualizarJogo(dt);   // lógica
  desenhar();          // visual

  requestAnimationFrame(loop);
}

// Começa na sala, na posição inicial de sempre
entrarNaCena("sala", 600, 700);
requestAnimationFrame(loop);
