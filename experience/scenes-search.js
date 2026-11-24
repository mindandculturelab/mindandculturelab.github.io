import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import {
  materials,
  makeCompactTable,
  makeChair,
  makeChild,
  tagInspectable,
  seatChildForPov,
  enableChildPov,
  childPov
} from "./scene-kit.js";

/**
 * SEARCH / Grid Search Task — spatially correlated 8×8 explore–exploit board
 * Modeled after the tablet GridSearch app in https://github.com/alissarivero/SEARCH
 */
export function buildSearchProcedure() {
  const root = new THREE.Group();
  const inspectables = [];

  const table = makeCompactTable(1.28, 0.9, 0.62);
  root.add(table);

  const childSeat = new THREE.Group();
  seatChildForPov(childSeat, 0.68);
  const child = makeChild(
    {
      gender: "girl",
      shirt: 0x5c738a,
      pants: 0x8b5a9e,
      skin: 0xc9926a,
      hair: 0x2a1e17,
      hairStyle: "puffs",
      blush: 0xc47860
    },
    0.86
  );
  enableChildPov(child);
  childSeat.add(makeChair(0.95), child);
  root.add(childSeat);

  // Tablet frame with 8×8 spatially correlated reward grid
  const tablet = new THREE.Group();
  tablet.position.set(0, 0.625, -0.02);
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.018, 0.72),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.55, metalness: 0.2 })
  );
  bezel.castShadow = true;
  tablet.add(bezel);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.004, 0.64),
    new THREE.MeshStandardMaterial({ color: 0xf7f1e6, roughness: 0.7 })
  );
  screen.position.y = 0.012;
  tablet.add(screen);

  const gridGroup = new THREE.Group();
  gridGroup.position.set(-0.28, 0.016, -0.28);
  const tiles = [];
  const n = 8;
  const cell = 0.07;
  const gap = 0.002;
  // Spatially smooth reward field (high values clustered toward SE)
  function rewardAt(i, j) {
    const x = (i - 3.5) / 3.5;
    const y = (j - 3.5) / 3.5;
    const peak = Math.exp(-((x - 0.55) ** 2 + (y - 0.45) ** 2) / 0.55);
    const ridge = Math.exp(-((x + 0.4) ** 2 + (y + 0.5) ** 2) / 0.9) * 0.45;
    return Math.min(1, peak * 0.95 + ridge);
  }
  function heatColor(t) {
    const stops = [0xfff7ec, 0xfdd49e, 0xfc8d59, 0xd7301f, 0x7f0000];
    const idx = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
    const local = t * (stops.length - 1) - idx;
    const a = stops[idx];
    const b = stops[idx + 1];
    const ar = (a >> 16) & 255;
    const ag = (a >> 8) & 255;
    const ab = a & 255;
    const br = (b >> 16) & 255;
    const bg = (b >> 8) & 255;
    const bb = b & 255;
    const r = Math.round(ar + (br - ar) * local);
    const g = Math.round(ag + (bg - ag) * local);
    const bl = Math.round(ab + (bb - ab) * local);
    return (r << 16) | (g << 8) | bl;
  }

  for (let j = 0; j < n; j += 1) {
    for (let i = 0; i < n; i += 1) {
      const t = rewardAt(i, j);
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(cell - gap, 0.006, cell - gap),
        new THREE.MeshStandardMaterial({
          color: 0xd8d0c4,
          roughness: 0.72
        })
      );
      tile.position.set(i * cell + cell / 2, 0.003, j * cell + cell / 2);
      tile.userData.reward = t;
      tile.userData.revealed = false;
      tile.userData.heat = heatColor(t);
      gridGroup.add(tile);
      tiles.push(tile);
    }
  }
  tablet.add(gridGroup);

  // Click counter / stars strip above the grid
  const hud = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.012, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.5 })
  );
  hud.position.set(0, 0.02, -0.35);
  tablet.add(hud);
  root.add(tablet);

  // Goal cue card (maximize points vs learn the board)
  const goalCard = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.008, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xfaf6ef, roughness: 0.65 })
  );
  goalCard.position.set(0.52, 0.625, 0.12);
  root.add(goalCard);

  let goal = "maximize";
  let stepIndex = 0;
  let animStart = -1;
  const revealOrder = [10, 18, 19, 27, 28, 36, 35, 43, 44, 45];

  function paintTile(tile, revealed) {
    tile.userData.revealed = revealed;
    tile.material.color.setHex(revealed ? tile.userData.heat : 0xd8d0c4);
  }

  function resetBoard() {
    tiles.forEach(function (tile) {
      paintTile(tile, false);
    });
    // One starter tile revealed, matching the app
    paintTile(tiles[18], true);
  }

  resetBoard();

  inspectables.push(
    tagInspectable(
      tablet,
      "grid-search-board",
      "8×8 Spatially Correlated Grid Search",
      "Sixty-four tiles on a tablet. Darker colors mark higher point values, and nearby tiles tend to share similar rewards—so children can explore new squares or re-click known ones within a 25-click horizon.",
      [0.05, 1.12, 0.52],
      [0, 0.66, -0.02],
      function (nowSec) {
        animStart = nowSec;
      }
    ),
    tagInspectable(
      goalCard,
      "goal-cue",
      "Goal framing",
      "Instructions shape whether children treat the board as a points-maximizing exploit problem or an information-gathering explore problem—the core manipulation behind Goals Shape Children's Explore-Exploit Tendencies.",
      [0.42, 1.12, 0.48],
      [0.5, 0.66, 0.1]
    )
  );

  const steps = [
    {
      short: "1. Grid Board",
      title: "Spatially correlated 8×8 search board",
      badge: "64 tiles · 25 clicks per board · ages 4–9",
      body: "Children play on a tablet GridSearch board: each click reveals a point value, darker tiles pay more, and high values tend to sit next to other high values. One square starts revealed; 25 clicks remain to explore new tiles or re-click known ones.",
      why: "Spatial correlation makes pure random search inefficient—children can generalize from local evidence when deciding whether to explore or exploit.",
      camera: childPov.overview
    },
    {
      short: "2. Explore vs Exploit",
      title: "Click new tiles or re-click known rewards",
      badge: "Horizon = 25 clicks per board",
      body: "Each click is a choice: open a covered square to learn its value (explore), or return to a revealed square to collect points again (exploit). Click 'Watch a search path' to see a typical trajectory moving toward a high-value cluster.",
      why: "A fixed horizon forces the classic explore–exploit tradeoff inside a single board rather than across infinite trials.",
      camera: childPov.close,
      autoPlay: true
    },
    {
      short: "3. Goal Framing",
      title: "Goals reshape explore–exploit tendencies",
      badge: "Toggle Maximize Points vs Learn the Board",
      body: "The same board supports different goals. When told to collect as many points as possible, children should exploit high tiles sooner; when the goal emphasizes learning the board, broader exploration becomes rational—matching the paper's claim that goals shape children's explore–exploit tendencies.",
      why: "Holding the apparatus fixed while varying the instructed goal isolates motivation from ability to search.",
      camera: childPov.right
    }
  ];

  return {
    id: "search",
    tabTag: "Rivero · Explore–Exploit",
    tabName: "Grid Search Task",
    eyebrow: "Tasks · Goals Shape Children's Explore-Exploit Tendencies",
    studyTitle: "Goals Shape Children's Explore-Exploit Tendencies",
    studyHref: "../studies/search/",
    dataHref: "../studies/search/",
    paperHref: null,
    repoHref: "https://github.com/alissarivero/SEARCH",
    condLabel: "Instructed goal",
    conditions: [
      { value: "maximize", label: "Maximize points (exploit)" },
      { value: "learn", label: "Learn the board (explore)" }
    ],
    defaultCondition: "maximize",
    playLabel: "Watch a search path",
    clickTip: "Click the grid board or goal card to inspect",
    steps: steps,
    root: root,
    inspectables: inspectables,
    setCondition: function (val) {
      goal = val;
    },
    setStep: function (idx, nowSec) {
      stepIndex = idx;
      animStart = -1;
      resetBoard();
      if (steps[idx].autoPlay) animStart = nowSec;
    },
    playAction: function (nowSec) {
      animStart = nowSec;
    },
    resetAction: function () {
      animStart = -1;
      resetBoard();
    },
    update: function (t) {
      if (animStart < 0) return;
      const e = t - animStart;
      const path =
        goal === "learn"
          ? [10, 11, 19, 27, 26, 34, 42, 43, 35, 36, 44, 45, 37, 29, 21]
          : revealOrder;
      const count = Math.min(path.length, Math.floor(e / 0.35) + 1);
      tiles.forEach(function (tile) {
        paintTile(tile, false);
      });
      paintTile(tiles[18], true);
      for (let k = 0; k < count; k += 1) {
        paintTile(tiles[path[k]], true);
      }
      if (e > path.length * 0.35 + 1.2) {
        animStart = -1;
        resetBoard();
      }
    }
  };
}
