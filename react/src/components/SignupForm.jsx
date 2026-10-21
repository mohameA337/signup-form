import { useEffect, useState } from "react";
import Input from "./Input.jsx";
import PasswordInput from "./PasswordInput.jsx";
import PasswordRules from "./PasswordRules.jsx";
import GenderChoice from "./GenderChoice.jsx";
import { EMAIL_TAKEN, validateSignup } from "../util/validation.js";
import { signup } from "../util/api.js";

const STORAGE_KEY = "Xtnd-signup";
const ORDER = [
  "name",
  "email",
  "password",
  "confirm",
  "age",
  "genderOther",
  "terms",
];

// Values are kept in localStorage between reloads. Passwords are never stored.
function loadSaved() {
  const empty = {
    name: "",
    email: "",
    password: "",
    confirm: "",
    age: "",
    gender: "",
    genderOther: "",
    terms: false,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    const text = (key) => (typeof saved[key] === "string" ? saved[key] : "");
    return {
      ...empty,
      name: text("name"),
      email: text("email"),
      age: text("age"),
      gender: text("gender"),
      genderOther: text("genderOther"),
      terms: saved.terms === true,
    };
  } catch {
    return empty;
  }
}

function clearSaved() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}

export default function SignupForm({ onSuccess }) {
  const [values, setValues] = useState(loadSaved);
  // Fields the user has left at least once. Errors only show for these.
  const [touched, setTouched] = useState({});
  // An email the server said is already registered, so its error stays until the email changes.
  const [takenEmail, setTakenEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);

  const errors = validateSignup(values, takenEmail);
  const showError = (id) => (touched[id] ? errors[id] : "");

  useEffect(() => {
    const { password, confirm, ...rest } = values;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {
      // Storage unavailable (private mode, blocked): the form still works without it.
    }
  }, [values]);

  function handleChange(identifier, newValue) {
    setValues((prevValues) => ({ ...prevValues, [identifier]: newValue }));
    setFormError("");
  }

  function handleBlur(identifier) {
    setTouched((prevTouched) => ({ ...prevTouched, [identifier]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setTouched(Object.fromEntries(ORDER.map((id) => [id, true])));
    const firstInvalid = ORDER.find((id) => errors[id]);
    if (firstInvalid) {
      document.getElementById(firstInvalid).focus();
      return;
    }

    setFormError("");
    setSending(true);
    try {
      const { ok, status } = await signup({
        ...values,
        genderOther: values.gender === "other" ? values.genderOther : "",
      });
      if (ok) {
        clearSaved();
        return onSuccess(values.name.trim());
      }

      if (status === 409) {
        setTakenEmail(values.email.trim().toLowerCase());
        setFormError(
          <>
            {EMAIL_TAKEN} Use a different email, or{" "}
            <a href="#login">log in instead</a>
          </>,
        );
      } else if (status === 400) {
        setFormError(
          "Some details were rejected. Check the form and try again.",
        );
      } else {
        setFormError("Something went wrong on the server. Try again.");
      }
    } catch {
      setFormError(
        "Can't reach the server. Make sure it's running with node server.js, then try again.",
      );
    }
    setSending(false);
  }

  return (
    <section className="view">
      <header className="view-head">
        <h1>Create your account</h1>
        <p className="intro">All fields are required unless marked optional.</p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <Input
          id="name"
          label="Full name"
          type="text"
          autoComplete="name"
          value={values.name}
          error={showError("name")}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck="false"
          value={values.email}
          error={
            showError("email") === EMAIL_TAKEN ? (
              <>
                {EMAIL_TAKEN} <a href="#login">Log in instead</a>
              </>
            ) : (
              showError("email")
            )
          }
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <PasswordInput
          id="password"
          label="Password"
          autoComplete="new-password"
          value={values.password}
          error={showError("password")}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <PasswordRules password={values.password} />
        </PasswordInput>

        <PasswordInput
          id="confirm"
          label="Confirm password"
          autoComplete="new-password"
          value={values.confirm}
          error={showError("confirm")}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <Input
          id="age"
          label="Age"
          hint="You must be 18 or older."
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="short"
          value={values.age}
          error={showError("age")}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <GenderChoice
          gender={values.gender}
          genderOther={values.genderOther}
          error={showError("genderOther")}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <div className="field">
          <label className="check" htmlFor="terms">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={values.terms}
              aria-invalid={showError("terms") ? true : undefined}
              aria-describedby="terms-error"
              onChange={(event) => handleChange("terms", event.target.checked)}
              onBlur={() => handleBlur("terms")}
            />
            I agree to the Terms and Conditions
          </label>
          <p
            className="error"
            id="terms-error"
            aria-live="polite"
            hidden={!showError("terms")}
          >
            {showError("terms")}
          </p>
        </div>

        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <button type="submit" className="primary" disabled={sending}>
          {sending ? "Creating account…" : "Create account"}
        </button>
        <p className="switch">
          Already have an account? <a href="#login">Log in</a>
        </p>
      </form>
    </section>
  );
}
