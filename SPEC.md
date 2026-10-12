# Signup and Login Specification

## Overview
Users create an account on a signup page with clear validation feedback, or log in on a login page if they already have one. Either way they land on a simple hello page that greets them by name. A small local server saves accounts to a `users.json` file.

## Pages
- **Login** (the start page) links to Signup: "No account? Create one".
- **Signup** links to Login: "Already have an account? Log in".
- **Hello** shows "Hello, {name}" and a **Log out** button. Only a logged-in user can see it.
- A logged-in user who opens Login or Signup goes straight to Hello.

## Fields and rules

| Field | Required | Rules | Error message(s) |
|---|---|---|---|
| **Full name** | Yes | Spaces at the start and end are ignored. Must be 2–50 characters. Allowed characters are letters (including accented ones), spaces, hyphens and apostrophes. A name made only of spaces counts as empty. | "Name is required" · "Name must be 2–50 characters" · "Name can only contain letters, spaces, hyphens and apostrophes" |
| **Email** | Yes | Spaces at the start and end are ignored. Must look like `name@domain.tld`: exactly one `@`, text before it, a domain containing a dot after it, and no spaces inside. Capital letters are accepted. | "Email is required" · "Enter a valid email address" · "An account with this email already exists. Log in instead" (with a link to Login) |
| **Password** | Yes | Must be at least 8 characters, with at least one uppercase letter, one lowercase letter, one number and one symbol. A symbol is any character that isn't a letter or a number. Spaces are not trimmed. | "Password is required" · "Password doesn't meet all requirements" |
| **Confirm password** | Yes | Must exactly match the password. | "Please confirm your password" · "Passwords do not match" |
| **Age** | Yes | Must be a whole number from 18 to 120. Spaces at the start and end are ignored. Decimals, letters and negative numbers are rejected. | "Age is required" · "Age must be a whole number" · "You must be at least 18 to sign up" · "Please enter a valid age (18–120)" |
| **Gender** | No | Options are Male, Female, Other and Prefer not to say. Nothing is selected at the start. | None |
| **Describe your gender** | No | Shown only while "Other" is selected. Spaces at the start and end are ignored. At most 50 characters. Text typed here is kept if the user picks another option and then picks "Other" again. While hidden, it is not checked. | "Gender description must be 50 characters or fewer" |
| **Terms checkbox** | Yes | "I agree to the Terms and Conditions" must be checked. The label is plain text with no link. | "You must accept the terms to continue" |

## Validation feedback
- **Untouched fields show no errors.** A field's error first appears when the user leaves that field.
- **Once a field has been left, it re-checks on every change.** Its error updates as the user types and disappears as soon as the value is valid.
- Each field shows **one error at a time**: the first rule it fails, in the order listed in the table.
- An invalid field is clearly marked and its error appears right next to it. Errors are linked to their fields so screen readers announce them.
- **Password checklist:** all five rules are listed under the password field from the start. Each rule updates as met or unmet on every keystroke.
- **Confirm password re-checks when the password changes.** This happens only if the confirm field has already been left.
- **Show/hide toggle:** each password field has its own toggle. Both fields are hidden by default. Toggling doesn't change the value or the validation state.

## Submission
- The submit button can always be clicked, and pressing Enter in a field also submits.
- **If the form is invalid,** every invalid field shows its error, focus moves to the first invalid field, and nothing is submitted.
- **If the form is valid,** the account is sent to the server. While it is sending, the button reads "Creating account…" and can't be clicked again.
- **If the account is created,** the user is logged in and taken to Hello.
- **If the email already has an account** (compared without regard to capital letters or surrounding spaces), the email field shows "An account with this email already exists." with a **Log in instead** link. The same message also appears right above the Create account button, and the page doesn't jump. The field error stays until the email is changed; the message by the button clears on any edit.
- **If the server can't be reached,** a message above the button says so and nothing is lost from the form.

## Saving values between reloads
- Name, email, age, gender, the gender description and the terms checkbox keep their values when the page is reloaded.
- **The two password fields are never stored.** They are always empty after a reload.
- After a reload, the form starts with no errors showing. Restored values are only checked when the user leaves a field or submits.
- Saved values are deleted when an account is created successfully.

## Login
- Fields: email and password (with a show/hide toggle).
- Errors appear when the user clicks **Log in** and disappear as soon as that field is edited.
- Empty email: "Email is required". Badly formed email: "Enter a valid email address". Empty password: "Password is required".
- **Email with no account:** "No account found with this email." with a **Create an account** link to Signup.
- **Wrong password:** "Incorrect password."
- **Success:** the user is taken to Hello.
- Email is matched without regard to capital letters or surrounding spaces.

## Hello page and logging out
- Shows "Hello, {name}" using the name from signup, and a **Log out** button.
- Someone who isn't logged in and opens Hello is sent to Login.
- Log out ends the session and returns to Login. Hello can't be opened again without logging in.

## Accounts
- Saved in `users.json` with name, email (lower-case), age, gender, gender description and creation time.
- **Passwords are never saved as typed.** Only a salted hash is stored.
- The server re-checks every signup rule, so the rules can't be skipped by bypassing the page.
- Logins last until Log out or until the server restarts.

## Out of scope
- A link to a Terms page
- Email verification, password recovery, changing account details, social signup, CAPTCHA
- Login attempt limits, "remember me", and hosting outside your own computer

---

## Acceptance Criteria

### Error timing
1. **GIVEN** a freshly loaded form **WHEN** the user has not interacted with any field **THEN** no errors are shown.
2. **GIVEN** an empty name field **WHEN** the user moves into the field and leaves it without typing **THEN** "Name is required" appears.
3. **GIVEN** a field showing an error **WHEN** the user changes the value to a valid one **THEN** the error disappears right away, without leaving the field.
4. **GIVEN** a field that has been left once and is valid **WHEN** the user changes it to an invalid value **THEN** the error appears right away.
5. **GIVEN** a field the user has not left yet **WHEN** they type an invalid value **THEN** no error appears until they leave the field.
6. **GIVEN** a field breaks more than one rule **WHEN** its error is shown **THEN** only the first failed rule's message appears, in table order.

### Name
7. **GIVEN** the name is only spaces **WHEN** it is checked **THEN** "Name is required" appears.
8. **GIVEN** the name is "  A  " **WHEN** it is checked **THEN** "Name must be 2–50 characters" appears.
9. **GIVEN** a 51-character name **WHEN** it is checked **THEN** "Name must be 2–50 characters" appears.
10. **GIVEN** the name contains a digit or a symbol such as "@" **WHEN** it is checked **THEN** "Name can only contain letters, spaces, hyphens and apostrophes" appears.
11. **GIVEN** the name is "José O'Brien-Smith" **WHEN** it is checked **THEN** it is valid.

### Email
12. **GIVEN** an empty email **WHEN** it is checked **THEN** "Email is required" appears.
13. **GIVEN** an email such as "user", "user@", "@site.com", "user@site", "a@@b.com" or "us er@site.com" **WHEN** it is checked **THEN** "Enter a valid email address" appears.
14. **GIVEN** the email is "  User@Example.COM  " **WHEN** it is checked **THEN** it is valid.

### Password
15. **GIVEN** a freshly loaded form **THEN** the password checklist shows all five rules as unmet.
16. **GIVEN** the user is typing a password **WHEN** each character is entered **THEN** each checklist rule updates as met or unmet right away.
17. **GIVEN** an empty password **WHEN** it is checked **THEN** "Password is required" appears.
18. **GIVEN** a password that is missing any rule (for example "Password1" with no symbol) **WHEN** it is checked **THEN** "Password doesn't meet all requirements" appears, and the missing rule shows as unmet.
19. **GIVEN** the password is "Passw0rd!" **WHEN** it is checked **THEN** it is valid and every checklist rule shows as met.
20. **GIVEN** a password with spaces at the start or end **WHEN** it is checked **THEN** the spaces are kept and count as characters.

### Confirm password
21. **GIVEN** an empty confirm field **WHEN** it is checked **THEN** "Please confirm your password" appears.
22. **GIVEN** the confirm value differs from the password, including only in capital letters **WHEN** it is checked **THEN** "Passwords do not match" appears.
23. **GIVEN** the confirm field has been left and matches **WHEN** the user then changes the password **THEN** "Passwords do not match" appears on the confirm field right away.
24. **GIVEN** a mismatch error is showing **WHEN** the user changes the password so the two match again **THEN** the mismatch error disappears.

### Show/hide password
25. **GIVEN** a freshly loaded form **THEN** both password fields hide what's typed.
26. **GIVEN** a password field **WHEN** the user clicks its show/hide toggle **THEN** only that field switches between visible and hidden, and its value and errors are unchanged.

### Age
27. **GIVEN** an empty age **WHEN** it is checked **THEN** "Age is required" appears.
28. **GIVEN** the age is "abc", "18.5" or "-5" **WHEN** it is checked **THEN** "Age must be a whole number" appears.
29. **GIVEN** the age is 17 **WHEN** it is checked **THEN** "You must be at least 18 to sign up" appears.
30. **GIVEN** the age is 121 **WHEN** it is checked **THEN** "Please enter a valid age (18–120)" appears.
31. **GIVEN** the age is 18, 120 or " 30 " **WHEN** it is checked **THEN** it is valid.

### Gender
32. **GIVEN** a freshly loaded form **THEN** no gender option is selected.
33. **GIVEN** no gender is selected and every other field is valid **WHEN** the user submits **THEN** the submission succeeds.
34. **GIVEN** the gender options **THEN** exactly Male, Female, Other and Prefer not to say are offered, and only one can be selected.
35. **GIVEN** a freshly loaded form **WHEN** the user selects "Other" **THEN** a "Describe your gender (optional)" text field appears below the options.
36. **GIVEN** "Other" is selected **WHEN** the user selects a different option **THEN** the text field is hidden and any error on it disappears.
37. **GIVEN** "Other" is selected and the text field is empty **WHEN** every other field is valid and the user submits **THEN** the submission succeeds.
38. **GIVEN** "Other" is selected and the text field has 51 characters **WHEN** it is checked **THEN** "Gender description must be 50 characters or fewer" appears and the form cannot be submitted.
39. **GIVEN** the user typed in the text field, then selected a different option **WHEN** they select "Other" again **THEN** the text field reappears with their text still in it.

### Terms
40. **GIVEN** the terms box is unchecked **WHEN** the user submits **THEN** "You must accept the terms to continue" appears.
41. **GIVEN** the terms error is showing **WHEN** the user checks the box **THEN** the error disappears right away.
42. **GIVEN** the terms label **THEN** it is plain text and contains no link.

### Submission
43. **GIVEN** any field is invalid **WHEN** the user clicks submit **THEN** every invalid field shows its error, including untouched fields, focus moves to the first invalid field in form order, and nothing is sent to the server.
44. **GIVEN** the user is in any text field **WHEN** they press Enter **THEN** the form submits with the same behaviour as clicking submit.
45. **GIVEN** every field is valid and the email is new **WHEN** the user submits **THEN** the account is saved to users.json and the user is taken to Hello, which shows "Hello, {trimmed name}".
46. **GIVEN** the account is being sent **THEN** the button reads "Creating account…" and can't be clicked again.
47. **GIVEN** an account exists for "sara@example.com" **WHEN** someone signs up with " Sara@Example.com " **THEN** the email field shows "An account with this email already exists." with a Log in instead link, and no second account is saved.
48. **GIVEN** the duplicate-email error is showing **WHEN** the user changes the email **THEN** the error is replaced by the normal email check.
49. **GIVEN** the server isn't running **WHEN** the user submits a valid form **THEN** a message says the server can't be reached, and the form keeps its values.

### Saving values between reloads
50. **GIVEN** the user has entered a name, email, age, gender (with any gender description) and terms choice **WHEN** they reload the page **THEN** those values are restored.
51. **GIVEN** the user has typed in either password field **WHEN** they reload the page **THEN** both password fields are empty.
52. **GIVEN** values were restored after a reload, including invalid ones **THEN** no errors are shown until the user leaves a field or submits.
53. **GIVEN** an account was created **WHEN** the user later opens Signup again after logging out **THEN** an empty form is shown.

### Login
54. **GIVEN** the Login page **WHEN** the user clicks Log in with both fields empty **THEN** "Email is required" and "Password is required" appear, and focus moves to the email field.
55. **GIVEN** an error is showing on a login field **WHEN** the user edits that field **THEN** the error disappears.
56. **GIVEN** no account exists for the email **WHEN** the user logs in **THEN** "No account found with this email." appears with a Create an account link to Signup.
57. **GIVEN** an account exists **WHEN** the user logs in with the wrong password **THEN** "Incorrect password." appears.
58. **GIVEN** an account exists **WHEN** the user logs in with the right password, in any capitalisation of the email **THEN** they are taken to Hello, which shows their name.

### Navigation and logging out
59. **GIVEN** the Login page **THEN** it has a "Create one" link to Signup, and Signup has a "Log in" link to Login.
60. **GIVEN** the user is not logged in **WHEN** they open Hello **THEN** they are sent to Login.
61. **GIVEN** the user is logged in **WHEN** they open Login or Signup **THEN** they are sent to Hello.
62. **GIVEN** the user is on Hello **WHEN** they click Log out **THEN** they are taken to Login, and opening Hello again sends them back to Login.

### Saved accounts
63. **GIVEN** an account was created **WHEN** users.json is opened **THEN** it contains the account's details and a password hash, never the typed password.
