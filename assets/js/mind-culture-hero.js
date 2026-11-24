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
  var markReady = false;

  var pointer = { tx: 0, ty: 0, x: 0, y: 0 };

  var INK = [28, 26, 23];
  var SAGE = [47, 107, 74];
  var TERR = [238, 135, 31];
  var LILAC = [207, 188, 249];
  var HUB_ACCENT = [LILAC, TERR, SAGE, [232, 84, 0]];

  // Load the real lab mark — geometry fidelity comes from the asset, motion from overlays
  var mark = new Image();
  mark.decoding = "async";
  mark.onload = function () {
    markReady = true;
    if (reducedMotion) renderFrame(1.2, 0.016);
  };
  mark.onerror = function () {
    markReady = false;
  };
  mark.src = (function () {
    // Prefer the same mark path the header logo already resolved
    var base = document.querySelector('.logo img[src*="maclab-mark"]');
    if (base && base.getAttribute("src")) return base.getAttribute("src");
    return "assets/images/maclab-mark.png";
  })();

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

  function cubic(p0, p1, p2, p3, t) {
    var u = 1 - t;
    return {
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
    };
  }

  // Quiet mind constellation in the mark's negative-space star
  var mindNodes = [];
  var GA = Math.PI * (3 - Math.sqrt(5));
  var N = 16;
  for (var i = 0; i < N; i += 1) {
    var yn = 1 - (i / (N - 1)) * 2;
    var rs = Math.sqrt(Math.max(0, 1 - yn * yn));
    var th = GA * i;
    var shell = i < 4 ? 0.32 : 0.58 + (i % 3) * 0.11;
    mindNodes.push({
      bx: Math.cos(th) * rs * shell,
      by: yn * shell,
      bz: Math.sin(th) * rs * shell,
      phase: i * 0.7,
      energy: 0.28,
      tint: 0,
      px: 0,
      py: 0,
      pz: 0
    });
  }
  var mindEdges = [];
  for (var a = 0; a < N; a += 1) {
    for (var b = a + 1; b < N; b += 1) {
      var dx = mindNodes[a].bx - mindNodes[b].bx;
      var dy = mindNodes[a].by - mindNodes[b].by;
      var dz = mindNodes[a].bz - mindNodes[b].bz;
      if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 0.78) mindEdges.push([a, b]);
    }
  }

  var signals = [];
  for (var p = 0; p < 20; p += 1) {
    signals.push({
      q: p % 4,
      dir: p % 2 === 0 ? 1 : -1,
      t: (p / 20) % 1,
      speed: 0.12 + (p % 4) * 0.028,
      size: 1.9 + (p % 3) * 0.4
    });
  }

  var blooms = [0.18, 0.18, 0.18, 0.18];

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
  });
  container.addEventListener("pointerleave", function () {
    pointer.tx = 0;
    pointer.ty = 0;
  });

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(function () {
      resize();
      if (reducedMotion) renderFrame(1.2, 0.016);
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
   * Overlay geometry matched to maclab-mark:
   * diagonal hubs (NE/SE/SW/NW) + cardinal star tips + spiral arms tip→hub.
   */
  function logoGeom(cx, cy, R, rot) {
    var hubDist = R * 0.72;
    var hubR = R * 0.155;
    var starTip = R * 0.255;
    var hubs = [];
    var arcs = [];

    for (var q = 0; q < 4; q += 1) {
      var hubA = rot + Math.PI * 0.25 + q * (Math.PI * 0.5);
      var tipA = rot + q * (Math.PI * 0.5) - Math.PI * 0.5;

      var hub = {
        a: hubA,
        x: cx + Math.cos(hubA) * hubDist,
        y: cy + Math.sin(hubA) * hubDist,
        r: hubR,
        color: HUB_ACCENT[q]
      };
      hubs.push(hub);

      var tip = {
        x: cx + Math.cos(tipA) * starTip,
        y: cy + Math.sin(tipA) * starTip
      };

      arcs.push({
        out: [
          tip,
          {
            x: cx + Math.cos(tipA + 0.55) * R * 0.48,
            y: cy + Math.sin(tipA + 0.55) * R * 0.48
          },
          {
            x: cx + Math.cos(hubA - 0.35) * R * 0.78,
            y: cy + Math.sin(hubA - 0.35) * R * 0.78
          },
          {
            x: hub.x - Math.cos(hubA) * hubR * 0.12,
            y: hub.y - Math.sin(hubA) * hubR * 0.12
          }
        ],
        hub: hub
      });
    }

    return { hubs: hubs, arcs: arcs, starTip: starTip, hubDist: hubDist };
  }

  function drawMark(cx, cy, size, rot) {
    if (!markReady || !mark.naturalWidth) return false;
    var nw = mark.naturalWidth;
    var nh = mark.naturalHeight;
    var scale = size / Math.max(nw, nh);
    var dw = nw * scale;
    var dh = nh * scale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    // Soft brand under-glow so the black mark sits on cream
    var glow = ctx.createRadialGradient(0, 0, size * 0.12, 0, 0, size * 0.62);
    glow.addColorStop(0, "rgba(47, 107, 74, 0.14)");
    glow.addColorStop(0.55, "rgba(238, 135, 31, 0.07)");
    glow.addColorStop(1, "rgba(244, 240, 232, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.62, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.94;
    ctx.drawImage(mark, -dw * 0.5, -dh * 0.5, dw, dh);
    ctx.restore();
    return true;
  }

  /** Fallback silhouette if the mark asset fails to load */
  function drawFallbackSilhouette(cx, cy, R, rot, g) {
    var stroke = Math.max(2.2, R * 0.028);
    ctx.strokeStyle = rgba(INK, 0.92);
    ctx.lineWidth = stroke;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (var q = 0; q < 4; q += 1) {
      var a0 = g.hubs[q].a;
      var a1 = g.hubs[(q + 1) % 4].a;
      if (a1 <= a0) a1 += Math.PI * 2;
      var gap = Math.asin(Math.min(0.98, (g.hubs[q].r * 0.95) / g.hubDist));
      ctx.beginPath();
      ctx.arc(cx, cy, g.hubDist, a0 + gap, a1 - gap);
      ctx.stroke();
    }

    for (var qi = 0; qi < 4; qi += 1) {
      var arc = g.arcs[qi];
      ctx.beginPath();
      ctx.moveTo(arc.out[0].x, arc.out[0].y);
      ctx.bezierCurveTo(arc.out[1].x, arc.out[1].y, arc.out[2].x, arc.out[2].y, arc.out[3].x, arc.out[3].y);
      ctx.stroke();
    }

    // Concave star outline
    ctx.beginPath();
    for (var s = 0; s < 4; s += 1) {
      var tipA = rot + s * (Math.PI * 0.5) - Math.PI * 0.5;
      var nextA = tipA + Math.PI * 0.5;
      var midA = tipA + Math.PI * 0.25;
      var sx = cx + Math.cos(tipA) * g.starTip;
      var sy = cy + Math.sin(tipA) * g.starTip;
      var ex = cx + Math.cos(nextA) * g.starTip;
      var ey = cy + Math.sin(nextA) * g.starTip;
      var mx = cx + Math.cos(midA) * (R * 0.09);
      var my = cy + Math.sin(midA) * (R * 0.09);
      if (s === 0) ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(mx, my, ex, ey);
    }
    ctx.closePath();
    ctx.stroke();

    for (var h = 0; h < 4; h += 1) {
      var hub = g.hubs[h];
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, hub.r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  var lastTime = performance.now();

  function renderFrame(t, dt) {
    ctx.clearRect(0, 0, width, height);

    pointer.x = lerp(pointer.x, pointer.tx, 0.06);
    pointer.y = lerp(pointer.y, pointer.ty, 0.06);

    var cx = width * 0.5 + pointer.x * width * 0.012;
    var cy = height * 0.5 + pointer.y * height * 0.012;
    var R = Math.min(width, height) * 0.42;
    var rot = reducedMotion ? 0 : t * 0.035;
    var g = logoGeom(cx, cy, R, rot);

    var drewMark = drawMark(cx, cy, R * 2.05, rot);
    if (!drewMark) drawFallbackSilhouette(cx, cy, R, rot, g);

    // Brand blooms behind the four interlocking circles
    for (var h = 0; h < 4; h += 1) {
      var hub = g.hubs[h];
      blooms[h] = Math.max(0.12, blooms[h] - dt * 0.42);
      var hg = ctx.createRadialGradient(hub.x, hub.y, hub.r * 0.15, hub.x, hub.y, hub.r * 1.7);
      hg.addColorStop(0, rgba(hub.color, 0.1 + blooms[h] * 0.22));
      hg.addColorStop(0.55, rgba(hub.color, 0.06 + blooms[h] * 0.1));
      hg.addColorStop(1, rgba(hub.color, 0));
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(hub.x, hub.y, hub.r * 1.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mind constellation in the star's open center
    var mindR = g.starTip * 0.42;
    var rotY = t * 0.28 + pointer.x * 0.35;
    var rotX = Math.sin(t * 0.2) * 0.18 - pointer.y * 0.3;
    var cY = Math.cos(rotY);
    var sY = Math.sin(rotY);
    var cX = Math.cos(rotX);
    var sX = Math.sin(rotX);
    for (var ni = 0; ni < N; ni += 1) {
      var nd = mindNodes[ni];
      var pulse = 1 + Math.sin(t * 1.6 + nd.phase) * 0.04;
      var x1 = nd.bx * pulse * cY - nd.bz * pulse * sY;
      var z1 = nd.bx * pulse * sY + nd.bz * pulse * cY;
      var y2 = nd.by * pulse * cX - z1 * sX;
      var z2 = nd.by * pulse * sX + z1 * cX;
      var persp = 1 / (1 - z2 * 0.22);
      nd.px = cx + x1 * mindR * persp;
      nd.py = cy + y2 * mindR * persp;
      nd.pz = z2;
      nd.energy = Math.max(0.2, nd.energy - dt * 0.4);
      nd.tint = Math.max(0, nd.tint - dt * 0.35);
    }
    for (var ei = 0; ei < mindEdges.length; ei += 1) {
      var e = mindEdges[ei];
      var n1 = mindNodes[e[0]];
      var n2 = mindNodes[e[1]];
      var col = mixRgb(SAGE, TERR, Math.min(1, (n1.tint + n2.tint) * 0.5));
      ctx.strokeStyle = rgba(col, 0.28 + (n1.energy + n2.energy) * 0.14);
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(n1.px, n1.py);
      ctx.lineTo(n2.px, n2.py);
      ctx.stroke();
    }
    for (var sm = 0; sm < N; sm += 1) {
      var mn = mindNodes[sm];
      var rad = (1.4 + mn.energy * 1.35) * (0.75 + (mn.pz + 1) * 0.2);
      ctx.fillStyle = rgba(mixRgb(SAGE, TERR, mn.tint), 0.82);
      ctx.beginPath();
      ctx.arc(mn.px, mn.py, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Signal particles riding the logo arms
    for (var si = 0; si < signals.length; si += 1) {
      var sig = signals[si];
      if (!reducedMotion) sig.t += dt * sig.speed;
      if (sig.t >= 1) {
        sig.t -= 1;
        if (sig.dir === 1) blooms[sig.q] = Math.min(1, blooms[sig.q] + 0.4);
        else {
          var ti = (sig.q * 4 + si) % N;
          mindNodes[ti].energy = 1;
          mindNodes[ti].tint = 0.9;
        }
      }
      var arm = g.arcs[sig.q].out;
      var pts = sig.dir === 1 ? arm : [arm[3], arm[2], arm[1], arm[0]];
      var pos = cubic(pts[0], pts[1], pts[2], pts[3], sig.t);
      var tail = cubic(pts[0], pts[1], pts[2], pts[3], Math.max(0, sig.t - 0.07));
      var fade = Math.sin(sig.t * Math.PI);
      var sc = sig.dir === 1 ? mixRgb(SAGE, TERR, sig.t * 0.5) : g.hubs[sig.q].color;
      var tg = ctx.createLinearGradient(tail.x, tail.y, pos.x, pos.y);
      tg.addColorStop(0, rgba(sc, 0));
      tg.addColorStop(1, rgba(sc, 0.78 * fade));
      ctx.strokeStyle = tg;
      ctx.lineWidth = sig.size;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.fillStyle = rgba(sc, 0.92 * fade);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, sig.size * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(now) {
    requestAnimationFrame(loop);
    if (!visible) {
      lastTime = now;
      return;
    }
    var dt = Math.min(0.05, Math.max(0.001, (now - lastTime) * 0.001));
    lastTime = now;
    renderFrame(now * 0.001, dt);
  }

  resize();
  if (reducedMotion) renderFrame(1.2, 0.016);
  else requestAnimationFrame(loop);
})();
