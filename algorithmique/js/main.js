// Comportements communs à toutes les pages : lien de navigation actif,
// quiz, activité « remettre dans l'ordre », table de vérité et boutons
// « afficher / masquer ». Chaque activité est décrite dans le HTML par une
// classe ou un attribut data-* : ajouter un quiz ne demande donc pas de
// toucher à ce fichier.

(function () {
  // ---------- Lien actif dans le menu ----------
  // Chaque page pose data-page="..." sur <body>.
  var current = document.body.getAttribute('data-page');
  if (current) {
    document.querySelectorAll('.site-nav a[data-nav]').forEach(function (link) {
      if (link.getAttribute('data-nav') === current) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  // ---------- Quiz ----------
  // Une mauvaise réponse est barrée mais on peut réessayer : l'objectif est
  // de faire réfléchir, pas de noter. L'explication n'apparaît qu'une fois
  // la bonne réponse trouvée.
  document.querySelectorAll('.quiz').forEach(function (quiz) {
    var boutons = quiz.querySelectorAll('.quiz-choix button');
    var explication = quiz.querySelector('.quiz-explication');
    boutons.forEach(function (bouton) {
      bouton.addEventListener('click', function () {
        if (bouton.hasAttribute('data-bon')) {
          bouton.classList.add('bon');
          boutons.forEach(function (b) { b.disabled = true; });
          if (explication) explication.hidden = false;
        } else {
          bouton.classList.add('faux');
          bouton.disabled = true;
        }
      });
    });
  });

  // ---------- Remettre les étapes dans l'ordre ----------
  // Chaque étape porte data-rang="1", "2"… ; les intrus portent data-intrus.
  // On clique une étape pour l'ajouter à l'algorithme, on la reclique pour
  // la retirer. Le contrôle se fait quand toutes les étapes utiles sont
  // placées.
  function melanger(tableau) {
    for (var i = tableau.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = tableau[i];
      tableau[i] = tableau[j];
      tableau[j] = t;
    }
    return tableau;
  }

  document.querySelectorAll('[data-ordre]').forEach(function (bloc) {
    var source = bloc.querySelector('.ordre-source');
    var cible = bloc.querySelector('.ordre-cible');
    var retour = bloc.querySelector('.ordre-retour');
    var items = Array.prototype.slice.call(source.children);
    var utiles = items.filter(function (li) {
      return !li.querySelector('button').hasAttribute('data-intrus');
    }).length;

    function reinitialiser() {
      melanger(items).forEach(function (li) { source.appendChild(li); });
      cible.classList.remove('valide');
      retour.textContent = '';
      retour.className = 'ordre-retour';
    }

    function verifier() {
      var places = Array.prototype.map.call(cible.querySelectorAll('button'), function (b) { return b; });
      cible.classList.remove('valide');
      retour.textContent = '';
      retour.className = 'ordre-retour';
      if (places.length < utiles) return;

      var intrus = places.filter(function (b) { return b.hasAttribute('data-intrus'); });
      var rangs = places.map(function (b) { return Number(b.getAttribute('data-rang')); });
      var ordonne = rangs.every(function (r, i) { return i === 0 || r > rangs[i - 1]; });

      if (intrus.length) {
        retour.textContent = 'Une étape de votre algorithme ne sert à rien ou n\'a pas sa place ici. Retirez-la.';
        retour.classList.add('ko');
      } else if (ordonne) {
        retour.textContent = 'Bravo : les étapes sont dans un ordre qui fonctionne !';
        retour.classList.add('ok');
        cible.classList.add('valide');
      } else {
        retour.textContent = 'Toutes les étapes sont là, mais l\'ordre ne fonctionne pas encore : exécutez-le « dans votre tête », étape par étape.';
        retour.classList.add('ko');
      }
    }

    bloc.addEventListener('click', function (evt) {
      var bouton = evt.target.closest('.ordre-liste button');
      if (bouton) {
        var li = bouton.parentNode;
        (li.parentNode === source ? cible : source).appendChild(li);
        verifier();
        bouton.focus();
      }
      if (evt.target.closest('[data-ordre-reset]')) reinitialiser();
    });

    reinitialiser();
  });

  // ---------- Table de vérité ----------
  document.querySelectorAll('[data-verite]').forEach(function (bloc) {
    var valeurs = { a: false, b: false };
    var formules = {
      et: function (v) { return v.a && v.b; },
      ou: function (v) { return v.a || v.b; },
      nonA: function (v) { return !v.a; },
      nonB: function (v) { return !v.b; }
    };

    function afficher() {
      bloc.querySelectorAll('[data-var]').forEach(function (bouton) {
        var val = valeurs[bouton.getAttribute('data-var')];
        bouton.setAttribute('aria-pressed', String(val));
        bouton.textContent = String(val);
      });
      bloc.querySelectorAll('[data-expr]').forEach(function (cellule) {
        var res = formules[cellule.getAttribute('data-expr')](valeurs);
        cellule.textContent = String(res);
        cellule.className = res ? 'vrai' : 'faux';
      });
    }

    bloc.addEventListener('click', function (evt) {
      var bouton = evt.target.closest('[data-var]');
      if (!bouton) return;
      var nom = bouton.getAttribute('data-var');
      valeurs[nom] = !valeurs[nom];
      afficher();
    });

    afficher();
  });

  // ---------- Afficher / masquer (solutions, indices) ----------
  document.addEventListener('click', function (evt) {
    var bouton = evt.target.closest('[data-affiche]');
    if (!bouton) return;
    var cible = document.getElementById(bouton.getAttribute('data-affiche'));
    if (!cible) return;
    if (!bouton.hasAttribute('data-texte')) bouton.setAttribute('data-texte', bouton.textContent);
    cible.hidden = !cible.hidden;
    bouton.textContent = cible.hidden ? bouton.getAttribute('data-texte') : 'Masquer';
    bouton.setAttribute('aria-expanded', String(!cible.hidden));
  });
})();
