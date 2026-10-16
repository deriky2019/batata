/* =====================================================
   inventario.js - Botão 🎒 e painel com 5 espaços
   ===================================================== */

// Os 5 espaços do inventário. null = vazio.
// No futuro, cada espaço poderá guardar um item assim:
//   { nome: "Chave", descricao: "Abre a porta.", imagem: "assets/chave.png" }
const inventario = {
  slots: [null, null, null, null, null]
};

let inventarioAberto = false;   // enquanto for true, o jogo fica pausado

const btnInventario    = document.getElementById("btnInventario");
const painelInventario = document.getElementById("inventario");
const btnFecharInv     = document.getElementById("inventarioFechar");
const listaSlots       = document.getElementById("inventarioSlots");
const btnExaminar      = document.getElementById("inventarioExaminar");   // aparece quando o item tem "exame" (js/itens.js)

// Desenha os slots na tela. Limpa a lista antes, então nunca duplica.
// Tocar num item mostra o nome e a descrição dele embaixo.
function renderizarInventario() {
  renderizarMissoes();                // painel da missão (js/missoes.js)
  const dica = document.getElementById("inventarioDica");
  btnExaminar.hidden = true;
  const temAlgum = inventario.slots.some((x) => x);
  dica.textContent = temAlgum ? "Toque em um item para ver o que é." : "Nenhum item ainda.";

  listaSlots.replaceChildren();
  inventario.slots.forEach((item, i) => {
    const slot = document.createElement("div");
    slot.className = "inv-slot";
    slot.dataset.slot = i;
    if (item) {
      slot.title = item.nome;
      if (item.imagem) {
        const img = document.createElement("img");
        img.src = item.imagem;
        img.alt = item.nome;
        slot.appendChild(img);
      } else if (item.icone) {
        const ic = document.createElement("span");
        ic.className = "icone";
        ic.textContent = item.icone;
        slot.appendChild(ic);
      }
      slot.addEventListener("click", () => {
        listaSlots.querySelectorAll(".inv-slot").forEach((el) => el.classList.remove("escolhido"));
        slot.classList.add("escolhido");
        dica.textContent = item.nome + " - " + descricaoDoItem(item);
        btnExaminar.hidden = !item.exame;
        btnExaminar.onclick = () => examinarItem(item);
      });
    } else {
      slot.classList.add("vazio");
      slot.setAttribute("aria-label", "Espaço vazio");
    }
    listaSlots.appendChild(slot);
  });
}

// ---------- Dar, tirar e conferir itens ----------
function temItem(id) {
  return inventario.slots.some((x) => x && x.id === id);
}

// Põe o item no primeiro espaço vazio. Devolve false se o inventário está cheio (máx. 5).
function darItem(id) {
  const base = ITENS[id];
  if (!base) { console.warn("Item não existe: " + id); return false; }
  if (temItem(id)) return true;                       // não repete o mesmo item
  const livre = inventario.slots.indexOf(null);
  if (livre === -1) {
    mostrarMensagem("Inventário cheio! (máximo de " + inventario.slots.length + " itens)");
    return false;
  }
  inventario.slots[livre] = Object.assign({ id }, base);
  btnInventario.classList.add("novo");                // bolinha "!" no 🎒
  return true;
}

function tirarItem(id) {
  const i = inventario.slots.findIndex((x) => x && x.id === id);
  if (i === -1) return false;
  inventario.slots[i] = null;
  return true;
}

function abrirInventario() {
  if (menuAberto || jogador.morto || inventarioAberto || dialogoAberto || telaTempo) return;   // durante uma conversa não abre
  inventarioAberto = true;
  btnInventario.classList.remove("novo");   // tira o "!" de missão nova
  mostrarAba("mochila");              // sempre abre na mochila (o diário é a outra aba)
  soltarTudo();                       // solta setas/teclas que estavam pressionadas
  renderizarInventario();
  painelInventario.hidden = false;
}

function fecharInventario() {
  if (!inventarioAberto) return;
  inventarioAberto = false;
  painelInventario.hidden = true;
}

// Os eventos são ligados UMA vez só, aqui, quando o jogo carrega.
btnInventario.addEventListener("click", abrirInventario);
btnFecharInv.addEventListener("click", fecharInventario);
window.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharInventario(); });
