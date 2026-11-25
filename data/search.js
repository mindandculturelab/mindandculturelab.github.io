(function () {
  var form = document.querySelector("[data-data-search-form]");
  var input = document.querySelector("[data-data-search]");
  var listHost = document.querySelector("[data-browse-list]");
  var countEl = document.querySelector("[data-browse-count]");
  var groupButtons = Array.prototype.slice.call(document.querySelectorAll("[data-group]"));
  if (!form || !input || !listHost || !countEl || !groupButtons.length) return;

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

  function addText(parent, tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text;
    parent.appendChild(node);
    return node;
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

  function renderGrouped(sections) {
    listHost.replaceChildren();
    var shown = 0;
    sections.forEach(function (section) {
      if (!section.items.length) return;
      shown += section.items.length;
      var block = document.createElement("section");
      block.className = "data-browse-group";
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

  function render() {
    var list = filteredStudies();
    listHost.replaceChildren();

    if (!list.length) {
      countEl.textContent = input.value.trim() ? "Nothing matches." : "No studies yet.";
      return;
    }

    if (groupMode === "researcher") {
      var researcherSections = researcherOrder.map(function (name) {
        return { title: name, items: studiesForResearcher(name, list) };
      });
      // Any leads not in the fixed lab roster
      var known = {};
      researcherOrder.forEach(function (name) {
        known[name] = true;
      });
      var extras = {};
      list.forEach(function (study) {
        (study.leads || []).forEach(function (name) {
          if (!known[name]) extras[name] = true;
        });
      });
      Object.keys(extras)
        .sort()
        .forEach(function (name) {
          researcherSections.push({ title: name, items: studiesForResearcher(name, list) });
        });
      var n = renderGrouped(researcherSections);
      countEl.textContent =
        n === 1 ? "1 study · grouped by researcher" : n + " studies · grouped by researcher";
      return;
    }

    if (groupMode === "topic") {
      var topicSections = topicOrder.map(function (topic) {
        return { title: topic.label, items: studiesForTopic(topic.id, list) };
      });
      var nTopic = renderGrouped(topicSections);
      countEl.textContent =
        nTopic === 1 ? "1 study · grouped by topic" : nTopic + " studies · grouped by topic";
      return;
    }

    // Flat study list
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
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });

  input.addEventListener("input", render);

  // Support deep links like ?group=topic or #topic
  var params = new URLSearchParams(window.location.search);
  var initialGroup = params.get("group");
  if (initialGroup === "researcher" || initialGroup === "topic" || initialGroup === "study") {
    groupMode = initialGroup;
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
    })
    .catch(function () {
      countEl.textContent = "The study list could not be loaded.";
      listHost.replaceChildren();
    });
})();
