import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const stage = document.querySelector("[data-globe-stage]");
const badgeEl = document.querySelector("[data-globe-badge]");
const kickerEl = document.querySelector("[data-site-kicker]");
const titleEl = document.querySelector("[data-site-title]");
const regionEl = document.querySelector("[data-site-region]");
const bodyEl = document.querySelector("[data-site-body]");
const metaEl = document.querySelector("[data-site-meta]");
const statEl = document.querySelector("[data-site-stat]");
const venuesEl = document.querySelector("[data-site-venues]");
const studiesEl = document.querySelector("[data-site-studies]");
const chipsHost = document.querySelector("[data-site-chips]");

const GLOBE_R = 1.55;
const PIN_BASE = 0.045;
const EARTH_URL = "../assets/images/globe/earth-2k.jpg";

function latLngToVec3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Soft brand tint that keeps original coastline contrast.
 * Prior binary land/ocean recolor washed coasts and made pins look misplaced.
 */
function stylizeEarthTexture(image) {
  const c = document.createElement("canvas");
  c.width = image.width;
  c.height = image.height;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const luma = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const blueDom = b - Math.max(r, g);
    const isOcean = blueDom > 8 || (b > 110 && b > g + 15 && b > r + 20);
    const isIce = luma > 0.86 && Math.abs(r - g) < 24 && Math.abs(g - b) < 28;

    let tr;
    let tg;
    let tb;
    if (isIce) {
      // Warm ivory ice shelves
      tr = r * 0.35 + 242 * 0.65;
      tg = g * 0.35 + 236 * 0.65;
      tb = b * 0.35 + 224 * 0.65;
    } else if (isOcean) {
      // Warm stone water (no blue) — enough contrast against cream page bg
      const shade = 0.2 + luma * 0.35;
      tr = r * 0.12 + (186 * (1 - shade) + 168 * shade);
      tg = g * 0.12 + (180 * (1 - shade) + 172 * shade);
      tb = b * 0.06 + (162 * (1 - shade) + 152 * shade);
    } else {
      // Sage land with original terrain retained
      tr = r * 0.55 + 72 * 0.45;
      tg = g * 0.55 + 118 * 0.45;
      tb = b * 0.55 + 86 * 0.45;
    }
    d[i] = Math.round(tr);
    d[i + 1] = Math.round(tg);
    d[i + 2] = Math.round(tb);
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function loadEarthTexture() {
  return new Promise(function (resolve, reject) {
    const img = new Image();
    img.decoding = "async";
    img.onload = function () {
      try {
        resolve(stylizeEarthTexture(img));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = function () {
      reject(new Error("Could not load Earth texture"));
    };
    img.src = EARTH_URL;
  });
}

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.insertBefore(renderer.domElement, stage.firstChild);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4f0e8);
scene.fog = new THREE.Fog(0xf4f0e8, 11, 20);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
camera.position.set(0, 0.35, 4.2);

scene.add(new THREE.AmbientLight(0xfff8ef, 0.78));
const key = new THREE.DirectionalLight(0xfff4e6, 1.2);
key.position.set(3.2, 2.4, 2.8);
scene.add(key);
const fill = new THREE.DirectionalLight(0xd6e4f0, 0.38);
fill.position.set(-2.8, 0.6, -1.8);
scene.add(fill);

const globeGroup = new THREE.Group();
scene.add(globeGroup);

const earthMat = new THREE.MeshStandardMaterial({
  color: 0xc5d4c8,
  roughness: 0.92,
  metalness: 0.04
});
const earth = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_R, 128, 96), earthMat);
globeGroup.add(earth);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(GLOBE_R * 1.045, 48, 32),
  new THREE.MeshBasicMaterial({
    color: 0xd4cfc4,
    transparent: true,
    opacity: 0.16,
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
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let autoSpin = reduceMotion ? 0 : 0.08;
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

// mindandculturelab.com brand: terracotta · sage · lilac
const PIN_PALETTE = [
  { head: 0xe08c3c, stem: 0xb86a28, emissive: 0x8a4a12 },
  { head: 0x68a078, stem: 0x3d7a56, emissive: 0x24543a },
  { head: 0xc8b8f0, stem: 0x8b7bc4, emissive: 0x5a4a8a },
  { head: 0xd85f27, stem: 0xa84618, emissive: 0x6a2c0c }
];

function pinStyleForIndex(index) {
  return PIN_PALETTE[index % PIN_PALETTE.length];
}

function buildPin(site, index) {
  const g = new THREE.Group();
  const scale = pinScaleForN(site.sampleN);
  const style = pinStyleForIndex(index || 0);
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012 * scale, 0.018 * scale, 0.14 * scale, 10),
    new THREE.MeshStandardMaterial({ color: style.stem, roughness: 0.55 })
  );
  stem.position.y = 0.07 * scale;
  g.add(stem);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(PIN_BASE * scale, 16, 12),
    new THREE.MeshStandardMaterial({
      color: style.head,
      emissive: style.emissive,
      emissiveIntensity: 0.28,
      roughness: 0.4
    })
  );
  head.position.y = 0.15 * scale;
  g.add(head);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.05 * scale, 0.08 * scale, 24),
    new THREE.MeshBasicMaterial({
      color: 0xd85f27,
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
  // Orient pin stem along outward surface normal
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

  g.userData.siteId = site.id;
  g.userData.head = head;
  g.userData.halo = halo;
  g.userData.baseColor = style.head;
  g.userData.baseEmissive = style.emissive;
  return g;
}

function shortStudyName(study) {
  if (!study) return "";
  const n = study.name;
  if (n.length <= 64) return n;
  return n.slice(0, 61) + "…";
}

function formatCoord(site) {
  const latHem = site.lat >= 0 ? "N" : "S";
  const lngHem = site.lng >= 0 ? "E" : "W";
  return Math.abs(site.lat).toFixed(2) + "°" + latHem + " · " + Math.abs(site.lng).toFixed(2) + "°" + lngHem;
}

function renderVenues(site) {
  venuesEl.replaceChildren();
  const venues = site.venues || [];
  if (!venues.length) {
    venuesEl.hidden = true;
    return;
  }
  venuesEl.hidden = false;
  const heading = document.createElement("p");
  heading.className = "sites-venues-label";
  heading.textContent = "Testing venues";
  venuesEl.appendChild(heading);

  const ul = document.createElement("ul");
  ul.className = "sites-venue-list";
  venues.forEach(function (v) {
    const name = typeof v === "string" ? v : v.name;
    const n = typeof v === "object" && v.n != null ? v.n : null;
    const note = typeof v === "object" ? v.note : null;
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = name;
    li.appendChild(strong);
    if (n != null) {
      const count = document.createElement("span");
      count.className = "sites-venue-n";
      count.textContent = "n ≈ " + Number(n).toLocaleString();
      li.appendChild(count);
    }
    if (note) {
      const noteEl = document.createElement("span");
      noteEl.className = "sites-venue-note";
      noteEl.textContent = note;
      li.appendChild(noteEl);
    }
    ul.appendChild(li);
  });
  venuesEl.appendChild(ul);
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
    entry.pin.userData.head.material.color.setHex(on ? 0xd85f27 : entry.pin.userData.baseColor);
    entry.pin.userData.head.material.emissive.setHex(on ? 0xa84618 : entry.pin.userData.baseEmissive);
    entry.pin.userData.head.material.emissiveIntensity = on ? 0.55 : 0.28;
    entry.pin.userData.halo.material.opacity = on ? 0.85 : 0;
    entry.pin.scale.setScalar(on ? 1.18 : 1);
  });

  if (!site) {
    kickerEl.textContent = "";
    kickerEl.hidden = true;
    titleEl.textContent = "Testing sites";
    regionEl.textContent = "";
    metaEl.hidden = true;
    bodyEl.textContent = "Click to learn more about each site";
    statEl.hidden = true;
    venuesEl.hidden = true;
    venuesEl.replaceChildren();
    studiesEl.replaceChildren();
    return;
  }

  kickerEl.hidden = false;
  kickerEl.textContent = "Field site";
  titleEl.textContent = site.name;
  regionEl.textContent = site.region + " · " + formatCoord(site);

  const metaBits = [];
  if (site.society) metaBits.push(site.society);
  if (site.ages) metaBits.push("Ages " + site.ages);
  if (site.tasks && site.tasks.length) metaBits.push(site.tasks.join(" · "));
  if (metaBits.length) {
    metaEl.textContent = metaBits.join(" · ");
    metaEl.hidden = false;
  } else {
    metaEl.hidden = true;
  }

  bodyEl.textContent = site.blurb;

  let stat = "About " + site.sampleN.toLocaleString() + " participants in open datasets";
  if (site.sampleNote) stat += " · " + site.sampleNote;
  statEl.textContent = stat;
  statEl.hidden = false;

  renderVenues(site);

  studiesEl.replaceChildren();
  const listLabel = document.createElement("p");
  listLabel.className = "sites-venues-label";
  listLabel.textContent = "Studies from this site";
  studiesEl.appendChild(listLabel);

  const list = document.createElement("ul");
  list.className = "sites-study-list";
  (site.studyIds || []).forEach(function (sid) {
    const study = studiesById[sid];
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "../studies/" + sid + "/";
    link.textContent = shortStudyName(study) || sid;
    li.appendChild(link);
    if (study && study.ageLabel) {
      const age = document.createElement("span");
      age.className = "sites-venue-note";
      age.textContent = "Ages " + study.ageLabel;
      li.appendChild(age);
    }
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
  if (reduceMotion) {
    renderOnce();
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
  if (reduceMotion) {
    renderOnce();
  }
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
    if (reduceMotion) {
      renderOnce();
    }
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
  if (!reduceMotion) {
    requestAnimationFrame(frame);
  }
  const t = ms * 0.001;
  if (!dragging && autoSpin) {
    userAzimuth += autoSpin * 0.012;
  }

  const radius = 4.15 * userZoom;
  camOffset.setFromSphericalCoords(radius, Math.PI / 2 - userPolar, userAzimuth);
  camera.position.copy(camOffset);
  camera.lookAt(lookAt);

  if (!reduceMotion) {
    atmosphere.rotation.y = t * 0.02;
  }
  renderer.render(scene, camera);
}

function renderOnce() {
  frame(performance.now());
}

if (reduceMotion) {
  stage.addEventListener("pointerup", renderOnce);
  stage.addEventListener("wheel", renderOnce, { passive: true });
}

Promise.all([
  loadEarthTexture(),
  fetch("../data/sites.json").then(function (r) {
    return r.json();
  }),
  fetch("../data/studies.json").then(function (r) {
    return r.json();
  })
])
  .then(function (triple) {
    const tex = triple[0];
    earthMat.map = tex;
    earthMat.color.set(0xffffff);
    earthMat.needsUpdate = true;

    sites = triple[1].sites || [];
    (triple[2].studies || []).forEach(function (s) {
      studiesById[s.id] = s;
    });

    badgeEl.textContent = sites.length + " sites";

    sites.forEach(function (site, index) {
      const pin = buildPin(site, index);
      pinsRoot.add(pin);
      pinEntries.push({ site: site, pin: pin });

      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "site-chip";
      chip.setAttribute("role", "listitem");
      chip.setAttribute("aria-pressed", "false");
      chip.textContent = site.name;
      chip.title = site.region;
      chip.addEventListener("click", function () {
        selectSite(site.id, true);
      });
      chipsHost.appendChild(chip);
      chipButtons[site.id] = chip;
    });

    const startId = new URLSearchParams(window.location.search).get("site");
    if (
      startId &&
      sites.some(function (s) {
        return s.id === startId;
      })
    ) {
      selectSite(startId, true);
    } else {
      selectSite(null, false);
    }

    resize();
    requestAnimationFrame(frame);
  })
  .catch(function (err) {
    bodyEl.textContent = "Could not load field sites. " + String(err);
    resize();
    requestAnimationFrame(frame);
  });
