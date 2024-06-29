
let pontuacao =  document.getElementById("pontuaçao")
let um = document.getElementsByClassName ("um")
let p = document.getElementById("p")
let p2 = document.getElementById("p2")
let p3 = document.getElementById("p3")
let p4 = document.getElementById("p4")
let p5 = document.getElementById("p5")
let p6 = document.getElementById("p6")
let p7= document.getElementById("p7")
let p8 = document.getElementById("p8")
let p9 = document.getElementById("p9")
let p10 = document.getElementById("p10")
let fim = document.getElementById("final")
let proxima = document.getElementById("rodada")

function certo() {
    pontuacao.textContent = parseInt(pontuacao.textContent) + 1;
    p.style.display = "none";
    p2.style.display = "block"   
    
  
 
}
function certo2() {
    pontuacao.textContent = parseInt(pontuacao.textContent) + 1;
    p2.style.display = "none";
    p3.style.display = "block"}



    function certo3() {
        pontuacao.textContent = parseInt(pontuacao.textContent) + 1;
        p3.style.display = "none";
        p4.style.display = "block"}


    function certo4() {
            pontuacao.textContent = parseInt(pontuacao.textContent) + 1;
            p4.style.display = "none";
            p5.style.display = "block"}




    function certo5() {
                pontuacao.textContent = parseInt(pontuacao.textContent) + 1;
                p5.style.display = "none";
                p6.style.display = "block"}



    function certo6() {
            pontuacao.textContent = parseInt(pontuacao.textContent) + 1;
            p6.style.display = "none";
            p7.style.display = "block"}





    function certo7() {
            pontuacao.textContent = parseInt(pontuacao.textContent) + 1;
            p7.style.display = "none";
            p8.style.display = "block"}




    function certo8() {
        pontuacao.textContent = parseInt(pontuacao.textContent) + 1;
        p8.style.display = "none";
        p9.style.display = "block"}

    function certo9() {
            pontuacao.textContent = parseInt(pontuacao.textContent) + 1;
            p9.style.display = "none";
            p10.style.display = "block"}

    function finalizado() {
    p10.style.display = "none"
    proxima.style.display = "block"
    voltar.style.display = "block"

   fim.innerHTML = "Quer mais perguntas?"
        
    }




function errado() {
    pontuacao.textContent = parseInt(pontuacao.textContent) - 1;
    
}

