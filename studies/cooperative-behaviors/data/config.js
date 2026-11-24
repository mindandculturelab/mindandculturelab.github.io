window.STUDY_EXPLORER_CONFIG = {
  defaultSortKey: "country",
  filters: [
    { id: "country", field: "country" },
    { id: "ageGroup", field: "ageGroup" },
    { id: "gender", field: "gender" }
  ],
  columns: [
    ["pid", "Participant"],
    ["country", "Society"],
    ["ageGroup", "Age band"],
    ["age", "Age (yrs)"],
    ["gender", "Gender"],
    ["aiRejectPct", "AI rejected (%)", "pct"],
    ["trustShared", "Trust shared (/6)"],
    ["forgGiven", "Forgiveness (/5)"],
    ["honestyReturned", "Honesty returned (/3)"]
  ],
  summaryText: function (rows) {
    var societies = {};
    rows.forEach(function (r) { societies[r.country] = true; });
    var sc = Object.keys(societies).length;
    return rows.length + " children matching filters · " + sc + (sc === 1 ? " society" : " societies");
  },
  computeStats: function (rows, h) {
    var fair = h.meanOf(rows, "aiRejectPct");
    var trust = h.meanOf(rows, "trustShared");
    var forg = h.meanOf(rows, "forgGiven");
    return [
      [h.formatPct(fair, 1), "mean advantageous-inequity rejection rate"],
      [h.formatNum(trust, 2) + " / 6", "mean candies returned in the Trust Game (" + h.formatPct(h.meanOf(rows, "trustPct"), 1) + ")"],
      [h.formatNum(forg, 2) + " / 5", "mean scratch sheets returned in Forgiveness (" + h.formatPct(h.meanOf(rows, "honestyFullPct"), 1) + " returned all extra candies)"]
    ];
  },
  renderCharts: function (rows, h) {
    var countries = ["Canada", "USA", "Peru", "Uganda", "Ecuador (Shuar)"].filter(function (c) {
      return rows.some(function (r) { return r.country === c; });
    });
    var series = [
      { key: "fair", label: "Fairness (AI reject)", color: "#285c3f" },
      { key: "trust", label: "Trustworthiness", color: "#5aa276" },
      { key: "forg", label: "Forgiveness", color: "#d9842b" },
      { key: "honest", label: "Honesty (all 3)", color: "#5d748a" }
    ];
    h.renderBarChart({
      hostId: "chart-domains",
      tableHostId: "chart-domains-table",
      yMax: 100,
      yTicks: [0, 25, 50, 75, 100],
      yUnit: "%",
      valueDigits: 0,
      series: series,
      tableHeaders: ["Society", "n", "Fairness (AI reject)", "Trustworthiness (% of 6)", "Forgiveness (% of 5)", "Honesty (returned all 3)"],
      groups: countries.map(function (c) {
        var sub = rows.filter(function (r) { return r.country === c; });
        var vf = h.meanOf(sub, "aiRejectPct");
        var vt = h.meanOf(sub, "trustPct");
        var vg = h.meanOf(sub, "forgPct");
        var vh = h.meanOf(sub, "honestyFullPct");
        return {
          lines: [c === "Ecuador (Shuar)" ? "Ecuador" : c, "n = " + sub.length],
          values: { fair: vf, trust: vt, forg: vg, honest: vh },
          tableRow: [c, String(sub.length), h.formatPct(vf, 1), h.formatPct(vt, 1), h.formatPct(vg, 1), h.formatPct(vh, 1)]
        };
      })
    });

    var ages = [
      ["5-7yr", "5–7 years"],
      ["8-10yr", "8–10 years"],
      ["11-13yr", "11–13 years"]
    ].filter(function (pair) {
      return rows.some(function (r) { return r.ageGroup === pair[0]; });
    });
    h.renderBarChart({
      hostId: "chart-age",
      tableHostId: "chart-age-table",
      yMax: 100,
      yTicks: [0, 25, 50, 75, 100],
      yUnit: "%",
      valueDigits: 0,
      series: series,
      tableHeaders: ["Age band", "n", "Fairness (AI reject)", "Trustworthiness", "Forgiveness", "Honesty"],
      groups: ages.map(function (pair) {
        var sub = rows.filter(function (r) { return r.ageGroup === pair[0]; });
        var vf = h.meanOf(sub, "aiRejectPct");
        var vt = h.meanOf(sub, "trustPct");
        var vg = h.meanOf(sub, "forgPct");
        var vh = h.meanOf(sub, "honestyFullPct");
        return {
          lines: [pair[1], "n = " + sub.length],
          values: { fair: vf, trust: vt, forg: vg, honest: vh },
          tableRow: [pair[1], String(sub.length), h.formatPct(vf, 1), h.formatPct(vt, 1), h.formatPct(vg, 1), h.formatPct(vh, 1)]
        };
      })
    });
  }
};
