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
  Gaby:      { descricao: "Aluna da escola; no dia 9, controlada pela Isabela, ataca Dellalos na Zona Leste.", retrato: null },
  Millena:   { descricao: "Estudante que apresenta a escola a Dellalos.", retrato: null },
  Lucas:     { descricao: "Alto, sério, silencioso e dedicado aos treinos.", retrato: null },
  Simon:     { descricao: "Amigo que acompanha Lucas.", retrato: null },
  Vitinho:   { descricao: "Amigo que acompanha Lucas.", retrato: null },
  "Zé":       { descricao: "Diretor da noite; dá a palestra sobre o torneio na sala 3C.", retrato: null },
  Durval:    { descricao: "Antigo professor da escola; a Isabela diz que ele é o líder da seita.", retrato: null },
  Samuel:    { descricao: "Aluno do turno da noite; fica na porta da escola e diz que está tudo normal.", retrato: null },
  Mariane:   { descricao: "Menina misteriosa que estava na sala 1A e avisou que elas iam morrer ali.", retrato: null },
  Veras:     { descricao: "Hostil aos recém-chegados.", retrato: null },
  Deriky:    { descricao: "Mora no Bairro Sul; avisou que a cidade é perigosa e que a escola esconde coisas terríveis.", retrato: null },
  Nathalia:  { descricao: "Tranquila e curiosa; percebe uma semelhança entre Dellalos e alguém que conhece.", retrato: null },
  "Amigo do papai": { descricao: "Amigo do papai; avisou que ele só vai conferir tudo no dia 15.", retrato: null },
  Thaina:    { descricao: "Fechada e de poucas palavras; melhor amiga da Isabela.", retrato: null },
  Isabela:   { descricao: "Misteriosa; age como se já conhecesse Dellalos.", retrato: null },
  Morador:   { descricao: "Vizinho da casa laranja.", retrato: null },
  Estudante: { descricao: "Estudante que Dellalos encontra no corredor da escola.", retrato: null },
  Pescador:  { descricao: "Pesca no lago do parque e tem uma encomenda para a casa do meio.", retrato: null },
  Clarice:   { descricao: "Moradora do canto da estrada; procura o gatinho Bolinha.", retrato: null },
  Bolinha:   { descricao: "Gatinho laranja da Clarice, que vive fugindo.", retrato: null },
  "Seu Tomás": { descricao: "Dono da loja da estrada; troca moedas por poções e melhorias.", retrato: null },
  "Dona Rosa": { descricao: "Vizinha da calçada; quer a calçada livre dos slimes.", retrato: null },
  "Seu Otávio": { descricao: "Último morador da Zona Norte 2; foi funcionário da escola e se esconde das pessoas.", retrato: null },
  Beto:      { descricao: "Sobrevivente do Leste 2; conhece a estação abandonada e os saqueadores.", retrato: null },
  Zeca:      { descricao: "Sobrevivente que se esconde no galpão laranja do Leste 2; viu passageiros sumirem do trem.", retrato: null },
  // ----- Bairro Sul -----
  "Dona Lúcia":  { descricao: "Moradora do Bairro Sul; cuida das plantas e guarda histórias antigas da cidade.", retrato: null },
  "Seu Augusto": { descricao: "Fica em frente de casa e comenta o que acontece no Bairro Sul.", retrato: null },
  Caio:          { descricao: "Jovem do Bairro Sul que estuda na mesma escola e gosta de caminhar pela pracinha.", retrato: null },
  Helena:        { descricao: "Cuida do jardim e dos canteiros do bairro.", retrato: null },
  Pedro:         { descricao: "Vizinho que vive procurando alguma coisa que nem ele sabe o que é.", retrato: null },
  // ----- Zona Leste -----
  Orlando:       { descricao: "Vigia da fábrica abandonada; perdeu as engrenagens do portão.", retrato: null },
  Nando:         { descricao: "Catador de sucata do ferro-velho; não aguenta mais ratos e robôs.", retrato: null },
  Necro:         { descricao: "Dono da loja Necro, que só aparece de noite na Zona Leste e vende coisas sobrenaturais.", retrato: null },
  "Capataz Mecânico": { descricao: "Robô que toca a linha de produção da fábrica à noite.", retrato: null }
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
