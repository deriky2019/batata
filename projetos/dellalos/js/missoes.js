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

// Chamado por entrarNaCena() (js/cena.js) toda vez que Dellalos chega num lugar
function aoEntrarNaCena(id) {
  // Missão 1: chegar na escola -> começa a missão 2
  if (!historia.chegouNaEscola && (id === "escola" || id.indexOf("aula") === 0)) {
    historia.chegouNaEscola = true;
    historia.avisouMissaoMillena = true;
    mostrarMensagem("Missão concluída! Nova: falar com a Millena.");
    sinalizarMissao();
    return;
  }
  // Missão 3: depois de conhecer a Millena, chegar em casa
  if (historia.conheceuMillena && !historia.chegouEmCasa && id === "sala") {
    historia.chegouEmCasa = true;
    historia.avisouMissaoCasa = true;
    mostrarMensagem("Missão concluída: Ir para casa!");
    sinalizarMissao();
  }
}

// Fim da conversa com a Millena ("Senta do meu lado!"): missão 2 concluída,
// passa o tempo (tela preta de 2 segundos) e começa a missão 3
function aoConhecerMillena() {
  historia.conheceuMillena = true;
  iniciarTelaTempo("Algumas horas depois...", function () {
    historia.avisouMissaoCasa = true;
    mostrarMensagem("Missão concluída! Nova: ir para casa.");
    sinalizarMissao();
  }, 2);
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
