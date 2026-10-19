/* =====================================================
   loja.js - Moedas, loja e melhorias compradas
   MOEDAS: o número fica em "moedas" (salvo em js/salvamento.js) e aparece no canto da tela (hud.js).
     ganharMoedas(n)  -> soma e mostra "+n"      gastarMoedas(n) -> true se tinha o bastante
   Ganhar: slimes derrotados (aoDerrotarInimigo em js/missoes.js) e missões (campo  moedas  em MISSOES).
   LOJA: abrirLoja() abre o painel (a Dellalos conversa com o Seu Tomás, em js/salas/loja.js).
     Para vender algo novo: adicione um item em LOJA_ITENS.
     Campos: id, nome, desc, icone, preco
             unico    -> nome da flag em "historia": compra única (fica "Comprado")
             visivel  -> (opcional) função: só aparece quando devolver true
             bloqueio -> (opcional) função que devolve um texto quando NÃO dá para comprar agora
             comprar  -> (opcional) o que acontece além de marcar a flag
   MELHORIAS: ficam salvas como flags em "historia" (comprouCoracao, comprouBotas, comprouTenis, comprouColete, comprouArmadura, comprouAnel, comprouLuvas,
     comprouMochila, comprouLacinho, comprouCapacete, comprouArmaduraReforcada, comprouAmuleto, comprouAmuletoEstranho). aplicarMelhorias() transforma as flags em efeitos no jogo
     e é chamada ao carregar o save, ao começar do zero e ao comprar.
   ===================================================== */

let moedas = 0;
let lojaAberta = false;                // enquanto for true, o jogo fica pausado
let moedasEfeito = { valor: 0, ate: 0 };

// Valores das melhorias (mude aqui para equilibrar)
const MELHORIAS = {
  coracaoExtra: 1,       // corações a mais
  botasVelocidade: 1.15, // multiplicador da velocidade
  luvasDano: 1,          // dano a mais no golpe
  adagaDano: 1,          // dano a mais com a adaga equipada (soma com as luvas)
  daliaDanoPorNivel: 1,  // dano a mais POR NÍVEL da Dália equipada (nível 1 a 5; ocupa o lugar da adaga; soma com as luvas)
  mochilaEspacos: 7,     // espaços do inventário com a mochila maior (sem ela: 5)
  coleteInvulnerab: 0.5, // segundos a mais sem levar dano depois de ser atingida (colete)
  armaduraRecarga: 25,   // segundos até a armadura bloquear outro golpe
  armaduraReforcadaRecarga: 15, // com a Armadura reforçada
  conjuntoBonusRecarga: 3,      // colete + armadura juntos: a recarga cai mais isto (segundos)
  capaceteRecarga: 90,   // segundos até o capacete salvar de outro golpe fatal
  amuletoInvulnerab: 0.8, // segundos a mais sem levar dano depois de ser atingida por inimigo do Caos (amuleto)
  amuletoEmpurrao: 0.6,  // multiplicador do empurrão vindo de inimigo do Caos (amuleto)
  armaduraEmpurrao: 0.5, // multiplicador do empurrão ao levar dano (armadura)
  elixirDano: 1,         // dano a mais com o elixir de força
  elixirSegundos: 60,    // duração do elixir
  anelMoedas: 1.5,       // multiplicador das moedas dos inimigos (anel da sorte)
  sangueDano: 2,         // dano a mais com o sangue sombrio (loja Necro)
  sangueSegundos: 30,    // duração do sangue sombrio
  essenciaInvulneravel: 6, // segundos sem levar dano depois de usar a essência engarrafada
  moedaMalditaMoedas: 1.25, // multiplicador das moedas dos inimigos (moeda maldita; soma com o anel)
  pataCorvoInvulnerab: 0.4, // segundos a mais sem levar dano depois de ser atingida (asa de morcego)
  // Árvore de habilidades do grimório (ARVORE_NOS)
  arvoreVelocidade: 1.1,    // Pulmões de ferro: multiplicador da velocidade
  arvorePassoInvulnerab: 0.3, // Passo de sombra: segundos a mais sem levar dano
  arvoreEmpurrao: 0.7,      // Pele de névoa: multiplicador do empurrão de qualquer golpe
  arvoreSaqueMoedas: 1.2,   // Saque macabro: multiplicador das moedas dos inimigos
  arvoreVeuInvulnerab: 0.5, // Véu de espírito: segundos a mais sem dano vindo de espíritos e sombras
  arvoreVeuEmpurrao: 0.7,   // Véu de espírito: multiplicador do empurrão vindo de espíritos e sombras
  arvoreCuraChance: 0.15,   // Sangue que cura: chance de curar ao derrotar um inimigo
  arvoreCuraQuantia: 0.5,   // Sangue que cura: corações recuperados (0.5 = meio coração)
  arvoreEcoEssencias: 1     // Eco de essência: essências a mais por espírito derrotado (js/salas/capela.js)
};

let sangueAte = 0;       // até quando o sangue sombrio vale (loja Necro; não salva)
let elixirAte = 0;       // até quando o elixir de força vale (performance.now; não salva)

// ---------- Moedas ----------
function ganharMoedas(n) {
  n = Math.floor(n);
  if (!(n > 0)) return;
  moedas += n;
  tocarSom("moeda");
  moedasEfeito = { valor: n, ate: performance.now() + 1400 };
}

function gastarMoedas(n) {
  if (moedas < n) return false;
  moedas -= n;
  tocarSom("compra");
  return true;
}

// ---------- Efeitos das melhorias ----------
function velocidadeDoJogador() {
  return CONFIG.velocidade * (historia.comprouBotas ? MELHORIAS.botasVelocidade : 1) * (arvoreTem("folego") ? MELHORIAS.arvoreVelocidade : 1) * (jogador.correndo ? CONFIG.correr.multiplicador : 1);   // correr: js/jogador.js
}

// ---------- Dália (js/itens.js): nível 1 a 5, guardado em diario.escolhas.daliaNivel ----------
const DALIA_NIVEL_MAX = 5;
const DALIA_PRECOS = { 2: 50, 3: 80, 4: 120, 5: 180 };   // preço (em moedas) para chegar a cada nível; mude aqui para equilibrar
function daliaNivel() {
  const n = Math.round(Number(diario.escolhas.daliaNivel));
  return Number.isFinite(n) ? Math.max(1, Math.min(DALIA_NIVEL_MAX, n)) : 1;
}

function danoDoJogador() {
  return CONFIG.combate.dano + (historia.comprouLuvas ? MELHORIAS.luvasDano : 0)
       + (historia.daliaEquipada && temItem("dalia") ? daliaNivel() * MELHORIAS.daliaDanoPorNivel      // Dália: +1 por nível (1 a 5), no lugar da adaga
          : (historia.adagaEquipada && temItem("adaga") ? MELHORIAS.adagaDano : 0))                    // adaga: item do inventário, precisa estar equipada
       + (performance.now() < elixirAte ? MELHORIAS.elixirDano : 0)
       + (performance.now() < sangueAte ? MELHORIAS.sangueDano : 0)
       + (arvoreTem("punho") ? 1 : 0) + (arvoreTem("sede") ? 1 : 0);   // árvore: Punho de sangue e Sede de sangue
}

// Dano que a Dellalos realmente leva: o colete tira 1 de golpes fortes (2 ou mais). Devolve 0 se a armadura bloqueou o golpe.
function danoRecebido(dano) {
  if (historia.comprouArmadura && jogador.escudo <= 0) {       // armadura: bloqueia um golpe inteiro e recarrega
    jogador.escudo = recargaArmadura();
    jogador.flashEscudo = 0.4;
    tocarSom("escudo");
    mostrarMensagem("A armadura bloqueou o golpe!");
    return 0;
  }
  if (historia.comprouColete && dano >= 2) dano -= 1;
  // capacete: um golpe que seria fatal deixa a Dellalos com 1 coração (precisa ter mais de 1)
  if (historia.comprouCapacete && jogador.capacete <= 0 && jogador.vida > 1 && dano >= jogador.vida) {
    jogador.capacete = MELHORIAS.capaceteRecarga;
    jogador.flashEscudo = 0.4;
    tocarSom("escudo");
    mostrarMensagem("O capacete segurou o golpe! Você ficou com 1 coração.");
    return jogador.vida - 1;
  }
  return dano;
}
// Tempo de recarga da armadura: reforçada é mais rápida; colete + armadura juntos tiram mais um pouco
function recargaArmadura() {
  let r = historia.comprouArmaduraReforcada ? MELHORIAS.armaduraReforcadaRecarga : MELHORIAS.armaduraRecarga;
  if (historia.comprouColete && historia.comprouArmadura) r -= MELHORIAS.conjuntoBonusRecarga;
  return Math.max(5, r);
}
// Inimigos do Caos: espíritos e sombras (o amuleto ajuda contra eles)
function ehInimigoDoCaos(tipoId) { return tipoId === "espirito" || tipoId === "sombra" || tipoId === "sombra_noite"; }
function invulnerabilidadeDoJogador(tipoId) {
  return CONFIG.jogador.invulnerabilidade + (historia.comprouColete ? MELHORIAS.coleteInvulnerab : 0)
       + (historia.comprouPataCorvo ? MELHORIAS.pataCorvoInvulnerab : 0)
       + (arvoreTem("passo") ? MELHORIAS.arvorePassoInvulnerab : 0)
       + (arvoreTem("veu") && ehInimigoDoCaos(tipoId) ? MELHORIAS.arvoreVeuInvulnerab : 0)
       + (historia.comprouAmuleto && ehInimigoDoCaos(tipoId) ? MELHORIAS.amuletoInvulnerab : 0);
}
function empurraoDoJogador(tipoId) {
  return CONFIG.jogador.empurraoVelocidade * (historia.comprouArmadura ? MELHORIAS.armaduraEmpurrao : 1)
       * (historia.comprouAmuleto && ehInimigoDoCaos(tipoId) ? MELHORIAS.amuletoEmpurrao : 1)
       * (arvoreTem("nevoa") ? MELHORIAS.arvoreEmpurrao : 1)
       * (arvoreTem("veu") && ehInimigoDoCaos(tipoId) ? MELHORIAS.arvoreVeuEmpurrao : 1);
}
// Moedas de um inimigo derrotado (anel da sorte)
function moedasDoInimigo(n) {
  let f = 1;
  if (historia.comprouAnel) f *= MELHORIAS.anelMoedas;
  if (historia.comprouMoedaMaldita) f *= MELHORIAS.moedaMalditaMoedas;
  if (arvoreTem("saque")) f *= MELHORIAS.arvoreSaqueMoedas;
  let r = f === 1 ? n : Math.ceil(n * f);
  // Reputação (js/reputacao.js): bônus em porcentagem; a parte quebrada vira 1 moeda por sorteio, então a média é exata
  const extra = r * reputacaoBonusMoedas();
  r += Math.floor(extra) + (Math.random() < extra - Math.floor(extra) ? 1 : 0);
  return r;
}

function aplicarMelhorias() {
  jogador.vidaMax = CONFIG.jogador.vidaMax + (historia.comprouCoracao ? MELHORIAS.coracaoExtra : 0)
                  + (arvoreTem("olhar") ? 1 : 0) + (arvoreTem("alma") ? 1 : 0);   // árvore: Olhar espectral e Alma de guardiã
  jogador.vida = Math.min(jogador.vida, jogador.vidaMax);

  const espacos = historia.comprouMochila ? MELHORIAS.mochilaEspacos : 5;
  while (inventario.slots.length < espacos) inventario.slots.push(null);
  if (inventario.slots.length > espacos) inventario.slots.length = espacos;
}

// ---------- Catálogo ----------
const LOJA_ITENS = [
  {
    id: "pocao", nome: "Poção de cura", icone: "\u{1F9EA}", preco: 10,
    desc: "Recupera 2 corações na hora. Dá para comprar quantas quiser.",
    bloqueio: function () { return jogador.vida >= jogador.vidaMax ? "Sua vida já está cheia." : null; },
    comprar: function () { jogador.vida = Math.min(jogador.vidaMax, jogador.vida + 2); }
  },
  {
    id: "coracao", nome: "Coração extra", icone: "\u2764\uFE0F", preco: 40, unico: "comprouCoracao",
    desc: "Aumenta sua vida máxima em 1 coração.",
    comprar: function () { jogador.vida = Math.min(jogador.vidaMax, jogador.vida + MELHORIAS.coracaoExtra); }
  },
  {
    id: "botas", nome: "Botas leves", icone: "\u{1F462}", preco: 35, unico: "comprouBotas",
    desc: "A Dellalos anda mais rápido."
  },
  {
    id: "tenis", nome: "Tênis de corrida", icone: "\u{1F45F}", preco: 45, unico: "comprouTenis",
    desc: "Corra por mais tempo (+2 s de fôlego) e recupere o fôlego mais rápido. Toque duas vezes no D-pad e segure.",
    comprar: function () { jogador.folego = folegoMax(); jogador.cansada = false; }
  },
  {
    id: "colete", nome: "Colete", icone: "\u{1F9BA}", preco: 70, unico: "comprouColete",
    desc: "Golpes fortes (2 ou mais) causam 1 de dano a menos, e você fica 0,5 s a mais sem levar dano depois de ser atingida.",
  },
  {
    id: "armadura", nome: "Armadura", icone: "\u{1F6E1}\uFE0F", preco: 140, unico: "comprouArmadura",
    desc: "Bloqueia 1 golpe inteiro a cada 25 s (um escudo aparece na tela quando está pronto) e o empurrão fica menor.",
    visivel: function () { return historia.comprouColete; },
    comprar: function () { jogador.escudo = 0; }
  },
  {
    id: "armadura_reforcada", nome: "Armadura reforçada", icone: "\u2699\uFE0F", preco: 220, unico: "comprouArmaduraReforcada", chegada: 5,
    desc: "A armadura recarrega em 15 s em vez de 25 s.",
    visivel: function () { return historia.comprouArmadura; },
    comprar: function () { jogador.escudo = 0; }
  },
  {
    id: "capacete", nome: "Capacete", icone: "\u26D1\uFE0F", preco: 90, unico: "comprouCapacete", chegada: 4,
    desc: "Um golpe que seria fatal deixa você com 1 coração. Recarrega em 90 s (precisa ter mais de 1 coração).",
    comprar: function () { jogador.capacete = 0; }
  },
  {
    id: "amuleto", nome: "Amuleto contra o Caos", icone: "\u{1F52E}", preco: 110, unico: "comprouAmuleto", chegada: 6,
    desc: "Espíritos e sombras empurram menos e você fica 0,8 s a mais sem levar dano depois de ser atingida por eles."
  },
  {
    id: "amuleto_estranho", nome: "Amuleto estranho", icone: "\u{1F9FF}", preco: 60, unico: "comprouAmuletoEstranho", chegada: DIA_AMULETO_ESTRANHO,
    desc: "Seu Tomás: \"Não sei muito bem para que serve.\" Vai para o inventário.",
    bloqueio: function () { return inventario.slots.some((x) => !x) ? null : "Seu inventário está cheio."; },
    comprar: function () { darItem("amuleto_estranho"); }
  },
  {
    id: "lanterna", nome: "Lanterna", icone: "\u{1F526}", preco: 40, unico: "comprouLanterna", chegada: DIA_LANTERNA,
    desc: "Ilumina lugares escuros. Seu Tomás: \"Quem entra num casarão velho sem luz não sai de lá.\""
  },
  {
    id: "luvas", nome: "Luvas reforçadas", icone: "\u{1F94A}", preco: 50, unico: "comprouLuvas",
    desc: "O golpe do botão A causa mais dano."
  },
  {
    id: "adaga", nome: "Adaga", icone: "\u{1F5E1}\uFE0F", preco: 100, unico: "comprouAdaga",
    desc: "Vai para o inventário. Equipada, dá +1 de dano (soma com as luvas).",
    bloqueio: function () { return inventario.slots.some((x) => !x) ? null : "Seu inventário está cheio."; },
    comprar: function () { darItem("adaga"); historia.adagaEquipada = true; }
  },
  {
    id: "mochila", nome: "Mochila maior", icone: "\u{1F392}", preco: 60, unico: "comprouMochila",
    desc: "Sobe o inventário de 5 para 7 espaços."
  },
  {
    id: "pocao_grande", nome: "Poção grande", icone: "\u{1F9EB}", preco: 30,
    desc: "Recupera toda a vida na hora. Dá para comprar quantas quiser.",
    bloqueio: function () { return jogador.vida >= jogador.vidaMax ? "Sua vida já está cheia." : null; },
    comprar: function () { jogador.vida = jogador.vidaMax; }
  },
  {
    id: "elixir", nome: "Elixir de força", icone: "\u2697\uFE0F", preco: 40,
    desc: "+1 de dano nos golpes por 60 segundos. Dá para comprar quantas quiser.",
    comprar: function () { elixirAte = performance.now() + MELHORIAS.elixirSegundos * 1000; mostrarMensagem("Elixir de força: +1 de dano por " + MELHORIAS.elixirSegundos + " segundos."); }
  },
  {
    id: "anel", nome: "Anel da sorte", icone: "\u{1F48D}", preco: 80, unico: "comprouAnel",
    desc: "Os inimigos soltam 50% mais moedas."
  },
  {
    id: "lacinho", nome: "Lacinho para o Bolinha", icone: "\u{1F380}", preco: 5, unico: "comprouLacinho",
    desc: "Um lacinho vermelho para o gatinho da Clarice.",
    visivel: function () { return historia.entregouGato; }
  }
];

// ---------- Catálogo da NECRO (loja da Zona Leste, só de noite; js/salas/necro.js) ----------
// Só coisas sobrenaturais. Mesmo formato de LOJA_ITENS. Para vender outra coisa, acrescente um item aqui.
const NECRO_ITENS = [
  {
    id: "grimorio", nome: "Grimório de aprimoramento", icone: "\u{1F4D6}", preco: 150, unico: "comprouGrimorio",
    desc: "Leve para casa e coloque no lugar do livro do papai. Depois, gaste essências dos espíritos numa árvore de habilidades.",
    bloqueio: function () { return inventario.slots.some((x) => !x) ? null : "Seu inventário está cheio."; },
    comprar: function () { darItem("grimorio_aprimoramento"); }
  },
  {
    // Aprimorar a Dália (nível 1 -> 5): só aparece depois de receber a Dália. Nome, descrição e preço mudam com o nível (dinamico).
    id: "dalia_up", icone: "\u{1F33A}", nome: "Aprimorar a Dália", desc: "", preco: 0,
    visivel: function () { return !!historia.recebeuDalia && temItem("dalia"); },
    dinamico: function () {
      const n = daliaNivel();
      if (n >= DALIA_NIVEL_MAX) return { nome: "Dália nível " + n + " (máximo)", desc: "A lâmina do papai está no auge: +" + n + " de dano.", preco: 0, maximo: true };
      return { nome: "Aprimorar a Dália (nível " + n + " \u2192 " + (n + 1) + ")", desc: "O Necro afia a lâmina com magia: +1 de dano (total +" + (n + 1) + ").", preco: DALIA_PRECOS[n + 1] };
    },
    comprar: function () {
      diario.escolhas.daliaNivel = Math.min(DALIA_NIVEL_MAX, daliaNivel() + 1);
      mostrarMensagem("A Dália subiu para o nível " + daliaNivel() + ": +" + daliaNivel() + " de dano.");
    }
  },
  {
    id: "sangue_sombrio", nome: "Sangue sombrio", icone: "\u{1FA78}", preco: 35,
    desc: "Um frasco que pulsa sozinho. +2 de dano nos golpes por 30 segundos. Dá para comprar quantas quiser.",
    comprar: function () { sangueAte = performance.now() + MELHORIAS.sangueSegundos * 1000; mostrarMensagem("Sangue sombrio: +" + MELHORIAS.sangueDano + " de dano por " + MELHORIAS.sangueSegundos + " segundos."); }
  },
  {
    id: "essencia_engarrafada", nome: "Essência engarrafada", icone: "\u{1F47B}", preco: 55,
    desc: "Um espírito domesticado num vidro. Recupera toda a vida e deixa você " + MELHORIAS.essenciaInvulneravel + " s sem levar dano. Dá para comprar quantas quiser.",
    bloqueio: function () { return jogador.vida >= jogador.vidaMax ? "Sua vida já está cheia." : null; },
    comprar: function () { jogador.vida = jogador.vidaMax; jogador.invulneravel = Math.max(jogador.invulneravel || 0, MELHORIAS.essenciaInvulneravel); }
  },
  {
    id: "pata_corvo", nome: "Asa de morcego", icone: "\u{1F987}", preco: 90, unico: "comprouPataCorvo",
    desc: "Dá azar a quem te ataca: você fica 0,4 s a mais sem levar dano depois de ser atingida."
  },
  {
    id: "moeda_maldita", nome: "Moeda maldita", icone: "\u{1F480}", preco: 120, unico: "comprouMoedaMaldita",
    desc: "Os mortos pagam bem. Os inimigos soltam 25% mais moedas (soma com o anel da sorte)."
  },
  {
    id: "talisma_sombra", nome: "Talismã da sombra", icone: "\u{1F319}", preco: 170, unico: "comprouTalisma",
    desc: "A noite deixa de favorecer os monstros: ao ar livre, os inimigos não ficam mais rápidos nem enxergam mais longe depois do pôr do sol."
  }
];

// ---------- Árvore de habilidades do grimório (casa da Dellalos, js/salas/sala.js) ----------
// Moeda: as essências dos espíritos (as mesmas do altar da capela; js/salas/capela.js: essenciasAtuais).
// Os nós aprendidos ficam em diario.escolhas.arvore ("id,id,..."). Para criar um nó: acrescente aqui e trate o efeito acima.
// Campos: id, ramo, nome, desc, custo, req (id do nó anterior, opcional)
const ARVORE_RAMOS = {
  sangue:   { nome: "Sangue",   icone: "\u{1FA78}" },
  sombra:   { nome: "Sombra",   icone: "\u{1F319}" },
  espirito: { nome: "Espírito", icone: "\u{1F47B}" },
  vinculos: { nome: "Vínculos", icone: "\u{1F49E}" }     // v83: amizade, promessas, pazes e faltas
};
const ARVORE_NOS = [
  { id: "punho",  ramo: "sangue",   nome: "Punho de sangue",  desc: "+1 de dano nos golpes.", custo: 20 },
  { id: "folego", ramo: "sangue",   nome: "Pulmões de ferro", desc: "A Dellalos anda 10% mais rápido.", custo: 20, req: "punho" },
  { id: "sede",   ramo: "sangue",   nome: "Sede de sangue",   desc: "+1 de dano nos golpes (soma com o Punho de sangue).", custo: 45, req: "folego" },
  { id: "cura",   ramo: "sangue",   nome: "Sangue que cura",  desc: "Ao derrotar um inimigo, 15% de chance de recuperar meio coração.", custo: 40, req: "sede" },
  { id: "passo",  ramo: "sombra",   nome: "Passo de sombra",  desc: "Fica 0,3 s a mais sem levar dano depois de ser atingida.", custo: 20 },
  { id: "nevoa",  ramo: "sombra",   nome: "Pele de névoa",    desc: "O empurrão dos golpes que você leva fica 30% menor.", custo: 25, req: "passo" },
  { id: "saque",  ramo: "sombra",   nome: "Saque macabro",    desc: "Os inimigos soltam 20% mais moedas.", custo: 35, req: "nevoa" },
  { id: "olhar",  ramo: "espirito", nome: "Olhar espectral",  desc: "+1 coração máximo.", custo: 30 },
  { id: "eco",    ramo: "espirito", nome: "Eco de essência", desc: "Cada espírito derrotado solta 1 essência a mais.", custo: 30, req: "olhar" },
  { id: "veu",    ramo: "espirito", nome: "Véu de espírito",  desc: "Espíritos e sombras empurram 30% menos e você fica 0,5 s a mais sem levar dano deles.", custo: 40, req: "olhar" },
  { id: "alma",   ramo: "espirito", nome: "Alma de guardiã",  desc: "+1 coração máximo.", custo: 55, req: "veu" },
  { id: "grito",  ramo: "espirito", nome: "Grito espectral",  desc: "HABILIDADE: segure o botão A por 0,8 s. Uma onda espectral causa 3 de dano e empurra os inimigos ao redor e apaga os tiros. Recarrega em 14 s.", custo: 60, req: "alma" },
  // ----- v83: ramo Vínculos (efeitos em js/amizade.js, js/npcvida.js, js/pazes_v81.js e js/faltas_v82.js) -----
  { id: "voz",     ramo: "vinculos", nome: "Voz amiga",       desc: "Na 1ª conversa do dia com cada amigo, ganha 50% mais pontos de amizade.", custo: 25 },
  { id: "palavra", ramo: "vinculos", nome: "Palavra firme",   desc: "As promessas ganham 1 dia a mais de prazo antes de serem quebradas.", custo: 35, req: "voz" },
  { id: "coracao", ramo: "vinculos", nome: "Coração aberto",  desc: "Promessa quebrada magoa 50% menos. Nas pazes, +4 de confiança e -10 de mágoa a mais.", custo: 45, req: "palavra" },
  { id: "aluna",   ramo: "vinculos", nome: "Aluna aplicada",  desc: "Cada falta na escola desconta 1 de reputação em vez de 2.", custo: 30, req: "palavra" }
];

// v84 - Sangue que cura: chamada por aoDerrotarInimigo (js/missoes.js). A vida pode ficar em meio coração (js/hud.js desenha).
function sangueCuraAoDerrotar() {
  if (!arvoreTem("cura") || jogador.morto || jogador.vida >= jogador.vidaMax) return;
  if (typeof duelando === "function" && duelando()) return;          // treino/duelo: sem cura
  if (Math.random() >= MELHORIAS.arvoreCuraChance) return;
  jogador.vida = Math.min(jogador.vidaMax, jogador.vida + MELHORIAS.arvoreCuraQuantia);
  mostrarMensagem("Sangue que cura: +\u00BD cora\u00E7\u00E3o.");
}

function arvoreAprendidos() {
  const t = diario.escolhas.arvore;
  return typeof t === "string" && t ? t.split(",") : [];
}
function arvoreTem(id) { return arvoreAprendidos().indexOf(id) >= 0; }

let lojaModoArvore = false;       // o painel está mostrando a árvore em vez de uma loja?

function abrirArvore() {
  if (menuAberto || jogador.morto || lojaAberta || inventarioAberto || dialogoAberto || telaTempo) return;
  lojaAberta = true;
  lojaModoArvore = true;
  soltarTudo();
  painelLoja.classList.add("necro");
  document.getElementById("lojaTitulo").textContent = "GRIMÓRIO";
  avisoLoja.textContent = "Cada símbolo pede essências. Elas voltam quando os espíritos renascem.";
  renderizarArvore();
  painelLoja.hidden = false;
}

function renderizarArvore() {
  moedasLoja.textContent = "\u{1F47B} " + essenciasAtuais() + " essências";
  listaLoja.replaceChildren();
  for (const no of ARVORE_NOS) {
    const aprendido = arvoreTem(no.id);
    const pai = no.req ? ARVORE_NOS.find((x) => x.id === no.req) : null;
    const travado = !aprendido && pai && !arvoreTem(pai.id);

    const linha = document.createElement("div");
    linha.className = "loja-item";
    const ic = document.createElement("span");
    ic.className = "loja-icone";
    ic.textContent = travado ? "\u{1F512}" : ARVORE_RAMOS[no.ramo].icone;
    const info = document.createElement("div");
    info.className = "loja-info";
    const nome = document.createElement("p");
    nome.className = "loja-nome";
    nome.textContent = ARVORE_RAMOS[no.ramo].nome + ": " + no.nome;
    const desc = document.createElement("p");
    desc.className = "loja-desc";
    desc.textContent = no.desc + (travado ? " (Requer: " + pai.nome + ")" : "");
    info.append(nome, desc);

    const botao = document.createElement("button");
    botao.className = "loja-comprar";
    if (aprendido) {
      botao.textContent = "Aprendido \u2714";
      botao.disabled = true;
    } else {
      botao.textContent = "\u{1F47B} " + no.custo;
      botao.disabled = travado || essenciasAtuais() < no.custo;
      botao.addEventListener("click", () => arvoreAprender(no));
    }
    linha.append(ic, info, botao);
    listaLoja.appendChild(linha);
  }
}

function arvoreAprender(no) {
  if (arvoreTem(no.id)) return;
  if (no.req && !arvoreTem(no.req)) { avisoLoja.textContent = "Aprenda antes o nó anterior."; return; }
  if (essenciasAtuais() < no.custo) { avisoLoja.textContent = "Essências insuficientes."; return; }
  diario.escolhas.essencias = essenciasAtuais() - no.custo;
  diario.escolhas.arvore = arvoreAprendidos().concat(no.id).join(",");
  tocarSom("compra");
  const vidaAntes = jogador.vidaMax;
  aplicarMelhorias();
  if (jogador.vidaMax > vidaAntes) jogador.vida = Math.min(jogador.vidaMax, jogador.vida + (jogador.vidaMax - vidaAntes));   // coração novo já vem cheio
  avisoLoja.textContent = "Você aprendeu: " + no.nome + "!" + (no.id === "grito" ? " Segure o botão A em combate." : "");
  renderizarArvore();
}

// ---------- Painel da loja ----------
const painelLoja   = document.getElementById("loja");
const listaLoja    = document.getElementById("lojaLista");
const avisoLoja    = document.getElementById("lojaAviso");
const moedasLoja   = document.getElementById("lojaMoedas");

let lojaItensAtual = LOJA_ITENS;    // catálogo que o painel mostra agora (Seu Tomás ou Necro)
const tituloLoja = document.getElementById("lojaTitulo");

// abrirLoja()  -> loja do Seu Tomás.   abrirLoja(NECRO_ITENS, "necro") -> loja Necro.
function abrirLoja(catalogo, tema) {
  if (menuAberto || jogador.morto || lojaAberta || inventarioAberto || dialogoAberto || telaTempo) return;
  lojaAberta = true;
  soltarTudo();
  lojaItensAtual = catalogo || LOJA_ITENS;
  lojaModoArvore = false;
  const ehNecro = tema === "necro";
  painelLoja.classList.toggle("necro", ehNecro);
  tituloLoja.textContent = ehNecro ? "NECRO" : "LOJA";
  avisoLoja.textContent = ehNecro ? comentarioDoNecro() : comentarioDoTomas();
  renderizarLoja();
  painelLoja.hidden = false;
}

function fecharLoja() {
  if (!lojaAberta) return;
  lojaAberta = false;
  painelLoja.hidden = true;
}

function renderizarLoja() {
  if (lojaModoArvore) { renderizarArvore(); return; }
  moedasLoja.textContent = "\u{1FA99} " + moedas + " moedas";
  listaLoja.replaceChildren();
  for (const base of lojaItensAtual) {
    if (base.chegada && diaAtual() < base.chegada) continue;   // estoque novo chega em certos dias
    if (base.visivel && !base.visivel()) continue;
    const item = base.dinamico ? Object.assign({}, base, base.dinamico()) : base;   // ex.: aprimorar a Dália (nome/preço por nível)
    const comprado = !!(item.maximo || (item.unico && historia[item.unico]));
    const motivo = !comprado && item.bloqueio ? item.bloqueio() : null;

    const linha = document.createElement("div");
    linha.className = "loja-item";

    const ic = document.createElement("span");
    ic.className = "loja-icone";
    ic.textContent = item.icone;

    const info = document.createElement("div");
    info.className = "loja-info";
    const nome = document.createElement("p");
    nome.className = "loja-nome";
    const oferta = ofertaDe(item);
    nome.textContent = item.nome
      + (item.chegada && item.chegada === diaAtual() && !comprado ? "  \u2605 NOVO" : "")
      + (oferta > 0 && !comprado ? "  \u{1F525} -" + Math.round(oferta * 100) + "%" : "");
    const desc = document.createElement("p");
    desc.className = "loja-desc";
    desc.textContent = item.desc;
    info.append(nome, desc);

    const botao = document.createElement("button");
    botao.className = "loja-comprar";
    if (comprado) {
      botao.textContent = "Comprado \u2714";
      botao.disabled = true;
    } else {
      botao.textContent = "\u{1FA99} " + precoLoja(item);
      botao.disabled = moedas < precoLoja(item) || !!motivo;
      botao.addEventListener("click", () => comprarItem(base));
    }

    linha.append(ic, info, botao);
    listaLoja.appendChild(linha);
  }
}

// Preço de verdade: com a Thaina junto, 20% de desconto (js/exploracao.js)
function precoLoja(item) {
  const fator = (1 - ofertaDe(item)) * (companheiroAgora() === "Thaina" ? 0.8 : 1);
  return Math.max(1, Math.ceil(item.preco * fator));
}

// Oferta do dia: um item com desconto em certos dias (mude à vontade)
const OFERTAS_DIA = {
  3: { id: "pocao_grande", desconto: 0.25 },
  5: { id: "elixir",       desconto: 0.25 },
  7: { id: "anel",         desconto: 0.15 },
  9: { id: "pocao",        desconto: 0.5 }
};
function ofertaDe(item) {
  const o = OFERTAS_DIA[diaAtual()];
  return o && o.id === item.id && !(item.unico && historia[item.unico]) ? o.desconto : 0;
}

// Frase do Seu Tomás ao abrir a loja (a Thaina pechincha; depois, oferta do dia ou comentário sobre o que ela já comprou)
function comentarioDoTomas() {
  if (companheiroAgora() === "Thaina") return "A Thaina pechinchou: 20% de desconto em tudo!";
  if (diaAtual() >= DIA_AMULETO_ESTRANHO && !historia.comprouAmuletoEstranho) return "Seu Tomás: Aquele amuleto estranho ainda está aí. Não sei para que serve, mas leve se quiser.";
  const o = OFERTAS_DIA[diaAtual()];
  const itemOferta = o && LOJA_ITENS.find((x) => x.id === o.id);
  if (itemOferta && ofertaDe(itemOferta) > 0) return "Seu Tomás: Oferta de hoje: " + itemOferta.nome + " com " + Math.round(o.desconto * 100) + "% de desconto!";
  if (historia.comprouArmaduraReforcada) return "Seu Tomás: Armadura reforçada? Você é minha melhor cliente!";
  if (historia.comprouColete && historia.comprouArmadura) return "Seu Tomás: Com colete e armadura juntos, a recarga do escudo é mais rápida.";
  if (historia.comprouColete) return "Seu Tomás: Esse colete combina com você. Tenho coisas ainda melhores.";
  return "Toque em Comprar para levar o item.";
}

// Frase do dono da Necro ao abrir a loja
function comentarioDoNecro() {
  if (companheiroAgora() === "Thaina") return "Necro: Sua amiga pechinchou até com os mortos. 20% de desconto, só desta vez.";
  if (!historia.comprouGrimorio) return "Necro: O grimório é o que realmente vale aqui. Leve para casa e dê a ele o lugar do livro do papai.";
  if (historia.comprouTalisma) return "Necro: Com o talismã, a noite é só mais um dia comprido.";
  if (historia.comprouMoedaMaldita) return "Necro: A moeda gosta de você. Ela vai querer companhia.";
  return "Necro: Pague com moedas. Prefiro moedas a favores.";
}

function comprarItem(base) {
  const item = base.dinamico ? Object.assign({}, base, base.dinamico()) : base;
  if (item.maximo || (item.unico && historia[item.unico])) return;
  const motivo = item.bloqueio ? item.bloqueio() : null;
  if (motivo) { avisoLoja.textContent = motivo; return; }
  if (!gastarMoedas(precoLoja(item))) { avisoLoja.textContent = "Moedas insuficientes."; return; }
  if (item.unico) historia[item.unico] = true;
  aplicarMelhorias();
  if (item.comprar) item.comprar();
  if (item.id === "armadura" && historia.comprouColete) mostrarMensagem("Conjunto completo! A armadura recarrega 3 s mais rápido.");
  avisoLoja.textContent = "Você comprou: " + item.nome + "!";
  renderizarLoja();
}

document.getElementById("lojaFechar").addEventListener("click", fecharLoja);
window.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharLoja(); });

// ---------- Contador de moedas na tela (chamado por hud.js) ----------
function desenharMoedas() {
  const y = 98, xFim = VIEW_L - 20;
  const texto = String(moedas);
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "right";
  const larg = ctx.measureText(texto).width;
  // moedinha
  const cx = xFim - larg - 24;
  ctx.fillStyle = "#e0b45a";
  ctx.beginPath(); ctx.arc(cx, y - 10, 15, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = "#1e1612"; ctx.stroke();
  ctx.fillStyle = "#8a6420";
  ctx.beginPath(); ctx.arc(cx, y - 10, 8, 0, Math.PI * 2); ctx.fill();
  // número
  ctx.lineWidth = 5; ctx.strokeStyle = "#1e1612";
  ctx.strokeText(texto, xFim, y);
  ctx.fillStyle = "#f3e6c8";
  ctx.fillText(texto, xFim, y);
  // "+n" que sobe e some
  const resto = moedasEfeito.ate - performance.now();
  if (resto > 0) {
    ctx.globalAlpha = Math.min(1, resto / 500);
    ctx.fillStyle = "#ffe08a";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("+" + moedasEfeito.valor, xFim, y + 34 - (1 - resto / 1400) * 14);
    ctx.globalAlpha = 1;
  }
}
