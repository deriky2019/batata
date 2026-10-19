/* Shadow of War v58 - rotina noturna universal e hospedagem de companheiro.
   Integrado ao ciclo existente; funciona offline e guarda a decisão por dia. */
(function(){
  let noiteProcessada = -1;
  function chaveDia(){ return String(typeof diaAtual === 'function' ? diaAtual() : 0); }
  function processarNoite(){
    if (typeof cicloEhNoite !== 'function' || !cicloEhNoite()) { noiteProcessada = -1; return; }
    const dia = chaveDia();
    if (noiteProcessada === dia) return;
    noiteProcessada = dia;
    if (typeof diario === 'undefined' || !diario.escolhas) return;
    const dados = diario.escolhas.rotinaNoturna || (diario.escolhas.rotinaNoturna = {});
    if (dados[dia]) return;
    dados[dia] = true;
    // O sistema de NPCs v55 já recolhe os moradores marcados para dormir e aplica rotinas por período.
    // Aqui tratamos o companheiro ativo, independentemente de quem seja.
    if (typeof AM !== 'function' || typeof AMIGOS === 'undefined') return;
    const nome = AM().comp;
    if (!nome || !AMIGOS[nome]) return;
    // Durante noites especiais da história, respeitar as regras narrativas existentes.
    if (typeof noiteAtiva === 'function' && noiteAtiva()) return;
    const aceitar = window.confirm(nome + ' já está com você e pergunta: “Está ficando tarde. Posso dormir na sua casa esta noite?”\n\nOK = aceitar (+5 de amizade)\nCancelar = recusar e encerrar o companheirismo (-10 de amizade).');
    if (aceitar) {
      if (typeof amizadeGanhar === 'function') amizadeGanhar(nome, 5, 'hospedagem_noite_' + dia + '_' + nome, true);
      if (typeof filaAmizade !== 'undefined') filaAmizade.push(nome + ' vai passar a noite na sua casa. Vocês se sentem mais próximos.');
      dados['hospedado_' + dia] = nome;
    } else {
      if (typeof amizadeGanhar === 'function') amizadeGanhar(nome, -10, 'recusa_hospedagem_' + dia + '_' + nome, true);
      AM().comp = '';
      if (typeof companheiro !== 'undefined') companheiro = null;
      if (typeof filaAmizade !== 'undefined') filaAmizade.push(nome + ' ficou magoado, voltou para a própria casa e deixou de ser seu companheiro.');
      dados['recusado_' + dia] = nome;
    }
  }
  window.atualizarRotinaNoturnaV58 = processarNoite;
})();
