import type { Category } from "@finboard/shared";

export interface CategoryRule {
  readonly category: Category;
  readonly keywords: readonly string[];
  readonly priority: number;
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "Subscriptions",
    priority: 10,
    keywords: [
      "netflix", "spotify", "hulu", "disney+", "apple music",
      "amazon prime", "youtube premium", "hbo max", "audible",
      "adobe", "microsoft 365", "dropbox", "icloud", "chatgpt",
      "openai", "github", "notion", "figma",
    ],
  },
  {
    category: "Food & Dining",
    priority: 9,
    keywords: [
      "uber eats", "doordash", "grubhub", "postmates", "instacart",
      "mcdonald", "starbucks", "chipotle", "subway", "domino",
      "pizza hut", "taco bell", "wendy", "burger king", "chick-fil-a",
      "panera", "dunkin", "restaurant", "cafe", "diner",
      "sushi", "thai", "chinese food", "italian food",
      "bakery", "deli", "coffee", "eatery",
    ],
  },
  {
    category: "Groceries",
    priority: 8,
    keywords: [
      "walmart", "costco", "kroger", "safeway", "whole foods",
      "trader joe", "aldi", "publix", "heb", "target",
      "wegmans", "sprouts", "grocery", "market", "food lion",
      "giant eagle", "meijer", "winco",
    ],
  },
  {
    category: "Transportation",
    priority: 7,
    keywords: [
      "uber", "lyft", "gas station", "shell", "chevron", "exxon",
      "bp ", "speedway", "wawa", "parking", "toll",
      "transit", "metro", "amtrak", "airline",
      "united air", "delta air", "american air", "southwest",
      "hertz", "enterprise rent", "avis",
    ],
  },
  {
    category: "Shopping",
    priority: 6,
    keywords: [
      "amazon", "ebay", "etsy", "best buy", "apple store",
      "nike", "adidas", "zara", "h&m", "nordstrom",
      "macy", "tj maxx", "marshalls", "ross", "home depot",
      "lowes", "ikea", "wayfair", "pottery barn",
    ],
  },
  {
    category: "Housing",
    priority: 5,
    keywords: [
      "rent", "mortgage", "hoa", "property tax", "landlord",
      "apartment", "lease", "housing",
    ],
  },
  {
    category: "Utilities",
    priority: 5,
    keywords: [
      "electric", "gas bill", "water bill", "sewage",
      "internet", "comcast", "verizon", "at&t", "t-mobile",
      "xfinity", "spectrum", "utility",
    ],
  },
  {
    category: "Entertainment",
    priority: 4,
    keywords: [
      "movie", "cinema", "theater", "concert", "ticket",
      "amc", "regal", "bowling", "arcade", "museum",
      "zoo", "theme park", "xbox", "playstation",
      "steam", "nintendo",
    ],
  },
  {
    category: "Health",
    priority: 4,
    keywords: [
      "pharmacy", "cvs", "walgreens", "doctor", "hospital",
      "clinic", "dental", "optom", "medical", "health",
      "insurance", "copay", "prescription", "urgent care",
      "therapy", "gym", "fitness", "planet fitness",
      "equinox", "peloton",
    ],
  },
  {
    category: "Income",
    priority: 3,
    keywords: [
      "salary", "payroll", "direct dep", "deposit",
      "ach credit", "tax refund", "interest earned",
      "dividend", "bonus", "commission", "freelance",
      "venmo payment", "zelle from",
    ],
  },
  {
    category: "Transfer",
    priority: 2,
    keywords: [
      "transfer", "zelle", "venmo", "paypal", "cash app",
      "wire", "ach", "xfer",
    ],
  },
];
