import {
  CodeActionParams,
  CodeAction,
  CodeActionKind
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver/node';

export const createCodeActionHandler = (
  documents: TextDocuments<TextDocument>
) => {
  return (params: CodeActionParams): CodeAction[] | null => {
    const document = documents.get(params.textDocument.uri);
    if (!document) return null;

    const diagnostics = params.context.diagnostics;
    const codeActions: CodeAction[] = [];

    diagnostics.forEach(diagnostic => {
      if (typeof diagnostic.code === 'string') {
        const expectedMatch = diagnostic.code.match(/Expected: \((.*?)\)/);

        if (expectedMatch && expectedMatch[1]) {
          const expectedAlternatives = expectedMatch[1]
            .split('|')
            .map((alternative: string) =>
              alternative.trim().replace(/^"(.*)"$/, '$1')
            );

          expectedAlternatives.forEach((alternative: string) => {
            codeActions.push({
              title: `Replace: ${alternative}`,
              kind: CodeActionKind.QuickFix,
              edit: {
                changes: {
                  [params.textDocument.uri]: [
                    {
                      range: diagnostic.range,
                      newText: alternative
                    }
                  ]
                }
              }
            });
          });
        }
      }
    });

    return codeActions;
  };
};
