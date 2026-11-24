window.STUDY_EXPLORER_CONFIG = {
  defaultSortKey: "country",
  maxSheetRows: 450,
  filters: [
    { id: "country", field: "country" },
    { id: "condShort", field: "condShort" },
    { id: "ageGroup", field: "ageGroup" },
    { id: "gender", field: "gender" }
  ],
  columns: [
    ["pid", "Participant"],
    ["country", "Society"],
    ["condition", "Condition"],
    ["ageGroup", "Age group"],
    ["age", "Age (yrs)"],
    ["trials", "Valid trials"],
    ["unequalRejectPct", "Unequal rejected (%)", "pct"],
    ["equalRejectPct", "Equal rejected (%)", "pct"],
    ["unequalRt", "Unequal RT (s)", "num2"],
    ["equalRt", "Equal RT (s)", "num2"]
  ],
  summaryText: function (rows) {
    var totalT = rows.reduce(function (s, r) { return s + (r.trials || 0); }, 0);
    return rows.length + " participant records · " + totalT.toLocaleString() + " Inequity Game trials";
  },
  computeStats: function (rows, h) {
    var di = rows.filter(function (r) { return r.condShort === "DI"; });
    var ai = rows.filter(function (r) { return r.condShort === "AI"; });
    var urt = h.meanOf(rows, "unequalRt");
    var ert = h.meanOf(rows, "equalRt");
    return [
      [di.length ? h.formatPct(h.meanOf(di, "unequalRejectPct"), 1) : "—", "mean rejection of disadvantageous unequal offers (1–4 DI)"],
      [ai.length ? h.formatPct(h.meanOf(ai, "unequalRejectPct"), 1) : "—", "mean rejection of advantageous unequal offers (4–1 AI)"],
      [h.formatNum(urt, 2) + "s vs. " + h.formatNum(ert, 2) + "s", "mean reaction time on unequal vs. equal trials"]
    ];
  },
  renderCharts: function (rows, h) {
    var countries = ["USA", "Canada", "Senegal", "Uganda", "Peru", "India", "Mexico (Maya)"].filter(function (c) {
      return rows.some(function (r) { return r.country === c; });
    });
    h.renderBarChart({
      hostId: "chart-reject",
      tableHostId: "chart-reject-table",
      yMax: 100,
      yTicks: [0, 25, 50, 75, 100],
      yUnit: "%",
      valueDigits: 0,
      series: [
        { key: "di", label: "Disadvantageous (1–4 DI)", color: "#d9842b" },
        { key: "ai", label: "Advantageous (4–1 AI)", color: "#285c3f" }
      ],
      tableHeaders: ["Society", "n", "DI unequal rejected", "AI unequal rejected", "Equal offers rejected"],
      groups: countries.map(function (c) {
        var sub = rows.filter(function (r) { return r.country === c; });
        var sdi = sub.filter(function (r) { return r.condShort === "DI"; });
        var sai = sub.filter(function (r) { return r.condShort === "AI"; });
        var vdi = h.meanOf(sdi, "unequalRejectPct");
        var vai = h.meanOf(sai, "unequalRejectPct");
        var veq = h.meanOf(sub, "equalRejectPct");
        return {
          lines: [c === "Mexico (Maya)" ? "Mexico" : c, "n = " + sub.length],
          values: { di: vdi, ai: vai },
          tableRow: [c, String(sub.length), h.formatPct(vdi, 1), h.formatPct(vai, 1), h.formatPct(veq, 1)]
        };
      })
    });

    h.renderBarChart({
      hostId: "chart-rt",
      tableHostId: "chart-rt-table",
      yMax: 4.5,
      yTicks: [0, 1, 2, 3, 4],
      yUnit: "s",
      valueDigits: 2,
      series: [
        { key: "un", label: "Unequal distribution RT", color: "#5d748a" },
        { key: "eq", label: "Equal distribution RT", color: "#8fb99f" }
      ],
      tableHeaders: ["Society", "n", "Unequal mean RT (s)", "Equal mean RT (s)"],
      groups: countries.map(function (c) {
        var sub = rows.filter(function (r) { return r.country === c; });
        var vun = h.meanOf(sub, "unequalRt");
        var veq = h.meanOf(sub, "equalRt");
        return {
          lines: [c === "Mexico (Maya)" ? "Mexico" : c, "n = " + sub.length],
          values: { un: vun, eq: veq },
          tableRow: [c, String(sub.length), h.formatNum(vun, 2) + "s", h.formatNum(veq, 2) + "s"]
        };
      })
    });
  }
};
