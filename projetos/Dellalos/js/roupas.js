/* =====================================================
   roupas.js - O armário da casa da Dellalos (v54)
   Troca só o sprite da Dellalos (a "folha" de imagens.js); não muda nada na história.
   - Liberado a partir do dia 2 (na sala da casa, armário no canto esquerdo).
   - Sem fotos: o menu só mostra os nomes das roupas (3 por página + "Mais roupas").
   - A roupa escolhida fica em diario.escolhas.roupa (o salvamento já guarda o diário).
   Para ganhar uma roupa nova: ponha o PNG (grade 4x4) em assets/ e acrescente uma linha em ROUPAS.
   ===================================================== */

const ROUPAS = [
  { id: "verde",       nome: "Verde (padrão)", arq: "assets/Dellalos.png" },
  { id: "academia",    nome: "Academia",       arq: "assets/Dellalos_academia.png" },
  { id: "academia2",   nome: "Academia 2",     arq: "assets/Dellalos_academia2.png" },
  { id: "azul",        nome: "Azul",           arq: "assets/Dellalos_azul.png" },
  { id: "branco",      nome: "Branco",         arq: "assets/Dellalos_branco.png" },
  { id: "brasil",      nome: "Brasil",         arq: "assets/Dellalos_brasil.png" },
  { id: "vermelho",    nome: "Vermelho",       arq: "assets/Dellalos_vermelho.png" },
  { id: "vestidopreto", nome: "Vestido preto", arq: "assets/Dellalos_vestidopreto.png" }
];
const ROUPAS_POR_PAGINA = 3;
const ROUPA_DIA_LIBERADA = 2;
const _roupaImgs = {};     // cache: id -> imagem já carregada

function roupaAtualId() {
  const id = diario.escolhas.roupa;
  return ROUPAS.some((r) => r.id === id) ? id : "verde";
}

// Troca o sprite da Dellalos (a roupa verde é a folha original, já carregada por imagens.js)
function aplicarRoupa(id, aoTrocar) {
  const r = ROUPAS.find((x) => x.id === id) || ROUPAS[0];
  if (r.id === "verde" && typeof folhaOriginal !== "undefined" && folhaOriginal) {
    folha = folhaOriginal; if (aoTrocar) aoTrocar(); return;
  }
  if (_roupaImgs[r.id]) { folha = _roupaImgs[r.id]; if (aoTrocar) aoTrocar(); return; }
  carregarImagem([r.arq, r.arq.replace("assets/Dellalos", "assets/dellalos")], (img) => {
    _roupaImgs[r.id] = img;
    if (roupaAtualId() === r.id) folha = img;     // só aplica se ainda for a escolhida
    if (aoTrocar) aoTrocar();
  });
}

// Chamado depois de carregar um save (e ao entrar em jogo novo): volta a vestir a roupa salva
function aplicarRoupaSalva() { aplicarRoupa(roupaAtualId()); }

function roupasLiberadas() { return diaAtual() >= ROUPA_DIA_LIBERADA; }

// Fala do dia 2: avisa o jogador de que o armário existe (uma vez só)
function avisarArmarioSeNecessario() {
  if (historia.avisouArmario || !roupasLiberadas() || dialogoAberto) return;
  if (cenaAtual !== CENAS.sala) return;
  historia.avisouArmario = true;
  abrirDialogo([
    { quem: "Dellalos", texto: "Essa roupa já está cansada... Melhor trocar de roupa." },
    { quem: "Dellalos", texto: "Acho que vi umas outras no armário, ali no canto da sala." }
  ]);
}

// Armário: menu em páginas, só com os nomes
function usarArmario(pagina) {
  if (!roupasLiberadas()) { mostrarMensagem("O armário só tem a roupa de sempre por enquanto."); return; }
  pagina = pagina || 0;
  const total = Math.ceil(ROUPAS.length / ROUPAS_POR_PAGINA);
  const atual = roupaAtualId();
  const lista = ROUPAS.slice(pagina * ROUPAS_POR_PAGINA, (pagina + 1) * ROUPAS_POR_PAGINA);
  let proxima = null;                       // página a abrir quando este diálogo terminar

  const opcoes = lista.map((r) => ({
    id: r.id,
    texto: r.nome + (r.id === atual ? "  ✓" : ""),
    fn: function () {
      if (r.id === atual) return;
      diario.escolhas.roupa = r.id;
      aplicarRoupa(r.id);
      if (typeof salvarJogo === "function") salvarJogo();
    },
    falas: r.id === atual ? [] : [{ quem: "Dellalos", texto: "Pronto: " + r.nome + "." }]
  }));
  opcoes.push(pagina < total - 1
    ? { id: "mais", texto: "Mais roupas ▸", fn: function () { proxima = pagina + 1; } }
    : { id: "fechar", texto: "Fechar o armário", fn: function () { } });

  abrirDialogo([{ quem: "Dellalos", texto: "Qual roupa eu visto? (" + (pagina + 1) + "/" + total + ")", opcoes: opcoes }],
    function () { if (proxima !== null) usarArmario(proxima); });
}
