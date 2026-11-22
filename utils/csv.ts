/**
 * Minimal RFC 4180 CSV helpers.
 *
 * Only what the member registry needs: quoting on write, quote/CRLF/BOM
 * handling on read. No dependency, no guessing at dialects — the export this
 * writes is the import this reads, so a round trip is lossless.
 */

export type CsvValue = string | number | boolean | null | undefined;

function escapeCell(value: CsvValue): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Serialises rows to CSV with a header row, in the given column order. */
export function toCsv(
  rows: Array<Record<string, CsvValue>>,
  columns: string[]
): string {
  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => escapeCell(row[column])).join(","));
  }
  // Trailing newline keeps the file well-formed for `wc -l` and spreadsheets.
  return `${lines.join("\r\n")}\r\n`;
}

/** Parses CSV text into a matrix of raw cells. Handles quotes, CRLF and a BOM. */
export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char === "\r") {
      // Handled by the following \n; a lone \r also ends the row.
      if (text[index + 1] !== "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      }
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  // Drop trailing blank lines.
  return rows.filter((cells) => cells.some((value) => value.trim() !== ""));
}

/** Parses CSV into records keyed by a lowercased, trimmed header. */
export function parseCsvRecords(input: string): {
  header: string[];
  records: Array<Record<string, string>>;
} {
  const matrix = parseCsv(input);
  if (matrix.length === 0) return { header: [], records: [] };

  const header = matrix[0].map((cell) => cell.trim().toLowerCase());
  const records = matrix.slice(1).map((cells) => {
    const record: Record<string, string> = {};
    header.forEach((key, index) => {
      record[key] = (cells[index] ?? "").trim();
    });
    return record;
  });

  return { header, records };
}
