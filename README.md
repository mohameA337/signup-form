# Xtnd signup and login

Signup and login pages with a small Node server that saves accounts to `users.json`.
No packages to install; it uses only Node's built-in modules.

## Run it

```sh
npm start        # or: node server.js
```

Then open http://localhost:3000. Use `PORT=3001 npm start` to pick another port.

## Project layout

| Path | What it is |
|---|---|
| `server.js` | Serves `public/` and the `/api/signup`, `/api/login`, `/api/me` and `/api/logout` routes. Reads and writes `users.json`. |
| `public/login.html`, `login.js` | Login page (the start page). |
| `public/signup.html`, `script.js` | Signup form with live validation. |
| `public/hello.html`, `hello.js` | "Hello, {name}" page with Log out. |
| `public/styles.css` | Shared styles. |
| `SPEC.md` | Behaviour spec and acceptance criteria. |

## Accounts

`users.json` is created on the first signup and is not committed. Passwords are stored only as salted scrypt hashes.
Logins are kept in memory, so restarting the server logs everyone out.
