export function normalizeUrl(url) {
  if (!url) return "#";
  const trimmed = String(url).trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("#")
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function initScrollProgress(barId = "scrollProgressBar") {
  const bar = document.getElementById(barId);
  if (!bar) return () => {};

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  return () => window.removeEventListener("scroll", onScroll);
}
export function runTextRecreate(targetText, onFrame, durationMs = 1150) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "0123456789";
  const frameStepMs = 42;
  const totalFrames = Math.max(14, Math.round(durationMs / frameStepMs));
  let frame = 0;

  const timer = setInterval(() => {
    frame += 1;
    const progress = frame / totalFrames;
    const revealCount = Math.floor(progress * targetText.length);

    const nextText = targetText
      .split("")
      .map((char, idx) => {
        if (idx < revealCount) return char;
        if (/[A-Z]/.test(char)) {
          return upper[Math.floor(Math.random() * upper.length)];
        }
        if (/[a-z]/.test(char)) {
          return lower[Math.floor(Math.random() * lower.length)];
        }
        if (/[0-9]/.test(char)) {
          return digits[Math.floor(Math.random() * digits.length)];
        }
        return char;
      })
      .join("");

    onFrame(nextText);

    if (frame >= totalFrames) {
      clearInterval(timer);
      onFrame(targetText);
    }
  }, frameStepMs);

  return () => clearInterval(timer);
}

export function initScrollReveal() {
  const elements = document.querySelectorAll(
    ".reveal-up, .reveal-left, .reveal-right, .reveal-scale",
  );
  if (!elements.length) return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    { threshold: 0.12 },
  );

  elements.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

export function initCursorFollower() {
  const isTouch =
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches;
  if (isTouch) return () => {};

  const dot = document.getElementById("cyan-cursor-dot");
  const ring = document.getElementById("cyan-cursor-ring");
  const glow = document.getElementById("cyan-cursor-glow");
  if (!dot || !ring || !glow) return () => {};

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let lastSparkleTime = 0;
  let rafId = null;

  const spawnSparkle = (x, y) => {
    const sparkle = document.createElement("span");
    sparkle.className = "cyan-sparkle";
    const size = Math.random() * 4 + 3;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${x + (Math.random() - 0.5) * 14}px`;
    sparkle.style.top = `${y + (Math.random() - 0.5) * 14}px`;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 750);
  };

  const onMouseMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
    glow.style.left = `${mouseX}px`;
    glow.style.top = `${mouseY}px`;

    const now = Date.now();
    if (now - lastSparkleTime > 55) {
      lastSparkleTime = now;
      spawnSparkle(mouseX, mouseY);
    }

    const hoveredInteractive = e.target.closest(
      "a, button, .service-select-card",
    );
    ring.classList.toggle("cursor-hover-active", Boolean(hoveredInteractive));
  };

  const animateRing = () => {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    rafId = requestAnimationFrame(animateRing);
  };

  window.addEventListener("mousemove", onMouseMove);
  rafId = requestAnimationFrame(animateRing);

  return () => {
    window.removeEventListener("mousemove", onMouseMove);
    if (rafId) cancelAnimationFrame(rafId);
  };
}
