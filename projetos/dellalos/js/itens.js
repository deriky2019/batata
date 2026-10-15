/* =====================================================
   itens.js - Lista de itens do jogo
   Cada item: { nome, descricao, icone }  (icone = emoji; ou "imagem" com o caminho de um PNG)
   Os itens ocupam os 5 espaços do inventário (inventario.js).
   Para dar um item:      darItem("chave_quarto_pai")   -> false se o inventário estiver cheio
   Para ver se tem:       temItem("chave_quarto_pai")
   Para tirar (usou):     tirarItem("chave_quarto_pai")
   Para criar um item novo: coloque-o aqui com um id novo.
   ===================================================== */

const ITENS = {
  chave_quarto_pai: {
    nome: "Chave do quarto do pai",
    descricao: "Uma chave antiga. Abre a porta do quarto do papai, aqui em casa.",
    icone: "\u{1F5DD}\uFE0F"
  },
  carta_pai: {
    nome: "Carta do papai",
    descricao: "Uma carta dobrada, com a letra do papai. Ainda não consegui ler.",
    icone: "\u2709\uFE0F"
  }
};
