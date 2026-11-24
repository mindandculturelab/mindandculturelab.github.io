(function () {
  const stage = document.querySelector("[data-hero-charts]");
  if (!stage) return;

  // Color test-trial success from Rivero, Vasil, & Tomasello (2026).
  // Grouped views approximate the same cells the explorer lets you filter by.
  const views = [
    {
      id: "age",
      pill: "Age",
      title: "Success by age",
      bars: [
        { key: "a", label: "2 years", pct: 65 },
        { key: "c", label: "3 years", pct: 93 }
      ]
    },
    {
      id: "size",
      pill: "Group size",
      title: "Success by group size",
      bars: [
        { key: "a", label: "Dyads", pct: 90 },
        { key: "b", label: "Triads", pct: 68 }
      ]
    },
    {
      id: "condition",
      pill: "Condition",
      title: "Success by condition",
      bars: [
        { key: "a", label: "2 · Dyad", pct: 83 },
        { key: "b", label: "2 · Triad", pct: 47 },
        { key: "c", label: "3 · Dyad", pct: 97 },
        { key: "d", label: "3 · Triad", pct: 90 }
      ]
    }
  ];

  const HOLD_MS = 2800;
  const FADE_MS = 320;
  const GROW_MS = 700;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  stage.innerHTML = [
    '<div class="chart-glimpse">',
    '  <div class="chart-panel chart-bars">',
    '    <div class="chart-group-pills" role="presentation" data-chart-pills></div>',
    '    <p class="chart-label" data-chart-title></p>',
    '    <div class="chart-bar-row" data-chart-bars></div>',
    "  </div>",
    "</div>"
  ].join("");

  const glimpse = stage.querySelector(".chart-glimpse");
  const pillsHost = stage.querySelector("[data-chart-pills]");
  const titleEl = stage.querySelector("[data-chart-title]");
  const barsHost = stage.querySelector("[data-chart-bars]");

  pillsHost.innerHTML = views
    .map(function (view, index) {
      return (
        '<span class="chart-group-pill" data-pill-index="' +
        index +
        '">' +
        view.pill +
        "</span>"
      );
    })
    .join("");

  const pillEls = pillsHost.querySelectorAll(".chart-group-pill");

  let viewIndex = 0;
  let cycleTimer = 0;
  let transitionTimer = 0;
  let transitionGen = 0;
  let visible = true;
  let started = false;

  function renderBars(view, withHeights) {
    barsHost.className = "chart-bar-row chart-bar-row-" + view.bars.length;
    barsHost.innerHTML = view.bars
      .map(function (item) {
        const height = withHeights ? item.pct + "%" : "0%";
        return [
          '<div class="chart-bar-item">',
          '  <span class="chart-bar-pct is-visible pct-' + item.key + '">' + item.pct + "%</span>",
          '  <span class="chart-bar-track">',
          '    <span class="chart-bar-fill bar-' + item.key + '" style="height:' + height + '"></span>',
          "  </span>",
          '  <span class="chart-bar-name">' + item.label + "</span>",
          "</div>"
        ].join("");
      })
      .join("");
  }

  function setActivePill(index) {
    pillEls.forEach(function (pill, i) {
      pill.classList.toggle("is-active", i === index);
    });
  }

  function growBars(view) {
    barsHost.querySelectorAll(".chart-bar-fill").forEach(function (fill, i) {
      fill.style.height = view.bars[i].pct + "%";
    });
  }

  function showView(index, animate) {
    const view = views[index];
    const gen = ++transitionGen;
    window.clearTimeout(transitionTimer);
    setActivePill(index);

    if (!animate) {
      glimpse.classList.remove("is-fading");
      titleEl.textContent = view.title;
      renderBars(view, true);
      return;
    }

    glimpse.classList.add("is-fading");
    transitionTimer = window.setTimeout(function () {
      if (gen !== transitionGen) return;
      titleEl.textContent = view.title;
      renderBars(view, false);
      glimpse.classList.remove("is-fading");
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          if (gen !== transitionGen) return;
          growBars(view);
        });
      });
    }, FADE_MS);
  }

  function scheduleNext() {
    window.clearTimeout(cycleTimer);
    if (reduceMotion || !visible) return;
    cycleTimer = window.setTimeout(function () {
      viewIndex = (viewIndex + 1) % views.length;
      showView(viewIndex, true);
      scheduleNext();
    }, HOLD_MS + FADE_MS + GROW_MS);
  }

  function startLoop() {
    if (started || reduceMotion) return;
    started = true;
    const view = views[viewIndex];
    renderBars(view, false);
    setActivePill(viewIndex);
    titleEl.textContent = view.title;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        growBars(view);
        scheduleNext();
      });
    });
  }

  if (reduceMotion) {
    showView(2, false);
  } else if (typeof IntersectionObserver !== "undefined") {
    setActivePill(0);
    titleEl.textContent = views[0].title;
    renderBars(views[0], false);
    const io = new IntersectionObserver(
      function (entries) {
        visible = entries.some(function (en) {
          return en.isIntersecting;
        });
        if (visible) {
          if (!started) {
            startLoop();
          } else {
            scheduleNext();
          }
        } else {
          window.clearTimeout(cycleTimer);
          window.clearTimeout(transitionTimer);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(stage);
  } else {
    startLoop();
  }

  stage.addEventListener("click", function () {
    window.location.href = "data/";
  });
})();
