/* ==========================================================================
   Giovanni Gaiotto — portfolio
   Theme, reveal on scroll, back to top. No dependencies.
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

  /* ------------------------------------------------------------ year stamp */
  var yr = $('#yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ----------------------------------------------- scroll: nav rule + arrow
     One scroll listener for both: the hairline under the sticky header, and
     the arrow back to the top, which only exists once there is a top to go
     back to.                                                              */
  (function onScroll() {
    var nav   = $('.nav');
    var totop = $('#totop');

    if (totop) {
      totop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
      });
    }

    var read = function () {
      var y = window.scrollY;
      if (nav) nav.classList.toggle('is-stuck', y > 8);
      if (totop) {
        var on = y > window.innerHeight * 0.6;
        totop.classList.toggle('is-on', on);
        // invisible to the pointer and to a screen reader while it is away
        if (on) {
          totop.removeAttribute('aria-hidden');
          totop.removeAttribute('tabindex');
        } else {
          totop.setAttribute('aria-hidden', 'true');
          totop.setAttribute('tabindex', '-1');
        }
      }
    };

    var ticking = false;
    read();
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { read(); ticking = false; });
    }, { passive: true });
  })();

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

  /* ------------------------------------------------------- missing photos
     A photo that is not in the repository yet leaves a quiet placeholder
     instead of a broken-image icon.                                       */
  $$('.shot').forEach(function (img) {
    var fail = function () {
      var bezel = img.parentNode;
      if (bezel) bezel.classList.add('is-missing');
      img.hidden = true;
    };
    img.addEventListener('error', fail);
    // the script is deferred, so a photo may have failed before we got here
    if (img.complete && img.naturalWidth === 0) fail();
  });

})();
