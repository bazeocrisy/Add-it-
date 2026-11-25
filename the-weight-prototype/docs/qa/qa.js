// QA for The Weight prototype. Usage: node qa.js http://localhost:8765/
const { chromium, devices } = require("playwright");
const fs = require("fs");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.argv[2] || "http://localhost:8765/";
const out = { consoleErrors: [], pages: {}, scenarios: [], combos: {}, overflow: [], keyboard: {}, axe: {} };

(async () => {
  const browser = await chromium.launch();

  // 1) every page: console errors, axe, overflow at 320/375/768/1280
  const pages = ["index.html", "resources.html", "about.html", "unload.html", "talk.html", "presentation.html"];
  for (const w of [320, 375, 768, 1280]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    for (const p of pages) {
      const page = await ctx.newPage();
      page.on("console", (m) => { if (m.type() === "error") out.consoleErrors.push(`${w} ${p}: ${m.text()}`); });
      page.on("pageerror", (err) => out.consoleErrors.push(`${w} ${p}: ${err.message}`));
      const r = await page.goto(BASE + p);
      if (!r || r.status() !== 200) { out.pages[p] = "HTTP " + (r && r.status()); continue; }
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (ov > 0) out.overflow.push(`${p} @${w}px overflows by ${ov}px`);
      if (w === 375 || w === 1280) {
        await page.addScriptTag({ content: AXE });
        const res = await page.evaluate(async () => {
          const r = await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } });
          return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, ex: v.nodes.slice(0, 2).map((x) => x.target.join(" ")) }));
        });
        out.axe[`${p}@${w}`] = res;
      }
      await page.close();
    }
    await ctx.close();
  }

  // 2) every topic × need combination renders a result with a primary action
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on("pageerror", (err) => out.consoleErrors.push("wizard: " + err.message));
  await page.goto(BASE + "index.html");
  const topics = await page.evaluate(() => TW.TOPICS.map((t) => ({ id: t.id, needs: t.needs || null })));
  for (const t of topics) {
    for (const n of t.needs || [null]) {
      await page.click("#btn-restart").catch(() => {});
      await page.evaluate(() => { document.getElementById("btn-restart").click(); });
      await page.click(`[data-topic="${t.id}"]`);
      if (n) await page.click(`[data-need="${n}"]`);
      const info = await page.evaluate(() => {
        const box = document.getElementById("result");
        const primary = box.querySelectorAll(".primary .btn").length;
        const secondary = box.querySelectorAll(".also__item").length;
        const links = [...box.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
        const words = box.innerText.split(/\s+/).filter(Boolean).length;
        const focused = document.activeElement && document.activeElement.tagName;
        return { primary, secondary, links, words, focused, visible: !document.getElementById("step-3").hidden };
      });
      out.combos[`${t.id}:${n || "(direct)"}`] = info;
    }
  }

  // 3) Back/Start over + browser back
  await page.goto(BASE + "index.html");
  await page.click('[data-topic="grief"]');
  await page.click('[data-need="talk"]');
  await page.click("#btn-back");
  await page.waitForTimeout(150);
  const afterBack = await page.evaluate(() => !document.getElementById("step-2").hidden);
  await page.goBack();
  await page.waitForTimeout(150);
  const afterBrowserBack = await page.evaluate(() => !document.getElementById("step-1").hidden);
  await page.click('[data-topic="housing"]');
  await page.click("#btn-restart");
  await page.waitForTimeout(150);
  const afterRestart = await page.evaluate(() => !document.getElementById("step-1").hidden && location.href);
  const storage = await page.evaluate(() => ({ ls: localStorage.length, ss: sessionStorage.length, cookie: document.cookie, url: location.href }));
  out.controls = { afterBack, afterBrowserBack, afterRestart, storage };

  // 4) keyboard only: Tab to first card, Enter, Tab to first need, Enter
  await page.goto(BASE + "index.html");
  const tabs = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const d = await page.evaluate(() => {
      const a = document.activeElement;
      const cs = getComputedStyle(a);
      return { t: (a.innerText || a.getAttribute("aria-label") || a.tagName).trim().slice(0, 40), outline: cs.outlineStyle + " " + cs.outlineWidth };
    });
    tabs.push(d);
    if (d.t.startsWith("Stress")) break;
  }
  await page.keyboard.press("Enter");
  const focus2 = await page.evaluate(() => document.activeElement.innerText);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  const focus3 = await page.evaluate(() => document.activeElement.innerText.slice(0, 60));
  out.keyboard = { tabOrder: tabs, focusAfterStep1: focus2, focusAfterStep2: focus3 };

  // 5) Scenarios (clicks counted from homepage load)
  const SCEN = [
    ["Father going through divorce", ["divorce", "practical"]],
    ["Recently lost his job", ["work", "job"]],
    ["Veteran struggling with transition", ["military", "vpractical"]],
    ["Loneliness", ["alone", "reach"]],
    ["Grieving a loved one", ["grief", "talk"]],
    ["Overwhelmed, can’t say why", ["unsure", "talk"]],
    ["Needs crisis support now", []],
  ];
  for (const [name, path] of SCEN) {
    await page.goto(BASE + "index.html");
    let clicks = 0;
    if (path[0]) { await page.click(`[data-topic="${path[0]}"]`); clicks++; }
    if (path[1]) { await page.click(`[data-need="${path[1]}"]`); clicks++; }
    const r = await page.evaluate((crisis) => {
      if (crisis) {
        const a = document.querySelector('.help-bar a[href="tel:988"]');
        const rect = a.getBoundingClientRect();
        return { action: a.innerText + " → " + a.getAttribute("href"), aboveFold: rect.top < innerHeight, words: 0 };
      }
      const p = document.querySelector(".primary");
      return { action: p.querySelector(".primary__name").innerText + " → " + [...p.querySelectorAll(".btn")].map((b) => b.getAttribute("href")).join(", "),
        words: document.getElementById("result").innerText.split(/\s+/).filter(Boolean).length };
    }, path.length === 0);
    out.scenarios.push({ name, clicks: path.length === 0 ? 1 : clicks + 1, selections: clicks, ...r });
  }
  await ctx.close();

  // 6) older phone: 320×568, no sticky issues, step 1 cards visible
  const old = await browser.newContext({ viewport: { width: 320, height: 568 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const op = await old.newPage();
  await op.goto(BASE + "index.html");
  out.oldPhone = await op.evaluate(() => {
    const card = document.querySelector("[data-topic]").getBoundingClientRect();
    const btns = [...document.querySelectorAll(".choice, .hb-btn, .btn")].filter((b) => b.offsetParent).map((b) => b.getBoundingClientRect().height);
    return { firstCardTop: Math.round(card.top), viewport: innerHeight, minTarget: Math.round(Math.min(...btns)), helpBarH: document.querySelector(".help-bar").offsetHeight };
  });
  await op.tap('[data-topic="housing"]');
  out.oldPhone.housingResult = await op.evaluate(() => document.querySelector(".primary__name").innerText);
  await old.close();

  await browser.close();
  fs.writeFileSync("qa-results.json", JSON.stringify(out, null, 2));
  console.log(JSON.stringify({ consoleErrors: out.consoleErrors, overflow: out.overflow, axe: Object.fromEntries(Object.entries(out.axe).filter(([k, v]) => v.length)), controls: out.controls, keyboard: { f2: out.keyboard.focusAfterStep1, f3: out.keyboard.focusAfterStep2, tabs: out.keyboard.tabOrder.length }, oldPhone: out.oldPhone, scenarios: out.scenarios, badCombos: Object.entries(out.combos).filter(([k, v]) => v.primary < 1 || v.secondary > 2 || !v.visible) }, null, 1));
})();
