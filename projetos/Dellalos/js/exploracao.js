/* =====================================================
   exploracao.js - Companheiros que ajudam FORA do combate, e que falam durante o passeio
   (além do poder de luta, "hab", que continua em js/amizade.js)

   1) HABILIDADES DE EXPLORAÇÃO  (EXPLORA)  - só valem com aquele companheiro andando junto
        Millena   Conversa fácil   os moradores contam um pouco mais (uma dica extra por pessoa)  -> DICAS_MILLENA
        Nathalia  Olhar atento     enxerga pistas escondidas (brilho azul)                         -> SEGREDOS (tipo "pista")
        Veras     Faro de achados  acha moedas escondidas (brilho dourado)                         -> SEGREDOS (tipo "tesouro")
        Lucas     Força            empurra caixotes e coisas pesadas (com recompensa)              -> SEGREDOS (tipo "pesado")
        Thaina    Pechincha        20% de desconto na loja do Seu Tomás                            -> precoLoja (js/loja.js)
        Caio      Fresta secreta   espia as salas fechadas da escola (2B e 3B)                     -> ESPIADAS / espiarSala
      Quem é "o companheiro agora"? companheiroAgora(): o amigo que está na cena andando junto
      (vale também para a Millena e a Nathalia durante a missão da sala 1A).

   2) FALAS DO PASSEIO (FALAS_PASSEIO)
      Balão de fala em cima do companheiro, sem parar o jogo: comentários sobre os lugares e reações
      à história. Cada fala aparece UMA vez (lembrada em diario.escolhas.falasVistas).

   COMO ADICIONAR
     - Segredo novo: acrescente em SEGREDOS { id, com, cena, tx, ty, tipo, texto, ... } (tile da cena).
       Os pontos precisam ser chão livre e alcançável (veja os que já existem).
     - Fala nova: acrescente em FALAS_PASSEIO { id, com, cena, se?, texto }.
     - Dica de morador da Millena: acrescente em DICAS_MILLENA[nome do NPC].
     - Habilidade para outro amigo: crie em EXPLORA e use um tipo existente (ou crie um novo tipo de segredo).

   SALVO EM diario.escolhas: segredos, falasVistas, dicasMillena  (já são salvos com o diário)
   ONDE LIGA: js/interacoes.js (campo  ativo  dos interativos) | js/desenho.js (brilhos, caixotes e balão)
     js/amizade.js (atualizarExploracao e descHab) | js/dias.js (exploraAoConversar) | js/loja.js (precoLoja)
     js/salas/escola.js (espiarSala)
   ===================================================== */

const EXPLORA = {
  Millena:  { nome: "Conversa fácil",  desc: "os moradores contam um pouco mais quando ela está junto (uma dica extra por pessoa)." },
  Nathalia: { nome: "Olhar atento",    desc: "enxerga pistas escondidas pela cidade (aparece um brilho azul)." },
  Lucas:    { nome: "Força",           desc: "empurra caixotes e coisas pesadas que a Dellalos não move sozinha." },
  Veras:    { nome: "Faro de achados", desc: "acha moedas escondidas pela cidade (aparece um brilho dourado)." },
  Thaina:   { nome: "Pechincha",       desc: "consegue 20% de desconto na loja do Seu Tomás." },
  Caio:     { nome: "Fresta secreta",  desc: "conhece um jeito de espiar as salas fechadas da escola." }
};

// Texto do diário: poder de luta + o que faz fora de combate
function descHab(nome) {
  const A = AMIGOS[nome];
  const ex = EXPLORA[nome];
  return A.hab.desc + (ex ? " Fora de combate (" + ex.nome + "): " + ex.desc : "");
}

// O amigo que está andando junto na cena agora ("" se ninguém)
function companheiroAgora() {
  return companheiro && companheiro.cena === cenaAtual ? companheiro.nome : "";
}

function estadoExplora(chave) {
  if (!diario.escolhas[chave] || typeof diario.escolhas[chave] !== "object") diario.escolhas[chave] = {};
  return diario.escolhas[chave];
}

// ---------------------------------------------------------------------
// SEGREDOS: pontos escondidos pelo mapa (tx, ty = tile da cena)
//   tipo "pista"   (Nathalia): conta algo e vai para o diário (info)
//   tipo "tesouro" (Veras):    dá moedas
//   tipo "pesado"  (Lucas):    sempre aparece (um caixote); só abre com o Lucas; dá moedas
// ---------------------------------------------------------------------
const SEGREDOS = [
  // --- Nathalia: marcas da Zona Norte 2 (só de noite, depois de "Quem morava aqui?"; missão "Marcas no chão") ---
  { id: "n_norte2_1", com: "Nathalia", cena: "zona_norte2", tx: 22, ty: 27, tipo: "pista", info: "norte2_marca1",
    se: () => marcasNorte2Liberadas(), aoAchar: () => { historia.norte2MarcasIniciada = true; },
    texto: "A Nathalia parou de repente: no asfalto brilha um símbolo, um círculo cortado por três linhas, igual ao da porta. Só aparece de noite. Nova missão: Marcas no chão." },
  { id: "n_norte2_2", com: "Nathalia", cena: "zona_norte2", tx: 48, ty: 29, tipo: "pista", info: "norte2_marca2",
    se: () => marcasNorte2Liberadas(),
    texto: "Mais uma marca brilhando no chão da avenida. As três linhas apontam para o sudeste." },
  { id: "n_norte2_3", com: "Nathalia", cena: "zona_norte2", tx: 36, ty: 14, tipo: "pista", info: "norte2_marca3",
    se: () => marcasNorte2Liberadas(),
    texto: "A terceira marca confirma: todas apontam para as ruínas do sudeste. A Nathalia acha que há algo escondido lá, que só se mostra de noite." },
  // --- Nathalia: pistas ---
  { id: "n_simbolo", com: "Nathalia", cena: "bairro_sul", tx: 32, ty: 14, tipo: "pista", info: "pista_simbolo",
    texto: "A Nathalia achou um símbolo riscado na calçada: um círculo com um olho no meio. Ela diz que já viu igual em algum lugar da escola." },
  { id: "n_riscos", com: "Nathalia", cena: "escola", tx: 2, ty: 5, tipo: "pista", info: "pista_riscos_1a",
    texto: "A Nathalia percebeu riscos finos no chão, perto da porta da 1A, como se alguém tivesse arrastado algo pesado ou tentado abrir a porta." },
  { id: "n_pegadas", com: "Nathalia", cena: "casa_sul_vazia", tx: 3, ty: 4, tipo: "pista", info: "pista_pegadas",
    texto: "A Nathalia viu pegadas recentes no pó do chão. Alguém esteve nesta casa há pouco tempo, mesmo parecendo vazia." },
  { id: "n_cartaz", com: "Nathalia", cena: "estrada", tx: 34, ty: 13, tipo: "pista", info: "pista_cartaz",
    texto: "A Nathalia pescou um pedaço de papel preso entre as pedras. É parte de um cartaz rasgado falando do torneio." },

  // --- Veras: tesouros ---
  { id: "v_estrada", com: "Veras", cena: "estrada", tx: 50, ty: 28, tipo: "tesouro", moedas: 12,
    texto: "A Veras achou uma bolsinha esquecida atrás de uma pedra." },
  { id: "v_sul1", com: "Veras", cena: "bairro_sul", tx: 6, ty: 29, tipo: "tesouro", moedas: 10,
    texto: "A Veras descobriu algumas moedas escondidas na grama." },
  { id: "v_sul2", com: "Veras", cena: "bairro_sul", tx: 44, ty: 22, tipo: "tesouro", moedas: 12,
    texto: "A Veras remexeu num canto e achou moedas que alguém deixou cair há muito tempo." },
  { id: "v_loja", com: "Veras", cena: "loja", tx: 2, ty: 7, tipo: "tesouro", moedas: 8,
    texto: "A Veras achou moedas atrás do estoque da loja. O Seu Tomás disse que podem ficar com elas." },

  // --- Lucas: coisas pesadas ---
  { id: "l_estrada1", com: "Lucas", cena: "estrada", tx: 22, ty: 9, tipo: "pesado", moedas: 12, forma: "caixote",
    texto: "O Lucas empurrou o caixote como se fosse leve. Atrás dele havia uma bolsinha de moedas.",
    sem: "Um caixote pesado demais para eu mover sozinha. Com alguém forte por perto, quem sabe..." },
  { id: "l_sul", com: "Lucas", cena: "bairro_sul", tx: 17, ty: 15, tipo: "pesado", moedas: 15, forma: "barril",
    texto: "O Lucas rolou o barril para o lado. Escondidas embaixo dele, havia moedas.",
    sem: "Um barril travado no chão. Pesado demais para eu mexer sozinha." },
  { id: "l_estrada2", com: "Lucas", cena: "estrada", tx: 36, ty: 27, tipo: "pesado", moedas: 10, forma: "pedra",
    texto: "O Lucas empurrou a pedra grande. Embaixo dela alguém tinha guardado moedas.",
    sem: "Uma pedra enorme no caminho. Não consigo mover sozinha." }
];

function segredoAchado(id) { return !!estadoExplora("segredos")[id]; }
function segredoAchadoPor(com) { return SEGREDOS.some((s) => s.com === com && segredoAchado(s.id)); }

// Pistas e tesouros só existem com o amigo certo; o caixote pesado aparece sempre (até ser aberto)
function segredoAtivo(s) {
  if (segredoAchado(s.id)) return false;
  if (s.se && !s.se()) return false;          // (opcional) condição extra: dia, noite, missão (ex.: Zona Norte 2)
  if (s.tipo === "pesado") return true;
  return companheiroAgora() === s.com;
}

function usarSegredo(s) {
  if (!segredoAtivo(s)) return;
  if (s.tipo === "pesado" && companheiroAgora() !== s.com) { mostrarMensagem(s.sem); return; }
  estadoExplora("segredos")[s.id] = true;
  if (s.info) descobrirInfo(s.info);
  if (s.moedas) ganharMoedas(s.moedas);
  mostrarMensagem(s.texto + (s.moedas ? " (+" + s.moedas + " moedas)" : "") + (s.info ? " Anotado no diário." : ""));
  if (s.aoAchar) s.aoAchar(s);                 // (opcional) ex.: começar uma missão
  sinalizarMissao();
}

// Os segredos viram objetos interativos das cenas (o campo  ativo  é lido em js/interacoes.js)
for (const s of SEGREDOS) {
  const cena = CENAS[s.cena];
  if (!cena) { console.warn("Segredo sem cena: " + s.id); continue; }
  cena.interativos = cena.interativos || [];
  cena.interativos.push({
    nome: "segredo_" + s.id,
    area: celula(s.tx, s.ty),
    ativo: function () { return segredoAtivo(s); },
    conversar: function () { usarSegredo(s); }
  });
}

// Brilhos (pistas e tesouros) e caixotes (pesados): chamado por js/desenho.js, no mundo, antes dos personagens
function desenharSegredos() {
  const t = performance.now() / 1000;
  for (const s of SEGREDOS) {
    if (CENAS[s.cena] !== cenaAtual || !segredoAtivo(s)) continue;
    const cx = s.tx * TILE + TILE / 2, cy = s.ty * TILE + TILE / 2;
    ctx.save();
    if (s.tipo === "pesado") {
      desenharPesado(s.forma, cx, cy + 14);
    } else {
      const pulso = 0.55 + 0.45 * Math.sin(t * 4 + s.tx);
      const cor = s.tipo === "pista" ? "#9ad7ff" : "#ffd75e";
      ctx.globalAlpha = 0.35 + 0.5 * pulso;
      ctx.fillStyle = cor;
      const r = 7 + 6 * pulso;
      ctx.beginPath();                                   // estrela de 4 pontas
      ctx.moveTo(cx, cy - r * 1.6); ctx.lineTo(cx + r * 0.35, cy - r * 0.35); ctx.lineTo(cx + r * 1.6, cy);
      ctx.lineTo(cx + r * 0.35, cy + r * 0.35); ctx.lineTo(cx, cy + r * 1.6); ctx.lineTo(cx - r * 0.35, cy + r * 0.35);
      ctx.lineTo(cx - r * 1.6, cy); ctx.lineTo(cx - r * 0.35, cy - r * 0.35); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
}

function desenharPesado(forma, cx, cy) {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.ellipse(cx, cy, 34, 9, 0, 0, Math.PI * 2); ctx.fill();
  if (forma === "barril") {
    ctx.fillStyle = "#8a5a32"; ctx.strokeStyle = "#4e3119"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(cx, cy - 26, 24, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = "#3b3b3b"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - 23, cy - 38); ctx.lineTo(cx + 23, cy - 38); ctx.moveTo(cx - 23, cy - 14); ctx.lineTo(cx + 23, cy - 14); ctx.stroke();
  } else if (forma === "pedra") {
    ctx.fillStyle = "#8d8d96"; ctx.strokeStyle = "#55555e"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 30, cy); ctx.lineTo(cx - 22, cy - 34); ctx.lineTo(cx + 6, cy - 46); ctx.lineTo(cx + 30, cy - 24); ctx.lineTo(cx + 28, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else {                                               // caixote
    ctx.fillStyle = "#b07a45"; ctx.strokeStyle = "#5a3a1c"; ctx.lineWidth = 3;
    ctx.fillRect(cx - 28, cy - 44, 56, 44); ctx.strokeRect(cx - 28, cy - 44, 56, 44);
    ctx.beginPath(); ctx.moveTo(cx - 28, cy - 44); ctx.lineTo(cx + 28, cy); ctx.moveTo(cx + 28, cy - 44); ctx.lineTo(cx - 28, cy); ctx.stroke();
  }
}

// ---------------------------------------------------------------------
// CAIO: espiar as salas fechadas da escola (chamado pela porta em js/salas/escola.js)
// ---------------------------------------------------------------------
const ESPIADAS = {
  "2B": {
    info: "espiou_2b",
    falas: [
      { quem: "Caio",     texto: "Psiu! Tem uma fresta aqui embaixo da porta. Olha." },
      { quem: "Dellalos", texto: "Cadeiras empilhadas... e um quadro coberto por um pano." },
      { quem: "Caio",     texto: "Eles cobrem o quadro quando não querem que ninguém veja o que está escrito." }
    ]
  },
  "3B": {
    info: "espiou_3b",
    falas: [
      { quem: "Caio",     texto: "Aqui também tem uma fresta. Dá para ver lá dentro." },
      { quem: "Dellalos", texto: "Tem uma luz fraca acesa... mas a porta está trancada." },
      { quem: "Caio",     texto: "Pois é. Alguém entra aqui quando a escola esvazia." }
    ]
  }
};

function espiarSala(nome) {
  const e = ESPIADAS[nome];
  if (!e || companheiroAgora() !== "Caio") { mostrarMensagem("Ainda não disponível."); return; }
  abrirDialogo(e.falas, function () { descobrirInfo(e.info); });
}

// ---------------------------------------------------------------------
// MILLENA: dica extra de cada morador (uma vez por pessoa)
// ---------------------------------------------------------------------
const DICAS_MILLENA = {
  "Dona Lúcia": [
    { quem: "Millena",    texto: "Dona Lúcia, a senhora tem alguma história sobre a escola?" },
    { quem: "Dona Lúcia", texto: "Ah, querida. Dizem que o prédio é mais velho que a cidade. Muita gente passou por lá, e nem todo mundo voltou igual." }
  ],
  "Seu Augusto": [
    { quem: "Millena",     texto: "Seu Augusto, o que o senhor anda anotando?" },
    { quem: "Seu Augusto", texto: "Horários. Quem passa e a que horas. A cidade anda esquisita, e eu gosto de saber das coisas." }
  ],
  "Helena": [
    { quem: "Millena", texto: "Helena, para que servem essas sementes?" },
    { quem: "Helena",  texto: "Para plantar, ué. Mas algumas só brotam de noite. Não me pergunte por quê." }
  ],
  "Pedro": [
    { quem: "Millena", texto: "Pedro, o que você perdeu desta vez?" },
    { quem: "Pedro",   texto: "Ah... nem lembro. Mas lembro que era importante, e pequeno." }
  ],
  "Caio": [
    { quem: "Millena", texto: "Caio, você se perde muito pelos corredores?" },
    { quem: "Caio",    texto: "Me perco, mas acabo achando coisas. Já vi uma porta que nunca vi aberta." }
  ],
  "Seu Tomás": [
    { quem: "Millena",   texto: "Seu Tomás, o senhor vende coisas raras?" },
    { quem: "Seu Tomás", texto: "Raras eu não sei. Antigas, sim. E tem gente que pagaria bem por elas." }
  ],
  "Pescador": [
    { quem: "Millena",  texto: "Pescador, o senhor pega muito peixe?" },
    { quem: "Pescador", texto: "Mais do que devia. O rio anda generoso, e eu desconfio de generosidade." }
  ],
  "Morador": [
    { quem: "Millena", texto: "O senhor mora aqui faz tempo?" },
    { quem: "Morador", texto: "Desde antes de vocês chegarem. Sei mais do que digo." }
  ],
  "Clarice": [
    { quem: "Millena", texto: "Clarice, alguma novidade?" },
    { quem: "Clarice", texto: "Só rumores. Dizem que vai ter um torneio. Eu não confio em torneios." }
  ],
  "Dona Rosa": [
    { quem: "Millena",   texto: "Dona Rosa, como a senhora está?" },
    { quem: "Dona Rosa", texto: "Bem, minha filha. Cuidem uns dos outros. Os tempos andam estranhos." }
  ]
};

let dicaPendente = null;

// Chamado por aoConversarNpc (js/dias.js) antes da conversa normal; a dica entra DEPOIS dela
function exploraAoConversar(n) {
  if (!n || companheiroAgora() !== "Millena") return;
  const falas = DICAS_MILLENA[n.nome];
  const vistas = estadoExplora("dicasMillena");
  if (!falas || vistas[n.nome]) return;
  dicaPendente = { nome: n.nome, falas };
}

// ---------------------------------------------------------------------
// FALAS DO PASSEIO: balão em cima do companheiro (não para o jogo)
//   cena: "estrada", "casa_sul_*" (começa com), ou uma lista dessas.  se: condição opcional.
// ---------------------------------------------------------------------
const FALAS_PASSEIO = [
  // Millena
  { id: "mil_estrada", com: "Millena", cena: "estrada",    texto: "Eu adoro esta estrada! Dá para ver a cidade inteira daqui." },
  { id: "mil_escola",  com: "Millena", cena: ["escola", "escola2"],     texto: "Sempre que entro aqui, meu coração acelera. Mas com você fica mais fácil." },
  { id: "mil_sul",     com: "Millena", cena: "bairro_sul", texto: "O Bairro Sul é tão quieto... às vezes quieto demais." },
  { id: "mil_loja",    com: "Millena", cena: "loja",       texto: "O Seu Tomás tem de tudo. Já gastei metade da minha mesada aqui!" },
  { id: "mil_acordo",  com: "Millena", cena: ["escola", "escola2", "estrada"], se: function () { return historia.fimChave1A; },
    texto: "A gente tem um acordo, lembra? Eu não vou esquecer." },

  // Lucas
  { id: "luc_estrada", com: "Lucas", cena: "estrada",    texto: "Se aparecer slime, deixa comigo." },
  { id: "luc_escola",  com: "Lucas", cena: ["escola", "escola2"],     texto: "Escola é chata, mas o intervalo compensa." },
  { id: "luc_sul",     com: "Lucas", cena: "bairro_sul", texto: "Esse bairro tem gente estranha. Fico de olho." },
  { id: "luc_seita",   com: "Lucas", cena: ["escola", "escola2"],     se: function () { return historia.revelouSeita; },
    texto: "Você anda diferente ultimamente. Aconteceu alguma coisa?" },

  // Nathalia
  { id: "nat_escola",  com: "Nathalia", cena: ["escola", "escola2"],     texto: "Eu desenho estes corredores de memória. Sempre erro uma porta." },
  { id: "nat_estrada", com: "Nathalia", cena: "estrada",    texto: "O céu daqui é lindo. Dá vontade de desenhar." },
  { id: "nat_sul",     com: "Nathalia", cena: "bairro_sul", texto: "Cada casa daqui parece guardar uma história." },
  { id: "nat_pistas",  com: "Nathalia", cena: ["estrada", "bairro_sul", "escola", "escola2"], se: function () { return segredoAchadoPor("Nathalia"); },
    texto: "Viu? Tem coisas que só aparecem quando a gente para e olha com calma." },
  { id: "nat_seita",   com: "Nathalia", cena: ["escola", "escola2"],     se: function () { return historia.revelouSeita; },
    texto: "Tenho sonhado com um desenho que não sei de onde veio." },

  // Thaina
  { id: "tha_loja",    com: "Thaina", cena: "loja",    texto: "Eu sei pechinchar. Deixa comigo no balcão." },
  { id: "tha_estrada", com: "Thaina", cena: "estrada", texto: "A Isabela adora esta estrada. Ela me arrasta para cá." },
  { id: "tha_escola",  com: "Thaina", cena: ["escola", "escola2"],  texto: "Ainda bem que a gente tem a mesma sala. Eu só ia conversar." },

  // Isabela
  { id: "isa_estrada", com: "Isabela", cena: "estrada",    texto: "Vamos devagar. Gosto de ver tudo com calma." },
  { id: "isa_escola",  com: "Isabela", cena: ["escola", "escola2"],     texto: "Esta escola esconde mais do que mostra." },
  { id: "isa_sul",     com: "Isabela", cena: "bairro_sul", texto: "O Bairro Sul me dá arrepios. Eu gosto." },

  // Veras
  { id: "ver_estrada", com: "Veras", cena: "estrada",    texto: "Fica de olho no chão. Eu sempre acho alguma coisa." },
  { id: "ver_sul",     com: "Veras", cena: "bairro_sul", texto: "Aqui eu já me escondi de muita coisa." },
  { id: "ver_escola",  com: "Veras", cena: ["escola", "escola2"],     texto: "Ser a nova de antes ensina a achar atalhos." },
  { id: "ver_tesouro", com: "Veras", cena: ["estrada", "bairro_sul", "loja"], se: function () { return segredoAchadoPor("Veras"); },
    texto: "Viu? Sempre tem alguma coisinha esquecida pela cidade." },

  // Caio
  { id: "cai_escola",  com: "Caio", cena: ["escola", "escola2"],     texto: "Eu já me perdi em todos estes corredores." },
  { id: "cai_sul",     com: "Caio", cena: "bairro_sul", texto: "Moro aqui pertinho. Conheço cada cantinho." },
  { id: "cai_estrada", com: "Caio", cena: "estrada",    texto: "Estrada é bom: dá para andar sem se perder." },
  { id: "cai_portas",  com: "Caio", cena: ["escola", "escola2"],     se: function () { return !!diario.infos.espiou_2b || !!diario.infos.espiou_3b; },
    texto: "As salas fechadas sempre me deram curiosidade. Agora mais ainda." }
];

// Conversas diretas do companheiro: falas curtas, locais e únicas por partida.
// IDs ficam no diário para que trocar de cena ou carregar o jogo não repita uma conversa já usada.
const CONVERSAS_COMPANHEIRO = {
  Millena: [
    { id: "mil_comp_01", texto: "Gosto de poder explorar a cidade com alguém. A caminhada fica mais leve." },
    { id: "mil_comp_02", texto: "Se você quiser parar um pouco, tudo bem. Não precisamos correr o tempo todo." },
    { id: "mil_comp_03", texto: "Quando aparecer alguma coisa interessante, me avisa! Quero ver também." }
  ],
  Lucas: [
    { id: "luc_comp_01", texto: "Estou pronto. Só me diz para onde vamos." },
    { id: "luc_comp_02", texto: "Não precisa acelerar. Consigo acompanhar." },
    { id: "luc_comp_03", texto: "Se quiser descansar um pouco, eu espero por aqui." }
  ],
  Nathalia: [
    { id: "nat_comp_01", texto: "Quero guardar na memória os detalhes deste lugar. Nunca se sabe o que pode chamar atenção depois." },
    { id: "nat_comp_02", texto: "Às vezes, olhar com calma revela mais do que sair correndo." },
    { id: "nat_comp_03", texto: "Se encontrar algo curioso, me chama. Gosto de observar as coisas de perto." }
  ],
  Thaina: [
    { id: "tha_comp_01", texto: "Pronto, estou aqui! E prometo tentar não transformar cada passeio numa maratona de compras." },
    { id: "tha_comp_02", texto: "Vamos aproveitar o caminho. Sempre aparece alguma coisa para comentar." },
    { id: "tha_comp_03", texto: "Se precisar de companhia, pode contar comigo." }
  ],
  Isabela: [
    { id: "isa_comp_01", texto: "Podemos ir sem pressa. Gosto de reparar nos detalhes pelo caminho." },
    { id: "isa_comp_02", texto: "Este lugar merece uma olhada com calma, não acha?" },
    { id: "isa_comp_03", texto: "Estou bem por aqui. Quando quiser continuar, é só ir." }
  ],
  Veras: [
    { id: "ver_comp_01", texto: "Olha por onde pisa. Nunca custa prestar atenção no caminho." },
    { id: "ver_comp_02", texto: "Não precisa me explicar tudo. Se eu notar alguma coisa, eu aviso." },
    { id: "ver_comp_03", texto: "Vamos continuar. Ficar parada não ajuda a descobrir nada." }
  ],
  Caio: [
    { id: "cai_comp_01", texto: "Sei alguns caminhos por aqui. Vamos prestar atenção nas placas e nas entradas." },
    { id: "cai_comp_02", texto: "É bom ter alguém para explorar junto. A gente percebe mais coisas." },
    { id: "cai_comp_03", texto: "Quando quiser seguir, estou pronto." }
  ]
};

function conversarComCompanheiro(c) {
  if (!c || !c.nome || dialogoAberto || transicao || telaTempo) return;
  const nome = c.nome;
  const lista = CONVERSAS_COMPANHEIRO[nome] || [];
  const vistas = estadoExplora("conversasCompanheiro");
  const fala = lista.find((f) => !vistas[f.id]);
  if (!fala) {
    const avisos = estadoExplora("avisoConversasEsgotadas");
    if (!avisos[nome]) {
      avisos[nome] = true;
      mostrarMensagem("Por enquanto, " + nome + " não tem nada novo para dizer.");
    }
    return;
  }
  // Vira-se para Dellalos antes de iniciar o diálogo.
  const dx = jogador.x - c.x, dy = jogador.y - c.y;
  c.direcao = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "esquerda" : "direita") : (dy < 0 ? "cima" : "baixo");
  vistas[fala.id] = true;
  bolhaFala = null;
  esperaFala = Math.max(esperaFala, 18); // não emendar uma fala automática logo após a conversa
  abrirDialogo([{ quem: nome, texto: fala.texto }]);
}

function cenaCombina(spec, id) {
  const lista = Array.isArray(spec) ? spec : [spec];
  return lista.some((e) => (e.endsWith("*") ? id.indexOf(e.slice(0, -1)) === 0 : id === e));
}

let bolhaFala = null;          // { texto, t, dur }
let esperaFala = 3;            // segundos até poder falar de novo
let ultimaCenaFala = null;

function atualizarExploracao(dt) {
  if (bolhaFala) { bolhaFala.t -= dt; if (bolhaFala.t <= 0) bolhaFala = null; }

  const livre = !dialogoAberto && !mensagemVisivel() && !transicao && !telaTempo && !lojaAberta && !inventarioAberto;

  // Dica da Millena: entra quando a conversa com o morador terminou
  if (dicaPendente && livre) {
    const d = dicaPendente;
    dicaPendente = null;
    if (companheiroAgora() === "Millena") {
      estadoExplora("dicasMillena")[d.nome] = true;
      abrirDialogo(d.falas);
    }
    return;
  }

  const c = companheiro;
  if (!c || c.cena !== cenaAtual) return;
  if (cenaAtual !== ultimaCenaFala) { ultimaCenaFala = cenaAtual; esperaFala = Math.max(esperaFala, 3); }
  // O intervalo só passa enquanto o jogo está livre: falas automáticas não se acumulam durante diálogos.
  if (!livre) return;
  esperaFala -= dt;
  if (esperaFala > 0 || bolhaFala || inimigos.some((i) => i.vida > 0)) return;

  const id = idDaCena(cenaAtual);
  const vistas = estadoExplora("falasVistas");
  const f = FALAS_PASSEIO.find((x) => x.com === c.nome && !vistas[x.id] && cenaCombina(x.cena, id) && (!x.se || x.se()));
  if (!f) { esperaFala = 4; return; }
  vistas[f.id] = true;
  const dur = 3.5 + f.texto.length / 20;
  bolhaFala = { texto: f.texto, t: dur, dur };
  esperaFala = 24;
}

// Balão em cima do companheiro (chamado por js/desenho.js, por cima de tudo no mundo)
function desenharBolhaCompanheiro() {
  const c = companheiroParaDesenhar();
  if (!c || !bolhaFala) return;
  ctx.save();
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "left";
  const maxL = 300, palavras = bolhaFala.texto.split(" "), linhas = [];
  let atual = "";
  for (const p of palavras) {
    const teste = atual ? atual + " " + p : p;
    if (ctx.measureText(teste).width > maxL && atual) { linhas.push(atual); atual = p; } else atual = teste;
  }
  if (atual) linhas.push(atual);
  const larg = Math.max(...linhas.map((l) => ctx.measureText(l).width)) + 28;
  const alt = linhas.length * 26 + 18;
  const x = c.x - larg / 2, y = c.y - 140 - alt;
  ctx.globalAlpha = Math.min(1, bolhaFala.t * 2, (bolhaFala.dur - bolhaFala.t) * 4);
  ctx.fillStyle = "rgba(255,252,240,0.96)"; ctx.strokeStyle = "#3a3050"; ctx.lineWidth = 3;
  const r = 12;
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + larg, y, x + larg, y + alt, r); ctx.arcTo(x + larg, y + alt, x, y + alt, r);
  ctx.arcTo(x, y + alt, x, y, r); ctx.arcTo(x, y, x + larg, y, r); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(c.x - 10, y + alt - 1); ctx.lineTo(c.x, y + alt + 14); ctx.lineTo(c.x + 10, y + alt - 1); ctx.fill();
  ctx.fillStyle = "#2a2238";
  linhas.forEach((l, i) => ctx.fillText(l, x + 14, y + 28 + i * 26));
  ctx.restore();
}


// Zona Norte 2: as marcas só aparecem de noite, depois de "Quem morava aqui?" e a partir do dia da missão (js/calendario.js)
function marcasNorte2Liberadas() {
  return !!historia.norte2Concluida && missaoDoDiaLiberada("norte2_marcas") && cicloEhNoite();
}
