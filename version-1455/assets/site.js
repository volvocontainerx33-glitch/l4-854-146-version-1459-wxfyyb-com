(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var navMenu = document.querySelector("[data-nav-menu]");

    if (menuButton && navMenu) {
        menuButton.addEventListener("click", function () {
            navMenu.classList.toggle("open");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
        var input = scope.querySelector("[data-search-input]");
        var genre = scope.querySelector("[data-genre-filter]");
        var region = scope.querySelector("[data-region-filter]");
        var year = scope.querySelector("[data-year-filter]");
        var results = document.querySelector("[data-search-results]");

        if (!results) {
            return;
        }

        var cards = Array.prototype.slice.call(results.querySelectorAll("[data-search-card]"));

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalize(input && input.value);
            var genreValue = normalize(genre && genre.value);
            var regionValue = normalize(region && region.value);
            var yearValue = normalize(year && year.value);

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute("data-title"));
                var cardGenre = normalize(card.getAttribute("data-genre"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var text = [title, cardGenre, cardRegion, cardYear, cardType].join(" ");
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (genreValue && cardGenre.indexOf(genreValue) === -1) {
                    matched = false;
                }
                if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }

                card.classList.toggle("is-hidden", !matched);
            });
        }

        [input, genre, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });
    });
})();

function initializePlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var started = false;
    var hlsInstance = null;

    if (!video || !button || !streamUrl) {
        return;
    }

    function attachStream() {
        if (started) {
            return;
        }

        started = true;

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else {
            video.src = streamUrl;
        }
    }

    function startPlayback() {
        attachStream();
        button.classList.add("hidden");
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                button.classList.remove("hidden");
            });
        }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
        if (!started || video.paused) {
            startPlayback();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
