// Exécution pas à pas d'un petit programme : la ligne en cours est
// surlignée, les variables sont dessinées comme des boîtes et la console
// affiche ce que le programme a écrit.
//
// Le programme n'est pas interprété : chaque page décrit son déroulement
// dans une fonction génératrice (function*) qui modifie l'objet v (les
// variables) et « s'arrête » avec yield [numéro de ligne, explication]
// après chaque instruction. Tous les états sont calculés d'avance, ce qui
// permet de revenir en arrière.
//
// Exemple minimal :
//   Trace.monter('#trace-exemple', {
//     titre: 'Deux variables',
//     code: ['let a = 5;', 'let b = a + 1;'],
//     variables: ['a', 'b'],
//     executer: function* (v, ecrire) {
//       v.a = 5;      yield [1, 'On range 5 dans a.'];
//       v.b = v.a + 1; yield [2, 'On calcule a + 1 et on range 6 dans b.'];
//     }
//   });
//
// Options facultatives :
//   parametres : [{ nom, libelle, valeur, type: 'number' | 'text', min, max }]
//                valeurs modifiables par l'étudiant·e ; elles sont passées
//                en 3e argument à executer() et à code() si c'est une
//                fonction.
//   tableau    : { nom: 'notes', indice: 'i' } dessine le tableau case par
//                case et surligne la case désignée par l'indice.

var Trace = (function () {
  var MAX_ETAPES = 300;

  function formater(valeur, imbrique) {
    if (typeof valeur === 'string') return imbrique ? '"' + valeur + '"' : valeur;
    if (Array.isArray(valeur)) {
      return '[' + valeur.map(function (x) { return formater(x, true); }).join(', ') + ']';
    }
    return String(valeur);
  }

  function copie(objet) {
    var res = {};
    Object.keys(objet).forEach(function (cle) {
      res[cle] = Array.isArray(objet[cle]) ? objet[cle].slice() : objet[cle];
    });
    return res;
  }

  function creer(tag, classe, texte) {
    var el = document.createElement(tag);
    if (classe) el.className = classe;
    if (texte !== undefined) el.textContent = texte;
    return el;
  }

  function monter(cible, config) {
    var racine = typeof cible === 'string' ? document.querySelector(cible) : cible;
    if (!racine) return;
    racine.classList.add('trace');
    racine.innerHTML = '';

    var params = {};
    var etapes = [];
    var position = 0;
    var minuterie = null;

    // ---------- Construction de l'interface ----------
    if (config.titre) racine.appendChild(creer('h3', 'trace-titre', config.titre));

    if (config.parametres && config.parametres.length) {
      var zoneParams = creer('div', 'trace-parametres');
      zoneParams.appendChild(creer('strong', '', 'Valeurs de départ :'));
      config.parametres.forEach(function (p) {
        params[p.nom] = p.valeur;
        var label = creer('label', '', p.libelle + ' ');
        var champ = document.createElement('input');
        champ.type = p.type === 'text' ? 'text' : 'number';
        if (p.type === 'text') champ.style.width = '14rem';
        champ.value = p.valeur;
        if (p.min !== undefined) champ.min = p.min;
        if (p.max !== undefined) champ.max = p.max;
        champ.addEventListener('change', function () {
          var val = p.type === 'text' ? champ.value : Number(champ.value);
          if (p.min !== undefined && val < p.min) val = p.min;
          if (p.max !== undefined && val > p.max) val = p.max;
          champ.value = val;
          params[p.nom] = val;
          calculer();
        });
        label.appendChild(champ);
        zoneParams.appendChild(label);
      });
      racine.appendChild(zoneParams);
    }

    var grille = creer('div', 'trace-grille');
    var pre = creer('pre', 'trace-code');
    var code = document.createElement('code');
    pre.appendChild(code);
    grille.appendChild(pre);

    var etat = creer('div', 'trace-etat');
    etat.appendChild(creer('h4', '', 'Mémoire : les variables'));
    var zoneVars = creer('div', 'trace-vars');
    etat.appendChild(zoneVars);
    var zoneTableau = null;
    if (config.tableau) {
      etat.appendChild(creer('h4', '', 'Le tableau ' + config.tableau.nom + ' (indices en dessous)'));
      zoneTableau = creer('div', 'trace-tableau');
      etat.appendChild(zoneTableau);
    }
    etat.appendChild(creer('h4', '', 'Console'));
    var sortie = creer('pre', 'trace-sortie');
    etat.appendChild(sortie);
    grille.appendChild(etat);
    racine.appendChild(grille);

    var note = creer('p', 'trace-note');
    note.setAttribute('aria-live', 'polite');
    racine.appendChild(note);

    var commandes = creer('div', 'trace-commandes');
    var bDebut = creer('button', 'btn secondary petit', '⏮ Recommencer');
    var bPrec = creer('button', 'btn secondary petit', '◀ Précédent');
    var bSuiv = creer('button', 'btn petit', 'Suivant ▶');
    var bAuto = creer('button', 'btn secondary petit', '▶▶ Lecture auto');
    var compteur = creer('span', 'trace-compteur');
    [bDebut, bPrec, bSuiv, bAuto].forEach(function (b) {
      b.type = 'button';
      commandes.appendChild(b);
    });
    commandes.appendChild(compteur);
    racine.appendChild(commandes);

    // ---------- Calcul de toutes les étapes ----------
    function calculer() {
      arreterAuto();
      var lignes = typeof config.code === 'function' ? config.code(params) : config.code;
      code.innerHTML = '';
      lignes.forEach(function (ligne) { code.appendChild(creer('span', '', ligne)); });

      var v = {};
      var ecrits = [];
      function ecrire() {
        ecrits.push(Array.prototype.map.call(arguments, function (x) { return formater(x, false); }).join(' '));
      }

      etapes = [{
        ligne: 0,
        note: config.intro || 'Le programme n\'a pas encore démarré : cliquez sur « Suivant » pour exécuter la première ligne.',
        vars: {},
        sortie: []
      }];

      var gen = config.executer(v, ecrire, params);
      var res = gen.next();
      while (!res.done) {
        etapes.push({ ligne: res.value[0], note: res.value[1], vars: copie(v), sortie: ecrits.slice() });
        if (etapes.length > MAX_ETAPES) {
          etapes.push({
            ligne: 0,
            note: '⚠ Plus de ' + MAX_ETAPES + ' étapes : on arrête tout. C\'est une boucle infinie, la condition ne devient jamais fausse !',
            vars: copie(v),
            sortie: ecrits.slice()
          });
          break;
        }
        res = gen.next();
      }
      if (etapes.length <= MAX_ETAPES + 1) {
        etapes.push({
          ligne: 0,
          note: config.fin || 'Fin du programme : il n\'y a plus de ligne à exécuter.',
          vars: copie(v),
          sortie: ecrits.slice()
        });
      }
      aller(0);
    }

    // ---------- Affichage d'une étape ----------
    function dessinerVariables(e, avant) {
      zoneVars.innerHTML = '';
      config.variables.forEach(function (nom) {
        if (config.tableau && nom === config.tableau.nom) return;
        var existe = Object.prototype.hasOwnProperty.call(e.vars, nom);
        var val = e.vars[nom];
        var boite = creer('div', 'boite');
        if (!existe || val === undefined) boite.classList.add('vide');
        if (existe && formater(val, true) !== formater(avant.vars[nom], true)) boite.classList.add('modifiee');
        boite.appendChild(creer('div', 'boite-valeur', !existe ? '—' : val === undefined ? 'undefined' : formater(val, true)));
        boite.appendChild(creer('span', 'boite-nom', nom));
        boite.title = !existe ? 'La variable ' + nom + ' n\'existe pas (encore ou plus).' : '';
        zoneVars.appendChild(boite);
      });
    }

    function dessinerTableau(e) {
      if (!zoneTableau) return;
      zoneTableau.innerHTML = '';
      var tab = e.vars[config.tableau.nom];
      if (!Array.isArray(tab)) {
        zoneTableau.appendChild(creer('span', 'trace-compteur', 'pas encore créé'));
        return;
      }
      var indice = e.vars[config.tableau.indice];
      tab.forEach(function (x, i) {
        var caseT = creer('div', 'trace-case' + (i === indice ? ' pointee' : ''));
        caseT.appendChild(creer('div', '', formater(x, true)));
        caseT.appendChild(creer('small', '', i === indice ? config.tableau.indice + '=' + i : String(i)));
        zoneTableau.appendChild(caseT);
      });
    }

    function aller(n) {
      position = Math.max(0, Math.min(n, etapes.length - 1));
      var e = etapes[position];
      var avant = etapes[Math.max(0, position - 1)];
      Array.prototype.forEach.call(code.children, function (span, i) {
        span.classList.toggle('courante', i + 1 === e.ligne);
      });
      dessinerVariables(e, avant);
      dessinerTableau(e);
      sortie.textContent = e.sortie.join('\n');
      sortie.scrollTop = sortie.scrollHeight;
      note.textContent = e.note;
      compteur.textContent = 'Étape ' + position + ' / ' + (etapes.length - 1);
      bDebut.disabled = bPrec.disabled = position === 0;
      bSuiv.disabled = position === etapes.length - 1;
      if (bSuiv.disabled) arreterAuto();
    }

    function arreterAuto() {
      if (minuterie) clearInterval(minuterie);
      minuterie = null;
      bAuto.textContent = '▶▶ Lecture auto';
    }

    bDebut.addEventListener('click', function () { arreterAuto(); aller(0); });
    bPrec.addEventListener('click', function () { arreterAuto(); aller(position - 1); });
    bSuiv.addEventListener('click', function () { aller(position + 1); });
    bAuto.addEventListener('click', function () {
      if (minuterie) return arreterAuto();
      if (position === etapes.length - 1) aller(0);
      bAuto.textContent = '⏸ Pause';
      minuterie = setInterval(function () { aller(position + 1); }, 1100);
    });

    calculer();
  }

  return { monter: monter };
})();
