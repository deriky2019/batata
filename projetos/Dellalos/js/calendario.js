/* =====================================================
   calendario.js - Em que dia cada missão é oferecida (para todos os dias terem missão)
   COMO FUNCIONA
     - DIA_DA_MISSAO diz o PRIMEIRO dia em que a missão pode ser aceita. Antes disso o NPC que
       a oferece só conversa ("hoje não tenho nada para você"). Depois, pode ser feita em qualquer dia.
     - Quem já tinha aceito a missão antes (save antigo) continua normalmente: o NPC só deixa de
       oferecer, nunca tira uma missão já aceita.
     - AGENDA_DIAS alimenta a linha "Missão: ..." na caixa MISSÃO DO DIA do 🎒 (js/dias.js).
   O CALENDÁRIO (15 dias)
     Dia 1-2   história da chegada (missões principais, carta, amigo do papai)
     Dia 3     Calçada sem slimes (Dona Rosa)            Dia 9   a Gaby (Zona Leste, opcional)
     Dia 4+    Quem morava aqui? (Zona Norte 2, pistas nas ruínas)
     Dia 5+    O trem que não chegou (Leste 2, Beto)   Dia 9+  Passageiros (Leste 2, Zeca)
     Dia 11+   A casa vazia (Bairro Sul, Seu Augusto; porão à noite)
     Dia 8+    Marcas no chão (Zona Norte 2, de noite, Nathalia)   Dia 11+  O último morador (Zona Norte 2, Millena)
     Dia 4     O gatinho perdido (Clarice)                Dia 10  Terreno limpo (Nando)
     Dia 5     Encomenda do pescador                      Dia 11  Engrenagens do portão (Orlando)
     Dia 6     O amigo que faltou (Simon) + treino        Dia 12  O coração da fábrica
     Dia 7     O que a Thaina escondia                    Dia 13  A Casa dos Cinco (mansão)
     Dia 8     A sala 1A                                  Dia 14  O túnel do selo (porão da mansão)
                                                          Dia 15  o papai e o torneio (DIA_FINAL)
     As missões pessoais dos amigos (js/amizade.js) ficam fora do calendário: aparecem pelo nível de amizade.
   PARA MUDAR: troque os dias em DIA_DA_MISSAO e em AGENDA_DIAS (e a lista acima).
   ===================================================== */

// Primeiro dia em que cada missão pode ser aceita (id da missão em js/missoes.js)
const DIA_DA_MISSAO = {
  caca: 3,          // Dona Rosa (estrada)
  gato: 4,          // Clarice (estrada)
  pescador: 5,      // Pescador (estrada)
  limpeza: 10,      // Nando (ferro-velho, Zona Leste)
  engrenagens: 11,  // Orlando (guarita, Zona Leste)
  fabrica: 12,      // a porta da fábrica só abre depois das engrenagens (js/missoes.js)
  mansao: 13,       // começa ao ler a ordem de produção na fábrica
  leste2_trem: 5,        // Leste 2: o Beto pede para investigar a estação
  leste2_passageiros: 9, // Leste 2: o Zeca pede os crachás (exige "O trem que não chegou")
  sul_passageiros: 11,   // Bairro Sul: "A casa vazia" (exige "Passageiros"; começa com o Seu Augusto)
  norte2: 4,        // Zona Norte 2: "Quem morava aqui?" (bairro evacuado)
  norte2_marcas: 8,   // Zona Norte 2, de noite, com a Nathalia (exige "Quem morava aqui?")
  norte2_morador: 11, // Zona Norte 2: o último morador, com a Millena (exige "Quem morava aqui?")
  tunel: 14         // o alçapão do porão da mansão só abre neste dia (js/salas/mansao.js)
};

// Linhas da caixa MISSÃO DO DIA: dia -> missões do dia (onde = dica de onde ir)
const AGENDA_DIAS = {
  3:  [{ id: "caca",        onde: "Dona Rosa, na estrada" }],
  4:  [{ id: "gato",        onde: "Clarice, na estrada" },
       { id: "norte2",      onde: "as casas em ruína da Zona Norte 2" }],
  5:  [{ id: "pescador",    onde: "o Pescador, na estrada" },
       { id: "leste2_trem", onde: "o Beto, no Leste 2" }],
  9:  [{ id: "leste2_passageiros", onde: "o Zeca, no Leste 2 (galpão laranja)" }],
  8:  [{ id: "norte2_marcas", onde: "a Zona Norte 2, de noite, com a Nathalia" }],
  10: [{ id: "limpeza",     onde: "Nando, no ferro-velho (Zona Leste)" }],
  11: [{ id: "engrenagens", onde: "Orlando, na guarita (Zona Leste)" },
       { id: "norte2_morador", onde: "a Zona Norte 2, com a Millena" },
       { id: "sul_passageiros", onde: "o Seu Augusto, no Bairro Sul (e a casa vazia, de noite)" }],
  12: [{ id: "fabrica",     onde: "a fábrica (Zona Leste)" }],
  13: [{ id: "mansao",      onde: "a ordem da fábrica e a mansão (Zona Oeste)" }],
  14: [{ id: "tunel",       onde: "o porão da mansão (Zona Oeste)" }]
};

// A missão já pode ser aceita neste dia?
function missaoDoDiaLiberada(id) {
  return diaAtual() >= (DIA_DA_MISSAO[id] || 0);
}

// O NPC conversa, mas ainda não tem a missão para oferecer
function semMissaoHoje(quem, texto) {
  abrirDialogo([{ quem: quem, texto: texto }]);
}

// Linhas da agenda de um dia, no formato da caixa MISSÃO DO DIA: [{ texto, ok }]
function itensAgendaDoDia(dia) {
  const lista = AGENDA_DIAS[dia] || [];
  const itens = [];
  for (const a of lista) {
    const m = MISSOES.find((x) => x.id === a.id);
    if (!m) continue;
    itens.push({ texto: "Missão: " + m.titulo + " (" + a.onde + ", opcional)", ok: missaoConcluida(m) });
  }
  return itens;
}
