import Papa from "papaparse";
import { LIMITS } from "@finboard/shared";
import type { Transaction, TransactionId, DateString, DateFormat, Delimiter, DetectedFormat } from "@finboard/shared";

export interface ParseResult {
  readonly transactions: Transaction[];
  readonly warnings: string[];
  readonly metadata: {
    readonly rowsParsed: number;
    readonly rowsSkipped: number;
    readonly detectedFormat: DetectedFormat;
  };
}

// Header aliases for auto-detection
const HEADER_ALIASES: Record<string, string[]> = {
  date: ["date", "transaction_date", "posting_date", "trans_date", "value_date", "transaction date", "posting date"],
  description: ["description", "memo", "payee", "details", "transaction_description", "narrative", "name", "merchant"],
  amount: ["amount", "transaction_amount", "value", "sum"],
  debit: ["debit", "debit_amount", "withdrawal", "money_out"],
  credit: ["credit", "credit_amount", "deposit", "money_in"],
};

export function parseCSV(buffer: Buffer): ParseResult {
  const csvString = stripBOM(buffer.toString("utf-8"));
  const transactions: Transaction[] = [];
  const warnings: string[] = [];
  let rowCount = 0;
  let skipped = 0;

  const results = Papa.parse(csvString, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: "greedy" as const,
    transformHeader: (header: string) => header.trim().toLowerCase(),
    transform: (value: string) => sanitizeCsvValue(value.trim()),
    delimitersToGuess: [",", "\t", ";", "|"] as const,
  });

  const headers = results.meta.fields || [];
  const headerMap = mapHeaders(headers);
  const detectedDelimiter = (results.meta.delimiter || ",") as Delimiter;

  if (!headerMap.date || (!headerMap.amount && !headerMap.debit)) {
    warnings.push("Could not detect required columns (date and amount). Check CSV headers.");
    return {
      transactions: [],
      warnings,
      metadata: {
        rowsParsed: 0,
        rowsSkipped: results.data.length,
        detectedFormat: { dateFormat: "MM/DD/YYYY", delimiter: detectedDelimiter },
      },
    };
  }

  let detectedDateFormat: DateFormat = "MM/DD/YYYY";

  for (const row of results.data as Record<string, string>[]) {
    if (rowCount >= LIMITS.MAX_TRANSACTIONS) {
      warnings.push(`Processing capped at ${LIMITS.MAX_TRANSACTIONS} transactions`);
      break;
    }

    const rawDate = headerMap.date ? (row[headerMap.date] || "") : "";
    const description = headerMap.description ? (row[headerMap.description] || "Unknown") : "Unknown";
    const amount = resolveAmount(row, headerMap);

    if (!rawDate || amount === null) {
      skipped++;
      if (skipped <= 10) {
        warnings.push(`Row ${rowCount + 2}: missing date or amount`);
      }
      rowCount++;
      continue;
    }

    const parsedDate = parseDate(rawDate);
    if (!parsedDate) {
      skipped++;
      if (skipped <= 10) {
        warnings.push(`Row ${rowCount + 2}: unrecognized date format "${rawDate.substring(0, 20)}"`);
      }
      rowCount++;
      continue;
    }

    detectedDateFormat = parsedDate.format;

    transactions.push({
      id: `txn_${String(transactions.length + 1).padStart(4, "0")}` as TransactionId,
      date: parsedDate.value,
      description: description.substring(0, LIMITS.MAX_FIELD_LENGTH),
      amount,
      category: "Other", // Categorized in next step
      type: amount >= 0 ? "income" : "expense",
    });

    rowCount++;
  }

  if (skipped > 10) {
    warnings.push(`...and ${skipped - 10} more rows skipped`);
  }

  return {
    transactions,
    warnings,
    metadata: {
      rowsParsed: transactions.length,
      rowsSkipped: skipped,
      detectedFormat: {
        dateFormat: detectedDateFormat,
        delimiter: detectedDelimiter,
      },
    },
  };
}

function stripBOM(str: string): string {
  return str.replace(/^\uFEFF/, "");
}

function sanitizeCsvValue(value: string): string {
  let clean = value;
  // Defuse formula injection
  if (/^[=+\-@\t\r]/.test(clean)) {
    clean = clean.substring(1);
  }
  // Strip null bytes and control chars
  clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return clean.substring(0, 500);
}

function mapHeaders(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const [canonical, aliases] of Object.entries(HEADER_ALIASES)) {
    const match = headers.find((h) => aliases.includes(h));
    if (match) mapping[canonical] = match;
  }
  return mapping;
}

function resolveAmount(
  row: Record<string, string>,
  headerMap: Record<string, string>
): number | null {
  // Try debit/credit columns first
  if (headerMap.debit && headerMap.credit) {
    const debit = parseAmount(row[headerMap.debit] || "");
    const credit = parseAmount(row[headerMap.credit] || "");
    if (debit !== null && debit > 0) return -debit;
    if (credit !== null && credit > 0) return credit;
    if (debit !== null) return -Math.abs(debit);
    if (credit !== null) return credit;
    return null;
  }

  // Try single amount column
  if (headerMap.amount) {
    return parseAmount(row[headerMap.amount] || "");
  }

  return null;
}

function parseAmount(raw: string): number | null {
  if (!raw || raw.trim() === "") return null;
  let cleaned = raw
    .replace(/[$€£¥\s]/g, "")
    .replace(/\((.+)\)/, "-$1")
    .replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : Math.round(num * 100) / 100;
}

interface ParsedDate {
  value: DateString;
  format: DateFormat;
}

function parseDate(raw: string): ParsedDate | null {
  const trimmed = raw.trim();

  // YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return { value: trimmed as DateString, format: "YYYY-MM-DD" };
  }

  // MM/DD/YYYY or DD/MM/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (slashMatch) {
    const a = parseInt(slashMatch[1]!, 10);
    const b = parseInt(slashMatch[2]!, 10);
    const year = slashMatch[3]!;

    // Heuristic: if first part > 12, it must be day (DD/MM/YYYY)
    if (a > 12) {
      const month = String(b).padStart(2, "0");
      const day = String(a).padStart(2, "0");
      return { value: `${year}-${month}-${day}` as DateString, format: "DD/MM/YYYY" };
    }

    // Default to MM/DD/YYYY (US format)
    const month = String(a).padStart(2, "0");
    const day = String(b).padStart(2, "0");
    return { value: `${year}-${month}-${day}` as DateString, format: "MM/DD/YYYY" };
  }

  // DD-Mon-YY (e.g., 15-Jan-26)
  const monMatch = trimmed.match(/^(\d{1,2})-(\w{3})-(\d{2})$/);
  if (monMatch) {
    const months: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const mon = months[monMatch[2]!.toLowerCase()];
    if (mon) {
      const year = parseInt(monMatch[3]!, 10) < 50 ? `20${monMatch[3]}` : `19${monMatch[3]}`;
      const day = String(monMatch[1]).padStart(2, "0");
      return { value: `${year}-${mon}-${day}` as DateString, format: "DD-Mon-YY" };
    }
  }

  return null;
}
