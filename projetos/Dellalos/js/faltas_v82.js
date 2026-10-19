/* Shadow of War V82 — FALTAS NA ESCOLA (offline).
   Do dia 2 ao dia 14, se a Dellalos NÃO for à escola até anoitecer, conta 1 falta naquele dia:
     - cada falta desconta 2 pontos de reputação (nunca abaixo de 0);
     - na próxima conversa de dia com a Nathalia e com a Millena, cada uma comenta a falta.
   ENTRAR NA HISTÓRIA CONTA COMO PRESENÇA: se no mesmo dia ela avançou a história do dia
   (amigo do papai, Dália, seita, Lucas/Thaina, sala 1A, Gaby), a falta não vale (ou é desfeita).
   Estado salvo em diario.escolhas.faltasV82 = { dias: [3, 9], comentou: { Nathalia: [3], Millena: [] } }.
   Ajustes: DESCONTO_BASE e FLAGS_HISTORIA no topo; textos em FALAS. */
(function () {
  'use strict';

  const DESCONTO_BASE = 2;   // pontos de reputação perdidos por falta
  // árvore (v83): Aluna aplicada = só 1 ponto por falta
  function desconto() { return (typeof arvoreTem === 'function' && arvoreTem('aluna')) ? 1 : DESCONTO_BASE; }

  // Quem avançou a história do dia (conta como presença). Dia -> lista de flags de `historia` (qualquer uma serve).
  const FLAGS_HISTORIA = {
    2: ['conheceuAmigoPai'],
    5: ['recebeuDalia'],
    6: ['simonAcompanha', 'revelouSeita'],
    7: ['thainaPediu', 'sabeOndeLucas', 'thainaFim'],
    8: ['fimChave1A'],
    9: ['gabyDerrotada', 'gabySalva', 'gabyFim']
  };

  // Falas de cada uma. 1ª falta, 2ª e 3ª ou mais.
  const FALAS = {
    Nathalia: [
      ['Você não apareceu na escola ontem. Eu fiquei olhando para a porta.', 'Se precisar faltar, me avisa. Só isso.'],
      ['Faltou de novo... Estou começando a me preocupar de verdade com você.', 'A escola não vai cair se você aparecer, Dellalos.'],
      ['Já perdi a conta das suas faltas. As pessoas estão comentando.', 'Não quero ser a chata, mas eu me importo. Aparece amanhã, tá?']
    ],
    Millena: [
      ['Ei, senti sua falta na aula! O professor até perguntou de você.', 'Eu disse que você estava ocupada. Não me faça mentir de novo!'],
      ['Mais uma falta? Eu guardei o caderno para você, mas não posso fazer isso sempre.', 'Se está acontecendo alguma coisa, pode me contar.'],
      ['Dellalos, a diretora já perguntou por você duas vezes. Eu não sei mais o que dizer.', 'Vem para a aula, por favor. Eu quero ficar do seu lado.']
    ]
  };

  function estado() {
    const e = diario.escolhas;
    if (!e.faltasV82 || typeof e.faltasV82 !== 'object') e.faltasV82 = {};
    const s = e.faltasV82;
    if (!Array.isArray(s.dias)) s.dias = [];
    if (!s.comentou || typeof s.comentou !== 'object') s.comentou = {};
    return s;
  }
  function dia() { return typeof diaAtual === 'function' ? diaAtual() : 1; }
  function diaFinal() { return typeof DIA_FINAL === 'number' ? DIA_FINAL : 15; }
  function total() { return estado().dias.length; }

  // Dia de aula em que o sistema vale (dia 2 a 14, jogo no formato novo, fora da noite especial do dia 4)
  function vale() {
    if (typeof historia === 'undefined' || !historia.novoDia) return false;
    const d = dia();
    if (d < 2 || d >= diaFinal()) return false;
    if (typeof noiteAtiva === 'function' && noiteAtiva()) return false;
    return true;
  }

  function presencaPorHistoria(d) {
    const lista = FLAGS_HISTORIA[d];
    if (!lista) return false;
    for (let i = 0; i < lista.length; i++) if (historia[lista[i]]) return true;
    return false;
  }
  function foiNaEscola() { return typeof escolaHoje === 'function' && escolaHoje(); }
  function presente(d) { return foiNaEscola() || presencaPorHistoria(d); }

  function ajustarNivelAvisado() {
    // se a reputação caiu de nível, o aviso "Reputação: X!" volta a aparecer quando ela subir de novo
    try {
      if (typeof reputacaoNivel === 'function') {
        const atual = reputacaoNivel(), avisado = Number(diario.escolhas.repNivel) || 0;
        if (avisado > atual) diario.escolhas.repNivel = atual;
      }
    } catch (_) { }
  }

  // Chamado quando anoitece (js/ciclo.js) e ao conversar: registra ou desfaz a falta do dia
  function verificar() {
    if (!vale()) return;
    const s = estado(), d = dia(), i = s.dias.indexOf(d);
    if (presente(d)) {
      if (i >= 0) {                                         // entrou na história depois: a falta é desfeita
        s.dias.splice(i, 1);
        ['Nathalia', 'Millena'].forEach(function (n) { const c = s.comentou[n]; if (Array.isArray(c)) { const j = c.indexOf(d); if (j >= 0) c.splice(j, 1); } });
        ajustarNivelAvisado();
        if (typeof mostrarMensagem === 'function') mostrarMensagem('A história de hoje contou como presença. A falta foi desfeita.');
      }
      return;
    }
    // só conta depois de anoitecer (a escola de hoje ainda pode acontecer de dia)
    if (typeof cicloEhNoite === 'function' && !cicloEhNoite()) return;
    if (i >= 0) return;
    s.dias.push(d);
    ajustarNivelAvisado();
    setTimeout(function () {
      if (typeof mostrarMensagem === 'function') mostrarMensagem('Faltei à escola hoje. -' + desconto() + ' de reputação (' + total() + ' falta' + (total() > 1 ? 's' : '') + ').');
    }, 3200);
  }

  // ---------- Reputação: desconto por faltas ----------
  if (typeof reputacaoPontos === 'function') {
    const original = reputacaoPontos;
    window.reputacaoPontos = function () {
      let n = original.apply(this, arguments);
      try { n = Math.max(0, n - desconto() * total()); } catch (_) { }
      return n;
    };
  }
  if (typeof desenharReputacaoNaCaixa === 'function') {
    const original = desenharReputacaoNaCaixa;
    window.desenharReputacaoNaCaixa = function (caixa) {
      original.apply(this, arguments);
      try {
        const f = total();
        if (!f) return;
        const ds = caixa.querySelectorAll('.missao-desc');
        const d = ds[ds.length - 1];
        if (d) d.textContent += ' Faltas na escola: ' + f + ' (-' + (f * desconto()) + ' de reputação).';
      } catch (_) { }
    };
  }

  // ---------- Nathalia e Millena comentam ----------
  function pendente(nome) {
    const s = estado(), ja = s.comentou[nome] || [], d = dia();
    const faltas = s.dias.filter(function (x) { return x < d && ja.indexOf(x) < 0; });
    return faltas.length ? faltas[faltas.length - 1] : 0;     // a falta mais recente ainda não comentada
  }
  function comentar(npc, original) {
    const nome = npc.nome, f = pendente(nome);
    if (!f) return false;
    const s = estado();
    (s.comentou[nome] = s.comentou[nome] || []).push(f);
    // comentou a falta mais recente: as anteriores também ficam como comentadas
    s.dias.forEach(function (x) { if (x < dia() && s.comentou[nome].indexOf(x) < 0) s.comentou[nome].push(x); });
    const k = Math.min(total(), 3) - 1;
    const falas = FALAS[nome][Math.max(0, k)].map(function (t) { return { quem: nome, texto: t }; });
    abrirDialogo(falas, function () { original.call(window, npc); });
    return true;
  }

  if (typeof npcVidaConversarEDepois === 'function') {
    const original = npcVidaConversarEDepois;
    window.npcVidaConversarEDepois = function (npc) {
      try {
        if (npc && FALAS[npc.nome] && vale() && !(typeof noiteAtiva === 'function' && noiteAtiva()) &&
            !(typeof dialogoAberto !== 'undefined' && dialogoAberto)) {
          verificar();
          if (comentar(npc, original)) return;
        }
      } catch (err) { console.warn('faltas v82:', err); }
      return original.apply(this, arguments);
    };
  }

  window.faltasV82 = { verificar: verificar, total: total, estado: estado, desconto: desconto };
  window.faltaV82Verificar = verificar;
})();
