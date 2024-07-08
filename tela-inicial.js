function escurecer() {
    let  lua = document.getElementById("lua")
    let  sol = document.getElementById("sol")
    let  body = document.getElementById("body")
    let link = document.getElementById("link")
    link.style.color = "black"
    link.style.transition = "1s"
    body.style.backgroundColor = "white"
    body.style.transition = "1s"
    lua.style.display = "block"
    sol.style.display = "none"

}

function clarear() {
    let  lua = document.getElementById("lua")
    let  sol = document.getElementById("sol")
    let  body = document.getElementById("body")
    let link = document.getElementById("link")
    link.style.color = "white"
    link.style.transition = "1s"
    body.style.backgroundColor = "#333"
    body.style.transition = "1s"
    lua.style.display = "none"
    sol.style.display = "block"

}