// Page Exercices d'algorithmique : filtre par chapitre et compteur de
// progression. Le reste est partagé avec le TD JavaScript :
//   js/verification.js  vérification automatique sur plusieurs cas ;
//   js/fiches.js        fiches d'exercices en accordéon ;
//   js/parcours.js      identification prénom + nom et certificat PDF,
//                       même principe que le dépôt CCJS.

(function () {
  var liste = document.getElementById('exo-liste');
  var texteProgression = document.getElementById('progress-text');
  var filtres = document.querySelectorAll('.filtre button');
  if (!liste || typeof EXERCICES === 'undefined') return;

  var GROUPES = [
    { id: 'variables', libelle: 'Variables' },
    { id: 'conditions', libelle: 'Conditions' },
    { id: 'boucles', libelle: 'Boucles' },
    { id: 'tableaux', libelle: 'Tableaux' },
    { id: 'fonctions', libelle: 'Fonctions' }
  ];
  var LIBELLES = {};
  GROUPES.forEach(function (g) { LIBELLES[g.id] = g.libelle; });

  function mettreAJourProgression() {
    texteProgression.textContent = parcours.etudiant()
      ? parcours.nbFaits() + ' / ' + EXERCICES.length + ' exercices réussis'
      : '';
  }

  function construire() {
    Fiches.afficher(liste, EXERCICES, parcours, {
      libelle: function (exo) { return LIBELLES[exo.chapitre]; },
      ouvrir: window.location.hash ? window.location.hash.slice(1) : null,
      onProgression: mettreAJourProgression
    });
    liste.querySelectorAll('.exo').forEach(function (carte, i) {
      carte.setAttribute('data-chapitre', EXERCICES[i].chapitre);
    });
    filtres.forEach(function (b) {
      var tous = b.getAttribute('data-filtre') === 'tous';
      b.classList.toggle('active', tous);
      b.setAttribute('aria-pressed', String(tous));
    });
    mettreAJourProgression();
  }

  var parcours = Parcours({
    prefixe: 'algo-mmi:',
    titre: 'Algorithmique - Les bases',
    fichier: 'algorithmique',
    exercices: EXERCICES,
    cleGroupe: 'chapitre',
    groupes: GROUPES,
    motsGroupe: ['chapitre', 'chapitres', 'validés'],
    demanderAuChargement: true,
    onChangement: construire
  });

  filtres.forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      filtres.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      bouton.classList.add('active');
      bouton.setAttribute('aria-pressed', 'true');
      var chapitre = bouton.getAttribute('data-filtre');
      liste.querySelectorAll('.exo').forEach(function (carte) {
        carte.hidden = chapitre !== 'tous' && carte.getAttribute('data-chapitre') !== chapitre;
      });
    });
  });

  construire();
})();
