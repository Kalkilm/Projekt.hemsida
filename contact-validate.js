/* =========================
  Hämtar informationen från formuläret contactForm och deklarar vaiabler
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const touched = { name: false, email: false, phone: false };
  let triedSubmit = false;

  /* =========================
  Funktioner som används för alla fält
  ========================= */

  // Används för att markera ett fält som giltigt
  function showValid(field, checkEl, helpEl, message) {
    field.removeAttribute("aria-invalid");
    checkEl.classList.add("visible");
    helpEl.textContent = message || "";
    helpEl.classList.add("valid");
  }

  // Används för att markera ett fält som ogiltigt
  function showInvalid(field, checkEl, helpEl, message) {
    field.setAttribute("aria-invalid", "true");
    checkEl.classList.remove("visible");
    helpEl.textContent = message || "";
  }

  // Uppdaterar skickaknappens läge (aktiverad/inaktiverad) utan att rita om fälten
  function updateSubmitStateSilent() {
    const ok =
      validateName(false) &&
      validateEmail(false) &&
      validatePhone(false);
    submitBtn.disabled = !ok;
  }

  // Om villkoret är uppfyllt, kör ritfunktionen
  // Används för att avgöra om drawFn() ska köras eller inte
  function maybeShow(shouldShow, drawFn) {
    if (shouldShow) drawFn();
  }

  /* =========================
  Namn-fält
  ========================= */

  // Hämtar element för namn-fältet
  const nameInput = document.getElementById("name");
  const nameCheck = document.getElementById("nameCheck");
  const nameHelp = document.getElementById("nameHelp");

  // Validerar namn-fältet
  function validateName(showUI = true) {
    const val = nameInput.value.trim();
    const ok = val.length >= 2;
    maybeShow(showUI && (touched.name || triedSubmit), () => {
      ok ? showValid(nameInput, nameCheck, nameHelp, "")
        : showInvalid(nameInput, nameCheck, nameHelp, "Ange minst 2 tecken.");
    });
    return ok;
  }

  // Eventlyssnare för namn-fältet - Körs vid varje ändring av fältet
  nameInput.addEventListener("input", () => {
    touched.name = true;
    validateName(true);
    updateSubmitStateSilent();
  });

  /* =========================
  E-post-fält
  ========================= */

  // Hämtar element för e-post-fältet
  const emailInput = document.getElementById("email");
  const emailCheck = document.getElementById("emailCheck");
  const emailHelp = document.getElementById("emailHelp");

  // Validerar e-post-fältet
  function validateEmail(showUI = true) {
    const val = emailInput.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const ok = re.test(val);
    maybeShow(showUI && (touched.email || triedSubmit), () => {
      ok ? showValid(emailInput, emailCheck, emailHelp, "")
        : showInvalid(emailInput, emailCheck, emailHelp, "Ange en giltig e-postadress.");
    });
    return ok;
  }

  // Eventlyssnare för e-post-fältet - Körs vid varje ändring av fältet
  emailInput.addEventListener("input", () => {
    touched.email = true;
    validateEmail(true);
    updateSubmitStateSilent(); // uppdatera knappen utan att rita om fälten
  });

  /* =========================
  Telefon-fält 
  ========================= */
  // Hämtar element för telefon-fältet
  const phoneInput = document.getElementById("phone");
  const phoneCheck = document.getElementById("phoneCheck");
  const phoneHelp = document.getElementById("phoneHelp");

  // Validerar telefon-fältet
  function validatePhone(showUI = true) {
    const cleanedValue = phoneInput.value.replace(/\s+/g, "");
    let ok = false, msg = "";

    if (cleanedValue === "") {
      ok = false; msg = "Telefonnummer är obligatoriskt.";
    } else {
      ok = /^\+?\d[\d-]{6,11}$/.test(cleanedValue);
      if (!ok) msg = "Endast siffror, 7–12 tecken.";
    }

    maybeShow(showUI && (touched.phone || triedSubmit), () => {
      ok ? showValid(phoneInput, phoneCheck, phoneHelp, "")
        : showInvalid(phoneInput, phoneCheck, phoneHelp, msg);
    });
    return ok;
  }

  // Eventlyssnare för telefon-fältet - Körs vid varje ändring av fältet
  phoneInput.addEventListener("input", () => {
    touched.phone = true;
    validatePhone(true);
    updateSubmitStateSilent();
  });

  /* =========================
  Skickaknappen
  ========================= */

  //Knappens utgångsläge
  updateSubmitStateSilent();

  //När knappen trycks
  form.addEventListener("submit", (e) => {
    triedSubmit = true;
    const ok =
      validateName() &&
      validateEmail() &&
      validatePhone();
    if (!ok) {
      e.preventDefault(); // stoppar skickning av formulär
      alert("Formuläret innehåller fel. Kontrollera alla fält.");
    }
    else {
      alert("Formuläret är skickat(egentligen inte, men valideringen är OK) tack för ditt meddelande!");
    }
  });
});
