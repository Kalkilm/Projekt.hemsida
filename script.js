/**
 * script.js — Dynamisk navbar + Material Symbols
 *
 * Vad gör filen?
 * 1) Säkerställer att Google-fonten "Material Symbols Outlined" laddas via JS (så du slipper lägga <link> i varje HTML).
 * 2) Hämtar din navbar-partial (partials/navbar.html) via fetch() och stoppar in den i #navbar-container.
 * 3) Bygger upp UL-menyn (Hem, Anställda, Kontakt) i navbaren.
 * 4) Markerar aktiv sida i menyn.
 * 5) Hanterar mobil-toggle (öppna/stäng meny) och byter ikon mellan "menu" och "close".
 */

document.addEventListener("DOMContentLoaded", async () => {
  // === 1) Ladda Material Symbols via JS (en gång per sida) ===
  //   - Vi injicerar <link rel="stylesheet" ...> i <head> ifall den saknas.
  //   - Vi lägger också en minimal CSS-regel för .material-symbols-outlined så ligaturer funkar.
  ensureMaterialSymbols();
  ensureMaterialSymbolsStyle();

  // === 2) Hitta containern där navbaren ska hamna ===
  const container = document.getElementById("navbar-container");
  if (!container) return; // Om sidan saknar container gör vi inget (skriptet blir "no-op").

  // Sökväg till partialen. Kan styras med data-nav="..." i HTML. Annars standard: "partials/navbar.html".
  const NAV_URL = container.dataset.nav || "partials/navbar.html";

  // === 3) Hämta partialen och lägg in den i containern ===
  // Om fetch misslyckas (t.ex. körs filerna via file://), används en fallback-markup så du ändå får en enkel navbar.
  try {
    const res = await fetch(NAV_URL);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const html = await res.text();
    container.innerHTML = html;
  } catch (err) {
    console.warn("[navbar] Kunde inte ladda partial, använder fallback-markup:", err?.message);
    // Fallback: samma struktur/klasser som partialen för att behålla utseendet.
    container.innerHTML = `
<nav class="navbar">
  <h1 class="logo-title">NKK – Nerikes Kraftkarlar</h1>
  <button id="menu-toggle" class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu">
    <span id="menu-icon" class="material-symbols-outlined">menu</span>
  </button>
</nav>`;
  }

  // === 4) Plocka ut viktiga element inuti den nu inladdade navbaren ===
  const navbar    = container.querySelector(".navbar");     // själva <nav>
  const toggleBtn = container.querySelector("#menu-toggle"); // knappen som öppnar/stänger menyn (mobil)
  const menuIcon  = container.querySelector("#menu-icon");   // <span> som visar "menu"/"close"-ikonen
  if (!navbar) {
    console.error("[navbar] Hittar inte .navbar i container.");
    return;
  }

  // Undvik dubbel-init om skriptet skulle råka köras två gånger (ex. dubbla script-taggar)
  if (navbar.dataset.initialized === "true") return;
  navbar.dataset.initialized = "true";

  // === 5) Definiera menylänkar (kan utökas/ändras) ===
  // Tips: Om du kör sidor i undermappar, byt till root-relativa länkar eller bygg dem med en BASE-variabel.
  const items = [
    { text: "Hem",       href: "index.html" },
    { text: "Anställda", href: "employees.html" },
    { text: "Kontakt",   href: "contact.html" }
  ];

  // === 6) Skapa <ul> och fyll den med <li><a> för varje menypunkt ===
  const ul = document.createElement("ul");
  ul.className = "meny";     // din befintliga klass för styling
  ul.id = "site-menu";       // används av aria-controls på knappen

  for (const item of items) {
    const li = document.createElement("li");
    const a  = document.createElement("a");
    a.textContent = item.text;     // länktext (t.ex. "Hem")
    a.href = item.href;            // href (t.ex. "index.html")
    a.classList.add("liItem");     // din befintliga klass

    // Markera aktiv sida:
    // Vi jämför nuvarande path med länkens path (normerar bort "/index.html" → "/").
    try {
      const targetPath  = new URL(a.getAttribute("href"), location.href)
        .pathname.replace(/\/index\.html$/, "/");
      const currentPath = location.pathname.replace(/\/index\.html$/, "/");
      if (targetPath === currentPath) {
        a.classList.add("active");            // ger dig möjlighet att styla aktiv länk
        a.setAttribute("aria-current", "page"); // tillgänglighet (screen readers)
      }
    } catch {
      // Om URL-konstruktionen failar (ska sällan hända), hoppar vi bara över markering.
    }

    li.appendChild(a);
    ul.appendChild(li);
  }

  // === 7) Sätt in menyn sist i navbaren ===
  navbar.appendChild(ul);

  // === 8) Toggle-logik för mobil: öppna/stäng menyn och byt ikon ===
  // Här använder vi "menu" ↔ "close" då de är mest robusta Material Symbols-ligaturer.
  toggleBtn?.addEventListener("click", () => {
    const open = ul.classList.toggle("open");                   // växlar CSS-klassen "open" på <ul>
    if (menuIcon) menuIcon.textContent = open ? "menu_open" : "menu"; // byter ikontext (ligatur)
    toggleBtn.setAttribute("aria-expanded", String(open));      // uppdaterar aria (tillgänglighet)
  });

  // === 9) Stäng menyn automatiskt efter att användaren klickat på en länk (mobilbeteende) ===
  ul.addEventListener("click", (e) => {
    // träffar endast om man klickat på en länk och menyn är öppen
    if (e.target.matches(".liItem") && ul.classList.contains("open")) {
      ul.classList.remove("open");                       // stäng menyn
      if (menuIcon) menuIcon.textContent = "menu";       // återställ ikon
      toggleBtn?.setAttribute("aria-expanded", "false"); // uppdatera aria
    }
  });
});

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

/**
 * ensureMaterialSymbolsStyle()
 * - Lägger till en minimal CSS-snutt för klassen .material-symbols-outlined
 *   så att ligaturerna funkar och inte sabbas av annan CSS (t.ex. text-transform).
 */
function ensureMaterialSymbolsStyle(){
  const SID = "material-symbols-style";
  if (document.getElementById(SID)) return; // redan inladdad, gör inget

  const style = document.createElement("style");
  style.id = SID;
  style.textContent = `
.material-symbols-outlined{
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; /* välj utseende */
  font-feature-settings: 'liga';      /* aktivera ligaturer */
  text-transform: none;                /* förhindra tex. uppercase som kan bryta ligatur */
  letter-spacing: normal;
  line-height: 1;
  display: inline-block;
}`;
  document.head.appendChild(style);
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
