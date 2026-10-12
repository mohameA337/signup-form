"use strict";

// Small server for the signup/login pages. Uses only Node built-ins.
// Accounts are saved to users.json; passwords are stored as salted scrypt hashes.
// Run with: node server.js   then open http://localhost:3000

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const USERS_FILE = path.join(__dirname, "users.json");
const MAX_BODY_BYTES = 10 * 1024;

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

// Session token -> user email. Kept in memory, so restarting the server logs everyone out.
const sessions = new Map();

/* ---------- Users file ---------- */

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

// Write to a temp file first so a crash mid-write can't leave users.json half-written.
function saveUsers(users) {
  const temp = `${USERS_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(users, null, 2) + "\n");
  fs.renameSync(temp, USERS_FILE);
}

const normalizeEmail = (email) => email.trim().toLowerCase();
const findUser = (users, email) => users.find((user) => user.email === normalizeEmail(email));

/* ---------- Passwords ---------- */

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function passwordMatches(password, user) {
  const { hash } = hashPassword(password, user.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(user.passwordHash, "hex"));
}

/* ---------- Validation (mirrors public/script.js and SPEC.md) ---------- */

const NAME_CHARS = /^[\p{L}\p{M}' ’-]+$/u;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENDERS = ["", "male", "female", "other", "prefer-not-to-say"];

const isText = (value) => typeof value === "string";
const length = (text) => [...text].length;

function validateSignup(body) {
  const errors = {};
  const name = isText(body.name) ? body.name.trim() : "";
  if (!name) errors.name = "Name is required";
  else if (length(name) < 2 || length(name) > 50) errors.name = "Name must be 2–50 characters";
  else if (!NAME_CHARS.test(name)) errors.name = "Name can only contain letters, spaces, hyphens and apostrophes";

  const email = isText(body.email) ? body.email.trim() : "";
  if (!email) errors.email = "Email is required";
  else if (!EMAIL_SHAPE.test(email)) errors.email = "Enter a valid email address";

  const password = isText(body.password) ? body.password : "";
  if (!password) errors.password = "Password is required";
  else if (
    length(password) < 8 ||
    !/\p{Lu}/u.test(password) ||
    !/\p{Ll}/u.test(password) ||
    !/\p{Nd}/u.test(password) ||
    !/[^\p{L}\p{N}]/u.test(password)
  ) {
    errors.password = "Password doesn't meet all requirements";
  }

  const age = isText(body.age) ? body.age.trim() : "";
  if (!age) errors.age = "Age is required";
  else if (!/^\d+$/.test(age)) errors.age = "Age must be a whole number";
  else if (Number(age) < 18) errors.age = "You must be at least 18 to sign up";
  else if (Number(age) > 120) errors.age = "Please enter a valid age (18–120)";

  const gender = isText(body.gender) ? body.gender : "";
  if (!GENDERS.includes(gender)) errors.gender = "Choose one of the gender options";
  const genderOther = isText(body.genderOther) ? body.genderOther.trim() : "";
  if (gender === "other" && length(genderOther) > 50) {
    errors.genderOther = "Gender description must be 50 characters or fewer";
  }

  if (body.terms !== true) errors.terms = "You must accept the terms to continue";

  return errors;
}

/* ---------- HTTP helpers ---------- */

function sendJson(res, status, data, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (!(req.headers["content-type"] || "").startsWith("application/json")) {
      reject(Object.assign(new Error("Expected JSON"), { status: 415 }));
      return;
    }
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Request too large"), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Not an object");
        resolve(body);
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { status: 400 }));
      }
    });
    req.on("error", reject);
  });
}

function sessionEmail(req) {
  const cookies = Object.fromEntries(
    (req.headers.cookie || "").split(";").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    }),
  );
  return cookies.sid ? sessions.get(cookies.sid) : undefined;
}

function startSession(email) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, email);
  return { "Set-Cookie": `sid=${token}; HttpOnly; SameSite=Lax; Path=/` };
}

/* ---------- API ---------- */

async function signup(req, res) {
  const body = await readJsonBody(req);
  const errors = validateSignup(body);
  if (Object.keys(errors).length) return sendJson(res, 400, { errors });

  const users = loadUsers();
  if (findUser(users, body.email)) {
    return sendJson(res, 409, { code: "email_taken", errors: { email: "An account with this email already exists." } });
  }

  const { salt, hash } = hashPassword(body.password);
  const user = {
    name: body.name.trim(),
    email: normalizeEmail(body.email),
    age: Number(body.age.trim()),
    gender: body.gender || "",
    genderOther: body.gender === "other" ? (body.genderOther || "").trim() : "",
    salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  sendJson(res, 201, { name: user.name }, startSession(user.email));
}

async function login(req, res) {
  const body = await readJsonBody(req);
  if (!isText(body.email) || !isText(body.password) || !body.email.trim() || !body.password) {
    return sendJson(res, 400, { error: "Email and password are required" });
  }
  const user = findUser(loadUsers(), body.email);
  if (!user) return sendJson(res, 404, { code: "no_account" });
  if (!passwordMatches(body.password, user)) return sendJson(res, 401, { code: "wrong_password" });
  sendJson(res, 200, { name: user.name }, startSession(user.email));
}

function me(req, res) {
  const email = sessionEmail(req);
  const user = email && findUser(loadUsers(), email);
  if (!user) return sendJson(res, 401, { error: "Not logged in" });
  sendJson(res, 200, { name: user.name });
}

function logout(req, res) {
  const cookies = (req.headers.cookie || "").match(/(?:^|;\s*)sid=([^;]+)/);
  if (cookies) sessions.delete(cookies[1]);
  res.writeHead(204, { "Set-Cookie": "sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" });
  res.end();
}

const ROUTES = {
  "POST /api/signup": signup,
  "POST /api/login": login,
  "GET /api/me": me,
  "POST /api/logout": logout,
};

/* ---------- Static files (only from public/) ---------- */

function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    return res.end();
  }
  let relative;
  try {
    relative = decodeURIComponent(pathname === "/" ? "/login.html" : pathname);
  } catch {
    res.writeHead(400);
    return res.end();
  }
  const filePath = path.join(PUBLIC_DIR, path.normalize(relative));
  const type = CONTENT_TYPES[path.extname(filePath)];
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) || !type) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    res.end(req.method === "HEAD" ? undefined : data);
  });
}

/* ---------- Server ---------- */

const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  const { pathname } = new URL(req.url, "http://localhost");
  const route = ROUTES[`${req.method} ${pathname}`];
  if (!route) {
    if (pathname.startsWith("/api/")) return sendJson(res, 404, { error: "Not found" });
    return serveStatic(req, res, pathname);
  }
  try {
    await route(req, res);
  } catch (error) {
    if (!error.status) console.error(error);
    if (!res.headersSent) sendJson(res, error.status || 500, { error: error.status ? error.message : "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});
