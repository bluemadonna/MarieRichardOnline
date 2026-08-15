// ===================================================
// include.js — подгружает header.html, leftbar.html,
// rightbar.html, footer.html на каждую страницу и
// подсвечивает активный пункт меню. Перевод текста —
// в i18n.js (должен быть подключён раньше этого файла).
// Работает только через http:// (GitHub Pages,
// Cloudflare Pages, локальный сервер) — не через file://.
// ===================================================

function loadInclude(elementId, url, afterLoad) {
  fetch(url)
    .then(function (response) { return response.text(); })
    .then(function (html) {
      var el = document.getElementById(elementId);
      if (el) el.innerHTML = html;
      if (afterLoad) afterLoad();
      if (window.I18N) I18N.applyTranslations();
    })
    .catch(function (err) {
      console.error("Не удалось загрузить " + url, err);
    });
}

function highlightCurrentMenu() {
  var currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "") currentPage = "index.html";
  var links = document.querySelectorAll("#navbar a");
  links.forEach(function (link) {
    if (link.getAttribute("href") === currentPage) {
      link.parentElement.classList.add("menu-current");
    }
  });
}

function toggleMenu() {
  var list = document.querySelector("#leftbar .menu-list");
  if (list) list.classList.toggle("menu-open");
}

document.addEventListener("DOMContentLoaded", function () {
  loadInclude("site-header", "header.html");
  loadInclude("site-leftbar", "leftbar.html", function () {
    highlightCurrentMenu();
    if (window.MRO) {
      MRO.recordVisit();
      MRO.loadVisitorCount();
    }
  });
  loadInclude("site-rightbar", "rightbar.html", function () {
    if (window.MRO && MRO.initMiniPoll) MRO.initMiniPoll();
    if (window.initPlayer) initPlayer();
  });
  loadInclude("site-countdown", "countdown.html", function () {
    if (window.initCountdown) initCountdown();
  });
  loadInclude("site-footer", "footer.html");
});
