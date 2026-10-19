/* Leste 2: extensão explorável da Zona Leste, com estação ferroviária e depósitos. */
(function () {
  const COLS=52, ROWS=40, m=criarMapa(COLS,ROWS);
  pintar(m,"chao",0,0,COLS,ROWS,CALCADA);
  pintar(m,"chao",0,18,COLS,9,ASFALTO); pintar(m,"chao",34,4,5,ROWS-4,ASFALTO);
  for(let x=0;x<COLS;x+=2) por(m,"chao",x,22,TRACO_H);
  for(let y=4;y<ROWS-1;y++) if(y<18||y>26) por(m,"chao",36,y,TRACO_V);
  for(const [x,y,w,h] of [[3,3,8,5],[14,5,7,4],[5,29,9,6],[22,31,6,5],[41,30,7,5]]) pintar(m,"chao",x,y,w,h,GRAMA);
  const cercaH=(a,b,y,v0,v1)=>{for(let x=a;x<=b;x++){if(v0!==undefined&&x>=v0&&x<=v1)continue;por(m,"obj",x,y,K(4+(x%3),13));bloquear(m,x,y);}};
  const cercaV=(x,a,b,vaos=[])=>{for(let y=a;y<=b;y++){if(vaos.some(([u,v])=>y>=u&&y<=v))continue;por(m,"obj",x,y,K(4+(y%3),13));bloquear(m,x,y);}};
  const poste=(x,y)=>{por(m,"topo",x,y-1,K(7,6));por(m,"obj",x,y,K(7,7));bloquear(m,x,y);};
  const caixa=(x,y,n=0)=>{por(m,"obj",x,y,[K(3,10),K(4,10),K(5,10),K(3,11)][n%4]);bloquear(m,x,y);};
  const barril=(x,y,n=0)=>{por(m,"obj",x,y,[K(8,9),K(9,9),K(10,9)][n%3]);bloquear(m,x,y);};
  cercaH(0,COLS-1,0);cercaH(0,COLS-1,ROWS-1);cercaV(COLS-1,0,ROWS-1);cercaV(0,0,ROWS-1,[[18,26]]);
  // Estação abandonada ao norte da avenida.
  predio(m,25,5,17,6,ESTILO_VERMELHO);for(const x of [27,30,34,38]) janela(m,x,10,JANELA2);porta(m,33,10,K(15,12),true);
  pintar(m,"chao",20,13,24,2,K(8,0));for(let x=20;x<44;x+=2)por(m,"deco",x,14,K(9,0));cercaH(20,44,16,33,35);poste(22,17);poste(43,17);
  // Depósito cercado a sudoeste.
  cercaH(3,19,31,9,11);cercaH(3,19,38);cercaV(3,31,38);cercaV(19,31,38);
  [[5,33],[6,33],[12,33],[13,33],[15,35],[7,36],[14,37]].forEach(([x,y],i)=>caixa(x,y,i));
  [[8,34],[16,32],[11,37]].forEach(([x,y],i)=>barril(x,y,i));
  predio(m,40,30,7,3,ESTILO_LARANJA);porta(m,43,32,PORTA_LARANJA,true);caixa(48,34,1);barril(47,35,2);
  for(const [x,y] of [[7,10],[12,12],[18,8],[45,10],[47,13],[28,29],[31,32]]) if(m.obj[y*COLS+x]===-1){por(m,"obj",x,y,K(21,15));bloquear(m,x,y);}
  for(const [x,y] of [[6,17],[15,17],[25,17],[47,17],[6,28],[16,28],[28,28],[47,28]]) if(!m.bloq[y*COLS+x])poste(x,y);
  // ===== Missões do Leste 2 (textos PROVISÓRIOS; ajuste à história) =====
  const BETO=(t)=>({quem:"Beto",texto:t}), ZECA=(t)=>({quem:"Zeca",texto:t}), DEL=(t)=>({quem:"Dellalos",texto:t});
  const FALAS_BETO_BASE=[BETO("Bem-vinda ao Leste 2. A estação parou há muito tempo, e os saqueadores usam o depósito como esconderijo."),DEL("Ainda tem gente vivendo por aqui?"),BETO("Alguns sobreviventes. Evite os trilhos e não confie em todo barulho que ouvir.")];

  // --- "O trem que não chegou": a partir do dia 5 (DIA_DA_MISSAO.leste2_trem). 3 pistas na estação, em qualquer ordem. ---
  const PISTAS_LESTE2=[
    {id:"leste2Pista1",col:27,lin:11,nome:"leste2_bilheteria",
      ambiente:"A bilheteria está quebrada e coberta de poeira.",repete:"O livro de registros da bilheteria continua aberto na última página.",
      falas:[DEL("Um livro de registros na bilheteria. Antes, centenas de passageiros por mês."),DEL("Nas últimas páginas, só uma linha por semana: \"Carga especial. Não abrir.\"")]},
    {id:"leste2Pista2",col:38,lin:11,nome:"leste2_painel",
      ambiente:"O painel de horários está apagado e rachado.",repete:"O painel marca uma única chegada: dia 15.",
      falas:[DEL("O painel de horários está parado em uma única linha: \"Chegada: dia 15. Trem especial.\""),DEL("Dia 15... o mesmo dia em que o papai volta.")]},
    {id:"leste2Pista3",col:22,lin:13,nome:"leste2_cofre",
      ambiente:"Há um cofre pequeno caído na plataforma.",repete:"O cofre vazio. A lista de convidados está guardada no diário.",
      falas:[DEL("Um cofre pequeno, arrombado. Dentro sobrou só uma folha: \"Convidados. Quarenta lugares.\""),DEL("Os nomes não são da cidade. Quarenta pessoas de fora, chegando de trem.")]}
  ];
  const FINAL_TREM=[
    DEL("Carga especial, um trem no dia 15 e quarenta convidados de fora. Isso só pode ser o torneio."),
    DEL("Alguém organiza isso há muito tempo. E a estação inteira foi fechada para esconder.")
  ];
  function examinarPistaLeste2(p){
    if(!historia.leste2TremIniciada){mostrarMensagem(p.ambiente);return;}
    if(historia[p.id]){mostrarMensagem(p.repete);return;}
    historia[p.id]=true;
    abrirDialogo(p.falas,function(){
      const n=PISTAS_LESTE2.filter((q)=>historia[q.id]).length;
      if(n<PISTAS_LESTE2.length){mostrarMensagem("Pista "+n+" de "+PISTAS_LESTE2.length+" anotada.");sinalizarMissao();return;}
      abrirDialogo(FINAL_TREM,function(){historia.leste2TremFim=true;descobrirInfo("leste2_trem");});   // verificarMissoes dá a recompensa
    });
  }
  function conversarBeto(){
    if(historia.leste2TremFim){abrirDialogo([BETO("Então o trem vinha para o torneio. Eu sabia que aquela estação guardava coisa ruim."),BETO("Obrigado por olhar. Agora eu durmo menos preocupado.")]);return;}
    if(historia.leste2TremIniciada){
      const n=PISTAS_LESTE2.filter((q)=>historia[q.id]).length;
      abrirDialogo([BETO("Já olhou a bilheteria, o painel e o cofre da plataforma? Você achou "+n+" de "+PISTAS_LESTE2.length+" pistas.")]);return;
    }
    if(!missaoDoDiaLiberada("leste2_trem")){abrirDialogo(FALAS_BETO_BASE);return;}
    abrirDialogo(FALAS_BETO_BASE.concat([
      BETO("Tem uma coisa que me incomoda. Numa noite o último trem chegou e a estação parou de vez. Ninguém viu o trem sair."),
      BETO("Dá uma olhada lá para mim? A bilheteria, o painel de horários e o cofre da plataforma.",),
    ]).slice(0,5).concat([{quem:"Beto",texto:"Você me ajuda?",escolha:"aceitar_leste2_trem",opcoes:[
      {id:"sim",texto:"Eu ajudo",fn:function(){historia.leste2TremIniciada=true;mostrarMensagem("Nova missão: O trem que não chegou");sinalizarMissao();}},
      {id:"depois",texto:"Agora não"}]}]));
  }

  // --- "Passageiros": a partir do dia 9 (DIA_DA_MISSAO.leste2_passageiros), depois de "O trem que não chegou". ---
  // O Zeca (galpão laranja) pede 3 crachás de passageiros que sumiram: depósito, avenida e plataforma.
  const CRACHAS_LESTE2=[
    {id:"leste2Cracha1",col:9,lin:35,nome:"leste2_cracha_deposito",texto:"No meio das caixas do depósito há um crachá de passageiro: RAFA, 1º ano. A data é de semanas atrás."},
    {id:"leste2Cracha2",col:24,lin:24,nome:"leste2_cracha_avenida",texto:"Um crachá pisoteado no asfalto da avenida: DUDA, 2º ano. Alguém o perdeu correndo."},
    {id:"leste2Cracha3",col:41,lin:13,nome:"leste2_cracha_plataforma",texto:"Um crachá preso entre as tábuas da plataforma: GABY. Será que foi aqui que a Isabela a controlou?"}
  ];
  function conversarZeca(){
    const n=CRACHAS_LESTE2.filter((c)=>historia[c.id]).length;
    if(historia.leste2PassageirosFim){abrirDialogo([ZECA("Agora esses nomes não vão ser esquecidos. Obrigado, de verdade.")]);return;}
    if(!historia.leste2PassageirosIniciada){
      abrirDialogo([
        ZECA("Psiu! Fala baixo. Eu me escondo aqui desde que o trem parou."),
        ZECA("De noite, passageiros desciam do trem. Jovens, quase todos. Nenhum deles voltava a ser visto."),
        ZECA("Eles deixavam cair os crachás. Procure no depósito, na avenida e na plataforma, e traga os 3 para mim."),
        {quem:"Zeca",texto:"Você faz isso por eles?",escolha:"aceitar_leste2_passageiros",opcoes:[
          {id:"sim",texto:"Eu faço",fn:function(){historia.leste2PassageirosIniciada=true;mostrarMensagem("Nova missão: Passageiros");sinalizarMissao();}},
          {id:"depois",texto:"Agora não"}]}]);
      return;
    }
    if(n<CRACHAS_LESTE2.length){abrirDialogo([ZECA("Já achou "+n+" de "+CRACHAS_LESTE2.length+" crachás? Depósito, avenida e plataforma.")]);return;}
    abrirDialogo([
      DEL("Rafa, Duda e Gaby. Achei os três."),
      ZECA("São todos da escola. Eu sabia. Eles eram levados em fila, de noite, na direção do Bairro Sul."),
      ZECA("Nunca tive coragem de seguir. Mas agora alguém sabe. Obrigado."),
      DEL("Eu vou descobrir para onde eles foram.")
    ],function(){historia.leste2PassageirosFim=true;descobrirInfo("leste2_passageiros");});   // verificarMissoes dá a recompensa
  }

  CENAS.zona_leste2={mapa:m,combate:true,spawn:{x:2*TILE+TILE/2,y:22*TILE+40},
    npcs:[{nome:"Beto",cor:"#b58a5a",imagem:["assets/npcs/alex.png","assets/Morador2.png"],x:39*TILE+TILE/2,y:26*TILE+58,direcao:"baixo",conversar:conversarBeto},
      {nome:"Zeca",cor:"#7a6a8a",imagem:["assets/npcs/bob.png","assets/Morador2.png"],x:44*TILE+TILE/2,y:34*TILE+58,direcao:"cima",se:()=>!!historia.leste2TremFim&&missaoDoDiaLiberada("leste2_passageiros"),conversar:conversarZeca}],
    interativos:[
      ...PISTAS_LESTE2.map((p)=>({nome:p.nome,area:celula(p.col,p.lin,2,2),conversar:()=>examinarPistaLeste2(p)})),
      ...CRACHAS_LESTE2.map((c)=>({nome:c.nome,area:celula(c.col,c.lin,2,2),ativo:()=>historia.leste2PassageirosIniciada&&!historia[c.id],
        conversar:()=>{historia[c.id]=true;mostrarMensagem(c.texto+" ("+CRACHAS_LESTE2.filter((q)=>historia[q.id]).length+" de 3)");sinalizarMissao();}})),{nome:"estacao_abandonada",area:celula(25,5,17,11),texto:"A estação ferroviária está abandonada. Há marcas recentes de passos na poeira."},{nome:"deposito_sucata_leste2",area:celula(5,32,13,6),texto:"Peças de máquinas, latas vazias e ferramentas quebradas. Alguém vasculhou tudo recentemente."},{nome:"abrigo_leste2",area:celula(40,30,7,5),texto:"Um abrigo improvisado. Parece que os sobreviventes saíram às pressas."},{nome:"placa_trilhos_leste2",area:celula(35,18,3,9),texto:"A rua segue até a antiga estação. O bairro parece mais perigoso depois do anoitecer."}],
    saidas:[{area:celula(0,18,1,9),para:"zona_leste",x:61*TILE+TILE/2,y:22*TILE+40,dir:"esquerda"}],
    placas:[{texto:"LESTE 2",x:8*TILE,y:16*TILE+28,w:180,h:42,fonte:26},{texto:"ESTAÇÃO ABANDONADA",x:33*TILE,y:3*TILE+26,w:300,h:40,fonte:20},{texto:"DEPÓSITO",x:11*TILE,y:29*TILE+24,w:170,h:38,fonte:20},{texto:"ÁREA DE RISCO",x:43*TILE,y:28*TILE+24,w:190,h:38,fonte:18}],
    inimigos:[{tipo:"rato",x:16*TILE+TILE/2,y:21*TILE+40},{tipo:"rato",x:29*TILE+TILE/2,y:25*TILE+40},{tipo:"vigia",x:38*TILE+TILE/2,y:12*TILE+40},{tipo:"sucateiro",x:14*TILE+TILE/2,y:35*TILE+40}],
    aoEntrar:function(){if(historia.visitouZonaLeste2)return;historia.visitouZonaLeste2=true;if(typeof descobrirInfo==="function")descobrirInfo("zona_leste2");mostrarMensagem("Leste 2 — Estação Abandonada");}
  };
})();