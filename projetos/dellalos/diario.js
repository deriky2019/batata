/* =====================================================
   diario.js - Registro do que a Dellalos já sabe (aba "Diário" do 🎒)
   O diário NÃO é preenchido à mão em vários arquivos:
     - personagens conhecidos, informações e escolhas entram sozinhos pelas FALAS
       (campos  conhece / info / escolha  em js/dialogos.js)
     - documentos entram quando o jogador examina o item (js/itens.js)
     - missões vêm da lista MISSOES (js/missoes.js)
   É salvo junto com o progresso (js/salvamento.js). Se o save for antigo e não tiver
   "diario", tudo começa vazio (nada do resto do save é apagado).
   ===================================================== */

const diario = { conhecidos: {}, infos: {}, docs: {}, escolhas: {}, fim: {} };

// Informações que podem ser descobertas (o id é usado no campo  info  das falas)
const INFOS = {
  primeiro_dia:        "No primeiro dia, a Millena me apresentou a escola.",
  chave_papai:         "O Morador me entregou a chave do quarto do papai. Ele disse que eu saberia a hora de usá-la.",
  lucas_treinos:       "O Lucas fala pouco e leva os treinos a sério. Anda com o Simon e o Vitinho.",
  veras_hostil:        "A Veras não gosta de recém-chegados.",
  nathalia_semelhanca: "A Nathalia acha que eu lembro alguém que ela conhece. Ela ainda não sabe dizer quem."
};

function resetarDiario() {
  diario.conhecidos = {}; diario.infos = {}; diario.docs = {}; diario.escolhas = {}; diario.fim = {};
}

// Aplica o que veio do save; campo ausente = valor padrão (vazio)
function aplicarDiario(d) {
  resetarDiario();
  if (!d || typeof d !== "object") return;
  for (const campo of ["conhecidos", "infos", "docs", "escolhas", "fim"]) {
    const origem = d[campo];
    if (origem && typeof origem === "object") {
      for (const k in origem) diario[campo][k] = origem[k];
    }
  }
}

// Save de antes do diário existir: reconstrói o registro a partir da história que já foi salva
function migrarDiarioAntigo() {
  if (historia.conheceuMillena)   diario.conhecidos.Millena = true;
  if (historia.conheceuMorador)   diario.conhecidos.Morador = true;
  if (historia.conheceuEstudante) diario.conhecidos.Estudante = true;
  if (historia.chegouEmCasa)      diario.infos.primeiro_dia = true;
  if (historia.recebeuChaveQuarto) diario.infos.chave_papai = true;
}

function conhecePersonagem(nome) { return !!diario.conhecidos[nome]; }

function registrarConhecido(nome) {
  if (!nome || diario.conhecidos[nome]) return;
  diario.conhecidos[nome] = true;
  sinalizarMissao();                       // bolinha "!" no 🎒
}

function descobrirInfo(id) {
  if (!id || !INFOS[id] || diario.infos[id]) return;
  diario.infos[id] = true;
  sinalizarMissao();
}

function registrarDocumento(id) {
  if (!id || diario.docs[id]) return;
  diario.docs[id] = true;
  sinalizarMissao();
}

// ---------- Abas do painel (Mochila | Diário) ----------
function mostrarAba(nome) {
  const mochila = document.getElementById("abaMochila");
  const dia = document.getElementById("abaDiario");
  const bm = document.getElementById("abaBtnMochila");
  const bd = document.getElementById("abaBtnDiario");
  if (!mochila || !dia) return;
  const noDiario = nome === "diario";
  mochila.hidden = noDiario;
  dia.hidden = !noDiario;
  bm.classList.toggle("ativa", !noDiario);
  bd.classList.toggle("ativa", noDiario);
  document.getElementById("inventarioTitulo").textContent = noDiario ? "DIÁRIO" : "INVENTÁRIO";
  if (noDiario) renderizarDiario();
}

function _secao(pai, titulo) {
  const h = document.createElement("h3");
  h.className = "dia-titulo";
  h.textContent = titulo;
  pai.appendChild(h);
}
function _linha(pai, texto, classe) {
  const p = document.createElement("p");
  p.className = "dia-linha" + (classe ? " " + classe : "");
  p.textContent = texto;
  pai.appendChild(p);
  return p;
}

function _blocoMissao(pai, m, feita) {
  const div = document.createElement("div");
  div.className = "missao" + (feita ? " feita" : "");
  const t = document.createElement("p");
  t.className = "missao-titulo";
  t.textContent = (feita ? "✔ " : "") + m.titulo;
  div.appendChild(t);
  if (!feita) {
    const d = document.createElement("p");
    d.className = "missao-desc";
    d.textContent = m.descricao;
    div.appendChild(d);
    for (const o of m.objetivos || []) {
      const ok = !!o.ok();
      _linha(div, (ok ? "☑ " : "☐ ") + o.texto, ok ? "feito" : "");
    }
  }
  pai.appendChild(div);
}

function renderizarDiario() {
  const caixa = document.getElementById("abaDiario");
  if (!caixa) return;
  caixa.replaceChildren();

  const ativas = MISSOES.filter((m) => missaoLiberada(m) && !missaoConcluida(m));
  const feitas = MISSOES.filter((m) => missaoConcluida(m));

  _secao(caixa, "MISSÕES ATIVAS");
  if (ativas.length) ativas.forEach((m) => _blocoMissao(caixa, m, false));
  else _linha(caixa, "Nenhuma no momento.", "vazio");

  _secao(caixa, "MISSÕES CONCLUÍDAS");
  if (feitas.length) feitas.forEach((m) => _blocoMissao(caixa, m, true));
  else _linha(caixa, "Nenhuma ainda.", "vazio");

  _secao(caixa, "PERSONAGENS CONHECIDOS");
  const nomes = ["Dellalos"].concat(Object.keys(diario.conhecidos).filter((n) => n !== "Dellalos"));
  nomes.forEach((n) => {
    const p = PERSONAGENS[n];
    _linha(caixa, n + (p ? " - " + p.descricao : ""));
  });

  _secao(caixa, "INFORMAÇÕES DESCOBERTAS");
  const infos = Object.keys(diario.infos).filter((id) => INFOS[id]);
  if (infos.length) infos.forEach((id) => _linha(caixa, "• " + INFOS[id]));
  else _linha(caixa, "Nada ainda.", "vazio");

  _secao(caixa, "DOCUMENTOS");
  const docs = Object.keys(diario.docs).filter((id) => ITENS[id] && ITENS[id].documento);
  if (docs.length) {
    docs.forEach((id) => {
      const d = ITENS[id].documento;
      _linha(caixa, d.titulo, "dia-doc-titulo");
      d.texto.forEach((t) => _linha(caixa, t, "dia-doc"));
    });
  } else _linha(caixa, "Nenhum ainda.", "vazio");
}

document.getElementById("abaBtnMochila").addEventListener("click", () => mostrarAba("mochila"));
document.getElementById("abaBtnDiario").addEventListener("click", () => mostrarAba("diario"));
