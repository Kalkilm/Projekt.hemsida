document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const submitBtn = document.getElementById("submitBtn");
    const formFeedback = document.getElementById("formFeedback");

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

    /* Namn-fält */
    const nameInput = document.getElementById("name");
    const nameCheck = document.getElementById("nameCheck");
    const nameHelp = document.getElementById("nameHelp");

    function validateName() {
        const val = nameInput.value.trim();
        if (val.length >= 2) {
            showValid(nameInput, nameCheck, nameHelp, "");
            return true;
        } else {
            showInvalid(nameInput, nameCheck, nameHelp, "Ange minst 2 tecken.");
            return false;
        }
    }

    // körs varje gång användaren skriver i fältet
    nameInput.addEventListener("input", validateName);

    /* E-post-fält */
    const emailInput = document.getElementById("email");
    const emailCheck = document.getElementById("emailCheck");
    const emailHelp = document.getElementById("emailHelp");

    function validateEmail() {
        const val = emailInput.value.trim();
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // regex för e-post
        if (re.test(val)) {
            showValid(emailInput, emailCheck, emailHelp, "");
            return true;
        } else {
            showInvalid(emailInput, emailCheck, emailHelp, "Ange en giltig e-postadress.");
            return false;
        }
    }

    emailInput.addEventListener("input", validateEmail);

    /* Telefon-fält */
    const phoneInput = document.getElementById("phone");
    const phoneCheck = document.getElementById("phoneCheck");
    const phoneHelp = document.getElementById("phoneHelp");

    /*
    tillåt mellanslag i skrivandet men validera siffror
    Telefon ej obligatoriskt: inget fel när tomt
    */

    function validatePhone() {
       
        const onlyDigits = phoneInput.value.replace(/\s+/g, "");
        if (onlyDigits === "") {
           
            phoneInput.removeAttribute("aria-invalid");
            phoneCheck.classList.remove("visible");
            phoneHelp.textContent = "";
            phoneHelp.classList.remove("valid", "invalid");
            return true;
        }
        const re = /^\d{7,12}$/; // 7–12 siffror
        if (re.test(onlyDigits)) {
            showValid(phoneInput, phoneCheck, phoneHelp, "");
            return true;
        } else {
            showInvalid(phoneInput, phoneCheck, phoneHelp, "Endast siffror, 7–12 tecken.");
            return false;
        }
    }

    // Realtidslyssnare
    phoneInput.addEventListener("input", validatePhone);

    /* Submit-knappen */
    function updateSubmitState() {
        const ok =
            validateName() &&
            validateEmail() &&
            validatePhone();
        submitBtn.disabled = !ok; // knappen låses tills allt är korrekt
    }

    form.addEventListener("input", updateSubmitState);
    form.addEventListener("change", updateSubmitState);

    // kör en första kontroll direkt när sidan laddas
    updateSubmitState();

    /* Hantera när användaren trycker "Skicka" */
    form.addEventListener("submit", (e) => {
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
