/* Shadow of War V66 — memória social, rumores e reputação offline. */
(function(){
 "use strict";
 const KEY="shadowOfWar.socialV66.v1";
 const NOMES=["Nathalia","Millena","Lucas","Isabela","Thaina","Deriky","Simon","Veras","Vitinho","Dellalos","Mariane"];
 function estado(){
  let base={eventos:[],rumores:[],reputacao:{},ultimaData:null};
  try { const raw=localStorage.getItem(KEY); if(raw) base=Object.assign(base,JSON.parse(raw)); }catch(e){}
  if(typeof diario!=="undefined"){
   diario.escolhas=diario.escolhas||{};
   if(!diario.escolhas.socialV66) diario.escolhas.socialV66=base;
   base=diario.escolhas.socialV66;
  }
  base.eventos=Array.isArray(base.eventos)?base.eventos:[]; base.rumores=Array.isArray(base.rumores)?base.rumores:[];
  base.reputacao=base.reputacao||{}; return base;
 }
 function salvar(){const d=estado(); try{localStorage.setItem(KEY,JSON.stringify(d));}catch(e){} try{if(typeof salvarJogo==="function")salvarJogo();}catch(e){} }
 function dia(){try{return typeof diaAtual==="function"?diaAtual():null}catch(e){return null}}
 function registrar(tipo, pessoas, texto, impacto){
  const d=estado(), nomes=(Array.isArray(pessoas)?pessoas:[pessoas]).filter(Boolean);
  const item={id:Date.now()+Math.random().toString(16).slice(2),dia:dia(),tipo:String(tipo||"acontecimento"),pessoas:nomes,texto:String(texto||"").slice(0,240),impacto:Number(impacto)||0,quando:Date.now()};
  d.eventos.unshift(item); d.eventos=d.eventos.slice(0,80);
  nomes.forEach(n=>{d.reputacao[n]=Math.max(-100,Math.min(100,(Number(d.reputacao[n])||0)+item.impacto));}); salvar(); return item;
 }
 function rumor(origem, destino, assunto, confianca){
  if(!origem||!destino||origem===destino||!assunto)return null;
  const d=estado(), key=[origem,destino,String(assunto).toLowerCase()].join("|");
  let r=d.rumores.find(x=>x.key===key);
  if(!r){r={key,origem,destino,assunto:String(assunto).slice(0,180),confianca:Math.max(10,Math.min(95,Number(confianca)||45)),dia:dia(),repeticoes:1,descoberto:false};d.rumores.unshift(r)}
  else {r.repeticoes++;r.confianca=Math.min(95,r.confianca+5)}
  d.rumores=d.rumores.slice(0,60); registrar("fofoca",[origem,destino],origem+" comentou com "+destino+": "+assunto,0); salvar(); return r;
 }
 function lerRumores(nome){const d=estado(); return d.rumores.filter(r=>r.destino===nome||r.destino==="todos").map(r=>Object.assign({},r));}
 function memórias(nome){return estado().eventos.filter(e=>e.pessoas.includes(nome)).slice(0,12)}
 function classificarConversa(nome, texto){
  const t=String(texto||"").toLocaleLowerCase("pt-BR"); if(!t.trim())return;
  const positivo=/(obrigad|gosto de voce|gosto de você|confio em voce|confio em você|admiro|desculpa|perdao|perdão|ajudar|legal|incrivel|incrível|foi bom|amigo|amiga|saudade)/i.test(t);
  const negativo=/(odeio|nao confio|não confio|mentiros|traidor|traidora|inutil|inútil|burro|burra|ridicul|atrapalhad|culpa sua|te odeio|afaste-se|some daqui)/i.test(t);
  const segredo=/(nao conta|não conta|segredo|entre nos|entre nós|nao diga|não diga|promete que nao|promete que não)/i.test(t);
  const romance=/(te amo|amo voce|amo você|gosto de voce|gosto de você|bonit[oa]|paquera|namor|beij|encontro romantico|encontro romântico)/i.test(t);
  if(positivo||negativo||segredo||romance){
   const impacto=negativo?-2:positivo?2:0;
   registrar(segredo?"segredo":romance?"romance":negativo?"conflito":"conversa",[nome],"Conversa com "+nome+": "+(segredo?"assunto confidencial":romance?"assunto romântico":negativo?"fala hostil":"interação positiva"),impacto);
   if(segredo) registrar("confidência",[nome],nome+" recebeu uma confidência; ela não é automaticamente conhecida por outros NPCs.",1);
  }
 }
 function renderizar(){
  const caixa=document.getElementById("abaRelacionamento"); if(!caixa)return;
  const d=estado();
  const h=document.createElement("h3");h.className="dia-titulo";h.textContent="🗣️ MEMÓRIAS SOCIAIS E FOFOCAS";caixa.appendChild(h);
  const nota=document.createElement("p");nota.className="relacao-detalhes";nota.textContent="Os rumores são registrados como relatos, não como verdades confirmadas. Segredos não são divulgados automaticamente.";caixa.appendChild(nota);
  const rumorBox=document.createElement("section");rumorBox.className="relacao-card";
  const rh=document.createElement("h4");rh.textContent="Rumores recebidos";rumorBox.appendChild(rh);
  const rs=d.rumores.filter(r=>r.destino==="Dellalos"||r.destino==="todos").slice(0,8);
  if(!rs.length){const p=document.createElement("p");p.className="relacao-detalhes";p.textContent="Nenhum rumor chegou até Dellalos ainda.";rumorBox.appendChild(p)}
  rs.forEach(r=>{const p=document.createElement("p");p.className="relacao-detalhes";p.textContent="Dia "+(r.dia==null?"—":r.dia)+" · "+r.origem+": “"+r.assunto+"” (confiabilidade estimada "+r.confianca+"%)";rumorBox.appendChild(p)});caixa.appendChild(rumorBox);
  const eh=document.createElement("h4");eh.className="dia-titulo";eh.textContent="Últimos acontecimentos";caixa.appendChild(eh);
  const eventos=d.eventos.slice(0,12); if(!eventos.length){const p=document.createElement("p");p.className="relacao-detalhes";p.textContent="As memórias sociais aparecerão conforme as conversas e eventos forem registrados.";caixa.appendChild(p)}
  eventos.forEach(e=>{const card=document.createElement("div");card.className="relacao-card";const p=document.createElement("p");p.className="relacao-detalhes";p.textContent="Dia "+(e.dia==null?"—":e.dia)+" · "+e.tipo+" · "+e.pessoas.join(", ");card.appendChild(p);const q=document.createElement("p");q.textContent=e.texto;card.appendChild(q);caixa.appendChild(card)});
 }
 window.socialV66={registrar,rumor,lerRumores,memórias,renderizar,estado,salvar};
 document.addEventListener("DOMContentLoaded",function(){
  const form=document.getElementById("iaFormulario"), sel=document.getElementById("iaPersonagem"), input=document.getElementById("iaTexto");
  if(form&&sel&&input) form.addEventListener("submit",function(){classificarConversa(sel.value,input.value)},true);
  const rel=document.getElementById("abaBtnRelacionamento"); if(rel)rel.addEventListener("click",()=>setTimeout(renderizar,0));
 });
})();
