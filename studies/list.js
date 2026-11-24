(function () {
  var root = document.querySelector("[data-studies]");
  var count = document.querySelector("[data-count]");
  var search = document.querySelector("[data-study-search]");
  var studies = [];

  if (!root || !count || !search) {
    return;
  }

  function addText(parent, tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function matches(study, query) {
    if (!query) {
      return true;
    }
    var haystack = [study.name, study.topic]
      .concat(study.leads || [])
      .join(" ")
      .toLowerCase();
    return haystack.indexOf(query) !== -1;
  }

  function journalOf(study) {
    var citation = study.citation;
    if (!citation) {
      return "";
    }
    if (typeof citation === "object" && citation.journal) {
      return citation.journal;
    }
    if (typeof citation !== "string") {
      return "";
    }
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
      if (citation.indexOf(known[i]) !== -1) {
        return known[i];
      }
    }
    return "";
  }

  function render() {
    var query = search.value.trim().toLowerCase();
    var list = studies.filter(function (study) {
      return matches(study, query);
    });
    root.replaceChildren();
    if (!list.length) {
      count.textContent = "Nothing matches.";
      return;
    }
    count.textContent = list.length === 1 ? "1 study" : list.length + " studies";
    list.forEach(function (study) {
      var card = document.createElement("a");
      card.className = "card";
      card.href = study.id + "/";
      var metaParts = [study.topic, "Ages " + study.ageLabel];
      var journal = journalOf(study);
      if (journal) {
        metaParts.push(journal);
      }
      addText(card, "p", "meta", metaParts.join(" · "));
      addText(card, "h3", "", study.name);
      addText(card, "p", "", study.leads.join(", "));
      root.appendChild(card);
    });
  }

  search.addEventListener("input", render);

  fetch("../data/studies.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Could not load studies");
      }
      return response.json();
    })
    .then(function (data) {
      studies = data.studies || [];
      render();
    })
    .catch(function () {
      count.textContent = "The study list could not be loaded.";
      root.replaceChildren();
    });
})();
