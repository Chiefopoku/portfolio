// =========================================================
// MODERN LAYER (Oct 2026): microbe hero, tilt cards,
// scroll progress, timeline draw, magnetic buttons.
// Loaded after script.js. Safe to remove with its <script> tag.
// =========================================================
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  // ---------- Scroll progress + timeline line ----------
  const bar = document.getElementById("scrollProgress");
  const timeline = document.querySelector(".visual-timeline");
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    if (timeline && !reduceMotion) {
      const r = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / r.height));
      timeline.style.setProperty("--line", p.toFixed(3));
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Tilt + spotlight cards ----------
  const tiltEls = document.querySelectorAll(".card, .project-card");
  tiltEls.forEach((el) => {
    el.classList.add("tilt");
    if (!finePointer || reduceMotion) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 7}deg) translateY(-4px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "";
    });
  });

  // ---------- Magnetic buttons ----------
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".btn").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = `translate(${dx * 0.18}px, ${dy * 0.25}px)`;
      });
      b.addEventListener("pointerleave", () => (b.style.transform = ""));
    });
  }

  // ---------- Microbe hero ----------
  // Cells drift with Brownian motion. The cursor acts as a surface:
  // cells that wander close slow down and stick, then drift off again.
  // Click to release a new cluster.
  const canvas = document.getElementById("microbeCanvas");
  const hero = document.getElementById("hero");
  if (!canvas || !hero) return;
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1, cells = [], running = true;
  const pointer = { x: -9999, y: -9999, active: false };
  const COLORS = ["#2dd4bf", "#38bdf8", "#818cf8", "#5eead4"];

  const rand = (a, b) => a + Math.random() * (b - a);
  const makeCell = (x, y) => {
    const rod = Math.random() < 0.6;
    return {
      x: x ?? rand(0, W), y: y ?? rand(0, H),
      vx: rand(-0.3, 0.3), vy: rand(-0.3, 0.3),
      len: rod ? rand(14, 26) : 0, r: rod ? rand(4, 6) : rand(5, 9),
      a: rand(0, Math.PI * 2), spin: rand(-0.01, 0.01),
      c: COLORS[(Math.random() * COLORS.length) | 0],
      stuck: 0, alpha: rand(0.35, 0.8),
    };
  };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.round(Math.min(90, (W * H) / 16000));
    while (cells.length < target) cells.push(makeCell());
    cells.length = target;
  };

  const drawCell = (c) => {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.a);
    ctx.globalAlpha = c.alpha + c.stuck * 0.35;
    ctx.fillStyle = c.c;
    ctx.shadowColor = c.c;
    ctx.shadowBlur = 8 + c.stuck * 14;
    ctx.beginPath();
    if (c.len) {
      const l = c.len / 2, r = c.r;
      ctx.moveTo(-l, -r); ctx.lineTo(l, -r);
      ctx.arc(l, 0, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-l, r);
      ctx.arc(-l, 0, r, Math.PI / 2, -Math.PI / 2);
    } else {
      ctx.arc(0, 0, c.r, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  };

  const step = () => {
    ctx.clearRect(0, 0, W, H);
    // faint links between nearby cells (biofilm feel)
    ctx.lineWidth = 1;
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i], b = cells[j];
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 6400) {
          ctx.strokeStyle = `rgba(94, 234, 212, ${0.12 * (1 - d2 / 6400) + 0.15 * Math.min(a.stuck, b.stuck)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const c of cells) {
      // Brownian jiggle
      c.vx += rand(-0.04, 0.04);
      c.vy += rand(-0.04, 0.04);
      // adhesion to the pointer "surface"
      if (pointer.active) {
        const dx = pointer.x - c.x, dy = pointer.y - c.y;
        const d = Math.hypot(dx, dy);
        if (d < 160) {
          const pull = (1 - d / 160) * 0.06;
          c.vx += (dx / (d || 1)) * pull;
          c.vy += (dy / (d || 1)) * pull;
          if (d < 55) c.stuck = Math.min(1, c.stuck + 0.04);
        }
      }
      c.stuck = Math.max(0, c.stuck - 0.006);
      const damp = 0.96 - c.stuck * 0.2;
      c.vx *= damp; c.vy *= damp;
      const sp = Math.hypot(c.vx, c.vy), max = 1.2;
      if (sp > max) { c.vx *= max / sp; c.vy *= max / sp; }
      c.x += c.vx; c.y += c.vy;
      c.a += c.spin * (1 - c.stuck);
      if (c.x < -30) c.x = W + 30; else if (c.x > W + 30) c.x = -30;
      if (c.y < -30) c.y = H + 30; else if (c.y > H + 30) c.y = -30;
      drawCell(c);
    }
    if (running) requestAnimationFrame(step);
  };

  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.active = true;
  });
  hero.addEventListener("pointerleave", () => (pointer.active = false));
  hero.addEventListener("click", (e) => {
    if (e.target.closest("a, button")) return;
    const r = hero.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const c = makeCell(e.clientX - r.left + rand(-12, 12), e.clientY - r.top + rand(-12, 12));
      c.vx = rand(-2, 2); c.vy = rand(-2, 2);
      cells.push(c);
    }
    if (cells.length > 140) cells.splice(0, cells.length - 140);
  });

  window.addEventListener("resize", resize);
  resize();

  if (reduceMotion) {
    running = false;
    step();
    return;
  }
  // pause when the hero is off screen
  new IntersectionObserver(([en]) => {
    const was = running;
    running = en.isIntersecting;
    if (running && !was) requestAnimationFrame(step);
  }).observe(hero);
  requestAnimationFrame(step);
})();

// ---------- Gallery filters + lightbox ----------
(() => {
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  if (!items.length) return;
  const chips = document.querySelectorAll(".gallery-filters .chip");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      items.forEach((it) => it.classList.toggle("is-hidden", f !== "all" && it.dataset.cat !== f));
    })
  );

  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lbImg");
  const cap = document.getElementById("lbCap");
  let idx = 0, lastFocus = null;
  const visible = () => items.filter((it) => !it.classList.contains("is-hidden"));
  const show = (i) => {
    const list = visible();
    idx = (i + list.length) % list.length;
    const it = list[idx];
    img.src = it.dataset.full;
    img.alt = it.dataset.caption;
    cap.textContent = it.dataset.caption;
  };
  const open = (it) => {
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    show(visible().indexOf(it));
    lb.querySelector(".lb-close").focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };
  items.forEach((it) => it.addEventListener("click", () => open(it)));
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", () => show(idx - 1));
  lb.querySelector(".lb-next").addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  // swipe on touch screens
  let sx = null;
  lb.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });
})();

// ---------- Experience: reveal, progress rail, filters ----------
(() => {
  const xp = document.querySelector(".xp");
  if (!xp) return;
  const items = Array.from(xp.querySelectorAll(".xp-item"));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.15 }
  );
  items.forEach((it, i) => { it.style.transitionDelay = `${Math.min(i, 4) * 70}ms`; io.observe(it); });

  const fill = () => {
    const r = xp.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.7 - r.top) / r.height));
    xp.style.setProperty("--fill", p.toFixed(3));
  };
  window.addEventListener("scroll", fill, { passive: true });
  window.addEventListener("resize", fill);
  fill();

  const chips = document.querySelectorAll(".xp-filters .chip");
  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.xp;
      items.forEach((it) => {
        it.classList.toggle("is-hidden", f !== "all" && it.dataset.cat !== f);
        it.classList.add("in");
      });
      fill();
    })
  );
})();
