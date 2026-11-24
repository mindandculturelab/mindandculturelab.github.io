window.STUDY_EXPLORER_CONFIG = {
  defaultSortKey: "condition",
  filters: [
    { id: "condition", field: "condition" },
    { id: "ageGroup", field: "ageGroup" },
    { id: "gender", field: "gender" }
  ],
  columns: [
    ["pid", "Participant"],
    ["condition", "Condition"],
    ["ageGroup", "Age group"],
    ["exactAge", "Exact age", "num2"],
    ["gender", "Gender"],
    ["shared", "Candies shared (/6)"],
    ["kept", "Candies kept (/6)"],
    ["expectation", "Partner expectation (/6)"],
    ["expectationNote", "Expectation coding"]
  ],
  summaryText: function (rows, h) {
    return rows.length + " children · mean shared = " + h.formatNum(h.meanOf(rows, "shared"), 2) + " of 6 candies";
  },
  computeStats: function (rows, h) {
    var tr = rows.filter(function (r) { return r.condition === "Trustworthiness"; });
    var ge = rows.filter(function (r) { return r.condition === "Generosity"; });
    var equalOrMore = rows.filter(function (r) { return r.shared >= 3; }).length;
    return [
      [tr.length ? h.formatNum(h.meanOf(tr, "shared"), 2) + " / 6" : "—", "mean candies shared in Trustworthiness (n = " + tr.length + ")"],
      [ge.length ? h.formatNum(h.meanOf(ge, "shared"), 2) + " / 6" : "—", "mean candies shared in Generosity (n = " + ge.length + ")"],
      [h.formatPct((equalOrMore / rows.length) * 100, 1), "shared at least half (≥ 3 of 6 candies) with their partner"]
    ];
  },
  renderCharts: function (rows, h) {
    var ages = ["5-6 years old", "7-8 years old"].filter(function (a) {
      return rows.some(function (r) { return r.ageGroup === a; });
    });
    h.renderBarChart({
      hostId: "chart-sharing",
      tableHostId: "chart-sharing-table",
      yMax: 6,
      yTicks: [0, 1, 2, 3, 4, 5, 6],
      yUnit: "",
      referenceLine: 3,
      valueDigits: 2,
      series: [
        { key: "trust", label: "Trustworthiness", color: "#285c3f" },
        { key: "gen", label: "Generosity", color: "#d9842b" }
      ],
      tableHeaders: ["Age group", "Trustworthiness mean (n)", "Generosity mean (n)", "Difference"],
      groups: ages.map(function (ag) {
        var subT = rows.filter(function (r) { return r.ageGroup === ag && r.condition === "Trustworthiness"; });
        var subG = rows.filter(function (r) { return r.ageGroup === ag && r.condition === "Generosity"; });
        var mt = h.meanOf(subT, "shared");
        var mg = h.meanOf(subG, "shared");
        var diff = mt != null && mg != null ? (mt - mg) : null;
        return {
          lines: [ag, "n = " + (subT.length + subG.length)],
          values: { trust: mt, gen: mg },
          tableRow: [
            ag,
            mt != null ? h.formatNum(mt, 2) + " (" + subT.length + ")" : "—",
            mg != null ? h.formatNum(mg, 2) + " (" + subG.length + ")" : "—",
            diff != null ? (diff >= 0 ? "+" : "") + h.formatNum(diff, 2) : "—"
          ]
        };
      })
    });

    var conds = ["Trustworthiness", "Generosity"].filter(function (c) {
      return rows.some(function (r) { return r.condition === c; });
    });
    h.renderBarChart({
      hostId: "chart-expect",
      tableHostId: "chart-expect-table",
      yMax: 6,
      yTicks: [0, 1, 2, 3, 4, 5, 6],
      yUnit: "",
      referenceLine: 3,
      valueDigits: 2,
      series: [
        { key: "shared", label: "Actual candies shared", color: "#2f6b4a" },
        { key: "exp", label: "Predicted partner expectation", color: "#5d748a" }
      ],
      tableHeaders: ["Condition", "n", "Mean candies shared", "Mean predicted expectation (numeric n)"],
      groups: conds.map(function (c) {
        var sub = rows.filter(function (r) { return r.condition === c; });
        var ms = h.meanOf(sub, "shared");
        var me = h.meanOf(sub, "expectation");
        var en = h.countValid(sub, "expectation");
        return {
          lines: [c, "n = " + sub.length],
          values: { shared: ms, exp: me },
          tableRow: [c, String(sub.length), h.formatNum(ms, 2), h.formatNum(me, 2) + " (n = " + en + ")"]
        };
      })
    });
  }
};
