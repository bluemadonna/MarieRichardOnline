/* ---------- pagination for blog and news ---------- */

window.initPaginate = function () {
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

	  html += '<a href="#" data-page="' + Math.max(1, current - 1) +
		'" class="page-link' +
		(current === 1 ? ' disabled' : '') +
		'">&laquo; назад</a>';

	  var pages = [];

	  if (totalPages <= 5) {
		for (var p = 1; p <= totalPages; p++) {
		  pages.push(p);
		}

	  } else if (current <= 3) {
		pages.push(1, 2, 3, 4, 5);
		pages.push("...");
		pages.push(totalPages);

	  } else if (current >= totalPages - 2) {
		pages.push(1);
		pages.push("...");

		for (var p = totalPages - 4; p <= totalPages; p++) {
		  pages.push(p);
		}

	  } else {
		pages.push(1);
		pages.push("...");
		pages.push(current - 1);
		pages.push(current);
		pages.push(current + 1);
		pages.push("...");
		pages.push(totalPages);
	  }

	  pages.forEach(function (p) {
		if (p === "...") {
		  html += '<span class="page-dots">...</span>';
		} else {
		  html += '<a href="#" data-page="' + p +
			'" class="page-link' +
			(p === current ? ' page-current' : '') +
			'">' + p + '</a>';
		}
	  });

	  html += '<a href="#" data-page="' + Math.min(totalPages, current + 1) +
		'" class="page-link' +
		(current === totalPages ? ' disabled' : '') +
		'">вперёд &raquo;</a>';

	  controls.innerHTML = html;

	  controls.querySelectorAll(".page-link").forEach(function (link) {
		link.addEventListener("click", function (e) {
		  e.preventDefault();

		  if (this.classList.contains("disabled")) {
			return;
		  }

		  var page = parseInt(this.getAttribute("data-page"), 10);
		  showPage(page);
		});
	  });
	}

    showPage(1);
  });
};

document.addEventListener("DOMContentLoaded", window.initPaginate);
