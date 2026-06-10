/* Cadara Studio — site interactions */
(function () {
  "use strict";

  // Mark JS as available so reveal animations can hide initial state safely.
  document.documentElement.classList.add("has-js");

  document.addEventListener("DOMContentLoaded", function () {
    /* ---- mobile nav toggle ---- */
    var toggle = document.querySelector(".nav__toggle");
    var links = document.querySelector(".nav__links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        toggle.classList.toggle("open", open);
        document.body.style.overflow = open ? "hidden" : "";
      });
      // close menu when a link is tapped
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          links.classList.remove("open");
          toggle.classList.remove("open");
          document.body.style.overflow = "";
        });
      });
    }

    /* ---- scroll reveal ---- */
    var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if ("IntersectionObserver" in window && revealEls.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    } else {
      // Fallback: just show them.
      revealEls.forEach(function (el) {
        el.classList.add("in");
      });
    }

    /* ---- work page: category filters ---- */
    var filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
    var cases = Array.prototype.slice.call(document.querySelectorAll(".case"));
    var groups = Array.prototype.slice.call(document.querySelectorAll(".cat-head"));
    if (filters.length && cases.length) {
      filters.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var f = btn.getAttribute("data-filter");
          filters.forEach(function (b) {
            b.classList.toggle("is-on", b === btn);
          });
          cases.forEach(function (c) {
            var show = f === "all" || c.getAttribute("data-cat") === f;
            c.classList.toggle("hide", !show);
          });
          // hide a category header if none of its group is shown
          groups.forEach(function (g) {
            var grp = g.getAttribute("data-group");
            var show = f === "all" || grp === f;
            g.classList.toggle("hide", !show);
          });
        });
      });
    }
  });
})();
