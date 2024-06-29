function igrejas() {
    let sobre = document.getElementById("sobre")
    let local = document.getElementById("locais")
    local.style.display = "block"
    local.style.transition = "2s"
    sobre.style.display = "none"
}
function voltar() {
    let sobre = document.getElementById("sobre")
    let local = document.getElementById("locais")
    local.style.display = "none"
    local.style.transitionTimingFunction = "2s"
    sobre.style.display = "block"
}