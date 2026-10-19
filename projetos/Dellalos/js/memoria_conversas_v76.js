/* Shadow of War V76 — memória contextual de conversas. Offline. */
(function(){
 'use strict';
 const KEY='shadowOfWar.memoriaContextualV76.v1';
 const norm=s=>String(s||'').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
 function read(){try{const x=JSON.parse(localStorage.getItem(KEY)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return {}}}
 function write(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch(_){}}
 function day(){try{return typeof diaAtual==='function'?(Number(diaAtual())||1):1}catch(_){return 1}}
 function classify(q,a){const t=norm(q+' '+a);let tipo='assunto';
  if(/prometo|promessa|prometi|vou estar aqui|pode contar comigo/.test(t))tipo='promessa';
  else if(/desculpa|me perdoa|perdao|foi mal|sinto muito/.test(t))tipo='desculpa';
  else if(/briguei|briga|estou com raiva|to com raiva|me magoou|magoado|magoada|nao confio/.test(t))tipo='conflito';
  else if(/gosto de voce|gosto de você|te amo|te adoro|estou apaixonad|to apaixonad|namoro|ficar comigo|beijo/.test(t))tipo='romance';
  else if(/segredo|nao conta pra ninguem|não conta pra ninguém|confidencial|so entre nos|só entre nós/.test(t))tipo='confidencia';
  else if(/medo|triste|preocupad|ansios|sozinh|feliz|animad/.test(t))tipo='emocao';
  return tipo;
 }
 function resumo(q,a,tipo){const clean=String(q||'').trim().replace(/\s+/g,' ');const snippets={promessa:'conversaram sobre uma promessa',desculpa:'houve um pedido de desculpas',conflito:'conversaram sobre um conflito',romance:'houve uma conversa romântica',confidencia:'compartilharam uma confidência',emocao:'conversaram sobre sentimentos',assunto:'conversaram sobre um assunto importante'};return (snippets[tipo]||snippets.assunto)+(clean?' (“'+clean.slice(0,100)+(clean.length>100?'…':'')+'”)':'')+'.'}
 function registrar(nome,q,a){if(!nome||!q)return null;const tipo=classify(q,a);const s=read();if(!s[nome])s[nome]=[];const d=day();const key=norm(q).slice(0,140);if(s[nome].some(x=>x.dia===d&&x.chave===key))return null;
  const item={id:'v76-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),dia:d,tipo,chave:key,resumo:resumo(q,a,tipo),pergunta:String(q).slice(0,220),resposta:String(a||'').slice(0,260),usada:false};
  s[nome].push(item);if(s[nome].length>35)s[nome]=s[nome].slice(-35);write(s);return item;
 }
 function complementar(nome,q,resposta){const t=norm(q);if(!/(lembra|promessa|desculpa|briga|conflito|segredo|contei|conversamos|falamos da outra vez|o que aconteceu entre nos|o que aconteceu entre a gente)/.test(t))return resposta;
  const s=read(), list=s[nome]||[];if(!list.length)return resposta;
  let candidatos=list.slice().reverse();const tipo=/promessa/.test(t)?'promessa':/desculpa|perdao/.test(t)?'desculpa':/briga|conflito/.test(t)?'conflito':/segredo/.test(t)?'confidencia':null;
  if(tipo)candidatos=candidatos.filter(x=>x.tipo===tipo);if(!candidatos.length)return resposta;
  const item=candidatos[0];const frase=' Também lembro que no dia '+item.dia+' '+item.resumo;
  if(norm(resposta).includes(norm(item.resumo).slice(0,30)))return resposta;return String(resposta||'').trim()+frase;
 }
 function render(){const target=document.getElementById('abaRelacionamento');if(!target)return;let box=target.querySelector('[data-v76-memoria]');if(box)box.remove();box=document.createElement('section');box.dataset.v76Memoria='1';box.className='relacao-card';box.style.cssText='margin:12px 0;padding:12px;border:2px solid #9b7a43;background:#29251d;color:#f4e8c9;font-family:inherit';const h=document.createElement('h3');h.textContent='📖 MEMÓRIA DAS CONVERSAS — V76';box.appendChild(h);const s=read();let count=0;Object.keys(s).forEach(n=>count+=(s[n]||[]).length);const note=document.createElement('p');note.textContent='Memórias locais: '+count+'. Promessas, pedidos de desculpas, conflitos, confidências e conversas emocionais/românticas podem ser retomados quando o assunto voltar. Os registros ficam neste dispositivo.';box.appendChild(note);Object.keys(s).forEach(n=>{const items=(s[n]||[]).slice(-2).reverse();if(!items.length)return;const p=document.createElement('p');p.textContent=n+': '+items.map(x=>'Dia '+x.dia+' — '+x.resumo).join(' ');box.appendChild(p)});target.appendChild(box)}
 window.memoriaConversasV76={registrar,complementar,consultar:n=>(read()[n]||[]).slice(),render};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();const b=document.getElementById('abaBtnRelacionamento');if(b)b.addEventListener('click',()=>setTimeout(render,100));
})();
