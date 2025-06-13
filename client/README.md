# KYX: KeYmaeraX VS Code Extension

A VS Code extension for working with `.kyx` files and proving hybrid system properties using **KeYmaeraX** and **Z3**.

---

## Features

- Syntax highlighting for the KYX language
- Code diagnostics for syntax errors
- Auto-completion for KYX tactics, operators, and keywords
- Symbol outline and Hover information
- Go to definition for archive entries and tactics
- Proof checking using KeYmaeraX and Z3

---

## Demo

The Check Proof feature in action inside VS Code:

![KYX Proof Checking Demo](./demo-kyx.gif)

---

## Getting Started

1. Open or create a `.kyx` file.
2. Before using the proof checking feature, configure the following paths in your VS Code settings:

* `keymaerax-core.jar` (KeYmaeraX)
* Z3 

To check the path to Z3, run this command:

```bash
which z3
```
**Steps:**
1. Open the Command Palette:

   * On macOS: `Cmd + Shift + P`
   * On Windows/Linux: `Ctrl + Shift + P`

2. Type and select:
   **Preferences: Open User Settings (JSON)**

3. Add these lines in `settings.json`, replacing with your actual paths:

```json
"kyx.keymaeraPath": "/Users/yourname/path/to/keymaerax-core.jar",
"kyx.z3Path": "/usr/local/bin/z3"
```

---

