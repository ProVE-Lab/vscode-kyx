import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  InitializeParams,
  InitializeResult,
  TextDocumentSyncKind,
  CompletionItem,
  Definition,
  Location,
  TextDocumentPositionParams,
  SymbolInformation,
  DocumentSymbolParams,
  Hover,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { parseKyx } from "./parseKyx";
import { getSymbols, getSymbolAtPosition } from "./symbolProvider";
import log from "./log";
import { URI } from "vscode-uri";
import { createCodeActionHandler } from './codeAction';
import { createCompletionHandler } from './completion';
import { createCheckProofHandler } from "./checkProof";

const connection = createConnection(ProposedFeatures.all);
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let keymaeraPath: string = "";
let z3Path: string = "";
let workspaceDir: string = "";

const executeKeymaeraX = (
  inputFilePath: string,
  outputFilePath: string,
  archiveEntry?: string,
  tacticName?: string
): Promise<{ success: boolean; message: string; tacticErrorName?: string }> => {
  return new Promise((resolve, reject) => {

    if (!keymaeraPath || !z3Path) {
      connection.window.showErrorMessage("KeYmaeraX or Z3 path not set.");
      reject(new Error("Paths not set"));
      return;
    }

    const javaPath = "java";
    let command = `${javaPath} -da -jar "${keymaeraPath}" -launch -prove`;
    command += ` "${inputFilePath}#${archiveEntry}" -out "${outputFilePath}" -tacticName "${tacticName}" -z3path "${z3Path}"`;
    
    exec(command, (error, stdout, stderr) => {
      const output = stdout + stderr;

      connection.console.log(`[KYX Server] Command: ${command}`);
      connection.console.log(`[KYX Server] Raw Output:\n${output}`);

      const proved = /PROVED/.test(output);
      const failed = /FAILED/.test(output);

      let success = false;
      let message = "";
      let tacticErrorName: string | undefined = undefined;

      if (proved) {
        success = true;
        message = `${tacticName} — Proof Succeeded!`;
      } 
      else if (failed) {
        success = false;
        message = `${tacticName} — Proof Failed`;
        const match = output.match(/Tactic\s*"([^"]+)"/);

        if (match) {
          tacticErrorName = match[1];
        }
      } 
      else {
        success = false;
        message = `${tacticName} — No clear proof result found`;
      }

      connection.sendNotification("kyx/proofResult", message);
      log.write(`[Proof] ${tacticName} — ${message}`);

      resolve({ success, message, tacticErrorName });
    });
  });
};

connection.onInitialize((params: InitializeParams): InitializeResult => {
  const options = params.initializationOptions || {};
  keymaeraPath = options.keymaeraPath || "";
  z3Path = options.z3Path || "/usr/local/bin/z3";

  if (params.workspaceFolders && params.workspaceFolders.length > 0) {
    const workspaceUri = params.workspaceFolders[0].uri;
    const workspacePath = URI.parse(workspaceUri).fsPath;
    workspaceDir = path.join(workspacePath, ".kyx_output");

    if (!fs.existsSync(workspaceDir)) {
      fs.mkdirSync(workspaceDir, { recursive: true });
    }
  } else {
    connection.window.showErrorMessage("No workspace folder found.");
  }

  log.setConnected(true);

  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: { resolveProvider: true },
      hoverProvider: true,
      definitionProvider: true,
      documentSymbolProvider: true,
      codeActionProvider: true,
    },
    serverInfo: {
      name: "KYX Language Server",
      version: "1.0.0",
    },
  };
});

// outline view 
connection.onDocumentSymbol((params: DocumentSymbolParams): SymbolInformation[] | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;
  return getSymbols(document);
});

connection.onDefinition((params: TextDocumentPositionParams): Definition | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;
  const symbol = getSymbolAtPosition(document, params.position);
  return symbol ? Location.create(params.textDocument.uri, symbol.location.range) : null;
});

connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;
  const symbol = getSymbolAtPosition(document, params.position);
  if (symbol) {
    return {
      contents: {
        kind: "markdown",
        value: `**${symbol.name}**: Declared at line ${symbol.location.range.start.line + 1}`,
      },
      range: symbol.location.range,
    };
  }
  return null;
});

const codeAction = createCodeActionHandler(documents);
const completion = createCompletionHandler(documents);
const updateDiagnosticsAndFoldingRanges = (document: TextDocument) => {
  const diagnostics = parseKyx(document.getText());
  connection.sendDiagnostics({ uri: document.uri, diagnostics });
}; 

documents.onDidChangeContent((change) => updateDiagnosticsAndFoldingRanges(change.document));
documents.onDidOpen((change) => updateDiagnosticsAndFoldingRanges(change.document));
documents.onDidClose((event) => {
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

connection.onCodeAction(codeAction);
connection.onCompletion(completion);
connection.onCompletionResolve((item: CompletionItem): CompletionItem => item);
connection.onRequest(
  "kyx/checkProof",
  createCheckProofHandler(documents, workspaceDir, connection, executeKeymaeraX)
);

documents.listen(connection);
connection.listen();
