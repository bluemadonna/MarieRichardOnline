/* ---------- gallery pagination ---------- */

window.initGalleryPaginate = function () {

  var galleries = document.querySelectorAll(".paginated-gallery");

  galleries.forEach(function (gallery) {

    var perPage = parseInt(
      gallery.getAttribute("data-per-page"),
      10
    ) || 9;

    var photos = Array.prototype.slice.call(
      gallery.querySelectorAll(".thumb")
    );

    var totalPages = Math.max(
      1,
      Math.ceil(photos.length / perPage)
    );

    var controls = gallery.nextElementSibling;

    if (
      !controls ||
      !controls.classList.contains("gallery-pagination")
    ) {
      controls = document.createElement("div");
      controls.className = "gallery-pagination";

      gallery.parentNode.insertBefore(
        controls,
        gallery.nextSibling
      );
    }

    function showPage(pageNum) {

      photos.forEach(function (photo, i) {

        var page =
          Math.floor(i / perPage) + 1;

        photo.style.display =
          page === pageNum ? "" : "none";

      });

      renderControls(pageNum);
    }

    function renderControls(current) {

  if (totalPages <= 1) {
    controls.innerHTML = "";
    return;
  }

  var html = "";


  html +=
    '<a href="#" data-page="' +
    Math.max(1, current - 1) +
    '" class="page-link' +
    (current === 1 ? " disabled" : "") +
    '">&laquo;</a>';

  var pages = [];

  if (totalPages <= 7) {


    for (var p = 1; p <= totalPages; p++) {
      pages.push(p);
    }

  } else {


    pages.push(1);

    if (current <= 4) {

      pages.push(2);
      pages.push(3);
      pages.push(4);
      pages.push(5);
      pages.push("...");

    } else if (current >= totalPages - 3) {

      pages.push("...");
      pages.push(totalPages - 4);
      pages.push(totalPages - 3);
      pages.push(totalPages - 2);
      pages.push(totalPages - 1);

    } else {

      pages.push("...");
      pages.push(current - 1);
      pages.push(current);
      pages.push(current + 1);
      pages.push("...");
    }

    pages.push(totalPages);
  }

  pages.forEach(function (p) {

    if (p === "...") {

      html +=
        '<span class="page-dots">...</span>';

    } else {

      html +=
        '<a href="#" data-page="' +
        p +
        '" class="page-link' +
        (p === current ? " page-current" : "") +
        '">' +
        p +
        "</a>";
    }

  });


  html +=
    '<a href="#" data-page="' +
    Math.min(totalPages, current + 1) +
    '" class="page-link' +
    (current === totalPages ? " disabled" : "") +
    '">&raquo;</a>';

  controls.innerHTML = html;

  controls
    .querySelectorAll(".page-link")
    .forEach(function (link) {

      link.addEventListener("click", function (e) {

        e.preventDefault();

        if (this.classList.contains("disabled")) {
          return;
        }

        var page = parseInt(
          this.getAttribute("data-page"),
          10
        );

        showPage(page);

        gallery.scrollIntoView({
          behavior: "instant",
          block: "start"
        });

      });

    });
}

    showPage(1);

  });

};

document.addEventListener(
  "DOMContentLoaded",
  window.initGalleryPaginate
);