/* =====================================================
   config.js - Valores que você pode mudar à vontade
   + o canvas (a "tela" do jogo)
   ===================================================== */

const CONFIG = {
  velocidade: 260,          // pixels por segundo (mude para andar mais rápido/devagar)
  alturaPersonagem: 128,    // altura de UM quadro de Dellalos (os quadros são quadrados) = 2 tiles
  margemAcao: 40,           // distância máxima para o botão B "alcançar" um objeto
  transicao: 0.25,          // segundos do escurecer/clarear ao trocar de lugar

  // SPRITESHEET: dellalos.jpg tem 4 colunas x 4 linhas de quadros.
  sprite: {
    colunas: 4,
    linhas: 4,
    tempoPorQuadro: 0.14,   // segundos em cada quadro da caminhada
    pes: 0.93,              // onde ficam os pés dentro do quadro (0 = topo, 1 = base)
    animacoes: {
      baixo:    { linha: 0, quadros: [0, 1, 2, 3] },
      cima:     { linha: 1, quadros: [2, 3] },
      esquerda: { linha: 2, quadros: [0, 1, 2, 3] },
      direita:  { linha: 3, quadros: [0, 1, 2, 3] }
    }
  },

  // VIDA da Dellalos
  jogador: {
    vidaMax: 5,                 // quantidade de corações
    invulnerabilidade: 1.0,     // segundos sem levar dano depois de ser atingida
    empurraoTempo: 0.12,        // segundos de empurrão ao levar dano
    empurraoVelocidade: 320
  },

  // ATAQUE (botão A, em lugares com combate)
  combate: {
    dano: 1,
    alcance: 70,       // distância do golpe a partir do corpo
    tamanho: 100,      // tamanho da área do golpe
    duracao: 0.22,     // quanto tempo o golpe aparece
    recarga: 0.4       // tempo mínimo entre um golpe e outro
  }
};

// Cada quadradinho (tile) do mapa mede 64 x 64 no jogo.
// (o kit Kenney tem tiles de 16x16 pixels, ampliados 4 vezes)
const TILE = 64;

const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;   // mantém os pixels nítidos

// TELA CHEIA + CÂMERA: o canvas ocupa a tela toda e mostra só um pedaço do mapa.
// VISAO_TILES = quantos tiles cabem no lado MENOR da tela (aumente para ver mais mapa).
let VISAO_TILES = 12;
let ESCALA = 1;                          // pixels reais da tela por unidade do jogo
let VIEW_L = 1200, VIEW_A = 800;         // tamanho da tela, em unidades do jogo

function ajustarTela() {
  const dpr = window.devicePixelRatio || 1;
  const pw = Math.max(1, Math.round((window.innerWidth || 1200) * dpr));
  const ph = Math.max(1, Math.round((window.innerHeight || 800) * dpr));
  // cada tile do kit (16 px) é ampliado um número INTEIRO de vezes: sem fendas entre os tiles
  const k = Math.max(2, Math.round(Math.min(pw, ph) / (16 * VISAO_TILES)));
  ESCALA = k / 4;
  VIEW_L = pw / ESCALA;
  VIEW_A = ph / ESCALA;
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  ctx.imageSmoothingEnabled = false;     // mudar o tamanho do canvas zera isso
}
window.addEventListener("resize", ajustarTela);
window.addEventListener("orientationchange", ajustarTela);
ajustarTela();
