import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import {
  materials,
  palette,
  makeCompactTable,
  makeChair,
  makeChild,
  makeSpeechSprite,
  makeNoteSprite,
  makeCandy,
  tagInspectable,
  seatChildForPov,
  enableChildPov,
  childPov
} from "./scene-kit.js";

function makeScratchSheet(damaged = false) {
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 200;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#22201d";
  ctx.fillRect(0, 0, 160, 200);
  const grad = ctx.createLinearGradient(0, 0, 160, 200);
  grad.addColorStop(0, "#f27a66");
  grad.addColorStop(0.35, "#f5d052");
  grad.addColorStop(0.7, "#5bc489");
  grad.addColorStop(1, "#5ca0e6");
  ctx.strokeStyle = grad;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(80, 95, 42, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(80 + Math.cos(a) * 48, 95 + Math.sin(a) * 48);
    ctx.lineTo(80 + Math.cos(a) * 66, 95 + Math.sin(a) * 66);
    ctx.stroke();
  }
  if (damaged) {
    ctx.strokeStyle = "#e04838";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(22, 30);
    ctx.lineTo(138, 172);
    ctx.moveTo(135, 35);
    ctx.lineTo(25, 165);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 });
  const sheet = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.004, 0.14), [
    materials.creamMat, materials.creamMat, mat, materials.creamMat, materials.creamMat, materials.creamMat
  ]);
  sheet.castShadow = true;
  return sheet;
}

/* ============================================================================
 * 5. COOPERATIVE BEHAVIORS ACROSS 5 SOCIETIES (Amir et al., 2025, Science Advances)
 *    Modeled directly after Figure 1A–D: Fairness, Trust, Forgiveness & Honesty
 * ========================================================================== */
export function buildCoopBatteryProcedure() {
  const root = new THREE.Group();
  const inspectables = [];

  const table = makeCompactTable(1.48, 1.04, 0.62);
  root.add(table);

  // Single-child battery: frame from the participant's eyes looking onto all four stations
  const childSeat = new THREE.Group();
  seatChildForPov(childSeat, 0.72);
  const coopChild = makeChild({
    gender: "girl",
    shirt: 0xc45b7a,
    pants: 0x6b4a8a,
    skin: 0x6b3f2a,
    hair: 0x1a1210,
    hairStyle: "puffs",
    blush: 0xa85a45
  }, 0.86);
  enableChildPov(coopChild);
  childSeat.add(makeChair(0.95), coopChild);
  root.add(childSeat);

  // Station A (front-left): Fairness Inequity Game mini-apparatus (4-1 candies + Green/Red handles)
  const stationA = new THREE.Group();
  stationA.position.set(-0.42, 0.624, 0.16);
  const baseA = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.014, 0.28), materials.birch);
  const trayActor = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.016, 20), materials.trimWood);
  trayActor.position.set(-0.08, 0.02, 0);
  for (let i = 0; i < 4; i += 1) {
    const c = makeCandy(0xe05a6d, 0.013);
    c.position.set(((i % 2) - 0.5) * 0.025, 0.015, (Math.floor(i / 2) - 0.5) * 0.025);
    trayActor.add(c);
  }
  const trayRecip = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.016, 20), materials.trimWood);
  trayRecip.position.set(0.09, 0.02, 0);
  const singleC = makeCandy(0xe05a6d, 0.013);
  singleC.position.y = 0.015;
  trayRecip.add(singleC);
  const hGreen = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.11, 14), new THREE.MeshStandardMaterial({ color: 0x3b8c58 }));
  hGreen.position.set(-0.17, 0.06, 0.06);
  const hRed = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.11, 14), new THREE.MeshStandardMaterial({ color: 0xc94a3d }));
  hRed.position.set(-0.17, 0.06, -0.06);
  stationA.add(baseA, trayActor, trayRecip, hGreen, hRed);
  root.add(stationA);

  // Station B (back-left): Trust Apparatus (yellow 2-candy dish, far blue 6-candy dish, joined white+red rod)
  const stationB = new THREE.Group();
  stationB.position.set(-0.42, 0.624, -0.22);
  const baseB = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.016, 0.24), materials.birch);
  const divB = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.012), materials.walnut);
  divB.position.y = 0.028;
  const plexB = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.006, 0.22), materials.glass);
  plexB.position.y = 0.055;
  const yDish = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.018, 0.065), new THREE.MeshStandardMaterial({ color: 0xd8c948 }));
  yDish.position.set(-0.08, 0.018, 0.055);
  const bDish = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.018, 0.075), new THREE.MeshStandardMaterial({ color: 0x3f74b8 }));
  bDish.position.set(0.14, 0.018, -0.055);
  const longRod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.34, 12), materials.creamMat);
  longRod.rotation.z = Math.PI / 2;
  longRod.position.set(-0.12, 0.032, -0.055);
  const redMid = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 14), new THREE.MeshStandardMaterial({ color: 0xd63b2f }));
  redMid.rotation.z = Math.PI / 2;
  redMid.position.set(-0.12, 0.032, -0.055);
  stationB.add(baseB, divB, plexB, yDish, bDish, longRod, redMid);
  root.add(stationB);

  // Station C (back-right): Forgiveness 5 Scratch-Art Sheets + Return Envelope
  const stationC = new THREE.Group();
  stationC.position.set(0.42, 0.624, -0.22);
  const sheetsC = [];
  for (let i = 0; i < 5; i += 1) {
    const sh = makeScratchSheet(false);
    sh.scale.setScalar(0.8);
    sh.position.set(-0.12 + i * 0.04, 0.006 + i * 0.003, 0);
    sh.rotation.y = (i - 2) * 0.08;
    stationC.add(sh);
    sheetsC.push(sh);
  }
  const envC = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.012, 0.17), new THREE.MeshStandardMaterial({ color: 0xdfc496, roughness: 0.8 }));
  envC.position.set(0.14, 0.01, 0);
  stationC.add(envC);
  root.add(stationC);

  // Station D (front-right): Honesty 4-Candy Surplus Box (lid hinges open to reveal 4 candies instead of 1!)
  const stationD = new THREE.Group();
  stationD.position.set(0.42, 0.624, 0.16);
  const hBoxBase = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.18), materials.walnut);
  hBoxBase.position.y = 0.04;
  hBoxBase.castShadow = true;
  const hLidPivot = new THREE.Group();
  hLidPivot.position.set(0, 0.082, -0.09);
  const hLid = new THREE.Mesh(new THREE.BoxGeometry(0.226, 0.016, 0.186), materials.sagePaint);
  hLid.position.set(0, 0, 0.09);
  hLidPivot.add(hLid);
  const surplusCandies = new THREE.Group();
  for (let i = 0; i < 4; i += 1) {
    const c = makeCandy(i === 0 ? 0x5aa276 : 0xf0a83a, 0.016);
    c.position.set(((i % 2) - 0.5) * 0.055, 0.086, (Math.floor(i / 2) - 0.5) * 0.05);
    surplusCandies.add(c);
  }
  const returnBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.048, 0.032, 22), materials.birch);
  returnBowl.position.set(-0.18, 0.02, 0);
  stationD.add(hBoxBase, hLidPivot, surplusCandies, returnBowl);
  root.add(stationD);

  // Highlight ring moving across the 4 stations
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.25, 0.28, 44),
    new THREE.MeshBasicMaterial({ color: 0x285c3f, side: THREE.DoubleSide, transparent: true, opacity: 0.65 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(-0.42, 0.625, 0.16);
  ring.userData.thumbHide = true;
  root.add(ring);

  let cond = "partner";
  let stepIndex = 0;
  let animStart = -1;

  inspectables.push(
    tagInspectable(
      stationA,
      "battery-fairness",
      "Task A: Fairness (Inequity Game, 4–1 & 4–0)",
      "Measures advantageous inequity aversion across 5 unequal trials (four 4–1 AI and one 4–0 XAI) plus 2 equal trials via green (accept) and red (reject) handles.",
      [-0.45, 1.38, 1.02],
      [-0.42, 0.65, 0.16]
    ),
    tagInspectable(
      stationB,
      "battery-trust",
      "Task B: Trustworthiness (Two-Channel Apparatus)",
      "Measures how many of 6 candies (0–6) children return after a partner forfeits their short tool so the actor can assemble the long hooked rod.",
      [-0.45, 1.38, 0.68],
      [-0.42, 0.65, -0.22]
    ),
    tagInspectable(
      stationC,
      "battery-forgiveness",
      "Task C: Forgiveness (5 Scratch-Art Sheets)",
      "After an accidental drawing mishap, children decide privately how many of 5 peer scratch-art sheets to return in the envelope versus discard.",
      [0.45, 1.38, 0.68],
      [0.42, 0.65, -0.22]
    ),
    tagInspectable(
      stationD,
      "battery-honesty",
      "Task D: Unobserved Honesty (4-Candy Surplus Box)",
      "Children are told their prize box holds 1 candy, but opening it privately reveals 4 candies—testing whether they spontaneously return the 3 surplus candies.",
      [0.45, 1.38, 1.02],
      [0.42, 0.65, 0.16],
      function (nowSec) { animStart = nowSec; }
    )
  );

  const stationTargets = [
    [-0.42, 0.16],
    [-0.42, -0.22],
    [0.42, -0.22],
    [0.42, 0.16]
  ];

  const steps = [
    {
      short: "1. Battery Overview",
      title: "Four-task cross-cultural cooperation battery (Figure 1)",
      badge: "N = 413 children · Ecuador, Peru, Uganda, Canada & USA",
      body: "Every child completed all four behavioral tasks in counterbalanced order—Fairness (front-left), Trustworthiness (back-left), Forgiveness (back-right), and Honesty (front-right)—alongside community peer (N = 163) and adult (N = 86) norm surveys.",
      why: "Measuring four cooperative domains within the same children tests whether prosociality develops as a single trait or distinct norm-guided strategies.",
      camera: childPov.overview,
      station: 0
    },
    {
      short: "2. Fairness & Trust",
      title: "Resource allocation & reciprocal trust (Tasks A & B)",
      badge: "Diverges across societies in middle childhood",
      body: "In Tasks A & B, children weigh payoff maximization against costly fairness (rejecting 4–1 windfalls) and reciprocal trustworthiness (returning candies when entrusted with a partner's tool).",
      why: "Cross-cultural variation emerged most strongly on costly fairness and honesty, tracking local community norms.",
      camera: childPov.left,
      station: 1
    },
    {
      short: "3. Forgive & Honesty",
      title: "Interpersonal repair & unobserved honesty (Tasks C & D)",
      badge: "Click 'Animate 4-task battery' to see all 4 apparatuses operate",
      body: "In Task C, children return 0–5 scratch sheets after an accidental harm; in Task D, children open a box supposed to contain 1 candy, discover 4 inside, and decide privately whether to return the 3 extras.",
      why: "Latent profile analysis revealed three overarching strategies: payoff maximization, generic cooperation, and partner-contingent cooperation.",
      camera: childPov.right,
      station: 3,
      autoPlay: true
    }
  ];

  return {
    id: "cooperative-behaviors",
    tabTag: "Amir et al. (2025 · Sci Adv)",
    tabName: "4-Task Cooperation Battery",
    eyebrow: "Tasks · Amir, Ahl, Jordan, … & McAuliffe (2025)",
    studyTitle: "The Emergence of Cooperative Behaviors, Norms, and Strategies Across Five Diverse Societies",
    studyHref: "../studies/cooperative-behaviors/",
    dataHref: "../studies/cooperative-behaviors/data/",
    paperHref: "../studies/cooperative-behaviors/files/Amir-et-al-cooperative-behaviors.pdf",
    condLabel: "Behavioral strategy profile",
    conditions: [
      { value: "partner", label: "Partner-Contingent / Norm-Aligned" },
      { value: "maximizer", label: "Payoff-Maximizing Strategy" }
    ],
    defaultCondition: "partner",
    playLabel: "Animate 4-task battery",
    clickTip: "Click any of the 4 apparatuses on the table to inspect",
    steps: steps,
    root: root,
    inspectables: inspectables,
    setCondition: function (val, nowSec) {
      cond = val;
      animStart = nowSec;
    },
    setStep: function (idx, nowSec) {
      stepIndex = idx;
      animStart = -1;
      const tgt = stationTargets[steps[idx].station];
      ring.position.set(tgt[0], 0.625, tgt[1]);
      hLidPivot.rotation.x = idx === 2 ? -0.95 : -0.35;
      if (steps[idx].autoPlay) animStart = nowSec;
    },
    playAction: function (nowSec) {
      animStart = nowSec;
    },
    resetAction: function () {
      animStart = -1;
      const tgt = stationTargets[steps[stepIndex].station];
      ring.position.set(tgt[0], 0.625, tgt[1]);
      hLidPivot.rotation.x = stepIndex === 2 ? -0.95 : -0.35;
      hRed.rotation.z = 0;
      hGreen.rotation.z = 0;
      bDish.position.x = 0.14;
      sheetsC.forEach(function (sh, idx) {
        sh.position.x = -0.12 + idx * 0.04;
      });
    },
    update: function (t) {
      const pulse = 1 + Math.sin(t * 3.2) * 0.04;
      ring.scale.set(pulse, pulse, 1);

      if (animStart >= 0) {
        const e = t - animStart;
        if (e <= 5.2) {
          const stIdx = Math.min(3, Math.floor((e / 5.2) * 4));
          ring.position.set(stationTargets[stIdx][0], 0.625, stationTargets[stIdx][1]);
          hRed.rotation.z = cond === "partner" ? Math.sin(Math.min(1, e / 1.2) * Math.PI) * 0.35 : 0;
          hGreen.rotation.z = cond === "maximizer" ? Math.sin(Math.min(1, e / 1.2) * Math.PI) * 0.35 : 0;
          bDish.position.x = 0.14 - Math.sin(Math.min(1, Math.max(0, (e - 1.2) / 1.3)) * Math.PI) * 0.2;
          sheetsC.forEach(function (sh, idx) {
            if (e > 2.5 && idx < (cond === "partner" ? 4 : 2)) {
              const p = Math.min(1, (e - 2.5) / 1.1);
              sh.position.x = (-0.12 + idx * 0.04) * (1 - p) + 0.14 * p;
            }
          });
          if (e > 3.6) {
            const p = Math.min(1, (e - 3.6) / 0.9);
            hLidPivot.rotation.x = -1.05 * p;
          }
        } else {
          animStart = -1;
          bDish.position.x = 0.14;
          sheetsC.forEach(function (sh, idx) {
            sh.position.x = -0.12 + idx * 0.04;
          });
        }
      }
    }
  };
}

/* ============================================================================
 * 6. ACCIDENTAL HARMS & FORGIVENESS (Amir, Ahl, Parsons, & McAuliffe, 2021)
 *    5 Scratch-Art Sheets, Manila Return Envelope, Trash Can, & Privacy Bell
 * ========================================================================== */
export function buildForgivenessProcedure() {
  const root = new THREE.Group();
  const inspectables = [];

  const table = makeCompactTable(1.26, 0.92, 0.62);
  root.add(table);

  // Single-child forgiveness task: child's-eye view onto sheets, envelope, trash & bell
  const childSeat = new THREE.Group();
  seatChildForPov(childSeat, 0.7);
  const child = makeChild({
    gender: "girl",
    shirt: 0xe08c3c,
    pants: 0x568265,
    skin: 0xf0c8a8,
    hair: 0xc4a05a,
    hairStyle: "ponytail",
    hairTie: 0xc45b7a
  }, 0.86);
  enableChildPov(child);
  childSeat.add(makeChair(0.95), child);
  root.add(childSeat);

  const expGroup = new THREE.Group();
  expGroup.position.set(0, 0, -0.75);
  const expPerson = makeChild({
    shirt: 0x5c738a,
    pants: 0x333c47,
    skin: 0xd4a074,
    hair: 0x2c1f17,
    hairStyle: "parted"
  }, 0.98);
  expGroup.add(expPerson);
  root.add(expGroup);

  // Child's ruined scratch-art sheet (top-left reference)
  const ruinedSheet = makeScratchSheet(true);
  ruinedSheet.position.set(-0.42, 0.625, -0.22);
  ruinedSheet.rotation.y = 0.15;
  root.add(ruinedSheet);

  // 5 Peer Scratch-Art Sheets fanned in center
  const peerSheetsGroup = new THREE.Group();
  const peerSheets = [];
  for (let i = 0; i < 5; i += 1) {
    const sh = makeScratchSheet(false);
    sh.position.set((i - 2) * 0.075, 0.625 + i * 0.002, 0.12);
    sh.rotation.y = (i - 2) * -0.06;
    peerSheetsGroup.add(sh);
    peerSheets.push(sh);
  }
  root.add(peerSheetsGroup);

  // Manila Return Envelope (left side of table)
  const envelopeGroup = new THREE.Group();
  envelopeGroup.position.set(-0.36, 0.624, 0.08);
  const envBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.012, 0.23),
    new THREE.MeshStandardMaterial({ color: 0xe2c48e, roughness: 0.82 })
  );
  envBody.castShadow = true;
  const envSeal = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.015, 16), materials.sagePaint);
  envSeal.position.set(0, 0.008, 0.04);
  envelopeGroup.add(envBody, envSeal);
  root.add(envelopeGroup);

  // Trash Can right beside the right side of the table!
  const trashGroup = new THREE.Group();
  trashGroup.position.set(0.52, 0, 0.14);
  const binOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.12, 0.38, 24, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x5c646d, roughness: 0.6, metalness: 0.25, side: THREE.DoubleSide })
  );
  binOuter.position.y = 0.19;
  binOuter.castShadow = true;
  const binBottom = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.015, 24), materials.charcoal);
  binBottom.position.y = 0.01;
  const binRim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.01, 10, 24), materials.silver);
  binRim.rotation.x = Math.PI / 2;
  binRim.position.y = 0.38;
  trashGroup.add(binOuter, binBottom, binRim);
  root.add(trashGroup);

  // Shiny Brass Desk Bell (child rings when finished!)
  const bellGroup = new THREE.Group();
  bellGroup.position.set(0.32, 0.624, -0.14);
  const bellBase = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.056, 0.012, 24), materials.charcoal);
  const bellDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.046, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
    materials.brass
  );
  bellDome.position.y = 0.01;
  bellDome.castShadow = true;
  const bellPin = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 12), materials.silver);
  bellPin.position.y = 0.058;
  const dingNote = makeNoteSprite("🔔", "#285c3f");
  dingNote.position.set(0, 0.16, 0);
  bellGroup.add(bellBase, bellDome, bellPin, dingNote);
  root.add(bellGroup);

  let cond = "accidental";
  let stepIndex = 0;
  let animStart = -1;
  let bellUntil = 0;

  inspectables.push(
    tagInspectable(
      peerSheetsGroup,
      "scratch-sheets",
      "Five Rainbow Scratch-Art Sheets (0–5 Measure)",
      "Participants cannot keep any of the 5 peer drawings for themselves—every sheet must go either into the peer's return envelope (forgiveness) or into the trash can (non-selfish punishment).",
      [0, 1.38, 1.05],
      [0, 0.64, 0.1]
    ),
    tagInspectable(
      envelopeGroup,
      "return-envelope",
      "Manila Return Envelope (Forgiveness)",
      "Across all conditions, children returned M = 3.47 of 5 sheets (well above 2.50 chance, p < .0001), with 9–10-year-olds returning near-ceiling sheets when the harm was accidental.",
      [-0.45, 1.32, 0.92],
      [-0.36, 0.64, 0.08]
    ),
    tagInspectable(
      trashGroup,
      "trash-can",
      "Discard Trash Can",
      "Throwing sheets away imposes a pure cost on the transgressor without benefiting the participant, isolating forgiveness vs. retributive withholding.",
      [0.72, 1.18, 0.92],
      [0.52, 0.3, 0.14]
    ),
    tagInspectable(
      bellGroup,
      "privacy-bell",
      "Brass Privacy Bell",
      "The experimenter turns their back completely so the child sorts all 5 sheets unobserved, then rings the brass bell to signal completion before answering the 1–6 badness judgment.",
      [0.48, 1.25, 0.68],
      [0.32, 0.66, -0.14],
      function (nowSec) { bellUntil = nowSec + 2.0; }
    )
  );

  const steps = [
    {
      short: "1. Transgression",
      title: "Ruined drawing: accidental vs. intentional harm",
      badge: "N = 257 children (ages 5–10) · 5 conditions",
      body: "The child learns another peer ruined their scratch-art drawing—either accidentally or intentionally, and with or without remorse (compared against a no-harm Baseline).",
      why: "Crossing 2 (Intent) × 2 (Remorse) + Baseline tests whether mental-state reasoning drives costly interpersonal forgiveness across development.",
      camera: childPov.overview,
      expTurned: false
    },
    {
      short: "2. Privacy & Bell",
      title: "Unobserved envelope vs. trash sorting",
      badge: "Experimenter turns around · Ring bell when done",
      body: "Given 5 of the peer's drawings, the child cannot keep any: each goes into the return envelope (left) or trash can (right) while the experimenter turns away. Click 'Watch private decision' to see the difference!",
      why: "Complete privacy removes adult-pleasing demand characteristics, revealing genuine forgiveness.",
      camera: childPov.close,
      expTurned: true,
      autoPlay: true
    },
    {
      short: "3. Moral Judgment",
      title: "Recall check & 1–6 badness evaluation",
      badge: "Older children increasingly forgive accidental harms",
      body: "After ringing the bell, children recall intent and remorse and judge the action from 'very, very good' (1) to 'very, very bad' (6). Between ages 5 and 10, forgiveness rises sharply for accidental harms.",
      why: "Pairing behavioral sheet returns with verbal evaluations links moral judgment development directly to real social repair.",
      camera: childPov.overview,
      expTurned: false
    }
  ];

  function resetSheets() {
    peerSheets.forEach(function (sh, i) {
      sh.position.set((i - 2) * 0.075, 0.625 + i * 0.002, 0.12);
      sh.rotation.set(0, (i - 2) * -0.06, 0);
    });
  }

  return {
    id: "accidental-harms",
    tabTag: "Amir et al. (2021 · JECP)",
    tabName: "Forgiveness Sheets & Bell",
    eyebrow: "Tasks · Amir, Ahl, Parsons, & McAuliffe (2021)",
    studyTitle: "Children Are More Forgiving of Accidental Harms Across Development",
    studyHref: "../studies/accidental-harms/",
    dataHref: "../studies/accidental-harms/data/",
    paperHref: "../studies/accidental-harms/files/Amir-et-al-2021-accidental-harms-preprint.pdf",
    condLabel: "Transgression condition",
    conditions: [
      { value: "accidental", label: "Accidental + Remorse (4/5 returned)" },
      { value: "intentional", label: "Intentional + No Remorse (2/5 returned)" }
    ],
    defaultCondition: "accidental",
    playLabel: "Watch private decision",
    clickTip: "Click the 5 scratch sheets, envelope, trash can, or bell to inspect",
    steps: steps,
    root: root,
    inspectables: inspectables,
    setCondition: function (val, nowSec) {
      cond = val;
      resetSheets();
      animStart = nowSec;
    },
    setStep: function (idx, nowSec) {
      stepIndex = idx;
      animStart = -1;
      resetSheets();
      if (steps[idx].autoPlay) animStart = nowSec;
    },
    playAction: function (nowSec) {
      animStart = nowSec;
    },
    resetAction: function () {
      animStart = -1;
      bellUntil = 0;
      dingNote.material.opacity = 0;
      resetSheets();
    },
    update: function (t) {
      const targetRot = (steps[stepIndex].expTurned || animStart >= 0) ? Math.PI : 0;
      expGroup.rotation.y += (targetRot - expGroup.rotation.y) * 0.12;

      if (animStart >= 0) {
        const e = t - animStart;
        if (e <= 4.8) {
          const returnCount = cond === "accidental" ? 4 : 2;
          peerSheets.forEach(function (sh, i) {
            const delay = i * 0.55;
            const p = Math.min(1, Math.max(0, (e - delay) / 0.75));
            const ep = p * p * (3 - 2 * p);
            const sx = (i - 2) * 0.075;
            if (i < returnCount) {
              sh.position.set(sx * (1 - ep) - 0.36 * ep, 0.626 + Math.sin(ep * Math.PI) * 0.12 + i * 0.003, 0.12 * (1 - ep) + 0.08 * ep);
            } else {
              sh.position.set(sx * (1 - ep) + 0.52 * ep, 0.626 * (1 - ep) + 0.22 * ep + Math.sin(ep * Math.PI) * 0.18, 0.12 * (1 - ep) + 0.14 * ep);
            }
          });
          if (e >= 3.4) {
            bellUntil = Math.max(bellUntil, animStart + 4.8);
          }
        } else {
          animStart = -1;
          resetSheets();
        }
      }

      if (t < bellUntil) {
        const cyc = (t * 2.2) % 1;
        dingNote.position.y = 0.12 + cyc * 0.2;
        dingNote.material.opacity = Math.sin(cyc * Math.PI);
      } else {
        dingNote.material.opacity *= 0.85;
      }
    }
  };
}

/* ============================================================================
 * 7. RISK & TIME PREFERENCES (Amir et al., 2020, JEP: General)
 *    50/50 Green-vs-Red Marble Jar & Today Plate vs. Sealed Tomorrow Bag
 * ========================================================================== */
export function buildRiskTimeProcedure() {
  const root = new THREE.Group();
  const inspectables = [];

  const table = makeCompactTable(1.36, 0.94, 0.62);
  root.add(table);

  // Single-child risk/time task: child's-eye view onto jar, plates & tomorrow bag
  const childSeat = new THREE.Group();
  seatChildForPov(childSeat, 0.7);
  const riskChild = makeChild({
    shirt: 0xcf7a40,
    pants: 0x3e4c59,
    skin: 0xa86b42,
    hair: 0x1a1210,
    hairStyle: "curls",
    blush: 0xb56b55
  }, 0.86);
  enableChildPov(riskChild);
  childSeat.add(makeChair(0.95), riskChild);
  root.add(childSeat);

  // LEFT SIDE: Risk Preference Station — Clear 50/50 Marble Jar (1 Green + 1 Red marble) + Safe vs. Risky plates
  const riskStation = new THREE.Group();
  riskStation.position.set(-0.32, 0.622, 0);

  const jar = new THREE.Group();
  jar.position.set(0, 0, -0.08);
  const jarBody = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.19, 28), materials.clearJar);
  jarBody.position.y = 0.095;
  const jarBase = new THREE.Mesh(new THREE.CylinderGeometry(0.086, 0.086, 0.012, 28), materials.silver);
  jarBase.position.y = 0.006;
  const jarRim = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.008, 10, 28), materials.brass);
  jarRim.rotation.x = Math.PI / 2;
  jarRim.position.y = 0.19;
  const greenMarble = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 22, 18),
    new THREE.MeshStandardMaterial({ color: 0x2ea45c, roughness: 0.18, metalness: 0.1 })
  );
  greenMarble.position.set(-0.028, 0.04, 0.01);
  const redMarble = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 22, 18),
    new THREE.MeshStandardMaterial({ color: 0xd43f33, roughness: 0.18, metalness: 0.1 })
  );
  redMarble.position.set(0.028, 0.04, -0.01);
  jar.add(jarBody, jarBase, jarRim, greenMarble, redMarble);
  riskStation.add(jar);

  // Safe plate (1 candy) vs. Risky plate (4 candies)
  const safePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.068, 0.012, 24), materials.creamMat);
  safePlate.position.set(-0.14, 0.006, 0.14);
  const safeC = makeCandy(0xe85d75, 0.018);
  safeC.position.y = 0.016;
  safePlate.add(safeC);

  const riskyPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.078, 0.012, 24), materials.sagePaint);
  riskyPlate.position.set(0.12, 0.006, 0.14);
  for (let i = 0; i < 4; i += 1) {
    const c = makeCandy(0xf2a93b, 0.017);
    c.position.set(((i % 2) - 0.5) * 0.036, 0.016, (Math.floor(i / 2) - 0.5) * 0.036);
    riskyPlate.add(c);
  }
  riskStation.add(safePlate, riskyPlate);
  root.add(riskStation);

  // RIGHT SIDE: Time Preference Station — Today Plate (1 candy now) vs. Sealed Tomorrow Bag (4 candies tomorrow)
  const timeStation = new THREE.Group();
  timeStation.position.set(0.34, 0.622, 0);

  const todayPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.068, 0.012, 24), materials.creamMat);
  todayPlate.position.set(-0.11, 0.006, 0.12);
  const todayC = makeCandy(0x5aa276, 0.018);
  todayC.position.y = 0.016;
  todayPlate.add(todayC);

  const tomorrowBag = new THREE.Group();
  tomorrowBag.position.set(0.12, 0, -0.02);
  const bagMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.17, 0.085),
    new THREE.MeshStandardMaterial({ color: 0xdec292, roughness: 0.84 })
  );
  bagMesh.position.y = 0.085;
  bagMesh.castShadow = true;
  const sealBar = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.018, 0.025), materials.sagePaint);
  sealBar.position.set(0, 0.172, 0);
  tomorrowBag.add(bagMesh, sealBar);
  for (let i = 0; i < 4; i += 1) {
    const c = makeCandy(0x5aa276, 0.016);
    c.position.set((i - 1.5) * 0.028, 0.014, 0.075);
    tomorrowBag.add(c);
  }
  timeStation.add(todayPlate, tomorrowBag);
  root.add(timeStation);

  let cond = "market";
  let stepIndex = 0;
  let animStart = -1;

  inspectables.push(
    tagInspectable(
      jar,
      "marble-jar",
      "50/50 Green & Red Marble Jar (Risk Task)",
      "Contains exactly one green winning marble and one red losing marble. Children complete 3 practice draws (coded e.g. R-G-G) to experience randomness firsthand before making 5 titrating safe-vs-risky choices.",
      [-0.42, 1.32, 0.92],
      [-0.32, 0.72, -0.08],
      function (nowSec) { animStart = nowSec; }
    ),
    tagInspectable(
      tomorrowBag,
      "tomorrow-bag",
      "Sealed 'Tomorrow' Bag vs. 'Today' Plate (Time Task)",
      "Across 5 titrating trials, children choose between 1 candy immediately today versus 2–6 candies sealed in a bag delivered tomorrow (paired with a researcher-trust check).",
      [0.48, 1.32, 0.92],
      [0.38, 0.7, 0.02]
    ),
    tagInspectable(
      riskStation,
      "safe-vs-risky",
      "Socioecological Calibration (Upano vs. Cross-Cutucú Shuar)",
      "Children in high-market settings (USA, India, Argentina, and market-integrated Upano Valley Shuar) favored risk-seeking and delayed rewards significantly more than remote Cross-Cutucú Shuar peers.",
      [0, 1.48, 1.25],
      [0, 0.68, 0.05]
    )
  );

  const steps = [
    {
      short: "1. Practice Draws",
      title: "50/50 marble jar & three practice draws",
      badge: "USA, India, Argentina & 2 Shuar regions (N = 400)",
      body: "On the Risk task (left), children inspect a jar holding 1 green winning marble and 1 red losing marble, complete 3 practice draws, and then make 5 choices between 1 safe candy and 2–6 risky candies.",
      why: "Physical 1-green/1-red draws communicate 50% probability transparently without requiring fractions or literacy.",
      camera: childPov.left
    },
    {
      short: "2. Today vs. Tomorrow",
      title: "Intertemporal choice: 1 today vs. 2–6 tomorrow",
      badge: "5 titrating delayed-reward trials + trust check",
      body: "On the Time task (right, order counterbalanced), children make 5 choices between 1 candy right now versus 2–6 candies sealed for delivery the next day.",
      why: "Checking researcher trust ensures present-oriented choices reflect ecological time preference rather than doubt about delivery.",
      camera: childPov.right
    },
    {
      short: "3. Market Ecology",
      title: "Study 2: Upano Valley vs. Cross-Cutucú Shuar",
      badge: "Toggle Market-Integrated vs. Forager-Horticulturalist",
      body: "Click 'Draw marble & compare' to watch how market-buffered environments promote drawing from the 50/50 marble jar and waiting for tomorrow's larger bag, whereas uncertain foraging ecologies favor guaranteed immediate rewards.",
      why: "Comparing two Shuar regions within the same Indigenous culture isolates market integration from language and heritage.",
      camera: childPov.overview,
      autoPlay: true
    }
  ];

  return {
    id: "risk-time-preferences",
    tabTag: "Amir et al. (2020 · JEP:G)",
    tabName: "Marble Jar & Tomorrow Bag",
    eyebrow: "Tasks · Amir, Jordan, McAuliffe, … & Dunham (2020)",
    studyTitle: "The Developmental Origins of Risk and Time Preferences Across Diverse Societies",
    studyHref: "../studies/risk-time-preferences/",
    dataHref: "../studies/risk-time-preferences/data/",
    paperHref: null,
    condLabel: "Socioecological context",
    conditions: [
      { value: "market", label: "Higher Market (USA / India / Upano Shuar)" },
      { value: "forager", label: "Lower Market (Cross-Cutucú Shuar)" }
    ],
    defaultCondition: "market",
    playLabel: "Draw marble & compare",
    clickTip: "Click the 50/50 marble jar, candy plates, or tomorrow bag to inspect",
    steps: steps,
    root: root,
    inspectables: inspectables,
    setCondition: function (val, nowSec) {
      cond = val;
      animStart = nowSec;
    },
    setStep: function (idx, nowSec) {
      stepIndex = idx;
      animStart = -1;
      if (steps[idx].autoPlay) animStart = nowSec;
    },
    playAction: function (nowSec) {
      animStart = nowSec;
    },
    resetAction: function () {
      animStart = -1;
      greenMarble.position.set(-0.028, 0.04, 0.01);
      redMarble.position.set(0.028, 0.04, -0.01);
      safePlate.position.z = 0.14;
      todayPlate.position.z = 0.12;
      tomorrowBag.position.z = -0.02;
    },
    update: function (t) {
      if (animStart >= 0) {
        const e = t - animStart;
        if (e <= 4.2) {
          // Swirl marbles in jar, then draw green marble up if market, or highlight safe/today plates if forager!
          if (e < 1.6) {
            const a = e * 9;
            greenMarble.position.set(Math.cos(a) * 0.035, 0.05 + Math.abs(Math.sin(a)) * 0.05, Math.sin(a) * 0.035);
            redMarble.position.set(-Math.cos(a) * 0.035, 0.05 + Math.abs(Math.cos(a)) * 0.05, -Math.sin(a) * 0.035);
          } else {
            const p = Math.min(1, (e - 1.6) / 1.0);
            if (cond === "market") {
              greenMarble.position.set(0, 0.05 + p * 0.2, 0);
              tomorrowBag.position.z = -0.02 + p * 0.14;
              safePlate.position.z = 0.14;
              todayPlate.position.z = 0.12;
            } else {
              greenMarble.position.set(-0.028, 0.04, 0.01);
              safePlate.position.z = 0.14 + p * 0.1;
              todayPlate.position.z = 0.12 + p * 0.1;
              tomorrowBag.position.z = -0.02;
            }
          }
        } else {
          animStart = -1;
          greenMarble.position.set(-0.028, 0.04, 0.01);
          redMarble.position.set(0.028, 0.04, -0.01);
          safePlate.position.z = 0.14;
          todayPlate.position.z = 0.12;
          tomorrowBag.position.z = -0.02;
        }
      }
    }
  };
}

/* ============================================================================
 * 8. SUBJECTIVE SOCIAL STATUS (Amir et al., 2019, PLOS ONE)
 *    Modeled directly after Figure 1: 10-Rung MacArthur Ladder & 4-Item SCI
 * ========================================================================== */
function makeSciBoardTexture(activeTier) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 380;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#fdfbf6";
  ctx.fillRect(0, 0, 512, 380);
  ctx.strokeStyle = "#bfb4a0";
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, 504, 372);

  ctx.fillStyle = "#1d1b18";
  ctx.font = "700 20px 'Source Sans 3', sans-serif";
  ctx.fillText("Compared to most families, my family has:", 26, 42);

  const rows = [
    ["Nicer house", "Same house", "Less nice house"],
    ["More food", "Same food", "Less food"],
    ["More money", "Same money", "Less money"],
    ["More things", "Same things", "Less things"]
  ];
  const selCol = activeTier === "young" ? 0 : 1;

  rows.forEach(function (r, rIdx) {
    const y = 68 + rIdx * 74;
    r.forEach(function (label, cIdx) {
      const x = 24 + cIdx * 158;
      const selected = cIdx === selCol || (activeTier === "adol" && rIdx === 2 && cIdx === 2 && selCol === 99);
      const isPick = (activeTier === "young" && (cIdx === 0 || (rIdx === 1 && cIdx === 1)) && (rIdx !== 1 ? cIdx === 0 : cIdx === 1))
        || (activeTier === "adol" && cIdx === 1);
      ctx.fillStyle = isPick ? "#e3efe7" : "#f5f1e8";
      ctx.strokeStyle = isPick ? "#285c3f" : "#d3c9b7";
      ctx.lineWidth = isPick ? 3.5 : 2;
      ctx.beginPath();
      ctx.roundRect(x, y, 146, 54, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isPick ? "#1f4a32" : "#3f3b35";
      ctx.font = (isPick ? "700 " : "500 ") + "15px 'Source Sans 3', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x + 73, y + 27);
      ctx.textAlign = "left";
    });
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildLadderProcedure() {
  const root = new THREE.Group();
  const inspectables = [];

  const table = makeCompactTable(1.34, 0.94, 0.62);
  root.add(table);

  // Single-child ladder task: child's-eye view onto the MacArthur ladder & comparison board
  const childSeat = new THREE.Group();
  seatChildForPov(childSeat, 0.7);
  const ladderChild = makeChild({
    gender: "girl",
    shirt: 0x68a078,
    pants: 0x8b5a9e,
    skin: 0xc9926a,
    hair: 0x4a2f1c,
    hairStyle: "long",
    blush: 0xc47860
  }, 0.86);
  enableChildPov(ladderChild);
  childSeat.add(makeChair(0.95), ladderChild);
  root.add(childSeat);

  // LEFT: Sculptural 3D 10-Rung MacArthur Ladder standing on a wooden base (Figure 1: Rung 1 = Top, Rung 10 = Bottom!)
  const ladderGroup = new THREE.Group();
  ladderGroup.position.set(-0.28, 0.622, -0.02);
  ladderGroup.rotation.x = -0.14;

  const ped = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.024, 0.2), materials.walnut);
  ped.position.y = 0.012;
  ladderGroup.add(ped);

  [-0.105, 0.105].forEach(function (rx) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.66, 0.026), materials.birch);
    rail.position.set(rx, 0.34, 0);
    rail.castShadow = true;
    ladderGroup.add(rail);
  });

  const rungYs = [];
  for (let i = 0; i < 10; i += 1) {
    // i = 0 is bottom (worksheet 10), i = 9 is top (worksheet 1)!
    const ry = 0.07 + i * 0.058;
    rungYs.push(ry);
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.21, 14), materials.chairWood);
    rung.rotation.z = Math.PI / 2;
    rung.position.set(0, ry, 0);
    rung.castShadow = true;
    ladderGroup.add(rung);
  }

  // Glowing Family Status Token on the ladder!
  const marker = new THREE.Group();
  const markerDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.036, 0.02, 24),
    materials.terracottaPaint
  );
  markerDisc.rotation.x = Math.PI / 2;
  const markerRing = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.006, 10, 24), materials.coinGold);
  marker.add(markerDisc, markerRing);
  marker.position.set(0, rungYs[8], 0.024);
  ladderGroup.add(marker);
  root.add(ladderGroup);

  // RIGHT: Figure 1 Four-Item Social Comparison Index (SCI) Board (House, Food, Money, Things)
  const sciMat = new THREE.MeshStandardMaterial({
    map: makeSciBoardTexture("young"),
    roughness: 0.62
  });
  const sciStand = new THREE.Group();
  sciStand.position.set(0.26, 0.622, -0.02);
  const sciBoard = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.36, 0.018), [
    materials.walnut, materials.walnut, materials.walnut, materials.walnut, sciMat, materials.walnut
  ]);
  sciBoard.position.y = 0.2;
  sciBoard.rotation.x = -0.22;
  sciBoard.castShadow = true;
  sciStand.add(sciBoard);
  root.add(sciStand);

  let cond = "young";
  let stepIndex = 0;
  let animStart = -1;
  let targetRungIdx = 8; // 0=bottom(10), 9=top(1)

  inspectables.push(
    tagInspectable(
      ladderGroup,
      "macarthur-ladder",
      "10-Rung MacArthur Ladder (Figure 1)",
      "Top rung (1) represents families with the most money, schooling, jobs, and respect; bottom rung (10) represents the least. Click the ladder to step the family marker across rungs!",
      [-0.36, 1.38, 1.05],
      [-0.28, 0.92, -0.02],
      function () {
        targetRungIdx = (targetRungIdx + 3) % 10;
      }
    ),
    tagInspectable(
      sciStand,
      "sci-board",
      "Social Comparison Index (House · Food · Money · Things)",
      "Four concrete comparisons ('Nicer / Same / Less') sum into the SCI (4–12). Ladder placements aligned significantly with SCI across USA, India, Argentina, and Upano Valley Ecuador—except remote Cross-Cutucú.",
      [0.34, 1.32, 0.98],
      [0.26, 0.82, -0.02]
    )
  );

  const steps = [
    {
      short: "1. 10-Rung Ladder",
      title: "Picturing society as a 10-rung ladder (Figure 1)",
      badge: "N = 1,028 assessments · USA, India, Argentina & Ecuador",
      body: "Experimenters walk each child through the 10-rung ladder illustration—explaining who stands at the top (rung 1) and bottom (rung 10)—and ask where their own family stands.",
      why: "A concrete visual ladder lets children as young as 4 represent social hierarchy across both urban schools and Amazonian villages.",
      camera: { pos: [-0.06, 1.14, 0.55], look: [-0.22, 0.86, -0.02] }
    },
    {
      short: "2. 4-Item SCI",
      title: "Concrete comparisons: house, food, money & things",
      badge: "Test–retest ρ = 0.47 (1 wk) · ρ = 0.32 (1 yr)",
      body: "Beside the ladder, children rate whether their family has a nicer/same/less nice house and more/same/less food, money, and possessions than most families.",
      why: "Pairing abstract ladder rungs with concrete material domains tests convergent validity across diverse economies.",
      camera: { pos: [0.14, 1.12, 0.55], look: [0.22, 0.82, 0.02] }
    },
    {
      short: "3. Age Shift",
      title: "Developmental calibration from childhood to adolescence",
      badge: "Toggle Early Childhood vs. Adolescence above",
      body: "Click 'Place family on ladder' to watch younger children place their families near the top rungs while adolescents calibrate downward toward middle rungs aligned with their SCI scores.",
      why: "Across diverse societies, early childhood optimism gives way to calibrated status awareness across middle childhood and adolescence.",
      camera: { pos: [0.02, 1.14, 0.52], look: [-0.08, 0.9, -0.02] },
      autoPlay: true
    }
  ];

  function syncCondition() {
    targetRungIdx = cond === "young" ? 8 : 4;
    sciMat.map = makeSciBoardTexture(cond);
    sciMat.needsUpdate = true;
  }

  return {
    id: "subjective-social-status",
    tabTag: "Amir et al. (2019 · PLOS ONE)",
    tabName: "10-Rung MacArthur Ladder",
    eyebrow: "Tasks · Amir, Valeggia, Srinivasan, Sugiyama, & Dunham (2019)",
    studyTitle: "Measuring Subjective Social Status in Children of Diverse Societies",
    studyHref: "../studies/subjective-social-status/",
    dataHref: "../studies/subjective-social-status/data/",
    paperHref: "../studies/subjective-social-status/files/Amir-et-al-2019-subjective-social-status.pdf",
    condLabel: "Developmental cohort",
    conditions: [
      { value: "young", label: "Early Childhood (Ages 4–8 · High Rung)" },
      { value: "adol", label: "Adolescence (Ages 12–18 · Calibrated)" }
    ],
    defaultCondition: "young",
    playLabel: "Place family on ladder",
    clickTip: "Click the 10-rung ladder or 4-item comparison board to inspect",
    steps: steps,
    root: root,
    inspectables: inspectables,
    setCondition: function (val, nowSec) {
      cond = val;
      syncCondition();
      animStart = nowSec;
    },
    setStep: function (idx, nowSec) {
      stepIndex = idx;
      animStart = -1;
      if (steps[idx].autoPlay) animStart = nowSec;
    },
    playAction: function (nowSec) {
      animStart = nowSec;
    },
    resetAction: function () {
      animStart = -1;
      syncCondition();
    },
    update: function (t) {
      if (animStart >= 0) {
        const e = t - animStart;
        if (e <= 3.0) {
          const climbP = Math.min(1, e / 2.0);
          const ep = climbP * climbP * (3 - 2 * climbP);
          const curY = rungYs[0] + (rungYs[targetRungIdx] - rungYs[0]) * ep;
          marker.position.y = curY;
          marker.position.z = 0.024 + Math.sin(ep * Math.PI * 4) * 0.015;
        } else {
          animStart = -1;
        }
      } else {
        marker.position.y += (rungYs[targetRungIdx] - marker.position.y) * 0.14;
        marker.position.z = 0.024;
      }
      const s = 1 + Math.sin(t * 3.2) * 0.06;
      markerRing.scale.set(s, s, 1);
    }
  };
}
