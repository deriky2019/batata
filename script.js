// Gerar um número aleatório entre 1 e 100
const randomNumber = Math.floor(Math.random() * 100) + 1;

// Elementos do DOM
const guessInput = document.getElementById('guessInput');
const guessButton = document.getElementById('guessButton');
const message = document.getElementById('message');

// Contador de tentativas
let attempts = 0;

// Função para verificar adivinhação
function checkGuess() {
    const userGuess = parseInt(guessInput.value);
    attempts++;

    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
        message.textContent = 'Por favor, insira um número válido entre 1 e 100.';
    } else if (userGuess === randomNumber) {
        message.textContent = `Parabéns! Você acertou o número ${randomNumber} em ${attempts} tentativas.`;
        guessInput.disabled = true;
        guessButton.disabled = true;
    } else if (userGuess < randomNumber) {
        message.textContent = 'Tente um número maior.';
    } else {
        message.textContent = 'Tente um número menor.';
    }

    guessInput.value = '';
    guessInput.focus();
}

// Event listener para o botão de adivinhar
guessButton.addEventListener('click', checkGuess);
