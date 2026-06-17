const UTF8_BOM = "\uFEFF";
const CHUNK_SIZE = 1000;

export type CsvRow = Record<string, string | number | boolean | null | undefined>;

/**
 * Escape a value for RFC 4180 CSV output.
 * Values containing commas, double-quotes, or newlines are wrapped in double-quotes
 * with internal quotes escaped.
 */
function escapeCsvValue(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n") || value.includes("\r")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

/**
 * Convert an array of rows to CSV string with UTF-8 BOM.
 *
 * @param rows - Array of row objects.
 * @param headers - Optional explicit header order. If omitted, keys are inferred from rows.
 * @param t - Optional translation function for localizing headers (e.g., `useTranslations()`).
 *             Receives the header key and should return a localized label.
 */
export function rowsToCsv(
  rows: CsvRow[],
  headers?: string[],
  t?: (key: string) => string,
): string {
  const keys = headers ?? (rows.length > 0
    ? Array.from(new Set(rows.flatMap((r) => Object.keys(r))))
    : []);

  const headerLabels = keys.map((k) => escapeCsvValue(t ? t(k) : k));
  const headerLine = headerLabels.join(",");

  if (rows.length === 0) {
    return headerLine ? `${UTF8_BOM}${headerLine}\n` : "";
  }

  const lines: string[] = [headerLine];

  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE);
    for (const row of chunk) {
      lines.push(
        keys
          .map((k) => {
            const raw = row[k];
            const value = raw === null || raw === undefined ? "" : String(raw);
            return escapeCsvValue(value);
          })
          .join(","),
      );
    }
  }

  return `${UTF8_BOM}${lines.join("\n")}\n`;
}

/**
 * Download a CSV string as a file in the browser.
 * Generates a Blob with UTF-8 BOM for correct Unicode handling in Excel.
 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
