/* ---------- ajax-navigation ---------- */

function mroNavigate(url, addToHistory) {
  var urlObj = new URL(url, window.location.href);
  var pageUrl = urlObj.pathname + urlObj.search;
  var hash = urlObj.hash;

  fetch(pageUrl)
    .then(function (res) { return res.text(); })
    .then(function (html) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, "text/html");

      var newMain = doc.getElementById("main-col");
      var mainCol = document.getElementById("main-col");

      if (!newMain || !mainCol) {
        window.location.href = url;
        return;
      }

      mainCol.innerHTML = newMain.innerHTML;

      var newTitle = doc.querySelector("title");
      if (newTitle) document.title = newTitle.textContent;

      if (addToHistory !== false) {
        history.pushState({ mroUrl: url }, "", url);
      }

      document.querySelectorAll("#leftbar .menu-list li").forEach(function (li) {
        li.classList.remove("menu-current");
      });

		if (window.highlightCurrentMenu) {
		  highlightCurrentMenu();
		}

		if (window.initPaginate) {
		  initPaginate();
		}

		if (window.initGalleryPaginate) {
		  initGalleryPaginate();
		}
      var initScripts = doc.querySelectorAll("script[data-page-init]");
      initScripts.forEach(function (oldScript) {
        var newScript = document.createElement("script");
        newScript.textContent = oldScript.textContent;
        document.body.appendChild(newScript);
        document.body.removeChild(newScript);
      });

      window.scrollTo(0, 0);

      if (hash) {
        setTimeout(function () {
          var target = document.querySelector(hash);

          if (target) {
            target.scrollIntoView({
              behavior: "instant",
              block: "start"
            });
          }
        }, 0);
      }
    })
    .catch(function (err) {
      console.error("Не удалось загрузить " + url + " через AJAX, обычный переход :(", err);
      window.location.href = url;
    });
}

document.addEventListener("click", function (e) {
  var link = e.target.closest("a");
  if (!link) return;

  var href = link.getAttribute("href");
  if (!href) return;

  if (href.indexOf("#") === 0) {
    e.preventDefault();

    var target = document.getElementById(href.substring(1));

    if (target) {
      target.scrollIntoView({
        behavior: "instant",
        block: "start"
      });

      history.pushState(null, "", href);
    }

    return;
  }

  if (href.indexOf("http://") === 0 || href.indexOf("https://") === 0) return;
  if (href.indexOf("mailto:") === 0) return;

  var url = new URL(href, window.location.href);

  if (!url.pathname.endsWith(".html")) return;

  e.preventDefault();
  mroNavigate(href);
});

window.addEventListener("popstate", function () {
  var url = window.location.pathname.split("/").pop() || "index.html";
  url += window.location.search;
  url += window.location.hash;

  mroNavigate(url, false);
});
