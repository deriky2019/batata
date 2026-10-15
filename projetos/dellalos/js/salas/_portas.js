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
  quarto:  { x: 6,  y: 9 }     // porta de dentro do quarto do pai
};

// Onde a Dellalos aparece (pés, em pixels) logo DEPOIS de passar por uma porta.
// Fora do prédio: 1 tile abaixo da porta. Dentro: 1 tile para dentro da porta.
const nasceFora = (p) => ({ x: p.x * TILE + TILE / 2, y: (p.y + 1) * TILE + 44 });
const nasceDentroAbaixo = (p) => ({ x: p.x * TILE + TILE / 2, y: (p.y + 1) * TILE + 44 });   // porta na parede de cima
const nasceDentroAcima = (p) => ({ x: p.x * TILE + TILE / 2, y: p.y * TILE - 28 });          // porta na parede de baixo
