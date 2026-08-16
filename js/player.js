/* ---------- player ---------- */

var TRACK_SRC = "sounds/theme.mp3";
var TRACK_TITLE = "Marie Richard — Juicy Couture";

window.initPlayer = function () {
  var audio = document.getElementById("mro-audio");
  var btn = document.getElementById("player-btn");
  var titleEl = document.getElementById("player-title");
  var eqBars = document.getElementById("eq-bars");
  if (!audio || !btn) return;

  audio.src = TRACK_SRC;
  if (titleEl) titleEl.textContent = TRACK_TITLE;

  btn.addEventListener("click", function () {
    if (audio.paused) {
      audio.play().catch(function (err) {
        console.error("Не удалось воспроизвести трек :(", err);
        if (titleEl) titleEl.textContent = "Не удалось загрузить трек :(";
      });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", function () {
    btn.classList.add("playing");
    if (eqBars) eqBars.classList.add("playing");
  });
  audio.addEventListener("pause", function () {
    btn.classList.remove("playing");
    if (eqBars) eqBars.classList.remove("playing");
  });
  audio.addEventListener("error", function () {
    if (titleEl) titleEl.textContent = "Трек не найден :(";
  });
};
