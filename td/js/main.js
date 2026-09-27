// Mise en surbrillance du lien de navigation courant (même principe que
// dans la partie Algorithmique). Chaque page pose data-page="..." sur <body>.
(function () {
  var current = document.body.getAttribute('data-page');
  if (!current) return;
  document.querySelectorAll('.site-nav a[data-nav]').forEach(function (link) {
    if (link.getAttribute('data-nav') === current) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();

// Boutons « Un indice » / « Voir une solution » des exercices de validation
// (même comportement que dans la partie Algorithmique).
document.addEventListener('click', function (evt) {
  var bouton = evt.target.closest('[data-affiche]');
  if (!bouton) return;
  var cible = document.getElementById(bouton.getAttribute('data-affiche'));
  if (!cible) return;
  if (!bouton.hasAttribute('data-texte')) bouton.setAttribute('data-texte', bouton.textContent);
  cible.hidden = !cible.hidden;
  bouton.textContent = cible.hidden ? bouton.getAttribute('data-texte') : 'Masquer';
  bouton.setAttribute('aria-expanded', String(!cible.hidden));
});
