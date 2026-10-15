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
    chave: "chegouNaEscola"      // quando historia.chegouNaEscola vira true, a missão está concluída
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
  if (!historia.chegouNaEscola && (id === "escola" || id.indexOf("aula") === 0)) {
    historia.chegouNaEscola = true;
    mostrarMensagem("Missão concluída: Ir para a escola!");
    sinalizarMissao();
  }
}

// Chamado uma vez quando o jogo abre: avisa da missão nova
function anunciarMissaoInicial() {
  if (historia.avisouMissaoEscola || historia.chegouNaEscola) return;
  historia.avisouMissaoEscola = true;
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
