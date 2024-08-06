let  muda = document.getElementById("mudar")
let  claro = document.getElementById("branco")
let  escuro = document.getElementById("preto")
let  temas = document.getElementById("temas")
let  atores = document.getElementById("atores")
let  hyper = document.getElementById("hyper")

function preto() {
    muda.style.backgroundColor = "black"
    escuro.style.display = "none"
    claro.style.display = "block"
    temas.style.color = "white"
    atores.style.color = "white"
    hyper.style.backgroundColor = "black"

} 
function branco() {
    muda.style.backgroundColor = "white"
    claro.style.display = "none"
    escuro.style.display = "block"
    temas.style.color = "black"
    atores.style.color = "black"
    hyper.style.backgroundColor = "white"

    
}

function verificarLarguraJanela() {
    let  = document.getElementById("input");
    if (window.innerWidth < 690) {
        input.style.display = "none";
    } else {
        input.style.display = "block"; // ou "inline", dependendo do estilo desejado
    }
}

// Verificar a largura da janela quando a página carregar
window.onload = verificarLarguraJanela;

// Verificar a largura da janela sempre que ela for redimensionada
window.onresize = verificarLarguraJanela;

