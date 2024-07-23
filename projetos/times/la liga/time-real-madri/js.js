function sobre() {
  let  sobre = document.getElementById("sobre")
  let inicio = document.getElementById("inicio")
  let lendas = document.getElementById("lendas")
  sobre.style.display = "block"
  inicio.style.display = "none"
   lendas.style.display = "none"
}

function lendas() {
    let  sobre = document.getElementById("sobre")
    let inicio = document.getElementById("inicio")
    let lendas = document.getElementById("lendas")
    sobre.style.display = "none"
    inicio.style.display = "none"
    lendas.style.display = "block"
  }

function inicio() {
    let  sobre = document.getElementById("sobre")
    let inicio = document.getElementById("inicio")
    let lendas = document.getElementById("lendas")
    sobre.style.display = "none"
    inicio.style.display = "block"
    lendas.style.display = "none"
  }