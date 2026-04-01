import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { API_PORT, LIMITS } from "@finboard/shared";
import { uploadRouter } from "./routes/upload.js";

const app = express();

// Trust reverse proxy (Railway, Docker, etc.)
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// Compression
app.use(compression());

// CORS
const allowedOrigins = (process.env["CORS_ORIGINS"] || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    maxAge: 600,
  })
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: LIMITS.GLOBAL_RATE_LIMIT,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { message: "Too many requests", code: "RATE_LIMITED" } },
  })
);

// JSON parsing (tiny limit — we only accept multipart for uploads)
app.use(express.json({ limit: "1kb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Upload route
app.use("/api", uploadRouter);

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[ERROR]", err.message);

    const errorMap: Record<string, { status: number; message: string }> = {
      "LIMIT_FILE_SIZE": { status: 413, message: "File exceeds maximum size of 5MB" },
      "LIMIT_UNEXPECTED_FILE": { status: 400, message: "Unexpected file field" },
      "Only .csv files are allowed": { status: 415, message: "Only .csv files are allowed" },
      "Not allowed by CORS": { status: 403, message: "Origin not allowed" },
    };

    const mapped = errorMap[err.message];
    if (mapped) {
      res.status(mapped.status).json({ error: { message: mapped.message, code: err.message } });
      return;
    }

    res.status(500).json({
      error: { message: "Internal server error", code: "INTERNAL_ERROR" },
    });
  }
);

const port = process.env["PORT"] || API_PORT;
app.listen(port, () => {
  console.log(`Finboard API running on http://localhost:${port}`);
});
