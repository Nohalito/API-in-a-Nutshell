/* ============================================================
   API in a Nutshell — the live call on slide 13

   The rest of the deck is CSS-only on purpose. A real request is
   the one thing CSS cannot do, so this file exists, and it is
   scoped to the .live blocks on that single slide. main.js never
   learns about it.

   Two rules it keeps:
   1. No credential is stored, defaulted, or logged. The key is
      read from its input at the moment of the call and nothing
      here writes it anywhere — not to storage, not to the URL
      readout (masked), not to the console.
   2. Nothing fires on load. Every request is a click.
   ============================================================ */

(function () {
  'use strict';

  var WEATHER = 'https://api.openweathermap.org/data/2.5/weather';
  var DUMMY = 'https://dummyjson.com';

  /* The token step 2 hands to step 3. Lives here, not in the DOM,
     so it is never in the page a projector is showing. */
  var accessToken = null;

  var roots = document.querySelectorAll('.live');
  if (!roots.length) return;

  /* ----------------------------------------------------------
     Small helpers
     ---------------------------------------------------------- */

  function out(root, name) {
    return root.querySelector('[data-out="' + name + '"]');
  }

  function val(root, name) {
    var node = root.querySelector('[name="' + name + '"]');
    return node ? node.value.trim() : '';
  }

  /* First four characters and nothing else. Enough for the presenter
     to confirm they pasted the right key, useless to the room. */
  function mask(secret) {
    if (!secret) return '';
    return secret.slice(0, 4) + '••••••••';
  }

  function setStatus(root, text, kind) {
    var node = out(root, 'status');
    node.textContent = text;
    node.className = 'live__status' + (kind ? ' live__status--' + kind : '');
  }

  function setBody(root, text) {
    out(root, 'body').textContent = text;
  }

  /* 2xx reads as the green status hue, 401/403 as the rose one — the
     same colours the status-code table and the legend already use. */
  function kindFor(status) {
    if (status >= 200 && status < 300) return 'ok';
    if (status === 401 || status === 403) return 'denied';
    return 'error';
  }

  function pretty(payload) {
    try {
      return JSON.stringify(payload, null, 2);
    } catch (err) {
      return String(payload);
    }
  }

  /* ----------------------------------------------------------
     One request, start to finish
     ---------------------------------------------------------- */

  function send(root, request) {
    setStatus(root, 'calling…', 'wait');
    setBody(root, '');

    return fetch(request.url, request.init)
      .then(function (response) {
        return response
          .json()
          .catch(function () {
            return '(the body was not JSON)';
          })
          .then(function (payload) {
            setStatus(
              root,
              response.status + ' ' + (response.statusText || ''),
              kindFor(response.status)
            );
            setBody(root, typeof payload === 'string' ? payload : pretty(payload));
            return payload;
          });
      })
      .catch(function (err) {
        /* A network-level failure has no status at all, which on a
           projector looks identical to a rejected call. Say which. */
        setStatus(root, 'no response', 'error');
        setBody(
          root,
          'The call never reached the API.\n' +
            err.message +
            '\n\nAlmost always one of three things:\n' +
            '  • the deck is open as a file:// page — serve it instead:\n' +
            '      python -m http.server  (then open http://localhost:8000/frontend/)\n' +
            '  • no network, or a corporate proxy in the way\n' +
            '  • the API refused this origin (CORS)'
        );
        return null;
      });
  }

  /* ----------------------------------------------------------
     Bookmark 1 — the key travels in the URL
     ---------------------------------------------------------- */

  function callWeather(root) {
    var city = val(root, 'city') || 'Delhi';
    var key = val(root, 'key');

    /* Built twice on purpose: the real one carries the key, the one
       on screen carries eight bullets. */
    out(root, 'url').textContent =
      WEATHER + '?q=' + city + '&appid=' + (key ? mask(key) : '');

    send(root, {
      url:
        WEATHER +
        '?q=' + encodeURIComponent(city) +
        '&appid=' + encodeURIComponent(key) +
        '&units=metric'
    });
  }

  /* ----------------------------------------------------------
     Bookmark 2 — the token is issued, then presented

     The plan's snippets pass credentials: 'include'. That is left
     out here and it has to be: dummyjson answers with
     Access-Control-Allow-Origin: *, and the fetch spec forbids a
     wildcard on a credentialed request, so the browser would reject
     every one of these before it left. The Authorization header is
     the point of the slide anyway.
     ---------------------------------------------------------- */

  function callMeAnon(root) {
    send(root, { url: DUMMY + '/auth/me' });
  }

  function login(root) {
    send(root, {
      url: DUMMY + '/auth/login',
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: val(root, 'username'),
          password: val(root, 'password'),
          expiresInMins: 30
        })
      }
    }).then(function (payload) {
      if (!payload || !payload.accessToken) return;

      accessToken = payload.accessToken;

      /* Show the header exactly as it will go out, truncated, plus
         what is inside it — which is the decoded payload from the
         previous slide, this time with real values. */
      out(root, 'token').textContent =
        'Authorization: Bearer ' + accessToken.slice(0, 32) + '…\n\n' + claims(accessToken);

      var step3 = root.querySelector('[data-action="me-auth"]');
      if (step3) step3.disabled = false;
    });
  }

  /* A JWT's middle chunk is base64url and not encrypted — anyone
     holding the token can read it, which is the part people find
     surprising. Wrapped in a try: a malformed token must not take
     the demo down mid-sentence. */
  function claims(token) {
    try {
      var chunk = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      var decoded = JSON.parse(atob(chunk));
      return 'payload, decoded with no secret at all:\n' + pretty(decoded);
    } catch (err) {
      return '(payload could not be decoded)';
    }
  }

  function callMeAuth(root) {
    if (!accessToken) return;
    send(root, {
      url: DUMMY + '/auth/me',
      init: { headers: { Authorization: 'Bearer ' + accessToken } }
    });
  }

  /* ----------------------------------------------------------
     Wiring. One listener per .live block, delegated, so the
     buttons stay plain markup.
     ---------------------------------------------------------- */

  var ACTIONS = {
    weather: callWeather,
    'me-anon': callMeAnon,
    login: login,
    'me-auth': callMeAuth
  };

  Array.prototype.forEach.call(roots, function (root) {
    root.addEventListener('click', function (event) {
      var button = event.target.closest('[data-action]');
      if (!button || button.disabled) return;

      var action = ACTIONS[button.getAttribute('data-action')];
      if (!action) return;

      /* Hand the keyboard straight back to the deck. main.js gives up
         Space and the arrows while focus sits inside .live, and a
         button keeps focus after a click — without this, Space would
         re-send the call instead of advancing the slide. */
      button.blur();

      action(root);
    });

    /* Enter in any of the text boxes sends that block's first
       enabled button — what anyone typing a city expects. */
    root.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      if (event.target.tagName !== 'INPUT') return;
      event.preventDefault();

      var button = event.target
        .closest('.live__form, .live__step-body')
        .querySelector('[data-action]');
      if (button && !button.disabled) button.click();
    });
  });
})();
