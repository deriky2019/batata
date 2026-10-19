/* =====================================================
   ciclo.js - Ciclo de dia e noite: 5 minutos de dia, 5 minutos de noite (CONFIG.ciclo, js/config.js)

   COMO FUNCIONA
   - O relógio anda só quando o jogo está rodando (parado em conversa, inventário, loja, menu e telas pretas).
   - O tempo fica salvo em diario.escolhas.cicloT (segundos desde a manhã). Ao dormir, volta para 0.
   - DE DIA: tudo como sempre. DE NOITE: a única missão é dormir (a caixa de missões do 🎒 mostra só isso).
   - O ciclo só vale do dia 2 ao dia 14 (DIA_FINAL - 1). Fica desligado no dia 1 (história guiada), no DIA_FINAL = dia 15 (volta do papai)
     e durante a noite especial do dia 4 (na escola), que já tem as próprias regras.
   - Dormir no sofá à noite:
       * se o dia já pode terminar (regras de motivoNaoDormir, js/dias.js): vai para o dia seguinte;
       * se ainda faltam missões do dia: ela dorme, "amanhece" e o MESMO dia continua com o relógio zerado
         (assim nenhuma parte da história é pulada).
   - Se a noite acabar e ela não dormir: desmaia de cansaço, acorda em casa e vale a mesma regra acima.
   - Escurecer: só ao ar livre (estrada, Bairro Sul, zonas Leste/Norte/Oeste). De noite fica azul escuro,
     com uma "luz" ao redor da Dellalos.
   ===================================================== */

const CICLO_EXTERIORES = ["estrada", "bairro_sul", "zona_leste", "zona_leste2", "zona_norte", "zona_norte2", "zona_oeste", "zona_oeste2"];

// O ciclo vale agora?
function cicloValido() {
  return !!historia.novoDia && diaAtual() >= 2 && diaAtual() < DIA_FINAL && !noiteAtiva();
}
function cicloT() {
  const t = Number(diario.escolhas.cicloT);
  return t >= 0 ? t : 0;
}
function cicloEhNoite() { return cicloValido() && cicloT() >= CONFIG.ciclo.dia; }

// Chamado a cada quadro (js/main.js)
function atualizarCiclo(dt) {
  ajustarInimigosNoite();
  if (typeof atualizarNecroLeste === "function") atualizarNecroLeste();   // fachada da loja Necro: só existe de noite (js/salas/zonaleste.js)
  // A Necro fecha ao amanhecer: quem está lá dentro é mandado para a rua
  if (cicloValido() && jogoRodando() && cicloCenaAoArLivre() === false && cicloCenaId === "necro" && !cicloEhNoite()) {
    const f = nasceFora(PORTAS.necro);
    mostrarMensagem("Amanheceu. A Necro desapareceu como fumaça.");
    mudarCena("zona_leste", f.x, f.y, "baixo");
    return;
  }
  if (!cicloValido() || !jogoRodando()) return;     // jogoRodando: js/efeitos.js
  // A loja fecha à noite: quem está lá dentro é mandado para a rua
  if (cicloEhNoite() && cicloCenaAoArLivre() === false && cicloCenaId === "loja") {
    const f = nasceFora(PORTAS.loja);
    mostrarMensagem("A loja vai fechar. Já é noite.");
    mudarCena("estrada", f.x, f.y, "baixo");
    return;
  }
  const C = CONFIG.ciclo;
  const antes = cicloT(), t = antes + dt;
  diario.escolhas.cicloT = t;
  const poente = C.dia - C.avisoPoente;
  if (antes < poente && t >= poente) mostrarMensagem("Está escurecendo. Logo será hora de voltar para casa e dormir.");
  if (antes < C.dia && t >= C.dia) {
    mostrarMensagem("Anoiteceu. Os moradores estão voltando para casa. A loja fechou e os inimigos estão mais agressivos. Volte para casa e durma.");
    if (typeof atualizarRotinaNoturnaV58 === "function") atualizarRotinaNoturnaV58();
    if (typeof faltaV82Verificar === "function") faltaV82Verificar();   // v82: não foi à escola = falta (js/faltas_v82.js)
    sinalizarMissao();
  }
  if (t >= C.dia + C.noite) desmaiarDeSono();
}

// O dia ainda não pode acabar: ela dorme e o MESMO dia recomeça de manhã
function acordarNoMesmoDia() {
  diario.escolhas.cicloT = 0;
  jogador.vida = jogador.vidaMax;
  reiniciarInimigos();
  mostrarMensagem("Amanheceu. O dia " + diaAtual() + " ainda não terminou.");
  sinalizarMissao();
}
function dormirSemAvancarDia() {
  iniciarTelaTempo("Amanheceu...", acordarNoMesmoDia, 2.5);
}

// A noite acabou e ela não dormiu: desmaia e acorda em casa
function desmaiarDeSono() {
  const avanca = motivoNaoDormir() === null;
  const sp = CENAS.sala.spawn;
  iniciarTelaTempo("Você desmaiou de cansaço...", function () {
    if (!avanca) { acordarNoMesmoDia(); return; }
    if (diaAtual() === DIA_NOITE && !historia.noiteIniciada) { iniciarNoiteDia4(); return; }   // (js/dias.js)
    comecarProximoDia();
  }, 3, function () { entrarNaCena("sala", sp.x, sp.y, "baixo"); });      // no meio da tela preta, leva para casa
}

// ---------- Visual ----------
function cicloMistura(a, b, k) {
  k = Math.max(0, Math.min(1, k));
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k];
}
// Cor por cima do mundo: [r, g, b, alfa] ou null (dia claro)
function cicloCor() {
  const C = CONFIG.ciclo, t = cicloT(), D = C.dia;
  const NOITE = [8, 12, 40, 0.58], POENTE = [255, 120, 40, 0.2];
  if (t >= D) return t < D + 25 ? cicloMistura(POENTE, NOITE, (t - D) / 25) : NOITE;
  if (t < 25) return [NOITE[0], NOITE[1], NOITE[2], NOITE[3] * (1 - t / 25)];          // amanhecendo
  if (t > D - 40) return [POENTE[0], POENTE[1], POENTE[2], POENTE[3] * ((t - (D - 40)) / 40)];   // entardecendo
  return null;
}

let cicloCenaRef = null, cicloCenaExterior = false, cicloCenaId = "";
function cicloCenaAoArLivre() {
  if (cenaAtual !== cicloCenaRef) {
    cicloCenaRef = cenaAtual;
    cicloCenaId = idDaCena(cenaAtual) || "";
    cicloCenaExterior = CICLO_EXTERIORES.indexOf(cicloCenaId) >= 0;
  }
  return cicloCenaExterior;
}

// ---------- Noite perigosa: inimigos comuns ficam mais rápidos e enxergam de mais longe (só ao ar livre) ----------
// Muda os valores dos TIPOS (uma vez, quando a noite começa ou termina). Chefes, duelos e a Gaby não mudam.
let cicloFatorInimigos = 1;
function ajustarInimigosNoite() {
  const noiteLa = cicloEhNoite() && cicloCenaAoArLivre() && !historia.comprouTalisma;   // talismã da sombra (loja Necro): a noite não ajuda os inimigos
  const kv = noiteLa ? CONFIG.ciclo.inimigoVelocidade : 1, kd = noiteLa ? CONFIG.ciclo.inimigoDeteccao : 1;
  if (kv === cicloFatorInimigos) return;
  cicloFatorInimigos = kv;
  for (const id in TIPOS_INIMIGOS) {
    const t = TIPOS_INIMIGOS[id];
    if (t.ia === "chefe" || t.ia === "duelo" || t.ia === "gaby" || t.chefe || t.vida >= 9999) continue;
    if (!t._base) t._base = { v: t.velocidade, d: t.deteccao };
    t.velocidade = t._base.v * kv;
    t.deteccao = t._base.d * kd;
  }
}

// Escurece o mundo (chamada por js/desenho.js, por baixo da interface)
function desenharCicloDia() {
  // Dentro da loja Necro: luz roxa e escura, para parecer outro mundo
  if (cenaAtual === CENAS.necro) {
    ctx.setTransform(ESCALA, 0, 0, ESCALA, 0, 0);
    const g = ctx.createRadialGradient(VIEW_L / 2, VIEW_A / 2, 120, VIEW_L / 2, VIEW_A / 2, 620);
    g.addColorStop(0, "rgba(40,10,70,0.30)");
    g.addColorStop(1, "rgba(15,4,30,0.72)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_L, VIEW_A);
    return;
  }
  if (!cicloValido() || !cicloCenaAoArLivre()) return;
  const c = cicloCor();
  if (!c || c[3] <= 0.005) return;
  const a = c[3], rgb = Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]);
  ctx.setTransform(ESCALA, 0, 0, ESCALA, 0, 0);
  // luz ao redor da Dellalos: mais clara perto dela, escura longe
  const fator = a >= 0.3 ? 0.35 : 0.35 + 0.65 * (1 - a / 0.3);
  const cx = jogador.x - camera.x, cy = jogador.y - 50 - camera.y;
  const g = ctx.createRadialGradient(cx, cy, 110, cx, cy, 560);
  g.addColorStop(0, "rgba(" + rgb + "," + (a * fator) + ")");
  g.addColorStop(1, "rgba(" + rgb + "," + a + ")");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_L, VIEW_A);
}

// Barrinha do tempo embaixo do "Dia N" (chamada por desenharDia, js/dias.js)
function desenharRelogioCiclo(larg) {
  const C = CONFIG.ciclo, t = cicloT(), noite = t >= C.dia;
  const total = noite ? C.noite : C.dia;
  const restante = Math.max(0, noite ? C.dia + C.noite - t : C.dia - t);
  const x = VIEW_L / 2 - larg / 2, y = 62;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(x, y, larg, 10);
  ctx.fillStyle = noite ? "#7ea6ff" : (restante < C.avisoPoente ? "#e07a3c" : "#f2c14e");
  ctx.fillRect(x + 2, y + 2, (larg - 4) * (restante / total), 6);
  if (noite) {
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(190,215,255," + (0.75 + 0.25 * Math.sin(performance.now() / 400)) + ")";
    ctx.fillText("Volte para casa e durma", VIEW_L / 2, 100);
  }
}
