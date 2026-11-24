import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const stage = document.querySelector("[data-hero-task]");
if (!stage) {
  // no task preview on this page
} else {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.05, 40);
  camera.position.set(1.55, 1.35, 1.85);

  scene.add(new THREE.AmbientLight(0xfff8ef, 0.82));
  const key = new THREE.DirectionalLight(0xfff4e6, 1.15);
  key.position.set(2.4, 3.2, 1.6);
  key.castShadow = true;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd6e4f0, 0.42);
  fill.position.set(-2.2, 1.1, -1.4);
  scene.add(fill);

  function woodMaterial(hex, grainHex) {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext("2d");
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = grainHex;
    ctx.globalAlpha = 0.14;
    for (let i = 0; i < 22; i += 1) {
      ctx.beginPath();
      const y = (i / 22) * 128;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(40, y + 2, 88, y - 2, 128, y);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62 });
  }

  const birch = woodMaterial("#e6d5b8", "#c2a882");
  const walnut = woodMaterial("#85603f", "#5b3e24");
  const sageFelt = new THREE.MeshStandardMaterial({ color: 0x355f46, roughness: 0.9 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xdde8f2,
    transparent: true,
    opacity: 0.28,
    roughness: 0.12,
    metalness: 0.05,
    transmission: 0.55
  });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd7ae54, roughness: 0.3, metalness: 0.7 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xf0c75e, roughness: 0.28, metalness: 0.65 });
  const red = new THREE.MeshStandardMaterial({ color: 0xd85f27, roughness: 0.38 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x8b7bc4, roughness: 0.38 });

  const root = new THREE.Group();
  scene.add(root);

  const table = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.05, 1.05), birch);
  table.position.y = 0.6;
  table.castShadow = true;
  table.receiveShadow = true;
  root.add(table);

  [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]].forEach(function (xy) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.58, 10), birch);
    leg.position.set(xy[0], 0.29, xy[1]);
    leg.castShadow = true;
    root.add(leg);
  });

  const box = new THREE.Group();
  box.position.y = 0.625;
  root.add(box);

  const floor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.4), walnut);
  floor.receiveShadow = true;
  box.add(floor);

  const felt = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), sageFelt);
  felt.rotation.x = -Math.PI / 2;
  felt.position.y = 0.012;
  box.add(felt);

  [
    [0, 0.09, -0.186, 0.4, 0.16, 0.028],
    [0, 0.09, 0.186, 0.4, 0.16, 0.028],
    [-0.186, 0.09, 0, 0.028, 0.16, 0.344],
    [0.186, 0.09, 0, 0.028, 0.16, 0.344]
  ].forEach(function (w) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w[3], w[4], w[5]), walnut);
    wall.position.set(w[0], w[1], w[2]);
    wall.castShadow = true;
    box.add(wall);
  });

  const lid = new THREE.Mesh(new THREE.BoxGeometry(0.396, 0.014, 0.396), glass);
  lid.position.set(0, 0.175, 0);
  box.add(lid);

  const latch = new THREE.Mesh(new THREE.BoxGeometry(0.064, 0.03, 0.016), brass);
  latch.position.set(0, 0.17, 0.2);
  box.add(latch);

  for (let i = 0; i < 4; i += 1) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.012, 20), gold);
    coin.position.set((i % 2) * 0.09 - 0.045, 0.02, Math.floor(i / 2) * 0.09 - 0.045);
    coin.castShadow = true;
    box.add(coin);
  }

  const keySpecs = [
    { pos: [-0.21, 0.09, 0], rot: [0, 0, Math.PI / 2], mat: blue },
    { pos: [0, 0.09, -0.21], rot: [Math.PI / 2, 0, 0], mat: blue },
    { pos: [0.21, 0.09, 0], rot: [0, 0, -Math.PI / 2], mat: red }
  ];
  keySpecs.forEach(function (spec) {
    const keyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.018, 22), spec.mat);
    keyMesh.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
    keyMesh.rotation.set(spec.rot[0], spec.rot[1], spec.rot[2]);
    keyMesh.castShadow = true;
    box.add(keyMesh);
  });

  let userAzimuth = 0.55;
  let userPolar = 0.28;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let autoSpin = reduceMotion ? 0 : 0.55;
  let dragging = false;
  let downX = 0;
  let downY = 0;
  let lastX = 0;
  let lastY = 0;
  let movedDist = 0;
  let visible = true;

  const lookAt = new THREE.Vector3(0, 0.72, 0);
  const camOffset = new THREE.Vector3();

  stage.addEventListener("pointerdown", function (event) {
    dragging = true;
    autoSpin = reduceMotion ? 0 : 0.05;
    downX = event.clientX;
    downY = event.clientY;
    lastX = event.clientX;
    lastY = event.clientY;
    movedDist = 0;
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", function (event) {
    if (!dragging) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    movedDist += Math.hypot(dx, dy);
    lastX = event.clientX;
    lastY = event.clientY;
    userAzimuth -= dx * 0.007;
    userPolar = Math.max(0.08, Math.min(0.85, userPolar + dy * 0.005));
    if (reduceMotion) {
      frame();
    }
  });

  stage.addEventListener("pointerup", function (event) {
    if (!dragging) return;
    dragging = false;
    const shift = Math.hypot(event.clientX - downX, event.clientY - downY);
    if (movedDist < 7 && shift < 7) {
      window.location.href = "experience/?study=tsa";
    }
    autoSpin = reduceMotion ? 0 : 0.45;
  });

  stage.addEventListener("pointercancel", function () {
    dragging = false;
    autoSpin = reduceMotion ? 0 : 0.45;
  });

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

  if (typeof IntersectionObserver !== "undefined") {
    new IntersectionObserver(
      function (entries) {
        visible = entries.some(function (en) {
          return en.isIntersecting;
        });
      },
      { threshold: 0.05 }
    ).observe(stage);
  }

  function frame() {
    if (!reduceMotion) {
      requestAnimationFrame(frame);
    }
    if (!visible && !reduceMotion) return;
    if (!dragging && autoSpin) {
      userAzimuth += autoSpin * 0.01;
    }
    camOffset.setFromSphericalCoords(2.55, Math.PI / 2 - userPolar, userAzimuth);
    camera.position.copy(lookAt).add(camOffset);
    camera.lookAt(lookAt);
    renderer.render(scene, camera);
  }

  resize();
  requestAnimationFrame(frame);
  if (reduceMotion) {
    stage.addEventListener("pointerup", frame);
  }
}
