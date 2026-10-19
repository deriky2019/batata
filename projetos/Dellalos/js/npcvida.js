/* =====================================================
   npcvida.js - NPCs mais vivos (v55)
   1) ROTINA POR HORA DO DIA: manhã / tarde / entardecer / noite (ciclo de js/ciclo.js, dias 2 a 9).
      Muda velocidade, descanso, quanto o NPC se afasta e se ele viaja entre regiões. À noite quase todo
      mundo fica sonolento e alguns NPCs (lista recolheNoite) vão dormir e somem; as "corujas" seguem normais.
   2) REAÇÃO À ROUPA: ao conversar, o NPC comenta a roupa do armário (1 vez por roupa, por NPC, por dia).
   3) HUMOR DO DIA: cada NPC acorda com um humor (animado, normal, cansado, irritado, triste, assustado),
      que depende do dia, da chuva, da personalidade e da relação com a Dellalos (js/relacoes.js, js/amizade.js).
      O humor muda o ritmo, as conversas entre NPCs e a primeira fala do dia. Um emoji aparece perto do NPC.
   Nada aqui muda missões, itens ou a história: só comportamento e falas extras ANTES da conversa normal.
   Estado salvo em diario.escolhas.npcvida (zera a cada dia).

   v56:
   4) ROTINA COM DESTINO: NPCs listados em NPC_VIDA_ROTINAS vão a lugares de verdade conforme a hora
      (banco, praça, correio, margem do lago...), seguindo um caminho achado pelo mapa (BFS em tiles).
      Chegando, ficam por ali (passeio curto) até a hora mudar. Só vale com o ciclo ligado (dias 2 a 14).
   5) PROMESSAS: depois de conversar, o NPC às vezes pede para a Dellalos voltar no dia seguinte.
      Se ela volta e conversa no dia combinado: ele agradece e a confiança sobe. Se não volta: ele cobra
      na próxima conversa, a confiança cai, o ressentimento sobe e o humor dele piora (js/relacoes.js).
      Guardado em diario.escolhas.promessas (a lista fica até 20 itens).
   ===================================================== */

// ----- Personalidade (opcional por nome). humor: pesos extras; coruja: ativo à noite; recolheNoite: dorme e some à noite
const NPC_VIDA_PERFIL = {
  Nathalia: { humor: { animado: 1.5 } },
  Millena:  { humor: { animado: 1.5 } },
  Vitinho:  { humor: { animado: 2 } },
  Lucas:    { humor: { normal: 2, cansado: 1 }, coruja: true },
  Simon:    { humor: { cansado: 1, normal: 1 } },
  Deriky:   { humor: { normal: 1.5 }, coruja: true },
  Veras:    { humor: { irritado: 1, animado: -0.5 } },
  Pescador: { coruja: true },
  "Dona Rosa": { recolheNoite: true },
  Mateus:   { recolheNoite: true },
  Lia:      { recolheNoite: true },
  Samuel:   { recolheNoite: true },
  Clarice:  { recolheNoite: true }
};
const NPC_VIDA_SEM_REACAO = ["Isabela", "IsabelaConvite", "Thaina", "Mariane", "Mariana", "Caos", "Zé", "Durval", "Amigo do papai", "Sentinela", "Guardião do altar", "Necro", "Bolinha"];
const NPC_VIDA_REGIOES = ["estrada", "bairro_sul", "bairro_sul2", "zona_leste", "zona_leste2", "zona_norte", "zona_norte2", "zona_oeste"];

// ----- Estado do dia -----
function npcVidaEstado() {
  let e = diario.escolhas.npcvida;
  if (!e || typeof e !== "object" || e.dia !== diaAtual()) { e = diario.escolhas.npcvida = { dia: diaAtual(), humor: {}, visto: {} }; npcVidaVencerPromessas(); }
  if (!e.humor) e.humor = {};
  if (!e.visto) e.visto = {};
  return e;
}
function npcVidaHash(txt) {
  let h = 2166136261;
  for (let i = 0; i < txt.length; i++) { h ^= txt.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) / 4294967296;
}
function npcVidaNoExterior() {
  const id = typeof idDaCena === "function" && cenaAtual ? idDaCena(cenaAtual) : "";
  return NPC_VIDA_REGIOES.includes(id);
}

// ----- 1) Hora do dia -----
function npcVidaPeriodo() {
  if (!cicloValido()) return "tarde";
  const t = cicloT(), C = CONFIG.ciclo;
  if (t >= C.dia) return "noite";
  if (t < C.dia * 0.36) return "manha";
  if (t < C.dia * 0.73) return "tarde";
  return "entardecer";
}
const NPC_VIDA_PERIODO = {
  manha:      { vel: 1.1, desc: 0.85, raio: 1,    viagem: 1.2 },
  tarde:      { vel: 1,   desc: 1,    raio: 1,    viagem: 1 },
  entardecer: { vel: 0.9, desc: 1.1,  raio: 0.7,  viagem: 0.6 },
  noite:      { vel: 0.6, desc: 2,    raio: 0.35, viagem: 0.15 }
};
function npcVidaCoruja(n) { return !!(NPC_VIDA_PERFIL[n.nome] && NPC_VIDA_PERFIL[n.nome].coruja) || n.coruja === true; }
function npcRecolhido(n) {
  if (!n || n._rota || n._torneioFighter) return false;
  const p = NPC_VIDA_PERFIL[n.nome];
  if (!(p && p.recolheNoite) && !n.recolheNoite) return false;
  if (n.recolheNoite === false) return false;
  return cicloEhNoite() && npcVidaNoExterior();
}

// ----- 3) Humor -----
const NPC_VIDA_HUMORES = {
  animado:   { vel: 1.15, desc: 0.8, soc: 0.7, icone: "😊" },
  normal:    { vel: 1,    desc: 1,   soc: 1,   icone: "" },
  cansado:   { vel: 0.75, desc: 1.6, soc: 1.3, icone: "😴" },
  irritado:  { vel: 1.1,  desc: 1,   soc: 1.8, icone: "😠" },
  triste:    { vel: 0.7,  desc: 1.5, soc: 1.4, icone: "😢" },
  assustado: { vel: 1.2,  desc: 0.7, soc: 1.5, icone: "😨" }
};
function npcVidaSocial(nome) {            // lê sem criar registros novos
  const r = diario.escolhas.relacoes;
  return (r && r.social && r.social.pessoas && r.social.pessoas[nome]) || null;
}
function npcHumor(nome) {
  const e = npcVidaEstado();
  if (e.humor[nome]) return e.humor[nome];
  const pesos = { animado: 2, normal: 5, cansado: 1.5, irritado: 1, triste: 1, assustado: 0.4 };
  const soma = (k, v) => { pesos[k] = Math.max(0, (pesos[k] || 0) + v); };
  const perfil = NPC_VIDA_PERFIL[nome] || {};
  for (const k in (perfil.humor || {})) soma(k, perfil.humor[k]);
  const dia = diaAtual();
  if (typeof climaChuva !== "undefined" && climaChuva.ativa) { soma("triste", 1.5); soma("animado", -1.2); }
  if (dia >= 4) { soma("assustado", 0.4 * (Math.min(dia, 9) - 3)); soma("irritado", 0.15 * (Math.min(dia, 9) - 3)); }
  if (dia >= 12) { soma("assustado", 2); soma("irritado", 1); soma("animado", -1.5); }
  const p = npcVidaSocial(nome);
  if (p) {
    if (p.ressentimento >= 40) { soma("irritado", 4); soma("triste", 2); soma("animado", -2); }
    else if (p.ressentimento >= 20) soma("irritado", 2);
    if (p.ciumes >= 65) soma("irritado", 3);
    if (p.confianca >= 75) soma("animado", 1);
  }
  try { if (typeof amizadeNivel === "function" && amizadeNivel(nome) >= 3) soma("animado", 1.5); } catch (_) { }
  let total = 0; for (const k in pesos) total += pesos[k];
  let r = npcVidaHash(nome + "|" + dia + "|humor") * total, escolhido = "normal";
  for (const k in pesos) { r -= pesos[k]; if (r <= 0) { escolhido = k; break; } }
  e.humor[nome] = escolhido;
  return escolhido;
}

// ----- Fatores combinados (hora do dia + humor) -----
function npcVidaFator(n) {
  let per = NPC_VIDA_PERIODO[npcVidaPeriodo()];
  if (npcVidaCoruja(n) && npcVidaPeriodo() === "noite") per = NPC_VIDA_PERIODO.tarde;
  const hum = NPC_VIDA_HUMORES[npcHumor(n.nome)] || NPC_VIDA_HUMORES.normal;
  const f = { vel: per.vel * hum.vel, desc: per.desc * hum.desc, raio: per.raio, viagem: per.viagem, soc: hum.soc };
  if (npcVidaRotina(n)) {                       // tem destino na hora: não sai viajando e, ao chegar, fica por perto
    f.viagem *= 0.25;
    if (n._vidaChegou) { f.raio *= 0.4; f.desc *= 1.4; }
    else if (n._vidaEmRota) f.vel = Math.max(f.vel, 0.85);   // a caminho: nem o sono deixa ele parar no meio
  }
  return f;
}
function npcVidaAjustarAndar(n, base) {
  if (!base || ((base.raioX || 0) <= 0 && (base.raioY || 0) <= 0)) return base;
  const f = npcVidaFator(n);
  return Object.assign({}, base, { velocidade: (base.velocidade || 55) * f.vel, raioX: (base.raioX || 0) * f.raio, raioY: (base.raioY || 0) * f.raio });
}

// ----- Conversas entre NPCs conforme o humor e a hora -----
const NPC_VIDA_FALAS_SOCIAIS = {
  tensa: [
    ["Hoje eu não estou para brincadeira.", "Calma. Eu só passei para dar um oi."],
    ["Você sempre aparece na hora errada.", "E você sempre acorda de mau humor. Vamos respirar."]
  ],
  animada: [
    ["Dia lindo, né? Dá vontade de fazer alguma coisa!", "Só você mesmo para ficar assim tão animado!"],
    ["Hoje tudo parece dar certo!", "Então aproveita. Dias assim valem ouro."]
  ],
  consolo: [
    ["Você está meio quieto hoje. Quer conversar?", "Obrigado por perguntar. Só estou com a cabeça cheia."],
    ["Se precisar de alguém para ouvir, estou aqui.", "Eu sei. Já ajuda saber disso."]
  ],
  medo: [
    ["Você também sente que tem algo errado no ar?", "Sinto. Melhor ficarmos de olho em tudo."],
    ["Ouvi uns barulhos estranhos ontem.", "Eu também. Não saia sozinho por aí."]
  ],
  sono: [
    ["Nem dormi direito. Preciso de um café.", "Eu também. Hoje o dia vai se arrastar."],
    ["Estou bocejando desde cedo...", "O bocejo é contagioso, olha só."]
  ],
  noite: [
    ["Está tão silencioso a esta hora.", "Eu prefiro assim. Dá para pensar com calma."],
    ["Não deveríamos estar na rua tão tarde.", "Só mais um pouco. Depois eu volto para casa."]
  ]
};
function npcVidaFalasSociais(a, b) {
  if (Math.random() > 0.6) return null;
  const ha = npcHumor(a.nome), hb = npcHumor(b.nome);
  let grupo = null;
  if (ha === "irritado" || hb === "irritado") grupo = "tensa";
  else if (ha === "assustado" || hb === "assustado") grupo = "medo";
  else if (ha === "triste" || hb === "triste") grupo = "consolo";
  else if (npcVidaPeriodo() === "noite") grupo = "noite";
  else if (ha === "cansado" || hb === "cansado") grupo = "sono";
  else if (ha === "animado" && hb === "animado") grupo = "animada";
  if (!grupo) return null;
  const lista = NPC_VIDA_FALAS_SOCIAIS[grupo];
  return lista[Math.floor(Math.random() * lista.length)];
}
function npcVidaFatorSocial(n) { return npcVidaFator(n).soc; }

// ----- 2) Roupa + humor: falas extras ANTES da conversa normal -----
const NPC_VIDA_ROUPA_GERAL = {
  academia:     ["Foi treinar? Essa roupa de academia combina com você.", "Roupa de treino hoje? Dá até vontade de correr junto."],
  academia2:    ["Esse conjunto de academia ficou bom. Parece pronta para a ação.", "Roupa de treino de novo? Está levando a sério, hein."],
  azul:         ["O azul ficou muito bem em você.", "Gostei desse azul. Combina com seu jeito."],
  branco:       ["De branco hoje? Bem leve, gostei.", "Esse branco está bem chamativo. Cuidado com a sujeira!"],
  brasil:       ["Camisa do Brasil! Está torcendo por quem hoje?", "Olha só, toda de verde e amarelo! Muito bom."],
  vermelho:     ["De vermelho? Impossível não notar você.", "Esse vermelho dá energia só de olhar."],
  vestidopreto: ["Vestido preto? Aconteceu alguma coisa, ou é só estilo?", "Esse preto ficou elegante. Parece que vai a algum lugar importante."]
};
const NPC_VIDA_ROUPA_PESSOAL = {
  Nathalia: { vestidopreto: "Esse vestido ficou lindo em você... quer dizer, ficou bom, sim.", azul: "Azul combina com você. Sempre achei." },
  Millena:  { brasil: "Camisa do Brasil! Se tiver jogo, me avisa que eu vou junto!", academia: "Academia? Depois você me ensina o que anda fazendo." },
  Lucas:    { academia: "Roupa de treino. Aprovo.", academia2: "Esse conjunto é de quem treina de verdade." },
  Vitinho:  { brasil: "Eita! Camisa do Brasil! Hoje tem torcida!", vermelho: "Vermelho? Parece até mascote de time, kkk." },
  Simon:    { academia: "Tá pronta pro treino, hein? Bora treinar.", academia2: "Esse é o uniforme oficial de treino? Bora." },
  Deriky:   { vestidopreto: "Preto... espero que não seja por causa do que conversamos." },
  Veras:    { branco: "Branco? Eu apostava que você ia sujar até o fim do dia." }
};
const NPC_VIDA_ROUPA_IRRITADO = [
  "Roupa nova... tá bom. Hoje eu não estou com paciência para elogios.",
  "Trocou de roupa? Que ótimo. Agora fala logo o que quer."
];
const NPC_VIDA_HUMOR_FALA = {
  animado:   ["Hoje acordei com o pé direito!", "Que dia bom! Estou com a energia lá em cima."],
  cansado:   ["Ai... hoje estou sem energia nenhuma.", "Dormi mal. Fala devagar que eu ainda estou acordando."],
  irritado:  ["Hoje não é um bom dia para mim. Seja rápida.", "Estou de mau humor, então... fala logo."],
  triste:    ["Estou meio para baixo hoje, mas pode falar.", "Hoje o dia está pesado... mas vamos lá."],
  assustado: ["Estou com os nervos à flor da pele. Tem algo estranho no ar.", "Desculpa se pareço agitado. Não consigo relaxar hoje."]
};
const NPC_VIDA_MAGOADO = "Ainda não esqueci o que aconteceu entre a gente. Mas pode falar.";

function npcVidaEscolha(lista, chave) { return lista[Math.floor(npcVidaHash(chave) * lista.length)]; }

// Monta as falas extras (ou [] se não houver nada a dizer agora)
function npcVidaFalasAntes(npc) {
  const nome = npc.nome;
  if (NPC_VIDA_SEM_REACAO.includes(nome) || !npc._pronto) return [];
  const e = npcVidaEstado();
  const v = e.visto[nome] || (e.visto[nome] = {});
  const humor = npcHumor(nome);
  const falas = [];
  let temPromessa = false;
  for (const f of npcVidaPromessasAoConversar(nome)) { falas.push(f); temPromessa = true; }
  const roupa = typeof roupaAtualId === "function" ? roupaAtualId() : "verde";
  if (roupa !== "verde" && v.roupa !== roupa) {
    v.roupa = roupa;
    let texto = NPC_VIDA_ROUPA_PESSOAL[nome] && NPC_VIDA_ROUPA_PESSOAL[nome][roupa];
    if (humor === "irritado") texto = npcVidaEscolha(NPC_VIDA_ROUPA_IRRITADO, nome + roupa + diaAtual());
    else if (!texto && NPC_VIDA_ROUPA_GERAL[roupa]) texto = npcVidaEscolha(NPC_VIDA_ROUPA_GERAL[roupa], nome + roupa + diaAtual());
    if (texto) falas.push({ quem: nome, texto: texto });
  }
  if (humor !== "normal" && !v.humor && !temPromessa) {
    v.humor = true;
    const p = npcVidaSocial(nome);
    const texto = p && p.ressentimento >= 20 ? NPC_VIDA_MAGOADO : npcVidaEscolha(NPC_VIDA_HUMOR_FALA[humor], nome + humor + diaAtual());
    falas.push({ quem: nome, texto: texto });
  }
  return falas;
}

// Usado por interacoes.js no lugar de npc.conversar()
function npcConversarComPrelude(npc) {
  let falas = [];
  try { if (!dialogoAberto) falas = npcVidaFalasAntes(npc); } catch (err) { console.warn("npcvida:", err); }
  if (falas.length) abrirDialogo(falas, function () { npcVidaConversarEDepois(npc); });
  else npcVidaConversarEDepois(npc);
}
// Roda a conversa normal e, quando ela termina, talvez o NPC peça uma promessa
function npcVidaConversarEDepois(npc) {
  npc.conversar();
  if (!dialogoAberto) return;
  const anterior = dialogoAoTerminar;
  dialogoAoTerminar = function () {
    if (anterior) anterior();
    try { npcVidaOferecerPromessa(npc); } catch (err) { console.warn("npcvida promessa:", err); }
  };
}

// ----- Emoji de humor perto do NPC (só quando a Dellalos está por perto) -----
(function () {
  const desenharOriginal = desenharNpc;
  desenharNpc = function (n) {
    desenharOriginal(n);
    try {
      if (n === undefined || n.desenharCustom || dialogoAberto || !jogador) return;
      if (NPC_VIDA_SEM_REACAO.includes(n.nome) || !npcAtivo(n)) return;
      if (Math.hypot(n.x - jogador.x, n.y - jogador.y) > 170) return;
      const icone = (NPC_VIDA_HUMORES[npcHumor(n.nome)] || {}).icone;
      if (!icone) return;
      const h = n.altura || CONFIG.alturaPersonagem, topo = n.y - h * CONFIG.sprite.pes - 6 + Math.sin(performance.now() / 400) * 2;
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath(); ctx.arc(n.x, topo - 14, 20, 0, Math.PI * 2); ctx.fill();
      ctx.font = "26px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(icone, n.x, topo - 13);
      ctx.restore();
    } catch (_) { }
  };
})();

// ----- Ganchos nos NPCs: presença (recolhidos à noite) e passeio por hora/humor -----
(function () {
  const ativoOriginal = npcAtivo;
  npcAtivo = function (n) { return ativoOriginal(n) && !npcRecolhido(n); };
  const andarOriginal = configuracaoAndarLivreNpc;
  configuracaoAndarLivreNpc = function (n) { return npcVidaAjustarAndar(n, andarOriginal(n)); };
})();


/* =====================================================
   v56 - 4) ROTINA COM DESTINO
   NPC_VIDA_ROTINAS["id_da_cena:Nome"] = { manha: [x, y], tarde: [x, y], entardecer: [x, y], noite: [x, y] }  (em TILES)
   O ponto é uma âncora: o NPC vai ao tile livre ALCANÇÁVEL mais perto dela (até 6 tiles). Se não houver, ele ignora.
   ===================================================== */
const NPC_VIDA_ROTINAS = {
  // Estrada (64 x 40): lago a sudeste, bancos em (20,26) (48,26) (42,19) (16,19), correios em (11,17) (29,17)
  "estrada:Pescador":   { manha: [42, 32], tarde: [48, 29], entardecer: [47, 27], noite: [42, 32] },
  "estrada:Dona Rosa":  { manha: [46, 19], tarde: [29, 18], entardecer: [20, 27], noite: [46, 19] },
  "estrada:Clarice":    { manha: [4, 35],  tarde: [12, 30], entardecer: [20, 27], noite: [4, 35] },
  // Bairro Sul (48 x 40): praça com fonte x 31-45 y 20-24; jardim da Helena x 2-17 y 33-36; terreno do Pedro x 30-46 y 33-36
  "bairro_sul:Dona Lúcia":  { manha: [8, 10],  tarde: [22, 19], entardecer: [36, 21], noite: [8, 10] },
  "bairro_sul:Seu Augusto": { manha: [36, 10], tarde: [31, 22], entardecer: [40, 22], noite: [36, 10] },
  "bairro_sul:Helena":      { manha: [9, 34],  tarde: [4, 34],  entardecer: [18, 32], noite: [9, 34] },
  "bairro_sul:Pedro":       { manha: [32, 34], tarde: [44, 34], entardecer: [36, 22], noite: [32, 34] }
};

function npcVidaRotina(n) {
  if (!n || !n.nome || !cicloValido() || !cenaAtual) return null;
  const id = typeof idDaCena === "function" ? idDaCena(cenaAtual) : "";
  const r = NPC_VIDA_ROTINAS[id + ":" + n.nome];
  return r ? (r[npcVidaPeriodo()] || null) : null;
}

// Caminho em tiles do ponto atual até o tile livre alcançável mais próximo da âncora.
// Devolve [] se ele já está lá, null se não há onde ir, ou uma lista de pontos {x, y} em pixels.
function npcVidaCaminho(n, alvoC, alvoR) {
  const m = cenaAtual.mapa, W = m.cols, H = m.rows;
  const px = (c, r) => ({ x: c * TILE + TILE / 2, y: r * TILE + 58 });
  const ok = (c, r) => { if (c < 1 || r < 2 || c > W - 2 || r > H - 2) return false; const p = px(c, r); return npcLivre(n, p.x, p.y); };
  const c0 = Math.max(1, Math.min(W - 2, Math.floor(n.x / TILE))), r0 = Math.max(2, Math.min(H - 2, Math.floor(n.y / TILE)));
  const pai = new Map(), chave = (c, r) => r * W + c;
  pai.set(chave(c0, r0), -1);
  const fila = [[c0, r0]]; let melhor = [c0, r0], dMelhor = Math.hypot(c0 - alvoC, r0 - alvoR);
  for (let i = 0; i < fila.length; i++) {
    const [c, r] = fila[i];
    const d = Math.hypot(c - alvoC, r - alvoR);
    if (d < dMelhor) { dMelhor = d; melhor = [c, r]; if (d === 0) break; }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr, k = chave(nc, nr);
      if (pai.has(k) || !ok(nc, nr)) continue;
      pai.set(k, chave(c, r));
      fila.push([nc, nr]);
    }
  }
  if (dMelhor > 6) return null;                           // âncora fora do alcance: ignora
  if (melhor[0] === c0 && melhor[1] === r0) return [];    // já está lá
  const cadeia = []; let k = chave(melhor[0], melhor[1]);
  while (k !== -1) { cadeia.push([k % W, Math.floor(k / W)]); k = pai.get(k); }
  cadeia.reverse();                                       // do tile atual até o destino
  const pts = [];                                         // guarda só as curvas e o fim
  for (let i = 0; i < cadeia.length; i++) {
    const a = cadeia[i - 1], b = cadeia[i], c = cadeia[i + 1];
    if (i === 0 || i === cadeia.length - 1 || (b[0] - a[0] !== c[0] - b[0]) || (b[1] - a[1] !== c[1] - b[1])) pts.push(px(b[0], b[1]));
  }
  return pts;
}

function npcVidaEscolherDestino(n, original) {
  const alvo = npcVidaRotina(n);
  if (!alvo) {
    if (n._vidaPeriodo) { n._vidaPeriodo = null; n._vidaCaminho = null; n._vidaEmRota = false; n._vidaChegou = false; }
    return original(n);
  }
  const per = npcVidaPeriodo();
  if (n._vidaPeriodo !== per) { n._vidaPeriodo = per; n._vidaCaminho = null; n._vidaEmRota = false; n._vidaChegou = false; n._vidaFalhas = 0; }
  if (n._vidaCaminho && n._vidaCaminho.length) { n._saidaViagem = null; n._vidaEmRota = true; return n._vidaCaminho.shift(); }
  if (n._vidaEmRota) { n._vidaEmRota = false; n._vidaChegou = true; n._x0 = n.x; n._y0 = n.y; }   // chegou: passeia por ali
  if (!n._vidaChegou) {
    if ((n._vidaFalhas || 0) >= 3) { n._vidaChegou = true; }       // travou demais neste período: desiste
    else {
      const p = npcVidaCaminho(n, alvo[0], alvo[1]);
      if (p && p.length) { n._vidaCaminho = p; n._saidaViagem = null; n._vidaEmRota = true; return n._vidaCaminho.shift(); }
      n._vidaChegou = true; n._x0 = n.x; n._y0 = n.y;               // já estava lá, ou não há caminho
    }
  }
  return original(n);
}
(function () {
  const original = escolherDestinoNpc;
  escolherDestinoNpc = function (n) { return npcVidaEscolherDestino(n, original); };
})();

/* =====================================================
   v56 - 5) PROMESSAS
   diario.escolhas.promessas = [{ id, nome, dia, prazo, status: "aberta" | "cumprida" | "quebrada", cobrada }]
   ===================================================== */
const NPC_VIDA_PROMESSA_PEDIDOS = {
  animado:   ["Amanhã eu tenho uma novidade! Você passa aqui para ouvir?", "Hoje foi um dia tão bom... Volta amanhã para a gente conversar mais?"],
  normal:    ["Passa por aqui amanhã? Quero conversar com mais calma.", "Se puder, volta amanhã. Ainda tem assunto que ficou no ar."],
  cansado:   ["Hoje estou sem cabeça. Dá para você voltar amanhã?", "Passa aqui amanhã, quando eu estiver mais descansado."],
  triste:    ["Hoje o dia está pesado... você poderia voltar amanhã, para me fazer companhia?", "Queria ter alguém por perto amanhã. Você volta?"],
  assustado: ["Fico mais tranquilo quando você aparece. Volta amanhã, por favor?", "Com tudo isso acontecendo... passa aqui amanhã, para eu saber que está tudo bem?"]
};
const NPC_VIDA_PROMESSA_SIM = ["Combinado, eu volto amanhã.", "Pode deixar, amanhã eu passo aqui."];
const NPC_VIDA_PROMESSA_NAO = "Não prometo nada.";
const NPC_VIDA_PROMESSA_CUMPRIDA = ["Você veio! Eu sabia que podia contar com você.", "Você cumpriu o combinado. Obrigado por isso.", "Que bom que apareceu. Hoje o dia fica melhor."];
const NPC_VIDA_PROMESSA_QUEBRADA = ["Você disse que voltaria... eu esperei.", "Ontem você prometeu aparecer. Não vou fingir que isso não me chateou.", "Promessa é promessa. Fiquei esperando e você não veio."];

function npcVidaListaPromessas() {
  if (!Array.isArray(diario.escolhas.promessas)) diario.escolhas.promessas = [];
  return diario.escolhas.promessas;
}
function npcVidaAjustarRelacao(nome, conf, ress, motivo) {
  try { if (typeof relacaoAjustarSocial === "function") relacaoAjustarSocial(nome, { confianca: conf, ressentimento: ress }, motivo); } catch (_) { }
}

// Ao virar o dia: promessas abertas com prazo vencido viram "quebradas" (a cobrança vem na próxima conversa)
function npcVidaVencerPromessas() {
  const lista = npcVidaListaPromessas(), dia = diaAtual();
  for (const p of lista) {
    const graca = (typeof arvoreTem === "function" && arvoreTem("palavra")) ? 1 : 0;   // árvore: Palavra firme (+1 dia de prazo)
    if (p.status !== "aberta" || dia <= p.prazo + graca) continue;
    p.status = "quebrada";
    npcVidaAjustarRelacao(p.nome, -10, (typeof arvoreTem === "function" && arvoreTem("coracao")) ? 5 : 10, "Prometeu voltar e não apareceu");   // árvore: Coração aberto (mágoa 50% menor)
    try { if (typeof amizadeGanhar === "function") amizadeGanhar(p.nome, -2, "promessa_quebrada_" + p.id, true); } catch (_) { }
  }
}

// Lembrete de manhã: quem ela prometeu visitar hoje
function npcVidaLembretePromessas() {
  const hoje = npcVidaListaPromessas().filter((p) => p.status === "aberta" && p.prazo === diaAtual()).map((p) => p.nome);
  if (!hoje.length) return;
  setTimeout(function () { if (typeof mostrarMensagem === "function") mostrarMensagem("Hoje você prometeu voltar a falar com " + hoje.join(" e ") + "."); }, 3200);
}

// Falas antes da conversa: agradecimento (cumpriu) ou cobrança (quebrou)
function npcVidaPromessasAoConversar(nome) {
  npcVidaEstado();                                    // garante que as promessas vencidas já foram marcadas
  const falas = [];
  for (const p of npcVidaListaPromessas()) {
    if (p.nome !== nome) continue;
    if (p.status === "aberta" && diaAtual() >= p.prazo) {
      p.status = "cumprida";
      npcVidaAjustarRelacao(nome, 8, -4, "Cumpriu a promessa de voltar");
      try { if (typeof amizadeGanhar === "function") amizadeGanhar(nome, 2, "promessa_cumprida_" + p.id, true); } catch (_) { }
      falas.push({ quem: nome, texto: npcVidaEscolha(NPC_VIDA_PROMESSA_CUMPRIDA, nome + p.id + "ok") });
    } else if (p.status === "quebrada" && !p.cobrada) {
      p.cobrada = true;
      falas.push({ quem: nome, texto: npcVidaEscolha(NPC_VIDA_PROMESSA_QUEBRADA, nome + p.id + "quebra") });
    }
  }
  return falas;
}

// Depois da conversa: o NPC às vezes pede para ela voltar amanhã
function npcVidaOferecerPromessa(npc) {
  const nome = npc.nome, dia = diaAtual();
  if (NPC_VIDA_SEM_REACAO.includes(nome) || dialogoAberto || transicao || telaTempo) return;
  if (dia < 2 || dia > DIA_FINAL - 2 || !historia.novoDia || noiteAtiva()) return;
  const e = npcVidaEstado(), v = e.visto[nome] || (e.visto[nome] = {});
  if (v.pediu) return;                                           // no máximo um pedido por NPC por dia
  const lista = npcVidaListaPromessas();
  if (lista.some((p) => p.nome === nome && p.status === "aberta")) return;
  if (lista.filter((p) => p.status === "aberta").length >= 2) return;
  const humor = npcHumor(nome);
  if (humor === "irritado" || !NPC_VIDA_PROMESSA_PEDIDOS[humor]) return;
  if (npcVidaHash(nome + "|" + dia + "|promessa") > 0.3) return;   // ~30% dos NPCs, fixo por dia
  v.pediu = true;
  const id = dia + "_" + nome.replace(/[^a-z0-9]/gi, "");
  abrirDialogo([{
    quem: nome, texto: npcVidaEscolha(NPC_VIDA_PROMESSA_PEDIDOS[humor], nome + dia + "pedido"),
    opcoes: [
      { id: "sim", texto: npcVidaEscolha(NPC_VIDA_PROMESSA_SIM, nome + dia + "sim"),
        fn: function () {
          lista.push({ id: id, nome: nome, dia: dia, prazo: dia + 1, status: "aberta", cobrada: false });
          if (lista.length > 20) lista.splice(0, lista.length - 20);
          mostrarMensagem("Promessa: voltar a falar com " + nome + " amanhã.");
        },
        falas: [{ quem: nome, texto: "Vou ficar esperando." }] },
      { id: "nao", texto: NPC_VIDA_PROMESSA_NAO, falas: [{ quem: nome, texto: "Tudo bem. Sem pressão." }] }
    ]
  }]);
}
