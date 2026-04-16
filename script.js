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
  const COLOR_GRID  = 'rgba(255, 179, 71, 0.24)';

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
    skyGrad.addColorStop(0,   'rgba(42, 26, 15, 0)');
    skyGrad.addColorStop(1,   'rgba(95, 58, 24, 0.18)');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, horizonY);

    /* ── Floor gradient ────────────────────────────────────── */
    const floorGrad = ctx.createLinearGradient(0, horizonY, 0, H);
    floorGrad.addColorStop(0, 'rgba(255, 179, 71, 0.08)');
    floorGrad.addColorStop(1, 'rgba(189, 120, 30, 0.04)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, horizonY, W, floorH);

    /* ── Glow at horizon ───────────────────────────────────── */
    const glowGrad = ctx.createLinearGradient(0, horizonY - 60, 0, horizonY + 60);
    glowGrad.addColorStop(0,   'transparent');
    glowGrad.addColorStop(0.5, 'rgba(255, 179, 71, 0.10)');
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
    sunGrad.addColorStop(0,    'rgba(255, 240, 210, 0.82)');
    sunGrad.addColorStop(0.18, 'rgba(255, 179, 71, 0.55)');
    sunGrad.addColorStop(0.45, 'rgba(190, 120, 30, 0.22)');
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
    halfGrad.addColorStop(0, '#fff0d5');
    halfGrad.addColorStop(1, '#ffb347');
    ctx.fillStyle = halfGrad;
    ctx.shadowBlur  = 40;
    ctx.shadowColor = '#ffb347';
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
      ctx.fillStyle = 'rgba(45,28,14,0.65)';
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
  if (!select) return;

  function safeGetStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function safeSetStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {
      // Ignore storage errors (private mode / disabled storage)
    }
  }

  const translations = {
    en: {
      pageTitle: 'Endale Conti – Portfolio',
      langSwitchLabel: 'Language',
      navAbout: 'About',
      navExperience: 'Experience',
      navSkills: 'Skills',
      navLanguages: 'Languages',
      navContact: 'Contact',
      heroGreeting: "Hello, I'm",
      heroSubtitle: 'Customer Success Manager • Process Optimization',
      heroCta: 'Get in Touch',
      titleAbout: 'About Me',
      aboutText: 'Experienced Customer Success Manager with a strong background in B2B communication, process optimization, and CRM systems. Multilingual and specialized in structured customer support, technical communication, and efficient workflow design.',
      titleExperience: 'Experience',
      expYear1: '2025 - 10/2025',
      expRole1: 'Customer Success Manager',
      expCompany1: 'Legal Hero GmbH',
      expDesc1: 'Communication with lawyers and law firms, documentation and case management, process optimization, resource planning, and coordination between internal departments.',
      expYear2: '2021 – 2024',
      expRole2: 'Sales Manager / Brand Manager',
      expCompany2: 'Spare Music',
      expDesc2: 'Managed advertising for B2B clients, handled budget planning and data analysis, built and coordinated teams, and generated over 5M USD in revenue.',
      expYear3: '2021 – 2023',
      expRole3: 'Recruiter',
      expCompany3: 'JobSquad',
      expDesc3: 'Recruitment through social platforms, candidate interviews, relocation support, and CRM-based applicant management.',
      expYear4: '2020 – 2021',
      expRole4: 'Team Leader',
      expCompany4: 'Emma GmbH',
      expDesc4: 'Led a 9-person team, managed operations and scheduling, and maintained customer satisfaction above 90%.',
      expYear5: 'Earlier',
      expRole5: 'Additional Experience',
      expCompany5: 'Available on request',
      expDesc5: 'Further professional experience details are available on request.',
      expYear6: 'Earlier',
      expRole6: 'Additional Experience',
      expCompany6: 'Available on request',
      expDesc6: 'Further professional experience details are available on request.',
      expYear7: 'Earlier',
      expRole7: 'Additional Experience',
      expCompany7: 'Available on request',
      expDesc7: 'Further professional experience details are available on request.',
      expYear8: 'Earlier',
      expRole8: 'Additional Experience',
      expCompany8: 'Available on request',
      expDesc8: 'Further professional experience details are available on request.',
      titleSkills: 'Skills',
      skill1: 'CRM: Salesforce',
      skill2: 'CRM: SAP',
      skill3: 'CRM: Teamtailor',
      skill4: 'B2B Communication',
      skill5: 'Process Optimization',
      skill6: 'Google Business Tools',
      skill7: 'Microsoft Business Tools',
      skill8: 'Adobe Creative Cloud',
      skill9: 'Technical Communication',
      skill10: 'Workflow Design',
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
      langSwitchLabel: 'Sprache',
      navAbout: 'Über mich',
      navExperience: 'Erfahrung',
      navSkills: 'Kompetenzen',
      navLanguages: 'Sprachen',
      navContact: 'Kontakt',
      heroGreeting: 'Hallo, ich bin',
      heroSubtitle: 'Customer Success Manager • Prozessoptimierung',
      heroCta: 'Kontakt aufnehmen',
      titleAbout: 'Über mich',
      aboutText: 'Erfahrener Customer Success Manager mit starkem Hintergrund in B2B-Kommunikation, Prozessoptimierung und CRM-Systemen. Mehrsprachig und spezialisiert auf strukturierte Kundenbetreuung, technische Kommunikation und effiziente Workflow-Gestaltung.',
      titleExperience: 'Berufserfahrung',
      expYear1: '2025 - 10/2025',
      expRole1: 'Customer Success Manager',
      expCompany1: 'Legal Hero GmbH',
      expDesc1: 'Kommunikation mit Rechtsanwälten und Kanzleien, Dokumentation und Fallmanagement, Prozessoptimierung, Ressourcenplanung sowie Koordination zwischen internen Abteilungen.',
      expYear2: '2021 – 2024',
      expRole2: 'Sales Manager / Brand Manager',
      expCompany2: 'Spare Music',
      expDesc2: 'Verwaltung von Werbung für B2B-Kunden, Budgetplanung und Datenanalyse, Teamaufbau und Koordination sowie über 5 Mio. USD Umsatz generiert.',
      expYear3: '2021 – 2023',
      expRole3: 'Recruiter',
      expCompany3: 'JobSquad',
      expDesc3: 'Rekrutierung über soziale Plattformen, Interviews, Relocation-Support und Bewerbermanagement mit CRM-Systemen.',
      expYear4: '2020 – 2021',
      expRole4: 'Teamleiter',
      expCompany4: 'Emma GmbH',
      expDesc4: 'Leitung eines 9-köpfigen Teams, operative Planung und Koordination sowie Kundenzufriedenheit von über 90%.',
      expYear5: 'Früher',
      expRole5: 'Weitere Berufserfahrung',
      expCompany5: 'Auf Anfrage verfügbar',
      expDesc5: 'Weitere Details zur Berufserfahrung sind auf Anfrage verfügbar.',
      expYear6: 'Früher',
      expRole6: 'Weitere Berufserfahrung',
      expCompany6: 'Auf Anfrage verfügbar',
      expDesc6: 'Weitere Details zur Berufserfahrung sind auf Anfrage verfügbar.',
      expYear7: 'Früher',
      expRole7: 'Weitere Berufserfahrung',
      expCompany7: 'Auf Anfrage verfügbar',
      expDesc7: 'Weitere Details zur Berufserfahrung sind auf Anfrage verfügbar.',
      expYear8: 'Früher',
      expRole8: 'Weitere Berufserfahrung',
      expCompany8: 'Auf Anfrage verfügbar',
      expDesc8: 'Weitere Details zur Berufserfahrung sind auf Anfrage verfügbar.',
      titleSkills: 'Kompetenzen',
      skill1: 'CRM: Salesforce',
      skill2: 'CRM: SAP',
      skill3: 'CRM: Teamtailor',
      skill4: 'B2B-Kommunikation',
      skill5: 'Prozessoptimierung',
      skill6: 'Google Business Tools',
      skill7: 'Microsoft Business Tools',
      skill8: 'Adobe Creative Cloud',
      skill9: 'Technische Kommunikation',
      skill10: 'Workflow-Gestaltung',
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
      langSwitchLabel: 'Lingua',
      navAbout: 'Chi sono',
      navExperience: 'Esperienza',
      navSkills: 'Competenze',
      navLanguages: 'Lingue',
      navContact: 'Contatto',
      heroGreeting: 'Ciao, sono',
      heroSubtitle: 'Customer Success Manager • Ottimizzazione processi',
      heroCta: 'Contattami',
      titleAbout: 'Chi sono',
      aboutText: 'Customer Success Manager con solida esperienza in comunicazione B2B, ottimizzazione dei processi e sistemi CRM. Multilingue e specializzato in customer support strutturato, comunicazione tecnica e progettazione di workflow efficienti.',
      titleExperience: 'Esperienza',
      expYear1: '2025 - 10/2025',
      expRole1: 'Customer Success Manager',
      expCompany1: 'Legal Hero GmbH',
      expDesc1: 'Comunicazione con avvocati e studi legali, documentazione e gestione dei casi, ottimizzazione dei processi, pianificazione risorse e coordinamento tra reparti interni.',
      expYear2: '2021 – 2024',
      expRole2: 'Sales Manager / Brand Manager',
      expCompany2: 'Spare Music',
      expDesc2: 'Gestione advertising per clienti B2B, budget planning e analisi dati, creazione e coordinamento di team, oltre 5 milioni di USD di fatturato generato.',
      expYear3: '2021 – 2023',
      expRole3: 'Recruiter',
      expCompany3: 'JobSquad',
      expDesc3: 'Recruiting tramite piattaforme social, colloqui, supporto relocation e gestione candidati tramite sistemi CRM.',
      expYear4: '2020 – 2021',
      expRole4: 'Team Leader',
      expCompany4: 'Emma GmbH',
      expDesc4: 'Gestione di un team di 9 persone, coordinamento operativo e mantenimento della soddisfazione clienti oltre il 90%.',
      expYear5: 'Precedente',
      expRole5: 'Esperienza aggiuntiva',
      expCompany5: 'Disponibile su richiesta',
      expDesc5: 'Ulteriori dettagli sull’esperienza professionale disponibili su richiesta.',
      expYear6: 'Precedente',
      expRole6: 'Esperienza aggiuntiva',
      expCompany6: 'Disponibile su richiesta',
      expDesc6: 'Ulteriori dettagli sull’esperienza professionale disponibili su richiesta.',
      expYear7: 'Precedente',
      expRole7: 'Esperienza aggiuntiva',
      expCompany7: 'Disponibile su richiesta',
      expDesc7: 'Ulteriori dettagli sull’esperienza professionale disponibili su richiesta.',
      expYear8: 'Precedente',
      expRole8: 'Esperienza aggiuntiva',
      expCompany8: 'Disponibile su richiesta',
      expDesc8: 'Ulteriori dettagli sull’esperienza professionale disponibili su richiesta.',
      titleSkills: 'Competenze',
      skill1: 'CRM: Salesforce',
      skill2: 'CRM: SAP',
      skill3: 'CRM: Teamtailor',
      skill4: 'Comunicazione B2B',
      skill5: 'Ottimizzazione dei processi',
      skill6: 'Google Business Tools',
      skill7: 'Microsoft Business Tools',
      skill8: 'Adobe Creative Cloud',
      skill9: 'Comunicazione tecnica',
      skill10: 'Progettazione workflow',
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
      langSwitchLabel: 'Idioma',
      navAbout: 'Sobre mí',
      navExperience: 'Experiencia',
      navSkills: 'Habilidades',
      navLanguages: 'Idiomas',
      navContact: 'Contacto',
      heroGreeting: 'Hola, soy',
      heroSubtitle: 'Customer Success Manager • Optimización de procesos',
      heroCta: 'Contactar',
      titleAbout: 'Sobre mí',
      aboutText: 'Customer Success Manager con sólida experiencia en comunicación B2B, optimización de procesos y sistemas CRM. Multilingüe y especializado en atención al cliente estructurada, comunicación técnica y diseño eficiente de flujos de trabajo.',
      titleExperience: 'Experiencia',
      expYear1: '2025 - 10/2025',
      expRole1: 'Customer Success Manager',
      expCompany1: 'Legal Hero GmbH',
      expDesc1: 'Comunicación con abogados y bufetes, documentación y gestión de casos, optimización de procesos, planificación de recursos y coordinación entre departamentos internos.',
      expYear2: '2021 – 2024',
      expRole2: 'Sales Manager / Brand Manager',
      expCompany2: 'Spare Music',
      expDesc2: 'Gestión de publicidad para clientes B2B, planificación de presupuesto y análisis de datos, creación y coordinación de equipos, y más de 5M USD de ingresos generados.',
      expYear3: '2021 – 2023',
      expRole3: 'Recruiter',
      expCompany3: 'JobSquad',
      expDesc3: 'Reclutamiento en plataformas sociales, entrevistas, apoyo en reubicación y gestión de candidatos con CRM.',
      expYear4: '2020 – 2021',
      expRole4: 'Team Leader',
      expCompany4: 'Emma GmbH',
      expDesc4: 'Dirección de un equipo de 9 personas, coordinación operativa y mantenimiento de satisfacción del cliente superior al 90%.',
      expYear5: 'Anterior',
      expRole5: 'Experiencia adicional',
      expCompany5: 'Disponible a petición',
      expDesc5: 'Más detalles de experiencia profesional disponibles a petición.',
      expYear6: 'Anterior',
      expRole6: 'Experiencia adicional',
      expCompany6: 'Disponible a petición',
      expDesc6: 'Más detalles de experiencia profesional disponibles a petición.',
      expYear7: 'Anterior',
      expRole7: 'Experiencia adicional',
      expCompany7: 'Disponible a petición',
      expDesc7: 'Más detalles de experiencia profesional disponibles a petición.',
      expYear8: 'Anterior',
      expRole8: 'Experiencia adicional',
      expCompany8: 'Disponible a petición',
      expDesc8: 'Más detalles de experiencia profesional disponibles a petición.',
      titleSkills: 'Habilidades',
      skill1: 'CRM: Salesforce',
      skill2: 'CRM: SAP',
      skill3: 'CRM: Teamtailor',
      skill4: 'Comunicación B2B',
      skill5: 'Optimización de procesos',
      skill6: 'Google Business Tools',
      skill7: 'Microsoft Business Tools',
      skill8: 'Adobe Creative Cloud',
      skill9: 'Comunicación técnica',
      skill10: 'Diseño de workflows',
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
      langSwitchLabel: 'Langue',
      navAbout: 'À propos',
      navExperience: 'Expérience',
      navSkills: 'Compétences',
      navLanguages: 'Langues',
      navContact: 'Contact',
      heroGreeting: 'Bonjour, je suis',
      heroSubtitle: 'Customer Success Manager • Optimisation des processus',
      heroCta: 'Me contacter',
      titleAbout: 'À propos de moi',
      aboutText: 'Customer Success Manager expérimenté avec une forte expertise en communication B2B, optimisation des processus et systèmes CRM. Multilingue, spécialisé dans l’accompagnement client structuré, la communication technique et la conception de workflows efficaces.',
      titleExperience: 'Expérience',
      expYear1: '2025 - 10/2025',
      expRole1: 'Customer Success Manager',
      expCompany1: 'Legal Hero GmbH',
      expDesc1: 'Communication avec des avocats et des cabinets, documentation et gestion des dossiers, optimisation des processus, planification des ressources et coordination entre départements internes.',
      expYear2: '2021 – 2024',
      expRole2: 'Sales Manager / Brand Manager',
      expCompany2: 'Spare Music',
      expDesc2: 'Gestion de la publicité pour des clients B2B, planification budgétaire et analyse de données, création et coordination d’équipes, et plus de 5M USD de chiffre d’affaires générés.',
      expYear3: '2021 – 2023',
      expRole3: 'Recruiter',
      expCompany3: 'JobSquad',
      expDesc3: 'Recrutement via les plateformes sociales, entretiens, aide à la relocation et gestion des candidatures via CRM.',
      expYear4: '2020 – 2021',
      expRole4: 'Team Leader',
      expCompany4: 'Emma GmbH',
      expDesc4: 'Management d’une équipe de 9 personnes, coordination opérationnelle et maintien d’une satisfaction client supérieure à 90%.',
      expYear5: 'Antérieur',
      expRole5: 'Expérience complémentaire',
      expCompany5: 'Disponible sur demande',
      expDesc5: 'Des informations complémentaires sur l’expérience professionnelle sont disponibles sur demande.',
      expYear6: 'Antérieur',
      expRole6: 'Expérience complémentaire',
      expCompany6: 'Disponible sur demande',
      expDesc6: 'Des informations complémentaires sur l’expérience professionnelle sont disponibles sur demande.',
      expYear7: 'Antérieur',
      expRole7: 'Expérience complémentaire',
      expCompany7: 'Disponible sur demande',
      expDesc7: 'Des informations complémentaires sur l’expérience professionnelle sont disponibles sur demande.',
      expYear8: 'Antérieur',
      expRole8: 'Expérience complémentaire',
      expCompany8: 'Disponible sur demande',
      expDesc8: 'Des informations complémentaires sur l’expérience professionnelle sont disponibles sur demande.',
      titleSkills: 'Compétences',
      skill1: 'CRM: Salesforce',
      skill2: 'CRM: SAP',
      skill3: 'CRM: Teamtailor',
      skill4: 'Communication B2B',
      skill5: 'Optimisation des processus',
      skill6: 'Google Business Tools',
      skill7: 'Microsoft Business Tools',
      skill8: 'Adobe Creative Cloud',
      skill9: 'Communication technique',
      skill10: 'Conception de workflows',
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
    langSwitchLabel: 'lang-switch-label',
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
    expYear1: 'exp-year-1',
    expRole1: 'exp-role-1',
    expCompany1: 'exp-company-1',
    expDesc1: 'exp-desc-1',
    expYear2: 'exp-year-2',
    expRole2: 'exp-role-2',
    expCompany2: 'exp-company-2',
    expDesc2: 'exp-desc-2',
    expYear3: 'exp-year-3',
    expRole3: 'exp-role-3',
    expCompany3: 'exp-company-3',
    expDesc3: 'exp-desc-3',
    expYear4: 'exp-year-4',
    expRole4: 'exp-role-4',
    expCompany4: 'exp-company-4',
    expDesc4: 'exp-desc-4',
    expYear5: 'exp-year-5',
    expRole5: 'exp-role-5',
    expCompany5: 'exp-company-5',
    expDesc5: 'exp-desc-5',
    expYear6: 'exp-year-6',
    expRole6: 'exp-role-6',
    expCompany6: 'exp-company-6',
    expDesc6: 'exp-desc-6',
    expYear7: 'exp-year-7',
    expRole7: 'exp-role-7',
    expCompany7: 'exp-company-7',
    expDesc7: 'exp-desc-7',
    expYear8: 'exp-year-8',
    expRole8: 'exp-role-8',
    expCompany8: 'exp-company-8',
    expDesc8: 'exp-desc-8',
    titleSkills: 'title-skills',
    skill1: 'skill-1',
    skill2: 'skill-2',
    skill3: 'skill-3',
    skill4: 'skill-4',
    skill5: 'skill-5',
    skill6: 'skill-6',
    skill7: 'skill-7',
    skill8: 'skill-8',
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
    safeSetStorage(STORAGE_KEY, safeLang);
  }

  const saved = safeGetStorage(STORAGE_KEY);
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
