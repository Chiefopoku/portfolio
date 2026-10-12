// ==========================
// Smooth Scrolling Navigation (offset for the sticky header)
// ==========================
function scrollToSection(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  const header = document.querySelector("header");
  const offset = (header ? header.getBoundingClientRect().height : 0) + 12;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  history.replaceState(null, "", hash);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const href = anchor.getAttribute("href");
    if (!href || href === "#") return;
    if (document.querySelector(href)) {
      e.preventDefault();
      scrollToSection(href);
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
  "Registered nurse. Laboratory scientist.",
  "Measuring how microbes hold on to surfaces.",
  "Antimicrobial resistance, surfaces and water.",
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
// Header Scroll Effects & Scroll Spy (position based)
// ==========================
const navLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));
const spySections = navLinks
  .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
  .filter((x) => x.section);

function updateActiveNav() {
  const header = document.querySelector("header");
  const line = (header ? header.getBoundingClientRect().height : 0) + window.innerHeight * 0.25;
  let current = null;
  spySections.forEach((x) => {
    if (x.section.getBoundingClientRect().top <= line) current = x;
  });
  // at the very bottom, highlight the last section
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    current = spySections[spySections.length - 1];
  }
  navLinks.forEach((l) => l.classList.remove("active"));
  if (current && !current.link.classList.contains("nav-cta")) current.link.classList.add("active");
}

window.addEventListener("scroll", () => {
  if (siteHeader) siteHeader.classList.toggle("header-scrolled", window.scrollY > 40);
  updateActiveNav();
}, { passive: true });
updateActiveNav();

// ==========================
// Back-to-Top Button
// ==========================
const backToTop = document.createElement("button");
backToTop.classList.add("back-to-top");
backToTop.innerHTML = "⬆️";
backToTop.setAttribute("aria-label", "Back to top");
document.body.appendChild(backToTop);

window.addEventListener("scroll", () => {
  backToTop.style.display = window.scrollY > 600 ? "block" : "none";
});
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ==========================
// Secure Contact Buttons
// ==========================
const contactTrigger = document.getElementById("contactTrigger");
const copyEmailBtn = document.getElementById("copyEmailBtn");
const contactStatus = document.getElementById("contactStatus");

const secretEmail = String.fromCharCode(
  107,
  119,
  97,
  98,
  101,
  110,
  97,
  111,
  112,
  111,
  107,
  117,
  106,
  110,
  114,
  64,
  103,
  109,
  97,
  105,
  108,
  46,
  99,
  111,
  109
);
const mailSubject = "Portfolio Inquiry";
const mailtoLink = `mailto:${secretEmail}?subject=${encodeURIComponent(
  mailSubject
)}`;

const updateContactStatus = (message) => {
  if (contactStatus) {
    contactStatus.textContent = message;
  }
};

if (contactTrigger) {
  contactTrigger.addEventListener("click", () => {
    window.location.href = mailtoLink;
    updateContactStatus("Launching your email client...");
  });
}

if (copyEmailBtn) {
  copyEmailBtn.addEventListener("click", async () => {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(secretEmail);
        updateContactStatus("Email copied. Paste it where you need it.");
      } catch (error) {
        console.warn("Clipboard copy failed", error);
        updateContactStatus("Copy failed. Try the email button instead.");
      }
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = secretEmail;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      updateContactStatus("Email copied. Paste it where you need it.");
    } catch (error) {
      console.warn("Legacy copy failed", error);
      updateContactStatus("Copy failed. Try the email button instead.");
    }
    document.body.removeChild(textArea);
  });
}
