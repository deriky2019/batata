function verificarLarguraJanela() {
    let input = document.getElementById("input");
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
