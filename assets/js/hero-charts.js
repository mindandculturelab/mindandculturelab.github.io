(function () {
  const stage = document.querySelector("[data-hero-charts]");
  if (!stage) return;

  // Color test-trial success from Rivero, Vasil, & Tomasello (2026).
  // Condition is the Age × Group size factorial; the third view builds that 2×2.
  const views = [
    {
      id: "age",
      pill: "Age",
      title: "Success by age",
      kind: "bars",
      bars: [
        { key: "a", label: "2 years", pct: 65 },
        { key: "c", label: "3 years", pct: 93 }
      ]
    },
    {
      id: "size",
      pill: "Group size",
      title: "Success by group size",
      kind: "bars",
      bars: [
        { key: "a", label: "Dyads", pct: 90 },
        { key: "b", label: "Triads", pct: 68 }
      ]
    },
    {
      id: "interaction",
      pill: "Age × Size",
      title: "Age × Group size",
      kind: "interaction",
      ages: [
        {
          label: "2 years",
          bars: [
            { key: "dyad", label: "Dyad", pct: 83 },
            { key: "triad", label: "Triad", pct: 47 }
          ]
        },
        {
          label: "3 years",
          bars: [
            { key: "dyad", label: "Dyad", pct: 97 },
            { key: "triad", label: "Triad", pct: 90 }
          ]
        }
      ]
    }
  ];

  const HOLD_MS = 2800;
  const HOLD_INTERACTION_MS = 3600;
  const FADE_MS = 320;
  const GROW_MS = 700;
  const STAGGER_MS = 280;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  stage.innerHTML = [
    '<div class="chart-glimpse">',
    '  <div class="chart-panel chart-bars">',
    '    <div class="chart-group-pills" role="presentation" data-chart-pills></div>',
    '    <p class="chart-label" data-chart-title></p>',
    '    <div class="chart-bar-row" data-chart-bars></div>',
    '    <p class="chart-factor-hint" data-chart-hint hidden></p>',
    "  </div>",
    "</div>"
  ].join("");

  const glimpse = stage.querySelector(".chart-glimpse");
  const pillsHost = stage.querySelector("[data-chart-pills]");
  const titleEl = stage.querySelector("[data-chart-title]");
  const barsHost = stage.querySelector("[data-chart-bars]");
  const hintEl = stage.querySelector("[data-chart-hint]");

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
  let staggerTimer = 0;
  let transitionGen = 0;
  let visible = true;
  let started = false;

  function barMarkup(item) {
    return [
      '<div class="chart-bar-item">',
      '  <span class="chart-bar-pct is-visible pct-' + item.key + '">' + item.pct + "%</span>",
      '  <span class="chart-bar-track">',
      '    <span class="chart-bar-fill bar-' + item.key + '" style="height:0%"></span>',
      "  </span>",
      '  <span class="chart-bar-name">' + item.label + "</span>",
      "</div>"
    ].join("");
  }

  function renderBars(view, withHeights) {
    hintEl.hidden = view.kind !== "interaction";
    hintEl.textContent = view.kind === "interaction" ? "Interaction of age and group size" : "";

    if (view.kind === "interaction") {
      barsHost.className = "chart-bar-row chart-bar-row-interaction";
      barsHost.innerHTML = view.ages
        .map(function (age, ageIndex) {
          return [
            '<div class="chart-age-cluster" data-age-index="' + ageIndex + '">',
            '  <span class="chart-age-label">' + age.label + "</span>",
            '  <div class="chart-age-bars">',
            age.bars.map(barMarkup).join(""),
            "  </div>",
            "</div>"
          ].join("");
        })
        .join("");

      if (withHeights) {
        barsHost.querySelectorAll(".chart-bar-fill").forEach(function (fill, i) {
          const flat = view.ages[0].bars.concat(view.ages[1].bars);
          fill.style.height = flat[i].pct + "%";
        });
      }
      return;
    }

    barsHost.className = "chart-bar-row chart-bar-row-" + view.bars.length;
    barsHost.innerHTML = view.bars.map(barMarkup).join("");
    if (withHeights) {
      barsHost.querySelectorAll(".chart-bar-fill").forEach(function (fill, i) {
        fill.style.height = view.bars[i].pct + "%";
      });
    }
  }

  function setActivePill(index) {
    pillEls.forEach(function (pill, i) {
      pill.classList.toggle("is-active", i === index);
    });
  }

  function flatPcts(view) {
    if (view.kind === "interaction") {
      return view.ages[0].bars.concat(view.ages[1].bars).map(function (b) {
        return b.pct;
      });
    }
    return view.bars.map(function (b) {
      return b.pct;
    });
  }

  function growBars(view, staggered) {
    const fills = barsHost.querySelectorAll(".chart-bar-fill");
    const pcts = flatPcts(view);
    window.clearTimeout(staggerTimer);

    if (!staggered || view.kind !== "interaction") {
      fills.forEach(function (fill, i) {
        fill.style.transitionDelay = "0ms";
        fill.style.height = pcts[i] + "%";
      });
      return;
    }

    // Build the factorial in motion: age clusters appear, then dyads, then triads —
    // so the Age × Size crossing is readable as it assembles.
    barsHost.querySelectorAll(".chart-age-cluster").forEach(function (cluster, i) {
      cluster.classList.add("is-revealed");
      cluster.style.transitionDelay = i * 90 + "ms";
    });

    fills.forEach(function (fill, i) {
      const isTriad = i % 2 === 1;
      fill.style.transitionDelay = (isTriad ? STAGGER_MS + 120 : 80) + "ms";
      fill.style.height = pcts[i] + "%";
    });
  }

  function showView(index, animate) {
    const view = views[index];
    const gen = ++transitionGen;
    window.clearTimeout(transitionTimer);
    window.clearTimeout(staggerTimer);
    setActivePill(index);

    if (!animate) {
      glimpse.classList.remove("is-fading");
      titleEl.textContent = view.title;
      renderBars(view, true);
      if (view.kind === "interaction") {
        barsHost.querySelectorAll(".chart-age-cluster").forEach(function (cluster) {
          cluster.classList.add("is-revealed");
        });
      }
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
          growBars(view, true);
        });
      });
    }, FADE_MS);
  }

  function holdMs(index) {
    return views[index].kind === "interaction" ? HOLD_INTERACTION_MS : HOLD_MS;
  }

  function scheduleNext() {
    window.clearTimeout(cycleTimer);
    if (reduceMotion || !visible) return;
    const current = views[viewIndex];
    const growExtra = current.kind === "interaction" ? STAGGER_MS + 120 : 0;
    cycleTimer = window.setTimeout(function () {
      viewIndex = (viewIndex + 1) % views.length;
      showView(viewIndex, true);
      scheduleNext();
    }, holdMs(viewIndex) + FADE_MS + GROW_MS + growExtra);
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
        growBars(view, true);
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
          window.clearTimeout(staggerTimer);
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
