/* Shadow of War v62 — vínculos, ciúmes, segredos, descoberta e consequências (offline). */
(function(){
  const AUTONOMOS = [
    ["Nathalia","Deriky",{a:36,b:34,escondido:true}],
    ["Nathalia","Lucas",{a:4,b:4}],
    ["Veras","Vitinho",{a:4,b:4}],
    ["Veras","Simon",{a:4,b:4}]
  ];
  // Dellalos é personagem controlada: o jogo nunca escolhe seus sentimentos ou aceita namoro por ela.
  const JOGADOR = [["Dellalos","Deriky"],["Dellalos","Lucas"],["Dellalos","Simon"]];
  const TODOS = AUTONOMOS.concat(JOGADOR);
  function dados(){
    if(typeof diario==="undefined") return {pares:{},historico:[],ultimaDataProcessada:0};
    if(!diario.escolhas||typeof diario.escolhas!=="object") diario.escolhas={};
    if(!diario.escolhas.romances||typeof diario.escolhas.romances!=="object") diario.escolhas.romances={pares:{},historico:[],ultimaDataProcessada:0};
    const d=diario.escolhas.romances;
    if(!d.pares||typeof d.pares!=="object")d.pares={};
    if(!Array.isArray(d.historico))d.historico=[];
    return d;
  }
  function chave(a,b){return [String(a),String(b)].sort((x,y)=>x.localeCompare(y,"pt-BR")).join("::");}
  function cfgPar(a,b){return TODOS.find(x=>chave(x[0],x[1])===chave(a,b));}
  function ehJogador(a,b){return JOGADOR.some(x=>chave(x[0],x[1])===chave(a,b));}
  function clamp(n){return Math.max(0,Math.min(100,Number(n)||0));}
  function dia(){return typeof diaAtual==="function"?diaAtual():1;}
  function evento(tipo,p,descricao,extra){
    const d=dados(), e={tipo,a:p.a,b:p.b,dia:dia(),descricao:String(descricao||tipo).slice(0,180)};
    if(extra)Object.assign(e,extra);
    d.historico.push(e);if(d.historico.length>120)d.historico.splice(0,d.historico.length-120);
    p.ultimoEvento=e.descricao;p.ultimaInteracaoDia=dia();return e;
  }
  function obter(a,b){
    const d=dados(), k=chave(a,b);if(!cfgPar(a,b))return null;
    if(!d.pares[k]){
      const c=cfgPar(a,b),base=c[2]||{a:0,b:0},aa=c[0],bb=c[1];
      d.pares[k]={a:aa,b:bb,interesseA:base.a||0,interesseB:base.b||0,confiancaA:50,confiancaB:50,ciumesA:0,ciumesB:0,encontros:0,estado:base.escondido?"sentimentos_escondidos":"conhecendo",namoroDesde:0,tentacaoA:0,tentacaoB:0,segredo:false,casoCom:null,casoDescoberto:false,ultimaInteracaoDia:0,ultimoEvento:base.escondido?"Interesse romântico escondido e recíproco":"",autonomo:!ehJogador(a,b)};
    }
    const p=d.pares[k];
    // Migração segura de saves da v60/v61.
    if(typeof p.casoDescoberto!=="boolean")p.casoDescoberto=false;
    if(typeof p.tentacaoA!=="number")p.tentacaoA=0;if(typeof p.tentacaoB!=="number")p.tentacaoB=0;
    if(typeof p.autonomo!=="boolean")p.autonomo=!ehJogador(a,b);
    return p;
  }
  function ajustar(p,nome,base,delta){const k=nome===p.a?base+"A":nome===p.b?base+"B":null;if(k)p[k]=clamp((p[k]||0)+delta);}
  function interesseMedio(p){return ((Number(p.interesseA)||0)+(Number(p.interesseB)||0))/2;}
  function parceiroNamorando(nome,exceto){
    return Object.values(dados().pares).find(p=>p.estado==="namoro"&&(p.a===nome||p.b===nome)&&p.a!==exceto&&p.b!==exceto);
  }
  function vinculosDe(nome){return Object.values(dados().pares).filter(p=>p.a===nome||p.b===nome);}
  function registrarCiumeNoVinculoExistente(nome,parOutro){
    const oficial=parceiroNamorando(nome,parOutro);if(!oficial)return;
    ajustar(oficial,nome,"ciumes",2);
    ajustar(oficial,nome,"confianca",-1);
    if(!oficial._avisoCiúmesDia||oficial._avisoCiúmesDia!==dia()){
      oficial._avisoCiúmesDia=dia();evento("desconfianca",oficial,nome+" parece mais distante depois de uma aproximação com outra pessoa.");
    }
  }
  function registrarCasoSecreto(p){
    if(p.segredo||!p.autonomo||p.encontros<5||p.interesseA<35||p.interesseB<35)return false;
    const comprometidoA=parceiroNamorando(p.a,p.b),comprometidoB=parceiroNamorando(p.b,p.a);
    const oficial=comprometidoA||comprometidoB;if(!oficial)return false;
    // Não acontece só por existir atração: precisa de encontros repetidos e interesse mútuo.
    const chance=Math.min(0.12,0.025+(interesseMedio(p)-35)/1000);
    if(Math.random()>=chance)return false;
    p.segredo=true;p.casoCom=chave(oficial.a,oficial.b);p.casoDescoberto=false;p.estado="triangulo_em_potencial";
    ajustar(p,p.a,"tentacao",8);ajustar(p,p.b,"tentacao",8);
    evento("caso_secreto",p,"Uma aproximação entre "+p.a+" e "+p.b+" passou dos limites e está sendo mantida em segredo.");
    ajustar(oficial,p.a===oficial.a||p.a===oficial.b?p.a:p.b,"ciumes",3);
    return true;
  }
  function descobrirCaso(oficial,casa){
    if(!casa||casa.casoDescoberto)return false;
    casa.casoDescoberto=true;casa.estado="crise";
    oficial.estado="crise";oficial.segredo=true;
    oficial.confiancaA=clamp(oficial.confiancaA-35);oficial.confiancaB=clamp(oficial.confiancaB-35);
    oficial.ciumesA=clamp(oficial.ciumesA+22);oficial.ciumesB=clamp(oficial.ciumesB+22);
    casa.confiancaA=clamp(casa.confiancaA-12);casa.confiancaB=clamp(casa.confiancaB-12);
    evento("traição_descoberta",oficial,"A traição envolvendo "+casa.a+" e "+casa.b+" veio à tona. A confiança foi abalada.",{caso:casa.a+"::"+casa.b});
    evento("caso_descoberto",casa,"O envolvimento secreto entre "+casa.a+" e "+casa.b+" foi descoberto.");
    return true;
  }
  function verificarDescoberta(a,b){
    const oficial=obter(a,b);if(!oficial||oficial.estado!=="namoro")return;
    const casos=Object.values(dados().pares).filter(p=>p!==oficial&&p.segredo&&!p.casoDescoberto&&p.casoCom===chave(oficial.a,oficial.b));
    casos.forEach(casa=>{
      const ciu=Math.max(oficial.ciumesA||0,oficial.ciumesB||0);
      const chance=Math.min(0.38,0.10+ciu/400+(100-Math.min(oficial.confiancaA,oficial.confiancaB))/500);
      if(Math.random()<chance)descobrirCaso(oficial,casa);
      else if(Math.random()<0.25){ajustar(oficial,a,"ciumes",2);ajustar(oficial,b,"ciumes",2);evento("suspeita",oficial,"Uma conversa deixou "+oficial.a+" ou "+oficial.b+" com uma sensação de que algo está errado.");}
    });
  }
  function avancarEstado(p){
    const media=interesseMedio(p);
    if(p.estado==="conhecendo"&&p.encontros>=2&&media>=12){p.estado="aproximacao";evento("aproximacao",p,p.a+" e "+p.b+" estão ficando mais próximos.");}
    else if((p.estado==="aproximacao"||p.estado==="sentimentos_escondidos")&&p.encontros>=4&&media>=25){p.estado="sentimentos_emergentes";evento("sentimentos",p,"A proximidade entre "+p.a+" e "+p.b+" começou a despertar sentimentos.");}
    else if(p.estado==="sentimentos_emergentes"&&p.encontros>=7&&p.interesseA>=38&&p.interesseB>=38&&p.autonomo){
      const ocupadoA=parceiroNamorando(p.a,p.b),ocupadoB=parceiroNamorando(p.b,p.a);
      if(ocupadoA||ocupadoB){p.estado="triangulo_em_potencial";p.tentacaoA=clamp(p.tentacaoA+4);p.tentacaoB=clamp(p.tentacaoB+4);evento("triangulo",p,p.a+" e "+p.b+" estão se aproximando apesar de existir outro vínculo amoroso.");}
      else if(Math.random()<0.18){p.estado="confissao_pendente";evento("confissao_pendente",p,p.a+" ou "+p.b+" está criando coragem para confessar sentimentos.");}
    } else if(p.estado==="confissao_pendente"&&p.encontros>=9&&p.autonomo&&Math.random()<0.12){
      p.estado="namoro";p.namoroDesde=dia();evento("namoro",p,p.a+" e "+p.b+" começaram a namorar após se aproximarem aos poucos.");
    }
  }
  function processar(a,b){
    if(!a||!b||a===b)return;
    const p=obter(a,b);if(!p)return;
    const hoje=dia();if(p.ultimaInteracaoDia===hoje)return; // uma conversa por par/dia evita farming e saltos artificiais
    p.encontros=Math.min(999,(Number(p.encontros)||0)+1);
    const atorEhA=p.a===a,ator=atorEhA?p.a:p.b,outro=atorEhA?p.b:p.a;
    if(ehJogador(a,b)){
      // Só registra a conversa; não escolhe sentimentos nem inicia namoro por Dellalos.
      if(ator!=="Dellalos")ajustar(p,ator,"interesse",Math.random()<0.45?1:0);
      ajustar(p,ator,"confianca",Math.random()<0.65?1:0);
      p.ultimaInteracaoDia=hoje;evento("conversa",p,"Uma conversa entre "+a+" e "+b+" foi registrada.");return;
    }
    if(Math.random()<0.72){
      ajustar(p,ator,"interesse",p.encontros>=3?2:1);ajustar(p,outro,"interesse",p.encontros>=3?1:0.5);ajustar(p,ator,"confianca",1);
      registrarCiumeNoVinculoExistente(ator,outro);registrarCiumeNoVinculoExistente(outro,ator);
      avancarEstado(p);registrarCasoSecreto(p);
    }else ajustar(p,ator,"confianca",-1);
    p.ultimaInteracaoDia=hoje;
    verificarDescoberta(a,b);
  }
  window.romanceObterPar=(a,b)=>{const p=obter(a,b);return p?JSON.parse(JSON.stringify(p)):null;};
  window.romanceListar=()=>{TODOS.forEach(x=>obter(x[0],x[1]));return Object.values(dados().pares).map(p=>JSON.parse(JSON.stringify(p)));};
  window.romanceHistorico=()=>dados().historico.slice();
  window.romanceRegistrarEvento=function(a,b,tipo,descricao){
    const p=obter(a,b);if(!p)return false;
    if(["flagra_romantico","traição","traicao","traição_descoberta"].includes(tipo)){
      p.segredo=true;p.casoDescoberto=true;p.estado="crise";p.confiancaA=clamp(p.confiancaA-25);p.confiancaB=clamp(p.confiancaB-25);
      evento("traicao",p,descricao||"Um envolvimento secreto abalou a confiança.");
    } else if(tipo==="confissao"){if(!p.autonomo)return false;p.estado="confissao_pendente";evento(tipo,p,descricao||a+" confessou seus sentimentos a "+b+".");}
    else if(tipo==="namoro"){if(!p.autonomo)return false;p.estado="namoro";p.namoroDesde=dia();evento(tipo,p,descricao||a+" e "+b+" começaram a namorar.");}
    else if(tipo==="termino"){p.estado="terminado";evento(tipo,p,descricao||a+" e "+b+" terminaram.");}
    else if(tipo==="reconciliacao"){p.estado="aproximacao";p.segredo=false;p.casoDescoberto=false;p.confiancaA=clamp(p.confiancaA+10);p.confiancaB=clamp(p.confiancaB+10);evento(tipo,p,descricao||a+" e "+b+" tentam recomeçar.");}
    else if(tipo==="flertar"){ajustar(p,a,"interesse",5);ajustar(p,b,"interesse",2);evento(tipo,p,descricao||a+" flertou com "+b+".");registrarCiumeNoVinculoExistente(a,b);registrarCiumeNoVinculoExistente(b,a);}
    else if(tipo==="suspeita"){ajustar(p,a,"ciumes",5);evento(tipo,p,descricao||a+" começou a desconfiar de algo.");}
    else return false;return true;
  };
  window.romanceAjustarInteresse=function(a,b,quem,delta,descricao){const p=obter(a,b);if(!p)return false;ajustar(p,quem,"interesse",Number(delta)||0);if(descricao)evento("sentimentos",p,descricao);avancarEstado(p);registrarCasoSecreto(p);return true;};
  window.romanceRegistrarCiumes=function(a,b,quem,delta,descricao){const p=obter(a,b);if(!p)return false;ajustar(p,quem,"ciumes",Number(delta)||0);if(descricao)evento("ciumes",p,descricao);return true;};
  window.romanceProcessarEncontro=processar;
  const original=window.relacaoRegistrarConversaNPC;
  if(typeof original==="function"&&!window.__romanceHookInstalado){window.relacaoRegistrarConversaNPC=function(a,b){const r=original.apply(this,arguments);try{processar(a,b);}catch(e){console.warn("romances v62:",e);}return r;};window.__romanceHookInstalado=true;}
  TODOS.forEach(x=>obter(x[0],x[1]));
})();
