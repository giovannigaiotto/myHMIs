/* ==========================================================================
   Giovanni Gaiotto — portfolio
   Three HMI screens, rebuilt for the browser. No dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- theme */
  (function theme() {
    var root = document.documentElement;
    var btn  = $('#theme');
    var KEY  = 'gg-theme';
    var saved;
    try { saved = localStorage.getItem(KEY); } catch (e) { saved = null; }
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);

    if (!btn) return;
    btn.addEventListener('click', function () {
      var isDark = root.getAttribute('data-theme') === 'dark' ||
        (!root.hasAttribute('data-theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = isDark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
    });
  })();

  /* ------------------------------------------------------- sticky nav rule */
  (function stickyNav() {
    var nav = $('.nav');
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  /* ------------------------------------------------------------ year stamp */
  var yr = $('#yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* --------------------------------------------------------- reveal on scroll */
  (function reveal() {
    var items = $$('.reveal');
    if (!items.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  })();

  /* ------------------------------------------------------------ screen scale
     Each screen is a fixed 800x480 canvas — the real display geometry —
     scaled to whatever width the page gives it.                              */
  (function scaleScreens() {
    // Below this the on-glass type stops being readable, so the screen keeps
    // its size and pans horizontally inside the bezel instead of shrinking.
    var MIN_SCALE = 0.62;

    var pairs = $$('.viewport').map(function (vp) {
      var scr = $('.screen', vp);
      if (!scr) return null;
      var sizer = document.createElement('div');
      sizer.className = 'screen__sizer';
      sizer.setAttribute('aria-hidden', 'true');
      vp.appendChild(sizer);
      return { vp: vp, scr: scr, sizer: sizer, fig: vp.closest('.device') };
    }).filter(Boolean);
    if (!pairs.length) return;

    var apply = function () {
      pairs.forEach(function (p) {
        // clientWidth excludes a scrollbar, so measure the box we must fit
        var avail = p.vp.getBoundingClientRect().width;
        var s = Math.max(avail / 800, MIN_SCALE);
        p.scr.style.setProperty('--s', s.toFixed(5));
        p.vp.style.height = Math.round(480 * s) + 'px';
        p.sizer.style.width  = Math.round(800 * s) + 'px';
        p.sizer.style.height = Math.round(480 * s) + 'px';
        if (p.fig) p.fig.classList.toggle('is-pannable', 800 * s > avail + 1);
      });
    };
    apply();

    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(apply);
      pairs.forEach(function (p) { ro.observe(p.vp); });
    } else {
      window.addEventListener('resize', apply);
    }
    // fonts change nothing about geometry, but layout settles after they load
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(apply);
  })();

  /* ----------------------------------------------------- run only when seen */
  function whenVisible(el, start, stop) {
    if (!el || !('IntersectionObserver' in window)) { start(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
    }, { threshold: 0.15 });
    io.observe(el);
  }

  /* ======================================================================
     DESIGN 01 — the real winch panel
     Captures of the shipped machine. Pressing the keys walks the same
     navigation the operator walks: no transitions, the page just changes.
     Geometry below is in % of the 1500x856 capture, measured off the images.
     ====================================================================== */
  (function winchPanel() {
    var root = document.getElementById('winch');
    if (!root) return;

    var stage = document.getElementById('winch-stage');
    var page  = document.getElementById('winch-page');
    var menuI = document.getElementById('winch-menu');
    var hits  = document.getElementById('winch-hits');
    var login = document.getElementById('winch-login');

    var GEO = {
      key:   { left: 92.0, width: 7.7 },     // the right-hand key column
      user:  { top: 55.9, height: 13.2 },
      home:  { top: 71.0, height: 13.4 },
      menu:  { top: 85.6, height: 14.0 },
      pin:   { top: 41.6, height: 13.2 },    // tower pages only
      panel: { left: 84.09, top: 7.671, width: 15.91, height: 92.329 }
    };
    var COLS = 2, ROWS = 7;

    var PAGES = {
      home:            { file: 'home.webp',          label: 'Main screen' },
      temperature:     { file: 'temperature.webp',   label: 'Temperature' },
      details:         { file: 'details.webp',       label: 'Details' },
      towers:          { file: 'towers.webp',        label: 'Tower positions' },
      'towers-detail': { file: 'towers-detail.webp', label: 'Position points' },
      brakes:          { file: 'brakes.webp',        label: 'Brakes' },
      emergency:       { file: 'emergency.webp',     label: 'Emergency stops' },
      devices:         { file: 'devices.webp',       label: 'Devices' },
      motor:           { file: 'motor.webp',         label: 'Electric motor' },
      safety:          { file: 'safety.webp',        label: 'Safety parameters' },
      parameters:      { file: 'parameters.webp',    label: 'Parameters' },
      alarms:          { file: 'alarms.webp',        label: 'Alarms' },
      encoder:         { file: 'encoder.webp',       label: 'Encoders' },
      errordisable:    { file: 'errordisable.webp',  label: 'Error disable' }
    };

    // menu grid, read left to right and top to bottom, as on the panel
    var MENU = [
      { act: 'login',                     label: 'Login' },
      { act: 'none',                      label: 'Generator — web visualisation, not linked yet' },
      { act: 'go', page: 'temperature',   label: 'Temperature' },
      { act: 'go', page: 'details',       label: 'Details' },
      { act: 'go', page: 'towers',        label: 'Tower positions' },
      { act: 'go', page: 'brakes',        label: 'Brakes' },
      { act: 'go', page: 'emergency',     label: 'Emergency stops' },
      { act: 'go', page: 'devices',       label: 'Devices' },
      { act: 'go', page: 'safety',        label: 'Safety parameters' },
      { act: 'go', page: 'parameters',    label: 'Parameters' },
      { act: 'go', page: 'alarms',        label: 'Alarms' },
      { act: 'go', page: 'encoder',       label: 'Encoders' },
      { act: 'go', page: 'errordisable',  label: 'Error disable' },
      { act: 'close',                     label: 'Close menu' }
    ];

    var current = 'home';
    var menuOpen = false;
    var level = 3;                       // the panel ships logged in at 3

    /* ---------- helpers ---------- */
    function place(el, r) {
      el.style.left   = r.left + '%';
      el.style.top    = r.top + '%';
      el.style.width  = r.width + '%';
      el.style.height = r.height + '%';
    }
    function mkHit(rect, label, onClick, disabled) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hit';
      b.title = label;
      b.setAttribute('aria-label', label);
      place(b, rect);
      if (disabled) {
        b.disabled = true;
        b.classList.add('hit--off');
      } else {
        b.addEventListener('click', onClick);
      }
      hits.appendChild(b);
      return b;
    }
    function keyRect(k) {
      return { left: GEO.key.left, width: GEO.key.width, top: k.top, height: k.height };
    }
    function cellRect(i) {
      var p = GEO.panel;
      return {
        left:   p.left + (i % COLS) * (p.width / COLS),
        top:    p.top + Math.floor(i / COLS) * (p.height / ROWS),
        width:  p.width / COLS,
        height: p.height / ROWS
      };
    }

    /* ---------- the operator-level badge ----------
       The captures all carry a baked-in "3". We cover just the black
       shoulder ellipse of the icon and redraw the digit on top, so the
       level can actually change. The cover sits inside the original
       black, which is why nothing shows at the seams.                    */
    var badge = document.createElement('div');
    badge.className = 'shot__badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.innerHTML =
      '<svg viewBox="0 0 100 100" preserveAspectRatio="none">' +
        '<ellipse cx="48" cy="50" rx="31" ry="12.5" fill="#000"></ellipse>' +
        '<text class="lvl" x="48" y="50" fill="#AEE0EF" font-size="26" ' +
              'font-family="Arial, Helvetica, sans-serif" font-weight="700" ' +
              'text-anchor="middle" dominant-baseline="central"></text>' +
      '</svg>';
    stage.appendChild(badge);
    var lvlText = badge.querySelector('.lvl');

    function paintBadge() {
      lvlText.textContent = level ? String(level) : '';
      // when the menu is open the icon lives in its first cell instead
      place(badge, menuOpen ? cellRect(0) : keyRect(GEO.user));
    }

    /* ---------- navigation ---------- */
    function show(id) {
      var p = PAGES[id];
      if (!p) return;
      current = id;
      page.src = 'assets/hmi/' + p.file;
      page.alt = 'Winch control unit — ' + p.label;
      root.setAttribute('data-page', id);
      build();
    }
    function setMenu(open) {
      menuOpen = open;
      menuI.hidden = !open;
      build();
    }
    function closeLogin() {
      login.hidden = true;
      root.classList.remove('is-login');
    }
    function setLevel(n) {
      level = n;
      closeLogin();
      build();
    }
    function openLogin() {
      login.hidden = false;
      root.classList.add('is-login');
      var b = login.querySelector('button');
      if (b) b.focus();
    }

    /* ---------- (re)build the hotspots for the current state ---------- */
    function build() {
      hits.textContent = '';

      // the menu key is on every page
      mkHit(keyRect(GEO.menu), menuOpen ? 'Close menu' : 'Open menu',
            function () { setMenu(!menuOpen); });

      if (menuOpen) {
        MENU.forEach(function (m, i) {
          if (m.act === 'login') {
            mkHit(cellRect(i), m.label, function () { setMenu(false); openLogin(); });
          } else if (m.act === 'close') {
            mkHit(cellRect(i), m.label, function () { setMenu(false); });
          } else if (m.act === 'none') {
            mkHit(cellRect(i), m.label, null, true);
          } else {
            (function (target) {
              mkHit(cellRect(i), m.label, function () { setMenu(false); show(target); });
            })(m.page);
          }
        });
      } else {
        mkHit(keyRect(GEO.user),
              'Operator level — currently ' + (level ? level : 'logged out'),
              openLogin);

        if (current !== 'home') {
          mkHit(keyRect(GEO.home), 'Home', function () { show('home'); });
        }
        // the tower page carries a pin key that opens the detailed points
        if (current === 'towers') {
          mkHit(keyRect(GEO.pin), 'Position points', function () { show('towers-detail'); });
        }
        if (current === 'towers-detail') {
          mkHit(keyRect(GEO.pin), 'Back to tower positions', function () { show('towers'); });
        }
        // the device tiles open the electric-motor diagnostics
        if (current === 'devices') {
          mkHit({ left: 4, top: 28, width: 46, height: 48 }, 'Electric motor',
                function () { show('motor'); });
        }
      }
      paintBadge();
    }

    /* ---------- login panel ---------- */
    $$('button', login).forEach(function (b) {
      b.addEventListener('click', function () { setLevel(Number(b.dataset.level)); });
    });
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!login.hidden) closeLogin();
      else if (menuOpen) setMenu(false);
    });

    // warm the other pages once the panel has been seen, so pressing a key
    // does not wait on the network
    whenVisible(root, function () {
      Object.keys(PAGES).forEach(function (k) {
        var i = new Image();
        i.src = 'assets/hmi/' + PAGES[k].file;
      });
    }, function () {});

    build();
  })();

  /* ======================================================================
     SCREEN 2 — Alarm manager
     Codes and texts taken from the machine's own alarm table.
     ====================================================================== */
  (function alarmScreen() {
    var scr = $('#scr-alarm');
    if (!scr) return;

    var CATALOGUE = [
      { code: 'E001_SF1',  sev: 'error',
        t: { en: 'Emergency circuit open', de: 'Not-Aus-Kreis offen',        it: 'Circuito di emergenza aperto' } },
      { code: 'E006_SF6',  sev: 'error',
        t: { en: 'Rope force exceeded',    de: 'Zugkraft überschritten',     it: 'Forza fune superata' } },
      { code: 'E004_SF4',  sev: 'warning',
        t: { en: 'Setpoint vs actual rpm', de: 'Soll-Ist-Drehzahl',          it: 'Giri richiesti / effettivi' } },
      { code: 'E008_SF8',  sev: 'warning',
        t: { en: 'Drum diameter drift',    de: 'Wickeldurchmesser',          it: 'Deriva diametro tamburo' } },
      { code: 'E011_SF11', sev: 'warning',
        t: { en: 'Check brake reduction',  de: 'Verzögerung Bremsen prüfen', it: 'Verificare frenatura' } },
      { code: 'E002_SF2',  sev: 'warning',
        t: { en: 'Minimum speed',          de: 'Minimalgeschwindigkeit',     it: 'Velocità minima' } },
      { code: 'E010_SF10', sev: 'info',
        t: { en: 'Stop check pending',     de: 'Stoppkontrolle fällig',      it: 'Controllo arresto in attesa' } },
      { code: 'E009_SF9',  sev: 'warning',
        t: { en: 'Synchronisation error',  de: 'Gleichlauf-Fehler',          it: 'Errore di sincronismo' } }
    ];

    var UI = {
      en: { active: 'active', sev: { error: 'Error', warning: 'Warning', info: 'Info' },
            keys: ['History', 'Simulate fault', 'Acknowledge'], empty: 'No active alarms', fault: 'Fault' },
      de: { active: 'aktiv',  sev: { error: 'Störung', warning: 'Warnung', info: 'Info' },
            keys: ['Historie', 'Fehler simulieren', 'Quittieren'], empty: 'Keine aktiven Alarme', fault: 'Störung' },
      it: { active: 'attivi', sev: { error: 'Errore', warning: 'Avviso', info: 'Info' },
            keys: ['Storico', 'Simula guasto', 'Conferma'], empty: 'Nessun allarme attivo', fault: 'Guasto' }
    };

    var lang = 'en';
    var next = 3;   // start past the two seeded rows, so the first press is a new fault
    var rows = [
      { def: CATALOGUE[0], time: '14:31:06', ack: false },
      { def: CATALOGUE[2], time: '14:28:44', ack: false },
      { def: CATALOGUE[1], time: '14:22:19', ack: true  },
      { def: CATALOGUE[6], time: '14:07:52', ack: true  }
    ];

    var list  = $('#a-list'), count = $('#a-count'), flag = $('#a-flag');
    var kHist = $('#a-hist'), kTrig = $('#a-trig'), kAck = $('#a-ack');

    function stamp() {
      var d = new Date();
      return [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map(function (n) { return String(n).padStart(2, '0'); }).join(':');
    }

    function render() {
      var u = UI[lang];

      list.textContent = '';
      if (!rows.length) {
        var empty = document.createElement('div');
        empty.className = 'alist__empty';
        empty.textContent = u.empty;
        list.appendChild(empty);
      } else {
        rows.forEach(function (r) {
          var el = document.createElement('div');
          el.className = 'arow' + (r.ack ? ' is-ack' : ' is-live');
          el.setAttribute('data-sev', r.def.sev);

          var code = document.createElement('div');
          code.className = 'arow__code';
          var dot = document.createElement('span');
          dot.className = 'arow__dot';
          code.appendChild(dot);
          code.appendChild(document.createTextNode(r.def.code));

          var txt = document.createElement('div');
          txt.className = 'arow__txt';
          txt.textContent = r.def.t[lang];

          var tm = document.createElement('div');
          tm.className = 'arow__t';
          tm.textContent = r.time;

          var chip = document.createElement('div');
          chip.className = 'arow__chip';
          chip.textContent = u.sev[r.def.sev];

          el.append(code, txt, tm, chip);
          list.appendChild(el);
        });
      }

      var live = rows.filter(function (r) { return !r.ack; }).length;
      count.textContent = rows.length + ' ' + u.active;
      flag.lastChild.nodeValue = live ? u.fault.toUpperCase() : 'OK';
      flag.classList.toggle('pill--alarm', live > 0);
      flag.classList.toggle('pill--ok', live === 0);

      kHist.textContent = u.keys[0];
      kTrig.textContent = u.keys[1];
      kAck.textContent  = u.keys[2];
    }

    $$('.lang__b', scr).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.lang__b', scr).forEach(function (o) { o.classList.remove('is-on'); });
        b.classList.add('is-on');
        lang = b.dataset.lang;
        render();
      });
    });

    kTrig.addEventListener('click', function () {
      rows.unshift({ def: CATALOGUE[next % CATALOGUE.length], time: stamp(), ack: false });
      next += 1;
      if (rows.length > 6) rows.pop();
      render();
    });

    kAck.addEventListener('click', function () {
      rows.forEach(function (r) { r.ack = true; });
      render();
    });

    kHist.addEventListener('click', function () {
      rows = rows.filter(function (r) { return !r.ack; });
      render();
    });

    render();
  })();

  /* ======================================================================
     SCREEN 3 — Emissions escalation
     Four regulated stages, one frame.
     ====================================================================== */
  (function engineScreen() {
    var scr = $('#scr-eng');
    if (!scr) return;

    var STAGES = [
      { pill: ['NORMAL', ''],
        tells: {},
        dpf: 48, def: 62, dpfSev: '', defSev: '',
        sev: 'ok',
        title: 'System nominal',
        sub: 'No operator action required.' },

      { pill: ['REGEN DUE', 'pill--warn'],
        tells: { dpf: 'on-warn' },
        dpf: 78, def: 58, dpfSev: 'is-warn', defSev: '',
        sev: 'warn',
        title: 'DPF regeneration required',
        sub: 'Run at high load for 20 minutes, or start a parked regeneration.' },

      { pill: ['INDUCEMENT', 'pill--alarm'],
        tells: { def: 'on-alarm blink', mil: 'on-warn', dpf: 'on-warn' },
        dpf: 82, def: 6, dpfSev: 'is-warn', defSev: 'is-alarm',
        sev: 'alarm',
        title: 'DEF level critical',
        sub: 'Refill within 30 min. Torque will be limited automatically.' },

      { pill: ['DERATE', 'pill--alarm'],
        tells: { mil: 'on-alarm', def: 'on-alarm blink', temp: 'on-warn', dpf: 'on-alarm' },
        dpf: 94, def: 2, dpfSev: 'is-alarm', defSev: 'is-alarm',
        sev: 'alarm',
        title: 'Engine derate active',
        sub: 'Power limited to 50 %. Service intervention required.' }
    ];

    var pill  = $('#e-state');
    var dpf   = $('#e-dpf'),   dpfV = $('#e-dpf-v');
    var def   = $('#e-def'),   defV = $('#e-def-v');
    var msg   = $('#e-msg'),   msgT = $('#e-msg-t'), msgS = $('#e-msg-s');
    var keys  = $$('#e-keys .sk');
    var tells = $$('.tt', scr);

    function set(i) {
      var s = STAGES[i];

      pill.className = 'pill ' + s.pill[1];
      pill.lastChild.nodeValue = s.pill[0];

      tells.forEach(function (tt) {
        var want = s.tells[tt.dataset.tt] || '';
        tt.className = 'tt';
        if (want) {
          want.split(' ').forEach(function (c) {
            tt.classList.add(c === 'blink' ? 'is-blink' : c);
          });
        }
      });

      dpf.style.width = s.dpf + '%';
      dpf.className = 'hbar__fill ' + s.dpfSev;
      dpfV.textContent = s.dpf + ' %';

      def.style.width = s.def + '%';
      def.className = 'hbar__fill hbar__fill--info ' + s.defSev;
      defV.textContent = s.def + ' %';

      msg.className = 'msg sev-' + s.sev;
      msgT.textContent = s.title;
      msgS.textContent = s.sub;

      keys.forEach(function (k, n) { k.classList.toggle('is-on', n === i); });
    }

    keys.forEach(function (k) {
      k.addEventListener('click', function () { set(Number(k.dataset.step)); });
    });

    set(0);
  })();

})();
