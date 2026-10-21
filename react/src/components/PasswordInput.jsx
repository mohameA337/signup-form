import { useState } from "react";

// Like Input, plus a Show/Hide button. Anything passed as children (the checklist) goes under the input.
export default function PasswordInput({ id, label, error, value, onChange, onBlur, autoComplete, children }) {
  const [visible, setVisible] = useState(false);
  const action = visible ? "Hide" : "Show";
  const describedBy = [children && `${id}-rules`, `${id}-error`].filter(Boolean).join(" ");

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="secret">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(id, event.target.value)}
          onBlur={() => onBlur?.(id)}
        />
        <button
          type="button"
          className="reveal"
          aria-label={`${action} ${label.toLowerCase()}`}
          onClick={() => setVisible((prev) => !prev)}
        >
          {action}
        </button>
      </div>
      {children}
      <p className="error" id={`${id}-error`} aria-live="polite" hidden={!error}>
        {error}
      </p>
    </div>
  );
}
