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
