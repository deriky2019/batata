/* =====================================================
   salas/sala.js - A sala da casa (usa assets/Sala.jpg)
   Medidas em pixels da Sala.jpg (1200 x 896).
   ===================================================== */

(function () {
  // Paredes (a parte bege em volta do piso de madeira)
  const paredes = [
    { x: 0,    y: 0,   w: 1200, h: 160 },   // parede de cima
    { x: 0,    y: 785, w: 1200, h: 111 },   // parede de baixo
    { x: 0,    y: 0,   w: 118,  h: 896 },   // parede da esquerda
    { x: 1082, y: 0,   w: 118,  h: 896 }    // parede da direita (a porta fica nela)
  ];

  const sofa  = { x: 245, y: 105, w: 235, h: 160 };   // sofá verde
  const mesa  = { x: 822, y: 388, w: 78,  h: 184 };   // mesa com o livro
  const porta = { x: 1075, y: 340, w: 90, h: 190 };   // porta na parede da direita

  CENAS.sala = {
    nome: "Sala",
    fundo: { arquivos: ["assets/Sala.jpg"], x: 0, y: 0, largura: 1200, altura: 896 },
    combate: false,
    solidos: paredes.concat([sofa, mesa]),
    interativos: [
      { nome: "sofa",  area: sofa,  texto: "Não posso dormir, tenho que ir para a escola." },
      { nome: "livro", area: mesa,  texto: "Um livro velho do papai." },
      // A porta leva para a estrada. Para voltar a "Ainda não disponível",
      // troque a linha abaixo por: texto: "Ainda não disponível."
      { nome: "porta", area: porta, destino: { cena: "estrada", x: 150, y: 420 } }
    ],
    saidas: [],
    inimigos: []
  };
})();
