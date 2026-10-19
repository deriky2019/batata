/* Shadow of War V69 — eventos sociais e reações contextuais offline. */
(function(){
 'use strict';
 const KEY='shadowOfWar.eventosV69.v1';
 const NOMES=['Nathalia','Millena','Lucas','Isabela','Thaina','Deriky','Simon','Veras','Vitinho','Mariane','Dellalos'];
 let ultimoDia=null;
 function dia(){try{return typeof diaAtual==='function'?(Number(diaAtual())||1):1}catch(e){return 1}}
 function state(){let s={diaProcessado:null,eventos:[]};try{const x=localStorage.getItem(KEY);if(x)s=Object.assign(s,JSON.parse(x))}catch(e){};if(!Array.isArray(s.eventos))s.eventos=[];return s}
 function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(e){};try{if(typeof salvarJogo==='function')salvarJogo()}catch(e){}}
 function emit(tipo,pessoas,texto){const s=state();const item={id:'v69-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),dia:dia(),tipo,pessoas:pessoas.filter(Boolean),texto:String(texto).slice(0,240)};s.eventos.unshift(item);s.eventos=s.eventos.slice(0,60);save(s);try{if(window.socialV66&&typeof window.socialV66.registrar==='function')window.socialV66.registrar(tipo,item.pessoas,item.texto,0)}catch(e){};return item}
 function pairs(){try{return typeof romanceListar==='function'?romanceListar():[]}catch(e){return []}}
 function social(){try{return typeof window.socialV66==='object'?window.socialV66:null}catch(e){return null}}
 function friendship(a,b){try{if(typeof AMIGOS!=='undefined'&&AMIGOS[b]&&typeof amizadeNivel==='function')return amizadeNivel(b);return 0}catch(e){return 0}}
 function processDay(){const today=dia(),s=state();if(s.diaProcessado===today||ultimoDia===today)return;ultimoDia=today;s.diaProcessado=today;save(s);
   const ps=pairs().filter(p=>p&&p.a&&p.b&&['interesse','confissao_pendente','namoro','crise','terminado'].includes(p.estado));
   // No romance is invented: only react to pairs already present in the romance system.
   ps.forEach(p=>{
    const key=[p.a,p.b].sort().join('|')+'|'+today;
    if(s.eventos.some(e=>e.chave===key))return;
    const ia=Number(p.interesseA)||0,ib=Number(p.interesseB)||0,trust=Math.min(Number(p.confiancaA==null?50:p.confiancaA),Number(p.confiancaB==null?50:p.confiancaB)),jealousy=Math.max(Number(p.ciumesA)||0,Number(p.ciumesB)||0);
    let tipo='',txt='';
    if(p.estado==='namoro'&&trust<30){tipo='tensao_social';txt=p.a+' e '+p.b+' demonstraram distância; a confiança baixa pede uma conversa sincera.'}
    else if(p.estado==='namoro'&&jealousy>=45){tipo='ciumes_social';txt='Uma situação deixou '+p.a+' ou '+p.b+' inseguro(a). O ciúme não confirma traição; os personagens precisam esclarecer o que aconteceu.'}
    else if(p.estado==='crise'&&trust>=55){tipo='tentativa_reconciliacao';txt=p.a+' e '+p.b+' tiveram uma oportunidade de conversar e tentar reconstruir a confiança.'}
    else if(p.estado==='interesse'&&ia>=55&&ib>=55){tipo='aproximacao';txt=p.a+' e '+p.b+' parecem ter abertura para se aproximar, mas nenhum sentimento secreto é automaticamente conhecido por terceiros.'}
    else if(p.estado==='confissao_pendente'){tipo='sentimentos_em_aberto';txt='Os sentimentos entre '+p.a+' e '+p.b+' continuam em aberto; uma conversa pode esclarecer a relação.'}
    if(!tipo)return;
    const ev=emit(tipo,[p.a,p.b],txt);ev.chave=key;const ss=state();const idx=ss.eventos.findIndex(x=>x.id===ev.id);if(idx>=0)ss.eventos[idx].chave=key;save(ss);
   });
 }
 function reagirAoRumor(nome){const api=social();if(!api||typeof api.lerRumores!=='function')return [];const rumors=api.lerRumores(nome);return rumors.map(r=>({origem:r.origem,assunto:r.assunto,confianca:r.confianca,estado:Number(r.confianca)>=75?'rumor_confiavel':'rumor_nao_confirmado',texto:Number(r.confianca)>=75?'Você ouviu isto de '+r.origem+', mas ainda precisa confirmar: '+r.assunto:'Você ouviu um rumor de '+r.origem+', mas não sabe se é verdade: '+r.assunto}));}
 function historico(nome){return state().eventos.filter(e=>!nome||e.pessoas.includes(nome)).slice(0,20)}
 window.eventosSociaisV69={processarDia:processDay,registrar:emit,consultar:historico,reacoesRumores:reagirAoRumor};
 function boot(){processDay();setInterval(processDay,12000)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
