/* ============================================================
   API in a Nutshell — the playground's two extra behaviours

   js/live.js already drives this page: the block in playground.html
   carries .rr--call, so it gets wired, read and sent by the same
   engine as slides 10, 16 and 17. Nothing below re-implements any of
   that, and nothing below runs on the deck — index.html does not load
   this file.

   Two things the deck never needed:

     1. A verb that changes under one panel. The deck switches between
        panels that each have their verb baked in; here the panel stays
        and data-method is rewritten, which is enough because live.js
        reads that attribute at send time rather than at wire time.

     2. A Tab key that indents. Inside a JSON body the browser default
        — move focus to the next control — is the wrong one, and it is
        the only thing standing between the box and being editable.
   ============================================================ */

(function () {
  'use strict';

  var root = document.querySelector('.rr--pg');
  if (!root) return;

  var panel = root.querySelector('[data-req]');
  var label = root.querySelector('[data-verb-label]');

  var INDENT = '  ';

  /* ----------------------------------------------------------
     1. The verb
     ---------------------------------------------------------- */

  /* live.js reads req.dataset.method inside fire(), every time, so
     rewriting the attribute is the whole of the change — there is no
     cached copy to keep in step. The purple box is rewritten with it
     because a field claiming GET above a POST is exactly the drift
     the deck's boxes are built to avoid.

     Note what is *not* here: the body is left alone. live.js already
     refuses to attach one to a GET, so switching verbs never costs
     you what you typed — swap back and the payload is still there. */
  root.addEventListener('change', function (event) {
    var verb = event.target.dataset.verb;
    if (!verb) return;
    panel.dataset.method = verb;
    label.textContent = verb;
  });

  /* ----------------------------------------------------------
     2. The Tab key
     ---------------------------------------------------------- */

  root.addEventListener('keydown', function (event) {
    var el = event.target;
    if (el.tagName !== 'TEXTAREA') return;

    /* Taking Tab away from a textarea takes away the only way out of
       it for anyone not using a mouse. Escape gives it back, which is
       the conventional trade and the reason the hint names all three
       keys rather than just the one that indents. */
    if (event.key === 'Escape') {
      el.blur();
      return;
    }

    if (event.key !== 'Tab') return;
    event.preventDefault();

    var start = el.selectionStart;

    if (event.shiftKey) {
      /* Outdent: eat up to one indent's worth of space immediately
         behind the caret, and only space — a Shift+Tab that could
         swallow a brace would be worse than no outdent at all. */
      var before = el.value.slice(0, start);
      var eaten = before.length - before.replace(/ {1,2}$/, '').length;
      if (eaten) el.setRangeText('', start - eaten, start, 'end');
      return;
    }

    /* setRangeText with 'end' replaces the selection and leaves the
       caret after what was inserted, which is where a typist's hand
       expects it. It also keeps the browser's own undo stack intact,
       where assigning to .value would flatten it. */
    el.setRangeText(INDENT, start, el.selectionEnd, 'end');
  });
})();
