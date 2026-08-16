/* ---------- photo viewer ---------- */

(function () {
  function buildOverlay() {
    var overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.id = "lightbox-overlay";
    overlay.innerHTML =
      '<div class="lightbox-content">' +
      '<span class="lightbox-close" onclick="closeLightbox()">&times;</span>' +
      '<img id="lightbox-img" src="" alt="">' +
      "</div>";
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLightbox();
    });
    document.body.appendChild(overlay);
    return overlay;
  }

  window.openLightbox = function (src, alt) {
    var overlay = document.getElementById("lightbox-overlay") || buildOverlay();
    document.getElementById("lightbox-img").src = src;
    document.getElementById("lightbox-img").alt = alt || "";
    overlay.classList.add("open");
  };

  window.closeLightbox = function () {
    var overlay = document.getElementById("lightbox-overlay");
    if (overlay) overlay.classList.remove("open");
  };

  document.addEventListener("click", function (e) {
    var link = e.target.closest(".gallery-grid a");
    if (!link) return;
    e.preventDefault();
    var img = link.querySelector("img");
    window.openLightbox(link.getAttribute("href"), img ? img.alt : "");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") window.closeLightbox();
  });
})();
