/* ============================================================
   API in a Nutshell — the playground's two extra behaviours

   js/live.js already drives this page: the block in playground.html
   carries .rr--call, so it gets wired, read and sent by the same
   engine as slides 10, 16 and 17. Nothing below re-implements any of
   that, and nothing below runs on the deck — index.html does not load
   this file.

   Four things the deck never needed:

     1. A verb chosen inside the panel. The deck switches between panels
        that each have their verb baked in; here the panel stays and the
        method box is a select whose value is copied onto data-method,
        which is enough because live.js reads that attribute at send
        time rather than at wire time.

     2. Headers you assemble rather than read. Same trick, one level up:
        live.js parses the header block off the screen at send time, so
        a checklist that writes that block is a checklist that changes
        the request, and live.js is never told the checklist is there.

     3. A Tab key that indents. Inside a JSON body the browser default
        — move focus to the next control — is the wrong one, and it is
        the only thing standing between the box and being editable.

     4. A cheat sheet that writes into the request rather than being
        read out of. The deck does not need one because the presenter is
        one; a link someone opens on their own has to carry the
        credentials with it, and a credential you have to retype from a
        panel is a typo waiting to be debugged as a 401.

   Plus one thing the deck needed and main.js does for it: stamping the
   year into the byline. Two lines, and cheaper than loading a deck
   controller onto a page that has no deck to control.
   ============================================================ */

(function () {
  'use strict';

  /* The footer byline, same as main.js stamps for the deck's sidebar. It
     lives outside .rr--pg and above the early return on purpose: the year
     should still be right on a page whose request block failed to render.
     Stamped rather than typed so it is never a year out of date. */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  var root = document.querySelector('.rr--pg');
  if (!root) return;

  var panel = root.querySelector('[data-req]');
  var verb = root.querySelector('.pg__verb');
  var hdr = root.querySelector('.pg-hdr');
  var wire = root.querySelector('.pg-hdr__wire');
  var endpoint = root.querySelector('[name="pg-endpoint"]');

  /* Both outside .rr--pg: the button sits in the page's top bar and the
     dialog is a child of <body>, deliberately clear of the .rr--call
     block so live.js does not adopt it. */
  var tips = document.getElementById('tips');
  var tipsBtn = document.querySelector('[data-action="tips-open"]');

  var INDENT = '  ';
  var V1 = '/api/v1';

  /* ----------------------------------------------------------
     1. The verb
     ---------------------------------------------------------- */

  /* live.js reads req.dataset.method inside fire(), every time, so
     copying the select's value onto the attribute is the whole of the
     change — there is no cached copy to keep in step, and nothing to
     rewrite on screen either, because the select is the display.

     Note what is *not* here: the body is left alone. live.js already
     refuses to attach one to a GET, so switching verbs never costs
     you what you typed — swap back and the payload is still there. */
  if (verb) {
    verb.addEventListener('change', function () {
      panel.dataset.method = verb.value;
    });

    /* Once on load as well as on change. A browser restores a select's
       value across a reload, so the box can come back saying POST while
       the attribute in the markup still says GET — and the mismatch is
       silent until someone sends and gets a 405. */
    panel.dataset.method = verb.value;
  }

  /* ----------------------------------------------------------
     2. The headers
     ---------------------------------------------------------- */

  /* Basic takes user:pass and encodes it here rather than asking anyone
     to do base64 by hand — and the preview showing the result is half
     the reason to do it at all. Typing a password and watching it turn
     into dmlld2VyOnZpZXdlcnBhc3M= makes the point no slide quite can:
     base64 is an encoding, not a secret, and anyone holding the line can
     turn it back.

     A value with no colon in it is taken to be already encoded, which is
     safe because ':' is not in the base64 alphabet — so pasting a ready
     credential works and typing a raw one works, without a mode switch
     to get wrong. */
  function basic(value) {
    if (value.indexOf(':') < 0) return value;
    try {
      return btoa(value);
    } catch (err) {
      /* btoa speaks Latin-1 only, and a password with an é in it is a
         real thing. Sending it raw fails at the server, which is a far
         better outcome than throwing here and taking the preview — and
         with it every other header — down with it. */
      return value;
    }
  }

  /* The <pre> is the request: live.js parses it line by line on the
     colon at send time, so writing it is the whole of wiring the
     checklist up. Nothing else needs to know the boxes exist.

     Which also means the rule for what to show is simply the rule for
     what to send. A row that is unticked, or ticked with nothing in it,
     contributes no line and says so — dimmed for the first, dashed for
     the second. A box that listed a header the call is not carrying
     would be the one lie this page cannot afford. */
  function serialize() {
    var lines = [];

    Array.prototype.forEach.call(hdr.querySelectorAll('.pg-hdr__row'), function (row) {
      var on = row.querySelector('.pg-hdr__on');
      var box = row.querySelector('.pg-hdr__val');
      var value = box.value.trim();

      row.classList.toggle('is-off', !on.checked);
      row.classList.toggle('is-empty', on.checked && !value);
      if (!on.checked || !value) return;

      /* Tolerant of a token pasted with its scheme still attached —
         copying "Bearer ey…" out of a curl line is the obvious mistake
         and doubling the word is a 401 nobody can read. */
      if (on.dataset.scheme === 'Basic') value = 'Basic ' + basic(value);
      if (on.dataset.scheme === 'Bearer') value = 'Bearer ' + value.replace(/^Bearer\s+/i, '');

      lines.push(on.dataset.name + ': ' + value);
    });

    /* No colon in it, so live.js reads it as no header at all — the
       placeholder and the parse agree without either knowing it. */
    wire.textContent = lines.join('\n') || '(no headers)';
  }

  if (hdr && wire) {
    hdr.addEventListener('change', function (event) {
      var on = event.target.closest('.pg-hdr__on');

      /* Basic and Bearer are one header name, so only one of them can be
         a line. Unticking the other on the way in beats refusing the
         click: the swap is the gesture people actually want after
         /auth/login hands them a token. */
      if (on && on.checked && on.dataset.excl) {
        Array.prototype.forEach.call(
          hdr.querySelectorAll('.pg-hdr__on[data-excl="' + on.dataset.excl + '"]'),
          function (other) { if (other !== on) other.checked = false; }
        );
      }

      serialize();
    });

    hdr.addEventListener('input', serialize);

    /* Once on load, for the same reason the verb is stamped on load: a
       browser restores checkbox state across a reload, and the markup's
       fallback two lines would otherwise disagree with the ticks. */
    serialize();
  }

  /* ----------------------------------------------------------
     3. The Tab key
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

  /* ----------------------------------------------------------
     4. The cheat sheet
     ---------------------------------------------------------- */

  /* Arm one header row: tick it, fill it, redraw.
     The event is dispatched rather than the work being done inline,
     because the change handler in section 2 already owns two things
     this must not duplicate — the mutual exclusion between Basic and
     Bearer, and the redraw of the preview. Duplicating either is how
     the button and the checkbox fall out of step. */
  function arm(id, value) {
    var on = document.getElementById(id);
    if (!on) return;

    var row = on.closest('.pg-hdr__row');
    var box = row && row.querySelector('.pg-hdr__val');

    on.checked = true;
    if (box) box.value = value;

    on.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /* Point the request at an endpoint, keeping whatever host is in the
     box. A presenter running the backend on their laptop clicks
     POST /echo and stays on localhost; swapping the whole URL would
     send them to Render mid-demo, and the first call there takes a
     minute because the free tier was asleep. */
  function setCall(method, path) {
    if (endpoint) {
      var url = endpoint.value.trim();
      var at = url.indexOf(V1);
      var base = at > -1 ? url.slice(0, at + V1.length) : url.replace(/\/+$/, '') + V1;
      endpoint.value = base + path;
    }

    if (verb) {
      verb.value = method;
      panel.dataset.method = method;
    }
  }

  /* live.js has this, and it is not reachable from here: its spoiler()
     runs once per .rr--call block and looks only inside one, while this
     dialog sits outside every such block on purpose. Twenty lines
     repeated is the price of the panel not being wired by the deck's
     engine, and it is the right way round — the alternative is putting
     a dialog inside a request block so a shared file will notice it. */
  function wireSpoiler() {
    var box = tips.querySelector('.spoiler');
    if (!box) return;

    var value = box.querySelector('[data-spoiler-value]');
    var reveal = box.querySelector('[data-action="reveal"]');
    var copy = box.querySelector('[data-action="copy"]');
    var restore = null;

    function say(text) {
      window.clearTimeout(restore);
      copy.textContent = text;
      restore = window.setTimeout(function () { copy.textContent = 'Copy'; }, 1400);
    }

    function show(on) {
      box.classList.toggle('is-revealed', on);
      reveal.textContent = on ? 'Hide' : 'Reveal';
      reveal.setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    reveal.addEventListener('click', function () {
      show(!box.classList.contains('is-revealed'));
      reveal.blur();
    });

    copy.addEventListener('click', function () {
      copy.blur();

      /* No clipboard, or it refused. navigator.clipboard needs a secure
         context, which https and localhost are and a laptop served off
         its own IP to the room is not — so this path is the common one
         at demo time, not the exotic one. Uncovering the key and
         putting the selection on it turns the failure into one
         keystroke instead of dragging a cursor across a blur. */
      function byHand() {
        show(true);

        var range = document.createRange();
        range.selectNodeContents(value);

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        say('Ctrl+C');
      }

      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        byHand();
        return;
      }

      navigator.clipboard.writeText(value.textContent.trim()).then(
        function () { say('Copied'); },
        byHand
      );
    });
  }

  if (tips && tipsBtn) {
    tipsBtn.addEventListener('click', function () {
      if (tips.showModal) tips.showModal();
      else tips.setAttribute('open', '');
    });

    function closeTips() {
      if (tips.close) tips.close();
      else tips.removeAttribute('open');
    }

    /* One listener for the whole panel. Every button in it either fills
       something in and closes, or just closes, so the shared tail is
       most of the handler. */
    tips.addEventListener('click', function (event) {
      /* The dialog element itself is only the click target when the
         click landed on the backdrop: the head and the body cover it
         completely, which is why all the padding is on those two and
         none of it is on the dialog. */
      if (event.target === tips) {
        closeTips();
        return;
      }

      var el = event.target.closest(
        '[data-action="tips-close"], [data-fill-basic], [data-fill-key], [data-path]'
      );
      if (!el) return;

      if (el.dataset.fillBasic) arm('h-basic', el.dataset.fillBasic);
      else if (el.dataset.fillKey) arm('h-key', el.dataset.fillKey);
      else if (el.dataset.path) setCall(el.dataset.verb, el.dataset.path);

      /* Closed either way, including after a fill. The point of the
         panel is the request behind it, and a cheat sheet still sitting
         over the boxes it just changed is hiding its own result. */
      closeTips();
    });

    wireSpoiler();
  }
})();
