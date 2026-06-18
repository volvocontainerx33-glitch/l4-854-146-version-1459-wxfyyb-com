(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
            return;
        }
        fn();
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = parseInt(dot.getAttribute("data-hero-dot"), 10);
                if (!Number.isNaN(next)) {
                    show(next);
                    start();
                }
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
        bars.forEach(function (bar) {
            var section = bar.closest("section") || document;
            var grid = section.querySelector("[data-filter-grid]");
            var empty = section.querySelector("[data-empty-state]");
            if (!grid) {
                return;
            }
            var searchInput = bar.querySelector("[data-local-search]");
            var regionSelect = bar.querySelector("[data-region-filter]");
            var yearSelect = bar.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (query && searchInput) {
                searchInput.value = query;
            }
            function apply() {
                var needle = searchInput ? searchInput.value.trim().toLowerCase() : "";
                var region = regionSelect ? regionSelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = card.getAttribute("data-search") || "";
                    var cardRegion = card.getAttribute("data-region") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var match = true;
                    if (needle && haystack.indexOf(needle) === -1) {
                        match = false;
                    }
                    if (region && cardRegion !== region) {
                        match = false;
                    }
                    if (year && cardYear !== year) {
                        match = false;
                    }
                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            if (searchInput) {
                searchInput.addEventListener("input", apply);
            }
            if (regionSelect) {
                regionSelect.addEventListener("change", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var url = player.getAttribute("data-video-url");
            var hlsInstance = null;
            if (!video || !overlay || !url) {
                return;
            }
            function bind() {
                if (video.getAttribute("data-ready") === "true") {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
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
                    video.src = url;
                }
                video.setAttribute("data-ready", "true");
                video.controls = true;
            }
            function play() {
                bind();
                overlay.classList.add("is-hidden");
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        overlay.classList.remove("is-hidden");
                    });
                }
            }
            overlay.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
}());
