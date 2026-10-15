/* =====================================================
   main.js - O loop do jogo (o último arquivo a carregar)
   Cada quadro: atualizar (lógica) -> desenhar (visual)
   ===================================================== */

function atualizarJogo(dt) {
  // Conversa aberta: o jogo fica pausado (só o texto aparecendo)
  if (dialogoAberto) {
    atualizarDialogo(dt);
    jogador.quadro = 0;
    jogador.tempoAnim = 0;
    return;
  }

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
  atualizarCamera();   // a câmera segue a Dellalos
  desenhar();          // visual

  requestAnimationFrame(loop);
}

// Começa na sala, no lugar inicial definido na própria sala (js/salas/sala.js)
entrarNaCena("sala", CENAS.sala.spawn.x, CENAS.sala.spawn.y);
requestAnimationFrame(loop);
