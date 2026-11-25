/* The Weight — two-question wizard.
   Privacy: selections live only in memory on this page. They are never
   written to the URL, cookies, localStorage, or sent over the network.
   Browser Back works through history.pushState with only a step number
   in the state object (no topic or need is stored). */
(function () {
  "use strict";
  var TW = window.TW, e = TW.esc;

  var topicList = document.getElementById("topic-cards");
  var needList = document.getElementById("need-cards");
  var resultBox = document.getElementById("result");
  var controls = document.getElementById("wizard-controls");
  var statusEl = document.getElementById("wizard-status");
  var crumb = document.getElementById("step-2-crumb");
  var steps = { 1: byId("step-1"), 2: byId("step-2"), 3: byId("step-3") };

  function byId(id) { return document.getElementById(id); }

  /* In-memory state only */
  var state = { step: 1, topic: null, need: null };
  var stack = []; // previous states, for Back

  function topicById(id) { for (var i = 0; i < TW.TOPICS.length; i++) if (TW.TOPICS[i].id === id) return TW.TOPICS[i]; }

  function card(id, label, hint, icon, kind) {
    return '<li><button type="button" class="choice" data-' + kind + '="' + e(id) + '">' +
      '<span class="choice__icon">' + TW.icon(icon) + "</span>" +
      '<span class="choice__text"><span class="choice__label">' + e(label) + "</span>" +
      '<span class="choice__hint">' + e(hint) + "</span></span>" +
      TW.icon("arrow", "choice__arrow") + "</button></li>";
  }

  topicList.innerHTML = TW.TOPICS.map(function (t) { return card(t.id, t.label, t.hint, t.icon, "topic"); }).join("");

  topicList.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-topic]");
    if (!b) return;
    var t = topicById(b.getAttribute("data-topic"));
    push();
    state.topic = t.id;
    state.need = null;
    state.step = t.direct ? 3 : 2;
    render(true);
  });

  needList.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-need]");
    if (!b) return;
    push();
    state.need = b.getAttribute("data-need");
    state.step = 3;
    render(true);
  });

  function push() {
    stack.push({ step: state.step, topic: state.topic, need: state.need });
    try { history.pushState({ twStep: stack.length }, ""); } catch (err) { /* file:// in some browsers */ }
  }

  function back() {
    var prev = stack.pop();
    if (!prev) return;
    state = prev;
    render(true);
  }

  byId("btn-back").addEventListener("click", function () {
    // Keep browser history in sync with our own Back button
    if (history.state && history.state.twStep) history.back();
    else back();
  });
  var ignorePop = false;
  window.addEventListener("popstate", function () {
    if (ignorePop) { ignorePop = false; return; }
    if (stack.length) back();
  });

  byId("btn-restart").addEventListener("click", function () {
    var n = stack.length;
    stack = [];
    state = { step: 1, topic: null, need: null };
    render(true);
    if (n && history.state && history.state.twStep) {
      ignorePop = true;
      history.go(-n);
    }
  });

  function render(moveFocus) {
    var s = state.step;
    Object.keys(steps).forEach(function (k) { steps[k].hidden = Number(k) !== s; });
    controls.hidden = s === 1;

    var t = state.topic ? topicById(state.topic) : null;
    var skipped = t && t.direct;

    document.querySelectorAll("[data-progress]").forEach(function (li) {
      var n = Number(li.getAttribute("data-progress"));
      li.classList.toggle("is-current", n === s);
      li.classList.toggle("is-done", n < s);
      li.classList.toggle("is-skipped", n === 2 && !!skipped && s === 3);
      if (n === s) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });

    var announce = "";
    if (s === 1) {
      announce = "Step 1 of 2: What’s weighing on you?";
    } else if (s === 2) {
      crumb.innerHTML = "You picked: <strong>" + e(t.label) + "</strong>";
      needList.innerHTML = t.needs.map(function (id) {
        var n = TW.NEEDS[id];
        return card(id, n.label, n.hint, n.icon, "need");
      }).join("");
      announce = "Step 2 of 2: What would help right now?";
    } else {
      var key = skipped ? t.direct : state.topic + ":" + state.need;
      resultBox.innerHTML = renderResult(TW.RESULTS[key], t);
      announce = "Your next step is ready.";
    }
    statusEl.textContent = announce;
    var pt = byId("progress-text");
    if (pt) pt.textContent = s === 3 ? "Your next step" : "Step " + s + " of 2";

    if (moveFocus) {
      var h = steps[s].querySelector("h2");
      if (h) {
        h.focus({ preventScroll: true });
        var top = byId("wizard").getBoundingClientRect().top + window.pageYOffset - 8;
        if (Math.abs(window.pageYOffset - top) > 40 || s !== 1) window.scrollTo(0, Math.max(0, top - stickyOffset()));
      }
    }
  }

  function stickyOffset() {
    var bar = document.querySelector(".help-bar");
    return bar && getComputedStyle(bar).position === "sticky" ? bar.offsetHeight : 0;
  }

  /* ── Result rendering ─────────────────────────────────────── */
  function actionData(a) {
    if (a.res) {
      var r = TW.RESOURCES[a.res];
      return { kind: "res", r: r, name: r.name, offers: r.offers, note: a.note };
    }
    var tool = TW.TOOLS[a.tool];
    return { kind: "tool", tool: tool, name: tool.name, offers: tool.offers, note: a.note };
  }

  function toolButton(tool, primary) {
    return '<a class="btn ' + (primary ? "btn--amber" : "btn--navy") + '" href="' + e(tool.href) + '">' +
      (tool.href === "unload.html" ? TW.icon("pen") + "Start writing" : TW.icon("chat") + "Write the message") + "</a>";
  }

  function renderResult(res, topic) {
    if (!res) {
      // Should never happen; QA script checks every combination.
      return '<h2 class="step__title" tabindex="-1">Your next step</h2><p>Call or text <a href="tel:988">988</a> to talk with someone now, or <a href="resources.html">see all resources</a>.</p>';
    }
    var p = actionData(res.primary);
    var html = "";
    html += '<p class="step__crumb">You picked: <strong>' + e(topic.label) + "</strong>" +
      (state.need ? " · <strong>" + e(TW.NEEDS[state.need].label) + "</strong>" : "") + "</p>";
    html += '<h2 class="step__title" tabindex="-1">Your next step: ' + e(res.title) + "</h2>";
    html += '<p class="result__lead">' + e(res.lead) + "</p>";

    // Primary action
    html += '<article class="primary" aria-labelledby="primary-name">';
    html += '<p class="primary__tag">Do this first</p>';
    html += '<h3 class="primary__name" id="primary-name">' + e(p.name) + "</h3>";
    html += '<p class="primary__offers">' + e(p.offers) + "</p>";
    html += '<div class="btn-row">' + (p.kind === "res" ? TW.resourceButtons(p.r, { primary: true }) : toolButton(p.tool, true)) + "</div>";
    if (p.kind === "res") html += TW.verifyLine(p.r);
    html += "</article>";

    // What happens next
    if (res.next && res.next.length) {
      html += '<div class="next"><h3 class="next__title">What happens next</h3><ol class="next__list">' +
        res.next.map(function (n) { return "<li>" + e(n) + "</li>"; }).join("") + "</ol></div>";
    }

    // Secondary (max 2)
    var sec = (res.secondary || []).slice(0, 2).map(actionData);
    if (sec.length) {
      html += '<h3 class="also__title">Or try one of these</h3><ul class="also" role="list">';
      sec.forEach(function (s) {
        html += '<li class="also__item"><h4 class="also__name">' + e(s.name) + "</h4>";
        if (s.note) html += '<p class="also__note">' + e(s.note) + "</p>";
        html += '<p class="also__offers">' + e(s.offers) + "</p>";
        html += '<div class="btn-row">' + (s.kind === "res" ? TW.resourceButtons(s.r) : toolButton(s.tool, false)) + "</div>";
        if (s.kind === "res") html += TW.verifyLine(s.r);
        html += "</li>";
      });
      html += "</ul>";
    }

    html += '<p class="result__fine">The Weight doesn’t run these services and isn’t a therapy provider or emergency service. If someone is in immediate danger, call <a href="tel:911">911</a>.</p>';
    return html;
  }

  render(false);
})();
