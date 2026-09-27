// Vérification automatique d'un exercice : le code de l'étudiant·e est
// exécuté dans le bac à sable (js/bac-a-sable.js) une fois par cas de test.
// Partagé par les exercices d'algorithmique et ceux du TD JavaScript.
//
// Un cas peut :
//   - remplacer la valeur de départ d'une variable (valeurs: { n: 7 }) : la
//     ligne « let n = ...; » du code est réécrite ;
//   - comparer la console à « sortie » (tableau de lignes attendues) ;
//   - évaluer une expression « appel » et comparer au résultat « attendu ».

var Verification = (function () {
  function echapper(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Réécrit « let n = ... ; » avec la valeur du cas testé. Renvoie null si
  // la ligne a disparu du code de l'étudiant·e.
  function remplacerValeurs(code, valeurs) {
    var resultat = code;
    var noms = Object.keys(valeurs || {});
    for (var k = 0; k < noms.length; k++) {
      var motif = new RegExp('^(\\s*(?:let|const|var)\\s+' + noms[k] + '\\s*=\\s*)[^;\\n]*', 'm');
      if (!motif.test(resultat)) return { manquante: noms[k] };
      var litteral = BacASable.formater(valeurs[noms[k]], true);
      resultat = resultat.replace(motif, function (tout, debut) { return debut + litteral; });
    }
    return { code: resultat };
  }

  function decrireValeurs(valeurs) {
    return Object.keys(valeurs || {}).map(function (nom) {
      return nom + ' = ' + BacASable.formater(valeurs[nom], true);
    }).join(', ');
  }

  function nettoyer(lignes) {
    var res = lignes.map(function (l) { return String(l).replace(/\s+$/, ''); });
    while (res.length && res[res.length - 1] === '') res.pop();
    return res;
  }

  function verifierCas(code, cas) {
    var prep = remplacerValeurs(code, cas.valeurs);
    var libelle = cas.appel ? '<code>' + echapper(cas.appel) + '</code>' : 'Avec ' + echapper(decrireValeurs(cas.valeurs));
    if (prep.manquante) {
      return Promise.resolve({
        ok: false,
        texte: libelle + ' : la ligne <code>let ' + echapper(prep.manquante) + ' = …;</code> a disparu. Gardez-la en haut du code : c\'est elle que la vérification modifie.'
      });
    }
    return BacASable.executer(prep.code, cas.appel).then(function (res) {
      if (res.erreur) {
        return { ok: false, texte: libelle + ' : erreur « ' + echapper(res.erreur) + ' »', res: res };
      }
      if (cas.appel) {
        var attendu = BacASable.formater(cas.attendu, true);
        return res.valeur === attendu
          ? { ok: true, texte: libelle + ' renvoie bien <code>' + echapper(attendu) + '</code>', res: res }
          : { ok: false, texte: libelle + ' devrait renvoyer <code>' + echapper(attendu) + '</code>, votre fonction renvoie <code>' + echapper(res.valeur) + '</code>', res: res };
      }
      var obtenu = nettoyer(res.sortie);
      var voulu = nettoyer(cas.sortie);
      for (var i = 0; i < Math.max(obtenu.length, voulu.length); i++) {
        if (obtenu[i] !== voulu[i]) {
          var texte = libelle + ', ligne ' + (i + 1) + ' : attendu ' +
            (voulu[i] === undefined ? '<em>rien</em>' : '« <code>' + echapper(voulu[i]) + '</code> »') +
            ', obtenu ' + (obtenu[i] === undefined ? '<em>rien</em>' : '« <code>' + echapper(obtenu[i]) + '</code> »');
          return { ok: false, texte: texte, res: res };
        }
      }
      return { ok: true, texte: libelle + ' : sortie correcte', res: res };
    });
  }

  // Vérifie tous les cas d'un exercice.
  // Résultat : { resultats: [{ ok, texte, res }], reussis, total, tout }.
  function verifier(exo, code) {
    return Promise.all(exo.cas.map(function (cas) { return verifierCas(code, cas); }))
      .then(function (resultats) {
        var reussis = resultats.filter(function (r) { return r.ok; }).length;
        return { resultats: resultats, reussis: reussis, total: resultats.length, tout: reussis === resultats.length };
      });
  }

  return { verifier: verifier, echapper: echapper };
})();
