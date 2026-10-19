/* Shadow of War V79 — promessas com prazo feitas na conversa livre. Offline.
   Reaproveita o sistema de promessas da V56 (js/npcvida.js): as promessas entram em
   diario.escolhas.promessas e são cumpridas/quebradas pelas mesmas regras (confiança, mágoa, amizade).
   Lucas, Isabela e Thaina (final fixo) não registram promessas. */
(function () {
  'use strict';

  const MAX_ABERTAS = 3;      // promessas abertas ao mesmo tempo (V56 pede no máximo 2 para as do NPC)
  const MAX_DIAS = 5;         // prazo máximo a partir de hoje
  const NUMEROS = { um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5 };
  const SEM_PROMESSA = ['Lucas'];   // além da lista NPC_VIDA_SEM_REACAO (Isabela, Thaina, Caos...)

  const norm = function (s) {
    return String(s || '').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  };
  const hojeDia = function () { try { return typeof diaAtual === 'function' ? (Number(diaAtual()) || 1) : 1; } catch (_) { return 1; } };
  const diaFinal = function () { return typeof DIA_FINAL !== 'undefined' ? DIA_FINAL : 15; };

  const RE_COMPROMISSO = /\b(prometo|prometi|juro|combinado|pode deixar|pode contar comigo|conte comigo)\b/;
  const RE_VOLTAR = /\b(volto|voltar|volta|passo|passar|visito|visitar|aparecer|apareco|venho|vir|te vejo|nos vemos|encontro|encontrar)\b/;
  const RE_RECUSA = /\b(nao precisa|nao quero|nao volte|vai embora|me deixa em paz)\b/;

  function eNumero(x) { return /^\d+$/.test(x) ? parseInt(x, 10) : (NUMEROS[x] || 0); }

  // Devolve o dia combinado (prazo) ou null se a frase não é uma promessa de voltar.
  function prazoDe(pergunta, hoje) {
    const t = norm(pergunta);
    if (!RE_COMPROMISSO.test(t) || !RE_VOLTAR.test(t)) return null;
    let prazo = null, m;
    if (/\bdepois de amanha\b/.test(t)) prazo = hoje + 2;
    else if ((m = t.match(/\b(?:em|daqui a|daqui)\s+(\d+|um|uma|dois|duas|tres|quatro|cinco)\s+dias?\b/))) prazo = hoje + eNumero(m[1]);
    else if ((m = t.match(/\bdia\s+(\d{1,2})\b/)) && parseInt(m[1], 10) > hoje) prazo = parseInt(m[1], 10);
    else if (/\bamanha\b/.test(t)) prazo = hoje + 1;
    else if (/\b(hoje|agora)\b/.test(t)) return null;      // o sistema é por dia: "hoje" não dá prazo
    else prazo = hoje + 1;                                   // sem prazo dito: amanhã
    prazo = Math.min(prazo, hoje + MAX_DIAS, diaFinal());
    return prazo > hoje ? prazo : null;
  }

  function lista() {
    if (typeof npcVidaListaPromessas === 'function') return npcVidaListaPromessas();
    if (typeof diario !== 'undefined') { if (!Array.isArray(diario.escolhas.promessas)) diario.escolhas.promessas = []; return diario.escolhas.promessas; }
    return [];
  }
  function bloqueado(nome) {
    if (SEM_PROMESSA.indexOf(nome) >= 0) return true;
    return typeof NPC_VIDA_SEM_REACAO !== 'undefined' && NPC_VIDA_SEM_REACAO.indexOf(nome) >= 0;
  }
  function avisar(texto) { if (typeof filaAmizade !== 'undefined') filaAmizade.push(texto); }

  function aplicar(nome, pergunta, resposta) {
    if (!nome || !pergunta || bloqueado(nome)) return null;
    if (typeof diario === 'undefined') return null;
    const hoje = hojeDia();
    if (hoje >= diaFinal()) return null;
    const prazo = prazoDe(pergunta, hoje);
    if (!prazo) return null;
    if (RE_RECUSA.test(norm(resposta))) return null;
    const l = lista();
    if (l.some(function (p) { return p.nome === nome && p.status === 'aberta'; })) return null;   // já existe uma aberta com ele(a)
    if (l.filter(function (p) { return p.status === 'aberta'; }).length >= MAX_ABERTAS) {
      avisar('Você já tem promessas demais abertas. Cumpra uma antes de prometer outra.');
      return null;
    }
    const item = { id: hoje + '_' + nome.replace(/[^a-z0-9]/gi, '') + '_c', nome: nome, dia: hoje, prazo: prazo, status: 'aberta', cobrada: false, origem: 'chat', texto: String(pergunta).trim().slice(0, 80) };
    l.push(item);
    if (l.length > 20) l.splice(0, l.length - 20);
    avisar('Promessa: voltar a falar com ' + nome + ' no dia ' + prazo + '. Se faltar, ele(a) vai se magoar.');
    render();
    return item;
  }

  // ---- A conversa sobre promessas passa a citar o prazo ----
  function complementar(nome, pergunta, resposta) {
    try {
      if (!/\b(promessa|prometeu|prometi|prazo|combinamos|combinado)\b/.test(norm(pergunta))) return resposta;
      const p = lista().filter(function (x) { return x.nome === nome && x.status === 'aberta'; })[0];
      if (!p) return resposta;
      const frase = ' Você combinou de voltar a falar comigo no dia ' + p.prazo + '.';
      return String(resposta || '').indexOf('no dia ' + p.prazo) >= 0 ? resposta : String(resposta || '').trim() + frase;
    } catch (_) { return resposta; }
  }
  if (window.memoriaConversasV76 && typeof window.memoriaConversasV76.complementar === 'function') {
    const orig = window.memoriaConversasV76.complementar;
    window.memoriaConversasV76.complementar = function (nome, q, r) { return complementar(nome, q, orig.call(this, nome, q, r)); };
  }

  // ---- Painel ----
  function el(tag, txt) { const n = document.createElement(tag); if (txt !== undefined) n.textContent = txt; return n; }
  function render() {
    const alvo = document.getElementById('abaRelacionamento');
    if (!alvo) return;
    const antigo = alvo.querySelector('[data-v79-promessas]');
    if (antigo) antigo.remove();
    let l = [];
    try { l = lista(); } catch (_) { }
    if (!l.length) return;
    const box = el('section');
    box.dataset.v79Promessas = '1';
    box.className = 'relacao-card';
    box.style.cssText = 'margin:12px 0;padding:12px;border:2px solid #9b7a43;background:#29251d;color:#f4e8c9';
    box.append(el('h3', '🤞 PROMESSAS — V79'));
    box.append(el('p', 'Prometa voltar na conversa livre e vá falar com a pessoa no dia combinado. Antes do prazo não vale; depois dele, a promessa se quebra.'));
    l.filter(function (p) { return p.status === 'aberta'; }).forEach(function (p) { box.append(el('p', '⏳ ' + p.nome + ' — voltar no dia ' + p.prazo + ' (prometido no dia ' + p.dia + ')')); });
    l.filter(function (p) { return p.status !== 'aberta'; }).slice(-5).reverse().forEach(function (p) { box.append(el('p', (p.status === 'cumprida' ? '✅ ' : '💔 ') + p.nome + ' — ' + (p.status === 'cumprida' ? 'cumprida' : 'quebrada') + ' (prazo: dia ' + p.prazo + ')')); });
    alvo.append(box);
  }

  window.promessasChatV79 = { aplicar: aplicar, prazoDe: prazoDe, complementar: complementar, render: render };

  function start() {
    render();
    const b = document.getElementById('abaBtnRelacionamento');
    if (b) b.addEventListener('click', function () { setTimeout(render, 140); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
