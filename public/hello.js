"use strict";

const page = document.getElementById("hello");
const greeting = document.getElementById("greeting");
const logoutButton = document.getElementById("logout");

// Only logged-in users can see this page; everyone else goes to the login page.
fetch("/api/me")
  .then((response) => (response.ok ? response.json() : Promise.reject()))
  .then((user) => {
    greeting.textContent = `Hello, ${user.name}`;
    page.hidden = false;
  })
  .catch(() => window.location.replace("login.html"));

logoutButton.addEventListener("click", async () => {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch {
    // Server unreachable: still leave the page.
  }
  window.location.replace("login.html");
});
