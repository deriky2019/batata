let dark = document.getElementById("dark")
let claro = document.getElementById("claro")
let body = document.getElementById("mudarcor")
let h1 = document.getElementById("h1")
function mudarD() {
    dark.style.display = "block"
    claro.style.display = "none"
    body.style.backgroundColor = "black"
    h1.style.color = "white"
}

function mudarC() {
    dark.style.display = "none"
    claro.style.display = "block"
    body.style.backgroundColor = "white"
    h1.style.color = "#333"
}