import { Router } from "express";
import multer from "multer";
import path from "path";
import rateLimit from "express-rate-limit";
import { LIMITS } from "@finboard/shared";
import { parseCSV } from "../services/parser.js";
import { categorizeTransactions } from "../services/categorizer.js";
import type { UploadResponse, Transaction, Summary, DateString } from "@finboard/shared";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: LIMITS.MAX_FILE_SIZE,
    files: 1,
    fields: 0,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".csv") {
      return cb(new Error("Only .csv files are allowed"));
    }
    cb(null, true);
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: LIMITS.UPLOAD_RATE_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Upload limit reached, please try again later", code: "RATE_LIMITED" } },
});

export const uploadRouter: ReturnType<typeof Router> = Router();

uploadRouter.post(
  "/upload",
  uploadLimiter,
  upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: { message: "No file provided", code: "NO_FILE" },
        });
        return;
      }

      // Validate content
      const buffer = req.file.buffer;
      if (buffer.includes(0x00)) {
        res.status(400).json({
          error: { message: "File contains binary content", code: "INVALID_FILE_TYPE" },
        });
        return;
      }

      // Parse CSV
      const parseResult = parseCSV(buffer);

      // Categorize transactions
      const categorized = categorizeTransactions(parseResult.transactions);

      // Compute summary
      const summary = computeSummary(categorized);

      const response: UploadResponse = {
        transactions: categorized,
        summary,
        warnings: parseResult.warnings,
        metadata: parseResult.metadata,
      };

      res.json(response);
    } catch (err) {
      console.error("[PARSE_ERROR]", err);
      res.status(422).json({
        error: { message: "Unable to parse the CSV file", code: "PARSE_FAILED" },
      });
    }
  }
);

function computeSummary(transactions: readonly Transaction[]): Summary {
  let totalIncome = 0;
  let totalExpenses = 0;
  let minDate = "9999-99-99";
  let maxDate = "0000-00-00";

  for (const txn of transactions) {
    if (txn.type === "income") {
      totalIncome += txn.amount;
    } else {
      totalExpenses += Math.abs(txn.amount);
    }
    if (txn.date < minDate) minDate = txn.date;
    if (txn.date > maxDate) maxDate = txn.date;
  }

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netBalance: Math.round((totalIncome - totalExpenses) * 100) / 100,
    transactionCount: transactions.length,
    dateRange: {
      start: (transactions.length > 0 ? minDate : "N/A") as DateString,
      end: (transactions.length > 0 ? maxDate : "N/A") as DateString,
    },
  };
}
