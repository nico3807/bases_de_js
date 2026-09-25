// Exécution pas à pas de la page « Fonctions » (voir js/trace.js).

Trace.monter('#trace-fonction', {
  titre: 'Exécution pas à pas : deux appels de fonction',
  code: [
    'function prixTTC(prixHT) {',
    '  let ttc = prixHT * 1.2;',
    '  return ttc;',
    '}',
    '',
    'let total = prixTTC(50) + prixTTC(10);',
    'console.log("Total TTC : " + total);'
  ],
  variables: ['prixHT', 'ttc', 'total'],
  executer: function* (v, ecrire) {
    yield [1, 'Définition de la fonction : l\'ordinateur la mémorise, mais n\'exécute pas son contenu. Il saute directement après l\'accolade fermante.'];
    var resultats = [];
    var appels = [50, 10];
    for (var k = 0; k < appels.length; k++) {
      yield [6, (k === 0 ? 'Pour calculer total, il faut d\'abord la valeur de prixTTC(50) : on appelle la fonction.' : 'Premier appel terminé. Il faut maintenant la valeur de prixTTC(10) : second appel.')];
      v.prixHT = appels[k];
      yield [1, 'On entre dans la fonction : le paramètre prixHT reçoit l\'argument ' + appels[k] + '.'];
      v.ttc = Math.round(v.prixHT * 1.2 * 100) / 100;
      yield [2, 'Variable locale : ttc = ' + v.prixHT + ' × 1.2 = ' + v.ttc + '.'];
      resultats.push(v.ttc);
      yield [3, 'return ttc : la fonction renvoie ' + v.ttc + ' et s\'arrête. prixHT et ttc vont disparaître.'];
      delete v.prixHT;
      delete v.ttc;
    }
    v.total = resultats[0] + resultats[1];
    yield [6, 'Retour à la ligne 6 : prixTTC(50) + prixTTC(10) vaut ' + resultats[0] + ' + ' + resultats[1] + ' = ' + v.total + '. Les variables locales n\'existent plus.'];
    ecrire('Total TTC : ' + v.total);
    yield [7, 'On affiche le total.'];
  }
});
