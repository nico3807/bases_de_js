// Exécution pas à pas de la page « Variables » (voir js/trace.js).

Trace.monter('#trace-echange', {
  titre: 'Exécution pas à pas : échange avec une variable temporaire',
  code: [
    'let a = 5;',
    'let b = 8;',
    'let temp = a;',
    'a = b;',
    'b = temp;',
    'console.log(a, b);'
  ],
  variables: ['a', 'b', 'temp'],
  executer: function* (v, ecrire) {
    v.a = 5;
    yield [1, 'On crée la boîte a et on y range 5.'];
    v.b = 8;
    yield [2, 'On crée la boîte b et on y range 8.'];
    v.temp = v.a;
    yield [3, 'On COPIE la valeur de a dans temp. a garde sa valeur : l\'affectation copie, elle ne déplace pas.'];
    v.a = v.b;
    yield [4, 'a reçoit la valeur de b : son ancien contenu (5) est écrasé… mais on l\'a mis à l\'abri dans temp !'];
    v.b = v.temp;
    yield [5, 'b reçoit la valeur de temp, c\'est-à-dire l\'ancienne valeur de a.'];
    ecrire(v.a, v.b);
    yield [6, 'On affiche a et b : les valeurs sont bien échangées.'];
  }
});
