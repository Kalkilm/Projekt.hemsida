document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("navbar-container");
  if (!container) return;

  const NAV_URL = container.dataset.nav || "partials/navbar.html";

  // 1) Försök hämta partialen (med fallback om det körs via file://)
  try {
    const res = await fetch(NAV_URL);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const html = await res.text();
    container.innerHTML = html;
  } catch (err) {
    console.warn("[navbar] Kunde inte ladda partial, använder fallback-markup:", err?.message);
    container.innerHTML = `
<nav class="navbar">
  <h1 class="logo-title">NKK – Nerikes Kraftkarlar</h1>
  <button id="menu-toggle" class="menu-btn" type="button" aria-expanded="false" aria-controls="site-menu">
    <span id="menu-icon" class="material-symbols-outlined">menu</span>
  </button>
</nav>`;
  }

  // 2) Hämta referenser
  const navbar    = container.querySelector(".navbar");
  const toggleBtn = container.querySelector("#menu-toggle");
  const menuIcon  = container.querySelector("#menu-icon");
  if (!navbar) {
    console.error("[navbar] Hittar inte .navbar i container.");
    return;
  }

  // Skydd mot dubbel init om scriptet skulle köras två gånger
  if (navbar.dataset.initialized === "true") return;
  navbar.dataset.initialized = "true";

  // 3) Menypunkter (justera länkar om dina filer ligger i mappar)
  const items = [
    { text: "Hem",       href: "index.html" },
    { text: "Anställda", href: "employees.html" },
    { text: "Kontakt",   href: "contact.html" }
  ];

  // 4) Bygg UL
  const ul = document.createElement("ul");
  ul.className = "meny";
  ul.id = "site-menu";

  for (const item of items) {
    const li = document.createElement("li");
    const a  = document.createElement("a");
    a.textContent = item.text;
    a.href = item.href;
    a.classList.add("liItem");

    // Markera aktiv sida (påverkar bara om din CSS stylar .active)
    try {
      const targetPath  = new URL(a.getAttribute("href"), location.href)
        .pathname.replace(/\/index\.html$/, "/");
      const currentPath = location.pathname.replace(/\/index\.html$/, "/");
      if (targetPath === currentPath) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    } catch {}

    li.appendChild(a);
    ul.appendChild(li);
  }

  // 5) Lägg menyn sist i navbaren
  navbar.appendChild(ul);

  // 6) Toggle (mobil)
  toggleBtn?.addEventListener("click", () => {
    const open = ul.classList.toggle("open");
    if (menuIcon) menuIcon.textContent = open ? "menu_open" : "menu";
    toggleBtn.setAttribute("aria-expanded", String(open));
  });

  // 7) Stäng efter klick på länk (mobil)
  ul.addEventListener("click", (e) => {
    if (e.target.matches(".liItem") && ul.classList.contains("open")) {
      ul.classList.remove("open");
      if (menuIcon) menuIcon.textContent = "menu";
      toggleBtn?.setAttribute("aria-expanded", "false");
    }
  });
});
