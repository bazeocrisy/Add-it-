/* Unload: private writing. Nothing is sent, stored, or logged. */
(function () {
  "use strict";
  var ta = document.getElementById("unload-text");
  var count = document.getElementById("unload-count");
  var status = document.getElementById("unload-status");
  function update() {
    var n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
    count.textContent = n + (n === 1 ? " word" : " words");
  }
  ta.addEventListener("input", function () { update(); status.textContent = ""; });
  document.querySelectorAll("[data-prompt]").forEach(function (b) {
    b.addEventListener("click", function () {
      var p = b.getAttribute("data-prompt");
      ta.value = ta.value ? ta.value.replace(/\s*$/, "") + "\n\n" + p + " " : p + " ";
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
      update();
    });
  });
  document.getElementById("unload-clear").addEventListener("click", function () {
    ta.value = "";
    update();
    status.textContent = "Cleared. Nothing was saved.";
    ta.focus();
  });
  update();
})();
