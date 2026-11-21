/* Tabs on the About me page.
   Each part of the page is written in about.qmd as a block marked {.about-tab} with a heading at
   the top. This script hides all of them but one and puts a row of buttons above, made from those
   headings. Without JavaScript nothing is hidden and the page simply reads from top to bottom. */
(function () {
  "use strict";

  function init(group) {
    var tabs = [].slice.call(group.querySelectorAll(":scope > .about-tab"));
    if (tabs.length < 2) return;

    var bar = document.createElement("div");
    bar.className = "about-tabbar";
    bar.setAttribute("role", "tablist");

    var buttons = tabs.map(function (tab, i) {
      var heading = tab.querySelector("h2, h3");
      var label = heading ? heading.textContent.trim() : "Section " + (i + 1);
      if (heading) heading.classList.add("about-tab-title");

      var id = tab.id || (heading && heading.id) || "tab-" + (i + 1);
      tab.id = id;

      var b = document.createElement("button");
      b.type = "button";
      b.className = "about-tabbtn";
      b.textContent = label;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-controls", id);
      b.dataset.target = id;
      bar.appendChild(b);
      return b;
    });

    group.insertBefore(bar, group.firstChild);
    group.classList.add("about-tabs-on");

    function show(id, push) {
      var found = tabs.some(function (tab) {
        return tab.id === id;
      });
      if (!found) return false;
      tabs.forEach(function (tab, i) {
        var on = tab.id === id;
        tab.classList.toggle("is-current", on);
        buttons[i].classList.toggle("is-current", on);
        buttons[i].setAttribute("aria-selected", on ? "true" : "false");
        buttons[i].tabIndex = on ? 0 : -1;
      });
      if (push && window.history && window.history.replaceState) {
        window.history.replaceState(null, "", "#" + id);
      }
      return true;
    }

    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () {
        show(b.dataset.target, true);
        bar.scrollIntoView({ block: "nearest" });
      });
      b.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        var n = (i + step + buttons.length) % buttons.length;
        buttons[n].focus();
        show(buttons[n].dataset.target, true);
      });
    });

    /* An address such as about.html#publications opens that tab. */
    function fromHash(fallback) {
      var id = (window.location.hash || "").replace(/^#/, "");
      if (id && show(id, false)) return true;
      /* A link to a heading inside a part opens the part that holds it. */
      var target = id && document.getElementById(id);
      if (target) {
        var owner = target.closest(".about-tab");
        if (owner && show(owner.id, false)) {
          target.scrollIntoView();
          return true;
        }
      }
      if (fallback) show(tabs[0].id, false);
      return false;
    }

    fromHash(true);
    window.addEventListener("hashchange", function () {
      fromHash(false);
    });
  }

  function start() {
    [].slice.call(document.querySelectorAll(".about-tabs")).forEach(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
