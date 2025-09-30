// document.addEventListener("DOMContentLoaded", () => {
//   const container = document.getElementById("navbar-container");

//   fetch("navbar.html")
//     .then(res => res.text())
//     .then(html => {
//       container.innerHTML = html;

//       // aktivera knappen efter att nav har laddats
//       const toggleBtn = document.getElementById("menu-toggle");
//       const menuIcon  = document.getElementById("menu-icon");
//       const ul        = container.querySelector(".meny");

//       toggleBtn.addEventListener("click", () => {
//         const open = ul.classList.toggle("open");
//         menuIcon.textContent = open ? "menu_open" : "menu";
//         toggleBtn.setAttribute("aria-expanded", String(open));
//       });
//     })
//     .catch(err => console.error("Kunde inte ladda navbar:", err));
// });
