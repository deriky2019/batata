/* Shadow of War V72 — encontros sociais visíveis no mapa, ligados às conversas reais dos NPCs. */
(function(){
 'use strict';
 const KEY='shadowOfWar.encontrosV72.v1';
 const el=(tag,txt)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;return n};
 function ler(){let s={eventos:[]};try{s=Object.assign(s,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(_){}if(!Array.isArray(s.eventos))s.eventos=[];return s}
 function salvar(s){try{localStorage.setItem(KEY,JSON.stringify(s))}catch(_){}}
 function dia(){try{return typeof diaAtual==='function'?(Number(diaAtual())||1):1}catch(_){return 1}}
 function registrar(a,b){if(!a||!b||!a.nome||!b.nome)return;const s=ler();const ev={dia:dia(),a:a.nome,b:b.nome,local:(typeof cenaAtual!=='undefined'&&cenaAtual&&(cenaAtual.nome||cenaAtual.id))||'Local atual',hora:Date.now()};const anterior=s.eventos[0];if(anterior&&anterior.dia===ev.dia&&anterior.a===ev.a&&anterior.b===ev.b&&Date.now()-anterior.hora<30000)return;s.eventos.unshift(ev);s.eventos=s.eventos.slice(0,40);salvar(s);window._encontroVisivelV72={a,b,ate:Date.now()+5000,tipo:'conversa'};}
 function instalar(){if(typeof window.iniciarConversaEntreNpcs!=='function'||window.iniciarConversaEntreNpcs._v72)return;const original=window.iniciarConversaEntreNpcs;const wrapper=function(a,b){const r=original.apply(this,arguments);registrar(a,b);return r};wrapper._v72=true;window.iniciarConversaEntreNpcs=wrapper;}
 function desenhar(){const e=window._encontroVisivelV72;if(!e||Date.now()>e.ate||!e.a||!e.b||typeof ctx==='undefined'||typeof camera==='undefined')return;ctx.save();ctx.font='bold 16px sans-serif';ctx.textAlign='center';[[e.a,'💬'],[e.b,'💬']].forEach(([n,t])=>{if(!n||!Number.isFinite(n.x)||!Number.isFinite(n.y))return;const x=n.x-camera.x;const y=n.y-camera.y-(n.altura||48)-12;ctx.fillStyle='rgba(35,29,22,.9)';ctx.beginPath();ctx.roundRect(x-13,y-13,26,23,5);ctx.fill();ctx.fillStyle='#ffe7a3';ctx.fillText(t,x,y+4)});ctx.restore();}
 function render(){const caixa=document.getElementById('abaRelacionamento');if(!caixa)return;const old=caixa.querySelector('[data-v72-encontros]');if(old)old.remove();const s=ler();const wrap=el('section');wrap.dataset.v72Encontros='true';wrap.className='relacao-card';wrap.style.cssText='margin:12px 0;padding:12px;border:2px solid #9b7a43;background:#29251d;color:#f4e8c9';wrap.append(el('h3','🗺️ ENCONTROS VISÍVEIS — V72'));wrap.append(el('p','Quando dois NPCs conversam de verdade no mapa, o encontro fica registrado aqui. Os balões aparecem sobre os personagens durante a conversa. O registro não cria namoro nem presume sentimentos.'));if(!s.eventos.length)wrap.append(el('p','Nenhum encontro registrado ainda. Explore uma região com NPCs ativos para observar conversas espontâneas.'));s.eventos.slice(0,8).forEach(e=>wrap.append(el('p','Dia '+e.dia+' · '+e.a+' e '+e.b+' · '+e.local)));caixa.append(wrap)}
 function boot(){instalar();const btn=document.getElementById('abaBtnRelacionamento');if(btn)btn.addEventListener('click',()=>setTimeout(render,60));if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{instalar();render()});else render();}
 window.encontrosVisiveisV72={registrar,render,consultar:()=>ler().eventos.slice()};
 // O motor de desenho chama isto a cada quadro; só desenha indicadores para um encontro real ativo.
 const oldDraw=window.desenharConversasNpcs;
 if(typeof oldDraw==='function'&&!oldDraw._v72){const wrapped=function(){oldDraw.apply(this,arguments);desenhar()};wrapped._v72=true;window.desenharConversasNpcs=wrapped;}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
 setInterval(instalar,1500);
})();
