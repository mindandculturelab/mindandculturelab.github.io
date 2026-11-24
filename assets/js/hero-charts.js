(function () {
  const stage = document.querySelector("[data-hero-charts]");
  if (!stage) return;

  stage.innerHTML = [
    '<div class="chart-glimpse">',
    '  <div class="chart-panel chart-donut">',
    '    <p class="chart-label">Strategy mix</p>',
    '    <svg viewBox="0 0 120 120" role="presentation">',
    '      <circle class="donut-track" cx="60" cy="60" r="34" />',
    '      <circle class="donut-seg donut-seg-a" cx="60" cy="60" r="34" />',
    '      <circle class="donut-seg donut-seg-b" cx="60" cy="60" r="34" />',
    '      <circle class="donut-hole" cx="60" cy="60" r="20" />',
    '      <text class="donut-center" x="60" y="57" text-anchor="middle">N=100</text>',
    '      <text class="donut-sub" x="60" y="72" text-anchor="middle">children</text>',
    "    </svg>",
    "  </div>",
    '  <div class="chart-panel chart-bars">',
    '    <p class="chart-label">Success by age</p>',
    '    <div class="chart-bar-row">',
    '      <div class="chart-bar-item">',
    '        <span class="chart-bar-pct pct-a">62%</span>',
    '        <span class="chart-bar-track"><span class="chart-bar-fill bar-a"></span></span>',
    "        <span class=\"chart-bar-name\">Age 2</span>",
    "      </div>",
    '      <div class="chart-bar-item">',
    '        <span class="chart-bar-pct pct-b">81%</span>',
    '        <span class="chart-bar-track"><span class="chart-bar-fill bar-b"></span></span>',
    "        <span class=\"chart-bar-name\">Age 3</span>",
    "      </div>",
    "    </div>",
    "  </div>",
    "</div>"
  ].join("");

  const fillA = stage.querySelector(".bar-a");
  const fillB = stage.querySelector(".bar-b");
  const pctA = stage.querySelector(".pct-a");
  const pctB = stage.querySelector(".pct-b");

  function animateIn() {
    if (fillA) fillA.style.height = "62%";
    if (fillB) fillB.style.height = "81%";
    if (pctA) pctA.classList.add("is-visible");
    if (pctB) pctB.classList.add("is-visible");
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
