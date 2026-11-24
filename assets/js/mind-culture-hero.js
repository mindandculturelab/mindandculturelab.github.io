(function () {
  var canvas = document.querySelector("[data-mind-culture]");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var width = 0;
  var height = 0;
  var dpr = 1;
  var visible = true;
  var rafId = 0;

  // Smooth pointer parallax state (-1..1)
  var pointer = { tx: 0, ty: 0, x: 0, y: 0, active: false };

  // Palette harmonized with Mind & Culture Lab identity
  var PALETTE = {
    sageDeep: [30, 71, 48],
    sageInk: [40, 92, 63],
    sage: [90, 162, 118],
    terracotta: [230, 130, 30],
    sienna: [217, 80, 4],
    violet: [124, 99, 201],
    gold: [218, 165, 62],
    ivory: [250, 248, 243]
  };

  var SOCIETY_COLORS = [
    PALETTE.sageInk,
    PALETTE.terracotta,
    PALETTE.sienna,
    PALETTE.violet
  ];

  function rgba(rgb, a) {
    return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a.toFixed(3) + ")";
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function mixRgb(c1, c2, t) {
    return [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t))
    ];
  }

  // 1. Build 3D inner neural constellation ("The Developing Mind")
  var mindNodes = [];
  var GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  var MIND_COUNT = 26;
  for (var i = 0; i < MIND_COUNT; i += 1) {
    var yNorm = 1 - (i / (MIND_COUNT - 1)) * 2;
    var rSlice = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
    var theta = GOLDEN_ANGLE * i;
    var shell = i < 6 ? 0.42 : 0.72 + (i % 3) * 0.13;
    mindNodes.push({
      bx: Math.cos(theta) * rSlice * shell,
      by: yNorm * shell,
      bz: Math.sin(theta) * rSlice * shell,
      phase: i * 0.73,
      energy: 0.25 + (i % 4) * 0.1,
      cultureTint: 0,
      px: 0,
      py: 0,
      pz: 0
    });
  }

  var mindEdges = [];
  for (var a = 0; a < MIND_COUNT; a += 1) {
    for (var b = a + 1; b < MIND_COUNT; b += 1) {
      var dx = mindNodes[a].bx - mindNodes[b].bx;
      var dy = mindNodes[a].by - mindNodes[b].by;
      var dz = mindNodes[a].bz - mindNodes[b].bz;
      var dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 0.76) {
        mindEdges.push({ a: a, b: b, dist: dist });
      }
    }
  }

  // 2. Build 4 cardinal cultural hubs + perimeter tapestry nodes ("Culture")
  var hubs = [];
  for (var q = 0; q < 4; q += 1) {
    var baseAngle = Math.PI * 0.25 + q * (Math.PI * 0.5);
    var satellites = [];
    for (var s = 0; s < 6; s += 1) {
      satellites.push({
        angleOffset: (s / 6) * Math.PI * 2,
        orbit: s % 2 === 0 ? 1.0 : 1.24,
        size: s % 2 === 0 ? 2.8 : 2.1,
        phase: q * 1.3 + s * 0.9
      });
    }
    hubs.push({
      index: q,
      baseAngle: baseAngle,
      color: SOCIETY_COLORS[q],
      bloom: 0.2,
      ripple: 0,
      satellites: satellites,
      x: 0,
      y: 0
    });
  }

  // Cubic Bezier evaluator
  function cubicPoint(p0, p1, p2, p3, t) {
    var u = 1 - t;
    var uu = u * u;
    var uuu = uu * u;
    var tt = t * t;
    var ttt = tt * t;
    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    };
  }

  // 3. Bidirectional signal particles
  // dir = 1: Mind -> Culture (sage/gold); dir = -1: Culture -> Mind (terracotta/violet)
  var signals = [];
  var SIGNAL_COUNT = 36;
  for (var p = 0; p < SIGNAL_COUNT; p += 1) {
    signals.push({
      quadrant: p % 4,
      dir: p % 2 === 0 ? 1 : -1,
      t: (p / SIGNAL_COUNT) % 1,
      speed: 0.18 + (p % 5) * 0.028,
      lane: ((p % 3) - 1) * 0.45,
      size: 2.1 + (p % 3) * 0.65
    });
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  var container = canvas.parentElement || canvas;
  container.addEventListener("pointermove", function (e) {
    var r = canvas.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
    pointer.ty = ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1;
    pointer.active = true;
  });

  container.addEventListener("pointerleave", function () {
    pointer.tx = 0;
    pointer.ty = 0;
    pointer.active = false;
  });

  if (typeof ResizeObserver !== "undefined") {
    var ro = new ResizeObserver(function () {
      resize();
      if (reducedMotion) renderFrame(2.4, 0.016);
    });
    ro.observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }

  if (typeof IntersectionObserver !== "undefined") {
    var io = new IntersectionObserver(
      function (entries) {
        visible = entries.some(function (en) {
          return en.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);
  }

  function getConduitControlPoints(cx, cy, R, q, rot, laneOffset) {
    var a = Math.PI * 0.25 + q * (Math.PI * 0.5) + rot;
    var aPrev = a - Math.PI * 0.34;
    var aNext = a + Math.PI * 0.34;
    var perpX = -Math.sin(a) * laneOffset * R * 0.028;
    var perpY = Math.cos(a) * laneOffset * R * 0.028;

    // Outward curve (Mind star tip -> sweeping right lobe -> Cultural Hub)
    var innerR = R * 0.16;
    var hubR = R * 0.67;
    var p0 = {
      x: cx + Math.cos(a - 0.22) * innerR + perpX * 0.4,
      y: cy + Math.sin(a - 0.22) * innerR + perpY * 0.4
    };
    var p1 = {
      x: cx + Math.cos(aPrev) * R * 0.46 + perpX,
      y: cy + Math.sin(aPrev) * R * 0.46 + perpY
    };
    var p2 = {
      x: cx + Math.cos(a - 0.16) * R * 0.82 + perpX,
      y: cy + Math.sin(a - 0.16) * R * 0.82 + perpY
    };
    var p3 = {
      x: cx + Math.cos(a) * hubR,
      y: cy + Math.sin(a) * hubR
    };

    // Inward counter-weaving curve (Cultural Hub -> sweeping left lobe -> Mind star core)
    var q0 = p3;
    var q1 = {
      x: cx + Math.cos(a + 0.18) * R * 0.82 - perpX,
      y: cy + Math.sin(a + 0.18) * R * 0.82 - perpY
    };
    var q2 = {
      x: cx + Math.cos(aNext) * R * 0.45 - perpX,
      y: cy + Math.sin(aNext) * R * 0.45 - perpY
    };
    var q3 = {
      x: cx + Math.cos(a + 0.22) * innerR - perpX * 0.4,
      y: cy + Math.sin(a + 0.22) * innerR - perpY * 0.4
    };

    return { out: [p0, p1, p2, p3], back: [q0, q1, q2, q3], hub: p3, angle: a };
  }

  var lastTime = performance.now();

  function renderFrame(timeSec, dt) {
    ctx.clearRect(0, 0, width, height);

    pointer.x = lerp(pointer.x, pointer.tx, 0.065);
    pointer.y = lerp(pointer.y, pointer.ty, 0.065);

    var cx = width * 0.5 + pointer.x * width * 0.018;
    var cy = height * 0.5 + pointer.y * height * 0.018;
    var R = Math.min(width, height) * 0.445;

    // Soft frameless radial glow (fades completely to 0 before canvas bounds)
    var aura = ctx.createRadialGradient(cx, cy, R * 0.04, cx, cy, R * 1.06);
    aura.addColorStop(0, "rgba(90, 162, 118, 0.13)");
    aura.addColorStop(0.48, "rgba(230, 130, 30, 0.065)");
    aura.addColorStop(0.82, "rgba(124, 99, 201, 0.03)");
    aura.addColorStop(1, "rgba(245, 242, 235, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.06, 0, Math.PI * 2);
    ctx.fill();

    var slowRot = timeSec * 0.085;

    // Outer delicate cultural tapestry rings & woven arcs
    ctx.save();
    ctx.strokeStyle = rgba(PALETTE.sageInk, 0.085);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.86, -slowRot * 0.6, Math.PI * 2 - slowRot * 0.6);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = rgba(PALETTE.terracotta, 0.11);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.67, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Compute conduits for the 4 quadrants (the interlocking Mind & Culture Lab knot)
    var conduits = [];
    for (var q = 0; q < 4; q += 1) {
      var cData = getConduitControlPoints(cx, cy, R, q, slowRot, 0);
      conduits.push(cData);
      hubs[q].x = cData.hub.x;
      hubs[q].y = cData.hub.y;
      hubs[q].bloom = Math.max(0.18, hubs[q].bloom - dt * 0.55);
      hubs[q].ripple = (hubs[q].ripple + dt * 0.42) % 1;
    }

    // Inter-society perimeter cultural bridges (linking the 4 cardinal communities)
    for (var qc = 0; qc < 4; qc += 1) {
      var hA = hubs[qc];
      var hB = hubs[(qc + 1) % 4];
      var midAngle = conduits[qc].angle + Math.PI * 0.25;
      var ctrlR = R * (0.93 + Math.sin(timeSec * 1.1 + qc) * 0.025);
      var ctrlX = cx + Math.cos(midAngle) * ctrlR;
      var ctrlY = cy + Math.sin(midAngle) * ctrlR;

      var gradBridge = ctx.createLinearGradient(hA.x, hA.y, hB.x, hB.y);
      gradBridge.addColorStop(0, rgba(hA.color, 0.34));
      gradBridge.addColorStop(0.5, rgba(PALETTE.gold, 0.22));
      gradBridge.addColorStop(1, rgba(hB.color, 0.34));

      ctx.strokeStyle = gradBridge;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(hA.x, hA.y);
      ctx.quadraticCurveTo(ctrlX, ctrlY, hB.x, hB.y);
      ctx.stroke();

      // Secondary inner harmonic cultural arc
      var ctrlInnerX = cx + Math.cos(midAngle) * R * 0.52;
      var ctrlInnerY = cy + Math.sin(midAngle) * R * 0.52;
      ctx.strokeStyle = rgba(hA.color, 0.14);
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(hA.x, hA.y);
      ctx.quadraticCurveTo(ctrlInnerX, ctrlInnerY, hB.x, hB.y);
      ctx.stroke();
    }

    // Draw multi-strand interlocking Lab Knot ribbons (Mind <-> Culture conduits)
    var STRANDS = [-1.1, -0.55, 0, 0.55, 1.1];
    for (var qk = 0; qk < 4; qk += 1) {
      var hubColor = hubs[qk].color;
      for (var si = 0; si < STRANDS.length; si += 1) {
        var lane = STRANDS[si];
        var strandC = getConduitControlPoints(cx, cy, R, qk, slowRot, lane);
        var isCenter = si === 2;

        // Outward Mind -> Culture ribbon strand
        var outGrad = ctx.createLinearGradient(
          strandC.out[0].x,
          strandC.out[0].y,
          strandC.out[3].x,
          strandC.out[3].y
        );
        outGrad.addColorStop(0, rgba(PALETTE.sageInk, isCenter ? 0.62 : 0.22));
        outGrad.addColorStop(0.55, rgba(PALETTE.sage, isCenter ? 0.52 : 0.2));
        outGrad.addColorStop(1, rgba(hubColor, isCenter ? 0.58 : 0.22));

        ctx.strokeStyle = outGrad;
        ctx.lineWidth = isCenter ? 2.1 : 1.05;
        ctx.beginPath();
        ctx.moveTo(strandC.out[0].x, strandC.out[0].y);
        ctx.bezierCurveTo(
          strandC.out[1].x,
          strandC.out[1].y,
          strandC.out[2].x,
          strandC.out[2].y,
          strandC.out[3].x,
          strandC.out[3].y
        );
        ctx.stroke();

        // Inward Culture -> Mind counter-weaving ribbon strand
        var inGrad = ctx.createLinearGradient(
          strandC.back[0].x,
          strandC.back[0].y,
          strandC.back[3].x,
          strandC.back[3].y
        );
        inGrad.addColorStop(0, rgba(hubColor, isCenter ? 0.56 : 0.2));
        inGrad.addColorStop(0.5, rgba(PALETTE.terracotta, isCenter ? 0.44 : 0.17));
        inGrad.addColorStop(1, rgba(PALETTE.sageInk, isCenter ? 0.58 : 0.22));

        ctx.strokeStyle = inGrad;
        ctx.lineWidth = isCenter ? 1.9 : 0.95;
        ctx.beginPath();
        ctx.moveTo(strandC.back[0].x, strandC.back[0].y);
        ctx.bezierCurveTo(
          strandC.back[1].x,
          strandC.back[1].y,
          strandC.back[2].x,
          strandC.back[2].y,
          strandC.back[3].x,
          strandC.back[3].y
        );
        ctx.stroke();
      }
    }

    // Central concave 4-pointed Lab Star framing the Mind Core
    ctx.save();
    var starR = R * 0.31;
    var starMidR = R * 0.135;
    ctx.beginPath();
    for (var qs = 0; qs < 4; qs += 1) {
      var tipA = slowRot + qs * (Math.PI * 0.5);
      var nextTipA = tipA + Math.PI * 0.5;
      var ctrlA = tipA + Math.PI * 0.25;
      var sx = cx + Math.cos(tipA) * starR;
      var sy = cy + Math.sin(tipA) * starR;
      var ex = cx + Math.cos(nextTipA) * starR;
      var ey = cy + Math.sin(nextTipA) * starR;
      var mx = cx + Math.cos(ctrlA) * starMidR;
      var my = cy + Math.sin(ctrlA) * starMidR;
      if (qs === 0) ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(mx, my, ex, ey);
    }
    ctx.closePath();
    var coreFill = ctx.createRadialGradient(cx, cy, 0, cx, cy, starR);
    coreFill.addColorStop(0, "rgba(255, 255, 255, 0.72)");
    coreFill.addColorStop(0.75, "rgba(230, 241, 235, 0.34)");
    coreFill.addColorStop(1, "rgba(40, 92, 63, 0.06)");
    ctx.fillStyle = coreFill;
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.sageInk, 0.32);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Project & draw 3D Inner Neural Constellation ("The Developing Mind")
    var mindR = R * 0.255;
    var rotY = timeSec * 0.34 + pointer.x * 0.55;
    var rotX = Math.sin(timeSec * 0.23) * 0.24 - pointer.y * 0.45;
    var cosY = Math.cos(rotY);
    var sinY = Math.sin(rotY);
    var cosX = Math.cos(rotX);
    var sinX = Math.sin(rotX);

    for (var ni = 0; ni < MIND_COUNT; ni += 1) {
      var nd = mindNodes[ni];
      var pulse = 1 + Math.sin(timeSec * 1.9 + nd.phase) * 0.06;
      var x1 = nd.bx * pulse * cosY - nd.bz * pulse * sinY;
      var z1 = nd.bx * pulse * sinY + nd.bz * pulse * cosY;
      var y2 = nd.by * pulse * cosX - z1 * sinX;
      var z2 = nd.by * pulse * sinX + z1 * cosX;
      var persp = 1 / (1 - z2 * 0.26);
      nd.px = cx + x1 * mindR * persp;
      nd.py = cy + y2 * mindR * persp;
      nd.pz = z2;
      nd.energy = Math.max(0.22, nd.energy - dt * 0.48);
      nd.cultureTint = Math.max(0, nd.cultureTint - dt * 0.42);
    }

    // Draw synaptic filaments
    for (var ei = 0; ei < mindEdges.length; ei += 1) {
      var edge = mindEdges[ei];
      var n1 = mindNodes[edge.a];
      var n2 = mindNodes[edge.b];
      var depthAlpha = 0.16 + ((n1.pz + n2.pz + 2) * 0.25) * 0.28;
      var boost = (n1.energy + n2.energy) * 0.35;
      var cMix = Math.min(1, (n1.cultureTint + n2.cultureTint) * 0.5);
      var lineCol = mixRgb(PALETTE.sageInk, PALETTE.terracotta, cMix * 0.75);

      ctx.strokeStyle = rgba(lineCol, Math.min(0.82, depthAlpha + boost * 0.32));
      ctx.lineWidth = 0.9 + boost * 1.1;
      ctx.beginPath();
      var midNx = (n1.px + n2.px) * 0.5 + (n1.py - n2.py) * 0.08;
      var midNy = (n1.py + n2.py) * 0.5 + (n2.px - n1.px) * 0.08;
      ctx.moveTo(n1.px, n1.py);
      ctx.quadraticCurveTo(midNx, midNy, n2.px, n2.py);
      ctx.stroke();
    }

    // Sort mind nodes back-to-front for crisp 2.5D depth
    var sortedMind = mindNodes.slice().sort(function (u, v) {
      return u.pz - v.pz;
    });
    for (var sm = 0; sm < sortedMind.length; sm += 1) {
      var mn = sortedMind[sm];
      var zScale = 0.72 + (mn.pz + 1) * 0.32;
      var nodeRadius = (2.2 + mn.energy * 2.4) * zScale;
      var nodeCol = mixRgb(PALETTE.sageInk, PALETTE.terracotta, Math.min(1, mn.cultureTint));

      if (mn.energy > 0.45) {
        ctx.fillStyle = rgba(nodeCol, (mn.energy - 0.35) * 0.28);
        ctx.beginPath();
        ctx.arc(mn.px, mn.py, nodeRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = rgba(nodeCol, 0.88);
      ctx.beginPath();
      ctx.arc(mn.px, mn.py, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = rgba(PALETTE.ivory, 0.85);
      ctx.beginPath();
      ctx.arc(mn.px - nodeRadius * 0.25, mn.py - nodeRadius * 0.25, nodeRadius * 0.34, 0, Math.PI * 2);
      ctx.fill();
    }

    // Update & render bidirectional signals along the knot conduits
    for (var sp = 0; sp < signals.length; sp += 1) {
      var sig = signals[sp];
      if (!reducedMotion) {
        sig.t += dt * sig.speed;
      }
      if (sig.t >= 1) {
        sig.t -= 1;
        if (sig.dir === 1) {
          // Mind pulse arrived at Cultural Hub -> bloom culture!
          hubs[sig.quadrant].bloom = Math.min(1, hubs[sig.quadrant].bloom + 0.42);
        } else {
          // Cultural wave arrived at Mind Core -> reshape & ignite inner synapses!
          var targetIdx = (sig.quadrant * 6 + sp) % MIND_COUNT;
          mindNodes[targetIdx].energy = 1.0;
          mindNodes[targetIdx].cultureTint = 1.0;
          mindNodes[(targetIdx + 3) % MIND_COUNT].energy = 0.85;
          mindNodes[(targetIdx + 3) % MIND_COUNT].cultureTint = 0.8;
        }
      }

      var laneC = getConduitControlPoints(cx, cy, R, sig.quadrant, slowRot, sig.lane);
      var pts = sig.dir === 1 ? laneC.out : laneC.back;
      var pos = cubicPoint(pts[0], pts[1], pts[2], pts[3], sig.t);
      var tailT = Math.max(0, sig.t - 0.065);
      var tailPos = cubicPoint(pts[0], pts[1], pts[2], pts[3], tailT);

      var sigColor =
        sig.dir === 1
          ? mixRgb(PALETTE.sage, PALETTE.gold, sig.t * 0.65)
          : mixRgb(hubs[sig.quadrant].color, PALETTE.terracotta, 0.5);

      var fade = Math.sin(sig.t * Math.PI);

      // Luminous comet trail
      var trailGrad = ctx.createLinearGradient(tailPos.x, tailPos.y, pos.x, pos.y);
      trailGrad.addColorStop(0, rgba(sigColor, 0));
      trailGrad.addColorStop(1, rgba(sigColor, 0.78 * fade));
      ctx.strokeStyle = trailGrad;
      ctx.lineWidth = sig.size * 1.15;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tailPos.x, tailPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      // Glowing particle head
      ctx.fillStyle = rgba(sigColor, 0.24 * fade);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, sig.size * 2.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = rgba(sigColor, 0.95 * fade);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, sig.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw the 4 Cardinal Cultural Community Rings & Social Satellites
    var ringR = R * 0.115;
    for (var qh = 0; qh < 4; qh += 1) {
      var hub = hubs[qh];
      var hCol = hub.color;

      // Pointer proximity resonance
      if (pointer.active) {
        var pxCanvas = (pointer.x + 1) * 0.5 * width;
        var pyCanvas = (pointer.y + 1) * 0.5 * height;
        var dHub = Math.hypot(pxCanvas - hub.x, pyCanvas - hub.y);
        if (dHub < R * 0.28) {
          hub.bloom = Math.min(1, hub.bloom + 0.08);
        }
      }

      // Expanding harmonic cultural ripple
      var ripRadius = ringR * (1.15 + hub.ripple * 1.45);
      ctx.strokeStyle = rgba(hCol, (1 - hub.ripple) * 0.28 * (0.5 + hub.bloom));
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, ripRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Community circle halo
      var hubGlow = ctx.createRadialGradient(hub.x, hub.y, ringR * 0.15, hub.x, hub.y, ringR * 1.85);
      hubGlow.addColorStop(0, rgba(PALETTE.ivory, 0.95));
      hubGlow.addColorStop(0.55, rgba(hCol, 0.14 + hub.bloom * 0.16));
      hubGlow.addColorStop(1, rgba(hCol, 0));
      ctx.fillStyle = hubGlow;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, ringR * 1.85, 0, Math.PI * 2);
      ctx.fill();

      // Crisp Lab-emblem corner circle
      ctx.fillStyle = rgba(PALETTE.ivory, 0.92);
      ctx.strokeStyle = rgba(hCol, 0.78);
      ctx.lineWidth = 2.4 + hub.bloom * 1.1;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, ringR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner cultural motif dot
      ctx.fillStyle = rgba(hCol, 0.85);
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 3.6 + hub.bloom * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting community members / social lattice around each cultural ring
      for (var st = 0; st < hub.satellites.length; st += 1) {
        var sat = hub.satellites[st];
        var satA = sat.angleOffset + timeSec * (st % 2 === 0 ? 0.38 : -0.28) + qh * 0.6;
        var satOrbitR = ringR * (1.42 * sat.orbit);
        var sxPos = hub.x + Math.cos(satA) * satOrbitR;
        var syPos = hub.y + Math.sin(satA) * satOrbitR;

        ctx.strokeStyle = rgba(hCol, 0.22 + hub.bloom * 0.18);
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(
          hub.x + Math.cos(satA) * ringR,
          hub.y + Math.sin(satA) * ringR
        );
        ctx.lineTo(sxPos, syPos);
        ctx.stroke();

        ctx.fillStyle = rgba(hCol, 0.82);
        ctx.beginPath();
        ctx.arc(sxPos, syPos, sat.size + hub.bloom * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    if (!visible) {
      lastTime = now;
      return;
    }
    var dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;
    renderFrame(now * 0.001, dt);
  }

  resize();
  if (reducedMotion) {
    renderFrame(2.4, 0.016);
  } else {
    rafId = requestAnimationFrame(loop);
  }
})();
