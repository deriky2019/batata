/* =====================================================
   salas/capela.js - Capela da colina (por dentro) e o ALTAR DO CAOS
   Mapa de 22 x 22 tiles. Tudo é parede escura; a nave da capela é "escavada" com  sala(...).
   Entra-se pela porta da capela, na praça da colina da Zona Norte (js/salas/zonanorte.js).

   COMO É POR DENTRO (em tiles, x = coluna, y = linha):
     nave ........................ x 6-15, y 5-18 (porta de volta em 11,19)
     altar do Caos ............... x 9-12, y 5-6 (no fundo, com um braseiro de cada lado)
     tapete vermelho ............. x 10-11, do altar até a porta
     bancos ...................... x 7-8 e 13-14, linhas 9, 11, 13 e 15

   O ALTAR É OPCIONAL: não existe missão para ele e nada aparece na lista de missões.
     - Os ESPÍRITOS (inimigos da Zona Norte, js/inimigos.js) soltam 1 ESSÊNCIA cada ao desaparecer
       e renascem a cada visita. A contagem fica em diario.escolhas.essencias (salva) e aparece
       na tela, abaixo das moedas, sempre que a Dellalos carrega alguma.
     - No altar, a inscrição pede 10 sacrifícios. A Dellalos escolhe se oferece as essências que
       carrega (Oferecer / Ainda não). Pode oferecer aos poucos: a contagem fica em
       diario.escolhas.sacrificios. Ao chegar em 10, historia.caosSaciado = true.

   COMO MEXER NO FUTURO
     - O que acontece ao completar os 10 (PROVISÓRIO: só uma cena sombria e uma pista): ver
       altarCaosCompleto() aqui embaixo. É o lugar para dar uma recompensa, abrir algo na história etc.
     - Textos do altar: DIALOGOS.altarCaos em js/dialogos.js.
     - Mudar a quantidade de sacrifícios: ALTAR_TOTAL.
   ===================================================== */

const ALTAR_TOTAL = 10;     // sacrifícios que o altar pede

function essenciasAtuais() { return Number(diario.escolhas.essencias) || 0; }          // essências que ela carrega
function sacrificiosFeitos() { return Number(diario.escolhas.sacrificios) || 0; }      // essências já oferecidas ao altar

// Chamado por inimigos.js quando um espírito desaparece: solta 1 essência (vai direto para a Dellalos)
function espiritoDerrotado() {
  amizadeAoDerrotarInimigo();                       // missões pessoais dos amigos (js/amizade.js)
  marcarPasseioHoje();                              // (js/dias.js)
  const ganho = 1 + ((typeof arvoreTem === "function" && arvoreTem("eco")) ? MELHORIAS.arvoreEcoEssencias : 0);   // árvore: Eco de essência (+1)
  diario.escolhas.essencias = essenciasAtuais() + ganho;
  if (!historia.achouEssencia) {
    historia.achouEssencia = true;
    mostrarMensagem("O espírito se desfez e deixou uma essência. Algo me diz para guardá-la. (" + essenciasAtuais() + ")");
  } else {
    mostrarMensagem("Essência coletada!" + (ganho > 1 ? " +" + ganho : "") + " (" + essenciasAtuais() + ")");
  }
}

// Oferece ao altar as essências que ela carrega (no máximo até completar os 10)
function oferecerEssencias() {
  const pode = Math.min(essenciasAtuais(), ALTAR_TOTAL - sacrificiosFeitos());
  if (pode <= 0) return;
  diario.escolhas.essencias = essenciasAtuais() - pode;
  diario.escolhas.sacrificios = sacrificiosFeitos() + pode;
  if (sacrificiosFeitos() >= ALTAR_TOTAL) historia.caosSaciado = true;      // a cena final abre quando a conversa terminar
}

// Os 10 sacrifícios foram oferecidos. PROVISÓRIO: cena sombria + pista no diário. Aqui entra a consequência real.
function altarCaosCompleto() {
  abrirDialogo(DIALOGOS.altarCaos.completo);
}

// Letras JPMLR gravadas na parede oeste da nave. Antes de ouvir a história da Dona Lúcia (js/salas/bairrosul.js) a Dellalos
// não sabe o que significam; depois, liga as iniciais aos cinco amigos do avô dela (Julio, Perroti, Magnus, Luiz, Renan).
function usarInscricaoJPMLR() {
  const d = DIALOGOS.jpmlr;
  if (historia.luciaContouEspiritos) {
    if (historia.entendeuJPMLR) { abrirDialogo(d.entendiDepois); return; }
    abrirDialogo(d.entendi, function () { historia.viuJPMLR = true; historia.entendeuJPMLR = true; });
    return;
  }
  if (historia.viuJPMLR) { abrirDialogo(d.semEntenderDepois); return; }
  abrirDialogo(d.semEntender, function () { historia.viuJPMLR = true; });
}

// Desenha as letras na parede (chamado por js/desenho.js, no mundo): brilham de leve até serem vistas
function desenharMarcaCapela() {
  if (CENAS.capela !== cenaAtual) return;
  const pulso = historia.viuJPMLR ? 0 : 0.5 + 0.5 * Math.sin(performance.now() / 400);
  ctx.save();
  ctx.font = "bold 20px monospace"; ctx.textAlign = "center";
  ctx.globalAlpha = 0.75 + 0.25 * pulso;
  ctx.fillStyle = "#cfc3a0";
  ctx.shadowColor = "rgba(190,170,255," + (0.8 * pulso) + ")"; ctx.shadowBlur = 12 * pulso;
  ctx.fillText("JPMLR", 5 * TILE + TILE / 2, 10 * TILE);
  ctx.restore();
}

// B no altar: 1ª vez lê a inscrição; depois mostra a contagem e deixa oferecer (opcional)
function usarAltarCaos() {
  if (historia.caosSaciado && historia.altarFinalVisto) { abrirDialogo(DIALOGOS.altarCaos.saciado); return; }
  if (!historia.leuAltar) {
    abrirDialogo(DIALOGOS.altarCaos.inscricao, function () { historia.leuAltar = true; });
    return;
  }
  if (historia.caosSaciado) { historia.altarFinalVisto = true; altarCaosCompleto(); return; }   // (save feito logo após os 10)
  abrirDialogo(DIALOGOS.altarCaos.estado(essenciasAtuais(), sacrificiosFeitos()), function () {
    if (historia.caosSaciado && !historia.altarFinalVisto) {      // acabou de oferecer a 10ª essência
      historia.altarFinalVisto = true;
      altarCaosCompleto();
    }
  });
}

// Contador de essências na tela, abaixo das moedas (chamado por hud.js); só aparece quando há alguma
function desenharEssencias() {
  const n = essenciasAtuais();
  if (n <= 0) return;
  const y = 146, xFim = VIEW_L - 20;
  const texto = String(n);
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "right";
  const larg = ctx.measureText(texto).width;
  const cx = xFim - larg - 24;
  ctx.fillStyle = "rgba(160,120,255,0.35)";                         // brilho
  ctx.beginPath(); ctx.arc(cx, y - 10, 21, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#b9a3ff";                                        // gotinha de essência
  ctx.beginPath(); ctx.arc(cx, y - 10, 14, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = "#1e1612"; ctx.stroke();
  ctx.fillStyle = "#f2ecff";
  ctx.beginPath(); ctx.arc(cx - 4, y - 15, 4, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = "#1e1612";
  ctx.strokeText(texto, xFim, y);
  ctx.fillStyle = "#f3e6c8";
  ctx.fillText(texto, xFim, y);
}

(function () {
  const COLS = 22, ROWS = 22;
  const m = criarMapa(COLS, ROWS);

  // Tudo começa como parede escura e bloqueada
  pintar(m, "chao", 0, 0, COLS, ROWS, PAREDE_TOPO);
  bloquear(m, 0, 0, COLS, ROWS);

  // Nave: fachada da parede (2 linhas) em cima, piso de pedra livre
  paredeRB(m, 6, 3, 10, 17);
  pisoRB(m, 6, 5, 10, 14, 14, 9);
  bloquear(m, 6, 5, 10, 14, 0);
  pisoRB(m, 10, 7, 2, 12, 11, 5);                        // tapete vermelho, do altar até a porta

  // Porta de saída (parede de baixo): volta para a Zona Norte
  portaInterna(m, PORTAS.capelaDentro.x, PORTAS.capelaDentro.y, PORTA_DUPLA_BRANCA);

  // Altar do Caos: bloco de pedra no fundo, com um braseiro de cada lado
  bloco9(m, "chao", 9, 5, 4, 2, bloco(8, 3));
  bloquear(m, 9, 5, 4, 2);
  const braseiro = (x, y) => { por(m, "topo", x, y - 1, K(7, 6)); por(m, "obj", x, y, K(7, 7)); bloquear(m, x, y); };
  braseiro(8, 5); braseiro(13, 5);
  braseiro(6, 12); braseiro(15, 12);

  // Bancos de pedra (dois blocos de 2 tiles por linha, com o corredor do tapete no meio)
  for (const y of [9, 11, 13, 15]) {
    for (const x of [7, 8, 13, 14]) { por(m, "obj", x, y, K(3, 14)); bloquear(m, x, y); }
  }

  const fora = nasceFora(PORTAS.capela);                 // embaixo da porta da capela, na praça da Zona Norte

  CENAS.capela = {
    mapa: m,
    corFora: "#14110f",
    interativos: [
      // O altar (opcional): inscrição na 1ª vez; depois, oferecer as essências que carrega
      { nome: "altar_caos", area: celula(9, 5, 4, 2), conversar: function () { usarAltarCaos(); } },
      { nome: "inscricao_jpmlr", area: celula(5, 9, 1, 2), conversar: function () { usarInscricaoJPMLR(); } },
      { nome: "braseiros", area: celula(8, 5, 1, 1), texto: "Um braseiro apagado. As cinzas ainda estão mornas." },
      { nome: "braseiro_leste", area: celula(13, 5, 1, 1), texto: "Outro braseiro apagado. Alguém acendeu e apagou faz pouco tempo." },
      { nome: "bancos_oeste", area: celula(7, 9, 2, 7), texto: "Bancos de pedra, frios. Só o da frente está sem poeira." },
      { nome: "bancos_leste", area: celula(13, 9, 2, 7), texto: "Bancos de pedra. Há cera derretida no chão, entre eles." }
    ],
    saidas: [
      { area: celula(PORTAS.capelaDentro.x, PORTAS.capelaDentro.y), para: "zona_norte", x: fora.x, y: fora.y, dir: "baixo" }
    ],
    // Primeira visita: mostra o nome do lugar
    aoEntrar: function () {
      if (historia.visitouCapela) return;
      historia.visitouCapela = true;
      mostrarMensagem("Capela da colina");
    }
  };
})();
