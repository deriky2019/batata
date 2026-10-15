/* =====================================================
   config.js - Valores que você pode mudar à vontade
   + o canvas (a "tela" do jogo)
   ===================================================== */

const CONFIG = {
  velocidade: 260,          // pixels por segundo (mude para andar mais rápido/devagar)
  alturaPersonagem: 170,    // altura de UM quadro de Dellalos (os quadros são quadrados)
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

// O mundo usa as MESMAS medidas da Sala.jpg (1200 x 896)
const MUNDO_L = 1200;
const MUNDO_A = 896;

const canvas = document.getElementById("jogo");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;   // mantém os pixels nítidos
