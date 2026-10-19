/* Shadow of War V77 — consequências emocionais das conversas. Offline. */
(function(){
 'use strict';
 const KEY='shadowOfWar.consequenciasEmocionaisV77.v1';
 const norm=s=>String(s||'').toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
 const day=()=>{try{return typeof diaAtual==='function'?(Number(diaAtual())||1):1}catch(_){return 1}};
 function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'{"eventos":[],"dedupe":[]}');return v&&typeof v==='object'?v:{eventos:[],dedupe:[]}}catch(_){return {eventos:[],dedupe:[]}}}
 function write(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(_){}}
 function classify(q,a){const t=norm(String(q||'')+' '+String(a||''));
  if(/\b(me odeio|te odeio|idiota|burro|burra|inutil|calar a boca|nao suporto voce|nao gosto de voce|vai embora|me deixa em paz)\b/.test(norm(q)))return 'hostil';
  if(/\b(desculpa|me perdoa|perdao|foi mal|sinto muito|me arrependo)\b/.test(norm(q)))return 'desculpa';
  if(/\b(prometo|promessa|prometi|pode contar comigo|vou estar aqui)\b/.test(norm(q)))return 'promessa';
  if(/\b(segredo|confidencial|nao conta pra ninguem|so entre nos|confio em voce|pode confiar em mim)\b/.test(norm(q)))return 'confianca';
  if(/\b(triste|medo|ansioso|ansiosa|sozinho|sozinha|preocupado|preocupada|estou mal)\b/.test(norm(q)) && /\b(sinto muito|estou aqui|pode contar comigo|vou te ouvir|quero ajudar|entendo)\b/.test(norm(a)))return 'acolhimento';
  if(/\b(obrigado|obrigada|valeu|agradeco|agradeço|voce me ajudou|você me ajudou)\b/.test(norm(q)))return 'gratidao';
  return null;
 }
 function delta(tipo,q,a){const r=norm(a);const receptivo=/\b(claro|tudo bem|eu te perdoo|perdoo|aceito|pode contar comigo|estou aqui|obrigado|obrigada|tambem confio|tambem|vamos tentar|sem problema|nao tem problema|não tem problema|entendo|vou ouvir|pode confiar|prometo)\b/.test(r);
  if(tipo==='hostil')return {confianca:-3,ressentimento:5,descricao:'Uma conversa hostil abalou a confiança.'};
  if(tipo==='desculpa')return receptivo?{confianca:2,ressentimento:-4,descricao:'Um pedido de desculpas foi recebido de forma receptiva.'}:{confianca:0,ressentimento:-1,descricao:'Houve um pedido de desculpas; a mágoa ainda pode permanecer.'};
  if(tipo==='promessa')return receptivo?{confianca:2,ressentimento:0,descricao:'Uma promessa foi recebida com abertura; a confiança ainda depende de cumpri-la.'}:{confianca:1,ressentimento:0,descricao:'Uma promessa foi mencionada; ainda precisa ser cumprida.'};
  if(tipo==='confianca')return receptivo?{confianca:3,ressentimento:-1,descricao:'Uma conversa de confiança foi acolhida.'}:{confianca:1,ressentimento:0,descricao:'Uma confidência foi compartilhada, sem garantia de aceitação.'};
  if(tipo==='acolhimento')return {confianca:2,ressentimento:-1,descricao:'O NPC recebeu acolhimento durante uma conversa difícil.'};
  if(tipo==='gratidao')return {confianca:1,ressentimento:0,descricao:'Uma demonstração de gratidão fortaleceu levemente o vínculo.'};
  return null;
 }
 function aplicar(nome,q,a){if(!nome||!q||typeof relacaoAjustarSocial!=='function')return null;const tipo=classify(q,a);if(!tipo)return null;const s=read(),d=day(),key=norm(q).slice(0,160);if(!Array.isArray(s.dedupe))s.dedupe=[];if(!Array.isArray(s.eventos))s.eventos=[];
  if(s.dedupe.some(x=>x.nome===nome&&x.dia===d&&x.chave===key))return null;
  // Limita mudanças emocionais repetidas: no máximo três por personagem por dia.
  if(s.dedupe.filter(x=>x.nome===nome&&x.dia===d).length>=3)return null;
  const change=delta(tipo,q,a);if(!change)return null;
  relacaoAjustarSocial(nome,{confianca:change.confianca,ressentimento:change.ressentimento},change.descricao);
  const item={id:'v77-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),nome,dia:d,tipo,descricao:change.descricao,confianca:change.confianca,ressentimento:change.ressentimento};
  s.eventos.push(item);if(s.eventos.length>80)s.eventos.splice(0,s.eventos.length-80);s.dedupe.push({nome,dia:d,chave:key});if(s.dedupe.length>300)s.dedupe.splice(0,s.dedupe.length-300);write(s);render();return item;
 }
 function el(tag,txt){const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;return n;}
 function render(){const target=document.getElementById('abaRelacionamento');if(!target)return;let box=target.querySelector('[data-v77-emocoes]');if(box)box.remove();const s=read();if(!s.eventos.length)return;box=el('section');box.dataset.v77Emocoes='1';box.className='relacao-card';box.style.cssText='margin:12px 0;padding:12px;border:2px solid #9b7a43;background:#29251d;color:#f4e8c9';box.append(el('h3','💗 CONSEQUÊNCIAS EMOCIONAIS — V77'));box.append(el('p','As conversas importantes podem mudar gradualmente confiança e mágoa. Promessas não contam como cumpridas automaticamente; segredos não são divulgados; mudanças repetidas são limitadas.'));
  s.eventos.slice(-8).reverse().forEach(x=>{const sinais=[];if(x.confianca)sinais.push('confiança '+(x.confianca>0?'+':'')+x.confianca);if(x.ressentimento)sinais.push('mágoa '+(x.ressentimento>0?'+':'')+x.ressentimento);box.append(el('p','Dia '+x.dia+' · '+x.nome+' — '+x.descricao+(sinais.length?' ('+sinais.join(', ')+')':'')));});target.append(box);
 }
 window.consequenciasEmocionaisV77={aplicar,consultar:()=>read().eventos.slice(),render};
 function start(){render();const b=document.getElementById('abaBtnRelacionamento');if(b)b.addEventListener('click',()=>setTimeout(render,80));}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
