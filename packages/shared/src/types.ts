// Branded type utility for compile-time safety
type Brand<T, B extends string> = T & { readonly __brand: B };

/** ISO date string in YYYY-MM-DD format */
export type DateString = Brand<string, "DateString">;

/** ISO year-month string in YYYY-MM format */
export type YearMonth = Brand<string, "YearMonth">;

/** Prefixed transaction ID */
export type TransactionId = Brand<string, "TransactionId">;

// --- Categories ---

export const CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Shopping",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Health",
  "Subscriptions",
  "Income",
  "Transfer",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

// --- Transaction ---

export type TransactionType = "income" | "expense";

export interface Transaction {
  readonly id: TransactionId;
  readonly date: DateString;
  readonly description: string;
  readonly amount: number;
  readonly category: Category;
  readonly type: TransactionType;
}

// --- Summary ---

export interface DateRange {
  readonly start: DateString;
  readonly end: DateString;
}

export interface Summary {
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly netBalance: number;
  readonly transactionCount: number;
  readonly dateRange: DateRange;
}

// --- Insights ---

export interface CategoryBreakdown {
  readonly name: Category;
  readonly amount: number;
  readonly percentage: number;
}

export interface BiggestExpense {
  readonly description: string;
  readonly amount: number;
  readonly date: DateString;
}

export interface MonthlyBreakdown {
  readonly month: YearMonth;
  readonly income: number;
  readonly expenses: number;
}

export interface Insights {
  readonly topCategory: CategoryBreakdown | null;
  readonly biggestExpense: BiggestExpense | null;
  readonly averageDailySpending: number;
  readonly monthlyBreakdown: readonly MonthlyBreakdown[];
}

// --- API Response ---

export type DateFormat =
  | "YYYY-MM-DD"
  | "MM/DD/YYYY"
  | "DD/MM/YYYY"
  | "DD-Mon-YY";
export type Delimiter = "," | ";" | "\t";

export interface DetectedFormat {
  readonly dateFormat: DateFormat;
  readonly delimiter: Delimiter;
}

export interface UploadMetadata {
  readonly rowsParsed: number;
  readonly rowsSkipped: number;
  readonly detectedFormat: DetectedFormat;
}

export interface UploadResponse {
  readonly transactions: readonly Transaction[];
  readonly summary: Summary;
  readonly warnings: readonly string[];
  readonly metadata: UploadMetadata;
}

export interface ErrorResponse {
  readonly error: {
    readonly message: string;
    readonly code: string;
  };
}

export interface HealthResponse {
  readonly status: "ok";
}
