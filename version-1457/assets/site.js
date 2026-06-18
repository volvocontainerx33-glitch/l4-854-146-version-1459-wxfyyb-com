(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
      });
    }

    setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('.filter-input');
  var filterSelect = document.querySelector('.filter-select');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.catalog-grid .movie-card'));

  function applyFilters() {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterSelect ? filterSelect.value : '';
    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-region') || ''
      ].join(' ').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var visible = (!keyword || text.indexOf(keyword) !== -1) && (!year || cardYear === year);
      card.classList.toggle('is-filter-hidden', !visible);
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', applyFilters);
  }

  var searchInput = document.getElementById('searchInput');
  var searchResults = document.getElementById('searchResults');
  if (searchInput && searchResults && typeof searchData !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    searchInput.value = query;

    function escapeText(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderSearch(value) {
      var q = value.trim().toLowerCase();
      var list = searchData.filter(function (item) {
        var text = [item.title, item.region, item.year, item.genre, item.tags].join(' ').toLowerCase();
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 80);

      searchResults.innerHTML = list.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="poster" href="./' + escapeText(item.url) + '">' +
            '<img src="' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '" loading="lazy">' +
            '<span class="poster-gradient"></span>' +
            '<span class="poster-play">播放</span>' +
          '</a>' +
          '<div class="movie-info">' +
            '<div class="movie-meta"><span>' + escapeText(item.year) + '</span><span>' + escapeText(item.region) + '</span></div>' +
            '<a href="./' + escapeText(item.url) + '"><h3>' + escapeText(item.title) + '</h3></a>' +
            '<p>' + escapeText(item.oneLine) + '</p>' +
          '</div>' +
        '</article>';
      }).join('');
    }

    renderSearch(query);
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }
})();

function initMoviePlayer(source) {
  var video = document.getElementById('movie-player');
  var cover = document.getElementById('player-cover');
  var hasStarted = false;

  if (!video || !source) {
    return;
  }

  function startPlayer() {
    if (hasStarted) {
      video.play();
      return;
    }
    hasStarted = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play();
      }, { once: true });
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
    } else {
      video.src = source;
      video.play();
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlayer);
  }

  video.addEventListener('click', function () {
    if (!hasStarted) {
      startPlayer();
    }
  });
}
