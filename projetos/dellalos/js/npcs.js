/* =====================================================
   npcs.js - Personagens que conversam (Millena, etc.)
   Um NPC é colocado na lista "npcs" de uma cena (js/salas/...):
     {
       nome: "Millena",
       x: 455, y: 440,                    // posição dos PÉS
       imagem: ["assets/Millena.png", "assets/Millena.jpg"],  // tenta na ordem
       quadro: { linha: 0, coluna: 0 },   // qual quadro da folha mostrar (0,0 = parada olhando para baixo)
       colunas: 4, linhas: 4,             // (opcional) como a folha é dividida
       limitePreto: 18,                   // (opcional) só vale para JPG: quão "preto" é o fundo
       conversar: function () { ... }     // o que o botão B faz
     }
   Se a imagem for PNG (com fundo transparente), ela é usada como está.
   Se for JPG, o fundo preto é apagado, igual à Dellalos.
   ===================================================== */

function prepararNpc(n) {
  if (n._pronto) return;
  n._pronto = true;
  n._folha = null;
  carregarImagem(n.imagem, (img) => {
    const png = /\.png(\?|$)/i.test(img.src);
    n._folha = png ? img : prepararFolha(img, n.limitePreto);
  });
}

// Caixa dos pés (bloqueia o caminho, igual a uma parede pequena)
function caixaDoNpc(n) {
  return { x: n.x - 32, y: n.y - 30, w: 64, h: 30 };
}

function desenharNpc(n) {
  const sp = CONFIG.sprite;
  if (n._folha) {
    const colunas = n.colunas || sp.colunas, linhas = n.linhas || sp.linhas;
    const q = n.quadro || { linha: 0, coluna: 0 };
    const qw = n._folha.width / colunas, qh = n._folha.height / linhas;
    const h = n.altura || CONFIG.alturaPersonagem;
    const w = h * (qw / qh);
    ctx.drawImage(n._folha, q.coluna * qw, q.linha * qh, qw, qh,
                  Math.round(n.x - w / 2), Math.round(n.y - h * sp.pes), w, h);
  } else {
    // Imagem ainda não carregou (ou não foi achada): um marcador simples
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(n.x - 30, n.y - 60, 60, 60);
    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(n.nome, n.x, n.y - 26);
  }
}
