(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".main-nav");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero-slider]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var current = 0;
            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            if (slides.length > 1) {
                setInterval(function () {
                    show(current + 1);
                }, 5000);
            }
        }

        var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".js-search"));
        searchInputs.forEach(function (input) {
            input.addEventListener("input", function () {
                var value = input.value.trim().toLowerCase();
                var root = input.closest("main") || document;
                var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-tags") || "",
                        card.textContent || ""
                    ].join(" ").toLowerCase();
                    card.classList.toggle("is-hidden", value && haystack.indexOf(value) === -1);
                });
            });
        });
    });
})();

function setupMoviePlayer(source) {
    var video = document.getElementById("movie-video");
    var cover = document.querySelector(".player-cover");
    var box = document.querySelector(".player-box");
    if (!video || !source) {
        return;
    }

    var started = false;
    var hlsInstance = null;

    function attach() {
        if (started) {
            return;
        }
        started = true;
        if (box) {
            box.classList.add("is-playing");
        }
        video.controls = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }
        video.src = source;
        video.play().catch(function () {});
    }

    if (cover) {
        cover.addEventListener("click", attach);
    }
    video.addEventListener("click", function () {
        if (!started) {
            attach();
        }
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
