/* Shadow of War V81 — minijogos curtos (offline, sem imagens novas).
   Três minijogos em uma tela por cima do jogo (o jogo fica pausado enquanto ela está aberta):
     - Pescaria  : espere o peixe morder e puxe quando o marcador estiver na faixa verde.
     - Entrega   : leve cada pacote para a casa certa antes de o tempo acabar.
     - Símbolos  : memorize a ordem em que os símbolos acendem e repita.
   API (window.minijogoV81): pescar(opcoes, aoFim), entregar(opcoes, aoFim), simbolos(opcoes, aoFim).
   aoFim(ok, info) roda quando a tela fecha. Atalho: window.pescarV81(facil, aoFim).
   Ajustes: constantes no topo de cada minijogo. */
(function () {
  'use strict';

  // ---------- Ajustes ----------
  const PESCA = { tentativas: 3, tentativasFacil: 4, faixa: 0.24, faixaFacil: 0.36, espera: [1200, 3200], janela: 2800, velocidade: 0.85 };
  const ENTREGA = { pacotes: 5, tempo: 6, erros: 1 };
  const SIMBOLOS = { tamanho: 4, erros: 2, mostra: 750, pausa: 250 };

  const rnd = function (a, b) { return a + Math.random() * (b - a); };
  const embaralhar = function (l) { const v = l.slice(); for (let i = v.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = v[i]; v[i] = v[j]; v[j] = t; } return v; };
  const som = function (nome) { try { if (typeof tocarSom === 'function') tocarSom(nome); } catch (_) { } };

  // ---------- Estilo ----------
  (function estilo() {
    const s = document.createElement('style');
    s.textContent =
      '#painelMinijogoV81{position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.8);font-family:inherit;touch-action:manipulation;-webkit-user-select:none;user-select:none}' +
      '.mjv81-caixa{width:min(440px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;box-sizing:border-box;padding:16px;border:3px solid #8063a6;border-radius:14px;background:rgba(20,18,29,.98);color:#f7f1ff;display:flex;flex-direction:column;gap:10px}' +
      '.mjv81-caixa h2{margin:0;font-size:20px}.mjv81-caixa p{margin:0;line-height:1.35}' +
      '.mjv81-sub{color:#cdbfe6;font-size:14px}.mjv81-status{min-height:26px;font-size:18px;font-weight:bold;text-align:center}' +
      '.mjv81-info{text-align:center;color:#cdbfe6;font-size:14px}' +
      '.mjv81-btn{min-height:48px;padding:8px 12px;border:2px solid #8063a6;border-radius:10px;background:#2b2440;color:#f7f1ff;font:inherit;font-size:16px;cursor:pointer}' +
      '.mjv81-btn:active{background:#3b3160}.mjv81-btn[disabled]{opacity:.45}' +
      '.mjv81-grande{min-height:64px;font-size:22px;font-weight:bold;background:#3d6b3d;border-color:#7fd17f}' +
      '.mjv81-pulsa{animation:mjv81p .35s infinite alternate}@keyframes mjv81p{from{transform:scale(1)}to{transform:scale(1.04)}}' +
      '.mjv81-barra{position:relative;height:34px;border:2px solid #8063a6;border-radius:8px;background:#161226;overflow:hidden}' +
      '.mjv81-zona{position:absolute;top:0;bottom:0;background:rgba(90,200,90,.55)}' +
      '.mjv81-marcador{position:absolute;top:-2px;bottom:-2px;width:8px;margin-left:-4px;background:#ffd34d;border-radius:4px}' +
      '.mjv81-grade{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}' +
      '.mjv81-casa{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:78px;font-size:14px}' +
      '.mjv81-casa b{font-size:28px;font-weight:normal}' +
      '.mjv81-pacote{text-align:center;font-size:20px;padding:8px;border:2px dashed #cdbfe6;border-radius:10px}.mjv81-pacote b{display:block;font-size:44px;font-weight:normal}' +
      '.mjv81-tempo{height:8px;border-radius:4px;background:#161226;overflow:hidden}.mjv81-tempo i{display:block;height:100%;width:100%;background:#ffd34d}' +
      '.mjv81-seq{display:flex;justify-content:center;gap:8px;min-height:64px}' +
      '.mjv81-slot{width:48px;height:56px;display:flex;align-items:center;justify-content:center;font-size:30px;border:2px solid #8063a6;border-radius:8px;background:#161226}' +
      '.mjv81-slot.ok{border-color:#7fd17f;background:#1f3a1f}.mjv81-slot.luz{border-color:#ffd34d;background:#4a3d12}' +
      '.mjv81-simbolos{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.mjv81-simbolos .mjv81-btn{font-size:32px;min-height:64px}' +
      '.mjv81-rodape{display:flex;gap:8px;justify-content:space-between}.mjv81-rodape .mjv81-btn{min-height:40px;font-size:14px;flex:1}';
    document.head.appendChild(s);
  })();

  // ---------- Tela e pausa ----------
  let atual = null;
  window.minijogoV81Aberto = false;

  if (typeof atualizarJogo === 'function') {
    const origAtualizar = atualizarJogo;
    window.atualizarJogo = function (dt) {
      if (window.minijogoV81Aberto) { try { jogador.quadro = 0; jogador.tempoAnim = 0; } catch (_) { } return; }
      return origAtualizar.apply(this, arguments);
    };
  }
  if (typeof jogoRodando === 'function') {                     // o relógio do dia/noite também para
    const origRodando = jogoRodando;
    window.jogoRodando = function () { return !window.minijogoV81Aberto && origRodando.apply(this, arguments); };
  }
  window.addEventListener('keydown', function (e) {            // teclado: não deixa o jogo reagir por baixo
    if (!atual) return;
    e.stopImmediatePropagation();
    if (e.key === 'Escape') { e.preventDefault(); atual.fechar(false, { desistiu: true }); return; }
    if ((e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') && !e.repeat && atual.acao) { e.preventDefault(); atual.acao(); }
  }, true);

  function el(tag, cls, txt) { const n = document.createElement(tag); if (cls) n.className = cls; if (txt !== undefined) n.textContent = txt; return n; }

  function abrir(titulo, subtitulo, aoFim) {
    if (atual) return null;                                    // já tem um aberto
    try { ['up', 'down', 'left', 'right'].forEach(function (k) { teclado[k] = false; if (typeof toque === 'object') toque[k] = false; }); } catch (_) { }
    const raiz = el('div'); raiz.id = 'painelMinijogoV81';
    const caixa = el('div', 'mjv81-caixa');
    const corpo = el('div'); corpo.style.cssText = 'display:flex;flex-direction:column;gap:10px';
    const rodape = el('div', 'mjv81-rodape');
    const desistir = el('button', 'mjv81-btn', 'Desistir'); rodape.append(desistir);
    caixa.append(el('h2', '', titulo), el('p', 'mjv81-sub', subtitulo || ''), corpo, rodape);
    raiz.append(caixa); document.body.appendChild(raiz);
    const ui = {
      corpo: corpo, acao: null, limpezas: [], fechado: false,
      fechar: function (ok, info) {
        if (ui.fechado) return; ui.fechado = true;
        ui.limpezas.forEach(function (f) { try { f(); } catch (_) { } });
        raiz.remove(); atual = null; window.minijogoV81Aberto = false;
        som(ok ? 'moeda' : 'dano');
        if (typeof aoFim === 'function') setTimeout(function () { aoFim(!!ok, info || {}); }, 0);
      }
    };
    desistir.addEventListener('click', function () { ui.fechar(false, { desistiu: true }); });
    atual = ui; window.minijogoV81Aberto = true;
    return ui;
  }
  function depois(ui, ms, f) { const t = setTimeout(function () { if (!ui.fechado) f(); }, ms); ui.limpezas.push(function () { clearTimeout(t); }); }

  // ---------- 1) Pescaria ----------
  function pescar(op, aoFim) {
    op = op || {};
    const facil = !!op.facil;
    const ui = abrir('🎣 Pescaria', facil ? 'Espere o peixe morder e puxe quando o marcador estiver na faixa verde. Dessa vez eu ajudo!' : 'Espere o peixe morder e puxe quando o marcador estiver na faixa verde.', aoFim);
    if (!ui) return false;
    const largura = facil ? PESCA.faixaFacil : PESCA.faixa;
    let tentativas = facil ? PESCA.tentativasFacil : PESCA.tentativas;
    let fase = 'pausa', zona = { a: 0.4, b: 0.6 }, esperaAte = 0, mordeuT = 0, pos = 0, raf = 0;
    const status = el('p', 'mjv81-status'), barra = el('div', 'mjv81-barra'), zonaEl = el('div', 'mjv81-zona'), marc = el('div', 'mjv81-marcador');
    const info = el('p', 'mjv81-info'), botao = el('button', 'mjv81-btn mjv81-grande', 'PUXAR!');
    barra.append(zonaEl, marc); ui.corpo.append(status, barra, info, botao);

    function nova() {
      const ini = rnd(0.08, 0.92 - largura);
      zona = { a: ini, b: ini + largura };
      zonaEl.style.left = (ini * 100) + '%'; zonaEl.style.width = (largura * 100) + '%'; marc.style.left = '0%';
      botao.classList.remove('mjv81-pulsa');
      status.textContent = '🪝 Esperando o peixe morder...';
      info.textContent = 'Tentativas: ' + tentativas;
      esperaAte = performance.now() + rnd(PESCA.espera[0], PESCA.espera[1]);
      fase = 'espera';
    }
    function falhou(msg) {
      fase = 'pausa'; tentativas--; botao.classList.remove('mjv81-pulsa'); som('dano');
      status.textContent = msg;
      if (tentativas <= 0) { info.textContent = 'Acabaram as tentativas.'; depois(ui, 1100, function () { ui.fechar(false, {}); }); return; }
      info.textContent = 'Tentativas: ' + tentativas;
      depois(ui, 1000, nova);
    }
    function puxar() {
      if (fase === 'espera') { falhou('Puxou cedo demais!'); return; }
      if (fase !== 'mordeu') return;
      if (pos >= zona.a && pos <= zona.b) {
        fase = 'pausa'; botao.classList.remove('mjv81-pulsa');
        const perfeito = Math.abs(pos - (zona.a + zona.b) / 2) < 0.045;
        status.textContent = perfeito ? '✨ Pescaria perfeita!' : '🐟 Peixe fisgado!';
        depois(ui, 900, function () { ui.fechar(true, { perfeito: perfeito }); });
      } else falhou('Fora da faixa!');
    }
    function tick(agora) {
      if (ui.fechado) return;
      if (fase === 'espera' && agora >= esperaAte) { fase = 'mordeu'; mordeuT = agora; status.textContent = '🐟 MORDEU! Puxe agora!'; botao.classList.add('mjv81-pulsa'); som('acerto'); }
      if (fase === 'mordeu') {
        const t = (agora - mordeuT) / 1000;
        pos = 0.5 - 0.5 * Math.cos(2 * Math.PI * PESCA.velocidade * t);
        marc.style.left = (pos * 100) + '%';
        if (t * 1000 > PESCA.janela) falhou('O peixe escapou!');
      }
      raf = requestAnimationFrame(tick);
    }
    botao.addEventListener('pointerdown', function (e) { e.preventDefault(); puxar(); });
    ui.acao = puxar; ui.limpezas.push(function () { cancelAnimationFrame(raf); });
    nova(); raf = requestAnimationFrame(tick);
    return true;
  }

  // ---------- 2) Entrega de encomendas ----------
  const CASAS = [
    { id: 'simon', icone: '🪵', nome: 'Casa de madeira' }, { id: 'millena', icone: '🌸', nome: 'Casa rosada' },
    { id: 'nathalia', icone: '💜', nome: 'Casa lilás' }, { id: 'lucas', icone: '💻', nome: 'Casa azul' },
    { id: 'veras', icone: '🌿', nome: 'Casa do jardim' }, { id: 'vitinho', icone: '✨', nome: 'Casa dourada' }
  ];
  const PACOTES = [
    { icone: '📚', nome: 'Caixa de livros', casa: 'simon' }, { icone: '🌷', nome: 'Buquê de papel', casa: 'millena' },
    { icone: '🧣', nome: 'Cachecol lilás', casa: 'nathalia' }, { icone: '🔌', nome: 'Cabos e fones', casa: 'lucas' },
    { icone: '🪴', nome: 'Muda de planta', casa: 'veras' }, { icone: '🎨', nome: 'Tintas douradas', casa: 'vitinho' }
  ];
  const casaPorId = function (id) { return CASAS.filter(function (c) { return c.id === id; })[0]; };

  function entregar(op, aoFim) {
    op = op || {};
    const total = Math.max(1, op.pacotes || ENTREGA.pacotes), tempo = op.tempo || ENTREGA.tempo, maxErros = op.erros !== undefined ? op.erros : ENTREGA.erros;
    const ui = abrir('📦 Entrega de encomendas', 'Toque na casa certa antes de o tempo do pacote acabar. Você pode errar ' + maxErros + ' vez' + (maxErros === 1 ? '' : 'es') + '.', aoFim);
    if (!ui) return false;
    const fila = []; while (fila.length < total) embaralhar(PACOTES).forEach(function (p) { if (fila.length < total) fila.push(p); });
    let i = 0, erros = 0, limite = 0, raf = 0, travado = false;
    const placar = el('p', 'mjv81-info'), pacote = el('div', 'mjv81-pacote'), tempoBox = el('div', 'mjv81-tempo'), tempoBar = el('i'), grade = el('div', 'mjv81-grade');
    tempoBox.append(tempoBar); ui.corpo.append(placar, pacote, tempoBox, grade);

    function mostrar() {
      const p = fila[i], destino = casaPorId(p.casa);
      pacote.textContent = ''; const ic = el('b', '', p.icone); pacote.append(ic, document.createTextNode(p.nome + ' → ' + destino.nome));
      placar.textContent = 'Pacote ' + (i + 1) + ' de ' + total + ' · Erros: ' + erros + '/' + maxErros;
      grade.textContent = '';
      embaralhar(CASAS).forEach(function (c) {
        const b = el('button', 'mjv81-btn mjv81-casa'); b.append(el('b', '', c.icone), document.createTextNode(c.nome));
        b.addEventListener('click', function () { escolher(c.id); }); grade.append(b);
      });
      limite = performance.now() + tempo * 1000; travado = false;
    }
    function errar(msg) {
      erros++; som('dano'); placar.textContent = msg + ' Erros: ' + erros + '/' + maxErros;
      if (erros > maxErros) { travado = true; depois(ui, 900, function () { ui.fechar(false, { entregues: i }); }); return false; }
      return true;
    }
    function proximo() {
      i++;
      if (i >= total) { travado = true; placar.textContent = '✅ Todas as encomendas entregues!'; depois(ui, 900, function () { ui.fechar(true, { erros: erros }); }); return; }
      mostrar();
    }
    function escolher(id) {
      if (travado) return;
      if (id === fila[i].casa) { som('acerto'); proximo(); }
      else if (errar('Casa errada!')) proximo();   // errou, mas ainda pode: o pacote é dado como perdido e vem o próximo
    }
    function tick(agora) {
      if (ui.fechado) return;
      if (!travado) {
        const resta = Math.max(0, (limite - agora) / (tempo * 1000));
        tempoBar.style.width = (resta * 100) + '%';
        if (resta <= 0) { travado = true; if (errar('O tempo acabou!')) depois(ui, 600, proximo); }
      }
      raf = requestAnimationFrame(tick);
    }
    ui.limpezas.push(function () { cancelAnimationFrame(raf); });
    mostrar(); raf = requestAnimationFrame(tick);
    return true;
  }

  // ---------- 3) Símbolos ----------
  const GLIFOS = ['☾', '✦', '◆', '▲', '●', '☼'];

  function simbolos(op, aoFim) {
    op = op || {};
    const n = Math.max(2, op.tamanho || SIMBOLOS.tamanho);
    const maxErros = (op.erros !== undefined ? op.erros : SIMBOLOS.erros) + (op.dica ? 1 : 0);
    const ui = abrir('🔣 ' + (op.titulo || 'Símbolos'), 'Memorize a ordem em que os símbolos acendem e depois toque neles na mesma ordem.' + (op.dica ? ' A Nathalia vai te ajudar: ela perdoa um erro a mais.' : ''), aoFim);
    if (!ui) return false;
    const seq = []; for (let k = 0; k < n; k++) { let g; do { g = GLIFOS[Math.floor(Math.random() * GLIFOS.length)]; } while (k > 0 && g === seq[k - 1]); seq.push(g); }
    let erros = 0, pos = 0, mostrando = true;
    const status = el('p', 'mjv81-status'), slots = el('div', 'mjv81-seq'), grade = el('div', 'mjv81-simbolos'), info = el('p', 'mjv81-info');
    const botoes = GLIFOS.map(function (g) { const b = el('button', 'mjv81-btn', g); b.disabled = true; b.addEventListener('click', function () { tocar(g); }); grade.append(b); return b; });
    ui.corpo.append(status, slots, grade, info);

    function desenharSlots(luz) {
      slots.textContent = '';
      seq.forEach(function (g, k) { const s = el('div', 'mjv81-slot' + (k < pos && !mostrando ? ' ok' : '') + (k === luz ? ' luz' : ''), (k === luz || (k < pos && !mostrando)) ? g : '?'); slots.append(s); });
    }
    function exibir() {
      mostrando = true; pos = 0; botoes.forEach(function (b) { b.disabled = true; });
      status.textContent = '👀 Memorize...'; info.textContent = 'Erros: ' + erros + '/' + maxErros; desenharSlots(-1);
      let k = 0;
      (function passo() {
        if (ui.fechado) return;
        if (k >= n) { mostrando = false; botoes.forEach(function (b) { b.disabled = false; }); status.textContent = '👆 Sua vez!'; desenharSlots(-1); return; }
        desenharSlots(k); som('clique');
        depois(ui, SIMBOLOS.mostra, function () { desenharSlots(-1); depois(ui, SIMBOLOS.pausa, function () { k++; passo(); }); });
      })();
    }
    function tocar(g) {
      if (mostrando) return;
      if (g === seq[pos]) {
        pos++; som('clique'); desenharSlots(-1);
        if (pos >= n) { mostrando = true; botoes.forEach(function (b) { b.disabled = true; }); status.textContent = '✨ Os símbolos se alinharam!'; depois(ui, 900, function () { ui.fechar(true, { erros: erros }); }); }
      } else {
        erros++; som('dano'); botoes.forEach(function (b) { b.disabled = true; }); mostrando = true;
        if (erros > maxErros) { status.textContent = '❌ Os símbolos se apagaram.'; depois(ui, 1000, function () { ui.fechar(false, {}); }); return; }
        status.textContent = '⚠️ Ordem errada! Olhe de novo.'; depois(ui, 1100, exibir);
      }
    }
    exibir();
    return true;
  }

  window.minijogoV81 = { pescar: pescar, entregar: entregar, simbolos: simbolos, aberto: function () { return !!atual; } };
  // Atalho usado pela estrada: se o minijogo não existir por algum motivo, a pesca continua funcionando (ok = true)
  window.pescarV81 = function (facil, aoFim) {
    if (!pescar({ facil: !!facil }, aoFim) && typeof aoFim === 'function') aoFim(false, {});
  };
})();
