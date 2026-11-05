(function () {
  var order = ["Alissa Rivero", "Julia Bainbridge", "Gita Paladugu", "Serena Spada", "Julia Smith"];
  var photos = {
    "Alissa Rivero": "../../assets/images/researchers/alissa-rivero.jpg",
    "Julia Bainbridge": "../../assets/images/researchers/julia-bainbridge.png",
    "Gita Paladugu": "../../assets/images/researchers/gita-paladugu.png",
    "Serena Spada": "../../assets/images/researchers/serena-spada.png"
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
      return !query || name.toLowerCase().indexOf(query) !== -1;
    });
    root.replaceChildren();
    if (!names.length) {
      count.textContent = "Nothing matches.";
      return;
    }
    count.textContent = names.length === 1 ? "1 researcher" : names.length + " researchers";
    names.forEach(function (name) {
      var card = document.createElement("article");
      card.className = "person-card";
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
