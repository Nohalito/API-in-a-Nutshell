/* ============================================================
   API in a Nutshell — deck controller

   Responsibilities:
   1. Build the sidebar table of contents from the slides in the DOM,
      so the deck markup stays the single source of truth.
   2. Navigation, including build steps within a slide. The keyboard
      drives the deck; the sidebar is the one thing here you can click,
      and it only jumps between sections. The other click handlers in
      the deck belong to js/live.js, on the slides that call the network.
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
  var step = 0;

  /* ----------------------------------------------------------
     Sidebar: one "Overview" entry for the slides before the deck
     reaches its first axis, then one entry per [data-section] slide
     — the five axis slides, each of which opens a section.

     A slide belongs to the axis it follows, so only those five carry
     data-section and every content slide behind one lights it up.
     That is why the key is worked out here, in source order, rather
     than read off the slide: the content slides say nothing about
     which section they are in, and nothing in the markup should have
     to repeat what their position already states.
     ---------------------------------------------------------- */

  var entries = [];
  var keys = [];   /* parallel to slides: the entry each one lights */

  function addEntry(key, target, num, label, time, family) {
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'toc-link';
    el.dataset.target = target;
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

    var key = '';

    if (hasOverview) {
      key = 'overview';
      addEntry(key, 0, '—', 'Overview', 'intro + contents', 'foundations');
    }

    slides.forEach(function (slide, i) {
      if (slide.dataset.section) {
        key = 'section:' + slide.dataset.section;
        addEntry(
          key,
          i,
          slide.dataset.section,
          slide.dataset.title || 'Untitled',
          slide.dataset.duration || '',
          slide.dataset.family || 'foundations'
        );
      }
      keys[i] = key;
    });
  }

  /* ----------------------------------------------------------
     Rendering
     ---------------------------------------------------------- */

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

    var activeKey = keys[index];
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

  /* ----------------------------------------------------------
     Build steps — a slide that reveals itself in stages.

     data-steps="n" on the section declares how many times the deck
     pauses on it before moving on; the controller mirrors how far it
     has got in data-step on the same element, and the stylesheet does
     the rest. Nothing here knows what a step shows.

     The count is not in the URL: the hash addresses slides, and a
     reload should land on the whole slide rather than half of one.
     ---------------------------------------------------------- */

  function stepsOn(slide) {
    return parseInt(slide.dataset.steps, 10) || 0;
  }

  function setStep(value) {
    var slide = slides[index];
    step = Math.max(0, Math.min(stepsOn(slide), value));
    if (step) {
      slide.dataset.step = step;
    } else {
      slide.removeAttribute('data-step');
    }
  }

  function goTo(next) {
    var clamped = Math.max(0, Math.min(slides.length - 1, next));
    if (clamped === index) return;
    /* Arriving backwards lands on the slide as it was left — fully
       built. Arriving forwards starts it from the beginning. */
    var backwards = clamped < index;
    index = clamped;
    setStep(backwards ? stepsOn(slides[index]) : 0);
    render();
  }

  /* ----------------------------------------------------------
     Sidebar: jumping to a section, and collapsing the whole thing

     An entry lands on the axis slide that opens its section, never
     mid-section: the sidebar is a map of the talk, not a slide picker.
     Delegated to the nav so it survives however many entries the
     markup ends up declaring.
     ---------------------------------------------------------- */

  nav.addEventListener('click', function (event) {
    var link = event.target.closest('.toc-link');
    if (!link) return;
    /* Hand the keyboard straight back to the deck: a button keeps focus
       after a click, and Space would re-trigger the jump instead of
       advancing the slide. */
    link.blur();
    goTo(parseInt(link.dataset.target, 10));
  });

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

    /* Slides 10, 16 and 17 have real text boxes, and Space, Enter and
       the arrows belong to whoever is typing in one — not to the deck.

       Scoped by class rather than by ancestor, and that matters: every
       other interactive part of the deck is a hidden radio or checkbox,
       including those slides' own method and step switches. Clicking one
       of their labels leaves focus on the input, so exempting the whole
       block would quietly hand the arrow keys to the switch instead of
       advancing the slide. */
    if (event.target.matches && event.target.matches('.call__input')) return;

    var key = event.key;

    /* A sidebar entry reached by Tab keeps Enter and Space for itself —
       that is how a button is pressed without a mouse. The arrows are
       left to the deck, so tabbing into the sidebar strands nobody. */
    if (event.target.closest && event.target.closest('.toc-link') &&
        (key === 'Enter' || key === ' ' || key === 'Spacebar')) return;

    /* A slide with steps left to build spends one before the deck
       moves on, and winds one back before it goes back. */
    if (NEXT.indexOf(key) !== -1) {
      event.preventDefault();
      if (step < stepsOn(slides[index])) {
        setStep(step + 1);
        return;
      }
      goTo(index + 1);
      return;
    }

    if (PREV.indexOf(key) !== -1) {
      event.preventDefault();
      if (step > 0) {
        setStep(step - 1);
        return;
      }
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
  setStep(0);
  deck.classList.add('is-ready');
  render();
})();
