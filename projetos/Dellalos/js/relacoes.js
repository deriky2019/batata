/* =====================================================
   relacoes.js - Memória social e consequências persistentes (v49)
   Guarda escolhas de diálogo importantes no diário sem substituir nem reescrever
   a história existente. A afinidade continua usando os pontos de js/amizade.js.
   Tudo é local/offline e fica salvo em diario.escolhas.relacoes.
   ===================================================== */
function estadoRelacoes() {
  if (!diario.escolhas.relacoes || typeof diario.escolhas.relacoes !== "object") {
    diario.escolhas.relacoes = { porPessoa: {}, historico: [] };
  }
  const r = diario.escolhas.relacoes;
  if (!r.porPessoa || typeof r.porPessoa !== "object") r.porPessoa = {};
  if (!Array.isArray(r.historico)) r.historico = [];
  return r;
}

function relacaoRegistrarEscolha(fala, opcao) {
  if (!fala || !opcao) return;
  const r = estadoRelacoes();
  const envolvidos = new Set();
  if (fala.quem && fala.quem !== "Dellalos" && fala.quem !== "D") envolvidos.add(fala.quem);
  let ganho = opcao.amizade;
  if (typeof ganho === "function") { try { ganho = ganho(); } catch (_) { ganho = null; } }
  if (ganho) {
    [].concat(ganho).forEach(s => { if (s && s.quem) envolvidos.add(s.quem); });
  }
  const evento = {
    escolha: fala.escolha || "dialogo",
    opcao: String(opcao.id == null ? "" : opcao.id).slice(0, 100),
    texto: String(opcao.texto || opcao.label || opcao.id || "Escolha registrada").slice(0, 180),
    dia: typeof diaAtual === "function" ? diaAtual() : 1,
    pessoas: Array.from(envolvidos).slice(0, 8)
  };
  // A mesma escolha só é registrada uma vez; reabrir um diálogo não duplica a memória.
  const chave = evento.escolha + "|" + evento.opcao;
  if (!r.historico.some(e => e && (e.escolha + "|" + e.opcao) === chave)) {
    r.historico.push(evento);
    if (r.historico.length > 40) r.historico.splice(0, r.historico.length - 40);
  }
  evento.pessoas.forEach(nome => {
    if (!r.porPessoa[nome] || typeof r.porPessoa[nome] !== "object") r.porPessoa[nome] = {};
    const p = r.porPessoa[nome];
    p.ultimaEscolha = evento.escolha;
    p.ultimaOpcao = evento.opcao;
    p.ultimoDia = evento.dia;
    p.totalEscolhas = Math.min(999, (Number(p.totalEscolhas) || 0) + 1);
  });
}

// API pequena para diálogos futuros consultarem a memória sem depender do formato interno.
function relacaoLembra(nome, escolha, opcao) {
  const r = estadoRelacoes();
  const p = r.porPessoa[nome];
  if (!p) return false;
  if (escolha && p.ultimaEscolha !== escolha) {
    return r.historico.some(e => e && e.pessoas && e.pessoas.includes(nome) && e.escolha === escolha && (!opcao || e.opcao === opcao));
  }
  return !opcao || p.ultimaOpcao === opcao;
}

function relacaoTempoPausa(nome) {
  // Uma conversa com alguém próximo tende a terminar com mais naturalidade;
  // conhecidos distantes precisam de um pouco mais de espaço antes de voltar à rotina.
  if (typeof AMIGOS === "undefined" || !AMIGOS[nome] || typeof amizadeNivel !== "function") return 2;
  const nivel = amizadeNivel(nome);
  return nivel >= 4 ? 1.1 : nivel === 3 ? 1.5 : nivel === 2 ? 2.1 : 2.7;
}


// Relações sociais entre NPCs: encontros anteriores alteram as falas futuras.
// Não altera os pontos de amizade do jogador nem cria fatos da história.
function relacaoParChave(a, b) {
  return [String(a || ""), String(b || "")].sort((x, y) => x.localeCompare(y, "pt-BR")).join("::");
}
function relacaoParEstado(a, b) {
  const r = estadoRelacoes();
  if (!r.pares || typeof r.pares !== "object") r.pares = {};
  const chave = relacaoParChave(a, b);
  if (!r.pares[chave] || typeof r.pares[chave] !== "object") r.pares[chave] = { a: String(a || ""), b: String(b || ""), encontros: 0, ultimaConversaDia: 0 };
  return r.pares[chave];
}
function relacaoRegistrarConversaNPC(a, b) {
  if (!a || !b || a === b) return null;
  const par = relacaoParEstado(a, b);
  par.encontros = Math.min(999, (Number(par.encontros) || 0) + 1);
  par.ultimaConversaDia = typeof diaAtual === "function" ? diaAtual() : 1;
  const r = estadoRelacoes();
  if (!Array.isArray(r.conversasNPC)) r.conversasNPC = [];
  r.conversasNPC.push({ a, b, dia: par.ultimaConversaDia, encontros: par.encontros });
  if (r.conversasNPC.length > 30) r.conversasNPC.splice(0, r.conversasNPC.length - 30);
  return par;
}
function relacaoNivelPar(a, b) {
  const p = relacaoParEstado(a, b);
  const n = Number(p.encontros) || 0;
  return n >= 5 ? "proximos" : n >= 2 ? "conhecidos" : "recentes";
}
function relacaoTemEscolhasSobre(nome) {
  const r = estadoRelacoes();
  const p = r.porPessoa && r.porPessoa[nome];
  return !!(p && Number(p.totalEscolhas) > 0);
}


// Eventos sociais derivados apenas do estado real salvo pelo jogo. Não cria fatos novos.
function relacaoEventosReaisDisponiveis() {
  const r = estadoRelacoes();
  if (!r.eventosComentados || typeof r.eventosComentados !== "object") r.eventosComentados = {};
  const eventos = [];
  if (typeof MISSOES !== "undefined" && typeof missaoConcluida === "function") {
    for (const m of MISSOES) {
      let feita = false;
      try { feita = !!missaoConcluida(m); } catch (_) {}
      if (!feita || !m || !m.id || !m.titulo) continue;
      const vezes = Number(r.eventosComentados["missao:" + m.id]) || 0;
      if (vezes < 2) eventos.push({ id: "missao:" + m.id, titulo: m.titulo, tipo: "missao" });
    }
  }
  // Mudanças de reputação são consultadas pela API já existente, sem alterar sua pontuação.
  if (typeof reputacaoNivel === "function" && typeof REPUTACAO_NIVEIS !== "undefined") {
    try {
      const nivel = reputacaoNivel();
      const nome = REPUTACAO_NIVEIS[nivel] && REPUTACAO_NIVEIS[nivel].nome;
      const id = "reputacao:" + nivel;
      if (nivel > 0 && nome && !r.eventosComentados[id]) eventos.push({ id, titulo: nome, tipo: "reputacao" });
    } catch (_) {}
  }
  return eventos;
}
function relacaoRegistrarEventoComentado(id) {
  if (!id) return;
  const r = estadoRelacoes();
  if (!r.eventosComentados || typeof r.eventosComentados !== "object") r.eventosComentados = {};
  r.eventosComentados[id] = Math.min(999, (Number(r.eventosComentados[id]) || 0) + 1);
}


// Perfil social persistente de cada NPC em relação à Dellalos.
function relacaoEstadoSocial(nome) {
  const r=estadoRelacoes();
  if (!r.social || typeof r.social !== "object") r.social={pessoas:{}, eventos:[]};
  if (!r.social.pessoas || typeof r.social.pessoas !== "object") r.social.pessoas={};
  if (!r.social.pessoas[nome]) r.social.pessoas[nome]={confianca:50, ciumes:0, ressentimento:0, ultimoEvento:"", conhecidosEventos:[]};
  const p=r.social.pessoas[nome];
  for (const k of ["confianca","ciumes","ressentimento"]) p[k]=Math.max(0,Math.min(100,Number(p[k])||0));
  if (!Array.isArray(p.conhecidosEventos)) p.conhecidosEventos=[];
  return p;
}
function relacaoPerfilPessoa(nome) {
  const p=relacaoEstadoSocial(nome);
  const amizade=typeof amizadePontos === "function" ? amizadePontos(nome) : 0;
  let status="Ainda estão se conhecendo";
  if (p.ressentimento>=70) status="Muito magoado(a) com Dellalos";
  else if (p.ciumes>=65) status="Com ciúmes";
  else if (p.confianca>=75 && amizade>=50) status="Confia em Dellalos";
  else if (amizade>=75) status="Muito próximo(a)";
  else if (amizade>=40) status="Amizade crescendo";
  else if (p.ressentimento>=20) status="Relação abalada";
  return {amizade:Math.max(0,Math.min(100,amizade)),confianca:p.confianca,ciumes:p.ciumes,ressentimento:p.ressentimento,status,ultimoEvento:p.ultimoEvento};
}
function relacaoAjustarSocial(nome, mudancas, motivo) {
  if (!nome) return null;
  const p=relacaoEstadoSocial(nome);
  for (const k of ["confianca","ciumes","ressentimento"]) if (mudancas && Number.isFinite(Number(mudancas[k]))) p[k]=Math.max(0,Math.min(100,p[k]+Number(mudancas[k])));
  if (motivo) p.ultimoEvento=String(motivo).slice(0,180);
  return p;
}
// Registre aqui ações sociais importantes (agressão, ajuda, mentira descoberta, pedido de desculpas).
// Apenas testemunhas e relações próximas recebem a informação; nada é espalhado magicamente.
function relacaoRegistrarEventoSocial(ator, alvo, tipo, descricao, testemunhas) {
  if (!ator || !tipo) return false;
  const r=estadoRelacoes();
  if (!r.social || typeof r.social !== "object") r.social={pessoas:{},eventos:[]};
  if (!Array.isArray(r.social.eventos)) r.social.eventos=[];
  const id="social_"+(typeof diaAtual === "function" ? diaAtual() : 1)+"_"+r.social.eventos.length+"_"+String(tipo).replace(/[^a-z0-9_-]/gi,"").slice(0,24);
  const evento={id,ator:String(ator),alvo:String(alvo||""),tipo:String(tipo),descricao:String(descricao||tipo).slice(0,180),dia:typeof diaAtual === "function" ? diaAtual() : 1};
  r.social.eventos.push(evento); if(r.social.eventos.length>80) r.social.eventos.splice(0,r.social.eventos.length-80);
  const informados=new Set([].concat(testemunhas||[]).filter(Boolean));
  // Amizades próximas explicitamente estabelecidas no jogo: Nathalia e Veras são melhores amigas.
  if (alvo === "Veras" && (tipo === "agressao" || tipo === "humilhacao" || tipo === "traicao")) informados.add("Nathalia");
  if (alvo === "Nathalia" && (tipo === "agressao" || tipo === "humilhacao" || tipo === "traicao")) informados.add("Veras");
  // Proximidade romântica só gera ciúmes quando a lógica do jogo registra esse evento explicitamente.
  if (ator === "Dellalos" && alvo === "Nathalia" && tipo === "proximidade_romantica") informados.add("Veras");
  informados.forEach(nome=>{
    if (!nome || nome===ator || nome===alvo) return;
    const p=relacaoEstadoSocial(nome);
    if (p.conhecidosEventos.includes(id)) return;
    p.conhecidosEventos.push(id); if(p.conhecidosEventos.length>30)p.conhecidosEventos.shift();
    p.ultimoEvento=String(ator)+" — "+evento.descricao;
    if (tipo === "agressao" || tipo === "humilhacao" || tipo === "traicao") {
      relacaoAjustarSocial(nome,{confianca:-12,ressentimento:12},p.ultimoEvento);
      if (typeof amizadeGanhar === "function" && typeof AMIGOS !== "undefined" && AMIGOS[nome]) amizadeGanhar(nome,-3,"social_"+id+"_"+nome,true);
    } else if (tipo === "ajuda" || tipo === "desculpas") {
      relacaoAjustarSocial(nome,{confianca:5,ressentimento:-5},p.ultimoEvento);
    } else if (tipo === "proximidade_romantica" || tipo === "ciumes") {
      relacaoAjustarSocial(nome,{ciumes:15,confianca:-2},p.ultimoEvento);
    }
  });
  if (alvo) {
    const pessoa=relacaoEstadoSocial(alvo);
    if (tipo === "agressao" || tipo === "humilhacao" || tipo === "traicao") relacaoAjustarSocial(alvo,{confianca:-25,ressentimento:25},evento.descricao);
    else if (tipo === "ajuda" || tipo === "desculpas") relacaoAjustarSocial(alvo,{confianca:12,ressentimento:-15},evento.descricao);
  }
  return true;
}
function relacaoDefinirCiumes(nome, pontos, motivo) { return relacaoAjustarSocial(nome,{ciumes:Number(pontos)||0},motivo||"Sentiu ciúmes"); }


// v65 — API central de relacionamento. Reúne os indicadores já existentes sem
// duplicar pontuações nem substituir os sistemas de amizade/romance anteriores.
function relacaoPainelCompleto(nome) {
  const social = relacaoPerfilPessoa(nome);
  let interesse = 0, romanceEstado = "Sem informação romântica", parRomantico = null;
  if (typeof romanceListar === "function") {
    const pares = romanceListar().filter(p => p && (p.a === nome || p.b === nome));
    // Prioriza o par com maior interesse da pessoa em questão; não revela sentimentos
    // de outros NPCs como se fossem conhecidos pela Dellalos.
    pares.sort((x,y) => {
      const ix = x.a === nome ? Number(x.interesseA)||0 : Number(x.interesseB)||0;
      const iy = y.a === nome ? Number(y.interesseA)||0 : Number(y.interesseB)||0;
      return iy-ix;
    });
    if (pares.length) {
      parRomantico = pares[0];
      interesse = Math.max(0,Math.min(100,Number(parRomantico.a === nome ? parRomantico.interesseA : parRomantico.interesseB)||0));
      const estados = {conhecendo:"Se conhecendo",aproximacao:"Aproximação",sentimentos_escondidos:"Sentimentos escondidos",sentimentos_emergentes:"Sentimentos surgindo",confissao_pendente:"Confissão possível",triangulo_em_potencial:"Triângulo em potencial",namoro:"Namorando",crise:"Crise amorosa",terminado:"Relacionamento encerrado"};
      romanceEstado = estados[parRomantico.estado] || "Sentimentos indefinidos";
    }
  }
  return {amizade:social.amizade, confianca:social.confianca, interesseRomantico:interesse,
    ciumes:social.ciumes, magoa:social.ressentimento, status:social.status,
    romanceEstado, ultimoEvento:social.ultimoEvento || ""};
}
function relacaoRegistrarEventoV65(ator, alvo, tipo, descricao, testemunhas) {
  // Alias explícito para futuras mecânicas usarem a mesma rede social.
  return relacaoRegistrarEventoSocial(ator, alvo, tipo, descricao, testemunhas);
}
