// ===================================================
// router.js — AJAX-навигация между страницами сайта.
// Клик по внутренней ссылке подгружает только контент
// (#main-col) без полной перезагрузки страницы — поэтому
// плеер, каунтдаун и всё остальное в шапке/сайдбарах не
// сбрасываются при переходах между разделами.
//
// Если fetch не сработал (например, сайт открыт как
// файл, не через http) — просто происходит обычный переход
// по ссылке, ничего не ломается.
// ===================================================

function mroNavigate(url, addToHistory) {
  fetch(url)
    .then(function (res) { return res.text(); })
    .then(function (html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, "text/html");

      var newMain = doc.getElementById("main-col");
      var mainCol = document.getElementById("main-col");
      if (!newMain || !mainCol) { window.location.href = url; return; }

      mainCol.innerHTML = newMain.innerHTML;

      var newTitle = doc.querySelector("title");
      if (newTitle) document.title = newTitle.textContent;

      if (addToHistory !== false) {
        history.pushState({ mroUrl: url }, "", url);
      }

      window.scrollTo(0, 0);

      // подсветка активного пункта меню
      document.querySelectorAll("#leftbar .menu-list li").forEach(function (li) {
        li.classList.remove("menu-current");
      });
      if (window.highlightCurrentMenu) highlightCurrentMenu();

      // пагинация (если на новой странице есть посты)
      if (window.initPaginate) initPaginate();

      // повторный запуск служебных скриптов страницы
      // (загрузка опроса, гостевой книги и т.п.)
      var initScripts = doc.querySelectorAll("script[data-page-init]");
      initScripts.forEach(function (oldScript) {
        var newScript = document.createElement("script");
        newScript.textContent = oldScript.textContent;
        document.body.appendChild(newScript);
        document.body.removeChild(newScript);
      });
    })
    .catch(function (err) {
      console.error("Не удалось загрузить " + url + " через AJAX, обычный переход:", err);
      window.location.href = url;
    });
}

document.addEventListener("click", function (e) {
  var link = e.target.closest("a");
  if (!link) return;

  var href = link.getAttribute("href");
  if (!href) return;
  if (href.indexOf("#") === 0) return;
  if (href.indexOf("http://") === 0 || href.indexOf("https://") === 0) return;
  if (href.indexOf("mailto:") === 0) return;
  if (href.slice(-5) !== ".html") return;

  e.preventDefault();
  mroNavigate(href);
});

window.addEventListener("popstate", function () {
  var page = window.location.pathname.split("/").pop() || "index.html";
  mroNavigate(page, false);
});
