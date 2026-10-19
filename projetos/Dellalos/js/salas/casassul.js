/* =====================================================
   salas/casassul.js - Por dentro das 6 casas do Bairro Sul
   Feito com o pacote "Modern Interiors" (LimeZu, versão grátis; licença em assets/modern/LICENSE.txt:
   só para projetos NÃO comerciais). Paredes e pisos: folha Room_Builder; móveis: folha Interiors.

   Cada casa é uma cena pequena (id "casa_sul_...") com:
     - parede de 2 linhas no alto (linhas 1-2), piso nas linhas 3 em diante;
     - a PORTA fica na parede de cima, na coluna CASAS_SUL_DX (a mesma em todas as casas);
       a Dellalos nasce logo abaixo dela e sai andando para cima (a saída é a linha 2);
     - móveis carimbados com  moveis(x, y, "nome")  e tapetes com  tapete(x, y, "nome")
       (os nomes estão em MOVEIS e TAPETES: são blocos da folha do pacote, em tiles);
     - objetos para examinar em  interativos  (texto na tela) ou  conversar  (para dar itens etc.).
   As casas são montadas por casaInterna({...}) lá embaixo; para criar uma casa nova no futuro:
     1) crie a porta na fachada (casa({...}) em js/salas/bairrosul.js) com um id novo;
     2) chame casaInterna({ id: ..., ... }) aqui com o mesmo id.
   ===================================================== */

(function () {
  // Blocos da folha Interiors: [coluna, linha, largura, altura] em tiles (16 px)
  const MOVEIS = {
    estante:      [10, 68, 2, 3], estante2:    [12, 68, 2, 3], estante3:   [14, 68, 2, 3],
    estanteB:     [10, 71, 2, 3], estanteB2:   [12, 71, 2, 3], estanteB3:  [14, 71, 2, 3],
    estanteBaixa: [5, 14, 2, 2],  estanteBaixa2: [5, 16, 2, 2],
    lareira:      [4, 68, 2, 3],
    sofaAzul:     [1, 72, 3, 2],  sofaCinza:   [4, 72, 3, 2],  sofaMarrom: [7, 72, 3, 2], sofaLilas: [7, 74, 3, 2],
    pufeAzul:     [3, 74, 1, 1],  pufeCinza:   [6, 74, 1, 1],
    camaAzul:     [5, 1, 4, 2],   camaBranca:  [5, 3, 4, 2],
    mesaGrande:   [0, 10, 4, 3],  mesaClara:   [5, 10, 4, 3],
    plantaGrande: [10, 44, 2, 3], palmeira:    [13, 44, 2, 2], plantaPeq: [12, 45, 1, 2], plantaPeq2: [0, 49, 1, 2],
    armario:      [7, 48, 2, 3],  armarioVidro: [11, 48, 2, 3], armario2:  [13, 48, 2, 3], guardaRoupa: [9, 49, 2, 2],
    penteadeira:  [2, 48, 2, 3],  penteadeira2: [4, 48, 2, 3],
    abajurChao:   [12, 56, 1, 3], abajurAzul:  [13, 56, 1, 3],
    computador:   [3, 8, 1, 2],
    balcao:       [3, 59, 2, 2],  balcao2:     [5, 59, 2, 2],  armarioCoz: [1, 59, 2, 2], despensa: [2, 18, 4, 3],
    cadeira:      [6, 21, 1, 2],  cadeira2:    [7, 21, 1, 2],  banquinho: [6, 13, 1, 1],
    baua:         [8, 58, 2, 2],  gaveteiro:   [5, 59, 2, 2],
    quadro1:      [0, 20, 2, 2],  quadro2:     [8, 20, 2, 2],  quadro3:   [10, 21, 2, 2], quadro4: [0, 22, 2, 2],
    quadro5:      [8, 22, 2, 2],  quadro6:     [0, 24, 2, 2],  quadro7:   [2, 24, 2, 2],
    janela:       [9, 24, 2, 2]
  };
  const TAPETES = {
    vermelho: [7, 15, 4, 3], azul: [13, 11, 3, 4], vermelhoV: [13, 16, 3, 4],
    azulPeq: [11, 15, 2, 2], verde: [11, 17, 2, 2], verdePeq: [10, 28, 2, 2], verdeBorda: [0, 42, 3, 2]
  };

  // Paredes (linha da cor na folha Room_Builder) e pisos (coluna, linha do bloco 3x2)
  const PAREDES = { salmao: 5, creme: 7, menta: 9, madeiraClara: 11, madeiraEscura: 13, madeiraVermelha: 15, cinza: 17, bege: 19 };
  const PISOS = { tijolo: [11, 5], creme: [11, 7], azulejo: [11, 9], cinza: [11, 11], espinha: [11, 13] };

  // casaInterna({ id, nome, largura, altura, parede, piso, montar(m, f), interativos, aoEntrar })
  //   montar(m, f)  recebe o mapa e as ferramentas  f.moveis(x, y, nome[, bloqueia])  e  f.tapete(x, y, nome)
  function casaInterna(c) {
    const W = c.largura || 12, H = c.altura || 9, DX = window.CASAS_SUL_DX;
    const m = criarMapa(W, H);
    bloquear(m, 0, 0, W, H);                                       // tudo bloqueado...
    bloquear(m, 1, 3, W - 2, H - 4, 0);                            // ...menos o piso (linhas 3 até H-2)
    pisoRB(m, 1, 3, W - 2, H - 4, PISOS[c.piso][0], PISOS[c.piso][1]);
    paredeRB(m, 1, 1, W - 2, PAREDES[c.parede]);                   // parede de 2 linhas

    const f = {
      moveis: (x, y, nome, bloqueia = true) => { const b = MOVEIS[nome]; if (!b) throw new Error("móvel? " + nome); moveisII(m, x, y, b[0], b[1], b[2], b[3], bloqueia); },
      tapete: (x, y, nome) => {                                     // tapete no CHÃO (camada "deco": os móveis ficam por cima)
        const b = TAPETES[nome];
        for (let j = 0; j < b[3]; j++) for (let i = 0; i < b[2]; i++) por(m, "deco", x + i, y + j, II(b[0] + i, b[1] + j));
      }
    };
    c.montar(m, f);

    // Porta de saída na parede de cima (porta de madeira do pacote), por cima de tudo que ficou na parede
    por(m, "obj", DX, 1, II(7, 8)); por(m, "obj", DX, 2, II(7, 9));
    bloquear(m, DX, 1, 1, 1, 1); bloquear(m, DX, 2, 1, 1, 0);

    // Volta: logo abaixo da porta da fachada, no bairro (1 tile para fora, olhando para baixo)
    const casaFora = window.CASAS_SUL.find((k) => k.id === c.id);
    CENAS[c.id] = {
      mapa: m,
      corFora: "#14111c",
      interativos: c.interativos || [],
      // c.saidas (opcional): cenas que não são uma casa da fachada, como o porão da casa vazia
      saidas: c.saidas || [
        { area: celula(DX, 2), para: "bairro_sul", x: casaFora.portaX * TILE + TILE / 2, y: (casaFora.portaY + 1) * TILE + 44, dir: "baixo" }
      ],
      aoEntrar: c.aoEntrar
    };
    if (c.inimigos) CENAS[c.id].inimigos = c.inimigos;   // (opcional) e c.combate: liga o botão A
    if (c.combate) CENAS[c.id].combate = true;
  }

  // ---------- 1) Dona Lúcia: sala aconchegante, com plantas e livros (idosa que guarda histórias) ----------
  casaInterna({
    id: "casa_sul_lucia", nome: "Dona Lúcia", parede: "salmao", piso: "espinha",
    montar: (m, f) => {
      f.moveis(1, 2, "estante");  f.moveis(9, 2, "estante2");
      f.moveis(7, 2, "lareira");
      f.moveis(3, 1, "janela", false);
      f.tapete(3, 4, "vermelho");
      f.moveis(4, 5, "sofaMarrom");
      f.moveis(1, 5, "plantaGrande");
      f.moveis(9, 6, "palmeira");
      f.moveis(8, 6, "plantaPeq");
      f.moveis(1, 4, "abajurChao");
    },
    interativos: [
      { nome: "estantes_lucia", area: celula(1, 2, 2, 3), texto: "Livros antigos sobre a cidade. Há bilhetes dobrados entre as páginas." },
      { nome: "estantes_lucia2", area: celula(9, 2, 2, 3), texto: "Álbuns de fotografia amarelados. A Dona Lúcia guarda cada lembrança." },
      { nome: "lareira_lucia", area: celula(7, 2, 2, 3), texto: "A lareira está apagada, mas ainda cheira a lenha." },
      { nome: "sofa_lucia", area: celula(4, 5, 3, 2), texto: "Um sofá macio, cheio de almofadas de crochê." },
      { nome: "plantas_lucia", area: celula(1, 5, 2, 3), texto: "Uma planta enorme, bem cuidada. Cada folha parece lustrada." }
    ]
  });

  // ---------- 2) Casa vazia ("Aluga-se"): quase sem móveis ----------
  casaInterna({
    id: "casa_sul_vazia", nome: "Casa vazia", parede: "cinza", piso: "cinza",
    montar: (m, f) => {
      f.moveis(3, 1, "janela", false);
      f.moveis(8, 1, "janela", false);
      f.moveis(1, 6, "banquinho");
      f.moveis(10, 3, "plantaPeq2");
      f.tapete(5, 5, "verdePeq");
      f.moveis(9, 6, "baua");
    },
    interativos: [
      // De noite (a partir do dia 11, depois de falar com o Seu Augusto) o tapete esconde um alçapão: missão "A casa vazia"
      { nome: "alcapao_vazia", area: celula(5, 5, 2, 2),
        ativo: () => !!historia.sulPassIniciada && !historia.sulPassFim && cicloEhNoite(),
        conversar: function () { descerAlcapaoVazia(); } },
      { nome: "baua_vazia", area: celula(9, 6, 2, 2), conversar: function () { usarBauDiretora(); } },   // chave da 1A (js/chave1a.js)
      { nome: "banquinho_vazia", area: celula(1, 6), texto: "Um banquinho esquecido. A casa está vazia e a poeira cobre tudo." },
      { nome: "planta_vazia", area: celula(10, 3), texto: "Uma plantinha teimosa, sobrevivendo sozinha." },
      { nome: "chao_vazia", area: celula(5, 5, 2, 2), texto: "Um tapete pequeno. Parece que alguém morou aqui há pouco tempo." }
    ]
  });


  // ---------- Porão da casa vazia (missão "A casa vazia"; textos PROVISÓRIOS) ----------
  const DEL = (t) => ({ quem: "Dellalos", texto: t });
  function descerAlcapaoVazia() {
    const primeira = !historia.sulPassAlcapao;
    historia.sulPassAlcapao = true;
    const ir = () => mudarCena("porao_sul", window.CASAS_SUL_DX * TILE + TILE / 2, 3 * TILE + 44, "cima");
    if (primeira) abrirDialogo([DEL("O tapete estava solto. Debaixo dele, um alçapão aberto e uma escada para o escuro."), DEL("Vou descer.")], ir);
    else ir();
  }
  TIPOS_INIMIGOS.sentinela = {                 // guarda o porão: igual à sombra, mas sem mexer nas flags da 1A e da 3B
    nome: "Sentinela", largura: 72, altura: 92, vida: 6, velocidade: 95, deteccao: 700, dano: 1,
    moedas: [2, 4],
    cor: "#17101f", corEscura: "#7a4aa8", corOlhos: "#f3e6c8"
  };
  const PORAO_PISTAS = [
    { id: "sulPorao1", nome: "porao_livro", area: celula(7, 6, 4, 3),
      repete: "O livro de presença continua aberto. Rafa, Duda e Gaby estão na lista.",
      falas: [DEL("Um livro de presença. Dezenas de nomes, cada um com uma data."), DEL("Rafa. Duda. Gaby. Todos estão aqui, e cada nome tem ao lado a palavra \"entregue\".")] },
    { id: "sulPorao2", nome: "porao_camas", area: celula(1, 3, 4, 2),
      repete: "As algemas presas à cama continuam ali, e os riscos contam os dias.",
      falas: [DEL("Camas improvisadas, com algemas presas aos pés."), DEL("Na parede há riscos de quem contava os dias. Alguns passam de trinta.")] },
    { id: "sulPorao3", nome: "porao_bau", area: celula(11, 7, 2, 2),
      repete: "O mapa dentro do baú liga o porão à escola.",
      falas: [DEL("Um baú com um mapa. Uma linha sai desta casa e termina na escola."), DEL("Os jovens ficavam aqui até serem levados para lá.")] }
  ];
  function examinarPorao(p) {
    if (historia[p.id]) { mostrarMensagem(p.repete); return; }
    historia[p.id] = true;
    abrirDialogo(p.falas, function () {
      const n = PORAO_PISTAS.filter((q) => historia[q.id]).length;
      if (n < PORAO_PISTAS.length) { mostrarMensagem("Pista " + n + " de " + PORAO_PISTAS.length + " anotada."); sinalizarMissao(); return; }
      abrirDialogo([
        DEL("Era aqui que mantinham os passageiros antes de levá-los à escola."),
        DEL("Alguns já foram levados. Preciso descobrir o que fazem com eles lá.")
      ], function () { historia.sulPassFim = true; descobrirInfo("sul_passageiros"); });   // verificarMissoes dá a recompensa
    });
  }
  const PX = (x, y) => ({ x: x * TILE + TILE / 2, y: y * TILE + 40 });
  casaInterna({
    id: "porao_sul", nome: "Porão", largura: 14, altura: 10, parede: "cinza", piso: "cinza",
    combate: true,
    inimigos: [{ tipo: "sentinela", ...PX(7, 5) }, { tipo: "sentinela", ...PX(12, 6) }],
    saidas: [{ area: celula(window.CASAS_SUL_DX, 2), para: "casa_sul_vazia", x: 5 * TILE + TILE / 2, y: 4 * TILE + 44, dir: "baixo" }],
    montar: (m, f) => {
      f.moveis(1, 3, "camaAzul");
      f.moveis(1, 6, "camaAzul");
      f.moveis(9, 3, "camaBranca");
      f.moveis(7, 6, "mesaClara");
      f.moveis(11, 7, "baua");
    },
    interativos: [
      ...PORAO_PISTAS.map((p) => ({ nome: p.nome, area: p.area, conversar: () => examinarPorao(p) })),
      { nome: "porao_cama2", area: celula(1, 6, 4, 2), texto: "Outra cama de ferro, com um cobertor fino. Alguém dormiu aqui há pouco." },
      { nome: "porao_cama3", area: celula(9, 3, 4, 2), texto: "Uma terceira cama. No pé dela, um sapato pequeno de criança." }
    ]
  });

  // ---------- 3) Seu Augusto: sala de quem fica de olho no bairro ----------
  casaInterna({
    id: "casa_sul_augusto", nome: "Seu Augusto", parede: "madeiraEscura", piso: "creme",
    montar: (m, f) => {
      f.moveis(1, 2, "estanteB"); f.moveis(10, 2, "armarioVidro");
      f.moveis(3, 1, "janela", false);
      f.moveis(7, 1, "janela", false);
      f.tapete(4, 4, "azul");
      f.moveis(4, 6, "sofaCinza");
      f.moveis(8, 6, "pufeCinza");
      f.moveis(8, 4, "mesaClara");
      f.moveis(1, 6, "abajurAzul");
    },
    interativos: [
      { nome: "estante_augusto", area: celula(1, 2, 2, 3), texto: "Livros e almanaques. Um deles tem recortes de jornal sobre o bairro." },
      { nome: "armario_augusto", area: celula(10, 2, 2, 3), texto: "Um armário com louças. Tudo no lugar, como o Seu Augusto gosta." },
      { nome: "sofa_augusto", area: celula(4, 6, 3, 2), texto: "O sofá de onde ele observa a rua pela janela." },
      { nome: "mesa_augusto", area: celula(8, 4, 4, 3), texto: "Uma mesa com anotações: horários de quem passa e o que sumiu da calçada." }
    ]
  });

  // ---------- 4) Caio: quarto de estudante ----------
  casaInterna({
    id: "casa_sul_caio", nome: "Caio", parede: "menta", piso: "azulejo",
    montar: (m, f) => {
      f.moveis(1, 3, "camaAzul");
      f.moveis(7, 2, "guardaRoupa");
      f.moveis(9, 2, "computador");
      f.moveis(3, 1, "quadro2", false);
      f.moveis(10, 1, "quadro4", false);
      f.tapete(5, 5, "azulPeq");
      f.moveis(8, 6, "plantaPeq");
      f.moveis(10, 5, "abajurChao");
    },
    interativos: [
      { nome: "cama_caio", area: celula(1, 3, 4, 2), texto: "A cama do Caio, com um cobertor listrado. Os livros da escola estão empilhados ao lado." },
      { nome: "armario_caio", area: celula(7, 2, 2, 2), texto: "Um guarda-roupa com espelhos. Tem um uniforme da escola pendurado." },
      { nome: "computador_caio", area: celula(9, 2), texto: "O computador dele. Na tela, uma lista de tarefas da escola, quase toda riscada." },
      { nome: "planta_caio", area: celula(8, 6), texto: "Uma plantinha na janela do quarto." }
    ]
  });

  // ---------- 5) Helena: cozinha e plantas (jardineira) ----------
  casaInterna({
    id: "casa_sul_helena", nome: "Helena", parede: "creme", piso: "creme",
    montar: (m, f) => {
      f.moveis(1, 2, "despensa");
      f.moveis(7, 2, "balcao");
      f.moveis(9, 2, "balcao2");
      f.moveis(3, 1, "janela", false);
      f.tapete(4, 4, "verdeBorda");
      f.moveis(4, 5, "mesaGrande");
      f.moveis(3, 6, "cadeira"); f.moveis(8, 6, "cadeira2");
      f.moveis(10, 5, "plantaGrande");
      f.moveis(1, 6, "plantaPeq2");
    },
    interativos: [
      { nome: "despensa_helena", area: celula(1, 2, 4, 3), texto: "A despensa da Helena: sementes, vasos e vidros etiquetados com nomes de flores." },
      { nome: "balcao_helena", area: celula(7, 2, 4, 2), texto: "Um balcão com regadores e pequenas pás. Tudo limpinho." },
      { nome: "mesa_helena", area: celula(4, 5, 4, 3), texto: "Uma mesa grande, coberta de desenhos de canteiros." },
      { nome: "plantas_helena", area: celula(10, 5, 2, 3), texto: "Uma planta enorme. A Helena diz que ela escuta quando alguém canta." }
    ]
  });

  // ---------- 6) Pedro: bagunça de quem vive procurando alguma coisa ----------
  casaInterna({
    id: "casa_sul_pedro", nome: "Pedro", parede: "madeiraVermelha", piso: "tijolo",
    montar: (m, f) => {
      f.moveis(1, 2, "armario");
      f.moveis(7, 2, "plantaPeq2");
      f.moveis(9, 2, "armario2");
      f.moveis(3, 1, "janela", false);
      f.tapete(3, 3, "vermelho");
      f.moveis(4, 5, "mesaGrande");
      f.moveis(2, 6, "banquinho");
      f.moveis(9, 5, "gaveteiro");
      f.moveis(1, 5, "plantaPeq");
    },
    interativos: [
      { nome: "armario_pedro", area: celula(1, 2, 2, 3), texto: "O armário está aberto. Tem coisas de todo tipo empilhadas, mas nada que pareça \"a coisa\"." },
      { nome: "armario2_pedro", area: celula(9, 2, 2, 3), texto: "Outro armário revirado. As gavetas estão fora do lugar." },
      { nome: "mesa_pedro", area: celula(4, 5, 4, 3), texto: "A mesa está coberta de bilhetes: \"onde deixei?\", \"não está aqui\", \"olhar de novo\"." },
      { nome: "gaveteiro_pedro", area: celula(9, 5, 2, 2), texto: "Uma gaveta emperrada. Dentro, só clipes e uma chave sem fechadura." }
    ]
  });
})();
