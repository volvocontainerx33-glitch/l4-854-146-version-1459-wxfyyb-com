(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearch() {
    var input = document.querySelector("[data-site-search]");
    var results = document.querySelector("[data-search-results]");
    var clear = document.querySelector("[data-search-clear]");
    var items = window.SITE_SEARCH || [];
    if (!input || !results || !items.length) {
      return;
    }

    function render() {
      var q = input.value.trim().toLowerCase();
      results.innerHTML = "";
      if (!q) {
        results.classList.remove("open");
        return;
      }
      var matched = items.filter(function (item) {
        return item.text.indexOf(q) !== -1;
      }).slice(0, 24);
      matched.forEach(function (item) {
        var link = document.createElement("a");
        link.className = "search-result-item";
        link.href = item.url;
        link.innerHTML = "<strong>" + item.title + "</strong><span>" + item.meta + "</span>";
        results.appendChild(link);
      });
      results.classList.toggle("open", matched.length > 0);
    }

    input.addEventListener("input", render);
    if (clear) {
      clear.addEventListener("click", function () {
        input.value = "";
        render();
        input.focus();
      });
    }
  }

  function initFilters() {
    var list = document.querySelector("[data-filter-list]");
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, tr[data-title]"));
    var region = document.querySelector("[data-filter-region]");
    var year = document.querySelector("[data-filter-year]");
    var keyword = document.querySelector("[data-filter-keyword]");

    function value(el) {
      return el ? el.value.trim().toLowerCase() : "";
    }

    function apply() {
      var r = value(region);
      var y = value(year);
      var k = value(keyword);
      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.tags].join(" ").toLowerCase();
        var visible = true;
        if (r && String(card.dataset.region || "").toLowerCase() !== r) {
          visible = false;
        }
        if (y && String(card.dataset.year || "").toLowerCase() !== y) {
          visible = false;
        }
        if (k && text.indexOf(k) === -1) {
          visible = false;
        }
        card.hidden = !visible;
      });
    }

    [region, year, keyword].forEach(function (el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
  }

  function attachVideo(video) {
    var stream = video.getAttribute("data-stream");
    if (!stream) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = stream;
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video.stream-player");
      var button = shell.querySelector(".video-launch");
      if (!video) {
        return;
      }
      attachVideo(video);
      function start() {
        shell.classList.add("is-active");
        video.play().catch(function () {});
      }
      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-active");
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initFilters();
    initPlayers();
  });
})();
