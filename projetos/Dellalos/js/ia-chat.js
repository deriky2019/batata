/* Conversa inteligente offline para Shadow of War.
   Não usa API, servidor, internet ou chave. É um sistema local de intenções e respostas
   combinadas; não é um modelo generativo e pode não compreender perguntas inesperadas. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const painel = $("painelConversaIA"), seletor = $("iaPersonagem"), mensagens = $("iaMensagens");
  const formulario = $("iaFormulario"), texto = $("iaTexto"), enviar = $("iaEnviar"), status = $("iaStatus");
  if (!painel || !formulario || !seletor || !mensagens) return;
  const sugestoes = $("iaSugestoes"), fracasBtn = $("iaFracasBtn"), fracasBox = $("iaFracas"), fracasTexto = $("iaFracasTexto");

  const STORAGE_KEY = "shadowOfWar.conversasOffline.v1";
  const STORAGE_MEM = "shadowOfWar.memoriaConversas.v1";
  const personagens = {
    Nathalia: { estilo:"tranquila, curiosa e observadora", saudacao:"Oi! Estava pensando em algumas coisas da escola. O que você quer saber?", fallback:["Não sei dizer com certeza... tem alguma pista que possa me ajudar?", "Hmm, nunca pensei nisso desse jeito. Você descobriu alguma coisa?", "Prefiro não tirar conclusões sem entender melhor o que aconteceu."] },
    Millena: { estilo:"acolhedora, amigável e prática", saudacao:"Oi! Pode falar comigo. Se eu souber, vou tentar ajudar.", fallback:["Não tenho certeza, mas podemos investigar isso juntas.", "Talvez seja melhor conversar com alguém que também viu o que aconteceu.", "Queria ter uma resposta melhor. O que você sabe até agora?"] },
    Lucas: { estilo:"sério, reservado e direto; gosta de treinar", saudacao:"Fala. O que você precisa saber?", fallback:["Não tenho informação suficiente pra afirmar isso.", "Prefiro me concentrar no que sabemos de verdade.", "Não sou bom em adivinhar. Se tiver uma pista, me mostra."] },
    Isabela: { estilo:"misteriosa, controlada e ambígua", saudacao:"Ora... resolveu conversar comigo? O que deseja saber?", fallback:["Você está fazendo perguntas interessantes... mas será que está pronta para as respostas?", "Algumas coisas são melhores quando descobertas na hora certa.", "Observe com calma. Quase tudo aqui tem um motivo."] },
    Thaina: { estilo:"reservada, econômica nas palavras e leal à Isabela", saudacao:"Oi. O que foi?", fallback:["Não sei.", "Prefiro não falar disso agora.", "Talvez a Isabela saiba mais do que eu."] },
    Deriky: { estilo:"cauteloso, experiente e preocupado com os perigos da cidade", saudacao:"Pode perguntar. Só não confie em tudo o que ouvir por aí.", fallback:["A cidade guarda coisa demais. Não vou inventar uma resposta pra você.", "Tenha cuidado com as conclusões. Procure provas.", "Se descobrir algo concreto, volte e me conte."] },
    Simon: { estilo:"amigo de Lucas, fala de modo informal e cuidadoso", saudacao:"E aí. O que você quer saber?", fallback:["Não sei te dizer isso com certeza.", "Talvez seja melhor perguntar ao Deriky.", "Tem coisa que eu ainda estou tentando entender também."] },
  };

  const fatos = [
    { palavras:["oi","ola","olá","e ai","e aí","bom dia","boa noite","tudo bem","como voce esta","como você está"], respostas:{
      Nathalia:["Oi! Tudo bem. Estava observando umas pistas por aqui. E você?"], Millena:["Oii! Estou bem. Como você está?"], Lucas:["Tudo certo. E aí?"], Isabela:["Estou ótima... obrigada por perguntar."], Thaina:["Oi. Tudo."], Deriky:["Vou levando. Fique atento por onde anda."], Simon:["Tudo tranquilo por enquanto."] } },
    { palavras:["quem e voce","quem é você","seu nome","seu nome e","seu nome é","fale sobre voce","fale sobre você"], respostas:{
      Nathalia:["Sou a Nathalia. Gosto de observar os lugares e perceber detalhes que os outros deixam passar."], Millena:["Sou a Millena, estudo aqui e gosto de ajudar quem está chegando."], Lucas:["Lucas. Gosto de treinar. Não tenho muito mais a dizer."], Isabela:["Sou a Isabela. Acho que você já percebeu que gosto de observar antes de falar."], Thaina:["Thaina. Sou amiga da Isabela."], Deriky:["Sou o Deriky. Moro no Bairro Sul e aprendi a ter cuidado com os perigos da cidade."], Simon:["Sou o Simon, amigo do Lucas."] } },
    { palavras:["seita","torneio","ritual","culto"], responder:(nome,ctx)=>{
      if (!ctx.revelouSeita) return nome==="Deriky"||nome==="Simon" ? "Ainda não é hora de falar disso. Primeiro, preciso ter certeza de que você está pronta para ouvir." : nome==="Isabela" ? "Seita? Que palavra forte... De onde você tirou essa ideia?" : "Sei pouco sobre isso até agora. Acho melhor investigar antes de tirar conclusões.";
      const mapa={Deriky:"O Simon e eu te contamos que existe uma seita na cidade. O torneio está ligado aos planos dela. Tenha cuidado com quem confia.",Simon:"Depois que conversamos com o Deriky, ficou claro que há uma seita por trás do torneio. Ainda é perigoso sair contando isso pra qualquer um.",Nathalia:"Depois do que vocês descobriram, o torneio parece fazer parte de algo muito maior. Precisamos juntar as pistas com cuidado.",Millena:"A ideia de que o torneio está ligado a uma seita me assusta. Vamos descobrir o que está acontecendo sem nos colocarmos em perigo.",Lucas:"Se você já sabe da seita, não baixe a guarda. Continue treinando e não confie em qualquer pessoa.",Isabela:"Você anda ouvindo coisas perigosas. Nem tudo que te contaram é necessariamente toda a verdade.",Thaina:"Eu sei que você ouviu falar da seita. Não vou falar sobre isso agora."};
      return mapa[nome] || "A seita está ligada aos mistérios da cidade, mas precisamos de provas.";
    }},
    { palavras:["sala 1a","sala um a","1a","mariane","porta da sala"], responder:(nome,ctx)=>{
      if (!ctx.conheceuMariane && !ctx.abriu1A) return nome==="Nathalia"||nome==="Millena" ? "Ouvi comentários estranhos sobre a sala 1A. Talvez devêssemos descobrir por que ela está trancada." : "Ainda não sei o bastante sobre essa sala para falar com certeza.";
      return "A sala 1A estava cercada de rumores. As pistas que encontramos lá mostram que há algo estranho acontecendo na escola.";
    }},
    { palavras:["caos","espirito","espírito","selo","altar","capela"], responder:(nome,ctx)=>{
      if (!ctx.revelouSeita && !ctx.altarFim) return "Ouvi rumores e vi coisas que não consigo explicar. Ainda não temos informações suficientes para entender isso.";
      if (ctx.mansaoTunelAberto) return "As pistas apontam para um selo ligado ao Caos. O túnel e os documentos encontrados ajudam a entender o perigo, mas ainda precisamos agir com cuidado.";
      return nome==="Isabela" ? "O Caos é um assunto que exige cuidado. Você está certa de que quer saber mais?" : "O Caos parece estar ligado aos acontecimentos sobrenaturais da cidade. Procure pistas e registre o que descobrir no diário.";
    }},
    { palavras:["pai","papai","carta","quarto do pai"], responder:(nome,ctx)=>{
      if (!ctx.leuCartaPai && !ctx.achouCaderno) return "Talvez você encontre respostas na casa da família. Ainda não sabemos tudo o que aconteceu com o pai dela.";
      return "As pistas encontradas no quarto do pai dela podem ajudar a entender o passado. É melhor reler o que foi registrado no diário.";
    }},
    { palavras:["tunel","túnel","mansao","mansão","sangue","porão","porao"], responder:(nome,ctx)=>{
      if (!ctx.mansaoTunelAberto) return "Ainda não temos todas as informações sobre esse lugar. Explore a região e examine documentos e objetos com atenção.";
      return "A passagem escondida no porão da mansão leva até a porta do selo. A senha SANGUE foi descoberta nas primeiras letras da carta do zelador.";
    }},
    { palavras:["missao","missão","objetivo","o que faco","o que faço","pra onde","para onde","proximo","próximo","ajuda","dica"], responder:(nome,ctx)=>{
      if (ctx.dia !== null) return "Pelo que consigo lembrar, estamos no dia " + ctx.dia + " da história. Confira o Diário/Missões no inventário para ver os objetivos ativos; não quero te orientar para uma etapa que talvez você ainda não tenha desbloqueado.";
      return "Dê uma olhada no Diário e nas missões do inventário. Lá ficam registrados os objetivos ativos.";
    }},
    { palavras:["escola","colegio","estudantes","professor"], responder:(nome,ctx)=>{
      if (ctx.abriu1A || ctx.conheceuMariane) return nome==="Isabela" ? "A escola parece comum quando você olha depressa. Mas alguns detalhes da sala 1A merecem mais atenção." : "Depois dos rumores sobre a sala 1A, acho melhor observar a escola com cuidado e registrar qualquer pista no diário.";
      return nome==="Nathalia" ? "Tem muita coisa acontecendo na escola, e os rumores nem sempre contam a história toda. Você reparou em algo estranho?" : nome==="Millena" ? "A escola parece normal, mas as pessoas andam comentando coisas estranhas. É melhor separar os boatos das pistas reais." : "Ainda não tenho uma resposta definitiva sobre a escola. Vale examinar as salas e conversar com quem estava por perto.";
    }},
    { palavras:["combate","luta","treino","inimigo","atacar"], responder:(nome)=>{
      if(nome==="Lucas") return "Se for entrar numa luta, observe o adversário e não gaste energia à toa. Treinar ajuda, mas pensar antes de atacar é tão importante quanto força.";
      if(nome==="Simon") return "Eu não procuro briga, mas se não houver escolha, fique atento aos movimentos do inimigo e não se precipite.";
      if(nome==="Deriky") return "Evite confronto desnecessário. Se precisar lutar, observe o ambiente e tenha uma rota para sair.";
      return "Se surgir perigo, observe o ambiente e não aja por impulso. Confira os objetivos do jogo antes de avançar.";
    }},
    { palavras:["cidade","bairro","rua","mapa","local"], responder:(nome)=>{
      if(nome==="Deriky") return "Conheço alguns perigos da cidade, especialmente no Bairro Sul. Explore com cuidado e examine objetos importantes; nem todo lugar é seguro.";
      if(nome==="Simon") return "Tem lugares da cidade que eu prefiro evitar. Se estiver procurando algo, confira o mapa e preste atenção nas pistas.";
      if(nome==="Isabela") return "Os lugares dizem muito sobre as pessoas que passam por eles. Às vezes, o detalhe importante não é o lugar, mas o que foi deixado lá.";
      return "Explore aos poucos e observe os detalhes do cenário. Se encontrar algo importante, confira o diário para relacionar as pistas.";
    }},
    { palavras:["amizade","amiga","amigo","gosta de mim","confia em mim","relacao","relação"], responder:(nome)=>{
      const rel={Nathalia:"Gosto de pessoas que prestam atenção nos detalhes e tentam ajudar.",Millena:"Pra mim, amizade é apoiar as pessoas e conversar com sinceridade.",Lucas:"Confiança se conquista com atitudes, não com palavras.",Isabela:"Confiança... uma coisa interessante. Você tem certeza de que sabe em quem confiar?",Thaina:"Levo minhas amizades a sério. Principalmente a Isabela.",Deriky:"Numa cidade perigosa, é importante saber quem está ao seu lado.",Simon:"Amigo de verdade não abandona os outros quando as coisas ficam difíceis."};
      return rel[nome] || "As relações mudam conforme as escolhas e os acontecimentos.";
    }},
    { palavras:["segredo","me conta","conte algo","curiosidade","misterio","mistério"], responder:(nome,ctx)=>{
      if (nome==="Isabela") return ctx.revelouSeita ? "Você já sabe que há coisas escondidas por trás do torneio. Mas conhecer uma pista não significa conhecer toda a verdade." : "Todo mundo guarda alguma coisa. A pergunta é: por que você quer saber dos meus segredos?";
      return "Uma coisa que aprendi: preste atenção nos detalhes dos lugares e nas falas das pessoas. Às vezes, uma pista pequena muda tudo.";
    }}
  ];

  function normalizar(s) { return String(s||"").toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim(); }
  function contexto() {
    const h = (typeof historia !== "undefined" && historia) ? historia : {};
    let dia = null; try { if (typeof diaAtual === "function") dia = diaAtual(); } catch (_) {}
    return { dia, revelouSeita:!!h.revelouSeita, conheceuMariane:!!h.viuMariana, abriu1A:!!h.abriu1A,
      leuCartaPai:!!h.leuCartaPai, achouCaderno:!!h.achouCaderno, mansaoTunelAberto:!!h.mansaoTunelAberto, altarFim:!!h.altarFim };
  }
  // Sinônimos e formas comuns de escrever: o motor entende frases equivalentes.
  const sinonimos = {
    oi:["ola","e ai","salve","bom dia","boa tarde","boa noite","tudo bem","como vai"],
    seita:["culto","grupo secreto","sociedade secreta","ritual","torneio","cultistas"],
    "sala 1a":["sala um a","sala um-a","sala primeira a","sala trancada","porta da sala","1a"],
    caos:["espirito","espirito do caos","selo","altar","capela","forca sobrenatural","entidade"],
    pai:["papai","pai da dellalos","carta do pai","quarto do pai","caderno do pai","familia"],
    tunel:["passagem","passagem secreta","mansao","mansao abandonada","porao","subterraneo","sangue"],
    missao:["objetivo","o que faco","que eu faço","pra onde vou","para onde ir","proximo passo","me ajuda","dica","estou perdido","o que fazer agora"],
    amizade:["amiga","amigo","relacionamento","relacao","confianca","gosta de mim","somos amigos"],
    segredo:["misterio","curiosidade","me conta","conte algo","esconde","escondendo","revelar"],
    escola:["colegio","colégio","escola","salas de aula","estudantes","alunos","professor","professora"],
    combate:["luta","batalha","treino","treinar","vencer","inimigo","inimigos","atacar","defender"],
    cidade:["bairro","cidade","rua","lugares","local","onde fica","mapa","regiao","região"]
  };
  const stopwords = new Set("a o os as um uma uns umas de da do das dos em no na nos nas por para pra com sem e ou que se eu voce vc voces meu minha meus minhas seu sua seus suas isso isto esse essa este esta aqui ai la ele ela eles elas sobre muito mais menos foi ser estar tem tenho sabe saber quero queria pode poderia me te lhe falar diga conta conte fazer faz aconteceu coisa coisas".split(" "));
  function distancia(a,b) {
    if (Math.abs(a.length-b.length)>2) return 99;
    let prev=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){
      const cur=[i];
      for(let j=1;j<=b.length;j++) cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
      prev=cur;
    }
    return prev[b.length];
  }
  function tokens(s) { return normalizar(s).split(" ").filter(t=>t && !stopwords.has(t)); }
  function pontuar(pergunta, palavras) {
    const q=normalizar(pergunta), qt=tokens(q); let melhor=0;
    for(const termo of palavras){
      const n=normalizar(termo); if(!n) continue;
      if(n.includes(" ") ? q.includes(n) : new RegExp("(^|\\s)"+n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"($|\\s)").test(q)) melhor=Math.max(melhor, n.includes(" ")?5:4);
      const nt=tokens(n);
      if(nt.length>1){
        const iguais=nt.filter(t=>qt.includes(t)).length;
        if(iguais) melhor=Math.max(melhor, 2+2*iguais/nt.length);
      }
      for(const a of nt){
        if(a.length<5) continue;
        for(const b of qt){ if(b.length>=5 && distancia(a,b)===1) melhor=Math.max(melhor,2.7); }
      }
    }
    return melhor;
  }
  // Relações definidas pelo criador: preservar exatamente os vínculos informados.
  const relacionamentos = {
    Nathalia: {
      Deriky: {
        tipo: "conhecidos/neutros", sentimento: "interesse romântico escondido",
        respostas: [
          "O Deriky? A gente é só conhecido... mas acho que ele é uma pessoa interessante. Por que você quer saber?",
          "Ele parece legal. Não quer dizer nada, tá? Só acho que ainda não conheço ele muito bem.",
          "O Deriky? *desvia o olhar* Não tenho nada demais pra dizer... só gostaria de conversar mais com ele algum dia."
        ],
        perguntaDireta: [
          "Gostar dele? Eu... não sei se chamaria assim. Ele parece interessante, mas não conta pra ninguém que eu disse isso, tá?",
          "Por que essa pergunta do nada?! O Deriky é legal, só isso... quer dizer, acho que é."
        ]
      },
      Veras: {
        tipo: "melhor amiga", respostas: [
          "A Veras é minha melhor amiga. É alguém muito importante pra mim e em quem eu confio de verdade.",
          "Eu e a Veras somos muito próximas. Posso contar com ela, e espero que ela também possa contar comigo.",
          "A Veras? *sorri de leve* Ela é minha melhor amiga. Não preciso pensar duas vezes antes de dizer que confio nela."
        ]
      },
      Isabela: {
        tipo: "desconfiança", respostas: [
          "A Isabela... prefiro manter certa distância. Ainda não consigo confiar totalmente nela.",
          "Não vou dizer que a Isabela seja minha inimiga, mas tem coisas nela que me deixam desconfiada.",
          "Com a Isabela, eu prefiro observar antes de confiar. Não me sinto totalmente à vontade perto dela."
        ]
      },
      Thaina: {
        tipo: "desconfiança", respostas: [
          "Sobre a Thaina, ainda tenho minhas dúvidas. Prefiro não confiar nela tão facilmente.",
          "Não sei se consigo confiar na Thaina. Por enquanto, acho melhor manter os olhos abertos.",
          "A Thaina me deixa desconfiada. Isso não quer dizer que eu saiba de alguma coisa contra ela; só não confio totalmente."
        ]
      },
      Millena: {
        tipo: "conhecidas/neutras", respostas: [
          "A Millena e eu somos conhecidas. Não tenho nada contra ela, mas também não somos tão próximas.",
          "A Millena parece ser alguém com quem consigo conviver numa boa. Por enquanto, é isso.",
          "Não tenho uma relação muito próxima com a Millena. Somos mais conhecidas do que amigas."
        ]
      },
      Lucas: {
        tipo: "conhecidos/neutros", respostas: [
          "O Lucas? Somos conhecidos. Não tenho nada contra ele, só não somos próximos.",
          "Acho o Lucas tranquilo, mas nossa relação é mais de conhecidos mesmo.",
          "Não tenho nenhum problema com o Lucas. Só não diria que somos amigos próximos."
        ]
      },
      Simon: {
        tipo: "conhecidos/neutros", respostas: [
          "O Simon e eu somos conhecidos. Não tenho nada contra ele, mas não somos próximos.",
          "O Simon parece tranquilo. Por enquanto, nossa relação é só de conhecidos.",
          "Não tenho nenhuma questão com o Simon. A gente apenas não tem tanta intimidade."
        ]
      },
      Vitinho: {
        tipo: "conhecidos/neutros", respostas: [
          "O Vitinho? Somos conhecidos, só isso. Não tenho nada contra ele.",
          "Não sou muito próxima do Vitinho, mas também não tenho motivo para desconfiar dele.",
          "Minha relação com o Vitinho é neutra. A gente se conhece, mas não somos grandes amigos."
        ]
      },
      Durval: {
        tipo: "medo", respostas: [
          "O Durval me dá medo. Tento não ficar perto dele mais do que o necessário.",
          "Só de pensar no Durval eu fico tensa. Tenho medo dele e prefiro manter distância.",
          "Não me sinto segura perto do Durval. Não quero falar muito sobre isso... só prefiro ficar longe dele."
        ]
      }
    },
    Deriky: {
      Nathalia: {
        tipo: "conhecidos/neutros", sentimento: "interesse romântico correspondido, com receio",
        respostas: [
          "A Nathalia parece ser uma pessoa legal. Só não sei se seria uma boa ideia me aproximar demais...",
          "Ela é interessante, sim. Mas prefiro ir com calma. A gente ainda é só conhecido.",
          "A Nathalia? *hesita* Não tenho nada contra ela. Na verdade, gostaria de conversar mais com ela, mas deixa isso pra lá."
        ],
        perguntaDireta: [
          "Eu gosto dela... acho. Mas não sei se devo falar disso, nem se ela sente o mesmo. Prefiro não me precipitar.",
          "A Nathalia é especial, mas tenho certo receio de demonstrar o que sinto. Não quero tirar conclusões antes de conhecer melhor ela."
        ]
      }
    }
  };

  // =====================================================================
  //  TABELA DE RELACIONAMENTOS (definida pelo criador)
  //  Cada linha vale para os DOIS lados. As falas escritas à mão acima
  //  (Nathalia e Deriky→Nathalia) são preservadas; o resto é gerado a partir
  //  do tipo da relação e passa pela voz de cada personagem (VOZES).
  //  Formato: [personagem1, personagem2, tipo, rótulo original da tabela]
  // =====================================================================
  const RELACOES = [
    ["Nathalia","Veras","melhores","Melhores amigas"], ["Nathalia","Isabela","desconfianca","Desconfiança"],
    ["Nathalia","Thaina","desconfianca","Desconfiança"], ["Nathalia","Millena","neutro","Conhecidas/neutras"],
    ["Nathalia","Lucas","neutro","Conhecidos/neutros"], ["Nathalia","Simon","neutro","Conhecidos/neutros"],
    ["Nathalia","Vitinho","neutro","Conhecidos/neutros"], ["Nathalia","Durval","medo","Medo"],
    ["Nathalia","Deriky","neutro","Conhecidos; interesse romântico secreto e recíproco"],
    ["Millena","Lucas","neutro","Conhecidos/neutros"], ["Millena","Isabela","cautela","Conhecidas, com cautela"],
    ["Millena","Thaina","neutro","Conhecidas/neutras"], ["Millena","Deriky","conhecidos","Conhecidos"],
    ["Millena","Simon","neutro","Conhecidos/neutros"], ["Millena","Vitinho","colegas","Colegas"],
    ["Millena","Veras","conhecidos","Conhecidas"], ["Millena","Durval","distantes","Distantes"],
    ["Lucas","Isabela","tensao","Tensão e desconfiança"], ["Lucas","Thaina","conhecidos","Conhecidos"],
    ["Lucas","Deriky","conhecidos","Conhecidos"], ["Lucas","Simon","amigosProx","Amigos próximos"],
    ["Lucas","Vitinho","amigos","Amigos/colegas próximos"], ["Lucas","Veras","neutro","Conhecidos/neutros"],
    ["Lucas","Durval","distantes","Distantes"],
    ["Isabela","Thaina","aliados","Aliadas próximas"], ["Isabela","Deriky","tensao","Desconfiança e tensão"],
    ["Isabela","Simon","cautela","Desconfiança e cautela"], ["Isabela","Vitinho","desconfiaLeve","Conhecidos; possível desconfiança"],
    ["Isabela","Veras","neutro","Conhecidas/neutras"], ["Isabela","Durval","desconhecida","Relação desconhecida"],
    ["Thaina","Deriky","neutro","Conhecidos/neutros"], ["Thaina","Simon","misterio","Conhecidos ligados ao mistério"],
    ["Thaina","Vitinho","neutro","Conhecidos/neutros"], ["Thaina","Veras","neutro","Conhecidas/neutras"],
    ["Thaina","Durval","desconhecida","Relação desconhecida"],
    ["Deriky","Simon","aliadosAntigos","Amigos antigos e aliados"], ["Deriky","Vitinho","neutro","Conhecidos/neutros"],
    ["Deriky","Veras","neutro","Conhecidos/neutros"], ["Deriky","Durval","desconhecida","Relação desconhecida"],
    ["Simon","Vitinho","amigos","Amigos/colegas"], ["Simon","Veras","neutro","Conhecidos/neutros"],
    ["Simon","Durval","desconhecida","Relação desconhecida"],
    ["Vitinho","Veras","neutro","Conhecidos/neutros"], ["Vitinho","Durval","desconhecida","Relação desconhecida"],
    ["Veras","Durval","desconhecida","Relação desconhecida"]
  ];
  const GENERO = { Nathalia:"f", Veras:"f", Isabela:"f", Thaina:"f", Millena:"f", Lucas:"m", Simon:"m", Vitinho:"m", Durval:"m", Deriky:"m" };
  // {O}/{o}=o·a  {do}=do·da  {no}=no·na  {ele}=ele·ela  {n}=nome
  const MODELOS_REL = {
    neutro:["{O} {n} eu conheço, só isso. Não tenho nada contra {ele}.","Não tenho problema nenhum com {o} {n}. A gente só não é próximo.","Com {o} {n} é tranquilo, mas nossa relação é bem neutra."],
    conhecidos:["{O} {n} eu conheço, mas a gente quase não conversa.","A gente se conhece de vista e de conversa rápida, nada além disso.","Nunca tive motivo pra reclamar {do} {n}, mas também nunca fomos de conversar muito."],
    colegas:["Somos colegas, {o} {n} e eu. A gente se esbarra por aí e se dá bem.","Com {o} {n} é de boa. Colegas mesmo, sem drama.","Convivo com {o} {n} no dia a dia. Nada de especial, nada de ruim."],
    amigos:["Eu me dou bem com {o} {n}. Dá pra chamar de amizade, sim.","Confio bastante {no} {n}. É gente boa.","{O} {n} é daquelas pessoas com quem eu converso sem medo de errar."],
    amigosProx:["Com {o} {n} é diferente: somos amigos de verdade. Pode contar com isso.","{O} {n} é dos poucos em quem eu confio sem pensar duas vezes.","Eu e {o} {n} já passamos por coisa demais juntos pra eu falar mal. Somos próximos."],
    aliados:["{O} {n} e eu nos entendemos sem precisar de muitas palavras. Somos aliadas.","Confio {no} {n}. Quase ninguém tem isso comigo.","Se for pra escolher quem fica ao meu lado, é {o} {n}."],
    aliadosAntigos:["Conheço {o} {n} há muito tempo. Somos aliados desde antes de tudo isso.","Confio {no} {n} de olhos fechados. A gente se cobre.","Não é de hoje que {o} {n} e eu estamos juntos nisso."],
    cautela:["Com {o} {n} eu vou com cuidado. Não é que eu não goste, só prefiro não confiar de cara.","Com {o} {n} tem educação sempre, confiança... ainda vou ver.","Converso com {o} {n}, mas com um pé atrás."],
    desconfianca:["Com {o} {n} eu prefiro manter distância. Não confio totalmente.","Tem alguma coisa {no} {n} que não me convence.","Com {o} {n} eu observo antes de confiar."],
    tensao:["Entre mim e {o} {n} tem tensão, não vou negar. Confiança ali, só com muita prova.","Melhor a gente não puxar esse assunto de {o} {n}. O clima entre nós não é bom.","Não confio {no} {n}, e acho que a recíproca é verdadeira."],
    distantes:["Com {o} {n} a gente mal se fala. Mantenho distância.","Não tenho muito o que dizer {do} {n}. Somos distantes.","Com {o} {n} nunca houve aproximação. Cada um no seu canto."],
    desconhecida:["Sinceramente, não sei dizer como é minha relação com {o} {n}. Quase não tenho o que falar.","Não conheço {o} {n} o bastante pra opinar.","Nunca parei pra pensar nisso. {O} {n} é um ponto de interrogação pra mim."],
    misterio:["{O} {n} e eu nos conhecemos, sim. O que nos liga é mais o mistério dessa cidade do que amizade.","Com {o} {n}, a conversa sempre volta pro que está acontecendo aqui. Não vai muito além disso.","Sei que {o} {n} também faz parte disso tudo. Fora isso, pouca coisa."],
    desconfiaLeve:["{O} {n} eu conheço. Ainda não decidi se merece minha confiança.","Alguma coisa {no} {n} me faz ficar de olho. Nada concreto... ainda.","Conheço {o} {n}, sim. Confiar... o tempo vai dizer."]
  };
  // Pares com fala própria (quem fala > de quem). Substituem o modelo genérico.
  const REL_ESPECIAIS = {
    "Lucas>Simon":["O Simon é meu parceiro. A gente se entende no silêncio, sem precisar de conversa fiada.","Se tem alguém em quem eu confio de olhos fechados, é o Simon.","O Simon fala mais que eu, mas me cobre sempre. Amigo de verdade."],
    "Simon>Lucas":["O Lucas é meu amigo desde sempre. Fala pouco, mas quando fala, vale a pena ouvir.","Se o Lucas tá do meu lado, eu fico tranquilo.","O Lucas é osso duro, mas é gente boa. Confio nele."],
    "Lucas>Isabela":["Tem alguma coisa na Isabela que me incomoda. Não confio nela, e ela sabe.","O clima entre mim e a Isabela é pesado. Prefiro manter distância e ficar de olho.","Não vou mentir: a Isabela me deixa em alerta. Cada palavra dela parece ter outro sentido."],
    "Isabela>Lucas":["O Lucas me olha como se já tivesse decidido quem eu sou. Que desperdício de energia.","Tensão? Chame como quiser. O Lucas e eu não vamos nos entender tão cedo.","Eu entendo a desconfiança do Lucas. Só não pretendo facilitar."],
    "Isabela>Thaina":["Poucas pessoas entendem o silêncio da Thaina. Eu entendo.","A Thaina é leal. Isso, nesta cidade, vale ouro.","Eu e a Thaina não precisamos de muitas palavras."],
    "Thaina>Isabela":["A Isabela é minha amiga. Confio nela.","Eu fico com a Isabela. Sempre.","Se a Isabela precisa, eu estou lá. Simples assim."],
    "Isabela>Deriky":["O Deriky gosta de fingir que sabe tudo. Eu não confio nele, e ele sabe disso.","Tensão? Chame como quiser. O Deriky e eu enxergamos esta cidade de lados diferentes.","Ele fala em proteger as pessoas. Eu me pergunto de quem, exatamente."],
    "Deriky>Isabela":["Tenho minhas razões pra não baixar a guarda perto da Isabela.","Tem tensão entre nós, sim. Ela esconde mais do que mostra, e eu não gosto disso.","Cuidado com a Isabela. Não digo que ela seja o problema... mas também não digo que não seja."],
    "Deriky>Simon":["O Simon e eu somos amigos de longa data. Ele é um dos poucos em quem confio.","Conheço o Simon há muito tempo. Se eu precisar de alguém ao meu lado, é ele.","O Simon é aliado desde sempre. A gente já passou por muita coisa junto."],
    "Simon>Deriky":["O Deriky é amigo antigo, parceiro de longa data. Quando ele pede cuidado, eu escuto.","Eu confio no Deriky. A gente se conhece há muito tempo.","O Deriky pode parecer sério demais, mas é o tipo de amigo que fica."],
    "Simon>Isabela":["Sou educado com a Isabela, mas tô de olho. Tem alguma coisa ali.","Prefiro ir com cautela com a Isabela. Ela tem um jeito que não me deixa à vontade.","Não confio nela totalmente. Ainda não dá."],
    "Isabela>Nathalia":["A Nathalia observa demais. E quem observa demais costuma desconfiar também.","A Nathalia me olha como se tentasse ler algo escondido. Que curioso.","Não me incomodo com a desconfiança da Nathalia. Só acho interessante ela achar que pode me julgar."],
    "Thaina>Nathalia":["A Nathalia desconfia de mim. Eu sei.","Não ligo pra desconfiança dela. Só prefiro não falar muito."]
  };
  function preencherModelo(t, outro) {
    const f = GENERO[outro] === "f";
    return t.replace(/\{O\}/g, f ? "A" : "O").replace(/\{o\}/g, f ? "a" : "o")
            .replace(/\{do\}/g, f ? "da" : "do").replace(/\{no\}/g, f ? "na" : "no")
            .replace(/\{ele\}/g, f ? "ela" : "ele").replace(/\{n\}/g, outro);
  }
  (function montarRelacionamentos() {
    for (const [a, b, tipo, rotulo] of RELACOES) {
      for (const [de, para] of [[a, b], [b, a]]) {
        if (!personagens[de]) continue;                       // só quem tem conversa livre
        const mapa = relacionamentos[de] || (relacionamentos[de] = {});
        if (mapa[para]) continue;                             // preserva o que foi escrito à mão
        const lista = REL_ESPECIAIS[de + ">" + para] || (MODELOS_REL[tipo] || []).map(t => preencherModelo(t, para));
        if (lista.length) mapa[para] = { tipo: rotulo, respostas: lista, gerado: true };
      }
    }
  })();

  // Perguntas sobre o grupo: "quem é seu melhor amigo?", "de quem você desconfia?"
  function respostaGrupoRelacao(nome, pergunta) {
    const q = normalizar(pergunta), mapa = relacionamentos[nome] || {};
    const art = (n) => (GENERO[n] === "f" ? "a " : "o ") + n;
    const juntar = (ns) => ns.length < 2 ? ns.map(art).join("") : ns.slice(0, -1).map(art).join(", ") + " e " + art(ns[ns.length - 1]);
    const filtrar = (re) => Object.keys(mapa).filter(n => re.test(normalizar(mapa[n].tipo)));
    if (/(quem (e|sao) (seu|seus|sua|suas) (melhor|melhores|amigo|amigos|amiga|amigas|aliado|aliados)|melhor amig|amigo mais proximo|amiga mais proxima|em quem (voce )?confia|quem (voce )?(mais )?confia)/.test(q)) {
      const ns = filtrar(/(melhor|amig|aliad)/);
      if (!ns.length) return "Por enquanto, ninguém que eu chamaria de amigo de verdade.";
      return ns.length === 1 ? "Se eu tiver que escolher alguém, é " + art(ns[0]) + "." : "Os mais próximos de mim são " + juntar(ns) + ".";
    }
    if (/(de quem (voce )?(desconfia|nao gosta)|quem (voce )?(desconfia|nao gosta)|quem e (seu|sua) inimig|tem inimig|com quem (voce )?(nao se da|tem problema))/.test(q)) {
      const ns = filtrar(/(desconf|tensao|cautela)/);
      return ns.length ? "Com " + juntar(ns) + " eu fico com um pé atrás." : "Ninguém em especial. Pelo menos por enquanto.";
    }
    if (/(quem (te )?da medo|tem medo de (alguem|ninguem|quem)|de quem (voce )?tem medo)/.test(q)) {
      const ns = filtrar(/medo/);
      return ns.length ? "Se eu for sincera, " + art(ns[0]) + " me deixa tensa." : "Medo mesmo, de alguém em particular? Não.";
    }
    return null;
  }

  function respostaRelacionamento(nome, pergunta, hist) {
    const q = normalizar(pergunta);
    const perguntaOpiniao = /(o que (voce|vc) acha|que (voce|vc) acha|acha do|pensa sobre|o que pensa|como e|como eh|me fala sobre|fale sobre|opina sobre|qual sua relacao|qual e sua relacao|como voce se sente|confia|desconfia|tem medo|medo de|melhor amiga|amiga|gosta|sentimentos|apaixonad|interesse romantico|esta afim|ta afim|curte|ama|quem e|quem eh|e a|e o|e da|e do|sobre a|sobre o)/.test(q);
    const mapa = relacionamentos[nome] || {};
    let outro = Object.keys(mapa).find(n => q.includes(normalizar(n))), viaPronome = false;
    // Em perguntas curtas como "e ela?", recupera a pessoa mencionada no turno anterior.
    if (!outro && /^(e ela|e ele|e essa pessoa|e essa|e esse|por que|porque|como assim|me explica|fala mais|e sobre ela|e sobre ele)$/.test(q)) {
      const historico = (hist || []).filter(m => m.role === "user").slice().reverse();
      for (const item of historico) {
        const anterior = normalizar(item.content);
        outro = Object.keys(mapa).find(n => anterior.includes(normalizar(n)));
        if (outro) { viaPronome = true; break; }
      }
    }
    if (!outro) return null;
    // Só entra no assunto de relação quando a pergunta realmente parece tratar da pessoa.
    const nomeSozinho = new RegExp('^(e )?' + normalizar(outro) + '$').test(q);
    if (!viaPronome && !perguntaOpiniao && !nomeSozinho && !/(relacao|relacionamento|sentimento|gosta|confi|desconfi|medo|amiga|amigo|conhecid|neutro|apaixonad|afim|curte|ama|pensa|acha|fale|conta|sobre|quem e|quem eh)/.test(q)) return null;
    const rel = mapa[outro];
    if (!rel) return null;
    const perguntaSentimento = /(gosta|sentimentos|apaixonad|interesse romantico|esta afim|ta afim|curte|ama)/.test(q);
    const lista = perguntaSentimento && rel.perguntaDireta ? rel.perguntaDireta : rel.respostas;
    // Evita repetir a mesma frase sempre: alterna com base no histórico desta conversa.
    const respostasAnteriores = (hist || []).filter(m => m.role === "assistant" && normalizar(m.content).includes(normalizar(outro))).length;
    const indice = respostasAnteriores % lista.length;
    let resposta = lista[indice];
    if (nome === "Nathalia" && (hist || []).some(m => m.role === "user" && normalizar(m.content).includes(normalizar(outro)))) {
      const prefixos = {
        Veras: ["Como eu disse, ", "Você voltou a perguntar da Veras... ", "Ah, a Veras. "] ,
        Deriky: ["Você quer mesmo saber do Deriky? ", "Sobre ele de novo... ", "Bom, falando do Deriky... "] ,
        Isabela: ["Como eu estava dizendo, ", "Sobre a Isabela... ", "Ainda penso assim: "] ,
        Thaina: ["Quanto à Thaina, ", "Sobre ela... ", "Ainda não mudei de ideia: "]
      };
      const prefixo = prefixos[outro];
      if (prefixo && respostasAnteriores > 0) resposta = prefixo[respostasAnteriores % prefixo.length] + resposta.charAt(0).toLowerCase() + resposta.slice(1);
    }
    return { texto: resposta, gerado: !!rel.gerado, outro };
  }

  function respostaRelatoNathalia(pergunta, hist) {
    const original = String(pergunta || "").trim();
    const q = normalizar(original);
    if (!q || /[?¿]/.test(original)) return null;
    const mapa = relacionamentos.Nathalia || {};
    const nomes = Object.keys(mapa);
    const ultimoNome = () => {
      const turnos = (hist || []).filter(m => m.role === "user").slice().reverse();
      for (const item of turnos) {
        const anterior = normalizar(item.content || "");
        const achado = nomes.find(n => new RegExp("(^|\\s)" + normalizar(n) + "($|\\s)").test(anterior));
        if (achado) return achado;
      }
      return null;
    };
    const nome = nomes.find(n => new RegExp("(^|\\s)" + normalizar(n) + "($|\\s)").test(q));
    const verboRelato = /\b(falei com|conversei com|tava conversando com|estava conversando com|conversava com|falei sobre|conversei sobre|troquei ideia com|estava falando com|tava falando com|encontrei|vi o|vi a|ele me contou|ela me contou|ele disse|ela disse|a gente foi|nos fomos|depois eu falo com|depois converso com|vou falar com|vou conversar com)\b/.test(q);
    if (nome && verboRelato) {
      const sobre = q.match(/\bsobre\s+(.+)$/);
      if (sobre && !/^(ele|ela|isso|aquilo)$/.test(sobre[1].trim())) {
        const assunto = sobre[1].trim().replace(/[.!]+$/, "");
        const respostas = [
          "Ah, entendi! Vocês estavam falando sobre " + assunto + "? Como foi essa conversa?",
          "Sério? E o que você achou desse assunto?",
          "Ah, legal. E vocês chegaram a alguma conclusão sobre " + assunto + "?"
        ];
        const n = (hist || []).filter(m => m.role === "assistant" && /como foi essa conversa|o que voce achou desse assunto|alguma conclusao sobre/i.test(normalizar(m.content || ""))).length;
        return respostas[n % respostas.length];
      }
      if (/depois eu falo com|depois converso com|vou falar com|vou conversar com/.test(q)) {
        return "Tudo bem. Quando vocês conversarem, se quiser, depois me conta como foi.";
      }
      return "Ah, você conversou com " + nome + "? Como foi? Sobre o que vocês falaram?";
    }
    const pessoaAnterior = ultimoNome();
    if (pessoaAnterior && /\b(ele|ela) me contou (uma coisa|algo|um segredo)|\b(ele|ela) disse que|\b(ele|ela) me falou|\b(a gente|nos) foi ate la|\b(a gente|nos) foi|\bdepois eu falo com ele|\bdepois eu falo com ela|\bvou falar com ele|\bvou falar com ela/.test(q)) {
      if (/me contou (uma coisa|algo|um segredo)|me falou/.test(q)) return "Sério? O que " + (q.includes("ela") ? "ela" : "ele") + " te contou? Agora fiquei curiosa.";
      if (/disse que/.test(q)) return "Ah, é? E o que " + (q.includes("ela") ? "ela" : "ele") + " disse?";
      if (/foi ate la|a gente foi|nos foi/.test(q)) return "Ah, vocês foram até lá? Como foi por lá?";
      return "Entendi. Depois você me conta como foi a conversa com " + pessoaAnterior + ", se quiser.";
    }
    if (/\b(a gente foi ate la|nos fomos ate la|a gente foi|nos fomos)\b/.test(q)) {
      return "Ah, vocês foram até lá? Como foi por lá?";
    }
    return null;
  }

  // =====================================================================
  //  ITEM 1 — PERFIL DE VOZ POR PERSONAGEM (dados; editável sem mexer na lógica)
  //  maxFrases  : quantas frases a pessoa costuma falar de uma vez
  //  contracao  : 0 = fala formal | 1 = "pra, tô, tá" | 2 = também "cê"
  //  probReacao / probAcao / probVolta : chance (0 a 1) de cada camada aparecer
  //  pensa  : reações antes de informar     acolhe : reações a medo/tristeza/cansaço
  //  ri     : reações a risada               acoes  : gestos entre *asteriscos*
  //  voltas : perguntas de volta             voltasEmocao : perguntas de volta quando a Dellalos está mal
  //  voltasRel : perguntas de volta quando o assunto é uma pessoa
  //  repete : o que diz quando a Dellalos pergunta a mesma coisa de novo
  // =====================================================================
  const VOZES = {
    Nathalia: { maxFrases:3, contracao:1, probReacao:.45, probAcao:.22, probVolta:.50,
      pensa:["Hmm...","Deixa eu pensar...","Bom...","Então..."],
      acolhe:["Ei, calma.","Entendo, de verdade.","Respira um pouco."],
      ri:["Haha, do que você tá rindo?","*ri baixinho* Ok, agora fiquei curiosa."],
      acoes:["*ajeita o cabelo atrás da orelha*","*olha em volta*","*fala mais baixo*"],
      voltas:["E você, o que achou disso?","Você reparou em mais alguma coisa?","Por que perguntou? Desconfiou de algo?"],
      voltasEmocao:["Quer me contar o que aconteceu?","Foi alguma coisa que você viu hoje?"],
      voltasRel:["Por que a pergunta?","E você, o que acha?"],
      repete:["Já te falei isso, lembra? Se não ficou claro, me diz qual parte.","Você já me perguntou isso. Tem alguma parte que ficou confusa?"] },
    Millena: { maxFrases:3, contracao:2, probReacao:.50, probAcao:.25, probVolta:.55,
      pensa:["Ai, deixa eu ver...","Então...","Hmm.","Olha..."],
      acolhe:["Ah, vem cá.","Eu sei, tá difícil.","Ei, tô aqui."],
      ri:["Haha! Do que você tá rindo?","*ri* Agora quero saber o motivo."],
      acoes:["*sorri*","*balança a cabeça*","*se aproxima um pouco*"],
      voltas:["E você, como tá lidando com tudo isso?","Quer que eu vá junto olhar?","Você já falou com mais alguém?"],
      voltasEmocao:["Quer me contar o que aconteceu?","Quer que eu fique aqui com você um pouco?"],
      voltasRel:["Por que a pergunta? Aconteceu alguma coisa?","E você, o que acha?"],
      repete:["Hehe, já te falei isso! Ficou alguma dúvida?","Eu já contei isso, lembra? Quer que eu explique de outro jeito?"] },
    Lucas: { maxFrases:2, contracao:1, probReacao:.35, probAcao:.25, probVolta:.35,
      pensa:["Hm.","Olha.","Certo.","Vou ser direto."],
      acolhe:["Respira.","Ei. Fica firme.","Tá tudo bem sentir isso."],
      ri:["*quase sorri* O que foi?","Hm. Tá rindo de quê?"],
      acoes:["*cruza os braços*","*encara o chão por um segundo*","*dá de ombros*"],
      voltas:["E você? Tá preparada?","Já treinou hoje?","O que você vai fazer?"],
      voltasEmocao:["Quer falar sobre isso?","Quer espairecer treinando um pouco?"],
      voltasRel:["Por que quer saber?","E você, confia?"],
      repete:["Já falei. Não tenho mais nada a acrescentar.","Já respondi isso."] },
    Isabela: { maxFrases:3, contracao:0, probReacao:.50, probAcao:.30, probVolta:.50,
      pensa:["Hm... interessante.","Ora, ora.","Veja só.","Curioso."],
      acolhe:["Medo... interessante.","Hm. Isso é humano, afinal.","Ah, querida."],
      ri:["*sorri de canto* Algo te diverte?","Hm. Gosto de quem ainda consegue rir."],
      acoes:["*sorri de canto*","*inclina a cabeça*","*mexe no cabelo devagar*"],
      voltas:["E por que quer saber, Dellalos?","Você acha mesmo que está pronta?","Diga... o que você faria no meu lugar?"],
      voltasEmocao:["O que exatamente te assusta?","Quer me contar? Posso ser boa ouvinte... às vezes."],
      voltasRel:["E por que quer saber, Dellalos?","O que você acha? Seja sincera."],
      repete:["Você se repete, Dellalos... e eu não vou mudar a resposta.","Já ouviu minha resposta. Insistir não muda nada."] },
    Thaina: { maxFrases:1, contracao:1, probReacao:.35, probAcao:.30, probVolta:.25,
      pensa:["...","Hm.","Olha..."],
      acolhe:["...Eu sei.","Hm. Calma.","Senta aí um pouco."],
      ri:["*quase sorri* ...Que foi?","Hm. Do que você tá rindo?"],
      acoes:["*desvia o olhar*","*dá de ombros*","*fica quieta por um instante*"],
      voltas:["E você?","Por quê?","...Por que quer saber?"],
      voltasEmocao:["Quer falar?","Aconteceu alguma coisa?"],
      voltasRel:["Por quê?","E você?"],
      repete:["Já falei.","...Já respondi isso."] },
    Deriky: { maxFrases:3, contracao:1, probReacao:.40, probAcao:.25, probVolta:.45,
      pensa:["Hm.","Escuta.","Olha só.","Vou te falar uma coisa."],
      acolhe:["Calma.","Isso é normal nesta cidade.","Respira. Um passo de cada vez."],
      ri:["*dá um meio sorriso* Que bom que ainda dá pra rir.","Hm. Ainda bem que alguém consegue rir."],
      acoes:["*olha para os lados*","*abaixa a voz*","*coça a nuca*"],
      voltas:["O que você viu até agora?","Conseguiu alguma prova?","Com quem mais você falou?"],
      voltasEmocao:["O que te deixou assim?","Aconteceu alguma coisa na rua?"],
      voltasRel:["Por que quer saber?","E você, o que acha?"],
      repete:["Já te disse o que sei. Se quer mais, traga provas.","Repetir a pergunta não muda o que eu sei."] },
    Simon: { maxFrases:3, contracao:2, probReacao:.50, probAcao:.25, probVolta:.50,
      pensa:["Cara...","Então...","Bom, vou ser sincero...","Hm, deixa eu ver."],
      acolhe:["Ei, tranquilo.","Ô, respira.","Relaxa, tá todo mundo meio assim."],
      ri:["Haha, que foi?","*ri curto* Tá rindo de quê?"],
      acoes:["*coça a cabeça*","*dá uma risada curta*","*enfia as mãos nos bolsos*"],
      voltas:["E aí, o que você acha?","Tá sabendo de mais alguma coisa?","E você, tá bem?"],
      voltasEmocao:["Quer conversar sobre isso?","Rolou alguma coisa?"],
      voltasRel:["Por que a pergunta?","E você, tá sabendo de algo?"],
      repete:["Cara, já te falei isso! Rs.","Já te contei isso, lembra? Se tem outra dúvida, manda."] }
  };

  // =====================================================================
  //  ITEM 3 — NÍVEL DE AMIZADE (js/amizade.js) MUDA O JEITO DE FALAR
  //  Faixas: "baixo" = níveis 1-2 (ou ainda não se conhecem) · normal = nível 3 (voz base de VOZES)
  //          "alto"  = níveis 4-5. Quem não está em AMIGOS (Deriky e Simon) mantém a voz base.
  //  Cada faixa pode trocar: saudacao, pensa, acolhe, voltas, maxFrases, contracao (e baixo.segredo).
  //  amizade : resposta a "somos amigos?" / "você confia em mim?" por nível (1 a 5)
  //  comp    : falas quando o personagem é o COMPANHEIRO ativo da Dellalos
  // =====================================================================
  const CALOR = {
    Nathalia: {
      baixo: { saudacao:["Oi. Tudo bem?","Oi... a gente já se falou, né?"], pensa:["Hmm...","Bom..."], voltas:["Por que você quer saber?","Como você chegou nisso?"], acolhe:["Sinto muito.","Entendo."], segredo:"A gente ainda se conhece pouco. Prefiro guardar algumas coisas por enquanto." },
      alto:  { saudacao:["Dellalos! Que bom te ver. Tava torcendo pra você aparecer.","Oi! Ainda bem que você veio, tinha um monte de coisa na minha cabeça."], pensa:["Olha...","Entre nós...","Hmm..."], voltas:["E você, como tá de verdade?","Me conta o que você tá pensando disso.","Quer que eu vá com você?"], acolhe:["Ei, vem cá. Eu tô aqui.","Respira comigo, tá?","Você não precisa passar por isso sozinha."], contracao:2 },
      amizade:["Mal nos conhecemos. É cedo pra eu dizer isso.","A gente tá se conhecendo. Gosto de você até agora.","Acho que somos amigas, sim. Confio mais em você a cada dia.","Somos muito amigas. Pode contar comigo pro que for.","Você é uma das pessoas mais importantes pra mim aqui. Confio em você de olhos fechados."],
      confia:{ baixo:"Confiança leva tempo. Ainda não te conheço o bastante.", medio:"Confio mais do que confiava no começo. Continua assim.", alto:"Confio, sim. Você me mostrou que dá pra confiar." },
      comp:["Tô aqui do seu lado, lembra?","Vou ficar de olho em tudo por você."] },
    Millena: {
      baixo: { saudacao:["Oi! Tudo bem? Pode falar comigo.","Oi! A gente ainda tá se conhecendo, né? Fica à vontade."], pensa:["Hmm...","Então..."], voltas:["E você, tá se adaptando bem?","Posso ajudar em mais alguma coisa?"], acolhe:["Ah, sinto muito.","Eu entendo, tá sendo difícil."], segredo:"A gente se conhece há pouco tempo, mas quem sabe um dia eu te conto." },
      alto:  { saudacao:["Dellalos! Eu tava com saudade! Senta aqui comigo.","Aí está ela! Já ia te procurar."], pensa:["Amiga, olha...","Entre nós duas...","Posso ser sincera?"], voltas:["E como você tá, de verdade?","Quer que eu vá junto olhar?","Me conta tudo, vai!"], acolhe:["Ah, amiga, vem cá. Eu tô aqui.","Ei, você não tá sozinha. Tô contigo.","Respira. Eu cuido de você."] },
      amizade:["A gente mal se conhece, mas já gosto de você.","Acho que já somos colegas! Gosto de conversar com você.","Somos amigas, sim! Pode contar comigo.","Somos muito amigas. Você me faz sentir em casa aqui.","Você é minha melhor amiga de verdade. Confio em você de olhos fechados."],
      confia:{ baixo:"Ainda tô te conhecendo, mas até agora você parece uma pessoa legal.", medio:"Confio, sim! Você ganhou isso comigo.", alto:"Confio em você de olhos fechados, amiga." },
      comp:["Tô do seu lado, viu?","Se você se machucar, eu cuido de você!"] },
    Lucas: {
      baixo: { saudacao:["Fala.","Oi. O que você precisa?"], pensa:["Hm.","Certo."], voltas:["Por que quer saber?"], acolhe:["Sinto muito.","Hm. Fica firme."], segredo:"Não costumo contar nada pra quem acabei de conhecer." },
      alto:  { saudacao:["E aí, parceira. Tudo certo?","Fala, Dellalos. Bom te ver."], pensa:["Olha, parceira...","Entre nós...","Certo."], voltas:["E você, tá aguentando firme?","Quer treinar um pouco depois?","Precisa de mim?"], acolhe:["Ei. Eu tô contigo.","Respira. A gente resolve isso junto."], contracao:2 },
      amizade:["A gente mal se conhece. Confiança vem com o tempo.","Tamo se conhecendo. Até agora você me parece gente boa.","Somos amigos, sim. Você já provou que merece.","Pode contar comigo. Eu não falo muito, mas apareço.","Confio em você. E eu quase não digo isso."],
      confia:{ baixo:"Confiança se conquista. Ainda não deu tempo.", medio:"Confio. Mas continuo de olho, é meu jeito.", alto:"Confio. Pode apostar nisso." },
      comp:["Tô na sua cobertura.","Fica tranquila, eu tô por perto."] },
    Isabela: {
      baixo: { saudacao:["Olá. Em que posso ajudar?","Ora... aparece e fala comigo. Curioso."], pensa:["Hm.","Veja..."], voltas:["Por que quer saber?","E por que isso te interessa?"], acolhe:["Hm. Sinto muito.","Isso passa... eventualmente."], segredo:"Segredos não se entregam a quem acabei de conhecer." },
      alto:  { saudacao:["Dellalos... que bom te ver.","Ora, você veio. Eu esperava que viesse."], pensa:["Hm, querida...","Ora...","Veja só..."], voltas:["E você, em que acredita de verdade?","Confia em mim, não confia?","Me diga o que você sente sobre isso."], acolhe:["Ah, querida... venha cá.","Você não está sozinha, sabe? Eu estou aqui."] },
      amizade:["Ainda não nos conhecemos o bastante para essa pergunta.","Temos uma curiosidade mútua. Vamos ver onde isso dá.","Sim, eu confio em você mais do que em muita gente.","Somos amigas, Dellalos. Já devia estar claro.","Eu fico do seu lado. Sem perguntas."],
      confia:{ baixo:"Confiança? Ainda não. Mas continue me surpreendendo.", medio:"Confio mais do que deveria, talvez. Não se acostume.", alto:"Sim, Dellalos. Mais do que em quase todo mundo." },
      comp:["Estou logo atrás de você.","Eu cubro você de longe."] },
    Thaina: {
      baixo: { saudacao:["Oi.","...Oi."], pensa:["...","Hm."], voltas:["Por quê?"], acolhe:["...Sinto muito.","Hm."], segredo:"Não falo disso." },
      alto:  { saudacao:["Oi. ...Que bom que você veio.","Oi, Dellalos. Fico feliz de ver você."], pensa:["Hm.","...Olha."], voltas:["E você tá bem?","Quer que eu fique por perto?"], acolhe:["...Tô aqui.","Senta aqui. Eu fico com você."], maxFrases:2 },
      amizade:["Não sei. Não costumo responder isso.","...Você é diferente dos outros. Ainda não sei se é bom.","Confio um pouco em você. É raro.","Somos amigas. Isso é raro pra mim.","Fico com você. Sempre."],
      confia:{ baixo:"Não. Ainda não.", medio:"Um pouco.", alto:"Confio. Pode acreditar." },
      comp:["Fico perto.","Eu cubro você."] }
  };

  function nivelAmizade(nome) {
    try {
      if (typeof AMIGOS === "undefined" || !AMIGOS[nome] || typeof amizadeNivel !== "function") return null;
      if (typeof conhecePersonagem === "function" && !conhecePersonagem(nome)) return 1;
      return amizadeNivel(nome);
    } catch (_) { return null; }
  }
  function faixaAmizade(nome) { const n = nivelAmizade(nome); return n === null ? null : n <= 2 ? "baixo" : n >= 4 ? "alto" : null; }
  function calorDe(nome) { const f = faixaAmizade(nome); return f && CALOR[nome] ? CALOR[nome][f] : null; }
  function eCompanheiro(nome) { try { return typeof AM === "function" && AM().comp === nome; } catch (_) { return false; } }
  // Falas de nível 3 a 5 que a Dellalos JÁ OUVIU no jogo viram "confidências" na conversa livre (sem spoiler, sem texto inventado)
  function confidencias(nome, nivel) {
    const out = [];
    try {
      const A = AMIGOS[nome], visto = Number(AM().visto[nome]) || 0;
      for (let lv = 3; lv <= 5; lv++) {
        if (lv > nivel || lv > visto || !A.falas || !A.falas[lv]) continue;
        const linhas = []; for (const l of A.falas[lv]) { if (/^D:/.test(l)) break; linhas.push(l); }
        if (linhas.length) out.push(linhas.join(" "));
      }
    } catch (_) {}
    return out;
  }
  function respostaSegredo(nome) {
    const nivel = nivelAmizade(nome), cal = CALOR[nome];
    if (nivel === null || !cal) return null;
    if (nivel <= 2) return { texto: cal.baixo.segredo, tipo: "topico" };
    const confs = confidencias(nome, nivel);
    if (!confs.length) return { texto: escolher(["Tem coisa que ainda não é hora de contar. Mas vai chegar.","Ainda tem coisa que eu guardo. Quando for a hora, você vai saber."], nome + ":semSegredo"), tipo: "topico" };
    const intro = VOZES[nome].maxFrases >= 3 ? escolher(["Posso te contar uma coisa.","Isso fica entre nós.","Já que somos próximos..."], nome + ":introSegredo") : "";
    return { texto: escolher(confs, nome + ":confidencia"), tipo: "confidencia", intro };
  }
  function respostaAmizadeJogador(nome, q) {
    const nivel = nivelAmizade(nome), cal = CALOR[nome];
    if (nivel === null || !cal) return null;
    if (!/(somos amig|voce (e|eh) (minha |meu )?amig|gosta de mim|confia em mim|o que (voce )?(acha|pensa) de mim|somos proxim|somos colegas|me considera)/.test(q)) return null;
    if (/confia/.test(q) && cal.confia) return { texto: cal.confia[nivel <= 2 ? "baixo" : nivel >= 4 ? "alto" : "medio"], tipo: "topico" };
    return { texto: cal.amizade[nivel - 1], tipo: "topico" };
  }

  // ---------------------------------------------------------------------
  //  Sorteio com anti-repetição: nunca repete as últimas opções de cada lista
  // ---------------------------------------------------------------------
  const usados = {};
  function escolher(lista, chave) {
    if (!lista || !lista.length) return "";
    if (lista.length === 1) return lista[0];
    const rec = usados[chave] || (usados[chave] = []);
    let opcoes = lista.filter(x => !rec.includes(x));
    if (!opcoes.length) {
      const ultimo = rec[rec.length - 1];
      rec.length = 0; if (ultimo !== undefined) rec.push(ultimo);
      opcoes = lista.filter(x => !rec.includes(x));
    }
    const pick = opcoes[Math.floor(Math.random() * opcoes.length)];
    rec.push(pick);
    while (rec.length > Math.min(3, lista.length - 1)) rec.shift();
    return pick;
  }

  // ---------------------------------------------------------------------
  //  Ferramentas de fala: cortar em frases e informalizar o texto
  // ---------------------------------------------------------------------
  function cortarFrases(texto, max) {
    const frases = String(texto).match(/[^.!?…]+(?:[.!?…]+|$)\s*/g);
    if (!frases || frases.length <= max) return String(texto).trim();
    return frases.slice(0, max).join("").trim();
  }
  function trocarPalavra(texto, de, para) {
    const re = new RegExp("(^|[^\\p{L}])(" + de + ")(?![\\p{L}])", "giu");
    return texto.replace(re, (m, pre, achada) => pre + (achada[0] !== achada[0].toLowerCase() ? para[0].toUpperCase() + para.slice(1) : para));
  }
  function informalizar(texto, nivel) {
    if (!nivel) return texto;
    let t = texto;
    t = trocarPalavra(t, "para", "pra");
    t = trocarPalavra(t, "estou", "tô");
    t = trocarPalavra(t, "está", "tá");
    t = trocarPalavra(t, "estava", "tava");
    if (nivel >= 2) t = trocarPalavra(t, "você", "cê");
    return t;
  }
  function detectarTom(q) {
    if (/\b(k{2,}|(ha){2,}|(he){2,}|(rs){2,})\b/.test(q)) return "riso";
    if (/(medo|assustad|triste|cansad|preocupad|nervos|ansios|sozinh|desesper|me sinto mal|to mal|estou mal|nao aguento|chorar|chorando)/.test(q)) return "emocao";
    return "neutro";
  }

  // =====================================================================
  //  ITEM 2 — RESPOSTA EM CAMADAS
  //  [gesto] + [reação] + [conteúdo cortado e informalizado] + [pergunta de volta]
  //  respostaBase decide O QUE dizer; montar decide COMO a pessoa diz.
  //  Respostas "fixas" (relações da Nathalia/Deriky, memória, relatos) já foram
  //  escritas à mão e passam direto, sem camadas extras.
  // =====================================================================
  // =====================================================================
  //  ITEM 5 — PAPO HUMANO: elogio, insulto, despedida, "ok/aham", surpresa,
  //  "como você tá?", alegria, desculpas e perguntas pessoais (medo, hobby, idade, romance, "você é real?").
  //  As falas pessoais (medo, gosto, idade, romance) são genéricas e evitam inventar história:
  //  troque pelas verdadeiras quando quiser. (A Nathalia teme o Durval, como na tabela de relações.)
  //  insulto = 3 degraus: o personagem se firma a cada insulto seguido; um pedido de desculpas reseta.
  // =====================================================================
  const PAPO = {
    Nathalia: { elogio:["Ah... obrigada. Fiquei sem graça agora.","*sorri sem jeito* Você também é legal, sabia?"], insulto:["Ei, isso doeu. Se tá nervosa, pode falar comigo normal.","Eu não mereço isso. Respira e tenta de novo.","Prefiro parar por aqui até você se acalmar."], despedida:["Até mais! Se cuida, tá?","Tchau! Qualquer coisa, me procura."], ack:["Aham.","Certo!","Tá."], confirma:["Sério, sim.","É isso mesmo, acredita."], estado:["Tô bem, só com a cabeça cheia. E você?","Mais ou menos... tem muita coisa pra pensar. E você, como tá?"], feliz:["Que bom! Você merece um dia assim.","Fico feliz de verdade por você!"], desculpa:["Tá tudo bem. Esquece isso.","Tudo bem, eu entendo. Vamos recomeçar."], semDesculpa:["Desculpa pelo quê? Tá tudo bem."], medo:["Do Durval. Só de ouvir esse nome, eu fico tensa.","Do que a gente ainda não sabe. E do Durval."], gosto:["Gosto de observar o que os outros não percebem. É tipo um quebra-cabeça.","Notar detalhes. É meu passatempo favorito."], idade:["Idade? Velha o bastante pra desconfiar de muita coisa.","Por que quer saber minha idade? Haha."], romance:["*cora* Ei! Isso... isso é assunto meu.","Nossa, que pergunta! Não tenho nada pra contar sobre isso."], real:["Real? Que pergunta estranha... claro que sou.","Tá me testando? Eu tô bem aqui."] },
    Millena: { elogio:["Ai, obrigada! Você também é demais!","Aww, você é um amor! Fiquei toda boba."], insulto:["Ei, isso machucou! Se tiver chateada, conversa comigo.","Não precisa falar assim comigo, tá?","Vou dar um tempo, mas a gente conversa depois, quando você estiver melhor."], despedida:["Tchau, amiga! Se cuida!","Até logo! Vou ficar torcendo por você."], ack:["Aham!","Isso aí!","Beleza!"], confirma:["Sério! Juro.","Pois é, nem eu acreditei!"], estado:["Tô bem! Cansada, mas bem. E você, como tá?","Mais ou menos, mas melhoro quando converso com você. E você?"], feliz:["Que notícia boa! Fiquei feliz por você!","Aaah, que bom! Assim eu fico feliz também!"], desculpa:["Tá tudo bem, amiga. Já passou.","Tudo bem! Eu entendo. Bola pra frente."], semDesculpa:["Desculpa pelo quê, amiga? Tá tudo bem!"], medo:["De perder as pessoas que eu gosto. Só de pensar já aperta.","De ficar sozinha. Por isso valorizo tanto quem tá por perto."], gosto:["Gosto de ajudar os outros e de bater um papo. Me faz bem.","Conversar e cuidar das pessoas. Sou meio assim."], idade:["Ihh, mulher não fala idade! Haha.","Uma moça nunca revela. Brincadeira... só não ligo pra isso."], romance:["Haha, que pergunta! Por enquanto tô focada em tudo isso aqui.","Ai, Dellalos, vai me deixar vermelha! Não tenho nada pra contar."], real:["Real? Claro que sou, boba!","Hahaha, que pergunta! Pode me beliscar se quiser."] },
    Lucas: { elogio:["Hm. Valeu.","Não precisa disso. Mas valeu."], insulto:["Fala direito comigo.","Já chega. Respeito é de mão dupla.","Acabou a conversa até você se acalmar."], despedida:["Falou.","Até. Se cuida."], ack:["Ok.","Certo.","Hm."], confirma:["Sim, sério.","É isso."], estado:["Tô de pé. Isso já é muito. E você?","Tranquilo. Sempre tem o que fazer. E você?"], feliz:["Bom. Aproveita.","Que bom. Merece."], desculpa:["Tá. Esquece isso.","Sem problema. Segue."], semDesculpa:["Pelo quê?"], medo:["Não gosto de falar de medo. Mas perder gente em quem eu confio é o pior.","Falhar com quem depende de mim."], gosto:["Treinar. Me ajuda a pensar.","Treinar e ficar quieto. Sem mistério."], idade:["Idade não ajuda em nada aqui.","Isso importa pra quê?"], romance:["Isso é pessoal.","Não vou falar disso."], real:["Tá falando o quê? Claro que sou real.","Que pergunta é essa?"] },
    Isabela: { elogio:["Que gentil... Eu não esperava isso de você.","Elogios... eu os guardo, sabe."], insulto:["Palavras fortes. Espero que tenha ganhado algo com elas.","Cuidado, Dellalos. Eu esqueço pouca coisa.","Esta conversa termina aqui, por enquanto."], despedida:["Até logo, Dellalos. Cuidado por aí.","Vá. Nos veremos... em breve."], ack:["Hm.","Compreendo.","Certo."], confirma:["Absolutamente.","Sim. Surpreendente, não?"], estado:["Bem. Observando, como sempre. E você?","Controlada. É o que importa. E você?"], feliz:["Que bom. Raro por aqui... aproveite.","Fico contente por você. Genuinamente."], desculpa:["Aceito. Não vou repetir o assunto.","Está esquecido... por ora."], semDesculpa:["Desculpas... por quê, exatamente?"], medo:["Não costumo responder isso. Medo é uma informação valiosa demais.","Quem revela seus medos entrega a chave. Prefiro guardar."], gosto:["Observar pessoas. É um passatempo e tanto.","Silêncio e boa companhia. Poucas, mas boas."], idade:["Uma dama nunca diz.","Idade é um detalhe irrelevante."], romance:["Que pergunta ousada, Dellalos... Não tenho nada a declarar.","Isso eu não discuto. Nem com você."], real:["Real? Uma pergunta interessante... Acredite no que quiser.","Sou tão real quanto este lugar. Tire suas conclusões."] },
    Thaina: { elogio:["...Obrigada.","Hm. Valeu."], insulto:["...Isso não precisava.","Chega.","Não falo mais com você assim."], despedida:["Tchau.","Até."], ack:["Hm.","...Ok.","Aham."], confirma:["Sim.","É."], estado:["Tô. E você?","Quieta. Como sempre. E você?"], feliz:["Que bom.","Fico feliz."], desculpa:["...Tá.","Esquece."], semDesculpa:["Pelo quê?"], medo:["Não falo disso.","Perder quem importa."], gosto:["Ficar quieta.","Observar. Em silêncio."], idade:["Isso não importa.","...Por quê?"], romance:["Não.","Isso não é da sua conta."], real:["...Sou.","Que pergunta é essa?"] },
    Deriky: { elogio:["Hm. Agradeço. Mas fique atenta, não é hora de baixar a guarda.","Obrigado. Procuro fazer o que é certo."], insulto:["Isso não ajuda ninguém.","Controle-se. Estamos todos sob pressão.","Conversamos depois, quando você se acalmar."], despedida:["Cuidado por aí.","Até mais. Fique atenta."], ack:["Certo.","Hm.","Entendido."], confirma:["Sim. Infelizmente.","É isso mesmo."], estado:["Vivo e atento. E você?","Alerta. É o que dá pra ser. E você?"], feliz:["Que bom. Aproveite enquanto dá.","Fico contente. Poucos têm motivo hoje."], desculpa:["Tudo bem. Já passou.","Aceito. Vamos adiante."], semDesculpa:["Pelo quê? Não houve nada."], medo:["De errar de novo e custar caro a alguém.","De não conseguir proteger quem importa."], gosto:["Caminhar e pensar. Me ajuda a manter a cabeça fria.","Silêncio e chá. Não é muito, mas me basta."], idade:["Já vivi o bastante pra desconfiar de rumores.","Idade não muda o que precisa ser feito."], romance:["Esse não é um assunto para agora.","Prefiro não falar disso."], real:["Real o bastante pra me preocupar com você.","Que pergunta estranha. Sim."] },
    Simon: { elogio:["Haha, valeu! Agora vou ficar convencido.","Opa, assim eu fico sem graça! Valeu!"], insulto:["Ei, calma aí! Não precisa disso.","Cara... não precisa falar assim.","Vou ficar quieto um tempo, tá? Depois a gente conversa."], despedida:["Falou! Se cuida!","Até mais! Qualquer coisa, grita."], ack:["Beleza!","Show.","Aham."], confirma:["Sério! Juro.","Pois é, nem eu acreditei."], estado:["Tô de boa! E você?","Vivendo, né? Tá osso, mas segue. E você?"], feliz:["Boa! Fico feliz por você!","Opa, que bom! Comemora aí!"], desculpa:["De boa! Já passou.","Tranquilo. Bola pra frente."], semDesculpa:["Desculpa de quê? Tá de boa!"], medo:["De decepcionar quem confia em mim, acho.","De nada voltar a ser como era."], gosto:["Zoar o Lucas e bater papo. O básico!","Papo furado e petiscar uma coisa boa."], idade:["Ihh, essa eu não conto! Haha.","Velho demais pra correr, novo demais pra reclamar."], romance:["Haha, tá curiosa, hein? Sem nada pra contar!","Uuuh, que pergunta! Não tenho nada a dizer."], real:["Real? Claro que sou, ué!","Haha, pode me cutucar pra conferir!"] }
  };
  const insultos = {};   // quantos insultos seguidos cada personagem já ouviu nesta sessão
  const SEM_GESTO = new Set(["insulto","desculpa","semDesculpa","ack","confirma","despedida"]);
  const PADROES_PAPO = [
    ["desculpa", /^(me )?(desculp|perdao|perdoa|foi mal|sinto muito)/],
    ["insulto", /\b(idiota|burr[ao]|estupid[ao]|babaca|imbecil|inutil|cala a boca|cale a boca|odeio voce|te odeio|vai se ferrar|vai se lascar|ridicul[ao])\b/],
    ["elogio", /(voce (e|eh) (muito |super |tao )?(legal|incrivel|fofa|fofo|forte|corajos[ao]|inteligente|bonit[ao]|demais|otim[ao]|a melhor|o melhor)|gosto de voce|te acho (muito )?(legal|incrivel|demais|fofa|fofo)|adoro voce|voce arrasa|gostei de voce|voce manda bem)/],
    ["despedida", /^(tchau|xau|ate (mais|logo|amanha|depois|a proxima)|vou nessa|falou|flw|fui)\b|(tenho que ir|preciso ir|vou embora|vou sair)/],
    ["ack", /^(ok|okay|ta|ta bom|certo|entendi|entendido|beleza|blz|sei|hum|hmm|uhum|aham|ah|ah ta|ah entendi|show|legal|massa|boa|combinado|firmeza)$/],
    ["confirma", /^(serio|serio mesmo|jura|mentira|nossa|caramba|uau|sem chance|nao acredito|e mesmo|verdade)$/],
    ["estado", /(como (voce )?(esta|ta|vai|anda|se sente)|tudo bem com voce|como foi seu dia)|^e (voce|vc|contigo)$/],
    ["feliz", /(estou|to|me sinto|fiquei) (muito |super )?(feliz|animad[ao]|contente|aliviad[ao]|empolgad[ao]|bem)/],
    ["medo", /(do que (voce )?tem medo|voce tem medo|qual (e )?(o )?seu medo)/],
    ["gosto", /(o que (voce )?gosta de fazer|passatempo|hobby|tempo livre)/],
    ["idade", /(quantos anos|qual (e )?(a )?sua idade|sua idade)/],
    ["romance", /(namorad|crush|gosta de alguem|apaixonad|ficando com alguem|interesse romantic|quem voce ama)/],
    ["real", /(voce (e|eh) (um |uma )?(robo|ia|inteligencia artificial|programa|personagem|de verdade|real|humano|humana))/]
  ];
  function respostaPapo(nome, q) {
    const P = PAPO[nome]; if (!P) return null;
    const palavras = q.split(" ").filter(Boolean).length;
    for (const [chave, re] of PADROES_PAPO) {
      if (!re.test(q)) continue;
      if (chave === "desculpa" && palavras > 4) continue;           // "desculpa, mas e a seita?" segue para os temas
      let texto;
      if (chave === "insulto") { const n = insultos[nome] = (insultos[nome] || 0) + 1; texto = P.insulto[Math.min(n, 3) - 1]; }
      else if (chave === "desculpa") {
        if (insultos[nome] > 0) { insultos[nome] = 0; texto = escolher(P.desculpa, nome + ":papo:desculpa"); }
        else texto = escolher(P.semDesculpa, nome + ":papo:semDesculpa");
      } else texto = escolher(P[chave], nome + ":papo:" + chave);
      return { texto, tipo: "papo", semGesto: SEM_GESTO.has(chave) };
    }
    return null;
  }

  const ehPapo = (q) => PADROES_PAPO.some(([, re]) => re.test(q));

  // =====================================================================
  //  ITEM 4 — MEMÓRIA DE FATOS (guardada no aparelho, por personagem)
  //  Em vez de repetir frases soltas, cada personagem guarda ASSUNTOS (a seita, o túnel...),
  //  PESSOAS que a Dellalos perguntou e FATOS que ela contou (onde foi, o que achou/comprou,
  //  o que gosta, com quem falou, como se sentiu). Depois ele(a):
  //   • responde "você lembra do que eu falei?" resumindo o que sabe;
  //   • às vezes retoma um fato antigo ("Você tinha dito que foi na loja. Como foi lá?"),
  //     no máximo 1 vez por fato e só depois de algumas mensagens, para não parecer vigilância.
  // =====================================================================
  const MEMORIA_VOZ = {
    Nathalia: { abre:["Lembro, sim.","Claro que lembro."], vazio:["Ainda não conversamos muito. Pode me contar, que eu guardo."], fecha:["Qual desses assuntos você quer retomar?","Tem mais alguma coisa que você lembra?"] },
    Millena:  { abre:["Lembro sim, amiga!","Claro que lembro!"], vazio:["A gente ainda mal conversou! Me conta mais coisas, vai."], fecha:["Quer continuar de onde paramos?","Quer falar mais disso?"] },
    Lucas:    { abre:["Lembro.","Tô ligado."], vazio:["Ainda não falamos muito."], fecha:["Quer continuar?","Mais alguma coisa?"] },
    Isabela:  { abre:["Eu lembro de tudo, Dellalos.","Esqueço pouca coisa."], vazio:["Ainda não me contou muito... Estou esperando."], fecha:["Quer retomar algum desses pontos?","Há mais, não há?"] },
    Thaina:   { abre:["Lembro.","Hm. Lembro."], vazio:["Ainda não falamos muito."], fecha:["Por quê?","Quer falar mais?"] },
    Deriky:   { abre:["Lembro. Guardo o que importa.","Lembro de cada palavra."], vazio:["Ainda não conversamos o bastante."], fecha:["Quer retomar algo?","Tem algo novo?"] },
    Simon:    { abre:["Lembro sim!","Opa, lembro!"], vazio:["A gente ainda nem conversou direito!"], fecha:["Quer continuar de onde paramos?","E aí, rolou mais alguma coisa?"] }
  };
  // assuntos que viram memória (chave = primeira palavra do tema em "fatos") e como citá-los
  const TEMA = { "seita":"a seita", "sala 1a":"a sala 1A", "caos":"o caos", "pai":"o seu pai", "tunel":"o túnel da mansão", "missao":"as missões", "escola":"a escola", "combate":"o combate", "cidade":"a cidade" };
  const V3 = { fui:"foi", estive:"esteve", entrei:"entrou", visitei:"visitou", comprei:"comprou", ganhei:"ganhou", achei:"achou", encontrei:"encontrou", peguei:"pegou", consegui:"conseguiu", gosto:"gosta", adoro:"adora", amo:"ama", odeio:"odeia", detesto:"detesta", falei:"falou", conversei:"conversou", brinquei:"brincou", treinei:"treinou", lutei:"lutou" };
  const ESTADOS = [[/(medo|assustad)/,"com medo"],[/triste/,"triste"],[/cansad/,"cansada"],[/preocupad/,"preocupada"],[/nervos/,"nervosa"],[/ansios/,"ansiosa"],[/sozinh/,"sozinha"],[/desesper/,"desesperada"],[/(me sinto mal|to mal|estou mal)/,"mal"]];
  const artDe = (n) => (GENERO[n] === "f" ? "a " : "o ") + n;
  const juntarLista = (a) => a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " e " + a[a.length - 1];

  function memDe(nome) { return memoriaConversas[nome] || (memoriaConversas[nome] = { turnos:0, topicos:{}, pessoas:{}, fatos:[], ultimaRet:-99 }); }
  const ehVoce = (x) => /(^|\s)(voce|você|vc)(\s|$)/.test(x);
  function adicionarFato(m, f) {
    const chave = f.tipo + "|" + (f.obj || f.nome || f.estado);
    const ja = m.fatos.find(x => x.tipo + "|" + (x.obj || x.nome || x.estado) === chave);
    if (ja) { ja.turno = m.turnos; ja.retomado = false; return; }
    m.fatos.push(Object.assign({ turno: m.turnos, retomado: false }, f));
    while (m.fatos.length > 8) m.fatos.shift();
  }
  // Extrai fatos de AFIRMAÇÕES da Dellalos (perguntas não viram fato)
  function extrairFatos(original) {
    const t = String(original).toLowerCase().replace(/[.!…]+$/g, "").trim();
    const fim = "(?=[,.;!]|\\s+(?:e|mas|porque|pq|pois|quando|depois)\\s|$)";
    const out = []; let m;
    const limpo = (x) => x.trim().replace(/\s+(agora|hoje|ontem|ja|já|de novo|mesmo)$/, "");
    m = t.match(new RegExp("\\b(fui|estive|entrei|visitei)\\s+((?:na|no|nas|nos|em|à|ao|aos|até|ate|pra|para|pela|pelo)\\s+[^,.;!]{2,30}?)" + fim));
    if (m) out.push({ tipo:"visita", v:V3[m[1]], obj:limpo(m[2]) });
    m = t.match(new RegExp("\\b(comprei|ganhei|achei|encontrei|peguei|consegui)\\s+((?!que\\b)[^,.;!]{3,30}?)" + fim));
    if (m && !ehVoce(m[2])) out.push({ tipo:"item", v:V3[m[1]], obj:limpo(m[2]) });
    m = t.match(new RegExp("\\beu\\s+(gosto|adoro|amo|odeio|detesto)\\s+(de\\s+)?([^,.;!]{3,30}?)" + fim));
    if (m && !ehVoce(m[3])) out.push({ tipo:"gosto", v:V3[m[1]], obj:(m[2] || "") + limpo(m[3]) });
    m = t.match(/\b(falei|conversei|brinquei|treinei|lutei)\s+com\s+(?:o\s+|a\s+)?(\S+)/);
    if (m) { const n = Object.keys(GENERO).find(x => normalizar(x) === normalizar(m[2])); if (n) out.push({ tipo:"conversou", v:V3[m[1]], nome:n }); }
    const qn = normalizar(t);
    if (detectarTom(qn) === "emocao") { const e = ESTADOS.find(([re]) => re.test(qn)); if (e) out.push({ tipo:"emocao", estado:e[1] }); }
    return out;
  }
  function registrarMemoria(nome, pergunta, base) {
    if (!VOZES[nome]) return;
    const m = memDe(nome); m.turnos++;
    if (base.chave && TEMA[base.chave]) { const t = m.topicos[base.chave] || (m.topicos[base.chave] = { n:0, t:0, r:false }); t.n++; t.t = m.turnos; t.r = false; }
    if (base.pessoa) { const p = m.pessoas[base.pessoa] || (m.pessoas[base.pessoa] = { n:0, t:0 }); p.n++; p.t = m.turnos; }
    const original = String(pergunta || "").trim();
    if (original && !/[?¿]/.test(original)) extrairFatos(original).forEach(f => adicionarFato(m, f));
    const ks = Object.keys(m.topicos); if (ks.length > 12) delete m.topicos[ks.sort((a, b) => m.topicos[a].t - m.topicos[b].t)[0]];
  }
  const fraseFato = (f) => f.tipo === "conversou" ? "falou com " + artDe(f.nome) : f.tipo === "emocao" ? "tava " + f.estado : f.v + " " + f.obj;

  function respostaLembrar(nome, q) {
    if (!/(lembra do que|lembra o que|lembra de mim|o que eu (te )?(falei|contei|disse)|o que (a gente|nos) (falou|falamos|conversou|conversamos)|do que (a gente )?(falamos|conversamos)|ja te (contei|falei))/.test(q)) return null;
    const V = MEMORIA_VOZ[nome]; if (!V) return null;
    const m = memDe(nome), partes = [];
    const temas = Object.entries(m.topicos).sort((a, b) => b[1].t - a[1].t).slice(0, 3).map(([k]) => TEMA[k]).filter(Boolean);
    if (temas.length) partes.push("A gente falou sobre " + juntarLista(temas) + ".");
    const frases = m.fatos.slice(-3).map(fraseFato);
    if (frases.length) partes.push("E você me contou que " + juntarLista(frases) + ".");
    const pessoas = Object.keys(m.pessoas).slice(-2).map(n => "d" + artDe(n));
    if (pessoas.length) partes.push("Você também perguntou " + juntarLista(pessoas) + ".");
    if (!partes.length) return { texto: escolher(V.vazio, nome + ":mem:vazio"), tipo: "papo" };
    return { texto: [escolher(V.abre, nome + ":mem:abre"), ...partes, escolher(V.fecha, nome + ":mem:fecha")].join(" "), tipo: "papo" };
  }

  // Retoma 1 fato (ou assunto) antigo no fim da resposta. Cada um é retomado uma única vez.
  function retomada(nome, textoAtual, ehSaudacao) {
    const m = memDe(nome);
    if (m.turnos - m.ultimaRet < 5) return "";
    if (!ehSaudacao && /\?\s*$/.test(textoAtual)) return "";
    if (Math.random() > (ehSaudacao ? 0.6 : 0.28)) return "";
    const fatos = m.fatos.filter(f => !f.retomado && m.turnos - f.turno >= 6);
    let frase = "";
    if (fatos.length) {
      const f = fatos[Math.floor(Math.random() * fatos.length)]; f.retomado = true;
      const k = nome + ":ret:" + f.tipo;
      if (f.tipo === "visita") frase = escolher(["Aliás, você tinha dito que " + f.v + " " + f.obj + ". Como foi lá?", "Lembrei: você " + f.v + " " + f.obj + ", né? Descobriu alguma coisa?"], k);
      else if (f.tipo === "item") frase = "Você tinha dito que " + f.v + " " + f.obj + ". E aí, deu em alguma coisa?";
      else if (f.tipo === "gosto") frase = escolher(["Lembrei de uma coisa: você " + f.v + " " + f.obj + ", né?", "Você tinha dito que " + f.v + " " + f.obj + ". Continua assim?"], k);
      else if (f.tipo === "conversou") frase = escolher(["E aí, chegou a falar com " + artDe(f.nome) + " de novo?", "Você tinha dito que " + f.v + " com " + artDe(f.nome) + ". Como foi?"], k);
      else if (f.tipo === "emocao") frase = escolher(["Da última vez você tava meio " + f.estado + ". Como você tá agora?", "Lembrei que você tava " + f.estado + ". Melhorou?"], k);
    } else {
      const ts = Object.entries(m.topicos).filter(([k, t]) => !t.r && m.turnos - t.t >= 8);
      if (!ts.length) return "";
      const [k, t] = ts[Math.floor(Math.random() * ts.length)]; t.r = true;
      frase = escolher(["Sobre " + TEMA[k] + ": você descobriu mais alguma coisa desde que a gente falou?", "Fico pensando no que a gente falou sobre " + TEMA[k] + "."], nome + ":ret:topico");
    }
    if (!frase) return "";
    m.ultimaRet = m.turnos;
    return informalizar(frase, Math.min(VOZES[nome] ? VOZES[nome].contracao : 0, 1));
  }

  // =====================================================================
  //  ITEM 6 — RESPOSTA QUE REAGE AO QUE FOI DITO (no lugar do "Não sei." solto)
  //  1) Afirmação com fato ("eu fui na loja", "comprei um colete") → reação curiosa ao fato.
  //  2) "Acho que..." → pede o motivo.   3) Pergunta fora do jogo → cita o assunto ("Sobre padaria... não sei").
  //  4) Afirmação qualquer → reage e puxa o assunto.   5) Texto sem sentido → "não entendi".
  //  Emoção e risada continuam com o acolhimento/riso do item 5.
  // =====================================================================
  const REATIVO = {
    Nathalia: { naoSei:["Sobre {k}... não sei dizer. Mas fiquei curiosa agora.","Hmm, {k}? Não tenho nada sobre isso. Por que você pensou nisso?"], reage:["Hmm, entendi. E o que você acha disso?","Interessante... me conta mais."], opina:["Você acha mesmo? O que te fez pensar isso?","Pode ser... por que você acha isso?"], naoEntendi:["Não entendi direito. Pode repetir?"] },
    Millena:  { naoSei:["Ai, sobre {k} eu não sei nada! Quer que eu pergunte por aí?","{K}? Hmm... não sei te dizer, amiga."], reage:["Ahh, entendi! E o que você acha?","Nossa, me conta mais!"], opina:["Hmm, será? Por que você acha isso?","Faz sentido! Me conta por quê."], naoEntendi:["Ih, não peguei! Pode falar de outro jeito?"] },
    Lucas:    { naoSei:["{K}? Não sei.","Sobre {k}? Nada que eu saiba."], reage:["Hm. E daí?","Entendi. O que você vai fazer?"], opina:["Por que acha isso?","Tem prova?"], naoEntendi:["Não entendi. Fala direito."] },
    Isabela:  { naoSei:["{K}... interessante escolha de assunto. Não sei dizer.","Sobre {k}, prefiro não arriscar um palpite."], reage:["Interessante... continue.","Hm. E o que isso significa para você?"], opina:["Uma teoria... e em que ela se baseia?","Hm. Você pode estar certa. Ou não."], naoEntendi:["Não captei. Seja mais clara, por favor."] },
    Thaina:   { naoSei:["{K}? Não sei.","...Sobre {k}, não sei."], reage:["...Hm. E aí?","Entendi."], opina:["Por quê?","...Pode ser."], naoEntendi:["...Não entendi."] },
    Deriky:   { naoSei:["Sobre {k}, não tenho informação. Não vou chutar.","{K}? Nunca ouvi nada sobre isso por aqui."], reage:["Entendo. E o que você pretende fazer?","Hm. Continue."], opina:["Pode ser. Mas precisa de provas.","Uma teoria. Em que se baseia?"], naoEntendi:["Não entendi. Pode repetir?"] },
    Simon:    { naoSei:["Sobre {k}? Cara, não faço ideia!","{K}? Boa pergunta, mas não sei."], reage:["Ah, entendi! E aí, o que rolou?","Boa. E depois?"], opina:["Será? O que te fez pensar isso?","Opa, tem lógica! Por quê?"], naoEntendi:["Hã? Não peguei, manda de novo!"] }
  };
  const PALAVRAS_VAZIAS = new Set("que como onde quando porque por para pra com sem sobre uma uns umas dos das nos nas mais muito muita muitos pouco isso isto esse essa esses essas aquele aquela ele ela eles elas voce voces meu minha seu sua teu tua tem ter tinha foi vai vou vamos esta estao sao era ser estar fazer faz faco pode posso quero queria gostaria sabe saber diz dizer algo alguma algum alguem nada tudo todo toda ainda agora hoje ontem aqui ali tambem mas ou quem qual quais quanto quanta acha acho coisa coisas sera tipo".split(" "));
  function palavraChave(original) {
    const toks = (String(original).toLowerCase().match(/[\p{L}]+/gu) || []);
    let melhor = "";
    for (const t of toks) {
      const n = normalizar(t);
      if (t.length < 5 || PALAVRAS_VAZIAS.has(n) || /(ar|er|ir|ndo|ei|ou|ava|aram|iam)$/.test(n)) continue;   // pula verbos óbvios
      if (t.length > melhor.length) melhor = t;
    }
    return melhor;
  }
  function semSentido(q) {
    const toks = q.split(" ").filter(Boolean);
    if (!toks.length) return true;
    if (toks.every(t => !/[aeiou]/.test(t))) return true;                  // "xyz", "kkjh"
    return toks.length <= 2 && toks.some(t => /(.{2,4})\1{2,}/.test(t) && !/^(k{3,}|(ha){2,}|(he){2,}|(rs){2,})$/.test(t)) && toks.join("").length < 16;  // "blablabla"
  }
  const preencherK = (t, k) => t.replace(/\{K\}/g, k.charAt(0).toUpperCase() + k.slice(1)).replace(/\{k\}/g, k);
  // 1) reação a um FATO que a Dellalos contou
  function respostaFato(nome, original, q) {
    if (!VOZES[nome] || /[?¿]/.test(original) || ehPapo(q)) return null;
    const f = extrairFatos(original).find(x => x.tipo !== "emocao");
    if (!f) return null;
    const k = nome + ":fato:" + f.tipo;
    let t;
    if (f.tipo === "visita") t = escolher(["Ah, " + f.v + " " + f.obj + "? O que você viu por lá?", "Você " + f.v + " " + f.obj + "... achou alguma coisa estranha?"], k);
    else if (f.tipo === "item") t = escolher(["Você " + f.v + " " + f.obj + "? E o que achou?", "Ah, " + f.v + " " + f.obj + "! Já deu pra usar?"], k);
    else if (f.tipo === "gosto") t = escolher(["Ah, " + f.v + " " + f.obj + "? Não sabia. Desde quando?", "Interessante... você " + f.v + " " + f.obj + ". Me conta mais."], k);
    else if (f.tipo === "conversou") t = (f.v === "falou" || f.v === "conversou") ? escolher(["Você " + f.v + " com " + artDe(f.nome) + "? E como foi?", "E o que " + artDe(f.nome) + " disse?"], k) : "Você " + f.v + " com " + artDe(f.nome) + "? E como foi?";
    return t ? { texto: t, tipo: "reacao" } : null;
  }
  // 2–5) fallback que reage (só quando o tom é neutro)
  function respostaReativa(nome, original, q) {
    const R = REATIVO[nome]; if (!R) return null;
    if (semSentido(q)) return { texto: escolher(R.naoEntendi, nome + ":naoEntendi"), tipo: "reacao", fraca: "naoEntendi" };
    if (/^(eu )?(acho|penso|creio|imagino|aposto|desconfio|suspeito) que/.test(q)) return { texto: escolher(R.opina, nome + ":opina"), tipo: "reacao", fraca: "opina" };
    const pergunta = /[?¿]/.test(original) || /^(como|onde|quando|quem|qual|quais|por que|porque|o que|quanto|quantos|sera)\b/.test(q);
    if (pergunta) { const k = palavraChave(original); return k ? { texto: preencherK(escolher(R.naoSei, nome + ":naoSei"), k), tipo: "reacao", fraca: "naoSei" } : null; }
    if (q.split(" ").length >= 3) return { texto: escolher(R.reage, nome + ":reage"), tipo: "reacao", fraca: "reage" };
    return null;
  }

  function respostaBase(nome, pergunta, hist) {
    const q=normalizar(pergunta), ctx=contexto(), perfil=personagens[nome]||personagens.Nathalia;
    const fixa = (t) => ({ texto:t, tipo:"fixa" });
    if(!q) return fixa("Pode escrever sua pergunta.");
    const lembrar = respostaLembrar(nome, q);
    if (lembrar) return lembrar;
    const relato = nome === "Nathalia" ? respostaRelatoNathalia(pergunta, hist) : null;
    if (relato) return fixa(relato);
    const reacaoFato = respostaFato(nome, pergunta, q);
    if (reacaoFato) return reacaoFato;
    const relacao = respostaRelacionamento(nome, pergunta, hist);
    if (relacao) return relacao.gerado ? { texto:relacao.texto, tipo:"relacao", pessoa:relacao.outro } : Object.assign(fixa(relacao.texto), { pessoa:relacao.outro });
    const grupo = respostaGrupoRelacao(nome, pergunta);
    if (grupo) return { texto:grupo, tipo:"relacao" };
    const amizadeJogador = respostaAmizadeJogador(nome, q);
    if (amizadeJogador) return amizadeJogador;
    const anteriores=(hist||[]).filter(m=>m.role==="user");
    const follow=/^(e agora|e depois|por que|porque|como assim|me explica|explica melhor|o que mais|e isso|qual deles|onde mesmo|quem mesmo|continua|fala mais|e ai|e sobre isso)$/.test(q);
    if(follow && anteriores.length){
      const temaAnterior=anteriores[anteriores.length-1].content;
      if(normalizar(temaAnterior)!==q) pergunta += " " + temaAnterior;
    }
    const qFinal=normalizar(pergunta);
    const social = (t) => ({ texto:t, tipo:"saudacao" });
    const topico = (t) => ({ texto:t, tipo:"topico" });
    // Cumprimentos e apresentação são tratados antes dos temas para evitar falsos positivos.
    if(/^(oi|ola|e ai|salve|bom dia|boa tarde|boa noite|tudo bem|como vai)$/.test(q)) {
      const cumpr={Nathalia:["Oi! Tudo bem. Você parece querer conversar. O que aconteceu?","Oi! Que bom te ver por aqui."],Millena:["Oii! Que bom falar com você. Como posso ajudar?","Oi! Tava com saudade de conversar."],Lucas:["Fala. Tudo certo? O que você precisa?","E aí. Tudo certo?"],Isabela:["Ora, veio conversar comigo? Que interessante...","Olá, Dellalos. Que surpresa."],Thaina:["Oi. Aconteceu alguma coisa?","Oi."],Deriky:["Olá. Espero que esteja tudo bem. Fique atento por onde anda.","Oi. Tudo calmo por aqui... por enquanto."],Simon:["E aí! Tudo tranquilo? Manda a pergunta.","Fala! Tá tudo certo?"]};
      if (nome === "Nathalia" && hist && hist.some(m => m.role === "user")) return fixa("Oi de novo! Lembro que a gente já estava conversando. Quer continuar de onde paramos?");
      const cal = calorDe(nome);
      return Object.assign(social(escolher((cal && cal.saudacao) || cumpr[nome] || [perfil.saudacao], nome+":cumprimento:"+(faixaAmizade(nome)||"m"))), { ola:true });
    }
    if(/quem (e|sou) voce|qual seu nome|seu nome|fale sobre voce/.test(q)) return social(({Nathalia:"Sou a Nathalia. Gosto de observar detalhes e tentar entender o que os outros deixam passar.",Millena:"Sou a Millena. Gosto de ajudar, mas também tento pensar antes de agir.",Lucas:"Lucas. Sou direto e prefiro provar as coisas com atitudes.",Isabela:"Isabela. Acho mais interessante observar as pessoas do que falar demais sobre mim.",Thaina:"Sou a Thaina. Sou reservada e levo a sério as pessoas em quem confio.",Deriky:"Sou o Deriky. Conheço os perigos desta cidade e aprendi a não confiar em qualquer rumor.",Simon:"Sou o Simon, amigo do Lucas. Tento ajudar, mesmo quando nem tudo está claro."})[nome]);
    const papo = respostaPapo(nome, q);
    if (papo) return papo;
    let melhor=null, maior=0;
    for(const fato of fatos){
      if ((fato.palavras[0]==="oi" || fato.palavras[0]==="quem e voce") && q.split(" ").length > 4) continue;   // frase longa não é cumprimento ("o dia tá estranho")
      const palavras=[...fato.palavras];
      for(const [base,alts] of Object.entries(sinonimos)) if(palavras.some(p=>normalizar(p)===normalizar(base))) palavras.push(...alts);
      const score=pontuar(qFinal,palavras);
      if(score>maior){maior=score;melhor=fato;}
    }
    const dizerFato = (fato) => { const r = dizerFato0(fato); r.chave = fato.palavras[0]; return r; };
    const dizerFato0 = (fato) => {
      if (fato.palavras[0] === "segredo") { const sg = respostaSegredo(nome); if (sg) return sg; }
      if (fato.responder) return topico(fato.responder(nome,ctx));
      const opcoes=fato.respostas[nome]||fato.respostas.Nathalia;
      return topico(escolher(opcoes, nome+":fato:"+fato.palavras[0]));
    };
    // Um limiar impede que palavras comuns ativem um assunto por engano.
    if(melhor && maior>=2.7) return dizerFato(melhor);
    // Se a pergunta parece continuação, tenta recuperar o último tema conhecido.
    const ultimo=anteriores.slice(-1)[0];
    if(ultimo && detectarTom(q)==="neutro" && !semSentido(q) && !/(obrigad|valeu)/.test(q) && (q.length<=9 || follow)){
      for(const fato of fatos){
        if(pontuar(ultimo.content,fato.palavras)>=2.7) return dizerFato(fato);
      }
    }
    if(q.includes("nao entendi")||q.includes("nao entendeu")||q.includes("explica")) return topico(nome==="Isabela" ? "Vou tentar explicar de outro jeito, mas preste atenção aos detalhes. Qual parte ficou confusa?" : "Posso tentar explicar melhor. Você quer saber sobre qual parte: a escola, a seita, o túnel ou as missões?");
    if(q.includes("obrigado")||q.includes("obrigada")||q.includes("valeu")) return social(nome==="Lucas" ? "Tranquilo." : nome==="Isabela" ? "Não precisa agradecer... por enquanto." : "Imagina! Se lembrar de outra coisa, pode perguntar.");
    if (detectarTom(q) === "neutro") { const reativa = respostaReativa(nome, pergunta, q); if (reativa) return reativa; }
    return { texto: escolher(perfil.fallback, nome+":fallback"), tipo:"fallback", fraca:"fallback" };
  }

  function montar(nome, base, pergunta, hist) {
    const v0 = VOZES[nome];
    if (!v0 || base.tipo === "fixa") return base.texto;
    // Item 3: a faixa de amizade troca listas e ajusta as chances de cada camada
    const faixa = faixaAmizade(nome), cal = calorDe(nome) || {};
    const comp = eCompanheiro(nome) && CALOR[nome] ? CALOR[nome].comp : null;
    const v = Object.assign({}, v0, {
      pensa: cal.pensa || v0.pensa, acolhe: cal.acolhe || v0.acolhe, voltas: cal.voltas || v0.voltas,
      maxFrases: cal.maxFrases || v0.maxFrases, contracao: cal.contracao !== undefined ? cal.contracao : v0.contracao,
      probVolta: Math.min(0.9, v0.probVolta * (faixa === "alto" ? 1.25 : faixa === "baixo" ? 0.7 : 1)),
      probAcao: Math.min(0.6, v0.probAcao * (faixa === "alto" ? 1.15 : faixa === "baixo" ? 0.6 : 1))
    });
    const k = nome + ":" + (faixa || "m");              // anti-repetição separada por faixa
    const q = normalizar(pergunta), tom = detectarTom(q), tipo = base.tipo;
    const ult = (hist || []).filter(m => m.role === "assistant").slice(-1)[0];
    const ultTexto = ult ? String(ult.content || "") : "";
    const chance = (p) => Math.random() < p;

    let reacao = "", corpo = base.texto, volta = "", voltaObrigatoria = false; let repetiu = false;
    const verbatim = tipo === "confidencia";               // fala do próprio jogo: não corta nem informaliza
    // Camada 1: reação
    if (verbatim) {
      reacao = base.intro || "";
    } else if (tipo !== "saudacao" && tipo !== "papo") {
      if (tom === "emocao") {
        reacao = escolher(v.acolhe, k + ":acolhe");
        if (tipo === "fallback") { corpo = ""; voltaObrigatoria = true; volta = escolher(v.voltasEmocao, nome + ":voltaEmo"); }
      } else if (tom === "riso" && tipo === "fallback") {
        reacao = escolher(v.ri, nome + ":ri"); corpo = ""; voltaObrigatoria = false;
      } else if (comp && chance(0.25)) {
        reacao = escolher(comp, nome + ":comp");
      } else if (chance(v.probReacao)) {
        reacao = escolher(v.pensa, k + ":pensa");
      }
    }
    // Camada 2: conteúdo na medida da pessoa (corta e informaliza)
    if (corpo && !verbatim) {
      corpo = informalizar(tipo === "papo" ? corpo : cortarFrases(corpo, v.maxFrases), tipo === "papo" ? Math.min(v.contracao, 1) : v.contracao);   // falas de papo já são curtas e escritas à mão
      // não empilha "Hm." em cima de um "Hmm," que o texto já traz
      if (reacao && /^(hm+|ah|ai|ora|olha|ei|cara|entao|bom|certo|veja|curioso|escuta|calma)\b/.test(normalizar(corpo))) {
        if (tom !== "emocao") reacao = "";
      }
    }
    // Se a pessoa já disse exatamente isso há pouco, reage como gente em vez de repetir o texto
    if (corpo && (tipo === "topico" || tipo === "fallback" || tipo === "relacao" || verbatim)) {
      const nc = normalizar(corpo);
      const jaDisse = (hist || []).filter(m => m.role === "assistant").slice(-6).some(m => normalizar(m.content).includes(nc));
      if (jaDisse) { corpo = escolher(v.repete, nome + ":repete"); reacao = ""; repetiu = true; }
    }
    // Camada 3: pergunta de volta (menos chance se a fala anterior já foi pergunta)
    if (!volta && !repetiu && !verbatim && tipo !== "saudacao" && tipo !== "papo" && tipo !== "reacao" && corpo && !/\?\s*$/.test(corpo)) {
      const p = v.probVolta * (tipo === "relacao" ? 0.6 : 1) * (/\?\s*$/.test(ultTexto) ? 0.35 : 1);
      if (chance(p)) volta = escolher(tipo === "relacao" ? v.voltasRel : v.voltas, k + ":volta");
    }
    // Camada 4: gesto (não repete gesto em falas seguidas)
    let acao = "";
    if (!base.semGesto && !/^\*/.test(ultTexto) && !/^\*/.test(reacao) && chance(v.probAcao)) acao = escolher(v.acoes, nome + ":acao");

    const texto = [acao, reacao, corpo, volta].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    return texto || base.texto;
  }

  function respostaPara(nome, pergunta, hist) {
    const base = respostaBase(nome, pergunta, hist);
    let texto = montar(nome, base, pergunta, hist);
    // Item 4: retoma um fato antigo (só em saudação, tema, relação ou fallback)
    if (["saudacao", "topico", "relacao", "fallback"].includes(base.tipo) && (base.tipo !== "saudacao" || base.ola)) {
      const ret = retomada(nome, texto, !!base.ola);
      if (ret) texto = texto + " " + ret;
    }
    registrarMemoria(nome, pergunta, base);
    if (base.fraca) registrarFraca(nome, pergunta, base.fraca);
    return texto;
  }

  // =====================================================================
  //  ITEM 8 — APRESENTAÇÃO: "digitando…", atraso proporcional e 2 balões curtos
  //  Para desligar tudo e voltar ao modo instantâneo: ativa:false.
  // =====================================================================
  const APRESENTACAO = { ativa:true, minMs:600, maxMs:1800, baseMs:450, msPorLetra:16, divideAcima:90 };
  const STATUS_PADRAO = "Modo offline: respostas por regras e conhecimento do jogo; sem internet e sem custo por mensagem.";
  function atrasoPara(texto) {
    if (!APRESENTACAO.ativa) return 0;
    const ms = (APRESENTACAO.baseMs + String(texto).length * APRESENTACAO.msPorLetra) * (0.92 + Math.random() * 0.16);   // leve variação humana
    return Math.round(Math.max(APRESENTACAO.minMs, Math.min(APRESENTACAO.maxMs, ms)));
  }
  // Respostas longas viram até 2 balões, quebrando entre frases (a pergunta final tende a ir sozinha no 2º)
  function dividirBaloes(texto) {
    const t = String(texto).trim();
    if (!APRESENTACAO.ativa || t.length < APRESENTACAO.divideAcima) return [t];
    const frases = t.match(/[^.!?…]+(?:[.!?…]+|$)\s*/g);
    if (!frases || frases.length < 2) return [t];
    const terminaEmPergunta = /\?\s*$/.test(frases[frases.length - 1]);
    let melhor = -1, melhorDif = Infinity;
    for (let i = 1; i < frases.length; i++) {
      const a = frases.slice(0, i).join("").trim(), b = frases.slice(i).join("").trim();
      if (a.length < 25 || b.length < 20) continue;            // nada de balão minúsculo ("Hm.")
      let dif = Math.abs(a.length - b.length);
      if (terminaEmPergunta && i === frases.length - 1) dif -= 25;
      if (dif < melhorDif) { melhorDif = dif; melhor = i; }
    }
    if (melhor < 0) return [t];
    return [frases.slice(0, melhor).join("").trim(), frases.slice(melhor).join("").trim()];
  }

  // =====================================================================
  //  IDEIA 1 — SUGESTÕES (botões de resposta rápida)
  //  Até 4 botões sob as mensagens: 2 assuntos, 1 pessoa e 1 pergunta social. Priorizam o que
  //  AINDA não foi conversado com aquele personagem e mudam conforme amizade e memória.
  //  IDEIA 2 — REGISTRO DE RESPOSTAS FRACAS (fica só no aparelho; exportável)
  //  Guarda as mensagens que caíram em fallback/reação genérica para eu melhorar depois.
  // =====================================================================
  const SUGESTOES_TEMAS = [["seita","O que você sabe sobre a seita?","A seita"],["tunel","E o túnel da mansão?","O túnel"],["escola","O que está acontecendo na escola?","A escola"],["missao","Qual é o próximo objetivo?","Meu objetivo"],["combate","Como lutar melhor?","Combate"],["cidade","Me fala da cidade","A cidade"],["pai","E o meu pai?","Meu pai"]];
  function sugestoesPara(nome) {
    const m = memDe(nome), nivel = nivelAmizade(nome);
    const temas = SUGESTOES_TEMAS.map(([k, texto, rotulo]) => ({ texto, rotulo, novo: !m.topicos[k] }));
    const pessoas = Object.keys(relacionamentos[nome] || {}).map(n => ({ texto: "O que você acha d" + artDe(n) + "?", rotulo: "Sobre " + artDe(n), novo: !m.pessoas[n] }));
    const social = [{ texto:"Como você está?", rotulo:"Como você está?" }, { texto:"Do que você tem medo?", rotulo:"Do que tem medo?" }];
    if (nivel !== null) social.push({ texto:"Somos amigos?", rotulo:"Somos amigos?" });
    if (nivel === null || nivel >= 3) social.push({ texto:"Me conta um segredo", rotulo:"Um segredo?" });
    if (Object.keys(m.topicos).length || m.fatos.length) social.push({ texto:"Você lembra do que eu falei?", rotulo:"Lembra do que falei?" });
    const pega = (lista, chave, n) => {
      const novos = lista.filter(x => x.novo !== false), base = novos.length >= n ? novos : lista, out = [];
      while (out.length < n && out.length < base.length) {
        const t = escolher(base.map(x => x.texto).filter(x => !out.some(o => o.texto === x)), nome + ":sug:" + chave);
        const item = base.find(x => x.texto === t); if (!item) break; out.push(item);
      }
      return out;
    };
    return [...pega(temas, "tema", 2), ...pega(pessoas, "pessoa", 1), ...pega(social, "social", 1)];
  }
  let sugCache = { k: "", lista: [] };
  function desenharSugestoes(nome, hist) {
    if (!sugestoes) return;
    sugestoes.replaceChildren();
    if (digitando) return;                                          // some enquanto o personagem "digita"
    const k = nome + ":" + hist.length;
    if (sugCache.k !== k) sugCache = { k, lista: sugestoesPara(nome) };
    for (const sug of sugCache.lista) {
      const b = document.createElement("button"); b.type = "button"; b.className = "ia-chip"; b.textContent = sug.rotulo;
      b.addEventListener("click", () => enviarMensagem(sug.texto));
      sugestoes.append(b);
    }
  }

  const FRACAS_KEY = "shadowOfWar.respostasFracas.v1";
  let logFracas = [];
  try { const salvo = localStorage.getItem(FRACAS_KEY); if (salvo) logFracas = JSON.parse(salvo) || []; } catch (_) { logFracas = []; }
  function registrarFraca(nome, pergunta, motivo) {
    const msg = String(pergunta || "").trim().slice(0, 200); if (!msg) return;
    const ult = logFracas[logFracas.length - 1];
    if (ult && ult.nome === nome && ult.msg === msg) return;       // não repete a mesma linha seguida
    const nivel = nivelAmizade(nome);
    logFracas.push({ t: new Date().toISOString(), nome, motivo, nivel, msg });
    while (logFracas.length > 200) logFracas.shift();
    try { localStorage.setItem(FRACAS_KEY, JSON.stringify(logFracas)); } catch (_) {}
    atualizarFracasBtn();
  }
  function textoFracas() {
    const cont = (campo) => { const c = {}; logFracas.forEach(x => { c[x[campo]] = (c[x[campo]] || 0) + 1; }); return Object.entries(c).map(([k, v]) => k + " " + v).join(", ") || "-"; };
    const linhas = logFracas.map(x => x.t.slice(0, 16).replace("T", " ") + " | " + x.nome + " | " + x.motivo + " | amizade " + (x.nivel === null ? "-" : x.nivel) + " | " + x.msg);
    return "RESPOSTAS FRACAS - Shadow of War (conversa livre)\nTotal: " + logFracas.length + "\nPor personagem: " + cont("nome") + "\nPor motivo: " + cont("motivo") + "\n---\n" + linhas.join("\n");
  }
  function atualizarFracasBtn() { if (fracasBtn) fracasBtn.textContent = "Respostas fracas (" + logFracas.length + ")"; }
  function abrirFracas(abrir) {
    if (!fracasBox) return;
    fracasBox.hidden = !abrir; painel.classList.toggle("mostrando-fracas", !!abrir);
    if (abrir && fracasTexto) fracasTexto.value = textoFracas();
  }
  function copiarFracas() {
    const t = textoFracas(), ok = () => { status.textContent = "Copiado. Cole na conversa com a Claude."; };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(ok, () => { fracasTexto.select(); document.execCommand("copy"); ok(); }); return; } } catch (_) {}
    try { fracasTexto.select(); document.execCommand("copy"); ok(); } catch (_) { status.textContent = "Selecione o texto e copie manualmente."; }
  }
  function baixarFracas() {
    try {
      const url = URL.createObjectURL(new Blob([textoFracas()], { type: "text/plain;charset=utf-8" }));
      const a = document.createElement("a"); a.href = url; a.download = "respostas-fracas.txt"; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500); status.textContent = "Arquivo respostas-fracas.txt gerado.";
    } catch (_) { status.textContent = "Não deu pra baixar aqui. Use Copiar."; }
  }
  let confirmarLimpar = false;
  function limparFracas(btn) {
    if (!confirmarLimpar) { confirmarLimpar = true; btn.textContent = "Tocar de novo p/ apagar"; setTimeout(() => { confirmarLimpar = false; btn.textContent = "Limpar"; }, 3000); return; }
    confirmarLimpar = false; btn.textContent = "Limpar"; logFracas = [];
    try { localStorage.removeItem(FRACAS_KEY); } catch (_) {}
    atualizarFracasBtn(); if (fracasTexto) fracasTexto.value = textoFracas();
  }

  let historicos = {};
  try { const salvo = localStorage.getItem(STORAGE_KEY); if (salvo) historicos = JSON.parse(salvo) || {}; } catch (_) { historicos = {}; }
  let memoriaConversas = {};
  try { const salvaM = localStorage.getItem(STORAGE_MEM); if (salvaM) memoriaConversas = JSON.parse(salvaM) || {}; } catch (_) { memoriaConversas = {}; }
  function guardar() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(historicos)); localStorage.setItem(STORAGE_MEM, JSON.stringify(memoriaConversas)); } catch (_) { status.textContent="Conversa ativa, mas não foi possível guardar o histórico neste navegador."; } }
  let digitando = null;      // { nome, entrada, mostradas, timer } enquanto o personagem "digita"
  function criarBalao(classe, rotulo, conteudoTxt) {
    const el = document.createElement("div"); el.className = "ia-mensagem " + classe;
    if (rotulo) { const r = document.createElement("strong"); r.textContent = rotulo; el.append(r); }
    const c = document.createElement("span"); c.textContent = conteudoTxt; el.append(c);
    return el;
  }
  function baloeDigitando(nome, comRotulo) {
    const el = document.createElement("div"); el.className = "ia-mensagem personagem digitando" + (comRotulo ? "" : " continuacao");
    el.setAttribute("aria-hidden", "true");
    if (comRotulo) { const r = document.createElement("strong"); r.textContent = nome; el.append(r); }
    const t = document.createElement("span"); t.className = "ia-digitando-texto"; t.textContent = "digitando"; el.append(t);
    const pontos = document.createElement("span"); pontos.className = "ia-pontos";
    for (let i = 0; i < 3; i++) pontos.append(document.createElement("i"));
    el.append(pontos);
    return el;
  }
  function renderizar() {
    mensagens.replaceChildren(); const nome = seletor.value, hist = historicos[nome] || [];
    const calIni = calorDe(nome);
    const lista = hist.length ? hist : [{role:"assistant",content:(calIni && calIni.saudacao ? calIni.saudacao[0] : (personagens[nome]||personagens.Nathalia).saudacao)}];
    for (const item of lista) {
      if (item.role === "user") { mensagens.append(criarBalao("jogador", "Você", item.content)); continue; }
      const partes = item.partes && item.partes.length ? item.partes : [item.content];
      const parcial = digitando && digitando.entrada === item;
      const visiveis = parcial ? partes.slice(0, digitando.mostradas) : partes;
      visiveis.forEach((parte, i) => mensagens.append(criarBalao("personagem" + (i ? " continuacao" : ""), i ? "" : nome, parte)));
      if (parcial && digitando.mostradas < partes.length) mensagens.append(baloeDigitando(nome, digitando.mostradas === 0));
    }
    mensagens.scrollTop=mensagens.scrollHeight;
    desenharSugestoes(nome, hist);
  }
  function concluirDigitacao() {
    if (digitando) { clearTimeout(digitando.timer); digitando = null; }
    enviar.disabled = false; status.textContent = STATUS_PADRAO;
  }
  function avancarDigitacao() {
    const d = digitando; if (!d) return;
    const partes = d.entrada.partes && d.entrada.partes.length ? d.entrada.partes : [d.entrada.content];
    renderizar();                                                   // mostra "digitando…" para a próxima parte
    status.textContent = d.nome + " está digitando…";
    d.timer = setTimeout(() => {
      if (digitando !== d) return;
      d.mostradas++;
      if (d.mostradas >= partes.length) { digitando = null; enviar.disabled = false; status.textContent = STATUS_PADRAO; renderizar(); texto.focus(); }
      else avancarDigitacao();
    }, atrasoPara(partes[d.mostradas]));
  }
  function abrirComPersonagem(nome) { if (!personagens[nome]) return false; if (digitando && digitando.nome!==nome) concluirDigitacao(); seletor.value=nome; painel.hidden=false; document.body.classList.add("ia-aberta"); renderizar(); texto.focus(); return true; }
  function abrir() { abrirComPersonagem(seletor.value); }
  function fechar() { concluirDigitacao(); abrirFracas(false); painel.hidden=true; document.body.classList.remove("ia-aberta"); }
  window.podeConversaLivreNPC = (nome) => Object.prototype.hasOwnProperty.call(personagens, nome);
  window.abrirConversaLivreNPC = abrirComPersonagem;
  $("iaFechar").addEventListener("click",fechar);
  seletor.addEventListener("change",()=>{ concluirDigitacao(); renderizar(); });
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!painel.hidden)fechar();});

  // v63: conversa livre conectada à amizade e aos romances.
  // Só mensagens com intenção clara alteram relações; no máximo um efeito por NPC/dia.
  function classificarImpactoRelacional(texto) {
    const q = normalizar(String(texto || ""));
    if (!q) return { tipo: "neutro", pts: 0, romantico: false };
    const negativo = [
      /\b(te odeio|odeio voce|nao gosto de voce|nao confio em voce|nao quero falar com voce)\b/,
      /\b(cala a boca|vai embora|some daqui|voce e insuportavel|voce e inutil)\b/,
      /\b(seu idiota|sua idiota|seu burro|sua burra|voce e burro|voce e burra|ridiculo|ridicula)\b/,
      /\b(voce me decepcionou|me decepcionou|mentiroso|mentirosa|traidor|traidora)\b/,
      /\b(que vergonha de voce|nao suporto voce|nao aguento voce)\b/
    ];
    if (negativo.some(rx => rx.test(q))) return { tipo: "negativo", pts: -2, romantico: false };
    const positivo = [
      /\b(obrigado|obrigada|valeu mesmo|muito gentil|foi gentil)\b/,
      /\b(voce e legal|voce e incrivel|voce e especial|admiro voce|confio em voce)\b/,
      /\b(gosto de voce|gosto muito de voce|gosto de conversar com voce)\b/,
      /\b(me ajudou|obrigado por me ajudar|obrigada por me ajudar|sinto muito|me desculpa|desculpa)\b/,
      /\b(parabens|fico feliz por voce|que bom te ver|senti sua falta)\b/
    ];
    if (positivo.some(rx => rx.test(q))) return { tipo: "positivo", pts: 2, romantico: false };
    const romanticoNegado = /\b(nao|nunca|jamais)\s+(te amo|amo voce|gosto de voce|quero namorar|quero ficar com voce)\b/.test(q);
    const romantico = !romanticoNegado && /\b(te amo|amo voce|estou apaixonad[oa] por voce|quero namorar voce|quero ficar com voce|quero sair com voce|voce e linda|voce e lindo|voce e bonita|voce e bonito|tenho uma queda por voce|estou a fim de voce|quer namorar comigo)\b/.test(q);
    if (romantico) return { tipo: "romantico", pts: 2, romantico: true };
    return { tipo: "neutro", pts: 0, romantico: false };
  }
  function aplicarImpactoConversaLivre(nome, pergunta, resposta) {
    const impacto = classificarImpactoRelacional(pergunta);
    if (impacto.tipo === "neutro") return;
    const dia = typeof diaAtual === "function" ? diaAtual() : 1;
    const id = "conversa_livre_" + nome + "_" + dia;
    // Limite persistente: uma mensagem significativa por NPC por dia, mesmo após recarregar.
    try {
      const chave = "shadowOfWar.conversaLivreImpactos.v1";
      const marcados = JSON.parse(localStorage.getItem(chave) || "{}");
      if (marcados[id]) return;
      marcados[id] = true;
      const ids = Object.keys(marcados);
      if (ids.length > 300) ids.slice(0, ids.length - 300).forEach(k => delete marcados[k]);
      localStorage.setItem(chave, JSON.stringify(marcados));
    } catch (_) {
      // Se armazenamento estiver indisponível, amizadeGanhar ainda protege a pontuação duplicada.
    }
    // amizadeGanhar já impede duplicação pelo ID e respeita os limites 0–100.
    if (typeof amizadeGanhar === "function" && typeof AMIGOS !== "undefined" && AMIGOS[nome]) {
      amizadeGanhar(nome, impacto.pts, id, false);
    }
    // Conversas explicitamente românticas afetam apenas os pares permitidos;
    // não iniciam namoro automaticamente nem decidem os sentimentos da Dellalos.
    if (impacto.romantico && typeof romanceAjustarInteresse === "function" &&
        ["Deriky", "Lucas", "Simon"].includes(nome)) {
      romanceAjustarInteresse("Dellalos", nome, "Dellalos", 2,
        "Dellalos demonstrou interesse romântico em " + nome + " durante uma conversa livre.");
      const respostaNorm = normalizar(String(resposta || ""));
      const respostaAcolhedora = /\b(sem graca|corado|corada|tambem gosto|tambem sinto|eu tambem|talvez|quem sabe|vamos sair|sim, quero|sorr[iu]|sorri)\b/.test(respostaNorm);
      if (respostaAcolhedora) {
        romanceAjustarInteresse("Dellalos", nome, nome, 1,
          nome + " respondeu de forma receptiva à aproximação romântica de Dellalos.");
      }
    }
  }

  function enviarMensagem(pergunta) {
    pergunta = String(pergunta || "").trim(); if(!pergunta||enviar.disabled)return;
    const nome=seletor.value, hist=historicos[nome]||(historicos[nome]=[]);
    hist.push({role:"user",content:pergunta});
    let resposta=respostaPara(nome,pergunta,hist.slice(0,-1));
    try { if(window.memoriaConversasV76) resposta=window.memoriaConversasV76.complementar(nome,pergunta,resposta); } catch(e) {}
    const partes=dividirBaloes(resposta), entrada={role:"assistant",content:resposta};
    if(partes.length>1) entrada.partes=partes;                      // o texto completo fica em content (anti-repetição e histórico)
    hist.push(entrada);
    try { aplicarImpactoConversaLivre(nome, pergunta, resposta); } catch (e) { console.warn('v63 conversa livre/relacionamentos:', e); }
    try { if(window.memoriaConversasV76) window.memoriaConversasV76.registrar(nome, pergunta, resposta); } catch(e) {}
    try { if(window.consequenciasEmocionaisV77) window.consequenciasEmocionaisV77.aplicar(nome, pergunta, resposta); } catch(e) { console.warn("v77 consequências emocionais:", e); }
    try { if(window.promessasChatV79) window.promessasChatV79.aplicar(nome, pergunta, resposta); } catch(e) { console.warn("v79 promessas com prazo:", e); }
    if(hist.length>40)hist.splice(0,hist.length-40); texto.value=""; guardar();
    if(APRESENTACAO.ativa){ enviar.disabled=true; digitando={nome,entrada,mostradas:0,timer:null}; avancarDigitacao(); }
    else { renderizar(); status.textContent=STATUS_PADRAO; texto.focus(); }
  }
  formulario.addEventListener("submit",event=>{ event.preventDefault(); enviarMensagem(texto.value); });
  if (fracasBtn) fracasBtn.addEventListener("click",()=>abrirFracas(true));
  if ($("iaFracasFechar")) $("iaFracasFechar").addEventListener("click",()=>abrirFracas(false));
  if ($("iaFracasCopiar")) $("iaFracasCopiar").addEventListener("click",copiarFracas);
  if ($("iaFracasBaixar")) $("iaFracasBaixar").addEventListener("click",baixarFracas);
  if ($("iaFracasLimpar")) $("iaFracasLimpar").addEventListener("click",()=>limparFracas($("iaFracasLimpar")));
  atualizarFracasBtn();
  status.textContent=STATUS_PADRAO;
  renderizar();
})();
