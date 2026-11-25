/**
 * Volcano Escape Game — interactive flat 2D iPad (SEARCH-App graphics)
 * Click cells to explore/exploit; coach copy walks through the tradeoff + goal framing.
 * https://github.com/alissarivero/SEARCH-App
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const ASSET = "./assets/search/";
const HORIZON = 25;
const START_CELL = 18;

const GOAL_COPY = {
  volcano_escape: "Bigger rocks get you farther away from the volcano",
  bigger_reward: "Bigger rocks get you a bigger prize"
};

function rewardAt(i, j) {
  const x = (i - 3.5) / 3.5;
  const y = (j - 3.5) / 3.5;
  const peak = Math.exp(-((x - 0.55) ** 2 + (y - 0.45) ** 2) / 0.55);
  const ridge = Math.exp(-((x + 0.4) ** 2 + (y + 0.5) ** 2) / 0.9) * 0.45;
  return Math.min(1, peak * 0.95 + ridge);
}

function rockScale(t) {
  return Math.max(0.18, Math.min(1, 0.18 + t * 0.82));
}

function sizeWord(t) {
  if (t >= 0.72) return "large";
  if (t >= 0.4) return "medium";
  return "small";
}

export function buildSearchProcedure() {
  const steps = [
    {
      short: "1. Explore",
      title: "Explore: uncover a new square",
      badge: "Click an empty cell · 25 clicks",
      body: "One square is already revealed. Click any empty cell to explore—you will learn a new rock size (nearby squares tend to be similar). Each click spends one of your 25 clicks and adds that rock to the side panel.",
      why: "Exploration gathers information about the map, but uses up the limited click horizon.",
      tip: "Click an empty square to explore",
      camera: { pos: [0, 0, 1], look: [0, 0, 0] }
    },
    {
      short: "2. Exploit",
      title: "Exploit: re-click a known high-value rock",
      badge: "Re-click a revealed cell",
      body: "Find your biggest revealed rock and click it again. That is exploitation: you collect another rock of about the same size without learning anything new. Notice how the side panel grows with each click.",
      why: "Exploitation cashes in on what you already know—powerful once you have found a good patch, but it stops you from discovering better ones.",
      tip: "Re-click your biggest rock to exploit",
      camera: { pos: [0, 0, 1], look: [0, 0, 0] }
    },
    {
      short: "3. Tradeoff",
      title: "Every click is explore or exploit",
      badge: "Keep playing · watch clicks fall",
      body: "Keep clicking. Mix new squares (explore) with re-clicks on large rocks (exploit). With a fixed horizon, children must decide when to stop searching and when to harvest what they have found.",
      why: "A fixed number of clicks creates the classic explore–exploit tradeoff inside a single map.",
      tip: "Mix new squares and re-clicks · watch the click bar",
      camera: { pos: [0, 0, 1], look: [0, 0, 0] }
    },
    {
      short: "4. Two goals",
      title: "Same map, different goal",
      badge: "Toggle Volcano Escape ↔ Bigger Reward",
      body: 'We hold the map fixed and manipulate only the instructed goal. Volcano Escape: “Bigger rocks get you farther away from the volcano.” Bigger Reward: “Bigger rocks get you a bigger prize.” Toggle the condition above and keep collecting—the rocks are the same; the story about why size matters changes.',
      why: "Varying the goal while holding the search problem constant isolates how motivation shapes explore–exploit choices.",
      tip: "Toggle the goal above, then keep clicking",
      camera: { pos: [0, 0, 1], look: [0, 0, 0] }
    }
  ];

  let condition = "volcano_escape";
  let stepIndex = 0;
  let clicksLeft = HORIZON;
  let host = null;
  let cells = [];
  let binEl = null;
  let volcanoWrap = null;
  let prizeWrap = null;
  let clicksFill = null;
  let clicksCount = null;
  let goalBanner = null;
  let activeIndex = -1;
  let revealed = new Set();
  let exploreCount = 0;
  let exploitCount = 0;
  let toggledGoal = false;
  let guideApi = null;
  let lastMove = null;

  const rewards = [];
  for (let j = 0; j < 8; j += 1) {
    for (let i = 0; i < 8; i += 1) {
      rewards.push(rewardAt(i, j));
    }
  }

  function clearBin() {
    if (!binEl) return;
    binEl.replaceChildren();
  }

  function addRockToBin(value01) {
    if (!binEl) return;
    const slot = document.createElement("div");
    slot.className = "search-ipad-bin-slot";
    const img = document.createElement("img");
    img.src = ASSET + "rock.svg";
    img.alt = "";
    img.style.transform = "scale(" + rockScale(value01) + ")";
    slot.appendChild(img);
    if (condition === "bigger_reward") {
      binEl.prepend(slot);
    } else {
      binEl.appendChild(slot);
    }
    while (binEl.children.length > 14) {
      if (condition === "bigger_reward") {
        binEl.removeChild(binEl.lastChild);
      } else {
        binEl.removeChild(binEl.firstChild);
      }
    }
  }

  function paintCell(index) {
    const cell = cells[index];
    if (!cell) return;
    const isRevealed = revealed.has(index);
    cell.classList.toggle("is-revealed", isRevealed);
    cell.classList.toggle("is-active", index === activeIndex);
    const img = cell.querySelector("img");
    if (!img) return;
    if (isRevealed) {
      img.hidden = false;
      img.style.transform = "scale(" + rockScale(rewards[index]) + ")";
    } else {
      img.hidden = true;
      img.style.transform = "";
    }
  }

  function paintAll() {
    cells.forEach(function (_, i) {
      paintCell(i);
    });
  }

  function updateChrome() {
    const pct = (clicksLeft / HORIZON) * 100;
    if (clicksFill) clicksFill.style.height = pct + "%";
    if (clicksCount) {
      clicksCount.textContent = String(clicksLeft);
      clicksCount.style.bottom = pct + "%";
    }
    if (volcanoWrap) {
      volcanoWrap.classList.toggle("is-hidden", condition !== "volcano_escape");
    }
    if (prizeWrap) {
      const showPrize = condition === "bigger_reward";
      prizeWrap.classList.toggle("is-hidden", !showPrize);
      prizeWrap.setAttribute("aria-hidden", showPrize ? "false" : "true");
    }
    if (binEl) {
      binEl.classList.toggle("is-escape", condition === "volcano_escape");
      binEl.classList.toggle("is-bigger", condition === "bigger_reward");
    }
    if (goalBanner) {
      goalBanner.textContent = GOAL_COPY[condition] || GOAL_COPY.volcano_escape;
      goalBanner.dataset.condition = condition;
    }
  }

  function liveBodyAddon() {
    if (!lastMove) return "";
    if (lastMove.kind === "explore") {
      return (
        " You just explored and found a " +
        sizeWord(lastMove.value) +
        " rock."
      );
    }
    return (
      " You just exploited a known " +
      sizeWord(lastMove.value) +
      " rock—same square, another collect."
    );
  }

  function publishGuide() {
    if (!guideApi) return;
    const st = steps[stepIndex];
    let body = st.body + liveBodyAddon();
    if (stepIndex === 3) {
      body =
        "Current goal: “" +
        GOAL_COPY[condition] +
        ".” " +
        st.body +
        liveBodyAddon();
    }
    guideApi.setCopy({
      index: stepIndex,
      total: steps.length,
      title: st.title,
      body: body,
      why: st.why,
      badge: st.badge + " · " + clicksLeft + " clicks left",
      tip: st.tip
    });
  }

  function maybeAdvanceGuide() {
    // Auto-advance when the player completes each teaching beat
    if (stepIndex === 0 && exploreCount >= 1) {
      stepIndex = 1;
    } else if (stepIndex === 1 && exploitCount >= 1) {
      stepIndex = 2;
    } else if (stepIndex === 2 && exploreCount + exploitCount >= 6) {
      stepIndex = 3;
    } else if (stepIndex === 3 && toggledGoal && (exploreCount + exploitCount) >= 7) {
      // stay on last step; copy already updates
    }
    publishGuide();
  }

  function resetBoard() {
    clicksLeft = HORIZON;
    exploreCount = 0;
    exploitCount = 0;
    toggledGoal = false;
    lastMove = null;
    activeIndex = START_CELL;
    revealed = new Set([START_CELL]);
    clearBin();
    // Starter square is known (and staged) without spending a click
    paintAll();
    addRockToBin(rewards[START_CELL]);
    updateChrome();
  }

  function handleCellClick(index) {
    if (clicksLeft <= 0) {
      lastMove = null;
      publishGuide();
      if (guideApi && guideApi.setTip) {
        guideApi.setTip("Out of clicks — hit Reset map to try again");
      }
      return;
    }

    const wasKnown = revealed.has(index);
    const value = rewards[index];
    clicksLeft -= 1;
    activeIndex = index;
    revealed.add(index);
    addRockToBin(value);

    if (wasKnown) {
      exploitCount += 1;
      lastMove = { kind: "exploit", value: value, index: index };
    } else {
      exploreCount += 1;
      lastMove = { kind: "explore", value: value, index: index };
    }

    paintAll();
    updateChrome();
    maybeAdvanceGuide();
  }

  function buildDom(mountEl) {
    mountEl.innerHTML = [
      '<div class="search-ipad" data-search-ipad>',
      '  <div class="search-ipad-bezel">',
      '    <div class="search-ipad-screen">',
      '      <p class="search-ipad-goal" data-search-goal data-condition="volcano_escape"></p>',
      '      <div class="search-ipad-play">',
      '        <div class="search-ipad-clicks">',
      '          <div class="search-ipad-clicks-track">',
      '            <div class="search-ipad-clicks-fill" data-search-fill></div>',
      '            <span class="search-ipad-clicks-label" data-search-clicks>25</span>',
      "          </div>",
      "        </div>",
      '        <div class="search-ipad-grid-wrap"><div class="search-ipad-grid" data-search-grid role="grid" aria-label="Search map"></div></div>',
      '        <div class="search-ipad-side">',
      '          <div class="search-ipad-volcano" data-search-volcano><img src="' +
        ASSET +
        'volcano.svg" alt="" /></div>',
      '          <div class="search-ipad-prize is-hidden" data-search-prize aria-hidden="true">',
      '            <div class="search-ipad-prize-mark" aria-hidden="true"></div>',
      '            <span class="search-ipad-prize-label">Bigger prize</span>',
      "          </div>",
      '          <div class="search-ipad-bin is-escape" data-search-bin></div>',
      "        </div>",
      "      </div>",
      "    </div>",
      "  </div>",
      "</div>"
    ].join("");

    const grid = mountEl.querySelector("[data-search-grid]");
    cells = [];
    for (let i = 0; i < 64; i += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "search-ipad-cell";
      cell.setAttribute("aria-label", "Map cell " + (i + 1));
      const img = document.createElement("img");
      img.src = ASSET + "rock.svg";
      img.alt = "";
      img.hidden = true;
      cell.appendChild(img);
      cell.addEventListener("click", function () {
        handleCellClick(i);
      });
      grid.appendChild(cell);
      cells.push(cell);
    }

    binEl = mountEl.querySelector("[data-search-bin]");
    volcanoWrap = mountEl.querySelector("[data-search-volcano]");
    prizeWrap = mountEl.querySelector("[data-search-prize]");
    clicksFill = mountEl.querySelector("[data-search-fill]");
    clicksCount = mountEl.querySelector("[data-search-clicks]");
    goalBanner = mountEl.querySelector("[data-search-goal]");
    host = mountEl;
    resetBoard();
    updateChrome();
    if (goalBanner) goalBanner.textContent = GOAL_COPY[condition];
  }

  return {
    id: "search",
    mode: "flat2d",
    category: "online",
    interactive: true,
    tabTag: "Rivero, Pitt, & Amir · Explore–Exploit",
    tabName: "Volcano Escape Game",
    eyebrow: "Tasks · Goals shape children's explore-exploit tendencies",
    studyTitle: "Goals shape children's explore-exploit tendencies",
    studyHref: "../studies/search/",
    dataHref: "../studies/search/",
    paperHref: null,
    repoHref: "https://github.com/alissarivero/SEARCH-App",
    thumbSrc: ASSET + "thumb.jpg",
    condLabel: "Instructed goal",
    conditions: [
      { value: "volcano_escape", label: "Volcano Escape" },
      { value: "bigger_reward", label: "Bigger Reward" }
    ],
    defaultCondition: "volcano_escape",
    iv: {
      name: "Instructed goal (within participants)",
      blurb: "The 8×8 map and 25-click horizon stay fixed. Only the goal children are told changes—SEARCH-App counterbalances these two framings.",
      mode: "levels",
      levels: [
        {
          value: "volcano_escape",
          title: "Volcano Escape",
          detail: "“Bigger rocks get you farther away from the volcano.” Collected rocks build an escape path under the volcano."
        },
        {
          value: "bigger_reward",
          title: "Bigger Reward",
          detail: "“Bigger rocks get you a bigger prize.” Collected rocks stack toward a sized prize instead of an escape path."
        }
      ]
    },
    playLabel: "Reset map",
    clickTip: "Click an empty square to explore",
    steps: steps,
    root: new THREE.Group(),
    inspectables: [],
    mount: function (mountEl) {
      buildDom(mountEl);
    },
    unmount: function () {
      if (host) host.innerHTML = "";
      host = null;
      cells = [];
      binEl = null;
      guideApi = null;
    },
    bindGuide: function (api) {
      guideApi = api;
      publishGuide();
    },
    setCondition: function (val) {
      const prev = condition;
      condition = val;
      if (prev !== val) toggledGoal = true;
      // Rebuild bin order chrome only — keep the collected rocks
      updateChrome();
      if (stepIndex < 3 && toggledGoal) {
        stepIndex = 3;
      }
      publishGuide();
    },
    setStep: function (idx) {
      stepIndex = Math.max(0, Math.min(steps.length - 1, idx));
      // Do not wipe the player's board when they jump steps
      publishGuide();
    },
    playAction: function () {
      stepIndex = 0;
      resetBoard();
      updateChrome();
      publishGuide();
    },
    resetAction: function () {
      stepIndex = 0;
      resetBoard();
      updateChrome();
      publishGuide();
    },
    update: function () {
      // Interactive — no auto animation loop needed
    }
  };
}
