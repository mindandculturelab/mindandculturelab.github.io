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
    },
    "Alissa Rivero": {
      role: "PhD Student in Developmental Psychology, Duke University · NSF GRFP Fellow",
      education: "B.A. Psychology (Minor: Evolutionary Anthropology), Duke University · Advisors: Dorsa Amir & Michael Tomasello",
      bio: "Developmental psychologist studying how we can best structure childhood to cultivate children's motivation, creativity, and exploration.",
      links: [
        { label: "Website", href: "https://alissarivero.github.io/" },
        { label: "CV", href: "https://alissarivero.github.io/cv/" },
        { label: "Email", href: "mailto:alissa.rivero@duke.edu" }
      ]
    }
  };
  var gallery = document.querySelector("[data-people-gallery]");
  var detail = document.querySelector("[data-people]");
  var count = document.querySelector("[data-count]");
  var search = document.querySelector("[data-researcher-search]");
  var studies = [];
  var selected = "";

  if (!gallery || !detail || !count || !search) {
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

  function filteredNames() {
    var query = search.value.trim().toLowerCase();
    return order.filter(function (name) {
      if (!query) return true;
      var info = details[name];
      var haystack = [name, info && info.role, info && info.education, info && info.bio]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.indexOf(query) !== -1;
    });
  }

  function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function nameFromHash() {
    var hash = decodeURIComponent(location.hash.replace(/^#/, "")).trim();
    if (!hash) return "";
    var match = order.filter(function (name) {
      return slugify(name) === hash || name.toLowerCase() === hash.toLowerCase();
    })[0];
    return match || "";
  }

  function setHash(name) {
    if (name) {
      history.replaceState(null, "", "#" + slugify(name));
    } else if (location.hash) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function renderGallery(names) {
    gallery.replaceChildren();
    names.forEach(function (name) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "people-tile";
      btn.setAttribute("role", "listitem");
      btn.setAttribute("aria-pressed", name === selected ? "true" : "false");
      btn.setAttribute("data-person", name);

      if (photos[name]) {
        var image = document.createElement("img");
        image.className = "people-tile-photo";
        image.src = photos[name];
        image.alt = "";
        image.width = 160;
        image.height = 160;
        btn.appendChild(image);
      } else {
        var initial = document.createElement("span");
        initial.className = "people-tile-initial";
        initial.setAttribute("aria-hidden", "true");
        initial.textContent = name.charAt(0);
        btn.appendChild(initial);
      }

      addText(btn, "span", "people-tile-name", name);
      btn.addEventListener("click", function () {
        selected = selected === name ? "" : name;
        setHash(selected);
        render();
        if (selected) {
          detail.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      });
      gallery.appendChild(btn);
    });
  }

  function renderDetail(name) {
    detail.replaceChildren();
    if (!name) {
      detail.hidden = true;
      return;
    }

    var info = details[name];
    var card = document.createElement("article");
    card.className = "person-card person-card-featured";
    card.id = "researcher-detail";

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
    if (info && info.bio) {
      addText(body, "p", "person-bio", info.bio);
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
    list.className = "person-study-list";
    var led = studiesFor(name);
    if (!led.length) {
      addText(body, "p", "person-education", "No open studies listed yet.");
    } else {
      led.forEach(function (study) {
        var item = document.createElement("li");
        var link = document.createElement("a");
        link.href = "../../studies/" + study.id + "/";
        link.textContent = study.name;
        item.appendChild(link);
        list.appendChild(item);
      });
      body.appendChild(list);
    }

    var close = document.createElement("button");
    close.type = "button";
    close.className = "person-close";
    close.textContent = "Close";
    close.addEventListener("click", function () {
      selected = "";
      setHash("");
      render();
    });
    body.appendChild(close);

    card.appendChild(body);
    detail.appendChild(card);
    detail.hidden = false;
  }

  function render() {
    var names = filteredNames();
    if (selected && names.indexOf(selected) === -1) {
      selected = "";
      setHash("");
    }
    if (!names.length) {
      count.textContent = "Nothing matches.";
      gallery.replaceChildren();
      detail.hidden = true;
      detail.replaceChildren();
      return;
    }
    count.textContent = names.length === 1 ? "1 researcher" : names.length + " researchers";
    renderGallery(names);
    renderDetail(selected);
  }

  search.addEventListener("input", function () {
    render();
  });

  window.addEventListener("hashchange", function () {
    selected = nameFromHash();
    render();
  });

  fetch("../studies.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Could not load studies");
      }
      return response.json();
    })
    .then(function (data) {
      studies = data.studies || [];
      selected = nameFromHash();
      render();
    })
    .catch(function () {
      count.textContent = "The researcher list could not be loaded.";
      gallery.replaceChildren();
      detail.replaceChildren();
    });
})();
