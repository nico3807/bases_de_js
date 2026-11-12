// Questions de la validation en séance (js/seance.js) pour les exercices
// vérifiés par le bac à sable (algorithmique et TD) : on demande ce que le
// programme de l'étudiant·e affiche, ou ce que sa fonction renvoie, avec une
// autre valeur de départ que celle de l'énoncé. Son programme ayant passé la
// vérification, la bonne réponse est celle des cas de test de l'exercice.

var QuestionsCode = (function () {
  var echapper = Verification.echapper;

  function auHasard(t) {
    return t[Math.floor(Math.random() * t.length)];
  }

  function pour(exo) {
    // On évite le premier cas : c'est en général l'exemple de l'énoncé.
    var cas = auHasard(exo.cas.length > 1 ? exo.cas.slice(1) : exo.cas);
    if (cas.appel) {
      var attendu = BacASable.formater(cas.attendu, true);
      return {
        texte: 'Avec votre fonction, que renvoie <code>' + echapper(cas.appel) + '</code> ?',
        reponses: [attendu]
      };
    }
    var lignes = Verification.nettoyer(cas.sortie);
    var valeurs = Verification.decrireValeurs(cas.valeurs);
    var avec = 'Si l\'on remplace la valeur de départ par <code>' + echapper(valeurs) + '</code>';
    if (lignes.length === 1) {
      return { texte: avec + ', qu\'affiche votre programme ?', reponses: [lignes[0]] };
    }
    var k = Math.floor(Math.random() * lignes.length);
    return {
      texte: avec + ', votre programme affiche ' + lignes.length + ' lignes. Quelle est la ligne n° ' + (k + 1) + ' ?',
      reponses: [lignes[k]]
    };
  }

  return { pour: pour };
})();
