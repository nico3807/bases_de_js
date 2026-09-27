// Certificat PDF des exercices d'algorithmique (jsPDF).
// Même principe et même mise en page que le certificat du dépôt CCJS
// (« Exercices JavaScript ») :
//   - page 1 : logos de part et d'autre du titre, identité de l'étudiant·e,
//     statistiques et avancement par chapitre ;
//   - ensuite : l'historique complet des vérifications.
// Tant que les 18 exercices ne sont pas tous réussis, le document s'intitule
// « Attestation de parcours » et porte la mention « NON TERMINÉ ».

var Certificat = (function () {
  // Les polices standard du PDF ne connaissent que le latin-1 : on retire
  // les autres caractères (émojis, symboles…).
  function nettoyer(s) {
    return String(s).replace(/[^\x20-\x7EÀ-ÿŒœ€«»'’‘…–—°]/g, '').replace(/\s+/g, ' ').trim();
  }

  function slug(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'etudiant';
  }

  /*
   * opts = {
   *   prenom, nom,
   *   stats: { date, duree, termine, exosReussis, exosTotal, chapitresValides,
   *            chapitresTotal, verifsReussies, verifsTotal, solutionsVues },
   *   chapitres: [{ libelle, reussis, total }],
   *   historique: [{ date, exercice, chapitre, ok, cas, solutionVue }]
   * }
   */
  function generer(opts) {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ unit: 'mm', format: 'a4' });
    var W = 210, H = 297, MARGE = 14;
    var termine = !!opts.stats.termine;
    var titreAppli = 'Algorithmique - Les bases';
    var prenom = nettoyer(opts.prenom);
    var nom = nettoyer(opts.nom).toUpperCase();

    /* ---------- Filigrane « NON TERMINÉ » ---------- */
    if (!termine) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(52);
      try {
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.13 }));
        doc.setTextColor(200, 40, 40);
        doc.text('NON TERMINÉ', W / 2, H / 2 + 30, { angle: 45, align: 'center' });
        doc.restoreGraphicsState();
      } catch (e) {
        doc.setTextColor(246, 214, 214);
        doc.text('NON TERMINÉ', W / 2, H / 2 + 30, { angle: 45, align: 'center' });
      }
    }

    /* ---------- Cadre ---------- */
    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(1.2);
    doc.roundedRect(7, 7, W - 14, H - 14, 4, 4);
    if (termine) doc.setDrawColor(22, 163, 74);
    else doc.setDrawColor(255, 160, 100);
    doc.setLineWidth(0.4);
    doc.roundedRect(9.5, 9.5, W - 19, H - 19, 3, 3);

    /* ---------- Logos de part et d'autre du titre ---------- */
    var haut = 16, hLogo = 20;
    var logos = window.CERTIFICAT_LOGOS || {};
    [['gauche', MARGE], ['droite', null]].forEach(function (c) {
      var logo = logos[c[0]];
      if (!logo) return;
      var w = Math.min(hLogo * logo.ratio, 38), h = w / logo.ratio;
      var x = c[1] === null ? W - MARGE - w : c[1];
      try { doc.addImage(logo.data, logo.format, x, haut + (hLogo - h) / 2, w, h); } catch (e) { /* logo ignoré */ }
    });

    /* ---------- Titre ---------- */
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 60);
    doc.setFontSize(17);
    doc.text(termine ? 'CERTIFICAT DE RÉUSSITE' : 'ATTESTATION DE PARCOURS', W / 2, haut + 9, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(30, 58, 95);
    doc.text(titreAppli, W / 2, haut + 16, { align: 'center' });
    doc.setDrawColor(180, 180, 200);
    doc.setLineWidth(0.3);
    doc.line(MARGE + 6, 42, W - MARGE - 6, 42);

    /* ---------- Corps ---------- */
    var y = 50;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 80);
    doc.setFontSize(11);
    doc.text('Le département MMI certifie que', W / 2, y, { align: 'center' });
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 40);
    doc.text(prenom + ' ' + nom, W / 2, y, { align: 'center' });
    y += 9;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 80);
    var s = opts.stats;
    var intro = doc.splitTextToSize(
      termine
        ? 'a terminé avec succès les exercices « ' + titreAppli + ' » (BUT MMI 1, R1.12) : les ' + s.exosTotal +
          ' exercices des ' + s.chapitresTotal + ' chapitres ont été réussis, chacun vérifié automatiquement ' +
          'sur plusieurs cas de test.'
        : 'a suivi les exercices « ' + titreAppli + ' » (BUT MMI 1, R1.12) et a réussi ' + s.exosReussis +
          ' exercice' + (s.exosReussis > 1 ? 's' : '') + ' sur ' + s.exosTotal + ' à la date d\'édition de ce ' +
          'document. Le parcours pourra être repris et complété lors d\'une prochaine séance.',
      W - 2 * MARGE - 20);
    doc.text(intro, W / 2, y, { align: 'center' });
    y += intro.length * 5 + 7;

    /* ---------- Statistiques ---------- */
    var lignes = [
      ['Statut', termine ? 'Terminé' : 'NON TERMINÉ'],
      ['Date d\'édition', s.date],
      ['Temps passé', s.duree],
      ['Exercices réussis', s.exosReussis + ' / ' + s.exosTotal],
      ['Chapitres validés', s.chapitresValides + ' / ' + s.chapitresTotal],
      ['Vérifications réussies', s.verifsReussies + ' / ' + s.verifsTotal],
      ['Solutions consultées', String(s.solutionsVues)]
    ];
    doc.setFontSize(10.5);
    lignes.forEach(function (l) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 110);
      doc.text(l[0] + ' :', W / 2 - 4, y, { align: 'right' });
      doc.setFont('helvetica', l[0] === 'Statut' ? 'bold' : 'normal');
      if (l[0] === 'Statut') {
        if (termine) doc.setTextColor(30, 140, 60);
        else doc.setTextColor(200, 40, 40);
      } else doc.setTextColor(40, 40, 60);
      doc.text(nettoyer(l[1]), W / 2 + 2, y);
      y += 6.5;
    });

    /* ---------- Avancement par chapitre ---------- */
    y += 4;
    doc.setDrawColor(180, 180, 200);
    doc.line(MARGE + 6, y, W - MARGE - 6, y);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 60);
    doc.text('État d\'avancement par chapitre', MARGE, y);
    y += 6;
    var barX = MARGE + 66, barW = 60, barH = 3.2;
    doc.setFontSize(9.5);
    opts.chapitres.forEach(function (c) {
      var fini = c.reussis >= c.total;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 60);
      doc.text(nettoyer(c.libelle), MARGE + 2, y);
      doc.setDrawColor(200, 205, 220);
      doc.setFillColor(235, 238, 245);
      doc.roundedRect(barX, y - 2.6, barW, barH, 1.2, 1.2, 'FD');
      var remplissage = Math.max(0, Math.min(1, c.reussis / c.total)) * barW;
      if (remplissage > 0) {
        if (fini) doc.setFillColor(22, 163, 74);
        else doc.setFillColor(30, 58, 95);
        doc.roundedRect(barX, y - 2.6, Math.max(remplissage, 2.4), barH, 1.2, 1.2, 'F');
      }
      doc.setFont('helvetica', fini ? 'bold' : 'normal');
      if (fini) doc.setTextColor(22, 130, 60);
      else doc.setTextColor(80, 80, 110);
      doc.text(c.reussis + '/' + c.total + (fini ? ' — validé' : ''), barX + barW + 4, y);
      y += 6.2;
    });

    /* ---------- Historique ---------- */
    y += 4;
    doc.setDrawColor(180, 180, 200);
    doc.line(MARGE + 6, y, W - MARGE - 6, y);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 60);
    doc.text('Historique des vérifications de l\'étudiant', MARGE, y);
    y += 6;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    var hLigne = 3.8, bas = H - 16, largeurNum = 11;
    if (!opts.historique.length) {
      doc.setTextColor(120, 120, 140);
      doc.text('(aucune vérification pour le moment)', MARGE + largeurNum, y);
    }
    opts.historique.forEach(function (h, i) {
      var texte = '[' + h.date + '] ' + h.exercice + ' (' + h.chapitre + ') : ' +
        (h.ok ? 'réussi' : 'raté') + ' - ' + h.cas + ' cas' + (h.solutionVue ? ' - solution consultée' : '');
      var coupe = doc.splitTextToSize(nettoyer(texte), W - 2 * MARGE - largeurNum);
      if (y + coupe.length * hLigne > bas) {
        doc.addPage();
        y = 18;
        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
      }
      doc.setTextColor(150, 150, 170);
      doc.text(String(i + 1).padStart(3) + '.', MARGE, y);
      if (h.ok) doc.setTextColor(30, 120, 60);
      else doc.setTextColor(170, 60, 60);
      doc.text(coupe, MARGE + largeurNum, y);
      y += coupe.length * hLigne;
    });

    /* ---------- Pieds de page ---------- */
    var pages = doc.getNumberOfPages();
    for (var p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 160);
      doc.text(titreAppli + ' — document généré automatiquement par la page d\'exercices' +
        (termine ? '' : ' (parcours en cours)'), MARGE, H - 9);
      doc.text('page ' + p + ' / ' + pages, W - MARGE, H - 9, { align: 'right' });
    }

    doc.save('certificat_algorithmique_' + slug(opts.nom) + '_' + slug(opts.prenom) +
      (termine ? '' : '_non_termine') + '.pdf');
    return { pages: pages };
  }

  return { generer: generer };
})();
