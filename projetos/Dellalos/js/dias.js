/* =====================================================
   dias.js - Os dias da história (dia 1 até o dia 15)
   Cada dia tem uma ROTINA fixa, que aparece no topo do 🎒:
     acordar -> ir para a escola -> passear -> dormir   (dormir passa para o dia seguinte)
   Dá para pular o passeio (só escola e dormir), mas aí não sobra tempo para as
   missões secundárias: a escolha é do jogador.
   ROTEIRO DOS 15 DIAS (as revelações grandes ficam em dias separados; os outros dias têm missões mais leves)
     Dia 1   chegada: casa, escola, Millena, Lucas, Nathalia                          [pronto]
     Dia 2   o amigo do papai avisa que ele só confere tudo no dia 15                 [pronto; só dorme depois dele]
     Dia 3-4 o Deriky avisa da cidade; no dia seguinte a Millena conta do torneio e a Isabela convida  [pronto, pelo jogador]
     Dia 5   pistas na cidade: Dona Lúcia (história do avô e dos 5 amigos [pronto]), Seu Augusto, Pedro, Helena e Seu Tomás   [em andamento]
     Dia 6   REVELAÇÃO 1: Simon e Deriky contam da seita (DIA_SEITA)                  [pronto; só dorme depois]
     Dia 7   depois da seita: Isabela e Thaina frias, Veras e Caio                    [A ESCREVER, respiro]
     Dia 8   REVELAÇÃO 2: sala 1A, Mariane, criatura, os meninos e o Lucas (DIA_1A)   [pronto; só dorme depois]
     Dia 9   consequências: Lucas e os meninos, a diretora, o que a Mariane deixou    [A ESCREVER]
             + Gaby controlada pela Isabela, na Zona Leste (DIA_GABY; amuleto estranho na loja desde o dia 8)  [pronto]
     Dia 10-14 dias novos: consequências, a missão A Casa dos Cinco (mansão + fábrica) e as secundárias  [A ESCREVER]
     Dia 15  o papai vem conferir tudo e o torneio  (DIA_FINAL; era o dia 10)                  [pronto: js/dia10.js]
   Para mudar o dia de uma revelação, mude DIA_SEITA ou DIA_1A aqui embaixo (o resto do jogo usa estes nomes).

   O que fica salvo (em diario.escolhas, js/diario.js):
     dia        -> número do dia atual (se não existir: dia 1, ou dia 2 se historia.novoDia)
     escolaDia  -> em que dia ela foi para a escola
     passeioDia -> em que dia ela passeou
   Como guardamos o NÚMERO do dia, não precisa "zerar" nada ao dormir.
   ===================================================== */

const DIA_FINAL = 15;   // dia em que o papai vem conferir tudo (era 10; se mudar, troque também os textos "dia 15": amigo do papai, diário, caderno, personagens e mansão)
const DIA_SEITA = 6;    // Simon e Deriky contam da seita (js/simon.js)
const DIA_THAINA = 7;   // a Thaina chama a Dellalos ao norte; o Lucas some da escola (js/thaina.js)
const DIA_1A = 8;       // a sala 1A, a Mariane e o acordo das três (js/chave1a.js)
const DIA_AMIGO_LESTE = 5;   // só neste dia o amigo do papai aparece na Zona Leste (uma vez) e entrega a Dália (js/salas/zonaleste.js)
const DIA_GABY = 9;     // a Gaby, controlada pela Isabela, ataca na Zona Leste (js/salas/zonaleste.js)
const DIA_AMULETO_ESTRANHO = 8;   // a partir deste dia o Seu Tomás vende o amuleto estranho (js/loja.js); a Gaby é no DIA_GABY
const DIA_LANTERNA = 8;   // a partir deste dia (depois do dia 7) a loja vende a lanterna, necessária para entrar na mansão da Zona Oeste (js/salas/mansao.js)
const DIA_NOITE = 4;    // na hora de dormir, a Millena chama a Dellalos para a escola (noite do torneio)

// ---------- Noite do dia 4 (parte 1) ----------
// Fica "ativa" desde a mensagem da Millena até historia.noiteFim.
function noiteAtiva() { return !!historia.noiteIniciada && !historia.noiteFim; }

// Chamada por dormirAteAmanha() (js/salas/sala.js) no dia 4, antes de a noite acontecer
function iniciarNoiteDia4() {
  historia.noiteIniciada = true;
  diario.escolhas.cicloT = CONFIG.ciclo.dia;   // depois da noite na escola, o relógio continua na noite (js/ciclo.js)
  if (AM().comp) dispensarCompanheiro();     // à noite ninguém anda junto: os amigos têm seu papel na escola (js/amizade.js)
  iniciarTelaTempo("Já é noite...", function () {
    abrirDialogo(DIALOGOS.noite.mensagem, function () {
      mostrarMensagem("Nova missão do dia: ir para a escola. A Millena está esperando.");
      sinalizarMissao();
    });
  }, 2);
}

// Mesa do Zé (a mesa da professora da 3C): a chave está nela
function usarMesaDoZe() {
  if (!noiteAtiva()) { mostrarMensagem("A mesa da professora."); return; }
  if (historia.pegouChaveZe) { mostrarMensagem("Já peguei a chave do Zé."); return; }
  const plano = diario.escolhas.noite_plano;
  if (plano === "pegar" && historia.noiteMillenaDistrai) {
    historia.pegouChaveZe = true;
    mostrarMensagem("Você pegou a chave do Zé. Agora vá até a porta da 3B.");
    sinalizarMissao();
    return;
  }
  mostrarMensagem(plano === "pegar" ? "O Zé está olhando. Preciso que a Millena distraia ele primeiro." : "Se eu mexer aí, o Zé vai ver. Primeiro preciso distraí-lo.");
}

// Porta da 3B (corredor): de noite, só abre com a chave do Zé
function usarPorta3B(dentro) {
  if (noiteAtiva() && historia.pegouChaveZe) {
    mostrarMensagem("A chave do Zé girou na fechadura.");
    mudarCena("aula_3b", dentro.x, dentro.y, "cima");
    return;
  }
  if (noiteAtiva()) { mostrarMensagem("Trancada. Preciso da chave do Zé."); return; }
  espiarSala("3B");
}

// ---------- Amigo do papai na Zona Leste (DIA 5, UMA ÚNICA VEZ) ----------
// Ele só aparece no dia 2 (estrada sul, aviso) e neste dia 5, na Zona Leste. A Dellalos conta TUDO que já descobriu (o relato muda
// conforme o que ela sabe), ele avisa para ter cuidado e entrega a DÁLIA, a lâmina que ele diz ser do pai dela. Não dá mais moedas.
// Depois de entregar a Dália ele some para sempre (historia.recebeuDalia). Não dá para dormir no dia 5 antes de falar com ele.
// A Dália sobe do nível 1 ao 5 na loja Necro, à noite (js/loja.js: NECRO_ITENS, +1 de dano por nível).
function amigoLesteDisponivel() { return diaAtual() === DIA_AMIGO_LESTE && !historia.recebeuDalia; }

// Gaby (Zona Leste): luta a partir do DIA_GABY, até o dia final; some quando cai (gabyDerrotada) ou quando a história dela termina (gabyFim)
function gabyDisponivel() {
  const dia = diaAtual();
  return dia >= DIA_GABY && dia < DIA_FINAL && !historia.gabyDerrotada && !historia.gabyFim;
}

function relatoDaDellalos() {
  const r = [];
  if (historia.achouCaderno)       r.push("Achei o caderno do papai no quarto dele.");
  if (historia.conheceuDeriky)     r.push("Um garoto chamado Deriky me avisou que a cidade é perigosa e que a escola esconde coisas terríveis.");
  if (historia.torneioAnunciado)   r.push("A Millena me contou de um torneio, e a Isabela me chamou para participar.");
  if (historia.derrotouCapataz)    r.push("Na fábrica abandonada, um robô fazia as máquinas funcionarem à noite. Eu derrotei ele.");
  if (historia.luciaContouEspiritos) r.push("A Dona Lúcia contou que o avô dela e cinco amigos expulsaram os espíritos da cidade. Um deles se chamava Perroti Dellalos.");
  if (historia.mostrouRetratoNathalia) r.push("Mostrei o retrato dos heróis à Nathalia: o pai dela tem uma foto igual, e o sobrenome dela é Master, o mesmo do Julio Master.");
  if (historia.recebeuCarta8)      r.push("Recebi outra carta do papai: ele chega logo e mandou eu ficar longe do hospedeiro.");
  if (historia.entendeuJPMLR)      r.push("Na capela estão gravadas as letras JPMLR: as iniciais dos cinco amigos do avô da Dona Lúcia.");
  if (historia.pegouOrdemFabrica)  r.push("Achei uma ordem de serviço sobre equipamentos para um evento da escola.");
  if (historia.leuAltar)           r.push("Achei um altar numa capela da colina. Diz que o Caos tem fome e quer dez sacrifícios.");
  if (historia.caosSaciado)        r.push("Eu ofereci as dez essências ao altar. Depois ouvi uma voz dizendo que eu voltaria.");
  if (historia.falouDurval)        r.push("Uma noite a Millena me chamou até a escola. Lá a Isabela disse que o Durval, um antigo professor, é o líder da seita.");
  if (historia.noiteDurvalFalou)   r.push("O Durval disse que só precisa do Lucas e mandou eu e a Millena irmos embora.");
  if (historia.matouSombraNoite)   r.push("Eu fiquei, e uma sombra me atacou. Consegui derrotá-la.");
  if (historia.revelouSeita)       r.push("O Simon e o Deriky me contaram que existe uma seita na cidade.");
  if (historia.viuMariana)         r.push("Na sala 1A, uma menina chamada Mariane disse que íamos morrer ali, e uma criatura preta atacou.");
  if (historia.fimChave1A)         r.push("Depois da 1A, eu, a Millena e a Nathalia fizemos um acordo.");
  if (historia.thainaFim)          r.push("Achei o Lucas na Zona Oeste, mas não era ele: era o Caos, no corpo dele. Ele disse que eu viveria mais um tempo.");
  if (historia.marianaNorteFim)    r.push("Na Zona Norte a Mariane disse que isso é consequência dos pecados das famílias Dellalos. Ela descende de Luiz Inácio e Renan Santos e tem o sangue sagrado dobrado.");
  if (historia.lucasContado)       r.push("Contei ao Lucas o que está acontecendo, e ele já sabia.");
  if (historia.gabySalva)          r.push("A Isabela controlou uma aluna, a Gaby, e ela me atacou aqui na Zona Leste. Usei um amuleto estranho da loja e ela voltou ao normal. Ela disse que a Isabela quer a entidade de volta.");
  if (historia.gabyMorta)          r.push("A Isabela controlou uma aluna, a Gaby, e ela me atacou aqui na Zona Leste. Eu tive que matá-la.");
  return r;
}

function conversarAmigoLeste() {
  const ele = "Amigo do papai", eu = "Dellalos";
  const primeira = diario.escolhas.amigoLesteDia === undefined;
  const falas = [];
  falas.push({ quem: ele, texto: primeira ? "Dellalos! Ainda bem que te achei. Me conta o que você descobriu até agora." : "Você voltou. Ainda tenho uma coisa para te entregar." });
  const relato = relatoDaDellalos();
  if (relato.length === 0) falas.push({ quem: eu, texto: "Ainda não descobri nada importante." });
  for (const t of relato) falas.push({ quem: eu, texto: t });
  falas.push({ quem: ele, texto: "Escuta com muita atenção: tenha cuidado. Isso é mais perigoso do que você imagina." });
  falas.push({ quem: ele, texto: "Seu pai me pediu para te entregar isto quando chegasse a hora. Esta é a Dália." });
  falas.push({ quem: eu, texto: "A Dália...?" });
  falas.push({ quem: ele, texto: "É do seu pai. Ela guarda a força de quem a empunha, mas só cresce com quem sabe aprimorá-la." });
  falas.push({ quem: ele, texto: "Na Zona Leste, de noite, existe uma loja estranha. O dono entende dessas coisas. Procure por ele." });
  falas.push({ quem: ele, texto: "Agora eu preciso ir. Não vamos nos ver de novo. Cuide-se, Dellalos." });
  abrirDialogo(falas, function () {
    if (!darItem("dalia")) {
      mostrarMensagem("Meu inventário está cheio. Libere um espaço (ou compre a mochila maior) e volte a falar com ele.");
      return;      // ele continua ali até a Dellalos ter onde guardar a Dália
    }
    diario.escolhas.amigoLesteDia = diaAtual();
    if (!diario.escolhas.daliaNivel) diario.escolhas.daliaNivel = 1;
    historia.recebeuDalia = true;
    historia.daliaEquipada = true;
    historia.adagaEquipada = false;      // a Dália fica no lugar da adaga (as duas não somam)
    mostrarMensagem("Você recebeu a Dália (nível 1). Ela já está equipada: +1 de dano.");
    sinalizarMissao();
  });
}

// ---------- Final da 3B (parte 5) ----------
// Depois de falar com a Isabela e o Durval: o Durval manda as duas saírem. Ficar = a sombra ataca e é preciso lutar.
// Depois, a Millena se despede e sai; só então a Dellalos pode voltar para casa. Verificada a cada quadro (js/missoes.js).
let millenaNoiteSaindo = false;
function surgirSombraNoite() {
  const i = criarInimigo("sombra_noite", 10 * TILE + TILE / 2, 6 * TILE + 40, 0);
  posicionarInimigoLivre(i);
  inimigos.push(i);
}
function verificarEventosNoite3B() {
  if (!noiteAtiva() || idDaCena(cenaAtual) !== "aula_3b") return false;

  // 1) O Durval fala e a Dellalos escolhe ficar ou sair
  if (historia.falouIsabela3B && historia.falouDurval && !historia.noiteDurvalFalou) {
    abrirDialogo(DIALOGOS.noite.durvalFim, function () {
      historia.noiteDurvalFalou = true;
      if (historia.noiteFicou) { surgirSombraNoite(); mostrarMensagem("Uma sombra surgiu e atacou! Lute (botão A)."); }
    });
    return true;
  }
  if (!historia.noiteDurvalFalou) return false;

  // 2) Ficou: precisa derrotar a sombra (se perder, ela reaparece quando voltar à 3B)
  if (historia.noiteFicou && !historia.matouSombraNoite) {
    if (!inimigos.some((i) => i.tipoId === "sombra_noite")) { surgirSombraNoite(); mostrarMensagem("A sombra voltou!"); }
    return false;
  }

  // 3) A Millena se despede e sai pela porta
  if (!historia.noiteMillenaSaiu && !millenaNoiteSaindo) {
    abrirDialogo(DIALOGOS.noite.millenaFim(!!historia.noiteFicou), function () {
      const mil = npcDaCena("aula_3b", "Millena");
      const terminar = function () {
        millenaNoiteSaindo = false;
        historia.noiteMillenaSaiu = true;
        historia.noite3BFim = true;
        mostrarMensagem("Preciso ir para casa o mais rápido possível.");
        sinalizarMissao();
      };
      if (!mil) { terminar(); return; }
      millenaNoiteSaindo = true;
      npcIrEmbora(mil, PORTAS.aula.x * TILE + TILE / 2, PORTAS.aula.y * TILE + 90, 200, terminar);
    });
    return true;
  }
  return false;
}

// Escurece a estrada durante a noite (chamada por js/desenho.js, por cima do mundo e por baixo da interface)
function desenharNoite() {
  if (!noiteAtiva() || idDaCena(cenaAtual) !== "estrada") return;
  ctx.setTransform(ESCALA, 0, 0, ESCALA, 0, 0);
  ctx.fillStyle = "rgba(8,12,40,0.55)";
  ctx.fillRect(0, 0, VIEW_L, VIEW_A);
}

function diaAtual() {
  const n = Number(diario.escolhas.dia);
  if (n >= 1) return Math.min(Math.floor(n), DIA_FINAL);
  return historia.novoDia ? 2 : 1;      // save antigo: sem contador, novoDia = dia 2
}

// Ela foi para a escola hoje? (save antigo no dia 2 usa chegouEscolaDia2)
function escolaHoje() {
  if (diario.escolhas.escolaDia === diaAtual()) return true;
  return diaAtual() === 2 && historia.chegouEscolaDia2;
}
function passeouHoje() { return diario.escolhas.passeioDia === diaAtual(); }

function marcarEscolaHoje() {
  if (!historia.novoDia) return;        // dia 1 segue as missões da história
  diario.escolhas.escolaDia = diaAtual();
}
function marcarPasseioHoje() {
  if (!historia.novoDia || !escolaHoje()) return;   // passeio só vale depois da escola
  diario.escolhas.passeioDia = diaAtual();
}

// Chamado por entrarNaCena() (via js/missoes.js)
function aoEntrarNaCenaDia(id) {
  // Noite do dia 4: entrou na 3C; e ao voltar da 3B para o corredor a noite termina
  if (noiteAtiva() && historia.noitePlano && id === "aula_3c") historia.noiteEntrou3C = true;
  if (noiteAtiva() && historia.noite3BFim && id !== "aula_3b") historia.noiteFim = true;   // saiu da 3B depois do fim da cena: a noite acabou (qualquer saída)
  if (!historia.novoDia) return;
  if (id === "escola" || id === "escola2" || id.indexOf("aula") === 0) marcarEscolaHoje();
  else if (id === "bairro_sul" || id === "zona_leste" || id === "zona_leste2" || id === "zona_norte" || id === "zona_norte2" || id === "zona_oeste" || id === "zona_oeste2" || id === "capela" || id === "fabrica" || id === "loja" || id.indexOf("casa_sul_") === 0 || id.indexOf("mansao_") === 0) marcarPasseioHoje();   // inclui entrar nas casas do Bairro Sul
}

// Chamado por js/cena.js quando ela conversa com um NPC: conversar na rua depois da escola conta como passeio
function aoConversarNpc(n) {
  amizadeAoConversar(n);   // pontos diários e progresso das missões pessoais (js/amizade.js)
  exploraAoConversar(n);   // Millena: dica extra do morador, depois da conversa (js/exploracao.js)
  if (!historia.novoDia) return;
  if (n && n.nome === "Amigo do papai") return;   // o recado do amigo faz parte da rotina do dia 2, não é passeio
  const id = idDaCena(cenaAtual);
  if (id === "estrada" || id === "bairro_sul" || id === "zona_leste" || id === "zona_leste2" || id === "zona_norte" || id === "zona_norte2" || id === "zona_oeste" || id === "zona_oeste2" || id === "capela" || id === "fabrica" || id === "loja") marcarPasseioHoje();
}

// Devolve o motivo de NÃO poder dormir agora (texto) ou null se pode
function motivoNaoDormir() {
  const dia = diaAtual();
  if (noiteAtiva() && historia.noite3BFim && idDaCena(cenaAtual) !== "aula_3b") historia.noiteFim = true;   // segurança: a cena da 3B já acabou
  if (noiteAtiva()) return "A Millena me chamou para a escola. Preciso ir agora.";
  if (dia === 1) {
    const ficou = MISSOES.find((m) => m.id === "ficou");
    if (!historia.chegouEmCasa) return "Não posso dormir agora, tenho que ir para a escola.";
    if (!ficou || !missaoConcluida(ficou)) return "Ainda tenho coisas para ver antes de descansar.";
    return null;
  }
  if (dia >= DIA_FINAL) return "Hoje é o dia da volta do papai. Não é hora de dormir.";
  if (!escolaHoje()) return "Ainda não fui para a escola hoje.";
  if (dia === DIA_SEITA && !historia.revelouSeita) return historia.simonAcompanha ? "Preciso levar o Simon até o Deriky antes de descansar." : "Ainda preciso descobrir o que houve com o Simon.";
  if (dia >= DIA_THAINA && historia.revelouSeita && !historia.lucasZonaFim && !historia.thainaPediu) return "Ainda preciso treinar com o Lucas, na Zona Leste, antes de descansar.";
  if (dia === DIA_THAINA && !historia.thainaFim) return historia.sabeOndeLucas ? "Preciso achar o Lucas, na Zona Oeste, antes de descansar." : historia.thainaPediu ? "Preciso descobrir onde o Lucas está antes de descansar." : "Ainda tenho coisas para ver na escola antes de descansar.";
  if (dia === DIA_1A && !historia.fimChave1A) return "Ainda preciso descobrir o que há na sala 1A, com a Millena e a Nathalia.";
  if (dia === 2 && !historia.conheceuAmigoPai) return "Ainda tenho coisas para fazer na cidade antes de descansar.";
  if (dia === DIA_AMIGO_LESTE && !historia.recebeuDalia) return "O amigo do papai está me esperando na Zona Leste. Preciso falar com ele antes de descansar.";
  return null;
}

// Passa para o dia seguinte (chamado quando a tela preta termina)
function comecarProximoDia() {
  const novo = Math.min(diaAtual() + 1, DIA_FINAL);
  diario.escolhas.dia = novo;
  diario.escolhas.cicloT = 0;                  // amanhece: o relógio do dia recomeça (js/ciclo.js)
  historia.novoDia = true;
  jogador.vida = jogador.vidaMax;
  reiniciarInimigos();
  mostrarMensagem(novo >= DIA_FINAL ? "Dia " + novo + ". Hoje o papai volta." : "Dia " + novo + " começou.");
  sinalizarMissao();
  if (typeof avisarArmarioSeNecessario === "function") avisarArmarioSeNecessario();
  if (typeof npcVidaLembretePromessas === "function") npcVidaLembretePromessas();   // v56: lembra as promessas do dia (js/npcvida.js)   // dia 2: fala sobre o armário (js/roupas.js)
  if (novo >= DIA_FINAL) aoAcordarDia10();      // a Dellalos acorda e quer ir logo para a escola (js/dia10.js)
}

// ---------- Dia 8: a segunda carta do papai (entregue pelo Morador, na estrada) ----------
// Assim que ela acorda no dia 8 e pisa na estrada, o Morador, ao lado de casa, chama e entrega a carta.
// Se o jogador pular, o gatilho continua ativo nos dias seguintes até a carta ser entregue.
function cartaMoradorPendente() { return diaAtual() >= DIA_1A && historia.novoDia && !historia.recebeuCarta8 && !noiteAtiva(); }
function abrirCartaDoMorador() {
  abrirDialogo(DIALOGOS.morador.carta, function () {
    historia.recebeuCarta8 = true;
    registrarDocumento("carta_pai2");       // vai para a seção Documentos do diário (js/diario.js)
    sinalizarMissao();
  });
}
function verificarCartaDia8() {
  if (!cartaMoradorPendente() || idDaCena(cenaAtual) !== "estrada") return false;
  abrirCartaDoMorador();
  return true;
}

// Cartão fixo da rotina, no topo da caixa de missões do inventário (a partir do dia 2)
function desenharRotinaNaCaixa(caixa) {
  if (!historia.novoDia) return;
  const dia = diaAtual();
  if (cicloEhNoite()) {      // de noite a única missão é dormir (js/ciclo.js)
    const nd = document.createElement("div");
    nd.className = "missao";
    const nh = document.createElement("h3"); nh.textContent = "MISSÃO DA NOITE";
    const nt = document.createElement("p"); nt.className = "missao-titulo"; nt.textContent = "Dia " + dia + ", de noite";
    const ndesc = document.createElement("p"); ndesc.className = "missao-desc"; ndesc.textContent = "Já escureceu. Agora só dá para voltar para casa e descansar.";
    const nli = document.createElement("p"); nli.className = "missao-desc"; nli.textContent = "☐ Dormir, no sofá da sala";
    nd.append(nh, nt, ndesc, nli);
    caixa.appendChild(nd);
    return;
  }
  const prazo = !!historia.conheceuAmigoPai;       // só sabe do dia final depois de falar com o amigo do papai

  let desc;
  if (dia >= DIA_FINAL) desc = "Hoje é o dia da volta do papai.";   // a contagem some (js/dia10.js)
  else if (prazo) desc = "O papai só confere tudo no dia " + DIA_FINAL + ". Faltam " + (DIA_FINAL - dia) + " dias. Cada escolha conta.";
  else desc = "Mais um dia na cidade.";

  const itens = [{ texto: dia >= DIA_FINAL ? "Ir para a escola, com a Nathalia e a Millena" : "Ir para a escola", ok: escolaHoje() }];
  if (dia === 2) itens.push({ texto: "Falar com o amigo do papai (estrada sul)", ok: !!historia.conheceuAmigoPai });
  if (noiteAtiva()) {
    itens.push({ texto: "Falar com o aluno na porta da escola", ok: !!historia.falouSamuel });
    itens.push({ texto: "Falar com a Millena, no corredor da escola", ok: !!historia.noitePlano });
    itens.push({ texto: "Ir até a sala 3C (palestra do Zé)", ok: !!historia.noiteEntrou3C });
    itens.push({ texto: "Pegar a chave do Zé", ok: !!historia.pegouChaveZe });
    itens.push({ texto: "Abrir a 3B e ver quem está lá", ok: !!historia.noiteDurvalFalou });
    itens.push({ texto: "Voltar para casa o mais rápido possível", ok: false });
  }
  if (dia === DIA_AMIGO_LESTE) itens.push({ texto: "Falar com o amigo do papai, na Zona Leste", ok: !!historia.recebeuDalia });
  if (dia >= 5 && dia < DIA_FINAL && (dia === 5 || !historia.luciaContouEspiritos)) itens.push({ texto: "Ouvir a história da Dona Lúcia (Bairro Sul, opcional)", ok: !!historia.luciaContouEspiritos });
  if (dia === DIA_SEITA) itens.push({ texto: "Descobrir onde o Simon está (Bairro Sul)", ok: !!historia.revelouSeita });
  if (dia >= DIA_SEITA && dia <= DIA_THAINA && historia.revelouSeita && !historia.thainaPediu) itens.push({ texto: "Zona Leste: treinar com o Lucas", ok: !!historia.lucasZonaFim });
  if (dia === DIA_THAINA) itens.push({ texto: "Descobrir onde o Lucas está (a Thaina sabe de algo)", ok: !!historia.sabeOndeLucas });
  if (dia === DIA_THAINA && historia.sabeOndeLucas) itens.push({ texto: "Achar o Lucas, na Zona Oeste", ok: !!historia.thainaFim });
  if (dia >= DIA_1A && dia < DIA_FINAL && !historia.recebeuCarta8) itens.push({ texto: "Falar com o Morador, na calçada ao lado de casa", ok: false });
  if (dia === DIA_1A) itens.push({ texto: "Descobrir o que há na sala 1A", ok: !!historia.fimChave1A });
  if (dia >= DIA_GABY && dia < DIA_FINAL && (dia === DIA_GABY || !historia.gabyFim)) itens.push({ texto: "Zona Leste: uma aluna está agindo de forma estranha (opcional)", ok: !!historia.gabyFim });
  if (dia < DIA_FINAL) for (const it of itensAgendaDoDia(dia)) itens.push(it);   // missão do dia (js/calendario.js)
  if (dia >= DIA_FINAL) {      // dia 10: escola com a Nathalia e a Millena, depois os três (js/dia10.js)
    if (escolaHoje()) {
      itens.push({ texto: "Zona Leste: encontrar a Isabela", ok: !!historia.isabelaD10Fim });
      itens.push({ texto: "Zona Oeste: encontrar a Thaina", ok: !!historia.thainaD10Fim });
      itens.push({ texto: "Zona Norte: encontrar o Lucas (o Caos)", ok: !!historia.lucasD10Fim });
      if (historia.dia10TresFim) itens.push({ texto: "Bairro Sul: enfrentar a Mariane e o Durval", ok: !!historia.durvalD10Fim });
      if (historia.durvalD10Fim) itens.push({ texto: "Voltar para casa o mais rápido possível", ok: !!historia.casaD10Fim });
      if (historia.casaD10Fim) itens.push({ texto: "Oeste 2: participar do torneio na arena", ok: !!historia.torneioFim });   // js/torneio.js
    }
  }
  if (dia < DIA_FINAL) {
    itens.push({ texto: "Passear pela cidade (opcional: missões secundárias)", ok: passeouHoje() });
    itens.push({ texto: "Dormir, no sofá da sala", ok: false });
  }

  const div = document.createElement("div");
  div.className = "missao";
  const h = document.createElement("h3");
  h.textContent = "MISSÃO DO DIA";
  const t = document.createElement("p");
  t.className = "missao-titulo";
  t.textContent = prazo && dia < DIA_FINAL ? "Dia " + dia + " de " + DIA_FINAL : "Dia " + dia;
  const d = document.createElement("p");
  d.className = "missao-desc";
  d.textContent = desc;
  div.append(h, t, d);
  for (const o of itens) {
    const li = document.createElement("p");
    li.className = "missao-desc";
    li.textContent = (o.ok ? "☑ " : "☐ ") + o.texto;
    div.appendChild(li);
  }
  caixa.appendChild(div);
}

// "Dia N" pequeno no topo da tela (desenhado por js/hud.js)
function desenharDia() {
  if (!historia.novoDia || telaTempo) return;
  const texto = "Dia " + diaAtual() + (cicloValido() ? (cicloEhNoite() ? "  \u{1F319}" : "  \u2600\uFE0F") : "");   // sol ou lua (js/ciclo.js)
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  const larg = ctx.measureText(texto).width + 32;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(VIEW_L / 2 - larg / 2, 20, larg, 38);
  ctx.fillStyle = "#f3e6c8";
  ctx.fillText(texto, VIEW_L / 2, 48);
  if (cicloValido()) desenharRelogioCiclo(larg);   // barrinha do tempo (js/ciclo.js)
}

// ---------- Capítulo do torneio ----------
// 1) Deriky (Bairro Sul) avisa que a cidade é perigosa  (diario.escolhas.derikyDia guarda o dia)
// 2) No dia SEGUINTE, a Millena conta do torneio na escola
// 3) Depois disso, a Isabela convida a Dellalos perto da casa (js/salas/estrada.js)
function torneioPronto() {
  const d = diario.escolhas.derikyDia;
  return !!historia.conheceuDeriky && !historia.torneioAnunciado && d !== undefined && diaAtual() > d;
}

// Momentos da história que têm prioridade sobre a conversa de amizade (js/amizade.js pergunta isto antes)
function eventoDeHistoriaPendente(nome) {
  return nome === "Millena" && torneioPronto();
}
