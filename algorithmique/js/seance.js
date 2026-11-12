// Validation en séance : à la fin du parcours, en présentiel, l'étudiant·e
// répond à une question chronométrée sur chacun des exercices réussis.
//
// - Le code de séance est choisi librement par l'enseignant·e et affiché au
//   tableau. Il n'est pas vérifié par la page (le site est public : un code
//   vérifiable serait lisible dans ses fichiers) : il est inscrit dans le
//   certificat avec la date et l'heure, et c'est l'enseignant·e qui le
//   contrôle.
// - Une seule tentative : une fois commencée, la validation est enregistrée,
//   même si la page est fermée en cours de route.
// - 60 secondes par question ; quitter la page (autre onglet, autre fenêtre)
//   fait échouer la question en cours.
//
// Seance(parcours, {
//   titre: 'Algorithmique - Les bases',
//   questionPour: function (exo, code) { return { texte: 'HTML', reponses: ['…'] }; }
// });
// Le bouton #validation-seance, s'il existe dans la page, ouvre la fenêtre.

function Seance(parcours, config) {
  var DUREE = config.duree || 60;
  var minuterie = null;
  var enCours = null; // { v, questions, i, debutQuestion }

  function echapper(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Comparaison tolérante : casse, espaces, guillemets, apostrophes, point
  // final, virgule décimale, vrai / faux.
  function normaliser(r) {
    var t = String(r === undefined || r === null ? '' : r).toLowerCase()
      .replace(/[’‘`]/g, '\'').replace(/[«»"]/g, '').replace(/\s+/g, ' ').trim();
    t = t.replace(/^'+|'+$/g, '').trim().replace(/\.$/, '').trim();
    t = t.replace(/(\d),(\d)/g, '$1.$2').replace(/\s*([,;])\s*/g, '$1');
    if (t === 'vrai') t = 'true';
    if (t === 'faux') t = 'false';
    return t;
  }
  function correct(reponse, attendues) {
    var r = normaliser(reponse);
    if (!r) return false;
    return attendues.some(function (a) {
      var n = normaliser(a);
      if (r === n) return true;
      return r !== '' && n !== '' && !isNaN(Number(r)) && !isNaN(Number(n)) && Number(r) === Number(n);
    });
  }

  // ---------- Fenêtre ----------

  var zone = document.createElement('div');
  zone.innerHTML =
    '<div class="fenetre-modale" id="seance-modal" hidden>' +
      '<div class="fenetre fenetre-large" role="dialog" aria-modal="true" aria-labelledby="seance-titre">' +
        '<h2 id="seance-titre">🎓 Validation en séance</h2>' +
        '<div id="seance-contenu"></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(zone.firstChild);
  var fenetre = document.getElementById('seance-modal');
  var contenu = document.getElementById('seance-contenu');

  function fermer() {
    if (enCours) return; // pas de fermeture pendant les questions
    fenetre.hidden = true;
  }

  function boutonFermer(libelle) {
    return '<div class="fenetre-boutons"><button type="button" class="btn secondary" data-seance="fermer">' +
      (libelle || 'Fermer') + '</button></div>';
  }

  function resume(v) {
    var ids = v.questions;
    var ok = ids.filter(function (id) { return v.reponses[id] && v.reponses[id].ok; }).length;
    var d = new Date(v.debut);
    return '<p>Validation ' + (v.terminee ? 'passée' : '<strong>commencée puis interrompue</strong>') + ' le ' +
      d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) +
      ' (code de séance « ' + echapper(v.code) + ' »).</p>' +
      '<p class="seance-score">Explications validées : <strong>' + ok + ' / ' + ids.length + '</strong></p>' +
      '<p>Une seule tentative est possible : ce résultat figure dans votre certificat PDF.</p>';
  }

  function accueil() {
    var v = parcours.validation();
    if (v) {
      contenu.innerHTML = resume(v) + boutonFermer();
      return;
    }
    var reussis = parcours.exercicesReussis();
    if (!reussis.length) {
      contenu.innerHTML = '<p>Vous n\'avez encore réussi aucun exercice : la validation porte sur les exercices réussis. ' +
        'Revenez en fin de parcours.</p>' + boutonFermer();
      return;
    }
    var total = parcours.nbTotal ? parcours.nbTotal() : null;
    contenu.innerHTML =
      '<p>Cette validation se fait <strong>en séance, en présentiel</strong>, à la fin du parcours. ' +
      'Pour chacun de vos <strong>' + reussis.length + ' exercice' + (reussis.length > 1 ? 's' : '') + ' réussi' + (reussis.length > 1 ? 's' : '') + '</strong>, ' +
      'une question sur votre propre code, à traiter en <strong>' + DUREE + ' secondes</strong>.</p>' +
      '<ul>' +
        '<li><strong>Une seule tentative</strong> : une fois commencée, la validation compte, même si vous fermez la page.</li>' +
        '<li><strong>Ne quittez pas la page</strong> : changer d\'onglet ou de fenêtre fait échouer la question en cours.</li>' +
        '<li>Le résultat et le code de séance figurent dans votre certificat PDF.</li>' +
      '</ul>' +
      (total && reussis.length < total
        ? '<p class="seance-alerte">Vous avez réussi ' + reussis.length + ' exercice(s) sur ' + total +
          '. Seuls ceux-là seront interrogés, et vous ne pourrez pas repasser la validation ensuite.</p>'
        : '') +
      '<label for="seance-code">Code de séance (donné par votre enseignant·e)</label>' +
      '<input id="seance-code" type="text" autocomplete="off" maxlength="20" />' +
      '<p class="fenetre-erreur" id="seance-erreur" role="alert"></p>' +
      '<div class="fenetre-boutons">' +
        '<button type="button" class="btn" data-seance="commencer">▶ Commencer la validation</button>' +
        '<button type="button" class="btn secondary" data-seance="fermer">Plus tard</button>' +
      '</div>';
    document.getElementById('seance-code').focus();
  }

  function commencer() {
    var champ = document.getElementById('seance-code');
    var code = champ.value.trim();
    if (code.length < 3) {
      document.getElementById('seance-erreur').textContent = 'Saisissez le code de séance affiché par votre enseignant·e.';
      champ.focus();
      return;
    }
    var reussis = parcours.exercicesReussis();
    contenu.innerHTML = '<p>Préparation des questions…</p>';
    Promise.all(reussis.map(function (exo) {
      return Promise.resolve(config.questionPour(exo, parcours.code(exo.id) || exo.code));
    })).then(function (questions) {
      var liste = [];
      reussis.forEach(function (exo, i) {
        if (questions[i]) liste.push({ exo: exo, q: questions[i] });
      });
      var v = {
        debut: Date.now(),
        code: code,
        questions: liste.map(function (x) { return x.exo.id; }),
        reponses: {},
        terminee: false
      };
      parcours.enregistrerValidation(v);
      enCours = { v: v, liste: liste, i: 0 };
      poserQuestion();
    });
  }

  function poserQuestion() {
    var c = enCours;
    if (c.i >= c.liste.length) return terminer();
    var item = c.liste[c.i];
    var code = parcours.code(item.exo.id) || item.exo.code;
    contenu.innerHTML =
      '<p class="seance-progression">Question ' + (c.i + 1) + ' / ' + c.liste.length +
        ' · Exercice ' + item.exo.id + ' : ' + echapper(item.exo.titre) + '</p>' +
      '<div class="seance-temps"><div id="seance-barre"></div></div>' +
      '<p class="seance-question">' + item.q.texte + '</p>' +
      '<details class="seance-code"><summary>Votre code pour cet exercice</summary><pre><code>' + echapper(code) + '</code></pre></details>' +
      '<label for="seance-reponse">Votre réponse</label>' +
      '<input id="seance-reponse" type="text" autocomplete="off" spellcheck="false" />' +
      '<div class="fenetre-boutons"><button type="button" class="btn" data-seance="valider">Valider ma réponse</button></div>';
    var champ = document.getElementById('seance-reponse');
    champ.focus();
    champ.addEventListener('keydown', function (evt) {
      if (evt.key === 'Enter') { evt.preventDefault(); repondre(false); }
    });
    c.debutQuestion = Date.now();
    var barre = document.getElementById('seance-barre');
    clearInterval(minuterie);
    minuterie = setInterval(function () {
      var ecoule = (Date.now() - c.debutQuestion) / 1000;
      barre.style.width = Math.max(0, 100 - ecoule / DUREE * 100) + '%';
      if (ecoule >= DUREE) repondre(false, 'temps');
    }, 200);
  }

  function repondre(sortie, raison) {
    var c = enCours;
    if (!c) return;
    clearInterval(minuterie);
    var item = c.liste[c.i];
    var champ = document.getElementById('seance-reponse');
    var reponse = champ ? champ.value : '';
    var ok = !sortie && raison !== 'temps' && correct(reponse, item.q.reponses);
    c.v.reponses[item.exo.id] = {
      ok: ok,
      sortie: !!sortie,
      temps: Math.round((Date.now() - c.debutQuestion) / 1000),
      horsDelai: raison === 'temps'
    };
    parcours.enregistrerValidation(c.v);
    c.i++;
    if (sortie) {
      contenu.innerHTML = '<p class="seance-alerte">Vous avez quitté la page : la question sur l\'exercice ' +
        item.exo.id + ' est comptée comme échouée.</p>' +
        '<div class="fenetre-boutons"><button type="button" class="btn" data-seance="suivante">Question suivante</button></div>';
    } else {
      poserQuestion();
    }
  }

  function terminer() {
    var c = enCours;
    c.v.terminee = true;
    parcours.enregistrerValidation(c.v);
    enCours = null;
    contenu.innerHTML = resume(c.v) + boutonFermer();
  }

  // Quitter la page pendant une question la fait échouer.
  function surSortie() {
    if (enCours && document.getElementById('seance-reponse')) repondre(true);
  }
  window.addEventListener('blur', function () {
    setTimeout(function () {
      var a = document.activeElement;
      if (a && a.tagName === 'IFRAME') return;
      surSortie();
    }, 0);
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) surSortie(); });

  fenetre.addEventListener('click', function (evt) {
    var b = evt.target.closest('[data-seance]');
    if (!b) return;
    var action = b.getAttribute('data-seance');
    if (action === 'fermer') fermer();
    if (action === 'commencer') commencer();
    if (action === 'valider') repondre(false);
    if (action === 'suivante') poserQuestion();
  });

  function ouvrir() {
    parcours.exigerEtudiant(function () {
      fenetre.hidden = false;
      accueil();
    });
  }
  var bouton = document.getElementById('validation-seance');
  if (bouton) bouton.addEventListener('click', ouvrir);

  return { ouvrir: ouvrir };
}
