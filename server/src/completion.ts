import {
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocuments
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { keywords, operators, functionKeywords, hybridProgramKeywords } from './keywords';
import { parseArchive } from './dlParser';

export const createCompletionHandler = (documents: TextDocuments<TextDocument>) => {
  return (params: TextDocumentPositionParams): CompletionItem[] => {
    const document = documents.get(params.textDocument.uri);
    if (!document) return [];

    const content = document.getText();
    parseArchive(content);

    const completionItems: CompletionItem[] = [
      ...keywords.map(keyword => ({
        label: keyword.label,
        kind: CompletionItemKind.Keyword,
        documentation: keyword.description,
      })),
      ...operators.map(operator => ({
        label: operator.label,
        kind: CompletionItemKind.Operator,
        documentation: operator.description,
      })),
      ...functionKeywords.map(func => ({
        label: func.label,
        kind: CompletionItemKind.Function,
        documentation: func.description,
      })),
      ...hybridProgramKeywords.map(keyword => ({
        label: keyword.label,
        kind: CompletionItemKind.Keyword,
        documentation: keyword.description,
      })),
    ];

    return completionItems;
  };
};
