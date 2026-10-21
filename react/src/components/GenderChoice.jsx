import Input from "./Input.jsx";

const OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

export default function GenderChoice({ gender, genderOther, error, onChange, onBlur }) {
  return (
    <fieldset className="field">
      <legend>
        Gender <span className="optional">(optional)</span>
      </legend>
      <div className="choices">
        {OPTIONS.map((option) => (
          <label className="choice" key={option.value}>
            <input
              type="radio"
              name="gender"
              value={option.value}
              checked={gender === option.value}
              onChange={() => onChange("gender", option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>

      {/* The typed text stays in state while hidden, so picking "Other" again brings it back. */}
      {gender === "other" && (
        <div className="other-detail">
          <Input
            id="genderOther"
            label={
              <>
                Describe your gender <span className="optional">(optional)</span>
              </>
            }
            type="text"
            autoComplete="off"
            value={genderOther}
            error={error}
            onChange={onChange}
            onBlur={onBlur}
          />
        </div>
      )}
    </fieldset>
  );
}
