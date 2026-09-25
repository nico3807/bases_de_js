// Bac à sable : une zone de code JavaScript que l'on peut exécuter dans la
// page, avec une console qui affiche les console.log().
//
// Le code tourne dans un Web Worker : si une boucle ne s'arrête jamais, on
// coupe le worker au bout de 2 secondes au lieu de figer l'onglet. Si le
// navigateur refuse de créer le worker, on exécute le code directement dans
// la page (sans cette protection).
//
// Dans le HTML, il suffit d'écrire :
//   <div class="essai" data-essai><textarea>console.log("Bonjour");</textarea></div>
// La page des exercices utilise BacASable.monter() avec des cas de test.

var BacASable = (function () {
  var DELAI_MAX = 2000;

  // Même rendu que la console du navigateur, en plus simple : les chaînes
  // sont affichées telles quelles, sauf à l'intérieur d'un tableau.
  function formater(valeur, imbrique) {
    if (typeof valeur === 'string') return imbrique ? '"' + valeur + '"' : valeur;
    if (typeof valeur === 'function') return '[Function ' + (valeur.name || 'anonyme') + ']';
    if (Array.isArray(valeur)) {
      return '[' + valeur.map(function (x) { return formater(x, true); }).join(', ') + ']';
    }
    if (valeur && typeof valeur === 'object') {
      return '{ ' + Object.keys(valeur).map(function (k) {
        return k + ': ' + formater(valeur[k], true);
      }).join(', ') + ' }';
    }
    return String(valeur);
  }

  // Exécute le code et renvoie { sortie: [lignes], erreur, valeur }.
  // « appel » est une expression facultative évaluée après le code, dans sa
  // portée (par exemple estPair(4)) : c'est ainsi qu'on teste une fonction.
  function executerIci(message) {
    var lignes = [];
    function log() {
      lignes.push(Array.prototype.map.call(arguments, function (x) { return formater(x, false); }).join(' '));
    }
    var faux = { log: log, info: log, warn: log, error: log };
    var alerte = function (m) { lignes.push('[alert] ' + formater(m, false)); };
    var question = function (m, defaut) {
      lignes.push('[prompt] ' + formater(m, false) + ' → ' + (defaut === undefined ? 'null' : defaut));
      return defaut === undefined ? null : String(defaut);
    };
    var res = { sortie: lignes, erreur: null, valeur: null, aValeur: false };
    try {
      var corps = message.code + '\n;' +
        (message.appel ? 'return (function () { return (' + message.appel + '); });' : '');
      var fn = new Function('console', 'alert', 'prompt', corps)(faux, alerte, question);
      if (message.appel) {
        res.valeur = formater(fn(), true);
        res.aValeur = true;
      }
    } catch (err) {
      res.erreur = err.name + ' : ' + err.message;
    }
    return res;
  }

  var urlWorker = null;
  function creerWorker() {
    if (!urlWorker) {
      var source = formater.toString() + '\n' + executerIci.toString() +
        '\nself.onmessage = function (e) { self.postMessage(executerIci(e.data)); };';
      urlWorker = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    }
    return new Worker(urlWorker);
  }

  function executer(code, appel) {
    var message = { code: code, appel: appel || '' };
    return new Promise(function (resoudre) {
      var worker;
      try {
        worker = creerWorker();
      } catch (e) {
        resoudre(executerIci(message));
        return;
      }
      var minuterie = setTimeout(function () {
        worker.terminate();
        resoudre({
          sortie: [],
          erreur: 'Arrêt forcé après ' + (DELAI_MAX / 1000) + ' s : le programme ne se termine pas. Vérifiez vos boucles (la condition finit-elle par devenir fausse ?).'
        });
      }, DELAI_MAX);
      worker.onmessage = function (e) {
        clearTimeout(minuterie);
        worker.terminate();
        resoudre(e.data);
      };
      worker.onerror = function (e) {
        clearTimeout(minuterie);
        worker.terminate();
        e.preventDefault();
        resoudre({ sortie: [], erreur: e.message || 'Erreur inconnue' });
      };
      worker.postMessage(message);
    });
  }

  function afficherSortie(zone, res) {
    zone.innerHTML = '';
    res.sortie.forEach(function (ligne) {
      zone.appendChild(document.createTextNode(ligne + '\n'));
    });
    if (res.erreur) {
      var err = document.createElement('span');
      err.className = 'erreur';
      err.textContent = '✘ ' + res.erreur;
      zone.appendChild(err);
    }
    if (!res.sortie.length && !res.erreur) {
      var vide = document.createElement('span');
      vide.className = 'discret';
      vide.textContent = '(rien n\'a été affiché : avez-vous écrit un console.log() ?)';
      zone.appendChild(vide);
    }
  }

  // Tab insère deux espaces ; Échap puis Tab permet de quitter la zone au
  // clavier, comme dans VS Code.
  function gererTabulation(zone) {
    var echap = false;
    zone.addEventListener('keydown', function (evt) {
      if (evt.key === 'Escape') { echap = true; return; }
      if (evt.key === 'Tab' && !echap && !evt.shiftKey) {
        evt.preventDefault();
        var debut = zone.selectionStart;
        zone.value = zone.value.slice(0, debut) + '  ' + zone.value.slice(zone.selectionEnd);
        zone.selectionStart = zone.selectionEnd = debut + 2;
      }
      echap = false;
    });
  }

  // options : { code, titre, onVerifier(code, zoneSortie) }
  function monter(racine, options) {
    options = options || {};
    var zone = racine.querySelector('textarea') || document.createElement('textarea');
    if (options.code !== undefined) zone.value = options.code;
    var initial = options.codeInitial !== undefined ? options.codeInitial : zone.value;
    zone.spellcheck = false;
    zone.setAttribute('autocapitalize', 'off');
    zone.setAttribute('aria-label', 'Code JavaScript');
    zone.rows = Math.max(6, zone.value.split('\n').length + 1);
    gererTabulation(zone);

    var barre = document.createElement('div');
    barre.className = 'essai-barre';
    var titre = document.createElement('strong');
    titre.textContent = options.titre || racine.getAttribute('data-titre') || 'À vous de jouer';
    barre.appendChild(titre);

    var bExec = document.createElement('button');
    bExec.type = 'button';
    bExec.className = 'btn petit';
    bExec.textContent = '▶ Exécuter';
    bExec.title = 'Raccourci : Ctrl + Entrée';
    var bReset = document.createElement('button');
    bReset.type = 'button';
    bReset.className = 'btn secondary petit';
    bReset.textContent = 'Réinitialiser';
    barre.appendChild(bExec);
    var bVerif = null;
    if (options.onVerifier) {
      bVerif = document.createElement('button');
      bVerif.type = 'button';
      bVerif.className = 'btn petit';
      bVerif.style.background = 'var(--ok)';
      bVerif.style.borderColor = 'var(--ok)';
      bVerif.textContent = '✔ Vérifier';
      barre.appendChild(bVerif);
    }
    barre.appendChild(bReset);

    var sortie = document.createElement('pre');
    sortie.className = 'essai-sortie';
    sortie.setAttribute('aria-live', 'polite');
    sortie.innerHTML = '<span class="discret">La console s\'affichera ici.</span>';

    var verdict = document.createElement('div');
    verdict.className = 'essai-verdict';
    verdict.hidden = true;

    racine.innerHTML = '';
    racine.appendChild(barre);
    racine.appendChild(zone);
    racine.appendChild(sortie);
    racine.appendChild(verdict);

    function lancer() {
      sortie.innerHTML = '<span class="discret">Exécution…</span>';
      verdict.hidden = true;
      executer(zone.value).then(function (res) { afficherSortie(sortie, res); });
    }

    bExec.addEventListener('click', lancer);
    zone.addEventListener('keydown', function (evt) {
      if (evt.key === 'Enter' && (evt.ctrlKey || evt.metaKey)) {
        evt.preventDefault();
        lancer();
      }
    });
    bReset.addEventListener('click', function () {
      zone.value = initial;
      verdict.hidden = true;
      sortie.innerHTML = '<span class="discret">La console s\'affichera ici.</span>';
      zone.dispatchEvent(new Event('input'));
    });
    if (bVerif) {
      bVerif.addEventListener('click', function () {
        verdict.hidden = false;
        verdict.className = 'essai-verdict';
        verdict.textContent = 'Vérification en cours…';
        options.onVerifier(zone.value, verdict, sortie);
      });
    }

    return { zone: zone, sortie: sortie, verdict: verdict };
  }

  document.querySelectorAll('[data-essai]').forEach(function (bloc) { monter(bloc); });

  return { executer: executer, monter: monter, afficherSortie: afficherSortie, formater: formater };
})();
