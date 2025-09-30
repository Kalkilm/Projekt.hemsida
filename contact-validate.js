document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const touched = { name: false, email: false, phone: false };
  let triedSubmit = false;

  /* Hjälpfunktioner som används för alla fält */
  function showValid(field, checkEl, helpEl, message) {
    field.removeAttribute("aria-invalid");   // fältet är okej
    checkEl.classList.add("visible");        // visa checkmark
    helpEl.textContent = message || "";      // visa ev meddelande
    helpEl.classList.remove("invalid");
    helpEl.classList.add("valid");
  }

  function showInvalid(field, checkEl, helpEl, message) {
    field.setAttribute("aria-invalid", "true"); // markera som ogiltigt
    checkEl.classList.remove("visible");        // göm checkmark
    helpEl.textContent = message || "";         // visa felmeddelande
    helpEl.classList.remove("valid");
    helpEl.classList.add("invalid");
  }

  function updateSubmitStateSilent() {
    const ok =
      validateName(false) &&   // kör validering utan att rita UI
      validateEmail(false) &&
      validatePhone(false);
    submitBtn.disabled = !ok;
  }


  function maybeShow(shouldShow, drawFn) {
    if (shouldShow) drawFn();
  }

  /* Namn-fält */
  const nameInput = document.getElementById("name");
  const nameCheck = document.getElementById("nameCheck");
  const nameHelp = document.getElementById("nameHelp");

  function validateName(showUI = true) {                       // CHANGED (la till showUI-parameter)
    const val = nameInput.value.trim();                        // (samma logik)
    const ok = val.length >= 2;                                // CHANGED (sparar i variabel)
    maybeShow(showUI && (touched.name || triedSubmit), () => { // NEW (ritar UI villkorat)
      ok ? showValid(nameInput, nameCheck, nameHelp, "")       // CHANGED (flyttat in i maybeShow)
        : showInvalid(nameInput, nameCheck, nameHelp, "Ange minst 2 tecken."); // CHANGED (flyttat)
    });
    return ok;                                                 // CHANGED (returnerar ok alltid)
  }

  // körs varje gång användaren skriver i fältet
  nameInput.addEventListener("input", () => {
    touched.name = true;
    validateName(true);
    updateSubmitStateSilent(); // uppdatera knappen utan att rita om fälten
  });

  nameInput.addEventListener("blur", () => {
    touched.name = true;
    validateName(true);
    updateSubmitStateSilent(); // uppdatera knappen utan att rita om fälten
  });

  /* E-post-fält */
  const emailInput = document.getElementById("email");
  const emailCheck = document.getElementById("emailCheck");
  const emailHelp = document.getElementById("emailHelp");

  function validateEmail(showUI = true) {
    const val = emailInput.value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // regex för e-post
    const ok = re.test(val);                                   // CHANGED
    maybeShow(showUI && (touched.email || triedSubmit), () => { // NEW
      ok ? showValid(emailInput, emailCheck, emailHelp, "")    // CHANGED
        : showInvalid(emailInput, emailCheck, emailHelp, "Ange en giltig e-postadress."); // CHANGED
    });
    return ok;                                                 // CHANGED
  }

  emailInput.addEventListener("input", () => {
    touched.email = true;
    validateEmail(true);
    updateSubmitStateSilent(); // uppdatera knappen utan att rita om fälten
  });

  emailInput.addEventListener("blur", () => {
    touched.email = true;
    validateEmail(true);
    updateSubmitStateSilent(); // uppdatera knappen utan att rita om fälten
  });

  /* Telefon-fält */
  const phoneInput = document.getElementById("phone");
  const phoneCheck = document.getElementById("phoneCheck");
  const phoneHelp = document.getElementById("phoneHelp");

  /*
  tillåt mellanslag i skrivandet men validera siffror
  Telefon ej obligatoriskt: inget fel när tomt
  */

  function validatePhone(showUI = true) {
    const cleanedValue = phoneInput.value.replace(/\s+/g, "");
    let ok = false, msg = "";

    if (cleanedValue === "") {
      ok = false; msg = "Telefonnummer är obligatoriskt.";
    } else {
      ok = /^[\d-]{7,12}$/.test(cleanedValue);
      if (!ok) msg = "Endast siffror, 7–12 tecken.";
    }

    maybeShow(showUI && (touched.phone || triedSubmit), () => {
      ok ? showValid(phoneInput, phoneCheck, phoneHelp, "")
        : showInvalid(phoneInput, phoneCheck, phoneHelp, msg);
    });
<<<<<<< Updated upstream

    emailInput.addEventListener("blur", () => {
        touched.email = true;
        validateEmail(true);
        updateSubmitStateSilent(); // uppdatera knappen utan att rita om fälten
    });

    /* Telefon-fält */
    const phoneInput = document.getElementById("phone");
    const phoneCheck = document.getElementById("phoneCheck");
    const phoneHelp = document.getElementById("phoneHelp");


    function validatePhone(showUI = true) {
 const cleanedValue = phoneInput.value.replace(/\s+/g, "");
  let ok = false, msg = "";

  if (cleanedValue === "") {
    ok = false; msg = "Telefonnummer är obligatoriskt.";
  } else {
    ok = /^[\d-]{7,12}$/.test(cleanedValue);
    if (!ok) msg = "Endast siffror, 7–12 tecken.";
=======
    return ok;
>>>>>>> Stashed changes
  }

  phoneInput.addEventListener("input", () => {
    touched.phone = true;
    validatePhone(true);
    updateSubmitStateSilent();
  });
  phoneInput.addEventListener("blur", () => {
    touched.phone = true;
    validatePhone(true);
    updateSubmitStateSilent();
  });

  updateSubmitStateSilent();

  /* Hantera när användaren trycker "Skicka" */
  form.addEventListener("submit", (e) => {
    triedSubmit = true;
    const ok =
      validateName() &&
      validateEmail() &&
      validatePhone();
    if (!ok) {
      e.preventDefault(); // stoppa skick
      // sätt fokus på första fält som är fel
      if (nameInput.getAttribute("aria-invalid") === "true") nameInput.focus();
      else if (emailInput.getAttribute("aria-invalid") === "true") emailInput.focus();
      else if (phoneInput.getAttribute("aria-invalid") === "true") phoneInput.focus();
    }
  });
});
