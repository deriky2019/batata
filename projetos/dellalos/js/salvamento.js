/* =====================================================
   salvamento.js - Salvar e carregar o progresso (localStorage)
   Guarda: lugar, posição, vida, inventário e o que já aconteceu na história.
   - Salva sozinho a cada 2 segundos e ao sair/esconder a página.
   - Para começar do zero: abra o jogo com  ?novo  no fim do endereço
     (ex.: http://localhost:8080/index.html?novo) ou use apagarSave() no console.
   ===================================================== */

const SAVE_CHAVE = "dellalos_save_v1";
const SAVE_INTERVALO = 2;     // segundos entre um salvamento automático e outro
let saveTempo = 0;

// Descobre o nome da cena atual ("sala", "estrada", ...)
function idDaCena(cena) {
  for (const id in CENAS) if (CENAS[id] === cena) return id;
  return null;
}

function salvarJogo() {
  if (!cenaAtual || transicao) return;      // trocando de lugar: espera terminar
  const id = idDaCena(cenaAtual);
  if (!id) return;
  const dados = {
    v: 1,
    cena: id,
    x: Math.round(jogador.x),
    y: Math.round(jogador.y),
    dir: jogador.direcao,
    vida: jogador.vida,
    slots: inventario.slots,
    historia: historia
  };
  try { localStorage.setItem(SAVE_CHAVE, JSON.stringify(dados)); } catch (e) { /* sem espaço ou bloqueado: ignora */ }
}

// Lê o save. Devolve null se não existe ou se está estragado.
function lerSave() {
  try {
    const texto = localStorage.getItem(SAVE_CHAVE);
    if (!texto) return null;
    const d = JSON.parse(texto);
    if (!d || d.v !== 1 || !CENAS[d.cena]) return null;
    if (!Number.isFinite(d.x) || !Number.isFinite(d.y)) return null;
    return d;
  } catch (e) {
    return null;
  }
}

function apagarSave() {
  try { localStorage.removeItem(SAVE_CHAVE); } catch (e) { }
}

// Coloca o jogo no estado que estava salvo
function aplicarSave(d) {
  // história: só as chaves que existem hoje (save antigo não quebra jogo novo)
  const h = d.historia || {};
  for (const k in historia) if (typeof h[k] === "boolean") historia[k] = h[k];

  // inventário: 5 espaços; item só vale se tiver nome
  const s = Array.isArray(d.slots) ? d.slots : [];
  inventario.slots = inventario.slots.map((_, i) => (s[i] && typeof s[i].nome === "string" ? s[i] : null));

  // vida: entre 1 e o máximo
  const vida = Math.round(d.vida);
  jogador.vida = Number.isFinite(vida) ? Math.max(1, Math.min(jogador.vidaMax, vida)) : jogador.vidaMax;

  entrarNaCena(d.cena, d.x, d.y, DIRECOES[d.dir] ? d.dir : "baixo");

  // se a posição salva ficou presa numa parede, volta para casa
  if (!livre(jogador.x, jogador.y)) {
    const sp = CENAS.sala.spawn;
    entrarNaCena("sala", sp.x, sp.y, "cima");
  }
}

// Chamado a cada quadro pelo main.js
function atualizarSalvamento(dt) {
  saveTempo += dt;
  if (saveTempo >= SAVE_INTERVALO) {
    saveTempo = 0;
    salvarJogo();
  }
}

window.addEventListener("pagehide", salvarJogo);
document.addEventListener("visibilitychange", () => { if (document.hidden) salvarJogo(); });
