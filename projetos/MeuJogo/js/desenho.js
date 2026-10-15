/* =====================================================
   desenho.js - Desenha um quadro do jogo, de trás para frente:
   cenário -> inimigos atrás -> Dellalos -> golpe -> inimigos na frente -> interface
   ===================================================== */

function desenhar() {
  ctx.clearRect(0, 0, MUNDO_L, MUNDO_A);
  desenharCenario();

  // Quem está mais embaixo na tela aparece na frente
  inimigos.filter((i) => i.y <= jogador.y).forEach(desenharInimigo);
  desenharJogador();
  desenharAtaque();
  inimigos.filter((i) => i.y > jogador.y).forEach(desenharInimigo);

  if (!transicao) desenharDica();
  desenharHud();
  desenharFade();
}
