// Exercices de validation du TD et certificat PDF, à partir de la partie
// « Les Variables en JavaScript ». Le moteur est celui des exercices
// d'algorithmique (../algorithmique/js/ : bac à sable, vérification, fiches,
// session prénom + nom et certificat, même principe que le dépôt CCJS).
//
// L'étudiant·e reste identifié·e d'une page du TD à l'autre tant que l'onglet
// est ouvert ; sa progression est enregistrée à son nom sur le poste.
//   - page d'une partie : <div id="exos-td" data-partie="boucles"></div>
//   - menu du TD        : <div id="td-progression"></div> (avancement par partie)

(function () {
  if (typeof EXERCICES_TD === 'undefined') return;
  var conteneur = document.getElementById('exos-td');
  var partie = conteneur && conteneur.getAttribute('data-partie');
  var compteur = document.getElementById('progress-td');
  var resume = document.getElementById('td-progression');
  var exosPartie = EXERCICES_TD.filter(function (e) { return e.partie === partie; });

  function mettreAJour() {
    var id = parcours.etudiant();
    if (compteur) {
      var faits = exosPartie.filter(function (e) { return parcours.estFait(e.id); }).length;
      compteur.textContent = id
        ? faits + ' / ' + exosPartie.length + ' dans cette partie · ' + parcours.nbFaits() + ' / ' + EXERCICES_TD.length + ' au total'
        : '';
    }
    if (resume) {
      resume.innerHTML = PARTIES_TD.map(function (p) {
        var exos = EXERCICES_TD.filter(function (e) { return e.partie === p.id; });
        var faits = exos.filter(function (e) { return parcours.estFait(e.id); }).length;
        var fini = id && faits === exos.length;
        return '<li><a href="' + p.page + '#exercices">' + Verification.echapper(p.libelle) + '</a>' +
          '<span class="' + (fini ? 'fini' : '') + '">' + (id ? (fini ? '✔ ' : '') + faits + ' / ' + exos.length : exos.length + ' exercices') + '</span></li>';
      }).join('');
    }
  }

  function construire() {
    if (conteneur) {
      Fiches.afficher(conteneur, exosPartie, parcours, {
        libelle: function () { return 'Validation'; },
        ouvrir: window.location.hash === '#exercices' ? null : false,
        onProgression: mettreAJour
      });
    }
    mettreAJour();
  }

  var parcours = Parcours({
    prefixe: 'td-js-mmi:',
    titre: 'TD - Bases du JavaScript',
    fichier: 'td_javascript',
    exercices: EXERCICES_TD,
    cleGroupe: 'partie',
    groupes: PARTIES_TD,
    motsGroupe: ['partie', 'parties', 'validées'],
    memoriserOnglet: true,
    demanderAuChargement: false,
    onChangement: construire
  });

  construire();
})();
