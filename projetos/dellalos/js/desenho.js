/* =====================================================
   desenho.js - Desenha um quadro do jogo, de trás para frente:
   cor de fora -> chão e objetos do mapa -> (inimigos, NPCs e Dellalos por altura)
   -> topo do mapa (copas das árvores) -> dica -> interface -> conversa -> fade
   O mundo é desenhado deslocado pela CÂMERA (camera.x, camera.y).
   ===================================================== */

function desenhar() {
  ctx.setTransform(ESCALA, 0, 0, ESCALA, 0, 0);
  ctx.fillStyle = cenaAtual.corFora || "#000";
  ctx.fillRect(0, 0, VIEW_L, VIEW_A);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  desenharCenario();

  // Quem está mais embaixo na tela aparece na frente
  const seres = [];
  inimigos.forEach((i) => seres.push({ y: i.y, desenhar: () => desenharInimigo(i) }));
  (cenaAtual.npcs || []).forEach((n) => seres.push({ y: n.y, desenhar: () => desenharNpc(n) }));
  seres.push({ y: jogador.y, desenhar: () => { desenharJogador(); desenharAtaque(); } });
  seres.sort((a, b) => a.y - b.y).forEach((s) => s.desenhar());

  desenharTopo();                         // copas das árvores ficam POR CIMA de quem passa atrás
  if (!transicao && !dialogoAberto) desenharDica();
  ctx.restore();

  desenharHud();
  desenharDialogo();
  desenharFade();
  desenharTelaTempo();
}
