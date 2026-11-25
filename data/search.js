(function () {
  var form = document.querySelector("[data-data-search-form]");
  var input = document.querySelector("[data-data-search]");
  var listHost = document.querySelector("[data-browse-list]");
  var countEl = document.querySelector("[data-browse-count]");
  var picker = document.querySelector("[data-picker]");
  var pickerTitle = document.querySelector("[data-picker-title]");
  var pickerHint = document.querySelector("[data-picker-hint]");
  var pickerGrid = document.querySelector("[data-picker-grid]");
  var groupButtons = Array.prototype.slice.call(document.querySelectorAll("[data-group]"));
  if (!form || !input || !listHost || !countEl || !picker || !pickerGrid || !groupButtons.length) return;

  var photos = {
    "Dorsa Amir": "../assets/images/researchers/dorsa-amir.png",
    "Alissa Rivero": "../assets/images/researchers/alissa-rivero.jpg",
    "Julia Bainbridge": "../assets/images/researchers/julia-bainbridge.png",
    "Gita Paladugu": "../assets/images/researchers/gita-paladugu.png",
    "Serena Spada": "../assets/images/researchers/serena-spada.png"
  };

  var researcherOrder = [
    "Dorsa Amir",
    "Julia Smith",
    "Alissa Rivero",
    "Julia Bainbridge",
    "Gita Paladugu",
    "Serena Spada"
  ];

  var topicOrder = [
    { id: "exploration", label: "Exploration" },
    { id: "morality", label: "Morality" },
    { id: "cooperation", label: "Cooperation" },
    { id: "generosity", label: "Generosity" },
    { id: "decision-making", label: "Decision making" }
  ];

  var studies = [];
  var groupMode = "study";
  var activeTarget = "";
  var highlightTimer = null;

  function addText(parent, tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function studyHref(study) {
    return "../studies/" + study.id + "/";
  }

  function journalOf(study) {
    var citation = study.citation;
    if (!citation || typeof citation !== "string") return "";
    var known = [
      "Science Advances",
      "Child Development",
      "Developmental Science",
      "Developmental Psychology",
      "Journal of Experimental Child Psychology",
      "Journal of Experimental Psychology: General",
      "PLOS ONE"
    ];
    for (var i = 0; i < known.length; i += 1) {
      if (citation.indexOf(known[i]) !== -1) return known[i];
    }
    return "";
  }

  function matchesQuery(study, query) {
    if (!query) return true;
    var haystack = [study.name, study.topic, study.ageLabel]
      .concat(study.leads || [])
      .concat(study.keywords || [])
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function filteredStudies() {
    var query = input.value.trim().toLowerCase();
    return studies.filter(function (study) {
      return matchesQuery(study, query);
    });
  }

  function studiesForResearcher(name, list) {
    return list.filter(function (study) {
      return (study.leads || []).indexOf(name) !== -1;
    });
  }

  function studiesForTopic(topicId, list) {
    return list.filter(function (study) {
      return (study.keywords || []).indexOf(topicId) !== -1;
    });
  }

  function makeStudyCard(study) {
    var card = document.createElement("a");
    card.className = "card";
    card.href = studyHref(study);
    var metaParts = [study.topic, "Ages " + study.ageLabel];
    var journal = journalOf(study);
    if (journal) metaParts.push(journal);
    addText(card, "p", "meta", metaParts.join(" · "));
    addText(card, "h3", "", study.name);
    addText(card, "p", "", (study.leads || []).join(", "));
    return card;
  }

  function makeCardsGrid(items) {
    var grid = document.createElement("div");
    grid.className = "cards";
    items.forEach(function (study) {
      grid.appendChild(makeStudyCard(study));
    });
    return grid;
  }

  function sectionId(kind, key) {
    return "group-" + kind + "-" + slugify(key);
  }

  function renderGrouped(kind, sections) {
    listHost.replaceChildren();
    var shown = 0;
    sections.forEach(function (section) {
      if (!section.items.length) return;
      shown += section.items.length;
      var block = document.createElement("section");
      block.className = "data-browse-group";
      block.id = sectionId(kind, section.key || section.title);
      block.dataset.groupKey = section.key || section.title;

      var head = document.createElement("div");
      head.className = "data-browse-group-head";
      addText(head, "h3", "data-browse-group-title", section.title);
      addText(
        head,
        "p",
        "data-browse-group-meta",
        section.items.length === 1 ? "1 study" : section.items.length + " studies"
      );
      block.appendChild(head);
      block.appendChild(makeCardsGrid(section.items));
      listHost.appendChild(block);
    });
    return shown;
  }

  function markPickerActive() {
    Array.prototype.forEach.call(pickerGrid.querySelectorAll("[data-jump]"), function (btn) {
      btn.setAttribute("aria-current", btn.getAttribute("data-jump") === activeTarget ? "true" : "false");
    });
  }

  function jumpTo(targetId) {
    activeTarget = targetId;
    markPickerActive();
    var el = document.getElementById(targetId);
    if (!el) return;
    el.classList.remove("is-flash");
    // Force reflow so the flash can replay
    void el.offsetWidth;
    el.classList.add("is-flash");
    if (highlightTimer) window.clearTimeout(highlightTimer);
    highlightTimer = window.setTimeout(function () {
      el.classList.remove("is-flash");
    }, 1400);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, "", "#" + targetId);
    }
  }

  function renderResearcherPicker(list) {
    pickerTitle.textContent = "Choose a researcher";
    pickerHint.textContent = "Jump to their studies below";
    pickerGrid.replaceChildren();
    researcherOrder.forEach(function (name) {
      var count = studiesForResearcher(name, list).length;
      if (!count && input.value.trim()) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "data-pick data-pick-person";
      btn.setAttribute("role", "listitem");
      btn.setAttribute("data-jump", sectionId("researcher", name));
      if (photos[name]) {
        var img = document.createElement("img");
        img.className = "data-pick-photo";
        img.src = photos[name];
        img.alt = "";
        img.width = 64;
        img.height = 64;
        btn.appendChild(img);
      } else {
        var initial = document.createElement("span");
        initial.className = "data-pick-initial";
        initial.textContent = name.charAt(0);
        btn.appendChild(initial);
      }
      addText(btn, "span", "data-pick-name", name);
      addText(btn, "span", "data-pick-meta", count === 1 ? "1 study" : count + " studies");
      btn.addEventListener("click", function () {
        jumpTo(btn.getAttribute("data-jump"));
      });
      pickerGrid.appendChild(btn);
    });
    markPickerActive();
  }

  function renderTopicPicker(list) {
    pickerTitle.textContent = "Choose a topic";
    pickerHint.textContent = "Jump to matching studies below";
    pickerGrid.replaceChildren();
    topicOrder.forEach(function (topic) {
      var count = studiesForTopic(topic.id, list).length;
      if (!count && input.value.trim()) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "data-pick data-pick-topic";
      btn.setAttribute("role", "listitem");
      btn.setAttribute("data-jump", sectionId("topic", topic.id));
      addText(btn, "span", "data-pick-name", topic.label);
      addText(btn, "span", "data-pick-meta", count === 1 ? "1 study" : count + " studies");
      btn.addEventListener("click", function () {
        jumpTo(btn.getAttribute("data-jump"));
      });
      pickerGrid.appendChild(btn);
    });
    markPickerActive();
  }

  function render() {
    var list = filteredStudies();
    listHost.replaceChildren();
    activeTarget = "";

    if (!list.length) {
      picker.hidden = true;
      countEl.textContent = input.value.trim() ? "Nothing matches." : "No studies yet.";
      return;
    }

    if (groupMode === "researcher") {
      picker.hidden = false;
      renderResearcherPicker(list);
      var researcherSections = researcherOrder.map(function (name) {
        return { title: name, key: name, items: studiesForResearcher(name, list) };
      });
      var n = renderGrouped("researcher", researcherSections);
      countEl.textContent =
        n === 1 ? "1 study · grouped by researcher" : n + " studies · grouped by researcher";
      return;
    }

    if (groupMode === "topic") {
      picker.hidden = false;
      renderTopicPicker(list);
      var topicSections = topicOrder.map(function (topic) {
        return { title: topic.label, key: topic.id, items: studiesForTopic(topic.id, list) };
      });
      var nTopic = renderGrouped("topic", topicSections);
      countEl.textContent =
        nTopic === 1 ? "1 study · grouped by topic" : nTopic + " studies · grouped by topic";
      return;
    }

    picker.hidden = true;
    listHost.appendChild(makeCardsGrid(list));
    countEl.textContent = list.length === 1 ? "1 study" : list.length + " studies";
  }

  function setGroup(mode) {
    groupMode = mode;
    groupButtons.forEach(function (btn) {
      var selected = btn.getAttribute("data-group") === mode;
      btn.setAttribute("aria-selected", selected ? "true" : "false");
    });
    render();
  }

  groupButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setGroup(btn.getAttribute("data-group"));
      if (modeNeedsPicker(btn.getAttribute("data-group"))) {
        picker.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  });

  function modeNeedsPicker(mode) {
    return mode === "researcher" || mode === "topic";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });

  input.addEventListener("input", render);

  var params = new URLSearchParams(window.location.search);
  var initialGroup = params.get("group");
  if (initialGroup === "researcher" || initialGroup === "topic" || initialGroup === "study") {
    groupMode = initialGroup;
  } else if (/^#group-researcher-/.test(location.hash)) {
    groupMode = "researcher";
  } else if (/^#group-topic-/.test(location.hash)) {
    groupMode = "topic";
  } else if (location.hash === "#topics" || location.hash.indexOf("topic") !== -1) {
    groupMode = "topic";
  } else if (location.hash === "#researchers" || location.hash.indexOf("researcher") !== -1) {
    groupMode = "researcher";
  }

  fetch("./studies.json")
    .then(function (res) {
      if (!res.ok) throw new Error("Could not load studies");
      return res.json();
    })
    .then(function (payload) {
      studies = payload.studies || [];
      setGroup(groupMode);
      if (location.hash && document.getElementById(location.hash.slice(1))) {
        window.setTimeout(function () {
          jumpTo(location.hash.slice(1));
        }, 60);
      }
    })
    .catch(function () {
      countEl.textContent = "The study list could not be loaded.";
      listHost.replaceChildren();
      picker.hidden = true;
    });
})();
