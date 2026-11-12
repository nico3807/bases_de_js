// Certificat PDF des exercices (jsPDF), pour l'algorithmique comme pour le
// TD JavaScript : les textes propres à chaque parcours viennent de opts.appli.
// Même principe et même mise en page que le certificat du dépôt CCJS
// (« Exercices JavaScript ») :
//   - page 1 : logos de part et d'autre du titre, identité de l'étudiant·e,
//     statistiques et avancement par chapitre ;
//   - indices de démarche : part des exercices écrits au clavier (seuil de
//     80 %), validation en séance, puis détail par exercice ;
//   - ensuite : l'historique complet des vérifications.
// Le PDF est verrouillé : impression seule, aucune modification possible.
// Tant que tous les exercices ne sont pas réussis, le document s'intitule
// « Attestation de parcours » et porte la mention « NON TERMINÉ ».

var Certificat = (function () {
  // Les polices standard du PDF ne connaissent que le latin-1 : on retire
  // les autres caractères (émojis, symboles…).
  function nettoyer(s) {
    return String(s).replace(/[^\x20-\x7EÀ-ÿŒœ€«»'’‘…–—°]/g, '').replace(/\s+/g, ' ').trim();
  }

  function motDePasseAleatoire() {
    var octets = new Uint8Array(24);
    (window.crypto || window.msCrypto).getRandomValues(octets);
    return Array.prototype.map.call(octets, function (o) { return ('0' + o.toString(16)).slice(-2); }).join('');
  }

  function slug(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'etudiant';
  }

  /*
   * opts = {
   *   prenom, nom,
   *   appli: { titre, fichier, motsGroupe: ['chapitre', 'chapitres', 'validés'] },
   *   stats: { date, duree, termine, exosReussis, exosTotal, chapitresValides,
   *            chapitresTotal, verifsReussies, verifsTotal },
   *   chapitres: [{ libelle, reussis, total }],
   *   historique: [{ date, exercice, chapitre, ok, cas }],
   *   indices: { mesures, nonMesures, auClavier, part, seuil, seuilAtteint, partColleeMax },
   *   seance: null | { date, code, reussies, total, terminee },
   *   exercices: [{ id, titre, fait, mesure: null | { clavier, partCollee, duree,
   *                 rapide, essais, sorties }, seance: null | { ok, sortie, temps } }]
   * }
   */
  function generer(opts) {
    var jsPDF = window.jspdf.jsPDF;
    // Document verrouillé : il s'ouvre sans mot de passe, mais seule
    // l'impression est autorisée (ni modification, ni ajout de texte ou
    // d'annotation, ni remplissage de formulaire, ni copie). Le mot de passe
    // « propriétaire » qui lèverait ces restrictions est tiré au hasard et
    // n'est conservé nulle part : personne ne le connaît.
    var doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      encryption: {
        userPassword: '',
        ownerPassword: motDePasseAleatoire(),
        userPermissions: ['print']
      }
    });
    var W = 210, H = 297, MARGE = 14;
    var termine = !!opts.stats.termine;
    var appli = opts.appli || {};
    var titreAppli = nettoyer(appli.titre || 'Algorithmique - Les bases');
    var mots = appli.motsGroupe || ['chapitre', 'chapitres', 'validés'];
    var Mot = function (m) { return m.charAt(0).toUpperCase() + m.slice(1); };
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
          ' exercices des ' + s.chapitresTotal + ' ' + mots[1] + ' ont été réussis, chacun vérifié automatiquement ' +
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
      [Mot(mots[1]) + ' ' + (mots[2] || 'validés'), s.chapitresValides + ' / ' + s.chapitresTotal],
      ['Vérifications réussies', s.verifsReussies + ' / ' + s.verifsTotal]
    ];
    var ind = opts.indices, sea = opts.seance;
    if (ind) {
      lignes.push(['Écrits au clavier', ind.mesures
        ? ind.auClavier + ' / ' + ind.mesures + ' (' + Math.round(ind.part * 100) + ' %) — seuil de ' +
          Math.round(ind.seuil * 100) + ' % ' + (ind.seuilAtteint ? 'atteint' : 'NON ATTEINT')
        : 'non mesuré']);
      lignes.push(['Explications en séance', sea
        ? sea.reussies + ' / ' + sea.total + (sea.terminee ? '' : ' (interrompue)')
        : 'non réalisée']);
      if (sea) lignes.push(['Code de séance', '« ' + sea.code + ' », le ' + sea.date]);
    }
    doc.setFontSize(10.5);
    lignes.forEach(function (l) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 110);
      doc.text(l[0] + ' :', W / 2 - 4, y, { align: 'right' });
      doc.setFont('helvetica', l[0] === 'Statut' ? 'bold' : 'normal');
      if (l[0] === 'Statut') {
        if (termine) doc.setTextColor(30, 140, 60);
        else doc.setTextColor(200, 40, 40);
      } else if (l[0] === 'Écrits au clavier' && ind && ind.mesures) {
        doc.setFont('helvetica', 'bold');
        if (ind.seuilAtteint) doc.setTextColor(30, 140, 60);
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
    doc.text('État d\'avancement par ' + mots[0], MARGE, y);
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
      doc.text(c.reussis + '/' + c.total + (fini ? ' — ' + (mots[2] || 'validés').replace(/s$/, '') : ''), barX + barW + 4, y);
      y += 6.2;
    });

    var bas = H - 22;
    function nouvellePageSi(hauteur) {
      if (y + hauteur > bas) {
        doc.addPage();
        y = 18;
      }
    }

    /* ---------- Indices de démarche par exercice ---------- */
    if (opts.exercices) {
      y += 4;
      nouvellePageSi(30);
      doc.setDrawColor(180, 180, 200);
      doc.line(MARGE + 6, y, W - MARGE - 6, y);
      y += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 60);
      doc.text('Indices de démarche par exercice', MARGE, y);
      y += 6;
      var col = { num: MARGE, titre: MARGE + 9, saisie: MARGE + 82, temps: MARGE + 112, essais: MARGE + 133,
        sorties: MARGE + 147, seance: MARGE + 162 };
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(90, 90, 120);
      [['num', 'N°'], ['titre', 'Exercice'], ['saisie', 'Saisie'], ['temps', 'Temps'], ['essais', 'Essais'],
        ['sorties', 'Sorties'], ['seance', 'Séance']].forEach(function (c) { doc.text(c[1], col[c[0]], y); });
      y += 4;
      doc.setFont('courier', 'normal');
      opts.exercices.forEach(function (e) {
        nouvellePageSi(4);
        var m = e.mesure;
        var titre = nettoyer(e.titre);
        if (titre.length > 34) titre = titre.slice(0, 33) + '…';
        doc.setTextColor(60, 60, 80);
        doc.text(String(e.id), col.num, y);
        doc.text(titre, col.titre, y);
        if (!e.fait) {
          doc.setTextColor(150, 150, 170);
          doc.text('non réussi', col.saisie, y);
        } else if (!m) {
          doc.setTextColor(150, 150, 170);
          doc.text('non mesuré', col.saisie, y);
        } else {
          if (m.clavier) doc.setTextColor(30, 120, 60);
          else doc.setTextColor(190, 50, 50);
          doc.text(m.clavier ? 'clavier' : 'collé ' + Math.round(m.partCollee * 100) + ' %', col.saisie, y);
          var sec = m.duree === null ? null : Math.round(m.duree / 1000);
          if (m.rapide) doc.setTextColor(200, 110, 20);
          else doc.setTextColor(60, 60, 80);
          doc.text(sec === null ? '?' : Math.floor(sec / 60) + ' min ' + String(sec % 60).padStart(2, '0') + (m.rapide ? ' !' : ''), col.temps, y);
          doc.setTextColor(60, 60, 80);
          doc.text(String(m.essais), col.essais, y);
          if (m.sorties) doc.setTextColor(200, 110, 20);
          doc.text(String(m.sorties), col.sorties, y);
        }
        var sc = e.seance;
        if (!sc) { doc.setTextColor(150, 150, 170); doc.text('—', col.seance, y); }
        else if (sc.ok) { doc.setTextColor(30, 120, 60); doc.text('validée', col.seance, y); }
        else { doc.setTextColor(190, 50, 50); doc.text(sc.sortie ? 'sortie' : 'échouée', col.seance, y); }
        y += 3.8;
      });
      y += 2;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(110, 110, 130);
      var legende = doc.splitTextToSize(nettoyer(
        'Saisie : « clavier » si moins de ' + Math.round((ind ? ind.partColleeMax : 0.2) * 100) + ' % du code ajouté a été ' +
        'collé depuis l\'extérieur de la page (un copier-coller interne à la page ne compte pas) ; « non mesuré » ' +
        'pour un exercice réussi avant la mise en place de la mesure. Temps : de la première frappe à la réussite ; ' +
        '« ! » si très rapide pour le niveau de l\'exercice. Sorties : changements d\'onglet ou de fenêtre pendant ' +
        'l\'exercice. Séance : question chronométrée en présentiel. Ce sont des indices de démarche, pas une preuve.'),
        W - 2 * MARGE);
      nouvellePageSi(legende.length * 3.4);
      doc.text(legende, MARGE, y);
      y += legende.length * 3.4;
    }

    /* ---------- Historique ---------- */
    y += 4;
    nouvellePageSi(20);
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
    var hLigne = 3.8, largeurNum = 11;
    if (!opts.historique.length) {
      doc.setTextColor(120, 120, 140);
      doc.text('(aucune vérification pour le moment)', MARGE + largeurNum, y);
    }
    opts.historique.forEach(function (h, i) {
      var texte = '[' + h.date + '] ' + h.exercice + ' (' + h.chapitre + ') : ' +
        (h.ok ? 'réussi' : 'raté') + ' - ' + h.cas + ' cas';
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
    // Deux lignes au-dessus du cadre intérieur (tracé à H - 9,5) : écrites
    // plus bas, elles reposaient sur le trait.
    var pages = doc.getNumberOfPages();
    for (var p = 1; p <= pages; p++) {
      doc.setPage(p);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 160);
      doc.text(titreAppli + ' — document généré automatiquement par la page d\'exercices' +
        (termine ? '' : ' (parcours en cours)'), MARGE, H - 13);
      doc.text('page ' + p + ' / ' + pages, W - MARGE, H - 13, { align: 'right' });
      doc.text('Document protégé : modification interdite', W / 2, H - 17, { align: 'center' });
    }

    doc.save('certificat_' + (appli.fichier || 'algorithmique') + '_' + slug(opts.nom) + '_' + slug(opts.prenom) +
      (termine ? '' : '_non_termine') + '.pdf');
    return { pages: pages };
  }

  return { generer: generer };
})();
