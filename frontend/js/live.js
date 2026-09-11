/* ============================================================
   API in a Nutshell — the three slides that touch the network

   The rest of the deck is CSS-only on purpose. A real request is
   the one thing CSS cannot do, so this file exists, and it is
   scoped to one block and no others: .rr--call, which slides 10,
   16 and 17 all carry. main.js never learns about any of them.

   One engine drives all three, because all three are the same
   picture: a request panel on the left, its answer on the right.
   What differs is how many pairs a slide has and what credential
   it carries, and both of those are declared in the markup:

     data-req="k"          a request panel, paired with data-res="k"
     data-res="k"          where its answer goes (unkeyed: the only one)
     data-method="GET"     the verb this panel sends
     data-role="body"      the textarea holding the payload
     data-encode           a slot in the URL, encoded on the way out
     data-capture="token"  read accessToken out of the answer
     data-auth="bearer"    present the captured token
     data-requires="token" Send stays dead until there is one

   Nothing here builds a request from constants. The URL is read
   back off the blue box part by part and the headers off the green
   one, so what the room is looking at is what goes out — there is
   no second copy to drift from the slide.

   Two rules it keeps:
   1. No credential is stored, defaulted, or logged. The API key is
      typed into a password box at demo time and read at the moment
      of the call; the token lives in a closure below and reaches
      neither storage, nor the page, nor the console. What the page
      shows of either is truncated or masked.
   2. Nothing fires on load. Every request is a click.
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Small helpers
     ---------------------------------------------------------- */

  function out(scope, name) {
    return scope.querySelector('[data-out="' + name + '"]');
  }

  function pretty(payload) {
    try {
      return JSON.stringify(payload, null, 2);
    } catch (err) {
      return String(payload);
    }
  }

  /* The URL, read back off the screen in the order the blue box prints
     it: static text as authored, each slot's value percent-encoded so a
     city with a space in it still makes a URL. This is what lets slide
     16 fix every part of an endpoint but two and still send a real one. */
  function urlOf(req) {
    var parts = [];
    walk(req.querySelector('.field--endpoint'), parts);
    return parts.join('');
  }

  function walk(node, parts) {
    Array.prototype.forEach.call(node.childNodes, function (child) {
      if (child.nodeType === 3) {
        /* Trimmed, so the indentation of the markup never lands in a URL.
           No part of a URL has meaningful leading space. */
        parts.push(child.textContent.trim());
      } else if (child.tagName === 'INPUT') {
        var raw = child.value.trim();
        parts.push('encode' in child.dataset ? encodeURIComponent(raw) : raw);
      } else {
        walk(child, parts);
      }
    });
  }

  /* Same idea for the headers: whatever the green box lists is what goes
     out. A box listing a header the request is not sending is the one
     kind of lie a live slide cannot afford. */
  function headersOf(req) {
    var box = req.querySelector('.field--headers .field__value');
    var sent = {};
    if (!box) return sent;
    box.textContent.split('\n').forEach(function (line) {
      var at = line.indexOf(':');
      if (at > 0) sent[line.slice(0, at).trim()] = line.slice(at + 1).trim();
    });
    return sent;
  }

  /* Written here rather than read back off the response. Content-Type is
     fixed because the box is describing the JSON it is showing; the two
     that change are the clock and the timing. The rest of a real header
     set is not the lesson. */
  function headersFor(ms) {
    return (
      'Content-Type: application/json\n' +
      'Date: ' + new Date().toUTCString() + '\n' +
      'X-Response-Time: ' + ms + 'ms'
    );
  }

  /* A JWT's middle chunk is base64url and not encrypted — anyone holding
     the token can read it, which is the part people find surprising.
     Wrapped in a try: a malformed token must not take the demo down
     mid-sentence. */
  function claims(token) {
    try {
      var chunk = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return pretty(JSON.parse(atob(chunk)));
    } catch (err) {
      return '(the payload could not be decoded)';
    }
  }

  /* ----------------------------------------------------------
     One block: its panels, its button, its own token
     ---------------------------------------------------------- */

  function wire(root) {
    var button = root.querySelector('[data-action="send"]');
    var reqs = root.querySelectorAll('[data-req]');

    /* Slide 10 puts two requests against one answer box; slides 16 and 17
       pair theirs off one to one. Only the shared case needs clearing
       when the switch moves — see the change listener. */
    var shared = reqs.length > 1 && root.querySelectorAll('[data-res]').length === 1;

    /* Never in the DOM, never in storage. A projector is showing this
       page and the next thing anyone does with a slide is screenshot it. */
    var token = null;

    /* The switch decides which panel is on screen, so it decides which
       one is read. With no switch there is only ever one. */
    function active() {
      var radio = root.querySelector('.rr__radio:checked');
      return radio ? root.querySelector('[data-req="' + radio.value + '"]') : reqs[0];
    }

    function answerFor(req) {
      return (
        root.querySelector('[data-res="' + req.dataset.req + '"]') ||
        root.querySelector('[data-res]')
      );
    }

    function show(res, status, head, body, bad) {
      out(res, 'status').textContent = status;
      out(res, 'headers').textContent = head;
      out(res, 'body').textContent = body;
      /* A 404 left in the 200-green would undo the status-code table the
         deck taught a few slides earlier. */
      out(res, 'status').closest('.field').classList.toggle('is-bad', !!bad);
    }

    /* Slide 17's third call stays dead until the second has issued a
       token — the order is the lesson, so the button enforces it. */
    function gate() {
      button.disabled = active().dataset.requires === 'token' && !token;
    }

    /* Truncated in the header box, because the full token is a credential
       and this is a projector; decoded in full underneath, because that
       it can be decoded by anyone at all is the point being made. */
    function keep(issued) {
      token = issued;

      var line = root.querySelector('[data-token]');
      if (line) {
        line.textContent = line.textContent.replace(
          /^Authorization:.*$/m,
          'Authorization: Bearer ' + issued.slice(0, 24) + '…'
        );
      }

      var decoded = root.querySelector('[data-claims]');
      if (decoded) decoded.textContent = claims(issued);
    }

    function fire() {
      var req = active();
      var res = answerFor(req);
      var url = urlOf(req);

      if (!url) {
        show(res, '— no endpoint —', 'Content-Type: application/json',
          'Type a URL into the blue box first.', true);
        return;
      }

      var headers = headersOf(req);
      if (req.dataset.auth === 'bearer') {
        if (!token) return;
        /* The box shows a truncated copy; the call carries the whole one. */
        headers.Authorization = 'Bearer ' + token;
      }

      var init = { method: req.dataset.method || 'GET', headers: headers };
      var payload = req.querySelector('[data-role="body"]');
      if (payload && init.method !== 'GET') init.body = payload.value;

      button.disabled = true;
      show(res, 'calling…', 'Content-Type: application/json', '');

      /* Wall clock from just before the fetch to the moment the body has
         finished arriving — the delay the room actually sits through,
         rather than the one a network tab would report. */
      var started = Date.now();

      fetch(url, init)
        .then(function (response) {
          return response.text().then(function (text) {
            var data = null;
            var body;
            try {
              data = JSON.parse(text);
              body = pretty(data);
            } catch (err) {
              /* Not every endpoint answers JSON, and an HTML error page is
                 worth showing as itself rather than as a parse failure. */
              body = text || '(the body was empty)';
            }

            show(
              res,
              'HTTP/1.1 ' + response.status + ' ' + (response.statusText || ''),
              headersFor(Date.now() - started),
              body,
              !(response.status >= 200 && response.status < 300)
            );

            if (req.dataset.capture === 'token' && data && data.accessToken) {
              keep(data.accessToken);
            }
          });
        })
        .catch(function (err) {
          /* A network-level failure has no status at all, which on a
             projector looks identical to a refusal. Say which. */
          show(res, '— no response —', headersFor(Date.now() - started),
            'The call never reached the API.\n' +
              err.message +
              '\n\nAlmost always one of three things:\n' +
              '  • the deck is open as a file:// page — serve it instead:\n' +
              '      python -m http.server  (then open http://localhost:8000/frontend/)\n' +
              '  • no network, or a corporate proxy in the way\n' +
              '  • the API does not allow this origin (CORS). A POST carrying\n' +
              '    Content-Type: application/json is preflighted, so the server\n' +
              '    has to answer an OPTIONS call before the POST is even sent.',
            true);
        })
        .then(gate);
    }

    root.addEventListener('click', function (event) {
      if (!event.target.closest('[data-action="send"]') || button.disabled) return;
      /* Hand the keyboard straight back to the deck: a button keeps focus
         after a click, and Space would re-send the call instead of
         advancing the slide. */
      event.target.blur();
      fire();
    });

    root.addEventListener('keydown', function (event) {
      /* Enter sends from any single-line box. Inside a body it stays a
         newline, which is what anyone editing JSON expects. */
      if (event.key !== 'Enter' || event.target.tagName !== 'INPUT') return;
      event.preventDefault();
      if (!button.disabled) fire();
    });

    root.addEventListener('change', function (event) {
      if (event.target.type !== 'radio') return;
      gate();
      /* One answer box between two requests leaves the other method's
         response on screen, where it reads as this one's. Slide 17 keeps
         a box per step on purpose — the first call's 401 still being
         there when you come back from the third is the comparison. */
      if (shared) {
        show(answerFor(active()), '— nothing called yet —',
          'Content-Type: application/json',
          'Press Send. Whatever the endpoint on the left answers lands here — status, headers and payload.');
      }
    });

    gate();
  }

  /* No early return on an empty list: the three slides are independent,
     and one of them missing must not take the others down with it. A
     forEach over nothing is a no-op anyway. */
  Array.prototype.forEach.call(document.querySelectorAll('.rr--call'), wire);
})();
