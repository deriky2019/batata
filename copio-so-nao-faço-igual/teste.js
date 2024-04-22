let  muda = document.getElementById("mudar")
let  claro = document.getElementById("branco")
let  escuro = document.getElementById("preto")
function preto() {
    muda.style.backgroundColor = "black"
    escuro.style.display = "none"
    claro.style.display = "block"
}
function branco() {
    claro.style.display = "none"
    escuro.style.display = "block"
    muda.style.backgroundColor = "blue"

    
}




