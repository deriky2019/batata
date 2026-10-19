/* Shadow of War V71 — conversas sociais autônomas, locais e limitadas por dia. */
(function(){
 'use strict';
 const KEY='shadowOfWar.socialV71.v1';
 const NPCS=['Nathalia','Veras','Deriky','Lucas','Millena','Simon','Vitinho','Isabela','Thaina','Mariane'];
 const AMIZADES=[['Nathalia','Veras']]; // relações definidas pelo criador; demais vínculos não são presumidos.
 let ultimoDia=null;
 const el=(tag,txt)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;return n};
 function dia(){try{return typeof diaAtual==='function'?(Number(diaAtual())||1):1}catch(_){return 1}}
 function state(){let s={diaProcessado:null,eventos:[]};try{s=Object.assign(s,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(_){};if(!Array.isArray(s.eventos))s.eventos=[];return s}
 function save(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){} }
 function romance(){try{return typeof romanceListar==='function'?romanceListar().filter(p=>p&&p.a&&p.b):[]}catch(_){return []}}
 function vinculo(a,b){return romance().find(p=>(p.a===a&&p.b===b)||(p.a===b&&p.b===a))||null}
 function amizadeConhecida(a,b){return AMIZADES.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a))}
 function emitir(tipo,pessoas,texto){const s=state();const ev={id:'v71-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),dia:dia(),tipo,pessoas:pessoas.slice(),texto:String(texto||'').slice(0,240)};s.eventos.unshift(ev);s.eventos=s.eventos.slice(0,50);save(s);try{if(window.socialV66&&typeof window.socialV66.registrar==='function')window.socialV66.registrar(tipo,pessoas,ev.texto,0)}catch(_){};try{if(window.eventosSociaisV69&&typeof window.eventosSociaisV69.registrar==='function')window.eventosSociaisV69.registrar(tipo,pessoas,ev.texto)}catch(_){};return ev}
 function montarEvento(a,b){const p=vinculo(a,b);if(p){const estado=p.estado||'interesse';const ia=Number(p.a===a?p.interesseA:p.interesseB)||0;const ib=Number(p.a===a?p.interesseB:p.interesseA)||0;const trust=Math.min(Number(p.confiancaA==null?50:p.confiancaA),Number(p.confiancaB==null?50:p.confiancaB));
   if(estado==='namoro')return Math.random()<.72?{tipo:'conversa_autonoma_positiva',texto:a+' e '+b+' reservaram um momento para conversar e fortalecer o vínculo.'}:{tipo:'conversa_autonoma_tensa',texto:a+' e '+b+' tiveram uma conversa séria; o assunto ainda precisa ser esclarecido.'};
   if(estado==='crise')return {tipo:'conversa_autonoma_crise',texto:a+' e '+b+' tiveram uma oportunidade de conversar sobre o que aconteceu, sem garantia de reconciliação.'};
   if(estado==='terminado')return {tipo:'conversa_autonoma_pos_termino',texto:a+' e '+b+' trocaram algumas palavras após o fim do relacionamento, mantendo limites e sentimentos próprios.'};
   if(ia>=35&&ib>=35)return {tipo:'conversa_autonoma_aproximacao',texto:a+' e '+b+' tiveram uma conversa agradável; isso não confirma namoro nem revela sentimentos a terceiros.'};
   return {tipo:'conversa_autonoma_neutra',texto:a+' e '+b+' conversaram brevemente e continuam se conhecendo.'};
  }
  if(amizadeConhecida(a,b))return {tipo:'conversa_autonoma_amizade',texto:a+' e '+b+' conversaram como amigas e compartilharam um momento de apoio.'};
  return {tipo:'conversa_autonoma_neutra',texto:a+' e '+b+' trocaram uma conversa casual. A relação entre eles não foi presumida como amizade ou romance.'};
 }
 function processarDia(){const hoje=dia();if(ultimoDia===hoje)return;const s=state();if(s.diaProcessado===hoje){ultimoDia=hoje;return}ultimoDia=hoje;s.diaProcessado=hoje;save(s);
  // Limite diário: até duas conversas entre NPCs, escolhidas apenas entre pares com vínculo registrado
  // ou a amizade explicitamente definida. Nenhum relacionamento é criado automaticamente.
  const candidatos=[];const vistos=new Set();
  romance().forEach(p=>{if(!NPCS.includes(p.a)||!NPCS.includes(p.b))return;const key=[p.a,p.b].sort().join('|');if(!vistos.has(key)){vistos.add(key);candidatos.push([p.a,p.b])}});
  AMIZADES.forEach(p=>{const key=p.slice().sort().join('|');if(!vistos.has(key)){vistos.add(key);candidatos.push(p.slice())}});
  if(!candidatos.length)return;
  // Ordem determinística por dia para evitar repetição e facilitar depuração.
  let seed=hoje*7919;for(const c of candidatos)seed=(seed*31+c[0].length*7+c[1].length)%2147483647;
  const start=Math.abs(seed)%candidatos.length;const total=Math.min(2,candidatos.length);
  for(let i=0;i<total;i++){const [a,b]=candidatos[(start+i)%candidatos.length];const ev=montarEvento(a,b);emitir(ev.tipo,[a,b],ev.texto)}
 }
 function render(){const caixa=document.getElementById('abaRelacionamento');if(!caixa)return;const old=caixa.querySelector('[data-v71-conversas]');if(old)old.remove();const s=state();const wrap=el('section');wrap.dataset.v71Conversas='true';wrap.className='relacao-card';wrap.style.cssText='margin:12px 0;padding:12px;border:2px solid #9b7a43;background:#29251d;color:#f4e8c9';wrap.append(el('h3','💬 CONVERSAS AUTÔNOMAS — V71'));wrap.append(el('p','Os registros mostram conversas sociais simuladas entre pares conhecidos. O sistema não move sprites nem inventa amizades, namoro ou segredos. Até duas conversas podem ser registradas por dia do jogo.'));
  const lista=s.eventos.slice(0,6);if(!lista.length)wrap.append(el('p','As conversas aparecerão quando houver pares elegíveis e o dia do jogo avançar.'));lista.forEach(e=>wrap.append(el('p','Dia '+e.dia+' · '+e.pessoas.join(' e ')+' — '+e.texto)));caixa.append(wrap)}
 function boot(){processarDia();render();const btn=document.getElementById('abaBtnRelacionamento');if(btn)btn.addEventListener('click',()=>setTimeout(render,30));setInterval(()=>{if(dia()!==ultimoDia)processarDia()},5000);}
 window.conversasAutonomasV71={processarDia,render,consultar:()=>state().eventos.slice()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
