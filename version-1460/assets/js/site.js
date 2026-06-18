(function () {
  var navButton = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (navButton && mobileMenu) {
    navButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var index = 0;

    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('.search-panel'));
  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
    var noResult = panel.querySelector('[data-no-result]');
    var activeFilter = '';
    var scope = panel.parentElement || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

    var normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    var applyFilter = function () {
      var query = normalize(input ? input.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedFilter = !activeFilter || haystack.indexOf(normalize(activeFilter)) !== -1;
        var shown = matchedQuery && matchedFilter;
        card.classList.toggle('is-filtered-out', !shown);
        if (shown) {
          visible += 1;
        }
      });

      if (noResult) {
        noResult.classList.toggle('is-visible', visible === 0);
      }
    };

    if (input) {
      input.addEventListener('input', applyFilter);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        activeFilter = chip.getAttribute('data-filter') || '';
        applyFilter();
      });
    });

    applyFilter();
  });
})();
