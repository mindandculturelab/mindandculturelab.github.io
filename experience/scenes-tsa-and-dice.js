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

function makeAnimalDisc(kind, radius = 0.046) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f9f5ec";
  ctx.beginPath();
  ctx.arc(128, 128, 122, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#cfc3ae";
  ctx.lineWidth = 8;
  ctx.stroke();

  if (kind === "pig") {
    ctx.fillStyle = "#eca1b3";
    ctx.beginPath();
    ctx.ellipse(78, 76, 22, 28, -0.45, 0, Math.PI * 2);
    ctx.ellipse(178, 76, 22, 28, 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(128, 134, 66, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dc7c94";
    ctx.beginPath();
    ctx.ellipse(128, 150, 29, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#482a32";
    ctx.beginPath();
    ctx.arc(117, 150, 4.5, 0, Math.PI * 2);
    ctx.arc(139, 150, 4.5, 0, Math.PI * 2);
    ctx.arc(103, 118, 6, 0, Math.PI * 2);
    ctx.arc(153, 118, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#3c3029";
    ctx.beginPath();
    ctx.ellipse(68, 92, 23, 13, -0.35, 0, Math.PI * 2);
    ctx.ellipse(188, 92, 23, 13, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(128, 132, 62, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3c3029";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#3c3029";
    ctx.beginPath();
    ctx.ellipse(98, 112, 19, 15, -0.3, 0, Math.PI * 2);
    ctx.ellipse(160, 126, 14, 12, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f0cab6";
    ctx.beginPath();
    ctx.ellipse(128, 158, 38, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b211c";
    ctx.beginPath();
    ctx.arc(104, 124, 5, 0, Math.PI * 2);
    ctx.arc(152, 124, 5, 0, Math.PI * 2);
    ctx.arc(114, 158, 4, 0, Math.PI * 2);
    ctx.arc(142, 158, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const side = new THREE.MeshStandardMaterial({ color: 0xf4efe4, roughness: 0.42 });
  const top = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.02, 26), [side, top, side]);
  disc.castShadow = true;
  return disc;
}

/* ============================================================================
 * 1. DYAD & TRIAD COORDINATION (Rivero, Vasil, & Tomasello, 2026)
 * ========================================================================== */
export function buildTsaProcedure() {
  const root = new THREE.Group();
  const inspectables = [];

  // Compact preschool square table (1.06 x 1.06, height 0.62)
  const table = makeCompactTable(1.06, 1.06, 0.62);
  root.add(table);

  // Velcro strips on tabletop
  [-0.12, 0.12].forEach(function (vx) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.004, 0.28), materials.charcoal);
    strip.position.set(vx, 0.622, 0);
    root.add(strip);
  });

  // True SQUARE wooden coordination box (0.40 x 0.40 x 0.18)
  const boxGroup = new THREE.Group();
  const boxFloor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.4), materials.walnut);
  boxFloor.position.y = 0.632;
  boxFloor.receiveShadow = true;
  boxGroup.add(boxFloor);

  const felt = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), materials.sageFelt);
  felt.rotation.x = -Math.PI / 2;
  felt.position.y = 0.643;
  boxGroup.add(felt);

  [
    [0, 0.72, -0.186, 0.4, 0.16, 0.028],
    [0, 0.72, 0.186, 0.4, 0.16, 0.028],
    [-0.186, 0.72, 0, 0.028, 0.16, 0.344],
    [0.186, 0.72, 0, 0.028, 0.16, 0.344]
  ].forEach(function (w) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w[3], w[4], w[5]), materials.walnut);
    wall.position.set(w[0], w[1], w[2]);
    wall.castShadow = true;
    wall.receiveShadow = true;
    boxGroup.add(wall);
  });

  // Hinged clear glass lid (pivots at back edge z = -0.19)
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 0.802, -0.19);
  const lidFrame = new THREE.Mesh(new THREE.BoxGeometry(0.396, 0.014, 0.396), materials.glass);
  lidFrame.position.set(0, 0, 0.19);
  const latch = new THREE.Mesh(new THREE.BoxGeometry(0.064, 0.03, 0.016), materials.brass);
  latch.position.set(0, -0.008, 0.392);
  lidPivot.add(lidFrame, latch);
  boxGroup.add(lidPivot);

  const coinsGroup = new THREE.Group();
  boxGroup.add(coinsGroup);

  function layoutCoins(count) {
    coinsGroup.clear();
    const cols = count === 4 ? 2 : 3;
    for (let i = 0; i < count; i += 1) {
      const coin = new THREE.Group();
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.013, 24), materials.coinGold);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.004, 8, 22), materials.brass);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.006;
      disc.castShadow = true;
      coin.add(disc, rim);
      const col = i % cols;
      const row = Math.floor(i / cols);
      coin.position.set((col - (cols - 1) / 2) * 0.092, 0.651, (row - 0.5) * 0.095);
      coinsGroup.add(coin);
    }
  }

  // Cohesive toddler seat specs right up at the compact table (±0.68)
  const redKeyMat = new THREE.MeshStandardMaterial({ color: palette.coralRed, roughness: 0.35 });
  const blueKeyMat = new THREE.MeshStandardMaterial({ color: palette.cobaltBlue, roughness: 0.35 });

  const seatSpecs = {
    west: {
      pos: [-0.68, 0, 0],
      rot: Math.PI / 2,
      shirt: 0x568265,
      pants: 0x3e4c59,
      skin: 0x8d5524,
      hair: 0x1a1210,
      hairStyle: "curls",
      blush: 0xb56b55,
      attachWorld: [-0.21, 0.72, 0],
      attachRot: [0, 0, Math.PI / 2],
      bubble: "“Blue!”",
      animalBubble: "“Pig!”"
    },
    north: {
      pos: [0, 0, -0.68],
      rot: 0,
      gender: "girl",
      shirt: 0xc45b7a,
      pants: 0x6b4a8a,
      skin: 0xf0c8a8,
      hair: 0x4a2f1c,
      hairStyle: "ponytail",
      hairTie: 0xe08c3c,
      attachWorld: [0, 0.72, -0.21],
      attachRot: [Math.PI / 2, 0, 0],
      bubble: "“Let’s do blue!”",
      animalBubble: "“Same pig!”"
    },
    east: {
      pos: [0.68, 0, 0],
      rot: -Math.PI / 2,
      gender: "girl",
      shirt: 0x5c738a,
      pants: 0x355f7a,
      skin: 0xc9926a,
      hair: 0x1a1210,
      hairStyle: "puffs",
      blush: 0xc47860,
      attachWorld: [0.21, 0.72, 0],
      attachRot: [0, 0, -Math.PI / 2],
      bubble: "“Okay, blue!”",
      animalBubble: "“Pig too!”"
    }
  };

  const sockets = {};
  Object.keys(seatSpecs).forEach(function (id) {
    const s = seatSpecs[id];
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.006, 20), materials.silver);
    plate.position.set(s.attachWorld[0] * 0.96, s.attachWorld[1], s.attachWorld[2] * 0.96);
    plate.rotation.set(s.attachRot[0], s.attachRot[1], s.attachRot[2]);
    boxGroup.add(plate);

    const attachedColor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.046, 0.02, 26),
      blueKeyMat.clone()
    );
    attachedColor.position.set(s.attachWorld[0], s.attachWorld[1], s.attachWorld[2]);
    attachedColor.rotation.set(s.attachRot[0], s.attachRot[1], s.attachRot[2]);
    attachedColor.castShadow = true;
    attachedColor.visible = false;
    boxGroup.add(attachedColor);

    const attachedAnimal = makeAnimalDisc("pig", 0.046);
    attachedAnimal.position.set(s.attachWorld[0], s.attachWorld[1], s.attachWorld[2]);
    attachedAnimal.rotation.set(s.attachRot[0], s.attachRot[1], s.attachRot[2]);
    attachedAnimal.visible = false;
    boxGroup.add(attachedAnimal);

    sockets[id] = { colorMesh: attachedColor, animalMesh: attachedAnimal };
  });

  root.add(boxGroup);

  // Cohesive birch-and-sage Music Box Station nearby
  const musicStation = new THREE.Group();
  musicStation.position.set(1.18, 0, -0.92);
  musicStation.rotation.y = -0.52;

  const standTop = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.034, 28), materials.birch);
  standTop.position.y = 0.46;
  standTop.castShadow = true;
  const standLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.062, 0.46, 16), materials.chairWood);
  standLeg.position.y = 0.23;
  standLeg.castShadow = true;
  const mBody = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.23, 0.24), materials.walnut);
  mBody.position.y = 0.59;
  mBody.castShadow = true;
  const mFront = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.19, 0.012), materials.birch);
  mFront.position.set(0, 0.59, 0.121);
  const mRoof = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.032, 0.27), materials.sagePaint);
  mRoof.position.y = 0.72;
  mRoof.castShadow = true;
  const slot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.024), materials.charcoal);
  slot.position.set(0, 0.739, 0.03);
  const speaker = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.014, 24), materials.brass);
  speaker.rotation.x = Math.PI / 2;
  speaker.position.set(0, 0.59, 0.128);
  const speakerRing = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.006, 8, 24), materials.sagePaint);
  speakerRing.position.set(0, 0.59, 0.134);
  musicStation.add(standTop, standLeg, mBody, mFront, mRoof, slot, speaker, speakerRing);

  const notes = [
    makeNoteSprite("♪", "#285c3f"),
    makeNoteSprite("♫", "#cf7a40"),
    makeNoteSprite("♪", "#3b6e52")
  ];
  notes.forEach(function (n, idx) {
    n.position.set((idx - 1) * 0.09, 0.85, 0.02);
    musicStation.add(n);
  });
  root.add(musicStation);

  // Flying reward coin (for box -> music box animation & music-box click)
  const flyingCoin = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.013, 24), materials.coinGold);
  flyingCoin.visible = false;
  flyingCoin.castShadow = true;
  root.add(flyingCoin);

  // Seated toddlers & magnetic table keys
  const people = {};
  const keysInspectGroup = new THREE.Group();
  root.add(keysInspectGroup);

  Object.keys(seatSpecs).forEach(function (id) {
    const spec = seatSpecs[id];
    const seatGroup = new THREE.Group();
    seatGroup.position.set(spec.pos[0], 0, spec.pos[2]);
    seatGroup.rotation.y = spec.rot;

    const chair = makeChair(0.95);
    chair.position.z = -0.06;
    const child = makeChild(spec, 0.82);
    child.position.z = -0.03;

    // Keys sit right on the compact tabletop in front of the child (world radius ~0.37 from center)
    const redKey = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.02, 26), redKeyMat);
    const blueKey = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.02, 26), blueKeyMat);
    redKey.position.set(-0.085, 0.632, 0.31);
    blueKey.position.set(0.085, 0.632, 0.31);
    redKey.castShadow = true;
    blueKey.castShadow = true;

    const pigKey = makeAnimalDisc("pig", 0.046);
    const cowKey = makeAnimalDisc("cow", 0.046);
    pigKey.position.set(-0.085, 0.632, 0.31);
    cowKey.position.set(0.085, 0.632, 0.31);

    const bubbleColor = makeSpeechSprite(spec.bubble);
    bubbleColor.position.set(0, 1.38, 0.04);
    bubbleColor.visible = false;

    const bubbleAnimal = makeSpeechSprite(spec.animalBubble);
    bubbleAnimal.position.set(0, 1.38, 0.04);
    bubbleAnimal.visible = false;

    seatGroup.add(chair, child, redKey, blueKey, pigKey, cowKey, bubbleColor, bubbleAnimal);
    root.add(seatGroup);

    people[id] = {
      group: seatGroup,
      child: child,
      redKey: redKey,
      blueKey: blueKey,
      pigKey: pigKey,
      cowKey: cowKey,
      bubbleColor: bubbleColor,
      bubbleAnimal: bubbleAnimal,
      spec: spec
    };
  });

  // Unlock ring around square box
  const focusRing = new THREE.Mesh(
    new THREE.RingGeometry(0.28, 0.315, 48),
    new THREE.MeshBasicMaterial({ color: 0x285c3f, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
  );
  focusRing.rotation.x = -Math.PI / 2;
  focusRing.position.y = 0.623;
  focusRing.userData.thumbHide = true;
  root.add(focusRing);

  // Micro-animation timers & full key-matching state
  let lidPeekUntil = 0;
  let musicChimeUntil = 0;
  let keyMatchStart = -1;
  let condition = "triad";
  let stepIndex = 0;

  // Register click-to-inspect targets!
  inspectables.push(
    tagInspectable(
      boxGroup,
      "square-box",
      "Pure Coordination Task box (40 × 40 cm)",
      "Velcroed to the center of the compact toddler table so children cannot twist it to peek at peers' sides. Each vertical wall has a concealed magnetic socket; only when all active partners place matching keys does the hinged glass lid unlock to release two brass coins per child.",
      [0.48, 1.48, 1.18],
      [0, 0.72, 0],
      function (nowSec) {
        lidPeekUntil = nowSec + 2.6;
      }
    ),
    tagInspectable(
      musicStation,
      "music-box",
      "Coin-Activated Music Box",
      "Positioned near the table to make the shared reward tangible without language-heavy explanation. Dropping a brass token into the top slot plays a celebratory melody—motivating every child during individual training and peer trials.",
      [1.75, 1.28, -0.08],
      [1.18, 0.62, -0.92],
      function (nowSec) {
        musicChimeUntil = nowSec + 2.8;
      }
    )
  );

  Object.keys(people).forEach(function (id) {
    const p = people[id];
    [p.redKey, p.blueKey, p.pigKey, p.cowKey, sockets[id].colorMesh, sockets[id].animalMesh].forEach(function (mesh) {
      const entry = tagInspectable(
        mesh,
        "magnetic-keys",
        "Magnetic Choice Keys (Red/Blue & Pig/Cow)",
        "Each child receives an identical pair of circular magnetic keys on the table edge (red & blue on Trials 1–3; pig & cow on Trial 4). Sticking a key onto one's own vertical side of the square box hides that choice from partners, requiring genuine coordination.",
        [-0.85, 1.32, 0.88],
        [-0.25, 0.66, 0.05],
        function (nowSec) {
          keyMatchStart = nowSec;
        }
      );
      if (inspectables.length < 3) inspectables.push(entry);
    });
  });

  const steps = [
    {
      short: "1. Apparatus",
      title: "Compact table & Pure Coordination Task box",
      badge: "40 × 40 cm box · 2 coins per child",
      body: "Same-aged 2- or 3-year-olds sit right around a child-sized square table—across from each other in dyads, or on three sides in triads. A square wooden box is velcroed to the center with a clear hinged glass lid showing two brass coins per partner, and the music box stands nearby.",
      why: "Keeping the table compact lets toddlers comfortably reach both their keys and their own vertical side of the square box, while Velcro prevents rotating the box to peek.",
      camera: { pos: [0.18, 2.35, 2.65], look: [0.08, 0.68, -0.06] },
      mode: "color",
      boxVisible: true,
      keysAttached: false,
      bubbles: false
    },
    {
      short: "2. Training",
      title: "Individual training with adults",
      badge: "Matched to criterion before peer trials",
      body: "Before peers sit together, each child completes individual training: dropping brass coins into the music box (click the music box to hear/see it!), matching red and blue magnets to criterion, and unlocking the square box with adult scaffolding.",
      why: "Training every child to criterion ensures any group difficulty reflects peer decision coordination—not confusion about the matching rule.",
      camera: { pos: [-1.55, 2.7, 1.65], look: [-0.2, 0.72, -0.05] },
      mode: "color",
      boxVisible: true,
      keysAttached: false,
      bubbles: false
    },
    {
      short: "3. Warm-up",
      title: "Group practice warm-up",
      badge: "10 seconds before the square box arrives",
      body: "All partners sit together with red and blue magnetic keys on the table—but no box yet. The experimenter prompts, “Pick your color… Remember, you all need to pick the same color,” waiting 10 seconds before setting the square box down.",
      why: "Holding the box back for 10 seconds creates a window for peers to communicate and agree before sticking a magnet down.",
      camera: { pos: [0.1, 2.25, 2.45], look: [0, 0.66, 0] },
      mode: "color",
      boxVisible: false,
      keysAttached: false,
      bubbles: false
    },
    {
      short: "4. Key Matching",
      title: "Test trials 1–3: matching hidden keys",
      badge: "Click 'Watch key matching' to see mismatch → swap → unlock",
      body: "Across three 70-second test trials, each child sticks one magnet to their own vertical wall of the square box, out of partners' sightlines. If keys mismatch (e.g., red vs. blue), the lid stays locked until peers coordinate, swap to the same color, and unlock the coins!",
      why: "Because the square box blocks sightlines to partners' chosen sides, reliable coordination requires peer talk, pointing, or checking.",
      camera: { pos: [1.45, 2.7, 1.85], look: [0.05, 0.7, -0.05] },
      mode: "color",
      boxVisible: true,
      keysAttached: true,
      bubbles: false,
      autoPlay: true
    },
    {
      short: "5. Strategies",
      title: "Peer communication vs. solo habits",
      badge: "90% in 3-year-old triads vs. 46.7% in 2-year-old triads",
      body: "Two-year-olds relied mostly on solo habits (repeating their last rewarded color), succeeding in dyads (83.3%) but struggling in triads (46.7%). Three-year-olds communicated about a specific key 2.5× as often and reached 90.0% in triads.",
      why: "Adding a third partner squares the difficulty of matching by chance; peer-directed key talk aligns all three sides.",
      camera: { pos: [0.08, 2.73, 2.45], look: [0, 0.78, -0.04] },
      mode: "color",
      boxVisible: true,
      keysAttached: true,
      bubbles: true
    },
    {
      short: "6. Generalization",
      title: "Trial 4: domain generalization (pig & cow)",
      badge: "10/10 everywhere except 2-year-old triads (1/10)",
      body: "On Trial 4, red and blue magnets are replaced with circular pig and cow magnets without extra instruction. Press 'Watch key matching' to see peers coordinate on the novel animal keys.",
      why: "Replacing colors with animals removes color-repetition habits: 10/10 2-year-old dyads and all 3-year-old groups succeeded, versus 1/10 2-year-old triads.",
      camera: { pos: [0.15, 2.6, 2.25], look: [0, 0.7, 0.02] },
      mode: "animal",
      boxVisible: true,
      keysAttached: false,
      bubbles: false
    }
  ];

  function activeIds() {
    return condition === "dyad" ? ["west", "east"] : ["west", "north", "east"];
  }

  function resetStaticPose() {
    const st = steps[stepIndex];
    const ids = activeIds();
    const isAnimal = st.mode === "animal";
    layoutCoins(ids.length * 2);
    boxGroup.visible = st.boxVisible;
    boxGroup.position.x = 0;
    lidPivot.rotation.x = 0;
    flyingCoin.visible = false;

    Object.keys(people).forEach(function (id) {
      const p = people[id];
      const active = ids.indexOf(id) !== -1;
      p.group.visible = active;
      p.redKey.position.set(-0.085, 0.632, 0.31);
      p.blueKey.position.set(0.085, 0.632, 0.31);
      p.pigKey.position.set(-0.085, 0.632, 0.31);
      p.cowKey.position.set(0.085, 0.632, 0.31);
      p.redKey.rotation.set(0, 0, 0);
      p.blueKey.rotation.set(0, 0, 0);
      p.pigKey.rotation.set(0, 0, 0);
      p.cowKey.rotation.set(0, 0, 0);

      p.redKey.visible = active && !isAnimal;
      p.blueKey.visible = active && !isAnimal && !st.keysAttached;
      p.pigKey.visible = active && isAnimal && !st.keysAttached;
      p.cowKey.visible = active && isAnimal;

      p.bubbleColor.visible = active && st.bubbles && !isAnimal;
      p.bubbleAnimal.visible = active && st.bubbles && isAnimal;

      sockets[id].colorMesh.material.color.setHex(palette.cobaltBlue);
      sockets[id].colorMesh.visible = active && st.boxVisible && st.keysAttached && !isAnimal;
      sockets[id].animalMesh.visible = active && st.boxVisible && st.keysAttached && isAnimal;
      p.child.userData.leftArm.rotation.x = 0;
      p.child.userData.rightArm.rotation.x = 0;
    });

    focusRing.visible = st.boxVisible;
  }

  return {
    id: "tsa",
    tabTag: "Ages 2–3 · Dyads & Triads",
    tabName: "Pure Coordination Task",
    eyebrow: "Tasks · Rivero, Vasil, & Tomasello (2026)",
    studyTitle: "Two- and Three-Year-Olds Coordinate Decisions in Dyads and Triads",
    studyHref: "../studies/tsa/",
    dataHref: "../studies/tsa/data/",
    paperHref: "../studies/tsa/files/Rivero-et-al-2026-dyad-triad.pdf",
    condLabel: "Peer group size",
    conditions: [
      { value: "dyad", label: "Dyad (2 peers · 4 coins)" },
      { value: "triad", label: "Triad (3 peers · 6 coins)" }
    ],
    defaultCondition: "triad",
    playLabel: "Watch key matching",
    clickTip: "Click the square box, music box, or keys to inspect",
    steps: steps,
    root: root,
    inspectables: inspectables,
    setCondition: function (val, nowSec) {
      condition = val;
      keyMatchStart = -1;
      resetStaticPose();
      if (steps[stepIndex].autoPlay) keyMatchStart = nowSec;
    },
    setStep: function (idx, nowSec) {
      stepIndex = idx;
      keyMatchStart = -1;
      resetStaticPose();
      if (steps[idx].autoPlay) keyMatchStart = nowSec;
    },
    playAction: function (nowSec) {
      if (!steps[stepIndex].boxVisible) {
        boxGroup.visible = true;
        focusRing.visible = true;
      }
      keyMatchStart = nowSec;
    },
    resetAction: function () {
      keyMatchStart = -1;
      musicChimeUntil = 0;
      lidPeekUntil = 0;
      flyingCoin.visible = false;
      resetStaticPose();
    },
    update: function (t) {
      const st = steps[stepIndex];
      const ids = activeIds();
      const isAnimal = st.mode === "animal";

      // Gentle toddler head & arm idle motion
      ids.forEach(function (id, idx) {
        const p = people[id];
        const head = p.child.userData.head;
        if (head) {
          head.rotation.y = Math.sin(t * 1.3 + idx * 1.7) * 0.1;
          head.rotation.x = 0.08;
        }
      });

      // Multi-phase Key-Matching Animation (7.6s total)
      // 0.0–1.5s: Partners lift keys onto vertical box walls (east places RED/COW mismatch!)
      // 1.5–2.8s: Box shakes gently (locked mismatch!)
      // 2.8–4.6s: Peers communicate ("Blue!" / "Pig!"), east swaps mismatch back to table & places matching BLUE/PIG
      // 4.6–7.6s: Unlock! Glass lid hinges open, gold coin arcs into music box slot, musical notes float!
      if (keyMatchStart >= 0) {
        const elapsed = t - keyMatchStart;
        if (elapsed <= 7.6) {
          boxGroup.visible = true;
          focusRing.visible = true;

          // Phase 1: initial placement
          const p1 = Math.min(1, Math.max(0, elapsed / 1.35));
          const ease1 = p1 * p1 * (3 - 2 * p1);

          ids.forEach(function (id) {
            const p = people[id];
            const isMismatcher = id === "east";
            p.child.userData.rightArm.rotation.x = -Math.sin(p1 * Math.PI) * 0.42;

            if (p1 < 1) {
              sockets[id].colorMesh.visible = false;
              sockets[id].animalMesh.visible = false;
              const movingMesh = isAnimal
                ? (isMismatcher ? p.cowKey : p.pigKey)
                : (isMismatcher ? p.redKey : p.blueKey);
              const startX = isMismatcher ? -0.085 : (isAnimal ? -0.085 : 0.085);
              movingMesh.visible = true;
              movingMesh.position.set(
                startX * (1 - ease1),
                0.632 + Math.sin(ease1 * Math.PI) * 0.14 + ease1 * 0.088,
                0.31 + (0.47 - 0.31) * ease1
              );
              movingMesh.rotation.x = ease1 * (Math.PI / 2);
            } else if (elapsed < 2.9) {
              // Attached with mismatch on east!
              if (!isAnimal) {
                p.blueKey.visible = isMismatcher;
                p.redKey.visible = !isMismatcher;
                p.redKey.position.set(-0.085, 0.632, 0.31);
                p.redKey.rotation.set(0, 0, 0);
                sockets[id].colorMesh.visible = true;
                sockets[id].colorMesh.material.color.setHex(isMismatcher ? palette.coralRed : palette.cobaltBlue);
              } else {
                p.pigKey.visible = isMismatcher;
                p.cowKey.visible = !isMismatcher;
                p.cowKey.position.set(0.085, 0.632, 0.31);
                p.cowKey.rotation.set(0, 0, 0);
                sockets[id].animalMesh.visible = true;
              }
            }
          });

          // Phase 2: Mismatch lock shake (1.45s - 2.65s)
          if (elapsed >= 1.45 && elapsed < 2.65) {
            boxGroup.position.x = Math.sin((elapsed - 1.45) * 34) * 0.014;
            focusRing.material.color.setHex(palette.coralRed);
          } else {
            boxGroup.position.x = 0;
            focusRing.material.color.setHex(0x285c3f);
          }

          // Phase 3: Peer speech bubbles + east swaps to matching key (2.65s - 4.5s)
          if (elapsed >= 2.65 && elapsed < 4.55) {
            const pSwap = Math.min(1, (elapsed - 2.85) / 1.45);
            const easeSwap = Math.max(0, pSwap * pSwap * (3 - 2 * pSwap));
            ids.forEach(function (id) {
              const p = people[id];
              p.bubbleColor.visible = !isAnimal;
              p.bubbleAnimal.visible = isAnimal;
            });
            const eastP = people.east;
            eastP.child.userData.leftArm.rotation.x = -Math.sin(easeSwap * Math.PI) * 0.45;
            if (pSwap < 0.98) {
              sockets.east.colorMesh.visible = false;
              sockets.east.animalMesh.visible = false;
              const goodKey = isAnimal ? eastP.pigKey : eastP.blueKey;
              const oldKey = isAnimal ? eastP.cowKey : eastP.redKey;
              oldKey.visible = true;
              oldKey.position.set(isAnimal ? 0.085 : -0.085, 0.632, 0.31);
              oldKey.rotation.set(0, 0, 0);
              goodKey.visible = true;
              const gx = isAnimal ? -0.085 : 0.085;
              goodKey.position.set(
                gx * (1 - easeSwap),
                0.632 + Math.sin(easeSwap * Math.PI) * 0.14 + easeSwap * 0.088,
                0.31 + (0.47 - 0.31) * easeSwap
              );
              goodKey.rotation.x = easeSwap * (Math.PI / 2);
            }
          }

          // Phase 4: All match -> Lid hinges open + coin flies to music box + chime notes!
          if (elapsed >= 4.55) {
            ids.forEach(function (id) {
              const p = people[id];
              p.bubbleColor.visible = st.bubbles && !isAnimal;
              p.bubbleAnimal.visible = st.bubbles && isAnimal;
              if (!isAnimal) {
                p.blueKey.visible = false;
                p.redKey.visible = true;
                p.redKey.position.set(-0.085, 0.632, 0.31);
                p.redKey.rotation.set(0, 0, 0);
                sockets[id].colorMesh.visible = true;
                sockets[id].colorMesh.material.color.setHex(palette.cobaltBlue);
              } else {
                p.pigKey.visible = false;
                p.cowKey.visible = true;
                p.cowKey.position.set(0.085, 0.632, 0.31);
                p.cowKey.rotation.set(0, 0, 0);
                sockets[id].animalMesh.visible = true;
              }
            });

            const openP = Math.min(1, (elapsed - 4.55) / 0.75);
            lidPivot.rotation.x = -0.92 * (1 - Math.pow(1 - openP, 3));

            const coinP = Math.min(1, Math.max(0, (elapsed - 5.1) / 1.25));
            if (coinP > 0 && coinP < 1) {
              flyingCoin.visible = true;
              flyingCoin.position.set(
                1.18 * coinP,
                0.68 + Math.sin(coinP * Math.PI) * 0.45 + coinP * 0.08,
                -0.92 * coinP
              );
              flyingCoin.rotation.z = coinP * Math.PI * 3;
            } else {
              flyingCoin.visible = false;
            }

            if (elapsed >= 6.2) {
              musicChimeUntil = Math.max(musicChimeUntil, keyMatchStart + 7.6);
            }
          }
        } else {
          keyMatchStart = -1;
          resetStaticPose();
        }
      }

      // Click-lid-peek micro-action
      if (keyMatchStart < 0) {
        const targetLid = t < lidPeekUntil ? -0.78 : 0;
        lidPivot.rotation.x += (targetLid - lidPivot.rotation.x) * 0.14;
      }

      // Floating musical chime notes on Music Box
      const chiming = t < musicChimeUntil;
      notes.forEach(function (n, idx) {
        if (chiming) {
          const cyc = ((t * 1.4 + idx * 0.33) % 1);
          n.position.y = 0.78 + cyc * 0.36;
          n.position.x = (idx - 1) * 0.1 + Math.sin(t * 4 + idx) * 0.025;
          n.material.opacity = Math.sin(cyc * Math.PI);
        } else {
          n.material.opacity *= 0.88;
        }
      });

      if (focusRing.visible) {
        const pulse = 1 + Math.sin(t * 3) * 0.035;
        focusRing.scale.set(pulse, pulse, 1);
      }
    }
  };
}

/* ============================================================================
 * 2. EPISTEMIC vs. PHYSICAL UNCERTAINTY (Julia M. Smith et al., 2025, DevSci)
 *    Modeled directly after Figure 1 & Coded Dice Task Worksheet
 * ========================================================================== */
function makeDieMesh(size = 0.078) {
  // Standard opposite faces summing to 7: +x=3, -x=4, +y=6, -y=1, +z=2, -z=5
  const facePips = [3, 4, 6, 1, 2, 5];
  const pipCoords = {
    1: [[0.5, 0.5]],
    2: [[0.28, 0.28], [0.72, 0.72]],
    3: [[0.26, 0.26], [0.5, 0.5], [0.74, 0.74]],
    4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
    5: [[0.26, 0.26], [0.74, 0.26], [0.5, 0.5], [0.26, 0.74], [0.74, 0.74]],
    6: [[0.28, 0.24], [0.72, 0.24], [0.28, 0.5], [0.72, 0.5], [0.28, 0.76], [0.72, 0.76]]
  };
  const mats = facePips.map(function (count) {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fcfaf5";
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = "#ded6c6";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 122, 122);
    ctx.fillStyle = "#181614";
    pipCoords[count].forEach(function (pt) {
      ctx.beginPath();
      ctx.arc(pt[0] * 128, pt[1] * 128, 11.5, 0, Math.PI * 2);
      ctx.fill();
    });
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 });
  });
  const die = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mats);
  die.castShadow = true;
  return die;
}

function makeFigure1DiagramCard(activeMode) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 360;
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#fdfbf6";
  ctx.fillRect(0, 0, 512, 360);
  ctx.strokeStyle = "#c8bea9";
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 504, 352);

  function drawDieIcon(cx, cy) {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#1d1b18";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(cx - 32, cy - 32, 64, 64, 10);
    ctx.fill();
    ctx.stroke();
    [[-14, -14], [14, -14], [0, 0], [-14, 14], [14, 14]].forEach(function (p) {
      ctx.fillStyle = "#1d1b18";
      ctx.beginPath();
      ctx.arc(cx + p[0], cy + p[1], 4.8, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawChildBubbleIcon(cx, cy) {
    ctx.save();
    // Black silhouette head + shoulders (matching Figure 1)
    ctx.fillStyle = "#1e1c19";
    ctx.beginPath();
    ctx.arc(cx - 8, cy + 8, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy + 40, 28, 15, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Yellow speech bubble (matching Figure 1)
    ctx.fillStyle = "#f4d046";
    ctx.strokeStyle = "#1e1c19";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(cx + 28, cy - 16, 26, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1e1c19";
    ctx.font = "700 18px 'Source Sans 3', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("?", cx + 28, cy - 10);
    ctx.restore();
  }

  function drawArrow(x1, x2, y) {
    ctx.strokeStyle = "#1e1c19";
    ctx.fillStyle = "#1e1c19";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2 - 14, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y);
    ctx.lineTo(x2 - 18, y - 10);
    ctx.lineTo(x2 - 18, y + 10);
    ctx.closePath();
    ctx.fill();
  }

  // Top panel: Roll-Then-Guess (Epistemic)
  ctx.fillStyle = activeMode === "epistemic" ? "#e5f0e9" : "#f5f1e8";
  ctx.strokeStyle = activeMode === "epistemic" ? "#285c3f" : "#d5cbb9";
  ctx.lineWidth = activeMode === "epistemic" ? 5 : 2.5;
  ctx.beginPath();
  ctx.roundRect(24, 22, 464, 146, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#285c3f";
  ctx.font = "700 18px 'Source Sans 3', sans-serif";
  ctx.fillText("1. Roll-Then-Guess (Epistemic · 60.5%)", 42, 48);
  drawDieIcon(122, 104);
  drawArrow(196, 304, 104);
  drawChildBubbleIcon(378, 100);

  // Bottom panel: Guess-Then-Roll (Physical)
  ctx.fillStyle = activeMode === "physical" ? "#faecd8" : "#f5f1e8";
  ctx.strokeStyle = activeMode === "physical" ? "#cf7a40" : "#d5cbb9";
  ctx.lineWidth = activeMode === "physical" ? 5 : 2.5;
  ctx.beginPath();
  ctx.roundRect(24, 190, 464, 146, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#9d5420";
  ctx.font = "700 18px 'Source Sans 3', sans-serif";
  ctx.fillText("2. Guess-Then-Roll (Physical · 39.5%)", 42, 216);
  drawChildBubbleIcon(122, 268);
  drawArrow(196, 304, 272);
  drawDieIcon(386, 272);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildEpistemicProcedure() {
  const root = new THREE.Group();
  const inspectables = [];

  const table = makeCompactTable(1.24, 0.92, 0.62);
  root.add(table);

  // Single-child task: seat at the near edge and frame from the child's eyes
  const childSeat = new THREE.Group();
  seatChildForPov(childSeat, 0.7);
  childSeat.add(makeChair(0.95));
  const child = makeChild({
    gender: "girl",
    shirt: 0x68a078,
    pants: 0x8b5a9e,
    skin: 0xa86b42,
    hair: 0x1a1210,
    hairStyle: "long",
    blush: 0xb56b55
  }, 0.85);
  enableChildPov(child);
  childSeat.add(child);
  root.add(childSeat);

  const guessBubble = makeSpeechSprite("“I guess 4!”", "#cf7a40", "#fff7d6");
  guessBubble.position.set(0.08, 0.92, 0.18);
  guessBubble.visible = false;
  root.add(guessBubble);

  const expSeat = new THREE.Group();
  expSeat.position.set(0, 0, -0.72);
  expSeat.add(makeChair(1.05));
  const experimenter = makeChild({ shirt: 0x5c738a, pants: 0x333c47, skin: 0xf0cab0, hair: 0x5a3e28, hairStyle: "parted" }, 0.98);
  expSeat.add(experimenter);
  root.add(expSeat);

  // Six-sided die on felt mat
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.008, 32), materials.sageFelt);
  pad.position.set(-0.18, 0.624, 0.02);
  root.add(pad);

  const die = makeDieMesh(0.078);
  die.position.set(-0.18, 0.667, 0.02);
  root.add(die);

  // Opaque terracotta/walnut cup (inverted to hide rolled die!)
  const cupGroup = new THREE.Group();
  cupGroup.position.set(-0.18, 0.628, -0.2);
  const cupOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.086, 0.165, 28),
    materials.terracottaPaint
  );
  cupOuter.position.y = 0.0825;
  cupOuter.castShadow = true;
  const cupRim = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.006, 10, 28), materials.creamMat);
  cupRim.rotation.x = Math.PI / 2;
  cupRim.position.y = 0.005;
  cupGroup.add(cupOuter, cupRim);
  root.add(cupGroup);

  // Figure 1 Two-Panel Sequence Diagram Card on the right of the table
  const cardMat = new THREE.MeshStandardMaterial({
    map: makeFigure1DiagramCard("epistemic"),
    roughness: 0.65
  });
  const diagramCard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.008, 0.3), [
    materials.creamMat,
    materials.creamMat,
    cardMat,
    materials.creamMat,
    materials.creamMat,
    materials.creamMat
  ]);
  diagramCard.position.set(0.25, 0.625, 0.03);
  diagramCard.castShadow = true;
  root.add(diagramCard);

  // Sticker / Candy Reward Tray
  const rewardGroup = new THREE.Group();
  rewardGroup.position.set(-0.44, 0.625, -0.18);
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.085, 0.022, 24), materials.birch);
  tray.castShadow = true;
  rewardGroup.add(tray);
  [0xe56b55, 0xf0c75e, 0x5aa276, 0x4f7cc4].forEach(function (col, idx) {
    const c = makeCandy(col, 0.022);
    c.position.set(Math.cos(idx * 1.57) * 0.036, 0.02, Math.sin(idx * 1.57) * 0.036);
    rewardGroup.add(c);
  });
  root.add(rewardGroup);

  let mode = "epistemic";
  let stepIndex = 0;
  let animStart = -1;
  let cupPeekUntil = 0;

  inspectables.push(
    tagInspectable(
      cupGroup,
      "opaque-cup",
      "Opaque Concealing Cup",
      "Shaken and kept upside-down on the table so the die's outcome is physically determined inside the world while remaining completely unknown to the participant (epistemic uncertainty).",
      [-0.22, 1.12, 0.52],
      [-0.18, 0.68, -0.05],
      function (nowSec) { cupPeekUntil = nowSec + 2.2; }
    ),
    tagInspectable(
      die,
      "six-sided-die",
      "Six-Sided White Die (1–6)",
      "Counted aloud from 1 to 6 with every participant before testing. Remarkably, Tsimané youth in Bolivia who had never seen dice before showed the exact same 65% preference for Roll-Then-Guess as U.S. children (64%).",
      [-0.18, 1.08, 0.48],
      [-0.18, 0.66, 0.02],
      function () { die.rotation.x += Math.PI / 2; die.rotation.z += Math.PI / 2; }
    ),
    tagInspectable(
      diagramCard,
      "figure1-card",
      "Figure 1 Counterbalanced Sequence Card",
      "Presented in counterbalanced order (Version A vs. Version B): Roll-Then-Guess shows the die rolled first followed by the yellow speech-bubble guess; Guess-Then-Roll shows the guess first followed by the die roll.",
      [0.22, 1.1, 0.5],
      [0.25, 0.63, 0.03]
    ),
    tagInspectable(
      rewardGroup,
      "reward-tray",
      "Prize Tray (Stickers & Candies)",
      "Makes the critical test trial a real, incentive-compatible game of chance: matching the hidden number wins an immediate prize, contrasting live decisions against prior hypothetical adult vignettes.",
      [-0.35, 1.1, 0.42],
      [-0.44, 0.64, -0.18]
    )
  );

  const steps = [
    {
      short: "1. Die & Dots",
      title: "Counting dots & open practice rolls",
      badge: "USA (N = 56) · Bolivia Tsimané (N = 54) · Iran (N = 100)",
      body: "The researcher asks whether the participant has ever seen a die before, counts the dots from 1 to 6 across all six faces together, rolls the die openly twice, and invites the participant to roll twice.",
      why: "Hands-on familiarization ensures participants with zero prior exposure to dice (100% of Bolivian Tsimané children) understand equiprobable 1–6 outcomes just as clearly as urban peers.",
      camera: childPov.overview,
      covered: false,
      bubble: false
    },
    {
      short: "2. Cup Check",
      title: "Concealed cup & comprehension check",
      badge: "79% passed on first try · 20% on second try",
      body: "The researcher shakes the die inside the opaque cup, flips it upside-down on the mat so the rolled number stays hidden, and verifies comprehension of the matching rule for winning a prize.",
      why: "Keeping the inverted cup directly in view makes the distinction between a determined-but-hidden outcome and an unrolled future outcome concrete.",
      camera: childPov.left,
      covered: true,
      bubble: false
    },
    {
      short: "3. Figure 1 Card",
      title: "Two game versions & practice rounds",
      badge: "Counterbalanced diagram (Figure 1)",
      body: "Using the printed two-panel diagram on the table, the researcher explains Roll-Then-Guess (top) and Guess-Then-Roll (bottom), then plays one practice round of each version in random order.",
      why: "Experiencing both timing sequences firsthand before the critical choice eliminates order confounds and verbal ambiguity across languages.",
      camera: childPov.right,
      covered: false,
      bubble: false
    },
    {
      short: "4. Critical Choice",
      title: "Critical test trial: Roll-Then-Guess vs. Guess-Then-Roll",
      badge: "60.5% chose Epistemic (Roll-Then-Guess), p < .001",
      body: "For the real prize game, the participant chooses which version to play. Toggle between Epistemic and Physical above or click 'Play dice round' to watch the exact sequence difference!",
      why: "Across ages 6–19 in the US (64%), Bolivia (65%), and Iran (56%), youth favored Roll-Then-Guess with no developmental shift toward physical uncertainty.",
      camera: childPov.close,
      covered: true,
      bubble: true,
      autoPlay: true
    }
  ];

  function syncCard() {
    cardMat.map = makeFigure1DiagramCard(mode);
    cardMat.needsUpdate = true;
  }

  function resetPose() {
    const st = steps[stepIndex];
    die.position.set(-0.18, 0.667, 0.02);
    if (st.covered) {
      cupGroup.position.set(-0.18, 0.628, 0.02);
    } else {
      cupGroup.position.set(-0.18, 0.628, -0.22);
    }
    cupGroup.rotation.set(0, 0, 0);
    guessBubble.visible = st.bubble;
  }

  return {
    id: "epistemic-uncertainty",
    tabTag: "Julia Smith & Dorsa Amir (2025)",
    tabName: "Epistemic vs. Physical Uncertainty",
    eyebrow: "Tasks · Smith, Mohamadpour, Engelmann, … & Amir (2025)",
    studyTitle: "No Developmental Differences in Preferences for Epistemic Versus Physical Uncertainty Across Three Diverse Cultures",
    studyHref: "../studies/epistemic-uncertainty/",
    dataHref: "../studies/epistemic-uncertainty/data/",
    paperHref: "../studies/epistemic-uncertainty/files/Smith-et-al-2025-epistemic-uncertainty.pdf",
    condLabel: "Game timing sequence (Figure 1)",
    conditions: [
      { value: "epistemic", label: "Roll-Then-Guess (Epistemic · 60.5%)" },
      { value: "physical", label: "Guess-Then-Roll (Physical · 39.5%)" }
    ],
    defaultCondition: "epistemic",
    playLabel: "Play dice round",
    clickTip: "Click the cup, die, Figure 1 card, or prize tray to inspect",
    steps: steps,
    root: root,
    inspectables: inspectables,
    setCondition: function (val, nowSec) {
      mode = val;
      syncCard();
      animStart = nowSec;
    },
    setStep: function (idx, nowSec) {
      stepIndex = idx;
      animStart = -1;
      resetPose();
      if (steps[idx].autoPlay) animStart = nowSec;
    },
    playAction: function (nowSec) {
      animStart = nowSec;
    },
    resetAction: function () {
      animStart = -1;
      cupPeekUntil = 0;
      resetPose();
    },
    update: function (t) {
      child.userData.head.rotation.y = Math.sin(t * 1.2) * 0.08;
      experimenter.userData.head.rotation.y = -Math.sin(t * 1.1) * 0.07;

      if (animStart >= 0) {
        const e = t - animStart;
        if (e <= 5.4) {
          if (mode === "epistemic") {
            // ROLL FIRST (0–2.0s), THEN GUESS (2.0–3.6s), THEN REVEAL (3.6–5.4s)
            if (e < 1.8) {
              const p = e / 1.8;
              cupGroup.position.set(-0.18, 0.628 + Math.sin(p * Math.PI) * 0.16, -0.22 + 0.24 * Math.min(1, p * 1.4));
              cupGroup.rotation.z = Math.sin(e * 24) * 0.18;
              die.position.set(-0.18, 0.667 + Math.sin(p * Math.PI) * 0.12, 0.02);
              die.rotation.set(e * 8, e * 6, 0);
              guessBubble.visible = false;
            } else if (e < 3.6) {
              cupGroup.position.set(-0.18, 0.628, 0.02);
              cupGroup.rotation.set(0, 0, 0);
              die.rotation.set(0, 0, Math.PI / 2);
              guessBubble.visible = true;
            } else {
              const lift = Math.min(1, (e - 3.6) / 0.8);
              cupGroup.position.set(-0.18, 0.628 + lift * 0.22, 0.02 - lift * 0.18);
              guessBubble.visible = true;
            }
          } else {
            // GUESS FIRST (0–1.8s), THEN ROLL (1.8–3.8s), THEN REVEAL (3.8–5.4s)
            if (e < 1.8) {
              cupGroup.position.set(-0.18, 0.628, -0.22);
              guessBubble.visible = true;
            } else if (e < 3.7) {
              const p = (e - 1.8) / 1.9;
              cupGroup.position.set(-0.18, 0.628 + Math.sin(p * Math.PI) * 0.16, -0.22 + 0.24 * Math.min(1, p * 1.4));
              cupGroup.rotation.z = Math.sin(e * 24) * 0.18;
              die.position.set(-0.18, 0.667 + Math.sin(p * Math.PI) * 0.12, 0.02);
              die.rotation.set(e * 8, e * 6, 0);
              guessBubble.visible = true;
            } else {
              const lift = Math.min(1, (e - 3.7) / 0.8);
              die.rotation.set(0, 0, Math.PI / 2);
              cupGroup.rotation.set(0, 0, 0);
              cupGroup.position.set(-0.18, 0.628 + lift * 0.22, 0.02 - lift * 0.18);
              guessBubble.visible = true;
            }
          }
        } else {
          animStart = -1;
          resetPose();
        }
      } else if (t < cupPeekUntil) {
        cupGroup.position.y += (0.84 - cupGroup.position.y) * 0.15;
      } else if (steps[stepIndex].covered) {
        cupGroup.position.y += (0.628 - cupGroup.position.y) * 0.15;
      }
    }
  };
}

/* ============================================================================
 * 3. TRUSTWORTHINESS vs. GENEROSITY (Amir, Parsons, Ahl, & McAuliffe, 2021)
 *    Modeled directly after Figure 1: Two-Channel Plexiglass Trust Apparatus
 * ========================================================================== */
export function buildTrustProcedure() {
  const root = new THREE.Group();
  const inspectables = [];

  const table = makeCompactTable(1.36, 0.96, 0.62);
  root.add(table);

  // Participant (west end of apparatus) & Peer Partner (north side)
  const actorSeat = new THREE.Group();
  actorSeat.position.set(-0.84, 0, 0);
  actorSeat.rotation.y = Math.PI / 2;
  actorSeat.add(
    makeChair(0.95),
    makeChild({
      gender: "girl",
      shirt: 0xe08c3c,
      pants: 0x6b4a8a,
      skin: 0xf2ccb0,
      hair: 0xc4a05a,
      hairStyle: "ponytail",
      hairTie: 0x568265
    }, 0.86)
  );
  root.add(actorSeat);

  const peerSeat = new THREE.Group();
  peerSeat.position.set(0.05, 0, -0.66);
  peerSeat.add(
    makeChair(0.95),
    makeChild({
      shirt: 0x568265,
      pants: 0x3e4c59,
      skin: 0x6b3f2a,
      hair: 0x1a1210,
      hairStyle: "curls",
      blush: 0xa85a45
    }, 0.86)
  );
  const peerBubble = makeSpeechSprite("“Use my rod piece!”", "#285c3f");
  peerBubble.position.set(0, 1.36, 0);
  peerBubble.visible = false;
  peerSeat.add(peerBubble);
  root.add(peerSeat);

  // Figure 1: Rectangular light-wood Trust Apparatus divided longitudinally into 2 parallel channels
  const apparatus = new THREE.Group();
  apparatus.position.set(0.02, 0.622, 0.02);

  const trayBase = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.018, 0.38), materials.birch);
  trayBase.position.y = 0.009;
  trayBase.receiveShadow = true;
  apparatus.add(trayBase);

  // Outer walls (open on actor's left end x = -0.41 so dishes can be pulled out!)
  [
    [0, 0.055, -0.182, 0.82, 0.09, 0.018], // back wall
    [0, 0.055, 0.182, 0.82, 0.09, 0.018],  // front wall
    [0.401, 0.055, 0, 0.018, 0.09, 0.38],  // far end wall
    [0, 0.055, 0, 0.8, 0.088, 0.016],      // longitudinal center divider!
    [0.04, 0.055, 0.091, 0.02, 0.088, 0.166] // block making lower/near channel shorter!
  ].forEach(function (w) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w[3], w[4], w[5]), materials.walnut);
    m.position.set(w[0], w[1], w[2]);
    m.castShadow = true;
    apparatus.add(m);
  });

  // Transparent Plexiglass top cover
  const plexi = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.008, 0.36), materials.glass);
  plexi.position.set(0.02, 0.102, 0);
  apparatus.add(plexi);

  // Near square yellow/green dish (2 Starburst candies) in front/short channel (z = +0.091)
  const yellowDish = new THREE.Group();
  yellowDish.position.set(-0.14, 0.024, 0.091);
  const ydBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.024, 0.11),
    new THREE.MeshStandardMaterial({ color: 0xd8c948, roughness: 0.45 })
  );
  ydBox.castShadow = true;
  yellowDish.add(ydBox);
  [[-0.022, 0], [0.022, 0]].forEach(function (pt, idx) {
    const sb = makeCandy(idx === 0 ? 0xe85d75 : 0xf2a93b, 0.018);
    sb.position.set(pt[0], 0.02, pt[1]);
    yellowDish.add(sb);
  });
  apparatus.add(yellowDish);

  // Far square blue dish (6 Starburst candies) in back/long channel (z = -0.091)
  const blueDish = new THREE.Group();
  blueDish.position.set(0.27, 0.024, -0.091);
  const bdBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.125, 0.024, 0.125),
    new THREE.MeshStandardMaterial({ color: 0x3f74b8, roughness: 0.45 })
  );
  bdBox.castShadow = true;
  blueDish.add(bdBox);
  const candies6 = [];
  for (let i = 0; i < 6; i += 1) {
    const cols = [0xe85d75, 0xf2a93b, 0xf4d348, 0xe85d75, 0xf2a93b, 0xf4d348];
    const sb = makeCandy(cols[i], 0.017);
    sb.position.set(((i % 3) - 1) * 0.034, 0.02, (Math.floor(i / 3) - 0.5) * 0.038);
    blueDish.add(sb);
    candies6.push(sb);
  }
  apparatus.add(blueDish);
  root.add(apparatus);

  // Figure 1 Hooked Stick Tool: Two white cylindrical rods + bright RED connector sleeve + metal hook!
  const toolGroup = new THREE.Group();
  const rodMat = new THREE.MeshStandardMaterial({ color: 0xf4f2ec, roughness: 0.38 });
  const redConnectorMat = new THREE.MeshStandardMaterial({ color: 0xd63b2f, roughness: 0.35 });

  const rodActor = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.34, 16), rodMat);
  rodActor.rotation.z = Math.PI / 2;
  const redSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.075, 18), redConnectorMat);
  redSleeve.rotation.z = Math.PI / 2;
  const rodPartner = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.34, 16), rodMat);
  rodPartner.rotation.z = Math.PI / 2;
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 8, 18, Math.PI * 1.25), materials.silver);
  hook.rotation.x = Math.PI / 2;
  hook.position.set(0.17, 0, 0.015);
  const rodPartnerWithHook = new THREE.Group();
  rodPartnerWithHook.add(rodPartner, hook);

  toolGroup.add(rodActor, redSleeve, rodPartnerWithHook);
  root.add(toolGroup);

  // Two marked paper bags (Participant's bag vs. Partner's bag)
  const bagsGroup = new THREE.Group();
  function makeBag(x, z, tintHex) {
    const b = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.095, 0.13, 0.065),
      new THREE.MeshStandardMaterial({ color: 0xd8be96, roughness: 0.85 })
    );
    body.position.y = 0.065;
    body.castShadow = true;
    const badge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.065, 0.045),
      new THREE.MeshStandardMaterial({ color: tintHex, roughness: 0.6 })
    );
    badge.position.set(0, 0.07, 0.034);
    b.add(body, badge);
    b.position.set(x, 0.622, z);
    return b;
  }
  bagsGroup.add(makeBag(-0.48, 0.3, 0x568265), makeBag(-0.34, -0.32, 0xcf7a40));
  root.add(bagsGroup);

  let cond = "trustworthiness";
  let stepIndex = 0;
  let animStart = -1;

  inspectables.push(
    tagInspectable(
      apparatus,
      "trust-tray",
      "Two-Channel Plexiglass Trust Apparatus (Figure 1)",
      "Divided longitudinally into a short channel (holding the yellow 2-Starburst dish within reach of one short rod) and a long channel (holding the blue 6-Starburst dish out of reach unless two rods are joined).",
      [0.05, 1.52, 1.22],
      [0.02, 0.66, 0.02]
    ),
    tagInspectable(
      toolGroup,
      "hooked-tool",
      "Two-Piece Hooked Rod & Red Connector Sleeve",
      "In the Trustworthiness condition, the peer forfeits their own short rod—giving up a guaranteed 2 candies—so the actor can snap both white rods into the bright red sleeve to hook the far 6-candy dish.",
      [-0.28, 1.32, 0.95],
      [-0.08, 0.66, -0.06],
      function (nowSec) { animStart = nowSec; }
    ),
    tagInspectable(
      bagsGroup,
      "paper-bags",
      "Marked Paper Allocation Bags",
      "After pulling out the 6 Starburst candies, the child privately distributes candies between their own bag and their partner's bag (sharing M = 2.70 in Trustworthiness vs. M = 2.12 in Generosity, p = .002).",
      [-0.65, 1.28, 0.78],
      [-0.42, 0.68, 0]
    )
  );

  const steps = [
    {
      short: "1. Two Channels",
      title: "Two-channel Plexiglass Trust Apparatus",
      badge: "Yellow dish (2 candies) vs. far Blue dish (6 candies)",
      body: "The child sits at the open end of the wooden tray (Figure 1). A single short white rod can reach the yellow dish (2 Starbursts) in the short channel, but cannot reach the blue dish (6 Starbursts) at the end of the long channel.",
      why: "Making multiplication physical (2 vs. 6 visible candies) removes arithmetic demands so 5-to-8-year-olds grasp the exact stakes immediately.",
      camera: { pos: [1.35, 2.7, 1.55], look: [0, 0.66, 0] },
      assembled: false
    },
    {
      short: "2. Red Connector",
      title: "Entrusting the second tool piece",
      badge: "Trustworthiness vs. Generosity control",
      body: "In Trustworthiness, the peer partner gives up their own short rod (forfeiting 2 guaranteed candies) so the participant can join both rods inside the bright red connector sleeve. In Generosity, the participant already has both pieces without peer sacrifice.",
      why: "Holding the physical tool assembly and 6-candy windfall identical isolates genuine reciprocity for trust from baseline Dictator-Game generosity.",
      camera: { pos: [-1.25, 2.6, 1.35], look: [-0.05, 0.68, -0.05] },
      assembled: true
    },
    {
      short: "3. Retrieve & Share",
      title: "Hooking the 6-candy dish & sharing back",
      badge: "M = 2.70 shared (Trust) vs. M = 2.12 (Generosity), p = .002",
      body: "Click 'Watch tool & sharing' to see the assembled long tool slide beneath the Plexiglass, hook the 6-Starburst blue dish out of the far channel, and allocate candies into the two paper bags.",
      why: "Children both returned more candies and predicted higher partner expectations when entrusted with the partner's rod.",
      camera: { pos: [1.2, 2.7, 1.55], look: [-0.06, 0.66, 0] },
      assembled: true,
      autoPlay: true
    }
  ];

  function resetPose() {
    const st = steps[stepIndex];
    blueDish.position.set(0.27, 0.024, -0.091);
    peerSeat.visible = true;
    peerBubble.visible = cond === "trustworthiness" && st.assembled;
    if (!st.assembled) {
      rodActor.position.set(-0.34, 0.64, 0.34);
      redSleeve.position.set(-0.14, 0.64, 0.34);
      rodPartnerWithHook.position.set(cond === "trustworthiness" ? 0.05 : 0.08, 0.64, cond === "trustworthiness" ? -0.28 : 0.34);
    } else {
      rodActor.position.set(-0.42, 0.665, -0.07);
      redSleeve.position.set(-0.24, 0.665, -0.07);
      rodPartnerWithHook.position.set(-0.06, 0.665, -0.07);
    }
  }

  return {
    id: "trustworthiness-generosity",
    tabTag: "Amir et al. (2021 · Dev Psych)",
    tabName: "Trust Apparatus",
    eyebrow: "Tasks · Amir, Parsons, Ahl, & McAuliffe (2021)",
    studyTitle: "Trustworthiness is Distinct from Generosity in Children",
    studyHref: "../studies/trustworthiness-generosity/",
    dataHref: "../studies/trustworthiness-generosity/data/",
    paperHref: "../studies/trustworthiness-generosity/files/Amir-et-al-2021-trustworthiness-generosity.pdf",
    condLabel: "Experimental condition",
    conditions: [
      { value: "trustworthiness", label: "Trustworthiness (Peer gives rod · M = 2.70)" },
      { value: "generosity", label: "Generosity (Solo control · M = 2.12)" }
    ],
    defaultCondition: "trustworthiness",
    playLabel: "Watch tool & sharing",
    clickTip: "Click the two-channel tray, hooked rod, or paper bags to inspect",
    steps: steps,
    root: root,
    inspectables: inspectables,
    setCondition: function (val, nowSec) {
      cond = val;
      resetPose();
      animStart = nowSec;
    },
    setStep: function (idx, nowSec) {
      stepIndex = idx;
      animStart = -1;
      resetPose();
      if (steps[idx].autoPlay) animStart = nowSec;
    },
    playAction: function (nowSec) {
      animStart = nowSec;
    },
    resetAction: function () {
      animStart = -1;
      resetPose();
    },
    update: function (t) {
      if (animStart >= 0) {
        const e = t - animStart;
        if (e <= 5.6) {
          // 0–1.5s: snap rods into red connector sleeve
          if (e < 1.5) {
            const p = e / 1.5;
            const ep = p * p * (3 - 2 * p);
            peerBubble.visible = cond === "trustworthiness";
            rodActor.position.set(-0.42, 0.665, 0.3 * (1 - ep) - 0.07 * ep);
            redSleeve.position.set(-0.24, 0.665, 0.3 * (1 - ep) - 0.07 * ep);
            const startZ = cond === "trustworthiness" ? -0.28 : 0.3;
            rodPartnerWithHook.position.set(0.05 * (1 - ep) - 0.06 * ep, 0.665, startZ * (1 - ep) - 0.07 * ep);
            blueDish.position.x = 0.27;
          } else if (e < 3.2) {
            // 1.5–3.2s: reach assembled long rod down far channel to hook blue dish
            const p = (e - 1.5) / 1.7;
            const reach = Math.sin(p * Math.PI * 0.5) * 0.24;
            rodActor.position.set(-0.42 + reach, 0.665, -0.07);
            redSleeve.position.set(-0.24 + reach, 0.665, -0.07);
            rodPartnerWithHook.position.set(-0.06 + reach, 0.665, -0.07);
          } else {
            // 3.2–5.6s: pull blue 6-candy dish all the way out to actor!
            const p = Math.min(1, (e - 3.2) / 1.8);
            const pull = 0.24 * (1 - p) - 0.36 * p;
            rodActor.position.set(-0.42 + pull, 0.665, -0.07);
            redSleeve.position.set(-0.24 + pull, 0.665, -0.07);
            rodPartnerWithHook.position.set(-0.06 + pull, 0.665, -0.07);
            blueDish.position.x = 0.27 - p * 0.62;
          }
        } else {
          animStart = -1;
          resetPose();
        }
      }
    }
  };
}

/* ============================================================================
 * 4. INEQUITY AVERSION & DDM (Amir et al., 2023, JEP: General)
 *    Modeled directly after Figure 1 (DDM) & Figure 2 (Inequity Game Apparatus)
 * ========================================================================== */
function drawDdmCanvas(ctx, cond, progress) {
  ctx.fillStyle = "rgba(253, 251, 246, 0.96)";
  ctx.fillRect(0, 0, 512, 300);
  ctx.strokeStyle = "#bfb4a0";
  ctx.lineWidth = 4;
  ctx.strokeRect(3, 3, 506, 294);

  // Upper boundary (Accept - green) & Lower boundary (Reject - red)
  ctx.strokeStyle = "#285c3f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(64, 54);
  ctx.lineTo(476, 54);
  ctx.stroke();

  ctx.strokeStyle = "#c94a3d";
  ctx.beginPath();
  ctx.moveTo(64, 246);
  ctx.lineTo(476, 246);
  ctx.stroke();

  ctx.fillStyle = "#285c3f";
  ctx.font = "700 17px 'Source Sans 3', sans-serif";
  ctx.fillText("Upper boundary: ACCEPT (Green Handle)", 70, 38);
  ctx.fillStyle = "#c94a3d";
  ctx.fillText("Lower boundary: REJECT (Red Handle)", 70, 274);

  // Non-decision time t & starting bias z (Figure 1)
  ctx.strokeStyle = "rgba(28,26,23,0.28)";
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(128, 54);
  ctx.lineTo(128, 246);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#59534a";
  ctx.font = "600 14px 'Source Sans 3', sans-serif";
  ctx.fillText("t (non-decision)", 68, 168);
  ctx.fillText("z (bias)", 134, 144);
  ctx.fillText("a (threshold)", 400, 154);

  // Drift trajectory toward Reject boundary (steeper in DI 1-4 than AI 4-1)
  const pts = [
    [68, 148], [128, 148], [156, 162], [186, 152], [218, 178],
    [248, 170], [282, 198], [312, 190], [346, 222], [382, 246]
  ];
  const maxIdx = Math.max(1, Math.floor(progress * (pts.length - 1)));
  ctx.strokeStyle = cond === "DI" ? "#c94a3d" : "#285c3f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i <= maxIdx; i += 1) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.stroke();

  const tip = pts[maxIdx];
  ctx.fillStyle = "#cf7a40";
  ctx.beginPath();
  ctx.arc(tip[0], tip[1], 7, 0, Math.PI * 2);
  ctx.fill();
}

export function buildInequityProcedure() {
  const root = new THREE.Group();
  const inspectables = [];

  const table = makeCompactTable(1.32, 0.96, 0.62);
  root.add(table);

  // Actor (left, controls Green & Red handles) and Recipient (right, face-to-face)
  const actorGroup = new THREE.Group();
  actorGroup.position.set(-0.82, 0, 0.06);
  actorGroup.rotation.y = Math.PI / 2;
  const actorChild = makeChild({
    shirt: 0x568265,
    pants: 0x3e4c59,
    skin: 0xc9926a,
    hair: 0x2a1e17,
    hairStyle: "parted",
    blush: 0xc47860
  }, 0.86);
  actorGroup.add(makeChair(0.95), actorChild);
  root.add(actorGroup);

  const recipGroup = new THREE.Group();
  recipGroup.position.set(0.82, 0, 0.06);
  recipGroup.rotation.y = -Math.PI / 2;
  recipGroup.add(
    makeChair(0.95),
    makeChild({
      gender: "girl",
      shirt: 0x5c738a,
      pants: 0xc45b7a,
      skin: 0x8d5524,
      hair: 0x1a1210,
      hairStyle: "puffs",
      blush: 0xb56b55
    }, 0.86)
  );
  root.add(recipGroup);

  // Figure 2: Wooden Inequity Game Platform + 3 Colored Bowls + 2 Pivoting Seesaw Trays + Green & Red Handles
  const gameBoard = new THREE.Group();
  gameBoard.position.set(0, 0.622, 0.08);

  const baseBoard = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.02, 0.44), materials.birch);
  baseBoard.position.y = 0.01;
  baseBoard.receiveShadow = true;
  gameBoard.add(baseBoard);

  // Three bowls in a row across the front: Yellow (Actor left), Red (Discard center), Blue (Recipient right)
  function makeBowl(x, colorHex) {
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.072, 0.052, 0.042, 24),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.42 })
    );
    bowl.position.set(x, 0.04, 0.09);
    bowl.castShadow = true;
    return bowl;
  }
  const yellowBowl = makeBowl(-0.24, 0xe3be42);
  const redBowl = makeBowl(0, 0xc94a3d);
  const blueBowl = makeBowl(0.24, 0x3f74b8);
  gameBoard.add(yellowBowl, redBowl, blueBowl);

  // Two pivoting seesaw arms behind the bowls
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.15, 0.11, -0.05);
  const leftBeam = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.016, 0.04), materials.walnut);
  const leftTray = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.064, 0.016, 22), materials.trimWood);
  leftTray.position.set(-0.07, 0.014, 0.06);
  const leftCandies = new THREE.Group();
  leftTray.add(leftCandies);
  leftArmPivot.add(leftBeam, leftTray);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.15, 0.11, -0.05);
  const rightBeam = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.016, 0.04), materials.walnut);
  const rightTray = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.064, 0.016, 22), materials.trimWood);
  rightTray.position.set(0.07, 0.014, 0.06);
  const rightCandies = new THREE.Group();
  rightTray.add(rightCandies);
  rightArmPivot.add(rightBeam, rightTray);

  [-0.15, 0.15].forEach(function (px) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.11, 0.028), materials.walnut);
    post.position.set(px, 0.065, -0.05);
    gameBoard.add(post);
  });
  gameBoard.add(leftArmPivot, rightArmPivot);

  // Upright Green (Accept) & Red (Reject) Handles on the Actor's left side (Figure 2!)
  const handlesGroup = new THREE.Group();
  const greenHandle = new THREE.Group();
  greenHandle.position.set(-0.37, 0.02, -0.08);
  const ghStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.18, 16),
    new THREE.MeshStandardMaterial({ color: 0x3b8c58, roughness: 0.38 })
  );
  ghStick.position.y = 0.09;
  ghStick.castShadow = true;
  greenHandle.add(ghStick);

  const redHandle = new THREE.Group();
  redHandle.position.set(-0.37, 0.02, 0.08);
  const rhStick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.18, 16),
    new THREE.MeshStandardMaterial({ color: 0xc94a3d, roughness: 0.38 })
  );
  rhStick.position.y = 0.09;
  rhStick.castShadow = true;
  redHandle.add(rhStick);

  handlesGroup.add(greenHandle, redHandle);
  gameBoard.add(handlesGroup);
  root.add(gameBoard);

  // Figure 1: Upright Drift-Diffusion Model (DDM) Visual Board behind the table
  const ddmCanvas = document.createElement("canvas");
  ddmCanvas.width = 512;
  ddmCanvas.height = 300;
  const ddmCtx = ddmCanvas.getContext("2d");
  drawDdmCanvas(ddmCtx, "AI", 1);
  const ddmTex = new THREE.CanvasTexture(ddmCanvas);
  ddmTex.colorSpace = THREE.SRGBColorSpace;

  const ddmBoard = new THREE.Group();
  ddmBoard.position.set(0, 1.06, -0.34);
  const ddmFrame = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.5, 0.022), materials.walnut);
  const ddmScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.46),
    new THREE.MeshBasicMaterial({ map: ddmTex })
  );
  ddmScreen.position.z = 0.013;
  ddmBoard.add(ddmFrame, ddmScreen);
  root.add(ddmBoard);

  let cond = "AI";
  let stepIndex = 0;
  let animStart = -1;

  function populateTrays() {
    leftCandies.clear();
    rightCandies.clear();
    const actorCount = cond === "AI" ? 4 : 1;
    const recipCount = cond === "AI" ? 1 : 4;
    for (let i = 0; i < actorCount; i += 1) {
      const c = makeCandy(0x7c4f2b, 0.015);
      c.position.set(((i % 2) - 0.5) * 0.032, 0.016, (Math.floor(i / 2) - 0.5) * 0.032);
      leftCandies.add(c);
    }
    for (let i = 0; i < recipCount; i += 1) {
      const c = makeCandy(0x7c4f2b, 0.015);
      c.position.set(((i % 2) - 0.5) * 0.032, 0.016, (Math.floor(i / 2) - 0.5) * 0.032);
      rightCandies.add(c);
    }
  }
  populateTrays();

  inspectables.push(
    tagInspectable(
      handlesGroup,
      "accept-reject-handles",
      "Green (Accept) & Red (Reject) Upright Levers (Figure 2)",
      "Pulling the Green handle tilts the trays outward into the Actor's yellow bowl and Recipient's blue bowl. Pulling the Red handle dumps all candies into the center red discard bowl so neither child gets any.",
      [-0.52, 1.38, 1.15],
      [-0.32, 0.72, 0.08],
      function (nowSec) { animStart = nowSec; }
    ),
    tagInspectable(
      ddmBoard,
      "ddm-board",
      "Drift-Diffusion Model (DDM) Parameters (Figure 1)",
      "Decomposes choices and reaction times across 7 societies into non-decision time (t), starting bias (z), boundary separation (a), and drift rate (v). Cultural differences in fairness were driven primarily by drift rate (v).",
      [0, 1.32, 1.08],
      [0, 1.04, -0.34]
    ),
    tagInspectable(
      gameBoard,
      "seesaw-bowls",
      "Pivoting Seesaw Trays & Three Outcome Bowls",
      "Displays 4–1 Advantageous Inequity (4 for Actor, 1 for Recipient) or 1–4 Disadvantageous Inequity across face-to-face peers in Canada, India, Mexico, Peru, Senegal, Uganda, and the USA.",
      [0.12, 1.48, 1.25],
      [0, 0.68, 0.08]
    )
  );

  const steps = [
    {
      short: "1. Apparatus",
      title: "Inequity Game seesaw trays & three bowls (Figure 2)",
      badge: "7 societies · Ages 4–15 · N = 808 actors",
      body: "Two peers sit face-to-face across the wooden platform: the Actor (left, yellow bowl) controls the upright Green and Red handles, while the Recipient sits opposite (right, blue bowl), with a red discard bowl in the center.",
      why: "Face-to-face seating makes social comparison salient while mechanical levers let even 4-year-olds enact or reject allocations cleanly.",
      camera: { pos: [1.25, 2.7, 1.65], look: [0, 0.78, 0] }
    },
    {
      short: "2. DI vs. AI",
      title: "Advantageous (4–1) vs. Disadvantageous (1–4) offers",
      badge: "Toggle 4–1 AI vs. 1–4 DI above",
      body: "In Disadvantageous Inequity (1–4 DI), rejecting prevents a peer from getting more. In Advantageous Inequity (4–1 AI), rejecting requires sacrificing 4 candies so the peer does not receive an unfair 1.",
      why: "Contrasting DI and AI separates self-protective envy/fairness from costly, other-regarding fairness norms across cultures.",
      camera: { pos: [1.35, 2.6, 1.45], look: [0, 0.72, 0.04] }
    },
    {
      short: "3. DDM & Lever Pull",
      title: "Evidence accumulation (v) & lever decision (Figure 1)",
      badge: "Drift rate (v) drives cultural variation",
      body: "Click 'Pull lever & trace DDM' to watch evidence accumulate past non-decision time (t) along drift slope (v) until reaching the Reject boundary—triggering the Red handle pull and dumping candies into the center red bowl.",
      why: "Reaction-time DDM modeling shows culture shapes immediate evaluative valuation (v) rather than merely motor caution (a).",
      camera: { pos: [1.15, 2.7, 1.55], look: [0, 0.86, -0.06] },
      autoPlay: true
    }
  ];

  function resetPose() {
    leftArmPivot.rotation.z = 0;
    rightArmPivot.rotation.z = 0;
    redHandle.rotation.z = 0;
    greenHandle.rotation.z = 0;
    populateTrays();
    drawDdmCanvas(ddmCtx, cond, 1);
    ddmTex.needsUpdate = true;
  }

  return {
    id: "inequity-aversion",
    tabTag: "Amir et al. (2023 · JEP:G)",
    tabName: "Inequity Game",
    eyebrow: "Tasks · Amir, Melnikoff, Warneken, … & McAuliffe (2023)",
    studyTitle: "Computational Signatures of Inequity Aversion in Children Across Seven Societies",
    studyHref: "../studies/inequity-aversion/",
    dataHref: "../studies/inequity-aversion/data/",
    paperHref: "../studies/inequity-aversion/files/Amir-et-al-2023-inequity-aversion.pdf",
    condLabel: "Inequity allocation",
    conditions: [
      { value: "AI", label: "Advantageous (4–1 AI)" },
      { value: "DI", label: "Disadvantageous (1–4 DI)" }
    ],
    defaultCondition: "AI",
    playLabel: "Pull lever & trace DDM",
    clickTip: "Click the Green/Red handles, seesaw bowls, or DDM board to inspect",
    steps: steps,
    root: root,
    inspectables: inspectables,
    setCondition: function (val, nowSec) {
      cond = val;
      resetPose();
      animStart = nowSec;
    },
    setStep: function (idx, nowSec) {
      stepIndex = idx;
      animStart = -1;
      resetPose();
      if (steps[idx].autoPlay) animStart = nowSec;
    },
    playAction: function (nowSec) {
      animStart = nowSec;
    },
    resetAction: function () {
      animStart = -1;
      resetPose();
    },
    update: function (t) {
      if (animStart >= 0) {
        const e = t - animStart;
        if (e <= 4.4) {
          const ddmP = Math.min(1, e / 2.2);
          drawDdmCanvas(ddmCtx, cond, ddmP);
          ddmTex.needsUpdate = true;
          if (e >= 2.1) {
            const pullP = Math.min(1, (e - 2.1) / 0.8);
            redHandle.rotation.z = pullP * 0.42;
            actorChild.userData.rightArm.rotation.x = -Math.sin(pullP * Math.PI) * 0.42;
            // Tilt seesaw arms inward so candies dump into center Red discard bowl!
            leftArmPivot.rotation.z = -pullP * 0.34;
            rightArmPivot.rotation.z = pullP * 0.34;
          }
        } else {
          animStart = -1;
          resetPose();
        }
      }
    }
  };
}
