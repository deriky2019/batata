/* =====================================================
   salas/zonanorte2.js - Zona Norte 2: bairro devastado, casas destruídas, sem NPCs.
   ===================================================== */
(function () {
  const COLS = 72, ROWS = 56;
  const m = criarMapa(COLS, ROWS);
  pintar(m, "chao", 0, 0, COLS, ROWS, GRAMA);
  const TRILHA = K(1,4);
  // Rua rachada cruza o bairro; pequenos acessos ligam as ruínas sem formar labirinto.
  pintar(m,"chao",0,24,COLS,8,ASFALTO);
  pintar(m,"chao",33,0,6,ROWS,ASFALTO);
  pintar(m,"chao",8,12,4,12,TRILHA);
  pintar(m,"chao",51,32,4,17,TRILHA);
  for(let x=0;x<COLS;x+=2) por(m,"chao",x,28,K(9,0));
  for(let y=0;y<ROWS;y+=2) por(m,"chao",35,y,K(9,0));

  const destroco=(x,y,n=0)=>{
    const t=[K(3,10),K(4,10),K(5,10),K(3,11),K(4,11),K(5,11),K(8,9),K(9,9)][n%8];
    por(m,"obj",x,y,t); bloquear(m,x,y);
  };
  const muro=(x,y,n=0)=>{por(m,"obj",x,y,[K(17,2),K(18,2),K(19,2),K(20,2),K(17,3),K(18,3),K(19,3)][n%7]); bloquear(m,x,y);};
  const casaDestruida=(x,y,w,h,seed)=>{
    // paredes quebradas, telhado ausente e grandes aberturas: ruína visual, não uma casa funcional.
    for(let i=0;i<w;i++){
      if(i%3!==1) muro(x+i,y,seed+i);
      if((i+seed)%3!==0) muro(x+i,y+h-1,seed+i+2);
    }
    for(let j=1;j<h-1;j++){
      if(j%2===0) muro(x,y+j,seed+j);
      if((j+seed)%3!==0) muro(x+w-1,y+j,seed+j+3);
    }
    // escombros espalhados dentro e fora das paredes
    destroco(x+1,y+1,seed); destroco(x+w-2,y+h-2,seed+2);
    if(w>5){destroco(x+Math.floor(w/2),y+1,seed+4);}
    destroco(x-1,y+h,seed+5); destroco(x+w,y+h-1,seed+6);
  };
  // Ruínas distribuídas pelos dois lados da avenida; todos os espaços entre elas ficam transitáveis.
  casaDestruida(4,5,9,6,1);
  casaDestruida(17,4,10,7,2);
  casaDestruida(44,5,11,7,3);
  casaDestruida(58,7,9,6,4);
  casaDestruida(4,15,8,6,5);
  casaDestruida(16,36,10,7,6);
  casaDestruida(3,41,9,8,7);
  casaDestruida(43,39,10,7,1);
  casaDestruida(58,43,9,7,2);
  casaDestruida(46,16,9,6,3);
  // Muros tombados e entulho ao longo da rua, sem bloquear a faixa central.
  for(const [x,y,n] of [[14,22,0],[18,34,1],[25,18,2],[28,38,3],[43,22,4],[57,35,5],[63,22,6],[24,48,7],[38,48,2],[11,34,3],[66,36,4]]) destroco(x,y,n);
  // Manchas de terra seca e ervas, apenas variações de chão.
  for(const [x,y,w,h] of [[2,2,14,2],[21,13,9,2],[46,13,13,2],[19,45,12,2],[48,51,15,2],[60,30,8,2]]) pintar(m,"chao",x,y,w,h,K(2,1));
  // ----- Missão "Quem morava aqui?" (a partir do dia 4: DIA_DA_MISSAO.norte2 em js/calendario.js) -----
  // 5 pistas dentro das casas em ruína, em qualquer ordem. Ao achar todas, a missão termina (js/missoes.js, id "norte2").
  // Textos PROVISÓRIOS: ajuste à história. Antes do dia 4 (ou da missão começar) cada pista é só um objeto do cenário.
  const D = (t) => ({ quem: "Dellalos", texto: t });
  const PISTAS_NORTE2 = [
    { id: "norte2Pista1", col: 7, lin: 8, nome: "norte2_urso",
      ambiente: "Entre os escombros há uma caminha pequena e um ursinho de pano queimado nas bordas.",
      repete: "O ursinho continua ali, no mesmo lugar onde alguém o largou.",
      falas: [D("Uma caminha de criança... e um ursinho de pano queimado nas bordas."), D("Quem saiu daqui estava com tanta pressa que deixou até o ursinho.")] },
    { id: "norte2Pista2", col: 20, lin: 7, nome: "norte2_foto",
      ambiente: "Há um porta-retrato quebrado no chão, cheio de poeira.",
      repete: "A foto rasgada continua riscada com tinta preta.",
      falas: [D("Uma foto de família: pai, mãe e duas crianças. Está rasgada ao meio."), D("O rosto de uma das crianças foi riscado com tinta preta. Por que alguém faria isso?")] },
    { id: "norte2Pista3", col: 47, lin: 8, nome: "norte2_diario",
      ambiente: "Um caderno velho, com as páginas coladas pela umidade, está jogado perto da parede.",
      repete: "O diário da criança. A última página ficou em branco.",
      falas: [D("Um diário de criança. Quase tudo apagou, mas dá para ler a última página."), D("\"Hoje vieram de novo medir a gente. Disseram que eu sou compatível. A mamãe chorou a noite inteira.\""), D("Compatível com o quê...?")] },
    { id: "norte2Pista4", col: 7, lin: 18, nome: "norte2_simbolo",
      ambiente: "A porta caída tem uma marca de carvão que o tempo quase apagou.",
      repete: "O símbolo na porta. Ela tem certeza de que já viu algo parecido.",
      falas: [D("Um símbolo pintado a carvão na porta: um círculo cortado por três linhas."), D("Tenho a sensação de já ter visto isso em algum lugar.")] },
    { id: "norte2Pista5", col: 19, lin: 39, nome: "norte2_lista",
      ambiente: "Uma caixa de metal enferrujada está aberta entre as tábuas.",
      repete: "A lista de famílias está no mesmo lugar, com quase todos os nomes riscados.",
      falas: [D("Uma lista com nomes de famílias da Zona Norte. Cada nome tem uma data ao lado."), D("Quase todos estão riscados, um por semana. As casas foram esvaziadas uma a uma."), D("Isso não foi um desastre. Alguém esvaziou este bairro de propósito.")] }
  ];
  const FINAL_NORTE2 = [
    D("Brinquedos, uma foto riscada, um diário, um símbolo e uma lista de famílias... Tudo isso foi planejado."),
    D("Preciso descobrir quem faria uma coisa dessas. E por que escolheu justamente essas famílias.")
  ];
  function examinarPistaNorte2(p) {
    if (!historia.norte2Iniciada) { mostrarMensagem(p.ambiente); return; }
    if (historia[p.id]) { mostrarMensagem(p.repete); return; }
    historia[p.id] = true;
    abrirDialogo(p.falas, function () {
      const n = PISTAS_NORTE2.filter((q) => historia[q.id]).length;
      if (n < PISTAS_NORTE2.length) { mostrarMensagem("Pista " + n + " de " + PISTAS_NORTE2.length + " anotada."); sinalizarMissao(); return; }
      abrirDialogo(FINAL_NORTE2, function () {
        historia.norte2Concluida = true;     // verificarMissoes dá a recompensa e avisa "Missão concluída"
        descobrirInfo("norte2_familias");
      });
    });
  }

  // ----- Missão "O último morador" (a partir do dia 11, depois de "Quem morava aqui?") -----
  // O Seu Otávio se esconde numa casa em ruína. Sem a Millena como companheira ele não fala; com ela, conta o que sabe do Durval.
  // Textos PROVISÓRIOS: ajuste à história.
  const OTAVIO = (t) => ({ quem: "Seu Otávio", texto: t });
  const MILLENA = (t) => ({ quem: "Millena", texto: t });
  function conversarOtavio() {
    if (historia.norte2MoradorFim) {
      abrirDialogo([OTAVIO("Ainda estou aqui. Agora, pelo menos, sei que alguém sabe a verdade. Tomem cuidado com o Durval.")]);
      return;
    }
    if (companheiroAgora() !== "Millena") {
      const primeira = !historia.norte2MoradorVisto;
      abrirDialogo(primeira
        ? [OTAVIO("Para trás! Ninguém vem aqui por bem."),
           D("Eu só quero entender o que aconteceu com este bairro."),
           OTAVIO("Não falo com estranhos. Volte com alguém que saiba conversar... aquela menina da escola, a que fala com todo mundo.")]
        : [OTAVIO("Sozinha, não. Traga a menina que fala com todo mundo.")],
        function () {
          if (!primeira) return;
          historia.norte2MoradorVisto = true;
          sinalizarMissao();
          mostrarMensagem("Nova missão: O último morador. Volte com a Millena como companheira.");
        });
      return;
    }
    abrirDialogo([
      MILLENA("Seu Otávio, está tudo bem. A gente só quer ajudar."),
      OTAVIO("Faz anos que me escondo aqui. Eu trabalhava na escola, com o Durval."),
      OTAVIO("Ele media os alunos com um aparelho e anotava as famílias compatíveis. Pouco depois, essas famílias sumiam, uma por semana."),
      D("Foi isso que aconteceu com este bairro."),
      OTAVIO("Quando entendi, fugi. O Durval ainda mexe na escola à noite, sempre sozinho. E guarda uma lista que nunca foi rasgada."),
      MILLENA("Obrigada por confiar na gente, Seu Otávio.")
    ], function () {
      historia.norte2MoradorVisto = true;
      historia.norte2MoradorFim = true;      // verificarMissoes dá a recompensa e avisa "Missão concluída"
      descobrirInfo("norte2_otavio");
    });
  }

  // ----- Missão "Marcas no chão" (a partir do dia 8, de noite, com a Nathalia; as marcas ficam em js/exploracao.js, SEGREDOS) -----
  // As 3 marcas apontam para o altar nas ruínas do sudeste. O altar só aparece de noite e é guardado por uma criatura.
  TIPOS_INIMIGOS.guardiao_altar = {
    nome: "Guardião do altar",
    largura: 64, altura: 96,
    vida: 10, velocidade: 92, deteccao: 600, dano: 1,
    moedas: [0, 0], chefe: true,
    cor: "#1c1230", corEscura: "#8a4ad0", corOlhos: "#f3e6c8",
    aoMorrer: function (i) { guardiaoAltarCaiu(i); }
  };
  const ALTAR = { col: 47, lin: 42 };
  const todasMarcasNorte2 = () => ["n_norte2_1", "n_norte2_2", "n_norte2_3"].every((id) => segredoAchado(id));
  function guardiaoVivo() { return inimigos.some((i) => i.tipoId === "guardiao_altar" && i.vida > 0); }
  function surgirGuardiao() {
    const i = criarInimigo("guardiao_altar", (ALTAR.col + 3) * TILE, (ALTAR.lin + 2) * TILE, 0);
    posicionarInimigoLivre(i);
    i.apresentado = true;                    // mostra a barra de vida do chefe
    inimigos.push(i);
  }
  function usarAltarNorte2() {
    if (guardiaoVivo()) { mostrarMensagem("O guardião ainda está de pé!"); return; }
    // v81: antes do guardião, os símbolos do altar precisam ser repetidos na ordem (uma vez só; js/minijogos_v81.js)
    if (!diario.escolhas.simbolosAltarV81 && window.minijogoV81) {
      abrirDialogo([D("Os símbolos gravados na pedra acendem um a um. Parece que o altar quer que alguém repita a ordem.")], function () {
        window.minijogoV81.simbolos({ tamanho: 4, erros: 2, dica: companheiroAgora() === "Nathalia", titulo: "Símbolos do altar" }, function (ok, info) {
          if (ok) { diario.escolhas.simbolosAltarV81 = true; usarAltarNorte2(); }
          else if (!(info && info.desistiu)) mostrarMensagem("Os símbolos se apagaram. Toque no altar para tentar de novo.");
        });
      });
      return;
    }
    const nath = companheiroAgora() === "Nathalia";
    historia.norte2AltarVisto = true;
    abrirDialogo([
      D("Um altar pequeno, escondido entre as ruínas. O mesmo símbolo das marcas está gravado na pedra."),
      ...(nath ? [{ quem: "Nathalia", texto: "Isso era usado em rituais. A seita fazia isso no meio do bairro, ninguém via." }] : []),
      D("Algo se mexe atrás do altar...")
    ], function () { surgirGuardiao(); mostrarMensagem("Uma criatura surgiu para proteger o altar!"); });
  }
  function guardiaoAltarCaiu(i) {
    historia.norte2AltarFim = true;          // verificarMissoes dá a recompensa e avisa "Missão concluída"
    diario.escolhas.essencias = essenciasAtuais() + 1;
    descobrirInfo("norte2_altar");
    const nath = companheiroAgora() === "Nathalia";
    abrirDialogo([
      D("O guardião se desfez em fumaça, e o altar rachou. Sobrou uma essência no chão."),
      ...(nath ? [{ quem: "Nathalia", texto: "Isso não era só um altar. Era uma parte de algo muito maior, e ainda estamos no começo." }] : [])
    ]);
  }

  // Entrada pelo sul do mapa anterior: corredor central desobstruído.
  const spawn={x:36*TILE+TILE/2,y:(ROWS-3)*TILE+TILE/2};
  CENAS.zona_norte2={
    mapa:m, spawn,
    combate:true,   // só para a luta com o guardião do altar (missão "Marcas no chão")
    npcs:[
      { nome:"Seu Otávio", cor:"#8a7a5a", imagem:["assets/npcs/adam.png","assets/Morador.png"], x:61*TILE+TILE/2, y:46*TILE+58, direcao:"baixo",
        se:()=>!!historia.norte2Concluida&&missaoDoDiaLiberada("norte2_morador"), conversar:conversarOtavio }
    ],
    // Sem NPCs, inimigos ou vida: é uma área de exploração ambiental.
    saidas:[
      {area:celula(32,ROWS-1,8,1),para:"zona_norte",x:28*TILE+TILE/2,y:3*TILE+TILE/2,dir:"baixo"}
    ],
    interativos:[
      { nome: "altar_marcas_norte2", area: celula(ALTAR.col, ALTAR.lin, 2, 2),
        ativo: () => historia.norte2MarcasIniciada && todasMarcasNorte2() && cicloEhNoite() && !historia.norte2AltarFim,
        conversar: usarAltarNorte2 },
      ...PISTAS_NORTE2.map((p) => ({ nome: p.nome, area: celula(p.col, p.lin, 2, 2), conversar: () => examinarPistaNorte2(p) })),
      {nome:"ruinas_casa_norte2",area:celula(4,5,9,6),texto:"O que restou de uma casa. As paredes cederam e o telhado desapareceu; só há madeira quebrada e tijolos."},
      {nome:"rua_destruida_norte2",area:celula(29,24,13,8),texto:"A avenida está rachada e coberta de escombros. O bairro inteiro parece ter sido evacuado há muito tempo."},
      {nome:"destrocos_norte2",area:celula(24,47,10,5),texto:"Pedaços de parede e telhas quebradas estão espalhados pelo chão."}
    ],
    placas:[{texto:"ZONA NORTE 2 — BAIRRO DESTRUÍDO",x:36*TILE,y:22*TILE,w:570,h:46,fonte:24}],
    aoEntrar:function(){
      const primeira=!diario.infos.zona_norte2;
      if(primeira)descobrirInfo("zona_norte2");
      if(!historia.norte2Iniciada&&missaoDoDiaLiberada("norte2")){
        historia.norte2Iniciada=true; sinalizarMissao();
        mostrarMensagem((primeira?"Zona Norte 2 — bairro destruído. ":"")+"Nova missão: Quem morava aqui?");
      } else if(primeira) mostrarMensagem("Zona Norte 2 — bairro destruído");
    }
  };
})();