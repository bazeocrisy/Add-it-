/* Renders the full resource list from TW.RESOURCES (assets/js/resources.js). */
(function () {
  "use strict";
  var TW = window.TW, e = TW.esc;
  var root = document.getElementById("resource-groups");
  if (!root) return;

  var GROUPS = [
    { id: "professional", title: "Counseling and treatment referrals", lead: "For ongoing, professional support. A counselor is one option, not a requirement." },
    { id: "practical", title: "Practical help", lead: "Housing, food, bills, work, family, and legal information. Call ahead: hours and availability change." },
    { id: "info", title: "Information", lead: "Official guidance worth reading before a big decision." },
  ];

  function item(r) {
    return '<li class="res"><h3>' + e(r.name) + "</h3><p>" + e(r.offers) + '</p><div class="btn-row">' +
      TW.resourceButtons(r) + "</div>" + TW.verifyLine(r) + "</li>";
  }

  var ids = Object.keys(TW.RESOURCES);
  var html = "";
  GROUPS.forEach(function (g) {
    var list = ids.map(function (k) { return TW.RESOURCES[k]; }).filter(function (r) { return r.kind === g.id; });
    if (!list.length) return;
    html += '<section class="res-group" id="' + g.id + '" aria-labelledby="' + g.id + '-t"><h2 id="' + g.id + '-t">' + e(g.title) +
      '</h2><p class="res-group__lead">' + e(g.lead) + '</p><ul class="res-list" role="list">' + list.map(item).join("") + "</ul></section>";
  });

  html += '<section class="res-group" id="tools" aria-labelledby="tools-t"><h2 id="tools-t">Do it yourself, right now</h2>' +
    '<p class="res-group__lead">The Weight’s own tools. Private: nothing is sent or saved.</p><ul class="res-list" role="list">';
  Object.keys(TW.TOOLS).forEach(function (k) {
    var t = TW.TOOLS[k];
    html += '<li class="res"><h3>' + e(t.name) + "</h3><p>" + e(t.offers) + '</p><div class="btn-row"><a class="btn btn--navy" href="' + e(t.href) + '">Open ' + e(t.name) + "</a></div></li>";
  });
  html += "</ul></section>";
  html += '<p class="meta">✓ Checked by The Weight = already listed on theweightmen.com with a verification date. ◇ Suggested addition = added for this prototype; the owner should confirm it before launch.</p>';
  root.innerHTML = html;
})();
