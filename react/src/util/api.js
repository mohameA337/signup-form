// Small helpers for talking to server.js.
// Each one returns { ok, status, data }. If the server can't be reached, fetch throws.

async function send(method, url, body) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

export const signup = (account) => send("POST", "/api/signup", account);
export const login = (email, password) => send("POST", "/api/login", { email, password });
export const getMe = () => send("GET", "/api/me");
export const logout = () => send("POST", "/api/logout");
