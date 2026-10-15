/* =====================================================
   salas/estrada.js - A estrada entre a casa e a escola
   MAPA IMPROVISADO (desenhado com formas simples).
   Para usar uma imagem depois, adicione em CENAS.estrada:
     fundo: { arquivos: ["assets/estrada.jpg"], x: 0, y: 0, largura: 1200, altura: 896 },
   ===================================================== */

(function () {
  const bordas = [
    { x: 0,    y: 0,   w: 1200, h: 70 },
    { x: 0,    y: 830, w: 1200, h: 66 },
    { x: 0,    y: 0,   w: 40,   h: 896 },
    { x: 1160, y: 0,   w: 40,   h: 896 }
  ];
  const casa    = { x: 40,  y: 150, w: 230, h: 190 };
  const escola  = { x: 870, y: 90,  w: 290, h: 240 };
  const arvores = [
    { x: 420, y: 210 }, { x: 640, y: 150 }, { x: 740, y: 270 }, { x: 330, y: 660 },
    { x: 560, y: 720 }, { x: 880, y: 640 }, { x: 1020, y: 760 }, { x: 130, y: 720 }
  ];
  const troncos = arvores.map((a) => ({ x: a.x - 30, y: a.y - 10, w: 60, h: 50 }));

  function desenhar(cx) {
    // Grama com pontinhos
    cx.fillStyle = "#5a8f3c"; cx.fillRect(0, 0, MUNDO_L, MUNDO_A);
    let s = 7;
    const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
    for (let n = 0; n < 260; n++) {
      cx.fillStyle = rnd() > 0.5 ? "#4f8234" : "#68a046";
      cx.fillRect(rnd() * MUNDO_L, rnd() * MUNDO_A, 8, 8);
    }
    // Estrada
    cx.fillStyle = "#707076"; cx.fillRect(0, 380, MUNDO_L, 180);
    cx.fillStyle = "#55555b"; cx.fillRect(0, 380, MUNDO_L, 8); cx.fillRect(0, 552, MUNDO_L, 8);
    cx.fillStyle = "#e8e2b8";
    for (let x = 10; x < MUNDO_L; x += 90) cx.fillRect(x, 466, 48, 8);
    // Caminhos de terra até as portas
    cx.fillStyle = "#a58a5c";
    cx.fillRect(120, 340, 80, 40);
    cx.fillRect(985, 330, 70, 50);
    // Cercas vivas nas bordas
    cx.fillStyle = "#2d5e29";
    for (const b of bordas) cx.fillRect(b.x, b.y, b.w, b.h);

    // Casa
    cx.fillStyle = "#d9c9a0"; cx.fillRect(casa.x, casa.y + 70, casa.w, casa.h - 70);
    cx.fillStyle = "#a5563a"; cx.fillRect(casa.x - 10, casa.y, casa.w + 20, 80);
    cx.fillStyle = "#8a4530";
    for (let x = casa.x - 10; x < casa.x + casa.w + 10; x += 30) cx.fillRect(x, casa.y, 6, 80);
    cx.fillStyle = "#6b4423"; cx.fillRect(130, 290, 60, 50);
    cx.fillStyle = "#e0b45a"; cx.fillRect(178, 316, 6, 6);
    cx.fillStyle = "#7fb3d5"; cx.fillRect(60, 250, 46, 40); cx.fillRect(214, 250, 36, 40);

    // Escola
    cx.fillStyle = "#c9b8a0"; cx.fillRect(escola.x, escola.y + 60, escola.w, escola.h - 60);
    cx.fillStyle = "#7d4a62"; cx.fillRect(escola.x - 10, escola.y, escola.w + 20, 70);
    cx.fillStyle = "#f3e6c8"; cx.fillRect(escola.x + 60, escola.y + 90, 170, 34);
    cx.fillStyle = "#3a2a1c"; cx.font = "bold 24px sans-serif"; cx.textAlign = "center";
    cx.fillText("ESCOLA", escola.x + 145, escola.y + 115);
    cx.fillStyle = "#6b4423"; cx.fillRect(990, 280, 60, 50);
    cx.fillStyle = "#7fb3d5";
    cx.fillRect(900, 190, 50, 40); cx.fillRect(1090, 190, 50, 40);

    // Árvores
    for (const a of arvores) {
      cx.fillStyle = "#6b4423"; cx.fillRect(a.x - 10, a.y, 20, 40);
      cx.fillStyle = "#2f6b2c"; cx.beginPath(); cx.arc(a.x, a.y - 30, 52, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = "#3f8a38"; cx.beginPath(); cx.arc(a.x - 14, a.y - 42, 30, 0, Math.PI * 2); cx.fill();
    }
  }

  CENAS.estrada = {
    nome: "Estrada",
    desenhar: desenhar,
    combate: true,
    solidos: bordas.concat([casa, escola], troncos),
    interativos: [],
    saidas: [
      { area: { x: 105, y: 340, w: 100, h: 36 }, para: "sala",   x: 1020, y: 450 },
      { area: { x: 975, y: 330, w: 100, h: 40 }, para: "escola", x: 600,  y: 690 }
    ],
    inimigos: [
      { tipo: "slime", x: 520, y: 470 },
      { tipo: "slime", x: 780, y: 520 },
      { tipo: "slime", x: 700, y: 790 }
    ]
  };
})();
