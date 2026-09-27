// Rendu des exercices en accordéon (même principe que les fiches de
// scénarios du TP R3.14), avec un bac à sable par exercice et une
// vérification automatique sur plusieurs cas.
//
// Validation par certificat, comme dans le dépôt CCJS (« Exercices
// JavaScript ») : l'étudiant·e s'identifie (prénom + nom) en arrivant sur la
// page ; sa progression, son code, l'historique de ses vérifications et son
// temps passé sont enregistrés à son nom sur ce poste (localStorage), et il
// ou elle peut à tout moment télécharger un certificat PDF (js/certificat.js).
// Un exercice ne compte comme réussi que s'il passe la vérification
// automatique : la case à cocher n'est qu'un indicateur.

(function () {
  var liste = document.getElementById('exo-liste');
  var texteProgression = document.getElementById('progress-text');
  var filtres = document.querySelectorAll('.filtre button');
  if (!liste || typeof EXERCICES === 'undefined') return;

  var PREFIXE = 'algo-mmi:';
  var ANNUAIRE = PREFIXE + 'etudiants';
  var MAX_HISTORIQUE = 400;
  var LIBELLES = {
    variables: 'Variables',
    conditions: 'Conditions',
    boucles: 'Boucles',
    tableaux: 'Tableaux',
    fonctions: 'Fonctions'
  };
  var CHAPITRES = Object.keys(LIBELLES);
  var NIVEAUX = { 1: 'facile', 2: 'moyen', 3: 'défi' };

  function echapper(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------- Session de l'étudiant·e ----------

  var etudiant = null; // { prenom, nom }
  var memoire = null;  // { faits, codes, solutions, historique, duree }
  var debutSession = Date.now();

  function slug(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'x';
  }
  function idEtudiant(e) {
    return slug(e.nom) + '_' + slug(e.prenom);
  }

  function lireJSON(cle, defaut) {
    try {
      return JSON.parse(localStorage.getItem(cle)) || defaut;
    } catch (e) {
      return defaut;
    }
  }
  function ecrireJSON(cle, valeur) {
    try {
      localStorage.setItem(cle, JSON.stringify(valeur));
    } catch (e) { /* stockage indisponible : on continue sans mémoire */ }
  }

  function charger() {
    var m = lireJSON(PREFIXE + idEtudiant(etudiant), {});
    return {
      faits: m.faits || {},
      codes: m.codes || {},
      solutions: m.solutions || {},
      historique: m.historique || [],
      duree: m.duree || 0
    };
  }

  // Cumule le temps passé depuis le dernier enregistrement.
  function enregistrer() {
    if (!etudiant) return;
    memoire.duree += Date.now() - debutSession;
    debutSession = Date.now();
    ecrireJSON(PREFIXE + idEtudiant(etudiant), memoire);
    mettreAJourAnnuaire();
  }
  window.addEventListener('beforeunload', enregistrer);

  function nbFaits() {
    return EXERCICES.filter(function (e) { return memoire.faits[e.id]; }).length;
  }

  // Liste des sessions présentes sur ce poste, pour l'écran d'accueil.
  function mettreAJourAnnuaire() {
    var id = idEtudiant(etudiant);
    var annuaire = lireJSON(ANNUAIRE, []).filter(function (p) { return p.id !== id; });
    annuaire.unshift({
      id: id,
      prenom: etudiant.prenom,
      nom: etudiant.nom,
      faits: nbFaits(),
      total: EXERCICES.length,
      dernier: Date.now()
    });
    ecrireJSON(ANNUAIRE, annuaire);
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
      noterTentative(exo, tout, reussis, resultats.length);
      if (tout) marquer(carte, exo.id);
    });
  }

  function noterTentative(exo, ok, reussis, total) {
    if (!etudiant) return;
    var etaitTermine = nbFaits() === EXERCICES.length;
    memoire.historique.push({
      id: exo.id,
      ok: ok,
      reussis: reussis,
      total: total,
      solutionVue: !!memoire.solutions[exo.id],
      t: Date.now()
    });
    if (memoire.historique.length > MAX_HISTORIQUE) {
      memoire.historique.splice(0, memoire.historique.length - MAX_HISTORIQUE);
    }
    if (ok) memoire.faits[exo.id] = true;
    enregistrer();
    // Parcours tout juste terminé : on propose le certificat de réussite.
    if (!etaitTermine && nbFaits() === EXERCICES.length) setTimeout(ouvrirCertificat, 1200);
  }

  // ---------- Rendu ----------

  function carteHtml(exo) {
    return '<div class="exo" id="exo-' + exo.id + '" data-chapitre="' + exo.chapitre + '">' +
      '<div class="exo-head">' +
        '<input type="checkbox" class="exo-check" disabled tabindex="-1" aria-label="Exercice ' + exo.id + ' réussi" title="Se coche automatiquement quand la vérification réussit">' +
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
          '<button type="button" class="btn secondary petit voir-solution" data-affiche="solution-' + exo.id + '">Voir une solution</button>' +
        '</div>' +
        '<div class="indice" id="indice-' + exo.id + '" hidden><strong>Indice —</strong> ' + exo.indice + '</div>' +
        '<div class="solution" id="solution-' + exo.id + '" hidden><strong>Une solution possible</strong> (il en existe d\'autres !)' +
          '<pre><code>' + echapper(exo.solution) + '</code></pre></div>' +
      '</div>' +
    '</div>';
  }

  function mettreAJourProgression() {
    texteProgression.textContent = nbFaits() + ' / ' + EXERCICES.length + ' exercices réussis';
  }

  function marquer(carte, id) {
    carte.classList.add('done');
    carte.querySelector('.exo-check').checked = true;
    mettreAJourProgression();
  }

  // Construit les fiches avec le code et la progression de l'étudiant·e.
  function construire() {
    liste.innerHTML = EXERCICES.map(carteHtml).join('');

    EXERCICES.forEach(function (exo) {
      var carte = document.getElementById('exo-' + exo.id);
      var essai = BacASable.monter(carte.querySelector('.essai'), {
        code: memoire.codes[exo.id] !== undefined ? memoire.codes[exo.id] : exo.code,
        codeInitial: exo.code,
        titre: 'Votre code',
        onVerifier: function (code, verdict, sortie) { verifier(exo, carte, code, verdict, sortie); }
      });
      essai.zone.addEventListener('input', function () {
        memoire.codes[exo.id] = essai.zone.value;
        ecrireJSON(PREFIXE + idEtudiant(etudiant), memoire);
      });

      // Consulter la solution reste permis, mais c'est noté dans le
      // certificat : l'enseignant·e sait ainsi comment l'exercice a été réussi.
      carte.querySelector('.voir-solution').addEventListener('click', function () {
        if (!memoire.solutions[exo.id]) {
          memoire.solutions[exo.id] = true;
          enregistrer();
        }
      });

      if (memoire.faits[exo.id]) marquer(carte, exo.id);

      carte.querySelector('.exo-head').addEventListener('click', function () {
        carte.classList.toggle('open');
      });
    });

    filtres.forEach(function (b) {
      var tous = b.getAttribute('data-filtre') === 'tous';
      b.classList.toggle('active', tous);
      b.setAttribute('aria-pressed', String(tous));
    });

    // Ouvre l'exercice visé par l'adresse (exercices.html#exo-4), sinon le
    // premier, pour inviter à cliquer.
    var cible = window.location.hash && document.getElementById(window.location.hash.slice(1));
    (cible && cible.classList.contains('exo') ? cible : liste.querySelector('.exo')).classList.add('open');
    mettreAJourProgression();
  }

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

  // ---------- Écran d'identification ----------

  var fenetreLogin = document.getElementById('login-modal');
  var champPrenom = document.getElementById('login-prenom');
  var champNom = document.getElementById('login-nom');
  var erreurLogin = document.getElementById('login-erreur');
  var zoneSessions = document.getElementById('login-sessions');
  var listeSessions = document.getElementById('login-liste');
  var etiquette = document.getElementById('etudiant-nom');

  function afficherLogin() {
    erreurLogin.textContent = '';
    champPrenom.value = '';
    champNom.value = '';
    liste.innerHTML = '<p class="lede">Identifiez-vous pour commencer les exercices.</p>';
    etiquette.textContent = '';
    texteProgression.textContent = '';

    var annuaire = lireJSON(ANNUAIRE, []);
    listeSessions.innerHTML = '';
    zoneSessions.hidden = annuaire.length === 0;
    annuaire.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'login-session';
      var n = document.createElement('span');
      n.textContent = '👤 ' + p.prenom + ' ' + p.nom.toUpperCase();
      var prog = document.createElement('span');
      var fini = p.faits >= p.total;
      prog.className = 'login-progression' + (fini ? ' fini' : '');
      prog.textContent = fini ? '🏆 terminé' : p.faits + '/' + p.total + ' exercices';
      b.appendChild(n);
      b.appendChild(prog);
      b.addEventListener('click', function () { demarrer(p.prenom, p.nom); });
      listeSessions.appendChild(b);
    });

    fenetreLogin.hidden = false;
    champPrenom.focus();
  }

  function demarrer(prenom, nom) {
    prenom = String(prenom).trim();
    nom = String(nom).trim();
    if (!prenom || !nom) {
      erreurLogin.textContent = 'Merci d\'indiquer votre prénom ET votre nom.';
      (prenom ? champNom : champPrenom).focus();
      return;
    }
    etudiant = { prenom: prenom, nom: nom };
    memoire = charger();
    debutSession = Date.now();
    fenetreLogin.hidden = true;
    etiquette.textContent = '👤 ' + prenom + ' ' + nom.toUpperCase();
    construire();
    enregistrer();
  }

  function changerEtudiant() {
    if (!etudiant) return;
    enregistrer();
    etudiant = null;
    memoire = null;
    afficherLogin();
  }

  document.getElementById('login-demarrer').addEventListener('click', function () {
    demarrer(champPrenom.value, champNom.value);
  });
  [champPrenom, champNom].forEach(function (champ) {
    champ.addEventListener('keydown', function (evt) {
      if (evt.key === 'Enter') {
        evt.preventDefault();
        demarrer(champPrenom.value, champNom.value);
      }
    });
  });
  document.getElementById('changer-etudiant').addEventListener('click', changerEtudiant);

  // ---------- Certificat PDF ----------

  var fenetreCert = document.getElementById('cert-modal');
  var titreCert = document.getElementById('cert-titre');
  var texteCert = document.getElementById('cert-texte');
  var identiteCert = document.getElementById('cert-identite');
  var erreurCert = document.getElementById('cert-erreur');
  var boutonGenerer = document.getElementById('cert-generer');

  function formaterDuree(ms) {
    var min = Math.round(ms / 60000);
    var h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? h + ' h ' + String(m).padStart(2, '0') + ' min' : m + ' min';
  }

  function statsCertificat() {
    var faits = nbFaits();
    var chapitres = CHAPITRES.map(function (c) {
      var exos = EXERCICES.filter(function (e) { return e.chapitre === c; });
      return {
        libelle: LIBELLES[c],
        reussis: exos.filter(function (e) { return memoire.faits[e.id]; }).length,
        total: exos.length
      };
    });
    return {
      stats: {
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        duree: formaterDuree(memoire.duree),
        termine: faits === EXERCICES.length,
        exosReussis: faits,
        exosTotal: EXERCICES.length,
        chapitresValides: chapitres.filter(function (c) { return c.reussis >= c.total; }).length,
        chapitresTotal: chapitres.length,
        verifsReussies: memoire.historique.filter(function (h) { return h.ok; }).length,
        verifsTotal: memoire.historique.length,
        solutionsVues: Object.keys(memoire.solutions).length
      },
      chapitres: chapitres
    };
  }

  function historiqueCertificat() {
    return memoire.historique.map(function (h) {
      var exo = EXERCICES.filter(function (e) { return e.id === h.id; })[0] || { titre: '?', chapitre: '' };
      var d = new Date(h.t);
      return {
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' +
          d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        exercice: 'Ex. ' + h.id + ' ' + exo.titre,
        chapitre: LIBELLES[exo.chapitre] || '',
        ok: h.ok,
        cas: h.reussis + '/' + h.total,
        solutionVue: h.solutionVue
      };
    });
  }

  function ouvrirCertificat() {
    if (!etudiant) return;
    enregistrer();
    var s = statsCertificat().stats;
    erreurCert.textContent = '';
    identiteCert.textContent = '👤 ' + etudiant.prenom + ' ' + etudiant.nom.toUpperCase();
    if (s.termine) {
      titreCert.textContent = '🏆 Certificat de réussite';
      texteCert.innerHTML = 'Félicitations, vous avez réussi les ' + s.exosTotal + ' exercices !<br>' +
        'Votre certificat PDF (avec l\'historique de toutes vos vérifications) sera établi au nom de :';
    } else {
      titreCert.textContent = '📜 Attestation de parcours';
      texteCert.innerHTML = 'Séance terminée avant la fin des exercices ? Pas de souci !<br>' +
        'Le document PDF portera la mention <b>« NON TERMINÉ »</b> (' + s.exosReussis + '/' + s.exosTotal +
        ' exercices réussis) et inclura votre état d\'avancement et l\'historique de vos vérifications. ' +
        'Il sera établi au nom de :';
    }
    fenetreCert.hidden = false;
    boutonGenerer.focus();
  }

  function fermerCertificat() {
    fenetreCert.hidden = true;
  }

  boutonGenerer.addEventListener('click', function () {
    if (!etudiant) return;
    enregistrer();
    erreurCert.textContent = '';
    boutonGenerer.disabled = true;
    boutonGenerer.textContent = 'Génération en cours…';
    try {
      var donnees = statsCertificat();
      Certificat.generer({
        prenom: etudiant.prenom,
        nom: etudiant.nom,
        stats: donnees.stats,
        chapitres: donnees.chapitres,
        historique: historiqueCertificat()
      });
      fermerCertificat();
    } catch (e) {
      erreurCert.textContent = 'Échec de la génération du PDF : ' + e.message;
    } finally {
      boutonGenerer.disabled = false;
      boutonGenerer.textContent = '📜 Télécharger le certificat PDF';
    }
  });
  document.getElementById('cert-annuler').addEventListener('click', fermerCertificat);
  document.getElementById('ouvrir-certificat').addEventListener('click', ouvrirCertificat);
  fenetreCert.addEventListener('click', function (evt) {
    if (evt.target === fenetreCert) fermerCertificat();
  });
  document.addEventListener('keydown', function (evt) {
    if (evt.key === 'Escape' && !fenetreCert.hidden) fermerCertificat();
  });

  afficherLogin();
})();
