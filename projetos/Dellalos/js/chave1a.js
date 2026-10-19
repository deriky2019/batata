/* =====================================================
   chave1a.js - DIA_1A (js/dias.js, hoje o dia 8): "A sala 1A" (Millena ou Nathalia)
   HISTÓRIA (até onde está escrita; a missão CONTINUA depois da cena da Mariane)
     1) Só começa se a Dellalos contar da seita e do torneio à Millena ou à Nathalia (sala 2A / 2C,
        depois da conversa do DIA_SEITA). Quem ouve diz que sempre achou a escola estranha, que os alunos têm
        teorias sobre a sala 1A e que a chave só fica com a diretora, que mora no Bairro Sul.
     2) Essa amiga anda junto com a Dellalos (companheiro SÓ nesta missão: js/simon.js).
     3) Na casa da diretora (a "casa vazia" do Bairro Sul) a Dellalos pega a chave num baú.
     4) Com a chave ela abre a porta da 1A, no corredor da escola.
     5) Na 1A está a Mariane: "vocês não podem estar aqui... vão morrer aqui mesmo". Uma criatura preta
        (inimigo "sombra", js/inimigos.js) surge e ataca. Depois que a Dellalos a derrota, a Mariane sai
        correndo e some.
     6) Final: a Dellalos vai até a OUTRA amiga (contou à Millena -> vai à Nathalia, e vice-versa). As três
        conversam sobre o torneio e a necessidade de ajuda; a Nathalia revela que o grupo dos meninos também está
        envolvido, principalmente o Lucas; elas fazem o acordo de que o que uma descobrir, conta às outras.
        Aí a missão termina (historia.fimChave1A) e o companheiro de antes volta.

   FLAGS (em historia, salvas): contouSeita, chaveAcompanha, pegouChave1A, abriu1A, viuMariana,
     matouSombra, marianaFugiu, viuFugaMariana, fimChave1A (= fim da missão)   |   diario.escolhas: chaveCom, chave1a_oferta, compAntes

   ONDE LIGA: js/salas/aulas.js (Millena, Nathalia, sala aula_1a e a Mariane) | js/salas/escola.js (porta da 1A) |
     js/salas/casassul.js (baú) | js/missoes.js (missão e verificarEventosChave1A) | js/inimigos.js (sombra)
   ===================================================== */

let marianaCorrendo = false;     // só durante a corrida (não precisa salvar)

// A Mariane está na sala 1A: desde que a porta abre até ela fugir (e enquanto corre)
function marianaNaSala() { return !historia.marianaFugiu || marianaCorrendo; }

// ----- Começo: contar da seita à Millena ou à Nathalia (a partir do DIA_1A) -----
// Chamado no começo do conversar delas. Devolve true se abriu a conversa (a conversa normal não acontece).
function chave1AOferta(nome) {
  if (diaAtual() < DIA_1A || !historia.revelouSeita || historia.contouSeita) return false;
  if (nome === "Millena" && torneioPronto()) return false;       // o momento de história do torneio tem prioridade
  const lista = nome === "Millena" ? DIALOGOS.chave1a.millenaOferta : DIALOGOS.chave1a.nathaliaOferta;
  abrirDialogo(lista, function () {
    if (diario.escolhas.chave1a_oferta === "contar") iniciarChave1A(nome);
  });
  return true;
}

// A amiga passa a andar junto (o companheiro de amizade que a Dellalos já tinha espera até o fim)
function iniciarChave1A(nome) {
  historia.contouSeita = true;
  historia.chaveAcompanha = true;
  diario.escolhas.chaveCom = nome;
  const a = AM();
  diario.escolhas.compAntes = a.comp || "";
  a.comp = "";
  companheiro = null;                         // criado de novo (agora a amiga) no próximo quadro
  filaAmizade.push(nome + " vai com você até a casa da diretora.");
  avisarNovaSecundaria("chave1a");            // "Nova missão: A sala 1A." (js/missoes.js)
  sinalizarMissao();
}

// Para a próxima parte da história: a amiga deixa de andar junto e o companheiro de antes volta
function terminarAcompanhanteChave() {
  if (!historia.chaveAcompanha) return;
  historia.chaveAcompanha = false;
  const antes = diario.escolhas.compAntes || "";
  AM().comp = dialogoSeitaBloqueia(antes) ? "" : antes;
  diario.escolhas.compAntes = "";
  diario.escolhas.chaveCom = "";
  companheiro = null;
}

// ----- A chave: baú na casa da diretora (a "casa vazia" do Bairro Sul) -----
function usarBauDiretora() {
  if (!historia.contouSeita) { mostrarMensagem("Um baú velho. Parece não ter nada dentro."); return; }
  if (historia.pegouChave1A) { mostrarMensagem("O baú está vazio agora."); return; }
  if (!darItem("chave_1a")) return;           // inventário cheio: tenta de novo depois
  historia.pegouChave1A = true;
  const com = diario.escolhas.chaveCom || "Millena";
  mostrarMensagem("Você pegou: " + ITENS.chave_1a.nome + ".");
  abrirDialogo([
    { quem: "Dellalos", texto: "Tem uma chave aqui dentro, com a etiqueta 1A!" },
    { quem: com,        texto: "Então esta é mesmo a casa da diretora. Vamos para a escola." }
  ]);
}

// ----- A porta da 1A, no corredor da escola (js/salas/escola.js) -----
function usarPorta1A(dentro) {
  const entrar = () => mudarCena("aula_1a", dentro.x, dentro.y, "cima");
  if (historia.abriu1A) { entrar(); return; }
  if (temItem("chave_1a")) {
    tirarItem("chave_1a");
    historia.abriu1A = true;
    mostrarMensagem("A chave girou na fechadura.");
    entrar();
    return;
  }
  mostrarMensagem(historia.contouSeita ? "Trancada. A chave só fica com a diretora, no Bairro Sul." : "Ainda não disponível.");
}

// ----- Cena da Mariane (verificada a cada quadro por verificarMissoes) -----
function surgirSombra() {
  const i = criarInimigo("sombra", 10 * TILE + TILE / 2, 6 * TILE + 40, 0);
  posicionarInimigoLivre(i);
  inimigos.push(i);
}

// Devolve true se abriu alguma conversa neste quadro
function verificarEventosChave1A() {
  if (idDaCena(cenaAtual) !== "aula_1a") return false;
  const com = diario.escolhas.chaveCom || "Millena";

  // 1) Entrou na 1A: a Mariane fala e a criatura preta surge
  if (historia.abriu1A && !historia.viuMariana) {
    abrirDialogo(DIALOGOS.chave1a.mariana(com), function () {
      historia.viuMariana = true;
      surgirSombra();
      mostrarMensagem("Uma criatura preta surgiu das sombras!");
    });
    return true;
  }

  // 2) Criatura derrotada: a Mariane sai correndo pela porta e some
  if (historia.viuMariana && historia.matouSombra && !historia.marianaFugiu && !marianaCorrendo) {
    const mariana = npcDaCena("aula_1a", "Mariane");
    if (!mariana) { historia.marianaFugiu = true; return false; }
    marianaCorrendo = true;
    npcIrEmbora(mariana, PORTAS.aula.x * TILE + TILE / 2, PORTAS.aula.y * TILE + 90, 230, function () {
      marianaCorrendo = false;
      historia.marianaFugiu = true;
    });
    return false;
  }

  // 3) Ela já sumiu: as duas comentam (a história continua depois daqui)
  if (historia.marianaFugiu && !historia.viuFugaMariana) {
    const outra = com === "Millena" ? "Nathalia" : "Millena";
    abrirDialogo(DIALOGOS.chave1a.depoisMariana(com, outra), function () {
      historia.viuFugaMariana = true;
      filaAmizade.push("Vá contar à " + outra + ", na sala dela.");
    });
    return true;
  }
  return false;
}

// ----- Final: a Dellalos leva a novidade à OUTRA amiga (a que não veio junto). As três fazem um acordo. -----
// Chamado no começo do conversar da Millena e da Nathalia. Devolve true se abriu a conversa.
function chave1AFinal(nome) {
  if (!historia.viuFugaMariana || historia.fimChave1A) return false;
  const com = diario.escolhas.chaveCom;
  if (!com || nome === com) return false;
  abrirDialogo(DIALOGOS.chave1a.final(com, nome), function () {
    historia.fimChave1A = true;            // conclui a missão "A sala 1A" (js/missoes.js)
    terminarAcompanhanteChave();           // a amiga deixa de andar junto; o companheiro de antes volta
  });
  return true;
}
