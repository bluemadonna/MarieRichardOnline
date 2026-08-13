// ===================================================
// include.js — подгружает header.html, leftbar.html,
// rightbar.html, footer.html на каждую страницу,
// подсвечивает активный пункт меню и переключает язык.
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

function setLang(lang) {
  document.body.classList.remove("lang-ru", "lang-en");
  document.body.classList.add("lang-" + lang);
  localStorage.setItem("mro_lang", lang);
  var ruBtn = document.getElementById("lang-ru-btn");
  var enBtn = document.getElementById("lang-en-btn");
  if (ruBtn && enBtn) {
    ruBtn.classList.toggle("lang-active", lang === "ru");
    enBtn.classList.toggle("lang-active", lang === "en");
  }
}

function applyStoredLang() {
  var saved = localStorage.getItem("mro_lang") || "ru";
  setLang(saved);
}

document.addEventListener("DOMContentLoaded", function () {
  loadInclude("site-header", "header.html", applyStoredLang);
  loadInclude("site-leftbar", "leftbar.html", function () {
    highlightCurrentMenu();
    applyStoredLang();
  });
  loadInclude("site-rightbar", "rightbar.html", function () {
    applyStoredLang();
    if (window.MRO && MRO.initMiniPoll) MRO.initMiniPoll();
  });
  loadInclude("site-footer", "footer.html", applyStoredLang);
});
