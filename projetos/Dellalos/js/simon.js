/* =====================================================
   simon.js - DIA_SEITA: "O amigo que faltou"
   HISTÓRIA (o dia é DIA_SEITA, em js/dias.js: hoje o dia 6)
     - No dia da revelação o Simon não está na escola. O Lucas e o Vitinho dizem que ele faltou.
     - Ele está no Bairro Sul, procurando um amigo (o Deriky). Ao conversar, o Simon passa a
       ANDAR JUNTO com a Dellalos (usa a função de companheiro de js/amizade.js, mas só nesta parte).
     - Ao chegar no Deriky com o Simon, acontece a conversa dos três (DIALOGOS.simonDia4.revelacao
       em js/dialogos.js): o torneio é plano de uma seita que rouba energia vital dos jovens para
       alimentar o Caos. Eles mandam ter cuidado, principalmente com a Isabela, e vão embora andando.
     - No dia seguinte o Simon volta para a escola (campo  se  do Simon em js/salas/escola.js).

   TAMBÉM AQUI: acompanhante temporário geral (Simon no DIA_SEITA; Millena ou Nathalia no DIA_1A, js/chave1a.js)
   e a regra de depois do DIA_SEITA: Isabela e Thaina só falam do torneio (dialogoSeitaBloqueia).

   FLAGS (em historia, salvas): soubeSimonFaltou, achouSimon, simonAcompanha, revelouSeita
   SALVO EM diario.escolhas.compAntes: o companheiro de amizade que a Dellalos já tinha (volta no fim).

   ONDE LIGA NOS OUTROS ARQUIVOS (só linhas pequenas)
     js/amizade.js     criarCompanheiro (npcExtraCompanheiro) | atualizarCompanheiro (atualizarAcompanhanteTemp)
                       definirCompanheiro (não troca de companheiro enquanto o Simon anda junto)
     js/salas/escola.js    Simon some no DIA_SEITA; Lucas e Vitinho respondem (dia4SimonFaltou)
     js/salas/bairrosul.js Simon e Deriky no Bairro Sul
     js/missoes.js     missão secundária "O amigo que faltou" + aviso ao chegar na escola
     js/dias.js        não deixa dormir no DIA_SEITA antes de resolver
   ===================================================== */

// Só durante a animação de saída (não precisa salvar): os dois ainda aparecem andando embora
let simonSaindo = false;
let derikySaindo = false;

// ----- Quem está onde -----
// Simon na escola: todos os dias, menos o DIA_SEITA (ele volta no dia seguinte)
function simonNaEscola() { return historia.novoDia && diaAtual() !== DIA_SEITA; }

// Simon no Bairro Sul: só no DIA_SEITA, até levá-lo ao Deriky (e durante a saída andando)
function simonNoSul() {
  return simonSaindo || (diaAtual() === DIA_SEITA && !historia.revelouSeita && !historia.simonAcompanha);
}

// Deriky no Bairro Sul: desde o dia 2; depois da conversa do DIA_SEITA ele vai embora
function derikyNoSul() { return historia.novoDia && (!historia.revelouSeita || derikySaindo || derikyVoltou()); }   // derikyVoltou: DIA_THAINA (js/thaina.js)

function npcDaCena(idCena, nome) {
  const cena = CENAS[idCena];
  return (cena && (cena.npcs || []).find((n) => n.nome === nome)) || null;
}

// O Simon que anda junto usa o desenho do Simon do Bairro Sul (js/amizade.js pergunta por aqui)
function npcExtraCompanheiro(nome) {
  return nome === "Simon" ? npcDaCena("bairro_sul", "Simon") : null;
}

// ----- Lucas e Vitinho, no DIA_SEITA -----
// quem = "lucas" ou "vitinho". Devolve true se abriu a conversa (a conversa normal não acontece).
function dia4SimonFaltou(quem) {
  if (diaAtual() !== DIA_SEITA || historia.revelouSeita || !historia.conheceuLucas) return false;
  const D = DIALOGOS.simonDia4;
  if (historia.soubeSimonFaltou) { abrirDialogo(D[quem + "Lembrar"]); return true; }
  abrirDialogo(D[quem], function () { historia.soubeSimonFaltou = true; });
  return true;
}

// ----- O Simon passa a andar junto -----
// Fim da conversa dele no Bairro Sul
function iniciarSimonAcompanha() {
  historia.achouSimon = true;
  historia.simonAcompanha = true;
  const a = AM();
  diario.escolhas.compAntes = a.comp || "";      // guarda o companheiro de amizade; ele espera até o fim
  a.comp = "";
  companheiro = null;                             // criado de novo (agora o Simon) no próximo quadro
  filaAmizade.push("O Simon anda com você. Leve-o até o Deriky.");
  sinalizarMissao();
}

// Quem está andando junto agora só por causa de uma missão (ou "" se ninguém):
//   Simon (DIA_SEITA)  |  Millena ou Nathalia (DIA_1A, js/chave1a.js)
function nomeAcompanhanteTemp() {
  if (historia.simonAcompanha) return "Simon";
  if (historia.chaveAcompanha) return diario.escolhas.chaveCom || "";
  return "";
}

// Chamado por atualizarCompanheiro (js/amizade.js) a cada quadro. Devolve true se alguém anda junto por missão.
function atualizarAcompanhanteTemp(dt) {
  const nome = nomeAcompanhanteTemp();
  if (!nome) return false;
  if (!companheiro || companheiro.nome !== nome) {
    companheiro = criarCompanheiro(nome);
    if (!companheiro) return false;
  }
  const c = companheiro;
  if (c.cena !== cenaAtual) posicionarCompanheiro(c);
  seguirCompanheiro(c, dt);
  return true;
}

// Depois da conversa do DIA_SEITA, Isabela e Thaina não conversam mais: só falam do torneio
function dialogoSeitaBloqueia(nome) {
  return !!historia.revelouSeita && (nome === "Isabela" || nome === "Thaina");
}

// ----- Fim da conversa dos três: Deriky e Simon vão embora andando -----
function aoTerminarRevelacaoSeita() {
  historia.revelouSeita = true;
  historia.simonAcompanha = false;

  const simon = npcDaCena("bairro_sul", "Simon");
  const deriky = npcDaCena("bairro_sul", "Deriky");

  // O Simon "de verdade" (NPC) reaparece onde o acompanhante estava e sai andando
  if (simon && companheiro && companheiro.nome === "Simon") {
    simon.x = companheiro.x;
    simon.y = companheiro.y;
    simon.direcao = companheiro.direcao || "baixo";
  }
  companheiro = null;

  // O companheiro de amizade de antes volta a andar com a Dellalos
  const antes = diario.escolhas.compAntes || "";
  AM().comp = dialogoSeitaBloqueia(antes) ? "" : antes;     // Isabela e Thaina não voltam a andar junto
  diario.escolhas.compAntes = "";

  // Os dois seguem pela Rua do Jardim, para o oeste, até sumir
  if (simon) {
    simonSaindo = true;
    npcIrEmbora(simon, 10 * TILE, 29 * TILE + 58, 115, function () { simonSaindo = false; });
  }
  if (deriky) {
    derikySaindo = true;
    npcIrEmbora(deriky, 10 * TILE, 30 * TILE + 58, 105, function () { derikySaindo = false; });
  }
}
