// Rendu des exercices en accordéon (même principe que les fiches de
// scénarios du TP R3.14), avec un bac à sable par exercice et une
// vérification automatique sur plusieurs cas.
//
// Contrairement au TP R3.14, la progression et le code tapé sont gardés
// dans le navigateur (localStorage) : les exercices se font souvent en
// plusieurs fois, en TD puis à la maison. Si le stockage est indisponible
// (navigation privée…), tout fonctionne quand même, sans mémoire.

(function () {
  var liste = document.getElementById('exo-liste');
  var texteProgression = document.getElementById('progress-text');
  var filtres = document.querySelectorAll('.filtre button');
  var bEffacer = document.getElementById('effacer-progression');
  if (!liste || typeof EXERCICES === 'undefined') return;

  var CLE = 'algo-mmi-exercices';
  var LIBELLES = {
    variables: 'Variables',
    conditions: 'Conditions',
    boucles: 'Boucles',
    tableaux: 'Tableaux',
    fonctions: 'Fonctions'
  };
  var NIVEAUX = { 1: 'facile', 2: 'moyen', 3: 'défi' };

  function lire() {
    try {
      return JSON.parse(localStorage.getItem(CLE)) || {};
    } catch (e) {
      return {};
    }
  }
  function ecrire(etat) {
    try {
      localStorage.setItem(CLE, JSON.stringify(etat));
    } catch (e) { /* stockage indisponible : on continue sans mémoire */ }
  }
  var memoire = lire();
  memoire.faits = memoire.faits || {};
  memoire.codes = memoire.codes || {};

  function echapper(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------- Vérification ----------

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

  function verifier(exo, carte, code, verdict, sortie) {
    Promise.all(exo.cas.map(function (cas) { return verifierCas(code, cas); })).then(function (resultats) {
      // La console montre ce qu'a produit le premier cas qui échoue (ou le
      // premier cas), pour que l'étudiant·e voie d'où vient l'écart.
      var montre = resultats.filter(function (r) { return !r.ok && r.res; })[0] || resultats[0];
      if (montre && montre.res) BacASable.afficherSortie(sortie, montre.res);

      var reussis = resultats.filter(function (r) { return r.ok; }).length;
      var tout = reussis === resultats.length;
      verdict.className = 'essai-verdict ' + (tout ? 'ok' : 'ko');
      verdict.innerHTML =
        (tout ? '✔ Bravo, tous les cas sont validés !' : '✘ ' + reussis + ' cas validé(s) sur ' + resultats.length + '.') +
        '<ul style="margin:0.4rem 0 0;font-weight:400">' +
        resultats.map(function (r) { return '<li>' + (r.ok ? '✔ ' : '✘ ') + r.texte + '</li>'; }).join('') +
        '</ul>';
      if (tout) marquer(carte, exo.id, true);
    });
  }

  // ---------- Rendu ----------

  function carteHtml(exo) {
    return '<div class="exo" id="exo-' + exo.id + '" data-chapitre="' + exo.chapitre + '">' +
      '<div class="exo-head">' +
        '<input type="checkbox" class="exo-check" aria-label="Marquer l\'exercice ' + exo.id + ' comme réussi">' +
        '<div class="exo-num">' + exo.id + '</div>' +
        '<h3>' + echapper(exo.titre) +
          ' <span class="niveau niveau-' + exo.niveau + '">' + NIVEAUX[exo.niveau] + '</span></h3>' +
        '<span class="exo-meta">' + LIBELLES[exo.chapitre] + '</span>' +
        '<span class="exo-caret" aria-hidden="true">&#9656;</span>' +
      '</div>' +
      '<div class="exo-body">' +
        exo.consigne +
        '<div class="essai"></div>' +
        '<div class="exo-actions">' +
          '<button type="button" class="btn secondary petit" data-affiche="indice-' + exo.id + '">💡 Un indice</button>' +
          '<button type="button" class="btn secondary petit" data-affiche="solution-' + exo.id + '">Voir une solution</button>' +
        '</div>' +
        '<div class="indice" id="indice-' + exo.id + '" hidden><strong>Indice —</strong> ' + exo.indice + '</div>' +
        '<div class="solution" id="solution-' + exo.id + '" hidden><strong>Une solution possible</strong> (il en existe d\'autres !)' +
          '<pre><code>' + echapper(exo.solution) + '</code></pre></div>' +
      '</div>' +
    '</div>';
  }

  function mettreAJourProgression() {
    var faits = EXERCICES.filter(function (e) { return memoire.faits[e.id]; }).length;
    texteProgression.textContent = faits + ' / ' + EXERCICES.length + ' exercices réussis';
  }

  function marquer(carte, id, fait) {
    carte.classList.toggle('done', fait);
    carte.querySelector('.exo-check').checked = fait;
    if (fait) memoire.faits[id] = true;
    else delete memoire.faits[id];
    ecrire(memoire);
    mettreAJourProgression();
  }

  liste.innerHTML = EXERCICES.map(carteHtml).join('');

  EXERCICES.forEach(function (exo) {
    var carte = document.getElementById('exo-' + exo.id);
    var tete = carte.querySelector('.exo-head');
    var coche = carte.querySelector('.exo-check');

    var essai = BacASable.monter(carte.querySelector('.essai'), {
      code: memoire.codes[exo.id] !== undefined ? memoire.codes[exo.id] : exo.code,
      codeInitial: exo.code,
      titre: 'Votre code',
      onVerifier: function (code, verdict, sortie) { verifier(exo, carte, code, verdict, sortie); }
    });
    essai.zone.addEventListener('input', function () {
      memoire.codes[exo.id] = essai.zone.value;
      ecrire(memoire);
    });

    if (memoire.faits[exo.id]) marquer(carte, exo.id, true);

    tete.addEventListener('click', function (evt) {
      if (evt.target === coche) return;
      carte.classList.toggle('open');
    });
    coche.addEventListener('click', function (evt) { evt.stopPropagation(); });
    coche.addEventListener('change', function () { marquer(carte, exo.id, coche.checked); });
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

  if (bEffacer) {
    bEffacer.addEventListener('click', function () {
      if (!confirm('Effacer votre progression et tout le code tapé dans les exercices ?')) return;
      memoire = { faits: {}, codes: {} };
      ecrire(memoire);
      window.location.reload();
    });
  }

  // Ouvre l'exercice visé par l'adresse (exercices.html#exo-4), sinon le
  // premier, pour inviter à cliquer.
  var cible = window.location.hash && document.getElementById(window.location.hash.slice(1));
  (cible && cible.classList.contains('exo') ? cible : liste.querySelector('.exo')).classList.add('open');
  mettreAJourProgression();
})();
