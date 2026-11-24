(function () {
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const year = document.querySelector("[data-year]");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  // Keep every hero title on one line by shrinking to fit available width.
  const headlines = document.querySelectorAll(".hero h1, .hero-home h1, .missing h1");
  const minHeadlinePx = 14;

  const fitHeadline = function (el) {
    el.style.fontSize = "";
    const maxPx = parseFloat(getComputedStyle(el).fontSize);
    if (!maxPx) {
      return;
    }

    const available = el.clientWidth;
    if (available <= 0) {
      return;
    }

    if (el.scrollWidth <= available + 1) {
      return;
    }

    let lo = minHeadlinePx;
    let hi = maxPx;
    let best = minHeadlinePx;

    for (let i = 0; i < 18; i += 1) {
      const mid = (lo + hi) / 2;
      el.style.fontSize = mid + "px";
      if (el.scrollWidth <= available + 1) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
    }

    el.style.fontSize = best + "px";
  };

  const fitAllHeadlines = function () {
    headlines.forEach(fitHeadline);
  };

  fitAllHeadlines();
  window.addEventListener("resize", fitAllHeadlines);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitAllHeadlines).catch(function () {});
  }

  if (typeof ResizeObserver !== "undefined") {
    let frame = 0;
    const observer = new ResizeObserver(function () {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fitAllHeadlines);
    });
    headlines.forEach(function (el) {
      if (el.parentElement) {
        observer.observe(el.parentElement);
      }
    });
  }

  if (!nav || !toggle) {
    return;
  }

  const closeNav = function () {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeNav();
    }
  });
})();
