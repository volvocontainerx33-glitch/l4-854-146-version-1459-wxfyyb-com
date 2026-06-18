(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }

    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");
    var message = shell.querySelector("[data-player-message]");
    var stream = shell.getAttribute("data-stream");
    var attached = false;
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function attachStream() {
      if (attached || !video || !stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      attached = true;
    }

    function start() {
      attachStream();
      shell.classList.add("is-playing");
      setMessage("");
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          shell.classList.remove("is-playing");
          setMessage("点击视频区域继续播放");
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
        }
      });
      video.addEventListener("error", function () {
        setMessage("播放遇到问题，请稍后再试");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  });
})();
