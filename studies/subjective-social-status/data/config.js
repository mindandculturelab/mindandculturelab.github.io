window.STUDY_EXPLORER_CONFIG = {
  defaultSortKey: "society",
  filters: [
    { id: "society", field: "society" },
    { id: "ageBand", field: "ageBand" },
    { id: "sex", field: "sex" }
  ],
  columns: [
    ["pid", "Participant"],
    ["society", "Population"],
    ["age", "Age (yrs)"],
    ["ageBand", "Age band"],
    ["sex", "Gender"],
    ["ladder", "Worksheet rung (1=top, 10=bottom)"],
    ["sci", "SCI score (4=more, 12=less)"],
    ["sciTier", "Relative material standing"]
  ],
  summaryText: function (rows, h) {
    var topRung = h.meanOf(rows, function (r) { return r.ladder != null ? 11 - r.ladder : null; });
    return rows.length + " children/adolescents · mean perceived standing = " + h.formatNum(topRung, 2) + " / 10 (10 = top rung)";
  },
  computeStats: function (rows, h) {
    var standing = h.meanOf(rows, function (r) { return r.ladder != null ? 11 - r.ladder : null; });
    var sci = h.meanOf(rows, "sci");
    return [
      [h.formatNum(standing, 2) + " / 10", "mean MacArthur Ladder standing (oriented 10 = top rung, 1 = bottom)"],
      [h.formatNum(sci, 2) + " / 12", "mean Social Comparison Index (8.0 = 'same as most families' across house, food, money, things)"],
      ["ρ = 0.47 / 0.32", "test–retest reliability in India at 1 week (N = 43) and 1 year (N = 665)"]
    ];
  },
  renderCharts: function (rows, h) {
    var pops = [
      ["USA", "USA"],
      ["India", "India"],
      ["Argentina", "Argentina"],
      ["Ecuador (Upano Valley)", "Upano Shuar"],
      ["Ecuador (Cross-Cutucú)", "Cross-Cutucú"]
    ].filter(function (p) {
      return rows.some(function (r) { return r.society === p[0]; });
    });
    h.renderBarChart({
      hostId: "chart-ladder",
      tableHostId: "chart-ladder-table",
      yMax: 10,
      yTicks: [0, 2, 4, 6, 8, 10],
      yUnit: "",
      referenceLine: 5.5,
      valueDigits: 2,
      series: [
        { key: "young", label: "4–11 years", color: "#5aa276" },
        { key: "adol", label: "12–18 years", color: "#285c3f" }
      ],
      tableHeaders: ["Population", "n", "4–11 yrs standing (/10)", "12–18 yrs standing (/10)", "Overall mean (/10)"],
      groups: pops.map(function (p) {
        var sub = rows.filter(function (r) { return r.society === p[0]; });
        var sy = sub.filter(function (r) { return r.age <= 11; });
        var sa = sub.filter(function (r) { return r.age >= 12; });
        var vy = h.meanOf(sy, function (r) { return r.ladder != null ? 11 - r.ladder : null; });
        var va = h.meanOf(sa, function (r) { return r.ladder != null ? 11 - r.ladder : null; });
        var vo = h.meanOf(sub, function (r) { return r.ladder != null ? 11 - r.ladder : null; });
        return {
          lines: [p[1], "n = " + sub.length],
          values: { young: vy, adol: va },
          tableRow: [p[0], String(sub.length), h.formatNum(vy, 2), h.formatNum(va, 2), h.formatNum(vo, 2)]
        };
      })
    });

    var tiers = [
      ["Lower SCI (4–7)", "More than peers (SCI 4–7)"],
      ["Middle SCI (8–9)", "Same as peers (SCI 8–9)"],
      ["Higher SCI (10–12)", "Less than peers (SCI 10–12)"]
    ].filter(function (t) {
      return rows.some(function (r) { return r.sciTier === t[0]; });
    });
    h.renderBarChart({
      hostId: "chart-sci",
      tableHostId: "chart-sci-table",
      yMax: 10,
      yTicks: [0, 2, 4, 6, 8, 10],
      yUnit: "",
      referenceLine: 5.5,
      valueDigits: 2,
      series: [{ key: "lad", label: "Mean Ladder standing (10 = top rung)", color: "#d9842b" }],
      tableHeaders: ["Social Comparison Index tier", "n", "Mean Ladder standing (10 = top)", "Mean raw worksheet rung (1 = top)"],
      groups: tiers.map(function (t) {
        var sub = rows.filter(function (r) { return r.sciTier === t[0]; });
        var st = h.meanOf(sub, function (r) { return r.ladder != null ? 11 - r.ladder : null; });
        var rw = h.meanOf(sub, "ladder");
        return {
          lines: [t[1], "n = " + sub.length],
          values: { lad: st },
          tableRow: [t[1], String(sub.length), h.formatNum(st, 2), h.formatNum(rw, 2)]
        };
      })
    });
  }
};
