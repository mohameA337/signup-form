// A label, a text input and its error message.
// `error` can be text or JSX (for an error with a link). Nothing shows when it is empty.
export default function Input({ id, label, hint, error, value, onChange, onBlur, ...inputProps }) {
  const describedBy = [hint && `${id}-hint`, `${id}-error`].filter(Boolean).join(" ");

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && (
        <p className="hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      <input
        id={id}
        name={id}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(id, event.target.value)}
        onBlur={() => onBlur?.(id)}
        {...inputProps}
      />
      <p className="error" id={`${id}-error`} aria-live="polite" hidden={!error}>
        {error}
      </p>
    </div>
  );
}
