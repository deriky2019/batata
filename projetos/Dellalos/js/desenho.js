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
  ctx.translate(-camera.x + efeitos.tremX, -camera.y + efeitos.tremY);   // tremor de tela (js/efeitos.js)
  desenharCenario();
  desenharSegredos();                     // brilhos e caixotes dos segredos (js/exploracao.js)
  if (typeof desenharMarcaCapela === "function") desenharMarcaCapela();   // letras JPMLR na parede da capela (js/salas/capela.js)

  desenharRastros();                      // rastro da esquiva (js/efeitos.js)

  // Quem está mais embaixo na tela aparece na frente
  const seres = [];
  inimigos.forEach((i) => seres.push({ y: i.y, desenhar: () => desenharInimigo(i) }));
  (cenaAtual.npcs || []).filter(npcAtivo).forEach((n) => seres.push({ y: n.y, desenhar: () => desenharNpc(n) }));
  const comp = companheiroParaDesenhar();   // companheiro de amizade (js/amizade.js)
  if (comp) seres.push({ y: comp.y, desenhar: () => desenharCompanheiro(comp) });
  if (typeof aliadosV78Seres === "function") aliadosV78Seres(seres);   // v78: aliados do dia 15 (js/vinculos_gameplay_v78.js)
  seres.push({ y: jogador.y, desenhar: () => { desenharJogador(); desenharAtaque(); desenharHabilidade(); } });
  seres.sort((a, b) => a.y - b.y).forEach((s) => s.desenhar());
  if (typeof desenharConversasNpcs === "function") desenharConversasNpcs(); // balões de conversas espontâneas entre NPCs (v50)
  desenharProjeteis();                    // tiros dos robôs e do chefe (js/inimigos.js)
  desenharEfeitos();                      // avisos de ataque, faíscas e números de dano (js/efeitos.js)

  desenharTopo();                         // copas das árvores ficam POR CIMA de quem passa atrás
  if (typeof desenharHUDTorneio === "function") desenharHUDTorneio();
  desenharBolhaCompanheiro();             // fala do companheiro durante o passeio (js/exploracao.js)
  if (!transicao && !dialogoAberto) desenharDica();
  ctx.restore();

  if (typeof desenharEscuridaoMansao === "function") desenharEscuridaoMansao();   // lanterna na mansão da Zona Oeste (js/salas/mansao.js)
  desenharNoite();                        // escurece a estrada na noite do dia 4 (js/dias.js)
  desenharCicloDia();                     // escurece ao ar livre no ciclo de dia e noite (js/ciclo.js)
  desenharChuva();                        // chuva por cima do cenário, antes da interface (js/chuva.js)
  desenharHud();
  desenharFlashDano();                    // flash vermelho e vinheta de pouca vida (js/efeitos.js)
  desenharBarraChefe();                   // vida do chefe, quando há luta (js/inimigos.js)
  desenharDialogo();
  desenharFade();
  desenharTelaTempo();
}
