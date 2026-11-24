import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const stage = document.querySelector("[data-globe-stage]");
const badgeEl = document.querySelector("[data-globe-badge]");
const kickerEl = document.querySelector("[data-site-kicker]");
const titleEl = document.querySelector("[data-site-title]");
const regionEl = document.querySelector("[data-site-region]");
const bodyEl = document.querySelector("[data-site-body]");
const statEl = document.querySelector("[data-site-stat]");
const venuesEl = document.querySelector("[data-site-venues]");
const studiesEl = document.querySelector("[data-site-studies]");
const chipsHost = document.querySelector("[data-site-chips]");

const GLOBE_R = 1.55;
const PIN_BASE = 0.045;

function latLngToVec3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function makeEarthTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, "#dce8e2");
  g.addColorStop(0.35, "#c5d9ce");
  g.addColorStop(0.55, "#b7cfc0");
  g.addColorStop(0.78, "#c9b89a");
  g.addColorStop(1, "#e4d7c2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);

  // Soft continent blobs (stylized, not geographic)
  const land = [
    [180, 160, 90, 70],
    [280, 200, 110, 55],
    [420, 180, 70, 90],
    [520, 240, 140, 60],
    [700, 170, 100, 80],
    [820, 280, 90, 50],
    [160, 340, 80, 40],
    [600, 360, 120, 45]
  ];
  land.forEach(function (b) {
    ctx.fillStyle = "rgba(74, 118, 90, 0.55)";
    ctx.beginPath();
    ctx.ellipse(b[0], b[1], b[2], b[3], 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(40, 92, 63, 0.18)";
    ctx.beginPath();
    ctx.ellipse(b[0] + 8, b[1] + 6, b[2] * 0.7, b[3] * 0.65, 0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Latitude / longitude hairlines
  ctx.strokeStyle = "rgba(255, 252, 245, 0.22)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i += 1) {
    const y = (i / 8) * 512;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }
  for (let i = 1; i < 12; i += 1) {
    const x = (i / 12) * 1024;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.insertBefore(renderer.domElement, stage.firstChild);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xf5f2eb, 7.5, 14);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
camera.position.set(0, 0.35, 4.2);

scene.add(new THREE.AmbientLight(0xfff8ef, 0.72));
const key = new THREE.DirectionalLight(0xfff4e6, 1.15);
key.position.set(3.2, 2.4, 2.8);
scene.add(key);
const fill = new THREE.DirectionalLight(0xd6e4f0, 0.35);
fill.position.set(-2.8, 0.6, -1.8);
scene.add(fill);

const globeGroup = new THREE.Group();
scene.add(globeGroup);

const earthMat = new THREE.MeshStandardMaterial({
  map: makeEarthTexture(),
  roughness: 0.92,
  metalness: 0.04
});
const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 64, 48), earthMat);
globeGroup.add(earth);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(GLOBE_R * 1.045, 48, 32),
  new THREE.MeshBasicMaterial({
    color: 0x9fc2ab,
    transparent: true,
    opacity: 0.14,
    side: THREE.BackSide,
    depthWrite: false
  })
);
globeGroup.add(atmosphere);

const rim = new THREE.Mesh(
  new THREE.SphereGeometry(GLOBE_R * 1.02, 48, 32),
  new THREE.MeshBasicMaterial({
    color: 0xe8f2ec,
    transparent: true,
    opacity: 0.08,
    depthWrite: false
  })
);
globeGroup.add(rim);

const pinsRoot = new THREE.Group();
globeGroup.add(pinsRoot);

let sites = [];
let studiesById = {};
let pinEntries = [];
let selectedId = null;
const chipButtons = {};

let userAzimuth = 0.55;
let userPolar = 0.18;
let userZoom = 1;
let autoSpin = 0.08;
let dragging = false;
let downX = 0;
let downY = 0;
let lastX = 0;
let lastY = 0;
let movedDist = 0;

const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
const camOffset = new THREE.Vector3();
const lookAt = new THREE.Vector3(0, 0, 0);

function pinScaleForN(n) {
  const base = Math.sqrt(Math.max(n || 40, 20) / 120);
  return Math.min(1.55, Math.max(0.72, base));
}

function buildPin(site) {
  const g = new THREE.Group();
  const scale = pinScaleForN(site.sampleN);
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012 * scale, 0.018 * scale, 0.14 * scale, 10),
    new THREE.MeshStandardMaterial({ color: 0x285c3f, roughness: 0.55 })
  );
  stem.position.y = 0.07 * scale;
  g.add(stem);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(PIN_BASE * scale, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0x5aa276,
      emissive: 0x1e4730,
      emissiveIntensity: 0.25,
      roughness: 0.4
    })
  );
  head.position.y = 0.15 * scale;
  g.add(head);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.05 * scale, 0.08 * scale, 24),
    new THREE.MeshBasicMaterial({
      color: 0xd9842b,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.01;
  g.add(halo);

  const pos = latLngToVec3(site.lat, site.lng, GLOBE_R);
  g.position.copy(pos);
  g.lookAt(pos.clone().multiplyScalar(2));
  g.rotateX(Math.PI / 2);

  g.userData.siteId = site.id;
  g.userData.head = head;
  g.userData.halo = halo;
  g.userData.baseColor = 0x5aa276;
  return g;
}

function shortStudyName(study) {
  if (!study) return "";
  const n = study.name;
  if (n.length <= 64) return n;
  return n.slice(0, 61) + "…";
}

function selectSite(id, fromUser) {
  selectedId = id;
  const site = sites.find(function (s) {
    return s.id === id;
  });

  Object.keys(chipButtons).forEach(function (cid) {
    chipButtons[cid].setAttribute("aria-pressed", cid === id ? "true" : "false");
  });

  pinEntries.forEach(function (entry) {
    const on = entry.site.id === id;
    entry.pin.userData.head.material.color.setHex(on ? 0xd9842b : entry.pin.userData.baseColor);
    entry.pin.userData.head.material.emissiveIntensity = on ? 0.55 : 0.25;
    entry.pin.userData.halo.material.opacity = on ? 0.85 : 0;
    entry.pin.scale.setScalar(on ? 1.18 : 1);
  });

  if (!site) {
    kickerEl.textContent = "Select a site";
    titleEl.textContent = "Our testing & field sites";
    regionEl.textContent = "";
    bodyEl.textContent =
      "Pins mark communities and venues across the Americas, Africa, the Middle East, and South Asia. Sample sizes combine open datasets linked from each study page.";
    statEl.hidden = true;
    venuesEl.hidden = true;
    studiesEl.replaceChildren();
    return;
  }

  kickerEl.textContent = "Field site";
  titleEl.textContent = site.name;
  regionEl.textContent = site.region;
  bodyEl.textContent = site.blurb;

  let stat = "About " + site.sampleN.toLocaleString() + " participants in open datasets";
  if (site.sampleNote) stat += " · " + site.sampleNote;
  statEl.textContent = stat;
  statEl.hidden = false;

  if (site.venues && site.venues.length) {
    venuesEl.textContent = "Venues: " + site.venues.join(" · ");
    venuesEl.hidden = false;
  } else {
    venuesEl.hidden = true;
  }

  studiesEl.replaceChildren();
  const list = document.createElement("ul");
  list.className = "sites-study-list";
  (site.studyIds || []).forEach(function (sid) {
    const study = studiesById[sid];
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "../studies/" + sid + "/";
    link.textContent = shortStudyName(study) || sid;
    li.appendChild(link);
    if (study && (study.explorer || study.procedure)) {
      const extras = document.createElement("span");
      extras.className = "sites-study-links";
      if (study.explorer) {
        const d = document.createElement("a");
        d.href = "../studies/" + sid + "/" + study.explorer;
        d.textContent = "Data";
        extras.appendChild(d);
      }
      if (study.procedure) {
        const p = document.createElement("a");
        p.href = "../experience/?study=" + sid;
        p.textContent = "3D procedure";
        extras.appendChild(p);
      }
      li.appendChild(extras);
    }
    list.appendChild(li);
  });
  studiesEl.appendChild(list);

  if (fromUser) {
    autoSpin = 0;
    const target = latLngToVec3(site.lat, site.lng, 1);
    const sph = new THREE.Spherical().setFromVector3(target);
    userAzimuth = sph.theta;
    userPolar = Math.PI / 2 - sph.phi;
  }
}

function pickPin(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObjects(pinsRoot.children, true);
  for (let i = 0; i < hits.length; i += 1) {
    let cur = hits[i].object;
    while (cur) {
      if (cur.userData && cur.userData.siteId) return cur.userData.siteId;
      cur = cur.parent;
    }
  }
  return null;
}

stage.addEventListener("pointerdown", function (event) {
  dragging = true;
  autoSpin = 0;
  downX = event.clientX;
  downY = event.clientY;
  lastX = event.clientX;
  lastY = event.clientY;
  movedDist = 0;
  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener("pointermove", function (event) {
  if (!dragging) {
    stage.classList.toggle("is-hovering-object", Boolean(pickPin(event)));
    return;
  }
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  movedDist += Math.hypot(dx, dy);
  lastX = event.clientX;
  lastY = event.clientY;
  userAzimuth -= dx * 0.005;
  userPolar = Math.max(-0.85, Math.min(0.85, userPolar + dy * 0.004));
});

stage.addEventListener("pointerup", function (event) {
  if (!dragging) return;
  dragging = false;
  const shift = Math.hypot(event.clientX - downX, event.clientY - downY);
  if (movedDist < 7 && shift < 7) {
    const id = pickPin(event);
    if (id) selectSite(id, true);
  }
});

stage.addEventListener("pointercancel", function () {
  dragging = false;
});

stage.addEventListener(
  "wheel",
  function (event) {
    event.preventDefault();
    autoSpin = 0;
    userZoom = Math.max(0.72, Math.min(1.55, userZoom + event.deltaY * 0.0009));
  },
  { passive: false }
);

function resize() {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / Math.max(h, 1);
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
if (typeof ResizeObserver === "function") {
  new ResizeObserver(resize).observe(stage);
}

function frame(ms) {
  requestAnimationFrame(frame);
  const t = ms * 0.001;
  if (!dragging && autoSpin) {
    userAzimuth += autoSpin * 0.012;
  }

  const radius = 4.15 * userZoom;
  camOffset.setFromSphericalCoords(
    radius,
    Math.PI / 2 - userPolar,
    userAzimuth
  );
  camera.position.copy(camOffset);
  camera.lookAt(lookAt);

  atmosphere.rotation.y = t * 0.02;
  renderer.render(scene, camera);
}

Promise.all([
  fetch("../data/sites.json").then(function (r) {
    return r.json();
  }),
  fetch("../data/studies.json").then(function (r) {
    return r.json();
  })
])
  .then(function (pair) {
    sites = pair[0].sites || [];
    (pair[1].studies || []).forEach(function (s) {
      studiesById[s.id] = s;
    });

    badgeEl.textContent = sites.length + " field sites";

    sites.forEach(function (site) {
      const pin = buildPin(site);
      pinsRoot.add(pin);
      pinEntries.push({ site: site, pin: pin });

      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "site-chip";
      chip.setAttribute("role", "listitem");
      chip.setAttribute("aria-pressed", "false");
      chip.textContent = site.name;
      chip.addEventListener("click", function () {
        selectSite(site.id, true);
      });
      chipsHost.appendChild(chip);
      chipButtons[site.id] = chip;
    });

    const startId = new URLSearchParams(window.location.search).get("site");
    if (startId && sites.some(function (s) {
      return s.id === startId;
    })) {
      selectSite(startId, true);
    } else {
      selectSite(null, false);
    }

    resize();
    requestAnimationFrame(frame);
  })
  .catch(function (err) {
    bodyEl.textContent = "Could not load field sites. " + String(err);
  });
