(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

  players.forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-layer');
    var streamUrl = shell.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    var start = function () {
      if (!video || !streamUrl) {
        return;
      }

      if (!started) {
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      if (button) {
        button.classList.add('is-hidden');
      }

      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {});
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
