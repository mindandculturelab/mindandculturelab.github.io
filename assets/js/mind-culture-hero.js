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

  var pointer = { tx: 0, ty: 0, x: 0, y: 0, active: false };

  // Brand stripe colors from mindandculturelab.com / og-image
  var PALETTE = {
    sageDeep: [36, 84, 58],
    sageInk: [47, 107, 74],
    sage: [90, 162, 118],
    terracotta: [238, 135, 31],
    sienna: [232, 84, 0],
    lilac: [207, 188, 249],
    violet: [124, 99, 201],
    gold: [218, 165, 62],
    ivory: [250, 248, 243],
    ink: [28, 26, 23]
  };

  var HUB_COLORS = [PALETTE.sageInk, PALETTE.terracotta, PALETTE.lilac, PALETTE.sienna];

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

  // Inner neural constellation (cool element kept inside the logo star)
  var mindNodes = [];
  var GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  var MIND_COUNT = 22;
  for (var i = 0; i < MIND_COUNT; i += 1) {
    var yNorm = 1 - (i / (MIND_COUNT - 1)) * 2;
    var rSlice = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
    var theta = GOLDEN_ANGLE * i;
    var shell = i < 5 ? 0.38 : 0.68 + (i % 3) * 0.12;
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
      if (dist < 0.78) mindEdges.push({ a: a, b: b });
    }
  }

  // Four interlocking corner hubs (logo geometry at NE / SE / SW / NW)
  var hubs = [];
  for (var q = 0; q < 4; q += 1) {
    var sats = [];
    for (var s = 0; s < 5; s += 1) {
      sats.push({
        angleOffset: (s / 5) * Math.PI * 2,
        orbit: s % 2 === 0 ? 1.0 : 1.18,
        size: s % 2 === 0 ? 2.4 : 1.9,
        phase: q * 1.2 + s * 0.85
      });
    }
    hubs.push({
      index: q,
      // Logo places circles at diagonal cardinals
      baseAngle: Math.PI * 0.25 + q * (Math.PI * 0.5),
      color: HUB_COLORS[q],
      bloom: 0.2,
      ripple: 0,
      satellites: sats,
      x: 0,
      y: 0
    });
  }

  // Bidirectional signal particles along logo sweep arcs
  var signals = [];
  for (var p = 0; p < 32; p += 1) {
    signals.push({
      quadrant: p % 4,
      dir: p % 2 === 0 ? 1 : -1,
      t: (p / 32) % 1,
      speed: 0.16 + (p % 5) * 0.026,
      lane: ((p % 3) - 1) * 0.35,
      size: 2.0 + (p % 3) * 0.55
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
    new ResizeObserver(function () {
      resize();
      if (reducedMotion) renderFrame(2.4, 0.016);
    }).observe(canvas);
  } else {
    window.addEventListener("resize", resize);
  }

  if (typeof IntersectionObserver !== "undefined") {
    new IntersectionObserver(
      function (entries) {
        visible = entries.some(function (en) {
          return en.isIntersecting;
        });
      },
      { threshold: 0.05 }
    ).observe(canvas);
  }

  /** Logo-faithful sweep from concave star tip → interlocking corner circle */
  function getLogoArc(cx, cy, R, q, rot, lane) {
    var a = Math.PI * 0.25 + q * (Math.PI * 0.5) + rot;
    var tipR = R * 0.28;
    var hubR = R * 0.72;
    var hubCircleR = R * 0.165;
    var perpX = -Math.sin(a) * lane * R * 0.03;
    var perpY = Math.cos(a) * lane * R * 0.03;

    // Star tip (slightly inset from concave point)
    var p0 = {
      x: cx + Math.cos(a) * tipR + perpX * 0.3,
      y: cy + Math.sin(a) * tipR + perpY * 0.3
    };
    // Logo sweep: curve ahead of the radial, then back into the corner circle
    var sweep = 0.55;
    var p1 = {
      x: cx + Math.cos(a - sweep) * R * 0.52 + perpX,
      y: cy + Math.sin(a - sweep) * R * 0.52 + perpY
    };
    var p2 = {
      x: cx + Math.cos(a - 0.12) * R * 0.78 + perpX,
      y: cy + Math.sin(a - 0.12) * R * 0.78 + perpY
    };
    var hub = {
      x: cx + Math.cos(a) * hubR,
      y: cy + Math.sin(a) * hubR
    };
    var p3 = {
      x: hub.x - Math.cos(a) * hubCircleR * 0.55,
      y: hub.y - Math.sin(a) * hubCircleR * 0.55
    };

    // Counter-weave return path (other lobe of the logo line)
    var q1 = {
      x: cx + Math.cos(a + 0.14) * R * 0.78 - perpX,
      y: cy + Math.sin(a + 0.14) * R * 0.78 - perpY
    };
    var q2 = {
      x: cx + Math.cos(a + sweep) * R * 0.5 - perpX,
      y: cy + Math.sin(a + sweep) * R * 0.5 - perpY
    };
    var q3 = {
      x: cx + Math.cos(a) * tipR * 0.92 - perpX * 0.3,
      y: cy + Math.sin(a) * tipR * 0.92 - perpY * 0.3
    };

    return {
      out: [p0, p1, p2, p3],
      back: [p3, q1, q2, q3],
      hub: hub,
      angle: a,
      hubCircleR: hubCircleR
    };
  }

  function drawConcaveStar(cx, cy, tipR, midR, rot) {
    ctx.beginPath();
    for (var qs = 0; qs < 4; qs += 1) {
      var tipA = rot + qs * (Math.PI * 0.5);
      var nextTipA = tipA + Math.PI * 0.5;
      var ctrlA = tipA + Math.PI * 0.25;
      var sx = cx + Math.cos(tipA) * tipR;
      var sy = cy + Math.sin(tipA) * tipR;
      var ex = cx + Math.cos(nextTipA) * tipR;
      var ey = cy + Math.sin(nextTipA) * tipR;
      var mx = cx + Math.cos(ctrlA) * midR;
      var my = cy + Math.sin(ctrlA) * midR;
      if (qs === 0) ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(mx, my, ex, ey);
    }
    ctx.closePath();
  }

  var lastTime = performance.now();

  function renderFrame(timeSec, dt) {
    ctx.clearRect(0, 0, width, height);

    pointer.x = lerp(pointer.x, pointer.tx, 0.065);
    pointer.y = lerp(pointer.y, pointer.ty, 0.065);

    var cx = width * 0.5 + pointer.x * width * 0.016;
    var cy = height * 0.5 + pointer.y * height * 0.016;
    var R = Math.min(width, height) * 0.44;
    var slowRot = timeSec * 0.06;

    // Soft aura
    var aura = ctx.createRadialGradient(cx, cy, R * 0.05, cx, cy, R * 1.08);
    aura.addColorStop(0, "rgba(90, 162, 118, 0.12)");
    aura.addColorStop(0.45, "rgba(238, 135, 31, 0.06)");
    aura.addColorStop(0.78, "rgba(207, 188, 249, 0.04)");
    aura.addColorStop(1, "rgba(244, 240, 232, 0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2);
    ctx.fill();

    // Update hub positions from logo geometry
    var arcs = [];
    for (var q = 0; q < 4; q += 1) {
      var arc = getLogoArc(cx, cy, R, q, slowRot, 0);
      arcs.push(arc);
      hubs[q].x = arc.hub.x;
      hubs[q].y = arc.hub.y;
      hubs[q].bloom = Math.max(0.16, hubs[q].bloom - dt * 0.5);
      hubs[q].ripple = (hubs[q].ripple + dt * 0.4) % 1;
    }

    var ringR = arcs[0].hubCircleR;
    var outerR = R * 0.72;

    // --- Logo outer ring broken into 4 arcs between interlocking circles ---
    ctx.save();
    ctx.strokeStyle = rgba(PALETTE.ink, 0.78);
    ctx.lineWidth = 2.15;
    ctx.lineCap = "round";
    for (var qa = 0; qa < 4; qa += 1) {
      var a0 = arcs[qa].angle;
      var a1 = arcs[(qa + 1) % 4].angle;
      if (a1 < a0) a1 += Math.PI * 2;
      // Leave gaps where corner circles sit
      var gap = Math.asin(Math.min(0.95, (ringR * 0.92) / outerR));
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, a0 + gap, a1 - gap);
      ctx.stroke();
    }
    ctx.restore();

    // Subtle dashed cultural orbit inside the logo ring
    ctx.save();
    ctx.strokeStyle = rgba(PALETTE.sageInk, 0.12);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 7]);
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.48, -slowRot, Math.PI * 2 - slowRot);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Inter-society bridges along the outer ring (cool element)
    for (var qb = 0; qb < 4; qb += 1) {
      var hA = hubs[qb];
      var hB = hubs[(qb + 1) % 4];
      var midA = arcs[qb].angle + Math.PI * 0.25;
      var ctrl = {
        x: cx + Math.cos(midA) * (outerR + ringR * 0.35),
        y: cy + Math.sin(midA) * (outerR + ringR * 0.35)
      };
      var g = ctx.createLinearGradient(hA.x, hA.y, hB.x, hB.y);
      g.addColorStop(0, rgba(hA.color, 0.28));
      g.addColorStop(0.5, rgba(PALETTE.gold, 0.18));
      g.addColorStop(1, rgba(hB.color, 0.28));
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      ctx.moveTo(hA.x, hA.y);
      ctx.quadraticCurveTo(ctrl.x, ctrl.y, hB.x, hB.y);
      ctx.stroke();
    }

    // --- Logo sweep lines (star ↔ corner circles), multi-strand ---
    var STRANDS = [-0.85, 0, 0.85];
    for (var qk = 0; qk < 4; qk += 1) {
      var hubColor = hubs[qk].color;
      for (var si = 0; si < STRANDS.length; si += 1) {
        var strand = getLogoArc(cx, cy, R, qk, slowRot, STRANDS[si]);
        var isCenter = si === 1;

        var outGrad = ctx.createLinearGradient(
          strand.out[0].x,
          strand.out[0].y,
          strand.out[3].x,
          strand.out[3].y
        );
        outGrad.addColorStop(0, rgba(PALETTE.ink, isCenter ? 0.72 : 0.22));
        outGrad.addColorStop(0.5, rgba(PALETTE.sageInk, isCenter ? 0.55 : 0.18));
        outGrad.addColorStop(1, rgba(hubColor, isCenter ? 0.7 : 0.22));

        ctx.strokeStyle = outGrad;
        ctx.lineWidth = isCenter ? 2.05 : 1.0;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(strand.out[0].x, strand.out[0].y);
        ctx.bezierCurveTo(
          strand.out[1].x,
          strand.out[1].y,
          strand.out[2].x,
          strand.out[2].y,
          strand.out[3].x,
          strand.out[3].y
        );
        ctx.stroke();

        var inGrad = ctx.createLinearGradient(
          strand.back[0].x,
          strand.back[0].y,
          strand.back[3].x,
          strand.back[3].y
        );
        inGrad.addColorStop(0, rgba(hubColor, isCenter ? 0.55 : 0.16));
        inGrad.addColorStop(0.55, rgba(PALETTE.terracotta, isCenter ? 0.4 : 0.14));
        inGrad.addColorStop(1, rgba(PALETTE.ink, isCenter ? 0.65 : 0.2));

        ctx.strokeStyle = inGrad;
        ctx.lineWidth = isCenter ? 1.7 : 0.9;
        ctx.beginPath();
        ctx.moveTo(strand.back[0].x, strand.back[0].y);
        ctx.bezierCurveTo(
          strand.back[1].x,
          strand.back[1].y,
          strand.back[2].x,
          strand.back[2].y,
          strand.back[3].x,
          strand.back[3].y
        );
        ctx.stroke();
      }
    }

    // --- Central logo star (concave 4-point) ---
    var starTip = R * 0.3;
    var starMid = R * 0.11;
    drawConcaveStar(cx, cy, starTip, starMid, slowRot);
    var coreFill = ctx.createRadialGradient(cx, cy, 0, cx, cy, starTip);
    coreFill.addColorStop(0, "rgba(255, 255, 255, 0.82)");
    coreFill.addColorStop(0.65, "rgba(231, 242, 235, 0.4)");
    coreFill.addColorStop(1, "rgba(47, 107, 74, 0.08)");
    ctx.fillStyle = coreFill;
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.ink, 0.82);
    ctx.lineWidth = 2.05;
    ctx.stroke();

    // Tiny inner star sparkle (logo crosshair feel)
    drawConcaveStar(cx, cy, R * 0.09, R * 0.028, slowRot + Math.PI * 0.25);
    ctx.strokeStyle = rgba(PALETTE.sageInk, 0.45);
    ctx.lineWidth = 1.15;
    ctx.stroke();

    // --- 3D mind constellation inside the star ---
    var mindR = R * 0.2;
    var rotY = timeSec * 0.32 + pointer.x * 0.5;
    var rotX = Math.sin(timeSec * 0.22) * 0.22 - pointer.y * 0.4;
    var cosY = Math.cos(rotY);
    var sinY = Math.sin(rotY);
    var cosX = Math.cos(rotX);
    var sinX = Math.sin(rotX);

    for (var ni = 0; ni < MIND_COUNT; ni += 1) {
      var nd = mindNodes[ni];
      var pulse = 1 + Math.sin(timeSec * 1.85 + nd.phase) * 0.055;
      var x1 = nd.bx * pulse * cosY - nd.bz * pulse * sinY;
      var z1 = nd.bx * pulse * sinY + nd.bz * pulse * cosY;
      var y2 = nd.by * pulse * cosX - z1 * sinX;
      var z2 = nd.by * pulse * sinX + z1 * cosX;
      var persp = 1 / (1 - z2 * 0.26);
      nd.px = cx + x1 * mindR * persp;
      nd.py = cy + y2 * mindR * persp;
      nd.pz = z2;
      nd.energy = Math.max(0.2, nd.energy - dt * 0.48);
      nd.cultureTint = Math.max(0, nd.cultureTint - dt * 0.42);
    }

    for (var ei = 0; ei < mindEdges.length; ei += 1) {
      var edge = mindEdges[ei];
      var n1 = mindNodes[edge.a];
      var n2 = mindNodes[edge.b];
      var depthAlpha = 0.14 + ((n1.pz + n2.pz + 2) * 0.25) * 0.26;
      var boost = (n1.energy + n2.energy) * 0.32;
      var cMix = Math.min(1, (n1.cultureTint + n2.cultureTint) * 0.5);
      var lineCol = mixRgb(PALETTE.sageInk, PALETTE.terracotta, cMix * 0.75);
      ctx.strokeStyle = rgba(lineCol, Math.min(0.78, depthAlpha + boost * 0.3));
      ctx.lineWidth = 0.85 + boost;
      ctx.beginPath();
      ctx.moveTo(n1.px, n1.py);
      ctx.quadraticCurveTo(
        (n1.px + n2.px) * 0.5 + (n1.py - n2.py) * 0.08,
        (n1.py + n2.py) * 0.5 + (n2.px - n1.px) * 0.08,
        n2.px,
        n2.py
      );
      ctx.stroke();
    }

    var sortedMind = mindNodes.slice().sort(function (u, v) {
      return u.pz - v.pz;
    });
    for (var sm = 0; sm < sortedMind.length; sm += 1) {
      var mn = sortedMind[sm];
      var zScale = 0.72 + (mn.pz + 1) * 0.3;
      var nodeRadius = (2.0 + mn.energy * 2.2) * zScale;
      var nodeCol = mixRgb(PALETTE.sageInk, PALETTE.terracotta, Math.min(1, mn.cultureTint));
      if (mn.energy > 0.45) {
        ctx.fillStyle = rgba(nodeCol, (mn.energy - 0.35) * 0.26);
        ctx.beginPath();
        ctx.arc(mn.px, mn.py, nodeRadius * 2.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = rgba(nodeCol, 0.9);
      ctx.beginPath();
      ctx.arc(mn.px, mn.py, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba(PALETTE.ivory, 0.85);
      ctx.beginPath();
      ctx.arc(mn.px - nodeRadius * 0.25, mn.py - nodeRadius * 0.25, nodeRadius * 0.32, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Signal particles on logo arcs ---
    for (var sp = 0; sp < signals.length; sp += 1) {
      var sig = signals[sp];
      if (!reducedMotion) sig.t += dt * sig.speed;
      if (sig.t >= 1) {
        sig.t -= 1;
        if (sig.dir === 1) {
          hubs[sig.quadrant].bloom = Math.min(1, hubs[sig.quadrant].bloom + 0.4);
        } else {
          var targetIdx = (sig.quadrant * 5 + sp) % MIND_COUNT;
          mindNodes[targetIdx].energy = 1;
          mindNodes[targetIdx].cultureTint = 1;
          mindNodes[(targetIdx + 2) % MIND_COUNT].energy = 0.82;
          mindNodes[(targetIdx + 2) % MIND_COUNT].cultureTint = 0.75;
        }
      }

      var laneC = getLogoArc(cx, cy, R, sig.quadrant, slowRot, sig.lane);
      var pts = sig.dir === 1 ? laneC.out : laneC.back;
      var pos = cubicPoint(pts[0], pts[1], pts[2], pts[3], sig.t);
      var tailPos = cubicPoint(pts[0], pts[1], pts[2], pts[3], Math.max(0, sig.t - 0.06));
      var sigColor =
        sig.dir === 1
          ? mixRgb(PALETTE.sage, PALETTE.gold, sig.t * 0.6)
          : mixRgb(hubs[sig.quadrant].color, PALETTE.terracotta, 0.45);
      var fade = Math.sin(sig.t * Math.PI);

      var trailGrad = ctx.createLinearGradient(tailPos.x, tailPos.y, pos.x, pos.y);
      trailGrad.addColorStop(0, rgba(sigColor, 0));
      trailGrad.addColorStop(1, rgba(sigColor, 0.75 * fade));
      ctx.strokeStyle = trailGrad;
      ctx.lineWidth = sig.size * 1.1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tailPos.x, tailPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      ctx.fillStyle = rgba(sigColor, 0.22 * fade);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, sig.size * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba(sigColor, 0.95 * fade);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, sig.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Four interlocking corner circles (logo) ---
    for (var qh = 0; qh < 4; qh += 1) {
      var hub = hubs[qh];
      var hCol = hub.color;

      if (pointer.active) {
        var pxCanvas = (pointer.x + 1) * 0.5 * width;
        var pyCanvas = (pointer.y + 1) * 0.5 * height;
        if (Math.hypot(pxCanvas - hub.x, pyCanvas - hub.y) < R * 0.26) {
          hub.bloom = Math.min(1, hub.bloom + 0.08);
        }
      }

      // Ripple
      ctx.strokeStyle = rgba(hCol, (1 - hub.ripple) * 0.26 * (0.5 + hub.bloom));
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, ringR * (1.12 + hub.ripple * 1.35), 0, Math.PI * 2);
      ctx.stroke();

      // Halo
      var hubGlow = ctx.createRadialGradient(hub.x, hub.y, ringR * 0.2, hub.x, hub.y, ringR * 1.7);
      hubGlow.addColorStop(0, rgba(PALETTE.ivory, 0.95));
      hubGlow.addColorStop(0.55, rgba(hCol, 0.16 + hub.bloom * 0.14));
      hubGlow.addColorStop(1, rgba(hCol, 0));
      ctx.fillStyle = hubGlow;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, ringR * 1.7, 0, Math.PI * 2);
      ctx.fill();

      // Solid logo circle
      ctx.fillStyle = rgba(PALETTE.ivory, 0.96);
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, ringR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = rgba(PALETTE.ink, 0.88);
      ctx.lineWidth = 2.15 + hub.bloom * 0.6;
      ctx.stroke();

      // Colored inner ring (brand accent inside logo circle)
      ctx.strokeStyle = rgba(hCol, 0.75);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, ringR * 0.62, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = rgba(hCol, 0.88);
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, 3.2 + hub.bloom * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting social satellites (cool element)
      for (var st = 0; st < hub.satellites.length; st += 1) {
        var sat = hub.satellites[st];
        var satA = sat.angleOffset + timeSec * (st % 2 === 0 ? 0.36 : -0.26) + qh * 0.5;
        var satOrbitR = ringR * (1.38 * sat.orbit);
        var sxPos = hub.x + Math.cos(satA) * satOrbitR;
        var syPos = hub.y + Math.sin(satA) * satOrbitR;
        ctx.strokeStyle = rgba(hCol, 0.2 + hub.bloom * 0.16);
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(hub.x + Math.cos(satA) * ringR, hub.y + Math.sin(satA) * ringR);
        ctx.lineTo(sxPos, syPos);
        ctx.stroke();
        ctx.fillStyle = rgba(hCol, 0.82);
        ctx.beginPath();
        ctx.arc(sxPos, syPos, sat.size + hub.bloom * 0.6, 0, Math.PI * 2);
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
