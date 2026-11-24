(function () {
  var SVG = "http://www.w3.org/2000/svg";
  var trials = [];
  var sortKey = "group";
  var sortDir = 1;
  var summary = document.getElementById("summary");
  var views = document.getElementById("views");
  var columns = [
    ["group", "Group"],
    ["age", "Age band"],
    ["meanAge", "Mean age"],
    ["size", "Group size"],
    ["location", "Location"],
    ["familiarity", "Familiarity"],
    ["trial", "Trial"],
    ["success", "Success"],
    ["strategy", "Strategy"],
    ["key", "Matched key"],
    ["communication", "Peer key comm."],
    ["prompts", "Prompts"]
  ];

  function svgEl(name, attrs) {
    var node = document.createElementNS(SVG, name);
    Object.keys(attrs).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });
    return node;
  }

  function text(parent, value, attrs) {
    var node = svgEl("text", attrs);
    node.textContent = value;
    parent.appendChild(node);
    return node;
  }

  function selected() {
    return {
      age: document.getElementById("age").value,
      size: document.getElementById("size").value,
      location: document.getElementById("location").value,
      familiarity: document.getElementById("familiarity").value
    };
  }

  function filtered() {
    var choice = selected();
    return trials.filter(function (row) {
      if (choice.age && String(row.age) !== choice.age) return false;
      if (choice.size && row.size !== choice.size) return false;
      if (choice.location && row.location !== choice.location) return false;
      if (choice.familiarity && row.familiarity !== choice.familiarity) return false;
      return true;
    });
  }

  function groupsOf(rows) {
    var map = {};
    rows.forEach(function (row) {
      if (!map[row.group]) {
        map[row.group] = {
          group: row.group,
          age: row.age,
          size: row.size,
          successes: 0,
          trials: 0
        };
      }
      map[row.group].successes += row.success;
      map[row.group].trials += 1;
    });
    return Object.keys(map).map(function (key) {
      return map[key];
    });
  }

  function agesPresent(rows) {
    return [2, 3].filter(function (age) {
      return rows.some(function (row) { return row.age === age; });
    });
  }

  function sizesPresent(rows) {
    return ["dyad", "triad"].filter(function (size) {
      return rows.some(function (row) { return row.size === size; });
    });
  }

  function ageLabel(age) {
    return age + "-year-olds";
  }

  function sizeLabel(size) {
    return size === "dyad" ? "Dyads" : "Triads";
  }

  function percent(count, total) {
    if (!total) return "0%";
    var pct = (count / total) * 100;
    return (Math.round(pct * 10) / 10).toString().replace(/\.0$/, "") + "%";
  }

  function meanLabel(value, digits) {
    var d = digits === undefined ? 1 : digits;
    var factor = Math.pow(10, d);
    var rounded = Math.round(value * factor) / factor;
    return rounded.toFixed(d).replace(/\.0+$/, "");
  }

  function cells(rows) {
    var list = [];
    agesPresent(rows).forEach(function (age) {
      sizesPresent(rows).forEach(function (size) {
        var matching = rows.filter(function (row) {
          return row.age === age && row.size === size;
        });
        if (!matching.length) return;
        var successes = matching.reduce(function (sum, row) { return sum + row.success; }, 0);
        var collab = matching.filter(function (row) { return row.strategy === "collaborative"; }).length;
        var indiv = matching.filter(function (row) { return row.strategy === "individualistic"; }).length;
        var unsucc = matching.filter(function (row) { return row.strategy === "unsuccessful"; }).length;
        list.push({
          age: age,
          size: size,
          successes: successes,
          collab: collab,
          indiv: indiv,
          unsucc: unsucc,
          trials: matching.length,
          groups: groupsOf(matching).length
        });
      });
    });
    return list;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function table(headers, records) {
    var tableNode = document.createElement("table");
    tableNode.className = "chart-table";
    var head = document.createElement("thead");
    var headRow = document.createElement("tr");
    headers.forEach(function (header) {
      var cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = header;
      headRow.appendChild(cell);
    });
    head.appendChild(headRow);
    tableNode.appendChild(head);
    var body = document.createElement("tbody");
    records.forEach(function (record) {
      var row = document.createElement("tr");
      record.forEach(function (value) {
        var cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
    tableNode.appendChild(body);
    var wrap = document.createElement("div");
    wrap.className = "chart-scroll";
    wrap.appendChild(tableNode);
    return wrap;
  }

  function drawBars(hostId, tableHostId, items, labelFor, colorFor) {
    var host = document.getElementById(hostId);
    var tableHost = document.getElementById(tableHostId);
    clear(host);
    clear(tableHost);
    if (!items.length) return;
    var width = 760;
    var height = 320;
    var margin = { top: 28, right: 16, bottom: 72, left: 48 };
    var plotWidth = width - margin.left - margin.right;
    var plotHeight = height - margin.top - margin.bottom;
    var svg = svgEl("svg", {
      class: "plot",
      viewBox: "0 0 " + width + " " + height,
      role: "img",
      "aria-hidden": "true"
    });
    [0, 25, 50, 75, 100].forEach(function (tick) {
      var y = margin.top + plotHeight - (tick / 100) * plotHeight;
      svg.appendChild(svgEl("line", {
        x1: margin.left,
        x2: width - margin.right,
        y1: y,
        y2: y,
        stroke: tick === 50 ? "rgba(28, 26, 23, 0.24)" : "rgba(28, 26, 23, 0.12)",
        "stroke-dasharray": tick === 50 ? "5 4" : "none",
        "stroke-width": "1"
      }));
      text(svg, tick + "%", {
        x: margin.left - 10,
        y: y + 4,
        "text-anchor": "end",
        "font-size": "13",
        fill: "#5e584f",
        "font-family": "Source Sans 3, Helvetica, sans-serif"
      });
    });
    items.forEach(function (item, index) {
      var slot = plotWidth / items.length;
      var center = margin.left + slot * index + slot / 2;
      var barWidth = Math.min(68, slot * 0.5);
      var rate = item.trials ? item.successes / item.trials : 0;
      var barHeight = rate * plotHeight;
      var y = margin.top + plotHeight - barHeight;
      svg.appendChild(svgEl("rect", {
        x: center - barWidth / 2,
        y: y,
        width: barWidth,
        height: Math.max(barHeight, 0),
        rx: "8",
        fill: colorFor(item)
      }));
      text(svg, percent(item.successes, item.trials), {
        x: center,
        y: y - 8,
        "text-anchor": "middle",
        "font-size": "14",
        "font-weight": "700",
        fill: "#1c1a17",
        "font-family": "Source Sans 3, Helvetica, sans-serif"
      });
      labelFor(item).forEach(function (line, lineIndex) {
        text(svg, line, {
          x: center,
          y: height - 46 + lineIndex * 18,
          "text-anchor": "middle",
          "font-size": "13",
          "font-weight": lineIndex === 0 ? "600" : "500",
          fill: lineIndex === 0 ? "#1c1a17" : "#5e584f",
          "font-family": "Source Sans 3, Helvetica, sans-serif"
        });
      });
    });
    host.appendChild(svg);
  }

  function drawStrategies(items) {
    var host = document.getElementById("strategies");
    var tableHost = document.getElementById("strategies-table");
    clear(host);
    clear(tableHost);
    if (!items.length) return;
    var width = 760;
    var height = 340;
    var margin = { top: 44, right: 16, bottom: 72, left: 48 };
    var plotWidth = width - margin.left - margin.right;
    var plotHeight = height - margin.top - margin.bottom;
    var svg = svgEl("svg", {
      class: "plot",
      viewBox: "0 0 " + width + " " + height,
      role: "img",
      "aria-hidden": "true"
    });
    var legend = [
      ["Collaborative", "#2f6b4a"],
      ["Individualistic", "#9bc4ab"],
      ["Unsuccessful", "#e3ddd2"]
    ];
    legend.forEach(function (entry, idx) {
      var lx = margin.left + idx * 165;
      svg.appendChild(svgEl("rect", {
        x: lx,
        y: 8,
        width: 14,
        height: 14,
        rx: "3",
        fill: entry[1]
      }));
      text(svg, entry[0], {
        x: lx + 20,
        y: 20,
        "font-size": "13",
        "font-weight": "600",
        fill: "#1c1a17",
        "font-family": "Source Sans 3, Helvetica, sans-serif"
      });
    });
    [0, 25, 50, 75, 100].forEach(function (tick) {
      var y = margin.top + plotHeight - (tick / 100) * plotHeight;
      svg.appendChild(svgEl("line", {
        x1: margin.left,
        x2: width - margin.right,
        y1: y,
        y2: y,
        stroke: "rgba(28, 26, 23, 0.12)",
        "stroke-width": "1"
      }));
      text(svg, tick + "%", {
        x: margin.left - 10,
        y: y + 4,
        "text-anchor": "end",
        "font-size": "13",
        fill: "#5e584f",
        "font-family": "Source Sans 3, Helvetica, sans-serif"
      });
    });
    items.forEach(function (item, index) {
      var slot = plotWidth / items.length;
      var center = margin.left + slot * index + slot / 2;
      var barWidth = Math.min(72, slot * 0.52);
      var parts = [
        [item.collab, "#2f6b4a"],
        [item.indiv, "#9bc4ab"],
        [item.unsucc, "#e3ddd2"]
      ];
      var cursorY = margin.top + plotHeight;
      parts.forEach(function (part) {
        if (!part[0] || !item.trials) return;
        var h = (part[0] / item.trials) * plotHeight;
        cursorY -= h;
        svg.appendChild(svgEl("rect", {
          x: center - barWidth / 2,
          y: cursorY,
          width: barWidth,
          height: Math.max(h, 0),
          fill: part[1]
        }));
      });
      text(svg, percent(item.collab, item.trials) + " collab.", {
        x: center,
        y: margin.top + plotHeight - ((item.collab + item.indiv + item.unsucc) / item.trials) * plotHeight - 8,
        "text-anchor": "middle",
        "font-size": "12.5",
        "font-weight": "700",
        fill: "#2f6b4a",
        "font-family": "Source Sans 3, Helvetica, sans-serif"
      });
      [ageLabel(item.age), sizeLabel(item.size)].forEach(function (line, lineIndex) {
        text(svg, line, {
          x: center,
          y: height - 46 + lineIndex * 18,
          "text-anchor": "middle",
          "font-size": "13",
          "font-weight": lineIndex === 0 ? "600" : "500",
          fill: lineIndex === 0 ? "#1c1a17" : "#5e584f",
          "font-family": "Source Sans 3, Helvetica, sans-serif"
        });
      });
    });
    host.appendChild(svg);
    tableHost.appendChild(table(
      ["Age", "Group size", "Collaborative", "Individualistic", "Unsuccessful", "Total trials"],
      items.map(function (item) {
        return [
          ageLabel(item.age),
          sizeLabel(item.size),
          percent(item.collab, item.trials) + " (" + item.collab + ")",
          percent(item.indiv, item.trials) + " (" + item.indiv + ")",
          percent(item.unsucc, item.trials) + " (" + item.unsucc + ")",
          String(item.trials)
        ];
      })
    ));
  }

  function draw(rows) {
    var successes = rows.reduce(function (sum, row) { return sum + row.success; }, 0);
    var collab = rows.filter(function (row) { return row.strategy === "collaborative"; }).length;
    var commTotal = rows.reduce(function (sum, row) { return sum + (row.communication || 0); }, 0);
    var promptTotal = rows.reduce(function (sum, row) { return sum + (row.prompts || 1); }, 0);
    var commRate = promptTotal ? commTotal / promptTotal : 0;
    var groups = groupsOf(rows);
    summary.textContent = successes + " of " + rows.length + " trials successful · " + groups.length + (groups.length === 1 ? " group" : " groups");
    var stats = document.getElementById("stats");
    clear(stats);
    [
      [percent(successes, rows.length), successes + " of " + rows.length + " trials opened the box"],
      [percent(collab, successes), successes ? collab + " of " + successes + " successes were collaborative" : "collaborative share of successes"],
      [meanLabel(commRate, 2), "peer key communicative acts per 10s prompt (" + commTotal + " total)"]
    ].forEach(function (pair) {
      var block = document.createElement("p");
      block.className = "stat";
      var strong = document.createElement("strong");
      strong.textContent = pair[0];
      var span = document.createElement("span");
      span.textContent = pair[1];
      block.appendChild(strong);
      block.appendChild(span);
      stats.appendChild(block);
    });

    var testRows = rows.filter(function (row) { return row.trial <= 3; });
    var rateItems = cells(testRows);
    drawBars("rates", "rates-table", rateItems, function (item) {
      return [ageLabel(item.age), sizeLabel(item.size)];
    }, function (item) {
      return item.age === 2 && item.size === "triad" ? "#a8c4b1" : "#5aa276";
    });
    if (rateItems.length) {
      document.getElementById("rates-table").appendChild(table(
        ["Age", "Group size", "Successful test trials", "Test trials", "Success rate"],
        rateItems.map(function (item) {
          return [ageLabel(item.age), sizeLabel(item.size), String(item.successes), String(item.trials), percent(item.successes, item.trials)];
        })
      ));
    }

    var generalRows = rows.filter(function (row) { return row.trial === 4; });
    var generalItems = cells(generalRows);
    drawBars("general", "general-table", generalItems, function (item) {
      return [ageLabel(item.age), sizeLabel(item.size)];
    }, function () {
      return "#ee871f";
    });
    if (generalItems.length) {
      document.getElementById("general-table").appendChild(table(
        ["Age", "Group size", "Successful groups", "Groups", "Percent"],
        generalItems.map(function (item) {
          return [ageLabel(item.age), sizeLabel(item.size), String(item.successes), String(item.trials), percent(item.successes, item.trials)];
        })
      ));
    }

    var allItems = cells(rows);
    drawStrategies(allItems);
    drawSheet(rows);
  }

  function cellValue(row, key) {
    if (key === "group") return String(row.group + 1);
    if (key === "meanAge") return row.meanAge != null ? row.meanAge.toFixed(2) : "—";
    if (key === "trial") return row.trial === 4 ? "4 (gen.)" : String(row.trial);
    if (key === "key") return row.key || "—";
    return String(row[key]);
  }

  function drawSheet(rows) {
    var host = document.getElementById("sheet");
    clear(host);
    var sorted = rows.slice().sort(function (a, b) {
      var av = a[sortKey];
      var bv = b[sortKey];
      if (av == null) av = "";
      if (bv == null) bv = "";
      if (typeof av === "string") {
        av = av.toLowerCase();
        bv = String(bv).toLowerCase();
      }
      if (av < bv) return -sortDir;
      if (av > bv) return sortDir;
      if (a.group !== b.group) return a.group - b.group;
      return a.trial - b.trial;
    });
    var sheet = document.createElement("table");
    var head = document.createElement("thead");
    var headRow = document.createElement("tr");
    var indexHead = document.createElement("th");
    indexHead.scope = "col";
    indexHead.textContent = "#";
    headRow.appendChild(indexHead);
    columns.forEach(function (column) {
      var cell = document.createElement("th");
      cell.scope = "col";
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-sort", column[0]);
      button.textContent = column[1];
      if (sortKey === column[0]) {
        cell.setAttribute("aria-sort", sortDir === 1 ? "ascending" : "descending");
        button.textContent = column[1] + (sortDir === 1 ? " ↑" : " ↓");
      }
      cell.appendChild(button);
      headRow.appendChild(cell);
    });
    head.appendChild(headRow);
    sheet.appendChild(head);
    var body = document.createElement("tbody");
    sorted.forEach(function (row, index) {
      var line = document.createElement("tr");
      var indexCell = document.createElement("td");
      indexCell.textContent = String(index + 1);
      line.appendChild(indexCell);
      columns.forEach(function (column) {
        var cell = document.createElement("td");
        cell.textContent = cellValue(row, column[0]);
        line.appendChild(cell);
      });
      body.appendChild(line);
    });
    sheet.appendChild(body);
    host.appendChild(sheet);
  }

  function update() {
    var rows = filtered();
    if (!rows.length) {
      views.hidden = true;
      summary.textContent = "Nothing in the data matches these filters.";
      return;
    }
    views.hidden = false;
    draw(rows);
  }

  document.getElementById("filters").addEventListener("change", update);
  document.getElementById("sheet").addEventListener("click", function (event) {
    var button = event.target.closest("button[data-sort]");
    if (!button) {
      return;
    }
    var key = button.getAttribute("data-sort");
    if (sortKey === key) {
      sortDir = -sortDir;
    } else {
      sortKey = key;
      sortDir = 1;
    }
    update();
  });
  fetch("trials.json")
    .then(function (response) {
      if (!response.ok) throw new Error("missing");
      return response.json();
    })
    .then(function (data) {
      trials = data;
      update();
    })
    .catch(function () {
      views.hidden = true;
      summary.textContent = "The recorded scores did not load.";
    });
})();
