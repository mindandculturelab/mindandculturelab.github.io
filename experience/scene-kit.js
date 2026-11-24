import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

export function makeWoodTexture(baseHex, grainHex) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = grainHex;
  ctx.globalAlpha = 0.13;
  for (let i = 0; i < 44; i += 1) {
    ctx.lineWidth = 1 + (i % 3) * 0.7;
    ctx.beginPath();
    const y = (i / 44) * 256;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(85, y + Math.sin(i) * 3.5, 170, y - Math.cos(i) * 3.5, 256, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export const palette = {
  sage: 0x68a078,
  sageDeep: 0x3d7a56,
  sageSoft: 0xa7c5af,
  terracotta: 0xe08c3c,
  ochre: 0xd85f27,
  lilac: 0xc8b8f0,
  slate: 0x5c738a,
  coralRed: 0xd85f27,
  cobaltBlue: 0x8b7bc4,
  cream: 0xfaf8f4,
  ink: 0x1a1a1a
};

export const materials = {
  birch: new THREE.MeshStandardMaterial({
    map: makeWoodTexture("#e6d5b8", "#c2a882"),
    roughness: 0.6
  }),
  walnut: new THREE.MeshStandardMaterial({
    map: makeWoodTexture("#85603f", "#5b3e24"),
    roughness: 0.56
  }),
  chairWood: new THREE.MeshStandardMaterial({
    map: makeWoodTexture("#b89468", "#8d6a43"),
    roughness: 0.64
  }),
  trimWood: new THREE.MeshStandardMaterial({ color: 0xc5a67c, roughness: 0.58 }),
  sageFelt: new THREE.MeshStandardMaterial({ color: 0x355f46, roughness: 0.9 }),
  sagePaint: new THREE.MeshStandardMaterial({ color: 0x467a5c, roughness: 0.52 }),
  terracottaPaint: new THREE.MeshStandardMaterial({ color: 0xcf7a40, roughness: 0.48 }),
  slatePaint: new THREE.MeshStandardMaterial({ color: 0x5c738a, roughness: 0.52 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xd7ae54, roughness: 0.28, metalness: 0.72 }),
  coinGold: new THREE.MeshStandardMaterial({ color: 0xf0c75e, roughness: 0.26, metalness: 0.68 }),
  silver: new THREE.MeshStandardMaterial({ color: 0xc4c9cf, roughness: 0.32, metalness: 0.68 }),
  charcoal: new THREE.MeshStandardMaterial({ color: 0x322f2b, roughness: 0.9 }),
  creamMat: new THREE.MeshStandardMaterial({ color: 0xf9f5ed, roughness: 0.65 }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0xf1f8fb,
    roughness: 0.07,
    metalness: 0.02,
    transparent: true,
    opacity: 0.32
  }),
  clearJar: new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.08,
    metalness: 0.02,
    transparent: true,
    opacity: 0.26,
    side: THREE.DoubleSide
  })
};

export function makeSpeechSprite(message, borderHex = "#285c3f", bgHex = "rgba(255,255,255,0.97)") {
  const c = document.createElement("canvas");
  c.width = 384;
  c.height = 136;
  const ctx = c.getContext("2d");
  ctx.fillStyle = bgHex;
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(14, 12, 356, 84, 38);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(176, 96);
  ctx.lineTo(192, 120);
  ctx.lineTo(208, 96);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1c1a17";
  ctx.font = "700 29px 'Fira Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, 192, 55);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(0.78, 0.28, 1);
  return sprite;
}

export function makeNoteSprite(symbol = "♪", hex = "#285c3f") {
  const c = document.createElement("canvas");
  c.width = 96;
  c.height = 96;
  const ctx = c.getContext("2d");
  ctx.fillStyle = hex;
  ctx.font = "700 62px 'Fira Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(symbol, 48, 50);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0 }));
  sprite.scale.set(0.18, 0.18, 1);
  return sprite;
}

export function makeCompactTable(width = 1.06, depth = 1.06, height = 0.62) {
  const table = new THREE.Group();
  const topThickness = 0.052;
  const top = new THREE.Mesh(new THREE.BoxGeometry(width, topThickness, depth), materials.birch);
  top.position.y = height - topThickness / 2;
  top.castShadow = true;
  top.receiveShadow = true;
  table.add(top);

  const apronY = height - topThickness - 0.022;
  const inset = 0.055;
  [
    [0, apronY, -(depth / 2 - inset), width - inset * 2, 0.044, 0.028],
    [0, apronY, depth / 2 - inset, width - inset * 2, 0.044, 0.028],
    [-(width / 2 - inset), apronY, 0, 0.028, 0.044, depth - inset * 2],
    [width / 2 - inset, apronY, 0, 0.028, 0.044, depth - inset * 2]
  ].forEach(function (a) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(a[3], a[4], a[5]), materials.trimWood);
    m.position.set(a[0], a[1], a[2]);
    m.castShadow = true;
    table.add(m);
  });

  const legH = height - topThickness;
  const lx = width / 2 - 0.075;
  const lz = depth / 2 - 0.075;
  [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]].forEach(function (c) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.024, legH, 16), materials.chairWood);
    leg.position.set(c[0], legH / 2, c[1]);
    leg.castShadow = true;
    table.add(leg);
  });
  table.userData.surfaceY = height;
  return table;
}

export function makeChair(scale = 1) {
  const chair = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.4), materials.chairWood);
  seat.position.set(0, 0.36, -0.02);
  seat.castShadow = true;
  seat.receiveShadow = true;
  chair.add(seat);

  const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.11, 0.036), materials.chairWood);
  topRail.position.set(0, 0.76, -0.2);
  topRail.castShadow = true;
  chair.add(topRail);

  [-0.13, 0, 0.13].forEach(function (sx) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.34, 0.024), materials.chairWood);
    slat.position.set(sx, 0.56, -0.2);
    slat.castShadow = true;
    chair.add(slat);
  });

  [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.15], [0.19, 0.15]].forEach(function (c) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.36, 12), materials.chairWood);
    leg.position.set(c[0], 0.18, c[1]);
    leg.castShadow = true;
    chair.add(leg);
  });
  chair.scale.setScalar(scale);
  return chair;
}

export function makeChild(spec, scale = 0.84) {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: spec.skin || 0xeac09e, roughness: 0.52 });
  const blush = new THREE.MeshStandardMaterial({ color: 0xe39b8d, roughness: 0.68 });
  const shirt = new THREE.MeshStandardMaterial({ color: spec.shirt || 0x568265, roughness: 0.72 });
  const pants = new THREE.MeshStandardMaterial({ color: spec.pants || 0x414e5c, roughness: 0.8 });
  const hairMat = new THREE.MeshStandardMaterial({ color: spec.hair || 0x36261d, roughness: 0.78 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf4f0e8, roughness: 0.62 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x261c16, roughness: 0.2 });

  const hips = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), pants);
  hips.scale.set(1.1, 0.66, 0.94);
  hips.position.set(0, 0.48, -0.02);
  hips.castShadow = true;

  [-1, 1].forEach(function (side) {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.18, 6, 12), pants);
    thigh.rotation.x = Math.PI / 2.15;
    thigh.position.set(side * 0.105, 0.46, 0.13);
    thigh.castShadow = true;

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.056, 0.17, 6, 12), skin);
    shin.position.set(side * 0.105, 0.29, 0.24);
    shin.rotation.x = 0.12;
    shin.castShadow = true;

    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.066, 14, 10), shoeMat);
    shoe.scale.set(0.92, 0.6, 1.35);
    shoe.position.set(side * 0.105, 0.16, 0.28);
    shoe.castShadow = true;

    group.add(thigh, shin, shoe);
  });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.195, 0.22, 10, 18), shirt);
  torso.scale.set(1.06, 1, 0.84);
  torso.position.set(0, 0.72, 0);
  torso.rotation.x = 0.08;
  torso.castShadow = true;

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.098, 0.018, 10, 22),
    materials.creamMat
  );
  collar.rotation.x = Math.PI / 2 + 0.08;
  collar.position.set(0, 0.92, 0.02);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.076, 0.075, 14), skin);
  neck.position.set(0, 0.97, 0.022);

  const head = new THREE.Group();
  head.position.set(0, 1.18, 0.04);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.205, 26, 22), skin);
  skull.scale.set(0.98, 1.03, 0.96);
  skull.castShadow = true;
  head.add(skull);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.213, 26, 18, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hairCap.position.set(0, 0.02, -0.014);
  hairCap.rotation.x = -0.18;
  hairCap.castShadow = true;
  head.add(hairCap);

  if (spec.hairStyle === "curls") {
    [[-0.15, 0.09, 0.04], [0.15, 0.09, 0.04], [-0.1, 0.16, 0.09], [0.1, 0.16, 0.09], [0, 0.18, 0.11]].forEach(function (p) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), hairMat);
      puff.position.set(p[0], p[1], p[2]);
      head.add(puff);
    });
  } else {
    const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 12), hairMat);
    fringe.scale.set(1.25, 0.4, 0.54);
    fringe.position.set(spec.hairStyle === "parted" ? 0.028 : 0, 0.125, 0.145);
    head.add(fringe);
  }

  [-1, 1].forEach(function (side) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), skin);
    ear.scale.set(0.55, 0.9, 0.75);
    ear.position.set(side * 0.196, -0.01, 0);

    const white = new THREE.Mesh(new THREE.SphereGeometry(0.029, 12, 10), eyeWhite);
    white.scale.set(1, 1.08, 0.6);
    white.position.set(side * 0.071, 0.014, 0.18);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), irisMat);
    pupil.position.set(side * 0.069, 0.011, 0.195);

    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.038, 4, 8), hairMat);
    brow.rotation.z = Math.PI / 2 - side * 0.11;
    brow.position.set(side * 0.071, 0.062, 0.186);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), blush);
    cheek.scale.set(1.15, 0.7, 0.4);
    cheek.position.set(side * 0.114, -0.04, 0.168);

    head.add(ear, white, pupil, brow, cheek);
  });

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.023, 10, 8), skin);
  nose.scale.set(1, 0.85, 0.9);
  nose.position.set(0, -0.018, 0.2);

  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.008, 8, 18, Math.PI), irisMat);
  smile.position.set(0, -0.062, 0.182);
  smile.rotation.z = Math.PI;
  smile.rotation.x = 0.2;
  head.add(nose, smile);

  function makeArm(side) {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.22, 0.84, 0.02);

    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.09, 6, 12), shirt);
    sleeve.position.set(side * 0.02, -0.03, 0.02);
    sleeve.rotation.z = side * 0.36;
    sleeve.rotation.x = 0.35;
    sleeve.castShadow = true;

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.19, 6, 12), skin);
    forearm.position.set(side * 0.03, -0.13, 0.18);
    forearm.rotation.x = Math.PI / 2.45;
    forearm.rotation.z = -side * 0.16;
    forearm.castShadow = true;

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 10), skin);
    hand.scale.set(1.04, 0.58, 1.16);
    hand.position.set(side * 0.0, -0.16, 0.32);
    hand.castShadow = true;

    armPivot.add(sleeve, forearm, hand);
    return armPivot;
  }

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);
  group.add(hips, torso, collar, neck, head, leftArm, rightArm);
  group.scale.setScalar(scale);
  group.userData.head = head;
  group.userData.leftArm = leftArm;
  group.userData.rightArm = rightArm;
  return group;
}

export function makeCandy(colorHex, radius = 0.026) {
  const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.34 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(radius * 1.7, radius * 0.85, radius * 1.7), mat);
  m.castShadow = true;
  return m;
}

export function tagInspectable(rootObj, id, title, description, focusPos, focusLook, onTrigger) {
  const entry = {
    id: id,
    root: rootObj,
    title: title,
    description: description,
    focusPos: focusPos,
    focusLook: focusLook,
    onTrigger: onTrigger || null
  };
  rootObj.traverse(function (node) {
    node.userData.inspectEntry = entry;
  });
  return entry;
}
