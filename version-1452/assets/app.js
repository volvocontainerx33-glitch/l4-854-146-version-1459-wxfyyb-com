
(function () {
  function $(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function $all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var toggle = $(".menu-toggle");
    var panel = $(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var carousel = $("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = $all(".hero-slide", carousel);
    var dots = $all("[data-hero-dot]", carousel);
    var prev = $("[data-hero-prev]", carousel);
    var next = $("[data-hero-next]", carousel);
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function initLocalFilters() {
    $all(".local-filter").forEach(function (input) {
      var targetId = input.getAttribute("data-filter-target");
      var target = targetId ? document.getElementById(targetId) : null;
      if (!target) {
        return;
      }
      var items = $all("[data-search]", target);
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        items.forEach(function (item) {
          var haystack = item.getAttribute("data-search") || "";
          item.classList.toggle("hidden-by-filter", query && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 5).join(" ");
    return "<a class=\"movie-card\" href=\"./" + escapeHtml(movie.url) + "\" data-search=\"" + escapeHtml((movie.title + " " + movie.region + " " + movie.genre + " " + movie.year + " " + tags).toLowerCase()) + "\">" +
      "<span class=\"poster-wrap\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span>" +
      "<span class=\"type-badge\">" + escapeHtml(movie.type) + "</span>" +
      "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
      "<span class=\"play-chip\">▶</span>" +
      "</span>" +
      "<span class=\"card-body\">" +
      "<strong>" + escapeHtml(movie.title) + "</strong>" +
      "<span class=\"card-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.genre) + "</span>" +
      "<span class=\"card-text\">" + escapeHtml(movie.oneLine) + "</span>" +
      "</span>" +
      "</a>";
  }

  function initSearchPage() {
    var page = $("[data-search-page]");
    if (!page || !window.SEARCH_MOVIES) {
      return;
    }
    var form = $("#searchToolbar");
    var input = $("#searchInput");
    var region = $("#regionSelect");
    var results = $("#searchResults");
    var status = $("#searchStatus");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var query = input.value.trim().toLowerCase();
      var selectedRegion = region.value.trim().toLowerCase();
      var filtered = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.category, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
        var regionMatch = !selectedRegion || String(movie.region || "").toLowerCase().indexOf(selectedRegion) !== -1 || String(movie.category || "").toLowerCase().indexOf(selectedRegion) !== -1;
        return regionMatch && (!query || haystack.indexOf(query) !== -1);
      });
      results.innerHTML = filtered.slice(0, 240).map(movieCard).join("");
      status.textContent = filtered.length ? "已匹配 " + filtered.length + " 部影片" : "没有找到匹配影片";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set("q", input.value.trim());
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState(null, "", url.toString());
    });
    input.addEventListener("input", render);
    region.addEventListener("change", render);
    render();
  }

  function initPlayer() {
    $all("[data-player]").forEach(function (shell) {
      var video = $("video", shell);
      var button = $(".play-overlay", shell);
      var streamUrl = shell.getAttribute("data-stream");
      var attached = false;
      var hlsInstance = null;

      function attach() {
        if (attached || !video || !streamUrl) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        attach();
        shell.classList.add("is-playing");
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          play();
        });
      }

      shell.addEventListener("click", function (event) {
        if (event.target === video || event.target === shell) {
          play();
        }
      });

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initLocalFilters();
    initSearchPage();
    initPlayer();
  });
})();
