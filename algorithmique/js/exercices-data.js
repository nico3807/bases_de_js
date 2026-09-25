// Contenu des exercices. Modifier ou ajouter un exercice ne demande que
// d'éditer ce fichier : js/exercices.js s'occupe de l'affichage.
//
// Les données sont dans un fichier .js (et non .json comme dans le TP
// R3.14) pour que la page fonctionne aussi en double-cliquant sur le
// fichier HTML, sans serveur local : fetch() est bloqué en file://.
//
// Champs d'un exercice :
//   id, titre, chapitre (variables | conditions | boucles | tableaux | fonctions),
//   niveau (1 facile, 2 moyen, 3 défi),
//   consigne (HTML), code (code de départ), indice (HTML), solution (code),
//   cas : liste des vérifications. Chaque cas peut
//     - remplacer la valeur de départ d'une variable (valeurs: { n: 7 }) :
//       la ligne « let n = ...; » du code de l'étudiant·e est réécrite ;
//     - comparer la console à « sortie » (tableau de lignes attendues) ;
//     - évaluer une expression « appel » et comparer au résultat « attendu ».

var EXERCICES = [
  // ---------------------------------------------------------- Variables
  {
    id: 1,
    titre: 'Se présenter',
    chapitre: 'variables',
    niveau: 1,
    consigne:
      '<p>Deux variables sont déjà déclarées. Sans écrire le prénom ni l\'âge « en dur », affichez la phrase :</p>' +
      '<pre><code>Je m\'appelle Léa et j\'ai 19 ans.</code></pre>' +
      '<p>Votre programme doit continuer de fonctionner si l\'on change les valeurs de départ.</p>',
    code: 'let prenom = "Léa";\nlet age = 19;\n\n// Affichez la phrase avec console.log()\n',
    indice: '<p>Utilisez l\'opérateur <code>+</code> pour coller (concaténer) les morceaux de texte et les variables : <code>"Je m\'appelle " + prenom + ...</code>. Attention aux espaces !</p>',
    solution: 'let prenom = "Léa";\nlet age = 19;\n\nconsole.log("Je m\'appelle " + prenom + " et j\'ai " + age + " ans.");',
    cas: [
      { valeurs: { prenom: 'Léa', age: 19 }, sortie: ['Je m\'appelle Léa et j\'ai 19 ans.'] },
      { valeurs: { prenom: 'Yanis', age: 21 }, sortie: ['Je m\'appelle Yanis et j\'ai 21 ans.'] }
    ]
  },
  {
    id: 2,
    titre: 'Échanger deux variables',
    chapitre: 'variables',
    niveau: 1,
    consigne:
      '<p>Échangez le contenu des variables <code>a</code> et <code>b</code>, puis affichez :</p>' +
      '<pre><code>a = bleu, b = rouge</code></pre>' +
      '<p>Interdit de réécrire les mots « bleu » ou « rouge » après les deux premières lignes.</p>',
    code: 'let a = "rouge";\nlet b = "bleu";\n\n// Échangez a et b ici\n\n\nconsole.log("a = " + a + ", b = " + b);\n',
    indice: '<p>Pensez aux deux verres de sirop : pour échanger leur contenu, il faut un <strong>troisième verre</strong> vide. Créez une variable <code>temp</code>.</p>',
    solution: 'let a = "rouge";\nlet b = "bleu";\n\nlet temp = a;\na = b;\nb = temp;\n\nconsole.log("a = " + a + ", b = " + b);',
    cas: [
      { valeurs: { a: 'rouge', b: 'bleu' }, sortie: ['a = bleu, b = rouge'] },
      { valeurs: { a: 'chat', b: 'chien' }, sortie: ['a = chien, b = chat'] }
    ]
  },
  {
    id: 3,
    titre: 'Convertir une durée',
    chapitre: 'variables',
    niveau: 2,
    consigne:
      '<p>Une vidéo dure <code>secondes</code> secondes. Affichez sa durée en heures, minutes et secondes. Pour 3725 secondes :</p>' +
      '<pre><code>1 h 2 min 5 s</code></pre>',
    code: 'let secondes = 3725;\n\n// Calculez heures, minutes et reste\n',
    indice: '<p>Une heure = 3600 s. <code>Math.floor(secondes / 3600)</code> donne le nombre d\'heures entières. L\'opérateur <code>%</code> (modulo) donne le <strong>reste</strong> de la division : <code>secondes % 3600</code> est ce qui reste une fois les heures retirées.</p>',
    solution: 'let secondes = 3725;\n\nlet heures = Math.floor(secondes / 3600);\nlet reste = secondes % 3600;\nlet minutes = Math.floor(reste / 60);\nlet sec = reste % 60;\n\nconsole.log(heures + " h " + minutes + " min " + sec + " s");',
    cas: [
      { valeurs: { secondes: 3725 }, sortie: ['1 h 2 min 5 s'] },
      { valeurs: { secondes: 59 }, sortie: ['0 h 0 min 59 s'] },
      { valeurs: { secondes: 7260 }, sortie: ['2 h 1 min 0 s'] }
    ]
  },

  // --------------------------------------------------------- Conditions
  {
    id: 4,
    titre: 'Pair ou impair ?',
    chapitre: 'conditions',
    niveau: 1,
    consigne:
      '<p>Affichez <code>7 est impair</code> ou <code>12 est pair</code> selon la valeur de <code>n</code>.</p>',
    code: 'let n = 7;\n\n',
    indice: '<p>Un nombre est pair si le reste de sa division par 2 vaut 0 : <code>n % 2 === 0</code>.</p>',
    solution: 'let n = 7;\n\nif (n % 2 === 0) {\n  console.log(n + " est pair");\n} else {\n  console.log(n + " est impair");\n}',
    cas: [
      { valeurs: { n: 7 }, sortie: ['7 est impair'] },
      { valeurs: { n: 12 }, sortie: ['12 est pair'] },
      { valeurs: { n: 0 }, sortie: ['0 est pair'] }
    ]
  },
  {
    id: 5,
    titre: 'Mention au diplôme',
    chapitre: 'conditions',
    niveau: 2,
    consigne:
      '<p>Selon la <code>note</code> sur 20, affichez :</p>' +
      '<ul><li>moins de 10 : <code>Ajourné</code></li><li>de 10 à moins de 12 : <code>Admis</code></li>' +
      '<li>de 12 à moins de 14 : <code>Assez bien</code></li><li>de 14 à moins de 16 : <code>Bien</code></li>' +
      '<li>16 et plus : <code>Très bien</code></li></ul>',
    code: 'let note = 13.5;\n\n',
    indice: '<p>Enchaînez des <code>if … else if … else</code> en testant les seuils <strong>dans l\'ordre croissant</strong> : dès qu\'une condition est vraie, les suivantes sont ignorées, donc <code>else if (note &lt; 12)</code> suffit, inutile de réécrire <code>note &gt;= 10</code>.</p>',
    solution: 'let note = 13.5;\n\nif (note < 10) {\n  console.log("Ajourné");\n} else if (note < 12) {\n  console.log("Admis");\n} else if (note < 14) {\n  console.log("Assez bien");\n} else if (note < 16) {\n  console.log("Bien");\n} else {\n  console.log("Très bien");\n}',
    cas: [
      { valeurs: { note: 8 }, sortie: ['Ajourné'] },
      { valeurs: { note: 10 }, sortie: ['Admis'] },
      { valeurs: { note: 13.5 }, sortie: ['Assez bien'] },
      { valeurs: { note: 14 }, sortie: ['Bien'] },
      { valeurs: { note: 16 }, sortie: ['Très bien'] }
    ]
  },
  {
    id: 6,
    titre: 'Année bissextile',
    chapitre: 'conditions',
    niveau: 3,
    consigne:
      '<p>Une année est bissextile si elle est divisible par 4 <strong>mais pas</strong> par 100, <strong>ou</strong> si elle est divisible par 400. Affichez <code>2024 est bissextile</code> ou <code>2023 n\'est pas bissextile</code>.</p>',
    code: 'let annee = 2024;\n\n',
    indice: '<p>« divisible par 4 » s\'écrit <code>annee % 4 === 0</code>. Combinez avec <code>&amp;&amp;</code> (ET), <code>||</code> (OU) et <code>!==</code> (différent). Placez des parenthèses pour bien grouper : <code>(A &amp;&amp; B) || C</code>.</p>',
    solution: 'let annee = 2024;\n\nif ((annee % 4 === 0 && annee % 100 !== 0) || annee % 400 === 0) {\n  console.log(annee + " est bissextile");\n} else {\n  console.log(annee + " n\'est pas bissextile");\n}',
    cas: [
      { valeurs: { annee: 2024 }, sortie: ['2024 est bissextile'] },
      { valeurs: { annee: 2023 }, sortie: ['2023 n\'est pas bissextile'] },
      { valeurs: { annee: 1900 }, sortie: ['1900 n\'est pas bissextile'] },
      { valeurs: { annee: 2000 }, sortie: ['2000 est bissextile'] }
    ]
  },

  // ------------------------------------------------------------ Boucles
  {
    id: 7,
    titre: 'Compte à rebours',
    chapitre: 'boucles',
    niveau: 1,
    consigne:
      '<p>Affichez les nombres de <code>n</code> jusqu\'à 1 (un par ligne), puis <code>Décollage !</code>. Pour n = 3 :</p>' +
      '<pre><code>3\n2\n1\nDécollage !</code></pre>',
    code: 'let n = 5;\n\n',
    indice: '<p>Une boucle <code>for</code> peut aussi <strong>descendre</strong> : on part de <code>n</code>, on continue tant que <code>i &gt;= 1</code> et on fait <code>i--</code>. Le message final se place <strong>après</strong> la boucle.</p>',
    solution: 'let n = 5;\n\nfor (let i = n; i >= 1; i--) {\n  console.log(i);\n}\nconsole.log("Décollage !");',
    cas: [
      { valeurs: { n: 3 }, sortie: ['3', '2', '1', 'Décollage !'] },
      { valeurs: { n: 5 }, sortie: ['5', '4', '3', '2', '1', 'Décollage !'] }
    ]
  },
  {
    id: 8,
    titre: 'Table de multiplication',
    chapitre: 'boucles',
    niveau: 1,
    consigne:
      '<p>Affichez la table de multiplication de <code>n</code>, de 1 à 10. Pour n = 7, la première ligne est <code>7 x 1 = 7</code> et la dernière <code>7 x 10 = 70</code>.</p>',
    code: 'let n = 7;\n\n',
    indice: '<p>Le compteur <code>i</code> va de 1 à 10 ; à chaque tour on affiche <code>n + " x " + i + " = " + (n * i)</code>. Les parenthèses autour du calcul sont importantes !</p>',
    solution: 'let n = 7;\n\nfor (let i = 1; i <= 10; i++) {\n  console.log(n + " x " + i + " = " + (n * i));\n}',
    cas: [
      { valeurs: { n: 7 }, sortie: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (i) { return '7 x ' + i + ' = ' + 7 * i; }) },
      { valeurs: { n: 3 }, sortie: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (i) { return '3 x ' + i + ' = ' + 3 * i; }) }
    ]
  },
  {
    id: 9,
    titre: 'Somme des entiers',
    chapitre: 'boucles',
    niveau: 1,
    consigne:
      '<p>Calculez 1 + 2 + 3 + … + <code>n</code> avec une boucle, puis affichez <code>Somme : 5050</code> (pour n = 100).</p>',
    code: 'let n = 100;\n\n',
    indice: '<p>C\'est le schéma de l\'<strong>accumulateur</strong> : une variable <code>somme</code> qui vaut 0 avant la boucle et à laquelle on ajoute <code>i</code> à chaque tour.</p>',
    solution: 'let n = 100;\n\nlet somme = 0;\nfor (let i = 1; i <= n; i++) {\n  somme = somme + i;\n}\nconsole.log("Somme : " + somme);',
    cas: [
      { valeurs: { n: 100 }, sortie: ['Somme : 5050'] },
      { valeurs: { n: 10 }, sortie: ['Somme : 55'] },
      { valeurs: { n: 1 }, sortie: ['Somme : 1'] }
    ]
  },
  {
    id: 10,
    titre: 'Doubler son épargne',
    chapitre: 'boucles',
    niveau: 2,
    consigne:
      '<p>On place 1000 € à <code>taux</code> % par an : chaque année, le capital augmente de <code>taux</code> %. Combien d\'années faut-il pour atteindre <strong>au moins</strong> 2000 € ? Affichez <code>Il faut 15 ans</code> (pour un taux de 5 %).</p>',
    code: 'let taux = 5;\n\nlet capital = 1000;\n',
    indice: '<p>On ne sait pas à l\'avance combien de tours faire : c\'est un travail pour <code>while</code>. Tant que <code>capital &lt; 2000</code>, on multiplie le capital par <code>(1 + taux / 100)</code> et on ajoute 1 à un compteur d\'années.</p>',
    solution: 'let taux = 5;\n\nlet capital = 1000;\nlet annees = 0;\nwhile (capital < 2000) {\n  capital = capital * (1 + taux / 100);\n  annees = annees + 1;\n}\nconsole.log("Il faut " + annees + " ans");',
    cas: [
      { valeurs: { taux: 5 }, sortie: ['Il faut 15 ans'] },
      { valeurs: { taux: 10 }, sortie: ['Il faut 8 ans'] },
      { valeurs: { taux: 20 }, sortie: ['Il faut 4 ans'] }
    ]
  },
  {
    id: 11,
    titre: 'FizzBuzz',
    chapitre: 'boucles',
    niveau: 3,
    consigne:
      '<p>Le grand classique des entretiens de développeur·euse. Pour chaque nombre de 1 à <code>n</code>, affichez :</p>' +
      '<ul><li><code>FizzBuzz</code> s\'il est divisible par 3 <strong>et</strong> par 5 ;</li><li><code>Fizz</code> s\'il est divisible par 3 ;</li>' +
      '<li><code>Buzz</code> s\'il est divisible par 5 ;</li><li>le nombre lui-même sinon.</li></ul>',
    code: 'let n = 15;\n\n',
    indice: '<p>Une boucle qui contient des conditions. Piège : si vous testez « divisible par 3 » en premier, 15 affichera <code>Fizz</code> et jamais <code>FizzBuzz</code>. Quel test faut-il placer <strong>en premier</strong> ?</p>',
    solution: 'let n = 15;\n\nfor (let i = 1; i <= n; i++) {\n  if (i % 3 === 0 && i % 5 === 0) {\n    console.log("FizzBuzz");\n  } else if (i % 3 === 0) {\n    console.log("Fizz");\n  } else if (i % 5 === 0) {\n    console.log("Buzz");\n  } else {\n    console.log(i);\n  }\n}',
    cas: [
      { valeurs: { n: 15 }, sortie: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'] },
      { valeurs: { n: 5 }, sortie: ['1', '2', 'Fizz', '4', 'Buzz'] }
    ]
  },

  // ----------------------------------------------------------- Tableaux
  {
    id: 12,
    titre: 'Moyenne des notes',
    chapitre: 'tableaux',
    niveau: 1,
    consigne:
      '<p>Calculez la moyenne des notes du tableau et affichez <code>Moyenne : 12.5</code>. Le programme doit fonctionner quel que soit le nombre de notes.</p>',
    code: 'let notes = [12, 15, 9, 14];\n\n',
    indice: '<p>Additionnez toutes les cases avec une boucle de <code>0</code> à <code>notes.length - 1</code>, puis divisez la somme par <code>notes.length</code>.</p>',
    solution: 'let notes = [12, 15, 9, 14];\n\nlet somme = 0;\nfor (let i = 0; i < notes.length; i++) {\n  somme = somme + notes[i];\n}\nconsole.log("Moyenne : " + somme / notes.length);',
    cas: [
      { valeurs: { notes: [12, 15, 9, 14] }, sortie: ['Moyenne : 12.5'] },
      { valeurs: { notes: [10, 20] }, sortie: ['Moyenne : 15'] },
      { valeurs: { notes: [8, 11, 17, 4, 10] }, sortie: ['Moyenne : 10'] }
    ]
  },
  {
    id: 13,
    titre: 'Compter les publications populaires',
    chapitre: 'tableaux',
    niveau: 1,
    consigne:
      '<p>Le tableau <code>likes</code> contient le nombre de likes de chaque publication d\'un compte Instagram. Comptez celles qui ont <strong>au moins 100</strong> likes et affichez <code>3 publications populaires</code>.</p>',
    code: 'let likes = [45, 120, 98, 300, 100, 12];\n\n',
    indice: '<p>C\'est le schéma du <strong>compteur</strong> : <code>let compteur = 0;</code> avant la boucle, et <code>compteur = compteur + 1;</code> uniquement quand la condition est vraie.</p>',
    solution: 'let likes = [45, 120, 98, 300, 100, 12];\n\nlet compteur = 0;\nfor (let i = 0; i < likes.length; i++) {\n  if (likes[i] >= 100) {\n    compteur = compteur + 1;\n  }\n}\nconsole.log(compteur + " publications populaires");',
    cas: [
      { valeurs: { likes: [45, 120, 98, 300, 100, 12] }, sortie: ['3 publications populaires'] },
      { valeurs: { likes: [5, 10] }, sortie: ['0 publications populaires'] },
      { valeurs: { likes: [150, 99, 101, 1000] }, sortie: ['3 publications populaires'] }
    ]
  },
  {
    id: 14,
    titre: 'Le minimum et sa position',
    chapitre: 'tableaux',
    niveau: 2,
    consigne:
      '<p>Trouvez la plus petite valeur du tableau <code>temperatures</code> <strong>et son indice</strong>. Affichez <code>Minimum : -3 (case 4)</code>.</p>',
    code: 'let temperatures = [4, 2, 7, 1, -3, 5];\n\n',
    indice: '<p>Adaptez l\'algorithme du maximum vu en cours : on suppose que la case 0 est le minimum, puis on parcourt les autres cases. Quand on trouve plus petit, on retient <strong>la valeur ET l\'indice</strong> dans deux variables.</p>',
    solution: 'let temperatures = [4, 2, 7, 1, -3, 5];\n\nlet min = temperatures[0];\nlet position = 0;\nfor (let i = 1; i < temperatures.length; i++) {\n  if (temperatures[i] < min) {\n    min = temperatures[i];\n    position = i;\n  }\n}\nconsole.log("Minimum : " + min + " (case " + position + ")");',
    cas: [
      { valeurs: { temperatures: [4, 2, 7, 1, -3, 5] }, sortie: ['Minimum : -3 (case 4)'] },
      { valeurs: { temperatures: [-8, 0, 3] }, sortie: ['Minimum : -8 (case 0)'] },
      { valeurs: { temperatures: [10, 9, 8, 7] }, sortie: ['Minimum : 7 (case 3)'] }
    ]
  },

  // ---------------------------------------------------------- Fonctions
  {
    id: 15,
    titre: 'La fonction estPair',
    chapitre: 'fonctions',
    niveau: 1,
    consigne:
      '<p>Écrivez une fonction <code>estPair(n)</code> qui <strong>renvoie</strong> (<code>return</code>) <code>true</code> si <code>n</code> est pair, <code>false</code> sinon. Elle ne doit rien afficher.</p>',
    code: 'function estPair(n) {\n  // à compléter\n}\n\n// Pour tester vous-même :\nconsole.log(estPair(4));\nconsole.log(estPair(7));\n',
    indice: '<p>La comparaison <code>n % 2 === 0</code> vaut déjà <code>true</code> ou <code>false</code> : on peut la renvoyer directement avec <code>return n % 2 === 0;</code>.</p>',
    solution: 'function estPair(n) {\n  return n % 2 === 0;\n}\n\nconsole.log(estPair(4));\nconsole.log(estPair(7));',
    cas: [
      { appel: 'estPair(4)', attendu: true },
      { appel: 'estPair(7)', attendu: false },
      { appel: 'estPair(0)', attendu: true },
      { appel: 'estPair(-3)', attendu: false }
    ]
  },
  {
    id: 16,
    titre: 'La fonction maximum',
    chapitre: 'fonctions',
    niveau: 1,
    consigne:
      '<p>Écrivez une fonction <code>maximum(a, b)</code> qui renvoie le plus grand des deux nombres.</p>',
    code: 'function maximum(a, b) {\n  // à compléter\n}\n\nconsole.log(maximum(3, 8));\n',
    indice: '<p>Un <code>if</code> et deux <code>return</code> : dès qu\'un <code>return</code> est exécuté, la fonction s\'arrête.</p>',
    solution: 'function maximum(a, b) {\n  if (a > b) {\n    return a;\n  }\n  return b;\n}\n\nconsole.log(maximum(3, 8));',
    cas: [
      { appel: 'maximum(3, 8)', attendu: 8 },
      { appel: 'maximum(10, 2)', attendu: 10 },
      { appel: 'maximum(-5, -1)', attendu: -1 },
      { appel: 'maximum(4, 4)', attendu: 4 }
    ]
  },
  {
    id: 17,
    titre: 'La fonction moyenne',
    chapitre: 'fonctions',
    niveau: 2,
    consigne:
      '<p>Écrivez une fonction <code>moyenne(tableau)</code> qui renvoie la moyenne des nombres du tableau reçu en paramètre. Réutilisez le travail de l\'exercice 12 !</p>',
    code: 'function moyenne(tableau) {\n  // à compléter\n}\n\nconsole.log(moyenne([12, 15, 9, 14]));\n',
    indice: '<p>Même algorithme qu\'à l\'exercice 12, mais on travaille sur le paramètre <code>tableau</code> et on termine par <code>return somme / tableau.length;</code> au lieu d\'un <code>console.log</code>.</p>',
    solution: 'function moyenne(tableau) {\n  let somme = 0;\n  for (let i = 0; i < tableau.length; i++) {\n    somme = somme + tableau[i];\n  }\n  return somme / tableau.length;\n}\n\nconsole.log(moyenne([12, 15, 9, 14]));',
    cas: [
      { appel: 'moyenne([12, 15, 9, 14])', attendu: 12.5 },
      { appel: 'moyenne([10])', attendu: 10 },
      { appel: 'moyenne([0, 20, 10])', attendu: 10 }
    ]
  },
  {
    id: 18,
    titre: 'Compter les voyelles',
    chapitre: 'fonctions',
    niveau: 3,
    consigne:
      '<p>Écrivez une fonction <code>compterVoyelles(mot)</code> qui renvoie le nombre de voyelles (a, e, i, o, u, y) du mot, écrit en minuscules sans accent. Une chaîne se parcourt comme un tableau : <code>mot[i]</code> est la lettre d\'indice <code>i</code> et <code>mot.length</code> sa longueur.</p>',
    code: 'function compterVoyelles(mot) {\n  // à compléter\n}\n\nconsole.log(compterVoyelles("javascript"));\n',
    indice: '<p>Parcourez les lettres avec une boucle. Pour savoir si une lettre est une voyelle, la méthode <code>"aeiouy".includes(lettre)</code> renvoie <code>true</code> ou <code>false</code>. Sinon, un long <code>if</code> avec des <code>||</code> fonctionne aussi.</p>',
    solution: 'function compterVoyelles(mot) {\n  let compteur = 0;\n  for (let i = 0; i < mot.length; i++) {\n    if ("aeiouy".includes(mot[i])) {\n      compteur = compteur + 1;\n    }\n  }\n  return compteur;\n}\n\nconsole.log(compterVoyelles("javascript"));',
    cas: [
      { appel: 'compterVoyelles("javascript")', attendu: 3 },
      { appel: 'compterVoyelles("mmi")', attendu: 1 },
      { appel: 'compterVoyelles("rythme")', attendu: 2 },
      { appel: 'compterVoyelles("")', attendu: 0 }
    ]
  }
];
