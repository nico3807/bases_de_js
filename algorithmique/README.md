# Algorithmique - Les bases (BUT MMI 1)

Pages de découverte de l'algorithmique pour les étudiant·es de première
année, dans la même charte que le TP R3.14 Travail collaboratif. Chaque
notion est présentée en pseudo-code puis en JavaScript, avec une exécution
pas à pas, des quiz et des zones de code exécutables.

Aucun serveur n'est nécessaire : un double-clic sur `index.html` suffit
(Live Server fonctionne aussi).

## Structure

```
algorithmique/
├── index.html         Accueil, parcours, objectifs
├── algorithme.html    1. Penser comme un algorithme (entrées/sorties, pseudo-code)
├── variables.html     2. Variables et types
├── conditions.html    3. Conditions, opérateurs logiques
├── boucles.html       4. Boucles for / while
├── tableaux.html      5. Tableaux et algorithmes classiques
├── fonctions.html     6. Fonctions, paramètres, return
├── exercices.html     18 exercices vérifiés automatiquement
├── memo.html          Aide-mémoire pseudo-code ↔ JavaScript
├── css/style.css      Feuille de style partagée
└── js/
    ├── main.js            Menu actif, quiz, remise en ordre, table de vérité
    ├── trace.js           Exécution pas à pas (ligne courante, variables, console)
    ├── bac-a-sable.js     Zones de code exécutables (Web Worker, arrêt des boucles infinies)
    ├── exercices-data.js  Contenu des exercices (consignes, cas de test, solutions)
    ├── exercices.js       Rendu des exercices, vérification, progression
    └── pages/             Déroulé des exécutions pas à pas de chaque chapitre
```

Pour modifier ou ajouter un exercice, il suffit d'éditer
`js/exercices-data.js` (le format est décrit en tête du fichier).
