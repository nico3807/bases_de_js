// Exécutions pas à pas de la page « Boucles » (voir js/trace.js).

Trace.monter('#trace-somme', {
  titre: 'Exécution pas à pas : la somme 1 + 2 + … + n',
  parametres: [{ nom: 'n', libelle: 'n =', valeur: 4, type: 'number', min: 0, max: 20 }],
  code: function (p) {
    return [
      'let n = ' + p.n + ';',
      'let somme = 0;',
      'for (let i = 1; i <= n; i++) {',
      '  somme = somme + i;',
      '}',
      'console.log("Somme : " + somme);'
    ];
  },
  variables: ['n', 'somme', 'i'],
  executer: function* (v, ecrire, p) {
    v.n = p.n;
    yield [1, 'On range ' + p.n + ' dans n.'];
    v.somme = 0;
    yield [2, 'Accumulateur : la somme part de 0, avant la boucle.'];
    v.i = 1;
    yield [3, 'Initialisation (une seule fois) : i vaut 1.'];
    while (true) {
      var ok = v.i <= v.n;
      yield [3, 'Condition : i <= n ? ' + v.i + ' <= ' + v.n + ' → ' + (ok ? 'vrai, on fait un tour.' : 'faux, on sort de la boucle.')];
      if (!ok) break;
      var avant = v.somme;
      v.somme = v.somme + v.i;
      yield [4, 'somme reçoit somme + i, soit ' + avant + ' + ' + v.i + ' = ' + v.somme + '.'];
      v.i++;
      yield [3, 'Fin du tour, incrémentation : i++ → i vaut maintenant ' + v.i + '.'];
    }
    delete v.i;
    yield [5, 'Sortie de la boucle. i a été déclarée dans le for : elle n\'existe plus en dehors.'];
    ecrire('Somme : ' + v.somme);
    yield [6, 'On affiche le résultat accumulé.'];
  }
});

Trace.monter('#trace-abonnes', {
  titre: 'Exécution pas à pas : doubler ses abonné·es',
  parametres: [{ nom: 'depart', libelle: 'abonnés au départ :', valeur: 100, type: 'number', min: 0, max: 5000 }],
  code: function (p) {
    return [
      'let abonnes = ' + p.depart + ';',
      'let semaines = 0;',
      'while (abonnes < 1000) {',
      '  abonnes = abonnes * 2;',
      '  semaines = semaines + 1;',
      '}',
      'console.log(semaines + " semaines");'
    ];
  },
  variables: ['abonnes', 'semaines'],
  executer: function* (v, ecrire, p) {
    v.abonnes = p.depart;
    yield [1, 'On part de ' + p.depart + ' abonné·es.'];
    v.semaines = 0;
    yield [2, 'Compteur de semaines à 0.'];
    while (true) {
      var ok = v.abonnes < 1000;
      yield [3, 'Condition : abonnes < 1000 ? ' + v.abonnes + ' < 1000 → ' + (ok ? 'vrai, on fait un tour.' : 'faux, on sort de la boucle.')];
      if (!ok) break;
      v.abonnes = v.abonnes * 2;
      yield [4, 'Le nombre d\'abonné·es double : ' + v.abonnes + '.'];
      v.semaines = v.semaines + 1;
      yield [5, 'Une semaine de plus : ' + v.semaines + '.'];
    }
    ecrire(v.semaines + ' semaines');
    yield [7, 'On affiche le nombre de semaines.'];
  }
});
