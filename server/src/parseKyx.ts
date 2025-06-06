import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver/node';

const { parseArchive } = require('./dlParser');

export const parseKyx = (content: string): Diagnostic[] => {
  console.log("[Parser] Parsing KYX document...");

  try {
    const result = parseArchive(content);
    console.log(`[Parser] Raw parse result: ${JSON.stringify(result, null, 2)}`);

    const archiveEntries = content.match(/ArchiveEntry\s*"([^"]+)"/g) || [];
    const tactics = content.match(/Tactic\s*"([^"]+)"/g) || [];

    console.log(`[Parser] Extracted ArchiveEntries: ${JSON.stringify(archiveEntries)}`);
    console.log(`[Parser] Extracted Tactics: ${JSON.stringify(tactics)}`);

    if (Array.isArray(result) && result.length > 0) {
      const kyxDiagnostics: Diagnostic[] = result.map((err: any) => {
        const startCharacter = err.column - 1;
        let endCharacter = startCharacter + (err.found ? err.found.length : 1);

        if (!err.found || /[\s;,.]/.test(err.found)) {
          endCharacter = startCharacter + 1;
        } 
        return {
          severity: DiagnosticSeverity.Error,
          range: {
            start: { line: err.line - 1, character: startCharacter },
            end: { line: err.line - 1, character: endCharacter },
          },
          message: `${err.message}. Found: "${err.found}". Expected: ${err.expect}. Hint: ${err.hint}`,
          code: `Expected: (${err.expect})`, 
          source: 'dL Parser'
        };
      });

      return kyxDiagnostics;
    } 
    else {
      return []; 
    }
  } 
  catch (error: unknown) {

    console.error("[Parser] Error while parsing KYX document:", error);
    return [{
      severity: DiagnosticSeverity.Error,
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 1 }
      },
      message: 'Unknown error occurred during parsing',
      source: 'dL Parser'
    }];
  }
};
