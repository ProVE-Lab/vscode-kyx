import * as fs from "fs";
import * as path from "path";
import { URI } from "vscode-uri";
import { TextDocument } from "vscode-languageserver-textdocument";
import {TextDocuments,Connection,Diagnostic,DiagnosticSeverity} from "vscode-languageserver/node";

interface CheckProofParams {
  documentUri: string;
  tacticName: string;
  tacticLine: number;
}

export const createCheckProofHandler = (
  documents: TextDocuments<TextDocument>,
  workspaceDir: string,
  connection: Connection,
  executeKeymaeraX: (inputFilePath: string, outputFilePath: string, archiveEntry?: string, tacticName?: string) 
  => Promise<{ success: boolean; message: string }>
) => {
  return async (params: CheckProofParams) => {
    const { documentUri, tacticName, tacticLine } = params;
    let document = documents.get(documentUri);

    if (!document) {
      try {
        const filePath = URI.parse(documentUri).fsPath;
        const fileContent = fs.readFileSync(filePath, "utf8");
        document = TextDocument.create(documentUri, "kyx", 1, fileContent);
      } catch {
        connection.window.showErrorMessage("Error reading document.");
        return { success: false, message: "Document not found." };
      }
    }
    
    connection.sendDiagnostics({ uri: documentUri, diagnostics: [] });

    const lines = document.getText().split("\n");
    let archiveEntry = "";

    for (let i = tacticLine; i >= 0; i--) {
      const match = lines[i].match(/^\s*(?:ArchiveEntry|Theorem)\s*"([^"]+)"/);
      if (match) {
        archiveEntry = match[1];
        break;
      }
    }

    if (!archiveEntry) {
      connection.window.showWarningMessage(`No ArchiveEntry found for tactic "${tacticName}"`);
      return { success: false, message: "No ArchiveEntry found." };
    }

    const inputFilePath = path.join(workspaceDir, "temp.kyx");
    const outputFilePath = path.join(workspaceDir, `${tacticName.replace(/\W+/g, "_")}.kyp`);

    fs.writeFileSync(inputFilePath, document.getText(), "utf8");

    connection.window.showInformationMessage(`Running proof for tactic: ${tacticName}`);

    const { success, message } = await executeKeymaeraX(
      inputFilePath,
      outputFilePath,
      archiveEntry,
      tacticName
    );

    // failed proof
    if (!success) {
      const tacticLineIndex = lines.findIndex(line =>
        line.includes(`Tactic "${tacticName}"`)
      );

      if (tacticLineIndex !== -1) {
        const diagnostic: Diagnostic = {
          severity: DiagnosticSeverity.Error,
          range: {
            start: { line: tacticLineIndex, character: 0 },
            end: {
              line: tacticLineIndex,
              character: lines[tacticLineIndex].length,
            },
          },
          message: `Proof failed for tactic "${tacticName}".`,
          source: "Proof Checker",
        };
        
        connection.sendDiagnostics({
          uri: documentUri,
          diagnostics: [diagnostic],
        });
      }
    }
    return { success, message };
  };
};
