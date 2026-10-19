/* Shadow of War V75 — personalidade e decisões sociais contextualizadas. Offline. */
(function(){
 'use strict';
 const KEY='shadowOfWar.personalidadeV75.v1';
 const $=id=>document.getElementById(id);
 const TRAITS={
  Nathalia:{reservada:2,lealdade:3,sensibilidade:3},
  Veras:{lealdade:3,sensibilidade:2},
  Deriky:{reservado:3,prudencia:3,sensibilidade:2},
  Dellalos:{autonomia:3,sensibilidade:2},
  Lucas:{prudencia:2,sensibilidade:2}, Millena:{sensibilidade:2},
  Simon:{prudencia:2,lealdade:2}, Vitinho:{autonomia:2},
  Isabela:{lealdade:2}, Thaina:{prudencia:2}, Mariane:{reservada:2}
 };
 function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return {eventos:Array.isArray(x.eventos)?x.eventos:[],processados:x.processados&&typeof x.processados==='object'?x.processados:{}}}catch(_){return {eventos:[],processados:{}}}}
 function write(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
 function day(){try{return typeof diaAtual==='function'?(Number(diaAtual())||1):1}catch(_){return 1}}
 function traits(name){return TRAITS[name]||{sensibilidade:1,prudencia:1}}
 function pairKey(a,b){return [String(a||''),String(b||'')].sort().join('|')}
 function relation(a,b){try{return window.romanceObterPar?window.romanceObterPar(a,b):null}catch(_){return null}}
 function reaction(a,b,ev){const ta=traits(a),tb=traits(b),p=relation(a,b),type=String(ev.tipo||'').toLowerCase();
  if(type.includes('crise')||type.includes('conflito')||type.includes('tensao'))return {tipo:'reacao_cautelosa',texto:a+' reage com cautela ao conflito envolvendo '+b+'. A reação depende do vínculo e não prova culpa.',delta:{confianca:-1,magoa:1}};
  if(type.includes('casal_visto')||type.includes('momento_romantico')||type.includes('aproximacao_romantica')){
   if(p&&p.estado==='namoro')return {tipo:'reacao_afetuosa',texto:a+' demonstra mais disposição para conversar com '+b+'. O momento, por si só, não comprova fidelidade.',delta:{amizade:1,confianca:ta.sensibilidade>=2?1:0}};
   return {tipo:'reacao_curiosa',texto:a+' presta atenção à aproximação com '+b+', mas não conclui que existe namoro.',delta:{amizade:0}};
  }
  if(type.includes('desculpa')||type.includes('reconcili'))return {tipo:'reacao_aberta',texto:a+' considera ouvir '+b+', mas a confiança precisa ser reconstruída com atitudes consistentes.',delta:{confianca:ta.sensibilidade>=2?1:0,magoa:-1}};
  if(type.includes('fofoca')||type.includes('rumor'))return {tipo:'reacao_cautelosa',texto:a+' trata o que ouviu sobre '+b+' como informação não confirmada.',delta:{confianca:0}};
  return {tipo:'reacao_neutra',texto:a+' observa a situação envolvendo '+b+' sem tirar conclusões precipitadas.',delta:{}};
 }
 function registrar(a,b,evento){if(!a||!b||a===b||!evento)return null;const id=String(evento.id||[evento.tipo,a,b,evento.dia||day()].join('|'));const s=read();if(s.processados[id])return null;s.processados[id]=true;const r=reaction(a,b,evento);const out={id:'v75-'+id,dia:evento.dia==null?day():evento.dia,a,b,tipo:r.tipo,texto:r.texto,origem:evento.tipo||'social',delta:r.delta};s.eventos.unshift(out);s.eventos=s.eventos.slice(0,50);const ids=Object.keys(s.processados);if(ids.length>300)ids.slice(0,ids.length-240).forEach(k=>delete s.processados[k]);write(s);
  // Vínculos dinâmicos só recebem deltas não nulos; IDs únicos impedem reaplicação.
  try{if(window.vinculosDinamicosV74&&typeof window.vinculosDinamicosV74.aplicar==='function'&&Object.keys(r.delta).length){window.vinculosDinamicosV74.aplicar({id:out.id,dia:out.dia,a,b,tipo:r.tipo,texto:r.texto,delta:r.delta})}}catch(_){ }
  render();return out;
 }
 function render(){const target=$('abaRelacionamento');if(!target)return;let box=target.querySelector('[data-v75-personalidade]');if(box)box.remove();box=document.createElement('section');box.dataset.v75Personalidade='1';box.className='relacao-card';box.style.cssText='margin:12px 0;padding:12px;border:2px solid #9b7a43;background:#29251d;color:#f4e8c9;font-family:inherit';const h=document.createElement('h3');h.textContent='🧠 PERSONALIDADE E DECISÕES SOCIAIS — V75';box.appendChild(h);const note=document.createElement('p');note.textContent='As reações são contextuais e moderadas. Rumores continuam não confirmados; encontros não provam traição; sentimentos secretos não são revelados automaticamente. Traços ainda são perfis iniciais ajustáveis.';box.appendChild(note);const s=read();if(!s.eventos.length){const p=document.createElement('p');p.textContent='As reações aparecerão quando novos eventos sociais forem registrados.';box.appendChild(p)}s.eventos.slice(0,6).forEach(e=>{const p=document.createElement('p');p.textContent='Dia '+e.dia+' · '+e.a+' — '+e.texto;box.appendChild(p)});target.appendChild(box)}
 function hook(){const api=window.consequenciasSociaisV73;if(!api||typeof api.registrar!=='function'||api.registrar.__v75)return;const orig=api.registrar;const wrap=function(a,b,source){const ev=orig.apply(this,arguments);try{if(ev){registrar(a,b,ev);registrar(b,a,ev)}}catch(e){}return ev};wrap.__v75=true;api.registrar=wrap;}
 function boot(){hook();const btn=$('abaBtnRelacionamento');if(btn&&!btn.__v75){btn.__v75=true;btn.addEventListener('click',()=>setTimeout(render,90))}render()}
 window.personalidadeSocialV75={registrar,render,consultar:()=>read().eventos.slice(),tracos:n=>Object.assign({},traits(n))};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setInterval(hook,1200);
})();
