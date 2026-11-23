/* Home page scripts.
   1. Selected publications (middle column): one paper at a time, with arrows and a counter.
   The papers themselves are in _selected-papers.qmd. Without JavaScript, all papers are listed one
   after another. Keyboard: left and right arrows while the pointer is over the box or it
   has the focus. Touch screens: swipe left or right.
   (The project cards in the right column need no script: see styles.css.) */
(function () {
  "use strict";

  // Movies play by themselves, unless the visitor's system asks for reduced motion.
  function stillPreferred() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function playQuietly(v) {
    var p = v.play();
    if (p && p.catch) { p.catch(function () {}); }
  }

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
        return el.tagName === "P" && !el.querySelector(".paper-meta, .paper-authors, .btn");
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
        updateMore(p);
      });
      // A "paper-fill" card is sized from its figure, so measure again once the figure has loaded.
      var img = p.classList.contains("paper-fill") && p.querySelector(".paper-figure-img img, .paper-figure-img video");
      if (img) {
        img.addEventListener(img.tagName === "VIDEO" ? "loadedmetadata" : "load", function () {
          if (p.classList.contains("is-current")) { updateMore(p); }
        });
      }
    });

    // A paper marked "paper-fill" (one with a wide, short figure) shows as many lines of its
    // summary as fit in the room the figure does not need at its full width, instead of four.
    var wide = window.matchMedia("(min-width: 992px)");
    function fitSummary(p, summary) {
      summary.style.removeProperty("--summary-lines");
      if (!p.classList.contains("paper-fill") || p.classList.contains("is-open") || !wide.matches) {
        return;
      }
      // The figure is an image or, for a movie, a video with its width and height attributes set.
      var img = p.querySelector(".paper-figure-img img, .paper-figure-img video");
      var nw = img && (img.naturalWidth || img.videoWidth || img.width);
      var nh = img && (img.naturalHeight || img.videoHeight || img.height);
      if (!nw || !nh) { return; }
      var box = img.parentNode, cs = window.getComputedStyle(summary);
      var lh = parseFloat(cs.lineHeight) || 1.5 * parseFloat(cs.fontSize);
      var spare = box.clientHeight - box.clientWidth * nh / nw;
      summary.style.setProperty("--summary-lines", 4 + Math.max(0, Math.floor(spare / lh)));
    }

    // Close an opened summary again, so a paper always reappears folded, as it was first shown.
    function fold(p) {
      if (!p.classList.contains("is-open")) { return; }
      p.classList.remove("is-open");
      var more = p.querySelector(".paper-more");
      if (more) {
        more.textContent = "More";
        more.setAttribute("aria-expanded", "false");
      }
    }

    function updateMore(p) {
      var summary = p.querySelector(".paper-summary"), more = p.querySelector(".paper-more");
      if (!summary || !more) { return; }
      // Twice: showing or hiding "More" changes the room left for the summary.
      for (var i = 0; i < 2; i++) {
        fitSummary(p, summary);
        var cut = summary.scrollHeight > summary.clientHeight + 2;
        more.hidden = !(cut || p.classList.contains("is-open"));
      }
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
      papers.forEach(function (p) {
        p.classList.remove("is-current", "from-left", "from-right");
        fold(p);
      });
      prev.disabled = next.disabled = shown.length < 2;
      var p = papers[shown[pos]];
      p.classList.add("is-current");
      if (direction) { p.classList.add(direction > 0 ? "from-right" : "from-left"); }
      updateMore(p);
      // A movie plays only while its paper is on show, and starts from the beginning each time.
      papers.forEach(function (q) {
        var v = q.querySelector(".paper-figure-img video");
        if (!v) { return; }
        if (q === p && !stillPreferred()) {
          playQuietly(v);
        } else {
          if (!v.paused) { v.pause(); }
          if (v.currentTime > 0) { try { v.currentTime = 0; } catch (e) {} }
        }
      });
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

  // 2. Paper figures and movies: click (or tap, or Enter) to see them large; click outside, the
  //    cross or Esc to close. An enlarged movie pauses and plays again with a click or Space.
  function zoomable() {
    var imgs = document.querySelectorAll(".paper-figure-img img, .paper-figure-img video");
    if (!imgs.length) { return; }
    var box = document.createElement("div");
    box.className = "figure-zoom";
    box.hidden = true;
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Enlarged figure");
    var close = document.createElement("button");
    close.type = "button";
    close.className = "figure-zoom-close";
    close.setAttribute("aria-label", "Close enlarged figure");
    close.innerHTML = "&times;";
    var big = document.createElement("img");
    var movie = document.createElement("video");
    ["muted", "loop", "playsinline", "disablepictureinpicture", "disableremoteplayback"].forEach(function (a) {
      movie.setAttribute(a, "");
    });
    movie.muted = true;
    movie.tabIndex = 0;
    movie.title = "Click to pause or play";
    var cap = document.createElement("p");
    box.appendChild(close); box.appendChild(big); box.appendChild(movie); box.appendChild(cap);
    document.body.appendChild(box);
    var opener = null;
    function toggle() {
      if (movie.paused) { playQuietly(movie); } else { movie.pause(); }
    }
    function hide() {
      if (box.hidden) { return; }
      box.hidden = true;
      big.removeAttribute("src");
      movie.pause();
      movie.removeAttribute("src");
      movie.load();
      if (opener && opener.tagName === "VIDEO") {
        var paper = opener.closest(".paper");
        if (paper && paper.classList.contains("is-current") && !stillPreferred()) { playQuietly(opener); }
      }
      if (opener) { opener.focus(); }
    }
    function show(img) {
      opener = img;
      var isMovie = img.tagName === "VIDEO";
      big.hidden = isMovie;
      movie.hidden = !isMovie;
      if (isMovie) {
        img.pause();
        movie.poster = img.poster;
        movie.src = img.currentSrc || img.src;
        movie.setAttribute("aria-label", img.getAttribute("aria-label") || "");
        playQuietly(movie);
      } else {
        big.src = img.currentSrc || img.src;
        big.alt = img.alt;
      }
      // The caption, with the credit on a line of its own.
      var fc = img.closest("figure") && img.closest("figure").querySelector("figcaption");
      cap.textContent = "";
      if (fc) {
        var main = fc.cloneNode(true), credit = main.querySelector(".paper-credit");
        if (credit) { credit.parentNode.removeChild(credit); }
        cap.appendChild(document.createTextNode(main.textContent.trim()));
        if (credit) {
          var line = document.createElement("span");
          line.className = "figure-zoom-credit";
          line.textContent = credit.textContent.trim();
          cap.appendChild(line);
        }
      }
      box.hidden = false;
      (isMovie ? movie : close).focus();
    }
    box.addEventListener("click", hide);
    movie.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) { return; }
      if (e.key === "Escape") { hide(); return; }
      if (!movie.hidden && (e.key === " " || e.key === "Spacebar") && document.activeElement !== close) {
        e.preventDefault();
        toggle();
      }
    });
    Array.prototype.forEach.call(imgs, function (img) {
      img.classList.add("is-zoomable");
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.title = "Click to enlarge";
      img.addEventListener("click", function () { show(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(img); }
      });
    });
  }

  function start() {
    zoomable();
    var roots = document.querySelectorAll(".paper-browser");
    for (var i = 0; i < roots.length; i++) { init(roots[i]); }
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", start); }
  else { start(); }
})();
