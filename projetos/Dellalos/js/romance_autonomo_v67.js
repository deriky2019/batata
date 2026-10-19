/* Shadow of War V67 — romance autônomo com limites, memória e consequências offline. */
(function(){
  'use strict';
  const NOMES = ['Nathalia','Millena','Lucas','Isabela','Thaina','Deriky','Simon','Veras','Vitinho','Mariane'];
  const KEY = 'shadowOfWar.romanceV67.v1';
  const PARES_AUTONOMOS = [
    ['Nathalia','Deriky'], ['Nathalia','Lucas'], ['Veras','Vitinho'], ['Veras','Simon']
  ];
  let ultimoDia = null;
  function dia(){ try { return typeof diaAtual === 'function' ? Number(diaAtual()) || 1 : 1; } catch(e){ return 1; } }
  function estado(){
    let d={ultimaDataProcessada:null, eventos:[]};
    try { const raw=localStorage.getItem(KEY); if(raw) d=Object.assign(d,JSON.parse(raw)); } catch(e){}
    if(typeof diario!=='undefined'){
      diario.escolhas=diario.escolhas||{};
      if(!diario.escolhas.romanceV67) diario.escolhas.romanceV67=d;
      d=diario.escolhas.romanceV67;
    }
    if(!Array.isArray(d.eventos)) d.eventos=[];
    return d;
  }
  function salvar(){ const d=estado(); try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){} try{if(typeof salvarJogo==='function')salvarJogo();}catch(e){} }
  function registrar(tipo, pessoas, texto){
    const d=estado(); d.eventos.unshift({tipo,pessoas,dia:dia(),texto:String(texto||'').slice(0,220)}); d.eventos=d.eventos.slice(0,50); salvar();
    try { if(window.socialV66 && typeof window.socialV66.registrar==='function') window.socialV66.registrar(tipo,pessoas,texto,0); } catch(e){}
  }
  function pares(){ try{return typeof romanceListar==='function'?romanceListar():[]}catch(e){return [];} }
  function ehAutonomo(p){ return !!p && p.autonomo===true && PARES_AUTONOMOS.some(([a,b])=>(p.a===a&&p.b===b)||(p.a===b&&p.b===a)); }
  function ajustar(p,nome,delta,descricao){ try{ if(typeof romanceAjustarInteresse==='function') romanceAjustarInteresse(p.a,p.b,nome,delta,descricao); }catch(e){} }
  function historico(p,tipo,descricao){ try{ if(typeof romanceRegistrarEvento==='function') return romanceRegistrarEvento(p.a,p.b,tipo,descricao); }catch(e){} return false; }
  function ocupado(nome,exceto){ return pares().find(p=>p.estado==='namoro' && (p.a===nome||p.b===nome) && p.a!==exceto && p.b!==exceto); }
  function interacaoDiaria(p,hoje){
    if(!ehAutonomo(p) || p._v67Dia===hoje) return;
    p._v67Dia=hoje;
    const a=p.a,b=p.b, media=((Number(p.interesseA)||0)+(Number(p.interesseB)||0))/2;
    // Uma única chance social por par e por dia; sem progressão automática garantida.
    const chance=Math.min(.72,.20+media/180+(Number(p.confiancaA||50)+Number(p.confiancaB||50))/1000);
    if(Math.random()>chance) return;
    const eventoRoll=Math.random();
    if(p.estado==='namoro'){
      const crise=Math.min(.24,.04+(Number(p.ciumesA||0)+Number(p.ciumesB||0))/700+(100-Math.min(Number(p.confiancaA||50),Number(p.confiancaB||50)))/500);
      if(eventoRoll<crise){
        try { if(typeof romanceRegistrarCiumes==='function') romanceRegistrarCiumes(a,b,a,2,'Uma situação social despertou insegurança.'); }catch(e){}
        registrar('tensao_amorosa',[a,b],a+' e '+b+' tiveram um momento de tensão; precisam conversar para resolver.');
        // Crise não termina automaticamente o namoro: evita decisões drásticas sem contexto.
      } else if(eventoRoll>.78){
        registrar('momento_romantico',[a,b],a+' e '+b+' passaram um momento agradável juntos.');
      }
      return;
    }
    if(p.estado==='crise' || p.estado==='terminado'){
      if(eventoRoll<.18 && Math.min(Number(p.confiancaA||0),Number(p.confiancaB||0))>=35){
        historico(p,'reconciliacao',a+' e '+b+' decidiram tentar reconstruir a confiança aos poucos.');
        registrar('reconciliacao',[a,b],a+' e '+b+' deram um pequeno passo para se entender novamente.');
      }
      return;
    }
    if(eventoRoll<.34){
      ajustar(p,a,1,'Uma conversa agradável aumentou um pouco o interesse.');
      registrar('aproximacao_romantica',[a,b],a+' e '+b+' tiveram uma conversa agradável.');
    } else if(eventoRoll<.54 && media>=18){
      historico(p,'flertar',a+' e '+b+' trocaram sinais discretos de flerte.');
      registrar('paquera',[a,b],a+' e '+b+' trocaram sinais discretos de interesse.');
    } else if(eventoRoll<.70 && p.estado==='confissao_pendente'){
      const ocupadoA=ocupado(a,b), ocupadoB=ocupado(b,a);
      if(!ocupadoA&&!ocupadoB && Number(p.interesseA)>=38 && Number(p.interesseB)>=38){
        // Só os pares autônomos podem iniciar namoro; Dellalos nunca é decidido pelo sistema.
        historico(p,'namoro',a+' e '+b+' decidiram começar um namoro após aproximação gradual.');
        registrar('namoro',[a,b],a+' e '+b+' começaram a namorar depois de se aproximarem gradualmente.');
      }
    }
  }
  function processarDia(){
    const hoje=dia(), d=estado();
    if(d.ultimaDataProcessada===hoje || ultimoDia===hoje) return;
    d.ultimaDataProcessada=hoje; ultimoDia=hoje;
    pares().forEach(p=>{ try{interacaoDiaria(p,hoje);}catch(e){console.warn('romance V67:',e);} });
    salvar();
  }
  function renderizar(){
    const caixa=document.getElementById('abaRelacionamento'); if(!caixa || caixa.querySelector('[data-romance-v67]')) return;
    const wrap=document.createElement('section'); wrap.className='relacao-card'; wrap.setAttribute('data-romance-v67','true');
    const h=document.createElement('h3'); h.className='dia-titulo'; h.textContent='💞 VIDA AMOROSA DOS NPCs'; wrap.appendChild(h);
    const intro=document.createElement('p'); intro.className='relacao-detalhes'; intro.textContent='Os vínculos evoluem aos poucos e podem ter momentos bons, insegurança e reconciliação. Sentimentos secretos não são automaticamente conhecidos por outros personagens.'; wrap.appendChild(intro);
    const d=estado(); const lista=d.eventos.slice(0,8);
    if(!lista.length){const p=document.createElement('p');p.className='relacao-detalhes';p.textContent='Os acontecimentos amorosos aparecerão conforme os dias e as interações avançarem.';wrap.appendChild(p)}
    lista.forEach(e=>{const p=document.createElement('p');p.className='relacao-detalhes';p.textContent='Dia '+e.dia+' · '+e.pessoas.join(' e ')+' — '+e.texto;wrap.appendChild(p)});
    caixa.appendChild(wrap);
  }
  window.romanceAutonomoV67={processarDia,renderizar,estado,salvar};
  function iniciar(){ processarDia(); const rel=document.getElementById('abaBtnRelacionamento'); if(rel) rel.addEventListener('click',()=>setTimeout(renderizar,0)); renderizar(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',iniciar); else iniciar();
  // Verifica apenas se o dia do jogo avançou; não avança o tempo nem acessa a rede.
  setInterval(()=>{if(dia()!==ultimoDia) processarDia();},5000);
})();
