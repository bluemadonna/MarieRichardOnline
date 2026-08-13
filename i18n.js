// ===================================================
// i18n.js — локализация через JSON.
// В HTML остаются только ключи: <span data-i18n="nav.home">
// Тексты подгружаются из lang/ru.json или lang/en.json.
//
// Т.к. header/leftbar/rightbar/footer подгружаются
// асинхронно через include.js, applyTranslations()
// вызывается и здесь (когда словарь готов), и из
// include.js (когда очередной фрагмент вставлен в DOM) —
// какой бы из двух ни случился позже, перевод применится.
// ===================================================

var I18N = (function () {
  var dict = {};

  function getNested(path) {
    return path.split(".").reduce(function (o, k) {
      return (o && o[k] !== undefined) ? o[k] : undefined;
    }, dict);
  }

  function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var value = getNested(el.getAttribute("data-i18n"));
      if (value !== undefined) el.innerHTML = value;
    });
  }

  function setLang(lang) {
    fetch("lang/" + lang + ".json")
      .then(function (r) { return r.json(); })
      .then(function (json) {
        dict = json;
        applyTranslations();
        localStorage.setItem("mro_lang", lang);
        var ruBtn = document.getElementById("lang-ru-btn");
        var enBtn = document.getElementById("lang-en-btn");
        if (ruBtn && enBtn) {
          ruBtn.classList.toggle("lang-active", lang === "ru");
          enBtn.classList.toggle("lang-active", lang === "en");
        }
      })
      .catch(function (err) {
        console.error("Не удалось загрузить lang/" + lang + ".json", err);
      });
  }

  function init() {
    var saved = localStorage.getItem("mro_lang") || "ru";
    setLang(saved);
  }

  return { init: init, setLang: setLang, applyTranslations: applyTranslations };
})();

function setLang(lang) { I18N.setLang(lang); }

document.addEventListener("DOMContentLoaded", I18N.init);
