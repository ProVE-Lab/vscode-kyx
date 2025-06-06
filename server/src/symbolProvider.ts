import { Position, SymbolInformation, SymbolKind } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';

// finding symbol patterns using regex 
const SymbolPatterns = [
    { pattern: /ArchiveEntry\s+"([^"]+)"/g, kind: SymbolKind.Module   },
    { pattern: /Theorem\s+"([^"]+)"/g,      kind: SymbolKind.Function },
    { pattern: /Lemma\s+"([^"]+)"/g,        kind: SymbolKind.Function },
    { pattern: /Tactic\s+"([^"]+)"/g,       kind: SymbolKind.Function }
];

export function getSymbols(document: TextDocument): SymbolInformation[] {
    const text = document.getText();
    const symbols: SymbolInformation[] = [];

    for (const { pattern, kind } of SymbolPatterns) {
        let match: RegExpExecArray | null;
        
        while ((match = pattern.exec(text))) {
            symbols.push(createSymbol(match, kind, document));
        }
    }
    return symbols;
}

function createSymbol(match: RegExpExecArray, kind: SymbolKind, document: TextDocument): SymbolInformation {
    const name  = match[1];
    const start = document.positionAt(match.index);
    const end   = document.positionAt(match.index + match[0].length);

    return {
        name,
        kind,
        location: { uri: document.uri, range: { start, end }},
        containerName: "KYX",
    };
}

export function getSymbolAtPosition(document: TextDocument, position: Position): SymbolInformation | null {
    const symbols = getSymbols(document);
    return symbols.find((symbol) => {
        const { start, end } = symbol.location.range;
        return (
            position.line >= start.line &&
            position.line <= end.line &&
            position.character >= start.character &&
            position.character <= end.character
        );
    }) || null;
}
