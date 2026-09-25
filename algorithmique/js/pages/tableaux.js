// Exécutions pas à pas de la page « Tableaux » (voir js/trace.js).

// Transforme « 12, 8, 15 » en [12, 8, 15] ; les saisies invalides sont
// ignorées et la liste est limitée à 10 valeurs, pour que l'exécution
// reste lisible.
function lireNombres(texte) {
  var nombres = String(texte).split(',')
    .filter(function (x) { return x.trim() !== '' && !isNaN(Number(x)); })
    .map(Number)
    .slice(0, 10);
  return nombres.length ? nombres : [0];
}

Trace.monter('#trace-max', {
  titre: 'Exécution pas à pas : la meilleure note',
  parametres: [{ nom: 'liste', libelle: 'notes (séparées par des virgules) :', valeur: '12, 8, 15, 9, 17, 11', type: 'text' }],
  code: function (p) {
    return [
      'let notes = [' + lireNombres(p.liste).join(', ') + '];',
      'let max = notes[0];',
      'for (let i = 1; i < notes.length; i++) {',
      '  if (notes[i] > max) {',
      '    max = notes[i];',
      '  }',
      '}',
      'console.log("Meilleure note : " + max);'
    ];
  },
  variables: ['notes', 'max', 'i'],
  tableau: { nom: 'notes', indice: 'i' },
  executer: function* (v, ecrire, p) {
    v.notes = lireNombres(p.liste);
    yield [1, 'On crée le tableau : ' + v.notes.length + ' cases, indices de 0 à ' + (v.notes.length - 1) + '.'];
    v.max = v.notes[0];
    yield [2, 'Au départ, la meilleure note vue est la première : notes[0] = ' + v.max + '.'];
    v.i = 1;
    yield [3, 'La case 0 est déjà traitée : i commence à 1.'];
    while (true) {
      var ok = v.i < v.notes.length;
      yield [3, 'Condition : i < notes.length ? ' + v.i + ' < ' + v.notes.length + ' → ' + (ok ? 'vrai.' : 'faux, on a vu toutes les cases.')];
      if (!ok) break;
      if (v.notes[v.i] > v.max) {
        yield [4, 'notes[' + v.i + '] > max ? ' + v.notes[v.i] + ' > ' + v.max + ' → vrai : on a trouvé mieux !'];
        v.max = v.notes[v.i];
        yield [5, 'max retient la nouvelle meilleure note : ' + v.max + '.'];
      } else {
        yield [4, 'notes[' + v.i + '] > max ? ' + v.notes[v.i] + ' > ' + v.max + ' → faux : max ne change pas.'];
      }
      v.i++;
      yield [3, 'Incrémentation : i vaut ' + v.i + ', on passe à la case suivante.'];
    }
    delete v.i;
    yield [7, 'Fin de la boucle : max contient la plus grande valeur du tableau.'];
    ecrire('Meilleure note : ' + v.max);
    yield [8, 'On affiche le résultat.'];
  }
});

Trace.monter('#trace-recherche', {
  titre: 'Exécution pas à pas : ce prénom est-il dans le groupe ?',
  parametres: [{ nom: 'cherche', libelle: 'prénom cherché :', valeur: 'Inès', type: 'text' }],
  code: function (p) {
    return [
      'let groupe = ["Tom", "Inès", "Hugo", "Maëlle"];',
      'let cherche = "' + p.cherche + '";',
      'let trouve = false;',
      'let i = 0;',
      'while (i < groupe.length && !trouve) {',
      '  if (groupe[i] === cherche) {',
      '    trouve = true;',
      '  }',
      '  i++;',
      '}',
      'console.log(trouve);'
    ];
  },
  variables: ['groupe', 'cherche', 'trouve', 'i'],
  tableau: { nom: 'groupe', indice: 'i' },
  executer: function* (v, ecrire, p) {
    v.groupe = ['Tom', 'Inès', 'Hugo', 'Maëlle'];
    yield [1, 'Le tableau des prénoms du groupe.'];
    v.cherche = p.cherche;
    yield [2, 'Le prénom que l\'on cherche.'];
    v.trouve = false;
    yield [3, 'Tant qu\'on n\'a rien trouvé, trouve vaut false.'];
    v.i = 0;
    yield [4, 'On commence à la case 0.'];
    while (true) {
      var reste = v.i < v.groupe.length;
      var ok = reste && !v.trouve;
      yield [5, 'Condition : reste-t-il des cases (' + v.i + ' < 4 → ' + reste + ') ET pas encore trouvé (!trouve → ' + !v.trouve + ') ? → ' + (ok ? 'vrai, on continue.' : 'faux, on s\'arrête.')];
      if (!ok) break;
      if (v.groupe[v.i] === v.cherche) {
        yield [6, 'groupe[' + v.i + '] === cherche ? "' + v.groupe[v.i] + '" === "' + v.cherche + '" → vrai !'];
        v.trouve = true;
        yield [7, 'On le note : trouve passe à true. La boucle s\'arrêtera au prochain test, inutile de regarder la suite.'];
      } else {
        yield [6, 'groupe[' + v.i + '] === cherche ? "' + v.groupe[v.i] + '" === "' + v.cherche + '" → faux.'];
      }
      v.i++;
      yield [9, 'On avance à la case suivante : i vaut ' + v.i + '.'];
    }
    ecrire(v.trouve);
    yield [11, v.trouve ? 'Trouvé ! (Remarquez qu\'on n\'a pas parcouru tout le tableau.)' : 'Tout le tableau a été parcouru sans trouver le prénom. Attention : "ines" et "Inès" sont différents pour l\'ordinateur !'];
  }
});
