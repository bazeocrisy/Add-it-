/* Talk It Through: builds a message the visitor sends themselves.
   Wording of the asks is taken from theweightmen.com/talk.html. */
(function () {
  "use strict";
  var ASKS = {
    listen: "I don’t need advice right now. I just need someone to listen for a bit.",
    perspective: "I’ve been going back and forth on something and could use another way of looking at it.",
    feedback: "I’d like your honest feedback. You can be straight with me.",
    steps: "I could use help figuring out a next step or two.",
  };
  var form = document.getElementById("msg-form");
  var who = document.getElementById("msg-who");
  var note = document.getElementById("msg-note");
  var preview = document.getElementById("msg-preview");
  var status = document.getElementById("msg-status");
  var sms = document.getElementById("msg-sms");
  var share = document.getElementById("msg-share");

  function build() {
    var checked = form.querySelector("input[name=ask]:checked");
    var name = who.value.trim();
    return [(name ? "Hey " + name : "Hey") + ", do you have some time to talk soon?",
      checked ? ASKS[checked.value] : "", note.value.trim()].filter(Boolean).join(" ");
  }
  function update() {
    var t = build();
    preview.textContent = t;
    sms.href = "sms:?&body=" + encodeURIComponent(t);
    status.textContent = "";
  }
  form.addEventListener("input", update);
  form.addEventListener("change", update);

  document.getElementById("msg-copy").addEventListener("click", function () {
    var t = build();
    function fallback() {
      var r = document.createRange(); r.selectNodeContents(preview);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      var ok = false; try { ok = document.execCommand("copy"); } catch (err) {}
      status.textContent = ok ? "Copied. Paste it into a text, email, or DM to the person you chose." : "Couldn’t copy automatically. The message is selected: copy it from there.";
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(t).then(function () {
        status.textContent = "Copied. Paste it into a text, email, or DM to the person you chose.";
      }, fallback);
    } else fallback();
  });

  if (navigator.share) {
    share.hidden = false;
    share.addEventListener("click", function () { navigator.share({ text: build() }).catch(function () {}); });
  }

  document.getElementById("msg-clear").addEventListener("click", function () {
    form.reset();
    update();
    status.textContent = "Cleared.";
    who.focus();
  });
  update();
})();
