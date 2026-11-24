(function () {
  const stage = document.querySelector("[data-hero-charts]");
  if (!stage) return;

  stage.innerHTML = [
    '<div class="chart-glimpse">',
    '  <div class="chart-panel chart-bars">',
    '    <p class="chart-label">Success by age</p>',
    '    <svg viewBox="0 0 160 110" role="presentation">',
    '      <line class="chart-axis" x1="28" y1="12" x2="28" y2="88" />',
    '      <line class="chart-axis" x1="28" y1="88" x2="148" y2="88" />',
    '      <rect class="bar bar-a" x="42" y="88" width="28" height="0" rx="4" />',
    '      <rect class="bar bar-b" x="90" y="88" width="28" height="0" rx="4" />',
    '      <text class="chart-tick" x="56" y="102" text-anchor="middle">Age 2</text>',
    '      <text class="chart-tick" x="104" y="102" text-anchor="middle">Age 3</text>',
    '      <text class="chart-pct pct-a" x="56" y="0" text-anchor="middle">62%</text>',
    '      <text class="chart-pct pct-b" x="104" y="0" text-anchor="middle">81%</text>',
    "    </svg>",
    "  </div>",
    '  <div class="chart-panel chart-donut">',
    '    <p class="chart-label">Strategy mix</p>',
    '    <svg viewBox="0 0 120 110" role="presentation">',
    '      <circle class="donut-track" cx="60" cy="54" r="32" />',
    '      <circle class="donut-seg donut-seg-a" cx="60" cy="54" r="32" />',
    '      <circle class="donut-seg donut-seg-b" cx="60" cy="54" r="32" />',
    '      <circle class="donut-hole" cx="60" cy="54" r="18" />',
    '      <text class="donut-center" x="60" y="58" text-anchor="middle">N=100</text>',
    "    </svg>",
    '    <ul class="chart-legend">',
    "      <li><span class=\"swatch swatch-sage\"></span>Match</li>",
    "      <li><span class=\"swatch swatch-terra\"></span>Switch</li>",
    "      <li><span class=\"swatch swatch-lilac\"></span>Other</li>",
    "    </ul>",
    "  </div>",
    '  <div class="chart-panel chart-spark">',
    '    <p class="chart-label">Trials over session</p>',
    '    <svg viewBox="0 0 160 70" role="presentation">',
    '      <polyline class="spark-fill" points="8,58 8,58 160,58 160,58" />',
    '      <polyline class="spark-line" points="8,52 34,46 60,38 86,42 112,28 138,22 152,18" />',
    '      <circle class="spark-dot" cx="152" cy="18" r="3.5" />',
    "    </svg>",
    "  </div>",
    "</div>"
  ].join("");

  const barA = stage.querySelector(".bar-a");
  const barB = stage.querySelector(".bar-b");
  const pctA = stage.querySelector(".pct-a");
  const pctB = stage.querySelector(".pct-b");
  const sparkFill = stage.querySelector(".spark-fill");
  const sparkLine = stage.querySelector(".spark-line");

  const barTargets = [
    { el: barA, h: 48, y: 40, pct: pctA },
    { el: barB, h: 62, y: 26, pct: pctB }
  ];

  function animateIn() {
    barTargets.forEach(function (item, i) {
      window.setTimeout(function () {
        item.el.setAttribute("y", String(item.y));
        item.el.setAttribute("height", String(item.h));
        item.pct.setAttribute("y", String(item.y - 6));
        item.pct.classList.add("is-visible");
      }, 120 + i * 160);
    });

    if (sparkLine) sparkLine.classList.add("is-drawn");
    if (sparkFill) {
      sparkFill.setAttribute(
        "points",
        "8,58 8,52 34,46 60,38 86,42 112,28 138,22 152,18 152,58 8,58"
      );
      sparkFill.classList.add("is-visible");
    }

    stage.querySelectorAll(".donut-seg").forEach(function (seg) {
      seg.classList.add("is-drawn");
    });
  }

  if (typeof IntersectionObserver !== "undefined") {
    const io = new IntersectionObserver(
      function (entries) {
        if (entries.some(function (en) { return en.isIntersecting; })) {
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
