import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { makeWoodTexture } from "./scene-kit.js";
import {
  buildTsaProcedure,
  buildEpistemicProcedure,
  buildTrustProcedure,
  buildInequityProcedure
} from "./scenes-tsa-and-dice.js";
import {
  buildCoopBatteryProcedure,
  buildForgivenessProcedure,
  buildRiskTimeProcedure,
  buildLadderProcedure
} from "./scenes-cross-cultural.js";
import { buildSearchProcedure } from "./scenes-search.js";

const stage = document.querySelector("[data-stage]");
const badge = document.querySelector("[data-badge]");
const kicker = document.querySelector("[data-kicker]");
const titleEl = document.querySelector("[data-title]");
const bodyEl = document.querySelector("[data-body]");
const whyEl = document.querySelector("[data-why]");
const prevBtn = document.querySelector("[data-prev]");
const nextBtn = document.querySelector("[data-next]");
const stepsNav = document.querySelector("[data-steps]");
const studyTabsHost = document.querySelector("[data-study-tabs]");
const condLabelEl = document.querySelector("[data-cond-label]");
const condButtonsHost = document.querySelector("[data-cond-buttons]");
const playAnimBtn = document.querySelector("[data-play-anim]");
const resetAnimBtn = document.querySelector("[data-reset-anim]");
const playLabelEl = document.querySelector("[data-play-label]");
const clickTipEl = document.querySelector("[data-click-tip]");
const inspectCard = document.querySelector("[data-inspect]");
const inspectTitle = document.querySelector("[data-inspect-title]");
const inspectBody = document.querySelector("[data-inspect-body]");
const inspectClose = document.querySelector("[data-inspect-close]");

const studyLink = document.querySelector("[data-study-link]");
const dataLink = document.querySelector("[data-data-link]");
const paperLink = document.querySelector("[data-paper-link]");
const repoLink = document.querySelector("[data-repo-link]");

// WebGL Studio Setup
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.03;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.insertBefore(renderer.domElement, stage.firstChild);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f2eb);
scene.fog = new THREE.Fog(0xf5f2eb, 9, 18);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 35);

const hemi = new THREE.HemisphereLight(0xfffcf5, 0xcac0ae, 1.08);
scene.add(hemi);

const keyLight = new THREE.DirectionalLight(0xfff6ea, 1.42);
keyLight.position.set(3.2, 5.8, 3.8);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 0.8;
keyLight.shadow.camera.far = 15;
keyLight.shadow.camera.left = -3.2;
keyLight.shadow.camera.right = 3.2;
keyLight.shadow.camera.top = 3.2;
keyLight.shadow.camera.bottom = -3.2;
keyLight.shadow.bias = -0.0004;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xe5eff6, 0.46);
fillLight.position.set(-3.4, 3.2, -2.2);
scene.add(fillLight);

// Cohesive warm room floor & sage-linen rug
const floorMat = new THREE.MeshStandardMaterial({
  map: makeWoodTexture("#ebe2d2", "#cfc0a8"),
  roughness: 0.86
});
floorMat.map.repeat.set(6, 6);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const rug = new THREE.Mesh(
  new THREE.CylinderGeometry(1.85, 1.85, 0.012, 64),
  new THREE.MeshStandardMaterial({ color: 0xe4ece6, roughness: 0.95 })
);
rug.position.y = 0.006;
rug.receiveShadow = true;
scene.add(rug);

const rugBorder = new THREE.Mesh(
  new THREE.RingGeometry(1.71, 1.84, 64),
  new THREE.MeshStandardMaterial({ color: 0xc2d4c7, roughness: 0.95, side: THREE.DoubleSide })
);
rugBorder.rotation.x = -Math.PI / 2;
rugBorder.position.y = 0.013;
scene.add(rugBorder);

// Simple white back wall — used for clean apparatus thumbnails
const thumbWall = new THREE.Mesh(
  new THREE.PlaneGeometry(12, 6),
  new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.96 })
);
thumbWall.position.set(0, 2.2, -2.4);
thumbWall.visible = false;
scene.add(thumbWall);

// Instantiate all 8 diagram-faithful study scenes
const procedures = [
  buildTsaProcedure(),
  buildEpistemicProcedure(),
  buildTrustProcedure(),
  buildInequityProcedure(),
  buildCoopBatteryProcedure(),
  buildForgivenessProcedure(),
  buildRiskTimeProcedure(),
  buildLadderProcedure(),
  buildSearchProcedure()
];

const procMap = {};
procedures.forEach(function (proc) {
  proc.root.visible = false;
  scene.add(proc.root);
  procMap[proc.id] = proc;
});

let activeProc = procedures[0];
let stepIndex = 0;
let nowSeconds = 0;

// Camera orbit & smooth focus state
let userAzimuth = 0;
let userPolar = 0;
let userZoom = 1;
let dragging = false;
let downX = 0;
let downY = 0;
let lastX = 0;
let lastY = 0;
let movedDist = 0;

const basePos = new THREE.Vector3(0.18, 2.35, 2.65);
const lookTarget = new THREE.Vector3(0, 0.68, 0);
const currentPos = new THREE.Vector3().copy(basePos);
const currentLook = new THREE.Vector3().copy(lookTarget);
const offsetVec = new THREE.Vector3();

const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();

// Build 8-study procedure tabs (screenshot + task name + study title)
const tabButtons = {};
const tabThumbs = {};
const simBand = document.getElementById("task-simulation");

procedures.forEach(function (proc) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "procedure-tab";
  btn.setAttribute("role", "tab");
  btn.setAttribute("aria-selected", "false");

  const thumb = document.createElement("span");
  thumb.className = "procedure-tab-thumb";
  thumb.setAttribute("aria-hidden", "true");
  const thumbImg = document.createElement("img");
  thumbImg.alt = "";
  thumbImg.decoding = "async";
  thumb.appendChild(thumbImg);
  tabThumbs[proc.id] = thumbImg;

  const name = document.createElement("span");
  name.className = "procedure-tab-name";
  name.textContent = proc.tabName;

  const study = document.createElement("span");
  study.className = "procedure-tab-study";
  study.textContent = proc.studyTitle;

  btn.append(thumb, name, study);
  btn.addEventListener("click", function () {
    selectProcedure(proc.id, true);
    if (simBand) {
      simBand.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  studyTabsHost.appendChild(btn);
  tabButtons[proc.id] = btn;
});

function setThumbExtrasVisible(root, visible) {
  root.traverse(function (obj) {
    if (obj.userData && (obj.userData.thumbHide || obj.userData.isActor)) {
      obj.visible = visible;
    }
  });
}

function captureProcedureThumb(proc) {
  procedures.forEach(function (p) {
    p.root.visible = false;
  });
  proc.root.visible = true;
  if (typeof proc.setCondition === "function") {
    proc.setCondition(proc.defaultCondition, 0);
  }
  if (typeof proc.setStep === "function") {
    proc.setStep(0, 0);
  }
  // Frame the primary apparatus for a clean task-only preview.
  const focus = proc.inspectables && proc.inspectables[0];
  if (focus && focus.focusPos && focus.focusLook) {
    camera.position.set(focus.focusPos[0], focus.focusPos[1], focus.focusPos[2]);
    camera.lookAt(focus.focusLook[0], focus.focusLook[1], focus.focusLook[2]);
  } else {
    const st = proc.steps[0];
    camera.position.set(st.camera.pos[0], st.camera.pos[1], st.camera.pos[2]);
    camera.lookAt(st.camera.look[0], st.camera.look[1], st.camera.look[2]);
  }
  camera.aspect = 16 / 10;
  camera.updateProjectionMatrix();
  renderer.setSize(360, 225, false);
  if (typeof proc.update === "function") {
    proc.update(0);
  }
  setThumbExtrasVisible(proc.root, false);
  // Quiet studio for thumbs: wood floor + white wall, no rug/busy backdrop
  const prevBg = scene.background ? scene.background.getHex() : 0xf5f2eb;
  const prevFogNear = scene.fog ? scene.fog.near : 9;
  const prevFogFar = scene.fog ? scene.fog.far : 18;
  const rugWas = rug.visible;
  const borderWas = rugBorder.visible;
  rug.visible = false;
  rugBorder.visible = false;
  thumbWall.visible = true;
  scene.background = new THREE.Color(0xffffff);
  if (scene.fog) {
    scene.fog.color.set(0xffffff);
    scene.fog.near = 14;
    scene.fog.far = 28;
  }
  renderer.render(scene, camera);
  const dataUrl = renderer.domElement.toDataURL("image/jpeg", 0.84);
  setThumbExtrasVisible(proc.root, true);
  rug.visible = rugWas;
  rugBorder.visible = borderWas;
  thumbWall.visible = false;
  scene.background = new THREE.Color(prevBg);
  if (scene.fog) {
    scene.fog.color.set(prevBg);
    scene.fog.near = prevFogNear;
    scene.fog.far = prevFogFar;
  }
  if (typeof proc.setStep === "function") {
    proc.setStep(0, 0);
  }
  return dataUrl;
}

function populateTabThumbs() {
  const previouslyActive = activeProc;
  procedures.forEach(function (proc) {
    try {
      const dataUrl = captureProcedureThumb(proc);
      if (tabThumbs[proc.id]) {
        tabThumbs[proc.id].src = dataUrl;
      }
    } catch (err) {
      // leave placeholder if a scene fails to snapshot
    }
  });
  procedures.forEach(function (p) {
    p.root.visible = false;
  });
  previouslyActive.root.visible = true;
  resize();
  renderFrame(true);
}

function hideInspectCard(restoreStepCamera) {
  inspectCard.hidden = true;
  if (restoreStepCamera) {
    const st = activeProc.steps[stepIndex];
    userAzimuth = 0;
    userPolar = 0;
    userZoom = 1;
    basePos.set(st.camera.pos[0], st.camera.pos[1], st.camera.pos[2]);
    lookTarget.set(st.camera.look[0], st.camera.look[1], st.camera.look[2]);
  }
}

inspectClose.addEventListener("click", function () {
  hideInspectCard(true);
});

let stepButtons = [];

function applyStep(idx) {
  stepIndex = idx;
  hideInspectCard(false);
  const st = activeProc.steps[stepIndex];

  kicker.textContent = "Step " + (stepIndex + 1) + " of " + activeProc.steps.length;
  titleEl.textContent = st.title;
  bodyEl.textContent = st.body;
  whyEl.textContent = st.why;
  badge.textContent = st.badge;
  prevBtn.disabled = stepIndex === 0;
  nextBtn.disabled = stepIndex === activeProc.steps.length - 1;

  stepButtons.forEach(function (b, i) {
    if (i === stepIndex) b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  });

  userAzimuth = 0;
  userPolar = 0;
  userZoom = 1;
  basePos.set(st.camera.pos[0], st.camera.pos[1], st.camera.pos[2]);
  lookTarget.set(st.camera.look[0], st.camera.look[1], st.camera.look[2]);

  activeProc.setStep(stepIndex, nowSeconds);
  renderFrame(true);
}

function selectProcedure(studyId, updateUrl) {
  const nextProc = procMap[studyId] || procedures[0];
  activeProc.root.visible = false;
  activeProc = nextProc;
  activeProc.root.visible = true;

  Object.keys(tabButtons).forEach(function (id) {
    tabButtons[id].setAttribute("aria-selected", id === activeProc.id ? "true" : "false");
  });

  // Update study header inside the white simulation band
  studyLink.textContent = activeProc.studyTitle;
  studyLink.href = activeProc.studyHref;
  dataLink.href = activeProc.dataHref;
  if (activeProc.paperHref) {
    paperLink.href = activeProc.paperHref;
    paperLink.hidden = false;
  } else {
    paperLink.hidden = true;
  }
  if (repoLink) {
    if (activeProc.repoHref) {
      repoLink.href = activeProc.repoHref;
      repoLink.hidden = false;
    } else {
      repoLink.hidden = true;
    }
  }

  // Update Condition buttons
  condLabelEl.textContent = activeProc.condLabel;
  condButtonsHost.replaceChildren();
  activeProc.conditions.forEach(function (c) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c.label;
    b.setAttribute("aria-pressed", c.value === activeProc.defaultCondition ? "true" : "false");
    b.addEventListener("click", function () {
      Array.from(condButtonsHost.children).forEach(function (other) {
        other.setAttribute("aria-pressed", other === b ? "true" : "false");
      });
      activeProc.setCondition(c.value, nowSeconds);
    });
    condButtonsHost.appendChild(b);
  });
  activeProc.setCondition(activeProc.defaultCondition, nowSeconds);

  // Update Play button & click tip
  playLabelEl.textContent = activeProc.playLabel;
  clickTipEl.textContent = activeProc.clickTip;

  // Rebuild step pills
  stepsNav.replaceChildren();
  stepButtons = activeProc.steps.map(function (st, idx) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "experience-step";
    b.textContent = st.short;
    b.addEventListener("click", function () {
      applyStep(idx);
    });
    stepsNav.appendChild(b);
    return b;
  });

  applyStep(0);

  if (updateUrl && window.history && window.history.replaceState) {
    const url = new URL(window.location.href);
    url.searchParams.set("study", activeProc.id);
    window.history.replaceState({}, "", url.toString());
  }
}

playAnimBtn.addEventListener("click", function () {
  activeProc.playAction(nowSeconds);
});

function resetActiveAnimation() {
  if (typeof activeProc.resetAction === "function") {
    activeProc.resetAction(nowSeconds);
  } else {
    activeProc.setStep(stepIndex, nowSeconds);
  }
  userAzimuth = 0;
  userPolar = 0;
  userZoom = 1;
  const st = activeProc.steps[stepIndex];
  basePos.set(st.camera.pos[0], st.camera.pos[1], st.camera.pos[2]);
  lookTarget.set(st.camera.look[0], st.camera.look[1], st.camera.look[2]);
  hideInspectCard(false);
  renderFrame(true);
}

if (resetAnimBtn) {
  resetAnimBtn.addEventListener("click", function () {
    resetActiveAnimation();
  });
}

prevBtn.addEventListener("click", function () {
  if (stepIndex > 0) applyStep(stepIndex - 1);
});

nextBtn.addEventListener("click", function () {
  if (stepIndex < activeProc.steps.length - 1) applyStep(stepIndex + 1);
});

document.addEventListener("keydown", function (event) {
  if (event.target && /input|select|textarea/i.test(event.target.tagName)) return;
  if (event.key === "ArrowRight") nextBtn.click();
  if (event.key === "ArrowLeft") prevBtn.click();
});

// Raycasting helpers for click-to-inspect 3D objects
function updatePointerNDC(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickInspectable(event) {
  updatePointerNDC(event);
  raycaster.setFromCamera(pointerNDC, camera);
  const hits = raycaster.intersectObject(activeProc.root, true);
  for (let i = 0; i < hits.length; i += 1) {
    let cur = hits[i].object;
    while (cur) {
      if (cur.visible === false) break;
      if (cur.userData && cur.userData.inspectEntry) {
        return cur.userData.inspectEntry;
      }
      cur = cur.parent;
    }
  }
  return null;
}

stage.addEventListener("pointerdown", function (event) {
  if (event.target.closest("button")) return;
  dragging = true;
  downX = event.clientX;
  downY = event.clientY;
  lastX = event.clientX;
  lastY = event.clientY;
  movedDist = 0;
  stage.setPointerCapture(event.pointerId);
});

stage.addEventListener("pointermove", function (event) {
  if (!dragging) {
    const hovered = pickInspectable(event);
    stage.classList.toggle("is-hovering-object", Boolean(hovered));
    return;
  }
  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;
  movedDist += Math.hypot(dx, dy);
  lastX = event.clientX;
  lastY = event.clientY;
  userAzimuth -= dx * 0.006;
  userPolar = Math.max(-0.35, Math.min(0.45, userPolar + dy * 0.004));
});

stage.addEventListener("pointerup", function (event) {
  if (!dragging) return;
  dragging = false;
  const totalShift = Math.hypot(event.clientX - downX, event.clientY - downY);
  if (movedDist < 7 && totalShift < 7) {
    const picked = pickInspectable(event);
    if (picked) {
      inspectTitle.textContent = picked.title;
      inspectBody.textContent = picked.description;
      inspectCard.hidden = false;
      userAzimuth = 0;
      userPolar = 0;
      userZoom = 1;
      basePos.set(picked.focusPos[0], picked.focusPos[1], picked.focusPos[2]);
      lookTarget.set(picked.focusLook[0], picked.focusLook[1], picked.focusLook[2]);
      if (typeof picked.onTrigger === "function") {
        picked.onTrigger(nowSeconds);
      }
    }
  }
});

stage.addEventListener("pointercancel", function () {
  dragging = false;
});

stage.addEventListener(
  "wheel",
  function (event) {
    event.preventDefault();
    userZoom = Math.max(0.66, Math.min(1.42, userZoom + event.deltaY * 0.0008));
  },
  { passive: false }
);

function resize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();

function renderFrame(snapCamera) {
  offsetVec.copy(basePos).sub(lookTarget);
  const spherical = new THREE.Spherical().setFromVector3(offsetVec);
  spherical.theta += userAzimuth;
  spherical.phi = Math.max(0.32, Math.min(1.4, spherical.phi + userPolar));
  spherical.radius *= userZoom;
  offsetVec.setFromSpherical(spherical).add(lookTarget);

  if (snapCamera) {
    currentPos.copy(offsetVec);
    currentLook.copy(lookTarget);
  } else {
    currentPos.lerp(offsetVec, 0.12);
    currentLook.lerp(lookTarget, 0.12);
  }
  camera.position.copy(currentPos);
  camera.lookAt(currentLook);

  activeProc.update(nowSeconds);
  renderer.render(scene, camera);
}

// Initialize from ?study=<id> query parameter if provided
const initialParam = new URLSearchParams(window.location.search).get("study");
selectProcedure(initialParam || "tsa", false);
resize();
renderFrame(true);
populateTabThumbs();
window.__dbg = { scene, camera, renderer, procMap, getActive: () => activeProc };

if (typeof ResizeObserver === "function") {
  new ResizeObserver(function () {
    resize();
    renderFrame(false);
  }).observe(stage);
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function frame(ms) {
  if (!reduceMotion) {
    requestAnimationFrame(frame);
  }
  nowSeconds = ms * 0.001;
  renderFrame(reduceMotion);
}

if (reduceMotion) {
  // Still redraw after user interaction; skip continuous RAF spin/lerp.
  ["click", "pointerup", "change"].forEach(function (evt) {
    stage.addEventListener(evt, function () {
      renderFrame(true);
    });
  });
  window.addEventListener("resize", function () {
    renderFrame(true);
  });
} else {
  requestAnimationFrame(frame);
}
