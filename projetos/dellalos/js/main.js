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

// Se existe save, continua de onde parou; senão começa na sala (js/salas/sala.js)
const salvo = lerSave();
if (salvo) aplicarSave(salvo);
else entrarNaCena("sala", CENAS.sala.spawn.x, CENAS.sala.spawn.y);
anunciarMissaoInicial();   // avisa da missão (js/missoes.js)
requestAnimationFrame(loop);
