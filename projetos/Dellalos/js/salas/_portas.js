/* =====================================================
   salas/_portas.js - Onde ficam as portas entre os lugares (em TILES)
   Assim a estrada, a sala e a escola concordam sobre onde cada porta está.
   Se mudar uma porta de lugar, mude aqui E no mapa do lugar.
   ===================================================== */

const PORTAS = {
  casa:    { x: 9,  y: 15 },   // porta da casa da Dellalos, na estrada
  casaMeio:{ x: 27, y: 15 },   // porta da casa do meio (ainda trancada)
  escola:  { x: 52, y: 15 },   // porta da escola, na estrada
  sala:    { x: 9,  y: 11 },   // porta de dentro da casa da Dellalos
  hall:    { x: 14, y: 13 },   // porta de entrada de dentro da escola
  aula:    { x: 10, y: 12 },   // porta de dentro de cada sala de aula
  quartoPai:{ x: 11, y: 2 },   // porta do quarto do pai, na parede de cima da sala da casa
  quarto:  { x: 6,  y: 9 },    // porta de dentro do quarto do pai
  loja:    { x: 18, y: 15 },   // porta da loja, na estrada (casa nova entre a casa da Dellalos e a casa do meio)
  lojaDentro: { x: 6, y: 9 },  // porta de dentro da loja
  bairroSul:   { x: 36, y: 39 },   // saída SUL da cidade (estrada): meio da rua vertical -> leva ao Bairro Sul
  bairroNorte: { x: 24, y: 0 },    // entrada NORTE do Bairro Sul: meio da rua principal (mesmo alinhamento da estrada)
  lesteSaida:   { x: 63, y: 22 },  // saída LESTE da cidade (estrada): fim da avenida -> leva à Zona Leste
  lesteEntrada: { x: 0,  y: 22 },  // entrada OESTE da Zona Leste: meio da avenida (mesmo alinhamento da estrada)
  fabrica:      { x: 44, y: 10 },  // porta da fábrica, na Zona Leste (fica trancada até o Orlando ter as 3 engrenagens)
  fabricaDentro:{ x: 21, y: 32 },  // porta de dentro da fábrica (hall de entrada)
  norteSaida:   { x: 36, y: 0 },   // saída NORTE da cidade (estrada): fim da rua vertical -> leva à Zona Norte
  capela:       { x: 28, y: 10 },  // porta da capela da colina, na Zona Norte
  capelaDentro: { x: 11, y: 19 },  // porta de dentro da capela
  norteEntrada: { x: 28, y: 47 },  // entrada SUL da Zona Norte: meio da estrada de entrada (mesmo alinhamento da rua da cidade)
  oesteSaida:   { x: 0,  y: 22 },  // saída OESTE da cidade (estrada): começo da avenida, a oeste -> leva à Zona Oeste
  oesteEntrada: { x: 63, y: 22 },
  necro:        { x: 19, y: 15 },  // porta da loja NECRO, na Zona Leste (a fachada só aparece de NOITE)
  necroDentro:  { x: 6,  y: 9 }    // porta de dentro da loja NECRO   // entrada LESTE da Zona Oeste: meio da avenida (mesmo alinhamento da estrada)
};

// Onde a Dellalos aparece (pés, em pixels) logo DEPOIS de passar por uma porta.
// Fora do prédio: 1 tile abaixo da porta. Dentro: 1 tile para dentro da porta.
const nasceFora = (p) => ({ x: p.x * TILE + TILE / 2, y: (p.y + 1) * TILE + 44 });
const nasceDentroAbaixo = (p) => ({ x: p.x * TILE + TILE / 2, y: (p.y + 1) * TILE + 44 });   // porta na parede de cima
const nasceDentroAcima = (p) => ({ x: p.x * TILE + TILE / 2, y: p.y * TILE - 28 });          // porta na parede de baixo
