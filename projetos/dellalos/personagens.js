/* =====================================================
   personagens.js - Quem é quem (nome, descrição curta e retrato)
   Usado pela caixa de conversa (js/dialogos.js) e pelo diário (js/diario.js).
   RETRATO: deixe  retrato: null  enquanto não existir a imagem.
   Quando tiver o arquivo, escreva só o caminho, ex.:  retrato: "assets/retratos/lucas.png"
   (nenhuma fala precisa mudar). Sem retrato, a conversa mostra uma caixinha com a
   inicial do nome e a descrição curta.
   A chave de cada personagem é o MESMO nome usado em "quem" nas falas.
   ===================================================== */

const PERSONAGENS = {
  Dellalos:  { descricao: "Protagonista, observadora e envolvida nos acontecimentos da história.", retrato: null },
  Gaby:      { descricao: "Acompanha Dellalos na chegada à escola.", retrato: null },
  Millena:   { descricao: "Estudante que apresenta a escola a Dellalos.", retrato: null },
  Lucas:     { descricao: "Alto, sério, silencioso e dedicado aos treinos.", retrato: null },
  Simon:     { descricao: "Amigo que acompanha Lucas.", retrato: null },
  Vitinho:   { descricao: "Amigo que acompanha Lucas.", retrato: null },
  Veras:     { descricao: "Hostil aos recém-chegados.", retrato: null },
  Nathalia:  { descricao: "Tranquila e curiosa; percebe uma semelhança entre Dellalos e alguém que conhece.", retrato: null },
  Morador:   { descricao: "Vizinho da casa laranja.", retrato: null },
  Estudante: { descricao: "Estudante que Dellalos encontra no corredor da escola.", retrato: null }
};

// Retrato já carregado (ou null). Só tenta carregar se houver um caminho escrito acima.
function retratoDe(quem) {
  const p = PERSONAGENS[quem];
  if (!p || !p.retrato) return null;
  if (p._img === undefined) {
    p._img = null;
    carregarImagem([p.retrato], (img) => { p._img = img; });
  }
  return p._img;
}
