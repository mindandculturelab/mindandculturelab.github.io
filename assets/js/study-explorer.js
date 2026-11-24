(function () {
  var cfg = window.STUDY_EXPLORER_CONFIG;
  if (!cfg) return;

  var SVG = "http://www.w3.org/2000/svg";
  var records = [];
  var meta = null;
  var sortKey = cfg.defaultSortKey || (cfg.columns && cfg.columns[0] ? cfg.columns[0][0] : "id");
  var sortDir = cfg.defaultSortDir || 1;
  var summary = document.getElementById("summary");
  var views = document.getElementById("views");
  var filtersForm = document.getElementById("filters");

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

  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function formatPct(value, digits) {
    if (value == null || isNaN(value)) return "—";
    var d = digits === undefined ? 1 : digits;
    var factor = Math.pow(10, d);
    var rounded = Math.round(value * factor) / factor;
    return rounded.toFixed(d).replace(/\.0+$/, "") + "%";
  }

  function formatNum(value, digits) {
    if (value == null || isNaN(value)) return "—";
    var d = digits === undefined ? 2 : digits;
    var factor = Math.pow(10, d);
    var rounded = Math.round(value * factor) / factor;
    return rounded.toFixed(d).replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
  }

  function meanOf(rows, getter) {
    var vals = [];
    rows.forEach(function (r) {
      var v = typeof getter === "function" ? getter(r) : r[getter];
      if (v != null && v !== "" && !isNaN(Number(v))) vals.push(Number(v));
    });
    if (!vals.length) return null;
    var sum = vals.reduce(function (a, b) { return a + b; }, 0);
    return sum / vals.length;
  }

  function countValid(rows, getter) {
    var n = 0;
    rows.forEach(function (r) {
      var v = typeof getter === "function" ? getter(r) : r[getter];
      if (v != null && v !== "" && !isNaN(Number(v))) n += 1;
    });
    return n;
  }

  function buildTable(headers, tableRows) {
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
    tableRows.forEach(function (record) {
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

  /*
   * Renders a clean single-series or grouped-series SVG bar chart + companion table.
   * spec: {
   *   hostId, tableHostId,
   *   yMax: 100 (default), yTicks: [0,25,50,75,100], yUnit: "%" | "", referenceLine: number|null,
   *   series: [{ key, label, color }],
   *   groups: [{ lines: ["Line 1", "Line 2"], values: { [seriesKey]: number|null }, tableRow: [...] }],
   *   tableHeaders: [...]
   * }
   */
  function renderBarChart(spec) {
    var host = document.getElementById(spec.hostId);
    var tableHost = document.getElementById(spec.tableHostId);
    clear(host);
    clear(tableHost);
    if (!host || !spec.groups || !spec.groups.length) return;

    var series = spec.series || [{ key: "val", label: "", color: "#2f6b4a" }];
    var hasLegend = series.length > 1 || Boolean(spec.showLegend);
    var width = 760;
    var height = hasLegend ? 352 : 322;
    var margin = {
      top: hasLegend ? 48 : 28,
      right: 18,
      bottom: 74,
      left: 54
    };
    var plotWidth = width - margin.left - margin.right;
    var plotHeight = height - margin.top - margin.bottom;
    var yMax = spec.yMax || 100;
    var yMin = spec.yMin || 0;
    var ySpan = yMax - yMin || 1;
    var ticks = spec.yTicks || [0, 25, 50, 75, 100];
    var unit = spec.yUnit !== undefined ? spec.yUnit : "%";
    var digits = spec.valueDigits !== undefined ? spec.valueDigits : (unit === "%" ? 1 : 2);

    var svg = svgEl("svg", {
      class: "plot",
      viewBox: "0 0 " + width + " " + height,
      role: "img",
      "aria-hidden": "true"
    });

    if (hasLegend) {
      var cursorX = margin.left;
      series.forEach(function (s) {
        svg.appendChild(svgEl("rect", {
          x: cursorX,
          y: 10,
          width: 14,
          height: 14,
          rx: "3.5",
          fill: s.color
        }));
        text(svg, s.label, {
          x: cursorX + 20,
          y: 22,
          "font-size": "12.5",
          "font-weight": "600",
          fill: "#1c1a17",
          "font-family": "Source Sans 3, Helvetica, sans-serif"
        });
        cursorX += Math.max(115, s.label.length * 7.4 + 38);
      });
    }

    ticks.forEach(function (tick) {
      var y = margin.top + plotHeight - ((tick - yMin) / ySpan) * plotHeight;
      var isRef = spec.referenceLine != null && Math.abs(tick - spec.referenceLine) < 0.001;
      svg.appendChild(svgEl("line", {
        x1: margin.left,
        x2: width - margin.right,
        y1: y,
        y2: y,
        stroke: isRef ? "rgba(28, 26, 23, 0.28)" : "rgba(28, 26, 23, 0.11)",
        "stroke-dasharray": isRef ? "5 4" : "none",
        "stroke-width": "1"
      }));
      text(svg, formatNum(tick, unit === "%" ? 0 : 1) + unit, {
        x: margin.left - 10,
        y: y + 4,
        "text-anchor": "end",
        "font-size": "12.5",
        fill: "#5e584f",
        "font-family": "Source Sans 3, Helvetica, sans-serif"
      });
    });

    if (spec.referenceLine != null && ticks.indexOf(spec.referenceLine) === -1) {
      var ry = margin.top + plotHeight - ((spec.referenceLine - yMin) / ySpan) * plotHeight;
      svg.appendChild(svgEl("line", {
        x1: margin.left,
        x2: width - margin.right,
        y1: ry,
        y2: ry,
        stroke: "rgba(28, 26, 23, 0.28)",
        "stroke-dasharray": "5 4",
        "stroke-width": "1"
      }));
    }

    var groupCount = spec.groups.length;
    var slot = plotWidth / groupCount;
    var clusterWidth = Math.min(series.length * 46, slot * 0.74);
    var gap = series.length > 1 ? 5 : 0;
    var barWidth = Math.max(12, Math.min(64, (clusterWidth - gap * (series.length - 1)) / series.length));
    var actualCluster = barWidth * series.length + gap * (series.length - 1);

    spec.groups.forEach(function (group, gIndex) {
      var center = margin.left + slot * gIndex + slot / 2;
      var startX = center - actualCluster / 2;

      series.forEach(function (s, sIndex) {
        var raw = group.values[s.key];
        if (raw == null || isNaN(raw)) return;
        var clamped = Math.max(yMin, Math.min(yMax, raw));
        var h = ((clamped - yMin) / ySpan) * plotHeight;
        var bx = startX + sIndex * (barWidth + gap);
        var by = margin.top + plotHeight - h;
        var fill = (group.colors && group.colors[s.key]) || s.color;

        svg.appendChild(svgEl("rect", {
          x: bx,
          y: by,
          width: barWidth,
          height: Math.max(h, 1.5),
          rx: series.length > 2 ? "4" : "6",
          fill: fill
        }));

        if (series.length <= 3 || groupCount <= 5) {
          var valLabel = unit === "%" ? formatPct(raw, digits) : formatNum(raw, digits);
          text(svg, valLabel, {
            x: bx + barWidth / 2,
            y: by - 6,
            "text-anchor": "middle",
            "font-size": series.length > 2 ? "10.5" : (series.length === 2 ? "11.5" : "13"),
            "font-weight": "700",
            fill: "#1c1a17",
            "font-family": "Source Sans 3, Helvetica, sans-serif"
          });
        }
      });

      (group.lines || []).forEach(function (line, lineIdx) {
        text(svg, line, {
          x: center,
          y: height - 46 + lineIdx * 17,
          "text-anchor": "middle",
          "font-size": groupCount > 6 ? "11.5" : "12.5",
          "font-weight": lineIdx === 0 ? "600" : "500",
          fill: lineIdx === 0 ? "#1c1a17" : "#5e584f",
          "font-family": "Source Sans 3, Helvetica, sans-serif"
        });
      });
    });

    host.appendChild(svg);

    if (tableHost && spec.tableHeaders && spec.groups.some(function (g) { return g.tableRow; })) {
      tableHost.appendChild(
        buildTable(
          spec.tableHeaders,
          spec.groups.map(function (g) { return g.tableRow; }).filter(Boolean)
        )
      );
    }
  }

  function selectedFilters() {
    var out = {};
    (cfg.filters || []).forEach(function (f) {
      var el = document.getElementById(f.id);
      out[f.id] = el ? el.value : "";
    });
    return out;
  }

  function filteredRecords() {
    var sel = selectedFilters();
    return records.filter(function (row) {
      for (var i = 0; i < (cfg.filters || []).length; i++) {
        var f = cfg.filters[i];
        var val = sel[f.id];
        if (!val) continue;
        if (typeof f.match === "function") {
          if (!f.match(row, val)) return false;
        } else {
          var key = f.field || f.id;
          if (String(row[key]) !== val) return false;
        }
      }
      return true;
    });
  }

  function renderStats(rows) {
    var statsHost = document.getElementById("stats");
    clear(statsHost);
    if (!statsHost || typeof cfg.computeStats !== "function") return;
    var items = cfg.computeStats(rows, {
      meanOf: meanOf,
      countValid: countValid,
      formatPct: formatPct,
      formatNum: formatNum,
      meta: meta
    });
    items.forEach(function (pair) {
      var block = document.createElement("p");
      block.className = "stat";
      var strong = document.createElement("strong");
      strong.textContent = pair[0];
      var span = document.createElement("span");
      span.textContent = pair[1];
      block.appendChild(strong);
      block.appendChild(span);
      statsHost.appendChild(block);
    });
  }

  function formatCell(row, col) {
    var key = col[0];
    var fmt = col[2];
    var raw = row[key];
    if (typeof fmt === "function") return fmt(raw, row);
    if (raw == null || raw === "") return "—";
    if (fmt === "pct") return formatPct(Number(raw), 1);
    if (fmt === "num1") return formatNum(Number(raw), 1);
    if (fmt === "num2") return formatNum(Number(raw), 2);
    return String(raw);
  }

  function renderSheet(rows) {
    var host = document.getElementById("sheet");
    clear(host);
    if (!host || !cfg.columns) return;

    var sorted = rows.slice().sort(function (a, b) {
      var av = a[sortKey];
      var bv = b[sortKey];
      var aMissing = av == null || av === "";
      var bMissing = bv == null || bv === "";
      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;
      if (typeof av === "string" || typeof bv === "string") {
        var as = String(av).toLowerCase();
        var bs = String(bv).toLowerCase();
        if (as < bs) return -sortDir;
        if (as > bs) return sortDir;
        return 0;
      }
      if (av < bv) return -sortDir;
      if (av > bv) return sortDir;
      return 0;
    });

    var limit = cfg.maxSheetRows || 600;
    var shown = sorted.slice(0, limit);

    var sheet = document.createElement("table");
    var head = document.createElement("thead");
    var headRow = document.createElement("tr");
    var idxHead = document.createElement("th");
    idxHead.scope = "col";
    idxHead.textContent = "#";
    headRow.appendChild(idxHead);

    cfg.columns.forEach(function (col) {
      var th = document.createElement("th");
      th.scope = "col";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-sort", col[0]);
      btn.textContent = col[1];
      if (sortKey === col[0]) {
        th.setAttribute("aria-sort", sortDir === 1 ? "ascending" : "descending");
        btn.textContent = col[1] + (sortDir === 1 ? " ↑" : " ↓");
      }
      th.appendChild(btn);
      headRow.appendChild(th);
    });
    head.appendChild(headRow);
    sheet.appendChild(head);

    var body = document.createElement("tbody");
    shown.forEach(function (row, idx) {
      var tr = document.createElement("tr");
      var tdIdx = document.createElement("td");
      tdIdx.textContent = String(idx + 1);
      tr.appendChild(tdIdx);
      cfg.columns.forEach(function (col) {
        var td = document.createElement("td");
        td.textContent = formatCell(row, col);
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
    sheet.appendChild(body);
    host.appendChild(sheet);

    var truncNote = document.getElementById("sheet-trunc-note");
    if (truncNote) {
      truncNote.textContent = sorted.length > limit
        ? "Showing first " + limit + " of " + sorted.length + " matching rows (download full CSV on the study page)."
        : "";
    }
  }

  function update() {
    var rows = filteredRecords();
    if (!rows.length) {
      if (views) views.hidden = true;
      if (summary) summary.textContent = "Nothing in the dataset matches these filters.";
      return;
    }
    if (views) views.hidden = false;
    var helpers = {
      meanOf: meanOf,
      countValid: countValid,
      formatPct: formatPct,
      formatNum: formatNum,
      renderBarChart: renderBarChart,
      meta: meta
    };
    if (summary && typeof cfg.summaryText === "function") {
      summary.textContent = cfg.summaryText(rows, helpers);
    }
    renderStats(rows);
    if (typeof cfg.renderCharts === "function") {
      cfg.renderCharts(rows, helpers);
    }
    renderSheet(rows);
  }

  if (filtersForm) {
    filtersForm.addEventListener("change", update);
  }
  var sheetEl = document.getElementById("sheet");
  if (sheetEl) {
    sheetEl.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-sort]");
      if (!button) return;
      var key = button.getAttribute("data-sort");
      if (sortKey === key) {
        sortDir = -sortDir;
      } else {
        sortKey = key;
        sortDir = 1;
      }
      update();
    });
  }

  fetch(cfg.dataUrl || "records.json")
    .then(function (resp) {
      if (!resp.ok) throw new Error("missing");
      return resp.json();
    })
    .then(function (payload) {
      if (Array.isArray(payload)) {
        records = payload;
      } else {
        records = payload.records || [];
        meta = payload.meta || null;
      }
      update();
    })
    .catch(function () {
      if (views) views.hidden = true;
      if (summary) summary.textContent = "The recorded scores did not load.";
    });
})();
