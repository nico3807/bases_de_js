// Session de l'étudiant·e et certificat PDF, même principe que le dépôt CCJS
// (« Exercices JavaScript ») : identification par prénom + nom, progression
// enregistrée à son nom sur le poste (localStorage), certificat PDF
// téléchargeable à tout moment (js/certificat.js).
// Partagé par les exercices d'algorithmique et ceux du TD JavaScript.
//
// var p = Parcours({
//   prefixe: 'algo-mmi:',            // préfixe des clés localStorage
//   titre: 'Algorithmique - Les bases',
//   exercices: EXERCICES,            // [{ id, titre, <cleGroupe> }]
//   cleGroupe: 'chapitre',           // champ qui range un exercice
//   groupes: [{ id, libelle }],      // dans l'ordre du parcours
//   motsGroupe: ['chapitre', 'chapitres', 'validés'],
//   memoriserOnglet: false,          // garder l'étudiant·e d'une page à l'autre
//   demanderAuChargement: true,      // afficher l'identification tout de suite
//   onChangement: function () {}     // appelé à chaque changement d'étudiant·e
// });
//
// Les éléments #etudiant-nom, #ouvrir-certificat et #changer-etudiant, s'ils
// existent dans la page, sont reliés automatiquement.

function Parcours(config) {
  var PREFIXE = config.prefixe;
  var ANNUAIRE = PREFIXE + 'etudiants';
  var COURANT = PREFIXE + 'courant';
  var MAX_HISTORIQUE = 400;
  var EXOS = config.exercices;
  var mots = config.motsGroupe || ['chapitre', 'chapitres', 'validés'];

  var etudiant = null; // { prenom, nom }
  var memoire = null;  // { faits, codes, solutions, historique, duree }
  var debutSession = Date.now();
  var enAttente = null; // action à reprendre après l'identification

  // ---------- Stockage ----------

  function slug(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'x';
  }
  function idEtudiant(e) {
    return slug(e.nom) + '_' + slug(e.prenom);
  }
  function lireJSON(stockage, cle, defaut) {
    try {
      return JSON.parse(stockage.getItem(cle)) || defaut;
    } catch (e) {
      return defaut;
    }
  }
  function ecrireJSON(stockage, cle, valeur) {
    try {
      stockage.setItem(cle, JSON.stringify(valeur));
    } catch (e) { /* stockage indisponible : on continue sans mémoire */ }
  }

  function charger() {
    var m = lireJSON(localStorage, PREFIXE + idEtudiant(etudiant), {});
    return {
      faits: m.faits || {},
      codes: m.codes || {},
      solutions: m.solutions || {},
      historique: m.historique || [],
      duree: m.duree || 0
    };
  }

  function nbFaits() {
    if (!memoire) return 0;
    return EXOS.filter(function (e) { return memoire.faits[e.id]; }).length;
  }

  // Enregistre la mémoire et cumule le temps passé.
  function enregistrer() {
    if (!etudiant) return;
    memoire.duree += Date.now() - debutSession;
    debutSession = Date.now();
    ecrireJSON(localStorage, PREFIXE + idEtudiant(etudiant), memoire);
    var id = idEtudiant(etudiant);
    var annuaire = lireJSON(localStorage, ANNUAIRE, []).filter(function (p) { return p.id !== id; });
    annuaire.unshift({
      id: id,
      prenom: etudiant.prenom,
      nom: etudiant.nom,
      faits: nbFaits(),
      total: EXOS.length,
      dernier: Date.now()
    });
    ecrireJSON(localStorage, ANNUAIRE, annuaire);
  }
  window.addEventListener('beforeunload', enregistrer);

  // ---------- Fenêtres (créées par le script) ----------

  function creerFenetres() {
    var html =
      '<div class="fenetre-modale" id="login-modal" hidden>' +
        '<div class="fenetre" role="dialog" aria-modal="true" aria-labelledby="login-titre">' +
          '<h2 id="login-titre">👋 ' + Verification.echapper(config.titre) + '</h2>' +
          '<p>Identifiez-vous pour démarrer <strong>votre</strong> session sur ce poste. ' +
          'Votre progression sera enregistrée à votre nom, et votre certificat PDF établi à ce nom.</p>' +
          '<label for="login-prenom">Prénom</label>' +
          '<input id="login-prenom" type="text" autocomplete="off" maxlength="40" />' +
          '<label for="login-nom">Nom</label>' +
          '<input id="login-nom" type="text" autocomplete="off" maxlength="40" />' +
          '<p id="login-erreur" class="fenetre-erreur" role="alert"></p>' +
          '<div class="fenetre-boutons">' +
            '<button type="button" class="btn" id="login-demarrer">▶ Démarrer la session</button>' +
            (config.demanderAuChargement ? '' : '<button type="button" class="btn secondary" id="login-annuler">Plus tard</button>') +
          '</div>' +
          '<div id="login-sessions" hidden>' +
            '<p class="login-sessions-titre">Sessions déjà enregistrées sur ce poste — cliquez pour reprendre :</p>' +
            '<div id="login-liste"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="fenetre-modale" id="cert-modal" hidden>' +
        '<div class="fenetre" role="dialog" aria-modal="true" aria-labelledby="cert-titre">' +
          '<h2 id="cert-titre"></h2>' +
          '<p id="cert-texte"></p>' +
          '<p id="cert-identite" class="cert-identite"></p>' +
          '<p id="cert-erreur" class="fenetre-erreur" role="alert"></p>' +
          '<div class="fenetre-boutons">' +
            '<button type="button" class="btn" id="cert-generer">📜 Télécharger le certificat PDF</button>' +
            '<button type="button" class="btn secondary" id="cert-annuler">Plus tard</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    var zone = document.createElement('div');
    zone.innerHTML = html;
    while (zone.firstChild) document.body.appendChild(zone.firstChild);
  }
  creerFenetres();

  var el = function (id) { return document.getElementById(id); };
  var fenetreLogin = el('login-modal');
  var champPrenom = el('login-prenom');
  var champNom = el('login-nom');
  var fenetreCert = el('cert-modal');
  var boutonGenerer = el('cert-generer');

  // ---------- Identification ----------

  function afficherLogin() {
    el('login-erreur').textContent = '';
    champPrenom.value = '';
    champNom.value = '';
    var annuaire = lireJSON(localStorage, ANNUAIRE, []);
    var liste = el('login-liste');
    liste.innerHTML = '';
    el('login-sessions').hidden = annuaire.length === 0;
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
      liste.appendChild(b);
    });
    fenetreLogin.hidden = false;
    champPrenom.focus();
  }

  function mettreAJourEtiquette() {
    if (el('etudiant-nom')) {
      el('etudiant-nom').textContent = etudiant ? '👤 ' + etudiant.prenom + ' ' + etudiant.nom.toUpperCase() : '';
    }
    if (el('changer-etudiant')) {
      el('changer-etudiant').textContent = etudiant ? 'Changer d\'étudiant·e' : 'S\'identifier';
    }
  }

  function demarrer(prenom, nom) {
    prenom = String(prenom).trim();
    nom = String(nom).trim();
    if (!prenom || !nom) {
      el('login-erreur').textContent = 'Merci d\'indiquer votre prénom ET votre nom.';
      (prenom ? champNom : champPrenom).focus();
      return;
    }
    etudiant = { prenom: prenom, nom: nom };
    memoire = charger();
    debutSession = Date.now();
    if (config.memoriserOnglet) ecrireJSON(sessionStorage, COURANT, etudiant);
    fenetreLogin.hidden = true;
    mettreAJourEtiquette();
    enregistrer();
    if (config.onChangement) config.onChangement();
    if (enAttente) {
      var action = enAttente;
      enAttente = null;
      action();
    }
  }

  function changerEtudiant() {
    enregistrer();
    etudiant = null;
    memoire = null;
    if (config.memoriserOnglet) {
      try { sessionStorage.removeItem(COURANT); } catch (e) { /* ignoré */ }
    }
    mettreAJourEtiquette();
    if (config.onChangement) config.onChangement();
    afficherLogin();
  }

  // Exécute « action » tout de suite si quelqu'un est identifié, sinon après
  // l'identification.
  function exigerEtudiant(action) {
    if (etudiant) return action();
    enAttente = action;
    afficherLogin();
  }

  el('login-demarrer').addEventListener('click', function () {
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
  if (el('login-annuler')) {
    el('login-annuler').addEventListener('click', function () {
      enAttente = null;
      fenetreLogin.hidden = true;
    });
  }

  // ---------- Suivi des exercices ----------

  function noterTentative(exo, ok, reussis, total) {
    if (!etudiant) return;
    var etaitTermine = nbFaits() === EXOS.length;
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
    if (!etaitTermine && nbFaits() === EXOS.length) setTimeout(ouvrirCertificat, 1200);
  }

  function noterSolution(id) {
    if (!etudiant || memoire.solutions[id]) return;
    memoire.solutions[id] = true;
    enregistrer();
  }

  function sauverCode(id, code) {
    if (!etudiant) return;
    memoire.codes[id] = code;
    ecrireJSON(localStorage, PREFIXE + idEtudiant(etudiant), memoire);
  }

  // ---------- Certificat ----------

  function formaterDuree(ms) {
    var min = Math.round(ms / 60000);
    var h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? h + ' h ' + String(m).padStart(2, '0') + ' min' : m + ' min';
  }

  function libelleGroupe(id) {
    var g = config.groupes.filter(function (x) { return x.id === id; })[0];
    return g ? g.libelle : '';
  }

  function donneesCertificat() {
    var faits = nbFaits();
    var groupes = config.groupes.map(function (g) {
      var exos = EXOS.filter(function (e) { return e[config.cleGroupe] === g.id; });
      return {
        libelle: g.libelle,
        reussis: exos.filter(function (e) { return memoire.faits[e.id]; }).length,
        total: exos.length
      };
    });
    var historique = memoire.historique.map(function (h) {
      var exo = EXOS.filter(function (e) { return e.id === h.id; })[0] || { titre: '?' };
      var d = new Date(h.t);
      return {
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' +
          d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        exercice: 'Ex. ' + h.id + ' ' + exo.titre,
        chapitre: libelleGroupe(exo[config.cleGroupe]),
        ok: h.ok,
        cas: h.reussis + '/' + h.total,
        solutionVue: h.solutionVue
      };
    });
    return {
      prenom: etudiant.prenom,
      nom: etudiant.nom,
      appli: { titre: config.titre, fichier: config.fichier, motsGroupe: mots },
      stats: {
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        duree: formaterDuree(memoire.duree),
        termine: faits === EXOS.length,
        exosReussis: faits,
        exosTotal: EXOS.length,
        chapitresValides: groupes.filter(function (g) { return g.reussis >= g.total; }).length,
        chapitresTotal: groupes.length,
        verifsReussies: memoire.historique.filter(function (h) { return h.ok; }).length,
        verifsTotal: memoire.historique.length,
        solutionsVues: Object.keys(memoire.solutions).length
      },
      chapitres: groupes,
      historique: historique
    };
  }

  function ouvrirCertificat() {
    exigerEtudiant(function () {
      enregistrer();
      var faits = nbFaits(), total = EXOS.length;
      el('cert-erreur').textContent = '';
      el('cert-identite').textContent = '👤 ' + etudiant.prenom + ' ' + etudiant.nom.toUpperCase();
      if (faits === total) {
        el('cert-titre').textContent = '🏆 Certificat de réussite';
        el('cert-texte').innerHTML = 'Félicitations, vous avez réussi les ' + total + ' exercices !<br>' +
          'Votre certificat PDF (avec l\'historique de toutes vos vérifications) sera établi au nom de :';
      } else {
        el('cert-titre').textContent = '📜 Attestation de parcours';
        el('cert-texte').innerHTML = 'Séance terminée avant la fin des exercices ? Pas de souci !<br>' +
          'Le document PDF portera la mention <b>« NON TERMINÉ »</b> (' + faits + '/' + total +
          ' exercices réussis) et inclura votre état d\'avancement et l\'historique de vos vérifications. ' +
          'Il sera établi au nom de :';
      }
      fenetreCert.hidden = false;
      boutonGenerer.focus();
    });
  }

  function fermerCertificat() {
    fenetreCert.hidden = true;
  }

  boutonGenerer.addEventListener('click', function () {
    if (!etudiant) return;
    enregistrer();
    el('cert-erreur').textContent = '';
    boutonGenerer.disabled = true;
    boutonGenerer.textContent = 'Génération en cours…';
    try {
      Certificat.generer(donneesCertificat());
      fermerCertificat();
    } catch (e) {
      el('cert-erreur').textContent = 'Échec de la génération du PDF : ' + e.message;
    } finally {
      boutonGenerer.disabled = false;
      boutonGenerer.textContent = '📜 Télécharger le certificat PDF';
    }
  });
  el('cert-annuler').addEventListener('click', fermerCertificat);
  fenetreCert.addEventListener('click', function (evt) {
    if (evt.target === fenetreCert) fermerCertificat();
  });
  document.addEventListener('keydown', function (evt) {
    if (evt.key === 'Escape' && !fenetreCert.hidden) fermerCertificat();
  });

  if (el('ouvrir-certificat')) el('ouvrir-certificat').addEventListener('click', ouvrirCertificat);
  if (el('changer-etudiant')) el('changer-etudiant').addEventListener('click', changerEtudiant);

  // ---------- Démarrage ----------

  var dejaLa = config.memoriserOnglet ? lireJSON(sessionStorage, COURANT, null) : null;
  if (dejaLa && dejaLa.prenom && dejaLa.nom) {
    etudiant = dejaLa;
    memoire = charger();
    mettreAJourEtiquette();
  } else {
    mettreAJourEtiquette();
    if (config.demanderAuChargement) afficherLogin();
  }

  return {
    etudiant: function () { return etudiant; },
    estFait: function (id) { return !!(memoire && memoire.faits[id]); },
    code: function (id) { return memoire ? memoire.codes[id] : undefined; },
    nbFaits: nbFaits,
    noterTentative: noterTentative,
    noterSolution: noterSolution,
    sauverCode: sauverCode,
    exigerEtudiant: exigerEtudiant,
    ouvrirCertificat: ouvrirCertificat
  };
}
