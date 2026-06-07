// Importa React, useState e useEffect para gerenciar estado e efeitos
import React, { useState, useEffect } from 'react';
// Importa componentes do React Native (Text, View, Button, etc)
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';

// Função principal do aplicativo
function App() {
  // Estado para armazenar a contagem de cliques (começa em 0)
  const [contagem, setContagem] = useState(100);
  const [contagemS, setContagemS] = useState(0);
  // Estado para armazenar o custo do upgrade de potência (começa em 10)
  const [compra1, setCompra1] = useState(10);
  // Estado para armazenar a potência de cada clique (começa em 1)
  const [potencia, setPotencia] = useState(1);
  // Estado para controlar qual página está visível ('clicker' ou 'loja')
  const [page, setPage] = useState('clicker');
  // Estado para saber se o upgrade de 1 ponto por segundo foi comprado
  const [AutoClicker1, setAutoClicker1] = useState(0);
  // Estado para armazenar o custo do upgrade de auto-clicker (50 pontos)
  const [custoAutoClicker, setCustoAutoClicker] = useState(50);
  const [custoAutoClicker2, setCustoAutoClicker2] = useState(100);
  const [custoAutoClicker3, setCustoAutoClicker3] = useState(350);
  const [custoAutoClicker4, setCustoAutoClicker4] = useState(500);

   const [compra2, setCompra2] = useState(75);
   
   const [compra3, setCompra3] = useState(200);
   
   const [compra4, setCompra4] = useState(400);

    const [compraS2, setCompraS2] = useState(100);

    const [compraS3, setCompraS3] = useState(200);



  // Função que executa quando o usuário clica em comprar upgrade de potência
  const executarcompra1 = () => {
    // Verifica se o usuário tem cliques suficientes para comprar
    if (contagem >= compra1) {
      // Subtrai o custo do upgrade do total de cliques
      setContagem(contagem - compra1);
      // Aumenta a potência em +1
      setPotencia(potencia + 1);
      // Aumenta o custo do próximo upgrade (exponencial)
      setCompra1(Math.floor(compra1 * 1.5));
      // Mostra um alerta de sucesso
      
    } else {
      // Se não tiver cliques suficientes, mostra alerta de erro
      Alert.alert('Saldo insuficiente', 'Você não tem cliques suficientes para comprar este upgrade.');
    }
  };

  
  const executarcompra2 = () => {
    // Verifica se o usuário tem cliques suficientes para comprar
    if (contagem >= compra2) {
      // Subtrai o custo do upgrade do total de cliques
      setContagem(contagem - compra2);
      // Aumenta a potência em +5
      setPotencia(potencia + 5);
      // Aumenta o custo do próximo upgrade (exponencial)
      setCompra2(Math.floor(compra2 * 1.5));
      // Mostra um alerta de sucesso
     
    } else {
      // Se não tiver cliques suficientes, mostra alerta de erro
      Alert.alert('Saldo insuficiente', 'Você não tem cliques suficientes para comprar este upgrade.');
    }
  };
  
const executarcompra3 = () => {
    // Verifica se o usuário tem cliques suficientes para comprar
    if (contagem >= compra3) {
      // Subtrai o custo do upgrade do total de cliques
      setContagem(contagem - compra3);
      // Aumenta a potência em +10
      setPotencia(potencia + 10);
      // Aumenta o custo do próximo upgrade (exponencial)
      setCompra3(Math.floor(compra3 * 1.5));
      // Mostra um alerta de sucesso
     
    } else {
      // Se não tiver cliques suficientes, mostra alerta de erro
      Alert.alert('Saldo insuficiente', 'Você não tem cliques suficientes para comprar este upgrade.');
    }
  };


  const executarcompra4 = () => {
    // Verifica se o usuário tem cliques suficientes para comprar
    if (contagem >= compra4) {
      // Subtrai o custo do upgrade do total de cliques
      setContagem(contagem - compra4);
      // Aumenta a potência em +20
      setPotencia(potencia + 20);
      // Aumenta o custo do próximo upgrade (exponencial)
      setCompra4(Math.floor(compra4 * 1.5));
      // Mostra um alerta de sucesso
      
    } else {
      // Se não tiver cliques suficientes, mostra alerta de erro
      Alert.alert('Saldo insuficiente', 'Você não tem cliques suficientes para comprar este upgrade.');
    }
  };










  // Função que executa quando o usuário clica em comprar o auto-clicker
  const executarcompraAutoClicker = () => {
    // Verifica se o usuário tem cliques suficientes para comprar
    if (contagem >= custoAutoClicker) {
      // Subtrai o custo do upgrade do total de cliques
      setContagem(contagem - custoAutoClicker);
      // Ativa o auto-clicker
      setContagemS(contagemS + 1);
      setCustoAutoClicker(Math.floor(custoAutoClicker * 1.5));
      // Mostra um alerta de sucesso
     
    } else {
      // Se não tiver cliques suficientes, mostra alerta de erro
      Alert.alert('Saldo insuficiente', 'Você precisa de ' + custoAutoClicker + ' cliques para comprar este upgrade.');
    }
  };


   // Função que executa quando o usuário clica em comprar o auto-clicker
  const executarcompraAutoClicker2 = () => {
    // Verifica se o usuário tem cliques suficientes para comprar
    if (contagem >= custoAutoClicker2) {
      // Subtrai o custo do upgrade do total de cliques
      setContagem(contagem - custoAutoClicker2);
      // Ativa o auto-clicker
      setContagemS(contagemS + 5);
      setCustoAutoClicker2(Math.floor(custoAutoClicker2 * 1.5));
      // Mostra um alerta de sucesso
    
    } else {
      // Se não tiver cliques suficientes, mostra alerta de erro
      Alert.alert('Saldo insuficiente', 'Você precisa de ' + custoAutoClicker2 + ' cliques para comprar este upgrade.');
    }
  };






  
  // Função que executa quando o usuário clica em comprar o auto-clicker
  const executarcompraAutoClicker3 = () => {
    // Verifica se o usuário tem cliques suficientes para comprar
    if (contagem >= custoAutoClicker3) {
      // Subtrai o custo do upgrade do total de cliques
      setContagem(contagem - custoAutoClicker3);
      // Ativa o auto-clicker
      setContagemS(contagemS + 10);
      setCustoAutoClicker3(Math.floor(custoAutoClicker3 * 1.5));
      // Mostra um alerta de sucesso
      
    } else {
      // Se não tiver cliques suficientes, mostra alerta de erro
      Alert.alert('Saldo insuficiente', 'Você precisa de ' + custoAutoClicker3 + ' cliques para comprar este upgrade.');
    }
  };


  
  // Função que executa quando o usuário clica em comprar o auto-clicker
  const executarcompraAutoClicker4 = () => {
    // Verifica se o usuário tem cliques suficientes para comprar
    if (contagem >= custoAutoClicker4) {
      // Subtrai o custo do upgrade do total de cliques
      setContagem(contagem - custoAutoClicker4);
      // Ativa o auto-clicker
      setContagemS(contagemS + 20);
      setCustoAutoClicker4(Math.floor(custoAutoClicker4 * 1.5));
      // Mostra um alerta de sucesso
     
    } else {
      // Se não tiver cliques suficientes, mostra alerta de erro
      Alert.alert('Saldo insuficiente', 'Você precisa de ' + custoAutoClicker4 + ' cliques para comprar este upgrade.');
    }
  };

  // Função que executa quando o usuário clica no botão principal
  const executarClique = () => {
    // Aumenta a contagem pela potência atual (1, 2, 3... conforme upgrades)
    setContagem(contagem + potencia);
    // Verifica se o usuário alcançou 10 cliques
    if (contagem + potencia >= 10) {

    }
  };

  // useEffect que executa a cada segundo para o auto-clicker
  useEffect(() => {
    if (contagemS) {
      const intervalo = setInterval(() => {
        // Adiciona 1 clique automaticamente
        setContagem(prev => prev + contagemS);
      }, 1000);
      return () => clearInterval(intervalo);
    }
  }, [contagemS]);

  // JSX - Retorna a interface visual do aplicativo
  return (
    <View style={styles.container}>
      {/* PÁGINA DE CLICKER - Mostra apenas se page === 'clicker' */}
      {page === 'clicker' && (
        <View style={styles.pageContentClicker}>
          {/* Título do jogo */}
          <Text style={styles.title}>GYM Simulator</Text>
          {/* Caixa que mostra os cliques */}
          <View style={styles.scoreBox}>
            {/* Label "Cliques" */}
            <Text style={styles.scoreLabel}>Cliques</Text>
            {/* Número atual de cliques */}
            <Text style={styles.count}>{contagem}</Text>
          </View>
          {/* Botão circular para clicar e ganhar pontos */}
          <TouchableOpacity style={styles.buttonCircular} onPress={executarClique}>
            <Text style={styles.buttonCircularText}>💪</Text>
          </TouchableOpacity>
          {/* Mostra a potência atual */}
          <Text style={styles.potenciaText}>Poder: {potencia}</Text>
          <Text style={styles.potenciaText}> por segundo: {contagemS}</Text>
        </View>
      )}

      {/* PÁGINA DE LOJA - Mostra apenas se page === 'loja' */}
      {page === 'loja' && (
        <ScrollView style={styles.pageContent}>
          {/* Título da loja */}
          <Text style={styles.title}>🛒 Loja de Upgrades</Text>
          {/* Caixa mostrando cliques disponíveis */}
          <View style={styles.scoreBox}>
            {/* Label de cliques */}
            <Text style={styles.scoreLabel}>Cliques Disponíveis</Text>
            {/* Número de cliques */}
            <Text style={styles.count}>{contagem}</Text>
          </View>
          
          {/* Card do upgrade de potência - é clicável para comprar */}
          <TouchableOpacity style={styles.upgradeCard} onPress={executarcompra1}>
            {/* Cabeçalho do card com nome e custo */}
            <View style={styles.upgradeHeader}>
              {/* Nome do upgrade */}
              <Text style={styles.upgradeName}>💪flexão</Text>
              {/* Custo do upgrade */}
              <Text style={styles.upgradeCost}>{compra1}</Text>
            </View>
            {/* Descrição do que o upgrade faz */}
            <Text style={styles.upgradeDesc}>O Inicio do imperio</Text>
            {/* Mostra quanto a potência vai aumentar */}
            <Text style={styles.upgradePotencia}>Poder atual: +{potencia} → +{potencia + 1}</Text>
          </TouchableOpacity>

         
           
          {/* Card do upgrade de potência - é clicável para comprar */}
          <TouchableOpacity style={styles.upgradeCard} onPress={executarcompraAutoClicker}>
            {/* Cabeçalho do card com nome e custo */}
            <View style={styles.upgradeHeader}>
              {/* Nome do upgrade */}
              <Text style={styles.upgradeName}>📹 Videos do Youtube</Text>
              {/* Custo do upgrade */}
              <Text style={styles.upgradeCost}>{custoAutoClicker}</Text>
            </View>
            {/* Descrição do que o upgrade faz */}
            <Text style={styles.upgradeDesc}>Videos de exercicos duvidosos</Text>
            {/* Mostra quanto a potência vai aumentar */}
            <Text style={styles.upgradePotencia}>Poder atual: +{contagemS} → +{contagemS + 1}</Text>
          </TouchableOpacity>






           
          {/* Card do upgrade de potência - é clicável para comprar */}
          <TouchableOpacity style={styles.upgradeCard} onPress={executarcompra2}>
            {/* Cabeçalho do card com nome e custo */}
            <View style={styles.upgradeHeader}>
              {/* Nome do upgrade */}
              <Text style={styles.upgradeName}>🏋️Academia</Text>
              {/* Custo do upgrade */}
              <Text style={styles.upgradeCost}>{compra2}</Text>
            </View>
            {/* Descrição do que o upgrade faz */}
            <Text style={styles.upgradeDesc}>mostrando sua força</Text>
            {/* Mostra quanto a potência vai aumentar */}
            <Text style={styles.upgradePotencia}>Poder atual: +{potencia} → +{potencia + 5}</Text>
          </TouchableOpacity>

              
          {/* Card do upgrade de potência - é clicável para comprar */}
          <TouchableOpacity style={styles.upgradeCard} onPress={executarcompraAutoClicker2}>
            {/* Cabeçalho do card com nome e custo */}
            <View style={styles.upgradeHeader}>
              {/* Nome do upgrade */}
              <Text style={styles.upgradeName}>👩🏻‍🦲Personal</Text>
              {/* Custo do upgrade */}
              <Text style={styles.upgradeCost}>{custoAutoClicker2}</Text>
            </View>
            {/* Descrição do que o upgrade faz */}
            <Text style={styles.upgradeDesc}>aprendo a fazer lentinho</Text>
            {/* Mostra quanto a potência vai aumentar */}
            <Text style={styles.upgradePotencia}>Poder atual: +{contagemS} → +{contagemS + 5}</Text>
          </TouchableOpacity>

          

            
          {/* Card do upgrade de potência - é clicável para comprar */}
          <TouchableOpacity style={styles.upgradeCard} onPress={executarcompra3}>
            {/* Cabeçalho do card com nome e custo */}
            <View style={styles.upgradeHeader}>
              {/* Nome do upgrade */}
              <Text style={styles.upgradeName}>❚█══█❚ Musculação</Text>
              {/* Custo do upgrade */}
              <Text style={styles.upgradeCost}>{compra3}</Text>
            </View>
            {/* Descrição do que o upgrade faz */}
            <Text style={styles.upgradeDesc}>mostre o mosntro enjaulado</Text>
            {/* Mostra quanto a potência vai aumentar */}
            <Text style={styles.upgradePotencia}>Poder atual: +{potencia} → +{potencia + 10}</Text>
          </TouchableOpacity>

              
          {/* Card do upgrade de potência - é clicável para comprar */}
          <TouchableOpacity style={styles.upgradeCard} onPress={executarcompraAutoClicker3}>
            {/* Cabeçalho do card com nome e custo */}
            <View style={styles.upgradeHeader}>
              {/* Nome do upgrade */}
              <Text style={styles.upgradeName}> 🏋🏼‍♂️🏋🏾‍♀️GYM-bro</Text>
              {/* Custo do upgrade */}
              <Text style={styles.upgradeCost}>{custoAutoClicker3}</Text>
            </View>
            {/* Descrição do que o upgrade faz */}
            <Text style={styles.upgradeDesc}>Que a disputa começe</Text>
            {/* Mostra quanto a potência vai aumentar */}
            <Text style={styles.upgradePotencia}>Poder atual: +{contagemS} → +{contagemS + 10}</Text>
          </TouchableOpacity>
  
  
            
          {/* Card do upgrade de potência - é clicável para comprar */}
          <TouchableOpacity style={styles.upgradeCard} onPress={executarcompra4}>
            {/* Cabeçalho do card com nome e custo */}
            <View style={styles.upgradeHeader}>
              {/* Nome do upgrade */}
              <Text style={styles.upgradeName}> 💉 Testo</Text>
              {/* Custo do upgrade */}
              <Text style={styles.upgradeCost}>{compra4}</Text>
            </View>
            {/* Descrição do que o upgrade faz */}
            <Text style={styles.upgradeDesc}>Aqui o monstro saida jaula</Text>
            {/* Mostra quanto a potência vai aumentar */}
            <Text style={styles.upgradePotencia}>Poder atual: +{potencia} → +{potencia + 20}</Text>
          </TouchableOpacity>
         

              
          {/* Card do upgrade de potência - é clicável para comprar */}
          <TouchableOpacity style={styles.upgradeCard} onPress={executarcompraAutoClicker4}>
            {/* Cabeçalho do card com nome e custo */}
            <View style={styles.upgradeHeader}>
              {/* Nome do upgrade */}
              <Text style={styles.upgradeName}> 🎀GYM-chusr</Text>
              {/* Custo do upgrade */}
              <Text style={styles.upgradeCost}>{custoAutoClicker4}</Text>
            </View>
            {/* Descrição do que o upgrade faz */}
            <Text style={styles.upgradeDesc}>zerando a vida</Text>
            {/* Mostra quanto a potência vai aumentar */}
            <Text style={styles.upgradePotencia}>Poder atual: +{contagemS} → +{contagemS + 20}</Text>
          </TouchableOpacity>

        
          
        </ScrollView>
      )}

      {/* BARRA DE NAVEGAÇÃO - Sempre visível na parte de baixo */}
      <View style={styles.navBar}>
        {/* Botão para ir para página de Clicker */}
        <TouchableOpacity 
          // Aplica estilo ativo se page === 'clicker'
          style={[styles.navButton, page === 'clicker' && styles.navButtonActive]} 
          // Muda para página de clicker ao tocar
          onPress={() => setPage('clicker')}
        >
          <Text style={styles.navButtonText}>Clicker</Text>
        </TouchableOpacity>
        
        {/* Botão para ir para página de Loja */}
        <TouchableOpacity 
          // Aplica estilo ativo se page === 'loja'
          style={[styles.navButton, page === 'loja' && styles.navButtonActive]} 
          // Muda para página de loja ao tocar
          onPress={() => setPage('loja')}
        >
          <Text style={styles.navButtonText}>🛒 Loja</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Cria os estilos do aplicativo
const styles = StyleSheet.create({
  // Container principal - ocupa a tela inteira
  container: {
    flex: 1, // Ocupa 100% da altura da tela
    backgroundColor: '#000000', // Cor de fundo preta (dark mode)
  },
  // Conteúdo da página (clicker ou loja)
  pageContent: {
    flex: 1, // Ocupa espaço disponível
    paddingHorizontal: 20, // Espaço nas laterais
    paddingTop: 20, // Espaço no topo
    paddingBottom: 100, // Espaço no rodapé (para não cobrir barra de nav)
    overflow: 'scroll', // Permite scroll quando necessário
  },
  // Conteúdo específica da página de clicker (centralizado)
  pageContentClicker: {
    flex: 1, // Ocupa espaço disponível
    alignItems: 'center', // Centraliza horizontalmente
    justifyContent: 'center', // Centraliza verticalmente
    paddingHorizontal: 20, // Espaço nas laterais
    paddingTop: 20, // Espaço no topo
    paddingBottom: 100, // Espaço no rodapé (para não cobrir barra de nav)
  },
  // Estilo do título
  title: {
    fontSize: 32, // Tamanho grande
    fontWeight: 'bold', // Negrito
    marginBottom: 30, // Espaço abaixo
    color: '#fff', // Branco
    textAlign: 'center', // Centralizado
    letterSpacing: 2, // Espaço entre letras
  },
  // Caixa que mostra o score
  scoreBox: {
    backgroundColor: '#0f0f0f', // Fundo preto escuro
    borderRadius: 20, // Cantos bem arredondados
    paddingVertical: 15, // Espaço cima/baixo
    paddingHorizontal: 30, // Espaço esquerda/direita
    marginBottom: 30, // Espaço abaixo
    alignItems: 'center', // Centraliza conteúdo
    borderLeftWidth: 5, // Borda esquerda de 5px
    borderLeftColor: '#00ff41', // Borda verde neon
    width: '100%', // Ocupa toda a largura
  },
  // Label da caixa de score
  scoreLabel: {
    fontSize: 14, // Pequeno
    color: '#00ff41', // Verde neon
    fontWeight: '600', // Semi-bold
    marginBottom: 5, // Espaço abaixo
  },
  // Número do score
  count: {
    fontSize: 56, // Gigante
    fontWeight: 'bold', // Negrito
    color: '#00ff41', // Verde neon
  },
  // Botão circular para clicar
  buttonCircular: {
    width: 160, // Largura 160px
    height: 160, // Altura 160px (quadrado)
    borderRadius: 80, // Metade da largura = círculo perfeito
    backgroundColor: '#1a5d3a', // Verde escuro
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    marginBottom: 30, // Espaço abaixo
    elevation: 10, // Sombra (Android)
    shadowColor: '#00ff41', // Cor da sombra = verde neon
    shadowOffset: { width: 0, height: 10 }, // Sombra cai 10px pra baixo
    shadowOpacity: 0.5, // Sombra com 50% de opacidade
    shadowRadius: 20, // Sombra suave (blur 20px)
  },
  // Emoji dentro do botão circular
  buttonCircularText: {
    fontSize: 80, // Emoji gigante
  },
  // Texto mostrando a potência
  potenciaText: {
    fontSize: 18, // Médio
    color: '#00ff41', // Verde neon
    fontWeight: 'bold', // Negrito
    marginTop: 20, // Espaço acima
  },
  // Card de upgrade na loja
  upgradeCard: {
    backgroundColor: '#0f0f0f', // Fundo preto escuro
    borderRadius: 15, // Cantos arredondados
    padding: 20, // Espaço interno
    marginBottom: 20, // Espaço abaixo
    width: '100%', // Ocupa toda a largura
    borderLeftWidth: 5, // Borda esquerda de 5px
    borderLeftColor: '#00ff41', // Borda verde neon
    elevation: 5, // Sombra (Android)
    shadowColor: '#00ff41', // Cor da sombra = verde neon
    shadowOffset: { width: 0, height: 5 }, // Sombra cai 5px pra baixo
    shadowOpacity: 0.3, // Sombra com 30% de opacidade
    shadowRadius: 10, // Sombra suave
  },
  // Card de upgrade quando está ativo
  upgradeCardActive: {
    borderLeftColor: '#ff00ff', // Borda magenta para ativo
    shadowColor: '#ff00ff', // Sombra magenta
    shadowOpacity: 0.5, // Sombra mais visível
  },
  // Cabeçalho do card (nome + custo)
  upgradeHeader: {
    flexDirection: 'row', // Alinha horizontalmente
    justifyContent: 'space-between', // Espaça os items
    alignItems: 'center', // Centraliza verticalmente
    marginBottom: 10, // Espaço abaixo
  },
  // Nome do upgrade
  upgradeName: {
    fontSize: 18, // Grande
    fontWeight: 'bold', // Negrito
    color: '#fff', // Branco
  },
  // Custo do upgrade
  upgradeCost: {
    fontSize: 16, // Médio
    fontWeight: 'bold', // Negrito
    color: '#00ff41', // Verde neon
  },
  // Descrição do upgrade
  upgradeDesc: {
    fontSize: 14, // Pequeno
    color: '#888888', // Cinza escuro
    marginBottom: 10, // Espaço abaixo
  },
  // Texto mostrando aumento de potência
  upgradePotencia: {
    fontSize: 13, // Pequeno
    color: '#00ff41', // Verde neon
    fontWeight: '600', // Semi-bold
  },
  // Barra de navegação na parte de baixo
  navBar: {
    position: 'absolute', // Fica sobre os outros elementos
    bottom: 0, // Na parte de baixo
    left: 0, // Alinhado à esquerda
    right: 0, // Alinhado à direita
    flexDirection: 'row', // Alinha horizontalmente
    backgroundColor: '#0a0a0a', // Preto quase puro
    height: 80, // Altura de 80px
    borderTopWidth: 2, // Borda superior de 2px
    borderTopColor: '#00ff41', // Borda verde neon
    elevation: 15, // Sombra (Android)
    shadowColor: '#000', // Sombra preta
    shadowOffset: { width: 0, height: -5 }, // Sombra sai pra cima
    shadowOpacity: 0.3, // Sombra com 30% de opacidade
    shadowRadius: 10, // Sombra suave
  },
  // Botões da barra de navegação
  navButton: {
    flex: 1, // Ocupa espaço igual
    justifyContent: 'center', // Centraliza verticalmente
    alignItems: 'center', // Centraliza horizontalmente
    paddingVertical: 10, // Espaço cima/baixo
  },
  // Estilo do botão quando está ativo
  navButtonActive: {
    borderBottomWidth: 4, // Borda inferior de 4px
    borderBottomColor: '#00ff41', // Borda verde neon
  },
  // Texto dos botões de navegação
  navButtonText: {
    color: '#fff', // Branco
    fontSize: 16, // Médio
    fontWeight: 'bold', // Negrito
  },
});

// Exporta o componente para ser usado
export default App;