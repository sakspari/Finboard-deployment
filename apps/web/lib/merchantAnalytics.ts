import type { Transaction, Category, DateString } from "@finboard/shared";

// --- Types ---

export interface MerchantGroup {
  readonly merchant: string;
  readonly transactions: Transaction[];
  readonly totalAmount: number;
  readonly avgAmount: number;
  readonly count: number;
  readonly category: Category;
  readonly firstSeen: DateString;
  readonly lastSeen: DateString;
}

export type RecurringFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "annual";

export interface RecurringItem {
  readonly merchant: string;
  readonly estimatedAmount: number;
  readonly frequency: RecurringFrequency;
  readonly category: Category;
  readonly occurrences: number;
  readonly totalSpent: number;
  readonly nextExpected: string | null;
}

// --- Helpers ---

/**
 * Normalize a transaction description into a merchant name by stripping
 * trailing noise: reference codes, dates, card numbers, etc.
 */
function normalizeMerchant(description: string): string {
  let name = description.trim();

  // Remove trailing reference/confirmation codes (e.g., "#12345", "REF:ABC123")
  name = name.replace(/\s*#\w+$/i, "");
  name = name.replace(/\s*REF:\s*\w+$/i, "");

  // Remove trailing dates in various formats (2024-01-15, 01/15/2024, 15-Jan-24)
  name = name.replace(
    /\s+\d{4}[-/]\d{2}[-/]\d{2}$/,
    ""
  );
  name = name.replace(
    /\s+\d{2}[/-]\d{2}[/-]\d{4}$/,
    ""
  );
  name = name.replace(
    /\s+\d{2}-[A-Za-z]{3}-\d{2}$/,
    ""
  );

  // Remove trailing pure-numeric sequences (card last-4, auth codes)
  name = name.replace(/\s+\d{3,}$/, "");

  // Remove trailing whitespace and common punctuation leftovers
  name = name.replace(/[\s\-_*#.]+$/, "");

  // Collapse internal whitespace
  name = name.replace(/\s+/g, " ");

  return name;
}

/**
 * Compute the median of a numeric array (must have length >= 1).
 */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

/**
 * Compute day-intervals between sorted date strings.
 */
function computeIntervals(dates: string[]): number[] {
  const sorted = [...dates].sort();
  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]!).getTime();
    const curr = new Date(sorted[i]!).getTime();
    const days = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (days > 0) intervals.push(days);
  }
  return intervals;
}

/**
 * Given a set of intervals, determine if they cluster around a known
 * frequency period (within +-30% tolerance). Returns the best-matching
 * frequency or null.
 */
const FREQUENCY_PERIODS: { frequency: RecurringFrequency; days: number }[] = [
  { frequency: "weekly", days: 7 },
  { frequency: "biweekly", days: 14 },
  { frequency: "monthly", days: 30 },
  { frequency: "quarterly", days: 90 },
  { frequency: "annual", days: 365 },
];

function detectFrequency(intervals: number[]): RecurringFrequency | null {
  if (intervals.length === 0) return null;

  const medianInterval = median(intervals);
  const tolerance = 0.3;

  for (const { frequency, days } of FREQUENCY_PERIODS) {
    const lower = days * (1 - tolerance);
    const upper = days * (1 + tolerance);
    if (medianInterval >= lower && medianInterval <= upper) {
      // Verify that at least half the intervals fall within tolerance
      const matchCount = intervals.filter(
        (iv) => iv >= lower && iv <= upper
      ).length;
      if (matchCount / intervals.length >= 0.5) {
        return frequency;
      }
    }
  }

  return null;
}

/**
 * Compute an estimated next date given the last date and frequency.
 */
function estimateNextDate(
  lastDate: string,
  frequency: RecurringFrequency
): string {
  const d = new Date(lastDate);
  switch (frequency) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "annual":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().slice(0, 10);
}

/**
 * Determine the dominant category for a set of transactions (mode).
 */
function dominantCategory(transactions: readonly Transaction[]): Category {
  const counts = new Map<Category, number>();
  for (const txn of transactions) {
    counts.set(txn.category, (counts.get(txn.category) || 0) + 1);
  }
  let best: Category = "Other";
  let bestCount = 0;
  for (const [cat, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      best = cat;
    }
  }
  return best;
}

// --- Public API ---

/**
 * Group transactions by normalized merchant name.
 * Returns groups sorted by total spend (descending).
 * Only expense transactions are considered.
 */
export function getMerchantGroups(
  transactions: readonly Transaction[]
): MerchantGroup[] {
  const map = new Map<string, Transaction[]>();

  for (const txn of transactions) {
    if (txn.type !== "expense") continue;
    const merchant = normalizeMerchant(txn.description);
    if (!merchant) continue;
    const existing = map.get(merchant);
    if (existing) {
      existing.push(txn);
    } else {
      map.set(merchant, [txn]);
    }
  }

  const groups: MerchantGroup[] = [];

  for (const [merchant, txns] of map) {
    const amounts = txns.map((t) => Math.abs(t.amount));
    const totalAmount = Math.round(
      amounts.reduce((sum, a) => sum + a, 0) * 100
    ) / 100;
    const avgAmount = Math.round((totalAmount / txns.length) * 100) / 100;

    const dates = txns.map((t) => t.date as string).sort();

    groups.push({
      merchant,
      transactions: txns,
      totalAmount,
      avgAmount,
      count: txns.length,
      category: dominantCategory(txns),
      firstSeen: dates[0]! as DateString,
      lastSeen: dates[dates.length - 1]! as DateString,
    });
  }

  groups.sort((a, b) => b.totalAmount - a.totalAmount);
  return groups;
}

/**
 * Detect recurring transactions: same normalized merchant, similar amounts
 * (within 20% of median), roughly regular intervals.
 * Requires at least 3 occurrences to classify as recurring.
 */
export function detectRecurringTransactions(
  transactions: readonly Transaction[]
): RecurringItem[] {
  const groups = getMerchantGroups(transactions);
  const recurring: RecurringItem[] = [];

  for (const group of groups) {
    // Need at least 3 transactions to detect a pattern
    if (group.count < 3) continue;

    const amounts = group.transactions.map((t) => Math.abs(t.amount));
    const medianAmount = median(amounts);

    // Check if amounts are within 20% tolerance of median
    const amountTolerance = 0.2;
    const withinTolerance = amounts.filter(
      (a) =>
        a >= medianAmount * (1 - amountTolerance) &&
        a <= medianAmount * (1 + amountTolerance)
    );

    // At least 60% of amounts should be within tolerance
    if (withinTolerance.length / amounts.length < 0.6) continue;

    // Check interval regularity
    const dates = group.transactions.map((t) => t.date as string);
    const intervals = computeIntervals(dates);
    const frequency = detectFrequency(intervals);

    if (!frequency) continue;

    const sortedDates = [...dates].sort();
    const lastDate = sortedDates[sortedDates.length - 1]!;
    const nextExpected = estimateNextDate(lastDate, frequency);

    recurring.push({
      merchant: group.merchant,
      estimatedAmount: Math.round(medianAmount * 100) / 100,
      frequency,
      category: group.category,
      occurrences: group.count,
      totalSpent: group.totalAmount,
      nextExpected,
    });
  }

  // Sort by total spent descending
  recurring.sort((a, b) => b.totalSpent - a.totalSpent);
  return recurring;
}

/**
 * Return top N merchants by total spend.
 */
export function getTopMerchants(
  transactions: readonly Transaction[],
  limit: number = 10
): MerchantGroup[] {
  return getMerchantGroups(transactions).slice(0, limit);
}
