/* ============================================================
   API in a Nutshell — deck controller

   Responsibilities:
   1. Build the sidebar table of contents from the slides in the DOM,
      so the deck markup stays the single source of truth.
   2. Keyboard-only navigation. No click handlers anywhere — by design.
   3. Keep the progress bar and the URL hash in sync.
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'nutshell.sidebar.collapsed';

  var deck = document.getElementById('deck');
  var nav = document.getElementById('sidebar-nav');
  var fill = document.getElementById('hud-fill');

  var slides = Array.prototype.slice.call(deck.querySelectorAll('.slide'));
  if (!slides.length) return;

  var index = 0;

  /* ----------------------------------------------------------
     Sidebar: one "Overview" entry for the cover + TOC slides,
     then one entry per [data-section] slide.
     ---------------------------------------------------------- */

  var entries = [];

  function addEntry(key, num, label, time, family) {
    var el = document.createElement('div');
    el.className = 'toc-link';
    el.setAttribute('data-family', family);
    el.setAttribute('title', label + (time ? ' — ' + time : ''));

    var numEl = document.createElement('span');
    numEl.className = 'toc-link__num';
    numEl.textContent = num;

    var textEl = document.createElement('span');
    textEl.className = 'toc-link__text';

    var labelEl = document.createElement('span');
    labelEl.className = 'toc-link__label';
    labelEl.textContent = label;
    textEl.appendChild(labelEl);

    if (time) {
      var timeEl = document.createElement('span');
      timeEl.className = 'toc-link__time';
      timeEl.textContent = time;
      textEl.appendChild(timeEl);
    }

    el.appendChild(numEl);
    el.appendChild(textEl);
    nav.appendChild(el);

    entries.push({ key: key, el: el });
  }

  function buildSidebar() {
    var hasOverview = slides.some(function (s) {
      return s.dataset.navGroup === 'overview';
    });

    if (hasOverview) {
      addEntry('overview', '—', 'Overview', 'intro + contents', 'foundations');
    }

    slides.forEach(function (slide) {
      if (!slide.dataset.section) return;
      addEntry(
        'section:' + slide.dataset.section,
        slide.dataset.section,
        slide.dataset.title || 'Untitled',
        slide.dataset.duration || '',
        slide.dataset.family || 'foundations'
      );
    });
  }

  /* ----------------------------------------------------------
     Rendering
     ---------------------------------------------------------- */

  function keyFor(slide) {
    if (slide.dataset.section) return 'section:' + slide.dataset.section;
    return slide.dataset.navGroup || '';
  }

  function render() {
    var slide = slides[index];

    slides.forEach(function (s, i) {
      var active = i === index;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    /* Expose the active slide's family to the chrome, so the sidebar
       highlight and the progress bar pick up the same hue. */
    document.body.setAttribute('data-family', slide.dataset.family || 'foundations');

    var activeKey = keyFor(slide);
    entries.forEach(function (entry) {
      var on = entry.key === activeKey;
      entry.el.classList.toggle('is-active', on);
      if (on) {
        entry.el.setAttribute('aria-current', 'true');
      } else {
        entry.el.removeAttribute('aria-current');
      }
    });

    fill.style.width = ((index + 1) / slides.length) * 100 + '%';

    /* Reset scroll for slides taller than the viewport. */
    slide.scrollTop = 0;

    var hash = '#' + (index + 1);
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', hash);
    }
  }

  function goTo(next) {
    var clamped = Math.max(0, Math.min(slides.length - 1, next));
    if (clamped === index) return;
    index = clamped;
    render();
  }

  /* ----------------------------------------------------------
     Sidebar collapse
     ---------------------------------------------------------- */

  function setCollapsed(collapsed) {
    document.body.classList.toggle('is-collapsed', collapsed);
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch (err) {
      /* private mode, blocked site data — the deck works without it */
    }
  }

  function restoreCollapsed() {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === '1') {
        document.body.classList.add('is-collapsed');
      }
    } catch (err) {
      /* ignore */
    }
  }

  /* ----------------------------------------------------------
     Fullscreen
     ---------------------------------------------------------- */

  function toggleFullscreen() {
    var root = document.documentElement;
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else if (root.requestFullscreen) {
      root.requestFullscreen().catch(function () {
        /* denied or unsupported — nothing to recover */
      });
    }
  }

  /* ----------------------------------------------------------
     Keyboard. The only input surface for this deck.
     ---------------------------------------------------------- */

  var NEXT = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Spacebar', 'Enter'];
  var PREV = ['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'];

  document.addEventListener('keydown', function (event) {
    /* Leave browser and OS shortcuts alone. */
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    var key = event.key;

    if (NEXT.indexOf(key) !== -1) {
      event.preventDefault();
      goTo(index + 1);
      return;
    }

    if (PREV.indexOf(key) !== -1) {
      event.preventDefault();
      goTo(index - 1);
      return;
    }

    if (key === 'Home') {
      event.preventDefault();
      goTo(0);
      return;
    }

    if (key === 'End') {
      event.preventDefault();
      goTo(slides.length - 1);
      return;
    }

    if (key === 's' || key === 'S') {
      event.preventDefault();
      setCollapsed(!document.body.classList.contains('is-collapsed'));
      return;
    }

    if (key === 'f' || key === 'F') {
      event.preventDefault();
      toggleFullscreen();
    }
  });

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */

  function indexFromHash() {
    var raw = parseInt(window.location.hash.replace('#', ''), 10);
    if (isNaN(raw)) return 0;
    return Math.max(0, Math.min(slides.length - 1, raw - 1));
  }

  window.addEventListener('hashchange', function () {
    goTo(indexFromHash());
  });

  buildSidebar();
  restoreCollapsed();
  index = indexFromHash();
  deck.classList.add('is-ready');
  render();
})();
