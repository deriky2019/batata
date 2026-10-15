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

// Desenha os slots na tela. Limpa a lista antes, então nunca duplica.
function renderizarInventario() {
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
      }
    } else {
      slot.classList.add("vazio");
      slot.setAttribute("aria-label", "Espaço vazio");
    }
    listaSlots.appendChild(slot);
  });
}

function abrirInventario() {
  if (inventarioAberto) return;
  inventarioAberto = true;
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
