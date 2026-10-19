/* Shadow of War V81 — "Fazer as pazes": missão de reconciliação depois de uma promessa quebrada. Offline.
   Quando a Dellalos quebra uma promessa (sistema da V56/V79, diario.escolhas.promessas) com Nathalia, Millena,
   Deriky, Veras, Simon ou Vitinho, a pessoa oferece um jeito de se desculpar na próxima conversa:
     - peixe      (Millena, Vitinho): trazer um peixe fresco (pescaria do Pescador ou comprar por 12 moedas)
     - entrega    (Veras, Deriky)   : minijogo de entrega de encomendas
     - símbolos   (Nathalia, Simon) : minijogo de memorizar símbolos
   Ao cumprir: mágoa -30, confiança +12, amizade +3 (quem tem amizade) e a promessa quebrada fica "perdoada".
   A 1ª vez de cada pessoa também conta como missão secundária (10 moedas + reputação); depois, 5 moedas.
   Isabela, Lucas e Thaina (final fixo) e quem não tem reação (NPC_VIDA_SEM_REACAO) ficam de fora.
   Estado salvo em diario.escolhas.pazesV81 = { Nome: { st: "aceita"|"feita", tipo, dia, recusouDia, feitas } }. */
(function () {
  'use strict';

  const PRECO_PEIXE = 12;
  const MOEDAS_REPETIDA = 5;
  const MOEDAS_MISSAO = 10;
  const AJUSTE_BASE = { confianca: 12, ressentimento: -30, amizade: 3 };
  // árvore (v83): Coração aberto = +4 de confiança e -10 de mágoa a mais nas pazes
  function ajuste() {
    const a = Object.assign({}, AJUSTE_BASE);
    if (typeof arvoreTem === 'function' && arvoreTem('coracao')) { a.confianca += 4; a.ressentimento -= 10; }
    return a;
  }

  const PEDIDOS = {
    Millena: {
      tipo: 'peixe',
      oferta: ['Você disse que voltaria e eu fiquei esperando. Não vou fingir que isso não doeu.', 'Mas eu não sei guardar raiva. Se quiser mesmo se desculpar, me traz um peixe fresco do Pescador. Eu faço o almoço.'],
      aceita: 'Combinado. Um peixe fresco, e a gente esquece isso.', recusa: 'Tudo bem. A oferta continua de pé.',
      lembrar: 'E o peixe? O Pescador fica no lago, a sudeste da estrada. Se estiver sem tempo, dá para comprar um na feira.',
      falhou: 'Não deu dessa vez, né? Sem pressa.', fim: 'Está fresquinho! Obrigada, Dellalos. Agora sim, estamos bem.',
      obj: 'Levar um peixe fresco para a Millena', desc: 'A Millena se magoou com a promessa quebrada. Ela aceita as desculpas se a Dellalos levar um peixe fresco.'
    },
    Vitinho: {
      tipo: 'peixe',
      oferta: ['Você prometeu aparecer e sumiu. Eu até guardei um tempo pra você.', 'Vou ser direto: tô sem ideia pro jantar. Traz um peixe fresco que eu preparo e a gente deixa isso pra trás.'],
      aceita: 'Fechou! Um peixe fresco e tá tudo certo.', recusa: 'Beleza, sem problema. Fico no aguardo.',
      lembrar: 'Cadê o peixe? O Pescador fica no lago. Ou compra um na feira, eu não ligo.',
      falhou: 'Ah, não rolou. Tenta de novo quando puder.', fim: 'Esse peixe tá ótimo! Valeu, Dellalos. Estamos quites.',
      obj: 'Levar um peixe fresco para o Vitinho', desc: 'O Vitinho ficou chateado com a promessa quebrada. Ele perdoa se a Dellalos trouxer um peixe fresco para o jantar.'
    },
    Veras: {
      tipo: 'entrega',
      oferta: ['Você prometeu voltar e não veio. Pra mim, promessa quebrada é promessa que não valia nada.', 'Mas eu tenho encomendas pra entregar no bairro e pouco tempo. Me ajuda a entregar tudo sem errar a casa e eu reconsidero.'],
      aceita: 'Vamos ver se você é rápida.', recusa: 'Tá. Quando quiser provar, estou aqui.',
      lembrar: 'As encomendas continuam paradas. Quer tentar a entrega agora?',
      falhou: 'Entregou na casa errada ou deixou o tempo acabar. Se quiser tentar de novo, é só falar.', fim: 'Tudo entregue, e na casa certa. Está bem, Dellalos. Eu reconsiderei.',
      obj: 'Entregar as encomendas da Veras', desc: 'A Veras não perdoa promessa quebrada de graça. Ela quer ajuda para entregar encomendas nas casas certas, rápido e sem errar demais.'
    },
    Deriky: {
      tipo: 'entrega',
      oferta: ['Você disse que passaria. Eu esperei e você não apareceu.', 'Tenho alguns pacotes da vizinhança para levar e não quero errar nenhuma casa. Faz isso comigo, e eu esqueço.'],
      aceita: 'Certo. Atenção para não trocar as casas.', recusa: 'Entendo. Fica combinado para outra hora.',
      lembrar: 'Os pacotes ainda estão aqui. Vamos tentar a entrega?',
      falhou: 'Errou demais ou demorou. Respira e tenta de novo.', fim: 'Bom trabalho. Pode contar com isso: está resolvido entre a gente.',
      obj: 'Entregar os pacotes do Deriky', desc: 'O Deriky ficou incomodado com a promessa quebrada. Ele aceita as desculpas se a Dellalos ajudar a entregar pacotes na vizinhança.'
    },
    Nathalia: {
      tipo: 'simbolos',
      oferta: ['Você prometeu voltar e eu fiquei esperando. Isso me chateou, Dellalos.', 'Eu estava treinando a memória com uns símbolos que vi por aí, porque podem importar mais adiante. Me ajuda a decorar uma sequência e eu esqueço o resto.'],
      aceita: 'Obrigada. Olhe com calma, a ordem importa.', recusa: 'Tudo bem. Quando se sentir pronta.',
      lembrar: 'Quer tentar a sequência de símbolos agora?',
      falhou: 'Os símbolos se embaralharam. Sem problema, tenta de novo.', fim: 'Você acertou a ordem toda. Obrigada por se importar de verdade. Estamos bem.',
      obj: 'Repetir a sequência de símbolos da Nathalia', desc: 'A Nathalia se magoou com a promessa quebrada. Ela aceita as desculpas se a Dellalos a ajudar a decorar uma sequência de símbolos.'
    },
    Simon: {
      tipo: 'simbolos',
      oferta: ['Você falou que voltava e eu fiquei por aqui. Fiquei meio chateado, pra ser sincero.', 'Anotei uma sequência de símbolos de um livro e quero ver se alguém consegue decorar. Faz isso comigo e a gente deixa pra lá.'],
      aceita: 'Boa. Presta atenção na ordem.', recusa: 'Sem problema. Fica pra depois.',
      lembrar: 'Ainda quer tentar a sequência de símbolos?',
      falhou: 'Quase. Tenta de novo quando quiser.', fim: 'Acertou tudo! Valeu, Dellalos. Está tudo certo entre a gente.',
      obj: 'Repetir a sequência de símbolos do Simon', desc: 'O Simon ficou chateado com a promessa quebrada. Ele perdoa se a Dellalos o ajudar a testar uma sequência de símbolos de um livro.'
    }
  };

  const slug = function (nome) { return nome.toLowerCase(); };
  const dia = function () { try { return Number(diaAtual()) || 1; } catch (_) { return 1; } };
  const diaFinal = function () { return typeof DIA_FINAL !== 'undefined' ? DIA_FINAL : 15; };

  function mapa() {
    if (typeof diario === 'undefined') return {};
    if (!diario.escolhas.pazesV81 || typeof diario.escolhas.pazesV81 !== 'object') diario.escolhas.pazesV81 = {};
    return diario.escolhas.pazesV81;
  }
  function estadoDe(nome) { const m = mapa(); return m[nome] || (m[nome] = {}); }
  function leitura(nome) { return (typeof diario !== 'undefined' && diario.escolhas.pazesV81 && diario.escolhas.pazesV81[nome]) || {}; }

  // Promessas quebradas dessa pessoa que ainda não foram perdoadas
  function pendentes(nome) {
    try { if (typeof npcVidaEstado === 'function') npcVidaEstado(); } catch (_) { }         // garante que o dia virou (V56)
    const l = typeof npcVidaListaPromessas === 'function' ? npcVidaListaPromessas() : [];
    return l.filter(function (p) { return p.nome === nome && p.status === 'quebrada' && !p.pazes; });
  }

  // ---------- Missões (uma por pessoa, secundárias) ----------
  Object.keys(PEDIDOS).forEach(function (nome) {
    const P = PEDIDOS[nome], id = 'pazes_' + slug(nome), av = 'avisouPazes' + nome;
    if (typeof historia === 'object' && !(av in historia)) historia[av] = false;           // entra no save (aplicarSave só lê chaves que existem)
    if (typeof MISSOES === 'undefined' || MISSOES.some(function (m) { return m.id === id; })) return;
    MISSOES.push({
      id: id, secundaria: true, titulo: 'Fazer as pazes com ' + nome, descricao: P.desc,
      inicia: function () { const s = leitura(nome); return s.st === 'aceita' || s.st === 'feita'; },
      auto: true, npcs: [nome], itens: P.tipo === 'peixe' ? ['peixe'] : [],
      objetivos: [
        { texto: P.obj, ok: function () { const s = leitura(nome); return s.st === 'feita' || (P.tipo === 'peixe' && typeof temItem === 'function' && temItem('peixe')); } },
        { texto: 'Conversar com ' + nome + ' e fazer as pazes', ok: function () { return leitura(nome).st === 'feita'; } }
      ],
      chave: function () { return leitura(nome).st === 'feita'; },
      moedas: MOEDAS_MISSAO, aviso: av
    });
  });

  // ---------- Fluxo ----------
  function concluir(nome, P) {
    const s = estadoDe(nome);
    const lista = pendentes(nome);
    s.st = 'feita'; s.feitas = (s.feitas || 0) + 1;
    lista.forEach(function (p) { p.pazes = true; });
    try { if (typeof npcVidaAjustarRelacao === 'function') { const aj = ajuste(); npcVidaAjustarRelacao(nome, aj.confianca, aj.ressentimento, 'Fez as pazes depois de uma promessa quebrada'); } } catch (_) { }
    try { if (typeof amizadeGanhar === 'function') amizadeGanhar(nome, AJUSTE_BASE.amizade, 'pazes_v81_' + nome + '_' + dia() + '_' + s.feitas, true); } catch (_) { }
    const primeira = !(diario.fim && diario.fim['pazes_' + slug(nome)]);
    abrirDialogo([{ quem: nome, texto: P.fim }], function () {
      if (primeira) return;                                   // a 1ª vez: verificarMissoes dá as moedas e a reputação
      if (typeof ganharMoedas === 'function') ganharMoedas(MOEDAS_REPETIDA);
      mostrarMensagem('Vocês fizeram as pazes de novo. +' + MOEDAS_REPETIDA + ' moedas.');
    });
  }

  function lancar(nome, P) {
    const mj = window.minijogoV81;
    if (!mj) { concluir(nome, P); return; }                   // sem minijogo (arquivo faltando): não trava a missão
    const fim = function (ok) { if (ok) concluir(nome, P); else abrirDialogo([{ quem: nome, texto: P.falhou }]); };
    if (P.tipo === 'entrega') mj.entregar({ pacotes: 5, tempo: 6, erros: 1 }, fim);
    else mj.simbolos({ tamanho: 3, erros: 2, dica: nome === 'Nathalia', titulo: 'Símbolos de ' + nome }, fim);
  }

  function oferecer(npc, P, normal) {
    const nome = npc.nome, s = estadoDe(nome);
    const falas = P.oferta.map(function (t) { return { quem: nome, texto: t }; });
    falas[falas.length - 1].opcoes = [
      { id: 'sim', texto: 'Eu faço isso', fn: function () { s.st = 'aceita'; s.tipo = P.tipo; s.dia = dia(); s.recusouDia = 0; }, falas: [{ quem: nome, texto: P.aceita }] },
      { id: 'nao', texto: 'Agora não', fn: function () { s.recusouDia = dia(); }, falas: [{ quem: nome, texto: P.recusa }] }
    ];
    abrirDialogo(falas, function () {
      if (s.st !== 'aceita') { normal(npc); return; }         // recusou: segue a conversa normal do dia
      if (typeof avisarNovaSecundaria === 'function') avisarNovaSecundaria('pazes_' + slug(nome));
      if (P.tipo !== 'peixe') setTimeout(function () { if (!dialogoAberto) lancar(nome, P); }, 700);
    });
  }

  function continuar(npc, P, normal) {
    const nome = npc.nome;
    if (P.tipo === 'peixe') {
      if (typeof temItem === 'function' && temItem('peixe')) {
        abrirDialogo([{ quem: 'Dellalos', texto: 'Trouxe um peixe fresco para você.' }], function () { tirarItem('peixe'); concluir(nome, P); });
        return;
      }
      let comprou = false;
      abrirDialogo([{
        quem: nome, texto: P.lembrar,
        opcoes: [
          { id: 'comprar', texto: 'Comprar um peixe (' + PRECO_PEIXE + ' moedas)',
            fn: function () {
              if (moedas < PRECO_PEIXE) { mostrarMensagem('Você precisa de ' + PRECO_PEIXE + ' moedas para comprar um peixe.'); return; }
              if (!darItem('peixe')) { mostrarMensagem('Sua mochila está cheia.'); return; }
              gastarMoedas(PRECO_PEIXE); comprou = true;
            } },
          { id: 'pescar', texto: 'Vou pescar um' }
        ]
      }], function () {
        if (comprou) { tirarItem('peixe'); concluir(nome, P); } else normal(npc);
      });
      return;
    }
    let vamos = false;
    abrirDialogo([{
      quem: nome, texto: P.lembrar,
      opcoes: [{ id: 'vamos', texto: 'Vamos tentar', fn: function () { vamos = true; } }, { id: 'depois', texto: 'Depois' }]
    }], function () { if (vamos) setTimeout(function () { if (!dialogoAberto) lancar(nome, P); }, 150); else normal(npc); });
  }

  // Retorna true se assumiu a conversa
  function aoConversar(npc, normal) {
    const P = npc && PEDIDOS[npc.nome];
    if (!P || typeof dialogoAberto === 'undefined' || dialogoAberto) return false;
    const d = dia();
    if (d < 2 || d >= diaFinal()) return false;
    if (typeof noiteAtiva === 'function' && noiteAtiva()) return false;
    if (!pendentes(npc.nome).length) return false;
    const s = estadoDe(npc.nome);
    if (s.st === 'aceita') { continuar(npc, P, normal); return true; }
    if (s.recusouDia === d) return false;
    oferecer(npc, P, normal); return true;
  }

  // Gancho: depois das falas de cobrança (V56), antes da conversa normal do NPC
  if (typeof npcVidaConversarEDepois === 'function') {
    const original = npcVidaConversarEDepois;
    window.npcVidaConversarEDepois = function (npc) {
      try { if (aoConversar(npc, original)) return; } catch (err) { console.warn('pazes v81:', err); }
      return original.apply(this, arguments);
    };
  }

  window.pazesV81 = { pendentes: pendentes, estado: function () { return mapa(); }, pedidos: PEDIDOS };
})();
