/* =====================================================
   missoes.js - Missões e objetivos
   A missão ativa aparece no inventário (botão 🎒).
   Para criar outra missão: adicione um item em MISSOES (a ordem é a da história),
   crie a chave (true/false) em "historia" (js/dialogos.js) e marque-a como true
   no lugar certo (ex.: em aoEntrarNaCena ou numa conversa).
   O progresso é salvo junto com "historia" (js/salvamento.js).
   ===================================================== */

/* Campos de cada missão (os opcionais só existem nas missões novas):
     id, titulo, descricao
     chave      -> flag de historia (texto) OU função que devolve true quando concluída
     aviso      -> flag de historia: já avisou "Nova missão"?
     requer     -> (opcional) ids de missões que precisam estar concluídas antes
     objetivos  -> (opcional) [{ texto, ok: () => true/false }], aparecem no diário
     auto       -> (opcional) true = o jogo detecta a conclusão sozinho (verificarMissoes)
     npcs, itens, recompensa -> (opcional) anotações sobre quem/o que participa
   O progresso vem só de "historia" e "diario", que já são salvos: carregar o jogo no meio
   de uma missão continua do mesmo ponto. */
const MISSOES = [
  {
    id: "escola",
    titulo: "Ir para a escola",
    descricao: "Siga pela avenida até a escola, no lado direito da cidade, e entre pela porta.",
    chave: "chegouNaEscola",         // quando historia.chegouNaEscola vira true, a missão está concluída
    aviso: "avisouMissaoEscola"      // já avisou "Nova missão"?
  },
  {
    id: "millena",
    titulo: "Falar com a Millena",
    descricao: "A Millena está na sala 2A, a segunda porta do corredor da escola. Chegue perto dela e aperte B.",
    chave: "conheceuMillena",
    aviso: "avisouMissaoMillena"
  },
  {
    id: "casa",
    titulo: "Ir para casa",
    descricao: "A aula acabou. Saia da escola e volte para a casa laranja, na esquerda da cidade.",
    chave: "chegouEmCasa",
    aviso: "avisouMissaoCasa"
  },
  {
    id: "morador",
    titulo: "Falar com o Morador",
    descricao: "O Morador, que passeia pela calçada entre as casas, tem algo para você. Chegue perto e aperte B.",
    chave: "recebeuChaveQuarto",
    aviso: "avisouMissaoMorador"
  },
  {
    id: "quarto",
    titulo: "Entrar no quarto do pai",
    descricao: "Use a chave na porta do quarto do papai, dentro da sua casa, e entre.",
    chave: "entrouQuartoPai",
    aviso: "avisouMissaoQuarto"
  },

  // ---------- Missões novas (conteúdo PROVISÓRIO: ajuste com a história original) ----------
  {
    id: "ficou",
    titulo: "O que ficou para trás",
    descricao: "O quarto do papai guarda o que ele deixou. Pegue a carta, leia e procure entre os livros.",
    requer: ["quarto"],
    auto: true,
    npcs: [],
    itens: ["carta_pai", "caderno_pessoal"],
    recompensa: "Caderno pessoal e a carta no diário.",
    objetivos: [
      { texto: "Pegar a carta na escrivaninha",                ok: () => historia.pegouCartaPai },
      { texto: "Ler a carta (🎒, toque nela e em Examinar)",   ok: () => historia.leuCartaPai },
      { texto: "Procurar algo na estante do quarto",           ok: () => historia.achouCaderno }
    ],
    chave: () => historia.pegouCartaPai && historia.leuCartaPai && historia.achouCaderno,
    aviso: "avisouMissaoFicou"
  },
  {
    id: "novodia",
    titulo: "Um novo dia",
    descricao: "Já foi um dia cheio. Descanse no sofá da sala e volte para a escola no dia seguinte.",
    requer: ["ficou"],
    auto: true,
    npcs: [],
    itens: [],
    objetivos: [
      { texto: "Descansar no sofá da sala",   ok: () => historia.novoDia },
      { texto: "Ir para a escola",            ok: () => historia.chegouEscolaDia2 }
    ],
    chave: () => historia.novoDia && historia.chegouEscolaDia2,
    aviso: "avisouMissaoDia"
  },
  {
    id: "lucas",
    titulo: "Novos encontros",
    descricao: "Tem gente que você ainda não conhece no corredor da escola. Aproxime-se e converse.",
    requer: ["novodia"],
    auto: true,
    npcs: ["Lucas", "Simon", "Vitinho"],
    itens: [],
    recompensa: "Novas informações no diário.",
    objetivos: [
      { texto: "Conversar com o Lucas, no corredor", ok: () => historia.conheceuLucas }
    ],
    chave: () => historia.conheceuLucas,
    aviso: "avisouMissaoLucas"
  },
  {
    id: "nathalia",
    titulo: "Uma cara curiosa",
    descricao: "Uma colega da sala 2C parece querer falar com você.",
    requer: ["lucas"],
    auto: true,
    npcs: ["Nathalia"],
    itens: [],
    recompensa: "Nova informação no diário.",
    objetivos: [
      { texto: "Conversar com a Nathalia, na sala 2C", ok: () => historia.conheceuNathalia }
    ],
    chave: () => historia.conheceuNathalia,
    aviso: "avisouMissaoNathalia"
  }
];

// Concluída: a "chave" é uma flag de historia (missões antigas) ou uma função (missões novas)
const missaoConcluida = (m) => typeof m.chave === "function" ? !!m.chave() : historia[m.chave] === true;

// Liberada: todas as missões em "requer" já foram concluídas (sem "requer" = sempre liberada)
function missaoLiberada(m) {
  return (m.requer || []).every((id) => {
    const outra = MISSOES.find((x) => x.id === id);
    return !outra || missaoConcluida(outra);
  });
}

// A primeira missão liberada que ainda não foi concluída (ou null)
function missaoAtiva() {
  return MISSOES.find((m) => missaoLiberada(m) && !missaoConcluida(m)) || null;
}

// Chamado a cada quadro (js/main.js): detecta sozinho a conclusão das missões "auto"
// e dispara pequenos eventos de história. Espera mensagens e conversas terminarem.
function verificarMissoes() {
  if (transicao || dialogoAberto || telaTempo || mensagemVisivel()) return;

  // Retorno para casa: pensamentos da Dellalos (uma vez só; saves antigos já adiantados pulam)
  if (!historia.monologoCasa && historia.chegouEmCasa) {
    if (historia.recebeuChaveQuarto) historia.monologoCasa = true;
    else if (cenaAtual === CENAS.sala) {
      historia.monologoCasa = true;
      abrirDialogo(DIALOGOS.dellalos.casa);
      return;
    }
  }

  for (const m of MISSOES) {
    if (!m.auto || diario.fim[m.id] || !missaoLiberada(m)) continue;
    if (missaoConcluida(m)) {
      diario.fim[m.id] = true;
      proximaMissao(m.titulo, "", m.recompensa);
      return;
    }
  }
}

// Liga a bolinha "!" no 🎒
function sinalizarMissao() {
  btnInventario.classList.add("novo");
}

// Mostra "Missão concluída: X." e, se a missão ativa ainda não foi avisada, "Nova: Y."
// "antes" é um texto opcional que vem na frente (ex.: "Você pegou a chave!")
function proximaMissao(concluida, antes, recompensa) {
  let txt = antes ? antes + " " : "";
  if (concluida) txt += "Missão concluída: " + concluida + ".";
  if (recompensa) txt += " " + recompensa;
  const m = missaoAtiva();
  if (m && !historia[m.aviso]) {
    historia[m.aviso] = true;
    txt += (txt ? " " : "") + "Nova: " + m.titulo + ".";
  }
  if (txt) mostrarMensagem(txt);
  sinalizarMissao();
}

// Chamado por entrarNaCena() (js/cena.js) toda vez que Dellalos chega num lugar
function aoEntrarNaCena(id) {
  // Dia seguinte: chegar na escola (missão "Um novo dia")
  if (historia.novoDia && !historia.chegouEscolaDia2 && (id === "escola" || id.indexOf("aula") === 0)) {
    historia.chegouEscolaDia2 = true;
  }
  // Missão 1: chegar na escola
  if (!historia.chegouNaEscola && (id === "escola" || id.indexOf("aula") === 0)) {
    historia.chegouNaEscola = true;
    proximaMissao("Ir para a escola");
    return;
  }
  // Missão 3: depois de conhecer a Millena, chegar em casa
  if (historia.conheceuMillena && !historia.chegouEmCasa && id === "sala") {
    historia.chegouEmCasa = true;
    proximaMissao("Ir para casa");
    return;
  }
  // Missão 5: entrar no quarto do pai
  if (!historia.entrouQuartoPai && id === "quarto_pai") {
    historia.entrouQuartoPai = true;
    proximaMissao("Entrar no quarto do pai");
  }
}

// Fim da conversa com a Millena ("Senta do meu lado!"): missão 2 concluída,
// passa o tempo (tela preta de 2 segundos) e começa a próxima missão
function aoConhecerMillena() {
  historia.conheceuMillena = true;
  iniciarTelaTempo("Algumas horas depois...", function () {
    proximaMissao("Falar com a Millena");
  }, 2);
}

// Fim da conversa em que o Morador entrega a chave (missão 4)
function entregarChaveDoMorador() {
  if (!darItem("chave_quarto_pai")) return;     // inventário cheio: ele repete a conversa depois
  historia.recebeuChaveQuarto = true;
  proximaMissao("Falar com o Morador", "Você pegou: " + ITENS.chave_quarto_pai.nome + ".");
}

// Chamado uma vez quando o jogo abre: avisa da missão ativa se ainda não avisou
function anunciarMissaoInicial() {
  const m = missaoAtiva();
  if (!m || historia[m.aviso]) return;
  historia[m.aviso] = true;
  mostrarMensagem("Nova missão! Abra o inventário.");
  sinalizarMissao();
}

// Desenha a caixa da missão dentro do inventário
function renderizarMissoes() {
  const caixa = document.getElementById("inventarioMissoes");
  caixa.replaceChildren();

  const ativa = missaoAtiva();
  const m = ativa || MISSOES[MISSOES.length - 1];    // sem ativa: mostra a última concluída
  if (!m) return;

  const feita = missaoConcluida(m);
  const div = document.createElement("div");
  div.className = "missao" + (feita ? " feita" : "");

  const h = document.createElement("h3");
  h.textContent = feita ? "MISSÃO CONCLUÍDA ✔" : "MISSÃO";
  const t = document.createElement("p");
  t.className = "missao-titulo";
  t.textContent = m.titulo;
  const d = document.createElement("p");
  d.className = "missao-desc";
  d.textContent = feita ? "Novas missões em breve." : m.descricao;

  div.append(h, t, d);
  if (!feita) {
    for (const o of m.objetivos || []) {
      const ok = !!o.ok();
      const li = document.createElement("p");
      li.className = "missao-desc";
      li.textContent = (ok ? "☑ " : "☐ ") + o.texto;
      div.appendChild(li);
    }
  }
  caixa.appendChild(div);
}
