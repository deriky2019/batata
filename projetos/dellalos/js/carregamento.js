/* =====================================================
   carregamento.js - Tela "Carregando..." antes de começar a jogar
   iniciarCarregamento(): chamado uma vez quando a página abre. Prepara TODAS as cenas
     (assim as imagens dos NPCs começam a carregar já na tela inicial).
   aguardarCarregamento(aoTerminar): chamado ao tocar em Continuar / Do zero.
     Mostra a barra e só chama "aoTerminar" quando tudo está pronto
     (Dellalos, tiles do mapa e a imagem de cada NPC, já sem o fundo preto).
   Se algo não carregar em 20 segundos (imagem faltando), o jogo começa mesmo assim.
   Para esperar mais alguma coisa: adicione uma função em carregamentoItens que devolva true quando estiver pronta.
   ===================================================== */

const CARREGAMENTO_LIMITE = 20;   // segundos até desistir de esperar
const CARREGAMENTO_MINIMO = 0.4;  // segundos mínimos na tela (evita piscar)

let carregamentoItens = [];

function iniciarCarregamento() {
  for (const id in CENAS) prepararCena(CENAS[id]);     // dispara o carregamento da imagem de cada NPC

  carregamentoItens = [
    () => dellalosOk,
    () => !!tilesetKit,
    () => !!tilesetExtras
  ];
  for (const id in CENAS) {
    for (const n of CENAS[id].npcs || []) carregamentoItens.push(() => !!n._folha);
  }
}

function aguardarCarregamento(aoTerminar) {
  const tela = document.getElementById("carregando");
  const texto = document.getElementById("carregandoTexto");
  const barra = document.getElementById("carregandoProgresso");
  const inicio = performance.now();
  tela.hidden = false;

  function passo() {
    const prontos = carregamentoItens.filter((f) => f()).length;
    const pct = Math.round((prontos / carregamentoItens.length) * 100);
    barra.style.width = pct + "%";
    texto.textContent = "Carregando... " + pct + "%";

    const seg = (performance.now() - inicio) / 1000;
    const tudoPronto = prontos === carregamentoItens.length;
    if ((tudoPronto && seg >= CARREGAMENTO_MINIMO) || seg >= CARREGAMENTO_LIMITE) {
      tela.hidden = true;
      aoTerminar();
      return;
    }
    setTimeout(passo, 100);
  }
  passo();
}
