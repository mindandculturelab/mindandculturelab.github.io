/**
 * Volcano Escape Game — flat 2D iPad recreation using SEARCH-App graphics
 * Layout matched to device recordings of SEARCH-App (clicks rail | 8×8 | volcano + path).
 * https://github.com/alissarivero/SEARCH-App
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const ASSET = "./assets/search/";
const HORIZON = 25;

function rewardAt(i, j) {
  const x = (i - 3.5) / 3.5;
  const y = (j - 3.5) / 3.5;
  const peak = Math.exp(-((x - 0.55) ** 2 + (y - 0.45) ** 2) / 0.55);
  const ridge = Math.exp(-((x + 0.4) ** 2 + (y + 0.5) ** 2) / 0.9) * 0.45;
  return Math.min(1, peak * 0.95 + ridge);
}

/** Match SEARCH-App rockScaleForValue: scale ~0.15–1 from reward. */
function rockScale(t) {
  return Math.max(0.18, Math.min(1, 0.18 + t * 0.82));
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
      body: "Each click is a choice: uncover a new square to learn its rock size (explore), or re-click a revealed square to collect another rock of about the same size (exploit). Press play to watch rocks collect into the side panel under the volcano.",
      why: "A fixed horizon forces the classic explore–exploit tradeoff inside a single map.",
      camera: { pos: [0, 0, 1], look: [0, 0, 0] },
      autoPlay: true
    },
    {
      short: "3. Two Framings",
      title: "Volcano Escape vs Bigger Reward",
      badge: "Toggle condition above · counterbalanced in SEARCH-App",
      body: "The same map supports two framings. In Volcano Escape, collected rocks build a path down from the volcano. In Bigger Reward, rocks stack without the escape-path rail. Toggle the condition to switch the side panel.",
      why: "Holding the map fixed while varying the instructed goal isolates motivation from ability to search.",
      camera: { pos: [0, 0, 1], look: [0, 0, 0] }
    }
  ];

  let condition = "volcano_escape";
  let stepIndex = 0;
  let animStart = -1;
  let clicksLeft = HORIZON;
  let host = null;
  let cells = [];
  let binEl = null;
  let volcanoWrap = null;
  let clicksFill = null;
  let clicksCount = null;
  let activeIndex = -1;

  // Path that fans out from a starting cell (matches mid-play recordings)
  const revealOrder = [18, 19, 27, 26, 34, 35, 43, 44, 36, 28, 20, 21, 29, 37, 45];
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
    binEl.appendChild(slot);
    while (binEl.children.length > 12) {
      binEl.removeChild(binEl.firstChild);
    }
  }

  function paintCell(index, revealed) {
    const cell = cells[index];
    if (!cell) return;
    cell.classList.toggle("is-revealed", revealed);
    cell.classList.toggle("is-active", revealed && index === activeIndex);
    const img = cell.querySelector("img");
    if (!img) return;
    if (revealed) {
      img.hidden = false;
      img.style.transform = "scale(" + rockScale(rewards[index]) + ")";
    } else {
      img.hidden = true;
      img.style.transform = "";
    }
  }

  function resetBoard() {
    clicksLeft = HORIZON;
    activeIndex = revealOrder[0];
    clearBin();
    cells.forEach(function (_, i) {
      paintCell(i, false);
    });
    paintCell(revealOrder[0], true);
    addRockToBin(rewards[revealOrder[0]]);
    updateChrome();
  }

  function updateChrome() {
    const pct = (clicksLeft / HORIZON) * 100;
    if (clicksFill) {
      clicksFill.style.height = pct + "%";
    }
    if (clicksCount) {
      clicksCount.textContent = String(clicksLeft);
      clicksCount.style.bottom = pct + "%";
    }
    if (volcanoWrap) {
      volcanoWrap.classList.toggle("is-hidden", condition !== "volcano_escape");
    }
    if (binEl) {
      binEl.classList.toggle("is-escape", condition === "volcano_escape");
      binEl.classList.toggle("is-bigger", condition === "bigger_reward");
    }
  }

  function applyCondition() {
    updateChrome();
  }

  function buildDom(mountEl) {
    mountEl.innerHTML = [
      '<div class="search-ipad" data-search-ipad>',
      '  <div class="search-ipad-bezel">',
      '    <div class="search-ipad-screen">',
      '      <div class="search-ipad-play">',
      '        <div class="search-ipad-clicks">',
      '          <div class="search-ipad-clicks-track">',
      '            <div class="search-ipad-clicks-fill" data-search-fill></div>',
      '            <span class="search-ipad-clicks-label" data-search-clicks>25</span>',
      "          </div>",
      "        </div>",
      '        <div class="search-ipad-grid-wrap"><div class="search-ipad-grid" data-search-grid></div></div>',
      '        <div class="search-ipad-side">',
      '          <div class="search-ipad-volcano" data-search-volcano><img src="' +
        ASSET +
        'volcano.svg" alt="" /></div>',
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
    thumbSrc: ASSET + "thumb.jpg",
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
      clearBin();
      clicksLeft = Math.max(0, HORIZON - count);
      activeIndex = path[count - 1];
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
