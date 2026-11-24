window.STUDY_EXPLORER_CONFIG = {
  defaultSortKey: "site",
  filters: [
    { id: "site", field: "site" },
    { id: "ageBand", field: "ageBand" },
    { id: "sex", field: "sex" },
    { id: "seenDice", field: "seenDice" }
  ],
  columns: [
    ["pid", "Participant"],
    ["site", "Site"],
    ["age", "Age (yrs)"],
    ["sex", "Gender"],
    ["seenDice", "Seen dice before"],
    ["compCheck", "Comprehension"],
    ["choice", "Chosen test game"],
    ["wonGame", "Test outcome"]
  ],
  summaryText: function (rows, h) {
    var epCount = rows.filter(function (r) { return r.epistemicPct === 100; }).length;
    return epCount + " of " + rows.length + " participants (" + h.formatPct((epCount / rows.length) * 100, 1) + ") chose Roll-Then-Guess (epistemic)";
  },
  computeStats: function (rows, h) {
    var ep = h.meanOf(rows, "epistemicPct");
    var noDice = rows.filter(function (r) { return r.seenDice === "No"; });
    var firstTry = rows.filter(function (r) { return r.compCheck === "first try"; });
    return [
      [h.formatPct(ep, 1), "chose Roll-Then-Guess (epistemic uncertainty)"],
      [noDice.length ? h.formatPct(h.meanOf(noDice, "epistemicPct"), 1) : "—", "epistemic choice among participants with zero prior dice exposure (n = " + noDice.length + ")"],
      [h.formatPct((firstTry.length / rows.length) * 100, 1), "passed task comprehension on the very first try"]
    ];
  },
  renderCharts: function (rows, h) {
    var sites = ["USA", "Bolivia (Tsimané)", "Iran"].filter(function (s) {
      return rows.some(function (r) { return r.site === s; });
    });
    h.renderBarChart({
      hostId: "chart-site",
      tableHostId: "chart-site-table",
      yMax: 100,
      yTicks: [0, 25, 50, 75, 100],
      yUnit: "%",
      referenceLine: 50,
      series: [
        { key: "ep", label: "Roll-Then-Guess (Epistemic)", color: "#285c3f" },
        { key: "ph", label: "Guess-Then-Roll (Physical)", color: "#d9842b" }
      ],
      tableHeaders: ["Site", "n", "Roll-Then-Guess (Epistemic)", "Guess-Then-Roll (Physical)", "Had seen dice"],
      groups: sites.map(function (s) {
        var sub = rows.filter(function (r) { return r.site === s; });
        var ep = h.meanOf(sub, "epistemicPct");
        var ph = ep != null ? 100 - ep : null;
        var seen = sub.filter(function (r) { return r.seenDice === "Yes"; }).length;
        return {
          lines: [s, "n = " + sub.length],
          values: { ep: ep, ph: ph },
          tableRow: [s, String(sub.length), h.formatPct(ep, 1), h.formatPct(ph, 1), seen + " / " + sub.length]
        };
      })
    });

    var bands = [
      ["4–7 yrs", "6–7 years"],
      ["8–10 yrs", "8–10 years"],
      ["11–17 yrs", "11–19 years"]
    ].filter(function (b) {
      return rows.some(function (r) { return r.ageBand === b[0]; });
    });
    h.renderBarChart({
      hostId: "chart-age",
      tableHostId: "chart-age-table",
      yMax: 100,
      yTicks: [0, 25, 50, 75, 100],
      yUnit: "%",
      referenceLine: 50,
      series: [{ key: "ep", label: "Roll-Then-Guess (Epistemic)", color: "#4e8f69" }],
      tableHeaders: ["Age band", "n", "Mean age (yrs)", "Epistemic (Roll-Then-Guess)", "Physical (Guess-Then-Roll)"],
      groups: bands.map(function (b) {
        var sub = rows.filter(function (r) { return r.ageBand === b[0]; });
        var ep = h.meanOf(sub, "epistemicPct");
        return {
          lines: [b[1], "n = " + sub.length],
          values: { ep: ep },
          tableRow: [b[1], String(sub.length), h.formatNum(h.meanOf(sub, "age"), 1), h.formatPct(ep, 1), h.formatPct(100 - ep, 1)]
        };
      })
    });
  }
};
