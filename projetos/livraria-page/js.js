function verificarLarguraJanela() {
    let menuH = document.getElementById("imgM")
    let menula = document.getElementById("menuLA");
    let menuG = document.getElementById("divTG");
    let nav = document.getElementById("nav");
    
    
    
    if (window.innerWidth < 690) {
        menula.style.display = "none";
        menuH.style.display = "inline";
        menuG.style.display = "none";
        nav.style.display = "block"
    } else {
      menula.style.display = "block"; // ou "inline", dependendo do estilo desejado
      menuG.style.display = "flex";
      menuH.style.display = "none";
      nav.style.display = "none"
    }
}

// Verificar a largura da janela quando a página carregar
window.onload = verificarLarguraJanela;

// Verificar a largura da janela sempre que ela for redimensionada
window.onresize = verificarLarguraJanela;
