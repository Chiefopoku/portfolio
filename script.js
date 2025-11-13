// ==========================
// Smooth Scrolling Navigation
// ==========================
document.querySelectorAll("nav a").forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});

// ==========================
// Header / Navigation Toggles
// ==========================
const siteHeader = document.querySelector("header");
const navToggleBtn = document.getElementById("navToggle");
const navLinkButtons = document.querySelectorAll(".nav-link");

if (navToggleBtn && siteHeader) {
  navToggleBtn.addEventListener("click", () => {
    const isOpen = siteHeader.classList.toggle("nav-open");
    navToggleBtn.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinkButtons.forEach((link) => {
  link.addEventListener("click", () => {
    if (
      window.innerWidth <= 768 &&
      siteHeader?.classList.contains("nav-open")
    ) {
      siteHeader.classList.remove("nav-open");
      navToggleBtn?.setAttribute("aria-expanded", "false");
    }
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 768 && siteHeader?.classList.contains("nav-open")) {
    siteHeader.classList.remove("nav-open");
    navToggleBtn?.setAttribute("aria-expanded", "false");
  }
});

// ==========================
// Dark/Light Mode with Storage
// ==========================
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Apply saved theme
if (localStorage.getItem("theme") === "dark") {
  body.dataset.theme = "dark";
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Toggle theme
themeToggle.addEventListener("click", () => {
  if (body.dataset.theme === "dark") {
    body.dataset.theme = "";
    localStorage.setItem("theme", "light");
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    body.dataset.theme = "dark";
    localStorage.setItem("theme", "dark");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
});

// ==========================
// Parallax Hero Image Effect
// ==========================
window.addEventListener("scroll", () => {
  const hero = document.querySelector("#hero");
  let scrollY = window.scrollY;
  hero.style.backgroundPositionY = `${scrollY * 0.5}px`;
});

// ==========================
// Typing Animation
// ==========================
const typingText = document.getElementById("typing-text");
const phrases = [
  "Nurse. Researcher. Innovator.",
  "Exploring Nanoscience & Healthcare.",
  "Building Technology for Better Health.",
];
let phraseIndex = 0,
  letterIndex = 0,
  isDeleting = false;

function type() {
  const currentPhrase = phrases[phraseIndex];
  if (isDeleting) {
    typingText.textContent = currentPhrase.substring(0, letterIndex--);
  } else {
    typingText.textContent = currentPhrase.substring(0, letterIndex++);
  }

  let typingSpeed = isDeleting ? 60 : 120;
  if (!isDeleting && letterIndex === currentPhrase.length) {
    typingSpeed = 1500; // pause before deleting
    isDeleting = true;
  } else if (isDeleting && letterIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
  }
  setTimeout(type, typingSpeed);
}
type();

// ==========================
// Scroll Reveal Animations
// ==========================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document
  .querySelectorAll(".fade-in, .card, .project-card, .timeline-card")
  .forEach((el) => observer.observe(el));

// ==========================
// Metric Counters
// ==========================
const counterElements = document.querySelectorAll("[data-count]");

if (counterElements.length) {
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.dataset.counted !== "true") {
          animateCounter(entry.target);
          entry.target.dataset.counted = "true";
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counterElements.forEach((el) => countObserver.observe(el));
}

function animateCounter(element) {
  const target = Number(element.dataset.count) || 0;
  const duration = Number(element.dataset.duration) || 1500;
  const suffix = element.dataset.suffix || "";
  const prefix = element.dataset.prefix || "";
  const startTime = performance.now();

  const step = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = Math.round(progress * target);
    element.textContent = `${prefix}${value.toLocaleString()}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

// ==========================
// Visual Timeline Parallax
// ==========================
const parallaxCards = document.querySelectorAll(
  ".timeline-card[data-parallax-speed]"
);

function handleParallax() {
  const scrollY = window.scrollY;
  parallaxCards.forEach((card) => {
    const speed = parseFloat(card.dataset.parallaxSpeed) || 0.2;
    const offset = scrollY * speed * -0.05;
    card.style.setProperty("--parallax", `${offset}px`);
  });
}

if (parallaxCards.length) {
  handleParallax();
  window.addEventListener("scroll", handleParallax);
}

// ==========================
// CV Upload → Download Link
// ==========================
const cvUploadInput = document.getElementById("cvUpload");
const cvDownloadLink = document.getElementById("cvDownload");
let cvObjectUrl;

if (cvUploadInput && cvDownloadLink) {
  const defaultHref = cvDownloadLink.getAttribute("href");

  cvUploadInput.addEventListener("change", () => {
    const fileList = cvUploadInput.files;
    const file = fileList && fileList[0];

    if (cvObjectUrl) {
      URL.revokeObjectURL(cvObjectUrl);
      cvObjectUrl = null;
    }

    if (!file) {
      cvDownloadLink.href = defaultHref;
      cvDownloadLink.textContent = "Download CV";
      cvDownloadLink.removeAttribute("data-filename");
      return;
    }

    cvObjectUrl = URL.createObjectURL(file);
    cvDownloadLink.href = cvObjectUrl;
    cvDownloadLink.download = file.name;
    cvDownloadLink.textContent = "Download Uploaded CV";
    cvDownloadLink.dataset.filename = file.name;
  });
}

// ==========================
// Header Scroll Effects & Scroll Spy
// ==========================
const navLinks = document.querySelectorAll(".nav-link[href^='#']");
const sectionMap = {};

navLinks.forEach((link) => {
  const id = link.getAttribute("href");
  const section = document.querySelector(id);
  if (section) {
    sectionMap[id] = { section, link };
  }
});

function setActiveNav(id) {
  navLinks.forEach((link) => link.classList.remove("active"));
  if (sectionMap[id]) {
    sectionMap[id].link.classList.add("active");
  }
}

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(`#${entry.target.id}`);
      }
    });
  },
  { threshold: 0.4 }
);

Object.values(sectionMap).forEach(({ section }) =>
  spyObserver.observe(section)
);

window.addEventListener("scroll", () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("header-scrolled", window.scrollY > 40);
});

// ==========================
// Back-to-Top Button
// ==========================
const backToTop = document.createElement("button");
backToTop.classList.add("back-to-top");
backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
document.body.appendChild(backToTop);

window.addEventListener("scroll", () => {
  backToTop.style.display = window.scrollY > 600 ? "block" : "none";
});
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
