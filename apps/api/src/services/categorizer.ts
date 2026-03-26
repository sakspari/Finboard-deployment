import type { Transaction, Category } from "@finboard/shared";
import { CATEGORY_RULES } from "../data/categories.js";

// Pre-compile regex patterns for each category (sorted by priority desc)
const sortedRules = [...CATEGORY_RULES].sort((a, b) => b.priority - a.priority);
const categoryPatterns: { category: Category; pattern: RegExp }[] = sortedRules.map(
  (rule) => ({
    category: rule.category,
    pattern: new RegExp(rule.keywords.map(escapeRegex).join("|"), "i"),
  })
);

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function categorize(description: string, amount: number): Category {
  // Positive amounts are likely income
  if (amount > 0) {
    const incomePattern = categoryPatterns.find((p) => p.category === "Income");
    if (incomePattern && incomePattern.pattern.test(description)) {
      return "Income";
    }
    return "Income";
  }

  const descLower = description.toLowerCase();
  for (const { category, pattern } of categoryPatterns) {
    if (pattern.test(descLower)) {
      return category;
    }
  }

  return "Other";
}

export function categorizeTransactions(
  transactions: Transaction[]
): Transaction[] {
  return transactions.map((txn) => ({
    ...txn,
    category: categorize(txn.description, txn.amount),
  }));
}
