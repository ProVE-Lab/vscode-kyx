import * as vscode from 'vscode';

export function createDecorations(context: vscode.ExtensionContext) {
  
  const success = vscode.window.createTextEditorDecorationType({
    after: { contentText: '  ✅ '}
  });

  const failed = vscode.window.createTextEditorDecorationType({
    after: { contentText: '  ❌ '}
  });

  return {success, failed};
}
