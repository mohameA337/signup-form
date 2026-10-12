# Xtnd signup and login

A small signup and login app. The pages are plain HTML, CSS and JavaScript, and a Node server saves accounts to `users.json` with hashed passwords. Run it with `npm start` and open http://localhost:3000.

## Login flow

```mermaid
flowchart TD
    A(["Start: open the app"]) --> B["Login page"]
    B --> C["Enter email and password"]
    C --> D["Click Log in"]
    D --> E{"Fields valid?"}
    E -- No --> F["Show field errors"]
    F --> C
    E -- Yes --> G["Send login request to server"]
    G --> H{"User exists?"}
    H -- No --> I["Show 'No account found' with link to Signup"]
    I --> C
    H -- Yes --> J{"Password correct?"}
    J -- No --> K["Show 'Incorrect password'"]
    K --> C
    J -- Yes --> L["Create session cookie"]
    L --> M["Redirect to Hello page"]
    M --> N(["End"])
```

## Signup flow

```mermaid
flowchart TD
    A(["Start: click 'Create one' on Login page"]) --> B["Signup page"]
    B --> C["Enter registration details"]
    C --> D["Click Create account"]
    D --> E{"Frontend validation passed?"}
    E -- No --> F["Show errors on invalid fields"]
    F --> C
    E -- Yes --> G["Send signup request to server"]
    G --> H{"Server validation passed?"}
    H -- No --> I["Show returned field errors"]
    I --> C
    H -- Yes --> J{"Email already registered?"}
    J -- Yes --> K["Show 'Account already exists' with link to Login"]
    K --> C
    J -- No --> L["Hash password and save user to users.json"]
    L --> M["Create session cookie"]
    M --> N["Redirect to Hello page"]
    N --> O(["End"])
```
