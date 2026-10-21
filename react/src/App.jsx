import { useEffect, useState } from "react";
import Brand from "./components/Brand.jsx";
import LoginForm from "./components/LoginForm.jsx";
import SignupForm from "./components/SignupForm.jsx";
import Hello from "./components/Hello.jsx";
import { getMe, logout } from "./util/api.js";

// The page is kept in the URL hash (#login or #signup), so links are plain <a href="#signup"> and reload keeps the page.
const pageFromHash = () => (window.location.hash === "#signup" ? "signup" : "login");

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  // null = not logged in. Logged-in users always see Hello.
  const [userName, setUserName] = useState(null);
  const [checkingLogin, setCheckingLogin] = useState(true);

  useEffect(() => {
    const handleHashChange = () => setPage(pageFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Someone who is already logged in goes straight to Hello.
  useEffect(() => {
    getMe()
      .then(({ ok, data }) => ok && setUserName(data.name))
      .catch(() => {})
      .finally(() => setCheckingLogin(false));
  }, []);

  const title = userName ? "Hello" : page === "signup" ? "Create your account" : "Log in";
  useEffect(() => {
    document.title = `${title} · Xtnd`;
  }, [title]);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Server unreachable: still leave the page.
    }
    setUserName(null);
    window.location.hash = "login";
  }

  if (checkingLogin) return null;

  if (userName) return <Hello name={userName} onLogout={handleLogout} />;

  return (
    <div className="shell">
      <Brand />
      <main className="panel">
        {page === "signup" && <SignupForm onSuccess={setUserName} />}
        {page === "login" && <LoginForm onSuccess={setUserName} />}
      </main>
    </div>
  );
}
