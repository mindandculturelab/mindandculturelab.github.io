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
    ["givenBack", "Returned (/5)"],
    ["thrownAway", "Trashed (/5)"],
    ["judgment", "Verbal evaluation"],
    ["badnessScore", "Badness (1–6)"]
  ],
  summaryText: function (rows, h) {
    return rows.length + " children · mean returned = " + h.formatNum(h.meanOf(rows, "givenBack"), 2) + " of 5 sheets";
  },
  computeStats: function (rows, h) {
    var mg = h.meanOf(rows, "givenBack");
    var allFive = rows.filter(function (r) { return r.givenBack === 5; }).length;
    var mb = h.meanOf(rows, "badnessScore");
    return [
      [h.formatNum(mg, 2) + " / 5", "mean scratch sheets returned to peer (chance = 2.50)"],
      [h.formatPct((allFive / rows.length) * 100, 1), "returned all 5 of 5 sheets (" + allFive + " children)"],
      [h.formatNum(mb, 2) + " / 6", "mean transgressor badness rating (4 = 'a little bad', 6 = 'very, very bad')"]
    ];
  },
  renderCharts: function (rows, h) {
    var ages = ["5-6 year olds", "7-8 year olds", "9-10 year olds"].filter(function (a) {
      return rows.some(function (r) { return r.ageGroup === a; });
    });
    h.renderBarChart({
      hostId: "chart-intent-age",
      tableHostId: "chart-intent-age-table",
      yMax: 5,
      yTicks: [0, 1, 2, 3, 4, 5],
      yUnit: "",
      referenceLine: 2.5,
      valueDigits: 2,
      series: [
        { key: "base", label: "Baseline", color: "#5d748a" },
        { key: "acc", label: "Accidental harm", color: "#285c3f" },
        { key: "int", label: "Intentional harm", color: "#d9842b" }
      ],
      tableHeaders: ["Age group", "Baseline (/5)", "Accidental harm (/5)", "Intentional harm (/5)"],
      groups: ages.map(function (ag) {
        var sb = rows.filter(function (r) { return r.ageGroup === ag && r.intent === "Baseline"; });
        var sa = rows.filter(function (r) { return r.ageGroup === ag && r.intent === "Accidental"; });
        var si = rows.filter(function (r) { return r.ageGroup === ag && r.intent === "Intentional"; });
        var mb = h.meanOf(sb, "givenBack");
        var ma = h.meanOf(sa, "givenBack");
        var mi = h.meanOf(si, "givenBack");
        return {
          lines: [ag, "n = " + (sb.length + sa.length + si.length)],
          values: { base: mb, acc: ma, int: mi },
          tableRow: [
            ag,
            mb != null ? h.formatNum(mb, 2) + " (n=" + sb.length + ")" : "—",
            ma != null ? h.formatNum(ma, 2) + " (n=" + sa.length + ")" : "—",
            mi != null ? h.formatNum(mi, 2) + " (n=" + si.length + ")" : "—"
          ]
        };
      })
    });

    var condOrder = [
      ["Baseline (No Harm)", "Baseline"],
      ["Accidental + Remorse", "Acc. + Remorse"],
      ["Accidental + No Remorse", "Acc. + No Rem."],
      ["Intentional + Remorse", "Int. + Remorse"],
      ["Intentional + No Remorse", "Int. + No Rem."]
    ].filter(function (c) {
      return rows.some(function (r) { return r.condition === c[0]; });
    });
    h.renderBarChart({
      hostId: "chart-badness",
      tableHostId: "chart-badness-table",
      yMax: 6,
      yTicks: [0, 1, 2, 3, 4, 5, 6],
      yUnit: "",
      valueDigits: 2,
      series: [
        { key: "ret", label: "Sheets returned (0–5)", color: "#2f6b4a" },
        { key: "bad", label: "Badness judgment (1–6)", color: "#c9643b" }
      ],
      tableHeaders: ["Condition", "n", "Mean sheets returned (/5)", "Mean badness score (1–6)"],
      groups: condOrder.map(function (c) {
        var sub = rows.filter(function (r) { return r.condition === c[0]; });
        var mr = h.meanOf(sub, "givenBack");
        var mb = h.meanOf(sub, "badnessScore");
        return {
          lines: [c[1], "n = " + sub.length],
          values: { ret: mr, bad: mb },
          tableRow: [c[0], String(sub.length), h.formatNum(mr, 2), h.formatNum(mb, 2)]
        };
      })
    });
  }
};
