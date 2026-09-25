// Exécution pas à pas de la page « Conditions » (voir js/trace.js).

Trace.monter('#trace-cinema', {
  titre: 'Exécution pas à pas : le tarif du cinéma',
  parametres: [{ nom: 'age', libelle: 'age =', valeur: 15, type: 'number' }],
  code: function (p) {
    return [
      'let age = ' + p.age + ';',
      'let tarif;',
      'if (age < 14) {',
      '  tarif = 5;',
      '} else if (age < 26) {',
      '  tarif = 7.5;',
      '} else {',
      '  tarif = 11;',
      '}',
      'console.log("Tarif : " + tarif + " €");'
    ];
  },
  variables: ['age', 'tarif'],
  executer: function* (v, ecrire, p) {
    v.age = p.age;
    yield [1, 'On range ' + p.age + ' dans age.'];
    v.tarif = undefined;
    yield [2, 'On crée la boîte tarif, sans valeur pour l\'instant (undefined).'];
    if (v.age < 14) {
      yield [3, 'Test : age < 14 ? ' + v.age + ' < 14 → vrai. On entre dans ce bloc.'];
      v.tarif = 5;
      yield [4, 'tarif reçoit 5. Les autres blocs seront sautés.'];
    } else {
      yield [3, 'Test : age < 14 ? ' + v.age + ' < 14 → faux. On passe au test suivant.'];
      if (v.age < 26) {
        yield [5, 'Test : age < 26 ? ' + v.age + ' < 26 → vrai. On entre dans ce bloc.'];
        v.tarif = 7.5;
        yield [6, 'tarif reçoit 7.5. Le bloc else sera sauté.'];
      } else {
        yield [5, 'Test : age < 26 ? ' + v.age + ' < 26 → faux. Il ne reste que le else.'];
        yield [7, 'Aucune condition n\'était vraie : on exécute le bloc else.'];
        v.tarif = 11;
        yield [8, 'tarif reçoit 11.'];
      }
    }
    ecrire('Tarif : ' + v.tarif + ' €');
    yield [10, 'Après la structure if, le programme reprend son cours normal : on affiche le tarif.'];
  }
});
