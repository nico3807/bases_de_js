// Fiches d'exercices en accordéon (même principe que les fiches de scénarios
// du TP R3.14) : consigne, bac à sable, vérification automatique, indice et
// solution. Partagé par les exercices d'algorithmique et ceux du TD.
//
// Fiches.afficher(conteneur, exercices, parcours, {
//   libelle: function (exo) { return 'Boucles'; },  // étiquette de droite
//   ouvrir: 'exo-4',                                  // fiche ouverte d'office
//   onProgression: function () {}                     // après chaque réussite
// });
// Sans étudiant·e identifié·e, un bouton invite à s'identifier.

var Fiches = (function () {
  var NIVEAUX = { 1: 'facile', 2: 'moyen', 3: 'défi' };
  var echapper = Verification.echapper;

  function carteHtml(exo, options) {
    return '<div class="exo" id="exo-' + exo.id + '">' +
      '<div class="exo-head">' +
        '<input type="checkbox" class="exo-check" disabled tabindex="-1" aria-label="Exercice ' + exo.id + ' réussi" title="Se coche automatiquement quand la vérification réussit">' +
        '<div class="exo-num">' + exo.id + '</div>' +
        '<h3>' + echapper(exo.titre) +
          ' <span class="niveau niveau-' + exo.niveau + '">' + NIVEAUX[exo.niveau] + '</span></h3>' +
        '<span class="exo-meta">' + echapper(options.libelle ? options.libelle(exo) : '') + '</span>' +
        '<span class="exo-caret" aria-hidden="true">&#9656;</span>' +
      '</div>' +
      '<div class="exo-body">' +
        exo.consigne +
        '<div class="essai"></div>' +
        '<div class="exo-actions">' +
          '<button type="button" class="btn secondary petit" data-affiche="indice-' + exo.id + '">💡 Un indice</button>' +
          '<button type="button" class="btn secondary petit voir-solution" data-affiche="solution-' + exo.id + '">Voir une solution</button>' +
        '</div>' +
        '<div class="indice" id="indice-' + exo.id + '" hidden><strong>Indice —</strong> ' + exo.indice + '</div>' +
        '<div class="solution" id="solution-' + exo.id + '" hidden><strong>Une solution possible</strong> (il en existe d\'autres !)' +
          '<pre><code>' + echapper(exo.solution) + '</code></pre></div>' +
      '</div>' +
    '</div>';
  }

  function marquer(carte) {
    carte.classList.add('done');
    carte.querySelector('.exo-check').checked = true;
  }

  function verifier(exo, carte, code, verdict, sortie, parcours, options) {
    Verification.verifier(exo, code).then(function (v) {
      // La console montre ce qu'a produit le premier cas qui échoue (ou le
      // premier cas), pour que l'étudiant·e voie d'où vient l'écart.
      var montre = v.resultats.filter(function (r) { return !r.ok && r.res; })[0] || v.resultats[0];
      if (montre && montre.res) BacASable.afficherSortie(sortie, montre.res);
      verdict.className = 'essai-verdict ' + (v.tout ? 'ok' : 'ko');
      verdict.innerHTML =
        (v.tout ? '✔ Bravo, tous les cas sont validés !' : '✘ ' + v.reussis + ' cas validé(s) sur ' + v.total + '.') +
        '<ul style="margin:0.4rem 0 0;font-weight:400">' +
        v.resultats.map(function (r) { return '<li>' + (r.ok ? '✔ ' : '✘ ') + r.texte + '</li>'; }).join('') +
        '</ul>';
      parcours.noterTentative(exo, v.tout, v.reussis, v.total);
      if (v.tout) marquer(carte);
      if (options.onProgression) options.onProgression();
    });
  }

  function afficher(conteneur, exercices, parcours, options) {
    options = options || {};
    if (!parcours.etudiant()) {
      conteneur.innerHTML =
        '<div class="callout info"><p>Identifiez-vous (prénom et nom) pour faire les exercices : ' +
        'votre progression sera enregistrée à votre nom et comptera pour votre certificat PDF.</p>' +
        '<p><button type="button" class="btn">👋 S\'identifier</button></p></div>';
      conteneur.querySelector('button').addEventListener('click', function () {
        parcours.exigerEtudiant(function () {});
      });
      return;
    }

    conteneur.innerHTML = exercices.map(function (exo) { return carteHtml(exo, options); }).join('');
    exercices.forEach(function (exo) {
      var carte = document.getElementById('exo-' + exo.id);
      var dejaTape = parcours.code(exo.id);
      var essai = BacASable.monter(carte.querySelector('.essai'), {
        code: dejaTape !== undefined ? dejaTape : exo.code,
        codeInitial: exo.code,
        titre: 'Votre code',
        onVerifier: function (code, verdict, sortie) { verifier(exo, carte, code, verdict, sortie, parcours, options); }
      });
      essai.zone.addEventListener('input', function () { parcours.sauverCode(exo.id, essai.zone.value); });

      // Consulter la solution reste permis, mais c'est noté dans le
      // certificat : l'enseignant·e sait ainsi comment l'exercice a été réussi.
      carte.querySelector('.voir-solution').addEventListener('click', function () {
        parcours.noterSolution(exo.id);
      });

      if (parcours.estFait(exo.id)) marquer(carte);
      carte.querySelector('.exo-head').addEventListener('click', function () {
        carte.classList.toggle('open');
      });
    });

    var cible = options.ouvrir && document.getElementById(options.ouvrir);
    if (cible && cible.classList.contains('exo')) cible.classList.add('open');
    else if (options.ouvrir !== false && conteneur.querySelector('.exo')) conteneur.querySelector('.exo').classList.add('open');
  }

  return { afficher: afficher };
})();
