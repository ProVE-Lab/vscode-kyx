import * as vscode from "vscode";

export class KyxCodeLensProvider implements vscode.CodeLensProvider {

  provideCodeLenses(document: vscode.TextDocument): vscode.ProviderResult<vscode.CodeLens[]> {
    const codeLenses: vscode.CodeLens[] = [];
    const lines = document.getText().split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // codeLens for every ArchiveEntry
      if (/^\s*ArchiveEntry\s*"/.test(line)) {
        const range = new vscode.Range(i, 0, i, line.length);
        codeLenses.push(
          new vscode.CodeLens(range, {title: "Check Proof (all tactics)", command: "kyx.checkProof", arguments: [{ name: "check-all" }]})
        );
      }
      // codeLens for every Tactic
      if (/^\s*Tactic\s*"/.test(line)) {
        const match = line.match(/Tactic\s*"([^"]+)"/);
        if (match) {
          const tacticName = match[1];
          const range = new vscode.Range(i, 0, i, line.length);
          codeLenses.push(
            new vscode.CodeLens(range, {title: "Check Proof (this tactic)", command: "kyx.checkProof", arguments: [{ name: tacticName }]})
          );
        }
      }
    }
    return codeLenses;
  }
}
