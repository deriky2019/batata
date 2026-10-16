/* =====================================================
   main.js - O loop do jogo (o último arquivo a carregar)
   Cada quadro: atualizar (lógica) -> desenhar (visual)
   ===================================================== */

function atualizarJogo(dt) {
  // Tela inicial ou tela de morte: o jogo fica pausado
  if (menuAberto || jogador.morto) {
    jogador.quadro = 0;
    jogador.tempoAnim = 0;
    return;
  }

  // Conversa aberta: o jogo fica pausado (só o texto aparecendo)
  if (dialogoAberto) {
    atualizarDialogo(dt);
    jogador.quadro = 0;
    jogador.tempoAnim = 0;
    return;
  }

  // Tela preta de passagem de tempo: o jogo fica pausado
  if (telaTempo) {
    atualizarTelaTempo(dt);
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
  atualizarNpcs(dt);
  verificarSaidas();
  atualizarInimigos(dt);
  atualizarCombate(dt);
  verificarMissoes();   // conclui missões sozinhas e dispara pequenos eventos (js/missoes.js)
}

let ultimo = performance.now();

function loop(agora) {
  const dt = Math.min((agora - ultimo) / 1000, 0.05);
  ultimo = agora;

  atualizarJogo(dt);   // lógica
  atualizarCamera();   // a câmera segue a Dellalos
  atualizarSalvamento(dt);   // salva o progresso de tempos em tempos
  desenhar();          // visual

  requestAnimationFrame(loop);
}

// Abrir com ?novo no endereço apaga o save e começa do zero
if (location.search.indexOf("novo") !== -1) apagarSave();

// O jogo começa na sala só como "fundo" da tela inicial (js/telas.js).
// Quem decide o que acontece é o botão Continuar ou Do zero.
entrarNaCena("sala", CENAS.sala.spawn.x, CENAS.sala.spawn.y);
iniciarCarregamento();   // começa a baixar/preparar todas as imagens já na tela inicial (js/carregamento.js)
mostrarMenuInicial();
requestAnimationFrame(loop);
