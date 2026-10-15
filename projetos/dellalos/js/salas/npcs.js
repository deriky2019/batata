/* =====================================================
   npcs.js - Personagens que conversam (Millena, Morador, etc.) e podem ANDAR
   Um NPC é colocado na lista "npcs" de uma cena (js/salas/...):
     {
       nome: "Millena",
       x: 455, y: 440,                    // posição dos PÉS
       imagem: ["assets/Millena.png"],    // tenta na ordem
       quadro: { linha: 0, coluna: 0 },   // quadro parado (usado quando NÃO anda)
       colunas: 4, linhas: 4,             // (opcional) como a folha é dividida
       limitePreto: 18,                   // (opcional) quão "preto" é o fundo a apagar
       andar: {                           // (opcional) faz o NPC passear
         raioX: 192, raioY: 0,            //   até onde se afasta do ponto inicial (pixels)
         velocidade: 55,                  //   pixels por segundo
         quadros: [0, 1, 2, 3]            //   colunas usadas na caminhada (padrão: todas)
       },
       conversar: function () { ... }     // o que o botão B faz
     }
   A folha segue o mesmo padrão da Dellalos: linha 0 = baixo, 1 = cima, 2 = esquerda, 3 = direita.
   Fundo preto (JPG ou PNG sem transparência) é apagado sozinho.
   ===================================================== */

const NPC_LINHA = { baixo: 0, cima: 1, esquerda: 2, direita: 3 };
const NPC_TEMPO_QUADRO = 0.16;   // segundos em cada quadro da caminhada

function prepararNpc(n) {
  if (n._pronto) return;
  n._pronto = true;
  n._folha = null;
  n.direcao = n.direcao || "baixo";
  n.andando = false;
  n._tempoAnim = 0;
  n._x0 = n.x;                         // ponto de origem do passeio
  n._y0 = n.y;
  n._destino = null;
  n._espera = 0.5 + Math.random() * 2;
  carregarImagem(n.imagem, (img) => {
    // Se o fundo é opaco (JPG ou PNG sem transparência), apaga o preto do fundo
    n._folha = temFundoOpaco(img) ? prepararFolha(reduzirFolha(img, 1024), n.limitePreto || 18) : img;
  });
}

// Caixa dos pés (bloqueia o caminho, igual a uma parede pequena)
function caixaDoNpc(n) {
  return { x: n.x - 32, y: n.y - 30, w: 64, h: 30 };
}

// Mantém a caixa sólida e a área de conversa junto com o NPC quando ele anda
function sincronizarNpc(n) {
  if (n._solido) { n._solido.x = n.x - 32; n._solido.y = n.y - 30; }
  if (n._area)   { n._area.x = n.x - 48;   n._area.y = n.y - 46; }
}

// O NPC pode ficar nesta posição? (paredes, móveis, outros NPCs e a Dellalos)
function npcLivre(n, x, y) {
  const c = { x: x - 32, y: y - 30, w: 64, h: 30 };
  if (temSolido(c, n._solido)) return false;
  return !bate(c, caixaDoJogador(jogador.x, jogador.y));
}

// Vira o NPC para a Dellalos (usado ao conversar)
function npcOlharJogador(n) {
  const dx = jogador.x - n.x, dy = jogador.y - n.y;
  if (Math.abs(dx) > Math.abs(dy)) n.direcao = dx < 0 ? "esquerda" : "direita";
  else n.direcao = dy < 0 ? "cima" : "baixo";
  n.andando = false;
  n._destino = null;
  n._espera = 2;          // depois da conversa, ele fica um pouco parado
}

// Escolhe um ponto novo para passear, dentro do raio
function escolherDestinoNpc(n) {
  const a = n.andar;
  for (let t = 0; t < 6; t++) {
    const dx = (Math.random() * 2 - 1) * (a.raioX || 0);
    const dy = (Math.random() * 2 - 1) * (a.raioY || 0);
    if (Math.hypot(dx, dy) > 40) return { x: n._x0 + dx, y: n._y0 + dy };
  }
  return null;
}

function atualizarNpcs(dt) {
  for (const n of cenaAtual.npcs || []) {
    if (!n.andar || !n._pronto) continue;

    if (n._espera > 0) {                       // parado, descansando
      n._espera -= dt;
      n.andando = false;
      continue;
    }
    if (!n._destino) {
      n._destino = escolherDestinoNpc(n);
      if (!n._destino) { n._espera = 2; continue; }
    }

    const dx = n._destino.x - n.x, dy = n._destino.y - n.y;
    const d = Math.hypot(dx, dy);
    if (d < 4) {                               // chegou
      n._destino = null;
      n._espera = 1.5 + Math.random() * 3;
      n.andando = false;
      continue;
    }

    const passo = Math.min((n.andar.velocidade || 55) * dt, d);
    const px = (dx / d) * passo, py = (dy / d) * passo;
    let moveu = false;
    if (px !== 0 && npcLivre(n, n.x + px, n.y)) { n.x += px; moveu = true; }
    if (py !== 0 && npcLivre(n, n.x, n.y + py)) { n.y += py; moveu = true; }

    if (!moveu) {                              // bateu em algo: desiste deste caminho
      n._destino = null;
      n._espera = 0.4 + Math.random();
      n.andando = false;
      continue;
    }

    if (Math.abs(dx) > Math.abs(dy)) n.direcao = dx < 0 ? "esquerda" : "direita";
    else n.direcao = dy < 0 ? "cima" : "baixo";
    n.andando = true;
    n._tempoAnim += dt;
    sincronizarNpc(n);
  }
}

function desenharNpc(n) {
  const sp = CONFIG.sprite;
  if (n._folha) {
    const colunas = n.colunas || sp.colunas, linhas = n.linhas || sp.linhas;
    let linha = n.quadro ? n.quadro.linha : 0, coluna = n.quadro ? n.quadro.coluna : 0;
    if (n.andar) {                             // NPC que anda: quadro depende da direção e do passo
      const qs = n.andar.quadros || [0, 1, 2, 3];
      linha = NPC_LINHA[n.direcao] || 0;
      coluna = n.andando ? qs[Math.floor(n._tempoAnim / NPC_TEMPO_QUADRO) % qs.length] : 0;
    }
    const qw = n._folha.width / colunas, qh = n._folha.height / linhas;
    const h = n.altura || CONFIG.alturaPersonagem;
    const w = h * (qw / qh);
    ctx.fillStyle = "rgba(0,0,0,0.18)";        // sombrinha
    ctx.beginPath(); ctx.ellipse(n.x, n.y - 2, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.drawImage(n._folha, coluna * qw, linha * qh, qw, qh,
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
