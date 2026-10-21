import { PASSWORD_RULES } from "../util/validation.js";

export default function PasswordRules({ password }) {
  return (
    <ul className="rules" id="password-rules" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li key={rule.id} data-met={met}>
            <span className="mark" aria-hidden="true"></span>
            {rule.label}
            <span className="sr-only">{met ? " (met)" : " (not met)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
