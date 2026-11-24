import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const steps = [
  {
    short: "1. Apparatus",
    title: "Setup & apparatus",
    badge: "Same-aged peers · 2 coins per child",
    body: "Same-aged 2- or 3-year-olds sit around a square table—across from one another in dyads, or on three sides in triads. A wooden box is velcroed to the center with a clear glass lid showing two reward coins per child, and a music box stands four feet away.",
    why: "Pairing same-aged peers isolates peer coordination without adult scaffolding. Velcroing the box keeps children from twisting it to peek, while the clear glass lid and nearby music box make the shared payoff immediately motivating.",
    camera: { pos: [0.25, 4.35, 5.15], look: [0.1, 0.85, -0.05] },
    mode: "color",
    boxVisible: true,
    keysAttached: false,
    bubbles: false,
    highlight: "box"
  },
  {
    short: "2. Training",
    title: "Individual training with adults",
    badge: "Matched to criterion before peer trials",
    body: "Before peers ever sit together, each child is trained individually with adult experimenters: dropping coins into the music box, matching red and blue magnets to criterion (two consecutive turns), and unlocking the box three times with adult scaffolding.",
    why: "Training every child to criterion guarantees that any difficulty during testing comes from coordinating decisions with peers—not from misunderstanding the matching rule or lacking basic words or gestures.",
    camera: { pos: [-2.15, 2.55, 3.05], look: [-0.35, 1.0, -0.15] },
    mode: "color",
    boxVisible: true,
    keysAttached: false,
    bubbles: false,
    highlight: "west"
  },
  {
    short: "3. Warm-up",
    title: "Group practice warm-up",
    badge: "10 seconds before the box arrives",
    body: "All partners sit together with their red and blue magnetic keys on the table—but no box yet. The experimenter says, “Pick your color… Remember, you all need to pick the same color,” and waits 10 seconds before placing the box down.",
    why: "Holding the box back for 10 seconds gives peers a dedicated window to communicate and agree on a color before anyone can rush to stick a magnet on the box.",
    camera: { pos: [0.15, 4.1, 4.75], look: [0, 0.85, 0] },
    mode: "color",
    boxVisible: false,
    keysAttached: false,
    bubbles: false,
    highlight: "keys"
  },
  {
    short: "4. Test trials",
    title: "Test trials 1–3: hidden magnetic keys",
    badge: "Magnets stick to each child’s side",
    body: "Across three 70-second test trials, the box starts on the table. Each child sticks one magnet onto their own vertical side of the box, where partners cannot see it from their seats. Standardized prompts occur every 10 seconds while experimenters stand back.",
    why: "Because the box body blocks sightlines to partners’ chosen magnets, reliable coordination requires talking, pointing, or walking around to check—creating a true pure coordination game.",
    camera: { pos: [1.55, 2.5, 2.75], look: [0, 0.9, 0] },
    mode: "color",
    boxVisible: true,
    keysAttached: true,
    bubbles: false,
    highlight: "attached"
  },
  {
    short: "5. Strategies",
    title: "Cooperative communication vs. solo habits",
    badge: "Peer key talk predicts success",
    body: "Two-year-olds mostly used individualistic tactics (repeating their first rewarded color or trial and error), which work fairly well in dyads (83.3%) but fail in triads (46.7%). Three-year-olds communicated about a specific key 2.5× as often and reached 90.0% in triads.",
    why: "Adding a third partner sharply lowers the odds of matching by chance or habit. By 3.17 years of age, peer-directed communication lets triads coordinate decisions as reliably as dyads.",
    camera: { pos: [0.1, 3.85, 4.55], look: [0, 1.05, -0.05] },
    mode: "color",
    boxVisible: true,
    keysAttached: true,
    bubbles: true,
    highlight: "comm"
  },
  {
    short: "6. Generalization",
    title: "Trial 4: domain generalization (pig & cow)",
    badge: "10/10 everywhere except 2-year-old triads (1/10)",
    body: "On the final trial, red and blue magnets are swapped for same-shaped circular magnets showing a pig and a cow: “Now, instead of red or blue, you have pig and cow,” with no further instruction.",
    why: "Swapping colors for animals removes any habit of repeating a previously rewarded color. Every 3-year-old group and 2-year-old dyad succeeded (10/10), whereas only 1 of 10 two-year-old triads did.",
    camera: { pos: [0.2, 3.65, 4.15], look: [0, 0.88, 0.05] },
    mode: "animal",
    boxVisible: true,
    keysAttached: false,
    bubbles: false,
    highlight: "animals"
  }
];

const seatSpecs = {
  west: {
    pos: [-1.42, 0, 0],
    rot: Math.PI / 2,
    shirt: 0x4f7f60,
    pants: 0x3b4a59,
    skin: 0xeac09e,
    hair: 0x36261d,
    hairStyle: "parted",
    boxAttach: [-0.325, 0.9, 0],
    boxRot: [0, 0, Math.PI / 2],
    bubbleText: "“Blue!”"
  },
  north: {
    pos: [0, 0, -1.42],
    rot: 0,
    shirt: 0xd98a3c,
    pants: 0x4a5568,
    skin: 0xf2ccb0,
    hair: 0x8d6239,
    hairStyle: "bangs",
    boxAttach: [0, 0.9, -0.235],
    boxRot: [Math.PI / 2, 0, 0],
    bubbleText: "“I picked blue”"
  },
  east: {
    pos: [1.42, 0, 0],
    rot: -Math.PI / 2,
    shirt: 0x6b7fd7,
    pants: 0x3d4652,
    skin: 0xd9a17c,
    hair: 0x241a15,
    hairStyle: "curls",
    boxAttach: [0.325, 0.9, 0],
    boxRot: [0, 0, -Math.PI / 2],
    bubbleText: "“Same color!”"
  }
};

const stage = document.querySelector("[data-stage]");
const badge = document.querySelector("[data-badge]");
const kicker = document.querySelector("[data-kicker]");
const title = document.querySelector("[data-title]");
const body = document.querySelector("[data-body]");
const why = document.querySelector("[data-why]");
const prev = document.querySelector("[data-prev]");
const next = document.querySelector("[data-next]");
const stepsNav = document.querySelector("[data-steps]");
const sizeButtons = document.querySelectorAll("[data-size]");

const stepButtons = steps.map(function (item, idx) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "experience-step";
  btn.textContent = item.short;
  btn.addEventListener("click", function () {
    applyStep(idx);
  });
  stepsNav.appendChild(btn);
  return btn;
});

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.04;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.insertBefore(renderer.domElement, badge);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4efe6);
scene.fog = new THREE.Fog(0xf4efe6, 11, 20);

const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 40);

const hemi = new THREE.HemisphereLight(0xfffaf0, 0xc9bca8, 1.05);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.45);
keyLight.position.set(3.8, 6.8, 4.4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 18;
keyLight.shadow.camera.left = -4.5;
keyLight.shadow.camera.right = 4.5;
keyLight.shadow.camera.top = 4.5;
keyLight.shadow.camera.bottom = -4.5;
keyLight.shadow.bias = -0.0005;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xe6eef8, 0.45);
fillLight.position.set(-4, 3.5, -2.5);
scene.add(fillLight);

function makeWoodTexture(baseHex, grainHex) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = grainHex;
  ctx.globalAlpha = 0.14;
  for (let i = 0; i < 48; i += 1) {
    ctx.lineWidth = 1 + (i % 3);
    ctx.beginPath();
    const y = (i / 48) * 256;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(85, y + Math.sin(i) * 4, 170, y - Math.cos(i) * 4, 256, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

const floorMat = new THREE.MeshStandardMaterial({
  map: makeWoodTexture("#eadfce", "#cbb89d"),
  roughness: 0.85
});
floorMat.map.repeat.set(6, 6);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const rug = new THREE.Mesh(
  new THREE.CylinderGeometry(2.55, 2.55, 0.014, 64),
  new THREE.MeshStandardMaterial({ color: 0xdfe9e1, roughness: 0.95 })
);
rug.position.y = 0.007;
rug.receiveShadow = true;
scene.add(rug);

const rugRing = new THREE.Mesh(
  new THREE.RingGeometry(2.38, 2.53, 64),
  new THREE.MeshStandardMaterial({ color: 0xb7cdbd, roughness: 0.95, side: THREE.DoubleSide })
);
rugRing.rotation.x = -Math.PI / 2;
rugRing.position.y = 0.015;
scene.add(rugRing);

const mapleMat = new THREE.MeshStandardMaterial({
  map: makeWoodTexture("#e3cfa9", "#b9996b"),
  roughness: 0.62
});
const walnutMat = new THREE.MeshStandardMaterial({
  map: makeWoodTexture("#7a5837", "#533920"),
  roughness: 0.58
});
const chairWoodMat = new THREE.MeshStandardMaterial({
  map: makeWoodTexture("#a88256", "#7d5c37"),
  roughness: 0.65
});

const table = new THREE.Group();
const tabletop = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.075, 2.05), mapleMat);
tabletop.position.y = 0.75;
tabletop.castShadow = true;
tabletop.receiveShadow = true;
table.add(tabletop);

const trimMat = new THREE.MeshStandardMaterial({ color: 0xb79668, roughness: 0.6 });
[
  [0, 0.71, -0.96, 1.92, 0.06, 0.04],
  [0, 0.71, 0.96, 1.92, 0.06, 0.04],
  [-0.96, 0.71, 0, 0.04, 0.06, 1.92],
  [0.96, 0.71, 0, 0.04, 0.06, 1.92]
].forEach(function (apron) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(apron[3], apron[4], apron[5]), trimMat);
  m.position.set(apron[0], apron[1], apron[2]);
  m.castShadow = true;
  table.add(m);
});

[[-0.92, -0.92], [0.92, -0.92], [-0.92, 0.92], [0.92, 0.92]].forEach(function (c) {
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.034, 0.74, 16), chairWoodMat);
  leg.position.set(c[0], 0.37, c[1]);
  leg.castShadow = true;
  table.add(leg);
});
scene.add(table);

const velcroMat = new THREE.MeshStandardMaterial({ color: 0x33302c, roughness: 0.95 });
[-0.18, 0.18].forEach(function (vx) {
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.004, 0.32), velcroMat);
  strip.position.set(vx, 0.789, 0);
  scene.add(strip);
});

const box = new THREE.Group();
const boxFloor = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.025, 0.42),
  new THREE.MeshStandardMaterial({ color: 0x563d25, roughness: 0.75 })
);
boxFloor.position.y = 0.802;
boxFloor.receiveShadow = true;
box.add(boxFloor);

const felt = new THREE.Mesh(
  new THREE.PlaneGeometry(0.54, 0.36),
  new THREE.MeshStandardMaterial({ color: 0x3c5f48, roughness: 0.92 })
);
felt.rotation.x = -Math.PI / 2;
felt.position.y = 0.816;
felt.receiveShadow = true;
box.add(felt);

[
  [0, 0.9, -0.21, 0.64, 0.2, 0.035],
  [0, 0.9, 0.21, 0.64, 0.2, 0.035],
  [-0.305, 0.9, 0, 0.035, 0.2, 0.39],
  [0.305, 0.9, 0, 0.035, 0.2, 0.39]
].forEach(function (w) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w[3], w[4], w[5]), walnutMat);
  wall.position.set(w[0], w[1], w[2]);
  wall.castShadow = true;
  wall.receiveShadow = true;
  box.add(wall);
});

const glassLid = new THREE.Mesh(
  new THREE.BoxGeometry(0.58, 0.014, 0.39),
  new THREE.MeshPhysicalMaterial({
    color: 0xeef7fb,
    roughness: 0.06,
    metalness: 0.02,
    transparent: true,
    opacity: 0.28
  })
);
glassLid.position.y = 0.998;
box.add(glassLid);

const brassMat = new THREE.MeshStandardMaterial({ color: 0xd8ad48, roughness: 0.3, metalness: 0.75 });
const latch = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.045, 0.018), brassMat);
latch.position.set(0, 0.93, 0.232);
box.add(latch);

const coinGold = new THREE.MeshStandardMaterial({ color: 0xf1c75b, roughness: 0.28, metalness: 0.65 });
const coinRim = new THREE.MeshStandardMaterial({ color: 0xd7a536, roughness: 0.35, metalness: 0.7 });
const coinsGroup = new THREE.Group();
box.add(coinsGroup);

function layoutCoins(count) {
  coinsGroup.clear();
  const cols = count === 4 ? 2 : 3;
  for (let i = 0; i < count; i += 1) {
    const coin = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.018, 28), coinGold);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.006, 10, 28), coinRim);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.009;
    disc.castShadow = true;
    coin.add(disc, ring);
    const col = i % cols;
    const row = Math.floor(i / cols);
    coin.position.set((col - (cols - 1) / 2) * 0.145, 0.828, (row - 0.5) * 0.135);
    coinsGroup.add(coin);
  }
}

const boxKeySockets = {};
Object.keys(seatSpecs).forEach(function (id) {
  const spec = seatSpecs[id];
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.006, 20),
    new THREE.MeshStandardMaterial({ color: 0xb9bec4, roughness: 0.35, metalness: 0.65 })
  );
  plate.position.set(spec.boxAttach[0] * 0.99, spec.boxAttach[1], spec.boxAttach[2] * 0.99);
  plate.rotation.set(spec.boxRot[0], spec.boxRot[1], spec.boxRot[2]);
  box.add(plate);

  const attached = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.068, 0.026, 28),
    new THREE.MeshStandardMaterial({ color: 0x2f67b8, roughness: 0.35 })
  );
  attached.position.set(spec.boxAttach[0], spec.boxAttach[1], spec.boxAttach[2]);
  attached.rotation.set(spec.boxRot[0], spec.boxRot[1], spec.boxRot[2]);
  attached.castShadow = true;
  attached.visible = false;
  box.add(attached);
  boxKeySockets[id] = attached;
});

scene.add(box);

const musicStation = new THREE.Group();
musicStation.position.set(2.05, 0, -1.65);
musicStation.rotation.y = -0.45;
const standTop = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 28), mapleMat);
standTop.position.y = 0.52;
standTop.castShadow = true;
const standLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.52, 16), chairWoodMat);
standLeg.position.y = 0.26;
standLeg.castShadow = true;
const mBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.38, 0.28, 0.3),
  new THREE.MeshStandardMaterial({ color: 0xd96b38, roughness: 0.48 })
);
mBody.position.y = 0.68;
mBody.castShadow = true;
const mRoof = new THREE.Mesh(
  new THREE.CylinderGeometry(0.15, 0.19, 0.08, 4),
  new THREE.MeshStandardMaterial({ color: 0x2f6b4a, roughness: 0.55 })
);
mRoof.rotation.y = Math.PI / 4;
mRoof.position.y = 0.86;
const slot = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.015, 0.028), velcroMat);
slot.position.set(0, 0.825, 0.05);
const speaker = new THREE.Mesh(
  new THREE.CylinderGeometry(0.075, 0.075, 0.014, 24),
  brassMat
);
speaker.rotation.x = Math.PI / 2;
speaker.position.set(0, 0.67, 0.155);
musicStation.add(standTop, standLeg, mBody, mRoof, slot, speaker);
scene.add(musicStation);

function makeSpeechSprite(message) {
  const c = document.createElement("canvas");
  c.width = 320;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.strokeStyle = "#2f6b4a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(14, 12, 292, 82, 36);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(145, 94);
  ctx.lineTo(160, 116);
  ctx.lineTo(175, 94);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1c1a17";
  ctx.font = "700 30px 'Fira Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, 160, 54);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
  sprite.scale.set(0.82, 0.33, 1);
  return sprite;
}

function makeAnimalDisc(kind) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f9f5ec";
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d5cbb8";
  ctx.lineWidth = 8;
  ctx.stroke();

  if (kind === "pig") {
    ctx.fillStyle = "#f09cb0";
    ctx.beginPath();
    ctx.ellipse(76, 74, 24, 30, -0.45, 0, Math.PI * 2);
    ctx.ellipse(180, 74, 24, 30, 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(128, 134, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#df7993";
    ctx.beginPath();
    ctx.ellipse(128, 150, 30, 21, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4d2c35";
    ctx.beginPath();
    ctx.arc(117, 150, 4.5, 0, Math.PI * 2);
    ctx.arc(139, 150, 4.5, 0, Math.PI * 2);
    ctx.arc(103, 118, 6, 0, Math.PI * 2);
    ctx.arc(153, 118, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#3a2e28";
    ctx.beginPath();
    ctx.ellipse(66, 92, 24, 14, -0.35, 0, Math.PI * 2);
    ctx.ellipse(190, 92, 24, 14, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d9c39e";
    ctx.beginPath();
    ctx.ellipse(94, 70, 9, 20, -0.2, 0, Math.PI * 2);
    ctx.ellipse(162, 70, 9, 20, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(128, 132, 64, 58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a2e28";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = "#3a2e28";
    ctx.beginPath();
    ctx.ellipse(98, 112, 20, 16, -0.3, 0, Math.PI * 2);
    ctx.ellipse(162, 126, 15, 13, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2ccb8";
    ctx.beginPath();
    ctx.ellipse(128, 160, 40, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b211c";
    ctx.beginPath();
    ctx.arc(104, 124, 5.5, 0, Math.PI * 2);
    ctx.arc(152, 124, 5.5, 0, Math.PI * 2);
    ctx.arc(114, 160, 4.5, 0, Math.PI * 2);
    ctx.arc(142, 160, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const side = new THREE.MeshStandardMaterial({ color: 0xf4efe4, roughness: 0.4 });
  const top = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.4 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.026, 28), [side, top, side]);
  disc.castShadow = true;
  return disc;
}

function makeToddler(spec) {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: spec.skin, roughness: 0.52 });
  const blush = new THREE.MeshStandardMaterial({ color: 0xe79a8c, roughness: 0.65 });
  const shirt = new THREE.MeshStandardMaterial({ color: spec.shirt, roughness: 0.72 });
  const pants = new THREE.MeshStandardMaterial({ color: spec.pants, roughness: 0.8 });
  const hairMat = new THREE.MeshStandardMaterial({ color: spec.hair, roughness: 0.78 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.6 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x261c16, roughness: 0.2 });

  const hips = new THREE.Mesh(new THREE.SphereGeometry(0.21, 20, 16), pants);
  hips.scale.set(1.12, 0.68, 0.95);
  hips.position.set(0, 0.58, -0.02);
  hips.castShadow = true;

  [-1, 1].forEach(function (side) {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, 0.2, 6, 12), pants);
    thigh.rotation.x = Math.PI / 2.15;
    thigh.position.set(side * 0.115, 0.56, 0.14);
    thigh.castShadow = true;

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.19, 6, 12), skin);
    shin.position.set(side * 0.115, 0.37, 0.26);
    shin.rotation.x = 0.12;
    shin.castShadow = true;

    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.072, 16, 12), shoeMat);
    shoe.scale.set(0.92, 0.62, 1.38);
    shoe.position.set(side * 0.115, 0.23, 0.31);
    shoe.castShadow = true;

    group.add(thigh, shin, shoe);
  });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.24, 10, 20), shirt);
  torso.scale.set(1.08, 1, 0.84);
  torso.position.set(0, 0.84, 0);
  torso.rotation.x = 0.08;
  torso.castShadow = true;

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.105, 0.02, 10, 24),
    new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.75 })
  );
  collar.rotation.x = Math.PI / 2 + 0.08;
  collar.position.set(0, 1.05, 0.02);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.082, 0.08, 16), skin);
  neck.position.set(0, 1.1, 0.025);

  const head = new THREE.Group();
  head.position.set(0, 1.33, 0.045);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.225, 28, 24), skin);
  skull.scale.set(0.98, 1.04, 0.96);
  skull.castShadow = true;
  head.add(skull);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.233, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hairCap.position.set(0, 0.02, -0.015);
  hairCap.rotation.x = -0.18;
  hairCap.castShadow = true;
  head.add(hairCap);

  if (spec.hairStyle === "curls") {
    [[-0.17, 0.1, 0.04], [0.17, 0.1, 0.04], [-0.12, 0.18, 0.1], [0.12, 0.18, 0.1], [0, 0.2, 0.12]].forEach(function (p) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 12), hairMat);
      puff.position.set(p[0], p[1], p[2]);
      head.add(puff);
    });
  } else {
    const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 12), hairMat);
    fringe.scale.set(1.25, 0.42, 0.55);
    fringe.position.set(spec.hairStyle === "parted" ? 0.03 : 0, 0.14, 0.16);
    head.add(fringe);
  }

  [-1, 1].forEach(function (side) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), skin);
    ear.scale.set(0.55, 0.9, 0.75);
    ear.position.set(side * 0.215, -0.01, 0);

    const white = new THREE.Mesh(new THREE.SphereGeometry(0.033, 14, 12), eyeWhite);
    white.scale.set(1, 1.08, 0.6);
    white.position.set(side * 0.078, 0.015, 0.198);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 10), irisMat);
    pupil.position.set(side * 0.076, 0.012, 0.214);

    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.042, 4, 8), hairMat);
    brow.rotation.z = Math.PI / 2 - side * 0.12;
    brow.position.set(side * 0.078, 0.068, 0.205);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 10), blush);
    cheek.scale.set(1.15, 0.7, 0.4);
    cheek.position.set(side * 0.125, -0.045, 0.185);

    head.add(ear, white, pupil, brow, cheek);
  });

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 10), skin);
  nose.scale.set(1, 0.85, 0.9);
  nose.position.set(0, -0.02, 0.22);

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.009, 8, 20, Math.PI), irisMat);
  smile.position.set(0, -0.068, 0.2);
  smile.rotation.z = Math.PI;
  smile.rotation.x = 0.2;
  head.add(nose, smile);

  function makeArm(side) {
    const arm = new THREE.Group();
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.1, 6, 12), shirt);
    sleeve.position.set(side * 0.245, 0.97, 0.04);
    sleeve.rotation.z = side * 0.42;
    sleeve.rotation.x = 0.35;
    sleeve.castShadow = true;

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.21, 6, 12), skin);
    forearm.position.set(side * 0.26, 0.84, 0.23);
    forearm.rotation.x = Math.PI / 2.45;
    forearm.rotation.z = -side * 0.18;
    forearm.castShadow = true;

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 12), skin);
    hand.scale.set(1.05, 0.58, 1.18);
    hand.position.set(side * 0.22, 0.805, 0.39);
    hand.castShadow = true;

    arm.add(sleeve, forearm, hand);
    return arm;
  }

  group.add(hips, torso, collar, neck, head, makeArm(-1), makeArm(1));
  group.userData.head = head;
  return group;
}

function makeChair() {
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.05, 0.52), chairWoodMat);
  seat.position.set(0, 0.47, -0.04);
  seat.castShadow = true;
  seat.receiveShadow = true;
  chair.add(seat);

  const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.14, 0.045), chairWoodMat);
  topRail.position.set(0, 0.98, -0.28);
  topRail.castShadow = true;
  chair.add(topRail);

  [-0.18, 0, 0.18].forEach(function (sx) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.03), chairWoodMat);
    slat.position.set(sx, 0.72, -0.28);
    slat.castShadow = true;
    chair.add(slat);
  });

  [[-0.25, -0.27], [0.25, -0.27], [-0.25, 0.18], [0.25, 0.18]].forEach(function (c) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.022, 0.47, 12), chairWoodMat);
    leg.position.set(c[0], 0.235, c[1]);
    leg.castShadow = true;
    chair.add(leg);
  });
  return chair;
}

const redKeyMat = new THREE.MeshStandardMaterial({ color: 0xd64535, roughness: 0.36 });
const blueKeyMat = new THREE.MeshStandardMaterial({ color: 0x2f67b8, roughness: 0.36 });

const people = {};

Object.keys(seatSpecs).forEach(function (id) {
  const spec = seatSpecs[id];
  const root = new THREE.Group();
  root.position.set(spec.pos[0], 0, spec.pos[2]);
  root.rotation.y = spec.rot;

  const chair = makeChair();
  chair.position.z = -0.14;

  const child = makeToddler(spec);
  child.position.z = -0.1;

  const redKey = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.026, 28), redKeyMat);
  const blueKey = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.026, 28), blueKeyMat);
  redKey.position.set(-0.13, 0.8, 0.72);
  blueKey.position.set(0.13, 0.8, 0.72);
  redKey.castShadow = true;
  blueKey.castShadow = true;

  const pigKey = makeAnimalDisc("pig");
  const cowKey = makeAnimalDisc("cow");
  pigKey.position.set(-0.13, 0.8, 0.72);
  cowKey.position.set(0.13, 0.8, 0.72);

  const bubble = makeSpeechSprite(spec.bubbleText);
  bubble.position.set(0, 1.78, 0.05);
  bubble.visible = false;

  root.add(chair, child, redKey, blueKey, pigKey, cowKey, bubble);
  scene.add(root);

  people[id] = {
    root: root,
    child: child,
    redKey: redKey,
    blueKey: blueKey,
    pigKey: pigKey,
    cowKey: cowKey,
    bubble: bubble
  };
});

const ringGeo = new THREE.RingGeometry(0.42, 0.47, 48);
const focusRing = new THREE.Mesh(
  ringGeo,
  new THREE.MeshBasicMaterial({ color: 0x2f6b4a, side: THREE.DoubleSide, transparent: true, opacity: 0.55 })
);
focusRing.rotation.x = -Math.PI / 2;
focusRing.position.y = 0.79;
scene.add(focusRing);

let size = "triad";
let step = 0;
let userAzimuth = 0;
let userPolar = 0;
let userZoom = 1;
let dragging = false;
let lastX = 0;
let lastY = 0;

const basePos = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const currentPos = new THREE.Vector3();
const currentLook = new THREE.Vector3();
const offsetVec = new THREE.Vector3();

function activeIds() {
  return size === "dyad" ? ["west", "east"] : ["west", "north", "east"];
}

function applyStep(index) {
  step = index;
  const current = steps[step];
  kicker.textContent = "Step " + (step + 1) + " of " + steps.length;
  title.textContent = current.title;
  body.textContent = current.body;
  why.textContent = current.why;
  badge.textContent = current.badge;
  prev.disabled = step === 0;
  next.disabled = step === steps.length - 1;

  stepButtons.forEach(function (btn, idx) {
    if (idx === step) {
      btn.setAttribute("aria-current", "step");
    } else {
      btn.removeAttribute("aria-current");
    }
  });

  userAzimuth = 0;
  userPolar = 0;
  userZoom = 1;

  basePos.set(current.camera.pos[0], current.camera.pos[1], current.camera.pos[2]);
  lookTarget.set(current.camera.look[0], current.camera.look[1], current.camera.look[2]);

  const ids = activeIds();
  layoutCoins(ids.length * 2);
  box.visible = current.boxVisible;

  Object.keys(people).forEach(function (id) {
    const p = people[id];
    const active = ids.indexOf(id) !== -1;
    p.root.visible = active;
    const isAnimal = current.mode === "animal";
    p.redKey.visible = active && !isAnimal;
    p.blueKey.visible = active && !isAnimal && !current.keysAttached;
    p.pigKey.visible = active && isAnimal;
    p.cowKey.visible = active && isAnimal;
    p.bubble.visible = active && current.bubbles;
    boxKeySockets[id].visible = active && current.boxVisible && current.keysAttached;
  });

  focusRing.visible = current.highlight === "box" || current.highlight === "attached";
}

function resize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
}

stage.addEventListener("pointerdown", function (event) {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener("pointermove", function (event) {
  if (!dragging) return;
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  lastX = event.clientX;
  lastY = event.clientY;
  userAzimuth -= dx * 0.006;
  userPolar = Math.max(-0.35, Math.min(0.45, userPolar + dy * 0.004));
});

stage.addEventListener("pointerup", function () {
  dragging = false;
});

stage.addEventListener("pointercancel", function () {
  dragging = false;
});

stage.addEventListener(
  "wheel",
  function (event) {
    event.preventDefault();
    userZoom = Math.max(0.68, Math.min(1.4, userZoom + event.deltaY * 0.0008));
  },
  { passive: false }
);

sizeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    size = button.getAttribute("data-size");
    sizeButtons.forEach(function (other) {
      other.setAttribute("aria-pressed", other === button ? "true" : "false");
    });
    applyStep(step);
  });
});

prev.addEventListener("click", function () {
  if (step > 0) applyStep(step - 1);
});

next.addEventListener("click", function () {
  if (step < steps.length - 1) applyStep(step + 1);
});

document.addEventListener("keydown", function (event) {
  if (event.target && /input|select|textarea/i.test(event.target.tagName)) return;
  if (event.key === "ArrowRight") next.click();
  if (event.key === "ArrowLeft") prev.click();
});

window.addEventListener("resize", resize);
resize();
applyStep(0);
currentPos.copy(basePos);
currentLook.copy(lookTarget);

function frame(now) {
  const t = now * 0.001;

  offsetVec.copy(basePos).sub(lookTarget);
  const spherical = new THREE.Spherical().setFromVector3(offsetVec);
  spherical.theta += userAzimuth;
  spherical.phi = Math.max(0.32, Math.min(1.38, spherical.phi + userPolar));
  spherical.radius *= userZoom;
  offsetVec.setFromSpherical(spherical).add(lookTarget);

  currentPos.lerp(offsetVec, 0.09);
  currentLook.lerp(lookTarget, 0.09);
  camera.position.copy(currentPos);
  camera.lookAt(currentLook);

  const current = steps[step];
  activeIds().forEach(function (id, idx) {
    const p = people[id];
    const head = p.child.userData.head;
    if (head) {
      head.rotation.y = Math.sin(t * 1.3 + idx * 1.7) * (current.bubbles ? 0.18 : 0.06);
      head.rotation.x = current.highlight === "keys" || current.highlight === "animals" ? 0.14 : 0.05;
    }
    const lift =
      current.highlight === "keys" || current.highlight === "animals"
        ? Math.max(0, Math.sin(t * 2.6 + idx)) * 0.025
        : 0;
    p.redKey.position.y = 0.8 + lift;
    p.blueKey.position.y = 0.8 + lift;
    p.pigKey.position.y = 0.8 + lift;
    p.cowKey.position.y = 0.8 + lift;
    p.bubble.position.y = 1.78 + Math.sin(t * 2.4 + idx) * 0.025;
  });

  if (focusRing.visible) {
    const pulse = 1 + Math.sin(t * 3) * 0.04;
    focusRing.scale.set(pulse, pulse, 1);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
