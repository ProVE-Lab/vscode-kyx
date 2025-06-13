
# KYX VS Code Extension

This is a Visual Studio Code extension for working with `.kyx` files. It integrates with a language server to provide language features such as syntax highlighting, auto-completion, diagnostics, hover info, and proof checking via KeYmaeraX and Z3.

---

## Features

- Syntax highlighting for the KYX language  
- Code diagnostics for syntax errors  
- Auto-completion for KYX keywords, operators, and tactics  
- Hover information and symbol outline  
- Go to definition for archive entries and tactics  
- Proof checking using KeYmaeraX and Z3

---

## Getting Started

Follow these steps to run the extension locally.

---

### 1. Clone the Repository

```bash
git clone https://github.com/ProVE-Lab/vscode-kyx.git
cd vscode-kyx
````
---
### 2. Install typescript globally
This project requires typescript. If you haven't already, install this:

```bash 
npm install -g typescript
```

### 3. Install Dependencies

Install packages separately in both `client/` and `server/` directories:

```bash
cd client
npm install

cd ../server
npm install
```
---

### 4. Configure Settings

Before using the proof checking feature, configure the following paths in your VS Code settings:

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

### 4. Build the Project

Open the project folder in VS Code.

Press:
* `Cmd + shift + B` (Mac) or
* `Ctrl + shift + B` (Windows/Linux)

This compiles both client and server code.

---

### 5. Run the Extension

1. Press `Cmd + shift + D` (Mac) or `Ctrl + shift + D` (Windows) to open the Run & Debug panel.
2. Click **Launch Client**.
3. A new VS Code window will open — this is the Extension Development Host.
4. You can now open or create `.kyx` files to use the extension's features.

---

### Demo Video

The short video below demonstrates how the **Check Proof** feature works inside VS Code:

![KYX Proof Checking Demo](client/demo-kyx.gif)

---

