export function parseArchive(data: string): {
  success: boolean;
  theorems?: string[];
  error?: {
      message: string;
      startLine: number;
      startColumn: number;
      endLine: number;
      endColumn: number;
      found: string;
      expect: string;
      hint: string;
  }[];
};
