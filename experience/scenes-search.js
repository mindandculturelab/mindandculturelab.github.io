/**
 * Volcano Escape Game — flat 2D iPad recreation using SEARCH-App graphics
 * https://github.com/alissarivero/SEARCH-App
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const ASSET = "./assets/search/";

function rewardAt(i, j) {
  const x = (i - 3.5) / 3.5;
  const y = (j - 3.5) / 3.5;
  const peak = Math.exp(-((x - 0.55) ** 2 + (y - 0.45) ** 2) / 0.55);
  const ridge = Math.exp(-((x + 0.4) ** 2 + (y + 0.5) ** 2) / 0.9) * 0.45;
  return Math.min(1, peak * 0.95 + ridge);
}

function rockSizePct(t) {
  return Math.round(28 + t * 62);
}

export function buildSearchProcedure() {
  const steps = [
    {
      short: "1. Search Map",
      title: "Volcano Escape on the iPad",
      badge: "SEARCH-App graphics · 8×8 map · 25 clicks",
      body: "Children play SEARCH-App’s Volcano Escape Game on a tablet: an 8×8 map where each click reveals a rock. Bigger rocks mean higher rewards, nearby squares tend to share similar values, and one cell starts uncovered with 25 clicks remaining.",
      why: "Spatial correlation makes pure random search inefficient—children can generalize from local evidence when deciding whether to explore or exploit.",
      camera: { pos: [0, 0, 1], look: [0, 0, 0] }
    },
    {
      short: "2. Explore vs Exploit",
      title: "New squares or known rocks again",
      badge: "Horizon = 25 clicks per map",
      body: "Each click is a choice: uncover a new square to learn its rock size (explore), or re-click a revealed square to collect another rock of about the same size (exploit). Press play to watch rocks collect into the side panel.",
      why: "A fixed horizon forces the classic explore–exploit tradeoff inside a single map.",
      camera: { pos: [0, 0, 1], look: [0, 0, 0] },
      autoPlay: true
    },
    {
      short: "3. Two Framings",
      title: "Volcano Escape vs Bigger Reward",
      badge: "Toggle condition above · counterbalanced in SEARCH-App",
      body: "The same map supports two framings. In Volcano Escape, collected rocks build a path away from the volcano. In Bigger Reward, rocks stack toward a sized prize. Toggle the condition to switch the side panel.",
      why: "Holding the map fixed while varying the instructed goal isolates motivation from ability to search.",
      camera: { pos: [0, 0, 1], look: [0, 0, 0] }
    }
  ];

  let condition = "volcano_escape";
  let stepIndex = 0;
  let animStart = -1;
  let clicksLeft = 25;
  let host = null;
  let cells = [];
  let binEl = null;
  let volcanoWrap = null;
  let clicksFill = null;
  let clicksCount = null;
  let modeLabel = null;

  const revealOrder = [18, 19, 27, 28, 36, 35, 43, 44, 45, 37, 29, 21, 20, 12, 11];
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
    const img = document.createElement("img");
    img.src = ASSET + "rock.svg";
    img.alt = "";
    const pct = rockSizePct(value01);
    img.style.width = pct + "%";
    img.style.maxHeight = Math.round(18 + value01 * 22) + "px";
    binEl.appendChild(img);
    while (binEl.children.length > 8) {
      binEl.removeChild(binEl.firstChild);
    }
  }

  function paintCell(index, revealed) {
    const cell = cells[index];
    if (!cell) return;
    cell.classList.toggle("is-revealed", revealed);
    const img = cell.querySelector("img");
    if (!img) return;
    if (revealed) {
      const pct = rockSizePct(rewards[index]);
      img.hidden = false;
      img.style.width = pct + "%";
      img.style.height = pct + "%";
      img.style.inset = (100 - pct) / 2 + "%";
    } else {
      img.hidden = true;
    }
  }

  function resetBoard() {
    clicksLeft = 25;
    clearBin();
    cells.forEach(function (_, i) {
      paintCell(i, false);
    });
    paintCell(18, true);
    updateChrome();
  }

  function updateChrome() {
    if (clicksFill) {
      clicksFill.style.height = (clicksLeft / 25) * 100 + "%";
    }
    if (clicksCount) {
      clicksCount.textContent = String(clicksLeft);
    }
    if (modeLabel) {
      modeLabel.textContent =
        condition === "volcano_escape" ? "Volcano Escape" : "Bigger Reward";
    }
    if (volcanoWrap) {
      volcanoWrap.classList.toggle("is-hidden", condition !== "volcano_escape");
    }
    if (binEl) {
      binEl.classList.toggle("is-escape", condition === "volcano_escape");
    }
  }

  function applyCondition() {
    clearBin();
    updateChrome();
  }

  function buildDom(mountEl) {
    mountEl.innerHTML = [
      '<div class="search-ipad" data-search-ipad>',
      '  <div class="search-ipad-bezel">',
      '    <div class="search-ipad-screen">',
      '      <div class="search-ipad-topbar">',
      '        <span>Volcano Escape Game</span>',
      '        <strong data-search-mode>Volcano Escape</strong>',
      '        <span>Clicks left: <span data-search-clicks>25</span></span>',
      "      </div>",
      '      <div class="search-ipad-play">',
      '        <div class="search-ipad-clicks">',
      '          <span class="search-ipad-clicks-label">Clicks</span>',
      '          <div class="search-ipad-clicks-track"><div class="search-ipad-clicks-fill" data-search-fill></div></div>',
      "        </div>",
      '        <div class="search-ipad-grid-wrap"><div class="search-ipad-grid" data-search-grid></div></div>',
      '        <div class="search-ipad-side">',
      '          <div class="search-ipad-volcano" data-search-volcano><img src="' +
        ASSET +
        'volcano.svg" alt="Volcano" /></div>',
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
      const cell = document.createElement("div");
      cell.className = "search-ipad-cell";
      const img = document.createElement("img");
      img.src = ASSET + "rock.svg";
      img.alt = "";
      img.hidden = true;
      cell.appendChild(img);
      grid.appendChild(cell);
      cells.push(cell);
    }

    binEl = mountEl.querySelector("[data-search-bin]");
    volcanoWrap = mountEl.querySelector("[data-search-volcano]");
    clicksFill = mountEl.querySelector("[data-search-fill]");
    clicksCount = mountEl.querySelector("[data-search-clicks]");
    modeLabel = mountEl.querySelector("[data-search-mode]");
    host = mountEl;
    resetBoard();
    applyCondition();
  }

  return {
    id: "search",
    mode: "flat2d",
    tabTag: "Rivero, Pitt, & Amir · Explore–Exploit",
    tabName: "Volcano Escape Game",
    eyebrow: "Tasks · Goals Shape Children's Explore-Exploit Tendencies",
    studyTitle: "Goals Shape Children's Explore-Exploit Tendencies",
    studyHref: "../studies/search/",
    dataHref: "../studies/search/",
    paperHref: null,
    repoHref: "https://github.com/alissarivero/SEARCH-App",
    thumbSrc: ASSET + "volcano.svg",
    condLabel: "UX condition (SEARCH-App)",
    conditions: [
      { value: "volcano_escape", label: "Volcano Escape" },
      { value: "bigger_reward", label: "Bigger Reward" }
    ],
    defaultCondition: "volcano_escape",
    playLabel: "Watch a rock path",
    clickTip: "Flat iPad preview of SEARCH-App — toggle Volcano Escape vs Bigger Reward",
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
    },
    setCondition: function (val) {
      condition = val;
      applyCondition();
    },
    setStep: function (idx, nowSec) {
      stepIndex = idx;
      animStart = -1;
      resetBoard();
      applyCondition();
      if (steps[idx] && steps[idx].autoPlay) animStart = nowSec;
    },
    playAction: function (nowSec) {
      animStart = nowSec;
      resetBoard();
      applyCondition();
    },
    resetAction: function () {
      animStart = -1;
      resetBoard();
      applyCondition();
    },
    update: function (t) {
      if (animStart < 0 || !cells.length) return;
      const e = t - animStart;
      const path = revealOrder;
      const count = Math.min(path.length, Math.floor(e / 0.32) + 1);
      cells.forEach(function (_, i) {
        paintCell(i, false);
      });
      paintCell(18, true);
      clearBin();
      clicksLeft = Math.max(0, 25 - count);
      for (let k = 0; k < count; k += 1) {
        const idx = path[k];
        paintCell(idx, true);
        addRockToBin(rewards[idx]);
      }
      updateChrome();
      if (e > path.length * 0.32 + 1.1) {
        animStart = -1;
      }
    }
  };
}
