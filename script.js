

document.addEventListener("DOMContentLoaded", () => {
  // === 1) Se till att Material Symbols-fonten laddas ===
  injectMaterialSymbols();

  const container = document.getElementById("navbar-container");
  if (!container) return;

  // === 2) Skapa <nav class="navbar"> direkt ===
  container.innerHTML = `
    <nav class="navbar">
      <h1 class="logo-title">NKK – Nerikes Kraftkarlar</h1>
      <button id="menu-toggle" class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu">
        <span id="menu-icon" class="material-symbols-outlined">menu</span>
      </button>
    </nav>
  `;

  const navbar    = container.querySelector(".navbar");
  const toggleBtn = container.querySelector("#menu-toggle");
  const menuIcon  = container.querySelector("#menu-icon");

  if (navbar.dataset.init) return; // undvik dubbelinit
  navbar.dataset.init = "1";

  // === 3) Menypunkter ===
  const items = [
    { text: "Hem",       href: "index.html" },
    { text: "Anställda", href: "employees.html" },
    { text: "Kontakt",   href: "contact.html" }
  ];

  const ul = document.createElement("ul");
  ul.className = "meny";
  ul.id = "site-menu";

  items.forEach(({ text, href }) => {
    const a = document.createElement("a");
    a.textContent = text;
    a.href = href;
    a.className = "liItem";

    // Markera aktiv sida
    if (samePath(href, location.pathname)) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }

    const li = document.createElement("li");
    li.appendChild(a);
    ul.appendChild(li);
  });

  navbar.appendChild(ul);

  // === 4) Toggle-logik för mobil ===
  toggleBtn?.addEventListener("click", () => {
    const open = ul.classList.toggle("open");
    if (menuIcon) menuIcon.textContent = open ? "menu_open" : "menu";
    toggleBtn.setAttribute("aria-expanded", String(open));
  });

  // === 5) Stäng menyn efter klick ===
  ul.addEventListener("click", (e) => {
    if (e.target.matches(".liItem") && ul.classList.contains("open")) {
      ul.classList.remove("open");
      if (menuIcon) menuIcon.textContent = "menu";
      toggleBtn?.setAttribute("aria-expanded", "false");
    }
  });

  // Hjälpfunktion
  function samePath(href, currentPath) {
    try {
      const target = new URL(href, location.href)
        .pathname.replace(/\/index\.html$/, "/");
      return currentPath.replace(/\/index\.html$/, "/") === target;
    } catch {
      return false;
    }
  }
});

// === Hjälpfunktion: injicera Material Symbols-länken + CSS ===
function injectMaterialSymbols(){
  if (document.getElementById("ms-outlined")) return;

  // Länken till Google Fonts
  const link = document.createElement("link");
  link.id = "ms-outlined";
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0";
  document.head.appendChild(link);

  // Minimal CSS så text → ikon funkar
  const style = document.createElement("style");
  style.textContent = `
  .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-feature-settings: 'liga';
    text-transform: none;
    letter-spacing: normal;
    line-height: 1;
    display: inline-block;
  }`;
  document.head.appendChild(style);
}


/* ============================================================
   Helpers nedan: laddar Google-fonten "Material Symbols" via JS
   samt injicerar en minimal CSS-regel för ligaturbeteendet.
   ============================================================ */

/**
 * ensureMaterialSymbols()
 * - Ser till att <link rel="stylesheet" ...> för Material Symbols finns i <head>.
 * - Om den inte finns, skapar vi preconnect-länkar och självaste fontlänken.
 */
function ensureMaterialSymbols(){
  const id = "material-symbols";
  if (document.getElementById(id)) return; // redan inladdad, gör inget

  // Preconnect till Googles domäner = snabbare fontnedladdning
  const pre1 = document.createElement("link");
  pre1.rel = "preconnect";
  pre1.href = "https://fonts.googleapis.com";
  document.head.appendChild(pre1);

  const pre2 = document.createElement("link");
  pre2.rel = "preconnect";
  pre2.href = "https://fonts.gstatic.com";
  pre2.crossOrigin = "";
  document.head.appendChild(pre2);

  // Själva stylesheet-länken för Material Symbols Outlined (med variationsaxlar)
  const font = document.createElement("link");
  font.id = id;
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0";
  document.head.appendChild(font);
}


// Bildspel (prev/next, piltangenter, swipe, punkter) 
(function initSlideshow() {
    const slidesWrap = document.getElementById("slides");
    if (!slidesWrap) return; // ingen slideshow på sidan

    const slides = Array.from(slidesWrap.querySelectorAll(".slide"));
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    const dotsWrap = document.getElementById("dots");

    if (slides.length === 0) return;

    let index = 0;
    let autoTimer = null;
    const AUTO_MS = 5000; // ändra om du vill

    // Skapa prickar
    slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.className = "dot" + (i === 0 ? " active" : "");
        dot.setAttribute("aria-label", `Gå till bild ${i + 1}`);
        dot.addEventListener("click", () => goTo(i, true));
        dotsWrap.appendChild(dot);
    });

    function setActive(newIndex) {
        // bilder
        slides.forEach((img, i) => {
            img.classList.toggle("active", i === newIndex);
            img.setAttribute("aria-hidden", i === newIndex ? "false" : "true");
            // lazy-ish: ladda först när den snart ska visas (om du använder data-src)
            if (i === newIndex && img.dataset.src && !img.src) {
                img.src = img.dataset.src;
            }
        });
        // prickar
        const allDots = Array.from(dotsWrap.children);
        allDots.forEach((d, i) => d.classList.toggle("active", i === newIndex));
    }

    function goTo(newIndex, pauseAuto = false) {
        index = (newIndex + slides.length) % slides.length;
        setActive(index);
        if (pauseAuto) stopAuto();
    }

    function next(pause = false) { goTo(index + 1, pause); }
    function prev(pause = false) { goTo(index - 1, pause); }

    // Knapp-klick
    prevBtn?.addEventListener("click", () => prev(true));
    nextBtn?.addEventListener("click", () => next(true));

    // Tangentbord (vänster/höger)
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") prev(true);
        if (e.key === "ArrowRight") next(true);
    });

    // Touch-swipe
    let startX = 0;
    slidesWrap.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    }, { passive: true });

    slidesWrap.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) {
            dx > 0 ? prev(true) : next(true);
        }
    });

    // Auto-play (valfritt)
    function startAuto() {
        if (autoTimer) return;
        autoTimer = setInterval(() => next(false), AUTO_MS);
    }
    function stopAuto() {
        clearInterval(autoTimer);
        autoTimer = null;
    }
    // Pausa på hover (desktop)
    slidesWrap.addEventListener("mouseenter", stopAuto);
    slidesWrap.addEventListener("mouseleave", startAuto);

    // Init
    setActive(index);
    startAuto();
})();



// script.js (Axios-version)
const projectContainer = document.getElementById("project-list");

function setStatus(msg) {
    if (projectContainer) projectContainer.innerHTML = `<p class="status">${msg}</p>`;
}

function createProjectCard(proj) {
    const card = document.createElement("article");
    card.className = "project-card";

    const h3 = document.createElement("h3");
    h3.textContent = proj.titel || "Namnlöst projekt";

    const meta = document.createElement("p");
    meta.className = "project-meta";
    meta.textContent = proj.kund ? `Kund: ${proj.kund}` : "Kund: –";

    const desc = document.createElement("p");
    desc.className = "project-desc";
    desc.textContent = proj.beskrivning || "";

    card.append(h3, meta, desc);
    return card;
}

function renderProjects(list) {
    if (!projectContainer) return;
    projectContainer.innerHTML = "";
    if (!list || list.length === 0) {
        setStatus("Inga projekt hittades.");
        return;
    }
    const frag = document.createDocumentFragment();
    list.forEach(p => frag.appendChild(createProjectCard(p)));
    projectContainer.appendChild(frag);
}

async function loadProjects() {
    try {
        setStatus("Laddar projekt…");
        const res = await axios.get("projects.json", { headers: { "Cache-Control": "no-cache" } });
        const data = Array.isArray(res.data) ? res.data : [];
        renderProjects(data);
    } catch (err) {
        console.error("[loadProjects] FEL:", err);
        setStatus('Kunde inte ladda projekten. Kontrollera att sidan körs via en lokal server och att "jonas-projects.json" ligger i samma mapp.');
    }
}
// Ladda projekten när sidan är klar
document.addEventListener("DOMContentLoaded", loadProjects);
