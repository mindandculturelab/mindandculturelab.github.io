import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const steps = [
  {
    title: "Seating",
    badge: "Around the table",
    body: "Two or three children sit around the table. Each child has their own red key and blue key.",
    why: "Group size is the comparison: dyads and triads. Children cannot see the color the others choose.",
    camera: { pos: [0.2, 4.6, 5.4], look: [0, 0.5, 0] },
    mode: "color",
    focus: "all"
  },
  {
    title: "The box",
    badge: "Same color opens it",
    body: "The box unlocks when every partner uses the same color key, red or blue. The tokens inside are the shared reward.",
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
  west: { pos: [-1.72, 0, 0.05], rot: Math.PI / 2, shirt: 0x6d8f72 },
  north: { pos: [0, 0, -1.72], rot: 0, shirt: 0xc4b7a6 },
  east: { pos: [1.72, 0, 0.05], rot: -Math.PI / 2, shirt: 0xd7d3cc }
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
stage.insertBefore(renderer.domElement, badge);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7f4ee);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
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
const crate = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.22, 0.42), woodDark);
crate.position.y = 0.89;
box.add(crate);
const rim = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.04, 0.46), new THREE.MeshStandardMaterial({ color: 0x6b4e32, roughness: 0.55 }));
rim.position.y = 1.0;
box.add(rim);
for (let i = 0; i < 6; i += 1) {
  const token = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 20), tokenMat);
  token.position.set((i % 3) * 0.16 - 0.16, 0.97, Math.floor(i / 3) * 0.14 - 0.07);
  box.add(token);
}
scene.add(box);

const people = {};
const screens = [];

function makeChild(shirt) {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xf0c7a8, roughness: 0.55 });
  const cloth = new THREE.MeshStandardMaterial({ color: shirt, roughness: 0.7 });
  const hair = new THREE.MeshStandardMaterial({ color: 0x3d2b22, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.26), cloth);
  body.position.y = 0.95;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 22, 16), skin);
  head.position.y = 1.28;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.175, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hair);
  cap.position.y = 1.33;
  const armGeo = new THREE.BoxGeometry(0.1, 0.1, 0.28);
  const left = new THREE.Mesh(armGeo, skin);
  const right = new THREE.Mesh(armGeo, skin);
  left.position.set(-0.24, 0.9, 0.12);
  right.position.set(0.24, 0.9, 0.12);
  group.add(body, head, cap, left, right);
  return group;
}

function makeAnimal(kind) {
  const group = new THREE.Group();
  if (kind === "pig") {
    const pink = new THREE.MeshStandardMaterial({ color: 0xf3a7b5, roughness: 0.45 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), pink);
    body.scale.set(1.15, 0.85, 0.8);
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 10), pink);
    snout.position.set(0.09, -0.01, 0);
    group.add(body, snout);
  } else {
    const hide = new THREE.MeshStandardMaterial({ color: 0xf7f3ea, roughness: 0.55 });
    const spot = new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.1), hide);
    const patch = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), spot);
    patch.position.set(0.02, 0.04, 0.03);
    group.add(body, patch);
  }
  group.position.y = 0.86;
  return group;
}

function addSeat(id, spec) {
  const root = new THREE.Group();
  root.position.set(spec.pos[0], 0, spec.pos[2]);
  root.rotation.y = spec.rot;
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.42), woodDark);
  seat.position.set(0, 0.48, -0.28);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.06), woodDark);
  back.position.set(0, 0.78, -0.48);
  chair.add(seat, back);
  const child = makeChild(spec.shirt);
  child.position.z = -0.22;
  const keys = new THREE.Group();
  const red = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 20), redMat);
  const blue = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 20), blueMat);
  red.position.set(-0.12, 0.8, 0.95);
  blue.position.set(0.12, 0.8, 0.95);
  keys.add(red, blue);
  const pig = makeAnimal("pig");
  const cow = makeAnimal("cow");
  pig.position.set(-0.12, 0.86, 0.95);
  cow.position.set(0.12, 0.86, 0.95);
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
  box.position.y = current.focus === "box" ? 0.06 : 0;
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
      person.pig.position.y = 0.9 + lift;
      person.cow.position.y = 0.9 + lift;
    });
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
