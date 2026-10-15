/* =====================================================
   missoes.js - Missões e objetivos
   A missão ativa aparece no inventário (botão 🎒).
   Para criar outra missão: adicione um item em MISSOES (a ordem é a da história),
   crie a chave (true/false) em "historia" (js/dialogos.js) e marque-a como true
   no lugar certo (ex.: em aoEntrarNaCena ou numa conversa).
   O progresso é salvo junto com "historia" (js/salvamento.js).
   ===================================================== */

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
  }
];

const missaoConcluida = (m) => historia[m.chave] === true;

// A primeira missão que ainda não foi concluída (ou null)
function missaoAtiva() {
  return MISSOES.find((m) => !missaoConcluida(m)) || null;
}

// Liga a bolinha "!" no 🎒
function sinalizarMissao() {
  btnInventario.classList.add("novo");
}

// Mostra "Missão concluída: X." e, se a missão ativa ainda não foi avisada, "Nova: Y."
// "antes" é um texto opcional que vem na frente (ex.: "Você pegou a chave!")
function proximaMissao(concluida, antes) {
  let txt = antes ? antes + " " : "";
  if (concluida) txt += "Missão concluída: " + concluida + ".";
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
  caixa.appendChild(div);
}
