import * as vscode from "vscode";
import * as path from "path";
import { workspace, ExtensionContext, window, commands } from "vscode";
import { LanguageClient,LanguageClientOptions,ServerOptions,TransportKind } from "vscode-languageclient/node";
import { KyxCodeLensProvider } from "./KyxCodeLens";
import { createDecorations } from "./KyxDecorations";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  console.log("[KYX] Activating extension...");

  const serverModule = path.join(__dirname, "..", "..", "server", "out", "server.js");

  const config = vscode.workspace.getConfiguration("kyx");

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "kyx" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/*.kyx"),
    },
    initializationOptions: {
      provideDocumentSymbols: true,
      keymaeraPath: config.get<string>("keymaeraPath"),
      z3Path:       config.get<string>("z3Path"),
    },
  };

  const serverOptions: ServerOptions = {
    run   : { module: serverModule, transport: TransportKind.ipc },
    debug : { module: serverModule, transport: TransportKind.ipc },
  };

  client = new LanguageClient(
    "KYX Language Server",
    "KYX Language Server",
    serverOptions,
    clientOptions
  );

  client.start();

  const {success,failed} = createDecorations(context);

  const codeLensProvider = new KyxCodeLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ language: "kyx" }, codeLensProvider)
  );

const checkProofCommand = commands.registerCommand("kyx.checkProof", async (item?: any) => {
  const editor = window.activeTextEditor;
  if (!editor || !item?.name) return;

  const document    = editor.document;
  const tacticName  = item.name;
  const documentUri = document.uri.toString();
  const lines       = document.getText().split("\n");

  // finding tactic line in the document
  let tacticLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(`Tactic "${tacticName}"`)) {
      tacticLine = i;
      break;
    }
  }

  if (tacticLine === -1) {
    vscode.window.showErrorMessage(`Could not find line for tactic: ${tacticName}`);
    return;
  }

  try {
    type ProofResult = { success: boolean; message: string };
    const result = await client.sendRequest<ProofResult>("kyx/checkProof", {documentUri,tacticName,tacticLine});
    const tacticRange = new vscode.Range(
      tacticLine,
      lines[tacticLine].length,
      tacticLine,
      lines[tacticLine].length
    );

    editor.setDecorations(success , []);
    editor.setDecorations(failed  , []);

    
    if (result.success) {
      editor.setDecorations(success, [{ range: tacticRange }]);
    } else {
      editor.setDecorations(failed,  [{ range: tacticRange }]);
    }

    vscode.window.showInformationMessage(result.message);
  } 
  
  catch (error) {
    console.error("[KYX] Error running proof check:", error);
    vscode.window.showErrorMessage("Error running proof check.");
  }
});


  context.subscriptions.push(checkProofCommand);

  console.log("[KYX] Registered command: kyx.checkProof");
}

export function deactivate(): Thenable<void> | undefined {
  return client ? client.stop() : Promise.resolve();
}
