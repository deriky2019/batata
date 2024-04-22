let  muda = document.getElementById("mudar")
let  claro = document.getElementById("branco")
let  escuro = document.getElementById("preto")
let  menu = document.getElementById("temas")
let  atores = document.getElementById("atores")
function preto() {
    muda.style.backgroundColor = "black"
    escuro.style.display = "none"
    claro.style.display = "block"
    menu.style.color = "blue"
    atores.style.color = "blue"

} 
function branco() {
    claro.style.display = "none"
    escuro.style.display = "block"
    muda.style.backgroundColor = "white"
    menu.style.color = "black"

    
}
