/* =====================================================
   salas/zonaoeste2.js - Oeste 2: planície e área de treino diária.
   A partir do dia 6, Simon convida Dellalos se a amizade estiver no nível 3+.
   ===================================================== */
(function () {
  const COLS = 100, ROWS = 80;
  const m = criarMapa(COLS, ROWS);
  pintar(m, "chao", 0, 0, COLS, ROWS, GRAMA);
  for (const [x,y,w,h] of [
    [7,8,12,3], [24,15,17,2], [56,7,18,3], [76,21,14,2],
    [12,32,15,3], [38,39,19,2], [66,46,21,3], [4,56,22,2],
    [32,63,14,3], [57,69,17,2], [80,57,12,3]
  ]) pintar(m, "chao", x, y, w, h, K(2, 1));

  // ===== Arena do torneio (a partir do DIA_ARENA) =====
  // A arena é desenhada num mapa de rascunho e só é copiada por cima da planície quando o dia chega.
  // Antes disso (ou se o dia voltar atrás) a planície fica exatamente como era (guardamos o original em "base").
  const DIA_ARENA = 13;
  const AX0 = 60, AY0 = 52, AX1 = 87, AY1 = 70;      // cantos da arena (em tiles)
  const ENT0 = 72, ENT1 = 75;                         // entrada larga, no lado norte
  const base = { chao: m.chao.slice(), deco: m.deco.slice(), obj: m.obj.slice(), topo: m.topo.slice(), bloq: m.bloq.slice() };
  const arena = criarMapa(COLS, ROWS);
  (function montarArena(a) {
    const cerca = (x, y) => { por(a, "obj", x, y, K(4 + ((x + y) % 3), 14)); bloquear(a, x, y); };
    const banco = (x, y) => { por(a, "obj", x, y, K(3, 14)); bloquear(a, x, y); };
    pintar(a, "chao", AX0, AY0, AX1 - AX0 + 1, AY1 - AY0 + 1, K(1, 4));      // piso de areia
    pintar(a, "chao", 66, 57, 16, 9, CALCADA);                                // ringue de pedra, no meio
    for (let x = AX0; x <= AX1; x++) { if (x < ENT0 || x > ENT1) cerca(x, AY0); cerca(x, AY1); }
    for (let y = AY0 + 1; y < AY1; y++) { cerca(AX0, y); cerca(AX1, y); }
    for (let x = 62; x <= 85; x++) {                                          // arquibancadas: norte (com corredor da entrada) e sul
      if (x < ENT0 - 1 || x > ENT1 + 1) { banco(x, 54); banco(x, 55); }
      banco(x, 67); banco(x, 68);
    }
    for (let y = 57; y <= 65; y++) { banco(62, y); banco(85, y); }            // arquibancadas laterais
    for (const x of [ENT0 - 1, ENT1 + 1]) { por(a, "obj", x, 53, K(5 + (x % 2), 9)); bloquear(a, x, 53); }   // barreiras listradas na entrada
    for (const [x, y] of [[61, 53], [86, 53], [61, 69], [86, 69]]) { por(a, "topo", x, y - 1, K(7, 6)); por(a, "obj", x, y, K(7, 7)); bloquear(a, x, y); }   // postes
  })(arena);
  function atualizarArena() {
    const ligar = diaAtual() >= DIA_ARENA;
    if (m._arenaLigada === ligar) return;
    m._arenaLigada = ligar;
    for (const camada of ["chao", "deco", "obj", "topo"]) {
      for (let i = 0; i < arena[camada].length; i++) if (arena[camada][i] !== -1) m[camada][i] = ligar ? arena[camada][i] : base[camada][i];
    }
    for (let i = 0; i < arena.bloq.length; i++) if (arena.bloq[i]) m.bloq[i] = ligar ? 1 : base.bloq[i];
  }

  const spawn = { x: 96*TILE + TILE/2, y: 41*TILE + TILE/2 };
  const pes = (x,y) => ({ x:x*TILE+TILE/2, y:y*TILE+58 });
  const parado = { raioX:0, raioY:0, velocidade:0 };
  const cena = CENAS.zona_oeste2 = {
    mapa:m, spawn, combate:true,
    saidas:[{ area:celula(COLS-1,36,1,10), para:"zona_oeste", x:2*TILE+TILE/2, y:37*TILE+TILE/2, dir:"esquerda" }],
    placas:[{ texto:"OESTE 2 — ÁREA DE TREINO", x:43*TILE, y:35*TILE, w:620, h:48, fonte:28 },
            { texto:"ARENA DO TORNEIO", x:(ENT0+ENT1+1)/2*TILE, y:50*TILE, w:420, h:48, fonte:28, se:function(){ return diaAtual() >= DIA_ARENA; } }],
    npcs:[],
    aoEntrar:function(){
      atualizarArena();                                  // dia 13 em diante: a arena do torneio aparece
      if (!diario.infos.zona_oeste2) { descobrirInfo("zona_oeste2"); mostrarMensagem("Oeste 2 — uma planície enorme. A partir do dia 6, pode virar uma área de treino."); }
    }
  };

  function amizadeBoa(){ return typeof amizadeNivel === "function" && amizadeNivel("Simon") >= 3; }
  function disponivel(){ return diaAtual() >= 6 && amizadeBoa(); }
  function convidarSimon(){
    if (!disponivel()) {
      abrirDialogo([{quem:"Simon",texto:diaAtual()<6 ? "Quando chegar o dia 6, quero te chamar para treinar com a gente." : "A gente ainda precisa se conhecer melhor antes de treinar junto."}]);
      return;
    }
    if (!historia.treinoOesteConviteAceito) {
      abrirDialogo([
        {quem:"Simon",texto:"Dellalos! Eu, o Deriky e o Vitinho estamos treinando aqui no Oeste 2."},
        {quem:"Simon",texto:"Se quiser, pode treinar com um de nós por dia. Cada dia a gente fica um pouco mais forte. Quer começar?"},
        {quem:"Dellalos",texto:"Quero! Vou escolher com quem lutar quando estiver pronta."}
      ], function(){ historia.treinoOesteConviteAceito=true; mostrarMensagem("Treino desbloqueado! Fale com Simon, Deriky ou Vitinho para escolher a luta de hoje."); });
    } else {
      abrirDialogo([{quem:"Simon",texto:"Escolhe com quem você quer treinar hoje: comigo, com o Deriky ou com o Vitinho."}]);
    }
  }

  function criarTreinador(nome, tipo, x, y, imagem){
    const n={ nome, imagem, quadro:{linha:0,coluna:0}, andar:parado, direcao:"baixo", x, y,
      se:function(){ return disponivel() && (nome==="Simon" || historia.treinoOesteConviteAceito); },
      conversar:function(){
        if (!disponivel()) { convidarSimon(); return; }
        if (!historia.treinoOesteConviteAceito) { if(nome==="Simon") convidarSimon(); else abrirDialogo([{quem:nome,texto:"Fala com o Simon primeiro. Ele que organizou os treinos."}]); return; }
        const hoje=String(diaAtual());
        if (diario.escolhas.treinoOesteDia===hoje) { abrirDialogo([{quem:nome,texto:"Você já treinou hoje. Volta amanhã, que eu vou estar mais forte."}]); return; }
        const nivelDia=Math.max(0,diaAtual()-6);
        const base={Simon:{vida:10,ataque:3},Deriky:{vida:12,ataque:4},Vitinho:{vida:10,ataque:3}}[nome];
        abrirDialogo([
          {quem:nome,texto:nome==="Deriky" ? "Vamos treinar. Não vou pegar leve, mas vou te ajudar a melhorar." : nome==="Vitinho" ? "Bora! Quero ver como você está lutando." : "Preparada? A cada dia o treino fica mais difícil."},
          {quem:"Dellalos",texto:"Vamos nessa!"}
        ],function(){ diario.escolhas.treinoOesteDia=hoje; iniciarTreinoOeste(n,tipo,base.vida+nivelDia,base.ataque+nivelDia); });
      }
    };
    return n;
  }

  const simon=criarTreinador("Simon","simon",pes(46,38).x,pes(46,38).y,["assets/Simon.png","assets/Simon.jpg"]);
  const deriky=criarTreinador("Deriky","deriky",pes(49,38).x,pes(49,38).y,["assets/Deriky.jpg","assets/Deriky.png"]);
  const vitinho=criarTreinador("Vitinho","vitinho",pes(52,38).x,pes(52,38).y,["assets/Vitinho.png","assets/Vitinho.jpg"]);
  cena.npcs.push(simon,deriky,vitinho);

  function iniciarTreinoOeste(n,tipo,vida,ataque){
    const base=TIPOS_INIMIGOS.lucas;
    const t=Object.assign({},base,{nome:n.nome,vida, dano:ataque, moedas:[0,0], duelo:true,
      aoMorrer:function(i){ finalizarTreinoOeste(i,nomeResultado(i)); }});
    function nomeResultado(i){ return i.vida<=0 && jogador.vida>1 ? "vitoria" : "derrota"; }
    const i=criarInimigo("lucas",n.x,n.y);
    i.tipo=t; i.tipoId="lucas"; i.vida=vida; i.npc=n; i._treinoOesteNome=n.nome; i._treinoOesteAtivo=true;
    i.estado="descanso"; i.espera=0.8;
    inimigos.push(i);
    mostrarMensagem("Treino contra "+n.nome+"! Vida: "+vida+" | Ataque: "+ataque+". A cada dia os atributos aumentam em 1.");
  }
  function finalizarTreinoOeste(i,resultado){
    if (!i._treinoOesteAtivo) return;
    i._treinoOesteAtivo=false;
    const nome=i._treinoOesteNome;
    const falas={
      Simon:{vitoria:[{quem:"Simon",texto:"Boa! Você está ficando mais forte. Amanhã eu vou estar preparado."}],derrota:[{quem:"Simon",texto:"Foi um bom treino. Não desanima; observa meus movimentos e tenta de novo amanhã."}]},
      Deriky:{vitoria:[{quem:"Deriky",texto:"Você lutou bem. Não relaxa, porque amanhã eu vou estar mais forte."}],derrota:[{quem:"Deriky",texto:"Você perdeu hoje, mas isso não define sua força. Aprende com os erros e tenta de novo amanhã."}]},
      Vitinho:{vitoria:[{quem:"Vitinho",texto:"Caramba, você venceu! Quero revanche amanhã."}],derrota:[{quem:"Vitinho",texto:"Ganhei dessa vez! Amanhã a gente tenta de novo — e eu vou estar mais forte."}]}
    };
    if (resultado==="derrota") jogador.vida=1;
    jogador.invulneravel=2;
    abrirDialogo(falas[nome][resultado]);
  }
})();
