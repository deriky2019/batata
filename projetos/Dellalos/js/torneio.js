/* =====================================================
   torneio.js - Chaveamento do torneio do dia 15
   32 participantes, 16 confrontos iniciais e eliminatórias até a final.
   Os vencedores NÃO são predefinidos: os combates simulados acontecem em tempo real,
   usando atributos individuais persistidos no save.
   ===================================================== */
function torneioLiberado() {
  return typeof ehDia10 === "function" && ehDia10() && !!historia.casaD10Fim;
}
function torneioRodada() { return parseInt(diario.escolhas.torneioRodada, 10) || 0; }
function aoFimDoTorneio() {}

(function () {
  const arena = CENAS.zona_oeste2, leste2 = CENAS.zona_leste2;
  if (!arena) return;
  const pe = (tx, ty) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + 58 });
  const DEL = (t) => ({ quem: "Dellalos", texto: t });
  const ZE = (t) => ({ quem: "Zé", texto: t });
  const DER = (t) => ({ quem: "Deriky", texto: t });
  const IMG = {
    fallback: ["assets/Npc2.png", "assets/Morador2.png"],
    Thaina: ["assets/Thaina.png", "assets/Thaina.jpg", "assets/Npc2.png"],
    Lucas: ["assets/Lucas.png", "assets/Lucas.jpg", "assets/Npc2.png"],
    Deriky: ["assets/Deriky.png", "assets/Deriky.jpg", "assets/Npc2.png"],
    Veras: ["assets/Veras.png", "assets/Npc2.png"],
    Vitinho: ["assets/Vitinho.png", "assets/Vitinho.jpg", "assets/Npc2.png"],
    Isabela: ["assets/Isabela.png", "assets/Isabela.jpg", "assets/Npc2.png"],
    Gaby: ["assets/Gaby.png", "assets/Npc2.png"],
    Millena: ["assets/Millena.png", "assets/Npc2.png"],
    Dellalos: ["assets/Dellalos.png", "assets/Dellalos_academia2.png", "assets/Npc2.png"],
    Nathalia: ["assets/Nathalia.png", "assets/Nathalia.jpg", "assets/Npc2.png"],
    Mariane: ["assets/Mariane.png", "assets/Npc2.png"],
    Estudante: ["assets/Estudante.png", "assets/Npc2.png"],
    Jin: ["assets/Npc2.png"], Yumi: ["assets/Npc2.png"],
    "João Gomes": ["assets/Npc2.png"], "CJ": ["assets/Npc2.png"],
    "Ogre": ["assets/Npc2.png"]
  };
  const CORES = ["#b58a5a", "#6a8ab5", "#7a6a8a", "#b5707a", "#668b70", "#b5a05a", "#8b6555", "#647d8b"];
  const nomesBase = [
    ["Thaina", "Blas"], ["Kaique", "Vinícius"], ["Lucas", "Pedro"], ["Deriky", "Veras"],
    ["Vitinho", "Juju"], ["João Gomes", "Lívia"], ["Fabrício", "Luis"], ["Isabela", "Giovana"],
    ["Gaby", "Moisés"], ["Dellalos", "Raiden"], ["Nathalia", "Mariane"], ["Steve", "CJ"],
    ["Caio", "Estudante"], ["Hiogan", "Kakatiso"], ["Jin", "Ogre"], ["Yumi", "Goro"]
  ];
  const nomeSprite = (nome) => IMG[nome] || IMG.fallback;
  const estadoLido = () => {
    try { return JSON.parse(diario.escolhas.torneioChaveamento || "null"); } catch (_) { return null; }
  };
  let estado = estadoLido();
  let lutadoresAtuais = [];
  let tempoCombate = 0, intervaloGolpeA = 0, intervaloGolpeB = 0, pausaEntreLutas = 0;
  let falaVirada = false;
  const arenaAtiva = () => torneioLiberado() && !historia.torneioFim;
  const plateiaVisivel = () => arenaAtiva() && (!historia.torneioViradaIniciada || falaVirada);
  const atual = () => estado && estado.iniciado && estado.rodada < estado.fases.length ? estado.fases[estado.rodada][estado.partida] : null;
  const setEstado = () => { diario.escolhas.torneioChaveamento = JSON.stringify(estado); };
  const charCode = (s) => Array.from(s).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = (seed) => { let x = seed >>> 0; return () => { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; };

  function criarEstado() {
    const lista = nomesBase.map(p => p.slice());
    // Regra solicitada: se Gaby foi morta no dia 7, Millena ocupa a vaga dela.
    if (historia.gabyMorta || historia.gabyFim && historia.gabyMorta) lista[8][0] = "Millena";
    const atributos = {};
    for (const nome of [...new Set(lista.flat())]) {
      const r = rnd(charCode(nome) ^ 0x15D15);
      const base = (charCode(nome) % 3);
      atributos[nome] = {
        forca: 2 + Math.floor(r() * 3) + (base === 0 ? 1 : 0),
        velocidade: 2 + Math.floor(r() * 3) + (base === 1 ? 1 : 0),
        defesa: 2 + Math.floor(r() * 3) + (base === 2 ? 1 : 0),
        tecnica: 2 + Math.floor(r() * 3),
        vidaMax: 90 + Math.floor(r() * 31),
        cor: CORES[Math.floor(r() * CORES.length)]
      };
    }
    return { iniciado: false, concluido: false, rodada: 0, partida: 0, fases: [lista.map(p => ({ a: p[0], b: p[1], vencedor: "" }))], atributos };
  }
  function garantirEstado() {
    if (!estado) estado = estadoLido();
    if (!estado || !Array.isArray(estado.fases) || !estado.atributos) estado = criarEstado();
    // Save antigo que já tinha inscrição do torneio: iniciar o novo chaveamento sem apagar flags da história.
    if (historia.torneioAberto && !estado.iniciado && !estado.concluido) { estado.iniciado = true; setEstado(); }
    return estado;
  }
  function nomeVencedor(match) { return match && match.vencedor ? match.vencedor : "A definir"; }
  function gerarProximaFase() {
    const fase = estado.fases[estado.rodada];
    const vencedores = fase.map(m => m.vencedor).filter(Boolean);
    if (vencedores.length !== fase.length) return false;
    if (vencedores.length === 1) {
      estado.concluido = true; setEstado(); iniciarVirada(); return true;
    }
    const nova = [];
    for (let i = 0; i < vencedores.length; i += 2) nova.push({ a: vencedores[i], b: vencedores[i + 1], vencedor: "" });
    estado.fases.push(nova); estado.rodada++; estado.partida = 0;
    setEstado(); prepararLutaAtual();
    return true;
  }
  function prepararLutaAtual() {
    tempoCombate = 0; intervaloGolpeA = 0.35 + Math.random() * 0.45; intervaloGolpeB = 0.35 + Math.random() * 0.45; pausaEntreLutas = 1.5;
    const m = atual();
    lutadoresAtuais = [];
    if (!m || m.vencedor || !estado.iniciado || estado.concluido) return;
    const esquerda = pe(71, 63), direita = pe(75, 63);
    const criar = (nome, pos, lado) => {
      const a = estado.atributos[nome];
      const n = {
        nome, x: pos.x, y: pos.y, imagem: nomeSprite(nome), quadro: { linha: 0, coluna: 0 },
        direcao: lado === "a" ? "direita" : "esquerda", cor: a.cor,
        andar: { raioX: 26, raioY: 4, velocidade: 45 + a.velocidade * 5, quadros: [0,1,2,3] },
        semSolido: true, _torneioFighter: true, _torneioHP: a.vidaMax, _torneioHPMax: a.vidaMax,
        _torneioAtributos: a, _torneioLado: lado,
        se: () => !!(arenaAtiva() && estado && estado.iniciado && !estado.concluido && atual() && atual().a === m.a && atual().b === m.b && !atual().vencedor),
        conversar: () => mostrarAtributos(nome)
      };
      return n;
    };
    const a = criar(m.a, esquerda, "a"), b = criar(m.b, direita, "b");
    lutadoresAtuais = [a, b];
    arena.npcs = arena.npcs || [];
    arena.npcs.push(a, b);
    prepararNpc(a); prepararNpc(b);
  }
  function removerLutadores() {
    if (!lutadoresAtuais.length) return;
    arena.npcs = (arena.npcs || []).filter(n => !n._torneioFighter);
    if (arena._pronta) {
      arena.interativos = (arena.interativos || []).filter(o => !o._torneioFighter);
      arena.solidos = (arena.solidos || []).filter(s => !s._torneioFighter);
    }
    lutadoresAtuais = [];
  }
  function mostrarAtributos(nome) {
    const a = estado && estado.atributos[nome]; if (!a) return;
    abrirDialogo([{ quem: nome, texto: "Atributos: força " + a.forca + ", velocidade " + a.velocidade + ", defesa " + a.defesa + " e técnica " + a.tecnica + "." }]);
  }
  function danoAtaque(atacante, defensor) {
    const a = atacante._torneioAtributos, d = defensor._torneioAtributos;
    const sorte = Math.random() * 4;
    const critico = Math.random() < (0.05 + a.tecnica * 0.015);
    return Math.max(3, 4 + a.forca * 1.25 + a.tecnica * 0.65 + sorte - d.defesa * 0.85 - d.velocidade * 0.25) * (critico ? 1.7 : 1);
  }
  function terminarCombate(vencedor, perdedor) {
    const m = atual(); if (!m || m.vencedor) return;
    m.vencedor = vencedor.nome;
    removerLutadores();
    setEstado();
    const fase = estado.fases[estado.rodada];
    if (estado.partida + 1 < fase.length) estado.partida++;
    else {
      // Gera a próxima fase após pequena pausa; não define vencedor de nenhuma luta antecipadamente.
      estado._aguardaProximaFase = true;
    }
    setEstado();
    abrirDialogo([
      { quem: "Narrador", texto: vencedor.nome + " venceu " + perdedor.nome + "!" },
      { quem: "Narrador", texto: "Atributos e sorte decidiram o resultado deste combate." }
    ], function () {
      if (estado._aguardaProximaFase) { delete estado._aguardaProximaFase; gerarProximaFase(); }
      else prepararLutaAtual();
      setEstado();
      if (estado.concluido) return;
      const proxima = atual();
      if (proxima) mostrarMensagem("Próxima luta: " + proxima.a + " x " + proxima.b + ". Consulte o quadro para ver o chaveamento.");
    });
  }
  function atualizarTorneio(dt) {
    if (!arenaAtiva() || idDaCena(cenaAtual) !== "zona_oeste2") return;
    if (!estado && historia.torneioAberto) garantirEstado();
    if (!estado || !estado.iniciado || estado.concluido || dialogoAberto || transicao || inventarioAberto || lojaAberta || menuAberto || telaTempo) return;
    const m = atual();
    if (!m || m.vencedor || lutadoresAtuais.length !== 2) return;
    if (pausaEntreLutas > 0) { pausaEntreLutas -= dt; return; }
    tempoCombate += dt; intervaloGolpeA -= dt; intervaloGolpeB -= dt;
    const [a,b] = lutadoresAtuais;
    // Lutadores se aproximam, trocam golpes e recuam: o combate é ao vivo, não uma lista de resultados fixa.
    const dx = b.x - a.x;
    if (Math.abs(dx) > 62) { const passo = Math.min(Math.abs(dx) - 62, dt * 34); a.x += Math.sign(dx) * passo; b.x -= Math.sign(dx) * passo; }
    a.direcao = "direita"; b.direcao = "esquerda";
    a.andando = Math.abs(dx) > 62; b.andando = Math.abs(dx) > 62;
    a._tempoAnim += dt; b._tempoAnim += dt;
    if (intervaloGolpeA <= 0) {
      if (Math.random() < Math.min(0.92, 0.45 + a._torneioAtributos.velocidade * 0.055 + a._torneioAtributos.tecnica * 0.035)) b._torneioHP -= danoAtaque(a,b);
      intervaloGolpeA = Math.max(0.42, 1.2 - a._torneioAtributos.velocidade * 0.09) + Math.random() * 0.42;
    }
    if (intervaloGolpeB <= 0) {
      if (Math.random() < Math.min(0.92, 0.45 + b._torneioAtributos.velocidade * 0.055 + b._torneioAtributos.tecnica * 0.035)) a._torneioHP -= danoAtaque(b,a);
      intervaloGolpeB = Math.max(0.42, 1.2 - b._torneioAtributos.velocidade * 0.09) + Math.random() * 0.42;
    }
    if (a._torneioHP <= 0 || b._torneioHP <= 0 || tempoCombate > 24) {
      // Se o tempo acabar, vence quem tiver maior proporção de vida; empate é decidido por sorte.
      let v, p;
      if (Math.abs(a._torneioHP / a._torneioHPMax - b._torneioHP / b._torneioHPMax) < 0.015) { v = Math.random() < 0.5 ? a : b; p = v === a ? b : a; }
      else { v = a._torneioHP / a._torneioHPMax > b._torneioHP / b._torneioHPMax ? a : b; p = v === a ? b : a; }
      terminarCombate(v,p);
    }
  }
  window.atualizarTorneio = atualizarTorneio;
  window.desenharHUDTorneio = function () {
    if (!arenaAtiva() || !estado || !estado.iniciado || estado.concluido || lutadoresAtuais.length !== 2) return;
    for (const n of lutadoresAtuais) {
      const w = 78, h = 8, x = n.x - w/2, y = n.y - 116;
      ctx.fillStyle = "rgba(10,8,14,.85)"; ctx.fillRect(x-2,y-2,w+4,h+4);
      ctx.fillStyle = "#4a1717"; ctx.fillRect(x,y,w,h);
      ctx.fillStyle = "#63d16e"; ctx.fillRect(x,y,w*Math.max(0,n._torneioHP/n._torneioHPMax),h);
      ctx.strokeStyle = "#f1dfb0"; ctx.lineWidth = 1; ctx.strokeRect(x,y,w,h);
      ctx.fillStyle = "#fff"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center"; ctx.fillText(n.nome,x+w/2,y-5);
    }
    const m = atual(); if (m) {
      ctx.fillStyle = "rgba(20,14,24,.82)"; ctx.fillRect(camera.x + 12, camera.y + 12, 260, 42);
      ctx.fillStyle = "#f7e7b4"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "left";
      ctx.fillText("TORNEIO · FASE " + (estado.rodada+1) + " · LUTA " + (estado.partida+1), camera.x+22, camera.y+29);
      ctx.font = "13px sans-serif"; ctx.fillText(m.a + "  VS  " + m.b, camera.x+22, camera.y+46);
    }
  };

  const FALAS = {
    abertura: [ZE("Bem-vindos ao torneio do dia 15! Hoje, os resultados serão decididos no ringue."), DEL("Trinta e dois participantes... cada luta pode terminar de um jeito diferente."), ZE("Cada lutador tem seus próprios atributos. Força, velocidade, defesa, técnica e um pouco de sorte vão decidir os confrontos."), ZE("O quadro perto da entrada mostra as partidas e os vencedores. A primeira luta vai começar agora.")],
    virada: [DER("A final terminou... mas, Zé, por que você está sorrindo assim?"), ZE("Porque o torneio nunca foi apenas sobre lutas. A energia de quem luta, de quem assiste e de quem torce era o verdadeiro prêmio."), DEL("Então era isso... a arquibancada inteira está passando mal!"), DER("Isso não é normal! Precisamos tirar todo mundo daqui!"), ZE("Sentinelas! Não deixem ninguém atrapalhar a cerimônia!"), DER("Eu vou ajudar a multidão a escapar. Dellalos, cuidado!")],
    fim: [DEL("A última Sentinela caiu. A multidão conseguiu sair da arena."), DER("O Zé sumiu no meio da confusão, mas ninguém ficou para trás."), {quem:"Dellalos",texto:"O torneio era uma armadilha para roubar a energia de todos. Isso ainda não acabou."}]
  };
  function iniciarVirada() {
    if (historia.torneioViradaIniciada) return;
    historia.torneioViradaIniciada = true; falaVirada = true;
    descobrirInfo("torneio_virada");
    abrirDialogo(FALAS.virada, function () {
      falaVirada = false;
      if (typeof tremer === "function") tremer(8,0.8);
      mostrarMensagem("A multidão foge! As Sentinelas cercam a arena!");
      gerarOnda();
    });
  }
  const POS_ONDA = [pe(68,60),pe(78,60),pe(68,64),pe(78,64),pe(73,66)];
  const baseSentinela = TIPOS_INIMIGOS.sentinela || { nome:"Sentinela", largura:72, altura:92, vida:6, velocidade:95, deteccao:700, dano:1, moedas:[2,4], cor:"#17101f", corEscura:"#7a4aa8", corOlhos:"#f3e6c8" };
  TIPOS_INIMIGOS.sentinela_torneio = Object.assign({},baseSentinela,{nome:"Sentinela",vida:7,velocidade:105,deteccao:1400,aoMorrer:function(i){ aoDerrotarInimigo(i); if(!inimigos.some(e=>e!==i&&e.tipoId==="sentinela_torneio"&&e.vida>0)) fimDaOnda(); }});
  function gerarOnda(){ for(const p of POS_ONDA){const i=criarInimigo("sentinela_torneio",p.x,p.y);posicionarInimigoLivre(i);inimigos.push(i);} }
  function fimDaOnda(){ if(historia.torneioFim)return; historia.torneioFim=true;jogador.vida=jogador.vidaMax;jogador.invulneravel=2;abrirDialogo(FALAS.fim,function(){ganharMoedas(80);mostrarMensagem("O torneio acabou! +80 moedas");descobrirInfo("torneio_fim");sinalizarMissao();aoFimDoTorneio();}); }
  arena.inimigos = (arena.inimigos || []).concat(POS_ONDA.map(p=>({tipo:"sentinela_torneio",x:p.x,y:p.y,se:()=>torneioLiberado()&&!!historia.torneioViradaIniciada&&!historia.torneioFim&&!falaVirada})));

  function mostrarQuadro(){
    garantirEstado();
    const linhas=[{quem:"QUADRO",texto:"TORNEIO DO DIA 15 · CHAVEAMENTO"}];
    const fase=estado.fases[estado.rodada]||[];
    linhas.push({quem:"QUADRO",texto:"FASE "+Math.min(estado.rodada+1,5)+" · "+fase.length+" confrontos"});
    fase.forEach((m,i)=>linhas.push({quem:"QUADRO",texto:(i+1)+". "+m.a+" x "+m.b+" — "+(m.vencedor?"VENCEU: "+m.vencedor:(i===estado.partida&&estado.iniciado?"EM ANDAMENTO":"aguardando"))}));
    if(estado.rodada>0) linhas.push({quem:"QUADRO",texto:"A fase atual foi formada pelos vencedores da fase anterior."});
    if(estado.concluido) linhas.push({quem:"QUADRO",texto:"Campeão: "+(estado.fases[estado.fases.length-1][0].vencedor||"a definir")+". A cerimônia foi interrompida."});
    abrirDialogo(linhas);
  }
  function conversarZe(){
    garantirEstado();
    if(!estado.iniciado){
      abrirDialogo(FALAS.abertura,function(){ estado.iniciado=true;historia.torneioAberto=true;diario.escolhas.torneioRodada="1";descobrirInfo("torneio_inscricao");setEstado();prepararLutaAtual();mostrarMensagem("O torneio começou! Acompanhe a luta no ringue e consulte o quadro.");sinalizarMissao(); });
    } else if(estado.concluido) abrirDialogo([{quem:"Zé",texto:"O campeão foi decidido no ringue. Agora, todos verão o verdadeiro propósito desta cerimônia."}]);
    else { if (!lutadoresAtuais.length) prepararLutaAtual(); const m=atual(); abrirDialogo([{quem:"Zé",texto:m?"A próxima luta é "+m.a+" contra "+m.b+". Observe os atributos e o combate no ringue.":"O torneio está em andamento."}]); }
  }
  const npc=(nome,img,pos,se,conversar,cor,dir)=>({nome,cor,imagem:img,quadro:{linha:0,coluna:0},andar:{raioX:0,raioY:0,velocidade:0},direcao:dir||"baixo",x:pos.x,y:pos.y,se,conversar});
  const ze=npc("Zé",["assets/Zé.png","assets/Ze.png","assets/Npc2.png"],pe(73,59),plateiaVisivel,conversarZe,"#6a5a3a");
  arena.npcs=(arena.npcs||[]).concat([ze]);
  arena.interativos=(arena.interativos||[]).concat([{nome:"quadro_torneio",area:celula(65,56,4,2),ativo:()=>torneioLiberado(),conversar:mostrarQuadro}]);
  arena.placas=(arena.placas||[]).concat([{texto:"QUADRO DE LUTAS",x:67*TILE,y:56*TILE+32,w:300,h:40,fonte:18,se:()=>torneioLiberado()}]);
  const PLATEIA=[[64,55,"baixo"],[66,55,"baixo"],[68,55,"baixo"],[78,55,"baixo"],[80,55,"baixo"],[83,55,"baixo"],[64,68,"cima"],[67,68,"cima"],[70,68,"cima"],[74,68,"cima"],[78,68,"cima"],[82,68,"cima"],[62,59,"direita"],[62,63,"direita"],[85,60,"esquerda"],[85,64,"esquerda"]];
  arena.npcs = arena.npcs.concat(PLATEIA.map((p, k) => {
    const falasPlateia = ["Vim ver o torneio. Cada luta parece imprevisível.", "Os participantes têm estilos bem diferentes.", "O quadro mostra quem venceu cada fase.", "Espero que ninguém se machuque de verdade."];
    return npc("Convidado", ["assets/Morador2.png", "assets/Npc2.png"], pe(p[0], p[1]), plateiaVisivel,
      () => abrirDialogo([{ quem: "Convidado", texto: falasPlateia[k % falasPlateia.length] }]), CORES[k % CORES.length], p[2]);
  }));
  if(leste2){
    const naEstacao=()=>typeof ehDia10==="function"&&ehDia10()&&!torneioLiberado();
    const falas=["Recebi um convite sem nome. Disseram que a arena é na Oeste 2.","O trem veio quase sem explicações.","Quarenta lugares e todos ocupados. Alguém planejou isso muito bem.","Você sabe chegar na arena?", "Dizem que o torneio terá lutadores de estilos diferentes."];
    const pos=[[25,14,"baixo"],[29,14,"baixo"],[32,14,"baixo"],[36,14,"baixo"],[39,14,"baixo"],[12,20,"direita"],[16,24,"cima"],[20,20,"baixo"],[28,25,"cima"],[30,20,"esquerda"],[44,24,"esquerda"],[46,20,"baixo"]];
    leste2.npcs=(leste2.npcs||[]).concat(pos.map((p,k)=>npc("Convidado",["assets/Morador2.png","assets/Npc2.png"],pe(p[0],p[1]),naEstacao,()=>abrirDialogo([{quem:"Convidado",texto:falas[k%falas.length]}]),CORES[k%CORES.length],p[2])));
    const anterior=leste2.aoEntrar;leste2.aoEntrar=function(){if(anterior)anterior();if(naEstacao()&&!historia.torneioChegada){historia.torneioChegada=true;mostrarMensagem("O trem especial chegou: a estação está cheia de convidados de fora.");}};
  }
  // O estado é carregado/criado sob demanda, depois que o save do jogador já foi aplicado.
  // Isso garante que a regra Gaby -> Millena leia corretamente a escolha salva no dia 7.
})();
