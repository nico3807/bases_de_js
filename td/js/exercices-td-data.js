// Exercices de validation du TD Bases du JavaScript, à partir de la partie
// « Les Variables en JavaScript ». Chaque page du TD affiche les exercices de
// sa partie ; ils sont vérifiés automatiquement et comptent pour le
// certificat PDF. Même format que algorithmique/js/exercices-data.js.
//
// Le bac à sable n'a pas de page web : pas de prompt(), d'alert() ni de DOM.
// On part donc de valeurs fixées dans le code, on affiche avec console.log(),
// et la partie DOM travaille sur la logique du redimensionnement d'image.

var PARTIES_TD = [
  { id: 'variables', libelle: 'Les variables', page: 'page4_0.html' },
  { id: 'conditions', libelle: 'Les conditions', page: 'page4_1.html' },
  { id: 'boucles', libelle: 'Les boucles', page: 'page4_2.html' },
  { id: 'switch', libelle: 'Exercice switch', page: 'page5.html' },
  { id: 'fonctions', libelle: 'Les fonctions', page: 'page6.html' },
  { id: 'dom', libelle: 'Interaction DOM', page: 'page7.html' }
];

var PARCOURS_MMI = [
  'Création Numérique',
  'Développement Web et dispositifs interactifs',
  'Stratégie de communication numérique et design d\'expérience'
];

var EXERCICES_TD = [
  // ------------------------------------------------ Les variables (page4_0)
  {
    id: 1,
    titre: 'Se présenter (concaténation)',
    partie: 'variables',
    niveau: 1,
    consigne:
      '<p>Avec les deux variables fournies et l\'opérateur <code>+</code>, affichez :</p>' +
      '<pre><code>Je m\'appelle Léa et j\'habite à Béziers.</code></pre>' +
      '<p>N\'écrivez ni le prénom ni la ville « en dur » : le programme doit marcher avec d\'autres valeurs.</p>',
    code: 'let prenom = "Léa";\nlet ville = "Béziers";\n\n',
    indice: '<p>Collez les morceaux de texte et les variables avec <code>+</code> : <code>"Je m\'appelle " + prenom + " et ..."</code>. Attention aux espaces et au point final.</p>',
    solution: 'let prenom = "Léa";\nlet ville = "Béziers";\n\nconsole.log("Je m\'appelle " + prenom + " et j\'habite à " + ville + ".");',
    cas: [
      { valeurs: { prenom: 'Léa', ville: 'Béziers' }, sortie: ['Je m\'appelle Léa et j\'habite à Béziers.'] },
      { valeurs: { prenom: 'Yanis', ville: 'Sète' }, sortie: ['Je m\'appelle Yanis et j\'habite à Sète.'] }
    ]
  },
  {
    id: 2,
    titre: 'Gagner et perdre des vies (incrémentation)',
    partie: 'variables',
    niveau: 1,
    consigne:
      '<p>Dans un jeu, le joueur gagne une vie puis en perd deux. Utilisez <code>++</code> pour ajouter une vie, puis <code>-=</code> pour en retirer deux, et affichez :</p>' +
      '<pre><code>Vies : 2</code></pre><p>(pour 3 vies au départ).</p>',
    code: 'let vies = 3;\n\n',
    indice: '<p><code>vies++;</code> ajoute 1, <code>vies -= 2;</code> retire 2. Affichez ensuite <code>"Vies : " + vies</code>.</p>',
    solution: 'let vies = 3;\n\nvies++;\nvies -= 2;\nconsole.log("Vies : " + vies);',
    cas: [
      { valeurs: { vies: 3 }, sortie: ['Vies : 2'] },
      { valeurs: { vies: 10 }, sortie: ['Vies : 9'] }
    ]
  },
  {
    id: 3,
    titre: 'Prix total',
    partie: 'variables',
    niveau: 1,
    consigne:
      '<p>Calculez le prix total d\'une commande et affichez <code>Total : 36 €</code> (pour 3 articles à 12 €).</p>',
    code: 'let prixUnitaire = 12;\nlet quantite = 3;\n\n',
    indice: '<p>Stockez le calcul dans une variable <code>let total = prixUnitaire * quantite;</code>, puis concaténez-la dans le message.</p>',
    solution: 'let prixUnitaire = 12;\nlet quantite = 3;\n\nlet total = prixUnitaire * quantite;\nconsole.log("Total : " + total + " €");',
    cas: [
      { valeurs: { prixUnitaire: 12, quantite: 3 }, sortie: ['Total : 36 €'] },
      { valeurs: { prixUnitaire: 5, quantite: 4 }, sortie: ['Total : 20 €'] }
    ]
  },

  // --------------------------------------------- Les conditions (page4_1)
  {
    id: 4,
    titre: 'Majeur ou mineur ?',
    partie: 'conditions',
    niveau: 1,
    consigne:
      '<p>Selon l\'<code>age</code>, affichez <code>Vous êtes majeur.</code> (18 ans ou plus) ou <code>Vous êtes mineur.</code></p>',
    code: 'let age = 18;\n\n',
    indice: '<p>Une structure <code>if (age &gt;= 18) { … } else { … }</code>, comme dans l\'exemple du cours.</p>',
    solution: 'let age = 18;\n\nif (age >= 18) {\n  console.log("Vous êtes majeur.");\n} else {\n  console.log("Vous êtes mineur.");\n}',
    cas: [
      { valeurs: { age: 18 }, sortie: ['Vous êtes majeur.'] },
      { valeurs: { age: 17 }, sortie: ['Vous êtes mineur.'] },
      { valeurs: { age: 42 }, sortie: ['Vous êtes majeur.'] }
    ]
  },
  {
    id: 5,
    titre: 'Niveau A, B ou C (else if)',
    partie: 'conditions',
    niveau: 1,
    consigne:
      '<p>Affichez <code>Niveau A</code> si le <code>score</code> vaut au moins 90, <code>Niveau B</code> s\'il vaut au moins 80, et <code>Niveau C</code> sinon.</p>',
    code: 'let score = 85;\n\n',
    indice: '<p>Testez d\'abord le seuil le plus haut : <code>if (score &gt;= 90)</code>, puis <code>else if (score &gt;= 80)</code>, puis <code>else</code>.</p>',
    solution: 'let score = 85;\n\nif (score >= 90) {\n  console.log("Niveau A");\n} else if (score >= 80) {\n  console.log("Niveau B");\n} else {\n  console.log("Niveau C");\n}',
    cas: [
      { valeurs: { score: 95 }, sortie: ['Niveau A'] },
      { valeurs: { score: 90 }, sortie: ['Niveau A'] },
      { valeurs: { score: 85 }, sortie: ['Niveau B'] },
      { valeurs: { score: 42 }, sortie: ['Niveau C'] }
    ]
  },
  {
    id: 6,
    titre: 'Message du jour (switch)',
    partie: 'conditions',
    niveau: 2,
    consigne:
      '<p>Avec un <code>switch</code> sur <code>jour</code>, affichez :</p>' +
      '<ul><li><code>Bon début de semaine !</code> pour <code>"lundi"</code> ;</li>' +
      '<li><code>C\'est bientôt le week-end !</code> pour <code>"vendredi"</code> ;</li>' +
      '<li><code>Journée classique.</code> pour tous les autres jours.</li></ul>',
    code: 'let jour = "mardi";\n\n',
    indice: '<p>Reprenez l\'exemple du cours : un <code>case</code> par valeur, un <code>break</code> à la fin de chaque <code>case</code>, et <code>default</code> pour les autres jours.</p>',
    solution: 'let jour = "mardi";\n\nswitch (jour) {\n  case "lundi":\n    console.log("Bon début de semaine !");\n    break;\n  case "vendredi":\n    console.log("C\'est bientôt le week-end !");\n    break;\n  default:\n    console.log("Journée classique.");\n}',
    cas: [
      { valeurs: { jour: 'lundi' }, sortie: ['Bon début de semaine !'] },
      { valeurs: { jour: 'vendredi' }, sortie: ['C\'est bientôt le week-end !'] },
      { valeurs: { jour: 'mardi' }, sortie: ['Journée classique.'] }
    ]
  },

  // ------------------------------------------------ Les boucles (page4_2)
  {
    id: 7,
    titre: 'Tours de boucle (for)',
    partie: 'boucles',
    niveau: 1,
    consigne:
      '<p>Avec une boucle <code>for</code>, affichez <code>n</code> lignes de la forme <code>Tour numéro 0</code>, <code>Tour numéro 1</code>… jusqu\'à <code>Tour numéro n-1</code>.</p>',
    code: 'let n = 5;\n\n',
    indice: '<p>C\'est l\'exemple du cours, en remplaçant 5 par <code>n</code> : <code>for (let i = 0; i &lt; n; i++)</code>.</p>',
    solution: 'let n = 5;\n\nfor (let i = 0; i < n; i++) {\n  console.log("Tour numéro " + i);\n}',
    cas: [
      { valeurs: { n: 5 }, sortie: ['Tour numéro 0', 'Tour numéro 1', 'Tour numéro 2', 'Tour numéro 3', 'Tour numéro 4'] },
      { valeurs: { n: 2 }, sortie: ['Tour numéro 0', 'Tour numéro 1'] }
    ]
  },
  {
    id: 8,
    titre: 'Doubler jusqu\'à la limite (while)',
    partie: 'boucles',
    niveau: 2,
    consigne:
      '<p>En partant de <code>valeur = 1</code>, doublez <code>valeur</code> <strong>tant qu\'</strong>elle est strictement inférieure à <code>limite</code>, puis affichez la valeur finale. Pour une limite de 100, le programme affiche <code>128</code>.</p>',
    code: 'let limite = 100;\n\nlet valeur = 1;\n',
    indice: '<p><code>while (valeur &lt; limite) { valeur = valeur * 2; }</code>, puis <code>console.log(valeur)</code> <strong>après</strong> la boucle.</p>',
    solution: 'let limite = 100;\n\nlet valeur = 1;\nwhile (valeur < limite) {\n  valeur = valeur * 2;\n}\nconsole.log(valeur);',
    cas: [
      { valeurs: { limite: 100 }, sortie: ['128'] },
      { valeurs: { limite: 10 }, sortie: ['16'] },
      { valeurs: { limite: 1 }, sortie: ['1'] }
    ]
  },
  {
    id: 9,
    titre: 'Somme des nombres pairs',
    partie: 'boucles',
    niveau: 2,
    consigne:
      '<p>Calculez la somme des nombres pairs de 0 à <code>n</code> (inclus) et affichez <code>Somme : 30</code> pour n = 10 (2 + 4 + 6 + 8 + 10).</p>',
    code: 'let n = 10;\n\n',
    indice: '<p>Une variable <code>somme</code> à 0 avant la boucle. On peut parcourir tous les nombres et tester <code>i % 2 === 0</code>, ou avancer de 2 en 2 avec <code>i += 2</code>.</p>',
    solution: 'let n = 10;\n\nlet somme = 0;\nfor (let i = 0; i <= n; i += 2) {\n  somme += i;\n}\nconsole.log("Somme : " + somme);',
    cas: [
      { valeurs: { n: 10 }, sortie: ['Somme : 30'] },
      { valeurs: { n: 5 }, sortie: ['Somme : 6'] },
      { valeurs: { n: 1 }, sortie: ['Somme : 0'] }
    ]
  },

  // ----------------------------------------------- Exercice switch (page5)
  {
    id: 10,
    titre: 'Menu d\'orientation du BUT MMI',
    partie: 'switch',
    niveau: 2,
    consigne:
      '<p>La variable <code>saisie</code> contient ce que l\'utilisateur a tapé dans le <code>prompt()</code> : c\'est donc une <strong>chaîne</strong>. Convertissez-la avec <code>parseInt()</code>, puis, avec un <code>switch</code>, affichez le nom du parcours :</p>' +
      '<ul><li>1 : <code>Création Numérique</code></li><li>2 : <code>Développement Web et dispositifs interactifs</code></li>' +
      '<li>3 : <code>Stratégie de communication numérique et design d\'expérience</code></li>' +
      '<li>sinon : <code>Choix invalide : tapez 1, 2 ou 3.</code></li></ul>',
    code: 'let saisie = "2";\n\n',
    indice: '<p><code>let choix = parseInt(saisie);</code> puis <code>switch (choix)</code> avec <code>case 1:</code>, <code>case 2:</code>, <code>case 3:</code> (des nombres, sans guillemets), un <code>break</code> par <code>case</code> et un <code>default</code>.</p>',
    solution: 'let saisie = "2";\n\nlet choix = parseInt(saisie);\nswitch (choix) {\n  case 1:\n    console.log("Création Numérique");\n    break;\n  case 2:\n    console.log("Développement Web et dispositifs interactifs");\n    break;\n  case 3:\n    console.log("Stratégie de communication numérique et design d\'expérience");\n    break;\n  default:\n    console.log("Choix invalide : tapez 1, 2 ou 3.");\n}',
    cas: [
      { valeurs: { saisie: '1' }, sortie: [PARCOURS_MMI[0]] },
      { valeurs: { saisie: '2' }, sortie: [PARCOURS_MMI[1]] },
      { valeurs: { saisie: '3' }, sortie: [PARCOURS_MMI[2]] },
      { valeurs: { saisie: '-7' }, sortie: ['Choix invalide : tapez 1, 2 ou 3.'] },
      { valeurs: { saisie: 'abc' }, sortie: ['Choix invalide : tapez 1, 2 ou 3.'] }
    ]
  },
  {
    id: 11,
    titre: 'Nombre de jours d\'un mois',
    partie: 'switch',
    niveau: 3,
    consigne:
      '<p>Selon le numéro de <code>mois</code> (1 à 12), affichez <code>Le mois 2 compte 28 jours.</code> (on ignore les années bissextiles). Pour un numéro hors de 1 à 12, affichez <code>Mois invalide</code>.</p>' +
      '<p>Rappel : avril (4), juin (6), septembre (9) et novembre (11) ont 30 jours, février (2) en a 28, les autres 31.</p>',
    code: 'let mois = 2;\n\n',
    indice: '<p>Plusieurs <code>case</code> peuvent partager le même code si on les écrit à la suite sans <code>break</code> : <code>case 4: case 6: case 9: case 11: jours = 30; break;</code>. Rangez le nombre de jours dans une variable et affichez le message après le <code>switch</code>.</p>',
    solution: 'let mois = 2;\n\nlet jours;\nswitch (mois) {\n  case 2:\n    jours = 28;\n    break;\n  case 4:\n  case 6:\n  case 9:\n  case 11:\n    jours = 30;\n    break;\n  case 1:\n  case 3:\n  case 5:\n  case 7:\n  case 8:\n  case 10:\n  case 12:\n    jours = 31;\n    break;\n}\nif (jours === undefined) {\n  console.log("Mois invalide");\n} else {\n  console.log("Le mois " + mois + " compte " + jours + " jours.");\n}',
    cas: [
      { valeurs: { mois: 2 }, sortie: ['Le mois 2 compte 28 jours.'] },
      { valeurs: { mois: 6 }, sortie: ['Le mois 6 compte 30 jours.'] },
      { valeurs: { mois: 12 }, sortie: ['Le mois 12 compte 31 jours.'] },
      { valeurs: { mois: 13 }, sortie: ['Mois invalide'] }
    ]
  },

  // ---------------------------------------------- Les fonctions (page6)
  {
    id: 12,
    titre: 'La fonction carre',
    partie: 'fonctions',
    niveau: 1,
    consigne:
      '<p>Écrivez une fonction <code>carre(n)</code> qui <strong>renvoie</strong> (<code>return</code>) le carré de <code>n</code>.</p>',
    code: 'function carre(n) {\n  // à compléter\n}\n\nconsole.log(carre(4));\n',
    indice: '<p><code>return n * n;</code> : la fonction renvoie la valeur à l\'endroit où elle a été appelée.</p>',
    solution: 'function carre(n) {\n  return n * n;\n}\n\nconsole.log(carre(4));',
    cas: [
      { appel: 'carre(4)', attendu: 16 },
      { appel: 'carre(0)', attendu: 0 },
      { appel: 'carre(-3)', attendu: 9 }
    ]
  },
  {
    id: 13,
    titre: 'Un message personnalisé',
    partie: 'fonctions',
    niveau: 1,
    consigne:
      '<p>Écrivez une fonction <code>bienvenue(prenom)</code> qui renvoie le texte <code>Bienvenue Léa !</code> pour l\'argument <code>"Léa"</code>.</p>',
    code: 'function bienvenue(prenom) {\n  // à compléter\n}\n\nconsole.log(bienvenue("Léa"));\n',
    indice: '<p>L\'argument <code>prenom</code> s\'utilise comme une variable : <code>return "Bienvenue " + prenom + " !";</code></p>',
    solution: 'function bienvenue(prenom) {\n  return "Bienvenue " + prenom + " !";\n}\n\nconsole.log(bienvenue("Léa"));',
    cas: [
      { appel: 'bienvenue("Léa")', attendu: 'Bienvenue Léa !' },
      { appel: 'bienvenue("MMI")', attendu: 'Bienvenue MMI !' }
    ]
  },
  {
    id: 14,
    titre: 'Arguments multiples : l\'aire d\'un rectangle',
    partie: 'fonctions',
    niveau: 1,
    consigne:
      '<p>Écrivez une fonction <code>aire(largeur, hauteur)</code> qui renvoie l\'aire du rectangle.</p>',
    code: 'function aire(largeur, hauteur) {\n  // à compléter\n}\n\nconsole.log(aire(4, 3));\n',
    indice: '<p>Les deux arguments sont reçus dans l\'ordre de l\'appel : <code>aire(4, 3)</code> donne <code>largeur = 4</code> et <code>hauteur = 3</code>.</p>',
    solution: 'function aire(largeur, hauteur) {\n  return largeur * hauteur;\n}\n\nconsole.log(aire(4, 3));',
    cas: [
      { appel: 'aire(4, 3)', attendu: 12 },
      { appel: 'aire(10, 0)', attendu: 0 },
      { appel: 'aire(2.5, 2)', attendu: 5 }
    ]
  },

  // --------------------------------------------- Interaction DOM (page7)
  {
    id: 15,
    titre: 'Agrandir l\'image de 10 %',
    partie: 'dom',
    niveau: 2,
    consigne:
      '<p>Pour l\'exercice du redimensionnement d\'image, on commence par la logique, sans le DOM. Écrivez une fonction <code>agrandir(taille)</code> qui renvoie la taille augmentée de <strong>10 %</strong>, arrondie à l\'entier (<code>Math.round</code>), sans jamais dépasser <strong>1200</strong>.</p>',
    code: 'function agrandir(taille) {\n  // à compléter\n}\n\nconsole.log(agrandir(400)); // 440\n',
    indice: '<p>Nouvelle taille : <code>Math.round(taille * 1.1)</code>. Si elle dépasse 1200, on renvoie 1200 (un <code>if</code>, ou <code>Math.min(…, 1200)</code>).</p>',
    solution: 'function agrandir(taille) {\n  let nouvelle = Math.round(taille * 1.1);\n  if (nouvelle > 1200) {\n    nouvelle = 1200;\n  }\n  return nouvelle;\n}\n\nconsole.log(agrandir(400)); // 440',
    cas: [
      { appel: 'agrandir(400)', attendu: 440 },
      { appel: 'agrandir(100)', attendu: 110 },
      { appel: 'agrandir(1150)', attendu: 1200 },
      { appel: 'agrandir(1200)', attendu: 1200 }
    ]
  },
  {
    id: 16,
    titre: 'Réduire l\'image de 10 %',
    partie: 'dom',
    niveau: 2,
    consigne:
      '<p>Écrivez une fonction <code>reduire(taille)</code> qui renvoie la taille diminuée de <strong>10 %</strong>, arrondie à l\'entier, sans jamais descendre sous <strong>50</strong>.</p>',
    code: 'function reduire(taille) {\n  // à compléter\n}\n\nconsole.log(reduire(400)); // 360\n',
    indice: '<p>Diminuer de 10 %, c\'est multiplier par 0.9. Si le résultat est inférieur à 50, on renvoie 50.</p>',
    solution: 'function reduire(taille) {\n  let nouvelle = Math.round(taille * 0.9);\n  if (nouvelle < 50) {\n    nouvelle = 50;\n  }\n  return nouvelle;\n}\n\nconsole.log(reduire(400)); // 360',
    cas: [
      { appel: 'reduire(400)', attendu: 360 },
      { appel: 'reduire(1000)', attendu: 900 },
      { appel: 'reduire(52)', attendu: 50 },
      { appel: 'reduire(50)', attendu: 50 }
    ]
  },
  {
    id: 17,
    titre: 'Afficher le pourcentage (bonus)',
    partie: 'dom',
    niveau: 3,
    consigne:
      '<p>Pour le bonus, on affiche l\'agrandissement par rapport à la taille d\'origine (400 px). Écrivez une fonction <code>pourcentage(taille)</code> qui renvoie le texte <code>110 %</code> pour une taille de 440 (arrondi à l\'entier).</p>',
    code: 'function pourcentage(taille) {\n  // à compléter\n}\n\nconsole.log(pourcentage(440)); // 110 %\n',
    indice: '<p>Le pourcentage vaut <code>taille / 400 * 100</code>. Arrondissez-le avec <code>Math.round</code>, puis concaténez <code>" %"</code> (avec l\'espace).</p>',
    solution: 'function pourcentage(taille) {\n  return Math.round(taille / 400 * 100) + " %";\n}\n\nconsole.log(pourcentage(440)); // 110 %',
    cas: [
      { appel: 'pourcentage(440)', attendu: '110 %' },
      { appel: 'pourcentage(400)', attendu: '100 %' },
      { appel: 'pourcentage(50)', attendu: '13 %' }
    ]
  }
];
