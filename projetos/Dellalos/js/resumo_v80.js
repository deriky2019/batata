/* Shadow of War V80 — "Anteriormente...": resumo do que aconteceu desde a última vez, na tela inicial. Offline.
   Como funciona: ao tocar em Continuar, o jogo guarda uma "foto" do progresso dentro do próprio save
   (diario.escolhas.resumoV80). Na próxima abertura, compara a foto com o save atual e conta o que mudou.
   Não altera a história nem o save além desse campo. */
(function () {
  'use strict';

  const MAX_LINHAS = 8;
  const MIN_VINCULO = 8;   // mudança mínima de confiança/mágoa para aparecer no resumo

  const diaFinal = function () { return typeof DIA_FINAL !== 'undefined' ? DIA_FINAL : 15; };
  const chaves = function (o) { return Object.keys(o || {}).filter(function (k) { return o[k]; }); };

  // "Foto" do progresso a partir de dados de save ({diario, moedas, historia}) ou do jogo rodando.
  function foto(d) {
    const di = (d && d.diario) || {}, esc = di.escolhas || {};
    const am = esc.amizade || {};
    const soc = ((esc.relacoes || {}).social || {}).pessoas || {};
    const pessoal = am.pessoal || {};
    const dia = Number(esc.dia) >= 1 ? Math.min(Math.floor(Number(esc.dia)), diaFinal()) : ((d && d.historia && d.historia.novoDia) ? 2 : 1);
    const f = { dia: dia, moedas: Number(d && d.moedas) || 0, fim: chaves(di.fim), infos: chaves(di.infos), conhecidos: chaves(di.conhecidos),
      pessoal: Object.keys(pessoal).filter(function (k) { return pessoal[k] && pessoal[k].s === 2; }),
      amizade: {}, soc: {}, prom: {} };
    Object.keys(am.pontos || {}).forEach(function (n) { f.amizade[n] = Number(am.pontos[n]) || 0; });
    Object.keys(soc).forEach(function (n) { f.soc[n] = [Number(soc[n].confianca) || 0, Number(soc[n].ressentimento) || 0]; });
    (Array.isArray(esc.promessas) ? esc.promessas : []).forEach(function (p) { if (p && p.id) f.prom[p.id] = { s: p.status, n: p.nome, prazo: p.prazo }; });
    return f;
  }

  function nivelDe(pontos) {
    const lim = typeof AMIGO_LIMITES !== 'undefined' ? AMIGO_LIMITES : [0, 10, 30, 60, 100];
    let nv = 1;
    lim.forEach(function (l, i) { if (pontos >= l) nv = i + 1; });
    return nv;
  }
  function nomeDoNivel(nome, nv) {
    try { if (typeof nomeNivel === 'function') return nomeNivel(nome, nv); } catch (_) { }
    return (typeof AMIGO_NIVEIS !== 'undefined' && AMIGO_NIVEIS[nv - 1]) || ('nível ' + nv);
  }
  function tituloMissao(id) {
    try {
      const m = (typeof MISSOES !== 'undefined' ? MISSOES : []).find(function (x) { return x.id === id; });
      if (m) return m.titulo;
      if (typeof AMIGOS !== 'undefined') for (const n in AMIGOS) { const p = (AMIGOS[n].missoes || []).find(function (x) { return x.id === id; }); if (p) return p.titulo; }
    } catch (_) { }
    return null;
  }
  const lista = function (a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1]; };
  const corta = function (t, n) { t = String(t || ''); return t.length > n ? t.slice(0, n - 1).trim() + '…' : t; };

  // Compara a foto antiga com a atual e devolve as linhas do resumo.
  function resumir(antes, agora) {
    const L = [];
    if (agora.dia !== antes.dia) L.push('📅 Do dia ' + antes.dia + ' para o dia ' + agora.dia + '.');

    const feitas = agora.fim.concat(agora.pessoal).filter(function (id) { return antes.fim.indexOf(id) < 0 && antes.pessoal.indexOf(id) < 0; })
      .map(tituloMissao).filter(Boolean);
    if (feitas.length) L.push('✅ Missões concluídas: ' + lista(feitas) + '.');

    const novos = agora.conhecidos.filter(function (n) { return antes.conhecidos.indexOf(n) < 0; });
    if (novos.length) L.push('👥 Você conheceu: ' + lista(novos.slice(0, 4)) + (novos.length > 4 ? ' e mais ' + (novos.length - 4) : '') + '.');

    const subiram = [];
    Object.keys(agora.amizade).forEach(function (n) {
      const a = nivelDe(antes.amizade[n] || 0), b = nivelDe(agora.amizade[n]);
      if (b > a) subiram.push(n + ' (' + nomeDoNivel(n, b) + ')');
    });
    if (subiram.length) L.push('💞 Amizade cresceu: ' + lista(subiram) + '.');

    const vinc = [];
    Object.keys(agora.soc).forEach(function (n) {
      const a = antes.soc[n] || [50, 0], b = agora.soc[n];
      if (b[0] - a[0] >= MIN_VINCULO) vinc.push(n + ' confia mais em você');
      else if (a[0] - b[0] >= MIN_VINCULO) vinc.push(n + ' confia menos em você');
      if (b[1] - a[1] >= MIN_VINCULO) vinc.push(n + ' ficou magoado(a)');
      else if (a[1] - b[1] >= MIN_VINCULO) vinc.push(n + ' está menos magoado(a)');
    });
    if (vinc.length) L.push('🤝 Vínculos: ' + lista(vinc.slice(0, 4)) + '.');

    const cumpr = [], quebr = [];
    Object.keys(agora.prom).forEach(function (id) {
      const p = agora.prom[id], a = antes.prom[id];
      if (p.s === 'cumprida' && (!a || a.s !== 'cumprida')) cumpr.push(p.n);
      if (p.s === 'quebrada' && (!a || a.s !== 'quebrada')) quebr.push(p.n);
    });
    if (cumpr.length) L.push('🤞 Promessa cumprida com ' + lista(cumpr) + '.');
    if (quebr.length) L.push('💔 Promessa quebrada com ' + lista(quebr) + '.');

    const infos = agora.infos.filter(function (i) { return antes.infos.indexOf(i) < 0 && typeof INFOS !== 'undefined' && INFOS[i]; });
    if (infos.length) {
      L.push('🔎 Descoberta: ' + corta(INFOS[infos[infos.length - 1]], 110) + (infos.length > 1 ? ' (+' + (infos.length - 1) + ' outras no Diário)' : ''));
    }

    const dm = agora.moedas - antes.moedas;
    if (Math.abs(dm) >= 10) L.push('🪙 ' + (dm > 0 ? '+' : '') + dm + ' moedas.');
    return L.slice(0, MAX_LINHAS);
  }

  // O que ainda está pendente agora (só aparece junto com um resumo).
  function pendencias(agora) {
    const P = [];
    Object.keys(agora.prom).forEach(function (id) {
      const p = agora.prom[id];
      if (p.s === 'aberta') P.push('⏳ Promessa: voltar a falar com ' + p.n + ' no dia ' + p.prazo + '.');
    });
    try {
      if (typeof AGENDA_DIAS !== 'undefined' && AGENDA_DIAS[agora.dia]) {
        const hoje = AGENDA_DIAS[agora.dia].filter(function (a) { return agora.fim.indexOf(a.id) < 0; }).map(function (a) { return a.onde; });
        if (hoje.length) P.push('🎯 Missão do dia: ' + lista(hoje) + '.');
      }
    } catch (_) { }
    return P.slice(0, 3);
  }

  // ---------- Tela inicial ----------
  let linhasMenu = [];

  function el(tag, txt) { const n = document.createElement(tag); if (txt !== undefined) n.textContent = txt; return n; }

  function montarCartao(titulo, linhas) {
    const box = el('section');
    box.style.cssText = 'max-width:min(92vw,460px);max-height:34vh;overflow-y:auto;margin:10px auto;padding:10px 12px;border:2px solid #9b7a43;background:rgba(41,37,29,.94);color:#f4e8c9;font-size:14px;line-height:1.35;text-align:left;border-radius:6px';
    box.append(el('strong', titulo));
    linhas.forEach(function (t) { const p = el('p', t); p.style.margin = '4px 0 0'; box.append(p); });
    return box;
  }

  function renderMenu() {
    const menu = document.getElementById('menuInicial');
    if (!menu) return;
    const antigo = document.getElementById('resumoV80');
    if (antigo) antigo.remove();
    linhasMenu = [];
    try {
      if (typeof lerSave !== 'function') return;
      const d = lerSave();
      if (!d || !d.diario) return;
      const base = d.diario.escolhas && d.diario.escolhas.resumoV80;
      if (!base || !base.snap) return;                       // primeira vez com esta versão: só guarda a foto ao continuar
      const agora = foto(d);
      if (agora.dia < base.snap.dia) return;                 // save de outra partida: ignora
      const linhas = resumir(Object.assign({ fim: [], pessoal: [], infos: [], conhecidos: [], amizade: {}, soc: {}, prom: {} }, base.snap), agora);
      if (!linhas.length) return;
      linhasMenu = linhas.concat(pendencias(agora));
      const box = montarCartao('📖 Anteriormente…', linhasMenu);
      box.id = 'resumoV80';
      const botoes = menu.querySelector('.menu-botoes');
      if (botoes) menu.insertBefore(box, botoes); else menu.append(box);
    } catch (e) { console.warn('V80 resumo:', e); }
  }

  if (typeof mostrarMenuInicial === 'function') {
    const orig = mostrarMenuInicial;
    window.mostrarMenuInicial = function () { const r = orig.apply(this, arguments); renderMenu(); return r; };
  }

  // Depois que o save é aplicado (Continuar ou Do zero), guarda a foto do progresso para a próxima vez.
  if (typeof anunciarMissaoInicial === 'function') {
    const origAnun = anunciarMissaoInicial;
    window.anunciarMissaoInicial = function () {
      const r = origAnun.apply(this, arguments);
      try {
        const esc = diario.escolhas;
        const antigo = esc.resumoV80 && esc.resumoV80.ultimo;
        esc.resumoV80 = { snap: foto({ diario: diario, moedas: moedas, historia: historia }), ultimo: linhasMenu.length ? linhasMenu.slice() : (Array.isArray(antigo) ? antigo : []) };
        linhasMenu = [];
      } catch (e) { console.warn('V80 foto:', e); }
      return r;
    };
  }

  // ---------- Painel: relê o último resumo ----------
  function renderPainel() {
    const alvo = document.getElementById('abaRelacionamento');
    if (!alvo || typeof diario === 'undefined') return;
    const antigo = alvo.querySelector('[data-v80-resumo]');
    if (antigo) antigo.remove();
    const ult = diario.escolhas.resumoV80 && diario.escolhas.resumoV80.ultimo;
    if (!Array.isArray(ult) || !ult.length) return;
    const box = montarCartao('📜 O que aconteceu da última vez', ult);
    box.dataset.v80Resumo = '1';
    box.style.maxHeight = 'none';
    alvo.append(box);
  }

  window.resumoV80 = { foto: foto, resumir: resumir, pendencias: pendencias, renderMenu: renderMenu, renderPainel: renderPainel };

  function start() {
    renderMenu();
    const b = document.getElementById('abaBtnRelacionamento');
    if (b) b.addEventListener('click', function () { setTimeout(renderPainel, 160); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
