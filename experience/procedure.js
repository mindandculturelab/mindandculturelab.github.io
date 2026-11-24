import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const steps = [
  {
    title: "Seating",
    badge: "Around the table",
    body: "Children are paired with other children the same age. A dyad is two partners, and a triad is three. Each child has a red key and a blue key.",
    why: "The comparison is dyads versus triads within an age, so every partner is the same age. Children cannot see the color the others choose.",
    camera: { pos: [0.15, 4.9, 5.5], look: [0, 0.75, 0] },
    mode: "color",
    focus: "all"
  },
  {
    title: "The box",
    badge: "Same color opens it",
    body: "The box has a clear top. Inside are two coins for each child. It unlocks when every partner uses the same color key, red or blue.",
    why: "A shared payoff only if they match, so success requires coordinating a decision.",
    camera: { pos: [1.5, 2.35, 2.15], look: [0, 0.45, 0] },
    mode: "color",
    focus: "box"
  },
  {
    title: "Demonstration",
    badge: "One child is shown the rule",
    body: "Each child is shown how the box works before the group tries it together.",
    why: "Everyone understands the rule before the measured trials.",
    camera: { pos: [-2.4, 2.15, 2.3], look: [-0.7, 0.7, 0.1] },
    mode: "color",
    focus: "demo"
  },
  {
    title: "Practice",
    badge: "One practice trial",
    body: "The group practices once, choosing keys together.",
    why: "One practice trial, then the test trials.",
    camera: { pos: [0.1, 3.8, 4.6], look: [0, 0.55, 0] },
    mode: "color",
    focus: "keys"
  },
  {
    title: "Test trials",
    badge: "Three test trials",
    body: "There are three test trials. Screens sit in front of each pair of keys so a child cannot see the color the others choose.",
    why: "These are the trials used to compare ages and group sizes.",
    camera: { pos: [0.4, 4.3, 4.2], look: [0, 0.4, 0] },
    mode: "color",
    focus: "hidden"
  },
  {
    title: "Generalization",
    badge: "Pig or cow",
    body: "The last trial changes the match from a color to a pig or a cow. No further instruction is given.",
    why: "This checks whether children carry the matching idea to a new pair of options.",
    camera: { pos: [0.2, 4.4, 4.8], look: [0, 0.45, 0] },
    mode: "animal",
    focus: "animals"
  }
];

const seats = {
  west: { pos: [-1.62, 0, 0.02], rot: Math.PI / 2, shirt: 0x6d8f72, hair: 0x3a2a22 },
  north: { pos: [0, 0, -1.62], rot: 0, shirt: 0xb7b3ac, hair: 0xc4a574 },
  east: { pos: [1.62, 0, 0.02], rot: -Math.PI / 2, shirt: 0xf3f0ea, hair: 0x3a2a22 }
};

const stage = document.querySelector("[data-stage]");
const badge = document.querySelector("[data-badge]");
const kicker = document.querySelector("[data-kicker]");
const title = document.querySelector("[data-title]");
const body = document.querySelector("[data-body]");
const why = document.querySelector("[data-why]");
const prev = document.querySelector("[data-prev]");
const next = document.querySelector("[data-next]");
const sizeButtons = document.querySelectorAll("[data-size]");

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
stage.insertBefore(renderer.domElement, badge);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7f4ee);
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 40);
scene.add(new THREE.HemisphereLight(0xfff6ea, 0xc8bfb2, 1.15));
const sun = new THREE.DirectionalLight(0xffffff, 1.35);
sun.position.set(3, 6, 4);
scene.add(sun);

const wood = new THREE.MeshStandardMaterial({ color: 0xd9c7a6, roughness: 0.72 });
const woodDark = new THREE.MeshStandardMaterial({ color: 0x8d6b45, roughness: 0.6 });
const tokenMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.35, metalness: 0.08 });
const redMat = new THREE.MeshStandardMaterial({ color: 0xd24b3a, roughness: 0.4 });
const blueMat = new THREE.MeshStandardMaterial({ color: 0x3c6fbf, roughness: 0.4 });
const screenMat = new THREE.MeshStandardMaterial({ color: 0xe7e1d6, roughness: 0.8, transparent: true, opacity: 0.92 });

const table = new THREE.Group();
const top = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.08, 2.35), wood);
top.position.y = 0.74;
table.add(top);
[[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (corner) {
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.74, 0.08), woodDark);
  leg.position.set(corner[0] * 1.02, 0.37, corner[1] * 1.02);
  table.add(leg);
});
scene.add(table);

const box = new THREE.Group();
const wallMat = new THREE.MeshStandardMaterial({ color: 0x6b4e32, roughness: 0.55 });
const floor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.03, 0.46), wallMat);
floor.position.y = 0.8;
box.add(floor);
[
  [0, 0.9, -0.22, 0.66, 0.18, 0.03],
  [0, 0.9, 0.22, 0.66, 0.18, 0.03],
  [-0.315, 0.9, 0, 0.03, 0.18, 0.42],
  [0.315, 0.9, 0, 0.03, 0.18, 0.42]
].forEach(function (wall) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(wall[3], wall[4], wall[5]), wallMat);
  mesh.position.set(wall[0], wall[1], wall[2]);
  box.add(mesh);
});
const glass = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.015, 0.42),
  new THREE.MeshPhysicalMaterial({
    color: 0xd7eef8,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.92,
    thickness: 0.08,
    transparent: true,
    opacity: 0.22
  })
);
glass.position.y = 1.0;
box.add(glass);
const coins = new THREE.Group();
box.add(coins);
scene.add(box);

function layoutCoins(count) {
  coins.clear();
  const cols = Math.ceil(count / 2);
  for (let i = 0; i < count; i += 1) {
    const token = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.02, 24), tokenMat);
    const col = i % cols;
    const row = Math.floor(i / cols);
    token.position.set((col - (cols - 1) / 2) * 0.14, 0.86, (row - 0.5) * 0.14);
    coins.add(token);
  }
}

const people = {};
const screens = [];

function makeChild(shirt, hairColor) {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xf0c2a0, roughness: 0.48 });
  const cloth = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.72 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2b211c, roughness: 0.4 });
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 18), cloth);
  torso.scale.set(1.2, 0.78, 0.7);
  torso.position.set(0, 0.9, 0.02);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.08, 16), skin);
  neck.position.set(0, 1.12, 0.04);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 28, 22), skin);
  head.scale.set(1, 1.05, 0.95);
  head.position.set(0, 1.4, 0.06);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
  hair.position.set(0, 1.44, -0.02);
  const earGeo = new THREE.SphereGeometry(0.05, 12, 10);
  const earL = new THREE.Mesh(earGeo, skin);
  const earR = new THREE.Mesh(earGeo, skin);
  earL.position.set(-0.24, 1.38, 0.04);
  earR.position.set(0.24, 1.38, 0.04);
  const eyeGeo = new THREE.SphereGeometry(0.028, 12, 10);
  const eyeL = new THREE.Mesh(eyeGeo, dark);
  const eyeR = new THREE.Mesh(eyeGeo, dark);
  eyeL.position.set(-0.09, 1.42, 0.31);
  eyeR.position.set(0.09, 1.42, 0.31);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.012, 8, 16, Math.PI), dark);
  smile.position.set(0, 1.3, 0.29);
  smile.rotation.z = Math.PI;
  smile.rotation.x = 0.3;
  function arm(side) {
    const limb = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.18, 4, 8), skin);
    upper.position.set(side * 0.38, 0.96, 0.1);
    upper.rotation.z = side * 0.35;
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.2, 4, 8), skin);
    fore.position.set(side * 0.42, 0.82, 0.34);
    fore.rotation.x = Math.PI / 2.4;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), skin);
    hand.scale.set(1.2, 0.5, 0.9);
    hand.position.set(side * 0.36, 0.8, 0.55);
    limb.add(upper, fore, hand);
    return limb;
  }
  group.add(torso, neck, head, hair, earL, earR, eyeL, eyeR, smile, arm(-1), arm(1));
  return group;
}

function animalDisc(kind) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f6f1e8";
  ctx.beginPath();
  ctx.arc(128, 128, 124, 0, Math.PI * 2);
  ctx.fill();
  if (kind === "pig") {
    ctx.fillStyle = "#f3a0b0";
    ctx.beginPath();
    ctx.ellipse(128, 132, 70, 62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(70, 78, 22, 28, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(186, 78, 22, 28, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e07d92";
    ctx.beginPath();
    ctx.ellipse(128, 150, 28, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5c3b42";
    ctx.beginPath();
    ctx.arc(118, 150, 4, 0, Math.PI * 2);
    ctx.arc(138, 150, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(104, 118, 5, 0, Math.PI * 2);
    ctx.arc(152, 118, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = "#f7f4ee";
    ctx.beginPath();
    ctx.ellipse(128, 140, 72, 58, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6b4a32";
    ctx.beginPath();
    ctx.ellipse(100, 130, 22, 16, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(156, 156, 18, 14, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3d2b22";
    ctx.beginPath();
    ctx.ellipse(96, 78, 10, 22, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(160, 78, 10, 22, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2b211c";
    ctx.beginPath();
    ctx.arc(108, 132, 5, 0, Math.PI * 2);
    ctx.arc(148, 132, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const side = new THREE.MeshStandardMaterial({ color: 0xf6f1e8, roughness: 0.45 });
  const top = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.45 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 24), [side, top, side]);
  disc.position.y = 0.8;
  return disc;
}

function addSeat(id, spec) {
  const root = new THREE.Group();
  root.position.set(spec.pos[0], 0, spec.pos[2]);
  root.rotation.y = spec.rot;
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.07, 0.58), woodDark);
  seat.position.set(0, 0.5, -0.24);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.07), woodDark);
  back.position.set(0, 0.96, -0.5);
  chair.add(seat, back);
  const child = makeChild(spec.shirt, spec.hair);
  child.position.z = -0.08;
  const keys = new THREE.Group();
  const red = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 20), redMat);
  const blue = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 20), blueMat);
  red.position.set(-0.14, 0.8, 0.92);
  blue.position.set(0.14, 0.8, 0.92);
  keys.add(red, blue);
  const pig = animalDisc("pig");
  const cow = animalDisc("cow");
  pig.position.set(-0.14, 0.8, 0.92);
  cow.position.set(0.14, 0.8, 0.92);
  pig.visible = false;
  cow.visible = false;
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.02), screenMat);
  screen.position.set(0, 0.92, 0.72);
  screen.visible = false;
  screens.push(screen);
  root.add(chair, child, keys, pig, cow, screen);
  scene.add(root);
  people[id] = { root: root, keys: keys, pig: pig, cow: cow, screen: screen, child: child };
}

Object.keys(seats).forEach(function (id) {
  addSeat(id, seats[id]);
});

let size = "triad";
let step = 0;
const camPos = new THREE.Vector3();
const camLook = new THREE.Vector3();
const lookTarget = new THREE.Vector3();

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
  camPos.set(current.camera.pos[0], current.camera.pos[1], current.camera.pos[2]);
  lookTarget.set(current.camera.look[0], current.camera.look[1], current.camera.look[2]);
  const ids = activeIds();
  Object.keys(people).forEach(function (id) {
    const person = people[id];
    const on = ids.indexOf(id) !== -1;
    person.root.visible = on;
    const animals = current.mode === "animal";
    person.keys.visible = on && !animals;
    person.pig.visible = on && animals;
    person.cow.visible = on && animals;
    person.screen.visible = on && current.focus === "hidden";
  });
  layoutCoins(ids.length * 2);
  box.position.y = current.focus === "box" ? 0.06 : 0;
  Object.keys(people).forEach(function (id) {
    people[id].keys.position.y = 0;
    people[id].pig.position.y = 0.8;
    people[id].cow.position.y = 0.8;
  });
}

function resize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
}

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
  if (step > 0) {
    applyStep(step - 1);
  }
});

next.addEventListener("click", function () {
  if (step < steps.length - 1) {
    applyStep(step + 1);
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    next.click();
  }
  if (event.key === "ArrowLeft") {
    prev.click();
  }
});

window.addEventListener("resize", resize);
resize();
applyStep(0);
camera.position.copy(camPos);
camLook.copy(lookTarget);

function frame() {
  camera.position.lerp(camPos, 0.08);
  camLook.lerp(lookTarget, 0.08);
  camera.lookAt(camLook);
  const pulse = 1 + Math.sin(performance.now() / 280) * 0.04;
  const current = steps[step];
  if (current.focus === "demo") {
    people.west.child.scale.setScalar(pulse);
  } else {
    people.west.child.scale.setScalar(1);
  }
  if (current.focus === "keys" || current.focus === "animals") {
    activeIds().forEach(function (id) {
      const person = people[id];
      const lift = Math.sin(performance.now() / 320 + person.root.position.x) * 0.03;
      person.keys.position.y = 0.04 + lift;
      person.pig.position.y = 0.84 + lift;
      person.cow.position.y = 0.84 + lift;
    });
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
