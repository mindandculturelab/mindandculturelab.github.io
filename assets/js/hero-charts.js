(function () {
  const stage = document.querySelector("[data-hero-charts]");
  if (!stage) return;

  // Color test-trial success rates from Rivero, Vasil, & Tomasello (2026):
  // 2yo dyads 83.3%, 2yo triads 46.7%, 3yo dyads 96.7%, 3yo triads 90.0%.
  const conditions = [
    { key: "a", label: "2 · Dyad", pct: 83 },
    { key: "b", label: "2 · Triad", pct: 47 },
    { key: "c", label: "3 · Dyad", pct: 97 },
    { key: "d", label: "3 · Triad", pct: 90 }
  ];

  stage.innerHTML = [
    '<div class="chart-glimpse">',
    '  <div class="chart-panel chart-bars">',
    '    <p class="chart-label">Success by condition</p>',
    '    <div class="chart-bar-row chart-bar-row-4">',
    conditions
      .map(function (item) {
        return [
          '<div class="chart-bar-item">',
          '  <span class="chart-bar-pct pct-' + item.key + '">' + item.pct + "%</span>",
          '  <span class="chart-bar-track"><span class="chart-bar-fill bar-' + item.key + '" data-pct="' + item.pct + '"></span></span>',
          '  <span class="chart-bar-name">' + item.label + "</span>",
          "</div>"
        ].join("");
      })
      .join(""),
    "    </div>",
    "  </div>",
    "</div>"
  ].join("");

  const fills = stage.querySelectorAll(".chart-bar-fill");
  const pcts = stage.querySelectorAll(".chart-bar-pct");

  function animateIn() {
    fills.forEach(function (fill) {
      fill.style.height = fill.getAttribute("data-pct") + "%";
    });
    pcts.forEach(function (pct) {
      pct.classList.add("is-visible");
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    animateIn();
  } else if (typeof IntersectionObserver !== "undefined") {
    const io = new IntersectionObserver(
      function (entries) {
        if (entries.some(function (en) {
          return en.isIntersecting;
        })) {
          animateIn();
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(stage);
  } else {
    animateIn();
  }

  stage.addEventListener("click", function () {
    window.location.href = "data/";
  });
})();
