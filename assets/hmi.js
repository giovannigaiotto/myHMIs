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
     SCREEN 1 — Main operating screen
     ====================================================================== */
  (function mainScreen() {
    var scr = $('#scr-main');
    if (!scr) return;

    var elForce = $('#m-force'), elArc = $('#m-arc');
    var elBrake = $('#m-brake'), elBrakeV = $('#m-brake-v');
    var elOutr  = $('#m-outr'),  elOutrV  = $('#m-outr-v');
    var elSpeed = $('#m-speed'), elLen = $('#m-len');
    var elClock = $('#m-clock'), elBlink = $('#m-blink');
    var elSpark = $('#m-spark'), elPeak = $('#m-peak');

    var ARC_LEN = 308;          // path length of the 98 px semicircle
    var F_MAX = 30, F_LIMIT = 24;
    var SPARK_N = 60, SPARK_W = 240, SPARK_H = 44;

    var force = 18.4, brake = 142, outr = 610, speed = 2.6, len = 318, t = 0;

    // rope force over the last 60 samples
    function curve(n) {
      return Math.max(2, Math.min(F_MAX,
        18.4 + Math.sin(n / 7) * 4.6 + Math.sin(n / 2.3) * 1.4));
    }
    var hist = [];
    for (var i = -(SPARK_N - 1); i <= 0; i++) hist.push(curve(i));

    function drawSpark() {
      var pts = new Array(hist.length);
      for (var i = 0; i < hist.length; i++) {
        var x = (i / (SPARK_N - 1)) * SPARK_W;
        var y = SPARK_H * (1 - hist[i] / F_MAX);
        pts[i] = x.toFixed(1) + ',' + y.toFixed(1);
      }
      elSpark.setAttribute('points', pts.join(' '));
      elPeak.textContent = 'peak ' + Math.max.apply(null, hist).toFixed(1);
    }

    function paint() {
      elForce.textContent = force.toFixed(1);
      var warn = force >= F_LIMIT;
      elForce.classList.toggle('is-warn', warn);
      elArc.style.strokeDashoffset = (ARC_LEN * (1 - Math.min(force / F_MAX, 1))).toFixed(1);
      elArc.style.stroke = warn ? 'var(--warn)' : 'var(--safe)';

      elBrakeV.textContent = Math.round(brake);
      elBrake.style.height = Math.max(0, Math.min(100, brake / 200 * 100)) + '%';
      elBrake.classList.toggle('is-warn', brake > 156);

      elOutrV.textContent = Math.round(outr);
      elOutr.style.height = Math.max(0, Math.min(100, outr / 900 * 100)) + '%';

      elSpeed.innerHTML = speed.toFixed(1) + '<i>m/s</i>';
      elLen.innerHTML   = Math.round(len) + '<i>m</i>';

      drawSpark();
    }

    function tick() {
      t += 1;
      force = curve(t);
      hist.push(force);
      if (hist.length > SPARK_N) hist.shift();
      brake = 142 + Math.sin(t / 9 + 1.2) * 16;
      outr  = 610 + Math.sin(t / 13) * 44;
      speed = Math.max(0, 2.6 + Math.sin(t / 5.5) * 1.3);
      len   = 318 + Math.sin(t / 11) * 26;
      paint();

      var d = new Date();
      elClock.textContent =
        String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    // 1 s heartbeat — the machine's own blink period
    var blinkOn = false;
    function blink() {
      blinkOn = !blinkOn;
      elBlink.classList.toggle('is-on', blinkOn);
    }

    paint();
    var tId = null, bId = null;
    whenVisible(scr,
      function () {
        if (!tId && !REDUCED) { tick(); tId = setInterval(tick, 900); }
        if (!bId && !REDUCED) { bId = setInterval(blink, 1000); }
      },
      function () {
        clearInterval(tId); tId = null;
        clearInterval(bId); bId = null;
      });

    /* ---- drawer: slides over the page, auto-closes after 10 s idle ---- */
    var drawer = $('#m-drawer'), scrim = $('#m-scrim'), count = $('#m-count');
    var TIMEOUT = 10;
    var left = TIMEOUT, cId = null;

    function open() {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      scrim.classList.add('is-on');
      restart();
    }
    function close() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      scrim.classList.remove('is-on');
      clearInterval(cId); cId = null;
    }
    function restart() {
      left = TIMEOUT;
      count.textContent = 'closes in ' + left + ' s';
      clearInterval(cId);
      cId = setInterval(function () {
        left -= 1;
        count.textContent = left > 0 ? 'closes in ' + left + ' s' : 'closing';
        if (left <= 0) close();
      }, 1000);
    }

    $('#m-menu').addEventListener('click', function () {
      drawer.classList.contains('is-open') ? close() : open();
    });
    $('#m-close').addEventListener('click', close);
    scrim.addEventListener('click', close);
    // any interaction inside the drawer resets the timeout, as on the machine
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('.di')) restart();
    });
    drawer.addEventListener('pointermove', restart);
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
