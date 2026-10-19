/* Shadow of War V68 — painel de vínculos sociais, dados locais/offline. */
(function(){
 'use strict';
 const NPCS=['Nathalia','Veras','Deriky','Lucas','Millena','Simon','Vitinho','Isabela','Thaina','Mariane'];
 let filtro='todos';
 const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
 function safe(fn, fallback){try{return fn();}catch(_){return fallback;}}
 function amizade(nome){return Math.max(0,Math.min(100,Number(safe(()=>typeof amizadePontos==='function'?amizadePontos(nome):0,0))||0));}
 function social(nome){return safe(()=>typeof relacaoPerfilPessoa==='function'?relacaoPerfilPessoa(nome):null,null)||{amizade:amizade(nome),confianca:50,ciumes:0,ressentimento:0,status:'Ainda estão se conhecendo',ultimoEvento:''};}
 function romance(){return safe(()=>typeof romanceListar==='function'?romanceListar():[],[]).filter(p=>p&&p.a&&p.b);}
 function percent(v){return Math.max(0,Math.min(100,Math.round(Number(v)||0)));}
 function medidor(rotulo,valor,tipo){const row=el('div','v68-medidor');row.dataset.tipo=tipo;row.append(el('span','',rotulo));const trilho=el('div','v68-trilho');const fill=el('span');fill.style.width=percent(valor)+'%';trilho.append(fill);row.append(trilho,el('span','',percent(valor)+'%'));return row;}
 function nomePar(p,n){return p.a===n?p.b:p.a;}
 function statusRomance(nome){const ps=romance().filter(p=>p.a===nome||p.b===nome);if(!ps.length)return 'Sem vínculo romântico registrado';const ordem={namoro:5,crise:4,confissao_pendente:3,interesse:2,terminado:1};ps.sort((a,b)=>(ordem[b.estado]||0)-(ordem[a.estado]||0));const p=ps[0], outro=nomePar(p,nome);const rot={namoro:'Namorando',crise:'Em crise',confissao_pendente:'Sentimentos em aberto',interesse:'Interesse registrado',terminado:'Relacionamento encerrado'};return (rot[p.estado]||'Vínculo registrado')+' · '+outro;}
 function cardPessoa(nome){const s=social(nome), d=el('details','v68-pessoa');const sum=el('summary');const left=el('span','',nome);const right=el('span','', '⌄');left.append(el('small','v68-status',s.status||'Vínculo em desenvolvimento'));sum.append(left,right);d.append(sum);
 d.append(medidor('Amizade',s.amizade,'amizade'),medidor('Confiança',s.confianca,'confianca'),medidor('Ciúmes',s.ciumes,'ciumes'),medidor('Mágoa',s.ressentimento,'mag oa'));
 const rs=romance().filter(p=>p.a===nome||p.b===nome);let interesse=0;rs.forEach(p=>{interesse=Math.max(interesse,Number(p.a===nome?p.interesseA:p.interesseB)||0)});d.append(medidor('Interesse romântico',interesse,'romance'));
 d.append(el('p','v68-detalhe','Vida amorosa: '+statusRomance(nome)));
 if(s.ultimoEvento)d.append(el('p','v68-detalhe','Último registro social: '+s.ultimoEvento));
 const rel=rs.length?rs.map(p=>({outro:nomePar(p,nome),estado:p.estado||'interesse',a:p.a===nome?p.interesseA:p.interesseB,b:p.a===nome?p.interesseB:p.interesseA})):[];
 if(rel.length){d.append(el('p','v68-detalhe','Vínculos registrados:'));rel.forEach(p=>d.append(el('p','v68-par',p.outro+' — '+String(p.estado).replaceAll('_',' ')+' (interesse: '+percent(p.a)+'% / '+percent(p.b)+'%)')));}
 else d.append(el('p','v68-detalhe','Nenhum vínculo romântico específico foi registrado para este personagem.'));
 return d;}
 function render(){const caixa=document.getElementById('abaRelacionamento');if(!caixa)return;let old=caixa.querySelector('[data-v68-painel]');if(old)old.remove();const wrap=el('section','v68-painel');wrap.dataset.v68Painel='true';wrap.append(el('h3','', '👥 PERFIS DE RELACIONAMENTO — V68'));wrap.append(el('p','v68-intro','Indicadores e vínculos conhecidos no estado salvo do jogo. Os valores são aproximados e não revelam automaticamente sentimentos secretos a outros NPCs.'));
 const filtros=el('div','v68-filtros');[['todos','Todos'],['proximos','Mais próximos'],['romance','Com vínculo romântico']].forEach(([v,t])=>{const b=el('button',filtro===v?'ativa':'',t);b.type='button';b.addEventListener('click',()=>{filtro=v;render();});filtros.append(b);});wrap.append(filtros);
 const lista=el('div','v68-lista');let nomes=NPCS.slice();if(filtro==='proximos')nomes=nomes.filter(n=>{const s=social(n);return s.amizade>=40||s.confianca>=65;});if(filtro==='romance')nomes=nomes.filter(n=>romance().some(p=>p.a===n||p.b===n));
 if(!nomes.length)lista.append(el('p','v68-vazio','Ainda não há personagens que correspondam a este filtro.'));else nomes.forEach(n=>lista.append(cardPessoa(n)));wrap.append(lista);
 const recentes=safe(()=>typeof estadoRelacoes==='function'?estadoRelacoes():null,null);if(recentes&&recentes.social&&Array.isArray(recentes.social.eventos)&&recentes.social.eventos.length){wrap.append(el('h3','', '📜 ACONTECIMENTOS SOCIAIS REGISTRADOS'));recentes.social.eventos.slice(-6).reverse().forEach(ev=>{ const linha='Dia '+(ev.dia||'?')+' · '+(ev.ator||'Alguém')+(ev.alvo?' → '+ev.alvo:'')+' — '+(ev.descricao||ev.tipo||'Acontecimento'); wrap.append(el('p','v68-par',linha)); });}
 caixa.prepend(wrap);
 }
 window.painelRelacionamentosV68={render};
 function start(){const btn=document.getElementById('abaBtnRelacionamento');if(btn)btn.addEventListener('click',()=>setTimeout(render,20));const caixa=document.getElementById('abaRelacionamento');if(caixa&& !caixa.hidden)render();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
