"use strict";

/* ---------- Validation rules (see SPEC.md) ---------- */

const NAME_CHARS = /^[\p{L}\p{M}' ’-]+$/u;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS = /^\d+$/;
const EMAIL_TAKEN = "An account with this email already exists.";

const PASSWORD_RULES = {
  length: (pw) => [...pw].length >= 8,
  upper: (pw) => /\p{Lu}/u.test(pw),
  lower: (pw) => /\p{Ll}/u.test(pw),
  number: (pw) => /\p{Nd}/u.test(pw),
  symbol: (pw) => /[^\p{L}\p{N}]/u.test(pw),
};

const validators = {
  name(value) {
    const name = value.trim();
    if (!name) return "Name is required";
    const length = [...name].length;
    if (length < 2 || length > 50) return "Name must be 2–50 characters";
    if (!NAME_CHARS.test(name))
      return "Name can only contain letters, spaces, hyphens and apostrophes";
    return "";
  },
  email(value) {
    const email = value.trim();
    if (!email) return "Email is required";
    if (!EMAIL_SHAPE.test(email)) return "Enter a valid email address";
    if (takenEmails.has(email.toLowerCase())) return EMAIL_TAKEN;
    return "";
  },
  password(value) {
    if (!value) return "Password is required";
    if (!Object.values(PASSWORD_RULES).every((rule) => rule(value))) {
      return "Password doesn't meet all requirements";
    }
    return "";
  },
  confirm(value) {
    if (!value) return "Please confirm your password";
    if (value !== fields.password.value) return "Passwords do not match";
    return "";
  },
  age(value) {
    const age = value.trim();
    if (!age) return "Age is required";
    if (!DIGITS.test(age)) return "Age must be a whole number";
    const years = Number(age);
    if (years < 18) return "You must be at least 18 to sign up";
    if (years > 120) return "Please enter a valid age (18–120)";
    return "";
  },
  // Only checked while "Other" is selected; the field is hidden otherwise.
  genderOther(value) {
    if (!otherSelected()) return "";
    if ([...value.trim()].length > 50)
      return "Gender description must be 50 characters or fewer";
    return "";
  },
  terms(checked) {
    return checked ? "" : "You must accept the terms to continue";
  },
};

/* ---------- Elements and state ---------- */

const STORAGE_KEY = "ledgerline-signup";
const ORDER = [
  "name",
  "email",
  "password",
  "confirm",
  "age",
  "genderOther",
  "terms",
];

const form = document.getElementById("signup");
const submitButton = form.querySelector('button[type="submit"]');
const formError = document.getElementById("form-error");
const genderInputs = [...form.querySelectorAll('input[name="gender"]')];
const otherDetail = document.getElementById("gender-other-detail");
const ruleItems = [...document.querySelectorAll("#password-rules li")];
const revealButtons = [...form.querySelectorAll(".reveal")];

const fields = Object.fromEntries(
  ORDER.map((id) => [id, document.getElementById(id)]),
);
const touched = new Set();
// Emails the server has said are already registered, so the error stays until the email changes.
const takenEmails = new Set();

const otherSelected = () => document.getElementById("gender-other").checked;

// Typed text is kept while hidden, so picking "Other" again brings it back.
function syncOtherDetail() {
  otherDetail.hidden = !otherSelected();
  render("genderOther");
}

const valueOf = (id) =>
  id === "terms" ? fields.terms.checked : fields[id].value;
const errorFor = (id) => validators[id](valueOf(id));

function showError(id, message) {
  const el = document.getElementById(`${id}-error`);
  el.textContent = message;
  if (message === EMAIL_TAKEN) {
    const link = document.createElement("a");
    link.href = "login.html";
    link.textContent = "Log in instead";
    el.append(" ", link);
  }
  el.hidden = !message;
  if (message) fields[id].setAttribute("aria-invalid", "true");
  else fields[id].removeAttribute("aria-invalid");
}

// Errors only show for fields the user has left at least once (or after a submit attempt).
function render(id) {
  showError(id, touched.has(id) ? errorFor(id) : "");
}

function updateChecklist() {
  const pw = fields.password.value;
  for (const li of ruleItems) {
    const met = PASSWORD_RULES[li.dataset.rule](pw);
    li.dataset.met = String(met);
    li.querySelector(".state").textContent = met ? " (met)" : " (not met)";
  }
}

function hidePasswords() {
  for (const button of revealButtons) {
    const input = document.getElementById(button.dataset.target);
    input.type = "password";
    button.textContent = "Show";
    button.setAttribute(
      "aria-label",
      button.getAttribute("aria-label").replace(/^Hide/, "Show"),
    );
  }
}

/* ---------- Saving values between reloads (passwords are never stored) ---------- */

function save() {
  const data = {
    name: fields.name.value,
    email: fields.email.value,
    age: fields.age.value,
    gender: genderInputs.find((r) => r.checked)?.value ?? "",
    genderOther: fields.genderOther.value,
    terms: fields.terms.checked,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode, blocked): the form still works without it.
  }
}

function clearSaved() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

function loadSaved() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

const asText = (v) => (typeof v === "string" ? v : "");

// Sets every control explicitly so browser form-restoration can't bring back stale values.
function fillForm(data) {
  touched.clear();
  fields.name.value = asText(data.name);
  fields.email.value = asText(data.email);
  fields.password.value = "";
  fields.confirm.value = "";
  fields.age.value = asText(data.age);
  for (const radio of genderInputs) radio.checked = radio.value === data.gender;
  fields.genderOther.value = asText(data.genderOther);
  otherDetail.hidden = !otherSelected();
  fields.terms.checked = data.terms === true;
  ORDER.forEach((id) => showError(id, ""));
  hidePasswords();
  updateChecklist();
}

/* ---------- Events ---------- */

form.addEventListener("focusout", (event) => {
  const id = event.target.dataset.field;
  if (!id) return;
  touched.add(id);
  render(id);
});

function onEdit(event) {
  showFormError("");
  const id = event.target.dataset.field;
  if (id) render(id);
  if (event.target.name === "gender") syncOtherDetail();
  if (id === "password") {
    updateChecklist();
    render("confirm");
  }
  save();
}

form.addEventListener("input", onEdit);
form.addEventListener("change", onEdit);

for (const button of revealButtons) {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    button.textContent = reveal ? "Hide" : "Show";
    const label = button.getAttribute("aria-label");
    button.setAttribute(
      "aria-label",
      reveal ? label.replace(/^Show/, "Hide") : label.replace(/^Hide/, "Show"),
    );
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  ORDER.forEach((id) => touched.add(id));
  ORDER.forEach(render);

  const firstInvalid = ORDER.find((id) => errorFor(id));
  if (firstInvalid) {
    fields[firstInvalid].focus();
    return;
  }

  createAccount();
});

/* ---------- Sending the account to the server ---------- */

// `link` is optional: { href, text } shown after the message.
function showFormError(message, link) {
  formError.textContent = message;
  if (message && link) {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.text;
    formError.append(" ", a);
  }
  formError.hidden = !message;
}

async function createAccount() {
  showFormError("");
  submitButton.disabled = true;
  submitButton.textContent = "Creating account…";
  const gender = genderInputs.find((r) => r.checked)?.value ?? "";
  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fields.name.value,
        email: fields.email.value,
        password: fields.password.value,
        age: fields.age.value,
        gender,
        genderOther: gender === "other" ? fields.genderOther.value : "",
        terms: fields.terms.checked,
      }),
    });

    if (response.ok) {
      clearSaved();
      window.location.assign("hello.html");
      return;
    }

    const data = await response.json().catch(() => ({}));
    if (response.status === 409) {
      // Shown at the email field and next to the button, where the user is looking; the view doesn't jump.
      takenEmails.add(fields.email.value.trim().toLowerCase());
      render("email");
      showFormError(`${EMAIL_TAKEN} Use a different email, or`, {
        href: "login.html",
        text: "log in instead",
      });
    } else if (data.errors) {
      // The server re-checks every rule; show anything it rejected next to its field.
      const rejected = ORDER.filter((id) => data.errors[id]);
      rejected.forEach((id) => showError(id, data.errors[id]));
      if (rejected.length) fields[rejected[0]].focus();
      else
        showFormError(
          "Some details were rejected. Check the form and try again.",
        );
    } else {
      showFormError("Something went wrong on the server. Try again.");
    }
  } catch {
    showFormError(
      "Can't reach the server. Make sure it's running with node server.js, then try again.",
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Create account";
  }
}

// Someone who is already logged in goes straight to the hello page.
fetch("/api/me")
  .then((response) => {
    if (response.ok) window.location.replace("hello.html");
  })
  .catch(() => {});

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) fillForm(loadSaved());
});
