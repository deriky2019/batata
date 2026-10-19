/* =====================================================
   amizade.js - Sistema de amizade e companheiros
   O QUE FAZ
     - Cada amigo tem PONTOS (0 a 100) e um NÍVEL de 1 a 5 (Conhecidos ... Melhores amigos).
     - Pontos sobem por: conhecer a pessoa (+10), 1ª conversa de cada dia (+3),
       falas/opções de diálogo com o campo  amizade  e missões pessoais.
     - Cada nível novo libera um DIÁLOGO novo (AMIGOS[nome].falas) e, a partir do nível 2,
       uma MISSÃO PESSOAL (AMIGOS[nome].missoes), que aparece no diário como missão secundária.
     - No nível 5 (melhores amigos) a pessoa pode virar COMPANHEIRO: conversando com ela ou
       pelo botão no Diário (aba "AMIGOS"). Só um companheiro ativo por vez; trocar é livre
       e ninguém perde pontos. Quem está de companheiro some do lugar de origem e segue a Dellalos.
     - Cada companheiro tem uma HABILIDADE de luta (AMIGOS[nome].hab): hoje "ataque" e "cura".
       Fora de combate eles também ajudam e falam durante o passeio: veja js/exploracao.js.

   ONDE FICA SALVO
     Tudo em  diario.escolhas.amizade  (js/diario.js), que já é salvo em js/salvamento.js.
     Save antigo sem esse campo funciona (começa vazio; quem já era conhecido ganha os +10).

   COMO INTEGRA (só linhas pequenas nos outros arquivos)
     js/diario.js    registrarConhecido -> +10 | renderizarDiario -> seção AMIGOS
     js/dialogos.js  campo  amizade  nas falas e nas opções (veja o comentário lá)
     js/dias.js      aoConversarNpc -> amizadeAoConversar
     js/missoes.js   aoDerrotarInimigo / aoEntrarNaCena -> progresso das missões pessoais
     js/main.js      atualizarCompanheiro(dt) a cada quadro
     js/desenho.js   desenha o companheiro junto dos outros personagens

   COMO ADICIONAR
     - Amigo novo: acrescente em AMIGOS (mesmo nome do NPC na cena) com hab, falas e missoes.
     - Habilidade nova: crie um tipo em HAB_TIPOS e use  hab: { tipo: "seu_tipo", ... }.
     - Pontos num diálogo:  amizade: { id: "id_unico", quem: "Lucas", pts: 3 }
       (o id impede ganhar duas vezes; também pode ser uma lista [{...}, {...}]).
       pts NEGATIVO tira pontos (nunca abaixo de 0). Também pode ser uma FUNÇÃO que devolve
       isso:  amizade: () => ({ id: "x_" + diaAtual(), quem: "Veras", pts: 4 })  (id diferente a cada dia).
     - Amigo difícil (como a Veras), campos opcionais em AMIGOS[nome]:
         conhecer: n   pontos ao conhecer (padrão 10; 0 = começa sem nada)
         niveis: [..]  5 nomes de nível só dele (padrão: Conhecidos ... Melhores amigos)
         diaria: n     nível mínimo para ganhar o +3 da 1ª conversa do dia (padrão 1)
   ===================================================== */

const AMIGO_LIMITES = [0, 10, 30, 60, 100];     // pontos mínimos de cada nível (1 a 5)
const AMIGO_NIVEIS = ["Conhecidos", "Colegas", "Amigos", "Muito amigos", "Melhores amigos"];
const AMIGO_MAX = 100;
const AMIGO_PTS_CONHECER = 10;
const AMIGO_PTS_DIA = 3;

// Ajustes por amigo (veja "Amigo difícil" lá em cima)
function ptsConhecer(nome) { const A = AMIGOS[nome]; return A && A.conhecer !== undefined ? A.conhecer : AMIGO_PTS_CONHECER; }
function nomeNivel(nome, nv) { const A = AMIGOS[nome]; return ((A && A.niveis) || AMIGO_NIVEIS)[nv - 1]; }

const NOME_CENA_AMIGO = { estrada: "a estrada", bairro_sul: "o Bairro Sul", zona_leste: "a Zona Leste", zona_leste2: "o Leste 2", zona_norte: "a Zona Norte", zona_norte2: "a Zona Norte 2", zona_oeste: "a Zona Oeste", zona_oeste2: "a planície Oeste 2", capela: "a capela", fabrica: "a fábrica", loja: "a loja do Seu Tomás", escola: "a escola" };

// ---------- Os amigos ----------
// falas: { nível: [ "fala do amigo", "D: fala da Dellalos", ... ] }  (liberadas ao chegar no nível)
// missoes: uma por nível 2, 3 e 4. t = "slimes" (n) | "visitar" (cena) | "falar" (com)
const AMIGOS = {
  Millena: {
    hab: { tipo: "cura", cura: 1, recarga: 30, fala: "Eu cuido de você quando precisar!", desc: "Cura 1 coração a cada 30 s quando a Dellalos está machucada." },
    falas: {
      2: ["Sabia que a gente combina? Já sinto que somos mais que colegas!", "D: Também acho, Millena."],
      3: ["Você é a primeira pessoa que me faz sentir em casa na escola.", "Se alguém implicar com você, fala comigo. Eu te defendo!"],
      4: ["Posso contar um segredo? Eu morria de medo de entrar nessa escola. Com você ficou fácil.", "D: Comigo também."],
      5: ["Dellalos, você é minha melhor amiga de verdade. Pode contar comigo para qualquer coisa!"]
    },
    missoes: [
      { nivel: 2, titulo: "Passeio com a Millena", desc: "A Millena quer saber como é a estrada. Vá até lá e volte para contar.", t: "visitar", cena: "estrada", pts: 25, moedas: 10,
        pedido: "Dellalos, eu queria conhecer a estrada com você, mas hoje não consigo. Dá uma passada lá e depois me conta?",
        fim: "Você foi mesmo? Conta tudo! Adorei ter alguém para dividir essas coisas." },
      { nivel: 3, titulo: "Trabalho de história", desc: "A Millena precisa de uma história antiga da cidade. Fale com a Dona Lúcia, no Bairro Sul, e volte.", t: "falar", com: "Dona Lúcia", pts: 30, moedas: 15,
        pedido: "Tenho um trabalho de história e preciso de uma história antiga da cidade. A Dona Lúcia, no Bairro Sul, conhece várias. Fala com ela por mim?",
        fim: "Que história ótima! Vou tirar nota máxima, e a ideia foi sua." },
      { nivel: 4, titulo: "Treino de coragem", desc: "A Millena quer perder o medo de slimes. Derrote 5 e volte.", t: "slimes", n: 5, pts: 35, moedas: 20,
        pedido: "Eu queria perder o medo de slimes. Derrote 5 deles e me conte como foi. Vai me dar coragem!",
        fim: "Cinco slimes! Agora me sinto mais corajosa só de ouvir." }
    ]
  },
  Lucas: {
    hab: { tipo: "ataque", dano: 2, recarga: 1.6, alcance: 110, fala: "Os slimes são problema meu.", desc: "Ataque forte corpo a corpo: 2 de dano a cada 1,6 s." },
    falas: {
      2: ["...Você não é tão barulhenta quanto os outros.", "Isso foi um elogio."],
      3: ["Eu treino cedo. Se quiser aparecer um dia, não vou reclamar.", "D: Vou pensar!"],
      4: ["Meu pai dizia que força é proteger quem importa.", "...Acho que ele tinha razão."],
      5: ["Dellalos. Pode contar comigo. Sempre."]
    },
    missoes: [
      { nivel: 2, titulo: "Treino de combate", desc: "O Lucas quer ver você lutar. Derrote 3 slimes e volte.", t: "slimes", n: 3, pts: 25, moedas: 10,
        pedido: "Treino de hoje: derrotar 3 slimes. Quero ver como você luta.",
        fim: "Nada mal. Você aguenta o tranco." },
      { nivel: 3, titulo: "Corrida pelo bairro", desc: "Treino de resistência: vá até o Bairro Sul e volte.", t: "visitar", cena: "bairro_sul", pts: 30, moedas: 15,
        pedido: "Treino de resistência: vá até o Bairro Sul e volte. Sem reclamar.",
        fim: "Fôlego bom. Já dá para treinar junto." },
      { nivel: 4, titulo: "Desafio do Lucas", desc: "A última prova do Lucas: derrote 6 slimes e volte.", t: "slimes", n: 6, pts: 35, moedas: 20,
        pedido: "Última prova. Derrote 6 slimes. Se conseguir, eu confio em você de verdade.",
        fim: "...Respeito. Pode contar comigo." }
    ]
  },
  Nathalia: {
    hab: { tipo: "cura", cura: 1, recarga: 22, fala: "Fico de olho na sua saúde.", desc: "Cura 1 coração a cada 22 s quando a Dellalos está machucada." },
    falas: {
      2: ["Estou prestando atenção em você. De um jeito bom, prometo.", "Você tem um jeito de olhar que eu já vi antes."],
      3: ["Já desenhei você no meu caderno. Espero que não se importe.", "D: Pode mostrar depois!"],
      4: ["Ainda não sei de quem você me lembra, mas já não importa tanto. Você é você.", "D: Obrigada, Nathalia."],
      5: ["Dellalos, quero estar do seu lado nas aventuras. Posso ajudar a cuidar de você."]
    },
    missoes: [
      { nivel: 2, titulo: "Caderno novo", desc: "A Nathalia quer saber o que a loja do Seu Tomás tem. Vá até lá e volte.", t: "visitar", cena: "loja", pts: 25, moedas: 10,
        pedido: "Meu caderno está acabando. Dá uma olhada na loja do Seu Tomás? Quero ver se ele tem algo bonito.",
        fim: "Adorei saber da loja! Já sei o que pedir de presente." },
      { nivel: 3, titulo: "Flores para desenhar", desc: "Pergunte à Helena, no Bairro Sul, qual é a flor mais bonita e volte.", t: "falar", com: "Helena", pts: 30, moedas: 15,
        pedido: "Quero desenhar flores. Fala com a Helena, a do jardim no Bairro Sul, e pergunta qual é a mais bonita?",
        fim: "Ela falou da flor azul? Vou desenhá-la hoje!" },
      { nivel: 4, titulo: "Quem eu lembro?", desc: "A Nathalia acha que a Isabela sabe de quem você a lembra. Fale com a Isabela e volte.", t: "falar", com: "Isabela", pts: 35, moedas: 20,
        pedido: "Tenho a sensação de que a Isabela sabe de quem eu lembro você. Pode conversar com ela por mim?",
        fim: "Ela não disse muita coisa, mas já foi um começo. Obrigada por tentar." }
    ]
  },
  Thaina: {
    hab: { tipo: "ataque", dano: 1, recarga: 0.9, alcance: 100, fala: "Fico perto. Eu bato rápido.", desc: "Ataque rápido corpo a corpo: 1 de dano a cada 0,9 s." },
    falas: {
      2: ["...Você ainda está aqui. Ninguém costuma ficar.", "Não que eu me importe."],
      3: ["A Isabela disse que você é boa gente. Ela raramente erra.", "D: Que bom!"],
      4: ["Eu falo pouco porque ouvir é mais seguro. Com você eu falo um pouco mais.", "Anote: isso é raro."],
      5: ["Eu confio em você, Dellalos. Pode contar comigo."]
    },
    missoes: [
      { nivel: 2, titulo: "Um recado da Thaina", desc: "A Thaina não gosta de falar com estranhos. Fale com o Seu Tomás, na loja, por ela e volte.", t: "falar", com: "Seu Tomás", pts: 25, moedas: 10,
        pedido: "Preciso... de uma coisa da loja. Fala com o Seu Tomás por mim. Eu não gosto de falar com estranhos.",
        fim: "Valeu. Foi mais fácil assim. Estou te devendo uma." },
      { nivel: 3, titulo: "Ar fresco", desc: "A Thaina quer um lugar tranquilo. Dê uma olhada no Bairro Sul e volte.", t: "visitar", cena: "bairro_sul", pts: 30, moedas: 15,
        pedido: "Quero um lugar tranquilo para pensar. Dá uma olhada no Bairro Sul e me diz se serve.",
        fim: "Parece bom. Talvez eu vá com você um dia." },
      { nivel: 4, titulo: "Proteger a Isabela", desc: "Os slimes assustam a Isabela. Derrote 4 e volte.", t: "slimes", n: 4, pts: 35, moedas: 20,
        pedido: "Os slimes andam assustando a Isabela. Derrote 4 deles para ela ficar em paz.",
        fim: "A Isabela ficou aliviada. Eu também. Obrigada, de verdade." }
    ]
  },
  Isabela: {
    hab: { tipo: "ataque", dano: 1, recarga: 1.4, alcance: 270, longe: true, fala: "Eu acerto de longe.", desc: "Ataque à distância: 1 de dano a cada 1,4 s." },
    falas: {
      2: ["Você é mais curiosa do que parece. Gostei.", "Continue assim."],
      3: ["Tem coisas que eu sei e ainda não posso contar. Mas um dia conto.", "D: Eu espero."],
      4: ["Sabe por que eu disse que ainda não nos conhecíamos? Porque eu já sabia que nos conheceríamos.", "D: Isso não responde nada!", "Eu sei."],
      5: ["Dellalos, a partir de agora eu fico do seu lado. Sem perguntas."]
    },
    missoes: [
      { nivel: 2, titulo: "O que o Pedro procura", desc: "A Isabela quer saber o que o Pedro procura. Fale com ele, no Bairro Sul, e volte.", t: "falar", com: "Pedro", pts: 25, moedas: 10,
        pedido: "O Pedro vive procurando algo que nem sabe o que é. Curioso, né? Fala com ele e me conta o que descobrir.",
        fim: "Interessante. Tudo se encaixa, uma hora." },
      { nivel: 3, titulo: "Observar a estrada", desc: "A Isabela pediu para você observar a estrada com calma. Vá até lá e volte.", t: "visitar", cena: "estrada", pts: 30, moedas: 15,
        pedido: "Vá até a estrada e observe com calma. Quase tudo ali tem um motivo.",
        fim: "Você notou, né? Sabia que notaria." },
      { nivel: 4, titulo: "Rumores", desc: "Pergunte ao Seu Augusto, no Bairro Sul, o que ele ouviu sobre as coisas sumindo e volte.", t: "falar", com: "Seu Augusto", pts: 35, moedas: 20,
        pedido: "Dizem que coisas estão sumindo pelas calçadas. Pergunte ao Seu Augusto o que ele ouviu.",
        fim: "Rumores... Guarde isso. Vai ser útil." }
    ]
  },
  Veras: {
    // Começa HOSTIL: não ganha pontos só por conhecer, e a conversa do dia só rende pontos depois do nível 2.
    // No começo, os pontos vêm das respostas que a Dellalos dá (veja DIALOGOS.veras em js/dialogos.js).
    conhecer: 0,
    diaria: 2,
    niveis: ["Hostil", "Desconfiada", "Colega", "Amiga", "Melhor amiga"],
    hab: { tipo: "ataque", dano: 2, recarga: 1.8, alcance: 130, fala: "Quem mexer com a gente se arrepende.", desc: "Ataque forte de perto: 2 de dano a cada 1,8 s." },
    falas: {
      2: ["...Você ainda está aqui. Pensei que já tinha desistido.", "D: Eu não desisto fácil.", "Hmpf. Veremos."],
      3: ["Não me leve a mal. Aprendi a não confiar em quem chega e logo vai embora.", "D: Eu entendo.", "Não entende. Mas gostei de você tentar."],
      4: ["Sabe que eu também já fui a nova aqui? Foi por isso que fui chata com você.", "D: Isso explica muita coisa.", "Não conte para ninguém."],
      5: ["Dellalos... você é a primeira amiga de verdade que eu tenho aqui. Pode contar comigo. Só não diga que eu falei isso."]
    },
    missoes: [
      { nivel: 2, titulo: "Prova de fogo", desc: "A Veras quer ver se você aguenta. Derrote 3 slimes e volte.", t: "slimes", n: 3, pts: 25, moedas: 10,
        pedido: "Quer ficar por aqui? Então mostra que não é como as outras que desistem. Derrote 3 slimes.",
        fim: "Hm. Até que não foi ruim." },
      { nivel: 3, titulo: "O que dizem de mim", desc: "A Veras quer saber o que falam dela. Pergunte à Millena, na sala 2A, e volte.", t: "falar", com: "Millena", pts: 30, moedas: 15,
        pedido: "Fala com a Millena e descobre o que dizem de mim por aí. Quero a verdade, sem enfeite.",
        fim: "Então é isso que dizem... Valeu por contar sem inventar." },
      { nivel: 4, titulo: "Companhia de verdade", desc: "Os slimes atrapalham a Veras no caminho de casa. Derrote 5 e volte.", t: "slimes", n: 5, pts: 35, moedas: 20,
        pedido: "Os slimes me atrapalham na volta para casa. Derrote 5 e eu aceito andar com você.",
        fim: "Você não desistiu. Ninguém nunca ficou até o fim." }
    ]
  },
  Caio: {
    hab: { tipo: "cura", cura: 2, recarga: 45, quando: function () { return jogador.vida <= 2; }, fala: "Se você se machucar feio, eu apareço!", desc: "Socorro: cura 2 corações quando sobram 2 ou menos (a cada 45 s)." },
    falas: {
      2: ["Bom te ver de novo! O pessoal da escola não passa muito por aqui.", "Se quiser caminhar comigo pela pracinha, é só chamar."],
      3: ["Descobri uma coisa: o bairro fica ainda mais bonito com companhia.", "D: Concordo!"],
      4: ["Você é tipo uma amiga que a gente nem sabia que precisava.", "D: Que fofo, Caio."],
      5: ["Dellalos, se for sair por aí, me leva junto! Eu cuido de você."]
    },
    missoes: [
      { nivel: 2, titulo: "Um oi para a Helena", desc: "O Caio quer mandar um oi para a Helena, no jardim. Fale com ela e volte.", t: "falar", com: "Helena", pts: 25, moedas: 10,
        pedido: "A Helena planta flores incríveis. Passa lá e diz que o Caio mandou um oi?",
        fim: "Ela retribuiu? Que bom! Ficamos amigos de vizinhança." },
      { nivel: 3, titulo: "Pracinha tranquila", desc: "Os slimes chegam perto da pracinha. Derrote 3 e volte.", t: "slimes", n: 3, pts: 30, moedas: 15,
        pedido: "Os slimes estão chegando perto da pracinha. Dá uma ajuda e derrota 3?",
        fim: "A pracinha ficou tranquila de novo. Valeu, Dellalos!" },
      { nivel: 4, titulo: "Recado para a Millena", desc: "O Caio quer mandar um recado para a Millena, da sala 2A. Fale com ela e volte.", t: "falar", com: "Millena", pts: 35, moedas: 20,
        pedido: "Quero mandar um recado para a Millena, da sala 2A: diz que o Caio sentiu a falta dela. Pode?",
        fim: "Ela riu? Uau, que alívio. Você é a melhor mensageira." }
    ]
  }
};

// ---------- Estado salvo (diario.escolhas.amizade) ----------
//   pontos: { Nome: n }   feito: { id: true } ganhos únicos   dia: { Nome: diaDaUltimaConversa }
//   visto: { Nome: nível cujo diálogo já foi ouvido }   pessoal: { idMissão: { s, c, ok } }   comp: "Nome" ou ""
function AM() {
  let a = diario.escolhas.amizade;
  if (!a || typeof a !== "object") a = diario.escolhas.amizade = {};
  for (const k of ["pontos", "feito", "dia", "visto", "pessoal"]) {
    if (!a[k] || typeof a[k] !== "object") a[k] = {};
  }
  if (typeof a.comp !== "string") a.comp = "";
  return a;
}

function amizadePontos(nome) { return Math.max(0, Math.min(AMIGO_MAX, Number(AM().pontos[nome]) || 0)); }

function amizadeNivel(nome) {
  const p = amizadePontos(nome);
  let nv = 1;
  AMIGO_LIMITES.forEach((lim, i) => { if (p >= lim) nv = i + 1; });
  return nv;
}

// Mensagens (pontos, nível novo, missão pronta) esperam a conversa/mensagem atual terminar
const filaAmizade = [];

// Ganha pontos. id = ganho único (não repete). calado = sem aviso na tela.
function amizadeGanhar(nome, pts, id, calado) {
  if (!AMIGOS[nome] || !pts) return;
  const a = AM();
  if (id) {
    if (a.feito[id]) return;
    a.feito[id] = true;
  }
  const antes = amizadeNivel(nome);
  a.pontos[nome] = Math.max(0, Math.min(AMIGO_MAX, amizadePontos(nome) + pts));
  const depois = amizadeNivel(nome);
  if (!calado) {
    if (depois > antes) filaAmizade.push("♥ " + nome + ": " + nomeNivel(nome, depois) + "! Há novidades para conversar.");
    else filaAmizade.push("♥ " + nome + (pts > 0 ? " +" : " ") + pts);
    sinalizarMissao();
  }
}

// Campo  amizade  das falas e opções de diálogo (js/dialogos.js)
function amizadeDeFala(spec) {
  if (typeof spec === "function") spec = spec();     // pode ser uma função (id diferente a cada dia, por exemplo)
  [].concat(spec).forEach((s) => { if (s) amizadeGanhar(s.quem, s.pts, s.id); });
}

// Chamado por aoConversarNpc (js/dias.js) toda vez que a Dellalos fala com um NPC
function amizadeAoConversar(n) {
  if (!n) return;
  const a = AM();
  if (AMIGOS[n.nome] && a.dia[n.nome] !== diaAtual() && amizadeNivel(n.nome) >= (AMIGOS[n.nome].diaria || 1)) {   // 1ª conversa do dia
    a.dia[n.nome] = diaAtual();
    const extraVoz = (typeof arvoreTem === "function" && arvoreTem("voz")) ? Math.round(AMIGO_PTS_DIA * 0.5) : 0;   // árvore: Voz amiga (+50%)
    amizadeGanhar(n.nome, AMIGO_PTS_DIA + extraVoz);
  }
  pessoaisAtivas((m, p) => { if (m.t === "falar" && m.com === n.nome) marcarPronto(m, p); });
}

// ---------- Missões pessoais ----------
function estadoPessoal(id) { const p = AM().pessoal[id]; return p ? p.s : 0; }   // 0 nova, 1 aceita, 2 concluída

function pessoaisAtivas(fn) {
  for (const nome in AMIGOS) {
    for (const m of AMIGOS[nome].missoes) {
      const p = AM().pessoal[m.id];
      if (p && p.s === 1) fn(m, p, nome);
    }
  }
}

function objetivoOk(m) {
  const p = AM().pessoal[m.id];
  if (!p) return false;
  if (m.t === "slimes") return p.c >= m.n;
  if (m.t === "falar" && AM().comp === m.com) return true;     // o alvo já anda junto: conta como conversado
  return !!p.ok;
}

function marcarPronto(m, p) {
  if (p.ok) return;
  p.ok = true;
  filaAmizade.push("Missão pessoal: volte a falar com " + m.dono + ".");
  sinalizarMissao();
}

function textoObjetivo(m) {
  if (m.t === "slimes") {
    const p = AM().pessoal[m.id];
    return "Derrotar " + m.n + " slimes (" + Math.min(p ? p.c : 0, m.n) + "/" + m.n + ")";
  }
  if (m.t === "visitar") return "Ir até " + (NOME_CENA_AMIGO[m.cena] || m.cena);
  return "Falar com " + m.com;
}

// Chamado por aoDerrotarInimigo (js/missoes.js)
function amizadeAoDerrotarInimigo() {
  pessoaisAtivas((m, p) => {
    if (m.t !== "slimes" || p.c >= m.n) return;
    p.c++;
    if (p.c >= m.n) marcarPronto(m, p);
  });
}

// Chamado por aoEntrarNaCena (js/missoes.js)
function amizadeAoEntrarNaCena(id) {
  pessoaisAtivas((m, p) => { if (m.t === "visitar" && m.cena === id) marcarPronto(m, p); });
}

// Cada missão pessoal vira uma missão secundária da lista MISSOES (js/missoes.js):
// aparece no diário e no 🎒, e o jogo avisa sozinho quando conclui (verificarMissoes).
for (const nome in AMIGOS) {
  for (const m of AMIGOS[nome].missoes) {
    m.id = "amigo_" + nome.toLowerCase() + "_" + m.nivel;
    m.dono = nome;
    MISSOES.push({
      id: m.id,
      secundaria: true,
      titulo: m.titulo,
      descricao: m.desc,
      inicia: () => estadoPessoal(m.id) >= 1,
      auto: true,
      npcs: [nome],
      objetivos: [
        { get texto() { return textoObjetivo(m); }, ok: () => objetivoOk(m) },
        { texto: "Voltar a falar com " + nome, ok: () => estadoPessoal(m.id) >= 2 }
      ],
      chave: () => estadoPessoal(m.id) >= 2,
      moedas: m.moedas
    });
  }
}

function aceitarPessoal(m) {
  AM().pessoal[m.id] = { s: 1, c: 0, ok: false };
  filaAmizade.push("Nova missão pessoal: " + m.titulo + ".");
  sinalizarMissao();
}

function concluirPessoal(m) {
  const p = AM().pessoal[m.id];
  if (!p || p.s !== 1) return;
  p.s = 2;
  amizadeGanhar(m.dono, m.pts, m.id + "_fim");
}

function falasDe(nome, lista) {
  return lista.map((t) => /^D: /.test(t) ? { quem: "Dellalos", texto: t.slice(3) } : { quem: nome, texto: t });
}

// ---------- Conversa com um amigo (antes da conversa normal do NPC) ----------
// Devolve true se abriu uma conversa de amizade (a conversa normal não acontece nesta vez)
function amizadeConversa(nome) {
  const A = AMIGOS[nome];
  if (!A || !conhecePersonagem(nome)) return false;        // primeira vez: segue a conversa normal da história
  if (dialogoSeitaBloqueia(nome)) return false;            // Isabela e Thaina depois do DIA_SEITA: só a fala do torneio (js/simon.js)
  if (eventoDeHistoriaPendente(nome)) return false;        // momento de história tem prioridade (js/dias.js)
  if (dialogoAberto) return true;
  const a = AM();
  const nv = amizadeNivel(nome);

  // 1) diálogo novo de um nível recém-alcançado
  let prox = 0;
  for (let l = (a.visto[nome] || 1) + 1; l <= nv; l++) if (A.falas[l]) { prox = l; break; }
  if (prox) {
    a.visto[nome] = prox;
    abrirDialogo(falasDe(nome, A.falas[prox]));
    return true;
  }
  a.visto[nome] = Math.max(a.visto[nome] || 1, nv);

  // 2) missão pessoal: oferecer, lembrar ou concluir (uma de cada vez, na ordem)
  for (const m of A.missoes) {
    const st = estadoPessoal(m.id);
    if (st >= 2) continue;
    if (st === 0) {
      if (nv < m.nivel) break;
      abrirDialogo([{
        quem: nome, texto: m.pedido,
        opcoes: [
          { id: "sim", texto: "Pode deixar, eu ajudo!", fn: () => aceitarPessoal(m), falas: [{ quem: nome, texto: "Obrigada! Conto com você." }] },
          { id: "nao", texto: "Agora não.", falas: [{ quem: nome, texto: "Tudo bem. Fale comigo quando puder." }] }
        ]
      }]);
      return true;
    }
    if (objetivoOk(m)) {
      abrirDialogo([{ quem: nome, texto: m.fim }], () => concluirPessoal(m));
    } else {
      abrirDialogo([{ quem: nome, texto: "Ainda falta: " + textoObjetivo(m).toLowerCase() + "." }]);
    }
    return true;
  }

  // 3) melhores amigos: convidar para ser companheiro
  if (nv >= 5 && a.comp !== nome && !A._recusou && !companheiroBloqueado() && (nome !== "Isabela" || isabelaPodeAcompanhar()) && (nome !== "Lucas" || lucasPodeAcompanhar())) {
    abrirDialogo([{
      quem: nome, texto: "Dellalos... somos melhores amigos agora. Quer que eu vá com você nas aventuras?",
      opcoes: [
        { id: "sim", texto: "Quero! Vem comigo.", fn: () => definirCompanheiro(nome), falas: [{ quem: nome, texto: "Então bora! " + A.hab.fala }] },
        { id: "nao", texto: "Agora não.", fn: () => { A._recusou = true; }, falas: [{ quem: nome, texto: "Tudo bem. O convite continua de pé." }] }
      ]
    }]);
    return true;
  }
  return false;     // nada de novo: conversa normal do NPC
}

// Liga o sistema aos NPCs que já existem nas cenas, sem mexer nos arquivos das salas:
//  - conversar passa primeiro por amizadeConversa
//  - o NPC some do lugar de origem enquanto é o companheiro (campo  se  do npcs.js)
for (const id in CENAS) {
  for (const n of CENAS[id].npcs || []) {
    const A = AMIGOS[n.nome];
    if (!A) continue;
    A._npc = n;
    const seOriginal = n.se, conversarOriginal = n.conversar;
    n.se = function () { return (!seOriginal || seOriginal.call(n)) && AM().comp !== n.nome && nomeAcompanhanteTemp() !== n.nome; };
    n.conversar = function () { if (amizadeConversa(n.nome)) return; conversarOriginal.call(n); };
  }
}

// ---------- Companheiro ----------
let companheiro = null;          // { nome, x, y, direcao, andando, anim, recarga, preso, cena, proxy }
const efeitosAmizade = [];       // golpes e corações flutuando (só visual)

// A Isabela só pode ser companheira até o dia 5 (DIA_ISABELA_COMP). Na noite do dia 4 ninguém anda junto (companheiroBloqueado)
const DIA_ISABELA_COMP = 5;
function isabelaPodeAcompanhar() { return diaAtual() <= DIA_ISABELA_COMP; }
// Durante a noite do dia 4 ninguém pode ser companheiro (a Millena, a Isabela etc. aparecem como NPCs da cena)
function companheiroBloqueado() { return noiteAtiva(); }
// O Lucas só pode ser companheiro até o dia 6 (DIA_LUCAS_COMP). No dia 7 ele some da escola (Thaina) e o "Lucas" da Zona Oeste é o Caos.
const DIA_LUCAS_COMP = 6;
function lucasPodeAcompanhar() { return diaAtual() <= DIA_LUCAS_COMP; }
// A Mariane NUNCA é companheira (ela não tem entrada em AMIGOS). Para o selo, só a Nathalia serve (js/salas/mansao.js).

function definirCompanheiro(nome) {
  if (!AMIGOS[nome] || amizadeNivel(nome) < 5) return;
  if (companheiroBloqueado()) { filaAmizade.push("Agora não dá para andar junto."); return; }
  if (nome === "Lucas" && !lucasPodeAcompanhar()) { filaAmizade.push("O Lucas não pode mais andar com você."); return; }
  if (nome === "Isabela" && !isabelaPodeAcompanhar()) { filaAmizade.push("A Isabela não pode mais andar com você."); return; }
  if (nomeAcompanhanteTemp()) { filaAmizade.push("Agora " + nomeAcompanhanteTemp() + " anda com você nesta missão."); return; }
  if (dialogoSeitaBloqueia(nome)) { filaAmizade.push(nome + " não quer mais andar com você."); return; }
  AM().comp = nome;
  companheiro = null;            // criado de novo no próximo quadro
  filaAmizade.push(nome + " agora anda com você.");
}

function dispensarCompanheiro() {
  const nome = AM().comp;
  AM().comp = "";
  companheiro = null;
  if (nome) filaAmizade.push(nome + " voltou para o seu lugar.");
}

function criarCompanheiro(nome) {
  const npc = (AMIGOS[nome] && AMIGOS[nome]._npc) || npcExtraCompanheiro(nome);   // npcExtraCompanheiro: Simon do DIA_SEITA (js/simon.js)
  if (!npc) return null;
  prepararNpc(npc);              // começa a carregar o sprite (se a cena ainda não foi visitada)
  const proxy = Object.create(npc);          // usa o desenho do próprio NPC (js/npcs.js), lendo o sprite quando chegar
  proxy.quadro = { linha: 0, coluna: 0 };
  proxy.andar = { quadros: [0, 1, 2, 3] };
  proxy._rota = null;
  proxy._alfa = undefined;
  return { nome, x: jogador.x, y: jogador.y, direcao: jogador.direcao, andando: false, anim: 0, recarga: 5, preso: 0, cena: null, proxy };
}

function companheiroLivre(x, y) {
  return !temSolido({ x: x - 14, y: y - 20, w: 28, h: 20 });
}

// Coloca o companheiro logo atrás da Dellalos (ao entrar numa cena ou se ficar para trás/preso)
function posicionarCompanheiro(c) {
  const [dx, dy] = DIRECOES[jogador.direcao] || [0, 1];
  const tentativas = [[-dx, -dy, 56], [-dy, dx, 56], [dy, -dx, 56], [-dx, -dy, 110], [0, 0, 0]];
  c.x = jogador.x; c.y = jogador.y;
  for (const [ux, uy, d] of tentativas) {
    const x = jogador.x + ux * d, y = jogador.y + uy * d;
    if (companheiroLivre(x, y)) { c.x = x; c.y = y; break; }
  }
  c.cena = cenaAtual;
  c.preso = 0;
  c.andando = false;
}

function seguirCompanheiro(c, dt) {
  c.andando = false;
  // Não caminhar por cima de uma conversa, pausa de interface ou transição de cena.
  if (dialogoAberto || transicao || telaTempo || lojaAberta || inventarioAberto) return;
  const dx = jogador.x - c.x, dy = jogador.y - c.y, d = Math.hypot(dx, dy);
  if (d > 520) { posicionarCompanheiro(c); return; }
  const parar = 68;
  if (d <= parar) { c.preso = 0; return; }
  const base = velocidadeDoJogador();
  const v = base * (d > 190 ? 1.2 : 0.92);
  const passo = Math.min(v * Math.min(dt, 0.05), d - parar * 0.82);
  const nx = dx / d, ny = dy / d;
  // Tenta primeiro o vetor direto; se houver obstáculo, tenta os eixos e pequenos desvios laterais.
  const tentativas = [
    [nx * passo, ny * passo],
    ...(Math.abs(dx) >= Math.abs(dy) ? [[nx * passo, 0], [0, ny * passo]] : [[0, ny * passo], [nx * passo, 0]]),
    [-ny * Math.min(passo, 34 * dt), nx * Math.min(passo, 34 * dt)],
    [ny * Math.min(passo, 34 * dt), -nx * Math.min(passo, 34 * dt)]
  ];
  let moveu = false;
  for (const [mx, my] of tentativas) {
    if (Math.abs(mx) < 0.001 && Math.abs(my) < 0.001) continue;
    if (companheiroLivre(c.x + mx, c.y + my)) {
      c.x += mx; c.y += my; moveu = true; break;
    }
  }
  if (moveu) {
    c.andando = true;
    c.preso = 0;
    c.anim += dt * (base / CONFIG.velocidade);
    if (Math.abs(dx) > Math.abs(dy)) c.direcao = dx < 0 ? "esquerda" : "direita";
    else c.direcao = dy < 0 ? "cima" : "baixo";
  } else {
    c.preso += dt;
    // Dá mais tempo para contornar obstáculos antes de recuperar a posição.
    if (c.preso > 2.5) posicionarCompanheiro(c);
  }
}

// Retorna o companheiro atual quando Dellalos está perto o suficiente para conversar.
function companheiroInteragivel() {
  const c = companheiro;
  if (!c || c.cena !== cenaAtual || !AM().comp || transicao || dialogoAberto) return null;
  return Math.hypot(jogador.x - c.x, jogador.y - c.y) < 104 ? c : null;
}

// ---------- Habilidades (cada tipo recebe a ficha do companheiro e os dados "hab" do amigo) ----------
const HAB_TIPOS = {
  // Bate no inimigo mais próximo dentro do alcance (usa machucarInimigo de js/combate.js)
  ataque: function (c, h, dt) {
    c.recarga = Math.max(0, c.recarga - dt);
    if (c.recarga > 0) return;
    let alvo = null, melhor = h.alcance;
    for (const i of inimigos) {
      if (i.vida <= 0 || i.tipo.duelo) continue;        // (o Lucas do treino não é alvo)
      const d = Math.hypot(i.x - c.x, i.y - c.y);
      if (d < melhor) { melhor = d; alvo = i; }
    }
    if (!alvo) return;
    c.recarga = h.recarga;
    machucarInimigo(alvo, h.dano);
    efeitosAmizade.push({ tipo: "golpe", x1: c.x, y1: c.y - 40, x2: alvo.x, y2: alvo.y - 24, t: 0.22, longe: !!h.longe });
  },
  // Devolve corações à Dellalos quando ela está machucada (e a condição  quando  da ficha for verdadeira)
  cura: function (c, h, dt) {
    c.recarga = Math.max(0, c.recarga - dt);
    if (c.recarga > 0 || jogador.vida >= jogador.vidaMax) return;
    if (h.quando && !h.quando()) return;
    jogador.vida = Math.min(jogador.vidaMax, jogador.vida + h.cura);
    c.recarga = h.recarga;
    efeitosAmizade.push({ tipo: "texto", x: jogador.x, y: jogador.y - 120, t: 1.1, texto: "+" + h.cura + " ♥" });
  }
};

function atualizarEfeitosAmizade(dt) {
  for (const e of efeitosAmizade) {
    e.t -= dt;
    if (e.tipo === "texto") e.y -= 36 * dt;
  }
  for (let i = efeitosAmizade.length - 1; i >= 0; i--) if (efeitosAmizade[i].t <= 0) efeitosAmizade.splice(i, 1);
}

// Chamado a cada quadro de jogo normal (js/main.js)
let amizadeMigracaoTempo = 0;
function atualizarCompanheiro(dt) {
  // fila de avisos: só aparece quando nada mais está na tela
  if (filaAmizade.length && !mensagemVisivel() && !transicao) mostrarMensagem(filaAmizade.shift());

  // save antigo: quem já era conhecido ganha os pontos de "conhecer" (sem aviso)
  amizadeMigracaoTempo -= dt;
  if (amizadeMigracaoTempo <= 0) {
    amizadeMigracaoTempo = 1;
    for (const nome in AMIGOS) if (conhecePersonagem(nome)) amizadeGanhar(nome, ptsConhecer(nome), "conhecer_" + nome, true);
  }

  atualizarEfeitosAmizade(dt);
  atualizarExploracao(dt);                         // falas do passeio e dicas da Millena (js/exploracao.js)

  if (atualizarAcompanhanteTemp(dt)) return;       // missões do DIA_SEITA e 5: alguém anda junto no lugar do companheiro (js/simon.js)

  if (AM().comp && companheiroBloqueado()) { AM().comp = ""; companheiro = null; }   // noite: ninguém anda junto
  if (AM().comp === "Isabela" && !isabelaPodeAcompanhar()) dispensarCompanheiro();
  if (AM().comp === "Lucas" && !lucasPodeAcompanhar()) dispensarCompanheiro();   // jogos salvos antes da regra
  const nome = AM().comp;
  if (!nome || !AMIGOS[nome]) { companheiro = null; return; }
  if (!companheiro || companheiro.nome !== nome) companheiro = criarCompanheiro(nome);
  const c = companheiro;
  if (!c) return;
  if (c.cena !== cenaAtual) posicionarCompanheiro(c);
  seguirCompanheiro(c, dt);

  const h = AMIGOS[nome].hab;
  if (HAB_TIPOS[h.tipo]) HAB_TIPOS[h.tipo](c, h, dt);

  // Millena de companheira não está na sala: ela conta do torneio sozinha, quando a Dellalos está na escola (js/dias.js)
  if (nome === "Millena" && torneioPronto() && !dialogoAberto && !mensagemVisivel() && !transicao && !telaTempo
      && (idDaCena(cenaAtual) === "escola" || idDaCena(cenaAtual) === "escola2" || idDaCena(cenaAtual).indexOf("aula") === 0)) {
    abrirDialogo(DIALOGOS.millena.torneio, function () { historia.torneioAnunciado = true; });
    return;
  }

  // missão pessoal pronta de quem anda junto: entrega sozinha (ele não fica em casa para conversar)
  if (!dialogoAberto && !mensagemVisivel() && !transicao && !telaTempo) {
    for (const m of AMIGOS[nome].missoes) {
      if (estadoPessoal(m.id) !== 1 || !objetivoOk(m)) continue;
      abrirDialogo([{ quem: nome, texto: m.fim }], () => concluirPessoal(m));
      break;
    }
  }
}

// Usado por js/desenho.js: devolve o companheiro se ele deve aparecer nesta cena
function companheiroParaDesenhar() {
  return companheiro && companheiro.cena === cenaAtual ? companheiro : null;
}

function desenharCompanheiro(c) {
  const p = c.proxy;
  p.x = c.x; p.y = c.y; p.direcao = c.direcao; p.andando = c.andando; p._tempoAnim = c.anim;
  desenharNpc(p);
  for (const e of efeitosAmizade) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, e.t * 3));
    if (e.tipo === "golpe") {
      ctx.strokeStyle = e.longe ? "#9ad7ff" : "#fff4c2";
      ctx.lineWidth = e.longe ? 5 : 10;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(e.x1, e.y1); ctx.lineTo(e.x2, e.y2); ctx.stroke();
    } else {
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 4; ctx.strokeStyle = "#5a1a2a"; ctx.strokeText(e.texto, e.x, e.y);
      ctx.fillStyle = "#ff8fa8"; ctx.fillText(e.texto, e.x, e.y);
    }
    ctx.restore();
  }
}

// ---------- Aba AMIGOS do Diário (chamada por renderizarDiario em js/diario.js) ----------
function renderizarAmizades(caixa) {
  _secao(caixa, "AMIGOS");
  const nomes = Object.keys(AMIGOS).filter((n) => conhecePersonagem(n));
  const atual = AM().comp;
  if (!nomes.length) { _linha(caixa, "Ninguém ainda. Converse com os colegas!", "vazio"); return; }
  _linha(caixa, atual ? "Companheiro ativo: " + atual + " — " + descHab(atual) : "Nenhum companheiro ativo.", atual ? "" : "vazio");

  nomes.forEach((nome) => {
    const A = AMIGOS[nome];
    const p = amizadePontos(nome), nv = amizadeNivel(nome);
    const bloco = document.createElement("div");
    bloco.className = "amigo" + (atual === nome ? " ativo" : "");

    _linha(bloco, nome + " — " + nomeNivel(nome, nv) + " (" + p + "/" + AMIGO_MAX + ")", "amigo-nome");
    const barra = document.createElement("div");
    barra.className = "amigo-barra";
    const cheio = document.createElement("div");
    cheio.style.width = p + "%";
    barra.appendChild(cheio);
    bloco.appendChild(barra);

    if (nv >= 5) {
      _linha(bloco, descHab(nome));
      const b = document.createElement("button");
      b.className = "btn-amigo";
      b.textContent = atual === nome ? "Dispensar companheiro" : (atual ? "Trocar para " + nome : "Chamar como companheiro");
      b.addEventListener("click", () => {
        if (atual === nome) dispensarCompanheiro(); else definirCompanheiro(nome);
        renderizarDiario();
      });
      bloco.appendChild(b);
    } else {
      _linha(bloco, "Próximo nível com " + AMIGO_LIMITES[nv] + " pontos. Melhores amigos podem virar companheiros: " + descHab(nome), "vazio");
    }
    caixa.appendChild(bloco);
  });
}
