/* =====================================================
   dialogos.js - Caixa de conversa
   abrirDialogo(falas, aoTerminar): mostra uma fala por vez e pausa o jogo.
   O botão B completa a fala (se ainda estiver aparecendo) e depois passa para a próxima.
   Cada fala é { quem: "Nome", texto: "..." }.
   ===================================================== */

// O que já aconteceu na história (no futuro o salvamento.js pode guardar isto)
const historia = {
  conheceuMillena: false,
  conheceuMorador: false,
  conheceuEstudante: false,
  avisouMissaoEscola: false,   // já avisou "Nova missão"?
  chegouNaEscola: false,       // missão 1 concluída (ir para a escola)
  avisouMissaoMillena: false,
  // missão 2 (falar com a Millena) é concluída por conheceuMillena
  avisouMissaoCasa: false,
  chegouEmCasa: false,         // missão 3 concluída (ir para casa)
  avisouMissaoMorador: false,
  recebeuChaveQuarto: false,   // missão 4 concluída (o Morador deu a chave)
  quartoPaiAberto: false,      // a porta do quarto do pai já foi destrancada
  avisouMissaoQuarto: false,
  entrouQuartoPai: false,      // missão 5 concluída
  pegouCartaPai: false,        // já pegou a carta na escrivaninha
  // ----- novas (saves antigos não têm: ficam false) -----
  monologoCasa: false,         // pensamentos da Dellalos ao chegar em casa já aconteceram
  leuCartaPai: false,          // examinou a carta
  achouCaderno: false,         // achou o caderno na estante do quarto
  novoDia: false,              // dormiu no sofá: já é o dia seguinte
  chegouEscolaDia2: false,     // chegou na escola no dia seguinte
  conheceuLucas: false,
  conheceuVeras: false,
  conheceuNathalia: false,
  conheceuThaina: false,       // sala 3C
  conheceuIsabela: false,      // sala 3C
  conheceuAmigoPai: false,     // falou com o amigo do papai na estrada sul (dia 2, depois da carta)
  amigoSumiu: false,           // o amigo do papai já foi embora
  avisouArmario: false,        // dia 2: a Dellalos já avisou do armário de roupas (js/roupas.js)
  conheceuDeriky: false,       // falou com o Deriky no Bairro Sul (o dia fica em diario.escolhas.derikyDia)
  treinoOesteConviteAceito: false, // aceitou o convite do Simon para treinar no Oeste 2
  torneioAnunciado: false,     // no dia seguinte, a Millena contou do torneio
  isabelaConvidou: false,      // a Isabela já fez o convite perto da casa (resposta em diario.escolhas.torneio_participar)
  avisouMissaoFicou: false,
  avisouMissaoDia: false,
  avisouMissaoLucas: false,
  avisouMissaoNathalia: false,
  // ----- Sul 2: missão agrícola (flags compatíveis com saves antigos) -----
  visitouBairroSul2: false,
  // ----- Zona Norte 2: missão "Quem morava aqui?" (a partir do dia 4) -----
  norte2Iniciada: false,
  norte2Pista1: false, norte2Pista2: false, norte2Pista3: false, norte2Pista4: false, norte2Pista5: false,
  norte2Concluida: false,
  // ----- Bairro Sul: "A casa vazia" (dia 11; continuação de "Passageiros") -----
  sulPassIniciada: false, sulPassAlcapao: false, sulPorao1: false, sulPorao2: false, sulPorao3: false, sulPassFim: false,
  // ----- Leste 2: "O trem que não chegou" (dia 5) e "Passageiros" (dia 9) -----
  leste2TremIniciada: false, leste2Pista1: false, leste2Pista2: false, leste2Pista3: false, leste2TremFim: false,
  leste2PassageirosIniciada: false, leste2Cracha1: false, leste2Cracha2: false, leste2Cracha3: false, leste2PassageirosFim: false,
  norte2MoradorVisto: false, norte2MoradorFim: false,                       // "O último morador" (dia 11)
  norte2MarcasIniciada: false, norte2AltarVisto: false, norte2AltarFim: false,   // "Marcas no chão" (dia 8, de noite)
  avisouMissaoNorte2: false,
  fazendaSulMissaoIniciada: false,
  fazendaSulCanteiroPreparado: false,
  fazendaSulSementesPlantadas: false,
  fazendaSulPlantacaoRegada: false,
  fazendaSulPegouAgua: false,
  fazendaSulColheitaFeita: false,
  fazendaSulMissaoConcluida: false,
  // ----- missões secundárias da estrada (só aparecem depois de conhecer a Millena) -----
  conheceuPescador: false,
  aceitouEncomenda: false,     // pegou a encomenda do pescador
  entregouEncomenda: false,    // deixou a encomenda na porta da casa do meio
  avisouMissaoPescador: false,
  pescaTutorialIniciado: false,
  pescouPrimeiroPeixe: false,
  comeuPrimeiroPeixe: false,
  avisouMissaoPesca: false,
  conheceuClarice: false,
  aceitouGato: false,          // a Clarice pediu ajuda com o gatinho
  pegouGato: false,            // pegou o Bolinha (está no inventário)
  entregouGato: false,         // levou o Bolinha para a Clarice
  avisouMissaoGato: false,
  conheceuRosa: false,
  aceitouCaca: false,          // a Dona Rosa pediu para derrotar slimes
  entregouCaca: false,
  avisouMissaoCaca: false,
  // ----- loja e melhorias compradas -----
  conheceuTomas: false,
  comprouCoracao: false,
  comprouBotas: false,
  comprouLuvas: false,
  comprouMochila: false,
  comprouLacinho: false,
  comprouColete: false,        // Colete: golpes fortes causam menos dano e ela fica mais tempo sem levar dano (js/loja.js)
  comprouArmadura: false,      // Armadura: bloqueia um golpe a cada 25 s e o empurrão é menor
  comprouAnel: false,          // Anel da sorte: inimigos soltam 50% mais moedas
  comprouTenis: false,         // Tênis de corrida: mais fôlego e recarga mais rápida (js/loja.js)
  comprouCapacete: false,      // Capacete: salva de um golpe fatal (deixa 1 coração), recarrega com o tempo (js/loja.js)
  comprouArmaduraReforcada: false, // Armadura reforçada: o escudo recarrega mais rápido (js/loja.js)
  comprouAmuleto: false,       // Amuleto contra o Caos: espíritos e sombras empurram menos e dão mais tempo sem dano (js/loja.js)
  tomasFalouColete: false,     // o Seu Tomás comentou de onde veio o colete
  tomasFalouArmadura: false,   // o Seu Tomás comentou da armadura (mesmo lote do colete)
  // ----- Bairro Sul (região nova ao sul da cidade) -----
  visitouBairroSul: false,     // já entrou no Bairro Sul pela primeira vez
  conheceuLucia: false,
  pegouRetrato: false,         // a Dona Lúcia deu o retrato dos heróis (item no inventário)
  mostrouRetratoNathalia: false, // mostrou o retrato à Nathalia: o pai dela tem uma foto igual; ela é Master
  recebeuCarta8: false,        // dia 8: o Morador entregou a segunda carta do papai (chega logo; fique longe do hospedeiro)
  viuJPMLR: false,             // viu as letras JPMLR gravadas na parede da capela
  entendeuJPMLR: false,        // ligou as letras JPMLR aos amigos do avô da Dona Lúcia
  luciaContouEspiritos: false, // dia 5+: a Dona Lúcia contou a história do avô e dos amigos que expulsaram os espíritos
  conheceuAugusto: false,
  conheceuCaio: false,
  conheceuHelena: false,
  conheceuPedro: false,
  // ----- DIA_SEITA: "O amigo que faltou" (js/simon.js) -----
  soubeSimonFaltou: false,     // perguntou ao Lucas ou ao Vitinho e soube que o Simon faltou
  achouSimon: false,           // falou com o Simon no Bairro Sul
  simonAcompanha: false,       // o Simon está andando junto (companheiro SÓ nesta missão)
  revelouSeita: false,         // a conversa dos três com o Deriky aconteceu
  avisouMissaoSimon: false,
  // ----- DIA_1A: "A sala 1A" (js/chave1a.js) -----
  contouSeita: false,          // contou da seita e do torneio à Millena ou à Nathalia (começa a missão)
  chaveAcompanha: false,       // essa amiga anda junto (companheiro SÓ nesta missão; nome em diario.escolhas.chaveCom)
  pegouChave1A: false,         // pegou a chave na casa da diretora (Bairro Sul)
  abriu1A: false,              // abriu a porta da sala 1A
  viuMariana: false,           // conversou com a Mariane e a criatura preta surgiu
  matouSombra: false,          // derrotou a criatura preta
  // ----- DIA 10: o dia da volta do papai (js/dia10.js) -----
  dia10Acordou: false,         // a Dellalos já falou ao acordar
  dia10Escola: false,          // cena da chegada à escola com a Nathalia e a Millena
  isabelaD10Fim: false,        // venceu a Isabela (Zona Leste)
  thainaD10Fim: false,         // venceu a Thaina (Zona Oeste)
  lucasD10Fim: false,          // venceu o Lucas/Caos (Zona Norte)
  dia10TresFim: false,         // os três concluídos
  sulIntroD10: false, marianeD10Fim: false, durvalD10Fim: false, casaD10Fim: false,   // Mariane e Durval no Sul; volta para casa
  marianaFugiu: false,         // a Mariane saiu correndo e sumiu
  viuFugaMariana: false,       // já falaram sobre a fuga dela
  fimChave1A: false,           // fim da missão: as três fizeram o acordo
  avisouMissaoChave1A: false,
  // ----- Zona Leste (região perigosa a leste da cidade: ferro-velho, pátio de contêineres e fábrica) -----
  visitouZonaLeste: false,     // já entrou na Zona Leste pela primeira vez
  visitouZonaNorte: false,     // já entrou na Zona Norte pela primeira vez
  conheceuOrlando: false,      // vigia da fábrica
  aceitouEngrenagens: false,   // o Orlando pediu as 3 engrenagens do portão
  achouEngrenagem1: false,     // na pilha de sucata do ferro-velho
  achouEngrenagem2: false,     // o Sucateiro (inimigo do ferro-velho) soltou
  achouEngrenagem3: false,     // o Nando deu, depois da limpeza
  portaoFabricaAberto: false,  // as 3 engrenagens encaixaram: a porta da fábrica abre
  avisouMissaoEngrenagens: false,
  conheceuNando: false,        // catador de sucata do ferro-velho
  aceitouLimpeza: false,       // o Nando pediu para derrotar 8 inimigos da Zona Leste
  entregouLimpeza: false,
  avisouMissaoLimpeza: false,
  entrouFabrica: false,
  pegouCartao: false,          // cartão de acesso do depósito (não ocupa espaço no inventário)
  abriuSalaChefe: false,       // a porta da sala do Capataz foi aberta com o cartão
  derrotouCapataz: false,      // chefe da fábrica derrotado
  avisouMissaoFabrica: false,
  pegouOrdemFabrica: false,    // leu a ordem de produção na sala de controle
  augustoPista1: false,        // Seu Augusto: as coisas que somem são levadas de noite, em caixas, para a Zona Leste (depois da seita)
  augustoPista2: false,        // Seu Augusto: o "cliente sem registro" lembra o antigo zelador da mansão (depois da ordem de produção)
  augustoPista3: false,        // Seu Augusto: a chave da mansão foi levada para a fábrica
  augustoRumorDia: 0,          // Seu Augusto: último dia em que ele contou o rumor diário (um por dia; só história)
  millenaArena: false,         // dia 11: a Millena contou que o torneio será na arena da Oeste 2 (conversa normal, sala 2A)
  torneioChegada: false,       // dia 15: viu o aviso dos convidados chegando na estação do Leste 2 (js/torneio.js)
  torneioAberto: false,        // dia 15: se inscreveu no torneio com o Zé, na arena da Oeste 2 (js/torneio.js)
  torneioViradaIniciada: false, // dia 15: a final foi interrompida pelo Zé e as Sentinelas cercaram a arena (js/torneio.js)
  torneioFim: false,           // dia 15: derrotou as Sentinelas e o torneio acabou (js/torneio.js)
  pegouChaveMansao: false,     // achou a chave da mansão na gaveta da mesa da sala de controle (fábrica)
  mansaoAberta: false,         // usou a chave na porta da mansão (Zona Oeste); a chave sai do inventário
  comprouLanterna: false,      // comprou a lanterna na loja (a partir do DIA_LANTERNA): sem ela não dá para entrar na mansão
  mansaoPoraoAberto: false,    // leu o bilhete do zelador e abriu o alçapão embaixo do tapete da biblioteca
  mansaoTunelAberto: false,    // acertou a senha do painel da porta de aço do túnel, no porão da mansão (js/salas/mansao.js)
  mansaoCompleta: false,       // leu todos os papéis da mansão (js/salas/mansao.js)
  seloAberto: false,           // abriu a porta do selo, no fim do túnel, com a Nathalia como companheira (js/salas/mansao.js)
  seloQuebrado: false,         // leu tudo na sala do selo: o selo se quebrou e o demônio voltou à Terra (há demônios pelas estradas)
  avisouDemonios: false,       // já viu o aviso dos demônios ao sair da mansão
  avisouMissaoMansao: false,   // já mostrou "Nova missão: A Casa dos Cinco" (js/missoes.js)
  avisouMissaoTunel: false,    // já mostrou "Nova missão: O túnel do selo" (js/missoes.js)
  // ----- Treino com o Lucas na Zona Leste (DIA_SEITA em diante, só com amizade "Amigos"; veja js/salas/zonaleste.js) -----
  lucasZonaVisto: false,       // já conversou com o Lucas treinando sozinho
  lucasDuelo: false,           // fez o treino (a luta até ficar com 1 coração)
  lucasMoedas: false,          // já recebeu as 50 moedas
  lucasContado: false,         // contou da seita, do torneio e do Caos; ele revelou que já sabia
  lucasZonaFim: false,         // o Lucas foi embora: fim da missão
  avisouMissaoLucasZona: false,
  // ----- DIA_THAINA: "O que a Thaina escondia" (js/thaina.js) -----
  thainaConvidou: false,       // a Thaina sussurrou o convite na 3C (Zona Norte, marcos de pedra)
  thainaPediu: false,          // ouviu a Thaina no norte: Caos no Lucas, Isabela controla mentes, e o pedido
  lucasVitinhoFalou: false,    // o Vitinho contou que já sabia (o Caos já tomou o corpo do Lucas várias vezes)
  lucasSimonFalou: false,      // o Simon contou o mesmo
  derikyLucasFalou: false,     // o Deriky contou da luta contra o Lucas dominado e deu a pista de onde ele está
  sabeOndeLucas: false,        // fim do passo 4: sabe onde procurar o Lucas
  thainaFim: false,            // fim da missão: achou o "Lucas" (o Caos) na Zona Oeste (js/thaina.js, passos 5 e 6)
  marianaNorteFim: false,      // a Mariane falou com a Dellalos na Zona Norte (pecados das famílias Dellalos, sangue sagrado dobrado) e foi embora (js/thaina.js)
  caosOesteRevelou: false,     // o Caos já se revelou na Zona Oeste (se ela sair no meio da luta, não repete a conversa)
  avisouMissaoThaina: false,
  altarIniciou: false,         // a Isabela falou com a Dellalos perto da capela e a Thaina controlada surgiu (js/thaina.js)
  altarLutou: false,           // a luta com a Thaina terminou (ganhando ou perdendo)
  altarFim: false,             // o dia passou: a Isabela controlou a Dellalos e todas as amizades voltaram ao começo
  // ----- Altar do Caos, na capela da colina (Zona Norte). OPCIONAL: não é missão e não aparece na lista de missões -----
  visitouCapela: false,        // já entrou na capela
  achouEssencia: false,        // já viu a primeira essência cair de um espírito
  leuAltar: false,             // leu a inscrição do altar (10 sacrifícios)
  caosSaciado: false,          // ofereceu as 10 essências ao altar
  altarFinalVisto: false,      // já viu a cena que acontece quando o altar recebe os 10 sacrifícios
  // ----- Noite do dia 4: a Millena chama a Dellalos para a escola (js/dias.js, parte 1) -----
  noiteIniciada: false,        // dormiu no dia 4 e recebeu a mensagem da Millena
  falouSamuel: false,          // conversou com o Samuel, o aluno da noite, na porta da escola (parte 2)
  noitePlano: false,           // conversou com a Millena no corredor e escolheu quem distrai e quem pega a chave (parte 3; a escolha fica em diario.escolhas.noite_plano)
  noiteEntrou3C: false,        // entrou na 3C, onde o Zé dá a palestra (parte 4)
  noiteMillenaDistrai: false,  // plano "pegar": a Millena já está distraindo o Zé (parte 4)
  pegouChaveZe: false,         // pegou a chave do Zé (não ocupa espaço no inventário)
  falouIsabela3B: false,       // conversou com a Isabela na 3B
  falouDurval: false,          // conversou com o Durval na 3B
  noite3BFim: false,           // a Millena saiu da 3B: ao voltar para o corredor, a noite termina
  noiteDurvalFalou: false,     // o Durval mandou as duas irem embora (e a escolha de ficar ou sair já foi feita)
  noiteFicou: false,           // escolheu ficar na 3B: a sombra ataca (a escolha também fica em diario.escolhas.noite_durval)
  matouSombraNoite: false,     // derrotou a sombra da 3B
  noiteMillenaSaiu: false,     // a Millena já foi embora da 3B
  noiteFim: false,             // a noite na escola terminou: já dá para dormir e ir para o dia 5
  // ----- Adaga (loja) -----
  comprouAdaga: false,         // comprou a adaga na loja (ela vai para o inventário)
  adagaEquipada: false,        // a adaga está equipada: +1 de dano
  recebeuDalia: false,         // o amigo do papai entregou a Dália (dia 5, Zona Leste)
  daliaEquipada: false,        // a Dália está equipada (no lugar da adaga): +1 de dano por nível (1 a 5)
  // ----- Dia 9: a Gaby, controlada pela Isabela, na Zona Leste (js/salas/zonaleste.js; DIA_GABY em js/dias.js) -----
  tomasFalouAmuleto: false,    // o Seu Tomás contou do amuleto estranho (a partir do DIA_AMULETO_ESTRANHO)
  comprouAmuletoEstranho: false, // comprou o amuleto estranho na loja (ele vai para o inventário)
  gabyDerrotada: false,        // venceu a luta: a Gaby está caída, esperando a decisão
  gabySalva: false,            // colocou o amuleto nela: a Gaby voltou ao normal
  gabyMorta: false,            // matou a Gaby: ela não volta mais neste save
  gabyFim: false,              // a Gaby saiu de cena para sempre (foi embora ou morreu)
  ganhouLivroMagia: false,     // recebeu o livro de magia da Gaby (só se ela foi salva)
  leuLivroMagia: false,        // examinou o livro de magia
  // ----- Loja NECRO (Zona Leste, só de noite; js/salas/necro.js e js/loja.js) -----
  conheceuNecro: false,        // já conversou com o dono da loja Necro
  comprouMoedaMaldita: false,  // moeda maldita: inimigos soltam mais moedas
  comprouTalisma: false,       // talismã da sombra: a noite não deixa os inimigos mais rápidos
  comprouPataCorvo: false,     // asa de morcego: mais tempo sem levar dano depois de um golpe
  comprouGrimorio: false,      // comprou o grimório de aprimoramento na Necro (ele vai para o inventário)
  grimorioInstalado: false     // colocou o grimório no lugar do livro do papai, em casa: a árvore de habilidades abre ali
};

// Opções do convite da Isabela para o torneio. Com comAqui = true há a 3ª opção ("O que você tá fazendo aqui?"):
// ela repete a pergunta com "!" e só volta com Sim e Não. A resposta fica em diario.escolhas.torneio_participar.
function opcoesConviteTorneio(comAqui) {
  const ops = [
    { id: "sim", texto: "Sim", falas: [ { quem: "Isabela", texto: "Então espere. A escola vai anunciar o dia." } ] },
    { id: "nao", texto: "Não", falas: [ { quem: "Isabela", texto: "Então tome cuidado." } ] }
  ];
  if (comAqui) {
    ops.push({
      id: "aqui", texto: "O que você tá fazendo aqui?",
      get falas() { return [ { quem: "Isabela", texto: "Quer participar?!", escolha: "torneio_participar", opcoes: opcoesConviteTorneio(false) } ]; }
    });
  }
  return ops;
}

// Respostas do treino do Lucas (Zona Leste). A escolha fica em diario.escolhas.lucas_treino ("olhar" ou "participar").
function opcoesTreinoLucas() {
  return [
    { id: "olhar", texto: "Só olhar",
      falas: [ { quem: "Dellalos", texto: "Só vim olhar um pouco." },
               { quem: "Lucas",    texto: "Fique à vontade. Só não me distraia." },
               { quem: "Dellalos", texto: "Ele treina sem errar um único golpe. Que foco." },
               { quem: "Lucas",    texto: "Quando quiser um teste de verdade, é só falar." } ] },
    { id: "participar", texto: "Participar",
      falas: [ { quem: "Dellalos", texto: "Quero participar!" },
               { quem: "Lucas",    texto: "Então vou te testar de verdade. Não vou pegar leve, e você também não." } ] }
  ];
}

// Depois do treino, a Dellalos decide se conta o que descobriu (resposta em diario.escolhas.lucas_seita: "contar" ou "depois")
function opcoesContarLucas() {
  return [
    { id: "contar", texto: "Contar sobre a seita, o torneio e o Caos",
      falas: [ { quem: "Dellalos", texto: "Lucas, o torneio é uma armadilha. Existe uma seita por trás dele." },
               { quem: "Dellalos", texto: "Eles querem roubar a energia vital dos jovens para alimentar o Caos, a entidade que eles adoram." },
               { quem: "Lucas",    texto: "..." },
               { quem: "Lucas",    texto: "Eu sei.", info: "lucas_sabe" },
               { quem: "Dellalos", texto: "Sabe?! Desde quando?" },
               { quem: "Lucas",    texto: "Faz um tempo. Por isso treino tanto. Se o torneio acontecer, quero estar pronto." },
               { quem: "Lucas",    texto: "Escute com atenção: tome cuidado com qualquer pessoa. Qualquer uma. Inclusive a Isabela." },
               { quem: "Dellalos", texto: "A Isabela?... Tudo bem. Vou tomar cuidado." },
               { quem: "Lucas",    texto: "Ótimo. Preciso continuar o treino. A gente se vê, Dellalos." } ] },
    { id: "depois", texto: "Agora não",
      falas: [ { quem: "Dellalos", texto: "Nada, só estava pensando alto." },
               { quem: "Lucas",    texto: "Hm. Quando quiser falar, estou por aqui. Descanse." } ] }
  ];
}

const DIALOGOS = {
  millena: {
    primeira: [
      { quem: "Millena",  texto: "Oi! Você é nova aqui?", conhece: "Millena" },
      { quem: "Dellalos", texto: "Sim! Eu me chamo Dellalos." },
      { quem: "Millena",  texto: "Você é a Dellalos! Eu sou a Millena. Vamos ser melhores amigas!" },
      { quem: "Millena",  texto: "Senta do meu lado!" }
    ],
    depois: [
      { quem: "Millena",  texto: "Somos melhores amigas agora, Dellalos!" }
    ],
    // dia 11 em diante (uma vez): ela descobriu onde será o torneio (js/salas/aulas.js). Textos PROVISÓRIOS.
    arena: [
      { quem: "Millena",  texto: "Dellalos! Descobri uma coisa sobre o torneio." },
      { quem: "Dellalos", texto: "O que foi?" },
      { quem: "Millena",  texto: "Ouvi uns alunos mais velhos falando: vai ser na Oeste 2, na planície onde o Simon e o pessoal treinam.", info: "torneio_arena" },
      { quem: "Millena",  texto: "Estão montando uma arena lá. Dizem que vem gente de fora para assistir." },
      { quem: "Dellalos", texto: "Então é lá que tudo vai acontecer... A gente precisa estar preparada." },
      { quem: "Millena",  texto: "Eu estou com você. Mas dá uma olhada no lugar antes de o dia chegar." }
    ],
    // dia seguinte ao encontro com o Deriky: ela conta do torneio (js/dias.js: torneioPronto)
    torneio: [
      { quem: "Millena",  texto: "Dellalos! Ainda bem que você chegou! Tenho uma novidade enorme!" },
      { quem: "Millena",  texto: "Vai ter um torneio aqui na escola! Os alunos vão lutar uns contra os outros!", info: "torneio_anuncio" },
      { quem: "Dellalos", texto: "Lutar? Contra os outros alunos?" },
      { quem: "Millena",  texto: "Isso! Ainda não anunciaram o dia, mas só se fala nisso nos corredores." },
      { quem: "Millena",  texto: "Eu não participo nem pagando. Mas você é corajosa... quem sabe?" },
      { quem: "Dellalos", texto: "...Será que era disso que o Deriky estava falando?" }
    ],
    depoisTorneio: [
      { quem: "Millena",  texto: "O torneio vai ser o assunto da semana! Ainda não saiu o dia." }
    ],
    // depois de conhecer o Lucas (variação de diálogo)
    depoisLucas: [
      { quem: "Millena",  texto: "Vi você falando com o Lucas! Ele fala pouco, mas leva os treinos a sério." }
    ]
  },
  morador: {
    // Dia 8 (DIA_1A): ao sair de casa, o Morador chama a Dellalos e entrega a segunda carta do papai (js/dias.js)
    carta: [
      { quem: "Morador",  texto: "Dellalos! Espere! Seu pai mandou isto para você." },
      { quem: "Morador",  texto: "Pediu para eu entregar quando chegasse a hora. Acho que a hora é hoje." },
      { quem: "Dellalos", texto: "Outra carta do papai..." },
      { quem: "Carta do papai", texto: "Dellalos, eu chego logo, bem mais cedo do que você imagina." },
      { quem: "Carta do papai", texto: "Eu sabia que isso chegaria. Por isso deixei tudo preparado para você." },
      { quem: "Carta do papai", texto: "Fique longe do hospedeiro, custe o que custar.", info: "hospedeiro_aviso" },
      { quem: "Carta do papai", texto: "Quando eu chegar, explico tudo. Até lá, tome cuidado. - Papai" },
      { quem: "Dellalos", texto: "(O hospedeiro... a Thaina falou disso. O papai sabia do Caos esse tempo todo?)", se: function () { return historia.thainaPediu; } },
      { quem: "Dellalos", texto: "(Hospedeiro? De quê? O papai sabe de algo que eu ainda não sei.)", se: function () { return !historia.thainaPediu; } }
    ],
    depoisCarta: [
      { quem: "Morador", texto: "Seu pai deve estar chegando. Cuide-se, Dellalos." }
    ],
    chave: [
      { quem: "Morador",  texto: "Dellalos! Já voltou da escola? Tenho uma coisa para você." },
      { quem: "Morador",  texto: "Seu pai deixou esta chave comigo. É a do quarto dele.", info: "chave_papai" },
      { quem: "Dellalos", texto: "A chave do quarto do papai?" },
      { quem: "Morador",  texto: "Isso mesmo. Ele disse que você saberia a hora certa de usar." },
      { quem: "Dellalos", texto: "Obrigada! Vou até lá agora." }
    ],
    primeira: [
      { quem: "Morador",  texto: "Bom dia! Você deve ser a nova moradora da casa laranja.", conhece: "Morador" },
      { quem: "Dellalos", texto: "Sou sim! Me chamo Dellalos e estou indo para a escola." },
      { quem: "Morador",  texto: "A escola fica no fim da avenida. Cuidado com os slimes pelo caminho!" },
      { quem: "Dellalos", texto: "Slimes?" },
      { quem: "Morador",  texto: "Umas gosmas verdes. Use o botão A para bater neles." }
    ],
    depois: [
      { quem: "Morador",  texto: "Cuidado com os slimes, Dellalos! A escola fica à direita." }
    ]
  },
  estudante: {
    primeira: [
      { quem: "Estudante", texto: "Oi! Você é a aluna nova?", conhece: "Estudante" },
      { quem: "Dellalos",  texto: "Sou! Meu nome é Dellalos." },
      { quem: "Estudante", texto: "A Millena está na sala 2A. Ela adora conhecer gente nova!" }
    ],
    depois: [
      { quem: "Estudante", texto: "A sala 2A é a segunda porta, ali em cima. Boa aula!" }
    ]
  },

  // ===== Diálogos novos (conteúdo PROVISÓRIO) =====
  // Campos opcionais de cada fala:
  //   se: () => bool        só aparece se a condição for verdadeira
  //   conhece: "Nome"       registra o personagem no diário quando a fala aparece
  //   info: "id"            registra uma informação (INFOS em js/diario.js)
  //   amizade: { id, quem, pts }   pontos de amizade (também nas opções; id único evita repetir; veja js/amizade.js)
  //   escolha: "id"         (com opcoes) guarda a resposta escolhida em diario.escolhas
  //   opcoes: [{ id, texto, falas: [...], fn: () => {} }]   respostas do jogador
  // ===== Noite do dia 4 (parte 1) =====
  noite: {
    mensagem: [
      { quem: "Dellalos", texto: "O celular vibrou em cima do sofá. É uma mensagem da Millena." },
      { quem: "Millena",  texto: "Dellalos, vem pra escola agora. Eu te explico quando você chegar." },
      { quem: "Dellalos", texto: "Agora? Já é noite... Mas a Millena não ia pedir à toa. Vou lá." }
    ],
    // Samuel, aluno da noite, na porta da escola (parte 2)
    samuel: [
      { quem: "Dellalos", texto: "Oi. Você estuda aqui à noite? O que está acontecendo na escola?" },
      { quem: "Samuel",   texto: "Estudo, sim. Eu sou o Samuel. Está tudo normal por aqui.", conhece: "Samuel" },
      { quem: "Samuel",   texto: "Só está rolando uma palestra sobre um certo torneio." },
      { quem: "Dellalos", texto: "Um torneio... Entendi. Obrigada, Samuel." },
      { quem: "Samuel",   texto: "Pode entrar, a porta está aberta." }
    ],
    // Millena no corredor da escola, à noite (parte 3). A escolha fica em diario.escolhas.noite_plano ("distrair" ou "pegar")
    millena: [
      { quem: "Millena",  texto: "Você veio! Fala baixo. A Isabela também está aqui, ela é assistente na 3B." },
      { quem: "Dellalos", texto: "O que está acontecendo, Millena?" },
      { quem: "Millena",  texto: "Precisamos pegar uma chave com o diretor da noite. Ele está dando a palestra na 3C." },
      { quem: "Millena",  texto: "Uma de nós distrai o diretor e a outra pega a chave. Só que eu não sei quem faz o quê." },
      { quem: "Dellalos", texto: "(Quem vai fazer o quê?)",
        escolha: "noite_plano", opcoes: [
          { id: "distrair", texto: "Eu distraio o diretor",
            falas: [ { quem: "Dellalos", texto: "Eu distraio ele. Você pega a chave." },
                     { quem: "Millena",  texto: "Combinado. Vou esperar na porta da 3C." } ],
            fn: function () { historia.noitePlano = true; } },
          { id: "pegar", texto: "Eu pego a chave",
            falas: [ { quem: "Dellalos", texto: "Eu pego a chave. Você distrai ele." },
                     { quem: "Millena",  texto: "Combinado. Vou esperar na porta da 3C." } ],
            fn: function () { historia.noitePlano = true; } }
        ] }
    ],
    millenaDepois: [
      { quem: "Millena", texto: "Vamos! A palestra é na 3C. Eu espero você lá." }
    ],
    // ----- 3C: o Zé e a palestra (parte 4) -----
    ze: {
      distrair: [
        { quem: "Dellalos", texto: "Com licença. O senhor é o Zé, né? Posso fazer uma pergunta sobre o torneio?", },
        { quem: "Zé",       texto: "Claro, aluna. Pergunte. Mas seja rápida, a palestra ainda não acabou.", conhece: "Zé" },
        { quem: "Dellalos", texto: "Como esse torneio funciona? Quem participa?" },
        { quem: "Zé",       texto: "É uma tradição daqui. Só participa quem está pronto. O resto eu conto no dia certo." },
        { quem: "Millena",  texto: "(Enquanto o Zé olha para a Dellalos, a Millena pega a chave da mesa dele sem fazer barulho.)" },
        { quem: "Millena",  texto: "Peguei. Vamos para a 3B." }
      ],
      ocupado: [
        { quem: "Zé", texto: "Sente-se, aluna. A palestra ainda não terminou.", conhece: "Zé" }
      ],
      distraido: [
        { quem: "Dellalos", texto: "(O Zé está concentrado na pergunta da Millena. Agora é a minha chance.)" }
      ],
      depois: [
        { quem: "Zé", texto: "A palestra já vai acabar. Boa noite, meninas." }
      ]
    },
    millena3c: {
      distrair: [
        { quem: "Millena", texto: "Quando você começar a conversar com o Zé, eu pego a chave da mesa dele." }
      ],
      pegar: [
        { quem: "Millena", texto: "Deixa comigo. Vou fazer uma pergunta para o Zé." },
        { quem: "Millena", texto: "Quando ele estiver distraído, pega a chave na mesa dele, a mesa da professora." }
      ],
      rapido: [
        { quem: "Millena", texto: "Rápido! Pega a chave na mesa dele!" }
      ],
      depois: [
        { quem: "Millena", texto: "Conseguimos! Vamos para a 3B. A Isabela está lá." }
      ]
    },
    // ----- 3B: Isabela e Durval (parte 4; conteúdo PROVISÓRIO: ajuste com a história original) -----
    isabela3b: [
      { quem: "Dellalos", texto: "Isabela? Então você estava aqui mesmo." },
      { quem: "Isabela",  texto: "Fala baixo. Esse é o Durval. Ele foi professor daqui há muito tempo." },
      { quem: "Isabela",  texto: "E é o líder da seita." },
      { quem: "Dellalos", texto: "Líder da... seita?" },
      { quem: "Isabela",  texto: "Depois eu te explico. Por enquanto, fica perto de mim." }
    ],
    isabela3bDepois: [
      { quem: "Isabela", texto: "Não olha demais para ele. Depois a gente conversa." }
    ],
    durval3b: [
      { quem: "Durval",   texto: "Então a aluna nova também veio.", conhece: "Durval" },
      { quem: "Durval",   texto: "Fique à vontade. Eu só estava terminando de arrumar a sala." },
      { quem: "Dellalos", texto: "(Ele fala com calma demais. Preciso sair daqui e pensar no que acabei de ouvir.)" }
    ],
    durval3bDepois: [
      { quem: "Durval", texto: "Boa noite, aluna. Vá para casa descansar." }
    ],
    // ----- final da 3B (parte 5; conteúdo PROVISÓRIO). A escolha fica em diario.escolhas.noite_durval ("sair" ou "ficar") -----
    durvalFim: [
      { quem: "Durval",   texto: "Millena. Dellalos. Vocês duas são significantes." },
      { quem: "Durval",   texto: "Mas eu só preciso do Lucas. Saiam daqui, imediatamente." },
      { quem: "Dellalos", texto: "(O que eu faço?)",
        escolha: "noite_durval", opcoes: [
          { id: "sair", texto: "Sair",
            falas: [ { quem: "Dellalos", texto: "Vamos embora, Millena. Agora." } ] },
          { id: "ficar", texto: "Ficar",
            falas: [ { quem: "Dellalos", texto: "Eu não vou sair daqui sem entender o que está acontecendo." },
                     { quem: "Isabela",  texto: "Eu avisei." } ],
            fn: function () { historia.noiteFicou = true; } }
        ] }
    ],
    millenaFim: function (ficou) {
      const falas = [];
      if (ficou) falas.push({ quem: "Millena", texto: "Você está bem? Aquilo era uma sombra de verdade!" });
      falas.push({ quem: "Millena", texto: "Dellalos, isso é grave. Eu preciso contar isso para o máximo de pessoas possível." });
      falas.push({ quem: "Millena", texto: "Vai para casa o mais rápido que puder. Eu vou avisar os outros." });
      return falas;
    },
    millena3b: [
      { quem: "Millena", texto: "Estou com medo, Dellalos. Vamos ver o que eles têm a dizer." }
    ],
    samuelDepois: [
      { quem: "Samuel", texto: "Pode entrar. Está tudo normal lá dentro, só a palestra." }
    ]
  },
  dellalos: {
    casa: [
      { quem: "Dellalos", texto: "Que dia comprido... A escola é enorme.", info: "primeiro_dia" },
      { quem: "Dellalos", texto: "A Millena foi simpática e me apresentou tudo. Acho que vou gostar daqui." }
    ],
    dormir: [
      { quem: "Dellalos", texto: "Se eu dormir agora, não vou passear pela cidade hoje.",
        se: function () { return diaAtual() >= 2 && !passeouHoje() && !cicloEhNoite(); } },
      { quem: "Dellalos", texto: "Foi um dia cheio. Talvez seja hora de descansar.",
        escolha: "dormir",
        opcoes: [
          { id: "sim", texto: "Descansar até amanhã", fn: function () { dormirAteAmanha(); } },
          { id: "nao", texto: "Ainda não" }
        ] }
    ]
  },
  lucas: {
    primeira: [
      { quem: "Simon",   texto: "Ei, você é a aluna nova, né?", conhece: "Simon" },
      { quem: "Vitinho", texto: "Esse é o Lucas. Ele não fala muito.", conhece: "Vitinho" },
      { quem: "Lucas",   texto: "...Oi.", conhece: "Lucas", info: "lucas_treinos",
        opcoes: [
          { id: "nome",  texto: "Sou a Dellalos.", amizade: { id: "lucas_nome", quem: "Lucas", pts: 3 },
            falas: [ { quem: "Lucas", texto: "Lucas." } ] },
          { id: "treino", texto: "Vocês estão indo treinar?", amizade: { id: "lucas_treino", quem: "Lucas", pts: 3 },
            falas: [ { quem: "Lucas", texto: "Sempre." },
                     { quem: "Simon", texto: "Ele não perde um treino." } ] }
        ],
        escolha: "lucas_conversa" }
    ],
    depois: [
      { quem: "Lucas", texto: "..." }
    ]
  },
  simon: {
    antes:  [ { quem: "Simon", texto: "Oi! Você precisa falar com o Lucas, ele está ali." , se: function () { return !historia.conheceuLucas; } } ],
    depois: [ { quem: "Simon", texto: "O Lucas é assim mesmo. Você se acostuma." } ]
  },
  vitinho: {
    antes:  [ { quem: "Vitinho", texto: "Fala com o Lucas! Ele não morde." } ],
    depois: [ { quem: "Vitinho", texto: "A gente sempre está por aqui, na 3A." } ]
  },
  // ===== DIA_1A: "A sala 1A" (textos PROVISÓRIOS: ajuste com a história original) =====
  // Começa se a Dellalos contar da seita e do torneio à Millena ou à Nathalia (js/chave1a.js).
  chave1a: {
    millenaOferta: [
      { quem: "Millena", texto: "Dellalos, você está com uma cara estranha. Aconteceu alguma coisa?",
        escolha: "chave1a_oferta",
        opcoes: [
          { id: "contar", texto: "Contar da seita e do torneio",
            falas: [
              { quem: "Dellalos", texto: "Millena, o torneio é um plano de uma seita. Eles roubam a energia vital dos alunos para alimentar uma entidade chamada Caos." },
              { quem: "Millena",  texto: "Eu sempre achei esta escola estranha... os corredores, as salas fechadas, tudo." },
              { quem: "Millena",  texto: "Os alunos têm teorias sobre a sala 1A. Dizem que tem coisas estranhas lá dentro.", info: "chave_diretora" },
              { quem: "Millena",  texto: "Mas a chave só fica com a diretora. E ela mora aqui na cidade, no Bairro Sul." },
              { quem: "Millena",  texto: "Acho que a casa dela é aquela sem nome, perto da casa da Dona Lúcia. Ninguém nunca vê ninguém entrando lá." },
              { quem: "Dellalos", texto: "Então vamos pegar essa chave." },
              { quem: "Millena",  texto: "Eu vou com você! Só não me peça para ir na frente..." }
            ] },
          { id: "nada", texto: "Não é nada.",
            falas: [ { quem: "Millena", texto: "Se mudar de ideia, pode me contar. Eu sou boa de ouvir." } ] }
        ] }
    ],
    nathaliaOferta: [
      { quem: "Nathalia", texto: "Dellalos... você parece preocupada. Quer conversar?",
        escolha: "chave1a_oferta",
        opcoes: [
          { id: "contar", texto: "Contar da seita e do torneio",
            falas: [
              { quem: "Dellalos", texto: "Nathalia, o torneio é um plano de uma seita. Eles roubam a energia vital dos alunos para alimentar uma entidade chamada Caos." },
              { quem: "Nathalia", texto: "Eu sempre achei esta escola estranha. Já desenhei corredores daqui sem saber por quê." },
              { quem: "Nathalia", texto: "Os alunos têm teorias sobre a sala 1A. Dizem que tem coisas estranhas lá dentro.", info: "chave_diretora" },
              { quem: "Nathalia", texto: "Mas a chave só fica com a diretora. E ela mora no Bairro Sul." },
              { quem: "Nathalia", texto: "Acho que a casa dela é aquela sem nome, perto da casa da Dona Lúcia. Parece que ninguém mora lá." },
              { quem: "Dellalos", texto: "Então vamos pegar essa chave." },
              { quem: "Nathalia", texto: "Vou com você. Prefiro ver isso de perto a ficar imaginando." }
            ] },
          { id: "nada", texto: "Não é nada.",
            falas: [ { quem: "Nathalia", texto: "Tudo bem. Se precisar, estou aqui." } ] }
        ] }
    ],
    // Mariane (quem = nome de quem está junto)
    mariana: function (com) {
      return [
        { quem: "Mariane",  texto: "Vocês não podem estar aqui.", conhece: "Mariane", info: "mariana_1a" },
        { quem: "Dellalos", texto: "Quem é você? Por que não podemos?" },
        { quem: "Mariane",  texto: "Isso não importa." },
        { quem: "Dellalos", texto: "Importa sim! Explique o que está acontecendo nesta sala." },
        { quem: "Mariane",  texto: "Vocês vão morrer aqui mesmo." },
        { quem: com,        texto: "Dellalos... tem alguma coisa se mexendo ali!" }
      ];
    },
    depoisMariana: function (com, outra) {
      return [
        { quem: "Dellalos", texto: "Ela fugiu... Quem é a Mariane? E o que era aquilo?" },
        { quem: com,        texto: "Não sei. Mas isso prova que o que você contou é verdade." },
        { quem: com,        texto: "Vamos falar com a " + outra + ". Ela precisa saber, e a gente vai precisar de ajuda." }
      ];
    },
    // Conversa final: Dellalos, a amiga que foi junto (com) e a outra (outra). A Nathalia é quem revela os meninos.
    final: function (com, outra) {
      return [
        { quem: "Dellalos", texto: "Preciso contar uma coisa para as duas. É sobre o torneio." },
        { quem: outra,      texto: "Aconteceu alguma coisa? Vocês estão com uma cara estranha." },
        { quem: com,        texto: "Aconteceu. Conta, Dellalos." },
        { quem: "Dellalos", texto: "O torneio é um plano de uma seita. Eles roubam a energia vital dos alunos para alimentar o Caos." },
        { quem: "Dellalos", texto: "A gente entrou na sala 1A com a chave da diretora. Tinha uma menina, a Mariane, e uma criatura preta atacou a gente." },
        { quem: outra,      texto: "Então não são só teorias de aluno... A gente precisa de ajuda, e rápido." },
        { quem: "Nathalia", texto: "Tem mais uma coisa. O grupo dos meninos também está envolvido nisso. Principalmente o Lucas.", info: "meninos_seita" },
        { quem: "Dellalos", texto: "O Lucas?!" },
        { quem: "Nathalia", texto: "Não tenho todas as respostas, mas ele está no meio disso. Por isso a gente precisa ter cuidado." },
        { quem: "Millena",  texto: "Então vamos fazer um acordo: tudo que uma descobrir, conta para as outras duas." },
        { quem: "Dellalos", texto: "Combinado.", info: "acordo_tres" },
        { quem: "Nathalia", texto: "Combinado. Ninguém enfrenta isso sozinha." }
      ];
    },
    marianaFala: [
      { quem: "Mariane", texto: "Saiam daqui!" }
    ]
  },
  // Depois da conversa do DIA_SEITA (revelouSeita): Isabela e Thaina só dizem isto
  preparar: {
    isabela: [
      { quem: "Isabela", texto: "Prepare-se para o dia do torneio." },
      { quem: "Isabela", texto: "Vai ser inesquecível." }
    ],
    thaina: [
      { quem: "Thaina", texto: "Prepare-se para o dia do torneio." },
      { quem: "Thaina", texto: "Vai ser inesquecível." }
    ]
  },
  // ===== DIA_SEITA: "O amigo que faltou" (textos PROVISÓRIOS: ajuste com a história original) =====
  // O Simon falta à escola, está no Bairro Sul procurando o Deriky. A Dellalos leva o Simon até ele (js/simon.js).
  simonDia4: {
    lucas: [
      { quem: "Dellalos", texto: "Lucas, cadê o Simon? Ele não veio hoje." },
      { quem: "Lucas",    texto: "Faltou." },
      { quem: "Vitinho",  texto: "Ele nunca falta. Ontem disse que tinha uma coisa para resolver." },
      { quem: "Lucas",    texto: "Vi ele indo para o Bairro Sul." }
    ],
    lucasLembrar: [
      { quem: "Lucas", texto: "O Simon foi para o Bairro Sul." }
    ],
    vitinho: [
      { quem: "Dellalos", texto: "Vitinho, você sabe do Simon?" },
      { quem: "Vitinho",  texto: "Ele faltou hoje. Nem avisou ninguém." },
      { quem: "Vitinho",  texto: "Estranho, ele é tão pontual. O Lucas viu ele indo para o Bairro Sul." }
    ],
    vitinhoLembrar: [
      { quem: "Vitinho", texto: "Se for ao Bairro Sul, talvez você ache o Simon por lá." }
    ],
    // Conversa com o Simon no Bairro Sul. No fim ele passa a andar junto (companheiro só nesta missão)
    sul: [
      { quem: "Simon",    texto: "Dellalos? Você por aqui..." },
      { quem: "Dellalos", texto: "Simon! Você não foi à escola hoje. O Lucas e o Vitinho estão preocupados." },
      { quem: "Simon",    texto: "Eu sei, desculpa. Estou procurando um amigo e não podia esperar.", info: "simon_procura" },
      { quem: "Dellalos", texto: "Quem é o seu amigo?" },
      { quem: "Simon",    texto: "Um moreninho chamado Deriky. Você viu ele por aí?" },
      { quem: "Dellalos", texto: "Vi, sim! Ele fica na parte sul do bairro. Eu te levo até ele.", se: function () { return historia.conheceuDeriky; } },
      { quem: "Dellalos", texto: "Não conheço, mas posso te ajudar a procurar pelo bairro. Vem comigo!", se: function () { return !historia.conheceuDeriky; } },
      { quem: "Simon",    texto: "Obrigado, Dellalos. Vou logo atrás de você." }
    ],
    // Diálogo triplo: Dellalos, Deriky e Simon (Dellalos chega ao Deriky com o Simon andando junto)
    revelacao: [
      { quem: "Simon",    texto: "Deriky! Finalmente te achei.", conhece: "Deriky" },
      { quem: "Deriky",   texto: "Simon? Você veio mesmo... e trouxe a Dellalos." },
      { quem: "Dellalos", texto: "Ele estava te procurando. Vocês se conhecem?" },
      { quem: "Deriky",   texto: "Há bastante tempo. Escute com atenção, Dellalos." },
      { quem: "Deriky",   texto: "O torneio da escola não é uma competição qualquer. É um plano de uma seita.", info: "seita_caos" },
      { quem: "Simon",    texto: "Eles querem roubar a energia vital dos jovens para alimentar o Caos, a entidade que essa seita adora." },
      { quem: "Dellalos", texto: "Energia vital? Caos? Então os alunos vão ser... usados?" },
      { quem: "Deriky",   texto: "Foi por isso que eu avisei. Tome muito cuidado." },
      { quem: "Simon",    texto: "Cuidado com todo mundo. E muito mais com a Isabela.", info: "aviso_isabela" },
      { quem: "Dellalos", texto: "A Isabela? Por que ela?" },
      { quem: "Deriky",   texto: "É melhor você não saber. Ainda não." },
      { quem: "Simon",    texto: "Vamos indo. Se cuida, Dellalos." }
    ],
    // DIA_1A: o Simon volta para a escola
    volta: [
      { quem: "Simon", texto: "Dellalos. Estou de volta. Lembre do que a gente conversou no sul." }
    ]
  },
  // ===== Capítulo do torneio (textos PROVISÓRIOS) =====
  // Deriky (Bairro Sul) avisa do perigo -> no dia seguinte a Millena conta do torneio -> a Isabela convida perto da casa.
  deriky: {
    primeira: [
      { quem: "Deriky", texto: "Ei. Você é a Dellalos, né? A aluna nova.", conhece: "Deriky" },
      { quem: "Dellalos", texto: "Sou. Como você sabe?" },
      { quem: "Deriky", texto: "Notícia corre rápido por aqui. Escuta: essa cidade é muito mais perigosa do que parece.", info: "deriky_aviso" },
      { quem: "Dellalos", texto: "Perigosa como?" },
      { quem: "Deriky", texto: "Os slimes são o menor dos problemas. Fique esperta." },
      { quem: "Deriky", texto: "Principalmente com a escola. Coisas terríveis ainda vão acontecer lá.",
        escolha: "deriky_resposta",
        opcoes: [
          { id: "obrigada", texto: "Obrigada pelo aviso.",
            falas: [ { quem: "Deriky", texto: "Não agradeça. Só não baixe a guarda." } ] },
          { id: "porque", texto: "Por que está me contando isso?",
            falas: [ { quem: "Deriky", texto: "Porque alguém devia ter me avisado." } ] }
        ] },
      { quem: "Deriky", texto: "Cuidado, Dellalos." }
    ],
    depois: [ { quem: "Deriky", texto: "Fique esperta. A escola não é tão segura quanto parece." } ]
  },
  isabelaConvite: {
    convite: [
      { quem: "Isabela", texto: "Dellalos." },
      { quem: "Isabela", texto: "Você soube do torneio da escola?" },
      { quem: "Isabela", texto: "Quer participar?", escolha: "torneio_participar", opcoes: opcoesConviteTorneio(true) }
    ]
  },
  // Veras: hostil no começo. As respostas dão (ou tiram) pontos de amizade; só depois do nível 2 ela abre missões (js/amizade.js).
  // Só a PRIMEIRA resposta de cada dia vale pontos (a da 1ª conversa também usa o id do dia). Texto PROVISÓRIO.
  veras: {
    primeira: [
      { quem: "Veras", texto: "Mais uma aluna nova. Não se acostume por aqui.", conhece: "Veras", info: "veras_hostil",
        escolha: "veras_resposta",
        opcoes: [
          { id: "calma",  texto: "Só vim estudar.", amizade: function () { return { id: "veras_dia_" + diaAtual(), quem: "Veras", pts: 6 }; },
            falas: [ { quem: "Veras", texto: "Hunf. Veremos." } ] },
          { id: "firme", texto: "Eu não quero briga.", amizade: function () { return { id: "veras_dia_" + diaAtual(), quem: "Veras", pts: 3 }; },
            falas: [ { quem: "Veras", texto: "Então fique fora do meu caminho." } ] },
          { id: "feia", texto: "Que cara feia...", amizade: function () { return { id: "veras_dia_" + diaAtual(), quem: "Veras", pts: -3 }; },
            falas: [ { quem: "Veras", texto: "Pelo menos sou sincera. Some daqui." } ] }
        ] }
    ],
    depois: [
      { quem: "Veras", texto: "Ainda aqui?", se: function () { return amizadeNivel("Veras") < 2; },
        opcoes: [
          { id: "oi", texto: "Só vim dizer oi.", amizade: function () { return { id: "veras_dia_" + diaAtual(), quem: "Veras", pts: 4 }; },
            falas: [ { quem: "Veras", texto: "...Oi. Agora vai." } ] },
          { id: "jeito", texto: "Não ligo para o seu jeito.", amizade: function () { return { id: "veras_dia_" + diaAtual(), quem: "Veras", pts: 2 }; },
            falas: [ { quem: "Veras", texto: "Hmpf. Teimosa." } ] },
          { id: "antipatica", texto: "Você é bem antipática.", amizade: function () { return { id: "veras_dia_" + diaAtual(), quem: "Veras", pts: -3 }; },
            falas: [ { quem: "Veras", texto: "E você é bem intrometida." } ] }
        ] },
      { quem: "Veras", texto: "Hm. Oi.", se: function () { return amizadeNivel("Veras") >= 2; } }
    ]
  },
  // ===== Missões secundárias da estrada (todas só depois da Millena) =====
  pescador: {
    // Primeira conversa: oferece a encomenda (Aceitar ou Recusar)
    oferta: [
      { quem: "Pescador", texto: "Boa tarde! Você é a Dellalos, né? O bairro todo comenta da menina nova.", conhece: "Pescador" },
      { quem: "Pescador", texto: "Preciso de um favor. Tenho uma encomenda para o morador da casa do meio, mas não posso largar a vara agora." },
      { quem: "Dellalos", texto: "Uma encomenda?" },
      { quem: "Pescador", texto: "Um pacotinho simples. É só deixar na porta da casa do meio, ali na avenida. Pode me ajudar?", info: "pescador_encomenda",
        escolha: "pescador_encomenda",
        opcoes: [
          { id: "aceitar", texto: "Aceitar",
            falas: [
              { quem: "Dellalos", texto: "Pode deixar, eu levo!" },
              { quem: "Pescador", texto: "Obrigado! Deixe o pacote na porta da casa do meio. É a de portas duplas.", se: function () { return historia.aceitouEncomenda; } },
              { quem: "Pescador", texto: "Opa, sua mochila está cheia. Libere um espaço e volte aqui!", se: function () { return !historia.aceitouEncomenda; } }
            ],
            fn: function () { if (darItem("encomenda_pescador")) historia.aceitouEncomenda = true; } },
          { id: "recusar", texto: "Recusar",
            falas: [
              { quem: "Dellalos", texto: "Desculpe, agora eu não posso." },
              { quem: "Pescador", texto: "Sem problema! Se mudar de ideia, eu fico por aqui pescando." }
            ] }
        ] }
    ],
    // Já conheceu mas ainda não aceitou: oferece de novo
    outraVez: [
      { quem: "Pescador", texto: "Ah, é você! Mudou de ideia sobre a encomenda da casa do meio?",
        escolha: "pescador_encomenda",
        opcoes: [
          { id: "aceitar", texto: "Aceitar",
            falas: [
              { quem: "Dellalos", texto: "Pode deixar, eu levo!" },
              { quem: "Pescador", texto: "Obrigado! Deixe o pacote na porta da casa do meio.", se: function () { return historia.aceitouEncomenda; } },
              { quem: "Pescador", texto: "Opa, sua mochila está cheia. Libere um espaço e volte aqui!", se: function () { return !historia.aceitouEncomenda; } }
            ],
            fn: function () { if (darItem("encomenda_pescador")) historia.aceitouEncomenda = true; } },
          { id: "recusar", texto: "Ainda não",
            falas: [ { quem: "Pescador", texto: "Tudo bem. Eu continuo aqui." } ] }
        ] }
    ],
    lembrar: [
      { quem: "Pescador", texto: "Já levou o pacote? É só deixar na porta da casa do meio, na avenida." }
    ],
    depois: [
      { quem: "Pescador", texto: "Obrigado por levar a encomenda, Dellalos! Os peixes e eu agradecemos." }
    ]
  },
  clarice: {
    primeira: [
      { quem: "Clarice",  texto: "Ai, que bom ver alguém! Você viu um gatinho laranja por aí?", conhece: "Clarice" },
      { quem: "Dellalos", texto: "Um gatinho? Não vi, não." },
      { quem: "Clarice",  texto: "O Bolinha fugiu hoje cedo e não voltou. Ele anda pela estrada inteira, sem parar!", info: "gato_bolinha" },
      { quem: "Clarice",  texto: "Se encontrar, pode trazer para mim? Ele é bem manso, é só pegar no colo." },
      { quem: "Dellalos", texto: "Pode deixar, eu procuro!" }
    ],
    lembrar: [
      { quem: "Clarice", texto: "Ainda não achou o Bolinha? Ele é laranja e não para quieto pela estrada." }
    ],
    entregar: [
      { quem: "Dellalos", texto: "Olha quem eu encontrei!" },
      { quem: "Clarice",  texto: "Bolinha! Você voltou! Muito obrigada, Dellalos!" }
    ],
    depois: [
      { quem: "Clarice", texto: "O Bolinha não sai mais do meu colo. Obrigada de novo, Dellalos!" }
    ]
  },
  gatinho: {
    perdido: [
      { quem: "Dellalos", texto: "Um gatinho laranja sozinho pela estrada. Será que alguém está procurando por ele?" }
    ],
    carinho: [
      { quem: "Bolinha", texto: "Miau!" }
    ]
  },
  rosa: {
    oferta: [
      { quem: "Dona Rosa", texto: "Dellalos, querida! Esses slimes estão tomando a calçada e assustando os vizinhos.", conhece: "Dona Rosa" },
      { quem: "Dona Rosa", texto: "Você consegue derrotar 5 deles para mim? Use o botão A para bater.", info: "rosa_slimes",
        escolha: "rosa_caca",
        opcoes: [
          { id: "aceitar", texto: "Aceitar",
            falas: [ { quem: "Dellalos", texto: "Pode deixar, Dona Rosa!" },
                     { quem: "Dona Rosa", texto: "Que alívio! Volte aqui quando acabar." } ],
            fn: function () { historia.aceitouCaca = true; } },
          { id: "recusar", texto: "Recusar",
            falas: [ { quem: "Dellalos", texto: "Agora não dá, desculpe." },
                     { quem: "Dona Rosa", texto: "Tudo bem, querida. Estarei por aqui." } ] }
        ] }
    ],
    concluir: [
      { quem: "Dona Rosa", texto: "Você derrotou todos eles! Que coragem, Dellalos!" },
      { quem: "Dona Rosa", texto: "A calçada está muito mais sossegada. Muito obrigada!" }
    ],
    depois: [
      { quem: "Dona Rosa", texto: "A calçada ficou tranquila. Obrigada de novo, querida!" }
    ]
  },
  // Letras gravadas na parede da capela (js/salas/capela.js): antes da Dona Lúcia, mistério; depois, as iniciais dos cinco amigos
  jpmlr: {
    semEntender: [
      { quem: "Dellalos", texto: "Na pedra da parede, riscadas bem fundo, há cinco letras: JPMLR." },
      { quem: "Dellalos", texto: "(Parecem iniciais. Mas de quem? Nunca vi isso antes.)", info: "capela_jpmlr" }
    ],
    semEntenderDepois: [
      { quem: "Dellalos", texto: "JPMLR. Ainda não faço ideia do que significa." }
    ],
    entendi: [
      { quem: "Dellalos", texto: "As letras gravadas na pedra: JPMLR." },
      { quem: "Dellalos", texto: "(J, P, M, L, R... Julio, Perroti, Magnus, Luiz e Renan! Os amigos do avô da Dona Lúcia.)", info: "capela_jpmlr_sig" },
      { quem: "Dellalos", texto: "(Eles estiveram aqui, nesta capela. E uma das iniciais é do Perroti Dellalos.)" }
    ],
    entendiDepois: [
      { quem: "Dellalos", texto: "JPMLR: Julio, Perroti, Magnus, Luiz e Renan. Eles passaram por aqui." }
    ]
  },
  // Mostrar o retrato dos heróis a alguém (js/itens.js: conversarComRetrato). Chave = nome do NPC; sem chave usa o genérico.
  retrato: {
    "Nathalia": [
      { quem: "Dellalos", texto: "Nathalia, olha este retrato. É do dia em que os espíritos foram expulsos da cidade." },
      { quem: "Nathalia", texto: "Espera... eu conheço essa foto! O meu pai tem uma igualzinha lá em casa." },
      { quem: "Dellalos", texto: "Igualzinha? Nathalia, qual é o seu sobrenome?" },
      { quem: "Nathalia", texto: "Master. Nathalia Master.", info: "nathalia_master" },
      { quem: "Dellalos", texto: "(Master... o mesmo sobrenome do Julio Master, um dos heróis do retrato.)" },
      { quem: "Nathalia", texto: "Então o Julio é da minha família! Meu pai nunca me contou nada, só guarda a foto com muito cuidado." },
      { quem: "Nathalia", texto: "Vou perguntar para ele hoje mesmo, Dellalos." }
    ],
    "Nathalia_depois": [
      { quem: "Dellalos", texto: "Conseguiu falar com o seu pai sobre a foto?" },
      { quem: "Nathalia", texto: "Ainda não. Ele muda de assunto, mas eu vou conseguir." }
    ],
    "Dona Lúcia": [
      { quem: "Dona Lúcia", texto: "É o dia em que meu avô e os amigos expulsaram os espíritos. Guarde com carinho, querida." }
    ],
    generico: function (nome) {
      return [
        { quem: "Dellalos", texto: "Você conhece alguém deste retrato?" },
        { quem: nome,       texto: "Não. Parece uma foto bem antiga. Nunca vi essas pessoas." }
      ];
    }
  },
  // ----- Loja NECRO (Zona Leste, só de noite; conteúdo PROVISÓRIO) -----
  necro: {
    primeira: [
      { quem: "Dellalos", texto: "Essa loja não estava aqui de dia. Eu passei por aqui!" },
      { quem: "Necro", texto: "De dia ela não existe. Só abro quando o sol vai embora. Bem-vinda à Necro." },
      { quem: "Necro", texto: "Aqui só vendo o que não se explica: ossos, velas, ecos e outras coisas que sussurram." },
      { quem: "Dellalos", texto: "Vende para qualquer um?" },
      { quem: "Necro", texto: "Para quem consegue me encontrar. E quem me encontra normalmente precisa." }
    ],
    outraVez: [
      { quem: "Necro", texto: "A noite é longa, Dellalos. Olhe com calma. Mas não encare os frascos por muito tempo." }
    ]
  },
  tomas: {
    // A partir do DIA_AMULETO_ESTRANHO (conteúdo PROVISÓRIO)
    amuleto: [
      { quem: "Seu Tomás", texto: "Dellalos! Chegou uma coisa nova numa caixa de tralhas velhas: um amuleto." },
      { quem: "Dellalos",  texto: "Para que ele serve?" },
      { quem: "Seu Tomás", texto: "Pra falar a verdade, não sei muito bem. Parece de proteção, mas nunca vi um igual." },
      { quem: "Seu Tomás", texto: "Levo pouco por ele. Se descobrir o que faz, me conta!" }
    ],
    colete: [
      { quem: "Seu Tomás", texto: "Esse colete ficou bom em você! Veio de um fornecedor da Zona Leste, em caixas todas com o mesmo carimbo." },
      { quem: "Dellalos", texto: "Zona Leste? Quem manda tanta caixa para uma lojinha?" },
      { quem: "Seu Tomás", texto: "Boa pergunta. Pagaram adiantado e ninguém quis dar o nome. Não me meto em negócio dos outros." }
    ],
    armadura: [
      { quem: "Seu Tomás", texto: "A armadura é do mesmo lote do colete. Pesada, mas segura." },
      { quem: "Dellalos", texto: "Um lote desse tamanho... para quê?" },
      { quem: "Seu Tomás", texto: "Disseram que era equipamento para um evento na escola. Só sei isso." }
    ],
    primeira: [
      { quem: "Seu Tomás", texto: "Bem-vinda à minha loja, Dellalos! Aqui você troca moedas por coisas úteis.", conhece: "Seu Tomás" },
      { quem: "Seu Tomás", texto: "Derrote slimes e ajude os vizinhos para ganhar moedas. Dê uma olhada!" }
    ]
  },
  // ===== Bairro Sul (conteúdo PROVISÓRIO, pronto para ganhar missões) =====
  // Cada morador tem  primeira  (1ª conversa) e  depois  (as seguintes).
  // Para uma missão futura, crie outra lista aqui (ex.: oferta / lembrar / concluir) e
  // escolha qual abrir na função conversar do NPC em js/salas/bairrosul.js.
  lucia: {
    primeira: [
      { quem: "Dona Lúcia", texto: "Bom dia, querida! Pode chegar perto, minhas samambaias não mordem.", conhece: "Dona Lúcia" },
      { quem: "Dona Lúcia", texto: "Você é a menina nova da casa laranja, não é? Esse bairro gosta de gente nova." },
      { quem: "Dona Lúcia", texto: "Moro aqui há muitos anos e guardo várias histórias antigas da cidade. Um dia eu conto.", info: "lucia_historias" }
    ],
    depois: [
      { quem: "Dona Lúcia", texto: "Regar as plantas cedo faz toda a diferença. Com as histórias é igual: tudo tem a sua hora." }
    ],
    // A partir do dia 5: a história do avô dela (js/salas/bairrosul.js decide quando abrir)
    espiritos: [
      { quem: "Dona Lúcia", texto: "Querida, lembrei de uma história que meu avô contava. Quer ouvir?" },
      { quem: "Dellalos",   texto: "Quero, sim." },
      { quem: "Dona Lúcia", texto: "Dizia ele que, antigamente, a cidade era cheia de espíritos. Andavam pelo bosque e chegavam até as ruas." },
      { quem: "Dona Lúcia", texto: "Meu avô e os amigos dele resolveram acabar com aquilo. E expulsaram todos os espíritos daqui.", info: "lucia_espiritos" },
      { quem: "Dellalos",   texto: "Todos? E quem eram esses amigos?" },
      { quem: "Dona Lúcia", texto: "Ele repetia os nomes como quem reza: Magnus Fracis, Julio Master, Luiz Inácio, Renan Santos e Perroti Dellalos." },
      { quem: "Dellalos",   texto: "(Perroti Dellalos... é o mesmo sobrenome que o meu.)" },
      { quem: "Dellalos",   texto: "(JPMLR! As letras da parede da capela: Julio, Perroti, Magnus, Luiz e Renan. São as iniciais deles!)",
        se: function () { return historia.viuJPMLR; }, info: "capela_jpmlr_sig" },
      { quem: "Dona Lúcia", texto: "Na capela da colina? Meu avô nunca contou que eles passaram por lá. Então é por lá que você deve investigar, querida.",
        se: function () { return historia.viuJPMLR; } },
      { quem: "Dellalos",   texto: "E o que houve com eles depois?" },
      { quem: "Dona Lúcia", texto: "Cada um seguiu o seu caminho, querida. E nunca mais se viram.", info: "lucia_amigos" },
      { quem: "Dona Lúcia", texto: "Guardo um pequeno retrato do dia em que os espíritos foram expulsos. Estão todos os heróis nele." },
      { quem: "Dellalos",   texto: "Todos? Até o Perroti Dellalos?" },
      { quem: "Dona Lúcia", texto: "Até ele. Pode levar, querida. Aqui ele só junta poeira.", info: "retrato_herois" },
      { quem: "Dellalos",   texto: "Obrigada, Dona Lúcia. Vou cuidar bem dele." },
      { quem: "Dellalos",   texto: "(Os espíritos do bosque, ao norte... será que voltaram?)", se: function () { return historia.visitouZonaNorte; } },
      { quem: "Dellalos",   texto: "(Espíritos expulsos da cidade e cinco amigos que nunca mais se viram. Preciso lembrar disso.)", se: function () { return !historia.visitouZonaNorte; } }
    ],
    // Se o inventário estava cheio na hora (ou o save é anterior ao retrato): ela oferece de novo
    retrato: [
      { quem: "Dona Lúcia", texto: "Querida, esqueci de te dar o retrato do dia em que os espíritos foram expulsos. Estão todos os heróis nele, até o Perroti Dellalos.", info: "retrato_herois" },
      { quem: "Dellalos",   texto: "Obrigada, Dona Lúcia. Vou cuidar bem dele." }
    ],
    depoisEspiritos: [
      { quem: "Dona Lúcia", texto: "Fico pensando naqueles nomes que meu avô repetia. Se você descobrir algo sobre eles, venha me contar." }
    ]
  },
  augusto: {
    primeira: [
      { quem: "Seu Augusto", texto: "Opa! Mais uma cara nova pelo bairro. Eu fico aqui na frente de casa e vejo tudo que acontece.", conhece: "Seu Augusto" },
      { quem: "Seu Augusto", texto: "Ando ouvindo uns rumores: dizem que pequenas coisas estão sumindo pelas calçadas.", info: "augusto_rumor" },
      { quem: "Seu Augusto", texto: "Não sei de nada ao certo. Se você escutar algo, venha me contar." }
    ],
    depois: [
      { quem: "Seu Augusto", texto: "Nada de novo por aqui. Quando eu ouvir mais sobre os rumores, aviso você." }
    ],
    // Pistas em etapas (js/salas/bairrosul.js escolhe qual aparece). PROVISÓRIAS: ajuste com a história original.
    pista1: [
      { quem: "Seu Augusto", texto: "Dellalos, vem cá. Lembra dos rumores das coisas sumindo? Agora eu vi com os meus olhos." },
      { quem: "Seu Augusto", texto: "De madrugada passa gente empurrando caixas pela avenida, sempre na direção da Zona Leste. Ninguém conversa, ninguém acende lanterna.", info: "augusto_caixas" },
      { quem: "Dellalos",    texto: "Caixas, à noite, para a Zona Leste... Obrigada, Seu Augusto." }
    ],
    pista2: [
      { quem: "Seu Augusto", texto: "Você disse que achou uma ordem de produção na fábrica, com \"cliente sem registro\"? Isso me lembrou uma coisa." },
      { quem: "Seu Augusto", texto: "Antigamente havia um zelador que cuidava da mansão da Zona Oeste. Quieto, sempre com um molho de chaves na cintura. Um dia ele sumiu e a mansão fechou.", info: "augusto_zelador" },
      { quem: "Seu Augusto", texto: "Quem paga adiantado e não quer ser registrado costuma ter algo a esconder. Eu desconfiaria dele." }
    ],
    pista3: [
      { quem: "Seu Augusto", texto: "Lembrei de mais um detalhe. O zelador, antes de sumir, trabalhava de vez em quando lá onde as máquinas fazem barulho: a fábrica." },
      { quem: "Seu Augusto", texto: "Se ele guardou a chave da mansão em algum lugar, deve ser lá, perto de onde ficavam os papéis da produção.", info: "augusto_chave_fabrica" },
      { quem: "Dellalos",    texto: "A chave da mansão pode estar dentro da fábrica. Vou procurar com cuidado." }
    ],
    depoisPistas: [
      { quem: "Seu Augusto", texto: "Nada de novo por enquanto. Cuidado por lá, Dellalos." }
    ],
    // Rumor diário (só história, sem recompensa): um por dia, depois das pistas. js/salas/bairrosul.js escolhe pelo dia.
    rumores: {
      6: [ { quem: "Seu Augusto", texto: "Dellalos, de manhã cedo uns vizinhos ouviram cantoria vinda da escola, do segundo andar. Só que o prédio estava trancado.", info: "augusto_r6" } ],
      7: [ { quem: "Seu Augusto", texto: "Sumiu um garoto da escola, um alto e sério. Uma mãe disse que o viu parado na estrada do norte, olhando para o nada.", info: "augusto_r7" } ],
      8: [ { quem: "Seu Augusto", texto: "O Seu Tomás anda vendendo uns amuletos estranhos. Um freguês jura que o amuleto esquenta quando chega perto de certas pessoas.", info: "augusto_r8" } ],
      9: [ { quem: "Seu Augusto", texto: "Vi uma moça de uniforme da escola andando devagar pela avenida da Zona Leste, de olhos parados, como se alguém guiasse ela.", info: "augusto_r9" } ],
      10: [ { quem: "Seu Augusto", texto: "De noite apareceram luzes fracas no bairro destruído, lá no norte. Quem chegou perto disse que parecia um desenho brilhando no chão.", info: "augusto_r10" } ],
      11: [ { quem: "Seu Augusto", texto: "Passei de madrugada perto do leste e ouvi um apito de trem. Aquela estação está parada há anos. Ou eu estou ficando maluco.", info: "augusto_r11" } ],
      12: [ { quem: "Seu Augusto", texto: "Tem gente de fora chegando na cidade, em carros de outras placas. Ficam em casas fechadas e ninguém sabe quem são.", info: "augusto_r12" } ],
      13: [ { quem: "Seu Augusto", texto: "Viram uma luz de vela numa janela do andar de cima da mansão da Zona Oeste. Faz anos que ninguém mora lá.", info: "augusto_r13" } ],
      14: [ { quem: "Seu Augusto", texto: "O bairro inteiro está trancando as portas. Dizem que amanhã é a grande noite. Eu vou ficar em casa, e você se cuida, Dellalos.", info: "augusto_r14" } ],
    },
  },
  caio: {
    primeira: [
      { quem: "Caio", texto: "E aí! Você estuda na escola da cidade, né? Eu também, mas moro aqui no Bairro Sul.", conhece: "Caio" },
      { quem: "Caio", texto: "A escola é enorme. No começo eu me perdia nos corredores toda hora." },
      { quem: "Caio", texto: "Eu gosto de caminhar pelo bairro depois da aula. A pracinha é o melhor lugar para pensar." }
    ],
    depois: [
      { quem: "Caio", texto: "Se precisar de dica sobre a escola, é só falar. Eu passo por aqui quase todo dia." }
    ]
  },
  helena: {
    primeira: [
      { quem: "Helena", texto: "Cuidado onde pisa! Acabei de plantar essas flores.", conhece: "Helena" },
      { quem: "Helena", texto: "Eu cuido do jardim do bairro. Cada canteiro tem uma flor diferente." },
      { quem: "Helena", texto: "Se você achar alguma semente perdida por aí, guarde para mim. Eu agradeço!" }
    ],
    depois: [
      { quem: "Helena", texto: "As flores estão crescendo bem. Obrigada por passar aqui." }
    ]
  },
  pedro: {
    primeira: [
      { quem: "Pedro", texto: "Hã? Ah, oi! Você não viu por aí... uma coisa pequena? Eu perdi. Ou guardei. Não lembro.", conhece: "Pedro" },
      { quem: "Dellalos", texto: "Que coisa pequena?" },
      { quem: "Pedro", texto: "Esse é o problema, nem eu sei direito! Vivo procurando isso pelo bairro inteiro.", info: "pedro_procura" }
    ],
    depois: [
      { quem: "Pedro", texto: "Ainda procurando... Se achar alguma coisa estranha, me avisa, tá?" }
    ]
  },
  // ===== Amigo do papai (estrada sul, dia 2, depois da carta). Texto PROVISÓRIO. =====
  // A resposta fica salva em diario.escolhas.amigo_promessa ("prometo", "como" ou "nao"): a história pode usar isso depois.
  amigopai: {
    primeira: [
      { quem: "Amigo do papai", texto: "Dellalos. Finalmente te achei.", conhece: "Amigo do papai" },
      { quem: "Dellalos", texto: "Quem é você? Como sabe o meu nome?" },
      { quem: "Amigo do papai", texto: "Sou amigo do seu pai. Ele me pediu para ficar de olho em você. Imagino que já tenha lido a carta." },
      { quem: "Dellalos", texto: "Li. Onde ele está?" },
      { quem: "Amigo do papai", texto: "Longe. E não vai aparecer tão cedo. Seu pai só vai conferir como as coisas estão no dia 15.", info: "amigo_prazo" },
      { quem: "Amigo do papai", texto: "Até lá, escute bem: não tente fazer nada de errado.",
        opcoes: [
          { id: "prometo", texto: "Prometo.",
            falas: [ { quem: "Amigo do papai", texto: "Ótimo. Era tudo o que eu queria ouvir." } ] },
          { id: "como", texto: "Errado como?",
            falas: [ { quem: "Amigo do papai", texto: "Você sabe. Bisbilhotar onde não deve, se meter em confusão. Use o bom senso." },
                     { quem: "Dellalos", texto: "...Entendi." } ] },
          { id: "nao", texto: "Não prometo nada.",
            falas: [ { quem: "Amigo do papai", texto: "Então pelo menos pense antes de agir. Alguém sempre está olhando." } ] }
        ],
        escolha: "amigo_promessa" },
      { quem: "Amigo do papai", texto: "Hoje ainda é só o segundo dia. Sobra um tempo até lá. Converse com o pessoal, faça amizades, ajude quem precisar." },
      { quem: "Amigo do papai", texto: "O que você escolher nesses dias vai pesar mais do que imagina." },
      { quem: "Amigo do papai", texto: "Tome cuidado, Dellalos. Esta cidade não é tão calma quanto parece, e nem todo mundo aqui é quem diz ser." },
      { quem: "Amigo do papai", texto: "Agora preciso ir. Cuide-se, Dellalos." }
    ]
  },
  // ===== Sala 3C: Thaina e Isabela (melhores amigas). Textos PROVISÓRIOS: ajuste com a história original. =====
  thaina: {
    primeira: [
      { quem: "Thaina", texto: "...", conhece: "Thaina" },
      { quem: "Thaina", texto: "Você é a aluna nova. Já ouvi falar." },
      { quem: "Dellalos", texto: "Sou a Dellalos. Posso ficar aqui um pouco?",
        opcoes: [
          { id: "ficar", texto: "Posso ficar aqui?", amizade: { id: "thaina_ficar", quem: "Thaina", pts: 3 },
            falas: [ { quem: "Thaina", texto: "Fica. Só não precisa puxar assunto." } ] },
          { id: "nome", texto: "Você é a Thaina, né?", amizade: { id: "thaina_nome", quem: "Thaina", pts: 3 },
            falas: [ { quem: "Thaina", texto: "Quem te disse?" },
                     { quem: "Dellalos", texto: "Está no caderno ali na mesa." },
                     { quem: "Thaina", texto: "...Ah. Está." } ] }
        ],
        escolha: "thaina_conversa" },
      { quem: "Thaina", texto: "Aquela é a Isabela. Minha melhor amiga.", info: "thaina_isabela" },
      { quem: "Thaina", texto: "Se ela te olhar estranho, não leve a mal. Ela é assim." }
    ],
    depois: [
      { quem: "Thaina", texto: "Se quiser conversar, fale com a Isabela. Eu... prefiro ouvir." }
    ],
    depoisIsabela: [
      { quem: "Thaina", texto: "A Isabela falou com você, né? Deu pra ver." },
      { quem: "Thaina", texto: "Ela não faz isso com todo mundo. Não sei por que fez com você." }
    ]
  },
  isabela: {
    primeira: [
      { quem: "Isabela", texto: "Então é você.", conhece: "Isabela", info: "isabela_conhece" },
      { quem: "Dellalos", texto: "Nós nos conhecemos?" },
      { quem: "Isabela", texto: "Não. Ainda não." },
      { quem: "Thaina", texto: "Isa..." },
      { quem: "Isabela", texto: "Estou só conversando, Thaina.",
        opcoes: [
          { id: "conhece", texto: "Você parece me conhecer.", amizade: { id: "isabela_conhece", quem: "Isabela", pts: 3 },
            falas: [ { quem: "Isabela", texto: "Parece, né? Engraçado." },
                     { quem: "Isabela", texto: "Cuidado com o que você conta por aqui, Dellalos." },
                     { quem: "Dellalos", texto: "Eu não disse meu nome." },
                     { quem: "Isabela", texto: "Disse sim. Só não percebeu." } ] },
          { id: "prazer", texto: "Prazer, eu sou a Dellalos.", amizade: { id: "isabela_prazer", quem: "Isabela", pts: 3 },
            falas: [ { quem: "Isabela", texto: "Eu sei." },
                     { quem: "Isabela", texto: "O prazer talvez seja meu." } ] }
        ],
        escolha: "isabela_conversa" },
      { quem: "Thaina", texto: "Ela é meio misteriosa. Eu já me acostumei." },
      { quem: "Isabela", texto: "Foi um jeito de falar. Esquece." }
    ],
    depois: [
      { quem: "Isabela", texto: "Se um dia precisar de ajuda, me procure. Não precisa explicar nada." },
      { quem: "Isabela", texto: "Observe com calma. Quase tudo aqui tem um motivo.", se: function () { return historia.leuCartaPai; } },
      { quem: "Dellalos", texto: "...Meu pai também dizia isso.", se: function () { return historia.leuCartaPai; } }
    ]
  },
  nathalia: {
    primeira: [
      { quem: "Nathalia", texto: "Ah, oi. Você é a Dellalos, não é? Desculpe encarar.", conhece: "Nathalia" },
      { quem: "Nathalia", texto: "É que você me lembra uma pessoa que eu conheço.", info: "nathalia_semelhanca",
        opcoes: [
          { id: "quem", texto: "Quem?", amizade: { id: "nathalia_quem", quem: "Nathalia", pts: 3 },
            falas: [ { quem: "Nathalia", texto: "Ainda não sei dizer. Talvez eu esteja enganada." } ] },
          { id: "coincidencia", texto: "Deve ser coincidência.", amizade: { id: "nathalia_coincidencia", quem: "Nathalia", pts: 3 },
            falas: [ { quem: "Nathalia", texto: "Pode ser. Mas fiquei curiosa." } ] }
        ],
        escolha: "nathalia_semelhanca" }
    ],
    depois: [
      { quem: "Nathalia", texto: "Ainda estou tentando lembrar de quem você me lembra." }
    ]
  },

  // ===== Zona Leste (conteúdo PROVISÓRIO: ajuste com a história original) =====
  orlando: {
    // Primeira conversa: oferece a missão das engrenagens (Aceitar ou Recusar)
    oferta: [
      { quem: "Orlando",  texto: "Ei, menina! Aqui não é lugar de passeio. A Zona Leste não é mais como antes.", conhece: "Orlando" },
      { quem: "Orlando",  texto: "Eu sou o Orlando, vigia da fábrica. Ela está fechada há anos, mas toda noite eu ouço máquinas funcionando lá dentro.", info: "orlando_fabrica" },
      { quem: "Dellalos", texto: "Máquinas? Numa fábrica fechada?" },
      { quem: "Orlando",  texto: "Pois é. E tem ratos enormes, sucateiros e uns robôs de segurança soltos pelo pátio. Leve cuidado." },
      { quem: "Orlando",  texto: "O portão da fábrica só abre com 3 engrenagens do mecanismo. Perdi todas quando o lugar fechou. Pode procurá-las para mim?", info: "orlando_engrenagens",
        escolha: "orlando_engrenagens",
        opcoes: [
          { id: "aceitar", texto: "Aceitar",
            falas: [ { quem: "Dellalos", texto: "Pode deixar, eu procuro!" },
                     { quem: "Orlando",  texto: "Obrigado! Comece pelo ferro-velho, ao sul. E se se machucar, descanse na minha guarita." } ],
            fn: function () { historia.aceitouEngrenagens = true; } },
          { id: "recusar", texto: "Recusar",
            falas: [ { quem: "Dellalos", texto: "Desculpe, agora não dá." },
                     { quem: "Orlando",  texto: "Tudo bem. Mas não se meta na fábrica sozinha, hein?" } ] }
        ] }
    ],
    // Já conheceu mas ainda não aceitou: oferece de novo
    outraVez: [
      { quem: "Orlando", texto: "Ah, é você! Mudou de ideia sobre as engrenagens do portão?",
        escolha: "orlando_engrenagens",
        opcoes: [
          { id: "aceitar", texto: "Aceitar",
            falas: [ { quem: "Dellalos", texto: "Pode deixar, eu procuro!" },
                     { quem: "Orlando",  texto: "Boa! Comece pelo ferro-velho, ao sul." } ],
            fn: function () { historia.aceitouEngrenagens = true; } },
          { id: "recusar", texto: "Ainda não",
            falas: [ { quem: "Orlando", texto: "Tudo bem. Eu fico por aqui, de olho." } ] }
        ] }
    ],
    // Depois de aceitar: o texto muda conforme as engrenagens achadas
    lembrar: function () {
      const n = engrenagensAchadas();
      return [ { quem: "Orlando", texto: n >= ENGRENAGENS_TOTAL
        ? "Já tem as 3! Vá até a porta da fábrica, no alto da avenida, e encaixe as engrenagens (botão B)."
        : "Você achou " + n + " de " + ENGRENAGENS_TOTAL + " engrenagens. Dê uma olhada na sucata do ferro-velho, ao sul. O sucateiro de lá é perigoso, e o Nando, o catador, vive achando peças." } ];
    },
    // Portão já aberto
    depois: [
      { quem: "Orlando", texto: "O portão abriu! Eu não entro naquela fábrica nem por decreto. Se precisar descansar, minha guarita está aberta." }
    ],
    // Chefe derrotado
    fim: [
      { quem: "Orlando", texto: "As máquinas pararam! Pela primeira vez em anos a noite está em silêncio. Obrigado, Dellalos." },
      { quem: "Orlando", texto: "Mas quem mandava aquele Capataz trabalhar? Isso eu ainda quero descobrir." }
    ]
  },
  nando: {
    oferta: [
      { quem: "Nando", texto: "Opa! Cuidado onde pisa. Esse ferro-velho é meu... ou de quem chegar primeiro.", conhece: "Nando" },
      { quem: "Nando", texto: "Eu cato sucata para vender, mas esses ratos e robôs não me deixam trabalhar.", info: "nando_limpeza" },
      { quem: "Nando", texto: "Derrote 8 deles aqui pela Zona Leste e eu te dou uma engrenagem que achei no meio da sucata. O Orlando anda atrás de peças assim, sabia?",
        escolha: "nando_limpeza",
        opcoes: [
          { id: "aceitar", texto: "Aceitar",
            falas: [ { quem: "Dellalos", texto: "Combinado, eu limpo o terreno!" },
                     { quem: "Nando",    texto: "Esse é o espírito! Use o botão A para bater." } ],
            fn: function () { historia.aceitouLimpeza = true; } },
          { id: "recusar", texto: "Recusar",
            falas: [ { quem: "Dellalos", texto: "Agora não dá, desculpe." },
                     { quem: "Nando",    texto: "Sem problema. A sucata não vai a lugar nenhum." } ] }
        ] }
    ],
    outraVez: [
      { quem: "Nando", texto: "E aí, mudou de ideia? Limpa o terreno para mim e a engrenagem é sua.",
        escolha: "nando_limpeza",
        opcoes: [
          { id: "aceitar", texto: "Aceitar",
            falas: [ { quem: "Dellalos", texto: "Fechado!" }, { quem: "Nando", texto: "Boa! Derrote 8 e volte aqui." } ],
            fn: function () { historia.aceitouLimpeza = true; } },
          { id: "recusar", texto: "Ainda não",
            falas: [ { quem: "Nando", texto: "Tranquilo. Eu continuo aqui." } ] }
        ] }
    ],
    concluir: [
      { quem: "Nando", texto: "Que sossego! Você limpou tudo, Dellalos!" },
      { quem: "Nando", texto: "Combinado é combinado: aqui está a engrenagem. Entrega para o Orlando, que ele sabe usar." }
    ],
    depois: [
      { quem: "Nando", texto: "O ferro-velho nunca esteve tão tranquilo. Obrigado de novo!" }
    ]
  },
  capataz: {
    encontro: [
      { quem: "Capataz Mecânico", texto: "BIP. Visita não autorizada na linha de produção." },
      { quem: "Dellalos",         texto: "Então é você quem faz as máquinas funcionarem à noite?" },
      { quem: "Capataz Mecânico", texto: "A produção não pode parar. Entrega final: dia 5. Ninguém atrapalha o pedido." },
      { quem: "Dellalos",         texto: "Dia 5...? Por que esse dia de novo?" },
      { quem: "Capataz Mecânico", texto: "Visita será removida. BIP BIP." }
    ],
    derrota: [
      { quem: "Capataz Mecânico", texto: "Erro... pedido... incompleto... Desligando..." },
      { quem: "Dellalos",         texto: "Acabou. As máquinas pararam.", info: "fabrica_dia5" },
      { quem: "Dellalos",         texto: "Será que ele deixou algum papel sobre esse pedido? Vou procurar na sala de controle." }
    ]
  },
  // ===== Dia 9: a Gaby controlada pela Isabela, na Zona Leste (conteúdo PROVISÓRIO: ajuste com a história original) =====
  // A escolha do destino fica em diario.escolhas.gaby_destino ("amuleto", "matar" ou "esperar"); o resultado roda em js/salas/zonaleste.js.
  gaby: {
    encontro: [
      { quem: "Dellalos", texto: "Ei! Você é aluna da escola, não é? O que você faz sozinha aqui na Zona Leste?" },
      { quem: "Gaby",     texto: "Dellalos... A Isabela mandou eu te encontrar.", info: "gaby_controlada" },
      { quem: "Dellalos", texto: "Isabela? Gaby, seus olhos estão vazios... Ela está controlando você!" },
      { quem: "Gaby",     texto: "Ela quer você fora do caminho. Eu não consigo... parar!" },
      { quem: "Dellalos", se: function () { return temItem("amuleto_estranho"); },
        texto: "(O amuleto estranho do Seu Tomás está esquentando na mochila. Preciso vencê-la sem exagerar.)" },
      { quem: "Dellalos", se: function () { return !temItem("amuleto_estranho"); },
        texto: "(Ela não está agindo por vontade própria. Mas eu tenho que me defender!)" }
    ],
    // Fim da luta: a Gaby cai e a Dellalos decide
    caiu: [
      { quem: "Gaby",     texto: "Ugh... minha cabeça... Eu não consigo parar de te atacar..." },
      { quem: "Dellalos", texto: "Ela está sem forças. O que eu faço com a Gaby?",
        escolha: "gaby_destino", opcoes: [
          { id: "amuleto", texto: "Colocar o amuleto nela", se: function () { return temItem("amuleto_estranho"); }, falas: [
            { quem: "Dellalos", texto: "Gaby, aguenta firme. Segura isto." },
            { quem: "Dellalos", texto: "(O amuleto esquentou, brilhou forte e a luz escura saiu do corpo dela.)" },
            { quem: "Gaby",     texto: "Dellalos...? Onde eu... Eu fiz alguma coisa com você?" },
            { quem: "Dellalos", texto: "Você está bem agora. A Isabela estava controlando você." },
            { quem: "Gaby",     texto: "A Isabela... Ela quer que a entidade volte. Eu ouvia a voz dela na cabeça, mandando eu te impedir." },
            { quem: "Gaby",     texto: "Preciso avisar meus pais. Se ela fez isso comigo, pode fazer com qualquer um." },
            { quem: "Gaby",     texto: "Antes de ir, toma este livro de magia. É o meu jeito de agradecer, Dellalos." },
            { quem: "Gaby",     texto: "Só entende esse livro quem tem o sangue sagrado dos cinco guerreiros. Eu só vejo rabiscos, mas acho que você vai conseguir ler." },
            { quem: "Dellalos", texto: "Sangue sagrado... dos cinco guerreiros?" },
            { quem: "Gaby",     texto: "Fica bem, Dellalos. E cuidado com a Isabela." }
          ] },
          { id: "matar", texto: "Matar a Gaby", falas: [
            { quem: "Dellalos", texto: "(Se eu deixar, ela vai me atacar de novo. Não tem outro jeito.)" },
            { quem: "Dellalos", texto: "(A Gaby não se mexe mais. Isso não tem volta.)" }
          ] },
          { id: "esperar", texto: "Ainda não", falas: [
            { quem: "Dellalos", se: function () { return temItem("amuleto_estranho"); },
              texto: "(Vou pensar com calma. Ela não vai a lugar nenhum.)" },
            { quem: "Dellalos", se: function () { return !temItem("amuleto_estranho"); },
              texto: "(Preciso de algo que quebre o controle da Isabela. Talvez o Seu Tomás tenha alguma coisa na loja.)" }
          ] }
        ] }
    ],
    // Voltou a falar com a Gaby caída (escolheu "Ainda não" antes)
    outraVez: [
      { quem: "Gaby",     texto: "Ainda... estou aqui... Não consigo me mexer..." },
      { quem: "Dellalos", texto: "O que eu faço com a Gaby?",
        escolha: "gaby_destino", get opcoes() { return DIALOGOS.gaby.caiu[1].opcoes; } }
    ]
  },
  // ===== Treino com o Lucas, na Zona Leste (conteúdo PROVISÓRIO) =====
  lucasZona: {
    primeira: [
      { quem: "Dellalos", texto: "Lucas? Você aqui, na Zona Leste?" },
      { quem: "Lucas",    texto: "Treinando. Aqui ninguém atrapalha, e os bichos ajudam a manter o corpo esperto." },
      { quem: "Lucas",    texto: "Você chegou na hora. Quer só olhar ou quer participar?",
        escolha: "lucas_treino", get opcoes() { return opcoesTreinoLucas(); } }
    ],
    outraVez: [
      { quem: "Lucas", texto: "Voltou. Só olhar ou participar do treino?",
        escolha: "lucas_treino", get opcoes() { return opcoesTreinoLucas(); } }
    ],
    fraca: [
      { quem: "Lucas", texto: "Você está machucada demais para treinar. Descanse na guarita do Orlando e volte." }
    ],
    // Fim da luta: a Dellalos está com 1 coração
    fimDuelo: [
      { quem: "Lucas",    texto: "Chega! Você está com só 1 coração. Melhor se recuperar." },
      { quem: "Lucas",    texto: "Toma 50 moedas. Compre um coração extra na loja do Seu Tomás." },
      { quem: "Lucas",    texto: "Você aguenta muito, Dellalos. Isso é bom." },
      { quem: "Dellalos", texto: "(Será que devo contar a ele o que está acontecendo?)",
        escolha: "lucas_seita", get opcoes() { return opcoesContarLucas(); } }
    ],
    // Já treinou e ainda não contou
    depoisDuelo: [
      { quem: "Lucas", texto: "E aí, descansou? Tem algo que você queira me contar?" },
      { quem: "Dellalos", texto: "(Será que devo contar a ele o que está acontecendo?)",
        escolha: "lucas_seita", get opcoes() { return opcoesContarLucas(); } }
    ]
  },
  // ===== Altar do Caos, na capela da colina (conteúdo PROVISÓRIO: ajuste com a história original) =====
  altarCaos: {
    inscricao: [
      { quem: "Dellalos",  texto: "Um altar de pedra negra, coberto de símbolos riscados. São os mesmos dos marcos da fonte." },
      { quem: "Inscrição", texto: "O CAOS TEM FOME. DEZ SACRIFÍCIOS O SACIAM." },
      { quem: "Inscrição", texto: "TRAGA A ESSÊNCIA DOS ESPÍRITOS QUE VAGAM PELO BOSQUE.", info: "altar_caos" },
      { quem: "Dellalos",  texto: "Dez espíritos... Eu poderia fazer isso. Ou não. A escolha é minha." }
    ],
    // Fala do altar conforme as essências que a Dellalos carrega (n) e as já oferecidas (k)
    estado: function (n, k) {
      if (n <= 0) return [
        { quem: "Inscrição", texto: "Sacrifícios oferecidos: " + k + " de 10." },
        { quem: "Dellalos",  texto: "Não tenho nenhuma essência comigo. Os espíritos do bosque soltam uma quando desaparecem." }
      ];
      return [
        { quem: "Inscrição", texto: "Sacrifícios oferecidos: " + k + " de 10." },
        { quem: "Dellalos",  texto: "Estou com " + n + " essência" + (n > 1 ? "s" : "") + ". Oferecer ao altar?",
          escolha: "altar_caos", opcoes: [
            { id: "oferecer", texto: "Oferecer",
              falas: [ { quem: "Dellalos", texto: "As essências se dissolvem em fumaça roxa, uma a uma." } ],
              fn: function () { oferecerEssencias(); } },
            { id: "agora_nao", texto: "Ainda não",
              falas: [ { quem: "Dellalos", texto: "Ainda não. Preciso pensar se quero mesmo isso." } ] }
          ] }
      ];
    },
    completo: [
      { quem: "Dellalos", texto: "Os símbolos do altar brilham, um por um." },
      { quem: "???",      texto: "Dez. Eu senti cada um." },
      { quem: "Dellalos", texto: "Quem está aí?" },
      { quem: "???",      texto: "Você voltará. Todos voltam." },
      { quem: "Dellalos", texto: "O altar escureceu de novo, mas o ar ficou mais pesado. O que eu acabei de fazer?", info: "altar_caos_saciado" }
    ],
    saciado: [
      { quem: "Dellalos", texto: "O altar está quieto. Mesmo assim, sinto que algo me observa." }
    ]
  },
  // Objetos da fábrica (js/salas/fabrica.js)
  fabrica: {
    ordem: [
      { quem: "Dellalos", texto: "Uma ordem de serviço, amassada em cima da mesa. Deixa eu ler." },
      { quem: "Ordem de produção", texto: "ORDEM Nº 5 - URGENTE. Item: equipamentos de proteção e peças para o evento da escola." },
      { quem: "Ordem de produção", texto: "Quantidade: conforme a lista de inscritos. Prazo final: dia 5. Obs.: não registrar o cliente. Pagamento adiantado." },
      { quem: "Dellalos",          texto: "O evento da escola... será o torneio? E quem pagou por tudo isso?" }
    ],
    ordemLida: [
      { quem: "Dellalos", texto: "A ordem de produção. Já li, mas o prazo me preocupa: dia 5." }
    ],
    // Gaveta da mesa da sala de controle: só aparece depois de ler a ordem (js/salas/fabrica.js)
    gaveta: [
      { quem: "Dellalos", texto: "Embaixo da mesa tem uma gaveta que eu não tinha notado. Está emperrada... pronto, abriu." },
      { quem: "Dellalos", texto: "Uma chave antiga, com uma etiqueta desbotada: \"Mansão\"." },
      { quem: "Dellalos", texto: "O zelador de que o Seu Augusto falou... a chave estava aqui o tempo todo.", info: "chave_mansao" }
    ],
    gavetaVazia: [
      { quem: "Dellalos", texto: "A gaveta está vazia. A chave da mansão já está comigo." }
    ]
  }
};

const DIALOGO_LETRAS_POR_SEGUNDO = 45;

let dialogoAberto = false;     // enquanto for true, o jogo fica pausado
let dialogoFalas = [];         // cópia das falas (opções de resposta podem inserir falas novas)
let dialogoIndice = 0;
let dialogoTempo = 0;
let dialogoAoTerminar = null;
let dialogoOpcoes = null;      // respostas da fala atual (ou null)
let dialogoSel = 0;            // resposta marcada
let dialogoCaixasOpcoes = [];  // retângulos das respostas na tela (para o toque)
let dialogoSubiu = false, dialogoDesceu = false;

// Mostra a fala "i". Pula as que têm condição  se()  falsa. Devolve false se a conversa acabou.
function irParaFala(i) {
  while (i < dialogoFalas.length && dialogoFalas[i].se && !dialogoFalas[i].se()) i++;
  dialogoIndice = i;
  dialogoTempo = 0;
  dialogoOpcoes = null;
  dialogoSel = 0;
  if (i >= dialogoFalas.length) return false;

  const f = dialogoFalas[i];
  if (f.conhece) [].concat(f.conhece).forEach((nome) => registrarConhecido(nome));   // diário (js/diario.js)
  if (f.info) descobrirInfo(f.info);
  if (f.amizade) amizadeDeFala(f.amizade);   // pontos de amizade (js/amizade.js)
  if (f.opcoes) {
    const ops = f.opcoes.filter((o) => !o.se || o.se());
    if (ops.length) dialogoOpcoes = ops;
  }
  return true;
}

// Abre uma conversa. Se já existe uma aberta, ignora (evita começar duas vezes).
function abrirDialogo(falas, aoTerminar) {
  if (!falas || !falas.length || dialogoAberto) return;
  dialogoFalas = falas.slice();
  dialogoAoTerminar = aoTerminar || null;
  if (!irParaFala(0)) { dialogoFalas = []; dialogoAoTerminar = null; return; }   // nenhuma fala valia agora
  dialogoAberto = true;
}

let dialogoUltLetras = 0;   // para o "bip" de fala (js/audio.js)
function atualizarDialogo(dt) {
  dialogoTempo += dt;
  // bip de fala: um a cada 2 letras novas (não nos espaços); o tom muda conforme quem fala
  const falaBip = dialogoFalas[dialogoIndice];
  if (falaBip && typeof falaBip.texto === "string") {
    const nLetras = letrasVisiveis();
    if (nLetras < dialogoUltLetras) dialogoUltLetras = nLetras;
    if (nLetras >= dialogoUltLetras + 2 && nLetras <= falaBip.texto.length) {
      dialogoUltLetras = nLetras;
      if (falaBip.texto[nLetras - 1] !== " ") tocarTexto(falaBip.quem);
    }
  }
  // Escolher resposta com o D-pad (cima/baixo): só reage ao APERTAR, não ao segurar
  const sobe = teclado.up || toque.up, desce = teclado.down || toque.down;
  if (dialogoOpcoes && textoCompleto()) {
    const n = dialogoOpcoes.length;
    if (sobe && !dialogoSubiu) dialogoSel = (dialogoSel + n - 1) % n;
    if (desce && !dialogoDesceu) dialogoSel = (dialogoSel + 1) % n;
  }
  dialogoSubiu = sobe;
  dialogoDesceu = desce;
}

function letrasVisiveis() {
  return Math.floor(dialogoTempo * DIALOGO_LETRAS_POR_SEGUNDO);
}

function textoCompleto() {
  const fala = dialogoFalas[dialogoIndice];
  return !fala || letrasVisiveis() >= fala.texto.length;
}

function proximaFala() {
  if (irParaFala(dialogoIndice + 1)) return;
  dialogoAberto = false;
  const fim = dialogoAoTerminar;
  dialogoAoTerminar = null;
  dialogoFalas = [];
  if (fim) fim();
}

function escolherOpcao(n) {
  const o = dialogoOpcoes && dialogoOpcoes[n];
  if (!o) return;
  const fala = dialogoFalas[dialogoIndice];
  if (fala.escolha) diario.escolhas[fala.escolha] = o.id;       // lembra a resposta (salva no diário)
  if (typeof relacaoRegistrarEscolha === "function") relacaoRegistrarEscolha(fala, o); // memória social persistente (v49)
  if (o.amizade) amizadeDeFala(o.amizade);                       // pontos de amizade da resposta (js/amizade.js)
  if (o.falas && o.falas.length) dialogoFalas.splice(dialogoIndice + 1, 0, ...o.falas);
  dialogoOpcoes = null;
  if (o.fn) o.fn();
  proximaFala();
}

// Botão B durante a conversa
function avancarDialogo() {
  if (!textoCompleto()) { dialogoTempo = 9999; return; }   // ainda digitando: mostra tudo de uma vez
  if (dialogoOpcoes) { escolherOpcao(dialogoSel); return; }
  proximaFala();
}

// Tocar numa resposta na tela também escolhe
canvas.addEventListener("pointerdown", (e) => {
  if (!dialogoAberto || !dialogoOpcoes || !textoCompleto()) return;
  const r = canvas.getBoundingClientRect();
  const x = (e.clientX - r.left) * (canvas.width / r.width) / ESCALA;
  const y = (e.clientY - r.top) * (canvas.height / r.height) / ESCALA;
  for (let n = 0; n < dialogoCaixasOpcoes.length; n++) {
    const c = dialogoCaixasOpcoes[n];
    if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) {
      dialogoSel = n;
      escolherOpcao(n);
      e.preventDefault();
      return;
    }
  }
});

// Quebra o texto em linhas que cabem na largura (a fonte já deve estar definida no ctx)
function quebrarTexto(texto, larguraMax) {
  const linhas = [];
  let atual = "";
  for (const palavra of texto.split(" ")) {
    const teste = atual ? atual + " " + palavra : palavra;
    if (atual && ctx.measureText(teste).width > larguraMax) { linhas.push(atual); atual = palavra; }
    else atual = teste;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

// Retrato: a imagem do personagem (PERSONAGENS em js/personagens.js) ou, sem imagem,
// uma caixinha com a inicial e a descrição curta. O espaço é sempre o mesmo.
function desenharRetrato(quem, x, y, w, h) {
  const img = retratoDe(quem);
  ctx.fillStyle = "#2a1d0c";
  ctx.fillRect(x, y, w, h);
  if (img) {
    const e = Math.min(w / img.width, h / img.height);
    ctx.drawImage(img, x + (w - img.width * e) / 2, y + (h - img.height * e) / 2, img.width * e, img.height * e);
  } else {
    ctx.textAlign = "center";
    ctx.fillStyle = "#e0b45a";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText((quem || "?").charAt(0).toUpperCase(), x + w / 2, y + 48);
    const p = PERSONAGENS[quem];
    if (p) {
      ctx.fillStyle = "#cdbb94";
      ctx.font = "14px sans-serif";
      quebrarTexto(p.descricao, w - 14).slice(0, 5).forEach((l, n) => ctx.fillText(l, x + w / 2, y + 82 + n * 17));
    }
  }
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#6b4a2a";
  ctx.strokeRect(x, y, w, h);
}

// Desenhado em coordenadas da TELA (depois da câmera, em desenho.js)
function desenharDialogo() {
  if (!dialogoAberto) return;
  const fala = dialogoFalas[dialogoIndice];
  const bw = Math.min(VIEW_L - 80, 940), bh = 200, bx = (VIEW_L - bw) / 2, by = VIEW_A - bh - 36;

  // Caixa (mesmo estilo do inventário)
  ctx.fillStyle = "#1e1612";
  ctx.fillRect(bx - 6, by - 6, bw + 12, bh + 12);
  ctx.fillStyle = "#e0b45a";
  ctx.fillRect(bx - 3, by - 3, bw + 6, bh + 6);
  ctx.fillStyle = "#3a2a1c";
  ctx.fillRect(bx, by, bw, bh);

  // Retrato (ou espaço reservado) à esquerda
  const rw = 150, rh = bh - 20, rx = bx + 16, ry = by + 10;
  desenharRetrato(fala.quem, rx, ry, rw, rh);
  const tx = rx + rw + 24;   // onde começa o texto

  // Nome de quem fala
  ctx.font = "bold 30px sans-serif";
  ctx.textAlign = "left";
  const nomeL = ctx.measureText(fala.quem).width + 40;
  ctx.fillStyle = "#e0b45a";
  ctx.fillRect(bx + 24, by - 26, nomeL, 46);
  ctx.fillStyle = "#2a1d0c";
  ctx.fillText(fala.quem, bx + 44, by + 8);

  // Texto aparecendo letra por letra
  ctx.font = "30px sans-serif";
  ctx.textAlign = "left";
  const linhas = quebrarTexto(fala.texto, bw - (tx - bx) - 30);
  let restante = letrasVisiveis();
  ctx.fillStyle = "#f3e6c8";
  linhas.forEach((linha, n) => {
    if (restante <= 0) return;
    ctx.fillText(linha.slice(0, restante), tx, by + 76 + n * 38);
    restante -= linha.length + 1;
  });

  const completo = letrasVisiveis() >= fala.texto.length;

  // Respostas (acima da caixa): D-pad cima/baixo + B, ou tocar
  dialogoCaixasOpcoes = [];
  if (dialogoOpcoes && completo) {
    const alt = 56, gap = 10, n = dialogoOpcoes.length;
    ctx.font = "28px sans-serif";
    ctx.textAlign = "left";
    dialogoOpcoes.forEach((o, i) => {
      const y = by - 24 - (n - i) * (alt + gap) + gap;
      const sel = i === dialogoSel;
      dialogoCaixasOpcoes.push({ x: bx, y, w: bw, h: alt });
      ctx.fillStyle = sel ? "#e0b45a" : "#3a2a1c";
      ctx.fillRect(bx, y, bw, alt);
      ctx.lineWidth = 4;
      ctx.strokeStyle = sel ? "#fff4c2" : "#6b4a2a";
      ctx.strokeRect(bx, y, bw, alt);
      ctx.fillStyle = sel ? "#2a1d0c" : "#f3e6c8";
      ctx.fillText((sel ? "▶ " : "") + o.texto, bx + 24, y + 37, bw - 48);
    });
    return;
  }

  // Quando a fala terminou de aparecer: balãozinho "B" piscando
  if (completo && Math.floor(performance.now() / 400) % 2 === 0) {
    const x = bx + bw - 36, y = by + bh - 34;
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f3e6c8";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("B", x, y + 9);
  }
}
