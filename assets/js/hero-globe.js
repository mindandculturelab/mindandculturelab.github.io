import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const stage = document.querySelector("[data-hero-globe]");
if (!stage) {
  // no hero stage on this page
} else {
  const GLOBE_R = 1.55;
  const PIN_BASE = 0.045;
  const EARTH_URL = "assets/images/globe/earth-2k.jpg";

  function latLngToVec3(lat, lng, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

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
        tr = r * 0.35 + 236 * 0.65;
        tg = g * 0.35 + 232 * 0.65;
        tb = b * 0.35 + 222 * 0.65;
      } else if (isOcean) {
        tr = r * 0.42 + 186 * 0.58;
        tg = g * 0.42 + 204 * 0.58;
        tb = b * 0.48 + 198 * 0.52;
      } else {
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

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  // Transparent so the homepage hero backdrop shows through
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

  let pinEntries = [];
  let userAzimuth = 0.55;
  let userPolar = 0.18;
  let userZoom = 0.95;
  let autoSpin = 0.1;
  let dragging = false;
  let downX = 0;
  let downY = 0;
  let lastX = 0;
  let lastY = 0;
  let movedDist = 0;
  let visible = true;

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

    const pos = latLngToVec3(site.lat, site.lng, GLOBE_R);
    g.position.copy(pos);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
    g.userData.siteId = site.id;
    return g;
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
    if (event.target.closest("a")) return;
    dragging = true;
    autoSpin = 0.02;
    downX = event.clientX;
    downY = event.clientY;
    lastX = event.clientX;
    lastY = event.clientY;
    movedDist = 0;
    stage.setPointerCapture(event.pointerId);
  });

  stage.addEventListener("pointermove", function (event) {
    if (!dragging) {
      const id = pickPin(event);
      stage.classList.toggle("is-hovering-object", !!id);
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
      if (id) {
        window.location.href = "sites/?site=" + encodeURIComponent(id);
      } else {
        window.location.href = "sites/";
      }
    }
    // Resume gentle spin after a drag
    autoSpin = 0.08;
  });

  stage.addEventListener("pointercancel", function () {
    dragging = false;
    autoSpin = 0.08;
  });

  stage.addEventListener(
    "wheel",
    function (event) {
      event.preventDefault();
      userZoom = Math.max(0.72, Math.min(1.35, userZoom + event.deltaY * 0.0009));
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

  function frame(ms) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = ms * 0.001;
    if (!dragging && autoSpin) {
      userAzimuth += autoSpin * 0.012;
    }

    const radius = 4.15 * userZoom;
    camOffset.setFromSphericalCoords(radius, Math.PI / 2 - userPolar, userAzimuth);
    camera.position.copy(camOffset);
    camera.lookAt(lookAt);

    atmosphere.rotation.y = t * 0.02;
    renderer.render(scene, camera);
  }

  Promise.all([
    loadEarthTexture(),
    fetch("data/sites.json").then(function (r) {
      return r.json();
    })
  ])
    .then(function (pair) {
      const tex = pair[0];
      earthMat.map = tex;
      earthMat.color.set(0xffffff);
      earthMat.needsUpdate = true;

      const sites = pair[1].sites || [];
      sites.forEach(function (site) {
        const pin = buildPin(site);
        pinsRoot.add(pin);
        pinEntries.push({ site: site, pin: pin });
      });

      const badge = stage.querySelector("[data-hero-globe-badge]");
      if (badge) badge.textContent = sites.length + " field sites";

      resize();
      requestAnimationFrame(frame);
    })
    .catch(function () {
      resize();
      requestAnimationFrame(frame);
    });
}
