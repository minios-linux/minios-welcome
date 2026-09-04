(function () {
  'use strict';

  var root = document.documentElement;
  var bubbleTimer = null;
  var supportUsed = false;
  var successHandler = null;
  var mioDebug = /(?:^|[?&])mio-debug=1(?:&|$)/.test(window.location.search.slice(1));
  var mioDebugLines = [];
  var mioDebugPanel = null;
  var mioDebugTimer = null;

  root.classList.add('welcome-js');

  function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function debugLog(text) {
    var line = window.performance.now().toFixed(1) + '  ' + text;
    mioDebugLines.push(line);
    if (mioDebugLines.length > 40) {
      mioDebugLines.shift();
    }
    window.__mioDebugLog = mioDebugLines.slice();
  }

  function showDebugPanel() {
    if (!mioDebugPanel) {
      mioDebugPanel = document.createElement('pre');
      mioDebugPanel.setAttribute('aria-hidden', 'true');
      mioDebugPanel.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:1000;max-width:58vw;max-height:46vh;overflow:hidden;margin:0;padding:8px 10px;background:rgba(0,0,0,.82);color:#8ff;font:11px/1.35 monospace;white-space:pre-wrap;pointer-events:none';
      document.body.appendChild(mioDebugPanel);
    }
    mioDebugPanel.style.display = 'block';
    mioDebugPanel.textContent = mioDebugLines.join('\n');
    if (!mioDebugTimer) {
      mioDebugTimer = window.setInterval(function () {
        if (mioDebugPanel && mioDebugPanel.style.display !== 'none') {
          mioDebugPanel.textContent = mioDebugLines.join('\n');
        }
      }, 500);
    }
  }

  function toggleDebugPanel() {
    if (mioDebugPanel && mioDebugPanel.style.display !== 'none') {
      mioDebugPanel.style.display = 'none';
    } else {
      showDebugPanel();
    }
  }

  function startWelcome() {
    var supportLinks = document.querySelectorAll('.support-action');
    for (var i = 0; i < supportLinks.length; i += 1) {
      supportLinks[i].addEventListener('click', markSupportUsed);
    }
    document.addEventListener('keydown', function (event) {
      if (event.ctrlKey && event.shiftKey && String(event.key).toLowerCase() === 'm') {
        event.preventDefault();
        toggleDebugPanel();
      }
    });

    root.classList.add('welcome-loaded');
    window.setTimeout(function () {
      root.classList.add('welcome-animate');
    }, 1000);
    window.setTimeout(startMio, 2700);
  }

  function startMio() {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cramped = window.matchMedia('(max-width: 900px), (max-height: 620px)').matches;
    var companion = document.querySelector('.mio-companion');
    var base = document.querySelector('.mio-base');
    var videos = document.querySelectorAll('.mio-video');
    var activeVideo = null;
    var playSerial = 0;
    var lastEndedAt = 0;
    var bubble = document.querySelector('.mio-bubble');
    var message = document.querySelector('.mio-message');
    var lineNodes = document.querySelectorAll('.mio-lines [data-mio-kind]');
    var linesByKind = {};
    var lastLineByKind = {};
    var idleStates = [
      'idle', 'idle-fingers', 'idle-nose',
      'idle-polish', 'idle-reboot', 'idle-serious'
    ];
    var requestStates = ['begging', 'reminder'];
    var idleRemaining = 0;
    var lastIdle = '';
    var lastRequest = '';
    var sameRequestCount = 0;

    if (supportUsed || reduced || cramped || !companion || !base || videos.length < 2 || !bubble || !message) {
      return;
    }

    debugLog('Mio start; rVFC=' + (typeof videos[0].requestVideoFrameCallback === 'function'));
    if (mioDebug) {
      showDebugPanel();
    }

    for (var i = 0; i < lineNodes.length; i += 1) {
      var kind = lineNodes[i].getAttribute('data-mio-kind');
      if (!linesByKind[kind]) {
        linesByKind[kind] = [];
      }
      linesByKind[kind].push(lineNodes[i].textContent);
    }

    function hideBubble() {
      window.clearTimeout(bubbleTimer);
      bubble.classList.remove('is-visible');
      bubble.setAttribute('aria-hidden', 'true');
    }

    function pickLine(kind) {
      var lines = linesByKind[kind] || [];
      var choices;
      var text;
      if (!lines.length) {
        return '';
      }
      choices = lines.filter(function (line) {
        return line !== lastLineByKind[kind];
      });
      if (!choices.length) {
        choices = lines;
      }
      text = choices[randomInt(0, choices.length - 1)];
      lastLineByKind[kind] = text;
      return text;
    }

    function showBubble(kind, delay, chance) {
      hideBubble();
      if (typeof chance === 'number' && Math.random() >= chance) {
        return;
      }
      bubbleTimer = window.setTimeout(function () {
        var text = pickLine(kind);
        if (!text) {
          return;
        }
        message.textContent = text;
        bubble.setAttribute('aria-hidden', 'false');
        bubble.classList.add('is-visible');
      }, delay || 0);
    }

    function showIdleBubble(kind) {
      var roll = Math.random();

      if (kind === 'idle-serious') {
        if (roll < 0.50) {
          showBubble(kind, 350);
        }
        return;
      }

      if (supportUsed) {
        if (roll < 0.24) {
          showBubble('tip', 650);
        }
        return;
      }
      if (roll < 0.18) {
        showBubble('tip', 650);
      } else if (roll < 0.50) {
        showBubble(kind, 650);
      }
    }

    function pickIdle() {
      var choices = idleStates.filter(function (name) {
        return name !== lastIdle;
      });
      var next = choices[randomInt(0, choices.length - 1)];
      lastIdle = next;
      return next;
    }

    function pickRequest() {
      var next = requestStates[randomInt(0, requestStates.length - 1)];
      if (next === lastRequest && sameRequestCount >= 2) {
        next = requestStates[0] === next ? requestStates[1] : requestStates[0];
      }
      sameRequestCount = next === lastRequest ? sameRequestCount + 1 : 1;
      lastRequest = next;
      return next;
    }

    function startIdleRun() {
      idleRemaining = randomInt(1, 3);
      playNextIdle();
    }

    function playNextIdle() {
      idleRemaining -= 1;
      playState(pickIdle());
    }

    function playRequest() {
      playState(pickRequest());
    }

    function playState(next) {
      var serial = playSerial + 1;
      var nextVideo = activeVideo === videos[0] ? videos[1] : videos[0];
      var playing;

      playSerial = serial;
      hideBubble();

      nextVideo.pause();
      nextVideo.classList.remove('is-playing');
      nextVideo._mioSerial = serial;
      nextVideo._mioState = next;
      nextVideo._mioQueuedAt = window.performance.now();
      nextVideo._mioFrameRequested = false;
      nextVideo.loop = false;
      nextVideo.src = '../assets/mio/' + next + '.webm';
      debugLog('queue ' + next + ' s=' + serial + ' -> ' + (nextVideo === videos[0] ? 'A' : 'B'));
      nextVideo.load();

      if (next === 'intro') {
        showBubble('intro', 900);
      } else if (next === 'begging') {
        showBubble('begging', 350);
      } else if (next === 'reminder') {
        showBubble('reminder', 350);
      } else if (idleStates.indexOf(next) !== -1) {
        showIdleBubble(next);
      }

      playing = nextVideo.play();
      if (playing && playing.catch) {
        playing.catch(function () {
          if (nextVideo._mioSerial !== playSerial) {
            return;
          }
          if (!activeVideo) {
            base.classList.remove('is-hidden');
          }
          hideBubble();
        });
      }
    }

    function commitVideo(nextVideo, source) {
      var oldVideo;
      var now;
      var gap;

      if (nextVideo._mioSerial !== playSerial || nextVideo === activeVideo) {
        return;
      }

      now = window.performance.now();
      gap = lastEndedAt ? now - lastEndedAt : 0;
      oldVideo = activeVideo;
      nextVideo.style.zIndex = '2';
      nextVideo.classList.add('is-playing');
      activeVideo = nextVideo;
      base.classList.add('is-hidden');

      debugLog('swap ' + nextVideo._mioState + ' via ' + source +
        ' queued=' + (now - nextVideo._mioQueuedAt).toFixed(1) + 'ms' +
        (gap ? ' after-ended=' + gap.toFixed(1) + 'ms' : ''));

      if (oldVideo && oldVideo !== nextVideo) {
        oldVideo.style.zIndex = '1';
        oldVideo._mioRetireSerial = nextVideo._mioSerial;
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            if (oldVideo !== activeVideo && oldVideo._mioRetireSerial === nextVideo._mioSerial) {
              oldVideo.classList.remove('is-playing');
              oldVideo.pause();
              debugLog('retire ' + oldVideo._mioState);
            }
          });
        });
      }
    }

    function handlePlaying(event) {
      var nextVideo = event.currentTarget;
      var serial = nextVideo._mioSerial;

      if (serial !== playSerial) {
        nextVideo.pause();
        return;
      }

      debugLog('playing ' + nextVideo._mioState + ' ready=' + nextVideo.readyState +
        ' t=' + nextVideo.currentTime.toFixed(3));

      if (nextVideo._mioFrameRequested) {
        return;
      }
      nextVideo._mioFrameRequested = true;

      if (typeof nextVideo.requestVideoFrameCallback === 'function') {
        nextVideo.requestVideoFrameCallback(function (frameNow, metadata) {
          debugLog('first-frame ' + nextVideo._mioState +
            ' presented=' + (metadata && metadata.presentedFrames ? metadata.presentedFrames : '?') +
            ' media=' + (metadata && typeof metadata.mediaTime === 'number' ? metadata.mediaTime.toFixed(3) : '?'));
          commitVideo(nextVideo, 'rVFC');
        });
      } else {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(function () {
            commitVideo(nextVideo, '2xRAF');
          });
        });
      }
    }

    function handleEnded(event) {
      var endedVideo = event.currentTarget;
      var endedState;

      if (endedVideo !== activeVideo || endedVideo._mioSerial !== playSerial) {
        return;
      }

      endedState = endedVideo._mioState;
      lastEndedAt = window.performance.now();
      base.classList.remove('is-hidden');
      debugLog('ended ' + endedState + ' ready=' + endedVideo.readyState +
        ' t=' + endedVideo.currentTime.toFixed(3));
      hideBubble();

      if (endedState === 'intro') {
        startIdleRun();
        return;
      }

      if (idleStates.indexOf(endedState) !== -1) {
        if (idleRemaining > 0) {
          playNextIdle();
        } else if (supportUsed) {
          startIdleRun();
        } else {
          playRequest();
        }
        return;
      }

      if (requestStates.indexOf(endedState) !== -1 || endedState === 'success') {
        startIdleRun();
      }
    }

    function handleMediaDebug(event) {
      var video = event.currentTarget;
      debugLog(event.type + ' ' + (video._mioState || '-') + ' ' +
        (video === videos[0] ? 'A' : 'B') + ' ready=' + video.readyState +
        ' net=' + video.networkState + ' t=' + video.currentTime.toFixed(3));
    }

    for (var videoIndex = 0; videoIndex < videos.length; videoIndex += 1) {
      videos[videoIndex].addEventListener('playing', handlePlaying);
      videos[videoIndex].addEventListener('ended', handleEnded);
      ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'waiting',
        'stalled', 'suspend', 'emptied', 'error'].forEach(function (eventName) {
        videos[videoIndex].addEventListener(eventName, handleMediaDebug);
      });
    }

    successHandler = function () {
      hideBubble();
      idleRemaining = 0;
      playState('success');
    };

    companion.classList.add('is-visible');
    playState('intro');
  }

  function markSupportUsed() {
    if (supportUsed) {
      return;
    }
    supportUsed = true;
    if (successHandler) {
      successHandler();
    }
  }

  if (document.readyState === 'complete') {
    startWelcome();
  } else {
    window.addEventListener('load', startWelcome);
  }
}());
