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
 * Volcano Escape Game — SEARCH-App tablet task
 * https://github.com/alissarivero/SEARCH-App
 * Conditions (counterbalanced): volcano_escape | bigger_reward
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

  // Tablet with 8×8 search map (rocks reveal on click)
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
  function rewardAt(i, j) {
    const x = (i - 3.5) / 3.5;
    const y = (j - 3.5) / 3.5;
    const peak = Math.exp(-((x - 0.55) ** 2 + (y - 0.45) ** 2) / 0.55);
    const ridge = Math.exp(-((x + 0.4) ** 2 + (y + 0.5) ** 2) / 0.9) * 0.45;
    return Math.min(1, peak * 0.95 + ridge);
  }
  function heatColor(t) {
    const stops = [0xe8e0d4, 0xf4a261, 0xe76f51, 0xc1121f, 0x6a040f];
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

  const hud = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.012, 0.06),
    new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.5 })
  );
  hud.position.set(0, 0.02, -0.35);
  tablet.add(hud);
  root.add(tablet);

  // Side panel: volcano + escape-path rocks (volcano_escape) or stacked prize rocks (bigger_reward)
  const sidePanel = new THREE.Group();
  sidePanel.position.set(0.52, 0.625, 0.02);

  const volcano = new THREE.Mesh(
    new THREE.ConeGeometry(0.09, 0.14, 8),
    new THREE.MeshStandardMaterial({ color: 0x6e6e6e, roughness: 0.85 })
  );
  volcano.position.set(0, 0.09, -0.08);
  sidePanel.add(volcano);
  const crater = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xc1121f, roughness: 0.55, emissive: 0x4a0808, emissiveIntensity: 0.35 })
  );
  crater.position.set(0, 0.155, -0.08);
  sidePanel.add(crater);

  const escapeRocks = [];
  for (let i = 0; i < 5; i += 1) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.028 + i * 0.004, 0),
      new THREE.MeshStandardMaterial({ color: 0x8a8074, roughness: 0.9 })
    );
    rock.position.set(0, 0.02 + i * 0.038, 0.06);
    rock.visible = false;
    sidePanel.add(rock);
    escapeRocks.push(rock);
  }

  const prizeStack = new THREE.Group();
  prizeStack.position.set(0, 0.02, 0.06);
  prizeStack.visible = false;
  for (let i = 0; i < 4; i += 1) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.04 - i * 0.004, 0),
      new THREE.MeshStandardMaterial({ color: 0x9a9084, roughness: 0.88 })
    );
    rock.position.y = i * 0.045;
    prizeStack.add(rock);
  }
  sidePanel.add(prizeStack);
  root.add(sidePanel);

  let condition = "volcano_escape";
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
    paintTile(tiles[18], true);
    escapeRocks.forEach(function (rock) {
      rock.visible = false;
    });
  }

  function applyConditionVisual() {
    const escape = condition === "volcano_escape";
    volcano.visible = escape;
    crater.visible = escape;
    prizeStack.visible = !escape;
    escapeRocks.forEach(function (rock) {
      rock.visible = false;
    });
  }

  resetBoard();
  applyConditionVisual();

  inspectables.push(
    tagInspectable(
      tablet,
      "volcano-escape-board",
      "Volcano Escape search map",
      "Children click an 8×8 map of 64 squares. Each click reveals a rock whose size tracks the square's point value. Nearby squares tend to share similar rewards, and each map allows 25 clicks to explore new tiles or re-click known ones.",
      [0.05, 1.12, 0.52],
      [0, 0.66, -0.02],
      function (nowSec) {
        animStart = nowSec;
      }
    ),
    tagInspectable(
      sidePanel,
      "condition-panel",
      "Volcano Escape vs Bigger Reward",
      "SEARCH-App counterbalances two framings of the same map: Volcano Escape (rocks build a path away from the volcano) and Bigger Reward (rocks stack toward a sized prize). Toggle the condition above to switch panels.",
      [0.42, 1.12, 0.48],
      [0.5, 0.7, 0.05]
    )
  );

  const steps = [
    {
      short: "1. Search Map",
      title: "8×8 rock map on the tablet",
      badge: "64 tiles · 25 clicks per map · ages 4–9",
      body: "In SEARCH-App, children play Volcano Escape: each click on the map reveals a rock. Bigger rocks mean higher point values, high values tend to cluster together, and one square starts revealed with 25 clicks to go.",
      why: "Spatial correlation makes pure random search inefficient—children can generalize from local evidence when deciding whether to explore or exploit.",
      camera: childPov.overview
    },
    {
      short: "2. Explore vs Exploit",
      title: "New squares or known rocks again",
      badge: "Horizon = 25 clicks per map",
      body: "Each click is a choice: uncover a new square to learn its rock size (explore), or re-click a revealed square to collect another rock of about the same size (exploit). Click 'Watch a rock path' to see a typical trajectory.",
      why: "A fixed horizon forces the classic explore–exploit tradeoff inside a single map.",
      camera: childPov.close,
      autoPlay: true
    },
    {
      short: "3. Two Framings",
      title: "Volcano Escape vs Bigger Reward",
      badge: "Toggle condition above · counterbalanced in the app",
      body: "The same map supports two goals from SEARCH-App. In Volcano Escape, collected rocks build a path away from the volcano ('how far you'll get away'). In Bigger Reward, rocks stack toward a sized prize ('what sized prize you'll get'). Goals Shape Children's Explore-Exploit Tendencies tests how that framing reshapes search.",
      why: "Holding the map fixed while varying the instructed goal isolates motivation from ability to search.",
      camera: childPov.right
    }
  ];

  return {
    id: "search",
    tabTag: "Rivero, Pitt, & Amir · Explore–Exploit",
    tabName: "Volcano Escape Game",
    eyebrow: "Tasks · Goals Shape Children's Explore-Exploit Tendencies",
    studyTitle: "Goals Shape Children's Explore-Exploit Tendencies",
    studyHref: "../studies/search/",
    dataHref: "../studies/search/",
    paperHref: null,
    repoHref: "https://github.com/alissarivero/SEARCH-App",
    condLabel: "UX condition (SEARCH-App)",
    conditions: [
      { value: "volcano_escape", label: "Volcano Escape" },
      { value: "bigger_reward", label: "Bigger Reward" }
    ],
    defaultCondition: "volcano_escape",
    playLabel: "Watch a rock path",
    clickTip: "Click the map or volcano panel to inspect",
    steps: steps,
    root: root,
    inspectables: inspectables,
    setCondition: function (val) {
      condition = val;
      applyConditionVisual();
    },
    setStep: function (idx, nowSec) {
      stepIndex = idx;
      animStart = -1;
      resetBoard();
      applyConditionVisual();
      if (steps[idx].autoPlay) animStart = nowSec;
    },
    playAction: function (nowSec) {
      animStart = nowSec;
    },
    resetAction: function () {
      animStart = -1;
      resetBoard();
      applyConditionVisual();
    },
    update: function (t) {
      if (animStart < 0) return;
      const e = t - animStart;
      const path =
        condition === "bigger_reward"
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
      if (condition === "volcano_escape") {
        const shown = Math.min(escapeRocks.length, Math.floor(count / 2));
        escapeRocks.forEach(function (rock, i) {
          rock.visible = i < shown;
        });
      }
      if (e > path.length * 0.35 + 1.2) {
        animStart = -1;
        resetBoard();
        applyConditionVisual();
      }
    }
  };
}
