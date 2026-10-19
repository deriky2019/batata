/* =====================================================
   reputacao.js - Reputação da Dellalos na cidade
   COMO FUNCIONA
     - Cada missão SECUNDÁRIA concluída vale 1 ponto de reputação (as da lista MISSOES com
       secundaria: true, inclusive as missões pessoais dos amigos de js/amizade.js).
     - Os pontos NÃO são guardados à parte: são contados a partir de diario.fim (que já é salvo).
       Por isso saves antigos já ganham a reputação das missões que tinham terminado.
     - Quanto maior o nível, mais moedas os inimigos soltam (js/loja.js: moedasDoInimigo).
     - Ao subir de nível o jogo avisa junto com "Missão concluída" (js/missoes.js).
       O último nível avisado fica em diario.escolhas.repNivel.
     - Aparece no 🎒, no topo da caixa de missões (renderizarMissoes em js/missoes.js).
   PARA EQUILIBRAR: mude REPUTACAO_NIVEIS (min = pontos para chegar no nível, moedas = bônus, 0.10 = +10%).
   ===================================================== */

const REPUTACAO_NIVEIS = [
  { min: 0,  nome: "Desconhecida", moedas: 0 },
  { min: 2,  nome: "Conhecida",    moedas: 0.05 },
  { min: 5,  nome: "Querida",      moedas: 0.10 },
  { min: 9,  nome: "Respeitada",   moedas: 0.15 },
  { min: 14, nome: "Admirada",     moedas: 0.20 },
  { min: 20, nome: "Famosa",       moedas: 0.25 },
  { min: 28, nome: "Lendária",     moedas: 0.30 }
];

// Quantas missões secundárias já foram concluídas
function reputacaoPontos() {
  if (typeof MISSOES === "undefined" || !diario || !diario.fim) return 0;
  let n = 0;
  for (const m of MISSOES) if (m.secundaria && diario.fim[m.id]) n++;
  return n;
}

// Índice do nível atual em REPUTACAO_NIVEIS
function reputacaoNivel() {
  const p = reputacaoPontos();
  let nivel = 0;
  for (let i = 0; i < REPUTACAO_NIVEIS.length; i++) if (p >= REPUTACAO_NIVEIS[i].min) nivel = i;
  return nivel;
}

// Fração extra de moedas dos inimigos (0.10 = +10%)
function reputacaoBonusMoedas() {
  return REPUTACAO_NIVEIS[reputacaoNivel()].moedas;
}

// Chamado quando uma missão secundária acaba de ser concluída (js/missoes.js).
// Devolve o texto que entra no aviso "Missão concluída".
function reputacaoAoConcluir() {
  const nivel = reputacaoNivel();
  const avisado = Number(diario.escolhas.repNivel) || 0;
  if (nivel > avisado) {
    diario.escolhas.repNivel = nivel;
    const n = REPUTACAO_NIVEIS[nivel];
    return "Reputação: " + n.nome + "! Inimigos soltam +" + Math.round(n.moedas * 100) + "% de moedas.";
  }
  return "+1 de reputação.";
}

// Caixa de reputação no topo das missões do 🎒 (usa o mesmo estilo das missões)
function desenharReputacaoNaCaixa(caixa) {
  const nivel = reputacaoNivel();
  const atual = REPUTACAO_NIVEIS[nivel];
  const prox = REPUTACAO_NIVEIS[nivel + 1];
  const p = reputacaoPontos();

  const div = document.createElement("div");
  div.className = "missao";
  const h = document.createElement("h3");
  h.textContent = "REPUTAÇÃO";
  const t = document.createElement("p");
  t.className = "missao-titulo";
  t.textContent = atual.nome;
  const d = document.createElement("p");
  d.className = "missao-desc";
  d.textContent = p + " missões secundárias concluídas. Inimigos soltam +" + Math.round(atual.moedas * 100) + "% de moedas."
    + (prox ? " Próximo nível: " + prox.min + " missões (+" + Math.round(prox.moedas * 100) + "%)." : " Nível máximo!");
  div.append(h, t, d);
  caixa.appendChild(div);
}
