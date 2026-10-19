/* =====================================================
   interacoes.js - O que os botões A e B fazem
   A = ataca (em lugares com combate)
   B = interage (portas, objetos, conversas, avançar texto)
   ===================================================== */

// Procura o objeto interativo mais próximo que Dellalos consegue alcançar
function objetoAlcancavel() {
  const c = caixaDoJogador(jogador.x, jogador.y);
  const m = CONFIG.margemAcao;
  const alcance = { x: c.x - m, y: c.y - m, w: c.w + m * 2, h: c.h + m * 2 };
  const cx = c.x + c.w / 2, cy = c.y + c.h / 2;

  let melhor = null, melhorDist = Infinity;
  for (const obj of cenaAtual.interativos || []) {
    if (obj.ativo && !obj.ativo()) continue;      // objetos que só existem em certas condições (ex.: segredos, js/exploracao.js)
    if (!bate(alcance, obj.area)) continue;
    const ax = obj.area.x + obj.area.w / 2, ay = obj.area.y + obj.area.h / 2;
    const d = Math.hypot(ax - cx, ay - cy);
    if (d < melhorDist) { melhorDist = d; melhor = obj; }
  }
  return melhor;
}

// Botão A = ATACA (só em lugares com combate)
function acaoA() {
  if (inventarioAberto || lojaAberta || transicao || dialogoAberto || telaTempo) return;   // inventário/loja aberta ou trocando de lugar: não faz nada
  if (cenaAtual.combate) iniciarAtaque();
}

// Botão C = ESQUIVA (só em lugares com combate; js/efeitos.js)
function acaoC() {
  if (menuAberto || inventarioAberto || lojaAberta || transicao || dialogoAberto || telaTempo) return;
  if (cenaAtual.combate) tentarEsquiva();
}

// Botão B = INTERAGE com o ambiente
//   1) Durante uma conversa: avança a fala
//   2) Se há uma mensagem na tela: fecha ela
//   3) Perto de um NPC: começa a conversa
//   4) Perto de um objeto: fala ou leva a outra cena (porta)
//   5) Senão: "Nada por aqui."
let npcSelecionadoParaInteracao = null;
const PERSONAGENS_COM_CONVERSA_LIVRE = ["Dellalos", "Nathalia", "Millena", "Lucas", "Isabela", "Thaina", "Deriky", "Simon", "Mariane", "Dona Rosa", "Mateus", "Lia"];

function npcAlcancavelParaConversar() {
  const c = caixaDoJogador(jogador.x, jogador.y);
  const cx = c.x + c.w / 2, cy = c.y + c.h / 2;
  let melhor = null, menor = Infinity;
  for (const n of (cenaAtual.npcs || [])) {
    if (!npcAtivo(n) || !n.conversar || !PERSONAGENS_COM_CONVERSA_LIVRE.includes(n.nome)) continue;
    const d = Math.hypot(n.x - cx, n.y - cy);
    if (d < 100 && d < menor) { melhor = n; menor = d; }
  }
  return melhor;
}

function fecharMenuInteracaoNPC() {
  const menu = document.getElementById("menuInteracaoNPC");
  if (menu) menu.hidden = true;
  document.body.classList.remove("npc-menu-aberto");
  npcSelecionadoParaInteracao = null;
}

function abrirMenuInteracaoNPC(npc) {
  npcSelecionadoParaInteracao = npc;
  const menu = document.getElementById("menuInteracaoNPC");
  if (!menu) { npcConversarComPrelude(npc); return; }
  document.getElementById("npcMenuTitulo").textContent = npc.nome;
  const botaoLivre = document.getElementById("npcConversaLivre");
  if (botaoLivre) botaoLivre.hidden = typeof window.podeConversaLivreNPC === "function" && !window.podeConversaLivreNPC(npc.nome);
  menu.hidden = false;
  document.body.classList.add("npc-menu-aberto");
  document.getElementById("npcConversaNormal").focus();
}

(function configurarMenuInteracaoNPC() {
  const normal = document.getElementById("npcConversaNormal");
  const livre = document.getElementById("npcConversaLivre");
  const voltar = document.getElementById("npcMenuFechar");
  if (!normal || !livre || !voltar) return;
  normal.addEventListener("click", () => {
    const npc = npcSelecionadoParaInteracao;
    fecharMenuInteracaoNPC();
    if (npc && typeof npc.conversar === "function") npcConversarComPrelude(npc);
  });
  livre.addEventListener("click", () => {
    const npc = npcSelecionadoParaInteracao;
    fecharMenuInteracaoNPC();
    if (npc && typeof window.abrirConversaLivreNPC === "function" && window.podeConversaLivreNPC(npc.nome)) window.abrirConversaLivreNPC(npc.nome);
  });
  voltar.addEventListener("click", fecharMenuInteracaoNPC);
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !document.getElementById("menuInteracaoNPC").hidden) fecharMenuInteracaoNPC(); });
})();

function acaoB() {
  if (inventarioAberto || lojaAberta || transicao || telaTempo) return;
  if (!document.getElementById("menuInteracaoNPC").hidden) return;

  if (dialogoAberto) { avancarDialogo(); return; }
  if (mensagemVisivel()) { fecharMensagem(); return; }

  const npc = npcAlcancavelParaConversar();
  if (npc) { abrirMenuInteracaoNPC(npc); return; }

  // O companheiro ativo também pode ser chamado para uma conversa direta.
  const comp = typeof companheiroInteragivel === "function" ? companheiroInteragivel() : null;
  if (comp && typeof conversarComCompanheiro === "function") { conversarComCompanheiro(comp); return; }

  const obj = objetoAlcancavel();
  if (obj) {
    if (obj.conversar) obj.conversar();
    else if (obj.destino) mudarCena(obj.destino.cena, obj.destino.x, obj.destino.y);
    else mostrarMensagem(obj.texto);
    return;
  }
  mostrarMensagem("Nada por aqui.");
}
