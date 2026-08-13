// ===================================================
// mro-data.js — голосование в опросах и гостевая книга
// через Supabase. Требует заполненный config.js и
// подключённую библиотеку @supabase/supabase-js (CDN,
// подключена в каждой странице перед этим файлом).
//
// Таблицы в Supabase (см. supabase_setup.sql):
//   poll_votes(id, poll_id, option_label, created_at)
//   guestbook_entries(id, name, message, created_at)
// ===================================================

var MRO = (function () {
  var client = null;
  var configured = !!(typeof SUPABASE_URL !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY);

  if (configured && window.supabase) {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  function notConfiguredNotice(el) {
    if (el) {
      el.innerHTML = '<i style="color:#a9698f;">база данных ещё не подключена — заполни config.js своими данными Supabase</i>';
    }
  }

  // ---------- POLLS ----------

  function loadPollResults(pollId, resultsEl) {
    if (!configured || !client) { notConfiguredNotice(resultsEl); return; }
    client
      .from("poll_votes")
      .select("option_label")
      .eq("poll_id", pollId)
      .then(function (res) {
        if (res.error) { console.error(res.error); return; }
        var counts = {};
        var total = res.data.length;
        res.data.forEach(function (row) {
          counts[row.option_label] = (counts[row.option_label] || 0) + 1;
        });
        renderResults(resultsEl, counts, total);
      });
  }

  function renderResults(el, counts, total) {
    if (!el) return;
    if (total === 0) {
      el.innerHTML = "<i>пока нет голосов — стань первым!</i>";
      return;
    }
    var html = "<b>всего голосов: " + total + "</b><br>";
    Object.keys(counts).forEach(function (label) {
      var pct = Math.round((counts[label] / total) * 100);
      html += label + " — " + counts[label] + " (" + pct + "%)<br>";
    });
    el.innerHTML = html;
  }

  function submitVote(pollId, optionLabel, resultsEl) {
    if (!configured || !client) { notConfiguredNotice(resultsEl); return; }
    if (!optionLabel) { alert("Выбери вариант перед голосованием!"); return; }
    client
      .from("poll_votes")
      .insert([{ poll_id: pollId, option_label: optionLabel }])
      .then(function (res) {
        if (res.error) { console.error(res.error); alert("Не удалось отправить голос."); return; }
        loadPollResults(pollId, resultsEl);
      });
  }

  function submitMiniVote() {
    var widget = document.getElementById("mini-poll-widget");
    if (!widget) return;
    var pollId = widget.getAttribute("data-poll-id");
    var selected = widget.querySelector('input[name="minipoll"]:checked');
    var resultsEl = document.getElementById("mini-poll-results");
    submitVote(pollId, selected ? selected.value : null, resultsEl);
  }

  function initMiniPoll() {
    var widget = document.getElementById("mini-poll-widget");
    if (!widget) return;
    var pollId = widget.getAttribute("data-poll-id");
    loadPollResults(pollId, document.getElementById("mini-poll-results"));
  }

  function submitFullVote(pollId, radioName, resultsElId) {
    var selected = document.querySelector('input[name="' + radioName + '"]:checked');
    var resultsEl = document.getElementById(resultsElId);
    submitVote(pollId, selected ? selected.value : null, resultsEl);
  }

  function initFullPoll(pollId, resultsElId) {
    loadPollResults(pollId, document.getElementById(resultsElId));
  }

  // список закрытых опросов для архива: [{id: 'poll-id', question: 'текст вопроса'}, ...]
  function renderPollArchive(containerId, polls) {
    var container = document.getElementById(containerId);
    if (!container) return;
    if (!polls || polls.length === 0) {
      container.innerHTML = '<p style="font-size:12px; color:#a9698f;"><i>архив пока пуст — сюда попадут завершённые опросы</i></p>';
      return;
    }
    container.innerHTML = "";
    polls.forEach(function (poll, i) {
      var box = document.createElement("div");
      box.className = "content-box";
      var resultsId = "archive-results-" + i;
      box.innerHTML = "<p style='margin:0 0 4px 0;'><b>" + escapeHtml(poll.question) + "</b></p><div id='" + resultsId + "'></div>";
      container.appendChild(box);
      loadPollResults(poll.id, box.querySelector("#" + resultsId));
    });
  }

  // ---------- GUESTBOOK ----------

  function loadGuestbook(listElId) {
    var listEl = document.getElementById(listElId);
    if (!configured || !client) { notConfiguredNotice(listEl); return; }
    client
      .from("guestbook_entries")
      .select("name, message, created_at")
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) { console.error(res.error); return; }
        if (res.data.length === 0) {
          listEl.innerHTML = "<i>записей пока нет — стань первым!</i>";
          return;
        }
        var html = "";
        res.data.forEach(function (row) {
          var d = new Date(row.created_at);
          var dateStr = d.toLocaleDateString("ru-RU") + ", " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
          html += '<div class="gb-entry">' +
            '<span class="gb-name">★ ' + escapeHtml(row.name || "Anonymous") + '</span>' +
            '&nbsp;<span class="gb-date">' + dateStr + '</span>' +
            '<p>' + escapeHtml(row.message) + '</p>' +
            '</div>';
        });
        listEl.innerHTML = html;
      });
  }

  function submitGuestbookEntry(formId, listElId) {
    var form = document.getElementById(formId);
    var statusEl = document.getElementById("gb-status");
    var nameEl = form.querySelector('[name="gbname"]');
    var msgEl = form.querySelector('[name="gbmsg"]');

    if (!configured || !client) {
      if (statusEl) notConfiguredNotice(statusEl);
      return;
    }
    if (!msgEl.value.trim()) {
      if (statusEl) statusEl.innerHTML = '<span style="color:red;">напиши что-нибудь в сообщении!</span>';
      return;
    }

    client
      .from("guestbook_entries")
      .insert([{ name: nameEl.value.trim() || "Anonymous", message: msgEl.value.trim() }])
      .then(function (res) {
        if (res.error) {
          console.error(res.error);
          if (statusEl) statusEl.innerHTML = '<span style="color:red;">не удалось отправить :( попробуй ещё раз</span>';
          return;
        }
        if (statusEl) statusEl.innerHTML = '<span style="color:green;">спасибо за запись! ♥</span>';
        nameEl.value = "";
        msgEl.value = "";
        loadGuestbook(listElId);
      });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  return {
    initMiniPoll: initMiniPoll,
    submitMiniVote: submitMiniVote,
    initFullPoll: initFullPoll,
    submitFullVote: submitFullVote,
    renderPollArchive: renderPollArchive,
    loadGuestbook: loadGuestbook,
    submitGuestbookEntry: submitGuestbookEntry
  };
})();
