/* =====================================================
   npcs.js - Personagens que conversam (Millena, Morador, etc.) e podem ANDAR
   Um NPC é colocado na lista "npcs" de uma cena (js/salas/...):
     {
       nome: "Millena",
       x: 455, y: 440,                    // posição dos PÉS
       imagem: ["assets/Millena.png"],    // tenta na ordem
       quadro: { linha: 0, coluna: 0 },   // quadro parado (usado quando NÃO anda)
       colunas: 4, linhas: 4,             // (opcional) como a folha é dividida
       limitePreto: 18,                   // (opcional) quão "preto" é o fundo a apagar
       andar: {                           // (opcional) faz o NPC passear
         raioX: 192, raioY: 0,            //   até onde se afasta do ponto inicial (pixels)
         velocidade: 55,                  //   pixels por segundo
         quadros: [0, 1, 2, 3]            //   colunas usadas na caminhada (padrão: todas)
       },
       conversar: function () { ... }     // o que o botão B faz
     }
   Campos opcionais novos:
     se: () => bool      o NPC só existe (aparece, bloqueia, conversa) quando isto for verdadeiro
     (sem "imagem")      NPC ainda sem sprite: vira um boneco provisório com o nome, sem erro de carregamento
     cor: "#rrggbb"      cor do boneco provisório
   A folha segue o mesmo padrão da Dellalos: linha 0 = baixo, 1 = cima, 2 = esquerda, 3 = direita.
   Fundo preto (JPG ou PNG sem transparência) é apagado sozinho.
   ===================================================== */

const NPC_LINHA = { baixo: 0, cima: 1, esquerda: 2, direita: 3 };
const NPC_TEMPO_QUADRO = 0.16;   // segundos em cada quadro da caminhada

function prepararNpc(n) {
  if (n._pronto) return;
  n._pronto = true;
  n._folha = null;
  n.direcao = n.direcao || "baixo";
  n.andando = false;
  n._tempoAnim = 0;
  n._x0 = n.x;                         // ponto de origem do passeio
  n._y0 = n.y;
  n._destino = null;
  n._espera = 0.5 + Math.random() * 2;
  if (!n.imagem || !n.imagem.length) { n._semImagem = true; return; }   // sem sprite: boneco provisório
  carregarImagem(n.imagem, (img) => {
    // Se o fundo é opaco (JPG ou PNG sem transparência), apaga o preto do fundo
    setTimeout(() => {   // um instante depois: deixa a tela de carregamento atualizar antes do trabalho pesado
      n._folha = temFundoOpaco(img) ? prepararFolha(reduzirFolha(img, 1024), n.limitePreto || 18) : img;
    }, 30);
  });
}

// Caixa dos pés (bloqueia o caminho, igual a uma parede pequena)
// (opcional) n.caixa = { w, h } para NPCs menores (ex.: o gatinho)
function npcCaixa(n, x, y) {
  const w = (n.caixa && n.caixa.w) || 64, h = (n.caixa && n.caixa.h) || 30;
  return { x: x - w / 2, y: y - h, w, h };
}
function caixaDoNpc(n) {
  return npcCaixa(n, n.x, n.y);
}

// Mantém a caixa sólida e a área de conversa junto com o NPC quando ele anda
function sincronizarNpc(n) {
  if (n._solido) { const b = npcCaixa(n, n.x, n.y); n._solido.x = b.x; n._solido.y = b.y; }
  if (n._area && n._solido) { n._area.x = n._solido.x - 16; n._area.y = n._solido.y - 16; }
}

// O NPC pode ficar nesta posição? (paredes, móveis, outros NPCs e a Dellalos)
function npcLivre(n, x, y) {
  const c = npcCaixa(n, x, y);
  if (temSolido(c, n._solido)) return false;
  return !bate(c, caixaDoJogador(jogador.x, jogador.y));
}

// Vira o NPC para a Dellalos (usado ao conversar)
function npcOlharJogador(n) {
  const dx = jogador.x - n.x, dy = jogador.y - n.y;
  if (Math.abs(dx) > Math.abs(dy)) n.direcao = dx < 0 ? "esquerda" : "direita";
  else n.direcao = dy < 0 ? "cima" : "baixo";
  n.andando = false;
  n._destino = null;
  n._espera = typeof relacaoTempoPausa === "function" ? relacaoTempoPausa(n.nome) : 2; // pausa varia com a relação (v49)
}

// Escolhe um ponto novo para passear, dentro do raio
function configuracaoAndarLivreNpc(n) {
  // A rotina livre atua apenas nas regiões externas comuns. Salas, escola, interiores,
  // áreas de evento e a arena do torneio preservam os posicionamentos roteirizados.
  const id = typeof idDaCena === "function" ? idDaCena(cenaAtual) : "";
  const regioesLivres = ["estrada", "bairro_sul", "bairro_sul2", "zona_leste", "zona_leste2", "zona_norte", "zona_norte2", "zona_oeste"];
  if (n.rotinaLivre === false || !regioesLivres.includes(id)) return null;
  // Uma rotina definida pelo personagem tem prioridade, inclusive sobre andar parado.
  if (n.rotinaLivre && typeof n.rotinaLivre === "object") return n.rotinaLivre;
  // NPCs sem rota explícita ganham passeios locais. O destino muda a partir da posição
  // atual, permitindo explorar gradualmente a região sem sair dela.
  if (!n.andar) return { raioX: 260, raioY: 190, velocidade: 34 + (n._velocidadeLivre || 0), relativo: true, quadros: [0, 1, 2, 3] };
  return n.andar;
}

// Regiões externas conectadas por saídas públicas. Interiores e áreas de evento ficam fora.
const NPC_REGIOES_VIAJAVEIS = new Set(["estrada", "bairro_sul", "bairro_sul2", "zona_leste", "zona_leste2", "zona_norte", "zona_norte2", "zona_oeste"]);

function npcPodeViajarPara(n, destinoId) {
  if (!NPC_REGIOES_VIAJAVEIS.has(destinoId) || n.viajarRegioes === false) return false;
  let permitidas = n.regioesPermitidas;
  if (typeof permitidas === "function") {
    try { permitidas = permitidas(); } catch (_) { return false; }
  }
  if (Array.isArray(permitidas) && !permitidas.includes(destinoId)) return false;
  let regiaoMissao = n.regiaoMissao;
  if (typeof regiaoMissao === "function") {
    try { regiaoMissao = regiaoMissao(); } catch (_) { return false; }
  }
  if (regiaoMissao && n.missaoAtiva !== false && destinoId !== regiaoMissao) return false;
  if (typeof n.podeViajarPara === "function") {
    try { if (!n.podeViajarPara(destinoId)) return false; } catch (_) { return false; }
  }
  return true;
}

function saidasPublicasNpc(n) {
  const origemId = typeof idDaCena === "function" ? idDaCena(cenaAtual) : "";
  if (!NPC_REGIOES_VIAJAVEIS.has(origemId) || n.viajarRegioes === false) return [];
  return (cenaAtual.saidas || []).filter(s => {
    if (!s || !NPC_REGIOES_VIAJAVEIS.has(s.para) || !npcPodeViajarPara(n, s.para)) return false;
    if (typeof s.se === "function") { try { if (!s.se()) return false; } catch (_) { return false; } }
    return !!s.area && !!CENAS[s.para];
  });
}

function pontoAlvoSaidaNpc(s) {
  const a = s.area;
  return { x: a.x + a.w / 2, y: a.y + a.h / 2 };
}

function tentarViajarNpc(n, saida) {
  const origem = cenaAtual;
  const destino = CENAS[saida.para];
  if (!destino || !npcPodeViajarPara(n, saida.para)) return false;
  // Não cria duas cópias ativas do mesmo personagem numa região.
  const duplicado = (destino.npcs || []).some(q => q !== n && q.nome === n.nome);
  if (duplicado) { n._destino = null; n._saidaViagem = null; n._espera = 3 + Math.random() * 3; return false; }
  removerNpcDaCena(origem, n);
  const mapa = destino.mapa;
  const maxX = mapa.cols * TILE - TILE, maxY = mapa.rows * TILE - TILE;
  // Chega perto da entrada, mas não exatamente em cima do ponto de spawn do jogador.
  n.x = Math.max(TILE, Math.min(maxX, (saida.x || mapa.cols * TILE / 2) + (Math.random() - .5) * 72));
  n.y = Math.max(TILE * 2, Math.min(maxY, (saida.y || mapa.rows * TILE / 2) + 48 + (Math.random() - .5) * 56));
  n._x0 = n.x; n._y0 = n.y;
  n._destino = null; n._saidaViagem = null; n._rota = null;
  n._espera = 1 + Math.random() * 2;
  n._viajando = false;
  n._cenaId = saida.para;
  if (!destino.npcs) destino.npcs = [];
  destino.npcs.push(n);
  if (destino._pronta) registrarNpcNaCena(destino, n);
  return true;
}

function escolherDestinoNpc(n) {
  const a = n._andarRotina || n.andar;
  // Ocasionalmente escolhe uma saída pública para visitar outra região.
  // Só personagens com rotina de caminhada ativa entram neste sistema.
  n._saidaViagem = null;
  if (n.viajarRegioes !== false && Math.random() < (n.chanceViajarRegiao || 0.16) * npcVidaFator(n).viagem) {
    const saidas = saidasPublicasNpc(n);
    if (saidas.length) {
      const s = saidas[Math.floor(Math.random() * saidas.length)];
      n._saidaViagem = s;
      return pontoAlvoSaidaNpc(s);
    }
  }
  // Destino local escolhido perto da posição atual, para explorar a região gradualmente.
  const bx = a.relativo ? n.x : n._x0, by = a.relativo ? n.y : n._y0;
  for (let t = 0; t < 6; t++) {
    const dx = (Math.random() * 2 - 1) * (a.raioX || 0);
    const dy = (Math.random() * 2 - 1) * (a.raioY || 0);
    if (Math.hypot(dx, dy) > 40) {
      let x = bx + dx, y = by + dy;
      if (a.relativo) {
        const m = cenaAtual.mapa;
        x = Math.max(TILE, Math.min(m.cols * TILE - TILE, x));
        y = Math.max(TILE * 2, Math.min(m.rows * TILE - TILE, y));
      }
      return { x, y };
    }
  }
  return null;
}

// O NPC está presente agora? (campo opcional  se  na definição do NPC)
function npcAtivo(n) {
  return !n.se || !!n.se();
}

// NPC ausente: tira a caixa sólida e a área de conversa do caminho (ele volta quando  se()  ficar true)
function ajustarPresencaNpc(n) {
  if (npcAtivo(n)) { sincronizarNpc(n); return; }
  if (n._solido) { n._solido.x = -99999; n._solido.y = -99999; }
  if (n._area)   { n._area.x = -99999;   n._area.y = -99999; }
}

// Faz o NPC andar em linha reta até (x, y) e sumir aos poucos (usado quando alguém "vai embora").
// aoTerminar (opcional) roda quando ele chega. Ele não conversa enquanto anda.
function npcIrEmbora(n, x, y, velocidade, aoTerminar) {
  n._rota = { x, y, velocidade: velocidade || 90, fim: aoTerminar || null };
  n._destino = null;
  n._alfa = 1;
}

function atualizarNpcs(dt) {
  for (const n of cenaAtual.npcs || []) {
    if (n.se || n._recolhidoAntes || npcRecolhido(n)) { ajustarPresencaNpc(n); n._recolhidoAntes = npcRecolhido(n); }   // v55: dorme à noite (js/npcvida.js)
    if (!npcAtivo(n)) continue;
    if (n._torneioFighter) continue; // os lutadores do torneio têm movimento controlado pela simulação ao vivo
    if (n._socialPausa) { n.andando = false; continue; } // conversa entre NPCs pausa a rotina por alguns segundos

    if (n._rota) {                              // caminhada roteirizada (npcIrEmbora)
      const r = n._rota;
      const dx = r.x - n.x, dy = r.y - n.y, d = Math.hypot(dx, dy);
      if (d < 4) {
        n._rota = null;
        n.andando = false;
        n._alfa = 0;
        if (r.fim) r.fim();
        continue;
      }
      const passo = Math.min(r.velocidade * dt, d);
      n.x += (dx / d) * passo;
      n.y += (dy / d) * passo;
      if (Math.abs(dx) > Math.abs(dy)) n.direcao = dx < 0 ? "esquerda" : "direita";
      else n.direcao = dy < 0 ? "cima" : "baixo";
      n.andando = true;
      n._tempoAnim += dt;
      n._alfa = Math.max(0, Math.min(1, d / 120));   // some aos poucos nos últimos passos
      sincronizarNpc(n);
      continue;
    }
    if (!n._pronto) continue;
    n._andarRotina = configuracaoAndarLivreNpc(n);
    const andarNpc = n._andarRotina;
    if (!andarNpc || (andarNpc.raioX || 0) <= 0 && (andarNpc.raioY || 0) <= 0) {
      n.andando = false;
      n._destino = null;
      continue;
    }

    if (n._espera > 0) {                       // parado, descansando
      n._espera -= dt / npcVidaFator(n).desc;   // v55: hora do dia e humor mudam o descanso (js/npcvida.js)
      n.andando = false;
      continue;
    }
    if (!n._destino) {
      n._destino = escolherDestinoNpc(n);
      if (!n._destino) { n._espera = 2; continue; }
    }

    const dx = n._destino.x - n.x, dy = n._destino.y - n.y;
    const d = Math.hypot(dx, dy);
    if (d < 4) {                               // chegou ao destino
      if (n._saidaViagem) {
        const saida = n._saidaViagem;
        if (tentarViajarNpc(n, saida)) continue;
      }
      n._destino = null;
      n._saidaViagem = null;
      n._espera = (n._vidaEmRota && n._vidaCaminho && n._vidaCaminho.length) ? 0 : 1.5 + Math.random() * 3;   // v56: em rota para um destino, não para em cada curva
      n.andando = false;
      continue;
    }

    const passo = Math.min((andarNpc.velocidade || 55) * dt, d);
    const px = (dx / d) * passo, py = (dy / d) * passo;
    let moveu = false;
    if (px !== 0 && npcLivre(n, n.x + px, n.y)) { n.x += px; moveu = true; }
    if (py !== 0 && npcLivre(n, n.x, n.y + py)) { n.y += py; moveu = true; }

    if (!moveu) {                              // bateu em algo: desiste deste caminho
      n._destino = null;
      n._saidaViagem = null;
      n._espera = 0.4 + Math.random();
      if (n._vidaEmRota) { n._vidaCaminho = null; n._vidaEmRota = false; n._vidaFalhas = (n._vidaFalhas || 0) + 1; }   // v56: travou no caminho
      n.andando = false;
      continue;
    }

    if (Math.abs(dx) > Math.abs(dy)) n.direcao = dx < 0 ? "esquerda" : "direita";
    else n.direcao = dy < 0 ? "cima" : "baixo";
    n.andando = true;
    n._tempoAnim += dt;
    sincronizarNpc(n);
    if (n._saidaViagem && bate(caixaDoNpc(n, n.x, n.y), n._saidaViagem.area)) {
      const saida = n._saidaViagem;
      if (tentarViajarNpc(n, saida)) continue;
    }
  }
  atualizarConversasEntreNpcs(dt);
}

// Conversas espontâneas locais: só em regiões públicas, sem alterar a história principal.
const NPC_CONVERSA_REGIOES = new Set(["estrada", "bairro_sul", "bairro_sul2", "zona_leste", "zona_leste2", "zona_norte", "zona_norte2", "zona_oeste"]);
const NPC_FALAS_SOCIAIS = [
  ["Tem alguma novidade por aqui?", "Só ouvi comentários por aí. Melhor confirmar antes de acreditar."],
  ["Você vai ficar por esta região hoje?", "Por enquanto, sim. Depois vejo para onde o caminho me leva."],
  ["É bom encontrar alguém conhecido no meio da correria.", "Também acho. Às vezes uma conversa curta já melhora o dia."],
  ["Espero que as coisas fiquem mais tranquilas por aqui.", "Tomara. Vamos ficar atentos e ajudar quando pudermos."]
];
const NPC_FALAS_CONHECIDOS = [
  ["A gente já se encontrou algumas vezes, né?", "Verdade. Já começo a reconhecer seus passos por aqui."],
  ["Como têm sido seus dias?", "Movimentados. É bom parar um pouco e conversar com alguém conhecido."],
  ["Parece que sempre acabamos nos cruzando por aqui.", "Talvez a região não seja tão grande quanto parece." ]
];
const NPC_FALAS_PROXIMOS = [
  ["É bom poder conversar com você de novo.", "Também gosto dessas pausas. Já virou quase um costume nosso."],
  ["Se acontecer alguma coisa, espero que a gente possa conversar antes de tirar conclusões.", "Combinado. Ouvir o outro pode evitar muita confusão."],
  ["Acho que já nos entendemos melhor do que no começo.", "A convivência ajuda. A gente aprende a escutar com o tempo."]
];
const NPC_FALAS_ESCOLHAS = [
  ["As decisões que aconteceram por aqui ainda dão assunto.", "É verdade. Melhor lembrar que cada escolha pode afetar outras pessoas."],
  ["Tenho pensado em como certas decisões mudam o clima da região.", "Também. O importante é não espalhar rumor como se fosse certeza."]
];
const NPC_FALAS_EVENTOS = [
  (titulo) => ["Soube que houve novidades sobre: " + titulo + ".", "É bom conversar sobre o que realmente aconteceu, sem aumentar a história."],
  (titulo) => ["Parece que " + titulo + " já teve um desfecho.", "Sim. Vamos nos ater ao que sabemos e não inventar detalhes."]
];
const NPC_FALAS_AMIGAVEIS = [
  ["Fico contente quando a gente consegue conversar um pouco.", "Eu também. É bom saber que posso contar com você."],
  ["Se precisar de ajuda, pode me procurar.", "Obrigado. Pode contar comigo também."],
  ["Acho que a gente se entende melhor a cada encontro.", "Concordo. Essas conversas fazem diferença."]
];
function nivelRelacaoSocial(n) {
  try { return typeof amizadeNivel === "function" ? Number(amizadeNivel(n.nome)) || 0 : 0; } catch (_) { return 0; }
}

function npcPodeConversarSocialmente(n) {
  if (!n || !npcAtivo(n) || !n.conversar || n.socialDesativado || n._torneioFighter || n._rota || n._viajando) return false;
  if (n._socialCooldown > 0 || n._socialPausa) return false;
  return true;
}

function iniciarConversaEntreNpcs(a, b) {
  const nivelPar = typeof relacaoNivelPar === "function" ? relacaoNivelPar(a.nome, b.nome) : "recentes";
  const saoProximos = nivelRelacaoSocial(a) >= 3 && nivelRelacaoSocial(b) >= 3;
  const temMemoriaEscolhas = typeof relacaoTemEscolhasSobre === "function" && (relacaoTemEscolhasSobre(a.nome) || relacaoTemEscolhasSobre(b.nome));
  let grupoFalas = NPC_FALAS_SOCIAIS;
  let eventoEscolhido = null;
  // Em parte das conversas, os NPCs comentam missões concluídas ou reputação real.
  // O assunto vem dos dados do jogo; a fala não revela nem inventa fatos da história.
  if (typeof relacaoEventosReaisDisponiveis === "function" && Math.random() < 0.34) {
    const eventos = relacaoEventosReaisDisponiveis();
    if (eventos.length) eventoEscolhido = eventos[Math.floor(Math.random() * eventos.length)];
  }
  let falas;
  if (eventoEscolhido) {
    const modelo = NPC_FALAS_EVENTOS[Math.floor(Math.random() * NPC_FALAS_EVENTOS.length)];
    falas = modelo(eventoEscolhido.titulo);
    if (typeof relacaoRegistrarEventoComentado === "function") relacaoRegistrarEventoComentado(eventoEscolhido.id);
  } else {
    if (temMemoriaEscolhas && Math.random() < 0.28) grupoFalas = NPC_FALAS_ESCOLHAS;
    else if (saoProximos) grupoFalas = NPC_FALAS_AMIGAVEIS;
    else if (nivelPar === "proximos") grupoFalas = NPC_FALAS_PROXIMOS;
    else if (nivelPar === "conhecidos") grupoFalas = NPC_FALAS_CONHECIDOS;
    falas = grupoFalas[Math.floor(Math.random() * grupoFalas.length)];
  }
  if (typeof npcVidaFalasSociais === "function" && !eventoEscolhido) { const fh = npcVidaFalasSociais(a, b); if (fh) falas = fh; }   // v55: humor/hora (js/npcvida.js)
  const conversa = { a, b, falas, fase: 0, t: 4.8, trocaEm: 2.35 };
  cenaAtual._conversaSocialAtiva = conversa;
  a._socialPausa = true; b._socialPausa = true;
  a._socialCooldown = 16 + Math.random() * 12;
  b._socialCooldown = 16 + Math.random() * 12;
  if (typeof npcVidaFatorSocial === "function") { a._socialCooldown *= npcVidaFatorSocial(a); b._socialCooldown *= npcVidaFatorSocial(b); }
  a._socialFala = falas[0]; b._socialFala = falas[1];
  a._socialFalando = true; b._socialFalando = false;
  a._destino = null; b._destino = null; a._saidaViagem = null; b._saidaViagem = null;
  const dx = b.x - a.x, dy = b.y - a.y;
  a.direcao = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "esquerda" : "direita") : (dy < 0 ? "cima" : "baixo");
  b.direcao = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "direita" : "esquerda") : (dy < 0 ? "baixo" : "cima");
  // O histórico do par evolui a conversa futura, sem conceder amizade automática.
  if (typeof relacaoRegistrarConversaNPC === "function") relacaoRegistrarConversaNPC(a.nome, b.nome);
}

function atualizarConversasEntreNpcs(dt) {
  const id = typeof idDaCena === "function" ? idDaCena(cenaAtual) : "";
  if (!NPC_CONVERSA_REGIOES.has(id) || dialogoAberto || transicao || menuAberto) return;
  for (const n of cenaAtual.npcs || []) if (n._socialCooldown > 0) n._socialCooldown = Math.max(0, n._socialCooldown - dt);
  const ativa = cenaAtual._conversaSocialAtiva;
  if (ativa) {
    ativa.t -= dt;
    if (ativa.fase === 0 && ativa.t <= ativa.trocaEm) { ativa.fase = 1; ativa.a._socialFalando = false; ativa.b._socialFalando = true; }
    if (ativa.t <= 0 || !cenaAtual.npcs.includes(ativa.a) || !cenaAtual.npcs.includes(ativa.b) || !npcAtivo(ativa.a) || !npcAtivo(ativa.b)) {
      [ativa.a, ativa.b].forEach(n => { if (n) { n._socialPausa = false; n._socialFala = null; n._socialFalando = false; n._espera = Math.max(n._espera || 0, 1.2); } });
      cenaAtual._conversaSocialAtiva = null;
    }
    return;
  }
  if (Math.random() > 0.018) return; // tentativas espaçadas, para não formar rodas de conversa
  const disponiveis = (cenaAtual.npcs || []).filter(npcPodeConversarSocialmente);
  if (disponiveis.length < 2) return;
  for (let i = 0; i < disponiveis.length; i++) {
    const a = disponiveis[i];
    for (let j = i + 1; j < disponiveis.length; j++) {
      const b = disponiveis[j];
      const distancia = Math.hypot(a.x - b.x, a.y - b.y);
      if (distancia >= 100 || distancia < 28) continue;
      // Evita conversas enquanto qualquer um estiver em movimento roteirizado ou em missão.
      if (a._rota || b._rota || a._torneioFighter || b._torneioFighter) continue;
      iniciarConversaEntreNpcs(a, b);
      return;
    }
  }
}

function desenharConversasNpcs() {
  const c = cenaAtual && cenaAtual._conversaSocialAtiva;
  if (!c || !c.t || transicao) return;
  const n = c.fase === 0 ? c.a : c.b;
  if (!n || !n._socialFala) return;
  const texto = n._socialFala;
  ctx.save();
  ctx.font = "12px sans-serif";
  const max = 190;
  const palavras = texto.split(/\s+/);
  const linhas = []; let linha = "";
  for (const palavra of palavras) {
    const teste = linha ? linha + " " + palavra : palavra;
    if (ctx.measureText(teste).width > max && linha) { linhas.push(linha); linha = palavra; } else linha = teste;
  }
  if (linha) linhas.push(linha);
  const w = Math.min(max + 16, Math.max(80, ...linhas.map(l => ctx.measureText(l).width + 16)));
  const h = linhas.length * 15 + 12;
  const esquerdaVisivel = (camera && Number.isFinite(camera.x) ? camera.x : 0) + 4;
  const direitaVisivel = (camera && Number.isFinite(camera.x) ? camera.x : 0) + VIEW_L - w - 4;
  const topoVisivel = (camera && Number.isFinite(camera.y) ? camera.y : 0) + 4;
  const x = Math.max(esquerdaVisivel, Math.min(direitaVisivel, n.x - w / 2));
  const y = Math.max(topoVisivel, n.y - (n.altura || CONFIG.alturaPersonagem) - h - 10);
  ctx.fillStyle = "rgba(255,255,240,0.96)"; ctx.strokeStyle = "#443b36"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 6); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(n.x - 4, y + h); ctx.lineTo(n.x + 2, y + h + 7); ctx.lineTo(n.x + 8, y + h); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#292323"; ctx.textAlign = "center";
  linhas.forEach((l, i) => ctx.fillText(l, x + w / 2, y + 17 + i * 15));
  ctx.restore();
}

function desenharNpc(n) {
  if (n.desenharCustom) { n.desenharCustom(n); return; }   // (opcional) desenho próprio, ex.: o gatinho
  const sp = CONFIG.sprite;
  if (n._folha) {
    const colunas = n.colunas || sp.colunas, linhas = n.linhas || sp.linhas;
    let linha = n.quadro ? n.quadro.linha : 0, coluna = n.quadro ? n.quadro.coluna : 0;
    if (n.andar || n._andarRotina || n._rota) { // NPC que anda: quadro depende da direção e do passo
      const qs = (n._andarRotina && n._andarRotina.quadros) || (n.andar && n.andar.quadros) || [0, 1, 2, 3];
      linha = NPC_LINHA[n.direcao] || 0;
      coluna = n.andando ? qs[Math.floor(n._tempoAnim / NPC_TEMPO_QUADRO) % qs.length] : 0;
    }
    const qw = n._folha.width / colunas, qh = n._folha.height / linhas;
    const h = n.altura || CONFIG.alturaPersonagem;
    const w = h * (qw / qh);
    ctx.fillStyle = "rgba(0,0,0,0.18)";        // sombrinha
    ctx.beginPath(); ctx.ellipse(n.x, n.y - 2, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
    if (n._alfa !== undefined) ctx.globalAlpha = n._alfa;   // sumindo (npcIrEmbora)
    ctx.drawImage(n._folha, coluna * qw, linha * qh, qw, qh,
                  Math.round(n.x - w / 2), Math.round(n.y - h * sp.pes), w, h);
    ctx.globalAlpha = 1;
  } else {
    // Sem imagem (ainda não carregou, não foi achada ou o personagem ainda não tem sprite):
    // boneco provisório com o nome em cima
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath(); ctx.ellipse(n.x, n.y - 2, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = n.cor || "#6a5a8a";
    ctx.fillRect(n.x - 20, n.y - 70, 40, 62);                          // corpo
    ctx.beginPath(); ctx.arc(n.x, n.y - 86, 16, 0, Math.PI * 2); ctx.fill();   // cabeça
    ctx.lineWidth = 3; ctx.strokeStyle = "#1e1612";
    ctx.strokeRect(n.x - 20, n.y - 70, 40, 62);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(n.nome, n.x, n.y - 108);
  }
}
