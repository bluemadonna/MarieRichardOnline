// ===================================================
// player.js — стилизованный под ретро-плеер виджет.
// Технически это <audio> с реальным mp3/ogg файлом
// (настоящий MIDI браузеры без синтезатора не проигрывают,
// поэтому визуально "миди-плеер", а по факту — mp3-плеер).
//
// Чтобы поменять трек:
// 1) положи файл в папку /sounds/ (например sounds/theme.mp3)
// 2) поменяй TRACK_SRC и TRACK_TITLE ниже
// ===================================================

var TRACK_SRC = "sounds/theme.mp3";
var TRACK_TITLE = "Marie Richard — Track Title";

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
        console.error("Не удалось воспроизвести трек:", err);
        if (titleEl) titleEl.textContent = "не удалось загрузить трек :(";
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
    if (titleEl) titleEl.textContent = "трек не найден — положи файл в sounds/";
  });
};
