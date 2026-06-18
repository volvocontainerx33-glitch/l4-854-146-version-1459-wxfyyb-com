(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[char];
    });
  }

  function getPrefix() {
    var path = window.location.pathname;
    if (path.indexOf('/movie/') !== -1 || path.indexOf('/category/') !== -1) {
      return '../';
    }
    return '';
  }

  function setupMobileMenu() {
    var button = $('.mobile-toggle');
    var panel = $('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      panel.hidden = isOpen;
    });
  }

  function setupImageFallbacks() {
    $all('img').forEach(function (image) {
      image.addEventListener('error', function () {
        var shell = image.closest('.media-shell');
        if (shell) {
          shell.classList.add('image-fallback');
        }
      });
    });
  }

  function setupHero() {
    var hero = $('.hero');
    if (!hero) {
      return;
    }
    var slides = $all('.hero-slide', hero);
    var dots = $all('.hero-dot', hero);
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panel = $('.filter-panel');
    if (!panel) {
      return;
    }
    var cards = $all('.js-filter-card');
    var keyword = $('[data-filter="keyword"]', panel);
    var year = $('[data-filter="year"]', panel);
    var type = $('[data-filter="type"]', panel);
    var region = $('[data-filter="region"]', panel);
    var summary = $('.filter-summary');

    function matches(card) {
      var text = [
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year
      ].join(' ').toLowerCase();
      var keywordValue = keyword ? keyword.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      var regionValue = region ? region.value : '';
      if (keywordValue && text.indexOf(keywordValue) === -1) {
        return false;
      }
      if (yearValue && card.dataset.year !== yearValue) {
        return false;
      }
      if (typeValue && card.dataset.type !== typeValue) {
        return false;
      }
      if (regionValue && card.dataset.region !== regionValue) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var show = matches(card);
        card.classList.toggle('hidden-by-filter', !show);
        if (show) {
          visible += 1;
        }
      });
      if (summary) {
        summary.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    $all('input, select', panel).forEach(function (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  function setupPlayer() {
    $all('video[data-hls-src]').forEach(function (video) {
      var src = video.getAttribute('data-hls-src');
      if (!src) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      }

      var card = video.closest('.player-card');
      var overlay = card ? $('.player-overlay', card) : null;
      if (overlay) {
        overlay.addEventListener('click', function () {
          overlay.classList.add('is-hidden');
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              overlay.classList.remove('is-hidden');
            });
          }
        });
        video.addEventListener('play', function () {
          overlay.classList.add('is-hidden');
        });
      }
    });
  }

  function setupSearchPage() {
    var root = $('#search-results');
    if (!root || !window.MOVIE_INDEX) {
      return;
    }
    var form = $('#page-search-form');
    var input = $('#page-search-input');
    var count = $('#search-count');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function card(movie) {
      return [
        '<article class="movie-card">',
        '  <a href="' + escapeHtml(movie.url) + '" class="card-link" title="' + escapeHtml(movie.title) + ' 在线观看">',
        '    <div class="poster media-shell">',
        '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">',
        '      <span class="duration">' + escapeHtml(movie.duration) + '</span>',
        '    </div>',
        '    <div class="card-body">',
        '      <div class="card-meta"><span>' + escapeHtml(movie.regionGroup) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function render() {
      var query = input.value.trim().toLowerCase();
      var results = window.MOVIE_INDEX.filter(function (movie) {
        if (!query) {
          return true;
        }
        return [
          movie.title,
          movie.region,
          movie.regionGroup,
          movie.type,
          movie.typeGroup,
          movie.genre,
          movie.tags.join(' '),
          movie.oneLine,
          String(movie.year)
        ].join(' ').toLowerCase().indexOf(query) !== -1;
      }).slice(0, 240);

      count.textContent = query ? '找到 ' + results.length + ' 条相关结果，最多显示前 240 条。' : '输入关键词可检索全站影片，当前展示前 240 部。';
      root.innerHTML = results.length ? results.map(card).join('') : '<div class="empty-state">没有找到匹配影片，请尝试更换关键词。</div>';
      setupImageFallbacks();
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var next = query ? '?q=' + encodeURIComponent(query) : window.location.pathname;
      history.replaceState(null, '', next);
      render();
    });

    input.addEventListener('input', render);
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupImageFallbacks();
    setupHero();
    setupFilters();
    setupPlayer();
    setupSearchPage();
  });
})();
