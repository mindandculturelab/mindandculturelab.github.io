(function () {
  var form = document.querySelector("[data-data-search-form]");
  var input = document.querySelector("[data-data-search]");
  var results = document.querySelector("[data-data-search-results]");
  var count = document.querySelector("[data-data-search-count]");
  if (!form || !input || !results || !count) return;

  var researchers = [
    { name: "Dorsa Amir", href: "researchers/", role: "Principal Investigator" },
    { name: "Julia Smith", href: "researchers/", role: "Postdoctoral Scholar" },
    { name: "Alissa Rivero", href: "researchers/", role: "PhD Student" },
    { name: "Julia Bainbridge", href: "researchers/", role: "Researcher" },
    { name: "Gita Paladugu", href: "researchers/", role: "Researcher" },
    { name: "Serena Spada", href: "researchers/", role: "Researcher" }
  ];

  var topics = [
    { name: "Exploration", href: "topics/#exploration" },
    { name: "Morality", href: "topics/#morality" },
    { name: "Cooperation", href: "topics/#cooperation" },
    { name: "Generosity", href: "topics/#generosity" },
    { name: "Decision making", href: "topics/#decision-making" }
  ];

  var studies = [];

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

  function matches(haystack, query) {
    return haystack.toLowerCase().indexOf(query) !== -1;
  }

  function clearResults() {
    results.replaceChildren();
    results.hidden = true;
    count.hidden = true;
    count.textContent = "";
  }

  function render(query) {
    var q = query.trim().toLowerCase();
    if (!q) {
      clearResults();
      return;
    }

    var hits = [];

    studies.forEach(function (study) {
      var blob = [study.name, study.topic, (study.leads || []).join(" "), (study.keywords || []).join(" "), study.ageLabel]
        .filter(Boolean)
        .join(" ");
      if (!matches(blob, q)) return;
      hits.push({
        kind: "Study",
        title: study.name,
        meta: (study.leads || []).join(", ") + (study.topic ? " · " + study.topic : ""),
        href: studyHref(study)
      });
    });

    researchers.forEach(function (person) {
      if (!matches(person.name + " " + person.role, q)) return;
      hits.push({
        kind: "Researcher",
        title: person.name,
        meta: person.role,
        href: person.href
      });
    });

    topics.forEach(function (topic) {
      if (!matches(topic.name, q)) return;
      hits.push({
        kind: "Topic",
        title: topic.name,
        meta: "Browse studies by topic",
        href: topic.href
      });
    });

    results.replaceChildren();
    results.hidden = false;
    count.hidden = false;
    count.textContent =
      hits.length === 0
        ? "No matches for “" + query.trim() + "”."
        : hits.length === 1
          ? "1 match"
          : hits.length + " matches";

    if (!hits.length) {
      addText(results, "p", "data-search-empty", "Try a study title, researcher name, or topic word.");
      return;
    }

    var list = document.createElement("ul");
    list.className = "data-search-list";
    hits.slice(0, 12).forEach(function (hit) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "data-search-item";
      a.href = hit.href;
      addText(a, "span", "data-search-kind", hit.kind);
      addText(a, "span", "data-search-title", hit.title);
      if (hit.meta) addText(a, "span", "data-search-meta", hit.meta);
      li.appendChild(a);
      list.appendChild(li);
    });
    results.appendChild(list);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render(input.value);
  });

  input.addEventListener("input", function () {
    render(input.value);
  });

  fetch("./studies.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (payload) {
      studies = payload.studies || [];
      if (input.value.trim()) render(input.value);
    })
    .catch(function () {
      studies = [];
    });
})();
