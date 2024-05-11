// Script para validar formulário de contato
const formContato = document.getElementById('form-contato');

formContato.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Validação dos campos do formulário
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const mensagem = document.getElementById('mensagem').value;

    if (nome === '' || email === '' || mensagem === '') {
        alert('Por favor, preencha todos os campos do formulário.');
    } else {
        // Aqui você pode enviar os dados do formulário para um servidor, salvar em um banco de dados, etc.
        alert('Obrigado por entrar em contato!');
        formContato.reset(); // Limpa o formulário após o envio
    }
});
