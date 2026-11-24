(function () {
  var order = [
    "Dorsa Amir",
    "Julia Smith",
    "Alissa Rivero",
    "Julia Bainbridge",
    "Gita Paladugu",
    "Serena Spada"
  ];
  var photos = {
    "Dorsa Amir": "../../assets/images/researchers/dorsa-amir.png",
    "Alissa Rivero": "../../assets/images/researchers/alissa-rivero.jpg",
    "Julia Bainbridge": "../../assets/images/researchers/julia-bainbridge.png",
    "Gita Paladugu": "../../assets/images/researchers/gita-paladugu.png",
    "Serena Spada": "../../assets/images/researchers/serena-spada.png"
  };
  var details = {
    "Dorsa Amir": {
      role: "Assistant Professor of Psychology & Neuroscience, Duke University · Principal Investigator",
      education: "PhD in Anthropology, Yale University",
      links: [
        { label: "Website", href: "https://www.dorsaamir.com/" },
        { label: "Google Scholar", href: "https://scholar.google.com/citations?user=0r5bdCYAAAAJ" },
        { label: "ORCID", href: "https://orcid.org/0000-0003-0255-0228" },
        { label: "ResearchGate", href: "https://www.researchgate.net/profile/Dorsa_Amir" }
      ]
    },
    "Julia Smith": {
      role: "Postdoctoral Scholar in Psychology & Neuroscience, Duke University",
      education: "Cross-Cultural Moral & Cognitive Development · Mind & Culture Lab ('24–'26)",
      links: [
        { label: "ORCID", href: "https://orcid.org/0000-0001-8788-6948" },
        { label: "Email", href: "mailto:julia.m.smith@duke.edu" }
      ]
    }
  };
  var root = document.querySelector("[data-people]");
  var count = document.querySelector("[data-count]");
  var search = document.querySelector("[data-researcher-search]");
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

  function studiesFor(name) {
    return studies.filter(function (study) {
      return study.leads.indexOf(name) !== -1;
    });
  }

  function render() {
    var query = search.value.trim().toLowerCase();
    var names = order.filter(function (name) {
      if (!query) return true;
      var info = details[name];
      var haystack = [name, info && info.role, info && info.education]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
    root.replaceChildren();
    if (!names.length) {
      count.textContent = "Nothing matches.";
      return;
    }
    count.textContent = names.length === 1 ? "1 researcher" : names.length + " researchers";
    names.forEach(function (name) {
      var info = details[name];
      var card = document.createElement("article");
      card.className = info ? "person-card person-card-featured" : "person-card";
      if (photos[name]) {
        var image = document.createElement("img");
        image.className = "portrait";
        image.src = photos[name];
        image.alt = "";
        image.width = 280;
        image.height = 280;
        card.appendChild(image);
      } else {
        var initial = document.createElement("p");
        initial.className = "initial";
        initial.setAttribute("aria-hidden", "true");
        initial.textContent = name.charAt(0);
        card.appendChild(initial);
      }
      var body = document.createElement("div");
      addText(body, "h2", "", name);
      if (info && info.role) {
        addText(body, "p", "person-role", info.role);
      }
      if (info && info.education) {
        addText(body, "p", "person-education", info.education);
      }
      if (info && info.links && info.links.length) {
        var linkRow = document.createElement("p");
        linkRow.className = "person-links";
        info.links.forEach(function (entry) {
          var ext = document.createElement("a");
          ext.href = entry.href;
          ext.textContent = entry.label;
          ext.target = "_blank";
          ext.rel = "noopener";
          linkRow.appendChild(ext);
        });
        body.appendChild(linkRow);
      }
      var list = document.createElement("ul");
      studiesFor(name).forEach(function (study) {
        var item = document.createElement("li");
        var link = document.createElement("a");
        link.href = "../../studies/" + study.id + "/";
        link.textContent = study.name;
        item.appendChild(link);
        list.appendChild(item);
      });
      body.appendChild(list);
      card.appendChild(body);
      root.appendChild(card);
    });
  }

  search.addEventListener("input", render);

  fetch("../studies.json")
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
      count.textContent = "The researcher list could not be loaded.";
      root.replaceChildren();
    });
})();
