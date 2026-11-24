window.STUDY_EXPLORER_CONFIG = {
  defaultSortKey: "society",
  filters: [
    { id: "societyShort", field: "societyShort" },
    { id: "ageBand", field: "ageBand" },
    { id: "sex", field: "sex" }
  ],
  columns: [
    ["pid", "Participant"],
    ["society", "Society / Region"],
    ["marketContext", "Market context"],
    ["age", "Age (yrs)"],
    ["sex", "Gender"],
    ["futureChoices", "Tomorrow (/5)"],
    ["futurePct", "Future share (%)", "pct"],
    ["riskyChoices", "Risky (/5)"],
    ["riskPct", "Risk share (%)", "pct"]
  ],
  summaryText: function (rows, h) {
    return rows.length + " participants · " + h.formatPct(h.meanOf(rows, "futurePct"), 1) + " future-oriented · " + h.formatPct(h.meanOf(rows, "riskPct"), 1) + " risk-seeking";
  },
  computeStats: function (rows, h) {
    var mf = h.meanOf(rows, "futureChoices");
    var mr = h.meanOf(rows, "riskyChoices");
    return [
      [h.formatNum(mf, 2) + " / 5", "mean delayed ('tomorrow') choices (" + h.formatPct(h.meanOf(rows, "futurePct"), 1) + ")"],
      [h.formatNum(mr, 2) + " / 5", "mean risky marble-draw choices (" + h.formatPct(h.meanOf(rows, "riskPct"), 1) + ")"],
      [h.formatNum(h.meanOf(rows, "age"), 1) + " yrs", "mean participant age in filtered sample (n = " + rows.length + ")"]
    ];
  },
  renderCharts: function (rows, h) {
    var order = [
      ["USA", "USA"],
      ["India", "India"],
      ["Argentina", "Argentina"],
      ["UV Shuar", "Upano Shuar"],
      ["CC Shuar", "Cross-Cutucú"]
    ].filter(function (o) {
      return rows.some(function (r) { return r.societyShort === o[0]; });
    });
    var series = [
      { key: "fut", label: "Future-oriented ('Tomorrow')", color: "#285c3f" },
      { key: "rsk", label: "Risk-seeking (Marble draw)", color: "#d9842b" }
    ];
    h.renderBarChart({
      hostId: "chart-society",
      tableHostId: "chart-society-table",
      yMax: 100,
      yTicks: [0, 25, 50, 75, 100],
      yUnit: "%",
      referenceLine: 50,
      valueDigits: 1,
      series: series,
      tableHeaders: ["Population", "n", "Tomorrow choices (/5)", "Future share (%)", "Risky choices (/5)", "Risk share (%)"],
      groups: order.map(function (o) {
        var sub = rows.filter(function (r) { return r.societyShort === o[0]; });
        var fp = h.meanOf(sub, "futurePct");
        var rp = h.meanOf(sub, "riskPct");
        return {
          lines: [o[1], "n = " + sub.length],
          values: { fut: fp, rsk: rp },
          tableRow: [
            sub[0].society,
            String(sub.length),
            h.formatNum(h.meanOf(sub, "futureChoices"), 2),
            h.formatPct(fp, 1),
            h.formatNum(h.meanOf(sub, "riskyChoices"), 2),
            h.formatPct(rp, 1)
          ]
        };
      })
    });

    var bands = ["4–7 yrs", "8–11 yrs", "12–18 yrs"].filter(function (b) {
      return rows.some(function (r) { return r.ageBand === b; });
    });
    h.renderBarChart({
      hostId: "chart-age",
      tableHostId: "chart-age-table",
      yMax: 100,
      yTicks: [0, 25, 50, 75, 100],
      yUnit: "%",
      referenceLine: 50,
      valueDigits: 1,
      series: series,
      tableHeaders: ["Age band", "n", "Future share (%)", "Risk share (%)"],
      groups: bands.map(function (b) {
        var sub = rows.filter(function (r) { return r.ageBand === b; });
        var fp = h.meanOf(sub, "futurePct");
        var rp = h.meanOf(sub, "riskPct");
        return {
          lines: [b, "n = " + sub.length],
          values: { fut: fp, rsk: rp },
          tableRow: [b, String(sub.length), h.formatPct(fp, 1), h.formatPct(rp, 1)]
        };
      })
    });
  }
};
