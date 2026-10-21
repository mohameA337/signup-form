import { useState } from "react";
import Input from "./Input.jsx";
import PasswordInput from "./PasswordInput.jsx";
import { validateLogin } from "../util/validation.js";
import { login } from "../util/api.js";

export default function LoginForm({ onSuccess }) {
  const [values, setValues] = useState({ email: "", password: "" });
  // Errors only appear after clicking Log in, so they are kept in state instead of worked out on every render.
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);

  // An error clears as soon as the user edits that field.
  function handleChange(identifier, newValue) {
    setValues((prevValues) => ({ ...prevValues, [identifier]: newValue }));
    setErrors((prevErrors) => ({ ...prevErrors, [identifier]: "" }));
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    const newErrors = validateLogin(values);
    setErrors(newErrors);
    const firstInvalid = ["email", "password"].find((id) => newErrors[id]);
    if (firstInvalid) {
      document.getElementById(firstInvalid).focus();
      return;
    }

    setSending(true);
    try {
      const { ok, data } = await login(values.email, values.password);
      if (ok) return onSuccess(data.name);

      if (data.code === "no_account") {
        setErrors({
          email: (
            <>
              No account found with this email. <a href="#signup">Create an account</a>
            </>
          ),
        });
        document.getElementById("email").focus();
      } else if (data.code === "wrong_password") {
        setErrors({ password: "Incorrect password." });
        document.getElementById("password").focus();
      } else {
        setFormError("Something went wrong on the server. Try again.");
      }
    } catch {
      setFormError("Can't reach the server. Make sure it's running with node server.js, then try again.");
    }
    setSending(false);
  }

  return (
    <section className="view">
      <header className="view-head">
        <h1>Log in</h1>
        <p className="intro">Welcome back. Enter the email and password you signed up with.</p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck="false"
          value={values.email}
          error={errors.email}
          onChange={handleChange}
        />

        <PasswordInput
          id="password"
          label="Password"
          autoComplete="current-password"
          value={values.password}
          error={errors.password}
          onChange={handleChange}
        />

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="primary" disabled={sending}>
          {sending ? "Logging in…" : "Log in"}
        </button>
        <p className="switch">
          No account? <a href="#signup">Create one</a>
        </p>
      </form>
    </section>
  );
}
