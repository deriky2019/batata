/* =====================================================
   dialogos.js - Caixa de conversa
   abrirDialogo(falas, aoTerminar): mostra uma fala por vez e pausa o jogo.
   O botão B completa a fala (se ainda estiver aparecendo) e depois passa para a próxima.
   Cada fala é { quem: "Nome", texto: "..." }.
   ===================================================== */

// O que já aconteceu na história (no futuro o salvamento.js pode guardar isto)
const historia = {
  conheceuMillena: false,
  conheceuMorador: false,
  conheceuEstudante: false,
  avisouMissaoEscola: false,   // já avisou "Nova missão"?
  chegouNaEscola: false,       // missão 1 concluída (ir para a escola)
  avisouMissaoMillena: false,
  // missão 2 (falar com a Millena) é concluída por conheceuMillena
  avisouMissaoCasa: false,
  chegouEmCasa: false,         // missão 3 concluída (ir para casa)
  avisouMissaoMorador: false,
  recebeuChaveQuarto: false,   // missão 4 concluída (o Morador deu a chave)
  quartoPaiAberto: false,      // a porta do quarto do pai já foi destrancada
  avisouMissaoQuarto: false,
  entrouQuartoPai: false,      // missão 5 concluída
  pegouCartaPai: false,        // já pegou a carta na escrivaninha
  // ----- novas (saves antigos não têm: ficam false) -----
  monologoCasa: false,         // pensamentos da Dellalos ao chegar em casa já aconteceram
  leuCartaPai: false,          // examinou a carta
  achouCaderno: false,         // achou o caderno na estante do quarto
  novoDia: false,              // dormiu no sofá: já é o dia seguinte
  chegouEscolaDia2: false,     // chegou na escola no dia seguinte
  conheceuLucas: false,
  conheceuVeras: false,
  conheceuNathalia: false,
  avisouMissaoFicou: false,
  avisouMissaoDia: false,
  avisouMissaoLucas: false,
  avisouMissaoNathalia: false
};

const DIALOGOS = {
  millena: {
    primeira: [
      { quem: "Millena",  texto: "Oi! Você é nova aqui?", conhece: "Millena" },
      { quem: "Dellalos", texto: "Sim! Eu me chamo Dellalos." },
      { quem: "Millena",  texto: "Você é a Dellalos! Eu sou a Millena. Vamos ser melhores amigas!" },
      { quem: "Millena",  texto: "Senta do meu lado!" }
    ],
    depois: [
      { quem: "Millena",  texto: "Somos melhores amigas agora, Dellalos!" }
    ],
    // depois de conhecer o Lucas (variação de diálogo)
    depoisLucas: [
      { quem: "Millena",  texto: "Vi você falando com o Lucas! Ele fala pouco, mas leva os treinos a sério." }
    ]
  },
  morador: {
    chave: [
      { quem: "Morador",  texto: "Dellalos! Já voltou da escola? Tenho uma coisa para você." },
      { quem: "Morador",  texto: "Seu pai deixou esta chave comigo. É a do quarto dele.", info: "chave_papai" },
      { quem: "Dellalos", texto: "A chave do quarto do papai?" },
      { quem: "Morador",  texto: "Isso mesmo. Ele disse que você saberia a hora certa de usar." },
      { quem: "Dellalos", texto: "Obrigada! Vou até lá agora." }
    ],
    primeira: [
      { quem: "Morador",  texto: "Bom dia! Você deve ser a nova moradora da casa laranja.", conhece: "Morador" },
      { quem: "Dellalos", texto: "Sou sim! Me chamo Dellalos e estou indo para a escola." },
      { quem: "Morador",  texto: "A escola fica no fim da avenida. Cuidado com os slimes pelo caminho!" },
      { quem: "Dellalos", texto: "Slimes?" },
      { quem: "Morador",  texto: "Umas gosmas verdes. Use o botão A para bater neles." }
    ],
    depois: [
      { quem: "Morador",  texto: "Cuidado com os slimes, Dellalos! A escola fica à direita." }
    ]
  },
  estudante: {
    primeira: [
      { quem: "Estudante", texto: "Oi! Você é a aluna nova?", conhece: "Estudante" },
      { quem: "Dellalos",  texto: "Sou! Meu nome é Dellalos." },
      { quem: "Estudante", texto: "A Millena está na sala 2A. Ela adora conhecer gente nova!" }
    ],
    depois: [
      { quem: "Estudante", texto: "A sala 2A é a segunda porta, ali em cima. Boa aula!" }
    ]
  },

  // ===== Diálogos novos (conteúdo PROVISÓRIO) =====
  // Campos opcionais de cada fala:
  //   se: () => bool        só aparece se a condição for verdadeira
  //   conhece: "Nome"       registra o personagem no diário quando a fala aparece
  //   info: "id"            registra uma informação (INFOS em js/diario.js)
  //   escolha: "id"         (com opcoes) guarda a resposta escolhida em diario.escolhas
  //   opcoes: [{ id, texto, falas: [...], fn: () => {} }]   respostas do jogador
  dellalos: {
    casa: [
      { quem: "Dellalos", texto: "Que dia comprido... A escola é enorme.", info: "primeiro_dia" },
      { quem: "Dellalos", texto: "A Millena foi simpática e me apresentou tudo. Acho que vou gostar daqui." }
    ],
    dormir: [
      { quem: "Dellalos", texto: "Foi um dia cheio. Talvez seja hora de descansar.",
        escolha: "dormir",
        opcoes: [
          { id: "sim", texto: "Descansar até amanhã", fn: function () { dormirAteAmanha(); } },
          { id: "nao", texto: "Ainda não" }
        ] }
    ]
  },
  lucas: {
    primeira: [
      { quem: "Simon",   texto: "Ei, você é a aluna nova, né?", conhece: "Simon" },
      { quem: "Vitinho", texto: "Esse é o Lucas. Ele não fala muito.", conhece: "Vitinho" },
      { quem: "Lucas",   texto: "...Oi.", conhece: "Lucas", info: "lucas_treinos",
        opcoes: [
          { id: "nome",  texto: "Sou a Dellalos.",
            falas: [ { quem: "Lucas", texto: "Lucas." } ] },
          { id: "treino", texto: "Vocês estão indo treinar?",
            falas: [ { quem: "Lucas", texto: "Sempre." },
                     { quem: "Simon", texto: "Ele não perde um treino." } ] }
        ],
        escolha: "lucas_conversa" }
    ],
    depois: [
      { quem: "Lucas", texto: "..." }
    ]
  },
  simon: {
    antes:  [ { quem: "Simon", texto: "Oi! Você precisa falar com o Lucas, ele está ali." , se: function () { return !historia.conheceuLucas; } } ],
    depois: [ { quem: "Simon", texto: "O Lucas é assim mesmo. Você se acostuma." } ]
  },
  vitinho: {
    antes:  [ { quem: "Vitinho", texto: "Fala com o Lucas! Ele não morde." } ],
    depois: [ { quem: "Vitinho", texto: "A gente sempre está por aqui no corredor." } ]
  },
  veras: {
    primeira: [
      { quem: "Veras", texto: "Mais uma aluna nova. Não se acostume por aqui.", conhece: "Veras", info: "veras_hostil",
        escolha: "veras_resposta",
        opcoes: [
          { id: "calma",  texto: "Só vim estudar.",
            falas: [ { quem: "Veras", texto: "Hunf. Veremos." } ] },
          { id: "firme", texto: "Eu não quero briga.",
            falas: [ { quem: "Veras", texto: "Então fique fora do meu caminho." } ] }
        ] }
    ],
    depois: [ { quem: "Veras", texto: "Ainda aqui?" } ]
  },
  nathalia: {
    primeira: [
      { quem: "Nathalia", texto: "Ah, oi. Você é a Dellalos, não é? Desculpe encarar.", conhece: "Nathalia" },
      { quem: "Nathalia", texto: "É que você me lembra uma pessoa que eu conheço.", info: "nathalia_semelhanca",
        opcoes: [
          { id: "quem", texto: "Quem?",
            falas: [ { quem: "Nathalia", texto: "Ainda não sei dizer. Talvez eu esteja enganada." } ] },
          { id: "coincidencia", texto: "Deve ser coincidência.",
            falas: [ { quem: "Nathalia", texto: "Pode ser. Mas fiquei curiosa." } ] }
        ],
        escolha: "nathalia_semelhanca" }
    ],
    depois: [
      { quem: "Nathalia", texto: "Ainda estou tentando lembrar de quem você me lembra." }
    ]
  }
};

const DIALOGO_LETRAS_POR_SEGUNDO = 45;

let dialogoAberto = false;     // enquanto for true, o jogo fica pausado
let dialogoFalas = [];         // cópia das falas (opções de resposta podem inserir falas novas)
let dialogoIndice = 0;
let dialogoTempo = 0;
let dialogoAoTerminar = null;
let dialogoOpcoes = null;      // respostas da fala atual (ou null)
let dialogoSel = 0;            // resposta marcada
let dialogoCaixasOpcoes = [];  // retângulos das respostas na tela (para o toque)
let dialogoSubiu = false, dialogoDesceu = false;

// Mostra a fala "i". Pula as que têm condição  se()  falsa. Devolve false se a conversa acabou.
function irParaFala(i) {
  while (i < dialogoFalas.length && dialogoFalas[i].se && !dialogoFalas[i].se()) i++;
  dialogoIndice = i;
  dialogoTempo = 0;
  dialogoOpcoes = null;
  dialogoSel = 0;
  if (i >= dialogoFalas.length) return false;

  const f = dialogoFalas[i];
  if (f.conhece) [].concat(f.conhece).forEach((nome) => registrarConhecido(nome));   // diário (js/diario.js)
  if (f.info) descobrirInfo(f.info);
  if (f.opcoes) {
    const ops = f.opcoes.filter((o) => !o.se || o.se());
    if (ops.length) dialogoOpcoes = ops;
  }
  return true;
}

// Abre uma conversa. Se já existe uma aberta, ignora (evita começar duas vezes).
function abrirDialogo(falas, aoTerminar) {
  if (!falas || !falas.length || dialogoAberto) return;
  dialogoFalas = falas.slice();
  dialogoAoTerminar = aoTerminar || null;
  if (!irParaFala(0)) { dialogoFalas = []; dialogoAoTerminar = null; return; }   // nenhuma fala valia agora
  dialogoAberto = true;
}

function atualizarDialogo(dt) {
  dialogoTempo += dt;
  // Escolher resposta com o D-pad (cima/baixo): só reage ao APERTAR, não ao segurar
  const sobe = teclado.up || toque.up, desce = teclado.down || toque.down;
  if (dialogoOpcoes && textoCompleto()) {
    const n = dialogoOpcoes.length;
    if (sobe && !dialogoSubiu) dialogoSel = (dialogoSel + n - 1) % n;
    if (desce && !dialogoDesceu) dialogoSel = (dialogoSel + 1) % n;
  }
  dialogoSubiu = sobe;
  dialogoDesceu = desce;
}

function letrasVisiveis() {
  return Math.floor(dialogoTempo * DIALOGO_LETRAS_POR_SEGUNDO);
}

function textoCompleto() {
  const fala = dialogoFalas[dialogoIndice];
  return !fala || letrasVisiveis() >= fala.texto.length;
}

function proximaFala() {
  if (irParaFala(dialogoIndice + 1)) return;
  dialogoAberto = false;
  const fim = dialogoAoTerminar;
  dialogoAoTerminar = null;
  dialogoFalas = [];
  if (fim) fim();
}

function escolherOpcao(n) {
  const o = dialogoOpcoes && dialogoOpcoes[n];
  if (!o) return;
  const fala = dialogoFalas[dialogoIndice];
  if (fala.escolha) diario.escolhas[fala.escolha] = o.id;       // lembra a resposta (salva no diário)
  if (o.falas && o.falas.length) dialogoFalas.splice(dialogoIndice + 1, 0, ...o.falas);
  dialogoOpcoes = null;
  if (o.fn) o.fn();
  proximaFala();
}

// Botão B durante a conversa
function avancarDialogo() {
  if (!textoCompleto()) { dialogoTempo = 9999; return; }   // ainda digitando: mostra tudo de uma vez
  if (dialogoOpcoes) { escolherOpcao(dialogoSel); return; }
  proximaFala();
}

// Tocar numa resposta na tela também escolhe
canvas.addEventListener("pointerdown", (e) => {
  if (!dialogoAberto || !dialogoOpcoes || !textoCompleto()) return;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (canvas.width / r.width) / ESCALA;
  const y = (e.clientY - r.top) * (canvas.height / r.height) / ESCALA;
  for (let n = 0; n < dialogoCaixasOpcoes.length; n++) {
    const c = dialogoCaixasOpcoes[n];
    if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) {
      dialogoSel = n;
      escolherOpcao(n);
      e.preventDefault();
      return;
    }
  }
});

// Quebra o texto em linhas que cabem na largura (a fonte já deve estar definida no ctx)
function quebrarTexto(texto, larguraMax) {
  const linhas = [];
  let atual = "";
  for (const palavra of texto.split(" ")) {
    const teste = atual ? atual + " " + palavra : palavra;
    if (atual && ctx.measureText(teste).width > larguraMax) { linhas.push(atual); atual = palavra; }
    else atual = teste;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

// Retrato: a imagem do personagem (PERSONAGENS em js/personagens.js) ou, sem imagem,
// uma caixinha com a inicial e a descrição curta. O espaço é sempre o mesmo.
function desenharRetrato(quem, x, y, w, h) {
  const img = retratoDe(quem);
  ctx.fillStyle = "#2a1d0c";
  ctx.fillRect(x, y, w, h);
  if (img) {
    const e = Math.min(w / img.width, h / img.height);
    ctx.drawImage(img, x + (w - img.width * e) / 2, y + (h - img.height * e) / 2, img.width * e, img.height * e);
  } else {
    ctx.textAlign = "center";
    ctx.fillStyle = "#e0b45a";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText((quem || "?").charAt(0).toUpperCase(), x + w / 2, y + 48);
    const p = PERSONAGENS[quem];
    if (p) {
      ctx.fillStyle = "#cdbb94";
      ctx.font = "14px sans-serif";
      quebrarTexto(p.descricao, w - 14).slice(0, 5).forEach((l, n) => ctx.fillText(l, x + w / 2, y + 82 + n * 17));
    }
  }
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#6b4a2a";
  ctx.strokeRect(x, y, w, h);
}

// Desenhado em coordenadas da TELA (depois da câmera, em desenho.js)
function desenharDialogo() {
  if (!dialogoAberto) return;
  const fala = dialogoFalas[dialogoIndice];
  const bw = Math.min(VIEW_L - 80, 940), bh = 200, bx = (VIEW_L - bw) / 2, by = VIEW_A - bh - 36;

  // Caixa (mesmo estilo do inventário)
  ctx.fillStyle = "#1e1612";
  ctx.fillRect(bx - 6, by - 6, bw + 12, bh + 12);
  ctx.fillStyle = "#e0b45a";
  ctx.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
  ctx.fillStyle = "#3a2a1c";
  ctx.fillRect(bx, by, bw, bh);

  // Retrato (ou espaço reservado) à esquerda
  const rw = 150, rh = bh - 20, rx = bx + 16, ry = by + 10;
  desenharRetrato(fala.quem, rx, ry, rw, rh);
  const tx = rx + rw + 24;   // onde começa o texto

  // Nome de quem fala
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "left";
  const nomeL = ctx.measureText(fala.quem).width + 40;
  ctx.fillStyle = "#e0b45a";
  ctx.fillRect(bx + 24, by - 26, nomeL, 46);
  ctx.fillStyle = "#2a1d0c";
  ctx.fillText(fala.quem, bx + 44, by + 8);

  // Texto aparecendo letra por letra
  ctx.font = "30px sans-serif";
  ctx.textAlign = "left";
  const linhas = quebrarTexto(fala.texto, bw - (tx - bx) - 30);
  let restante = letrasVisiveis();
  ctx.fillStyle = "#f3e6c8";
  linhas.forEach((linha, n) => {
    if (restante <= 0) return;
    ctx.fillText(linha.slice(0, restante), tx, by + 76 + n * 38);
    restante -= linha.length + 1;
  });

  const completo = letrasVisiveis() >= fala.texto.length;

  // Respostas (acima da caixa): D-pad cima/baixo + B, ou tocar
  dialogoCaixasOpcoes = [];
  if (dialogoOpcoes && completo) {
    const alt = 56, gap = 10, n = dialogoOpcoes.length;
    ctx.font = "28px sans-serif";
    ctx.textAlign = "left";
    dialogoOpcoes.forEach((o, i) => {
      const y = by - 24 - (n - i) * (alt + gap) + gap;
      const sel = i === dialogoSel;
      dialogoCaixasOpcoes.push({ x: bx, y, w: bw, h: alt });
      ctx.fillStyle = sel ? "#e0b45a" : "#3a2a1c";
      ctx.fillRect(bx, y, bw, alt);
      ctx.lineWidth = 4;
      ctx.strokeStyle = sel ? "#fff4c2" : "#6b4a2a";
      ctx.strokeRect(bx, y, bw, alt);
      ctx.fillStyle = sel ? "#2a1d0c" : "#f3e6c8";
      ctx.fillText((sel ? "▶ " : "") + o.texto, bx + 24, y + 37, bw - 48);
    });
    return;
  }

  // Quando a fala terminou de aparecer: balãozinho "B" piscando
  if (completo && Math.floor(performance.now() / 400) % 2 === 0) {
    const x = bx + bw - 36, y = by + bh - 34;
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f3e6c8";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("B", x, y + 9);
  }
}
