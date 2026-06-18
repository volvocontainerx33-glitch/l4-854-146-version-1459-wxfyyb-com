(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 5600);
      }
    }

    var filterPanel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-card-grid]");
    if (filterPanel && grid) {
      var input = filterPanel.querySelector("[data-search-input]");
      var year = filterPanel.querySelector("[data-year-filter]");
      var region = filterPanel.querySelector("[data-region-filter]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var empty = document.querySelector("[data-empty-state]");

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var regionValue = region ? region.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }
          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }
          if (regionValue && cardRegion !== regionValue) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
    }
  });
})();
