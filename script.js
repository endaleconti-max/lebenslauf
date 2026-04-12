/* ============================================================
   NEON 80s SYNTHWAVE PORTFOLIO – script.js
   ============================================================ */

/* ── Retro grid canvas ────────────────────────────────────── */
(function initGrid() {
  const canvas = document.getElementById('grid-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, animId;

  // Perspective grid config
  const HORIZON_Y   = 0.52;   // fraction of height for horizon
  const V_LINES     = 18;     // number of vertical lines
  const H_LINES     = 14;     // number of horizontal bands
  const SPEED       = 0.004;  // scroll speed (0–1 per frame)
  const COLOR_GRID  = 'rgba(41, 121, 255, 0.24)';

  let offset = 0; // animated scroll offset 0..1

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function drawGrid() {
    ctx.clearRect(0, 0, W, H);

    const horizonY = H * HORIZON_Y;
    const floorH   = H - horizonY;
    const vp       = { x: W / 2, y: horizonY }; // vanishing point

    /* ── Sky gradient ──────────────────────────────────────── */
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0,   'rgba(15, 25, 35, 0)');
    skyGrad.addColorStop(1,   'rgba(10, 35, 80, 0.18)');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, horizonY);

    /* ── Floor gradient ────────────────────────────────────── */
    const floorGrad = ctx.createLinearGradient(0, horizonY, 0, H);
    floorGrad.addColorStop(0, 'rgba(41, 121, 255, 0.08)');
    floorGrad.addColorStop(1, 'rgba(142, 197, 255, 0.04)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizonY, W, floorH);

    /* ── Glow at horizon ───────────────────────────────────── */
    const glowGrad = ctx.createLinearGradient(0, horizonY - 60, 0, horizonY + 60);
    glowGrad.addColorStop(0,   'transparent');
    glowGrad.addColorStop(0.5, 'rgba(142, 197, 255, 0.10)');
    glowGrad.addColorStop(1,   'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, horizonY - 60, W, 120);

    ctx.save();
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth   = 1;

    /* ── Vertical (converging) lines ───────────────────────── */
    for (let i = 0; i <= V_LINES; i++) {
      const t  = i / V_LINES;                       // 0..1 across floor bottom
      const bx = W * t;                              // bottom x
      ctx.beginPath();
      ctx.moveTo(vp.x, vp.y);
      ctx.lineTo(bx, H);
      ctx.stroke();
    }

    /* ── Horizontal (receding) lines ───────────────────────── */
    for (let j = 0; j < H_LINES; j++) {
      // Use perspective mapping so lines bunch toward horizon
      const rawT   = (j + offset) / H_LINES;        // 0..1 scrolling
      const persT  = 1 - Math.pow(1 - rawT, 2.6);  // ease toward horizon
      const y      = horizonY + floorH * (1 - persT);

      if (y < horizonY || y > H + 2) continue;

      // Interpolate x-extents so line clips to horizon-width at top
      const scaleX = (y - horizonY) / floorH;       // 0 at horizon, 1 at bottom
      const x0     = vp.x - (W / 2) * scaleX;
      const x1     = vp.x + (W / 2) * scaleX;

      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
    }

    ctx.restore();

    /* ── Sun / orb ─────────────────────────────────────────── */
    const sunR  = Math.min(W, H) * 0.09;
    const sunY  = horizonY;
    const sunGrad = ctx.createRadialGradient(vp.x, sunY, 0, vp.x, sunY, sunR * 2.4);
    sunGrad.addColorStop(0,    'rgba(245, 249, 255, 0.82)');
    sunGrad.addColorStop(0.18, 'rgba(142, 197, 255, 0.55)');
    sunGrad.addColorStop(0.45, 'rgba(41, 121, 255, 0.22)');
    sunGrad.addColorStop(1,    'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(vp.x, sunY, sunR * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Solid upper half-circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(vp.x, sunY, sunR, Math.PI, 0);
    ctx.closePath();
    const halfGrad = ctx.createLinearGradient(vp.x - sunR, sunY - sunR, vp.x + sunR, sunY);
    halfGrad.addColorStop(0, '#f5f9ff');
    halfGrad.addColorStop(1, '#2979ff');
    ctx.fillStyle = halfGrad;
    ctx.shadowBlur  = 40;
    ctx.shadowColor = '#2979ff';
    ctx.fill();

    // Horizontal stripes over lower half
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.arc(vp.x, sunY, sunR, 0, Math.PI);
    ctx.closePath();
    ctx.clip();
    const stripes = 6;
    for (let s = 0; s < stripes; s++) {
      const sy = sunY + (s / stripes) * sunR;
      ctx.fillStyle = 'rgba(15,25,35,0.65)';
      ctx.fillRect(vp.x - sunR, sy, sunR * 2, sunR / (stripes * 1.5));
    }
    ctx.restore();
  }

  function loop() {
    offset = (offset + SPEED) % 1;
    drawGrid();
    animId = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    resize();
    loop();
  });

  resize();
  loop();
})();


/* ── Sticky nav scroll tint ───────────────────────────────── */
(function initNav() {
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    highlightNav();
  }, { passive: true });

  /* ── Logo toggle ─────────────────────────────────────────── */
  const toggle = document.querySelector('.nav-logo');
  const links  = document.querySelector('.nav-links');

  function setMenuOpen(isOpen) {
    links.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  }

  toggle.setAttribute('aria-expanded', 'false');

  toggle.addEventListener('click', () => {
    setMenuOpen(!links.classList.contains('open'));
  });

  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setMenuOpen(!links.classList.contains('open'));
    }
    if (e.key === 'Escape') setMenuOpen(false);
  });

  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => setMenuOpen(false));
  });

  // Close when clicking outside the nav area
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) setMenuOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenuOpen(false);
  });

  /* ── Active section highlight ───────────────────────────── */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navAs    = document.querySelectorAll('.nav-links a');

  function highlightNav() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navAs.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  highlightNav();
})();


/* ── Intersection Observer – scroll reveal ────────────────── */
(function initReveal() {
  // Generic section reveals
  const revealEls = document.querySelectorAll(
    '.section-title, .about-card, .skill-badge, .lang-card, .contact-card'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Stagger children of the same parent
        const siblings = Array.from(
          entry.target.parentElement.querySelectorAll('.reveal')
        );
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 80);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObs.observe(el));

  /* ── Timeline items ─────────────────────────────────────── */
  const timelineItems = document.querySelectorAll('.timeline-item');

  const tlObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        tlObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  timelineItems.forEach((item, i) => {
    item.style.transitionDelay = (i * 60) + 'ms';
    tlObs.observe(item);
  });

  /* ── Language bars ──────────────────────────────────────── */
  const langFills = document.querySelectorAll('.lang-fill');

  const langObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        langObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  langFills.forEach(fill => langObs.observe(fill));
})();


/* ── Language translation ─────────────────────────────────── */
(function initI18n() {
  const STORAGE_KEY = 'portfolioLang';
  const select = document.getElementById('lang-select');

  const translations = {
    en: {
      pageTitle: 'Endale Conti – Portfolio',
      navAbout: 'About',
      navExperience: 'Experience',
      navSkills: 'Skills',
      navLanguages: 'Languages',
      navContact: 'Contact',
      heroGreeting: "Hello, I'm",
      heroSubtitle: 'Customer Success • Sales • Performance Marketing',
      heroCta: 'Get in Touch',
      titleAbout: 'About Me',
      aboutText: 'Internationally experienced Customer Success & Sales Manager with a strong focus on digital advertising, process optimization, and team leadership. I work data-driven, structured, and solution-oriented.',
      titleExperience: 'Experience',
      expRole1: 'Customer Success Manager',
      expDesc1: 'Communication with lawyers and law firms, documentation and case management, process optimization.',
      expRole2: 'Sales Manager & Brand Manager',
      expDesc2: 'Generated over 5M USD for clients, managed B2B advertising, built a recruiting team of 7, data analysis.',
      expRole3: 'Recruiter',
      expDesc3: 'Active sourcing, interviews, relocation support, CRM systems.',
      expRole4: 'Team Leader',
      expDesc4: 'Led Amazon team from 2 to 9 employees, maintained 90%+ customer satisfaction, scheduling, interviews.',
      expRole5: 'Sales Manager & Brand Manager',
      expDesc5: 'Created and managed Google, Facebook, Instagram, and TikTok ads; graphic design; meetings with artists.',
      expRole6: 'Mobility Genius',
      expDesc6: 'Inbound/outbound support, B2B portfolio management, customer verification, emergency OPS handling.',
      expRole7: 'Sales Specialist',
      expDesc7: 'Managed Instagram/Facebook ads, advised 150 B2B clients per quarter, cross-selling, Employee of the Month.',
      expRole8: 'Animateur',
      expDesc8: 'Team leadership (2–15 people), show management, customer communication, product sales.',
      titleSkills: 'Skills',
      skill1: 'Facebook Ads',
      skill2: 'TikTok Ads',
      skill6: 'Google Tools',
      skill9: 'Data Analysis',
      skill10: 'Budget Planning',
      titleLanguages: 'Languages',
      langName1: 'German',
      langLevel1: 'Native',
      langName2: 'English',
      langLevel2: 'Native',
      langName3: 'Italian',
      langLevel3: 'Native',
      langName4: 'Spanish',
      langName5: 'French',
      titleContact: 'Contact',
      contactLabel1: 'Location',
      contactValue1: 'Berlin, Germany',
      contactLabel2: 'Email',
      contactLabel3: 'Phone',
      footerText: '© 2026 Endale Conti — Built with neon & passion.'
    },
    de: {
      pageTitle: 'Endale Conti – Portfolio',
      navAbout: 'Über mich',
      navExperience: 'Erfahrung',
      navSkills: 'Kompetenzen',
      navLanguages: 'Sprachen',
      navContact: 'Kontakt',
      heroGreeting: 'Hallo, ich bin',
      heroSubtitle: 'Customer Success • Sales • Performance Marketing',
      heroCta: 'Kontakt aufnehmen',
      titleAbout: 'Über mich',
      aboutText: 'International erfahrener Customer Success & Sales Manager mit starkem Fokus auf digitales Advertising, Prozessoptimierung und Teamführung. Ich arbeite datenbasiert, strukturiert und lösungsorientiert.',
      titleExperience: 'Berufserfahrung',
      expRole1: 'Customer Success Manager',
      expDesc1: 'Kommunikation mit Anwälten und Kanzleien, Dokumentation und Fallmanagement, Prozessoptimierung.',
      expRole2: 'Sales Manager & Brand Manager',
      expDesc2: 'Über 5 Mio. USD für Kunden generiert, B2B-Werbung gesteuert, Recruiting-Team mit 7 Personen aufgebaut, Datenanalyse.',
      expRole3: 'Recruiter',
      expDesc3: 'Active Sourcing, Interviews, Relocation-Support, CRM-Systeme.',
      expRole4: 'Teamleiter',
      expDesc4: 'Amazon-Team von 2 auf 9 Mitarbeitende aufgebaut, 90%+ Kundenzufriedenheit gehalten, Einsatzplanung, Interviews.',
      expRole5: 'Sales Manager & Brand Manager',
      expDesc5: 'Google-, Facebook-, Instagram- und TikTok-Ads erstellt und verwaltet; Grafikdesign; Meetings mit Künstlern.',
      expRole6: 'Mobility Genius',
      expDesc6: 'Inbound-/Outbound-Support, B2B-Portfolio-Management, Kundenverifizierung, Notfall-OPS.',
      expRole7: 'Sales Specialist',
      expDesc7: 'Instagram-/Facebook-Ads betreut, 150 B2B-Kunden pro Quartal beraten, Cross-Selling, Employee of the Month.',
      expRole8: 'Animateur',
      expDesc8: 'Teamführung (2–15 Personen), Show-Management, Kundenkommunikation, Produktverkauf.',
      titleSkills: 'Kompetenzen',
      skill1: 'Facebook Ads',
      skill2: 'TikTok Ads',
      skill6: 'Google-Tools',
      skill9: 'Datenanalyse',
      skill10: 'Budgetplanung',
      titleLanguages: 'Sprachen',
      langName1: 'Deutsch',
      langLevel1: 'Muttersprache',
      langName2: 'Englisch',
      langLevel2: 'Muttersprache',
      langName3: 'Italienisch',
      langLevel3: 'Muttersprache',
      langName4: 'Spanisch',
      langName5: 'Französisch',
      titleContact: 'Kontakt',
      contactLabel1: 'Standort',
      contactValue1: 'Berlin, Deutschland',
      contactLabel2: 'E-Mail',
      contactLabel3: 'Telefon',
      footerText: '© 2026 Endale Conti — Erstellt mit Neon & Leidenschaft.'
    },
    it: {
      pageTitle: 'Endale Conti – Portfolio',
      navAbout: 'Chi sono',
      navExperience: 'Esperienza',
      navSkills: 'Competenze',
      navLanguages: 'Lingue',
      navContact: 'Contatto',
      heroGreeting: 'Ciao, sono',
      heroSubtitle: 'Customer Success • Sales • Performance Marketing',
      heroCta: 'Contattami',
      titleAbout: 'Chi sono',
      aboutText: 'Customer Success & Sales Manager con esperienza internazionale, forte focus su advertising digitale, ottimizzazione dei processi e leadership del team. Lavoro in modo data-driven, strutturato e orientato alle soluzioni.',
      titleExperience: 'Esperienza',
      expRole1: 'Customer Success Manager',
      expDesc1: 'Comunicazione con avvocati e studi legali, documentazione e gestione dei casi, ottimizzazione dei processi.',
      expRole2: 'Sales Manager & Brand Manager',
      expDesc2: 'Generati oltre 5 milioni di USD per i clienti, gestione advertising B2B, creazione di un team recruiting di 7 persone, analisi dati.',
      expRole3: 'Recruiter',
      expDesc3: 'Active sourcing, colloqui, supporto relocation, sistemi CRM.',
      expRole4: 'Team Leader',
      expDesc4: 'Guidato il team Amazon da 2 a 9 dipendenti, mantenuto soddisfazione clienti oltre il 90%, pianificazione turni, colloqui.',
      expRole5: 'Sales Manager & Brand Manager',
      expDesc5: 'Creato e gestito campagne Google, Facebook, Instagram e TikTok; graphic design; meeting con artisti.',
      expRole6: 'Mobility Genius',
      expDesc6: 'Supporto inbound/outbound, gestione portafoglio B2B, verifica clienti, gestione OPS di emergenza.',
      expRole7: 'Sales Specialist',
      expDesc7: 'Gestione ads Instagram/Facebook, consulenza a 150 clienti B2B per trimestre, cross-selling, Employee of the Month.',
      expRole8: 'Animateur',
      expDesc8: 'Leadership team (2–15 persone), gestione show, comunicazione clienti, vendita prodotti.',
      titleSkills: 'Competenze',
      skill1: 'Facebook Ads',
      skill2: 'TikTok Ads',
      skill6: 'Strumenti Google',
      skill9: 'Analisi dati',
      skill10: 'Pianificazione budget',
      titleLanguages: 'Lingue',
      langName1: 'Tedesco',
      langLevel1: 'Madrelingua',
      langName2: 'Inglese',
      langLevel2: 'Madrelingua',
      langName3: 'Italiano',
      langLevel3: 'Madrelingua',
      langName4: 'Spagnolo',
      langName5: 'Francese',
      titleContact: 'Contatto',
      contactLabel1: 'Località',
      contactValue1: 'Berlino, Germania',
      contactLabel2: 'Email',
      contactLabel3: 'Telefono',
      footerText: '© 2026 Endale Conti — Creato con neon e passione.'
    },
    es: {
      pageTitle: 'Endale Conti – Portfolio',
      navAbout: 'Sobre mí',
      navExperience: 'Experiencia',
      navSkills: 'Habilidades',
      navLanguages: 'Idiomas',
      navContact: 'Contacto',
      heroGreeting: 'Hola, soy',
      heroSubtitle: 'Customer Success • Ventas • Marketing de Rendimiento',
      heroCta: 'Contactar',
      titleAbout: 'Sobre mí',
      aboutText: 'Customer Success & Sales Manager con experiencia internacional y fuerte enfoque en publicidad digital, optimización de procesos y liderazgo de equipos. Trabajo de forma data-driven, estructurada y orientada a soluciones.',
      titleExperience: 'Experiencia',
      expRole1: 'Customer Success Manager',
      expDesc1: 'Comunicación con abogados y bufetes, documentación y gestión de casos, optimización de procesos.',
      expRole2: 'Sales Manager & Brand Manager',
      expDesc2: 'Generé más de 5M USD para clientes, gestioné publicidad B2B, creé un equipo de reclutamiento de 7 personas y realicé análisis de datos.',
      expRole3: 'Recruiter',
      expDesc3: 'Búsqueda activa, entrevistas, apoyo en reubicación, sistemas CRM.',
      expRole4: 'Team Leader',
      expDesc4: 'Lideré el equipo de Amazon de 2 a 9 empleados, mantuve más del 90% de satisfacción del cliente, planificación y entrevistas.',
      expRole5: 'Sales Manager & Brand Manager',
      expDesc5: 'Creé y gestioné anuncios en Google, Facebook, Instagram y TikTok; diseño gráfico; reuniones con artistas.',
      expRole6: 'Mobility Genius',
      expDesc6: 'Soporte inbound/outbound, gestión de cartera B2B, verificación de clientes, gestión de OPS de emergencia.',
      expRole7: 'Sales Specialist',
      expDesc7: 'Gestioné anuncios de Instagram/Facebook, asesoré a 150 clientes B2B por trimestre, cross-selling, Employee of the Month.',
      expRole8: 'Animateur',
      expDesc8: 'Liderazgo de equipos (2–15 personas), gestión de espectáculos, comunicación con clientes, ventas de productos.',
      titleSkills: 'Habilidades',
      skill1: 'Facebook Ads',
      skill2: 'TikTok Ads',
      skill6: 'Herramientas de Google',
      skill9: 'Análisis de datos',
      skill10: 'Planificación de presupuesto',
      titleLanguages: 'Idiomas',
      langName1: 'Alemán',
      langLevel1: 'Nativo',
      langName2: 'Inglés',
      langLevel2: 'Nativo',
      langName3: 'Italiano',
      langLevel3: 'Nativo',
      langName4: 'Español',
      langName5: 'Francés',
      titleContact: 'Contacto',
      contactLabel1: 'Ubicación',
      contactValue1: 'Berlín, Alemania',
      contactLabel2: 'Email',
      contactLabel3: 'Teléfono',
      footerText: '© 2026 Endale Conti — Creado con neón y pasión.'
    },
    fr: {
      pageTitle: 'Endale Conti – Portfolio',
      navAbout: 'À propos',
      navExperience: 'Expérience',
      navSkills: 'Compétences',
      navLanguages: 'Langues',
      navContact: 'Contact',
      heroGreeting: 'Bonjour, je suis',
      heroSubtitle: 'Customer Success • Ventes • Marketing à la Performance',
      heroCta: 'Me contacter',
      titleAbout: 'À propos de moi',
      aboutText: 'Customer Success & Sales Manager avec une expérience internationale, axé sur la publicité digitale, l’optimisation des processus et le leadership d’équipe. Je travaille de manière data-driven, structurée et orientée solutions.',
      titleExperience: 'Expérience',
      expRole1: 'Customer Success Manager',
      expDesc1: 'Communication avec des avocats et des cabinets, documentation et gestion des dossiers, optimisation des processus.',
      expRole2: 'Sales Manager & Brand Manager',
      expDesc2: 'Plus de 5M USD générés pour les clients, gestion de la publicité B2B, création d’une équipe de recrutement de 7 personnes, analyse de données.',
      expRole3: 'Recruiter',
      expDesc3: 'Sourcing actif, entretiens, aide à la relocation, systèmes CRM.',
      expRole4: 'Team Leader',
      expDesc4: 'Pilotage de l’équipe Amazon de 2 à 9 employés, maintien de plus de 90% de satisfaction client, planification, entretiens.',
      expRole5: 'Sales Manager & Brand Manager',
      expDesc5: 'Création et gestion de campagnes Google, Facebook, Instagram et TikTok; design graphique; réunions avec des artistes.',
      expRole6: 'Mobility Genius',
      expDesc6: 'Support inbound/outbound, gestion de portefeuille B2B, vérification client, gestion OPS d’urgence.',
      expRole7: 'Sales Specialist',
      expDesc7: 'Gestion des ads Instagram/Facebook, conseil à 150 clients B2B par trimestre, cross-selling, Employee of the Month.',
      expRole8: 'Animateur',
      expDesc8: 'Leadership d’équipe (2 à 15 personnes), gestion de spectacles, communication client, vente de produits.',
      titleSkills: 'Compétences',
      skill1: 'Facebook Ads',
      skill2: 'TikTok Ads',
      skill6: 'Outils Google',
      skill9: 'Analyse de données',
      skill10: 'Planification budgétaire',
      titleLanguages: 'Langues',
      langName1: 'Allemand',
      langLevel1: 'Natif',
      langName2: 'Anglais',
      langLevel2: 'Natif',
      langName3: 'Italien',
      langLevel3: 'Natif',
      langName4: 'Espagnol',
      langName5: 'Français',
      titleContact: 'Contact',
      contactLabel1: 'Lieu',
      contactValue1: 'Berlin, Allemagne',
      contactLabel2: 'Email',
      contactLabel3: 'Téléphone',
      footerText: '© 2026 Endale Conti — Créé avec néon et passion.'
    }
  };

  const elementMap = {
    navAbout: 'nav-about',
    navExperience: 'nav-experience',
    navSkills: 'nav-skills',
    navLanguages: 'nav-languages',
    navContact: 'nav-contact',
    heroGreeting: 'hero-greeting',
    heroSubtitle: 'hero-subtitle',
    heroCta: 'hero-cta',
    titleAbout: 'title-about',
    aboutText: 'about-text',
    titleExperience: 'title-experience',
    expRole1: 'exp-role-1',
    expDesc1: 'exp-desc-1',
    expRole2: 'exp-role-2',
    expDesc2: 'exp-desc-2',
    expRole3: 'exp-role-3',
    expDesc3: 'exp-desc-3',
    expRole4: 'exp-role-4',
    expDesc4: 'exp-desc-4',
    expRole5: 'exp-role-5',
    expDesc5: 'exp-desc-5',
    expRole6: 'exp-role-6',
    expDesc6: 'exp-desc-6',
    expRole7: 'exp-role-7',
    expDesc7: 'exp-desc-7',
    expRole8: 'exp-role-8',
    expDesc8: 'exp-desc-8',
    titleSkills: 'title-skills',
    skill1: 'skill-1',
    skill2: 'skill-2',
    skill6: 'skill-6',
    skill9: 'skill-9',
    skill10: 'skill-10',
    titleLanguages: 'title-languages',
    langName1: 'lang-name-1',
    langLevel1: 'lang-level-1',
    langName2: 'lang-name-2',
    langLevel2: 'lang-level-2',
    langName3: 'lang-name-3',
    langLevel3: 'lang-level-3',
    langName4: 'lang-name-4',
    langName5: 'lang-name-5',
    titleContact: 'title-contact',
    contactLabel1: 'contact-label-1',
    contactValue1: 'contact-value-1',
    contactLabel2: 'contact-label-2',
    contactLabel3: 'contact-label-3',
    footerText: 'footer-text'
  };

  function applyLanguage(lang) {
    const safeLang = translations[lang] ? lang : 'en';
    const dict = translations[safeLang];

    Object.keys(elementMap).forEach((key) => {
      const el = document.getElementById(elementMap[key]);
      if (el && dict[key]) el.textContent = dict[key];
    });

    document.title = dict.pageTitle;
    document.documentElement.lang = safeLang;
    localStorage.setItem(STORAGE_KEY, safeLang);
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  const browserLang = (navigator.language || 'en').slice(0, 2);
  const initial = translations[saved] ? saved : (translations[browserLang] ? browserLang : 'en');

  select.value = initial;
  applyLanguage(initial);

  const onLangChange = (e) => {
    applyLanguage(e.target.value);
  };

  // input fires immediately in many browsers; change is kept as a fallback
  select.addEventListener('input', onLangChange);
  select.addEventListener('change', onLangChange);
})();


/* ── Smooth scroll polyfill for Safari ───────────────────── */
(function safariSmoothScroll() {
  // Native smooth scroll is supported in modern Safari (15.4+).
  // For older versions we add a small JS fallback.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id     = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      // Check if native smooth scroll works
      if ('scrollBehavior' in document.documentElement.style) return;

      e.preventDefault();
      const start    = window.scrollY;
      const end      = target.getBoundingClientRect().top + window.scrollY - 60;
      const distance = end - start;
      const duration = 700;
      let startTime  = null;

      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function step(ts) {
        if (!startTime) startTime = ts;
        const elapsed  = ts - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, start + distance * easeInOutCubic(progress));
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  });
})();
