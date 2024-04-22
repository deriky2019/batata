let numeroAleatorio = Math.floor(Math.random() * 100) + 1;

function calcular() {
    let numeroescolhido = parseInt (document.getElementById("numero").value)
    let res = document.getElementById("resposta")

    if (isNaN(numeroescolhido)) {
        res.innerHTML = "Por favor, insira um número válido.";
        return; 
// Interrompe a execução da função se o número não for válido
    }

    if (numeroescolhido === numeroAleatorio) {
        res.innerHTML = "voce acertou parabens"
        } 
        else if (numeroescolhido < numeroAleatorio) {
        res.innerHTML = "quase escolha um numero maior"
    }
    else {
        res.innerHTML = "quase escolha um numero menor"
    }
    
}