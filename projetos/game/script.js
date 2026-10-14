
const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");

ctx.imageSmoothingEnabled = false;

// Carregar a sprite sheet
const personagem = new Image();
personagem.src = "assets/dellalos.png";

// A imagem tem 4 colunas e 4 linhas
const COLUNAS = 4;
const LINHAS = 4;

// Dados da protagonista
const jogador = {
  x: 304,
    y: 224,
      largura: 32,
        altura: 32,
          velocidade: 150,
            direcao: 0,
              quadro: 0,
                tempoAnimacao: 0,
                  andando: false
                  };

                  // Linhas da sprite sheet:
                  // 0 = baixo
                  // 1 = esquerda
                  // 2 = direita
                  // 3 = cima

                  const teclas = {};
                  const botoes = {};

                  let ultimoTempo = 0;

                  // Fundo provisório
                  function desenharCenario() {
                    ctx.fillStyle = "#8cbd65";
                      ctx.fillRect(0, 0, canvas.width, canvas.height);

                        ctx.fillStyle = "#7eae59";

                          for (let y = 16; y < canvas.height; y += 32) {
                              for (let x = 16; x < canvas.width; x += 32) {
                                    ctx.fillRect(x, y, 2, 2);
                                        }
                                          }
                                          }

                                          // Desenhar apenas um quadro da sprite sheet
                                          function desenharPersonagem() {
                                            if (!personagem.complete ||
                                                  personagem.naturalWidth === 0) {
                                                      return;
                                                        }

                                                          const larguraQuadro =
                                                              personagem.naturalWidth / COLUNAS;

                                                                const alturaQuadro =
                                                                    personagem.naturalHeight / LINHAS;

                                                                      const origemX =
                                                                          jogador.quadro * larguraQuadro;

                                                                            const origemY =
                                                                                jogador.direcao * alturaQuadro;

                                                                                  ctx.drawImage(
                                                                                      personagem,
                                                                                          origemX,
                                                                                              origemY,
                                                                                                  larguraQuadro,
                                                                                                      alturaQuadro,
                                                                                                          Math.round(jogador.x),
                                                                                                              Math.round(jogador.y),
                                                                                                                  jogador.largura,
                                                                                                                      jogador.altura
                                                                                                                        );
                                                                                                                        }

                                                                                                                        // Atualizar movimento
                                                                                                                        function atualizar(delta) {
                                                                                                                          let dx = 0;
                                                                                                                            let dy = 0;

                                                                                                                              if (teclas.ArrowUp || teclas.w || botoes.cima) {
                                                                                                                                  dy = -1;
                                                                                                                                    }

                                                                                                                                      if (teclas.ArrowDown || teclas.s || botoes.baixo) {
                                                                                                                                          dy = 1;
                                                                                                                                            }

                                                                                                                                              if (teclas.ArrowLeft || teclas.a || botoes.esquerda) {
                                                                                                                                                  dx = -1;
                                                                                                                                                    }

                                                                                                                                                      if (teclas.ArrowRight || teclas.d || botoes.direita) {
                                                                                                                                                          dx = 1;
                                                                                                                                                            }

                                                                                                                                                              jogador.andando = dx !== 0 || dy !== 0;

                                                                                                                                                                if (jogador.andando) {
                                                                                                                                                                    const tamanho = Math.hypot(dx, dy);

                                                                                                                                                                        dx /= tamanho;
                                                                                                                                                                            dy /= tamanho;

                                                                                                                                                                                jogador.x += dx * jogador.velocidade * delta;
                                                                                                                                                                                    jogador.y += dy * jogador.velocidade * delta;

                                                                                                                                                                                        // Escolher a direção
                                                                                                                                                                                            if (Math.abs(dx) > Math.abs(dy)) {
                                                                                                                                                                                                  jogador.direcao = dx < 0 ? 1 : 2;
                                                                                                                                                                                                      } else {
                                                                                                                                                                                                            jogador.direcao = dy < 0 ? 3 : 0;
                                                                                                                                                                                                                }

                                                                                                                                                                                                                    // Animação de caminhada
                                                                                                                                                                                                                        jogador.tempoAnimacao += delta;

                                                                                                                                                                                                                            if (jogador.tempoAnimacao >= 0.12) {
                                                                                                                                                                                                                                  jogador.quadro = (jogador.quadro + 1) % 4;
                                                                                                                                                                                                                                        jogador.tempoAnimacao = 0;
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                              } else {
                                                                                                                                                                                                                                                  jogador.quadro = 0;
                                                                                                                                                                                                                                                      jogador.tempoAnimacao = 0;
                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                          // Limites da tela
                                                                                                                                                                                                                                                            jogador.x = Math.max(
                                                                                                                                                                                                                                                                0,
                                                                                                                                                                                                                                                                    Math.min(canvas.width - jogador.largura, jogador.x)
                                                                                                                                                                                                                                                                      );

                                                                                                                                                                                                                                                                        jogador.y = Math.max(
                                                                                                                                                                                                                                                                            0,
                                                                                                                                                                                                                                                                                Math.min(canvas.height - jogador.altura, jogador.y)
                                                                                                                                                                                                                                                                                  );
                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                  // Loop principal
                                                                                                                                                                                                                                                                                  function loop(tempoAtual) {
                                                                                                                                                                                                                                                                                    const delta = Math.min(
                                                                                                                                                                                                                                                                                        (tempoAtual - ultimoTempo) / 1000,
                                                                                                                                                                                                                                                                                            0.05
                                                                                                                                                                                                                                                                                              );

                                                                                                                                                                                                                                                                                                ultimoTempo = tempoAtual;

                                                                                                                                                                                                                                                                                                  atualizar(delta);
                                                                                                                                                                                                                                                                                                    desenharCenario();
                                                                                                                                                                                                                                                                                                      desenharPersonagem();

                                                                                                                                                                                                                                                                                                        requestAnimationFrame(loop);
                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                        // Teclado
                                                                                                                                                                                                                                                                                                        window.addEventListener("keydown", (evento) => {
                                                                                                                                                                                                                                                                                                          const tecla = evento.key.toLowerCase();

                                                                                                                                                                                                                                                                                                            if (tecla.startsWith("arrow")) {
                                                                                                                                                                                                                                                                                                                evento.preventDefault();
                                                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                                                    teclas[tecla] = true;
                                                                                                                                                                                                                                                                                                                    });

                                                                                                                                                                                                                                                                                                                    window.addEventListener("keyup", (evento) => {
                                                                                                                                                                                                                                                                                                                      teclas[evento.key.toLowerCase()] = false;
                                                                                                                                                                                                                                                                                                                      });

                                                                                                                                                                                                                                                                                                                      // Botões de toque
                                                                                                                                                                                                                                                                                                                      document.querySelectorAll("[data-direcao]").forEach((botao) => {
                                                                                                                                                                                                                                                                                                                        const direcao = botao.dataset.direcao;

                                                                                                                                                                                                                                                                                                                          function pressionar(evento) {
                                                                                                                                                                                                                                                                                                                              evento.preventDefault();
                                                                                                                                                                                                                                                                                                                                  botoes[direcao] = true;

                                                                                                                                                                                                                                                                                                                                      if (botao.setPointerCapture) {
                                                                                                                                                                                                                                                                                                                                            botao.setPointerCapture(evento.pointerId);
                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                                                                                                    function soltar(evento) {
                                                                                                                                                                                                                                                                                                                                                        evento.preventDefault();
                                                                                                                                                                                                                                                                                                                                                            botoes[direcao] = false;
                                                                                                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                                                                                                botao.addEventListener("pointerdown", pressionar);
                                                                                                                                                                                                                                                                                                                                                                  botao.addEventListener("pointerup", soltar);
                                                                                                                                                                                                                                                                                                                                                                    botao.addEventListener("pointercancel", soltar);
                                                                                                                                                                                                                                                                                                                                                                      botao.addEventListener("lostpointercapture", soltar);
                                                                                                                                                                                                                                                                                                                                                                      });

                                                                                                                                                                                                                                                                                                                                                                      // Mensagens de carregamento
                                                                                                                                                                                                                                                                                                                                                                      personagem.onload = () => {
                                                                                                                                                                                                                                                                                                                                                                        status.textContent =
                                                                                                                                                                                                                                                                                                                                                                            "Personagem carregada! Use os botões para andar.";
                                                                                                                                                                                                                                                                                                                                                                            };

                                                                                                                                                                                                                                                                                                                                                                            personagem.onerror = () => {
                                                                                                                                                                                                                                                                                                                                                                              status.textContent =
                                                                                                                                                                                                                                                                                                                                                                                  "Erro: confira assets/personagem.png";
                                                                                                                                                                                                                                                                                                                                                                                  };

                                                                                                                                                                                                                                                                                                                                                                                  // Iniciar o jogo
                                                                                                                                                                                                                                                                                                                                                                                  requestAnimationFrame(loop);
