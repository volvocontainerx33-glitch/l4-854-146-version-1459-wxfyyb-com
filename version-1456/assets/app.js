(function () {
  const site = {};

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMobileMenu() {
    const button = document.querySelector("[data-mobile-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) return;
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) return;
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) return;
    let index = 0;
    let timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFiltering() {
    const inputs = Array.from(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      const targetSelector = input.getAttribute("data-filter-target") || "[data-filter-card]";
      const cards = Array.from(document.querySelectorAll(targetSelector));
      input.addEventListener("input", function () {
        const keyword = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          const haystack = (card.getAttribute("data-filter-text") || card.textContent || "").toLowerCase();
          card.style.display = haystack.includes(keyword) ? "" : "none";
        });
      });
    });
  }

  function cardTemplate(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\" data-filter-card data-filter-text=\"" + escapeAttr([movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ")) + "\">",
      "<a class=\"poster-link\" href=\"./" + escapeAttr(movie.file) + "\">",
      "<img src=\"" + escapeAttr(movie.cover) + "\" alt=\"" + escapeAttr(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"movie-badge\">" + escapeHtml(movie.type || "影片") + "</span>",
      "<span class=\"movie-year\">" + escapeHtml(String(movie.year || "")) + "</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta\">" + escapeHtml([movie.region, movie.genre].filter(Boolean).join(" · ")) + "</div>",
      "<h3><a href=\"./" + escapeAttr(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.oneLine || "") + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function setupSearchPage() {
    const box = document.querySelector("[data-search-page]");
    if (!box || !window.MOVIE_SEARCH_DATA) return;
    const input = document.querySelector("[data-search-input]");
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") || "";
    if (input) input.value = initial;

    function render() {
      const keyword = (input ? input.value : initial).trim().toLowerCase();
      const source = window.MOVIE_SEARCH_DATA;
      const list = keyword ? source.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase().includes(keyword);
      }) : source.slice(0, 60);
      if (!list.length) {
        box.innerHTML = "<div class=\"empty-state\">暂无匹配内容</div>";
        return;
      }
      box.innerHTML = "<div class=\"movie-grid\">" + list.slice(0, 120).map(cardTemplate).join("") + "</div>";
    }

    if (input) input.addEventListener("input", render);
    render();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  site.initPlayer = function (streamUrl) {
    const video = document.getElementById("moviePlayer");
    const trigger = document.getElementById("playTrigger");
    if (!video || !streamUrl) return;
    let started = false;
    let hls = null;

    function activate() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (trigger) trigger.classList.add("is-hidden");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.play().catch(function () {});
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
            video.src = streamUrl;
            video.play().catch(function () {});
          }
        });
        return;
      }
      video.src = streamUrl;
      video.play().catch(function () {});
    }

    if (trigger) trigger.addEventListener("click", activate);
    video.addEventListener("click", function () {
      if (video.paused) activate();
    });
    video.addEventListener("play", function () {
      if (!started) {
        video.pause();
        activate();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFiltering();
    setupSearchPage();
  });

  window.MovieSite = site;
})();
