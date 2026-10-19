/* Shadow of War V70 — integração entre conversa livre, eventos sociais e reações offline. */
(function(){
 'use strict';
 const KEY='shadowOfWar.v70.reacoes.v1';
 const MAX=40;
 const nomes=['Nathalia','Veras','Deriky','Lucas','Millena','Simon','Vitinho','Isabela','Thaina','Mariane','Dellalos'];
 const hoje=()=>{try{return typeof diaAtual==='function'?(Number(diaAtual())||1):1}catch(_){return 1}};
 const ler=()=>{try{return Object.assign({eventos:[],notificacoes:[]},JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(_){return {eventos:[],notificacoes:[]}}};
 const salvar=s=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}};
 function registrar(tipo,pessoas,texto,meta){const s=ler();const ev={id:'v70-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),dia:hoje(),tipo,pessoas:(pessoas||[]).filter(Boolean),texto:String(texto||'').slice(0,240),meta:meta||{}};s.eventos.unshift(ev);s.eventos=s.eventos.slice(0,MAX);s.notificacoes.unshift({id:ev.id,texto:ev.texto,dia:ev.dia,lido:false});s.notificacoes=s.notificacoes.slice(0,12);salvar(s);try{if(window.eventosSociaisV69&&tipo!=='conversa_livre')window.eventosSociaisV69.registrar(tipo,ev.pessoas,ev.texto)}catch(_){};return ev}
 function classificar(msg){const t=String(msg||'').toLowerCase();
  if(/te amo|gosto de você|gosto de ti|estou apaixonad|quer namorar|quer ficar comigo|tenho sentimentos/.test(t))return 'romantica';
  if(/desculpa|me perdoa|foi mal|sinto muito|errei/.test(t))return 'pedido_desculpas';
  if(/confio em você|guarde segredo|não conte|segredo/.test(t))return 'confidencia';
  if(/odeio|te odeio|não suporto|mentiroso|mentirosa|traidor|traidora|idiota|vou te machucar/.test(t))return 'hostil';
  if(/obrigad|valeu|gosto de conversar|você é legal|estou aqui por você|pode contar comigo/.test(t))return 'positiva';
  if(/quem você gosta|está namorando|está apaixonad|ciúmes|traiu|traição/.test(t))return 'relacionamento';
  return 'neutra';
 }
 function reagirConversa(nome,msg,resposta){const tipo=classificar(msg);if(tipo==='neutra')return;let txt='';
  if(tipo==='romantica')txt=nome+' recebeu uma mensagem romântica de Dellalos. A resposta depende do vínculo e da personalidade, não é uma confissão automática.';
  else if(tipo==='pedido_desculpas')txt='Dellalos pediu desculpas a '+nome+'. A mágoa pode diminuir apenas se o sistema social aceitar a reparação.';
  else if(tipo==='confidencia')txt='Dellalos falou sobre confiança ou segredo com '+nome+'. Isso não significa que o NPC conheça segredos de terceiros.';
  else if(tipo==='hostil')txt='Uma fala hostil de Dellalos com '+nome+' foi registrada como possível conflito.';
  else if(tipo==='positiva')txt='Dellalos teve uma interação positiva com '+nome+'.';
  else if(tipo==='relacionamento')txt='Dellalos perguntou sobre relacionamentos a '+nome+'. A pergunta não revela por si só sentimentos ocultos.';
  registrar('conversa_'+tipo,[nome,'Dellalos'],txt,{mensagem:String(msg).slice(0,100)});
  try{if(tipo==='hostil'&&typeof relacaoAjustarSocial==='function')relacaoAjustarSocial(nome,{ressentimento:2,confianca:-1},'Conversa hostil');
   if(tipo==='pedido_desculpas'&&typeof relacaoAjustarSocial==='function')relacaoAjustarSocial(nome,{ressentimento:-1},'Pedido de desculpas');}catch(_){}
 }
 function instalarHook(){if(typeof window.enviarMensagem!=='function'||window.enviarMensagem.__v70)return;const original=window.enviarMensagem;function wrapper(msg){let nome='';try{const s=document.querySelector('#seletorNPC, #npcSelect, select');if(s)nome=s.value||''}catch(_){};let texto=msg;try{if(!texto){const t=document.querySelector('#texto, #mensagem, textarea');texto=t&&t.value||''}}catch(_){};const result=original.apply(this,arguments);try{if(nome&&texto)reagirConversa(nome,texto,'')}catch(e){};return result}wrapper.__v70=true;window.enviarMensagem=wrapper;}
 function desenharNotificacoes(){const alvo=document.getElementById('abaRelacionamento');if(!alvo||alvo.querySelector('[data-v70-notificacoes]'))return;const s=ler();const box=document.createElement('section');box.dataset.v70Notificacoes='true';box.style.cssText='margin:12px 0;padding:10px;border:2px solid #9b7a43;background:#29251d;color:#f4e8c9;font-family:inherit';const h=document.createElement('h3');h.textContent='🔔 Reações recentes — V70';box.appendChild(h);if(!s.notificacoes.length){const p=document.createElement('p');p.textContent='As reações sociais aparecerão aqui conforme acontecerem.';box.appendChild(p)}else s.notificacoes.slice(0,5).forEach(n=>{const p=document.createElement('p');p.style.cssText='margin:6px 0;padding:6px;border-bottom:1px solid #665536';p.textContent='Dia '+n.dia+' · '+n.texto;box.appendChild(p)});alvo.prepend(box)}
 function atualizar(){instalarHook();desenharNotificacoes()}
 window.integracaoSocialV70={registrar,consultar:()=>ler().eventos.slice(),classificarMensagem:classificar,atualizar};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{atualizar();setInterval(atualizar,3000)});else{atualizar();setInterval(atualizar,3000)}
})();
