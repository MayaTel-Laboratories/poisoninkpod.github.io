(function () {
  var root = document.querySelector(".ipod-photo");
  if (!root) return;
  var q = function (s) { return root.querySelector(s); };
  var title = q(".ipod-title");
  var box = q(".ipod-track");
  var track = q(".ipod-track span");
  var count = q(".ipod-count-text");
  var fill = q(".ipod-progress span");
  var elapsedEl = q(".ipod-elapsed");
  var remainEl = q(".ipod-remaining");
  var img = root.querySelector("img");
  var feed = root.getAttribute("data-feed");
  var total = 3600;
  var elapsed = 0;
  var showClock = false;
  var timer;
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function fmt(s) {
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    return h ? h + ":" + pad(m) + ":" + pad(sec) : m + ":" + pad(sec);
  }

  function draw() {
    elapsedEl.textContent = fmt(elapsed);
    remainEl.textContent = "-" + fmt(total - elapsed);
    fill.style.width = (elapsed / total * 100) + "%";
  }

  function parseDuration(text) {
    var parts = text.replace(/^\s+|\s+$/g, "").split(":");
    var n = 0;
    for (var i = 0; i < parts.length; i++) n = n * 60 + (parseFloat(parts[i]) || 0);
    return Math.round(n);
  }

  function marquee() {
    clearTimeout(timer);
    track.style.transform = "translateX(0)";
    if (still) return;
    var over = track.offsetWidth - box.clientWidth;
    if (over <= 0) return;
    var x = 0;
    function step() {
      x++;
      track.style.transform = "translateX(-" + x + "px)";
      if (x >= over) {
        timer = setTimeout(function () {
          x = 0;
          track.style.transform = "translateX(0)";
          timer = setTimeout(step, 2000);
        }, 1500);
      } else {
        timer = setTimeout(step, 45);
      }
    }
    timer = setTimeout(step, 2000);
  }

  function clock() {
    var d = new Date();
    var h = d.getHours() % 12 || 12;
    return h + ":" + pad(d.getMinutes()) + (d.getHours() < 12 ? " AM" : " PM");
  }

  draw();
  marquee();

  if (!still) {
    setInterval(function () {
      elapsed++;
      if (elapsed >= total) elapsed = 0;
      draw();
    }, 1000);
    setInterval(function () {
      showClock = !showClock;
      title.textContent = showClock ? clock() : "Now Playing";
    }, 4000);
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(marquee);

  if (feed && window.fetch) {
    fetch(feed)
      .then(function (r) {
        if (!r.ok) throw new Error("feed");
        return r.json();
      })
      .then(function (data) {
        if (data.title) {
          track.textContent = data.title;
          img.alt = "A green iPod mini playing " + data.title + " from Poison Ink";
        }
        var secs = data.duration ? parseDuration(String(data.duration)) : 0;
        if (secs > 0) total = secs;
        elapsed = 0;
        if (data.count) count.textContent = "1 of " + data.count;
        draw();
        marquee();
      })
      .catch(function () {});
  }
})();
