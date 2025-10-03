document.addEventListener("DOMContentLoaded", () => {

  const container = document.getElementById("navbar-container");
  if (!container) return;

  // === Skapa <nav class="navbar"> direkt ===
  container.innerHTML = `
    <nav class="navbar">
      <h1 class="logo-title">
        <img class="logo" src="bilder/NKK_svart.png" alt="NKK logga" />
         NKK – Nerikes Kraftkarlar 
      </h1>
      
      <button id="menu-toggle" class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu">
        <span id="menu-icon" class="material-symbols-outlined">menu</span>
      </button>
    </nav>
  `;

  const navbar = container.querySelector(".navbar");
  const toggleBtn = container.querySelector("#menu-toggle");
  const menuIcon = container.querySelector("#menu-icon");

  if (navbar.dataset.init) return; // undvik dubbelinit
  navbar.dataset.init = "1";

  // === Menypunkter ===
  const items = [
    { text: "Hem", href: "index.html" },
    { text: "Anställda", href: "employees.html" },
    { text: "Kontakt", href: "contact.html" }
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

  // === Toggle-logik för mobil ===
  toggleBtn?.addEventListener("click", () => {
    const open = ul.classList.toggle("open");
    if (menuIcon) menuIcon.textContent = open ? "menu_open" : "menu";
    toggleBtn.setAttribute("aria-expanded", String(open));
  });

  // === Stäng menyn efter klick ===
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

/* ============================================================
   Helpers nedan: laddar Google-fonten "Material Symbols" via JS
   samt injicerar en minimal CSS-regel för ligaturbeteendet.
   ============================================================ */

/**
 * ensureMaterialSymbols()
 * - Ser till att <link rel="stylesheet" ...> för Material Symbols finns i <head>.
 * - Om den inte finns, skapar vi preconnect-länkar och självaste fontlänken.
 */
function ensureMaterialSymbols() {
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

//-------------------------------------------------------------------------------------------------------------------------------------------------------------
// script.js (Axios-version)
// === Projektlista: enkel textfiltrering över befintliga kort ===

// Hämtar referenser till tre element i HTML: listbehållaren, sökfältet och räknaren.
const projectContainer = document.getElementById("project-list");
const projectQ = document.getElementById("project-q");
const projectCount = document.getElementById("project-count");
let allProjects = []; // Här sparas alla projekt som läses in från projects.json

// normalize: gör sökningar robusta
// - gör om till sträng, små bokstäver
// - normaliserar Unicode (NFD) så å/ä/ö bryts upp i a + diakritik
// - tar bort diakritiska tecken (så "Å" matchar "a")
const normalize = (s) =>
  (s ?? "").toString().toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "");

// Visar en statusrad i listbehållaren och nollställer räknaren
function setStatus(msg) {
  if (projectContainer) projectContainer.innerHTML = `<p class="status">${msg}</p>`;
  if (projectCount) projectCount.textContent = "";
}

// Bygger ett “kort” (article) för ett projekt-objekt { titel, kund, beskrivning }
function createProjectCard(proj) {
  const card = document.createElement("article");
  card.className = "project-card";

  // titeln
  const h3 = document.createElement("h3");
  h3.textContent = proj.titel || "Namnlöst projekt";

  // kund
  const meta = document.createElement("p");
  meta.className = "project-meta";
  meta.textContent = proj.kund ? `Kund: ${proj.kund}` : "Kund: –";

  // beskrivning
  const desc = document.createElement("p");
  desc.className = "project-desc";
  desc.textContent = proj.beskrivning || "";

  card.append(h3, meta, desc);
  return card;
}

// Renderar en lista av projekt i DOM:en
function renderProjects(list) {
  if (!projectContainer) return;
  projectContainer.innerHTML = "";

  // Tom träfflista -> visa statusmeddelande
  if (!list || list.length === 0) {
    setStatus("Inga projekt matchar din sökning.");
    return;
  }

  // DocumentFragment minskar “omritningar” (performance)
  const frag = document.createDocumentFragment();
  list.forEach(p => frag.appendChild(createProjectCard(p)));
  projectContainer.appendChild(frag);

  // Uppdatera räknaren
  if (projectCount) projectCount.textContent = `${list.length} projekt`;
}

// Läser söksträng, filtrerar allProjects och renderar resultatet
function computeAndRender() {
  const q = normalize(projectQ?.value.trim() || "");
  const filtered = !q
    ? allProjects // tom söksträng -> visa allt
    : allProjects.filter(p => {
      // “höstack”: titel + kund + beskrivning i en sträng, normaliserad
      const hay = normalize(`${p.titel} ${p.kund} ${p.beskrivning}`);
      return hay.includes(q); // enkel substring-matchning
    });
  renderProjects(filtered);
}

// debounce: väntar X ms efter senaste tangenttryck innan filtrering körs
function debounce(fn, ms = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// Hämtar projects.json via Axios, sparar inläst data och aktiverar realtidsfilter
async function loadProjects() {
  try {
    setStatus("Laddar projekt…");
    const res = await axios.get("projects.json", { headers: { "Cache-Control": "no-cache" } });
    allProjects = Array.isArray(res.data) ? res.data : [];
    computeAndRender();

    // Realtidsfilter: lyssna på input men “debounca” för bättre flyt
    projectQ?.addEventListener("input", debounce(computeAndRender, 150));
  } catch (err) {
    console.error("[loadProjects] FEL:", err);
    setStatus('Kunde inte ladda projekten. Kontrollera att sidan körs via en lokal server och att "projects.json" ligger i samma mapp.');
  }
}

// Startpunkten: när HTML laddats, hämta projekten
document.addEventListener("DOMContentLoaded", loadProjects);

//-------------------------------------------------------------------------------------------------------------------------------------------------------------
/* Beskrivning individ "LÄS MER" */
  
document.addEventListener('DOMContentLoaded', () => {
  // Läs mer
  const toggleBtn = document.querySelector('#about-toggle');
  const more = document.querySelector('#about-extra');
  const about = document.querySelector('.about');

  if (toggleBtn && more && about) {
    toggleBtn.addEventListener('click', () => {
      const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!expanded));
      more.hidden = expanded;                 // visa/dölj för skärmläsare
      about.classList.toggle('is-expanded', !expanded); // styr CSS-transition
      toggleBtn.textContent = expanded ? 'Läs mer' : 'Visa mindre';
    });

    // On-scroll reveal (IntersectionObserver)
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          about.classList.add('reveal');
          io.unobserve(about);
        }
      });
    }, { threshold: 0.2 });
    io.observe(about);
  }
});

//-------------------------------------------------------------------------------------------------------------------------------------------------------------
/* =========================================
   Skillsbar – komplett drop-in
   – Animerar först när sektionen syns i viewport
   – Läser värden från data-percent (0–100)
   – Sätter aria-attribut för tillgänglighet
========================================= */
(function () {
  // Hitta alla skills på sidan
  const skills = document.querySelectorAll('.skill');
  if (!skills.length) return;

  // Grundinit (ARIA + startläge)
  skills.forEach(skill => {
    const track = skill.querySelector('.skill-track');
    const fill = skill.querySelector('.skill-fill');
    if (!track || !fill) return;

    // Tillgänglighet
    if (!track.hasAttribute('role')) track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    track.setAttribute('aria-valuenow', '0');

    // Startläge (matchar din CSS där width:0)
    fill.style.width = '0%';
  });

  // Själva animationen för ett enskilt element
  function animateSkill(skill) {
    const track = skill.querySelector('.skill-track');
    const fill = skill.querySelector('.skill-fill');
    if (!track || !fill) return;

    const raw = Number(skill.dataset.percent);
    const pct = Math.max(0, Math.min(100, Number.isFinite(raw) ? raw : 0));

    fill.style.width = pct + '%';
    track.setAttribute('aria-valuenow', String(pct));
    skill.classList.add('animated'); // ifall du vill hooka CSS
  }

  // Observer: trigga animation när ~100% av elementet syns
  function onIntersect(entries, obs) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateSkill(entry.target);
      obs.unobserve(entry.target); // Kör bara en gång per skill
    });
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(onIntersect, { threshold: 1 });
    skills.forEach(s => io.observe(s));
  } else {
    // Fallback för äldre browsers: animera allt direkt vid load
    window.addEventListener('load', () => skills.forEach(animateSkill), { once: true });
  }

  // (Valfritt) om sidan öppnas via bfcache (back/forward), säkerställ rätt läge
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      skills.forEach(skill => {
        const fill = skill.querySelector('.skill-fill');
        if (fill) fill.style.width = '0%';
      });
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(onIntersect, { threshold: 0.3 });
        skills.forEach(s => io.observe(s));
      } else {
        skills.forEach(animateSkill);
      }
    }
  });
})();

//-------------------------------------------------------------------------------------------------------------------------------------------------------------
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
    // Bilder
    slides.forEach((img, i) => {
      img.classList.toggle("active", i === newIndex);
      img.setAttribute("aria-hidden", i === newIndex ? "false" : "true");
      // lazy-ish: ladda först när den snart ska visas (om man använder data-src)
      if (i === newIndex && img.dataset.src && !img.src) {
        img.src = img.dataset.src;
      }
    });
    // "Prickar"
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

  // Auto-play
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

  // Initiera
  setActive(index);
  startAuto();
})();

