// Validation rules from SPEC.md. Each function returns an error message, or "" when the value is fine.
// server.js checks the same rules again.

const NAME_CHARS = /^[\p{L}\p{M}' ’-]+$/u;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS = /^\d+$/;

export const EMAIL_TAKEN = "An account with this email already exists.";

// The password checklist. Each rule gets the password and returns true when it is met.
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (pw) => [...pw].length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (pw) => /\p{Lu}/u.test(pw) },
  { id: "lower", label: "One lowercase letter", test: (pw) => /\p{Ll}/u.test(pw) },
  { id: "number", label: "One number", test: (pw) => /\p{Nd}/u.test(pw) },
  { id: "symbol", label: "One symbol, such as ! or #", test: (pw) => /[^\p{L}\p{N}]/u.test(pw) },
];

function checkEmail(value) {
  const email = value.trim();
  if (!email) return "Email is required";
  if (!EMAIL_SHAPE.test(email)) return "Enter a valid email address";
  return "";
}

// `takenEmail` is an email the server said is already registered (lower-case), or "".
export function validateSignup(values, takenEmail) {
  const errors = {};

  const name = values.name.trim();
  const nameLength = [...name].length;
  if (!name) errors.name = "Name is required";
  else if (nameLength < 2 || nameLength > 50) errors.name = "Name must be 2–50 characters";
  else if (!NAME_CHARS.test(name)) errors.name = "Name can only contain letters, spaces, hyphens and apostrophes";

  errors.email = checkEmail(values.email);
  if (!errors.email && values.email.trim().toLowerCase() === takenEmail) errors.email = EMAIL_TAKEN;

  if (!values.password) errors.password = "Password is required";
  else if (!PASSWORD_RULES.every((rule) => rule.test(values.password))) {
    errors.password = "Password doesn't meet all requirements";
  }

  if (!values.confirm) errors.confirm = "Please confirm your password";
  else if (values.confirm !== values.password) errors.confirm = "Passwords do not match";

  const age = values.age.trim();
  if (!age) errors.age = "Age is required";
  else if (!DIGITS.test(age)) errors.age = "Age must be a whole number";
  else if (Number(age) < 18) errors.age = "You must be at least 18 to sign up";
  else if (Number(age) > 120) errors.age = "Please enter a valid age (18–120)";

  // Only checked while "Other" is selected; the box is hidden otherwise.
  if (values.gender === "other" && [...values.genderOther.trim()].length > 50) {
    errors.genderOther = "Gender description must be 50 characters or fewer";
  }

  if (!values.terms) errors.terms = "You must accept the terms to continue";

  return errors;
}

export function validateLogin(values) {
  return {
    email: checkEmail(values.email),
    password: values.password ? "" : "Password is required",
  };
}
