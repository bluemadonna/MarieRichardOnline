/* ---------- Supabase connection ---------- */

var MRO = (function () {
  var client = null;
  var configured = !!(typeof SUPABASE_URL !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY);

  if (configured && window.supabase) {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  function notConfiguredNotice(el) {
    if (el) {
      el.innerHTML = '<i style="color:#a9698f;">База данных ещё не подключена :(</i>';
    }
  }

/* ---------- polls ---------- */

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
      el.innerHTML = "<i>Пока голосов нет — стань первым!</i>";
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
        if (res.error) { console.error(res.error); alert("Не удалось отправить голос :("); return; }
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
  }

  function submitFullVote(pollId, radioName, resultsElId) {
    var selected = document.querySelector('input[name="' + radioName + '"]:checked');
    var resultsEl = document.getElementById(resultsElId);
    submitVote(pollId, selected ? selected.value : null, resultsEl);
  }

  function initFullPoll(pollId, resultsElId) {
  }

/* ---------- archive polls list [{id: 'poll-id', question: 'текст вопроса'}, ...] ---------- */

  function renderPollArchive(containerId, polls) {
    var container = document.getElementById(containerId);
    if (!container) return;
    if (!polls || polls.length === 0) {
      container.innerHTML = '<p style="font-size:12px; color:#a9698f;"><i>Архив пока пуст — сюда попадут завершённые опросы!</i></p>';
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

/* ---------- guestbook ---------- */

  function loadGuestbook(listElId, paginationElId, perPage) {
    var listEl = document.getElementById(listElId);
    var paginationEl = paginationElId ? document.getElementById(paginationElId) : null;
    perPage = perPage || 7;

    if (!configured || !client) { notConfiguredNotice(listEl); return; }

    client
      .from("guestbook_entries")
      .select("name, message, created_at")
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) { console.error(res.error); return; }
        if (res.data.length === 0) {
          listEl.innerHTML = "<i>Записей пока нет — стань первым!</i>";
          if (paginationEl) paginationEl.innerHTML = "";
          return;
        }
        renderGuestbookPage(res.data, 1, perPage, listEl, paginationEl);
      });
  }

  function entryHtml(row) {
    var d = new Date(row.created_at);
    var dd = String(d.getDate()).padStart(2, "0");
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var hh = String(d.getHours()).padStart(2, "0");
    var min = String(d.getMinutes()).padStart(2, "0");
    var dateStr = dd + "." + mm + ".2001, " + hh + ":" + min;
    return '<div class="gb-entry">' +
      '<span class="gb-name">★ ' + escapeHtml(row.name || "Anonymous") + '</span>' +
      '&nbsp;<span class="gb-date">' + dateStr + '</span>' +
      '<p>' + escapeHtml(row.message) + '</p>' +
      '</div>';
  }

  function renderGuestbookPage(allEntries, pageNum, perPage, listEl, paginationEl) {
    var totalPages = Math.max(1, Math.ceil(allEntries.length / perPage));
    var start = (pageNum - 1) * perPage;
    var pageEntries = allEntries.slice(start, start + perPage);

    listEl.innerHTML = pageEntries.map(entryHtml).join("");

    if (!paginationEl || totalPages <= 1) {
      if (paginationEl) paginationEl.innerHTML = "";
      return;
    }

    var html = "";

	html += '<a href="#" data-page="' + Math.max(1, pageNum - 1) +
	  '" class="page-link' + (pageNum === 1 ? ' disabled' : '') +
	  '">&laquo; назад</a>';

	var pages = [];

	if (totalPages <= 5) {
	  for (var p = 1; p <= totalPages; p++) {
		pages.push(p);
	  }

	} else if (pageNum <= 3) {
	  pages.push(1, 2, 3, 4, 5);
	  pages.push("...");
	  pages.push(totalPages);

	} else if (pageNum >= totalPages - 2) {
	  pages.push(1);
	  pages.push("...");
	  for (var p = totalPages - 4; p <= totalPages; p++) {
		pages.push(p);
	  }

	} else {
	  pages.push(1);
	  pages.push("...");
	  pages.push(pageNum - 1);
	  pages.push(pageNum);
	  pages.push(pageNum + 1);
	  pages.push("...");
	  pages.push(totalPages);
	}

	pages.forEach(function (p) {
	  if (p === "...") {
		html += '<span class="page-dots">...</span>';
	  } else {
		html += '<a href="#" data-page="' + p +
		  '" class="page-link' +
		  (p === pageNum ? ' page-current' : '') +
		  '">' + p + '</a>';
	  }
	});

	html += '<a href="#" data-page="' + Math.min(totalPages, pageNum + 1) +
	  '" class="page-link' +
	  (pageNum === totalPages ? ' disabled' : '') +
	  '">вперёд &raquo;</a>';
	
    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll(".page-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var page = parseInt(this.getAttribute("data-page"), 10);
        renderGuestbookPage(allEntries, page, perPage, listEl, paginationEl);
        listEl.scrollIntoView({ behavior: "instant", block: "start" });
      });
    });
  }

  function submitGuestbookEntry(formId, listElId, paginationElId) {
    var form = document.getElementById(formId);
    var statusEl = document.getElementById("gb-status");
    var nameEl = form.querySelector('[name="gbname"]');
    var msgEl = form.querySelector('[name="gbmsg"]');

    if (!configured || !client) {
      if (statusEl) notConfiguredNotice(statusEl);
      return;
    }
    if (!msgEl.value.trim()) {
      if (statusEl) statusEl.innerHTML = '<span style="color:red;">Нельзя отправить пустую запись!</span>';
      return;
    }

    client
      .from("guestbook_entries")
      .insert([{ name: nameEl.value.trim() || "Anonymous", message: msgEl.value.trim() }])
      .then(function (res) {
        if (res.error) {
          console.error(res.error);
          if (statusEl) statusEl.innerHTML = '<span style="color:red;">Не удалось отправить :( Попробуй ещё раз!</span>';
          return;
        }
        if (statusEl) statusEl.innerHTML = '<span style="color:green;">Спасибо за запись ♥</span>';
        nameEl.value = "";
        msgEl.value = "";
        loadGuestbook(listElId, paginationElId);
      });
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

/* ---------- visitor counter ---------- */

  function recordVisit() {
    if (!configured || !client) return;
    client.from("page_views").insert([{}]).then(function (res) {
      if (res.error) console.error(res.error);
    });
  }

  function loadVisitorCount() {
    var box = document.getElementById("visitor-count");
    var numEl = document.getElementById("visitor-number");
    if (!configured || !client) {
      if (box) box.textContent = "------";
      if (numEl) numEl.textContent = "?";
      return;
    }
    client
      .from("page_views")
      .select("*", { count: "exact", head: true })
      .then(function (res) {
        if (res.error) { console.error(res.error); return; }
        var count = res.count || 0;
        var padded = String(count).padStart(6, "0");
        if (box) box.textContent = padded;
        if (numEl) numEl.textContent = count;
      });
  }

  return {
    initMiniPoll: initMiniPoll,
    submitMiniVote: submitMiniVote,
    initFullPoll: initFullPoll,
    submitFullVote: submitFullVote,
    renderPollArchive: renderPollArchive,
    loadGuestbook: loadGuestbook,
    submitGuestbookEntry: submitGuestbookEntry,
    recordVisit: recordVisit,
    loadVisitorCount: loadVisitorCount
  };
})();
