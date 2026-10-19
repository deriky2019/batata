/* Shadow of War V78 — vínculos com consequência no gameplay. Offline.
   Usa confiança/mágoa já existentes (relacaoEstadoSocial). Não altera a história:
   Isabela, Lucas e Thaina NÃO entram aqui (o final deles é fixo). */
(function () {
  'use strict';

  // Quem pode reagir aos vínculos. Isabela (vilã), Lucas (Caos) e Thaina ficam de fora de propósito.
  const ELEGIVEIS = ['Nathalia', 'Millena', 'Deriky', 'Veras', 'Simon', 'Vitinho'];
  const LIM = { aliadoConfianca: 65, aliadoMagoaMax: 40, aliadoAmizadeMin: 30, magoado: 60 };
  const MAX_ALIADOS = 3;
  const ALIADO_ALCANCE = 90, ALIADO_VEL = 150, ALIADO_RECARGA = 1.8, ALIADO_DANO = 1;

  function dados(nome) {
    try {
      if (typeof relacaoEstadoSocial !== 'function') return null;
      const p = relacaoEstadoSocial(nome);
      const temAmizade = typeof AMIGOS !== 'undefined' && AMIGOS[nome] && typeof amizadePontos === 'function';
      return { c: p.confianca, r: p.ressentimento, am: temAmizade ? amizadePontos(nome) : null };
    } catch (_) { return null; }
  }

  // 'aliado' | 'magoado' | 'neutro'
  function nivel(nome) {
    if (ELEGIVEIS.indexOf(nome) < 0) return 'neutro';
    const d = dados(nome);
    if (!d) return 'neutro';
    if (d.r >= LIM.magoado) return 'magoado';
    if (d.c >= LIM.aliadoConfianca && d.r < LIM.aliadoMagoaMax && (d.am === null || d.am >= LIM.aliadoAmizadeMin)) return 'aliado';
    return 'neutro';
  }

  // ---------- 1) Companheiros: confiança acelera, mágoa deixa relutante ----------
  function fatorRecarga(nome) {
    const n = nivel(nome);
    return n === 'aliado' ? 0.8 : n === 'magoado' ? 1.5 : 1;
  }
  if (typeof HAB_TIPOS !== 'undefined') {
    ['ataque', 'cura'].forEach(function (tipo) {
      const orig = HAB_TIPOS[tipo];
      if (typeof orig !== 'function') return;
      HAB_TIPOS[tipo] = function (c, h, dt) {
        const f = fatorRecarga(c && c.nome);
        if (f === 1) return orig(c, h, dt);
        return orig(c, Object.assign({}, h, { recarga: h.recarga * f }), dt);
      };
    });
  }

  // ---------- 2) Mágoa: recusa companhia e novos favores ----------
  const avisouHoje = {};
  function avisarUmaVez(nome, texto) {
    const d = typeof diaAtual === 'function' ? diaAtual() : 0;
    const k = nome + ':' + d;
    if (avisouHoje[k]) return;
    avisouHoje[k] = true;
    if (typeof filaAmizade !== 'undefined') filaAmizade.push(texto);
  }

  if (typeof definirCompanheiro === 'function') {
    const origDef = definirCompanheiro;
    window.definirCompanheiro = function (nome) {
      if (nivel(nome) === 'magoado') {
        // A Nathalia é necessária para a porta do selo: ela vai, mesmo magoada, para nunca travar a história.
        if (nome === 'Nathalia') {
          avisarUmaVez(nome, 'Nathalia vai com você, mas ainda está magoada. Converse e peça desculpas.');
        } else {
          if (typeof filaAmizade !== 'undefined') filaAmizade.push(nome + ' está magoada(o) e não quer andar com você agora. Tente pedir desculpas numa conversa.');
          return;
        }
      }
      return origDef.apply(this, arguments);
    };
  }

  if (typeof amizadeConversa === 'function') {
    const origConv = amizadeConversa;
    window.amizadeConversa = function (nome) {
      if (nivel(nome) !== 'magoado' || typeof AMIGOS === 'undefined' || !AMIGOS[nome]) return origConv.apply(this, arguments);
      const A = AMIGOS[nome];
      const missoes = A.missoes, recusou = A._recusou;
      const pendentes = missoes.filter(function (m) { return estadoPessoal(m.id) === 0; });
      A.missoes = missoes.filter(function (m) { return estadoPessoal(m.id) !== 0; });   // não oferece favor novo
      if (nome !== 'Nathalia') A._recusou = true;                                       // nem convite de companheiro
      let r;
      try { r = origConv.apply(this, arguments); } finally { A.missoes = missoes; A._recusou = recusou; }
      if (pendentes.length) avisarUmaVez(nome, nome + ' está magoada(o) e não quer pedir favores agora.');
      return r;
    };
  }

  // ---------- 3) Dia 15: aliados na onda de Sentinelas ----------
  let aliados = [], cenaAliados = null, onda = false;

  function acharNpc(nome) {
    try {
      for (const id in CENAS) {
        const n = (CENAS[id].npcs || []).find(function (x) { return x.nome === nome; });
        if (n) return n;
      }
    } catch (_) { }
    return null;
  }

  function criarAliado(nome) {
    const npc = acharNpc(nome);
    let proxy = null;
    if (npc) {
      try { prepararNpc(npc); } catch (_) { }
      proxy = Object.create(npc);
      proxy.quadro = { linha: 0, coluna: 0 };
      proxy.andar = { quadros: [0, 1, 2, 3] };
      proxy._rota = null; proxy._alfa = undefined;
    }
    const ang = Math.random() * Math.PI * 2;
    const a = { nome: nome, x: jogador.x + Math.cos(ang) * 90, y: jogador.y + Math.sin(ang) * 60, direcao: 'baixo', andando: false, anim: 0, recarga: 1 + Math.random(), golpe: null, proxy: proxy };
    if (typeof temSolido === 'function' && temSolido({ x: a.x - 14, y: a.y - 24, w: 28, h: 24 })) { a.x = jogador.x; a.y = jogador.y; }
    return a;
  }

  function sentinelasVivas() {
    return (typeof inimigos !== 'undefined' ? inimigos : []).filter(function (i) { return i.tipoId === 'sentinela_torneio' && i.vida > 0; });
  }

  function andarAte(a, tx, ty, dt) {
    const dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy) || 1;
    const nx = a.x + dx / d * ALIADO_VEL * dt, ny = a.y + dy / d * ALIADO_VEL * dt;
    const livre = function (x, y) { return typeof temSolido !== 'function' || !temSolido({ x: x - 14, y: y - 24, w: 28, h: 24 }); };
    let moveu = false;
    if (livre(nx, a.y)) { a.x = nx; moveu = true; }
    if (livre(a.x, ny)) { a.y = ny; moveu = true; }
    a.andando = moveu;
    a.direcao = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'esquerda' : 'direita') : (dy < 0 ? 'cima' : 'baixo');
  }

  function chamarAliados() {
    const comp = (typeof AM === 'function' && AM().comp) || '';
    const lista = ELEGIVEIS.filter(function (n) { return n !== comp && nivel(n) === 'aliado'; })
      .sort(function (x, y) { return dados(y).c - dados(x).c; }).slice(0, MAX_ALIADOS);
    aliados = lista.map(criarAliado);
    cenaAliados = cenaAtual;
    if (lista.length && typeof mostrarMensagem === 'function') {
      mostrarMensagem(lista.join(', ') + (lista.length > 1 ? ' vieram ajudar!' : ' veio ajudar!'));
    }
  }

  function recompensar() {
    if (historia.v78Recompensa) return;
    historia.v78Recompensa = true;
    aliados.forEach(function (a) {
      if (typeof relacaoAjustarSocial === 'function') relacaoAjustarSocial(a.nome, { confianca: 3, ressentimento: -2 }, 'Lutou ao lado da Dellalos contra as Sentinelas.');
    });
  }

  function atualizarAliados(dt) {
    if (typeof historia === 'undefined' || typeof inimigos === 'undefined') return;
    const vivas = sentinelasVivas();
    if (vivas.length && !onda && !historia.torneioFim) { onda = true; chamarAliados(); }
    if (!vivas.length && onda) {
      if (historia.torneioFim) recompensar();
      onda = false; aliados = []; cenaAliados = null;
      return;
    }
    if (!onda || cenaAliados !== cenaAtual) { if (onda && cenaAliados !== cenaAtual) { onda = false; aliados = []; cenaAliados = null; } return; }

    aliados.forEach(function (a) {
      a.recarga = Math.max(0, a.recarga - dt);
      a.anim += dt;
      if (a.golpe) { a.golpe.t -= dt; if (a.golpe.t <= 0) a.golpe = null; }
      let alvo = null, melhor = 1e9;
      vivas.forEach(function (i) { const d = Math.hypot(i.x - a.x, i.y - a.y); if (i.vida > 0 && d < melhor) { melhor = d; alvo = i; } });
      if (alvo) {
        if (melhor > ALIADO_ALCANCE) andarAte(a, alvo.x, alvo.y, dt);
        else {
          a.andando = false;
          a.direcao = Math.abs(alvo.x - a.x) > Math.abs(alvo.y - a.y) ? (alvo.x < a.x ? 'esquerda' : 'direita') : (alvo.y < a.y ? 'cima' : 'baixo');
          if (a.recarga <= 0) {
            a.recarga = ALIADO_RECARGA;
            if (typeof machucarInimigo === 'function') machucarInimigo(alvo, ALIADO_DANO);
            a.golpe = { x1: a.x, y1: a.y - 40, x2: alvo.x, y2: alvo.y - 24, t: 0.22 };
          }
        }
      } else if (Math.hypot(jogador.x - a.x, jogador.y - a.y) > 140) andarAte(a, jogador.x, jogador.y, dt);
      else a.andando = false;
    });
  }

  if (typeof atualizarCompanheiro === 'function') {
    const origAtu = atualizarCompanheiro;
    window.atualizarCompanheiro = function (dt) {
      const r = origAtu.apply(this, arguments);
      try { atualizarAliados(dt); } catch (e) { console.warn('V78 aliados:', e); }
      return r;
    };
  }

  function desenharAliado(a) {
    if (a.proxy) {
      const p = a.proxy;
      p.x = a.x; p.y = a.y; p.direcao = a.direcao; p.andando = a.andando; p._tempoAnim = a.anim;
      desenharNpc(p);
    } else {
      ctx.fillStyle = '#7a5aa8'; ctx.beginPath(); ctx.arc(a.x, a.y - 50, 26, 0, Math.PI * 2); ctx.fill();
    }
    ctx.save();
    ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.lineWidth = 4; ctx.strokeStyle = '#1a1226'; ctx.strokeText(a.nome, a.x, a.y - 136);
    ctx.fillStyle = '#ffe9a8'; ctx.fillText(a.nome, a.x, a.y - 136);
    if (a.golpe) {
      ctx.globalAlpha = Math.max(0, Math.min(1, a.golpe.t * 4));
      ctx.strokeStyle = '#fff4c2'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(a.golpe.x1, a.golpe.y1); ctx.lineTo(a.golpe.x2, a.golpe.y2); ctx.stroke();
    }
    ctx.restore();
  }

  // Chamado por js/desenho.js para entrar na ordem de profundidade
  window.aliadosV78Seres = function (seres) {
    if (!onda || cenaAliados !== cenaAtual) return;
    aliados.forEach(function (a) { seres.push({ y: a.y, desenhar: function () { desenharAliado(a); } }); });
  };

  // ---------- 4) Painel: o que cada vínculo faz no jogo ----------
  function el(tag, txt) { const n = document.createElement(tag); if (txt !== undefined) n.textContent = txt; return n; }
  function efeitoTexto(nome) {
    const n = nivel(nome);
    if (n === 'aliado') return 'Confia em você: ajuda no dia 15 e, como companheiro(a), age mais rápido.';
    if (n === 'magoado') return 'Magoado(a): recusa companhia e novos favores. Um pedido de desculpas ajuda.';
    return 'Neutro: sem efeito ainda.';
  }
  function render() {
    const alvo = document.getElementById('abaRelacionamento');
    if (!alvo) return;
    const antigo = alvo.querySelector('[data-v78-vinculos]');
    if (antigo) antigo.remove();
    const box = el('section');
    box.dataset.v78Vinculos = '1';
    box.className = 'relacao-card';
    box.style.cssText = 'margin:12px 0;padding:12px;border:2px solid #9b7a43;background:#29251d;color:#f4e8c9';
    box.append(el('h3', '🤝 EFEITOS NO JOGO — V78'));
    ELEGIVEIS.forEach(function (nome) {
      const d = dados(nome);
      if (!d) return;
      if (typeof conhecePersonagem === 'function' && !conhecePersonagem(nome)) return;
      box.append(el('p', nome + ' — confiança ' + d.c + ', mágoa ' + d.r + '. ' + efeitoTexto(nome)));
    });
    if (box.children.length > 1) alvo.append(box);
  }
  window.vinculosGameplayV78 = { nivel: nivel, dados: dados, render: render, aliados: function () { return aliados.map(function (a) { return a.nome; }); } };

  function start() {
    render();
    const b = document.getElementById('abaBtnRelacionamento');
    if (b) b.addEventListener('click', function () { setTimeout(render, 120); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
