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
  var artReady = false;
  var time = 0;
  var lastTime = performance.now();
  var pulseT = 0;
  var pulseActive = false;
  var nextPulse = 2.4;
  var sparks = [];
  var ribbons = [];
  var softTimers = [];

  var pointer = { tx: 0, ty: 0, x: 0, y: 0, active: false };

  var NAVY = "#1c2740";
  var ORANGE = "#e97832";
  var RED = "#d92b2b";
  var TEAL = "#1f9e8f";
  var SAND = "#c9a57c";

  var art = new Image();
  art.decoding = "async";
  art.onload = function () {
    artReady = true;
    if (reducedMotion) renderFrame(0);
  };
  art.src = "assets/images/mind-culture-hero.png?v=sips3";

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function setTimeoutSoft(fn, ms) {
    softTimers.push({ fn: fn, at: performance.now() + ms });
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
  container.addEventListener(
    "pointerdown",
    function () {
      triggerPulse(true);
    },
    { passive: true }
  );

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(function () {
      resize();
      if (reducedMotion) renderFrame(0);
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

  /**
   * Motif components — living pieces that peel from the illustration,
   * orbit, trade energy, and dock back into the composition.
   */
  function Motif(id, nx, ny, depth, radius, drawer) {
    this.id = id;
    this.nx = nx;
    this.ny = ny;
    this.depth = depth;
    this.radius = radius;
    this.drawer = drawer;
    this.x = 0;
    this.y = 0;
    this.ox = 0;
    this.oy = 0;
    this.vx = 0;
    this.vy = 0;
    this.energy = 0;
    this.orbit = Math.random() * Math.PI * 2;
    this.free = 0;
    this._init = false;
  }

  Motif.prototype.home = function () {
    return {
      x: this.nx * width + this.ox,
      y: this.ny * height + this.oy
    };
  };

  Motif.prototype.step = function (dt, swayX, swayY) {
    var home = this.home();
    var targetX = home.x + swayX * this.depth;
    var targetY = home.y + swayY * this.depth;

    // Periodic peel-away orbit when free > 0
    if (this.free > 0.01) {
      this.orbit += dt * (1.2 + this.energy);
      var orbitR = this.radius * (0.35 + this.free * 1.8);
      targetX += Math.cos(this.orbit) * orbitR;
      targetY += Math.sin(this.orbit * 1.3) * orbitR * 0.7;
    }

    var ax = (targetX - this.x) * 16;
    var ay = (targetY - this.y) * 16;
    this.vx = (this.vx + ax * dt) * Math.exp(-8 * dt);
    this.vy = (this.vy + ay * dt) * Math.exp(-8 * dt);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.energy = Math.max(0, this.energy - dt * 0.45);
    this.free = Math.max(0, this.free - dt * 0.35);
  };

  // --- Motif drawers ---

  function drawGirih(ctx2, R, t, energy) {
    ctx2.save();
    ctx2.rotate(t * 0.12 + energy * 0.5);
    ctx2.beginPath();
    ctx2.arc(0, 0, R, 0, Math.PI * 2);
    ctx2.fillStyle = "rgba(201, 165, 124, 0.28)";
    ctx2.fill();
    ctx2.strokeStyle = SAND;
    ctx2.lineWidth = Math.max(1, R * 0.025);
    ctx2.globalAlpha = 0.85 + energy * 0.15;
    ctx2.stroke();

    for (var ring = 1; ring <= 5; ring += 1) {
      var rr = (R * ring) / 5.2;
      var n = 6 + ring;
      ctx2.strokeStyle = "rgba(180, 140, 95," + (0.4 + energy * 0.4).toFixed(3) + ")";
      ctx2.lineWidth = Math.max(0.7, R * 0.012);
      for (var i = 0; i < n; i += 1) {
        var a0 = (i / n) * Math.PI * 2 + ring * 0.15;
        var a1 = a0 + (Math.PI * 2 * 2) / n;
        ctx2.beginPath();
        ctx2.moveTo(Math.cos(a0) * rr * 0.25, Math.sin(a0) * rr * 0.25);
        ctx2.lineTo(Math.cos(a0) * rr, Math.sin(a0) * rr);
        ctx2.lineTo(Math.cos(a1) * rr, Math.sin(a1) * rr);
        ctx2.closePath();
        ctx2.stroke();
      }
    }
    // center star
    ctx2.beginPath();
    for (var k = 0; k < 12; k += 1) {
      var ang = (k / 12) * Math.PI * 2 - Math.PI / 2;
      var rad = k % 2 === 0 ? R * 0.18 : R * 0.08;
      var px = Math.cos(ang) * rad;
      var py = Math.sin(ang) * rad;
      if (k === 0) ctx2.moveTo(px, py);
      else ctx2.lineTo(px, py);
    }
    ctx2.closePath();
    ctx2.strokeStyle = SAND;
    ctx2.lineWidth = Math.max(1, R * 0.02);
    ctx2.stroke();
    ctx2.restore();
  }

  function drawSun(ctx2, R, energy) {
    var g = ctx2.createRadialGradient(0, 0, R * 0.2, 0, 0, R * 2.1);
    g.addColorStop(0, "rgba(217, 43, 43," + (0.5 + energy * 0.4).toFixed(3) + ")");
    g.addColorStop(1, "rgba(217, 43, 43, 0)");
    ctx2.fillStyle = g;
    ctx2.beginPath();
    ctx2.arc(0, 0, R * 2.1, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.beginPath();
    ctx2.arc(0, 0, R * (1 + energy * 0.12), 0, Math.PI * 2);
    ctx2.fillStyle = RED;
    ctx2.fill();
  }

  function drawBars(ctx2, W, energy, t) {
    var h = W * 0.1;
    var gap = h * 1.4;
    var total = gap * 3 + h;
    for (var i = 0; i < 4; i += 1) {
      var y = -total / 2 + i * gap;
      var slide = Math.sin(t * 1.8 + i * 0.85) * W * 0.05 * (0.35 + energy);
      var len = W * (0.9 + Math.sin(t * 2.2 + i * 0.5) * 0.06 * (0.5 + energy));
      ctx2.fillStyle = TEAL;
      ctx2.globalAlpha = 0.8 + energy * 0.2;
      roundRect(ctx2, -len / 2 + slide, y, len, h, h * 0.25);
      ctx2.fill();
    }
    ctx2.globalAlpha = 1;
  }

  function roundRect(ctx2, x, y, w, h, r) {
    ctx2.beginPath();
    ctx2.moveTo(x + r, y);
    ctx2.arcTo(x + w, y, x + w, y + h, r);
    ctx2.arcTo(x + w, y + h, x, y + h, r);
    ctx2.arcTo(x, y + h, x, y, r);
    ctx2.arcTo(x, y, x + w, y, r);
    ctx2.closePath();
  }

  function drawScales(ctx2, R, energy, t) {
    ctx2.strokeStyle = RED;
    ctx2.lineWidth = Math.max(1.6, R * 0.06);
    ctx2.lineCap = "round";
    for (var row = 0; row < 4; row += 1) {
      var rr = R * (0.42 + row * 0.2 + Math.sin(t * 1.5 + row) * 0.02 * energy);
      var open = Math.PI * (0.95 + energy * 0.2);
      ctx2.globalAlpha = 0.5 + row * 0.12 + energy * 0.2;
      ctx2.beginPath();
      ctx2.arc(0, R * 0.2, rr, -Math.PI * 0.5 - open / 2, -Math.PI * 0.5 + open / 2);
      ctx2.stroke();
    }
    ctx2.globalAlpha = 1;
  }

  function drawCrescent(ctx2, R, energy, t) {
    ctx2.save();
    ctx2.rotate(-0.55 + Math.sin(t * 1.1) * 0.08 + energy * 0.15);
    ctx2.beginPath();
    ctx2.arc(0, 0, R, Math.PI * 0.12, Math.PI * 1.08, false);
    ctx2.arc(R * 0.2, -R * 0.02, R * 0.7, Math.PI * 0.98, Math.PI * 0.18, true);
    ctx2.closePath();
    ctx2.fillStyle = ORANGE;
    ctx2.globalAlpha = 0.92;
    ctx2.fill();
    ctx2.strokeStyle = "rgba(255, 200, 140, 0.4)";
    ctx2.lineWidth = R * 0.05;
    ctx2.stroke();
    ctx2.restore();
    ctx2.globalAlpha = 1;
  }

  function drawWaveOrb(ctx2, R, energy, t) {
    ctx2.save();
    ctx2.beginPath();
    ctx2.arc(0, 0, R, 0, Math.PI * 2);
    ctx2.fillStyle = NAVY;
    ctx2.fill();
    ctx2.save();
    ctx2.beginPath();
    ctx2.arc(0, 0, R, 0, Math.PI * 2);
    ctx2.clip();
    ctx2.rotate(t * 0.35 + energy * 0.8);
    ctx2.translate(0, ((t * 18) % (R * 0.5)) - R * 0.25);
    for (var row = -4; row <= 5; row += 1) {
      for (var col = -4; col <= 4; col += 1) {
        var cx = col * R * 0.55 + (row % 2 ? R * 0.275 : 0);
        var cy = row * R * 0.4;
        ctx2.strokeStyle = ORANGE;
        ctx2.lineWidth = Math.max(1.5, R * 0.06);
        ctx2.beginPath();
        ctx2.arc(cx, cy, R * 0.26, Math.PI * 1.05, Math.PI * 1.95);
        ctx2.stroke();
        ctx2.beginPath();
        ctx2.arc(cx, cy - R * 0.07, R * 0.16, Math.PI * 1.1, Math.PI * 1.9);
        ctx2.stroke();
      }
    }
    ctx2.restore();
    ctx2.beginPath();
    ctx2.arc(0, 0, R, 0, Math.PI * 2);
    ctx2.strokeStyle = NAVY;
    ctx2.lineWidth = R * 0.07;
    ctx2.stroke();
    ctx2.restore();
  }

  function drawMindSpark(ctx2, R, energy, t) {
    if (energy < 0.05) return;
    var n = 8;
    ctx2.save();
    ctx2.globalAlpha = energy * 0.85;
    for (var i = 0; i < n; i += 1) {
      var a = (i / n) * Math.PI * 2 + t * 1.5;
      var rr = R * (0.15 + (i % 3) * 0.08);
      var x = Math.cos(a) * rr;
      var y = Math.sin(a) * rr * 0.55;
      ctx2.fillStyle = i % 2 ? ORANGE : TEAL;
      ctx2.beginPath();
      ctx2.arc(x, y, 1.8 + energy * 1.5, 0, Math.PI * 2);
      ctx2.fill();
      var j = (i + 3) % n;
      var a2 = (j / n) * Math.PI * 2 + t * 1.5;
      var x2 = Math.cos(a2) * R * (0.15 + (j % 3) * 0.08);
      var y2 = Math.sin(a2) * R * (0.15 + (j % 3) * 0.08) * 0.55;
      ctx2.strokeStyle = "rgba(233, 120, 50, 0.45)";
      ctx2.lineWidth = 0.8;
      ctx2.beginPath();
      ctx2.moveTo(x, y);
      ctx2.lineTo(x2, y2);
      ctx2.stroke();
    }
    ctx2.restore();
  }

  // Composition anchors matching the illustration (normalized)
  var motifs = {
    girih: new Motif("girih", 0.3, 0.36, 0.7, 90, drawGirih),
    sun: new Motif("sun", 0.2, 0.2, 0.9, 28, drawSun),
    bars: new Motif("bars", 0.2, 0.72, 0.55, 70, function (c, R, t, e) {
      drawBars(ctx, R * 1.6, e, t);
    }),
    scales: new Motif("scales", 0.36, 0.74, 0.5, 55, drawScales),
    crescent: new Motif("crescent", 0.58, 0.34, 0.4, 70, drawCrescent),
    wave: new Motif("wave", 0.64, 0.38, 0.55, 48, drawWaveOrb),
    mind: new Motif("mind", 0.58, 0.36, 0.25, 40, drawMindSpark)
  };
  var motifList = ["girih", "sun", "bars", "scales", "crescent", "wave", "mind"];

  function triggerPulse(fromUser) {
    if (pulseActive && pulseT < 0.7) return;
    pulseActive = true;
    pulseT = 0;
    nextPulse = fromUser ? 5 : 3.5 + Math.random() * 2.2;

    // Peel culture pieces outward, then feed the mind
    ["bars", "girih", "sun", "scales"].forEach(function (id, i) {
      setTimeoutSoft(function () {
        var m = motifs[id];
        if (!m) return;
        m.free = 1;
        m.energy = 1;
        m.vx += (Math.random() - 0.5) * 120;
        m.vy += (Math.random() - 0.5) * 80;
      }, i * 70);
    });
    setTimeoutSoft(function () {
      motifs.crescent.energy = 1;
      motifs.crescent.free = 0.55;
      motifs.wave.energy = 1;
      motifs.wave.free = 0.45;
      motifs.mind.energy = 1;
    }, 420);
  }

  function spawnRibbon(a, b, color, life) {
    if (!a || !b) return;
    ribbons.push({
      a: a,
      b: b,
      color: color,
      life: life,
      max: life,
      seed: Math.random() * Math.PI * 2
    });
  }

  function spawnSpark(x, y, color) {
    sparks.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 80,
      vy: (Math.random() - 0.5) * 60 - 30,
      life: 0.55 + Math.random() * 0.55,
      r: 1.4 + Math.random() * 2.8,
      color: color
    });
  }

  function artLayout() {
    // Fit illustration into canvas preserving aspect
    var iw = art.naturalWidth || 1024;
    var ih = art.naturalHeight || 576;
    var scale = Math.min(width / iw, height / ih) * 0.98;
    var dw = iw * scale;
    var dh = ih * scale;
    var dx = (width - dw) / 2;
    var dy = (height - dh) / 2;
    return { dx: dx, dy: dy, dw: dw, dh: dh, scale: scale };
  }

  function renderFrame(dt) {
    pointer.x = lerp(pointer.x, pointer.tx, 0.08);
    pointer.y = lerp(pointer.y, pointer.ty, 0.08);

    ctx.clearRect(0, 0, width, height);

    var swayX = pointer.x * width * 0.018;
    var swayY = pointer.y * height * 0.016;
    var layout = artReady ? artLayout() : null;

    // Atmosphere
    var vibe = ctx.createRadialGradient(
      width * 0.55 + swayX,
      height * 0.42 + swayY,
      height * 0.05,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.65
    );
    vibe.addColorStop(0, "rgba(255, 252, 247, 0.8)");
    vibe.addColorStop(0.55, "rgba(244, 239, 230, 0.25)");
    vibe.addColorStop(1, "rgba(244, 239, 230, 0)");
    ctx.fillStyle = vibe;
    ctx.fillRect(0, 0, width, height);

    // Base illustration — assembled mind & culture
    if (artReady && layout) {
      var breath = 1 + Math.sin(time * 0.9) * 0.008;
      var imgAlpha = pulseActive ? 0.82 + (1 - Math.min(1, pulseT)) * 0.14 : 1;
      ctx.save();
      ctx.translate(width / 2 + swayX * 0.35, height / 2 + swayY * 0.35);
      ctx.scale(breath, breath);
      ctx.translate(-width / 2, -height / 2);
      ctx.globalAlpha = imgAlpha;
      ctx.drawImage(art, layout.dx, layout.dy, layout.dw, layout.dh);
      ctx.restore();
      ctx.globalAlpha = 1;

      // Sync motif homes to illustration regions
      motifs.girih.ox = layout.dx + layout.dw * 0.02;
      motifs.girih.oy = layout.dy;
      // homes already normalized to full canvas; nudge with art box
      motifList.forEach(function (id) {
        var m = motifs[id];
        // Remap normalized coords into the drawn art rect
        m.ox = 0;
        m.oy = 0;
        m.nx = (layout.dx + layout.dw * m._nx0) / width;
        m.ny = (layout.dy + layout.dh * m._ny0) / height;
      });
    }

    // Tiny idle breath — full motif clones only appear when energized / peeled
    motifs.wave.energy = Math.max(motifs.wave.energy, 0.04 + Math.sin(time * 1.1) * 0.02);
    motifs.sun.energy = Math.max(motifs.sun.energy, 0.03 + Math.sin(time * 1.4) * 0.02);

    // Init motif pixel positions
    motifList.forEach(function (id) {
      var m = motifs[id];
      if (!m._init) {
        var h = m.home();
        m.x = h.x;
        m.y = h.y;
        m._init = true;
      }
      m.step(dt, swayX, swayY);
    });

    // Pulse timeline
    if (!reducedMotion) {
      nextPulse -= dt;
      if (nextPulse <= 0) triggerPulse(false);
    }
    if (pulseActive) {
      pulseT += dt * 0.5;
      if (pulseT > 0.12 && pulseT < 0.16) {
        spawnRibbon(motifs.bars, motifs.girih, TEAL, 1);
        spawnRibbon(motifs.girih, motifs.sun, SAND, 1);
      }
      if (pulseT > 0.32 && pulseT < 0.36) {
        spawnRibbon(motifs.sun, motifs.mind, RED, 1.15);
        spawnRibbon(motifs.girih, motifs.mind, SAND, 1.15);
        spawnRibbon(motifs.scales, motifs.mind, RED, 1.05);
        spawnRibbon(motifs.bars, motifs.mind, TEAL, 1.05);
      }
      if (pulseT > 0.5 && pulseT < 0.55) {
        spawnRibbon(motifs.mind, motifs.crescent, ORANGE, 1);
        spawnRibbon(motifs.crescent, motifs.wave, ORANGE, 1);
        for (var i = 0; i < 14; i += 1) {
          spawnSpark(motifs.mind.x, motifs.mind.y, i % 2 ? ORANGE : TEAL);
        }
      }
      if (pulseT > 0.7 && pulseT < 0.74) {
        // Snap free motifs home with a burst
        motifList.forEach(function (id) {
          motifs[id].free = Math.min(motifs[id].free, 0.2);
          motifs[id].energy = Math.max(motifs[id].energy, 0.6);
        });
      }
      if (pulseT >= 1.35) {
        pulseActive = false;
        pulseT = 0;
      }
    }

    // Energy ribbons
    for (var ri = ribbons.length - 1; ri >= 0; ri -= 1) {
      var rb = ribbons[ri];
      rb.life -= dt;
      if (rb.life <= 0) {
        ribbons.splice(ri, 1);
        continue;
      }
      var uFade = rb.life / rb.max;
      var mx = (rb.a.x + rb.b.x) * 0.5 + Math.sin(time * 2.2 + rb.seed) * height * 0.05;
      var my = (rb.a.y + rb.b.y) * 0.5 - height * 0.08;
      ctx.beginPath();
      ctx.moveTo(rb.a.x, rb.a.y);
      ctx.quadraticCurveTo(mx, my, rb.b.x, rb.b.y);
      ctx.strokeStyle = rb.color;
      ctx.globalAlpha = uFade * 0.75;
      ctx.lineWidth = 1.6 + (1 - uFade) * 3;
      ctx.lineCap = "round";
      ctx.stroke();

      var u = 1 - uFade;
      var bx =
        (1 - u) * (1 - u) * rb.a.x + 2 * (1 - u) * u * mx + u * u * rb.b.x;
      var by =
        (1 - u) * (1 - u) * rb.a.y + 2 * (1 - u) * u * my + u * u * rb.b.y;
      ctx.beginPath();
      ctx.arc(bx, by, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = rb.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Living motif clones — peel off the illustration and dance when energized
    motifList.forEach(function (id) {
      var m = motifs[id];
      var alpha =
        id === "mind"
          ? m.energy
          : m.energy * 0.55 + m.free * 0.95;
      if (alpha < 0.12) return;
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.globalAlpha = Math.min(1, alpha);
      // Soft plate behind a free-floating clone so it reads as a real piece
      if (m.free > 0.15 && id !== "mind") {
        ctx.beginPath();
        ctx.arc(0, 0, Math.min(width, height) * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(250, 246, 238, 0.72)";
        ctx.fill();
      }
      var R = Math.min(width, height) * 0.1;
      if (id === "girih") R = Math.min(width, height) * 0.17;
      if (id === "sun") R = Math.min(width, height) * 0.048;
      if (id === "bars") R = Math.min(width, height) * 0.1;
      if (id === "scales") R = Math.min(width, height) * 0.11;
      if (id === "crescent") R = Math.min(width, height) * 0.13;
      if (id === "wave") R = Math.min(width, height) * 0.09;
      if (id === "mind") R = Math.min(width, height) * 0.085;
      var breathe = 1 + Math.sin(time * 1.4 + m.depth * 3) * 0.02 + m.energy * 0.07;
      ctx.scale(breathe, breathe);
      m.drawer(m, R, time, m.energy);
      ctx.restore();
      ctx.globalAlpha = 1;
    });

    // Sparks
    for (var si = sparks.length - 1; si >= 0; si -= 1) {
      var sp = sparks[si];
      sp.life -= dt;
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 40 * dt;
      if (sp.life <= 0) {
        sparks.splice(si, 1);
        continue;
      }
      ctx.globalAlpha = Math.max(0, sp.life);
      ctx.fillStyle = sp.color;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Pointer: pull nearest culture motif toward attention, feed the mind
    if (pointer.active) {
      var hx = (pointer.x * 0.5 + 0.5) * width;
      var hy = (pointer.y * 0.5 + 0.5) * height;
      var halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, Math.min(width, height) * 0.16);
      halo.addColorStop(0, "rgba(233, 120, 50, 0.08)");
      halo.addColorStop(1, "rgba(233, 120, 50, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(hx, hy, Math.min(width, height) * 0.16, 0, Math.PI * 2);
      ctx.fill();

      var best = null;
      var bestD = 1e9;
      ["girih", "sun", "bars", "scales", "wave", "crescent"].forEach(function (id) {
        var m = motifs[id];
        var d = Math.hypot(m.x - hx, m.y - hy);
        if (d < bestD) {
          bestD = d;
          best = m;
        }
      });
      if (best && bestD < Math.min(width, height) * 0.2) {
        best.energy = Math.min(1, best.energy + dt * 2);
        best.free = Math.min(1, best.free + dt * 0.8);
        motifs.mind.energy = Math.min(1, motifs.mind.energy + dt * 0.9);
        if (Math.random() < dt * 3) {
          spawnRibbon(best, motifs.mind, best.id === "bars" ? TEAL : best.id === "sun" ? RED : SAND, 0.55);
        }
      }
    }
  }

  // Anchors matched to the cropped illustration
  motifs.girih._nx0 = 0.365;
  motifs.girih._ny0 = 0.392;
  motifs.sun._nx0 = 0.279;
  motifs.sun._ny0 = 0.337;
  motifs.bars._nx0 = 0.308;
  motifs.bars._ny0 = 0.677;
  motifs.scales._nx0 = 0.42;
  motifs.scales._ny0 = 0.78;
  motifs.crescent._nx0 = 0.62;
  motifs.crescent._ny0 = 0.367;
  motifs.wave._nx0 = 0.7;
  motifs.wave._ny0 = 0.4;
  motifs.mind._nx0 = 0.64;
  motifs.mind._ny0 = 0.4;
  // bootstrap nx/ny
  motifList.forEach(function (id) {
    motifs[id].nx = motifs[id]._nx0;
    motifs[id].ny = motifs[id]._ny0;
  });

  function loop(now) {
    requestAnimationFrame(loop);
    if (!visible) {
      lastTime = now;
      return;
    }
    var dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;
    time += dt;

    for (var i = softTimers.length - 1; i >= 0; i -= 1) {
      if (softTimers[i].at <= now) {
        softTimers[i].fn();
        softTimers.splice(i, 1);
      }
    }

    if (reducedMotion) {
      renderFrame(0);
      return;
    }
    renderFrame(dt);
  }

  resize();
  if (reducedMotion) {
    renderFrame(0);
  } else {
    requestAnimationFrame(function () {
      triggerPulse(false);
      requestAnimationFrame(loop);
    });
  }
})();
