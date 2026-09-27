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
    ├── exercices.js       Rendu des exercices, vérification, session étudiant
    ├── certificat.js      Certificat PDF (même principe que le dépôt CCJS)
    ├── certificat-logos.js Logos UM et MMI du certificat, en base64
    ├── vendor/            jsPDF (licence MIT)
    └── pages/             Déroulé des exécutions pas à pas de chaque chapitre
```

Pour modifier ou ajouter un exercice, il suffit d'éditer
`js/exercices-data.js` (le format est décrit en tête du fichier).

## Validation par certificat PDF

Comme dans le dépôt CCJS (« Exercices JavaScript »), la page d'exercices
demande le prénom et le nom de l'étudiant·e au démarrage. La progression, le
code tapé, l'historique des vérifications et le temps passé sont enregistrés
à son nom sur le poste (`localStorage`, clés `algo-mmi:…`). Le bouton
« 📜 Certificat PDF » produit une attestation (mention « NON TERMINÉ ») ou,
une fois les 18 exercices réussis, un certificat de réussite. Un exercice ne
compte comme réussi que s'il passe la vérification automatique ; les solutions
consultées sont indiquées dans le PDF.
