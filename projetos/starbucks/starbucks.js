function verificarLarguraJanela() {
    let menuG = document.getElementById("menuTG");
    let menuP = document.getElementById("menuTP");
    
    if (window.innerWidth < 690) {
        menuG.style.display = "none";
        menuP.style.display = "inline";
        
    } else {
        menuG.style.display = "flex";
        menuP.style.display = "none";
  
    }
}

// Verificar a largura da janela quando a página carregar
window.onload = verificarLarguraJanela;

// Verificar a largura da janela sempre que ela for redimensionada
window.onresize = verificarLarguraJanela;



