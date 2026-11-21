/* Home page scripts.
   1. Selected publications (middle column): one paper at a time, with arrows and a counter.
   The papers themselves are in _selected-papers.qmd. Without JavaScript, all papers are listed one
   after another. Keyboard: left and right arrows while the pointer is over the box or it
   has the focus. Touch screens: swipe left or right.
   (The project cards in the right column need no script: see styles.css.) */
(function () {
  "use strict";

  function init(root) {
    var papers = Array.prototype.slice.call(root.querySelectorAll(".paper"));
    if (!papers.length) { return; }

    // The counter ("3 of 22") goes on the line of the "Selected publications" heading.
    var counter = document.createElement("span");
    counter.className = "paper-count";
    counter.setAttribute("aria-live", "polite");
    var head = root.parentNode.querySelector(".papers-head");
    (head || root).appendChild(counter);

    // The summary of each paper shows four lines on wide screens, with "More" to open the rest.
    papers.forEach(function (p) {
      // Quarto puts the title and everything after it in a <section>; look inside it too.
      var box = p.querySelector(":scope > section") || p;
      var summary = Array.prototype.find.call(box.children, function (el) {
        return el.tagName === "P" && !el.querySelector(".paper-meta, .paper-authors, .paper-tag, .btn");
      });
      if (!summary) { return; }
      summary.classList.add("paper-summary");
      var more = document.createElement("button");
      more.type = "button";
      more.className = "paper-more";
      more.textContent = "More";
      more.setAttribute("aria-expanded", "false");
      summary.insertAdjacentElement("afterend", more);
      more.addEventListener("click", function () {
        var open = p.classList.toggle("is-open");
        more.textContent = open ? "Less" : "More";
        more.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    function updateMore(p) {
      var summary = p.querySelector(".paper-summary"), more = p.querySelector(".paper-more");
      if (!summary || !more) { return; }
      var cut = summary.scrollHeight > summary.clientHeight + 2;
      more.hidden = !(cut || p.classList.contains("is-open"));
    }

    var stage = document.createElement("div");
    stage.className = "paper-stage";
    papers.forEach(function (p) { stage.appendChild(p); });

    var prev = document.createElement("button");
    prev.type = "button";
    prev.className = "paper-arrow paper-prev";
    prev.setAttribute("aria-label", "Previous paper");
    prev.innerHTML = "&#8249;";
    var next = prev.cloneNode(false);
    next.className = "paper-arrow paper-next";
    next.setAttribute("aria-label", "Next paper");
    next.innerHTML = "&#8250;";

    var frame = document.createElement("div");
    frame.className = "paper-frame";
    frame.appendChild(prev);
    frame.appendChild(stage);
    frame.appendChild(next);

    root.innerHTML = "";
    root.appendChild(frame);
    root.classList.add("paper-browser-on");
    root.setAttribute("role", "region");
    root.setAttribute("aria-label", "Selected publications, one at a time");

    var shown = papers.map(function (_, i) { return i; });   // the order of the papers
    var pos = 0;                                              // the paper on show

    function render(direction) {
      papers.forEach(function (p) { p.classList.remove("is-current", "from-left", "from-right"); });
      prev.disabled = next.disabled = shown.length < 2;
      var p = papers[shown[pos]];
      p.classList.add("is-current");
      if (direction) { p.classList.add(direction > 0 ? "from-right" : "from-left"); }
      updateMore(p);
      counter.textContent = (pos + 1) + " of " + shown.length;
    }

    function step(d) {
      if (shown.length < 2) { return; }
      pos = (pos + d + shown.length) % shown.length;   // wraps around at the ends
      render(d);
    }

    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });

    document.addEventListener("keydown", function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) { return; }
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") { return; }
      var active = root.matches(":hover") || root.contains(document.activeElement);
      if (!active) { return; }
      e.preventDefault();
      step(e.key === "ArrowRight" ? 1 : -1);
    });

    var x0 = null, y0 = null;
    stage.addEventListener("touchstart", function (e) {
      x0 = e.changedTouches[0].clientX; y0 = e.changedTouches[0].clientY;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (x0 === null) { return; }
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > 1.5 * Math.abs(dy)) { step(dx < 0 ? 1 : -1); }
    }, { passive: true });

    window.addEventListener("resize", function () {
      if (shown.length) { updateMore(papers[shown[pos]]); }
    });

    render(0);
  }

  function start() {
    var roots = document.querySelectorAll(".paper-browser");
    for (var i = 0; i < roots.length; i++) { init(roots[i]); }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); }
  else { start(); }
})();
