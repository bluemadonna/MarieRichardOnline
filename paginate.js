// ===================================================
// paginate.js — постраничная навигация для блоков постов
// (Новости, Блог). Работает полностью на клиенте, без
// сервера — просто прячет/показывает уже существующие
// на странице записи. Работает и при открытии файла
// напрямую (file://), т.к. ничего не подгружает.
//
// Использование: обернуть посты в
// <div class="paginated-posts" data-per-page="10"> ... </div>
// и добавить пустой <div class="pagination-controls"></div>
// сразу после — скрипт сам найдёт и заполнит его.
// ===================================================

document.addEventListener("DOMContentLoaded", function () {
  var containers = document.querySelectorAll(".paginated-posts");

  containers.forEach(function (container) {
    var perPage = parseInt(container.getAttribute("data-per-page"), 10) || 10;
    var posts = Array.prototype.slice.call(container.querySelectorAll(":scope > .post"));
    var totalPages = Math.max(1, Math.ceil(posts.length / perPage));

    var controls = container.nextElementSibling;
    if (!controls || !controls.classList.contains("pagination-controls")) {
      controls = document.createElement("div");
      controls.className = "pagination-controls";
      container.parentNode.insertBefore(controls, container.nextSibling);
    }

    function showPage(pageNum) {
      posts.forEach(function (post, i) {
        var page = Math.floor(i / perPage) + 1;
        post.style.display = (page === pageNum) ? "" : "none";
      });
      renderControls(pageNum);
      container.scrollIntoView({ behavior: "instant", block: "start" });
    }

    function renderControls(current) {
      if (totalPages <= 1) {
        controls.innerHTML = "";
        return;
      }
      var html = "";
      html += '<a href="#" data-page="' + Math.max(1, current - 1) + '" class="page-link' + (current === 1 ? ' disabled' : '') + '">&laquo; назад</a>';
      for (var p = 1; p <= totalPages; p++) {
        html += '<a href="#" data-page="' + p + '" class="page-link' + (p === current ? ' page-current' : '') + '">' + p + '</a>';
      }
      html += '<a href="#" data-page="' + Math.min(totalPages, current + 1) + '" class="page-link' + (current === totalPages ? ' disabled' : '') + '">вперёд &raquo;</a>';
      controls.innerHTML = html;

      controls.querySelectorAll(".page-link").forEach(function (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          var page = parseInt(this.getAttribute("data-page"), 10);
          showPage(page);
        });
      });
    }

    showPage(1);
  });
});
