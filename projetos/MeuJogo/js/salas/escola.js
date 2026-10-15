/* =====================================================
   salas/escola.js - A sala de aula da escola
   MAPA IMPROVISADO (desenhado com formas simples).
   Para usar uma imagem depois, adicione em CENAS.escola:
     fundo: { arquivos: ["assets/escola.jpg"], x: 0, y: 0, largura: 1200, altura: 896 },
   ===================================================== */

(function () {
  const paredes = [
    { x: 0,    y: 0,   w: 1200, h: 140 },
    { x: 0,    y: 790, w: 1200, h: 106 },
    { x: 0,    y: 0,   w: 100,  h: 896 },
    { x: 1100, y: 0,   w: 100,  h: 896 }
  ];
  const carteiras = [];
  [240, 530, 820].forEach((x) => [300, 500].forEach((y) => carteiras.push({ x: x, y: y, w: 140, h: 64 })));
  const quadro = { x: 380, y: 30, w: 440, h: 110 };

  function desenhar(cx) {
    // Piso quadriculado
    for (let y = 0; y < MUNDO_A; y += 64) {
      for (let x = 0; x < MUNDO_L; x += 64) {
        cx.fillStyle = ((x + y) / 64) % 2 === 0 ? "#c9b48a" : "#bfa97e";
        cx.fillRect(x, y, 64, 64);
      }
    }
    // Paredes
    cx.fillStyle = "#8a7a9a";
    for (const p of paredes) cx.fillRect(p.x, p.y, p.w, p.h);
    cx.fillStyle = "#6f6080"; cx.fillRect(100, 130, 1000, 10);

    // Quadro negro
    cx.fillStyle = "#6b4423"; cx.fillRect(quadro.x - 8, quadro.y - 4, quadro.w + 16, quadro.h - 20);
    cx.fillStyle = "#2b4a3a"; cx.fillRect(quadro.x, quadro.y + 4, quadro.w, quadro.h - 36);
    cx.fillStyle = "#e8e2d0"; cx.font = "bold 36px sans-serif"; cx.textAlign = "center";
    cx.fillText("2 + 2 = ?", quadro.x + quadro.w / 2, quadro.y + 62);

    // Porta de saída (embaixo)
    cx.fillStyle = "#6b4423"; cx.fillRect(540, 790, 120, 60);
    cx.fillStyle = "#3d2412"; cx.fillRect(552, 800, 96, 50);
    cx.fillStyle = "#e0b45a"; cx.fillRect(636, 822, 6, 6);

    // Carteiras
    for (const c of carteiras) {
      cx.fillStyle = "#5c3b1e"; cx.fillRect(c.x, c.y, c.w, c.h);
      cx.fillStyle = "#955f33"; cx.fillRect(c.x + 6, c.y + 6, c.w - 12, c.h - 20);
    }
  }

  CENAS.escola = {
    nome: "Escola",
    desenhar: desenhar,
    combate: true,
    solidos: paredes.concat(carteiras),
    interativos: [
      { nome: "quadro", area: quadro, texto: "O quadro está cheio de contas de matemática." }
    ],
    saidas: [
      { area: { x: 540, y: 735, w: 120, h: 55 }, para: "estrada", x: 1020, y: 425 }
    ],
    inimigos: [
      { tipo: "slime", x: 300, y: 640 },
      { tipo: "slime", x: 900, y: 660 }
    ]
  };
})();
