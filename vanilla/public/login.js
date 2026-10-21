"use strict";

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const form = document.getElementById("login");
const fields = {
  email: document.getElementById("email"),
  password: document.getElementById("password"),
};
const submitButton = form.querySelector('button[type="submit"]');
const formError = document.getElementById("form-error");
const revealButton = form.querySelector(".reveal");

// `link` is optional: { href, text } shown after the message.
function showError(id, message, link) {
  const el = document.getElementById(`${id}-error`);
  el.textContent = message;
  if (message && link) {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.text;
    el.append(" ", a);
  }
  el.hidden = !message;
  if (message) fields[id].setAttribute("aria-invalid", "true");
  else fields[id].removeAttribute("aria-invalid");
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

function checkFields() {
  const email = fields.email.value.trim();
  const errors = {
    email: !email ? "Email is required" : !EMAIL_SHAPE.test(email) ? "Enter a valid email address" : "",
    password: fields.password.value ? "" : "Password is required",
  };
  showError("email", errors.email);
  showError("password", errors.password);
  return Object.keys(errors).find((id) => errors[id]);
}

// An error clears as soon as the user edits that field.
form.addEventListener("input", (event) => {
  if (event.target.id in fields) showError(event.target.id, "");
  showFormError("");
});

revealButton.addEventListener("click", () => {
  const reveal = fields.password.type === "password";
  fields.password.type = reveal ? "text" : "password";
  revealButton.textContent = reveal ? "Hide" : "Show";
  revealButton.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showFormError("");
  const firstInvalid = checkFields();
  if (firstInvalid) {
    fields[firstInvalid].focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Logging in…";
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: fields.email.value, password: fields.password.value }),
    });

    if (response.ok) {
      window.location.assign("hello.html");
      return;
    }

    const data = await response.json().catch(() => ({}));
    if (data.code === "no_account") {
      showError("email", "No account found with this email.", { href: "signup.html", text: "Create an account" });
      fields.email.focus();
    } else if (data.code === "wrong_password") {
      showError("password", "Incorrect password.");
      fields.password.focus();
    } else {
      showFormError("Something went wrong on the server. Try again.");
    }
  } catch {
    showFormError("Can't reach the server. Make sure it's running with node server.js, then try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Log in";
  }
});

// Someone who is already logged in goes straight to the hello page.
fetch("/api/me")
  .then((response) => {
    if (response.ok) window.location.replace("hello.html");
  })
  .catch(() => {});
